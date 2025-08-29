# NovaSignal Backend Testing Guide

## Overview
This document describes the testing infrastructure for the NovaSignal backend API.

## Fixed Issues
- ✅ **CRITICAL**: Resolved `langsmith` dependency conflict causing `TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'`
- ✅ Removed problematic `langchain` dependencies that were not used in the codebase
- ✅ Configured proper pytest setup with async support
- ✅ Created comprehensive test suite covering all API endpoints

## Test Structure

### Core Test Files
- `test_health.py` - Health endpoint tests
- `test_basic_api.py` - All API endpoint tests organized by functionality
- `conftest.py` - Shared pytest fixtures and configuration

### Configuration Files
- `pytest.ini` - Pytest configuration with markers and settings
- `pyproject.toml` - Modern Python project configuration including coverage
- `requirements-test.txt` - Testing-specific dependencies

## Running Tests

### Basic Test Run
```bash
# Run all core tests
python -m pytest test_health.py test_basic_api.py -v

# Or use the custom runner
python test_runner.py
```

### With Coverage
```bash
python test_runner.py coverage
```

### All Tests (including legacy)
```bash
python test_runner.py all
```

## Test Coverage

Current test coverage includes:

### Health Endpoints
- `/health` - Basic health check
- Response time validation
- Structure validation

### API Endpoints
- `/api/history` - Historical data (crypto & stocks)
- `/api/indicators` - Technical indicators
- `/api/predict` - Price predictions
- `/api/news` - News data
- `/api/llm/analyze` - LLM analysis
- `/api/llm/scan` - Market scanning

### Validation Tests
- Request validation
- Response structure validation
- Error handling

## Dependencies

### Core Testing Dependencies
```bash
pip install pytest==8.4.1 pytest-asyncio==0.24.0 pytest-cov==6.0.0
```

### Installation
```bash
# Install testing dependencies
pip install -r requirements-test.txt

# Or install individually
pip install pytest pytest-asyncio pytest-cov httpx
```

## CI/CD Integration

The testing infrastructure is designed to work in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Backend Tests
  run: |
    cd backend
    pip install -r requirements-test.txt
    python test_runner.py
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Async Test Issues**: Make sure `pytest-asyncio` is installed
3. **Coverage Issues**: Use `python test_runner.py coverage` instead of direct pytest-cov

### Dependency Conflicts
If you encounter dependency conflicts:
1. Check that `langchain` and `langsmith` are not installed
2. Use the clean `requirements.txt` provided
3. Create a fresh virtual environment if needed

## Test Results

Last successful test run:
- ✅ 14 tests passed
- ⚠️ 2 warnings (non-critical)
- 🕒 ~13-14 seconds execution time
- 📊 All critical API endpoints covered