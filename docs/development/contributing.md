# Contributing to NovaSignal

Thank you for your interest in contributing to NovaSignal! This guide will help you get started with contributing to our professional trading platform.

## 🤝 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **🐛 Bug Reports** - Help us identify and fix issues
- **✨ Feature Requests** - Suggest new functionality
- **📝 Documentation** - Improve guides and API docs
- **🔧 Code Contributions** - Bug fixes and new features
- **🎨 UI/UX Improvements** - Design and usability enhancements
- **⚡ Performance Optimizations** - Speed and efficiency improvements
- **🧪 Testing** - Automated tests and quality assurance

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** with clear commits
5. **Test your changes** thoroughly
6. **Submit a pull request** with detailed description

## 🏗️ Development Setup

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** and pip
- **Git** for version control
- **VS Code** (recommended) with extensions

### Local Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/NovaSignal_v0_2.git
cd NovaSignal_v0_2

# Backend setup
cd backend
python -m venv .venv
.venv/Scripts/activate  # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# Frontend setup
cd ../frontend
npm install
npm install --save-dev @types/react @testing-library/react  # Dev dependencies

# Environment setup
cp backend/.env.example backend/.env
# Add your API keys and configuration
```

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.flake8",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 📋 Coding Standards

### Python (Backend)

#### Code Style
- **Black** for code formatting
- **Flake8** for linting
- **Type hints** for all function parameters and return types
- **Docstrings** for all public functions and classes

```python
# Good example
async def fetch_historical_data(
    symbol: str,
    interval: int,
    days: int,
    provider: str = "auto"
) -> List[CandlestickData]:
    """
    Fetch historical candlestick data for a symbol.
    
    Args:
        symbol: Trading symbol (e.g., 'BTCUSDT')
        interval: Time interval in minutes
        days: Number of days to fetch
        provider: Data provider ('binance', 'alpaca', 'auto')
    
    Returns:
        List of candlestick data points
        
    Raises:
        APIError: When external API request fails
        ValidationError: When parameters are invalid
    """
    # Implementation here
```

#### File Structure
```python
# Import order: standard library, third-party, local
import asyncio
import json
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models.market_data import CandlestickData
from ..connectors.base import DataConnector
```

### JavaScript/React (Frontend)

#### Code Style
- **Prettier** for code formatting
- **ESLint** for linting
- **Functional components** with hooks
- **PropTypes** or **TypeScript** for type checking

```javascript
// Good example
import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

/**
 * Symbol selector component with search and filtering
 * @param {Object} props - Component props
 * @param {string} props.selectedSymbol - Currently selected symbol
 * @param {Function} props.onSymbolChange - Symbol change callback
 * @param {Array} props.symbols - Available symbols
 */
