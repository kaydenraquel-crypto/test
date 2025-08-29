"""
Pytest configuration and shared fixtures for NovaSignal backend tests
"""
import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    """Create a TestClient for synchronous tests"""
    from main import app
    return TestClient(app)

@pytest.fixture
async def async_client():
    """Create an AsyncClient for asynchronous tests"""
    from main import app
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac