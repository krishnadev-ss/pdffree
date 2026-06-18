resource "cloudflare_ruleset" "pdffree_waf" {
  zone_id = data.cloudflare_zone.app.zone_id
  name    = "PDFFree WAF Rules"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules {
    action = "block"
    expression = "(http.request.uri.path eq \"/api/jobs\" and http.request.method eq \"POST\")"
    description = "Rate limit job submissions to 10 requests per IP per minute"

    ratelimit {
      characteristics     = ["ip.src"]
      period              = 60
      requests_per_period = 10
      mitigation_timeout  = 60
    }
  }
}

resource "cloudflare_ruleset" "pdffree_custom_rules" {
  zone_id = data.cloudflare_zone.app.zone_id
  name    = "PDFFree Custom Security Rules"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "block"
    expression  = "(http.request.body.size gt 104857600)"
    description = "Block requests with body larger than 100MB"
  }

  rules {
    action      = "block"
    expression  = "(http.request.uri.path contains \"../\" or http.request.uri.path contains \"..\\\\\" or http.request.uri.query contains \"<script\" or http.request.uri.query contains \"javascript:\" or http.request.uri.query contains \"onload=\" or http.request.uri.query contains \"onerror=\")"
    description = "Block common attack patterns (path traversal, XSS)"
  }

  rules {
    action      = "block"
    expression  = "(http.request.uri.query contains \"UNION SELECT\" or http.request.uri.query contains \"DROP TABLE\" or http.request.uri.query contains \"1=1\" or http.request.uri.query contains \"OR 1\")"
    description = "Block common SQL injection patterns"
  }
}

resource "cloudflare_ruleset" "pdffree_concurrency" {
  zone_id = data.cloudflare_zone.app.zone_id
  name    = "PDFFree Concurrency Limits"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules {
    action      = "block"
    expression  = "(http.request.uri.path matches \"^/api/.*\")"
    description = "Limit to 5 concurrent connections per IP"

    ratelimit {
      characteristics     = ["ip.src"]
      period              = 10
      requests_per_period = 5
      mitigation_timeout  = 30
    }
  }
}
