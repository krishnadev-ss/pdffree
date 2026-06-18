package merge

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/krishnadev-ss/pdffree/operations"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

// MergeOperation merges multiple PDF files into one.
type MergeOperation struct{}

func New() *MergeOperation {
	return &MergeOperation{}
}

func (m *MergeOperation) Name() string {
	return "merge"
}

func (m *MergeOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	if len(input.FileKeys) < 2 {
		return operations.OperationOutput{}, fmt.Errorf("merge requires at least 2 input files, got %d", len(input.FileKeys))
	}

	select {
	case <-ctx.Done():
		return operations.OperationOutput{}, ctx.Err()
	default:
	}

	// Build list of local input file paths.
	inputPaths := make([]string, 0, len(input.FileKeys))
	for _, key := range input.FileKeys {
		localPath := filepath.Join(input.LocalDir, filepath.Base(key))
		if _, err := os.Stat(localPath); err != nil {
			return operations.OperationOutput{}, fmt.Errorf("input file not found at %s: %w", localPath, err)
		}
		inputPaths = append(inputPaths, localPath)
	}

	// Prepare output path.
	outputDir := filepath.Join(input.LocalDir, "output")
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to create output directory: %w", err)
	}
	outputPath := filepath.Join(outputDir, "merged.pdf")

	log.Printf("[merge] merging %d files into %s", len(inputPaths), outputPath)

	conf := model.NewDefaultConfiguration()
	if err := api.MergeCreateFile(inputPaths, outputPath, false, conf); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("pdfcpu merge failed: %w", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to stat output file: %w", err)
	}

	log.Printf("[merge] completed, output size: %d bytes", info.Size())

	return operations.OperationOutput{
		OutputKey:     input.OutputKey,
		FileSizeBytes: info.Size(),
		Message:       fmt.Sprintf("merged %d files", len(inputPaths)),
	}, nil
}
