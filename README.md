# 🚀 NovaSignal Trading Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/username/novasignal/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/username/novasignal/actions)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#)

> **Professional Trading Platform** with Advanced Technical Analysis, AI-Powered Insights, Real-Time Market Data, and Automated Updates

**NovaSignal** is an enterprise-grade trading platform that combines sophisticated technical analysis, artificial intelligence, and professional deployment tools to deliver a complete trading solution for modern traders and institutions.

![NovaSignal Dashboard](./docs/images/dashboard-preview.png)

## 🚀 Features

### 📊 **Advanced Charting**
- **Real-time candlestick charts** with professional spacing system
- **Multiple timeframes** (1m, 5m, 15m, 1h, 4h, 1d)
- **Interactive chart controls** with zoom and pan
- **Responsive design** for desktop, tablet, and mobile

### 🔍 **Smart Symbol Search**
- **Advanced search & filtering** with auto-complete
- **Category filters** (Crypto, Stocks, Favorites)
- **Keyboard navigation** with arrow keys and shortcuts
- **Favorites management** with star system
- **16+ supported symbols** including major crypto and stocks

### 📈 **Technical Analysis**
- **7+ Technical Indicators** (RSI, MACD, Bollinger Bands, SMA, EMA, Stochastic, Williams %R)
- **Real-time signal generation** with buy/sell alerts
- **Customizable indicator parameters**
- **Multi-timeframe analysis**

### ⚡ **Performance Monitoring**
- **Real-time FPS tracking** with visual indicators
- **Memory usage monitoring** 
- **API latency measurement**
- **Chart render performance** analysis
- **Smart performance alerts** with optimization tips

### 🔄 **Real-Time Data**
- **WebSocket connections** with auto-reconnection
- **Live price updates** with sub-second latency
- **Exponential backoff** retry logic
- **Connection status indicators**

### 💾 **Data Management**
- **Intelligent caching** with LRU eviction
- **Data export** (CSV, PDF, PNG)
- **Historical data** with 1-day lookback
- **Multiple data providers** (Binance, Alpha Vantage)

### ⌨️ **Power User Features**
- **Keyboard shortcuts** for all major functions
- **Customizable workspace** 
- **Portfolio tracking** with P&L calculations
- **Comprehensive logging** and analytics
- **Error boundaries** with graceful error handling

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js 18+** 
- **Python 3.8+**
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/NovaSignal_v0_2.git
   cd NovaSignal_v0_2
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv .venv
   .venv/Scripts/activate  # On Windows
   # source .venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Backend - create .env file
   cp .env.example .env
   # Add your API keys for data providers
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   .venv/Scripts/python.exe -m uvicorn main:app --reload --port 8000
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev -- --port 3003
   ```

6. **Open Application**
   ```
   http://localhost:3003
   ```

## 📚 Documentation

### User Guides
- [**Getting Started Guide**](./docs/user-guide/getting-started.md) - First steps with NovaSignal
- [**Trading Guide**](./docs/user-guide/trading-guide.md) - How to analyze markets and trade
- [**Advanced Features**](./docs/user-guide/advanced-features.md) - Power user tips and tricks
- [**Keyboard Shortcuts**](./docs/user-guide/keyboard-shortcuts.md) - Complete shortcuts reference

### Technical Documentation
- [**API Reference**](./docs/api/README.md) - Backend API documentation
- [**Component Library**](./docs/components/README.md) - Frontend component documentation
- [**Architecture Overview**](./docs/technical/architecture.md) - System design and architecture
- [**Performance Guide**](./docs/technical/performance.md) - Optimization techniques

### Development
- [**Contributing Guide**](./docs/development/contributing.md) - How to contribute to NovaSignal
- [**Development Setup**](./docs/development/setup.md) - Development environment setup
- [**Testing Guide**](./docs/development/testing.md) - Running and writing tests
- [**Deployment Guide**](./docs/development/deployment.md) - Production deployment

## ⌨️ Quick Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+E` | Export data |
| `F5` or `Ctrl+R` | Refresh data |
| `F1` or `Ctrl+?` | Show help |
| `Arrow Keys` | Navigate search results |
| `Enter` | Select symbol |
| `Escape` | Close dropdowns |

## 🎯 Supported Markets & Symbols

### Cryptocurrencies
- **Bitcoin (BTC/USDT)** - The original cryptocurrency
- **Ethereum (ETH/USDT)** - Smart contract platform
- **Cardano (ADA/USDT)** - Proof-of-stake blockchain
- **Binance Coin (BNB/USDT)** - Exchange token
- **Solana (SOL/USDT)** - High-performance blockchain
- **Ripple (XRP/USDT)** - Cross-border payments
- **Polkadot (DOT/USDT)** - Multi-chain protocol
- **Chainlink (LINK/USDT)** - Decentralized oracles
- **Polygon (MATIC/USDT)** - Layer 2 scaling
- **Litecoin (LTC/USDT)** - Digital silver

### Stocks
- **Apple (AAPL)** - Technology hardware
- **Google (GOOGL)** - Search and cloud services
- **Microsoft (MSFT)** - Software and cloud
- **Amazon (AMZN)** - E-commerce and cloud
- **Tesla (TSLA)** - Electric vehicles
- **NVIDIA (NVDA)** - Graphics and AI chips

## 🔧 Configuration

### Performance Settings
```javascript
// Chart spacing configuration
const chartConfig = {
  baseSpacing: 35,
  minSpacing: 20,
  maxSpacing: 60,
  rightOffset: 30,
  autoResize: true
}
```

### Data Provider Settings
```python
# Backend configuration
PROVIDERS = {
    "crypto": "binance",
    "stocks": "alpha_vantage",
    "fallback": "auto"
}
```

## 📊 Performance Metrics

| Metric | Target | Good | Warning |
|--------|--------|------|---------|
| **FPS** | >55 | >30 | <30 |
| **Memory** | <50MB | <100MB | >100MB |
| **API Latency** | <100ms | <500ms | >500ms |
| **Chart Render** | <10ms | <30ms | >30ms |

## 🐛 Troubleshooting

### Common Issues

**Chart not loading**
- Check WebSocket connection status
- Verify backend is running on port 8000
- Clear browser cache and reload

**Performance issues**
- Enable performance monitoring
- Check memory usage in performance panel
- Reduce chart data points if needed

**API errors**
- Verify API keys in backend .env file
- Check rate limiting status
- Review error messages in browser console

### Debug Commands
```javascript
// Browser console commands
window.debugChart()           // Chart debug info
window.debugChartSpacing()    // Spacing manager info
window.forceInitChart()       // Force chart re-initialization
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
npm run build

# Backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Variables
```env
# Backend .env
ALPHA_VANTAGE_API_KEY=your_key_here
BINANCE_API_KEY=your_key_here
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/development/contributing.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TradingView Lightweight Charts** - Chart rendering engine
- **Binance API** - Cryptocurrency data
- **Alpha Vantage** - Stock market data
- **React** - Frontend framework
- **FastAPI** - Backend framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/NovaSignal_v0_2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/NovaSignal_v0_2/discussions)
- **Documentation**: [Full Documentation](./docs/README.md)

---

**Made with ❤️ by the NovaSignal Team**

*Professional trading tools for the modern trader*

---

**Note**: Project now includes component-based agents and PR overlap detection for improved development workflow.
