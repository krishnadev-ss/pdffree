package pagenumbers

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// PageNumbersOperation stamps page numbers onto PDF pages.
// TODO: Could use pdfcpu stamp but requires complex positioning logic.
type PageNumbersOperation struct{}

func New() *PageNumbersOperation {
	return &PageNumbersOperation{}
}

func (p *PageNumbersOperation) Name() string {
	return "pagenumbers"
}

func (p *PageNumbersOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("pagenumbers: page number stamping - not yet implemented")
}
