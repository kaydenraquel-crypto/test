import TrendIndicators from './trendIndicators.js';
import MomentumIndicators from './momentumIndicators.js';
import VolatilityIndicators from './volatilityIndicators.js';
import VolumeIndicators from './volumeIndicators.js';
import OnChainMetrics from './onChainMetrics.js';
import CandlestickPatterns from './candlestickPatterns.js';
import ChartPatterns from './chartPatterns.js';

class StrategyEngine {
  static instance = null;
  
  static getInstance() {
    if (!StrategyEngine.instance) {
      StrategyEngine.instance = new StrategyEngine();
    }
    return StrategyEngine.instance;
  }

  constructor() {
    this.trendIndicators = TrendIndicators.getInstance();
    this.momentumIndicators = MomentumIndicators.getInstance();
    this.volatilityIndicators = VolatilityIndicators.getInstance();
    this.volumeIndicators = VolumeIndicators.getInstance();
    this.onChainMetrics = OnChainMetrics.getInstance();
    this.candlestickPatterns = CandlestickPatterns.getInstance();
    this.chartPatterns = ChartPatterns.getInstance();
    
    this.strategies = new Map();
    this.backtestResults = new Map();
    this.portfolios = new Map();
    
    this.initializeDefaultStrategies();
  }

  createStrategy(config) {
    const strategy = {
      id: config.id || this.generateStrategyId(),
      name: config.name || 'Unnamed Strategy',
      description: config.description || '',
      type: config.type || 'multi_signal',
      
      // Entry conditions
      entryConditions: config.entryConditions || [],
      exitConditions: config.exitConditions || [],
      
      // Risk management
      riskManagement: {
        stopLoss: config.riskManagement?.stopLoss || 0.02,
        takeProfit: config.riskManagement?.takeProfit || 0.04,
        positionSize: config.riskManagement?.positionSize || 0.1,
        maxDrawdown: config.riskManagement?.maxDrawdown || 0.15,
        maxPositions: config.riskManagement?.maxPositions || 5
      },
      
      // Strategy parameters
      parameters: config.parameters || {},
      
      // Market conditions
      marketConditions: {
        trending: config.marketConditions?.trending !== false,
        ranging: config.marketConditions?.ranging !== false,
        volatile: config.marketConditions?.volatile !== false,
        lowVolatile: config.marketConditions?.lowVolatile !== false
      },
      
      // Time filters
      timeFilters: config.timeFilters || {},
      
      // Performance tracking
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0
      },
      
      created: new Date(),
      lastUpdated: new Date(),
      active: true
    };
    
    this.strategies.set(strategy.id, strategy);
    return strategy;
  }

  addEntryCondition(strategyId, condition) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) throw new Error(`Strategy ${strategyId} not found`);
    
    const validatedCondition = this.validateCondition(condition);
    strategy.entryConditions.push(validatedCondition);
    strategy.lastUpdated = new Date();
    
    return strategy;
  }

  addExitCondition(strategyId, condition) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) throw new Error(`Strategy ${strategyId} not found`);
    
    const validatedCondition = this.validateCondition(condition);
    strategy.exitConditions.push(validatedCondition);
    strategy.lastUpdated = new Date();
    
    return strategy;
  }

  validateCondition(condition) {
    const requiredFields = ['indicator', 'operator', 'value'];
    
    for (const field of requiredFields) {
      if (!condition[field]) {
        throw new Error(`Condition missing required field: ${field}`);
      }
    }
    
    const validOperators = ['>', '<', '>=', '<=', '==', '!=', 'crossover', 'crossunder', 'between'];
    if (!validOperators.includes(condition.operator)) {
      throw new Error(`Invalid operator: ${condition.operator}`);
    }
    
    return {
      id: condition.id || this.generateConditionId(),
      indicator: condition.indicator,
      parameters: condition.parameters || {},
      operator: condition.operator,
      value: condition.value,
      weight: condition.weight || 1.0,
      lookback: condition.lookback || 1,
      timeframe: condition.timeframe || '1d',
      active: condition.active !== false
    };
  }

  evaluateStrategy(strategyId, marketData, currentPrice, timestamp) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy || !strategy.active) return null;
    
    try {
      const indicators = this.calculateIndicators(marketData);
      const patterns = this.detectPatterns(marketData);
      const marketCondition = this.analyzeMarketCondition(marketData, indicators);
      
      if (!this.isValidMarketCondition(strategy, marketCondition)) {
        return { action: 'hold', reason: 'Invalid market condition' };
      }
      
      const entrySignal = this.evaluateConditions(strategy.entryConditions, indicators, patterns, marketData);
      const exitSignal = this.evaluateConditions(strategy.exitConditions, indicators, patterns, marketData);
      
      let action = 'hold';
      let confidence = 0;
      let signals = [];
      
      if (entrySignal.triggered) {
        action = entrySignal.direction || 'buy';
        confidence = entrySignal.confidence;
        signals = entrySignal.signals;
      } else if (exitSignal.triggered) {
        action = 'sell';
        confidence = exitSignal.confidence;
        signals = exitSignal.signals;
      }
      
      return {
        action,
        confidence,
        signals,
        marketCondition,
        price: currentPrice,
        timestamp,
        strategyId,
        riskMetrics: this.calculateRiskMetrics(strategy, marketData, currentPrice)
      };
      
    } catch (error) {
      console.error(`Strategy evaluation error for ${strategyId}:`, error);
      return { action: 'hold', error: error.message };
    }
  }

  calculateIndicators(data) {
    const indicators = {};
    
    // Trend indicators
    indicators.sma20 = this.trendIndicators.simpleMovingAverage(data, 20);
    indicators.sma50 = this.trendIndicators.simpleMovingAverage(data, 50);
    indicators.ema12 = this.trendIndicators.exponentialMovingAverage(data, 12);
    indicators.ema26 = this.trendIndicators.exponentialMovingAverage(data, 26);
    indicators.macd = this.trendIndicators.macd(data, 12, 26, 9);
    indicators.adx = this.trendIndicators.averageDirectionalIndex(data, 14);
    indicators.parabolicSAR = this.trendIndicators.parabolicSAR(data);
    
    // Momentum indicators
    indicators.rsi = this.momentumIndicators.relativeStrengthIndex(data, 14);
    indicators.stochastic = this.momentumIndicators.stochasticOscillator(data, 14, 3, 3);
    indicators.williams = this.momentumIndicators.williamsR(data, 14);
    indicators.momentum = this.momentumIndicators.momentum(data, 10);
    
    // Volatility indicators
    indicators.bollinger = this.volatilityIndicators.bollingerBands(data, 20, 2);
    indicators.atr = this.volatilityIndicators.averageTrueRange(data, 14);
    indicators.keltner = this.volatilityIndicators.keltnerChannel(data, 20, 2);
    
    // Volume indicators
    indicators.obv = this.volumeIndicators.onBalanceVolume(data);
    indicators.mfi = this.volumeIndicators.moneyFlowIndex(data, 14);
    indicators.vwap = this.volumeIndicators.volumeWeightedAveragePrice(data);
    
    return indicators;
  }

  detectPatterns(data) {
    return {
      candlestick: this.candlestickPatterns.detectPatterns(data),
      chart: this.chartPatterns.detectPatterns(data)
    };
  }

  analyzeMarketCondition(data, indicators) {
    const latest = indicators.adx?.[indicators.adx.length - 1]?.adx || 0;
    const atr = indicators.atr?.[indicators.atr.length - 1]?.atr || 0;
    const avgAtr = this.calculateAverage(indicators.atr?.slice(-20)?.map(d => d.atr) || [0]);
    
    return {
      trending: latest > 25,
      ranging: latest <= 25,
      volatile: atr > avgAtr * 1.5,
      lowVolatile: atr < avgAtr * 0.8,
      adxValue: latest,
      atrRatio: avgAtr > 0 ? atr / avgAtr : 1
    };
  }

  isValidMarketCondition(strategy, condition) {
    const conditions = strategy.marketConditions;
    
    if (condition.trending && !conditions.trending) return false;
    if (condition.ranging && !conditions.ranging) return false;
    if (condition.volatile && !conditions.volatile) return false;
    if (condition.lowVolatile && !conditions.lowVolatile) return false;
    
    return true;
  }

  evaluateConditions(conditions, indicators, patterns, data) {
    if (!conditions || conditions.length === 0) {
      return { triggered: false, confidence: 0, signals: [] };
    }
    
    let totalScore = 0;
    let totalWeight = 0;
    let triggeredSignals = [];
    
    for (const condition of conditions) {
      if (!condition.active) continue;
      
      const result = this.evaluateCondition(condition, indicators, patterns, data);
      
      if (result.triggered) {
        totalScore += result.score * condition.weight;
        totalWeight += condition.weight;
        triggeredSignals.push({
          condition: condition.indicator,
          score: result.score,
          value: result.value,
          target: result.target
        });
      }
    }
    
    const confidence = totalWeight > 0 ? totalScore / totalWeight : 0;
    const triggered = confidence > 0.6; // Minimum confidence threshold
    
    return {
      triggered,
      confidence,
      signals: triggeredSignals,
      direction: this.determineSignalDirection(triggeredSignals)
    };
  }

  evaluateCondition(condition, indicators, patterns, data) {
    const { indicator, operator, value, parameters } = condition;
    
    try {
      let currentValue, targetValue, triggered = false, score = 0;
      
      // Get indicator values
      const indicatorData = indicators[indicator];
      
      if (!indicatorData || indicatorData.length === 0) {
        return { triggered: false, score: 0 };
      }
      
      // Get current and previous values
      const current = indicatorData[indicatorData.length - 1];
      const previous = indicatorData.length > 1 ? indicatorData[indicatorData.length - 2] : null;
      
      // Handle different indicator structures
      if (typeof current === 'object') {
        const field = parameters.field || this.getDefaultField(indicator);
        currentValue = current[field];
        targetValue = value;
      } else {
        currentValue = current;
        targetValue = value;
      }
      
      // Evaluate condition based on operator
      switch (operator) {
        case '>':
          triggered = currentValue > targetValue;
          score = triggered ? Math.min((currentValue - targetValue) / targetValue, 1) : 0;
          break;
          
        case '<':
          triggered = currentValue < targetValue;
          score = triggered ? Math.min((targetValue - currentValue) / targetValue, 1) : 0;
          break;
          
        case '>=':
          triggered = currentValue >= targetValue;
          score = triggered ? 1 : 0;
          break;
          
        case '<=':
          triggered = currentValue <= targetValue;
          score = triggered ? 1 : 0;
          break;
          
        case '==':
          triggered = Math.abs(currentValue - targetValue) < 0.001;
          score = triggered ? 1 : 0;
          break;
          
        case 'crossover':
          if (previous !== null) {
            const prevValue = typeof previous === 'object' ? previous[parameters.field || this.getDefaultField(indicator)] : previous;
            triggered = prevValue <= targetValue && currentValue > targetValue;
            score = triggered ? 1 : 0;
          }
          break;
          
        case 'crossunder':
          if (previous !== null) {
            const prevValue = typeof previous === 'object' ? previous[parameters.field || this.getDefaultField(indicator)] : previous;
            triggered = prevValue >= targetValue && currentValue < targetValue;
            score = triggered ? 1 : 0;
          }
          break;
          
        case 'between':
          const [min, max] = Array.isArray(value) ? value : [value - 5, value + 5];
          triggered = currentValue >= min && currentValue <= max;
          score = triggered ? 1 : 0;
          break;
      }
      
      return {
        triggered,
        score: Math.max(0, Math.min(1, score)), // Normalize score between 0 and 1
        value: currentValue,
        target: targetValue
      };
      
    } catch (error) {
      console.error(`Condition evaluation error:`, error);
      return { triggered: false, score: 0 };
    }
  }

  getDefaultField(indicator) {
    const fieldMap = {
      'rsi': 'rsi',
      'macd': 'macd',
      'stochastic': '%K',
      'bollinger': 'middle',
      'atr': 'atr',
      'obv': 'obv',
      'mfi': 'mfi',
      'adx': 'adx'
    };
    
    return fieldMap[indicator] || 'value';
  }

  determineSignalDirection(signals) {
    // Analyze signal patterns to determine buy/sell direction
    const bullishPatterns = ['crossover', 'oversold_bounce', 'breakout'];
    const bearishPatterns = ['crossunder', 'overbought_reversal', 'breakdown'];
    
    let bullishScore = 0;
    let bearishScore = 0;
    
    signals.forEach(signal => {
      if (signal.score > 0.7) {
        if (bullishPatterns.some(p => signal.condition.includes(p))) {
          bullishScore += signal.score;
        } else if (bearishPatterns.some(p => signal.condition.includes(p))) {
          bearishScore += signal.score;
        }
      }
    });
    
    if (bullishScore > bearishScore) return 'buy';
    if (bearishScore > bullishScore) return 'sell';
    return 'neutral';
  }

  calculateRiskMetrics(strategy, data, currentPrice) {
    const atr = this.volatilityIndicators.averageTrueRange(data, 14);
    const currentATR = atr?.[atr.length - 1]?.atr || 0;
    
    const stopLossPrice = currentPrice * (1 - strategy.riskManagement.stopLoss);
    const takeProfitPrice = currentPrice * (1 + strategy.riskManagement.takeProfit);
    
    const riskRewardRatio = strategy.riskManagement.takeProfit / strategy.riskManagement.stopLoss;
    
    return {
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      riskRewardRatio,
      atrBasedStop: currentPrice - (currentATR * 2),
      positionSize: this.calculatePositionSize(strategy, currentPrice, currentATR),
      maxRisk: strategy.riskManagement.positionSize * strategy.riskManagement.stopLoss
    };
  }

  calculatePositionSize(strategy, price, atr) {
    const accountRisk = strategy.riskManagement.positionSize;
    const stopDistance = price * strategy.riskManagement.stopLoss;
    const atrBasedStop = atr * 2;
    
    const actualStop = Math.max(stopDistance, atrBasedStop);
    const positionSize = (accountRisk * 10000) / actualStop; // Assuming $10,000 account
    
    return Math.min(positionSize, 1000); // Cap position size
  }

  backtest(strategyId, historicalData, options = {}) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) throw new Error(`Strategy ${strategyId} not found`);
    
    const {
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      initialCapital = 10000,
      commission = 0.001
    } = options;
    
    const backtest = {
      id: this.generateBacktestId(),
      strategyId,
      startDate,
      endDate,
      initialCapital,
      commission,
      trades: [],
      equity: [{ date: startDate, value: initialCapital }],
      metrics: {},
      completed: false,
      startTime: new Date()
    };
    
    let currentCapital = initialCapital;
    let position = null;
    let tradeCount = 0;
    
    // Filter historical data by date range
    const filteredData = historicalData.filter(d => 
      new Date(d.time) >= startDate && new Date(d.time) <= endDate
    );
    
    // Process each data point
    for (let i = 50; i < filteredData.length; i++) { // Start after enough data for indicators
      const currentData = filteredData.slice(0, i + 1);
      const currentPoint = filteredData[i];
      const currentPrice = currentPoint.close;
      const timestamp = new Date(currentPoint.time);
      
      try {
        const signal = this.evaluateStrategy(strategyId, currentData, currentPrice, timestamp);
        
        if (!signal || signal.action === 'hold') {
          // Update equity tracking
          if (position) {
            const unrealizedPnL = (currentPrice - position.entryPrice) * position.size;
            const currentEquity = currentCapital + unrealizedPnL;
            backtest.equity.push({ date: timestamp, value: currentEquity });
          }
          continue;
        }
        
        // Handle buy signal
        if (signal.action === 'buy' && !position && signal.confidence > 0.7) {
          const riskMetrics = signal.riskMetrics;
          const positionValue = currentCapital * strategy.riskManagement.positionSize;
          const shares = Math.floor(positionValue / currentPrice);
          
          if (shares > 0) {
            position = {
              id: ++tradeCount,
              type: 'long',
              entryTime: timestamp,
              entryPrice: currentPrice,
              size: shares,
              value: shares * currentPrice,
              stopLoss: riskMetrics.stopLoss,
              takeProfit: riskMetrics.takeProfit,
              commission: shares * currentPrice * commission,
              signals: signal.signals
            };
            
            currentCapital -= position.value + position.commission;
          }
        }
        
        // Handle sell signal or stop loss/take profit
        if (position && (signal.action === 'sell' || 
            currentPrice <= position.stopLoss || 
            currentPrice >= position.takeProfit)) {
          
          const exitPrice = currentPrice;
          const grossPnL = (exitPrice - position.entryPrice) * position.size;
          const exitCommission = position.size * exitPrice * commission;
          const netPnL = grossPnL - position.commission - exitCommission;
          
          const trade = {
            ...position,
            exitTime: timestamp,
            exitPrice,
            exitReason: currentPrice <= position.stopLoss ? 'stop_loss' : 
                       currentPrice >= position.takeProfit ? 'take_profit' : 'signal',
            grossPnL,
            netPnL,
            exitCommission,
            totalCommission: position.commission + exitCommission,
            duration: timestamp - position.entryTime,
            returnPercent: (exitPrice - position.entryPrice) / position.entryPrice * 100
          };
          
          backtest.trades.push(trade);
          currentCapital += (position.size * exitPrice) - exitCommission;
          position = null;
        }
        
        // Update equity
        const currentEquity = position ? 
          currentCapital + ((currentPrice - position.entryPrice) * position.size) : 
          currentCapital;
        
        backtest.equity.push({ date: timestamp, value: currentEquity });
        
      } catch (error) {
        console.error(`Backtest error at ${timestamp}:`, error);
      }
    }
    
    // Close any remaining position
    if (position) {
      const finalPrice = filteredData[filteredData.length - 1].close;
      const finalTimestamp = new Date(filteredData[filteredData.length - 1].time);
      const grossPnL = (finalPrice - position.entryPrice) * position.size;
      const exitCommission = position.size * finalPrice * commission;
      const netPnL = grossPnL - position.commission - exitCommission;
      
      backtest.trades.push({
        ...position,
        exitTime: finalTimestamp,
        exitPrice: finalPrice,
        exitReason: 'end_of_data',
        grossPnL,
        netPnL,
        exitCommission,
        totalCommission: position.commission + exitCommission,
        duration: finalTimestamp - position.entryTime,
        returnPercent: (finalPrice - position.entryPrice) / position.entryPrice * 100
      });
      
      currentCapital += (position.size * finalPrice) - exitCommission;
    }
    
    // Calculate final metrics
    backtest.metrics = this.calculateBacktestMetrics(backtest);
    backtest.finalCapital = currentCapital;
    backtest.completed = true;
    backtest.endTime = new Date();
    
    this.backtestResults.set(backtest.id, backtest);
    return backtest;
  }

  calculateBacktestMetrics(backtest) {
    const trades = backtest.trades;
    const equity = backtest.equity;
    
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalReturn: 0,
        annualizedReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 0
      };
    }
    
    const winningTrades = trades.filter(t => t.netPnL > 0);
    const losingTrades = trades.filter(t => t.netPnL < 0);
    
    const totalPnL = trades.reduce((sum, t) => sum + t.netPnL, 0);
    const totalReturn = (totalPnL / backtest.initialCapital) * 100;
    
    const winRate = (winningTrades.length / trades.length) * 100;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.netPnL, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.netPnL, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = backtest.initialCapital;
    
    for (const point of equity) {
      if (point.value > peak) {
        peak = point.value;
      } else {
        const drawdown = ((peak - point.value) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    // Calculate Sharpe ratio (simplified)
    const returns = [];
    for (let i = 1; i < equity.length; i++) {
      const dailyReturn = (equity[i].value - equity[i-1].value) / equity[i-1].value;
      returns.push(dailyReturn);
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
    
    // Annualized return
    const days = (backtest.endDate - backtest.startDate) / (1000 * 60 * 60 * 24);
    const annualizedReturn = totalReturn * (365 / days);
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: Math.round(winRate * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgTrade: Math.round((totalPnL / trades.length) * 100) / 100,
      bestTrade: Math.max(...trades.map(t => t.netPnL)),
      worstTrade: Math.min(...trades.map(t => t.netPnL)),
      averageWin: winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.netPnL, 0) / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.netPnL, 0) / losingTrades.length : 0
    };
  }

  initializeDefaultStrategies() {
    // Golden Cross Strategy
    this.createStrategy({
      id: 'golden_cross',
      name: 'Golden Cross',
      description: 'SMA 50 crosses above SMA 200 with RSI confirmation',
      entryConditions: [
        {
          indicator: 'sma50',
          operator: 'crossover',
          value: 'sma200',
          weight: 2.0
        },
        {
          indicator: 'rsi',
          operator: '>',
          value: 50,
          weight: 1.0
        }
      ],
      exitConditions: [
        {
          indicator: 'sma50',
          operator: 'crossunder',
          value: 'sma200',
          weight: 2.0
        }
      ]
    });
    
    // RSI Mean Reversion
    this.createStrategy({
      id: 'rsi_mean_reversion',
      name: 'RSI Mean Reversion',
      description: 'Buy oversold, sell overbought with volume confirmation',
      entryConditions: [
        {
          indicator: 'rsi',
          operator: '<',
          value: 30,
          weight: 2.0
        },
        {
          indicator: 'obv',
          operator: '>',
          value: 'sma_obv_10',
          weight: 1.0
        }
      ],
      exitConditions: [
        {
          indicator: 'rsi',
          operator: '>',
          value: 70,
          weight: 2.0
        }
      ]
    });
    
    // Bollinger Band Breakout
    this.createStrategy({
      id: 'bollinger_breakout',
      name: 'Bollinger Band Breakout',
      description: 'Price breaks Bollinger Bands with volume surge',
      entryConditions: [
        {
          indicator: 'bollinger',
          parameters: { field: 'upper' },
          operator: 'crossover',
          value: 'close',
          weight: 2.0
        },
        {
          indicator: 'volume',
          operator: '>',
          value: 'avg_volume_20',
          weight: 1.5
        }
      ],
      exitConditions: [
        {
          indicator: 'bollinger',
          parameters: { field: 'middle' },
          operator: 'crossunder',
          value: 'close',
          weight: 1.0
        }
      ]
    });
  }

  // Utility methods
  generateStrategyId() {
    return 'strategy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateConditionId() {
    return 'condition_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateBacktestId() {
    return 'backtest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Public API methods
  getStrategy(id) {
    return this.strategies.get(id);
  }

  getAllStrategies() {
    return Array.from(this.strategies.values());
  }

  getBacktestResult(id) {
    return this.backtestResults.get(id);
  }

  getAllBacktestResults() {
    return Array.from(this.backtestResults.values());
  }

  deleteStrategy(id) {
    return this.strategies.delete(id);
  }

  deleteBacktestResult(id) {
    return this.backtestResults.delete(id);
  }
}

export default StrategyEngine;