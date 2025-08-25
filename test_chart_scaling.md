# Chart Scaling Fix Test Instructions

## 🎯 What We Fixed
The candlestick compression issue caused by SMA/EMA indicators has been resolved with a "Scale Price Only" option.

## ✅ Solution Implemented

### 1. **Updated LightweightChart Component**
- Added `scalePriceOnly` prop (default: `true`)
- When enabled, SMA/EMA indicators use separate scale (`priceScaleId: ''`)
- Indicators have disabled autoscaling (`autoscaleInfoProvider: () => null`)
- This prevents indicators from affecting the price chart's vertical scaling

### 2. **Added UI Toggle**
- New checkbox in AlphaVantageChartTest component
- Users can toggle between "Scale Price Only" and "Include Indicators in Scaling"
- Visual feedback shows current scaling mode

## 🧪 Test Instructions

### Access the Test Page
1. Frontend: `http://localhost:5173/?alphatest`
2. Backend: `http://127.0.0.1:8000` (should be running)

### Test Scenarios

#### **Scenario 1: Price-Only Scaling (Default)**
1. Load any stock symbol (e.g., AAPL, TSLA, NVDA)
2. Ensure "Scale price only" checkbox is **checked** ✅
3. **Expected Result**: Candlesticks should be clearly visible with good vertical range
4. **SMA/EMA lines should be visible but NOT compress the candles**

#### **Scenario 2: Traditional Scaling (With Compression)**
1. **Uncheck** the "Scale price only" checkbox ❌
2. Reload the same symbol
3. **Expected Result**: You should see candlestick compression (flat/small candles) when SMA/EMA are displayed
4. This demonstrates the original problem

#### **Scenario 3: Compare Before/After**
1. Toggle between checked/unchecked states
2. Notice the difference in candlestick height and visibility
3. **Price-only scaling should provide much better candlestick visibility**

### What to Look For

#### ✅ **Good Result (Price-Only Scaling)**
- Candlesticks are clearly visible with proper height/width
- OHLC ranges are properly displayed
- SMA/EMA lines overlay without affecting scale
- Price movements are easy to see and analyze

#### ❌ **Problem Result (Traditional Scaling)**
- Candlesticks appear compressed/flat
- Hard to see individual OHLC values
- Chart appears to zoom out to fit all data including moving averages
- Price action details are lost

## 🔧 Technical Details

### Code Changes Made

#### LightweightChartFixed.tsx
```typescript
// Added new prop
scalePriceOnly?: boolean  // Default: true

// Modified SMA/EMA series creation
priceScaleId: scalePriceOnly ? '' : 'right',
autoscaleInfoProvider: scalePriceOnly ? () => null : undefined
```

#### AlphaVantageChartTest.tsx
```typescript
// Added state for toggle
const [scalePriceOnly, setScalePriceOnly] = useState(true)

// Added UI toggle with visual feedback
// Passed prop to LightweightChart component
```

### How It Works
- **Price-only scaling**: Indicators use separate, invisible price scale
- **Traditional scaling**: Indicators share main price scale with candlesticks
- **autoscaleInfoProvider**: Prevents indicators from affecting auto-scaling when set to `() => null`

## 📊 Console Logging
Check browser console for debugging info:
- "Adding SMA with X points, scalePriceOnly: true/false"
- "Adding EMA with X points, scalePriceOnly: true/false"

## 🚀 Next Steps
If tests are successful, this solution can be applied to:
- Other chart components in the project
- Additional indicators (Bollinger Bands, etc.)
- Real-time trading charts
- Any component using LightweightChart

---

**Test Status**: Ready for testing  
**Expected Outcome**: Candlestick compression issue resolved with user control