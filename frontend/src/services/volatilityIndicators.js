// Comprehensive Volatility Analysis Indicators
// Professional-grade volatility measurement and band analysis

export class VolatilityIndicators {
  constructor() {
    this.cache = new Map();
  }

  // ============ BAND INDICATORS ============

  // Bollinger Bands - Enhanced with additional metrics
  bollingerBands(data, period = 20, stdDev = 2, maType = 'sma') {
    if (!data || data.length < period) return {};
    
    // Calculate moving average based on type
    let movingAverage;
    if (maType === 'ema') {
      movingAverage = this.ema(data, period);
    } else {
      movingAverage = this.sma(data, period);
    }
    
    const upperBand = [];
    const lowerBand = [];
    const bandwidth = [];
    const percentB = [];
    const squeeze = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1).map(d => d.close || d);
      const mean = movingAverage[i - period + 1];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      const upper = mean + (stdDev * standardDeviation);
      const lower = mean - (stdDev * standardDeviation);
      const price = data[i].close || data[i];
      
      upperBand.push(upper);
      lowerBand.push(lower);
      
      // Bandwidth (volatility measure)
      const bw = (upper - lower) / mean * 100;
      bandwidth.push(bw);
      
      // %B (position within bands)
      const pctB = (price - lower) / (upper - lower);
      percentB.push(pctB);
      
