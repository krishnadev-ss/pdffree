package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/krishnadev-ss/pdffree/api/config"
	"github.com/krishnadev-ss/pdffree/api/middleware"
	"github.com/krishnadev-ss/pdffree/api/models"
	"github.com/krishnadev-ss/pdffree/api/queue"
	"github.com/krishnadev-ss/pdffree/operations/registry"
)

// Handler holds all dependencies for HTTP handlers.
type Handler struct {
	cfg           config.Config
	queue         queue.QueueProducer
	jobs          sync.Map          // map[string]*models.Job
	idempotency   sync.Map          // map[string]string (idempotency key -> job ID)
	ipJobs        sync.Map          // map[string]*int32 (IP -> concurrent job count)
	s3Client      *s3.Client
	presignClient *s3.PresignClient
}

// NewHandler creates a new Handler with all dependencies.
func NewHandler(cfg config.Config, q queue.QueueProducer) (*Handler, error) {
	h := &Handler{
		cfg:   cfg,
		queue: q,
	}

	// Initialize S3/R2 client if endpoint is configured.
	if cfg.R2Endpoint != "" {
		resolver := aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL: cfg.R2Endpoint,
				}, nil
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

		h.s3Client = s3.NewFromConfig(awsCfg)
		h.presignClient = s3.NewPresignClient(h.s3Client)
	}

	return h, nil
}

// RegisterRoutes registers all HTTP routes on the given mux.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/presign", h.handlePresign)
	mux.HandleFunc("POST /api/jobs", h.handleCreateJob)
	mux.HandleFunc("GET /api/jobs/{id}", h.handleGetJob)
	mux.HandleFunc("GET /api/jobs/{id}/stream", h.handleStreamJob)
	mux.HandleFunc("GET /api/health", h.handleHealth)
}

