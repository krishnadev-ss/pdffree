data "cloudflare_zone" "app" {
  account_id = var.cloudflare_account_id
  name       = var.app_domain
}

resource "cloudflare_dns_record" "app_root" {
  zone_id = data.cloudflare_zone.app.zone_id
  name    = "@"
  content = "pdffree-api.fly.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "app_www" {
  zone_id = data.cloudflare_zone.app.zone_id
  name    = "www"
  content = "pdffree-api.fly.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
