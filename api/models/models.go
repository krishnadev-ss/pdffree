package models

import "time"

// Job represents a PDF processing job.
type Job struct {
	ID             string            `json:"id"`
	Operation      string            `json:"operation"`
	Status         string            `json:"status"` // queued, processing, done, failed
	FileKeys       []string          `json:"file_keys"`
	OutputKey      string            `json:"output_key"`
	Options        map[string]string `json:"options,omitempty"`
	Progress       int               `json:"progress"` // 0-100
	Error          string            `json:"error,omitempty"`
	IdempotencyKey string            `json:"idempotency_key,omitempty"`
	IP             string            `json:"ip,omitempty"`
	CreatedAt      time.Time         `json:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at"`
	DownloadURL    string            `json:"download_url,omitempty"`
	FileSizeBytes  int64             `json:"file_size_bytes,omitempty"`
}

// PresignRequest is the request body for generating a pre-signed upload URL.
type PresignRequest struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	FileSizeBytes int64 `json:"file_size_bytes"`
}

// PresignResponse is the response containing the pre-signed URL and object key.
type PresignResponse struct {
	UploadURL string `json:"upload_url"`
	FileKey   string `json:"file_key"`
	ExpiresIn int    `json:"expires_in"` // seconds
}

// JobRequest is the request body for creating a new processing job.
type JobRequest struct {
	Operation      string            `json:"operation"`
	FileKeys       []string          `json:"file_keys"`
	Options        map[string]string `json:"options,omitempty"`
	IdempotencyKey string            `json:"idempotency_key,omitempty"`
}

// JobResponse is the response returned when a job is created.
type JobResponse struct {
	JobID     string `json:"job_id"`
	Status    string `json:"status"`
	Message   string `json:"message"`
}

// JobStatusResponse is the response for a job status query.
type JobStatusResponse struct {
	ID            string `json:"id"`
	Operation     string `json:"operation"`
	Status        string `json:"status"`
	Progress      int    `json:"progress"`
	Error         string `json:"error,omitempty"`
	DownloadURL   string `json:"download_url,omitempty"`
	FileSizeBytes int64  `json:"file_size_bytes,omitempty"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

// HealthResponse is the response for the health check endpoint.
type HealthResponse struct {
	Status     string `json:"status"`
	QueueDepth int64  `json:"queue_depth"`
	Timestamp  string `json:"timestamp"`
}