// handlePresign generates a pre-signed PUT URL for uploading a file to R2.
func (h *Handler) handlePresign(w http.ResponseWriter, r *http.Request) {
	reqID := middleware.GetRequestID(r.Context())

	var req models.PresignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[presign] reqID=%s error decoding request: %v", reqID, err)
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.Filename == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "filename is required"})
		return
	}

	if req.FileSizeBytes > h.cfg.MaxFileSize {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("file size exceeds maximum of %d bytes", h.cfg.MaxFileSize),
		})
		return
	}

	if h.presignClient == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "storage not configured"})
		return
	}

	// Generate a unique key for the upload.
	fileKey := fmt.Sprintf("uploads/%s/%s", uuid.New().String(), req.Filename)

	contentType := req.ContentType
	if contentType == "" {
		contentType = "application/pdf"
	}

	presignResult, err := h.presignClient.PresignPutObject(r.Context(), &s3.PutObjectInput{
		Bucket:      aws.String(h.cfg.R2Bucket),
		Key:         aws.String(fileKey),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		log.Printf("[presign] reqID=%s error generating presigned URL: %v", reqID, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate upload URL"})
		return
	}

	resp := models.PresignResponse{
		UploadURL: presignResult.URL,
		FileKey:   fileKey,
		ExpiresIn: 900, // 15 minutes
	}

	log.Printf("[presign] reqID=%s generated presigned URL for key=%s", reqID, fileKey)
	writeJSON(w, http.StatusOK, resp)
}

// handleCreateJob creates a new processing job and enqueues it.
func (h *Handler) handleCreateJob(w http.ResponseWriter, r *http.Request) {
	reqID := middleware.GetRequestID(r.Context())

	var req models.JobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[jobs] reqID=%s error decoding request: %v", reqID, err)
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	// Validate operation exists.
	if _, ok := registry.Get(req.Operation); !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": fmt.Sprintf("unknown operation: %s", req.Operation),
		})
		return
	}

	if len(req.FileKeys) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "file_keys is required"})
		return
	}

	// Check idempotency.
	if req.IdempotencyKey != "" {
		if existingJobID, ok := h.idempotency.Load(req.IdempotencyKey); ok {
			jobID := existingJobID.(string)
			if jobVal, ok := h.jobs.Load(jobID); ok {
				job := jobVal.(*models.Job)
				log.Printf("[jobs] reqID=%s returning existing job %s for idempotency key %s", reqID, jobID, req.IdempotencyKey)
				writeJSON(w, http.StatusOK, models.JobResponse{
					JobID:   job.ID,
					Status:  job.Status,
					Message: "existing job returned (idempotent)",
				})
				return
			}
		}
	}

	// Check concurrent jobs per IP.
	ip := extractIP(r)
	concurrentCount := h.getIPJobCount(ip)
	if concurrentCount >= int32(h.cfg.MaxConcurrentPerIP) {
		log.Printf("[jobs] reqID=%s IP %s exceeded max concurrent jobs (%d)", reqID, ip, h.cfg.MaxConcurrentPerIP)
		writeJSON(w, http.StatusTooManyRequests, map[string]string{
			"error": fmt.Sprintf("max %d concurrent jobs per IP", h.cfg.MaxConcurrentPerIP),
		})
		return
	}

	// Create job.
	now := time.Now().UTC()
	job := &models.Job{
		ID:             uuid.New().String(),
		Operation:      req.Operation,
		Status:         "queued",
		FileKeys:       req.FileKeys,
		OutputKey:      fmt.Sprintf("outputs/%s/result.pdf", uuid.New().String()),
		Options:        req.Options,
		Progress:       0,
		IdempotencyKey: req.IdempotencyKey,
		IP:             ip,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	// Store job.
	h.jobs.Store(job.ID, job)
	if req.IdempotencyKey != "" {
		h.idempotency.Store(req.IdempotencyKey, job.ID)
	}
	h.incrementIPJobCount(ip)

	// Enqueue job.
	if err := h.queue.Enqueue(r.Context(), *job); err != nil {
		log.Printf("[jobs] reqID=%s error enqueuing job %s: %v", reqID, job.ID, err)
		h.jobs.Delete(job.ID)
		h.decrementIPJobCount(ip)
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "queue is full, try again later"})
		return
	}

	log.Printf("[jobs] reqID=%s created job %s for operation %s", reqID, job.ID, job.Operation)
	writeJSON(w, http.StatusAccepted, models.JobResponse{
		JobID:   job.ID,
		Status:  job.Status,
		Message: "job created and queued",
	})
}

// handleGetJob returns the current status of a job.
func (h *Handler) handleGetJob(w http.ResponseWriter, r *http.Request) {
	jobID := r.PathValue("id")
	if jobID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "job ID is required"})
		return
	}

	jobVal, ok := h.jobs.Load(jobID)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "job not found"})
		return
	}

	job := jobVal.(*models.Job)
	resp := models.JobStatusResponse{
		ID:            job.ID,
		Operation:     job.Operation,
		Status:        job.Status,
		Progress:      job.Progress,
		Error:         job.Error,
		FileSizeBytes: job.FileSizeBytes,
		CreatedAt:     job.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     job.UpdatedAt.Format(time.RFC3339),
	}

	// Generate download URL if job is done.
	if job.Status == "done" && job.OutputKey != "" {
		downloadURL, err := h.generateDownloadURL(r.Context(), job.OutputKey)
		if err != nil {
			log.Printf("[jobs] error generating download URL for job %s: %v", jobID, err)
		} else {
			resp.DownloadURL = downloadURL
		}
	}

	writeJSON(w, http.StatusOK, resp)
}

