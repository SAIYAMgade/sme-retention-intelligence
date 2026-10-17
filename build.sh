#!/usr/bin/env bash
# ==============================================================================
# SME Retention Intelligence - Render Native Build Script
# ==============================================================================
set -o errexit

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Running reproducible analytics pipeline (seed 42)..."
python analytics/run_pipeline.py

echo "==> Build completed successfully!"
