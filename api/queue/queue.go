package queue

import (
	"context"
	"fmt"
	"log"
	"sync/atomic"

	"github.com/krishnadev-ss/pdffree/api/models"
)

const (
	// FastLaneThreshold is the file size threshold for fast lane (5MB).
	FastLaneThreshold = 5 * 1024 * 1024

	// DefaultBufferSize is the default buffer size for in-memory channels.
	DefaultBufferSize = 1000
)

// QueueProducer is the interface for enqueuing jobs.
type QueueProducer interface {
	// Enqueue adds a job to the appropriate queue lane.
	Enqueue(ctx context.Context, job models.Job) error
	// QueueDepth returns the total number of pending jobs across all lanes.
	QueueDepth() (int64, error)
}

// QueueConsumer is the interface for dequeuing jobs.
type QueueConsumer interface {
	// Dequeue pulls the next job, prioritizing fast lane.
	Dequeue(ctx context.Context) (models.Job, error)
}

// InMemoryQueue is a channel-based in-memory queue with fast and slow lanes.
// TODO: Replace with Redis-backed implementation for production.
type InMemoryQueue struct {
	fast  chan models.Job
	slow  chan models.Job
	depth int64 // atomic counter
}

// NewInMemoryQueue creates a new in-memory queue with buffered channels.
func NewInMemoryQueue() *InMemoryQueue {
	return &InMemoryQueue{
		fast: make(chan models.Job, DefaultBufferSize),
		slow: make(chan models.Job, DefaultBufferSize),
	}
}

// Enqueue adds a job to the appropriate lane based on file size.
func (q *InMemoryQueue) Enqueue(ctx context.Context, job models.Job) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}

	// Determine lane based on total file size hint from options, or default to fast.
	lane := q.fast
	laneName := "fast"

	// Check if any file key suggests a large file.
	// In practice, file size would be checked during presign.
	if job.FileSizeBytes > FastLaneThreshold {
		lane = q.slow
		laneName = "slow"
	}

	select {
	case lane <- job:
		atomic.AddInt64(&q.depth, 1)
		log.Printf("[queue] enqueued job %s to %s lane (depth: %d)", job.ID, laneName, atomic.LoadInt64(&q.depth))
		return nil
	case <-ctx.Done():
		return ctx.Err()
	default:
		return fmt.Errorf("queue %s lane is full", laneName)
	}
}

// QueueDepth returns the total number of pending jobs.
func (q *InMemoryQueue) QueueDepth() (int64, error) {
	return atomic.LoadInt64(&q.depth), nil
}

// Dequeue pulls the next job, prioritizing the fast lane.
func (q *InMemoryQueue) Dequeue(ctx context.Context) (models.Job, error) {
	// Try fast lane first (non-blocking).
	select {
	case job := <-q.fast:
		atomic.AddInt64(&q.depth, -1)
		return job, nil
	default:
	}

	// Try slow lane (non-blocking).
	select {
	case job := <-q.slow:
		atomic.AddInt64(&q.depth, -1)
		return job, nil
	default:
	}

	// Block until a job is available or context is cancelled.
	select {
	case job := <-q.fast:
		atomic.AddInt64(&q.depth, -1)
		return job, nil
	case job := <-q.slow:
		atomic.AddInt64(&q.depth, -1)
		return job, nil
	case <-ctx.Done():
		return models.Job{}, ctx.Err()
	}
}

// FastChan returns the fast lane channel (for worker consumer).
func (q *InMemoryQueue) FastChan() <-chan models.Job {
	return q.fast
}

// SlowChan returns the slow lane channel (for worker consumer).
func (q *InMemoryQueue) SlowChan() <-chan models.Job {
	return q.slow
}
