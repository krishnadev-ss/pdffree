package organize

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/krishnadev-ss/pdffree/operations"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

// OrganizeOperation rearranges pages in a PDF according to a specified order.
type OrganizeOperation struct{}

func New() *OrganizeOperation {
	return &OrganizeOperation{}
}

func (o *OrganizeOperation) Name() string {
	return "organize"
}

func (o *OrganizeOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	if len(input.FileKeys) < 1 {
		return operations.OperationOutput{}, fmt.Errorf("organize requires at least 1 input file")
	}

	select {
	case <-ctx.Done():
		return operations.OperationOutput{}, ctx.Err()
	default:
	}

	pagesStr, ok := input.Options["pages"]
	if !ok || pagesStr == "" {
		return operations.OperationOutput{}, fmt.Errorf("organize requires a 'pages' option (e.g., '3,1,2')")
	}

	// Validate pages string format.
	parts := strings.Split(pagesStr, ",")
	if len(parts) == 0 {
		return operations.OperationOutput{}, fmt.Errorf("organize: invalid pages format %q", pagesStr)
	}

	inputPath := filepath.Join(input.LocalDir, filepath.Base(input.FileKeys[0]))
	if _, err := os.Stat(inputPath); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("input file not found at %s: %w", inputPath, err)
	}

	outputDir := filepath.Join(input.LocalDir, "output")
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to create output directory: %w", err)
	}
	outputPath := filepath.Join(outputDir, "organized.pdf")

	log.Printf("[organize] rearranging pages of %s with order: %s", inputPath, pagesStr)

	conf := model.NewDefaultConfiguration()

	// Parse page order into slice for CollectFile.
	pageNumbers := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			pageNumbers = append(pageNumbers, trimmed)
		}
	}

	if err := api.CollectFile(inputPath, outputPath, pageNumbers, conf); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("pdfcpu collect failed: %w", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to stat output file: %w", err)
	}

	log.Printf("[organize] completed, output size: %d bytes", info.Size())

	return operations.OperationOutput{
		OutputKey:     input.OutputKey,
		FileSizeBytes: info.Size(),
		Message:       fmt.Sprintf("pages reorganized: %s", pagesStr),
	}, nil
}