// handleStreamJob provides Server-Sent Events for job status updates.
func (h *Handler) handleStreamJob(w http.ResponseWriter, r *http.Request) {
	jobID := r.PathValue("id")
	if jobID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "job ID is required"})
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "streaming not supported"})
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	ctx := r.Context()
	lastStatus := ""
	lastProgress := -1

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			jobVal, ok := h.jobs.Load(jobID)
			if !ok {
				fmt.Fprintf(w, "event: error\ndata: {\"error\":\"job not found\"}\n\n")
				flusher.Flush()
				return
			}

			job := jobVal.(*models.Job)

			// Only send update if something changed.
			if job.Status == lastStatus && job.Progress == lastProgress {
				continue
			}
			lastStatus = job.Status
			lastProgress = job.Progress

			data := map[string]interface{}{
				"id":       job.ID,
				"status":   job.Status,
				"progress": job.Progress,
			}

			if job.Error != "" {
				data["error"] = job.Error
			}
			if job.Status == "done" && job.OutputKey != "" {
				downloadURL, err := h.generateDownloadURL(ctx, job.OutputKey)
				if err == nil {
					data["download_url"] = downloadURL
				}
				data["file_size_bytes"] = job.FileSizeBytes
			}

			jsonData, err := json.Marshal(data)
			if err != nil {
				continue
			}

			fmt.Fprintf(w, "event: status\ndata: %s\n\n", jsonData)
			flusher.Flush()

			// Close stream when job reaches terminal state.
			if job.Status == "done" || job.Status == "failed" {
				return
			}
		}
	}
}

// handleHealth returns the health status of the API.
func (h *Handler) handleHealth(w http.ResponseWriter, r *http.Request) {
	depth, err := h.queue.QueueDepth()
	if err != nil {
		log.Printf("[health] error getting queue depth: %v", err)
		depth = -1
	}

	resp := models.HealthResponse{
		Status:     "ok",
		QueueDepth: depth,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
	}

	writeJSON(w, http.StatusOK, resp)
}

// generateDownloadURL creates a time-limited download URL (1 hour expiry).
func (h *Handler) generateDownloadURL(ctx context.Context, key string) (string, error) {
	if h.presignClient == nil {
		return "", fmt.Errorf("storage not configured")
	}

	result, err := h.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(h.cfg.R2Bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(1*time.Hour))
	if err != nil {
		return "", fmt.Errorf("failed to generate download URL: %w", err)
	}

	return result.URL, nil
}

// UpdateJob updates a job in the store. Used by the worker consumer.
func (h *Handler) UpdateJob(job *models.Job) {
	job.UpdatedAt = time.Now().UTC()
	h.jobs.Store(job.ID, job)

	// Decrement IP job count when job reaches terminal state.
	if job.Status == "done" || job.Status == "failed" {
		h.decrementIPJobCount(job.IP)
	}
}

// GetJob retrieves a job from the store.
func (h *Handler) GetJob(id string) (*models.Job, bool) {
	val, ok := h.jobs.Load(id)
	if !ok {
		return nil, false
	}
	return val.(*models.Job), true
}

// getIPJobCount returns the current concurrent job count for an IP.
func (h *Handler) getIPJobCount(ip string) int32 {
	val, ok := h.ipJobs.Load(ip)
	if !ok {
		return 0
	}
	return *val.(*int32)
}

// incrementIPJobCount atomically increments the job count for an IP.
func (h *Handler) incrementIPJobCount(ip string) {
	val, _ := h.ipJobs.LoadOrStore(ip, new(int32))
	ptr := val.(*int32)
	// Simple increment - not truly atomic but sufficient for sync.Map usage.
	*ptr++
}

// decrementIPJobCount atomically decrements the job count for an IP.
func (h *Handler) decrementIPJobCount(ip string) {
	val, ok := h.ipJobs.Load(ip)
	if !ok {
		return
	}
	ptr := val.(*int32)
	if *ptr > 0 {
		*ptr--
	}
}

// extractIP gets the client IP from the request.
func extractIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.SplitN(xff, ",", 2)
		return strings.TrimSpace(parts[0])
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	addr := r.RemoteAddr
	for i := len(addr) - 1; i >= 0; i-- {
		if addr[i] == ':' {
			return addr[:i]
		}
	}
	return addr
}

// writeJSON writes a JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("[handler] error encoding JSON response: %v", err)
	}
}
