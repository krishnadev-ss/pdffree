variable "cloudflare_api_token" {
  description = "Cloudflare API token with R2, DNS, and WAF permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "fly_api_token" {
  description = "Fly.io API token"
  type        = string
  sensitive   = true
}

variable "r2_bucket_name" {
  description = "Name of the Cloudflare R2 bucket for file storage"
  type        = string
  default     = "pdffree-files"
}

variable "app_domain" {
  description = "Primary domain for the application"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}
