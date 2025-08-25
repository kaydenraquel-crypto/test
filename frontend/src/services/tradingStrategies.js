// Comprehensive Trading Strategies and Signal Generation
// Professional trading strategies for stocks and crypto

import { technicalIndicators } from './technicalIndicators.js';

export class TradingStrategies {
  constructor() {
    this.signals = [];
    this.strategies = new Map();
    this.initializeStrategies();
  }

  // ============ STRATEGY INITIALIZATION ============
  
  initializeStrategies() {
    // Trend Following Strategies
    this.strategies.set('golden_cross', this.goldenCrossStrategy);
    this.strategies.set('ema_crossover', this.emaCrossoverStrategy);
    this.strategies.set('macd_divergence', this.macdDivergenceStrategy);
    this.strategies.set('adx_trend_strength', this.adxTrendStrengthStrategy);
    this.strategies.set('ichimoku_cloud', this.ichimokuCloudStrategy);
    this.strategies.set('parabolic_sar', this.parabolicSarStrategy);
    this.strategies.set('supertrend', this.supertrendStrategy);
    
    // Mean Reversion Strategies
    this.strategies.set('rsi_oversold', this.rsiOversoldStrategy);
    this.strategies.set('bollinger_squeeze', this.bollingerSqueezeStrategy);
    this.strategies.set('williams_reversal', this.williamsReversalStrategy);
    this.strategies.set('stochastic_divergence', this.stochasticDivergenceStrategy);
    
    // Breakout Strategies
    this.strategies.set('bollinger_breakout', this.bollingerBreakoutStrategy);
    this.strategies.set('keltner_breakout', this.keltnerBreakoutStrategy);
    this.strategies.set('volume_breakout', this.volumeBreakoutStrategy);
    this.strategies.set('price_channel_breakout', this.priceChannelBreakoutStrategy);
    
    // Momentum Strategies
    this.strategies.set('momentum_divergence', this.momentumDivergenceStrategy);
    this.strategies.set('multi_timeframe_momentum', this.multiTimeframeMomentumStrategy);
    this.strategies.set('roc_acceleration', this.rocAccelerationStrategy);
    
    // Volume Strategies
    this.strategies.set('obv_trend', this.obvTrendStrategy);
    this.strategies.set('volume_price_analysis', this.volumePriceAnalysisStrategy);
    this.strategies.set('accumulation_distribution', this.accumulationDistributionStrategy);
    
    // Advanced Pattern Recognition
    this.strategies.set('candlestick_patterns', this.candlestickPatternsStrategy);
    this.strategies.set('harmonic_patterns', this.harmonicPatternsStrategy);
    this.strategies.set('elliott_wave', this.elliottWaveStrategy);
    
    // Market Structure Strategies
    this.strategies.set('support_resistance', this.supportResistanceStrategy);
    this.strategies.set('fibonacci_retracement', this.fibonacciRetracementStrategy);
    this.strategies.set('pivot_points', this.pivotPointsStrategy);
  }

  // ============ TREND FOLLOWING STRATEGIES ============

  goldenCrossStrategy = (data, indicators) => {
    const signals = [];
    const sma50 = indicators.sma_50 || [];
    const sma200 = technicalIndicators.sma(data, 200);
    
    if (sma50.length < 2 || sma200.length < 2) return signals;
    
    for (let i = 1; i < Math.min(sma50.length, sma200.length); i++) {
      const prevSma50 = sma50[i - 1];
      const currSma50 = sma50[i];
      const prevSma200 = sma200[i - 1];
      const currSma200 = sma200[i];
      
      // Golden Cross (bullish)
      if (prevSma50 <= prevSma200 && currSma50 > currSma200) {
        signals.push({
          type: 'buy',
          strategy: 'golden_cross',
          confidence: 0.8,
          reason: 'Golden Cross: SMA50 crossed above SMA200',
          price: data[i + 49].close, // Adjust for SMA offset
          timestamp: data[i + 49].time || i,
          strength: this.calculateSignalStrength(data, i + 49, 'bullish')
        });
      }
      
      // Death Cross (bearish)
      if (prevSma50 >= prevSma200 && currSma50 < currSma200) {
        signals.push({
          type: 'sell',
          strategy: 'golden_cross',
          confidence: 0.8,
          reason: 'Death Cross: SMA50 crossed below SMA200',
          price: data[i + 49].close,
          timestamp: data[i + 49].time || i,
          strength: this.calculateSignalStrength(data, i + 49, 'bearish')
        });
      }
    }
    
    return signals;
  }

