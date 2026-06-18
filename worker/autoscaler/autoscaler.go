package autoscaler

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/krishnadev-ss/pdffree/api/queue"
)

const (
	scaleUpThreshold  = 50
	scaleDownThreshold = 5
	scaleDownCooldown  = 60 * time.Second
	pollInterval       = 10 * time.Second
)

// Autoscaler watches queue depth and triggers scaling decisions.
// TODO: Integrate with Fly Machines API for actual scaling.
type Autoscaler struct {
	queue          queue.QueueProducer
	lastScaleDown  time.Time
	mu             sync.Mutex
	cancel         context.CancelFunc
	wg             sync.WaitGroup
}

// NewAutoscaler creates a new autoscaler instance.
func NewAutoscaler(q queue.QueueProducer) *Autoscaler {
	return &Autoscaler{
		queue: q,
	}
}

// Start begins the autoscaler polling loop.
func (a *Autoscaler) Start(ctx context.Context) {
	ctx, a.cancel = context.WithCancel(ctx)
	a.wg.Add(1)

	go func() {
		defer a.wg.Done()
		log.Println("[autoscaler] started watching queue depth")

		ticker := time.NewTicker(pollInterval)
		defer ticker.Stop()

		belowThresholdSince := time.Time{}

		for {
			select {
			case <-ctx.Done():
				log.Println("[autoscaler] shutting down")
				return
			case <-ticker.C:
				depth, err := a.queue.QueueDepth()
				if err != nil {
					log.Printf("[autoscaler] error getting queue depth: %v", err)
					continue
				}

				if depth > scaleUpThreshold {
					a.scaleUp(depth)
					belowThresholdSince = time.Time{}
				} else if depth < scaleDownThreshold {
					if belowThresholdSince.IsZero() {
						belowThresholdSince = time.Now()
					} else if time.Since(belowThresholdSince) > scaleDownCooldown {
						a.scaleDown(depth)
						belowThresholdSince = time.Time{}
					}
				} else {
					belowThresholdSince = time.Time{}
				}
			}
		}
	}()
}

// Stop shuts down the autoscaler.
func (a *Autoscaler) Stop() {
	if a.cancel != nil {
		a.cancel()
	}
	a.wg.Wait()
}

// scaleUp logs the intent to scale up workers.
// TODO: Call Fly Machines API to start additional worker machines.
func (a *Autoscaler) scaleUp(depth int64) {
	log.Printf("[autoscaler] SCALE UP: queue depth is %d (threshold: %d). TODO: Call Fly Machines API to add workers.", depth, scaleUpThreshold)
}

// scaleDown logs the intent to scale down workers.
// TODO: Call Fly Machines API to stop idle worker machines.
func (a *Autoscaler) scaleDown(depth int64) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if time.Since(a.lastScaleDown) < scaleDownCooldown {
		return
	}
	a.lastScaleDown = time.Now()

	log.Printf("[autoscaler] SCALE DOWN: queue depth is %d (threshold: %d) for >%v. TODO: Call Fly Machines API to remove workers.", depth, scaleDownThreshold, scaleDownCooldown)
}