const SymbolSelector = ({ selectedSymbol, onSymbolChange, symbols }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredSymbols = useCallback(() => {
    return symbols.filter(symbol =>
      symbol.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [symbols, searchTerm])
  
  return (
    <div className="symbol-selector">
      {/* Component implementation */}
    </div>
  )
}

SymbolSelector.propTypes = {
  selectedSymbol: PropTypes.string.isRequired,
  onSymbolChange: PropTypes.func.isRequired,
  symbols: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default SymbolSelector
```

### Git Commit Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>[optional scope]: <description>

# Types:
feat: add symbol search autocomplete
fix: resolve chart spacing issue on mobile
docs: update API documentation
style: format code with prettier
refactor: extract chart utilities to separate module
test: add unit tests for WebSocket connection
chore: update dependencies
perf: optimize chart rendering performance

# Examples:
feat(frontend): add performance monitoring dashboard
fix(backend): handle WebSocket reconnection properly
docs(api): add examples for historical data endpoint
test(charts): add integration tests for spacing manager
```

## 🧪 Testing Guidelines

### Frontend Testing

#### Unit Tests (Jest + React Testing Library)
```javascript
// components/__tests__/SymbolSelector.test.js
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SymbolSelector from '../SymbolSelector'

describe('SymbolSelector', () => {
  const mockSymbols = [
    { value: 'BTCUSDT', label: 'BTC/USDT', category: 'Crypto' },
    { value: 'ETHUSDT', label: 'ETH/USDT', category: 'Crypto' }
  ]
  
  test('renders symbol search input', () => {
    render(
      <SymbolSelector
        selectedSymbol="BTCUSDT"
        onSymbolChange={jest.fn()}
        symbols={mockSymbols}
      />
    )
    
    expect(screen.getByPlaceholderText('Search symbols...')).toBeInTheDocument()
  })
  
  test('filters symbols based on search input', () => {
    const onSymbolChange = jest.fn()
    render(
      <SymbolSelector
        selectedSymbol=""
        onSymbolChange={onSymbolChange}
        symbols={mockSymbols}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search symbols...')
    fireEvent.change(searchInput, { target: { value: 'eth' } })
    
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.queryByText('BTC/USDT')).not.toBeInTheDocument()
  })
})
```

#### Integration Tests
```javascript
// __tests__/chart-integration.test.js
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from '../hooks/useWebSocket'

describe('Chart Integration', () => {
  test('WebSocket connection and data flow', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000/test'))
    
    await act(async () => {
      // Test WebSocket connection and message handling
    })
    
    expect(result.current.isConnected).toBe(true)
  })
})
```

### Backend Testing

#### Unit Tests (pytest)
```python
# tests/test_connectors.py
import pytest
from unittest.mock import AsyncMock, patch

from connectors.crypto_binance import BinanceConnector

@pytest.mark.asyncio
async def test_fetch_historical_data():
    """Test historical data fetching from Binance."""
    connector = BinanceConnector()
    
    with patch('aiohttp.ClientSession.get') as mock_get:
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'data': [[1234567890, '50000', '51000', '49000', '50500', '100']]
        }
        mock_get.return_value.__aenter__.return_value = mock_response
        
        result = await connector.fetch_historical_data('BTCUSDT', 60, 1)
        
        assert len(result) == 1
        assert result[0]['open'] == 50000
        assert result[0]['close'] == 50500

@pytest.mark.asyncio
async def test_websocket_connection():
    """Test WebSocket connection handling."""
    # WebSocket connection test implementation
    pass
```

#### API Tests (pytest + httpx)
```python
# tests/test_api.py
import pytest
from httpx import AsyncClient

from main import app

@pytest.mark.asyncio
async def test_get_historical_data():
    """Test historical data API endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/api/history",
            params={
                "symbol": "BTCUSDT",
                "market": "crypto",
                "interval": 60,
                "days": 1
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "ohlc" in data
        assert len(data["ohlc"]) > 0
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test                     # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Backend tests
cd backend
pytest                       # Run all tests
pytest -v                    # Verbose output
pytest --cov=.              # Coverage report
pytest -k "test_api"        # Run specific tests
```

## 📊 Performance Guidelines

### Frontend Performance

#### Chart Optimization
```javascript
// Use memoization for expensive calculations
const processedData = useMemo(() => {
  return rawData.map(transformDataPoint)
}, [rawData])

// Debounce user input
const debouncedSearch = useCallback(
  debounce((searchTerm) => {
    performSearch(searchTerm)
  }, 300),
  []
)

// Virtualize large lists
const VirtualizedSymbolList = ({ symbols }) => {
  // Use react-window or similar for large datasets
}
```

#### Memory Management
```javascript
// Clean up timers and subscriptions
useEffect(() => {
  const timer = setInterval(updatePerformanceMetrics, 1000)
  
  return () => {
    clearInterval(timer)
  }
}, [])

// Avoid memory leaks in async operations
useEffect(() => {
  let isCancelled = false
  
  async function fetchData() {
    const data = await apiCall()
    if (!isCancelled) {
      setData(data)
    }
  }
  
  fetchData()
  
  return () => {
    isCancelled = true
  }
}, [])
```

### Backend Performance

#### Async Best Practices
```python
# Use async/await properly
async def process_multiple_symbols(symbols: List[str]) -> List[dict]:
    tasks = [fetch_symbol_data(symbol) for symbol in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if not isinstance(r, Exception)]

# Connection pooling
async with aiohttp.ClientSession(
    connector=aiohttp.TCPConnector(limit=100)
) as session:
    # Use shared session for multiple requests
```

#### Caching Strategy
```python
# Use appropriate cache levels
@lru_cache(maxsize=128)
def calculate_technical_indicators(data_hash: str) -> dict:
    # Expensive calculation cached in memory
    
# Redis for distributed caching
async def get_cached_data(key: str) -> Optional[dict]:
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)
    return None
```

## 🔍 Code Review Process

### Before Submitting

1. **Self-review your code** - Check for obvious issues
2. **Run all tests** - Ensure nothing is broken
3. **Update documentation** - Include relevant docs
4. **Check performance** - Monitor for regressions
5. **Lint and format** - Follow coding standards

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)
```

### Review Criteria

Reviewers will check for:

- **Functionality** - Does it work as intended?
- **Code Quality** - Is it readable and maintainable?
- **Performance** - Any negative impact?
- **Testing** - Adequate test coverage?
- **Documentation** - Changes documented?
- **Security** - No security vulnerabilities?

## 🐛 Bug Reporting

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10, macOS, Ubuntu]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - NovaSignal Version [e.g. v0.2.1]

**Additional context**
Add any other context about the problem here.

**Console logs**
Include relevant browser console output or backend logs.
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.

**Implementation ideas**
If you have ideas about how to implement this, share them here.
```

## 📚 Documentation Guidelines

### Writing Style
- **Clear and concise** - Easy to understand
- **Examples included** - Show, don't just tell
- **Up-to-date** - Keep in sync with code changes
- **Accessible** - Consider different skill levels

### Documentation Types

#### API Documentation
```python
def fetch_historical_data(symbol: str, interval: int) -> List[dict]:
    """
    Fetch historical candlestick data.
    
    Args:
        symbol: Trading symbol (e.g., 'BTCUSDT')
        interval: Time interval in minutes (1, 5, 15, 60, 240, 1440)
    
    Returns:
        List of candlestick data dictionaries with keys:
        - timestamp: Unix timestamp
        - open: Opening price
        - high: Highest price
        - low: Lowest price
        - close: Closing price
        - volume: Trading volume
    
    Raises:
        APIError: When external API request fails
        ValidationError: When parameters are invalid
    
    Example:
        >>> data = fetch_historical_data('BTCUSDT', 60)
        >>> print(data[0])
        {
            'timestamp': 1234567890,
            'open': 50000.0,
            'high': 51000.0,
            'low': 49000.0,
            'close': 50500.0,
            'volume': 1000.0
        }
    """
```

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

1. **Update version numbers** in package.json and setup.py
2. **Update CHANGELOG.md** with new features and fixes
3. **Run full test suite** and ensure all tests pass
4. **Build and test** production builds
5. **Create release notes** with highlights
6. **Tag release** in Git
7. **Deploy to staging** for final testing
8. **Deploy to production**
9. **Announce release** to users

## 🤔 Questions?

If you have questions about contributing:

1. **Check existing documentation** - Your question might be answered
2. **Search issues** - Someone might have asked before
3. **Ask in discussions** - General questions about contributing
4. **Open an issue** - Specific bugs or feature requests
5. **Join our Discord** - Real-time community support

## 🙏 Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Special thanks** in documentation

Thank you for helping make NovaSignal better! 🚀