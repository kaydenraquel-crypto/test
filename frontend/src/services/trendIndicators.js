// Comprehensive Trend Analysis Indicators
// Professional-grade trend following and directional indicators

export class TrendIndicators {
  constructor() {
    this.cache = new Map();
  }

  // ============ MOVING AVERAGES (Complete Suite) ============

  // Simple Moving Average
  sma(data, period = 20) {
    if (!data || data.length < period) return [];
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, val) => sum + (val.close || val), 0) / period;
      result.push(avg);
    }
    return result;
  }

  // Exponential Moving Average
  ema(data, period = 20) {
    if (!data || data.length < 1) return [];
    const multiplier = 2 / (period + 1);
    const result = [];
    
    // Start with SMA for first value
    let ema = data.slice(0, period).reduce((sum, val) => sum + (val.close || val), 0) / period;
    result.push(ema);
    
    for (let i = period; i < data.length; i++) {
      ema = ((data[i].close || data[i]) - ema) * multiplier + ema;
      result.push(ema);
    }
    return result;
  }

  // Weighted Moving Average
  wma(data, period = 20) {
    if (!data || data.length < period) return [];
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      let weightedSum = 0;
      let weights = 0;
      
      for (let j = 0; j < period; j++) {
        const weight = j + 1;
        weightedSum += (data[i - period + j + 1].close || data[i - period + j + 1]) * weight;
        weights += weight;
      }
      
      result.push(weightedSum / weights);
    }
    return result;
  }

  // Hull Moving Average
  hma(data, period = 20) {
    if (!data || data.length < period) return [];
    
    const halfPeriod = Math.floor(period / 2);
    const sqrtPeriod = Math.floor(Math.sqrt(period));
    
    const wma1 = this.wma(data, halfPeriod);
    const wma2 = this.wma(data, period);
    
    // Calculate 2*WMA(n/2) - WMA(n)
    const diffData = [];
    const startIdx = period - halfPeriod;
    for (let i = 0; i < wma1.length - startIdx; i++) {
      diffData.push({ close: 2 * wma1[i + startIdx] - wma2[i] });
    }
    
    return this.wma(diffData, sqrtPeriod);
  }

  // Kaufman Adaptive Moving Average (KAMA)
  kama(data, period = 10, fastSC = 2, slowSC = 30) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    const fastSCConst = 2 / (fastSC + 1);
    const slowSCConst = 2 / (slowSC + 1);
    
    for (let i = period; i < data.length; i++) {
      // Calculate Efficiency Ratio
      const change = Math.abs((data[i].close || data[i]) - (data[i - period].close || data[i - period]));
      let volatility = 0;
      
      for (let j = i - period + 1; j <= i; j++) {
        volatility += Math.abs((data[j].close || data[j]) - (data[j - 1].close || data[j - 1]));
      }
      
      const er = volatility === 0 ? 1 : change / volatility;
      const sc = Math.pow(er * (fastSCConst - slowSCConst) + slowSCConst, 2);
      
      if (i === period) {
        result.push(data[i].close || data[i]);
      } else {
        const prevKama = result[result.length - 1];
        result.push(prevKama + sc * ((data[i].close || data[i]) - prevKama));
      }
    }
    
    return result;
  }

  // Triple Exponential Moving Average (TEMA)
  tema(data, period = 14) {
    const ema1 = this.ema(data, period);
    const ema2 = this.ema(ema1.map(val => ({ close: val })), period);
    const ema3 = this.ema(ema2.map(val => ({ close: val })), period);
    
    const result = [];
    const startIdx = (period - 1) * 2;
    
    for (let i = 0; i < ema3.length; i++) {
      result.push(3 * ema1[i + startIdx] - 3 * ema2[i + (period - 1)] + ema3[i]);
    }
    
    return result;
  }

  // Double Exponential Moving Average (DEMA)
  dema(data, period = 14) {
    const ema1 = this.ema(data, period);
    const ema2 = this.ema(ema1.map(val => ({ close: val })), period);
    
    const result = [];
    const startIdx = period - 1;
    
    for (let i = 0; i < ema2.length; i++) {
      result.push(2 * ema1[i + startIdx] - ema2[i]);
    }
    
    return result;
  }

  // Fibonacci Moving Average
  fibonacciMA(data, period = 21) {
    // Using Fibonacci numbers: 8, 13, 21, 34, 55
    const fib8 = this.ema(data, 8);
    const fib13 = this.ema(data, 13);
    const fib21 = this.ema(data, 21);
    const fib34 = this.ema(data, 34);
    const fib55 = this.ema(data, 55);
    
    const result = [];
    const startIdx = 54; // Start from 55-1
    
    for (let i = 0; i < fib55.length; i++) {
      const avg = (fib8[i + startIdx - 46] + fib13[i + startIdx - 41] + fib21[i + startIdx - 33] + 
                   fib34[i + startIdx - 20] + fib55[i]) / 5;
      result.push(avg);
    }
    
    return result;
  }

  // MESA Adaptive Moving Average
  mesaAMA(data, period = 10) {
    if (!data || data.length < period + 6) return [];
    
    const result = [];
    const prices = data.map(d => d.close || d);
    
    for (let i = 6; i < prices.length; i++) {
      // Hilbert Transform Dominant Cycle Period
      const smooth = (4 * prices[i] + 3 * prices[i-1] + 2 * prices[i-2] + prices[i-3]) / 10;
      const detrender = (0.0962 * smooth + 0.5769 * (i >= 2 ? prices[i-2] : prices[i]) - 
                        0.5769 * (i >= 4 ? prices[i-4] : prices[i]) - 
                        0.0962 * (i >= 6 ? prices[i-6] : prices[i])) * (0.075 * period + 0.54);
      
      // Q1 and I1 are quadrature components
      const q1 = (0.0962 * detrender + 0.5769 * (i >= 2 ? result[i-8] || detrender : detrender) -
                 0.5769 * (i >= 4 ? result[i-10] || detrender : detrender) - 
                 0.0962 * (i >= 6 ? result[i-12] || detrender : detrender)) * (0.075 * period + 0.54);
      
      const i1 = i >= 3 ? result[i-4] || detrender : detrender;
      
      const jI = (0.0962 * i1 + 0.5769 * (i >= 2 ? result[i-8] || i1 : i1) -
                 0.5769 * (i >= 4 ? result[i-10] || i1 : i1) -
                 0.0962 * (i >= 6 ? result[i-12] || i1 : i1)) * (0.075 * period + 0.54);
      
      const jQ = (0.0962 * q1 + 0.5769 * (i >= 2 ? result[i-8] || q1 : q1) -
                 0.5769 * (i >= 4 ? result[i-10] || q1 : q1) -
                 0.0962 * (i >= 6 ? result[i-12] || q1 : q1)) * (0.075 * period + 0.54);
      
      // Calculate cycle period
      const i2 = i1 - jQ;
      const q2 = q1 + jI;
      const re = i2 * (i >= 1 ? result[i-2] || i2 : i2) + q2 * (i >= 1 ? result[i-2] || q2 : q2);
      const im = i2 * (i >= 1 ? result[i-2] || q2 : q2) - q2 * (i >= 1 ? result[i-2] || i2 : i2);
      
      const period_calc = re !== 0 ? 2 * Math.PI / Math.atan(im / re) : period;
      const adaptivePeriod = Math.max(6, Math.min(50, period_calc));
      
      // Calculate adaptive MA
      const alpha = 2 / (adaptivePeriod + 1);
      if (i === 6) {
        result.push(prices[i]);
      } else {
        result.push(alpha * prices[i] + (1 - alpha) * result[result.length - 1]);
      }
    }
    
    return result;
  }

  // ============ TREND LINES & REGRESSION ============

  // Linear Regression
  linearRegression(data, period = 20) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const prices = slice.map(d => d.close || d);
      
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      for (let j = 0; j < period; j++) {
        sumX += j;
        sumY += prices[j];
        sumXY += j * prices[j];
        sumX2 += j * j;
      }
      
      const slope = (period * sumXY - sumX * sumY) / (period * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / period;
      
      // Current regression value
      result.push(slope * (period - 1) + intercept);
    }
    
    return result;
  }

  // Polynomial Regression (2nd order)
  polynomialRegression(data, period = 20) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const prices = slice.map(d => d.close || d);
      
      // Set up matrix for polynomial regression ax^2 + bx + c
      let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
      let sumY = 0, sumXY = 0, sumX2Y = 0;
      
      for (let j = 0; j < period; j++) {
        const x = j;
        const y = prices[j];
        sumX += x;
        sumX2 += x * x;
        sumX3 += x * x * x;
        sumX4 += x * x * x * x;
        sumY += y;
        sumXY += x * y;
        sumX2Y += x * x * y;
      }
      
      // Solve system of equations using Cramer's rule (simplified)
      const denom = period * sumX2 * sumX4 + 2 * sumX * sumX2 * sumX3 - 
                   sumX2 * sumX2 * sumX2 - period * sumX3 * sumX3 - sumX * sumX * sumX4;
      
      if (Math.abs(denom) > 1e-10) {
        const a = (sumY * sumX2 * sumX4 + sumX * sumX2Y * sumX2 + sumX * sumXY * sumX3 -
                  sumX2Y * sumX2 * sumX - sumY * sumX3 * sumX - sumXY * sumX2 * sumX2) / denom;
        const b = (period * sumX2Y * sumX4 + sumX * sumY * sumX3 + sumX2 * sumXY * sumX2 -
                  sumX2Y * sumX * sumX2 - period * sumX3 * sumXY - sumX2 * sumY * sumX4) / denom;
        const c = (period * sumX2 * sumXY + sumX * sumX2 * sumY + sumX2 * sumX3 * sumX2Y -
                  sumX2 * sumX2 * sumY - period * sumX3 * sumX2Y - sumX * sumXY * sumX2) / denom;
        
        const x = period - 1;
        result.push(a * x * x + b * x + c);
      } else {
        // Fallback to linear regression
        result.push(this.linearRegression(slice.map(p => ({ close: p })), period)[0]);
      }
    }
    
    return result;
  }

  // Price Channel (Donchian Channel variant)
  priceChannel(data, period = 20) {
    if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
    
    const upper = [];
    const lower = [];
    const middle = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highs = slice.map(d => d.high || d.close || d);
      const lows = slice.map(d => d.low || d.close || d);
      
      const highest = Math.max(...highs);
      const lowest = Math.min(...lows);
      const mid = (highest + lowest) / 2;
      
      upper.push(highest);
      lower.push(lowest);
      middle.push(mid);
    }
    
    return { upper, middle, lower };
  }

  // ============ DIRECTIONAL INDICATORS ============

  // Average Directional Index (ADX) - Enhanced
  adx(data, period = 14) {
    if (!data || data.length < period + 1) return { adx: [], plusDI: [], minusDI: [], adxr: [] };
    
    const tr = [];
    const plusDM = [];
    const minusDM = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      const close = data[i].close || data[i];
      const prevHigh = data[i-1].high || data[i-1].close || data[i-1];
      const prevLow = data[i-1].low || data[i-1].close || data[i-1];
      const prevClose = data[i-1].close || data[i-1];
      
      // True Range
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      tr.push(Math.max(tr1, tr2, tr3));
      
      // Directional Movement
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }
    
    // Smooth with Wilder's smoothing
    const smoothTR = this.wilderSmoothing(tr, period);
    const smoothPlusDM = this.wilderSmoothing(plusDM, period);
    const smoothMinusDM = this.wilderSmoothing(minusDM, period);
    
    const plusDI = [];
    const minusDI = [];
    const adxValues = [];
    const adxrValues = []; // ADX Rating
    
    for (let i = 0; i < smoothTR.length; i++) {
      const pdi = (smoothPlusDM[i] / smoothTR[i]) * 100;
      const mdi = (smoothMinusDM[i] / smoothTR[i]) * 100;
      
      plusDI.push(pdi);
      minusDI.push(mdi);
      
      const dx = Math.abs(pdi - mdi) / (pdi + mdi) * 100;
      if (i === 0) {
        adxValues.push(dx);
      } else {
        adxValues.push((adxValues[i-1] * (period - 1) + dx) / period);
      }
      
      // ADXR is the average of current ADX and ADX from n periods ago
      if (i >= period) {
        adxrValues.push((adxValues[i] + adxValues[i - period]) / 2);
      } else {
        adxrValues.push(adxValues[i]);
      }
    }
    
    return {
      adx: adxValues,
      plusDI: plusDI,
      minusDI: minusDI,
      adxr: adxrValues
    };
  }

  // Aroon Indicator - Enhanced
  aroon(data, period = 14) {
    if (!data || data.length < period) return { aroonUp: [], aroonDown: [], aroonOscillator: [] };
    
    const aroonUp = [];
    const aroonDown = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      
      let highestIdx = 0;
      let lowestIdx = 0;
      let highestVal = slice[0].high || slice[0].close || slice[0];
      let lowestVal = slice[0].low || slice[0].close || slice[0];
      
      for (let j = 1; j < slice.length; j++) {
        const high = slice[j].high || slice[j].close || slice[j];
        const low = slice[j].low || slice[j].close || slice[j];
        
        if (high > highestVal) {
          highestVal = high;
          highestIdx = j;
        }
        if (low < lowestVal) {
          lowestVal = low;
          lowestIdx = j;
        }
      }
      
      aroonUp.push(((period - (period - 1 - highestIdx)) / period) * 100);
      aroonDown.push(((period - (period - 1 - lowestIdx)) / period) * 100);
    }
    
    const aroonOscillator = aroonUp.map((up, i) => up - aroonDown[i]);
    
    return {
      aroonUp: aroonUp,
      aroonDown: aroonDown,
      aroonOscillator: aroonOscillator
    };
  }

  // Parabolic SAR - Enhanced
  parabolicSAR(data, step = 0.02, max = 0.2) {
    if (!data || data.length < 2) return { sar: [], trend: [], af: [] };
    
    const sarValues = [];
    const trendValues = [];
    const afValues = [];
    
    let sar = data[0].low || data[0].close || data[0];
    let trend = 1; // 1 for uptrend, -1 for downtrend
    let af = step;
    let ep = data[0].high || data[0].close || data[0];
    
    sarValues.push(sar);
    trendValues.push(trend);
    afValues.push(af);
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      
      // Calculate new SAR
      sar = sar + af * (ep - sar);
      
      if (trend === 1) { // Uptrend
        if (low <= sar) {
          trend = -1;
          sar = ep;
          af = step;
          ep = low;
        } else {
          if (high > ep) {
            ep = high;
            af = Math.min(af + step, max);
          }
        }
      } else { // Downtrend
        if (high >= sar) {
          trend = 1;
          sar = ep;
          af = step;
          ep = high;
        } else {
          if (low < ep) {
            ep = low;
            af = Math.min(af + step, max);
          }
        }
      }
      
      sarValues.push(sar);
      trendValues.push(trend);
      afValues.push(af);
    }
    
    return {
      sar: sarValues,
      trend: trendValues,
      af: afValues
    };
  }

  // SuperTrend - Enhanced with multiple bands
  superTrend(data, period = 10, multiplier = 3) {
    if (!data || data.length < period) return { trend: [], upper: [], lower: [], signal: [] };
    
    const atr = this.atr(data, period);
    const result = [];
    const signals = [];
    const startIdx = period - 1;
    
    let trend = 1;
    let prevUpperBand = 0;
    let prevLowerBand = 0;
    
    for (let i = startIdx; i < data.length; i++) {
      const close = data[i].close || data[i];
      const hl2 = ((data[i].high || close) + (data[i].low || close)) / 2;
      const atrVal = atr[i - startIdx];
      
      const upperBand = hl2 + multiplier * atrVal;
      const lowerBand = hl2 - multiplier * atrVal;
      
      const finalUpperBand = upperBand < prevUpperBand || (data[i-1].close || data[i-1]) > prevUpperBand 
        ? upperBand : prevUpperBand;
      const finalLowerBand = lowerBand > prevLowerBand || (data[i-1].close || data[i-1]) < prevLowerBand 
        ? lowerBand : prevLowerBand;
      
      let superTrend = trend === 1 ? finalLowerBand : finalUpperBand;
      let signal = 0; // 0 = no signal, 1 = buy, -1 = sell
      
      if (trend === 1 && close < finalLowerBand) {
        trend = -1;
        superTrend = finalUpperBand;
        signal = -1;
      } else if (trend === -1 && close > finalUpperBand) {
        trend = 1;
        superTrend = finalLowerBand;
        signal = 1;
      }
      
      result.push({
        trend: superTrend,
        upper: finalUpperBand,
        lower: finalLowerBand,
        direction: trend
      });
      signals.push(signal);
      
      prevUpperBand = finalUpperBand;
      prevLowerBand = finalLowerBand;
    }
    
    return {
      trend: result.map(r => r.trend),
      upper: result.map(r => r.upper),
      lower: result.map(r => r.lower),
      signal: signals
    };
  }

  // ZigZag Indicator
  zigZag(data, percentage = 5) {
    if (!data || data.length < 3) return { zigzag: [], peaks: [], troughs: [] };
    
    const zigzagValues = [];
    const peaks = [];
    const troughs = [];
    const threshold = percentage / 100;
    
    let currentTrend = 0; // 0 = unknown, 1 = up, -1 = down
    let lastPivotPrice = data[0].close || data[0];
    let lastPivotIndex = 0;
    
    for (let i = 1; i < data.length; i++) {
      const currentPrice = data[i].close || data[i];
      const change = (currentPrice - lastPivotPrice) / lastPivotPrice;
      
      if (currentTrend === 0) {
        // Establish initial trend
        if (Math.abs(change) >= threshold) {
          currentTrend = change > 0 ? 1 : -1;
          zigzagValues[lastPivotIndex] = lastPivotPrice;
          zigzagValues[i] = currentPrice;
          
          if (currentTrend === 1) {
            troughs.push({ index: lastPivotIndex, price: lastPivotPrice });
            peaks.push({ index: i, price: currentPrice });
          } else {
            peaks.push({ index: lastPivotIndex, price: lastPivotPrice });
            troughs.push({ index: i, price: currentPrice });
          }
          
          lastPivotPrice = currentPrice;
          lastPivotIndex = i;
        }
      } else if (currentTrend === 1) {
        // Uptrend
        if (currentPrice > lastPivotPrice) {
          // New high
          lastPivotPrice = currentPrice;
          lastPivotIndex = i;
          zigzagValues[i] = currentPrice;
          if (peaks.length > 0) {
            peaks[peaks.length - 1] = { index: i, price: currentPrice };
          }
        } else if (change <= -threshold) {
          // Trend reversal to down
          currentTrend = -1;
          zigzagValues[i] = currentPrice;
          troughs.push({ index: i, price: currentPrice });
          lastPivotPrice = currentPrice;
          lastPivotIndex = i;
        }
      } else {
        // Downtrend
        if (currentPrice < lastPivotPrice) {
          // New low
          lastPivotPrice = currentPrice;
          lastPivotIndex = i;
          zigzagValues[i] = currentPrice;
          if (troughs.length > 0) {
            troughs[troughs.length - 1] = { index: i, price: currentPrice };
          }
        } else if (change >= threshold) {
          // Trend reversal to up
          currentTrend = 1;
          zigzagValues[i] = currentPrice;
          peaks.push({ index: i, price: currentPrice });
          lastPivotPrice = currentPrice;
          lastPivotIndex = i;
        }
      }
    }
    
    return {
      zigzag: zigzagValues,
      peaks: peaks,
      troughs: troughs
    };
  }

  // ============ HELPER METHODS ============

  // Wilder's Smoothing
  wilderSmoothing(data, period) {
    if (!data || data.length < period) return [];
    
    const result = [];
    let sum = 0;
    
    // Initial sum
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    result.push(sum / period);
    
    // Apply Wilder's smoothing
    for (let i = period; i < data.length; i++) {
      const newValue = (result[result.length - 1] * (period - 1) + data[i]) / period;
      result.push(newValue);
    }
    
    return result;
  }

  // Average True Range (needed for several indicators)
  atr(data, period = 14) {
    if (!data || data.length < 2) return [];
    
    const trueRanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      const prevClose = data[i-1].close || data[i-1];
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.wilderSmoothing(trueRanges, period);
  }

  // Calculate all trend indicators
  calculateAll(data, config = {}) {
    const results = {};
    
    try {
      // Moving Averages
      results.sma_9 = this.sma(data, config.sma_9_period || 9);
      results.sma_20 = this.sma(data, config.sma_20_period || 20);
      results.sma_50 = this.sma(data, config.sma_50_period || 50);
      results.sma_100 = this.sma(data, config.sma_100_period || 100);
      results.sma_200 = this.sma(data, config.sma_200_period || 200);
      
      results.ema_9 = this.ema(data, config.ema_9_period || 9);
      results.ema_12 = this.ema(data, config.ema_12_period || 12);
      results.ema_20 = this.ema(data, config.ema_20_period || 20);
      results.ema_26 = this.ema(data, config.ema_26_period || 26);
      results.ema_50 = this.ema(data, config.ema_50_period || 50);
      results.ema_100 = this.ema(data, config.ema_100_period || 100);
      results.ema_200 = this.ema(data, config.ema_200_period || 200);
      
      results.wma_20 = this.wma(data, config.wma_period || 20);
      results.hma_20 = this.hma(data, config.hma_period || 20);
      results.kama_10 = this.kama(data, config.kama_period || 10);
      results.tema_14 = this.tema(data, config.tema_period || 14);
      results.dema_14 = this.dema(data, config.dema_period || 14);
      results.fib_ma = this.fibonacciMA(data);
      results.mesa_ama = this.mesaAMA(data, config.mesa_period || 10);
      
      // Trend Lines & Regression
      results.linear_reg = this.linearRegression(data, config.linreg_period || 20);
      results.poly_reg = this.polynomialRegression(data, config.polyreg_period || 20);
      
      const priceChannel = this.priceChannel(data, config.channel_period || 20);
      results.channel_upper = priceChannel.upper;
      results.channel_middle = priceChannel.middle;
      results.channel_lower = priceChannel.lower;
      
      // Directional Indicators
      const adxData = this.adx(data, config.adx_period || 14);
      results.adx = adxData.adx;
      results.plus_di = adxData.plusDI;
      results.minus_di = adxData.minusDI;
      results.adxr = adxData.adxr;
      
      const aroonData = this.aroon(data, config.aroon_period || 14);
      results.aroon_up = aroonData.aroonUp;
      results.aroon_down = aroonData.aroonDown;
      results.aroon_osc = aroonData.aroonOscillator;
      
      const sarData = this.parabolicSAR(data, config.sar_step || 0.02, config.sar_max || 0.2);
      results.parabolic_sar = sarData.sar;
      results.sar_trend = sarData.trend;
      
      const supertrendData = this.superTrend(data, config.st_period || 10, config.st_mult || 3);
      results.super_trend = supertrendData.trend;
      results.st_upper = supertrendData.upper;
      results.st_lower = supertrendData.lower;
      results.st_signal = supertrendData.signal;
      
      const zigzagData = this.zigZag(data, config.zigzag_pct || 5);
      results.zigzag = zigzagData.zigzag;
      results.zigzag_peaks = zigzagData.peaks;
      results.zigzag_troughs = zigzagData.troughs;
      
    } catch (error) {
      console.error('Error calculating trend indicators:', error);
    }
    
    return results;
  }
}

// Export singleton instance
export const trendIndicators = new TrendIndicators();
export default trendIndicators;