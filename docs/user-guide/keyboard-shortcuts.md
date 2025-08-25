# Keyboard Shortcuts Reference

NovaSignal includes comprehensive keyboard shortcuts to help power users navigate and trade efficiently.

## 🎯 Essential Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+Shift+E` | Export data | Global |
| `F5` or `Ctrl+R` | Refresh data | Global |
| `F1` or `Ctrl+?` | Show help | Global |
| `Escape` | Close dropdowns/modals | Global |

## 🔍 Symbol Search Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| `Arrow Down` | Move to next symbol | Search dropdown |
| `Arrow Up` | Move to previous symbol | Search dropdown |
| `Enter` | Select highlighted symbol | Search dropdown |
| `Escape` | Close search dropdown | Search dropdown |
| `Tab` | Cycle through search filters | Search dropdown |

## 📊 Chart Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| `Mouse Wheel` | Zoom in/out | Chart area |
| `Click + Drag` | Pan chart | Chart area |
| `Shift + Mouse Wheel` | Horizontal zoom | Chart area |
| `Ctrl + Mouse Wheel` | Vertical zoom | Chart area |
| `Double Click` | Reset zoom | Chart area |

## ⌨️ Performance Monitoring

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+Shift+P` | Toggle performance panel | Global |
| `Ctrl+Shift+M` | Show memory usage | Global |
| `Ctrl+Alt+P` | Export performance report | Global |

## 🎮 Advanced Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+1` through `Ctrl+6` | Switch timeframes | Global |
| `Ctrl+Shift+F` | Toggle favorites filter | Symbol search |
| `Ctrl+Shift+C` | Show crypto only | Symbol search |
| `Ctrl+Shift+S` | Show stocks only | Symbol search |

## 📈 Data Management

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+E` | Export chart as image | Chart area |
| `Ctrl+Shift+C` | Copy chart data | Chart area |
| `Ctrl+S` | Save current workspace | Global |
| `Ctrl+L` | Load saved workspace | Global |

## 🐛 Debug & Development

| Shortcut | Action | Context |
|----------|--------|---------|
| `F12` | Open browser dev tools | Global |
| `Ctrl+Shift+I` | Inspect element | Global |
| `Ctrl+Shift+J` | Open console | Global |
| `Ctrl+U` | View page source | Global |

## 🔧 Browser Console Commands

These commands are available in the browser console (F12):

### Chart Debugging
```javascript
// Basic chart information
window.debugChart()

// Chart spacing details  
window.debugChartSpacing()

// Force chart re-initialization
window.forceInitChart()

// Chart performance metrics
window.debugPerformance()
```

### Performance Analysis
```javascript
// Memory usage
window.performance.memory

// Performance timing
window.performance.timing

// Resource timing
window.performance.getEntriesByType('resource')
```

### Application State
```javascript
// Current chart data
window.getChartData()

// WebSocket connection status
window.getConnectionStatus()

// Performance metrics
window.getPerformanceMetrics()

// User preferences
window.getUserPreferences()
```

## 📱 Mobile & Touch Gestures

| Gesture | Action | Context |
|---------|--------|---------|
| `Pinch` | Zoom in/out | Chart area |
| `Two-finger drag` | Pan chart | Chart area |
| `Long press` | Show context menu | Chart area |
| `Double tap` | Reset zoom | Chart area |
| `Swipe up/down` | Scroll interface | Global |

## ⚙️ Customizing Shortcuts

While keyboard shortcuts are currently fixed, you can create browser bookmarklets for custom actions:

### Example Bookmarklets

**Quick BTC Chart**
```javascript
javascript:window.location.hash='#symbol=BTCUSDT&timeframe=1h'
```

**Performance Dashboard**
```javascript
javascript:window.debugPerformance()
```

**Export Everything**
```javascript
javascript:window.exportAllData()
```

## 💡 Productivity Tips

### Symbol Search Efficiency
1. **Use partial typing**: Type "btc" instead of "BTCUSDT"
2. **Use categories**: Click filters instead of typing full names
3. **Star frequently used symbols**: Quick access via favorites
4. **Learn common symbols**: Memorize tickers for speed

### Chart Navigation Mastery
1. **Use middle mouse for panning**: More precise than click-drag
2. **Shift+wheel for horizontal zoom**: Focus on time periods
3. **Double-click to reset**: Quick way to see full chart
4. **Use keyboard for timeframes**: Ctrl+1-6 for instant switching

### Performance Optimization
1. **Monitor regularly**: Keep performance panel visible
2. **Close unused tabs**: Free up browser memory
3. **Use higher timeframes**: Less data = better performance
4. **Restart when needed**: Clear memory leaks

### Search Strategy
1. **Start broad, narrow down**: Use categories first
2. **Use company names**: "apple" works better than "aapl"
3. **Try different terms**: "bitcoin" vs "btc" vs "BTC"
4. **Learn symbol patterns**: Crypto ends in USDT, stocks are 3-4 letters

## 🚨 Emergency Shortcuts

If the application becomes unresponsive:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+R` | Hard refresh (bypass cache) |
| `Ctrl+F5` | Force reload |
| `Alt+F4` | Close browser window |
| `Ctrl+Shift+Delete` | Clear browser data |

## 📊 Shortcut Cheat Sheet

Print this quick reference for your desk:

```
┌─────────────────────────────────────────┐
│         NovaSignal Shortcuts            │
├─────────────────────────────────────────┤
│ ESSENTIAL                               │
│ Ctrl+Shift+E  → Export data            │
│ F5 / Ctrl+R   → Refresh                │
│ F1 / Ctrl+?   → Help                   │
│ Escape        → Close dialogs          │
├─────────────────────────────────────────┤
│ NAVIGATION                              │
│ ↑/↓ Arrows    → Navigate search        │
│ Enter         → Select symbol          │
│ Mouse Wheel   → Zoom chart             │
│ Click+Drag    → Pan chart              │
├─────────────────────────────────────────┤
│ ADVANCED                                │
│ Ctrl+1-6      → Switch timeframes      │
│ Ctrl+Shift+P  → Performance panel      │
│ F12           → Developer tools        │
└─────────────────────────────────────────┘
```

## 🎓 Learning Path

1. **Week 1**: Master essential shortcuts (F5, Ctrl+Shift+E, Arrow keys)
2. **Week 2**: Learn chart navigation (Mouse wheel, click+drag)
3. **Week 3**: Advanced search (Categories, favorites, keyboard nav)
4. **Week 4**: Performance monitoring (Debug commands, optimization)
5. **Week 5**: Expert level (Custom bookmarklets, browser tools)

Remember: **Efficiency comes with practice!** Start with a few shortcuts and gradually add more to your workflow.

## 📚 Related Documentation

- [Getting Started Guide](./getting-started.md) - Basic platform usage
- [Advanced Features](./advanced-features.md) - Power user features  
- [Performance Guide](../technical/performance.md) - Optimization techniques
- [Troubleshooting](../technical/troubleshooting.md) - Common issues