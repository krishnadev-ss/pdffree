package watermark

import (
	"context"
	"fmt"

	"github.com/krishnadev-ss/pdffree/operations"
)

// WatermarkOperation adds a watermark to PDF pages.
// TODO: Requires UniDoc license for advanced watermarking.
type WatermarkOperation struct{}

func New() *WatermarkOperation {
	return &WatermarkOperation{}
}

func (w *WatermarkOperation) Name() string {
	return "watermark"
}

func (w *WatermarkOperation) Process(ctx context.Context, input operations.OperationInput) (operations.OperationOutput, error) {
	return operations.OperationOutput{}, fmt.Errorf("watermark: requires UniDoc license - not yet implemented")
}
