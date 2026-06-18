#!/usr/bin/env bash
set -euo pipefail

# Configure CORS policy for the PDFFree R2 bucket.
# Requires: wrangler CLI authenticated with Cloudflare.
#
# Usage:
#   ALLOWED_ORIGINS="https://pdffree.example.com" ./scripts/setup-r2-cors.sh
#   # or for local development:
#   ALLOWED_ORIGINS="http://localhost:5173" BUCKET_NAME="pdffree-files" ./scripts/setup-r2-cors.sh

BUCKET_NAME="${BUCKET_NAME:-pdffree-files}"
ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173}"

CORS_CONFIG=$(cat <<EOF
{
  "cors": [
    {
      "allowedOrigins": ["${ALLOWED_ORIGINS}"],
      "allowedMethods": ["PUT", "GET"],
      "allowedHeaders": ["Content-Type", "Content-Length"],
      "maxAgeSeconds": 3600
    }
  ]
}
EOF
)

echo "Configuring CORS for R2 bucket: ${BUCKET_NAME}"
echo "Allowed origins: ${ALLOWED_ORIGINS}"

echo "${CORS_CONFIG}" | npx wrangler r2 bucket cors put "${BUCKET_NAME}" --rules -

echo "CORS policy applied successfully."