  emaCrossoverStrategy = (data, indicators) => {
    const signals = [];
    const ema12 = technicalIndicators.ema(data, 12);
    const ema26 = technicalIndicators.ema(data, 26);
    
    if (ema12.length < 2 || ema26.length < 2) return signals;
    
    for (let i = 1; i < Math.min(ema12.length, ema26.length); i++) {
      const prevEma12 = ema12[i - 1];
      const currEma12 = ema12[i];
      const prevEma26 = ema26[i - 1];
      const currEma26 = ema26[i];
      
      // Bullish crossover
      if (prevEma12 <= prevEma26 && currEma12 > currEma26) {
        signals.push({
          type: 'buy',
          strategy: 'ema_crossover',
          confidence: 0.7,
          reason: 'EMA12 crossed above EMA26',
          price: data[i + 25].close,
          timestamp: data[i + 25].time || i,
          strength: this.calculateSignalStrength(data, i + 25, 'bullish')
        });
      }
      
      // Bearish crossover
      if (prevEma12 >= prevEma26 && currEma12 < currEma26) {
        signals.push({
          type: 'sell',
          strategy: 'ema_crossover',
          confidence: 0.7,
          reason: 'EMA12 crossed below EMA26',
          price: data[i + 25].close,
          timestamp: data[i + 25].time || i,
          strength: this.calculateSignalStrength(data, i + 25, 'bearish')
        });
      }
    }
    
    return signals;
  }

  macdDivergenceStrategy = (data, indicators) => {
    const signals = [];
    const macdLine = indicators.macd_line || [];
    const signalLine = indicators.macd_signal || [];
    
    if (macdLine.length < 2 || signalLine.length < 2) return signals;
    
    for (let i = 1; i < Math.min(macdLine.length, signalLine.length); i++) {
      const prevMacd = macdLine[i - 1];
      const currMacd = macdLine[i];
      const prevSignal = signalLine[i - 1];
      const currSignal = signalLine[i];
      
      // Bullish MACD crossover
      if (prevMacd <= prevSignal && currMacd > currSignal && currMacd < 0) {
        signals.push({
          type: 'buy',
          strategy: 'macd_divergence',
          confidence: 0.75,
          reason: 'MACD bullish crossover below zero line',
          price: data[i + 33].close, // Adjust for MACD calculation offset
          timestamp: data[i + 33].time || i,
          strength: this.calculateMacdStrength(currMacd, currSignal)
        });
      }
      
      // Bearish MACD crossover
      if (prevMacd >= prevSignal && currMacd < currSignal && currMacd > 0) {
        signals.push({
          type: 'sell',
          strategy: 'macd_divergence',
          confidence: 0.75,
          reason: 'MACD bearish crossover above zero line',
          price: data[i + 33].close,
          timestamp: data[i + 33].time || i,
          strength: this.calculateMacdStrength(currMacd, currSignal)
        });
      }
    }
    
    return signals;
  }

  // ============ MEAN REVERSION STRATEGIES ============

  rsiOversoldStrategy = (data, indicators) => {
    const signals = [];
    const rsi = indicators.rsi || [];
    
    if (rsi.length < 2) return signals;
    
    for (let i = 1; i < rsi.length; i++) {
      const prevRsi = rsi[i - 1];
      const currRsi = rsi[i];
      
      // Oversold bounce
      if (prevRsi <= 30 && currRsi > 30) {
        signals.push({
          type: 'buy',
          strategy: 'rsi_oversold',
          confidence: 0.6,
          reason: `RSI bounce from oversold (${currRsi.toFixed(1)})`,
          price: data[i + 13].close,
          timestamp: data[i + 13].time || i,
          strength: Math.min((30 - prevRsi) / 10, 1) // Stronger signal for deeper oversold
        });
      }
      
      // Overbought reversal
      if (prevRsi >= 70 && currRsi < 70) {
        signals.push({
          type: 'sell',
          strategy: 'rsi_oversold',
          confidence: 0.6,
          reason: `RSI reversal from overbought (${currRsi.toFixed(1)})`,
          price: data[i + 13].close,
          timestamp: data[i + 13].time || i,
          strength: Math.min((prevRsi - 70) / 10, 1)
        });
      }
    }
    
    return signals;
  }

