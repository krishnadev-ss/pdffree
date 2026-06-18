package rotate

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/krishnadev-ss/pdffree/operations"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

// RotateOperation rotates pages in a PDF by the specified degrees.
type RotateOperation struct{}

func New() *RotateOperation {
	return &RotateOperation{}
}

func (r *RotateOperation) Name() string {
	return "rotate"
}

func (r *RotateOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	if len(input.FileKeys) < 1 {
		return operations.OperationOutput{}, fmt.Errorf("rotate requires at least 1 input file")
	}

	select {
	case <-ctx.Done():
		return operations.OperationOutput{}, ctx.Err()
	default:
	}

	degreesStr, ok := input.Options["degrees"]
	if !ok {
		degreesStr = "90"
	}
	degrees, err := strconv.Atoi(degreesStr)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("invalid degrees value %q: %w", degreesStr, err)
	}
	if degrees != 90 && degrees != 180 && degrees != 270 {
		return operations.OperationOutput{}, fmt.Errorf("degrees must be 90, 180, or 270, got %d", degrees)
	}

	inputPath := filepath.Join(input.LocalDir, filepath.Base(input.FileKeys[0]))
	if _, err := os.Stat(inputPath); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("input file not found at %s: %w", inputPath, err)
	}

	outputDir := filepath.Join(input.LocalDir, "output")
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to create output directory: %w", err)
	}
	outputPath := filepath.Join(outputDir, "rotated.pdf")

	log.Printf("[rotate] rotating %s by %d degrees", inputPath, degrees)

	// Copy input to output path first, then rotate in place.
	data, err := os.ReadFile(inputPath)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to read input file: %w", err)
	}
	if err := os.WriteFile(outputPath, data, 0o644); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to write output file: %w", err)
	}

	conf := model.NewDefaultConfiguration()
	// RotateFile rotates all pages by the given degrees.
	if err := api.RotateFile(outputPath, "", degrees, nil, conf); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("pdfcpu rotate failed: %w", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to stat output file: %w", err)
	}

	log.Printf("[rotate] completed, output size: %d bytes", info.Size())

	return operations.OperationOutput{
		OutputKey:     input.OutputKey,
		FileSizeBytes: info.Size(),
		Message:       fmt.Sprintf("rotated by %d degrees", degrees),
	}, nil
}
