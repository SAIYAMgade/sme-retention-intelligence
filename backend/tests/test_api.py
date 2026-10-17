"""
Automated Integration Tests for FastAPI Backend Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_overview():
    response = client.get("/api/v1/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_transactions"] > 97000
    assert data["distinct_smes"] == 6000
    assert "monthly_trend" in data
    assert "tier_distribution" in data

def test_velocity_finding():
    response = client.get("/api/v1/statistics/velocity")
    assert response.status_code == 200
    data = response.json()
    assert data["risk_ratio"] > 2.0
    assert data["is_statistically_significant"] is True
    assert data["sample_counts"]["total_eligible_smes"] > 5000

def test_feature_registry():
    response = client.get("/api/v1/features/registry")
    assert response.status_code == 200
    features = response.json()
    assert len(features) == 44, f"Feature registry must have exactly 44 features, found {len(features)}"

def test_smes_pagination():
    response = client.get("/api/v1/smes?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["total"] == 6000

def test_prioritization_summary():
    response = client.get("/api/v1/prioritization/summary")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tiers"]) == 3
    assert data["total_smes"] == 6000
    assert data["total_monthly_exposure_at_risk"] > 0
