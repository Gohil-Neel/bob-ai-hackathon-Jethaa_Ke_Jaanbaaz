"""
SupplyShield AI — AI Service Health Test
Verifies GET /health returns 200 with expected body.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_ok_status():
    response = client.get("/health")
    data = response.json()
    assert data["status"] == "ok"


def test_health_returns_service_name():
    response = client.get("/health")
    data = response.json()
    assert data["service"] == "supplyshield-ai-service"
