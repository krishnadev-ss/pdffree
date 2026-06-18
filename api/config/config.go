package config

import (
	"os"
	"strconv"
)

// Config holds all configuration for the API server.
type Config struct {
	Port              string
	R2Endpoint        string
	R2AccessKey       string
	R2SecretKey       string
	R2Bucket          string
	AllowedOrigins    string
	RedisURL          string
	MaxFileSize       int64  // bytes
	RateLimitPerMin   int
	MaxConcurrentPerIP int
}

// Load reads configuration from environment variables with sensible defaults.
func Load() Config {
	return Config{
		Port:              getEnv("PORT", "8080"),
		R2Endpoint:        getEnv("R2_ENDPOINT", ""),
		R2AccessKey:       getEnv("R2_ACCESS_KEY", ""),
		R2SecretKey:       getEnv("R2_SECRET_KEY", ""),
		R2Bucket:          getEnv("R2_BUCKET", "pdffree"),
		AllowedOrigins:    getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
		RedisURL:          getEnv("REDIS_URL", "redis://localhost:6379"),
		MaxFileSize:       getEnvInt64("MAX_FILE_SIZE", 100*1024*1024), // 100MB
		RateLimitPerMin:   getEnvInt("RATE_LIMIT_PER_MIN", 30),
		MaxConcurrentPerIP: getEnvInt("MAX_CONCURRENT_PER_IP", 5),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return n
}

func getEnvInt64(key string, defaultVal int64) int64 {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	n, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		return defaultVal
	}
	return n
}
