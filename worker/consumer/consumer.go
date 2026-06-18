package consumer

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/krishnadev-ss/pdffree/api/models"
	"github.com/krishnadev-ss/pdffree/api/queue"
	"github.com/krishnadev-ss/pdffree/operations"
	"github.com/krishnadev-ss/pdffree/operations/registry"
)

const (
	maxRetries        = 3
	baseBackoff       = 1 * time.Second
	circuitBreakerMax = 5
	circuitBreakerWindow = 60 * time.Second
)

// JobUpdater is the interface for updating job state.
type JobUpdater interface {
	UpdateJob(job *models.Job)
	GetJob(id string) (*models.Job, bool)
}

// Consumer pulls jobs from the queue, processes them, and updates state.
type Consumer struct {
	queue       *queue.InMemoryQueue
	updater     JobUpdater
	s3Client    *s3.Client
	bucket      string
	workerCount int
	wg          sync.WaitGroup
	cancel      context.CancelFunc

	// Circuit breaker state.
	consecutiveFailures int64
	lastFailureTime     time.Time
	failureMu           sync.Mutex
	healthy             int32 // 1 = healthy, 0 = unhealthy

	// Dead letter queue (in-memory for now).
	dlq     chan models.Job
	dlqOnce sync.Once
}

// Config holds worker consumer configuration.
type Config struct {
	WorkerCount int
	R2Endpoint  string
	R2AccessKey string
	R2SecretKey string
	R2Bucket    string
}

// NewConsumer creates a new job consumer.
func NewConsumer(q *queue.InMemoryQueue, updater JobUpdater, cfg Config) (*Consumer, error) {
	c := &Consumer{
		queue:       q,
		updater:     updater,
		bucket:      cfg.R2Bucket,
		workerCount: cfg.WorkerCount,
		dlq:         make(chan models.Job, 100),
	}
	atomic.StoreInt32(&c.healthy, 1)

	// Initialize S3/R2 client if configured.
	if cfg.R2Endpoint != "" {
		resolver := aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{URL: cfg.R2Endpoint}, nil
			},
		)

		awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
			awsconfig.WithEndpointResolverWithOptions(resolver),
			awsconfig.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider(cfg.R2AccessKey, cfg.R2SecretKey, ""),
			),
			awsconfig.WithRegion("auto"),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load AWS config: %w", err)
		}
		c.s3Client = s3.NewFromConfig(awsCfg)
	}

	return c, nil
}

// Start begins consuming jobs with the configured number of workers.
func (c *Consumer) Start(ctx context.Context) {
	ctx, c.cancel = context.WithCancel(ctx)

	for i := 0; i < c.workerCount; i++ {
		c.wg.Add(1)
		go c.worker(ctx, i)
	}

	log.Printf("[consumer] started %d workers", c.workerCount)
}

// Stop gracefully shuts down the consumer and waits for workers to finish.
func (c *Consumer) Stop() {
	if c.cancel != nil {
		c.cancel()
	}
	c.wg.Wait()
	log.Println("[consumer] all workers stopped")
}

// IsHealthy returns true if the circuit breaker has not tripped.
func (c *Consumer) IsHealthy() bool {
	return atomic.LoadInt32(&c.healthy) == 1
}

// worker is the main loop for a single worker goroutine.
func (c *Consumer) worker(ctx context.Context, id int) {
	defer c.wg.Done()
	log.Printf("[worker-%d] started", id)

	for {
		select {
		case <-ctx.Done():
			log.Printf("[worker-%d] shutting down", id)
			return
		default:
		}

		// Check circuit breaker.
		if !c.IsHealthy() {
			log.Printf("[worker-%d] circuit breaker open, waiting...", id)
			select {
			case <-time.After(5 * time.Second):
				c.checkCircuitBreaker()
				continue
			case <-ctx.Done():
				return
			}
		}

		job, err := c.queue.Dequeue(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("[worker-%d] error dequeuing: %v", id, err)
			continue
		}

		log.Printf("[worker-%d] processing job %s (operation: %s)", id, job.ID, job.Operation)
		c.processJobWithRetry(ctx, id, job)
	}
}

// processJobWithRetry attempts to process a job with exponential backoff retries.
func (c *Consumer) processJobWithRetry(ctx context.Context, workerID int, job models.Job) {
	// Update job status to processing.
	job.Status = "processing"
	job.Progress = 0
	c.updater.UpdateJob(&job)

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			// Exponential backoff: 1s, 4s, 16s.
			backoff := baseBackoff * time.Duration(1<<(2*uint(attempt)))
			log.Printf("[worker-%d] job %s retry %d/%d, backing off %v", workerID, job.ID, attempt+1, maxRetries, backoff)

			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				job.Status = "failed"
				job.Error = "worker shutdown during retry"
				c.updater.UpdateJob(&job)
				return
			}
		}

		lastErr = c.processJob(ctx, workerID, &job)
		if lastErr == nil {
			// Success.
			c.recordSuccess()
			return
		}

		log.Printf("[worker-%d] job %s attempt %d failed: %v", workerID, job.ID, attempt+1, lastErr)
	}

	// All retries exhausted - mark as failed and send to DLQ.
	job.Status = "failed"
	job.Error = fmt.Sprintf("failed after %d attempts: %v", maxRetries, lastErr)
	c.updater.UpdateJob(&job)
	c.recordFailure()

	// Send to dead letter queue.
	select {
	case c.dlq <- job:
		log.Printf("[worker-%d] job %s sent to DLQ", workerID, job.ID)
	default:
		log.Printf("[worker-%d] DLQ full, dropping job %s", workerID, job.ID)
	}
}

