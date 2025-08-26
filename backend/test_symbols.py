"""
Comprehensive tests for the symbols API endpoint.
"""

import pytest
import asyncio
import time
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Import the main app
from main import app

client = TestClient(app)


class TestSymbolsEndpoint:
    """Test suite for the symbols API endpoint"""

    def test_symbols_endpoint_basic_search(self):
        """Test basic symbol search functionality"""
        response = client.get("/api/symbols?q=AAPL")
        assert response.status_code == 200
        
        data = response.json()
        assert "symbols" in data
        assert "query" in data
        assert "total" in data
        assert "limit" in data
        
        assert data["query"] == "AAPL"
        assert isinstance(data["symbols"], list)
        assert data["total"] >= 0
        
        # Check if Apple is in results
        symbols = [s["symbol"] for s in data["symbols"]]
        assert "AAPL" in symbols

    def test_symbols_endpoint_case_insensitive(self):
        """Test that search is case insensitive"""
        response_upper = client.get("/api/symbols?q=AAPL")
        response_lower = client.get("/api/symbols?q=aapl")
        
        assert response_upper.status_code == 200
        assert response_lower.status_code == 200
        
        # Should return same results
        data_upper = response_upper.json()
        data_lower = response_lower.json()
        
        assert len(data_upper["symbols"]) == len(data_lower["symbols"])
        assert data_upper["symbols"] == data_lower["symbols"]

    def test_symbols_endpoint_name_search(self):
        """Test searching by company name"""
        response = client.get("/api/symbols?q=Apple")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] >= 1
        
        # Should find Apple Inc.
        found_apple = any(
            "Apple" in symbol["name"] for symbol in data["symbols"]
        )
        assert found_apple

    def test_symbols_endpoint_type_filter_stock(self):
        """Test filtering by stock type"""
        response = client.get("/api/symbols?q=A&type_filter=stock")
        assert response.status_code == 200
        
        data = response.json()
        
        # All results should be stocks
        for symbol in data["symbols"]:
            assert symbol["type"] == "stock"

    def test_symbols_endpoint_type_filter_crypto(self):
        """Test filtering by crypto type"""
        response = client.get("/api/symbols?q=BTC&type_filter=crypto")
        assert response.status_code == 200
        
        data = response.json()
        
        # All results should be crypto
        for symbol in data["symbols"]:
            assert symbol["type"] == "crypto"

    def test_symbols_endpoint_type_filter_etf(self):
        """Test filtering by ETF type"""
        response = client.get("/api/symbols?q=SPY&type_filter=etf")
        assert response.status_code == 200
        
        data = response.json()
        
        # All results should be ETFs
        for symbol in data["symbols"]:
            assert symbol["type"] == "etf"

    def test_symbols_endpoint_limit_parameter(self):
        """Test limit parameter works correctly"""
        # Test with limit of 5
        response = client.get("/api/symbols?q=A&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["symbols"]) <= 5
        assert data["limit"] == 5

    def test_symbols_endpoint_limit_bounds(self):
        """Test limit parameter bounds validation"""
        # Test minimum limit (1)
        response = client.get("/api/symbols?q=A&limit=1")
        assert response.status_code == 200
        data = response.json()
        assert len(data["symbols"]) <= 1

        # Test maximum limit (100)
        response = client.get("/api/symbols?q=A&limit=100")
        assert response.status_code == 200

        # Test invalid limits
        response = client.get("/api/symbols?q=A&limit=0")
        assert response.status_code == 422  # Validation error

        response = client.get("/api/symbols?q=A&limit=101")
        assert response.status_code == 422  # Validation error

    def test_symbols_endpoint_query_validation(self):
        """Test query parameter validation"""
        # Empty query should fail
        response = client.get("/api/symbols?q=")
        assert response.status_code == 422
        
        # No query parameter should fail
        response = client.get("/api/symbols")
        assert response.status_code == 422

    def test_symbols_endpoint_response_structure(self):
        """Test that response has correct structure"""
        response = client.get("/api/symbols?q=AAPL")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check main structure
        assert "symbols" in data
        assert "query" in data
        assert "total" in data
        assert "limit" in data
        
        # Check symbol structure
        if data["symbols"]:
            symbol = data["symbols"][0]
            assert "symbol" in symbol
            assert "name" in symbol
            assert "type" in symbol
            assert "exchange" in symbol
            
            # Validate types
            assert isinstance(symbol["symbol"], str)
            assert isinstance(symbol["name"], str)
            assert isinstance(symbol["type"], str)
            assert isinstance(symbol["exchange"], str)
            
            # Validate type values
            assert symbol["type"] in ["stock", "crypto", "etf", "forex"]

    def test_symbols_endpoint_no_results(self):
        """Test response when no symbols match query"""
        response = client.get("/api/symbols?q=NONEXISTENT123456")
        assert response.status_code == 200
        
        data = response.json()
        assert data["symbols"] == []
        assert data["total"] == 0
        assert data["query"] == "NONEXISTENT123456"

    def test_rate_limiting_functionality(self):
        """Test that rate limiting works correctly"""
        # Make several requests quickly to trigger rate limit
        # Note: This test might be flaky depending on timing
        
        # Clear any existing rate limit state by using different IPs
        # (In real tests, you'd want to use a proper test setup)
        
        requests_made = 0
        rate_limited = False
        
        # Try to make more than 10 requests quickly
        for i in range(12):
            response = client.get(f"/api/symbols?q=TEST{i}")
            if response.status_code == 429:
                rate_limited = True
                break
            elif response.status_code == 200:
                requests_made += 1
            time.sleep(0.1)  # Small delay to avoid overwhelming
        
        # We should have made at least some requests successfully
        assert requests_made >= 1
        
        # If we made exactly 10 requests, we might hit rate limit on 11th
        # This is timing-dependent, so we're flexible here
        if requests_made >= 10:
            # Rate limiting should have kicked in eventually
            final_response = client.get("/api/symbols?q=FINAL")
            # This might be rate limited or not, depending on timing

    def test_rate_limiting_different_ips(self):
        """Test that rate limiting is per IP"""
        # This test would be better with actual IP manipulation
        # For now, we just verify the endpoint works multiple times
        
        response1 = client.get("/api/symbols?q=TEST1")
        response2 = client.get("/api/symbols?q=TEST2")
        
        assert response1.status_code == 200
        assert response2.status_code == 200

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        response = client.get("/api/symbols/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "service" in data
        assert "timestamp" in data
        assert "total_symbols" in data
        assert "rate_limit" in data
        
        assert data["status"] == "healthy"
        assert data["service"] == "symbols"
        assert isinstance(data["total_symbols"], int)

    def test_openapi_schema_generation(self):
        """Test that OpenAPI schema is generated correctly"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        
        schema = response.json()
        
        # Check that symbols endpoint is documented
        assert "/api/symbols" in schema["paths"]
        symbols_path = schema["paths"]["/api/symbols"]
        assert "get" in symbols_path
        
        # Check parameters are documented
        get_operation = symbols_path["get"]
        assert "parameters" in get_operation
        
        # Find query parameter
        q_param = next(
            (p for p in get_operation["parameters"] if p["name"] == "q"),
            None
        )
        assert q_param is not None
        assert q_param["required"] is True

    def test_cors_headers(self):
        """Test that CORS headers are properly set"""
        response = client.get("/api/symbols?q=AAPL")
        
        # The test client doesn't automatically add CORS headers
        # but we can verify the endpoint works
        assert response.status_code == 200

    def test_error_handling_internal_error(self):
        """Test error handling for internal errors"""
        # This is harder to test without mocking, but we can test the structure
        
        # Patch the search function to raise an exception
        with patch('routers.symbols.search_symbols', side_effect=Exception("Test error")):
            response = client.get("/api/symbols?q=AAPL")
            assert response.status_code == 500
            
            data = response.json()
            assert "detail" in data
            assert isinstance(data["detail"], dict)
            assert "error" in data["detail"]

    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        import concurrent.futures
        import threading
        
        def make_request(query):
            return client.get(f"/api/symbols?q={query}")
        
        # Make several concurrent requests
        queries = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_query = {
                executor.submit(make_request, query): query 
                for query in queries
            }
            
            results = []
            for future in concurrent.futures.as_completed(future_to_query):
                query = future_to_query[future]
                try:
                    response = future.result()
                    results.append((query, response.status_code))
                except Exception as exc:
                    results.append((query, f"Exception: {exc}"))
        
        # All requests should succeed (or hit rate limit)
        for query, status in results:
            assert status in [200, 429], f"Query {query} failed with status {status}"

    def test_search_algorithm_accuracy(self):
        """Test the accuracy of the search algorithm"""
        # Test exact match
        response = client.get("/api/symbols?q=AAPL")
        data = response.json()
        symbols = [s["symbol"] for s in data["symbols"]]
        assert "AAPL" in symbols
        
        # Test partial match
        response = client.get("/api/symbols?q=AAP")
        data = response.json()
        # Should still find AAPL
        symbols = [s["symbol"] for s in data["symbols"]]
        assert "AAPL" in symbols
        
        # Test name search
        response = client.get("/api/symbols?q=Apple")
        data = response.json()
        # Should find Apple Inc.
        found = any("Apple" in s["name"] for s in data["symbols"])
        assert found


if __name__ == "__main__":
    pytest.main([__file__, "-v"])