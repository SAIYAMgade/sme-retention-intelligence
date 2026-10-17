# ==============================================================================
# SME Retention Intelligence - Production Container for Render
# ==============================================================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV PORT=8000

# Install runtime dependencies (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and packaging tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirements and install dependencies in bounded memory stages
COPY requirements.txt .
RUN pip install --no-cache-dir numpy>=1.26.0,<2.0.0 scipy>=1.12.0 pandas>=2.2.0 scikit-learn>=1.4.0 && \
    pip install --no-cache-dir -r requirements.txt

# Copy application directories and pre-built frontend distribution
COPY analytics/ ./analytics/
COPY backend/ ./backend/
COPY sql/ ./sql/
COPY docs/ ./docs/
COPY reports/ ./reports/
COPY models/ ./models/
COPY data/ ./data/
COPY frontend/dist/ ./frontend/dist/

# Execute analytical pipeline to generate reproducible dataset (>97k records) and sqlite database
RUN python analytics/run_pipeline.py

# Expose Render container port
EXPOSE 8000

# Launch FastAPI with dynamic Render PORT injection
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
