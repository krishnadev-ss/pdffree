package registry

import (
	"sync"

	"github.com/krishnadev-ss/pdffree/operations"
	"github.com/krishnadev-ss/pdffree/operations/compress"
	"github.com/krishnadev-ss/pdffree/operations/convert"
	"github.com/krishnadev-ss/pdffree/operations/esign"
	"github.com/krishnadev-ss/pdffree/operations/flatten"
	"github.com/krishnadev-ss/pdffree/operations/merge"
	"github.com/krishnadev-ss/pdffree/operations/ocr"
	"github.com/krishnadev-ss/pdffree/operations/organize"
	"github.com/krishnadev-ss/pdffree/operations/pagenumbers"
	"github.com/krishnadev-ss/pdffree/operations/protect"
	"github.com/krishnadev-ss/pdffree/operations/repair"
	"github.com/krishnadev-ss/pdffree/operations/rotate"
	"github.com/krishnadev-ss/pdffree/operations/split"
	"github.com/krishnadev-ss/pdffree/operations/unlock"
	"github.com/krishnadev-ss/pdffree/operations/watermark"
)

var (
	registry map[string]operations.Operation
	once     sync.Once
)

func init() {
	once.Do(func() {
		registry = make(map[string]operations.Operation)
		register(merge.New())
		register(split.New())
		register(rotate.New())
		register(protect.New())
		register(unlock.New())
		register(repair.New())
		register(organize.New())
		register(compress.New())
		register(watermark.New())
		register(convert.New())
		register(ocr.New())
		register(esign.New())
		register(pagenumbers.New())
		register(flatten.New())
	})
}

func register(op operations.Operation) {
	registry[op.Name()] = op
}

// Get returns the operation registered under the given name.
func Get(name string) (operations.Operation, bool) {
	op, ok := registry[name]
	return op, ok
}

// List returns all registered operation names.
func List() []string {
	names := make([]string, 0, len(registry))
	for name := range registry {
		names = append(names, name)
	}
	return names
}
