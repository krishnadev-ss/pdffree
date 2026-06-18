package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"

	"github.com/krishnadev-ss/pdffree/api/config"
	"github.com/krishnadev-ss/pdffree/api/models"
	"github.com/krishnadev-ss/pdffree/api/queue"
	"github.com/krishnadev-ss/pdffree/worker/autoscaler"
	"github.com/krishnadev-ss/pdffree/worker/consumer"
)

// inMemoryJobStore implements consumer.JobUpdater using a sync.Map.
// In production, this would be backed by Redis or a database.
type inMemoryJobStore struct {
	jobs sync.Map
}

func (s *inMemoryJobStore) UpdateJob(job *models.Job) {
	s.jobs.Store(job.ID, job)
	log.Printf("[store] job %s updated: status=%s progress=%d", job.ID, job.Status, job.Progress)
}

func (s *inMemoryJobStore) GetJob(id string) (*models.Job, bool) {
	val, ok := s.jobs.Load(id)
	if !ok {
		return nil, false
	}
	return val.(*models.Job), true
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[worker] starting PDFFree worker")

	// Load configuration.
	cfg := config.Load()

	workerCount := getEnvInt("WORKER_COUNT", 4)
	log.Printf("[worker] worker_count=%d bucket=%s", workerCount, cfg.R2Bucket)

	// Create shared queue (in production, this would connect to Redis).
	q := queue.NewInMemoryQueue()

	// Create job store.
	store := &inMemoryJobStore{}

	// Create consumer.
	cons, err := consumer.NewConsumer(q, store, consumer.Config{
		WorkerCount: workerCount,
		R2Endpoint:  cfg.R2Endpoint,
		R2AccessKey: cfg.R2AccessKey,
		R2SecretKey: cfg.R2SecretKey,
		R2Bucket:    cfg.R2Bucket,
	})
	if err != nil {
		log.Fatalf("[worker] failed to create consumer: %v", err)
	}

	// Create autoscaler.
	as := autoscaler.NewAutoscaler(q)

	// Start consuming.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cons.Start(ctx)
	as.Start(ctx)

	log.Println("[worker] ready and consuming jobs")

	// Graceful shutdown.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("[worker] received signal %s, shutting down gracefully", sig)

	cancel()
	cons.Stop()
	as.Stop()

	log.Println("[worker] shutdown complete")
}

func getEnvInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return n
}
