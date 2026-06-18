package unlock

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

// UnlockOperation removes password protection from a PDF.
type UnlockOperation struct{}

func New() *UnlockOperation {
	return &UnlockOperation{}
}

func (u *UnlockOperation) Name() string {
	return "unlock"
}

func (u *UnlockOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	if len(input.FileKeys) < 1 {
		return operations.OperationOutput{}, fmt.Errorf("unlock requires at least 1 input file")
	}

	select {
	case <-ctx.Done():
		return operations.OperationOutput{}, ctx.Err()
	default:
	}

	password, ok := input.Options["password"]
	if !ok || password == "" {
		return operations.OperationOutput{}, fmt.Errorf("unlock requires a 'password' option")
	}

	inputPath := filepath.Join(input.LocalDir, filepath.Base(input.FileKeys[0]))
	if _, err := os.Stat(inputPath); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("input file not found at %s: %w", inputPath, err)
	}

	outputDir := filepath.Join(input.LocalDir, "output")
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to create output directory: %w", err)
	}
	outputPath := filepath.Join(outputDir, "unlocked.pdf")

	log.Printf("[unlock] decrypting %s", inputPath)

	conf := model.NewDefaultConfiguration()
	conf.UserPW = password
	conf.OwnerPW = password

	if err := api.DecryptFile(inputPath, outputPath, conf); err != nil {
		return operations.OperationOutput{}, fmt.Errorf("pdfcpu decrypt failed: %w", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		return operations.OperationOutput{}, fmt.Errorf("failed to stat output file: %w", err)
	}

	log.Printf("[unlock] completed, output size: %d bytes", info.Size())

	return operations.OperationOutput{
		OutputKey:     input.OutputKey,
		FileSizeBytes: info.Size(),
		Message:       "password protection removed",
	}, nil
}
