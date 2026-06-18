package operations

import "context"

// OperationInput holds all inputs needed by an operation.
type OperationInput struct {
	FileKeys []string          `json:"file_keys"` // R2 keys of input files
	OutputKey string           `json:"output_key"` // R2 key for output
	Options  map[string]string `json:"options"`    // operation-specific options
	LocalDir string            `json:"local_dir"`  // temp dir for local file processing
}

// OperationOutput holds the result of a completed operation.
type OperationOutput struct {
	OutputKey     string `json:"output_key"`
	FileSizeBytes int64  `json:"file_size_bytes"`
	Message       string `json:"message"`
}

// Operation is the interface all PDF operations must implement.
type Operation interface {
	Name() string
	Process(ctx context.Context, input OperationInput) (OperationOutput, error)
}
