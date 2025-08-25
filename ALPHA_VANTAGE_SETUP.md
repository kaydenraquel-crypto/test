# Alpha Vantage Integration Setup

🔥 **Real market data and advanced technical indicators now integrated into NovaSignal!**

## Quick Start

1. **Get Your API Key**
   - Go to [Alpha Vantage](https://www.alphavantage.co/)
   - Sign up for a free account
   - Get your API key from [API Key Support](https://www.alphavantage.co/support/#api-key)

2. **Configure Environment**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env and add your key:
   # VITE_ALPHA_VANTAGE_KEY=your_actual_key_here
   ```

3. **Launch NovaSignal**
   ```bash
   npm run dev
   ```
   - Click the **🔥 Alpha Vantage** button in the top controls
   - Start exploring real market data!

## Features Included

### 📊 Real Market Data
- **Intraday Data**: 1min, 5min, 15min, 30min, 60min intervals
- **Daily/Weekly/Monthly**: Historical price data
- **Cryptocurrency**: Digital currency data (BTC, ETH, etc.)
- **Real-time Updates**: Fresh data with intelligent caching

### 📈 Advanced Technical Indicators
- **RSI** (Relative Strength Index) - Momentum oscillator
- **MACD** (Moving Average Convergence Divergence) - Trend following
- **SMA/EMA** (Simple/Exponential Moving Averages) - Trend analysis
- **Bollinger Bands** - Volatility and overbought/oversold conditions
- **Stochastic Oscillator** - Momentum indicator
- **ADX** (Average Directional Index) - Trend strength measurement

### 🏢 Fundamental Analysis
- **Company Overview**: Sector, market cap, P/E ratio, dividend yield
- **Earnings Data**: Quarterly and annual earnings information
- **Financial Ratios**: Key metrics for valuation analysis

### 📰 News & Sentiment Analysis
- **Real-time News Feed**: Latest financial news for each symbol
- **Sentiment Analysis**: AI-powered bullish/bearish sentiment scoring
- **Source Attribution**: Track news from major financial publications

## Component Architecture

### AlphaVantageService
**Location**: `src/services/alphaVantageService.js`
- Centralized API client with rate limiting
- Intelligent caching system (1min - 1hr depending on data type)
- Error handling and retry logic
- Batch operations for comprehensive analysis

**Key Methods**:
```javascript
// Market Data
await alphaVantageService.getDailyData('AAPL')
await alphaVantageService.getIntradayData('TSLA', '5min')
await alphaVantageService.getCryptoDaily('BTC', 'USD')

// Technical Indicators
await alphaVantageService.getRSI('AAPL', 'daily', 14)
await alphaVantageService.getMACD('GOOGL', 'daily')
await alphaVantageService.getBollingerBands('MSFT', 'daily', 20)

// Comprehensive Analysis
await alphaVantageService.getComprehensiveAnalysis('AAPL')
```

### AlphaVantagePanel Component
**Location**: `src/components/AlphaVantagePanel.tsx`
- 4-tab interface (Overview, Technical, Fundamentals, News)
- Symbol search with autocomplete
- Real-time indicator visualization
- Responsive design with mobile support

**Props**:
```typescript
interface AlphaVantagePanelProps {
  symbol?: string              // Initial symbol (default: 'AAPL')
  onSymbolChange?: (symbol: string) => void
  style?: React.CSSProperties  // Custom styling
}
```

## API Rate Limits & Caching

### Free Tier Limits
- **5 API calls per minute**
- **500 API calls per day**
- Automatic rate limiting built-in (12-second delays)

### Intelligent Caching Strategy
- **Intraday data**: 1 minute cache
- **Daily data**: 5 minutes cache  
- **Technical indicators**: 5 minutes cache
- **Company overview**: 1 hour cache
- **News data**: 5 minutes cache

### Best Practices
1. **Symbol Selection**: Choose symbols wisely to avoid rate limits
2. **Tab Usage**: Switch between tabs to view cached data
3. **Batch Loading**: Use comprehensive analysis for multiple indicators
4. **Error Handling**: Built-in fallbacks for rate limit exceeded

## Technical Indicator Signals

### RSI (Relative Strength Index)
- **< 30**: Oversold (potential buy signal)
- **> 70**: Overbought (potential sell signal)
- **30-70**: Neutral zone

### MACD Analysis
- **MACD > Signal**: Bullish momentum
- **MACD < Signal**: Bearish momentum
- **Histogram**: Momentum acceleration/deceleration

### Moving Average Signals
- **Price > SMA20 > SMA50**: Strong bullish alignment
- **Price < SMA20 < SMA50**: Strong bearish alignment
- **Mixed positioning**: Consolidation or trend change

### Bollinger Bands
- **Price near upper band**: Potentially overbought
- **Price near lower band**: Potentially oversold
- **Band squeeze**: Low volatility, potential breakout ahead

## Integration Examples

### Basic Usage
```jsx
import AlphaVantagePanel from './components/AlphaVantagePanel'

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  
  return (
    <AlphaVantagePanel 
      symbol={selectedSymbol}
      onSymbolChange={setSelectedSymbol}
    />
  )
}
```

### Custom Styling
```jsx
<AlphaVantagePanel 
  symbol="TSLA"
  style={{
    maxWidth: '800px',
    margin: '20px auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  }}
/>
```

### Backend Integration
The Alpha Vantage service can be extended to work with your Python FastAPI backend:

```python
# backend/routers/alpha_vantage.py
@router.get("/alpha-vantage/daily/{symbol}")
async def get_alpha_vantage_daily(symbol: str):
    # Proxy requests through backend for API key security
    # Add additional processing, caching, or analysis
    pass
```

## Troubleshooting

### Common Issues

**"Rate limit exceeded"**
- Wait 60 seconds and try again
- Switch to a different symbol temporarily
- Check if you've exceeded daily limits

**"Invalid API key"**
- Verify your API key in `.env` file
- Ensure no extra spaces in the key
- Try using 'demo' for testing (limited functionality)

**"No data returned"**
- Check if symbol exists (use symbol search)
- Try a different time interval
- Verify market is open for real-time data

### Debug Mode
Enable debug logging:
```javascript
// In browser console
alphaVantageService.clearCache()
// Check network tab for API responses
```

## Supported Symbols

### Stock Markets
- **US Stocks**: AAPL, TSLA, GOOGL, MSFT, AMZN, META, NVDA, etc.
- **ETFs**: SPY, QQQ, IWM, VTI, etc.
- **Indices**: ^GSPC (S&P 500), ^DJI (Dow Jones), ^IXIC (NASDAQ)

### Cryptocurrencies
- **Major Coins**: BTC, ETH, ADA, DOT, LINK, etc.
- **Markets**: USD, EUR, JPY pairs

### International
- **London**: TSCO.LON, BP.LON
- **Toronto**: SHOP.TRT, TD.TRT
- **And many more global exchanges**

## Upgrade Path

### Premium Features (Paid Plans)
- Higher rate limits (up to 1200 calls/min)
- More detailed fundamental data
- Advanced technical indicators
- Real-time streaming data

### Custom Indicators
Extend the service to add your own technical analysis:
```javascript
// Add to alphaVantageService.js
async getCustomIndicator(symbol, params) {
  // Your custom technical analysis logic
}
```

---

**🚀 You're now ready to trade with real market data and professional-grade technical analysis!**

For questions or issues, check the [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/) or the NovaSignal GitHub issues.