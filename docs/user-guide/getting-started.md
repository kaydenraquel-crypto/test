# Getting Started with NovaSignal

Welcome to NovaSignal! This guide will help you get up and running with the platform in just a few minutes.

## 🚀 Quick Start

### 1. First Launch
When you first open NovaSignal, you'll see:
- **Chart area** showing Bitcoin (BTCUSDT) by default
- **Symbol search** in the top header
- **Performance monitor** (click ⚡ Performance to toggle)
- **Chart info panel** at the bottom

### 2. Navigation Basics

#### Symbol Selection
- **Click the search box** in the header to search for symbols
- **Type to search**: Try typing "eth", "apple", or "tesla"
- **Use categories**: Click "Crypto", "Stocks", or "Favorites" for quick filtering
- **Star favorites**: Click the ⭐ icon to add symbols to your favorites
- **Keyboard navigation**: Use arrow keys to navigate, Enter to select

#### Timeframe Selection
- **Select timeframes** from the dropdown: 1m, 5m, 15m, 1h, 4h, 1d
- **Higher timeframes** show longer-term trends
- **Lower timeframes** show more detailed price action

### 3. Chart Features

#### Basic Interaction
- **Zoom**: Mouse wheel or pinch on touchscreen
- **Pan**: Click and drag to move around the chart
- **Price tracking**: Hover over candles to see OHLC data
- **Time navigation**: Use the time scale at the bottom

#### Chart Controls
- **Spacing**: Chart automatically maintains optimal candlestick spacing
- **Auto-resize**: Chart adjusts to window size changes
- **Real-time updates**: Live price data via WebSocket connection

### 4. Understanding the Interface

#### Header Controls
- **Symbol Search**: Advanced search with autocomplete
- **Timeframe Selector**: Choose your analysis timeframe  
- **Reconnect Button**: Manually reconnect WebSocket if needed
- **Performance Toggle**: Show/hide performance monitoring
- **Connection Status**: Shows WebSocket connection health

#### Chart Area
- **Candlestick Chart**: Green for up, red for down
- **Price Scale**: Right side shows current price levels
- **Time Scale**: Bottom shows time progression
- **Loading States**: Shows progress when fetching data

#### Information Panels
- **Performance Monitor**: Real-time FPS, memory, API latency
- **Chart Info**: Symbol details, data points, timeframe
- **Debug Tools**: Available in browser console

### 5. Performance Monitoring

#### Accessing Performance Data
1. **Click ⚡ Performance** in the header
2. **View real-time metrics**:
   - **FPS**: Application frame rate (target >30)
   - **Memory**: JavaScript memory usage (target <100MB)
   - **API**: Network request latency (target <500ms)  
   - **Chart**: Chart rendering time (target <30ms)

#### Understanding Metrics
- **Green**: Optimal performance
- **Orange**: Acceptable but could be better
- **Red**: Performance issues that need attention

#### Performance Alerts
- **Low FPS warnings** when frame rate drops
- **Memory alerts** when usage gets high
- **Slow API notifications** for network issues
- **Tips and suggestions** for optimization

### 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+E` | Export chart data |
| `F5` or `Ctrl+R` | Refresh data |
| `F1` or `Ctrl+?` | Show help |
| `Arrow Keys` | Navigate search results |
| `Enter` | Select highlighted symbol |
| `Escape` | Close search dropdown |

### 7. Troubleshooting

#### Chart Not Loading
1. **Check connection status** in the header
2. **Try refreshing** with F5 or the Reconnect button
3. **Open browser console** (F12) to check for errors
4. **Verify backend is running** on port 8000

#### Slow Performance
1. **Enable performance monitoring** to identify issues
2. **Check memory usage** - restart if over 200MB
3. **Reduce chart data** by using higher timeframes
4. **Close other browser tabs** to free up resources

#### Search Not Working
1. **Click outside and back in** to refresh the search
2. **Try typing different terms** (symbol, company name, description)
3. **Use category filters** to narrow down results
4. **Clear browser cache** if symbols aren't updating

### 8. Data Sources

#### Cryptocurrencies
- **Primary**: Binance API for real-time crypto data
- **Coverage**: 10+ major cryptocurrency pairs
- **Update Frequency**: Real-time via WebSocket
- **Historical**: 1 day of hourly data

#### Stocks
- **Primary**: Alpha Vantage for stock market data
- **Coverage**: Major US stocks (AAPL, GOOGL, MSFT, etc.)
- **Update Frequency**: Market hours only
- **Historical**: 1 day of data during market hours

### 9. Browser Console Commands

For advanced users, several debug commands are available:

```javascript
// Chart debugging
window.debugChart()           // Show chart state information
window.debugChartSpacing()    // Show spacing manager details
window.forceInitChart()       // Force chart re-initialization

// Performance debugging  
window.performance.memory     // Browser memory usage
console.table(performanceMetrics) // Performance data table
```

### 10. Next Steps

Now that you're familiar with the basics:

1. **Explore different symbols** - Try crypto and stocks
2. **Experiment with timeframes** - See how they affect analysis
3. **Monitor performance** - Keep an eye on system health
4. **Learn keyboard shortcuts** - Increase your efficiency
5. **Check out advanced features** - See what else NovaSignal can do

## 📚 Further Reading

- [Trading Guide](./trading-guide.md) - Learn technical analysis
- [Advanced Features](./advanced-features.md) - Power user features
- [Keyboard Shortcuts](./keyboard-shortcuts.md) - Complete shortcut reference
- [Troubleshooting](../technical/troubleshooting.md) - Common issues and solutions

## 💡 Tips for Success

1. **Start simple** - Begin with major symbols like BTC or AAPL
2. **Use appropriate timeframes** - 1h for general analysis, 1m for precise entries
3. **Monitor performance** - Keep FPS above 30 for smooth operation
4. **Save favorites** - Star the symbols you trade most often
5. **Learn shortcuts** - They'll make you much more efficient

Welcome to professional trading with NovaSignal! 🚀