package flatten

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// FlattenOperation flattens form fields in a PDF.
// TODO: Implement form field flattening.
type FlattenOperation struct{}

func New() *FlattenOperation {
	return &FlattenOperation{}
}

func (f *FlattenOperation) Name() string {
	return "flatten"
}

func (f *FlattenOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("flatten: form flattening - not yet implemented")
}
