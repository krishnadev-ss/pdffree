# PDFFree

Free, open-source online PDF tools — no login, no watermarks. A self-hostable alternative to iLovePDF.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │────▶│  Cloudflare  │────▶│   Go API     │
│  (React)    │     │  R2 (upload) │     │  (Fly.io)    │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │ enqueue
                                         ┌──────▼───────┐
                                         │   Queue       │
                                         │ (fast/slow)   │
                                         └──────┬───────┘
                                                │ consume
                                         ┌──────▼───────┐
                                         │  Go Workers   │
                                         │  (Fly.io)     │
                                         └──────┬───────┘
                                                │ upload result
                                         ┌──────▼───────┐
                                         │  Cloudflare   │
                                         │  R2 (output)  │
                                         └──────────────┘
```

**Flow:** Client uploads files directly to R2 via pre-signed URLs → submits a job to the Go API → workers process the PDF → result uploaded to R2 → client gets a 1-hour download link.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TanStack Router + Tailwind CSS |
| API Server | Go 1.22, net/http |
| Workers | Go, pdfcpu, Poppler, Tesseract |
| Storage | Cloudflare R2 |
| Queue | In-memory (Redis Streams planned) |
| Hosting | Cloudflare Pages (frontend) + Fly.io (backend) |
| IaC | Terraform |

## PDF Operations

| Operation | Status | Library |
|-----------|--------|---------|
| Merge | Implemented | pdfcpu |
| Split | Implemented | pdfcpu |
| Rotate | Implemented | pdfcpu |
| Protect (add password) | Implemented | pdfcpu |
| Unlock (remove password) | Implemented | pdfcpu |
| Repair | Implemented | pdfcpu |
| Organize pages | Implemented | pdfcpu |
| Compress | Stubbed | Requires UniDoc |
| Watermark | Stubbed | Requires UniDoc |
| Convert (Word/Excel/PPT/Image/HTML ↔ PDF) | Stubbed | Requires Poppler/LibreOffice |
| OCR | Stubbed | Requires Tesseract |
| e-Sign | Stubbed | Custom annotation |
| Page numbers | Stubbed | pdfcpu stamp |
| Flatten forms | Stubbed | Custom |

## Repo Structure

```
/frontend          React Vite app
  /src
    /api           Typed API client
    /components    FileDropzone, JobProgress, DownloadButton, ToolCard, ToolPage
    /hooks         useJob (SSE), useUpload (direct-to-R2)
    /routes        One route per tool + home page

/api               Go HTTP server
  /handlers        Job submission, presign, job status, SSE streaming
  /middleware      Rate limiter (token bucket), CORS, request ID
  /queue           Queue producer (in-memory, two-lane)
  /models          Job struct, request/response types
  /config          Env-based configuration

/worker            Go queue consumer
  /consumer        Worker pool, retry, circuit breaker, DLQ
  /autoscaler      Queue depth watcher, Fly Machines scaling

/operations        One package per PDF operation
  /merge, /split, /rotate, /protect, /unlock, /repair, /organize
  /compress, /watermark, /convert, /ocr, /esign, /pagenumbers, /flatten
  /registry        Operation name → implementation mapping

/infra             Terraform (R2, Fly.io, Cloudflare WAF/DNS)
/scripts           R2 lifecycle policy, CORS setup
```

## Local Development

### Prerequisites

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Terraform](https://www.terraform.io/) (for infra provisioning)
- Cloudflare account with R2 enabled

### Setup

```bash
# Clone
git clone https://github.com/krishnadev-ss/pdffree.git
cd pdffree

# Configure environment
cp .env.example .env
# Edit .env with your R2 credentials

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# API server (in another terminal)
cd api
go run main.go       # http://localhost:8080

# Worker (in another terminal)
cd worker
go run main.go
```

The Vite dev server proxies `/api` requests to `localhost:8080`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | API server port |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allowed origins (comma-separated) |
| `R2_ENDPOINT` | — | Cloudflare R2 S3-compatible endpoint |
| `R2_ACCESS_KEY_ID` | — | R2 access key |
| `R2_SECRET_ACCESS_KEY` | — | R2 secret key |
| `R2_BUCKET` | `pdffree-files` | R2 bucket name |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `WORKER_COUNT` | `4` | Number of worker goroutines |
| `MAX_FILE_SIZE` | `104857600` | Max upload size in bytes (100MB) |
| `RATE_LIMIT_PER_MIN` | `10` | Max job submissions per IP per minute |
| `MAX_CONCURRENT_PER_IP` | `5` | Max concurrent jobs per IP |
| `FLY_API_TOKEN` | — | Fly.io API token (for autoscaler) |
| `FLY_APP_NAME` | `pdffree-worker` | Fly.io worker app name |

## API

Full OpenAPI spec at [`api/openapi.yaml`](api/openapi.yaml).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/presign` | Get R2 pre-signed upload URL |
| `POST` | `/api/jobs` | Submit a PDF processing job |
| `GET` | `/api/jobs/{id}` | Get job status |
| `GET` | `/api/jobs/{id}/stream` | SSE stream of job updates |
| `GET` | `/api/health` | Health check + queue depth |

## High-Traffic Design

- **Two-lane priority queue**: Files <5MB go to a fast lane, larger files to a slow lane
- **Rate limiting**: Token-bucket per IP in Go middleware + Cloudflare WAF rules
- **Circuit breaker**: Workers mark themselves unhealthy after 5 consecutive failures in 60s
- **Retry**: 3 attempts with exponential backoff (1s → 4s → 16s), then dead-letter queue
- **Idempotency**: Every job submission accepts an idempotency key
- **Auto-cleanup**: R2 lifecycle rule deletes all files after 1 hour
- **Autoscaling**: Workers scale up when queue depth >50, down when <5 for 60s (Fly Machines)

## Deployment

### Frontend → Cloudflare Pages

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name pdffree
```

### Backend → Fly.io

```bash
# API
fly deploy --config fly.api.toml

# Worker
fly deploy --config fly.worker.toml
```

### Infrastructure → Terraform

```bash
cd infra
terraform init
terraform plan
terraform apply
```

### R2 Setup

```bash
# Create bucket
npx wrangler r2 bucket create pdffree-files

# Apply lifecycle policy
npx wrangler r2 bucket lifecycle set pdffree-files --rules scripts/r2-lifecycle.json

# Configure CORS
chmod +x scripts/setup-r2-cors.sh
./scripts/setup-r2-cors.sh
```

## License

MIT
