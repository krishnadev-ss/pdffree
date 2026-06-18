output "r2_bucket_name" {
  description = "Name of the R2 bucket"
  value       = cloudflare_r2_bucket.pdffree_files.name
}

output "r2_endpoint" {
  description = "R2 S3-compatible endpoint URL"
  value       = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
}

output "api_url" {
  description = "Public URL for the API server"
  value       = "https://${var.app_domain}"
}

output "worker_internal_url" {
  description = "Internal Fly.io URL for the worker"
  value       = "http://pdffree-worker.internal"
}

output "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the app domain"
  value       = data.cloudflare_zone.app.zone_id
}
