// Comprehensive Technical Indicators Library
// Professional-grade indicators for stocks and crypto analysis

export class TechnicalIndicators {
  constructor() {
    this.cache = new Map();
  }

  // ============ TREND FOLLOWING INDICATORS ============

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

  // MACD (Moving Average Convergence Divergence)
  macd(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.ema(data, fastPeriod);
    const slowEMA = this.ema(data, slowPeriod);
    
    const macdLine = [];
    const startIdx = slowPeriod - fastPeriod;
    
    for (let i = 0; i < slowEMA.length; i++) {
      macdLine.push(fastEMA[i + startIdx] - slowEMA[i]);
    }
    
    const signalLine = this.ema(macdLine.map(val => ({ close: val })), signalPeriod);
    const histogram = [];
    
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + signalPeriod - 1] - signalLine[i]);
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }

  // Average Directional Index (ADX)
  adx(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const tr = [];
    const plusDM = [];
    const minusDM = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const close = data[i].close;
      const prevHigh = data[i-1].high;
      const prevLow = data[i-1].low;
      const prevClose = data[i-1].close;
      
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
    
    // Smooth with Wilder's smoothing (similar to EMA)
    const smoothTR = this.wilderSmoothing(tr, period);
    const smoothPlusDM = this.wilderSmoothing(plusDM, period);
    const smoothMinusDM = this.wilderSmoothing(minusDM, period);
    
    const plusDI = [];
    const minusDI = [];
    const adxValues = [];
    
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
    }
    
    return {
      adx: adxValues,
      plusDI: plusDI,
      minusDI: minusDI
    };
  }

  // Aroon Indicator
  aroon(data, period = 14) {
    if (!data || data.length < period) return [];
    
    const aroonUp = [];
    const aroonDown = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      
      let highestIdx = 0;
      let lowestIdx = 0;
      let highestVal = slice[0].high;
      let lowestVal = slice[0].low;
      
      for (let j = 1; j < slice.length; j++) {
        if (slice[j].high > highestVal) {
          highestVal = slice[j].high;
          highestIdx = j;
        }
        if (slice[j].low < lowestVal) {
          lowestVal = slice[j].low;
          lowestIdx = j;
        }
      }
      
      aroonUp.push(((period - (period - 1 - highestIdx)) / period) * 100);
      aroonDown.push(((period - (period - 1 - lowestIdx)) / period) * 100);
    }
    
    return {
      aroonUp: aroonUp,
      aroonDown: aroonDown,
      aroonOscillator: aroonUp.map((up, i) => up - aroonDown[i])
    };
  }

  // ============ MOMENTUM OSCILLATORS ============

  // Relative Strength Index
  rsi(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = (data[i].close || data[i]) - (data[i-1].close || data[i-1]);
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    const avgGains = this.wilderSmoothing(gains, period);
    const avgLosses = this.wilderSmoothing(losses, period);
    
    const rsi = [];
    for (let i = 0; i < avgGains.length; i++) {
      const rs = avgLosses[i] === 0 ? 100 : avgGains[i] / avgLosses[i];
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  }

  // Stochastic Oscillator
  stochastic(data, kPeriod = 14, dPeriod = 3) {
    if (!data || data.length < kPeriod) return [];
    
    const kPercent = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high));
      const lowest = Math.min(...slice.map(d => d.low));
      const current = data[i].close;
      
      kPercent.push(((current - lowest) / (highest - lowest)) * 100);
    }
    
    const dPercent = this.sma(kPercent.map(k => ({ close: k })), dPeriod);
    
    return {
      k: kPercent,
      d: dPercent
    };
  }

  // Williams %R
  williamsR(data, period = 14) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high));
      const lowest = Math.min(...slice.map(d => d.low));
      const current = data[i].close;
      
      result.push(((highest - current) / (highest - lowest)) * -100);
    }
    
    return result;
  }

  // Money Flow Index
  mfi(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const moneyFlow = [];
    
    for (let i = 1; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      const prevTypicalPrice = (data[i-1].high + data[i-1].low + data[i-1].close) / 3;
      const rawMoneyFlow = typicalPrice * (data[i].volume || 1000000);
      
      moneyFlow.push({
        value: rawMoneyFlow,
        isPositive: typicalPrice > prevTypicalPrice
      });
    }
    
    const result = [];
    
    for (let i = period - 1; i < moneyFlow.length; i++) {
      const slice = moneyFlow.slice(i - period + 1, i + 1);
      const positiveFlow = slice.filter(mf => mf.isPositive).reduce((sum, mf) => sum + mf.value, 0);
      const negativeFlow = slice.filter(mf => !mf.isPositive).reduce((sum, mf) => sum + mf.value, 0);
      
      if (negativeFlow === 0) {
        result.push(100);
      } else {
        const moneyFlowRatio = positiveFlow / negativeFlow;
        result.push(100 - (100 / (1 + moneyFlowRatio)));
      }
    }
    
    return result;
  }

  // Rate of Change
  roc(data, period = 10) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    
    for (let i = period; i < data.length; i++) {
      const currentPrice = data[i].close || data[i];
      const previousPrice = data[i - period].close || data[i - period];
      result.push(((currentPrice - previousPrice) / previousPrice) * 100);
    }
    
    return result;
  }

  // ============ VOLATILITY INDICATORS ============

  // Bollinger Bands
  bollingerBands(data, period = 20, stdDev = 2) {
    const smaValues = this.sma(data, period);
    
    const upperBand = [];
    const lowerBand = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1).map(d => d.close || d);
      const mean = smaValues[i - period + 1];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upperBand.push(mean + (stdDev * standardDeviation));
      lowerBand.push(mean - (stdDev * standardDeviation));
    }
    
    return {
      upper: upperBand,
      middle: smaValues,
      lower: lowerBand,
      bandwidth: upperBand.map((upper, i) => (upper - lowerBand[i]) / smaValues[i] * 100),
      percentB: data.slice(period - 1).map((d, i) => {
        const price = d.close || d;
        return (price - lowerBand[i]) / (upperBand[i] - lowerBand[i]);
      })
    };
  }

  // Average True Range
  atr(data, period = 14) {
    if (!data || data.length < 2) return [];
    
    const trueRanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i-1].close;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.wilderSmoothing(trueRanges, period);
  }

  // Keltner Channel
  keltnerChannel(data, period = 20, multiplier = 2) {
    const emaValues = this.ema(data, period);
    const atrValues = this.atr(data, period);
    
    const upperChannel = [];
    const lowerChannel = [];
    const startIdx = period - 1;
    
    for (let i = 0; i < atrValues.length; i++) {
      upperChannel.push(emaValues[i + startIdx] + (multiplier * atrValues[i]));
      lowerChannel.push(emaValues[i + startIdx] - (multiplier * atrValues[i]));
    }
    
    return {
      upper: upperChannel,
      middle: emaValues.slice(startIdx),
      lower: lowerChannel
    };
  }

  // ============ VOLUME INDICATORS ============

  // On-Balance Volume
  obv(data) {
    if (!data || data.length < 2) return [];
    
    const result = [0];
    
    for (let i = 1; i < data.length; i++) {
      const volume = data[i].volume || 1000000;
      const prevClose = data[i-1].close;
      const currentClose = data[i].close;
      
      if (currentClose > prevClose) {
        result.push(result[result.length - 1] + volume);
      } else if (currentClose < prevClose) {
        result.push(result[result.length - 1] - volume);
      } else {
        result.push(result[result.length - 1]);
      }
    }
    
    return result;
  }

  // Volume Weighted Average Price
  vwap(data) {
    if (!data || data.length < 1) return [];
    
    const result = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (let i = 0; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      const volume = data[i].volume || 1000000;
      
      cumulativeVolumePrice += typicalPrice * volume;
      cumulativeVolume += volume;
      
      result.push(cumulativeVolumePrice / cumulativeVolume);
    }
    
    return result;
  }

  // ============ ADVANCED INDICATORS ============

  // Ichimoku Cloud
  ichimoku(data, tenkanPeriod = 9, kijunPeriod = 26, senkouBPeriod = 52, displacement = 26) {
    if (!data || data.length < senkouBPeriod) return {};
    
    const tenkanSen = this.ichimokuLine(data, tenkanPeriod);
    const kijunSen = this.ichimokuLine(data, kijunPeriod);
    const senkouA = [];
    const senkouB = this.ichimokuLine(data, senkouBPeriod);
    
    // Senkou Span A
    for (let i = 0; i < Math.min(tenkanSen.length, kijunSen.length); i++) {
      senkouA.push((tenkanSen[i] + kijunSen[i]) / 2);
    }
    
    // Chikou Span (displaced backward)
    const chikouSpan = data.map(d => d.close).slice(0, -displacement);
    
    return {
      tenkanSen: tenkanSen,
      kijunSen: kijunSen,
      senkouA: senkouA,
      senkouB: senkouB,
      chikouSpan: chikouSpan
    };
  }

  // Parabolic SAR
  parabolicSAR(data, step = 0.02, max = 0.2) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    let sar = data[0].low;
    let trend = 1; // 1 for uptrend, -1 for downtrend
    let af = step;
    let ep = data[0].high;
    
    result.push(sar);
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      
      // Calculate new SAR
      sar = sar + af * (ep - sar);
      
      if (trend === 1) {
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
      } else {
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
      
      result.push(sar);
    }
    
    return result;
  }

  // SuperTrend
  superTrend(data, period = 10, multiplier = 3) {
    const atrValues = this.atr(data, period);
    const result = [];
    const startIdx = period - 1;
    
    let trend = 1;
    let prevUpperBand = 0;
    let prevLowerBand = 0;
    let prevSuperTrend = 0;
    
    for (let i = startIdx; i < data.length; i++) {
      const close = data[i].close;
      const hl2 = (data[i].high + data[i].low) / 2;
      const atr = atrValues[i - startIdx];
      
      const upperBand = hl2 + multiplier * atr;
      const lowerBand = hl2 - multiplier * atr;
      
      const finalUpperBand = upperBand < prevUpperBand || data[i-1].close > prevUpperBand 
        ? upperBand : prevUpperBand;
      const finalLowerBand = lowerBand > prevLowerBand || data[i-1].close < prevLowerBand 
        ? lowerBand : prevLowerBand;
      
      let superTrend = trend === 1 ? finalLowerBand : finalUpperBand;
      
      if (trend === 1 && close < finalLowerBand) {
        trend = -1;
        superTrend = finalUpperBand;
      } else if (trend === -1 && close > finalUpperBand) {
        trend = 1;
        superTrend = finalLowerBand;
      }
      
      result.push({
        value: superTrend,
        trend: trend,
        upperBand: finalUpperBand,
        lowerBand: finalLowerBand
      });
      
      prevUpperBand = finalUpperBand;
      prevLowerBand = finalLowerBand;
      prevSuperTrend = superTrend;
    }
    
    return result;
  }

  // ============ HELPER METHODS ============

  // Wilder's Smoothing (for RSI, ADX, etc.)
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

  // Ichimoku line calculation helper
  ichimokuLine(data, period) {
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high));
      const lowest = Math.min(...slice.map(d => d.low));
      result.push((highest + lowest) / 2);
    }
    
    return result;
  }

  // Calculate all indicators for given data
  calculateAll(data, config = {}) {
    const results = {};
    
    try {
      // Trend indicators
      results.sma_20 = this.sma(data, config.sma_20_period || 20);
      results.sma_50 = this.sma(data, config.sma_50_period || 50);
      results.ema_20 = this.ema(data, config.ema_20_period || 20);
      results.ema_50 = this.ema(data, config.ema_50_period || 50);
      results.wma_20 = this.wma(data, config.wma_period || 20);
      results.hma_20 = this.hma(data, config.hma_period || 20);
      
      const macdData = this.macd(data, config.macd_fast || 12, config.macd_slow || 26, config.macd_signal || 9);
      results.macd_line = macdData.macd;
      results.macd_signal = macdData.signal;
      results.macd_hist = macdData.histogram;
      
      const adxData = this.adx(data, config.adx_period || 14);
      results.adx = adxData.adx;
      results.plus_di = adxData.plusDI;
      results.minus_di = adxData.minusDI;
      
      // Momentum oscillators
      results.rsi = this.rsi(data, config.rsi_period || 14);
      
      const stochData = this.stochastic(data, config.stoch_k || 14, config.stoch_d || 3);
      results.stoch_k = stochData.k;
      results.stoch_d = stochData.d;
      
      results.williams_r = this.williamsR(data, config.williams_period || 14);
      results.mfi = this.mfi(data, config.mfi_period || 14);
      results.roc = this.roc(data, config.roc_period || 10);
      
      // Volatility indicators
      const bbData = this.bollingerBands(data, config.bb_period || 20, config.bb_stddev || 2);
      results.bb_upper = bbData.upper;
      results.bb_middle = bbData.middle;
      results.bb_lower = bbData.lower;
      results.bb_bandwidth = bbData.bandwidth;
      results.bb_percent = bbData.percentB;
      
      results.atr = this.atr(data, config.atr_period || 14);
      
      // Volume indicators
      results.obv = this.obv(data);
      results.vwap = this.vwap(data);
      
      // Advanced indicators
      const ichimokuData = this.ichimoku(data);
      results.tenkan_sen = ichimokuData.tenkanSen;
      results.kijun_sen = ichimokuData.kijunSen;
      results.senkou_a = ichimokuData.senkouA;
      results.senkou_b = ichimokuData.senkouB;
      results.chikou_span = ichimokuData.chikouSpan;
      
      results.parabolic_sar = this.parabolicSAR(data);
      results.super_trend = this.superTrend(data);
      
    } catch (error) {
      console.error('Error calculating indicators:', error);
    }
    
    return results;
  }
}

// Export singleton instance
export const technicalIndicators = new TechnicalIndicators();
export default technicalIndicators;