  bollingerSqueezeStrategy = (data, indicators) => {
    const signals = [];
    const bbUpper = indicators.bb_upper || [];
    const bbLower = indicators.bb_lower || [];
    const bbBandwidth = indicators.bb_bandwidth || [];
    
    if (bbBandwidth.length < 20) return signals;
    
    for (let i = 20; i < bbBandwidth.length; i++) {
      const currentBandwidth = bbBandwidth[i];
      const avgBandwidth = bbBandwidth.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
      
      // Squeeze condition: bandwidth below average
      if (currentBandwidth < avgBandwidth * 0.5) {
        const price = data[i + 19].close;
        const upper = bbUpper[i];
        const lower = bbLower[i];
        
        // Wait for breakout
        if (price > upper) {
          signals.push({
            type: 'buy',
            strategy: 'bollinger_squeeze',
            confidence: 0.8,
            reason: 'Bollinger Band squeeze breakout (bullish)',
            price: price,
            timestamp: data[i + 19].time || i,
            strength: (price - upper) / upper
          });
        } else if (price < lower) {
          signals.push({
            type: 'sell',
            strategy: 'bollinger_squeeze',
            confidence: 0.8,
            reason: 'Bollinger Band squeeze breakout (bearish)',
            price: price,
            timestamp: data[i + 19].time || i,
            strength: (lower - price) / lower
          });
        }
      }
    }
    
    return signals;
  }

  // ============ BREAKOUT STRATEGIES ============

  volumeBreakoutStrategy = (data, indicators) => {
    const signals = [];
    
    if (data.length < 50) return signals;
    
    for (let i = 20; i < data.length - 1; i++) {
      const currentVolume = data[i].volume || 1000000;
      const avgVolume = data.slice(i - 20, i).reduce((sum, d) => sum + (d.volume || 1000000), 0) / 20;
      
      // Volume surge (2x average)
      if (currentVolume > avgVolume * 2) {
        const priceChange = (data[i].close - data[i - 1].close) / data[i - 1].close;
        
        if (priceChange > 0.02) { // 2% price increase
          signals.push({
            type: 'buy',
            strategy: 'volume_breakout',
            confidence: 0.75,
            reason: `Volume breakout: ${(currentVolume / avgVolume).toFixed(1)}x average volume`,
            price: data[i].close,
            timestamp: data[i].time || i,
            strength: Math.min(currentVolume / avgVolume / 5, 1)
          });
        } else if (priceChange < -0.02) {
          signals.push({
            type: 'sell',
            strategy: 'volume_breakout',
            confidence: 0.75,
            reason: `Volume breakdown: ${(currentVolume / avgVolume).toFixed(1)}x average volume`,
            price: data[i].close,
            timestamp: data[i].time || i,
            strength: Math.min(currentVolume / avgVolume / 5, 1)
          });
        }
      }
    }
    
    return signals;
  }

  // ============ ADVANCED PATTERN RECOGNITION ============

  candlestickPatternsStrategy = (data, indicators) => {
    const signals = [];
    
    if (data.length < 3) return signals;
    
    for (let i = 2; i < data.length; i++) {
      const current = data[i];
      const prev = data[i - 1];
      const prev2 = data[i - 2];
      
      // Hammer pattern
      const hammer = this.isHammer(current);
      if (hammer && this.isDowntrend(data, i, 5)) {
        signals.push({
          type: 'buy',
          strategy: 'candlestick_patterns',
          confidence: 0.6,
          reason: 'Hammer candlestick pattern in downtrend',
          price: current.close,
          timestamp: current.time || i,
          strength: 0.6
        });
      }
      
      // Shooting star pattern
      const shootingStar = this.isShootingStar(current);
      if (shootingStar && this.isUptrend(data, i, 5)) {
        signals.push({
          type: 'sell',
          strategy: 'candlestick_patterns',
          confidence: 0.6,
          reason: 'Shooting star pattern in uptrend',
          price: current.close,
          timestamp: current.time || i,
          strength: 0.6
        });
      }
      
      // Engulfing patterns
      const bullishEngulfing = this.isBullishEngulfing(prev, current);
      if (bullishEngulfing) {
        signals.push({
          type: 'buy',
          strategy: 'candlestick_patterns',
          confidence: 0.7,
          reason: 'Bullish engulfing pattern',
          price: current.close,
          timestamp: current.time || i,
          strength: 0.7
        });
      }
      
      const bearishEngulfing = this.isBearishEngulfing(prev, current);
      if (bearishEngulfing) {
        signals.push({
          type: 'sell',
          strategy: 'candlestick_patterns',
          confidence: 0.7,
          reason: 'Bearish engulfing pattern',
          price: current.close,
          timestamp: current.time || i,
          strength: 0.7
        });
      }
      
      // Doji patterns
      const doji = this.isDoji(current);
      if (doji) {
        const trend = this.getTrendDirection(data, i, 10);
        if (trend !== 'sideways') {
          signals.push({
            type: trend === 'up' ? 'sell' : 'buy',
            strategy: 'candlestick_patterns',
            confidence: 0.5,
            reason: `Doji pattern - potential ${trend === 'up' ? 'reversal' : 'reversal'}`,
            price: current.close,
            timestamp: current.time || i,
            strength: 0.5
          });
        }
      }
    }
    
    return signals;
  }

