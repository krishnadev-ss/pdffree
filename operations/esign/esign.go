package esign

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// ESignOperation embeds signature annotations into a PDF.
// TODO: Implement signature annotation embedding.
type ESignOperation struct{}

func New() *ESignOperation {
	return &ESignOperation{}
}

func (e *ESignOperation) Name() string {
	return "esign"
}

func (e *ESignOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("esign: signature annotation embedding - not yet implemented")
}
