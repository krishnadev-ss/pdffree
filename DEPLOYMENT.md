# PDFFree - Complete Deployment Guide

This guide walks you through deploying PDFFree from scratch. You'll need:
- A **Cloudflare account** (free tier works)
- A **Fly.io account** (free tier works for hobby use)
- **Go 1.22+** installed locally
- **Node.js 20+** installed locally
- **Wrangler CLI** (`npm install -g wrangler`)
- **Fly CLI** (`brew install flyctl` or see https://fly.io/docs/getting-started/installing-flyctl/)

---

## Part 1: Cloudflare Setup (R2 Storage + Pages + WAF)

### Step 1: Create a Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email
3. No domain is needed yet (we'll use Cloudflare Pages default domain)

### Step 2: Enable Cloudflare R2 (Object Storage)

R2 is where uploaded PDFs and processed results are stored temporarily.

1. In the Cloudflare dashboard, click **"R2 Object Storage"** in the left sidebar
2. Click **"Create bucket"**
3. Bucket name: `pdffree-files`
4. Location: **Automatic** (or pick a region close to you)
5. Click **"Create bucket"**

### Step 3: Set R2 Lifecycle Rule (Auto-Delete After 1 Hour)

This ensures files are automatically cleaned up for privacy.

1. Go to **R2 > pdffree-files > Settings**
2. Scroll to **"Object lifecycle rules"**
3. Click **"Add rule"**
4. Rule name: `auto-cleanup`
5. Apply to: **All objects in bucket**
6. Action: **Delete objects after** `1` **day** (R2 minimum is 1 day; for 1 hour, we'll use the API approach below)
7. Click **"Save"**

**For true 1-hour cleanup**, run this after setting up Wrangler (Step 5):

```bash
cd pdffree
npx wrangler r2 bucket lifecycle set pdffree-files --rules scripts/r2-lifecycle.json
```

### Step 4: Set R2 CORS Policy

This allows the browser to upload files directly to R2.

1. Go to **R2 > pdffree-files > Settings**
2. Scroll to **"CORS policy"**
3. Click **"Edit CORS policy"** and paste:

```json
[
  {
    "AllowedOrigins": ["https://pdffree.pages.dev", "http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Replace `pdffree.pages.dev` with your actual Pages domain (you'll get this in Step 8)
5. Click **"Save"**

### Step 5: Create R2 API Token

The Go backend needs API credentials to generate pre-signed URLs.

1. Go to **R2 > Overview** (or **R2 > Manage R2 API Tokens**)
2. Click **"Create API token"**
3. Token name: `pdffree-backend`
4. Permissions: **Object Read & Write**
5. Specify bucket: **pdffree-files**
6. TTL: **No expiration** (or set a long TTL)
7. Click **"Create API Token"**
8. **SAVE THESE VALUES** - you'll only see them once:
   - `Access Key ID` → This is your `R2_ACCESS_KEY_ID`
   - `Secret Access Key` → This is your `R2_SECRET_ACCESS_KEY`
9. Also note your **Account ID** from the R2 overview page:
   - Your R2 endpoint is: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### Step 6: Get Your Cloudflare Account ID

1. Go to any page in the Cloudflare dashboard
2. Look at the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`
3. Or go to **R2 > Overview** and find it in the sidebar
4. Save this — you need it for the R2 endpoint

### Step 7: Build the Frontend

```bash
cd pdffree/frontend
npm install
npm run build
```

This creates the `frontend/dist/` folder with the production build.

### Step 8: Deploy Frontend to Cloudflare Pages

**Option A: Using Wrangler CLI (Recommended)**

```bash
# Login to Cloudflare (opens browser)
npx wrangler login

# Deploy
cd pdffree/frontend
npx wrangler pages deploy dist --project-name pdffree
```

The first deploy creates the project. Note your URL: `https://pdffree.pages.dev`

**Option B: Via Dashboard**

1. Go to **Workers & Pages** in the Cloudflare dashboard
2. Click **"Create"** > **"Pages"** > **"Upload assets"**
3. Project name: `pdffree`
4. Upload the `frontend/dist/` folder
5. Click **"Deploy site"**

Your frontend is now live at `https://pdffree.pages.dev`!

### Step 9: Configure Cloudflare WAF Rules (Rate Limiting)

1. If you have a domain connected, go to **Security > WAF**
2. Click **"Create rule"**

**Rule 1: Rate limit job submissions**
- Name: `Rate limit PDF jobs`
- If: URI Path contains `/api/jobs` AND Request Method equals `POST`
- Then: **Rate limit** at 10 requests per minute per IP
- Action: Block for 60 seconds

**Rule 2: File size limit**
- Name: `Block large uploads`
- If: Request body size is greater than `100000000` (100MB)
- Then: **Block**

3. Click **"Deploy"**

> Note: For the free plan, you get 5 custom WAF rules. These are optional — the Go backend has its own rate limiter too.

---

## Part 2: Fly.io Setup (Go Backend + Workers)

### Step 10: Create Fly.io Account

1. Go to https://fly.io/app/sign-up
2. Sign up (you may need to add a credit card, but the free tier gives you enough)

### Step 11: Install Fly CLI

```bash
# macOS
brew install flyctl

# Or via script
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### Step 12: Deploy the API Server

```bash
cd pdffree

# Create the .env file with your Cloudflare credentials
cp .env.example .env
```

Edit `.env` with your actual values:
```bash
PORT=8080
ALLOWED_ORIGINS=https://pdffree.pages.dev
R2_ENDPOINT=https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<your R2 access key from Step 5>
R2_SECRET_ACCESS_KEY=<your R2 secret key from Step 5>
R2_BUCKET=pdffree-files
WORKER_COUNT=4
RATE_LIMIT_PER_MIN=10
MAX_CONCURRENT_PER_IP=5
```

Now deploy the API:

```bash
# Launch the API app on Fly.io
fly launch --config fly.api.toml --no-deploy

# Set secrets (environment variables)
fly secrets set \
  R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com" \
  R2_ACCESS_KEY_ID="<your key>" \
  R2_SECRET_ACCESS_KEY="<your secret>" \
  R2_BUCKET="pdffree-files" \
  ALLOWED_ORIGINS="https://pdffree.pages.dev" \
  --app pdffree-api

# Deploy
fly deploy --config fly.api.toml
```

Note your API URL: `https://pdffree-api.fly.dev`

### Step 13: Deploy the Worker

```bash
# Launch the worker app
fly launch --config fly.worker.toml --no-deploy

# Set the same R2 secrets
fly secrets set \
  R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com" \
  R2_ACCESS_KEY_ID="<your key>" \
  R2_SECRET_ACCESS_KEY="<your secret>" \
  R2_BUCKET="pdffree-files" \
  WORKER_COUNT="4" \
  --app pdffree-worker

# Deploy
fly deploy --config fly.worker.toml
```

### Step 14: Update Frontend API URL

The frontend needs to know where the API lives. Update `frontend/vite.config.ts`:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'  // only for local dev
    }
  }
})
```

For production, create `frontend/public/_redirects` (for Cloudflare Pages):

```
/api/*  https://pdffree-api.fly.dev/api/:splat  200
```

Or use a `_routes.json`:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/api/*"]
}
```

And configure a Cloudflare Pages Function or Worker to proxy `/api` requests.

**Simpler approach**: Update the API client to use the full URL in production:

```bash
cd pdffree/frontend
```

Edit `src/api/client.ts` and change:
```typescript
const API_BASE = import.meta.env.PROD
  ? 'https://pdffree-api.fly.dev/api'
  : '/api';
```

Then rebuild and redeploy:
```bash
npm run build
npx wrangler pages deploy dist --project-name pdffree
```

### Step 15: Update R2 CORS with Final Domain

Now that you know your Pages URL:

1. Go to **R2 > pdffree-files > Settings > CORS policy**
2. Update `AllowedOrigins` to include your actual Pages domain
3. Save

---

## Part 3: Custom Domain (Optional)

### Step 16: Add a Custom Domain

**To Cloudflare Pages (frontend):**

1. Go to **Workers & Pages > pdffree > Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `pdffree.yourdomain.com`)
4. Follow the DNS instructions

**To Fly.io (API):**

```bash
fly certs create api.pdffree.yourdomain.com --app pdffree-api
```

Then add a CNAME record: `api.pdffree.yourdomain.com` → `pdffree-api.fly.dev`

---

## Part 4: Verify Everything Works

### Step 17: Test the Deployment

1. Open your Pages URL (e.g., `https://pdffree.pages.dev`)
2. You should see the PDFFree home page with all tools
3. Click **"Merge PDF"**
4. Upload two PDF files
5. Click **"Merge PDF"** button
6. Wait for processing
7. Download the result

### Step 18: Check Health Endpoint

```bash
curl https://pdffree-api.fly.dev/api/health
```

Should return:
```json
{"status": "ok", "queueDepth": 0, "timestamp": "..."}
```

### Step 19: Monitor Logs

```bash
# API logs
fly logs --app pdffree-api

# Worker logs
fly logs --app pdffree-worker
```

---

## Quick Reference: All Environment Variables

| Variable | Where to Get It | Used By |
|----------|----------------|---------|
| `R2_ENDPOINT` | Cloudflare Dashboard > R2 > Overview | API + Worker |
| `R2_ACCESS_KEY_ID` | Step 5 above | API + Worker |
| `R2_SECRET_ACCESS_KEY` | Step 5 above | API + Worker |
| `R2_BUCKET` | You chose it in Step 2 | API + Worker |
| `ALLOWED_ORIGINS` | Your Pages URL from Step 8 | API |
| `PORT` | Default: 8080 | API |
| `WORKER_COUNT` | Default: 4 | Worker |
| `RATE_LIMIT_PER_MIN` | Default: 10 | API |
| `MAX_CONCURRENT_PER_IP` | Default: 5 | API |

---

## Troubleshooting

### "CORS error" in browser console
- Go to R2 bucket settings and update the CORS policy with your exact Pages domain
- Make sure `ALLOWED_ORIGINS` in the API matches your frontend URL

### "Storage not configured" error
- Check that `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` are set correctly
- The endpoint format is: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### Files not being deleted automatically
- R2 lifecycle rules have a minimum of 1 day via the dashboard
- Use the wrangler CLI command from Step 3 for hourly cleanup
- As a fallback, the pre-signed download URLs expire after 1 hour anyway

### API returning 429 (Too Many Requests)
- The rate limiter is working correctly
- Default: 10 jobs per minute, 5 concurrent per IP
- Adjust `RATE_LIMIT_PER_MIN` and `MAX_CONCURRENT_PER_IP` if needed

### Worker not processing jobs
- Check worker logs: `fly logs --app pdffree-worker`
- Make sure the worker can reach the API (they share the same Fly.io internal network)
- Verify R2 credentials are set on the worker app

---

## Estimated Costs

| Service | Free Tier | Estimated Monthly (Moderate Use) |
|---------|-----------|--------------------------------|
| Cloudflare R2 | 10GB storage, 10M reads, 1M writes/mo | $0 (likely within free tier) |
| Cloudflare Pages | Unlimited sites, 500 deploys/mo | $0 |
| Cloudflare WAF | 5 custom rules on free plan | $0 |
| Fly.io | 3 shared-1x VMs, 160GB bandwidth | $0-5 (may need small VMs) |
| **Total** | | **$0-5/month** |

For a production app with significant traffic, expect $10-30/month on Fly.io for larger machines.
