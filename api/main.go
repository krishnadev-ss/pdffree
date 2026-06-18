package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/krishnadev-ss/pdffree/api/config"
	"github.com/krishnadev-ss/pdffree/api/handlers"
	"github.com/krishnadev-ss/pdffree/api/middleware"
	"github.com/krishnadev-ss/pdffree/api/queue"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[api] starting PDFFree API server")

	// Load configuration.
	cfg := config.Load()
	log.Printf("[api] port=%s allowed_origins=%s max_file_size=%d", cfg.Port, cfg.AllowedOrigins, cfg.MaxFileSize)

	// Create queue producer.
	q := queue.NewInMemoryQueue()

	// Create handler.
	h, err := handlers.NewHandler(cfg, q)
	if err != nil {
		log.Fatalf("[api] failed to create handler: %v", err)
	}

	// Set up routes.
	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	// Build middleware chain: requestID -> CORS -> rate limit -> handler.
	rateLimiter := middleware.NewRateLimitMiddleware(cfg.RateLimitPerMin, cfg.MaxConcurrentPerIP)
	defer rateLimiter.Stop()

	corsMiddleware := middleware.NewCORSMiddleware(cfg.AllowedOrigins)

	var handler http.Handler = mux
	handler = rateLimiter.Handler(handler)
	handler = corsMiddleware(handler)
	handler = middleware.RequestIDMiddleware(handler)

	// Create server.
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 120 * time.Second, // Longer for SSE
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine.
	go func() {
		log.Printf("[api] listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[api] server error: %v", err)
		}
	}()

	// Graceful shutdown.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("[api] received signal %s, shutting down gracefully", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[api] forced shutdown: %v", err)
	}

	log.Println("[api] server stopped")
}
