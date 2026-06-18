package compress

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// CompressOperation compresses a PDF to reduce file size.
// TODO: Requires UniDoc license for advanced compression.
type CompressOperation struct{}

func New() *CompressOperation {
	return &CompressOperation{}
}

func (c *CompressOperation) Name() string {
	return "compress"
}

func (c *CompressOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("compress: requires UniDoc license - not yet implemented")
}
