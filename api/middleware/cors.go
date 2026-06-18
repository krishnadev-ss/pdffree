package middleware

import (
	"net/http"
	"strings"

	"github.com/rs/cors"
)

// NewCORSMiddleware creates a CORS middleware handler with the specified allowed origins.
// origins is a comma-separated list of allowed origins.
func NewCORSMiddleware(origins string) func(http.Handler) http.Handler {
	allowedOrigins := strings.Split(origins, ",")
	for i := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID", "X-Idempotency-Key"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	})

	return c.Handler
}
