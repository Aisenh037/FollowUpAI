# 🚀 Simple Deployment Guide: Render & Vercel

This guide provides a simplified deployment strategy using **Render** for the Backend/Database and **Vercel** for the Frontend. This approach bypasses local Docker issues by letting the cloud platforms build your application.

---

## 📋 Prerequisites

1.  **Code on GitHub**: Ensure your latest code is pushed to your GitHub repository: `Aisenh037/FollowUpAI`.
2.  **Accounts**:
    *   [Sign up for Render](https://dashboard.render.com/)
    *   [Sign up for Vercel](https://vercel.com/)

---

## 🛠️ Part 1: Backend Deployment (Render)

We will deploy the Database, Redis, and the API Service.

### Step 1: Create PostgreSQL Database
1.  On the Render Dashboard, click **New +** -> **PostgreSQL**.
2.  **Name**: `followup-db`
3.  **Region**: `Oregon (US West)` (or closest to you).
4.  **Free Tier**: Select "Free".
5.  Click **Create Database**.
6.  **Wait** for it to be created.
7.  Copy the **Internal Database URL** (we'll use this later).

### Step 2: Create Redis (For Background Tasks)
1.  Click **New +** -> **Redis**.
2.  **Name**: `followup-redis`
3.  **Region**: Same as Database (`Oregon`).
4.  **Free Tier**: Select "Free".
5.  Click **Create Redis**.
6.  Copy the **Internal Redis URL** (e.g., `redis://red-xxxx:6379`).

### Step 3: Create Web Service (The Python API)
1.  Click **New +** -> **Web Service**.
2.  Connect your GitHub repository (`Aisenh037/FollowUpAI`).
3.  **Name**: `followup-backend`
4.  **Root Directory**: `backend` (⚠️ Important!)
5.  **Environment**: `Python 3`
6.  **Region**: Same as Database (`Oregon`).
7.  **Build Command**: `pip install -r requirements.txt`
8.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
9.  **Free Tier**: Select "Free".

### Step 4: Environment Variables
Scroll down to "Environment Variables" and add these keys:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.5` | Ensures compatibility. |
| `ENV` | `production` | |
| `DATABASE_URL` | *(Paste Internal DB URL)* | From Step 1. |
| `REDIS_URL` | *(Paste Internal Redis URL)* | From Step 2. |
| `SECRET_KEY` | *(Any long random string)* | Required for security. |
| `GROQ_API_KEY` | *(Your Groq Key)* | Required for AI. |
| `RESEND_API_KEY` | *(Your Resend Key)* | Required for Emails. |
| `RESEND_FROM_EMAIL`| `FollowUpAI <onboarding@resend.dev>`| Or your verified domain. |

*(Optional keys if you have them: `TAVILY_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, etc.)*

10. Click **Create Web Service**.
11. **Wait** for the build to finish. Once you see "Your service is live", copy the **Service URL** (e.g., `https://followup-backend.onrender.com`).

---

## 🎨 Part 2: Frontend Deployment (Vercel)

Now we connect the User Interface.

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2.  Import your GitHub repository (`FollowUpAI`).
3.  **Framework Preset**: It should auto-detect `Next.js`.
4.  **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   **Name**: `NEXT_PUBLIC_API_URL`
    *   **Value**: *(Paste your Render Backend URL from Part 1)*
        *   ⚠️ **Important**: Remove any trailing slash `/` at the end.
        *   Example: `https://followup-backend.onrender.com`
6.  Click **Deploy**.

---

## ✅ Part 3: Final Verification

1.  Open your Vercel App URL (e.g., `https://followup-ai.vercel.app`).
2.  Try to **Login/Register**. This checks if the Frontend can talk to the Backend and the Backend can talk to the Database.
3.  Check the **Render Logs** if anything fails.

**🎉 You are now deployed!**
