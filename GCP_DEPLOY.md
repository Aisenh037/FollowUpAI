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
docker build -t us-central1-docker.pkg.dev/[PROJECT_ID]/followup-ai-repo/backend:latest ./backend

# Push to Registry
docker push us-central1-docker.pkg.dev/[PROJECT_ID]/followup-ai-repo/backend:latest
```

---

## 🚀 3. Deployment to Cloud Run

### A. Deploy Backend API
```bash
gcloud run deploy followup-api \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/followup-ai-repo/backend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --env-vars-file=./backend/.env.yaml
```

### B. Deploy Worker
Since the Worker isn't an HTTP server, we deploy it with no ingress:
```bash
gcloud run deploy followup-worker \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/followup-ai-repo/backend:latest \
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

## 🎨 5. Frontend (Vercel)
1. Push your code to a GitHub repository.
2. Link the repository to [Vercel](https://vercel.com/).
3. **Important**: Set `NEXT_PUBLIC_API_URL` to your **GCP Cloud Run URL**.
4. Deploy!

---
*Your MVP is now live on a Pro-Grade Cloud Stack!*
