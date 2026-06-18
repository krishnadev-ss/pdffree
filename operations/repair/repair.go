package repair

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

// RepairOperation repairs a PDF by optimizing its structure.
type RepairOperation struct{}

func New() *RepairOperation {
	return &RepairOperation{}
}

func (r *RepairOperation) Name() string {
	return "repair"
}

func (r *RepairOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	if len(input.FileKeys) < 1 {
		return operations.OperationOutput{}, fmt.Errorf("repair requires at least 1 input file")
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
	outputPath := filepath.Join(outputDir, "repaired.pdf")

	log.Printf("[repair] optimizing/repairing %s", inputPath)

	conf := model.NewDefaultConfiguration()
	if err := api.OptimizeFile(inputPath, outputPath, conf); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("pdfcpu optimize failed: %w", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to stat output file: %w", err)
	}

	log.Printf("[repair] completed, output size: %d bytes", info.Size())

	return operations.OperationOutput{
		OutputKey:     input.OutputKey,
		FileSizeBytes: info.Size(),
		Message:       "PDF repaired and optimized",
	}, nil
}
