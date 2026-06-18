terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    fly = {
      source  = "fly-apps/fly"
      version = "~> 0.1"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "fly" {
  fly_api_token = var.fly_api_token
}
