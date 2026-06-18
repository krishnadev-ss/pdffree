package split

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

// SplitOperation splits a PDF into individual pages.
type SplitOperation struct{}

func New() *SplitOperation {
	return &SplitOperation{}
}

func (s *SplitOperation) Name() string {
	return "split"
}

func (s *SplitOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	if len(input.FileKeys) < 1 {
		return operations.OperationOutput{}, fmt.Errorf("split requires at least 1 input file")
	}

	select {
	case <-ctx.Done():
		return operations.OperationOutput{}, ctx.Err()
	default:
	}

	inputPath := filepath.Join(input.LocalDir, filepath.Base(input.FileKeys[0]))
	if _, err := os.Stat(inputPath); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("input file not found at %s: %w", inputPath, err)
	}

	outputDir := filepath.Join(input.LocalDir, "output")
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to create output directory: %w", err)
	}

	log.Printf("[split] splitting %s into individual pages", inputPath)

	conf := model.NewDefaultConfiguration()
	// span=1 means split into individual pages.
	if err := api.SplitFile(inputPath, outputDir, 1, conf); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("pdfcpu split failed: %w", err)
	}

	// Calculate total size of output files.
	var totalSize int64
	entries, err := os.ReadDir(outputDir)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to read output directory: %w", err)
	}

	pageCount := 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		totalSize += info.Size()
		pageCount++
	}

	log.Printf("[split] completed, produced %d page files, total size: %d bytes", pageCount, totalSize)

	return operations.OperationOutput{
		OutputKey:     input.OutputKey,
		FileSizeBytes: totalSize,
		Message:       fmt.Sprintf("split into %d pages", pageCount),
	}, nil
}
