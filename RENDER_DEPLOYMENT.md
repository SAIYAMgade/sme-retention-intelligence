# Deploying SME Retention Intelligence to Render

This platform is configured for zero-friction deployment to [Render](https://render.com).

---

## Pre-Push Checklist

All sensitive, temporary, cache, and platform files are excluded via `.gitignore`:
- Virtual environments (`.venv/`, `venv/`)
- Node modules (`node_modules/`, `frontend/node_modules/`)
- Python bytecode and testing caches (`__pycache__/`, `.pytest_cache/`, `*.pyc`)
- Local SQLite databases (reproduced deterministically on Render during build)
- OS files (`.DS_Store`, `Thumbs.db`)
- Environment files (`.env`, `.env.local`)

---

## Step 1: Push Code to GitHub

```bash
# 1. Initialize git (already initialized in this repo)
git add .
git commit -m "feat: prepare project for Render deployment"

# 2. Add your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git branch -M master
git push -u origin master
```

---

## Step 2: Deploy on Render

### Method A: 1-Click Blueprint (Recommended)

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect [`render.yaml`](./render.yaml).
5. Click **Apply**.
6. Render builds the unified multi-stage Docker container:
   - Builds the React 18 frontend (`npm run build`).
   - Installs Python 3.11 scientific packages (`scikit-learn`, `fastapi`, `statsmodels`, etc.).
   - Executes the analytics pipeline to generate the 130k+ transaction dataset and train holdout models (`python analytics/run_pipeline.py`).
   - Launches the FastAPI production server on Render's assigned port.

Your application will be live at `https://sme-retention-intelligence.onrender.com`!

---

### Method B: Manual Web Service (Docker)

If you prefer setting up manually without a Blueprint:
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. In settings:
   - **Name:** `sme-retention-intelligence`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free`
4. Click **Create Web Service**.

---

### Method C: Separate Frontend & Backend (Optional)

If you want the API and frontend hosted on separate Render services:

#### 1. Backend Web Service (Python)
- **Environment:** `Python 3`
- **Build Command:** `./build.sh` (or `pip install -r requirements.txt && python analytics/run_pipeline.py`)
- **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/v1/health`

#### 2. Frontend Static Site (Node)
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:**
  - `VITE_API_URL`: URL of your backend (e.g. `https://sme-backend.onrender.com`)
- **Redirects/Rewrites:**
  - Add rewrite rule: Source: `/*`, Destination: `/index.html` (Rewrite)

---

## Live URL Verification

Once deployed:
1. **Landing Page:** `https://<your-app>.onrender.com/` (Cinematic 3D experience)
2. **Analytics Dashboard:** `https://<your-app>.onrender.com/overview`
3. **Interactive API Documentation:** `https://<your-app>.onrender.com/docs`
4. **Health Check:** `https://<your-app>.onrender.com/api/v1/health`