      // Squeeze indicator (compare with 20-period average bandwidth)
      if (bandwidth.length >= 20) {
        const avgBandwidth = bandwidth.slice(-20).reduce((sum, bw) => sum + bw, 0) / 20;
        squeeze.push(bw < avgBandwidth * 0.5); // Squeeze when current BW < 50% of average
      } else {
        squeeze.push(false);
      }
    }
    
    return {
      upper: upperBand,
      middle: movingAverage,
      lower: lowerBand,
      bandwidth: bandwidth,
      percentB: percentB,
      squeeze: squeeze
    };
  }

  // Keltner Channel - Multiple variations
  keltnerChannel(data, period = 20, multiplier = 2, maType = 'ema') {
    if (!data || data.length < period) return {};
    
    // Calculate middle line
    let middleLine;
    if (maType === 'sma') {
      middleLine = this.sma(data, period);
    } else {
      middleLine = this.ema(data, period);
    }
    
    // Calculate ATR for channel width
    const atr = this.atr(data, period);
    
    const upperChannel = [];
    const lowerChannel = [];
    const width = [];
    
    const startIdx = period - 1;
    
    for (let i = 0; i < atr.length; i++) {
      const middle = middleLine[i + startIdx];
      const channelWidth = multiplier * atr[i];
      
      upperChannel.push(middle + channelWidth);
      lowerChannel.push(middle - channelWidth);
      width.push(channelWidth * 2);
    }
    
    return {
      upper: upperChannel,
      middle: middleLine.slice(startIdx),
      lower: lowerChannel,
      width: width
    };
  }

  // Donchian Channel
  donchianChannel(data, period = 20) {
    if (!data || data.length < period) return {};
    
    const upperChannel = [];
    const lowerChannel = [];
    const middleChannel = [];
    const width = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const middle = (highest + lowest) / 2;
      
      upperChannel.push(highest);
      lowerChannel.push(lowest);
      middleChannel.push(middle);
      width.push(highest - lowest);
    }
    
    return {
      upper: upperChannel,
      middle: middleChannel,
      lower: lowerChannel,
      width: width
    };
  }

  // Envelope Channels (Percentage-based)
  envelopeChannel(data, period = 20, percentage = 2.5, maType = 'sma') {
    if (!data || data.length < period) return {};
    
    // Calculate moving average
    let movingAverage;
    if (maType === 'ema') {
      movingAverage = this.ema(data, period);
    } else {
      movingAverage = this.sma(data, period);
    }
    
    const upperEnvelope = [];
    const lowerEnvelope = [];
    const multiplier = percentage / 100;
    
    for (let i = 0; i < movingAverage.length; i++) {
      const ma = movingAverage[i];
      upperEnvelope.push(ma * (1 + multiplier));
      lowerEnvelope.push(ma * (1 - multiplier));
    }
    
    return {
      upper: upperEnvelope,
      middle: movingAverage,
      lower: lowerEnvelope
    };
  }

  // ============ RANGE INDICATORS ============

  // Average True Range (ATR) - Enhanced
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

  // Average True Range Percent
  atrPercent(data, period = 14) {
    const atrValues = this.atr(data, period);
    const result = [];
    
    for (let i = 0; i < atrValues.length; i++) {
      const price = data[i + period].close || data[i + period];
      result.push((atrValues[i] / price) * 100);
    }
    
    return result;
  }

  // Chaikin Volatility
  chaikinVolatility(data, period = 10, rocPeriod = 10) {
    if (!data || data.length < period + rocPeriod) return [];
    
    // Calculate High-Low spread
    const hlSpread = [];
    for (let i = 0; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      hlSpread.push(high - low);
    }
    
    // Calculate EMA of H-L spread
    const emaHL = this.ema(hlSpread.map(hl => ({ close: hl })), period);
    
    // Calculate Rate of Change of EMA
    const result = [];
    for (let i = rocPeriod; i < emaHL.length; i++) {
      const roc = ((emaHL[i] - emaHL[i - rocPeriod]) / emaHL[i - rocPeriod]) * 100;
      result.push(roc);
    }
    
    return result;
  }

  // Standard Deviation
  standardDeviation(data, period = 20) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1).map(d => d.close || d);
      const mean = slice.reduce((sum, price) => sum + price, 0) / period;
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      result.push(stdDev);
    }
    
    return result;
  }

  // Historical Volatility (annualized)
  historicalVolatility(data, period = 20, annualizationFactor = 252) {
    if (!data || data.length < period + 1) return [];
    
    // Calculate logarithmic returns
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      const currentPrice = data[i].close || data[i];
      const previousPrice = data[i-1].close || data[i-1];
      returns.push(Math.log(currentPrice / previousPrice));
    }
    
    const result = [];
    
    // Calculate rolling standard deviation of returns
    for (let i = period - 1; i < returns.length; i++) {
      const slice = returns.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, ret) => sum + ret, 0) / period;
      const variance = slice.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      // Annualize the volatility
      const annualizedVol = stdDev * Math.sqrt(annualizationFactor) * 100;
      result.push(annualizedVol);
    }
    
    return result;
  }

  // Price Channel Width
  priceChannelWidth(data, period = 20) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const width = ((highest - lowest) / lowest) * 100;
      
      result.push(width);
    }
    
    return result;
  }

  // ============ ADVANCED VOLATILITY INDICATORS ============

  // Volatility Index (VIX-style calculation)
  volatilityIndex(data, period = 30) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      
      // Calculate implied volatility using simplified Black-Scholes approach
      let totalVariance = 0;
      let weight = 0;
      
      for (let j = 1; j < slice.length; j++) {
        const return_j = Math.log((slice[j].close || slice[j]) / (slice[j-1].close || slice[j-1]));
        const timeWeight = 1; // Simplified equal weighting
        
        totalVariance += return_j * return_j * timeWeight;
        weight += timeWeight;
      }
      
      const averageVariance = totalVariance / weight;
      const impliedVol = Math.sqrt(averageVariance * 252) * 100; // Annualized
      
      result.push(impliedVol);
    }
    
    return result;
  }

  // Volatility Stop
  volatilityStop(data, period = 20, multiplier = 2) {
    if (!data || data.length < period) return { upper: [], lower: [] };
    
    const atr = this.atr(data, period);
    const upperStop = [];
    const lowerStop = [];
    const startIdx = period - 1;
    
    for (let i = 0; i < atr.length; i++) {
      const price = data[i + startIdx].close || data[i + startIdx];
      const atrValue = atr[i];
      
      upperStop.push(price + (multiplier * atrValue));
      lowerStop.push(price - (multiplier * atrValue));
    }
    
    return {
      upper: upperStop,
      lower: lowerStop
    };
  }

  // Market Facilitation Index
  marketFacilitationIndex(data) {
    if (!data || data.length < 1) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      const high = data[i].high || data[i].close || data[i];
      const low = data[i].low || data[i].close || data[i];
      const volume = data[i].volume || 1000000;
      
      const mfi = (high - low) / volume;
      result.push(mfi);
    }
    
    return result;
  }

  // Volatility Ratio
  volatilityRatio(data, shortPeriod = 10, longPeriod = 30) {
    const shortVol = this.standardDeviation(data, shortPeriod);
    const longVol = this.standardDeviation(data, longPeriod);
    
    const result = [];
    const startIdx = longPeriod - shortPeriod;
    
    for (let i = 0; i < longVol.length; i++) {
      if (longVol[i] === 0) {
        result.push(1);
      } else {
        result.push(shortVol[i + startIdx] / longVol[i]);
      }
    }
    
    return result;
  }

  // Relative Volatility Index
  relativeVolatilityIndex(data, period = 10) {
    if (!data || data.length < period + 1) return [];
    
    // Calculate standard deviations
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = (data[i].close || data[i]) - (data[i-1].close || data[i-1]);
      
      if (change >= 0) {
        gains.push(this.standardDeviationSingle(data, i, period));
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(this.standardDeviationSingle(data, i, period));
      }
    }
    
    // Calculate RVI similar to RSI
    const avgGains = this.wilderSmoothing(gains, period);
    const avgLosses = this.wilderSmoothing(losses, period);
    
    const result = [];
    for (let i = 0; i < avgGains.length; i++) {
      const rs = avgLosses[i] === 0 ? 100 : avgGains[i] / avgLosses[i];
      result.push(100 - (100 / (1 + rs)));
    }
    
    return result;
  }

  // Vertical Horizontal Filter
  verticalHorizontalFilter(data, period = 28) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    
    for (let i = period; i < data.length; i++) {
      const slice = data.slice(i - period, i + 1);
      
      // Calculate highest high and lowest low
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const range = highest - lowest;
      
      // Calculate sum of absolute price changes
      let sumChanges = 0;
      for (let j = 1; j < slice.length; j++) {
        const change = Math.abs((slice[j].close || slice[j]) - (slice[j-1].close || slice[j-1]));
        sumChanges += change;
      }
      
      if (sumChanges === 0) {
        result.push(0);
      } else {
        result.push(range / sumChanges);
      }
    }
    
    return result;
  }

  // Choppiness Index
  choppinessIndex(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    
    for (let i = period; i < data.length; i++) {
      const slice = data.slice(i - period, i + 1);
      
      // Calculate highest high and lowest low
      const highest = Math.max(...slice.map(d => d.high || d.close || d));
      const lowest = Math.min(...slice.map(d => d.low || d.close || d));
      const range = highest - lowest;
      
      // Calculate sum of ATR values
      let sumATR = 0;
      for (let j = 1; j < slice.length; j++) {
        const high = slice[j].high || slice[j].close || slice[j];
        const low = slice[j].low || slice[j].close || slice[j];
        const prevClose = slice[j-1].close || slice[j-1];
        
        const tr1 = high - low;
        const tr2 = Math.abs(high - prevClose);
        const tr3 = Math.abs(low - prevClose);
        
        sumATR += Math.max(tr1, tr2, tr3);
      }
      
      if (range === 0 || sumATR === 0) {
        result.push(100);
      } else {
        const chop = 100 * Math.log10(sumATR / range) / Math.log10(period);
        result.push(chop);
      }
    }
    
    return result;
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

  // Standard Deviation for single point
  standardDeviationSingle(data, index, period) {
    if (index < period - 1) return 0;
    
    const slice = data.slice(index - period + 1, index + 1).map(d => d.close || d);
    const mean = slice.reduce((sum, price) => sum + price, 0) / period;
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    
    return Math.sqrt(variance);
  }

  // Calculate all volatility indicators
  calculateAll(data, config = {}) {
    const results = {};
    
    try {
      // Bollinger Bands variants
      const bb20_2 = this.bollingerBands(data, config.bb_period || 20, config.bb_stddev || 2);
      results.bb_upper = bb20_2.upper;
      results.bb_middle = bb20_2.middle;
      results.bb_lower = bb20_2.lower;
      results.bb_bandwidth = bb20_2.bandwidth;
      results.bb_percent_b = bb20_2.percentB;
      results.bb_squeeze = bb20_2.squeeze;
      
      const bb20_1 = this.bollingerBands(data, 20, 1);
      results.bb_upper_1std = bb20_1.upper;
      results.bb_lower_1std = bb20_1.lower;
      
      const bb_ema = this.bollingerBands(data, 20, 2, 'ema');
      results.bb_ema_upper = bb_ema.upper;
      results.bb_ema_middle = bb_ema.middle;
      results.bb_ema_lower = bb_ema.lower;
      
      // Keltner Channel variants
      const kc = this.keltnerChannel(data, config.kc_period || 20, config.kc_mult || 2);
      results.kc_upper = kc.upper;
      results.kc_middle = kc.middle;
      results.kc_lower = kc.lower;
      results.kc_width = kc.width;
      
      const kc_sma = this.keltnerChannel(data, 20, 2, 'sma');
      results.kc_sma_upper = kc_sma.upper;
      results.kc_sma_middle = kc_sma.middle;
      results.kc_sma_lower = kc_sma.lower;
      
      // Donchian Channel
      const dc = this.donchianChannel(data, config.dc_period || 20);
      results.donchian_upper = dc.upper;
      results.donchian_middle = dc.middle;
      results.donchian_lower = dc.lower;
      results.donchian_width = dc.width;
      
      // Envelope Channel
      const env = this.envelopeChannel(data, config.env_period || 20, config.env_pct || 2.5);
      results.envelope_upper = env.upper;
      results.envelope_middle = env.middle;
      results.envelope_lower = env.lower;
      
      // Range Indicators
      results.atr = this.atr(data, config.atr_period || 14);
      results.atr_percent = this.atrPercent(data, config.atr_period || 14);
      results.chaikin_volatility = this.chaikinVolatility(data, config.cv_period || 10, config.cv_roc || 10);
      results.standard_deviation = this.standardDeviation(data, config.stddev_period || 20);
      results.historical_volatility = this.historicalVolatility(data, config.hv_period || 20);
      results.price_channel_width = this.priceChannelWidth(data, config.pcw_period || 20);
      
      // Advanced Volatility
      results.volatility_index = this.volatilityIndex(data, config.vi_period || 30);
      
      const vs = this.volatilityStop(data, config.vs_period || 20, config.vs_mult || 2);
      results.volatility_stop_upper = vs.upper;
      results.volatility_stop_lower = vs.lower;
      
      results.market_facilitation = this.marketFacilitationIndex(data);
      results.volatility_ratio = this.volatilityRatio(data, config.vr_short || 10, config.vr_long || 30);
      results.relative_volatility_index = this.relativeVolatilityIndex(data, config.rvi_period || 10);
      results.vertical_horizontal_filter = this.verticalHorizontalFilter(data, config.vhf_period || 28);
      results.choppiness_index = this.choppinessIndex(data, config.chop_period || 14);
      
    } catch (error) {
      console.error('Error calculating volatility indicators:', error);
    }
    
    return results;
  }
}

// Export singleton instance
export const volatilityIndicators = new VolatilityIndicators();
export default volatilityIndicators;