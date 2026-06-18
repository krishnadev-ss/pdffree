resource "cloudflare_r2_bucket" "pdffree_files" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
  location   = "ENAM"
}

resource "cloudflare_r2_bucket_cors" "pdffree_files_cors" {
  account_id = var.cloudflare_account_id
  bucket     = cloudflare_r2_bucket.pdffree_files.name

  rules {
    allowed {
      origins = ["https://${var.app_domain}"]
      methods = ["PUT", "GET"]
      headers = ["Content-Type", "Content-Length"]
    }
    max_age_seconds = 3600
  }
}

resource "cloudflare_r2_bucket_lifecycle" "pdffree_files_cleanup" {
  account_id = var.cloudflare_account_id
  bucket     = cloudflare_r2_bucket.pdffree_files.name

  rules {
    id      = "auto-delete-after-1-hour"
    enabled = true

    conditions {
      age = 3600
    }

    abort_incomplete_multipart_upload {
      age = 86400
    }

    action {
      type = "Delete"
    }
  }
}
