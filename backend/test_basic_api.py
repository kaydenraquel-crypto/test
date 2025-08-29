"""
Basic API endpoint tests for NovaSignal backend
"""
import pytest
from unittest.mock import patch, AsyncMock


class TestHistoryEndpoint:
    """Test the /api/history endpoint"""
    
    def test_history_endpoint_crypto(self, client):
        """Test history endpoint with crypto market"""
        # This will fail if connectors are not available, but should not crash
        response = client.get("/api/history?symbol=BTC/USD&market=crypto&days=1")
        
        # Accept both success and error responses (since we may not have API keys)
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "ohlc" in data
            assert "symbol" in data
            assert "market" in data
            assert data["symbol"] == "BTC/USD"
            assert data["market"] == "crypto"
    
    def test_history_endpoint_stocks(self, client):
        """Test history endpoint with stocks market"""
        response = client.get("/api/history?symbol=AAPL&market=stocks&days=1")
        
        # Accept both success and error responses
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "ohlc" in data
            assert "symbol" in data
            assert "market" in data
            assert data["symbol"] == "AAPL"
            assert data["market"] == "stocks"
    
    def test_history_endpoint_invalid_params(self, client):
        """Test history endpoint with invalid parameters"""
        # Missing symbol
        response = client.get("/api/history")
        assert response.status_code == 422  # Validation error


class TestIndicatorsEndpoint:
    """Test the /api/indicators endpoint"""
    
    def test_indicators_endpoint_structure(self, client):
        """Test indicators endpoint returns expected structure"""
        request_data = {
            "symbol": "BTC/USD",
            "market": "crypto",
            "interval": 1,
            "limit": 100
        }
        
        response = client.post("/api/indicators", json=request_data)
        
        # Should return 200 even if data fetch fails
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["ohlc", "indicators", "signals", "symbol", "market", "data_points"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_indicators_endpoint_validation(self, client):
        """Test indicators endpoint validates input"""
        # Invalid request (missing required field)
        response = client.post("/api/indicators", json={})
        assert response.status_code == 422  # Validation error


class TestPredictEndpoint:
    """Test the /api/predict endpoint"""
    
    def test_predict_endpoint_structure(self, client):
        """Test predict endpoint returns expected structure"""
        request_data = {
            "symbol": "BTC/USD",
            "market": "crypto",
            "horizons": ["5m", "1h"],
            "lookback": 100
        }
        
        response = client.post("/api/predict", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "predictions" in data
        assert "engine" in data
        
        # Should indicate which prediction engine was used
        assert data["engine"] in ["torch-ml", "naive-last-close"]
    
    def test_predict_endpoint_validation(self, client):
        """Test predict endpoint validates input"""
        # Invalid request
        response = client.post("/api/predict", json={})
        assert response.status_code == 422


class TestNewsEndpoint:
    """Test the /api/news endpoint"""
    
    def test_news_endpoint_structure(self, client):
        """Test news endpoint returns expected structure"""
        response = client.get("/api/news?symbol=BTC&market=crypto")
        assert response.status_code == 200
        
        data = response.json()
        assert "news" in data
        assert isinstance(data["news"], list)


class TestLLMEndpoint:
    """Test the /api/llm/analyze endpoint"""
    
    def test_llm_analyze_endpoint_structure(self, client):
        """Test LLM analyze endpoint returns expected structure"""
        request_data = {
            "symbol": "BTC/USD",
            "market": "crypto",
            "summary": "Test summary",
            "indicators": {"rsi": 50},
            "signals": [],
            "news": []
        }
        
        response = client.post("/api/llm/analyze", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["analysis", "error", "technical_analysis", "hot_moments", 
                          "trading_recommendation", "market_outlook", "confidence_score"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_llm_scan_endpoint(self, client):
        """Test LLM market scan endpoint"""
        response = client.get("/api/llm/scan")
        assert response.status_code == 200
        
        data = response.json()
        # Should have opportunities field even if empty or if advisor unavailable
        assert "opportunities" in data or "error" in data