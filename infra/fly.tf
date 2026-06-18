resource "fly_app" "api" {
  name = "pdffree-api"
  org  = "personal"
}

resource "fly_app" "worker" {
  name = "pdffree-worker"
  org  = "personal"
}

resource "fly_machine" "api" {
  app    = fly_app.api.name
  region = "iad"
  name   = "pdffree-api"

  config = {
    image = "registry.fly.io/pdffree-api:latest"

    guest = {
      cpus     = 1
      memory   = 512
      cpu_kind = "shared"
    }

    services = [
      {
        ports = [
          {
            port     = 443
            handlers = ["tls", "http"]
          },
          {
            port     = 80
            handlers = ["http"]
          }
        ]
        protocol      = "tcp"
        internal_port = 8080

        checks = [
          {
            type     = "http"
            port     = 8080
            path     = "/api/health"
            interval = 10000
            timeout  = 5000
          }
        ]
      }
    ]

    env = {
      PORT              = "8080"
      ENVIRONMENT       = var.environment
      R2_BUCKET         = var.r2_bucket_name
      R2_ENDPOINT       = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
      WORKER_INTERNAL   = "pdffree-worker.internal"
      ALLOWED_ORIGINS   = "https://${var.app_domain}"
      RATE_LIMIT_PER_MIN    = "10"
      MAX_CONCURRENT_PER_IP = "5"
    }
  }
}

resource "fly_machine" "worker" {
  app    = fly_app.worker.name
  region = "iad"
  name   = "pdffree-worker"

  config = {
    image = "registry.fly.io/pdffree-worker:latest"

    guest = {
      cpus     = 2
      memory   = 1024
      cpu_kind = "shared"
    }

    env = {
      ENVIRONMENT     = var.environment
      R2_BUCKET       = var.r2_bucket_name
      R2_ENDPOINT     = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
      WORKER_COUNT    = "4"
      MAX_FILE_SIZE   = "104857600"
      API_INTERNAL    = "pdffree-api.internal"
    }
  }
}
