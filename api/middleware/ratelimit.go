package middleware

import (
	"log"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type ipLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimitMiddleware provides per-IP token bucket rate limiting.
type RateLimitMiddleware struct {
	limiters sync.Map // map[string]*ipLimiter
	rps      rate.Limit
	burst    int
	done     chan struct{}
}

// NewRateLimitMiddleware creates a new rate limiter middleware.
// requestsPerMin is the maximum number of requests per minute per IP.
// burst is the maximum burst size.
func NewRateLimitMiddleware(requestsPerMin int, burst int) *RateLimitMiddleware {
	rl := &RateLimitMiddleware{
		rps:   rate.Limit(float64(requestsPerMin) / 60.0),
		burst: burst,
		done:  make(chan struct{}),
	}
	go rl.cleanup()
	return rl
}

// getLimiter returns the rate limiter for a given IP, creating one if necessary.
func (rl *RateLimitMiddleware) getLimiter(ip string) *rate.Limiter {
	val, ok := rl.limiters.Load(ip)
	if ok {
		entry := val.(*ipLimiter)
		entry.lastSeen = time.Now()
		return entry.limiter
	}

	limiter := rate.NewLimiter(rl.rps, rl.burst)
	entry := &ipLimiter{limiter: limiter, lastSeen: time.Now()}
	actual, loaded := rl.limiters.LoadOrStore(ip, entry)
	if loaded {
		return actual.(*ipLimiter).limiter
	}
	return limiter
}

// cleanup removes stale IP entries every 5 minutes.
func (rl *RateLimitMiddleware) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			staleThreshold := time.Now().Add(-10 * time.Minute)
			rl.limiters.Range(func(key, value interface{}) bool {
				entry := value.(*ipLimiter)
				if entry.lastSeen.Before(staleThreshold) {
					rl.limiters.Delete(key)
				}
				return true
			})
		case <-rl.done:
			return
		}
	}
}

// Stop shuts down the cleanup goroutine.
func (rl *RateLimitMiddleware) Stop() {
	close(rl.done)
}

// Handler wraps an http.Handler with rate limiting.
func (rl *RateLimitMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := extractIP(r)
		limiter := rl.getLimiter(ip)

		if !limiter.Allow() {
			log.Printf("[ratelimit] rate limit exceeded for IP %s", ip)
			http.Error(w, `{"error":"rate limit exceeded, try again later"}`, http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// extractIP gets the client IP from the request, checking X-Forwarded-For first.
func extractIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// Take the first IP in the chain (original client).
		for i := 0; i < len(xff); i++ {
			if xff[i] == ',' {
				return xff[:i]
			}
		}
		return xff
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	// Strip port from RemoteAddr.
	addr := r.RemoteAddr
	for i := len(addr) - 1; i >= 0; i-- {
		if addr[i] == ':' {
			return addr[:i]
		}
	}
	return addr
}
