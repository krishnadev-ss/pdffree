package convert

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// ConvertOperation converts between PDF and other formats.
// TODO: Requires external tools (Poppler for PDF-to-image, LibreOffice for office-to-PDF).
type ConvertOperation struct{}

func New() *ConvertOperation {
	return &ConvertOperation{}
}

func (c *ConvertOperation) Name() string {
	return "convert"
}

func (c *ConvertOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("convert: requires external tools (Poppler/LibreOffice) - not yet implemented")
}
