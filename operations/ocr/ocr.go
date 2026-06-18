package ocr

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// OCROperation performs optical character recognition on PDF pages.
// TODO: Requires Tesseract binary installed on the system.
type OCROperation struct{}

func New() *OCROperation {
	return &OCROperation{}
}

func (o *OCROperation) Name() string {
	return "ocr"
}

func (o *OCROperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("ocr: requires Tesseract binary - not yet implemented")
}
