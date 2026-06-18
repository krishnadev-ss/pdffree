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

// ShareRequest is the request body for creating a file share link.
type ShareRequest struct {
	FileKeys  []string `json:"file_keys"`
	ExpiresIn int      `json:"expires_in"` // hours, default 24, max 72
	MaxDownloads int   `json:"max_downloads"` // 0 = unlimited
	Message   string   `json:"message,omitempty"` // optional message to recipient
}

// ShareResponse is the response containing the share link details.
type ShareResponse struct {
	ShareID  string `json:"share_id"`
	ShareURL string `json:"share_url"`
	ExpiresAt string `json:"expires_at"`
}

// Share represents a shared file link.
type Share struct {
	ID            string    `json:"id"`
	FileKeys      []string  `json:"file_keys"`
	Message       string    `json:"message,omitempty"`
	MaxDownloads  int       `json:"max_downloads"`
	DownloadCount int       `json:"download_count"`
	IP            string    `json:"ip,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	ExpiresAt     time.Time `json:"expires_at"`
}

// ShareStatusResponse is the response for a share link status query.
type ShareStatusResponse struct {
	ID            string   `json:"id"`
	FileKeys      []string `json:"file_keys"`
	Message       string   `json:"message,omitempty"`
	DownloadCount int      `json:"download_count"`
	MaxDownloads  int      `json:"max_downloads"`
	ExpiresAt     string   `json:"expires_at"`
	Expired       bool     `json:"expired"`
	DownloadURLs  []string `json:"download_urls,omitempty"`
}

// TransferRequest is the request body for creating an instant transfer.
type TransferRequest struct {
	FileKeys []string `json:"file_keys"`
	Message  string   `json:"message,omitempty"`
}

// TransferResponse is the response containing the transfer key.
type TransferResponse struct {
	TransferID string `json:"transfer_id"`
	UnlockKey  string `json:"unlock_key"` // 6-digit code the sender shares with receiver
	ExpiresAt  string `json:"expires_at"`
}

// Transfer represents an instant file transfer.
type Transfer struct {
	ID         string    `json:"id"`
	UnlockKey  string    `json:"unlock_key"`
	FileKeys   []string  `json:"file_keys"`
	Message    string    `json:"message,omitempty"`
	Claimed    bool      `json:"claimed"`
	IP         string    `json:"ip,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	ExpiresAt  time.Time `json:"expires_at"`
}

// TransferUnlockRequest is the request to claim a transfer with a key.
type TransferUnlockRequest struct {
	UnlockKey string `json:"unlock_key"`
}

// TransferUnlockResponse is the response when a transfer is claimed.
type TransferUnlockResponse struct {
	TransferID   string   `json:"transfer_id"`
	Message      string   `json:"message,omitempty"`
	DownloadURLs []string `json:"download_urls"`
	ExpiresAt    string   `json:"expires_at"`
}