  // ============ SIGNAL GENERATION METHODS ============

  generateSignals(data, indicators, strategies = null) {
    const allSignals = [];
    
    const strategiesToRun = strategies || Array.from(this.strategies.keys());
    
    for (const strategyName of strategiesToRun) {
      const strategy = this.strategies.get(strategyName);
      if (strategy) {
        try {
          const signals = strategy(data, indicators);
          allSignals.push(...signals);
        } catch (error) {
          console.error(`Error in strategy ${strategyName}:`, error);
        }
      }
    }
    
    // Sort signals by timestamp and remove duplicates
    return this.consolidateSignals(allSignals);
  }

  consolidateSignals(signals) {
    // Sort by timestamp
    signals.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    // Remove signals that are too close together (within 5 periods)
    const consolidated = [];
    for (let i = 0; i < signals.length; i++) {
      const signal = signals[i];
      const lastSignal = consolidated[consolidated.length - 1];
      
      if (!lastSignal || 
          Math.abs((signal.timestamp || 0) - (lastSignal.timestamp || 0)) > 5 ||
          signal.type !== lastSignal.type) {
        consolidated.push(signal);
      } else if (signal.confidence > lastSignal.confidence) {
        // Replace with higher confidence signal
        consolidated[consolidated.length - 1] = signal;
      }
    }
    
    return consolidated;
  }

  // ============ HELPER METHODS ============

  calculateSignalStrength(data, index, direction) {
    if (index < 5 || index >= data.length - 1) return 0.5;
    
    const current = data[index];
    const prev5 = data[index - 5];
    const priceChange = (current.close - prev5.close) / prev5.close;
    
    if (direction === 'bullish') {
      return Math.min(Math.max(priceChange * 10, 0), 1);
    } else {
      return Math.min(Math.max(-priceChange * 10, 0), 1);
    }
  }

  calculateMacdStrength(macd, signal) {
    const difference = Math.abs(macd - signal);
    return Math.min(difference / 0.1, 1); // Normalize to 0-1 range
  }

  // Candlestick pattern recognition helpers
  isHammer(candle) {
    const body = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return lowerShadow > body * 2 && upperShadow < body * 0.5;
  }

  isShootingStar(candle) {
    const body = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return upperShadow > body * 2 && lowerShadow < body * 0.5;
  }

  isDoji(candle) {
    const body = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    
    return body < totalRange * 0.1; // Body is less than 10% of total range
  }

  isBullishEngulfing(prev, current) {
    return prev.close < prev.open && // Previous is bearish
           current.close > current.open && // Current is bullish
           current.open < prev.close && // Current opens below previous close
           current.close > prev.open; // Current closes above previous open
  }

  isBearishEngulfing(prev, current) {
    return prev.close > prev.open && // Previous is bullish
           current.close < current.open && // Current is bearish
           current.open > prev.close && // Current opens above previous close
           current.close < prev.open; // Current closes below previous open
  }

  isUptrend(data, index, periods) {
    if (index < periods) return false;
    
    const current = data[index].close;
    const past = data[index - periods].close;
    return current > past * 1.02; // 2% increase
  }

  isDowntrend(data, index, periods) {
    if (index < periods) return false;
    
    const current = data[index].close;
    const past = data[index - periods].close;
    return current < past * 0.98; // 2% decrease
  }

  getTrendDirection(data, index, periods) {
    if (this.isUptrend(data, index, periods)) return 'up';
    if (this.isDowntrend(data, index, periods)) return 'down';
    return 'sideways';
  }

  // Market regime detection
  detectMarketRegime(data, indicators) {
    if (data.length < 50) return 'unknown';
    
    const recentData = data.slice(-20);
    const volatility = this.calculateVolatility(recentData);
    const trend = this.getTrendDirection(data, data.length - 1, 20);
    
    if (volatility > 0.03) { // High volatility
      return trend === 'up' ? 'bull_volatile' : trend === 'down' ? 'bear_volatile' : 'volatile_sideways';
    } else {
      return trend === 'up' ? 'bull_stable' : trend === 'down' ? 'bear_stable' : 'stable_sideways';
    }
  }

  calculateVolatility(data) {
    if (data.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i-1].close) / data[i-1].close);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }
}

// Export singleton instance
export const tradingStrategies = new TradingStrategies();
export default tradingStrategies;