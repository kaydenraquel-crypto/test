// Comprehensive Momentum Oscillators Library  
// Professional-grade momentum analysis for stocks and crypto

export class MomentumIndicators {
  constructor() {
    this.cache = new Map();
  }

  // ============ CLASSIC MOMENTUM OSCILLATORS ============

  // Relative Strength Index (RSI) - Enhanced
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

  // Stochastic Oscillator - Enhanced with multiple variations
  stochastic(data, kPeriod = 14, dPeriod = 3, smoothK = 1) {
    if (!data || data.length < kPeriod) return { k: [], d: [], fullK: [], fullD: [] };
    
    const rawK = [];
    
    // Calculate %K
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const current = data[i].close || data[i];
      
      rawK.push(((current - lowest) / (highest - lowest)) * 100);
    }
    
    // Fast %K (smoothed)
    const fastK = smoothK > 1 ? this.sma(rawK.map(k => ({ close: k })), smoothK) : rawK;
    
    // Fast %D (SMA of %K)
    const fastD = this.sma(fastK.map(k => ({ close: k })), dPeriod);
    
    // Slow %K is Fast %D
    // Slow %D is SMA of Slow %K
    const slowD = this.sma(fastD.map(d => ({ close: d })), dPeriod);
    
    return {
      k: fastK,        // Fast %K
      d: fastD,        // Fast %D
      fullK: fastD,    // Full Stochastic %K (same as Fast %D)
      fullD: slowD     // Full Stochastic %D
    };
  }

  // Williams %R - Enhanced
  williamsR(data, period = 14) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const current = data[i].close || data[i];
      
      result.push(((highest - current) / (highest - lowest)) * -100);
    }
    
    return result;
  }

  // Rate of Change (ROC)
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

  // Momentum Oscillator
  momentum(data, period = 10) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    
    for (let i = period; i < data.length; i++) {
      const currentPrice = data[i].close || data[i];
      const previousPrice = data[i - period].close || data[i - period];
      result.push(currentPrice - previousPrice);
    }
    
    return result;
  }

  // ============ ADVANCED MOMENTUM OSCILLATORS ============

  // Stochastic RSI
  stochRSI(data, rsiPeriod = 14, stochPeriod = 14, kPeriod = 3, dPeriod = 3) {
    const rsiValues = this.rsi(data, rsiPeriod);
    if (rsiValues.length < stochPeriod) return { stochRSI: [], k: [], d: [] };
    
    const stochRSIValues = [];
    
    // Calculate Stochastic of RSI
    for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
      const rsiSlice = rsiValues.slice(i - stochPeriod + 1, i + 1);
      const maxRSI = Math.max(...rsiSlice);
      const minRSI = Math.min(...rsiSlice);
      const currentRSI = rsiValues[i];
      
      if (maxRSI - minRSI === 0) {
        stochRSIValues.push(0);
      } else {
        stochRSIValues.push((currentRSI - minRSI) / (maxRSI - minRSI));
      }
    }
    
    // Calculate %K and %D of Stochastic RSI
    const kValues = this.sma(stochRSIValues.map(s => ({ close: s * 100 })), kPeriod);
    const dValues = this.sma(kValues.map(k => ({ close: k })), dPeriod);
    
    return {
      stochRSI: stochRSIValues.map(s => s * 100),
      k: kValues,
      d: dValues
    };
  }

  // Ultimate Oscillator
  ultimateOscillator(data, period1 = 7, period2 = 14, period3 = 28) {
    if (!data || data.length < period3 + 1) return [];
    
    const buyingPressure = [];
    const trueRange = [];
    
    // Calculate Buying Pressure and True Range
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      const close = data[i].close || data[i];
      const prevClose = data[i-1].close || data[i-1];
      
      // Buying Pressure = Close - MIN(Low, Previous Close)
      const bp = close - Math.min(low, prevClose);
      buyingPressure.push(bp);
      
      // True Range = MAX(High, Previous Close) - MIN(Low, Previous Close)
      const tr = Math.max(high, prevClose) - Math.min(low, prevClose);
      trueRange.push(tr);
    }
    
    const result = [];
    
    // Calculate Ultimate Oscillator
    for (let i = period3 - 1; i < buyingPressure.length; i++) {
      const bp1Sum = buyingPressure.slice(i - period1 + 1, i + 1).reduce((sum, bp) => sum + bp, 0);
      const tr1Sum = trueRange.slice(i - period1 + 1, i + 1).reduce((sum, tr) => sum + tr, 0);
      const avg1 = tr1Sum === 0 ? 0 : bp1Sum / tr1Sum;
      
      const bp2Sum = buyingPressure.slice(i - period2 + 1, i + 1).reduce((sum, bp) => sum + bp, 0);
      const tr2Sum = trueRange.slice(i - period2 + 1, i + 1).reduce((sum, tr) => sum + tr, 0);
      const avg2 = tr2Sum === 0 ? 0 : bp2Sum / tr2Sum;
      
      const bp3Sum = buyingPressure.slice(i - period3 + 1, i + 1).reduce((sum, bp) => sum + bp, 0);
      const tr3Sum = trueRange.slice(i - period3 + 1, i + 1).reduce((sum, tr) => sum + tr, 0);
      const avg3 = tr3Sum === 0 ? 0 : bp3Sum / tr3Sum;
      
      const uo = ((4 * avg1) + (2 * avg2) + avg3) / 7 * 100;
      result.push(uo);
    }
    
    return result;
  }

  // TRIX (Triple Exponential Average)
  trix(data, period = 14, signalPeriod = 9) {
    if (!data || data.length < period * 3) return { trix: [], signal: [] };
    
    // Calculate three successive EMAs
    const ema1 = this.ema(data, period);
    const ema2 = this.ema(ema1.map(val => ({ close: val })), period);
    const ema3 = this.ema(ema2.map(val => ({ close: val })), period);
    
    // Calculate TRIX as percentage change of EMA3
    const trixValues = [];
    for (let i = 1; i < ema3.length; i++) {
      const percentChange = ((ema3[i] - ema3[i-1]) / ema3[i-1]) * 10000; // Multiply by 10000 for better scaling
      trixValues.push(percentChange);
    }
    
    // Calculate signal line (EMA of TRIX)
    const signalLine = this.ema(trixValues.map(val => ({ close: val })), signalPeriod);
    
    return {
      trix: trixValues,
      signal: signalLine
    };
  }

  // Chande Momentum Oscillator
  chandeMomentumOscillator(data, period = 20) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    
    for (let i = period; i < data.length; i++) {
      let sumUp = 0;
      let sumDown = 0;
      
      for (let j = i - period + 1; j <= i; j++) {
        const change = (data[j].close || data[j]) - (data[j-1].close || data[j-1]);
        if (change > 0) {
          sumUp += change;
        } else if (change < 0) {
          sumDown += Math.abs(change);
        }
      }
      
      if (sumUp + sumDown === 0) {
        result.push(0);
      } else {
        result.push(((sumUp - sumDown) / (sumUp + sumDown)) * 100);
      }
    }
    
    return result;
  }

  // DeMarker Indicator
  deMarker(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const deMax = [];
    const deMin = [];
    
    // Calculate DeMax and DeMin
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      const prevHigh = data[i-1].high || data[i-1].close || data[i-1];
      const prevLow = data[i-1].low || data[i-1].close || data[i-1];
      
      deMax.push(high > prevHigh ? high - prevHigh : 0);
      deMin.push(low < prevLow ? prevLow - low : 0);
    }
    
    const result = [];
    
    // Calculate DeMarker
    for (let i = period - 1; i < deMax.length; i++) {
      const smaDeMax = deMax.slice(i - period + 1, i + 1).reduce((sum, val) => sum + val, 0) / period;
      const smaDeMin = deMin.slice(i - period + 1, i + 1).reduce((sum, val) => sum + val, 0) / period;
      
      if (smaDeMax + smaDeMin === 0) {
        result.push(0);
      } else {
        result.push(smaDeMax / (smaDeMax + smaDeMin));
      }
    }
    
    return result;
  }

  // ============ VOLUME-BASED MOMENTUM OSCILLATORS ============

  // Money Flow Index (MFI)
  mfi(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const moneyFlow = [];
    
    // Calculate Money Flow
    for (let i = 1; i < data.length; i++) {
      const typicalPrice = ((data[i].high || data[i].close || data[i]) + 
                           (data[i].low || data[i].close || data[i]) + 
                           (data[i].close || data[i])) / 3;
      const prevTypicalPrice = ((data[i-1].high || data[i-1].close || data[i-1]) + 
                               (data[i-1].low || data[i-1].close || data[i-1]) + 
                               (data[i-1].close || data[i-1])) / 3;
      const rawMoneyFlow = typicalPrice * (data[i].volume || 1000000);
      
      moneyFlow.push({
        value: rawMoneyFlow,
        isPositive: typicalPrice > prevTypicalPrice
      });
    }
    
    const result = [];
    
    // Calculate MFI
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

  // Volume RSI
  volumeRSI(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const gains = [];
    const losses = [];
    
    // Calculate volume-weighted gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = (data[i].close || data[i]) - (data[i-1].close || data[i-1]);
      const volume = data[i].volume || 1000000;
      
      gains.push(change > 0 ? change * volume : 0);
      losses.push(change < 0 ? Math.abs(change) * volume : 0);
    }
    
    const avgGains = this.wilderSmoothing(gains, period);
    const avgLosses = this.wilderSmoothing(losses, period);
    
    const result = [];
    for (let i = 0; i < avgGains.length; i++) {
      const rs = avgLosses[i] === 0 ? 100 : avgGains[i] / avgLosses[i];
      result.push(100 - (100 / (1 + rs)));
    }
    
    return result;
  }

  // Accumulation/Distribution Oscillator
  adOscillator(data, fastPeriod = 3, slowPeriod = 10) {
    const adLine = this.accumulationDistributionLine(data);
    if (adLine.length < slowPeriod) return [];
    
    const fastEMA = this.ema(adLine.map(val => ({ close: val })), fastPeriod);
    const slowEMA = this.ema(adLine.map(val => ({ close: val })), slowPeriod);
    
    const result = [];
    const startIdx = slowPeriod - fastPeriod;
    
    for (let i = 0; i < slowEMA.length; i++) {
      result.push(fastEMA[i + startIdx] - slowEMA[i]);
    }
    
    return result;
  }

  // ============ CUSTOM MOMENTUM INDICATORS ============

  // Fisher Transform
  fisherTransform(data, period = 10) {
    if (!data || data.length < period) return { fisher: [], trigger: [] };
    
    const normalizedPrices = [];
    const fisherValues = [];
    let prevFisher = 0;
    
    // Normalize prices to -1 to +1 range
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const medianPrice = ((data[i].high || data[i].close || data[i]) + 
                          (data[i].low || data[i].close || data[i])) / 2;
      
      let normalized;
      if (highest - lowest === 0) {
        normalized = 0;
      } else {
        normalized = 2 * ((medianPrice - lowest) / (highest - lowest)) - 1;
      }
      
      // Ensure normalized value is within bounds
      normalized = Math.max(-0.999, Math.min(0.999, normalized));
      normalizedPrices.push(normalized);
      
      // Calculate Fisher Transform
      const fisher = 0.5 * Math.log((1 + normalized) / (1 - normalized));
      const smoothedFisher = 0.33 * fisher + 0.67 * prevFisher;
      fisherValues.push(smoothedFisher);
      prevFisher = smoothedFisher;
    }
    
    // Trigger line is Fisher Transform shifted by 1 period
    const triggerLine = [fisherValues[0], ...fisherValues.slice(0, -1)];
    
    return {
      fisher: fisherValues,
      trigger: triggerLine
    };
  }

  // Schaff Trend Cycle
  schaffTrendCycle(data, cyclePeriod = 10, fastPeriod = 23, slowPeriod = 50) {
    const macdData = this.macd(data, fastPeriod, slowPeriod, 1);
    if (macdData.macd.length < cyclePeriod) return [];
    
    const macdValues = macdData.macd;
    const stc1Values = [];
    
    // First stochastic calculation
    for (let i = cyclePeriod - 1; i < macdValues.length; i++) {
      const slice = macdValues.slice(i - cyclePeriod + 1, i + 1);
      const maxMACD = Math.max(...slice);
      const minMACD = Math.min(...slice);
      
      if (maxMACD - minMACD === 0) {
        stc1Values.push(0);
      } else {
        stc1Values.push(((macdValues[i] - minMACD) / (maxMACD - minMACD)) * 100);
      }
    }
    
    // Smooth first stochastic
    const smoothedSTC1 = this.ema(stc1Values.map(s => ({ close: s })), 3);
    
    const stc2Values = [];
    
    // Second stochastic calculation
    for (let i = cyclePeriod - 1; i < smoothedSTC1.length; i++) {
      const slice = smoothedSTC1.slice(i - cyclePeriod + 1, i + 1);
      const maxSTC1 = Math.max(...slice);
      const minSTC1 = Math.min(...slice);
      
      if (maxSTC1 - minSTC1 === 0) {
        stc2Values.push(smoothedSTC1[i]);
      } else {
        stc2Values.push(((smoothedSTC1[i] - minSTC1) / (maxSTC1 - minSTC1)) * 100);
      }
    }
    
    // Final smoothing
    return this.ema(stc2Values.map(s => ({ close: s })), 3);
  }

  // Know Sure Thing (KST)
  knowSureThing(data, roc1 = 10, roc2 = 15, roc3 = 20, roc4 = 30, 
                sma1 = 10, sma2 = 10, sma3 = 10, sma4 = 15, signalPeriod = 9) {
    
    const roc1Values = this.roc(data, roc1);
    const roc2Values = this.roc(data, roc2);
    const roc3Values = this.roc(data, roc3);
    const roc4Values = this.roc(data, roc4);
    
    const sma1Values = this.sma(roc1Values.map(r => ({ close: r })), sma1);
    const sma2Values = this.sma(roc2Values.map(r => ({ close: r })), sma2);
    const sma3Values = this.sma(roc3Values.map(r => ({ close: r })), sma3);
    const sma4Values = this.sma(roc4Values.map(r => ({ close: r })), sma4);
    
    const kstValues = [];
    const minLength = Math.min(sma1Values.length, sma2Values.length, sma3Values.length, sma4Values.length);
    
    for (let i = 0; i < minLength; i++) {
      const kst = (sma1Values[i] * 1) + (sma2Values[i] * 2) + (sma3Values[i] * 3) + (sma4Values[i] * 4);
      kstValues.push(kst);
    }
    
    const signalLine = this.sma(kstValues.map(k => ({ close: k })), signalPeriod);
    
    return {
      kst: kstValues,
      signal: signalLine
    };
  }

  // ============ HELPER METHODS ============

  // Simple Moving Average
  sma(data, period) {
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
  ema(data, period) {
    if (!data || data.length < 1) return [];
    const multiplier = 2 / (period + 1);
    const result = [];
    
    let ema = data.slice(0, period).reduce((sum, val) => sum + (val.close || val), 0) / period;
    result.push(ema);
    
    for (let i = period; i < data.length; i++) {
      ema = ((data[i].close || data[i]) - ema) * multiplier + ema;
      result.push(ema);
    }
    return result;
  }

  // Wilder's Smoothing
  wilderSmoothing(data, period) {
    if (!data || data.length < period) return [];
    
    const result = [];
    let sum = 0;
    
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    result.push(sum / period);
    
    for (let i = period; i < data.length; i++) {
      const newValue = (result[result.length - 1] * (period - 1) + data[i]) / period;
      result.push(newValue);
    }
    
    return result;
  }

  // MACD (for other calculations)
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

  // Accumulation/Distribution Line (for AD Oscillator)
  accumulationDistributionLine(data) {
    if (!data || data.length < 1) return [];
    
    const result = [];
    let adLine = 0;
    
    for (let i = 0; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      const close = data[i].close || data[i];
      const volume = data[i].volume || 1000000;
      
      const clv = high === low ? 0 : ((close - low) - (high - close)) / (high - low);
      adLine += clv * volume;
      result.push(adLine);
    }
    
    return result;
  }

  // Calculate all momentum indicators
  calculateAll(data, config = {}) {
    const results = {};
    
    try {
      // Classic Oscillators
      results.rsi_9 = this.rsi(data, config.rsi_9_period || 9);
      results.rsi_14 = this.rsi(data, config.rsi_14_period || 14);
      results.rsi_21 = this.rsi(data, config.rsi_21_period || 21);
      
      const stochData = this.stochastic(data, config.stoch_k || 14, config.stoch_d || 3);
      results.stoch_k = stochData.k;
      results.stoch_d = stochData.d;
      results.stoch_full_k = stochData.fullK;
      results.stoch_full_d = stochData.fullD;
      
      results.williams_r = this.williamsR(data, config.williams_period || 14);
      results.roc = this.roc(data, config.roc_period || 10);
      results.momentum = this.momentum(data, config.momentum_period || 10);
      
      // Advanced Oscillators
      const stochRSIData = this.stochRSI(data);
      results.stoch_rsi = stochRSIData.stochRSI;
      results.stoch_rsi_k = stochRSIData.k;
      results.stoch_rsi_d = stochRSIData.d;
      
      results.ultimate_osc = this.ultimateOscillator(data);
      
      const trixData = this.trix(data, config.trix_period || 14);
      results.trix = trixData.trix;
      results.trix_signal = trixData.signal;
      
      results.chande_momentum = this.chandeMomentumOscillator(data, config.cmo_period || 20);
      results.demarker = this.deMarker(data, config.demarker_period || 14);
      
      // Volume-Based Momentum
      results.mfi = this.mfi(data, config.mfi_period || 14);
      results.volume_rsi = this.volumeRSI(data, config.vrsi_period || 14);
      results.ad_oscillator = this.adOscillator(data, config.ad_fast || 3, config.ad_slow || 10);
      
      // Custom Oscillators
      const fisherData = this.fisherTransform(data, config.fisher_period || 10);
      results.fisher_transform = fisherData.fisher;
      results.fisher_trigger = fisherData.trigger;
      
      results.schaff_trend_cycle = this.schaffTrendCycle(data);
      
      const kstData = this.knowSureThing(data);
      results.kst = kstData.kst;
      results.kst_signal = kstData.signal;
      
    } catch (error) {
      console.error('Error calculating momentum indicators:', error);
    }
    
    return results;
  }
}

// Export singleton instance
export const momentumIndicators = new MomentumIndicators();
export default momentumIndicators;