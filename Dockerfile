# ==============================================================================
# SME Retention Intelligence - Multi-Stage Production Container for Render
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the React 18 + Vite + Tailwind Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Python 3.11 Analytics & FastAPI Backend
# ------------------------------------------------------------------------------
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install minimal build tools for scientific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application directories
COPY analytics/ ./analytics/
COPY backend/ ./backend/
COPY sql/ ./sql/
COPY docs/ ./docs/
COPY reports/ ./reports/
COPY models/ ./models/
COPY data/ ./data/

# Copy built frontend assets into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Execute pipeline to generate reproducible dataset (>97k records) and train models
RUN python analytics/run_pipeline.py

# Expose Render container port
EXPOSE 8000

# Launch FastAPI with dynamic Render PORT injection
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
