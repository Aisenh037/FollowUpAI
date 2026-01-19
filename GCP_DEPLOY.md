# ☸️ GCP Deployment Guide: "Hybrid Pro" Strategy

This guide explains how to deploy the FollowUpAI Backend and Workers to **Google Cloud Platform (GCP)** while keeping the Frontend on **Vercel**.

## 🏗️ 1. Infrastructure Preparation

### A. Create a GCP Project
1. Go to the [GCP Console](https://console.cloud.google.com/).
2. Create a new project called `followup-ai`.
3. Enable **Billing** (Note: GCP provides a \$300 free credit for new accounts).

### B. Enable Required APIs
Run these commands in your local terminal (after installing [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)):
```bash
gcloud services enable artifactregistry.googleapis.com \
                       run.googleapis.com \
                       vpcaccess.googleapis.com
```

### C. Create Artifact Registry
> **DevOps Concept: Immutable Artifacts**
> In a professional pipeline, we never deploy "code" directly. We build "Artifacts" (Docker Images) that are versioned and immutable. This ensures that what you tested in Staging is *bit-for-bit identical* to what runs in Production.

Create a repository for your Docker images:
```bash
gcloud artifacts repositories create followup-ai-repo \
    --repository-format=docker \
    --location=us-central1
```

---

## 📦 2. Containerization & Pushing

### A. Authenticate Docker
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### B. Build and Push Backend
```bash
# Tag the image
docker build -t us-central1-docker.pkg.dev/true-alliance-483614-k6/followup-ai-repo/backend:latest ./backend

# Push to Registry
docker push us-central1-docker.pkg.dev/true-alliance-483614-k6/followup-ai-repo/backend:latest
```

---

## 🚀 3. Deployment to Cloud Run
> **DevOps Concept: Stateless Compute (CaaS)**
> Cloud Run is "Containers as a Service". It spins up your container only when a request comes in (scaling from 0 to N). For this to work, your app must be **Stateless**—meaning it saves no data to the local disk, but instead uses external services like Postgres and Redis.

### A. Deploy Backend API
```bash
gcloud run deploy followup-api \
    --image us-central1-docker.pkg.dev/true-alliance-483614-k6/followup-ai-repo/backend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --env-vars-file=./backend/.env.yaml
```

### B. Deploy Worker
Since the Worker isn't an HTTP server, we deploy it with no ingress:
```bash
gcloud run deploy followup-worker \
    --image us-central1-docker.pkg.dev/true-alliance-483614-k6/followup-ai-repo/backend:latest \
    --platform managed \
    --region us-central1 \
    --no-allow-unauthenticated \
    --command="taskiq","worker","worker:broker","worker"
```

---

## 🏢 4. Database & Redis (Free Tiers)

For an industry-grade MVP with zero cost, use these providers:
- **PostgreSQL**: [Neon.tech](https://neon.tech/) or [Supabase](https://supabase.com/).
- **Redis Cloud**: [Redis.com](https://redis.com/try-free/).

Copy the connection strings from these services and update your `env-vars-file` on GCP.

---

## 🎨 5. Frontend Options (Choose One)

### Option A: Vercel (Recommended for Performance)
1. Push code to GitHub.
2. Link repo to Vercel.
3. Set `NEXT_PUBLIC_API_URL` to your Backend Cloud Run URL.

### Option B: Google Cloud Run (Recommended for "DevOps Flex")
Since we created a professional `Dockerfile` for the frontend, you can deploy it to GCP just like the backend!

1. **Build & Push**:
```bash
docker build -t us-central1-docker.pkg.dev/true-alliance-483614-k6/followup-ai-repo/frontend:latest ./frontend
docker push us-central1-docker.pkg.dev/[PROJECT_ID]/followup-ai-repo/frontend:latest
```

2. **Deploy**:
```bash
gcloud run deploy followup-frontend \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/followup-ai-repo/frontend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3000
```

3. **Configure**:
   - Go to Cloud Run Console > followup-frontend > Edit & Deploy New Revision.
   - Add Environment Variable: `NEXT_PUBLIC_API_URL` = [Your Backend Service URL].

---
*Your MVP is now live on a Pro-Grade Cloud Stack!*
