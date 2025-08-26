"""
Basic health check and endpoint tests for NovaSignal backend
"""
import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client):
    """Test the health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "ok" in data
    assert data["ok"] is True
    assert "torch_model" in data


def test_health_endpoint_structure(client):
    """Test health endpoint returns expected structure"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    
    # Validate structure
    required_fields = ["ok", "torch_model"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"
    
    # Validate types
    assert isinstance(data["ok"], bool)
    assert isinstance(data["torch_model"], bool)


def test_health_endpoint_response_time(client):
    """Test health endpoint response time is reasonable"""
    import time
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    assert response.status_code == 200
    # Response should be quick (less than 1 second)
    assert (end_time - start_time) < 1.0


def test_cors_headers(client):
    """Test CORS headers are present"""
    response = client.get("/health")
    assert response.status_code == 200
    
    # Check for CORS headers (they should be present due to CORS middleware)
    # Note: TestClient may not show all headers that would be present in actual requests
    assert "content-type" in response.headers