// processJob handles the actual processing of a single job.
func (c *Consumer) processJob(ctx context.Context, workerID int, job *models.Job) error {
	// Look up operation.
	op, ok := registry.Get(job.Operation)
	if !ok {
		return fmt.Errorf("unknown operation: %s", job.Operation)
	}

	// Create temp directory for this job.
	tmpDir, err := os.MkdirTemp("", fmt.Sprintf("pdffree-%s-*", job.ID))
	if err != nil {
		return fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	// Download input files from R2 to temp dir.
	job.Progress = 10
	c.updater.UpdateJob(job)

	for _, key := range job.FileKeys {
		if err := c.downloadFile(ctx, key, tmpDir); err != nil {
			return fmt.Errorf("failed to download %s: %w", key, err)
		}
	}

	job.Progress = 30
	c.updater.UpdateJob(job)

	// Run the operation.
	input := operations.OperationInput{
		FileKeys:  job.FileKeys,
		OutputKey: job.OutputKey,
		Options:   job.Options,
		LocalDir:  tmpDir,
	}

	output, err := op.Process(ctx, input)
	if err != nil {
		return fmt.Errorf("operation %s failed: %w", job.Operation, err)
	}

	job.Progress = 80
	c.updater.UpdateJob(job)

	// Upload result to R2.
	outputDir := filepath.Join(tmpDir, "output")
	if err := c.uploadOutputFiles(ctx, outputDir, job.OutputKey); err != nil {
		return fmt.Errorf("failed to upload output: %w", err)
	}

	// Mark job as done.
	job.Status = "done"
	job.Progress = 100
	job.FileSizeBytes = output.FileSizeBytes
	c.updater.UpdateJob(job)

	log.Printf("[worker-%d] job %s completed: %s", workerID, job.ID, output.Message)
	return nil
}

// downloadFile downloads a file from R2 to the local temp directory.
func (c *Consumer) downloadFile(ctx context.Context, key string, destDir string) error {
	if c.s3Client == nil {
		return fmt.Errorf("storage client not configured")
	}

	result, err := c.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("S3 GetObject failed for key %s: %w", key, err)
	}
	defer result.Body.Close()

	localPath := filepath.Join(destDir, filepath.Base(key))
	f, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create local file %s: %w", localPath, err)
	}
	defer f.Close()

	if _, err := io.Copy(f, result.Body); err != nil {
		return fmt.Errorf("failed to write file %s: %w", localPath, err)
	}

	log.Printf("[consumer] downloaded %s to %s", key, localPath)
	return nil
}

// uploadOutputFiles uploads all files in the output directory to R2.
func (c *Consumer) uploadOutputFiles(ctx context.Context, outputDir string, outputKey string) error {
	if c.s3Client == nil {
		return fmt.Errorf("storage client not configured")
	}

	entries, err := os.ReadDir(outputDir)
	if err != nil {
		return fmt.Errorf("failed to read output dir: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		filePath := filepath.Join(outputDir, entry.Name())
		f, err := os.Open(filePath)
		if err != nil {
			return fmt.Errorf("failed to open %s: %w", filePath, err)
		}

		key := outputKey
		// If multiple output files, append filename to key prefix.
		if len(entries) > 1 {
			key = filepath.Join(filepath.Dir(outputKey), entry.Name())
		}

		_, err = c.s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(c.bucket),
			Key:         aws.String(key),
			Body:        f,
			ContentType: aws.String("application/pdf"),
		})
		f.Close()
		if err != nil {
			return fmt.Errorf("S3 PutObject failed for key %s: %w", key, err)
		}

		log.Printf("[consumer] uploaded %s to %s", filePath, key)
	}

	return nil
}

// recordSuccess resets the consecutive failure counter.
func (c *Consumer) recordSuccess() {
	c.failureMu.Lock()
	defer c.failureMu.Unlock()
	atomic.StoreInt64(&c.consecutiveFailures, 0)
	atomic.StoreInt32(&c.healthy, 1)
}

// recordFailure increments the failure counter and may trip the circuit breaker.
func (c *Consumer) recordFailure() {
	c.failureMu.Lock()
	defer c.failureMu.Unlock()

	now := time.Now()
	// Reset counter if last failure was outside the window.
	if now.Sub(c.lastFailureTime) > circuitBreakerWindow {
		atomic.StoreInt64(&c.consecutiveFailures, 1)
	} else {
		atomic.AddInt64(&c.consecutiveFailures, 1)
	}
	c.lastFailureTime = now

	if atomic.LoadInt64(&c.consecutiveFailures) >= circuitBreakerMax {
		atomic.StoreInt32(&c.healthy, 0)
		log.Printf("[consumer] circuit breaker OPEN: %d consecutive failures in %v",
			atomic.LoadInt64(&c.consecutiveFailures), circuitBreakerWindow)
	}
}

// checkCircuitBreaker checks if enough time has passed to close the circuit breaker.
func (c *Consumer) checkCircuitBreaker() {
	c.failureMu.Lock()
	defer c.failureMu.Unlock()

	if time.Since(c.lastFailureTime) > circuitBreakerWindow {
		atomic.StoreInt64(&c.consecutiveFailures, 0)
		atomic.StoreInt32(&c.healthy, 1)
		log.Println("[consumer] circuit breaker CLOSED: failure window expired")
	}
}
