class PortfolioManager {
  static instance = null;
  
  static getInstance() {
    if (!PortfolioManager.instance) {
      PortfolioManager.instance = new PortfolioManager();
    }
    return PortfolioManager.instance;
  }

  constructor() {
    this.portfolios = new Map();
    this.positions = new Map();
    this.orders = new Map();
    this.riskManager = new RiskManager();
    
    this.initializeDefaultPortfolio();
  }

  createPortfolio(config) {
    const portfolio = {
      id: config.id || this.generatePortfolioId(),
      name: config.name || 'Unnamed Portfolio',
      description: config.description || '',
      
      // Capital management
      initialCapital: config.initialCapital || 10000,
      currentCapital: config.currentCapital || config.initialCapital || 10000,
      availableCapital: config.availableCapital || config.initialCapital || 10000,
      totalValue: config.initialCapital || 10000,
      
      // Risk settings
      riskSettings: {
        maxPortfolioRisk: config.riskSettings?.maxPortfolioRisk || 0.02,
        maxPositionRisk: config.riskSettings?.maxPositionRisk || 0.01,
        maxDrawdown: config.riskSettings?.maxDrawdown || 0.15,
        maxPositions: config.riskSettings?.maxPositions || 10,
        maxCorrelation: config.riskSettings?.maxCorrelation || 0.7,
        stopLossType: config.riskSettings?.stopLossType || 'percentage', // percentage, atr, volatility
        takeProfitRatio: config.riskSettings?.takeProfitRatio || 2.0
      },
      
      // Position sizing
      positionSizing: {
        method: config.positionSizing?.method || 'fixed_percent', // fixed_percent, kelly, volatility, equal_weight
        baseSize: config.positionSizing?.baseSize || 0.1,
        maxSize: config.positionSizing?.maxSize || 0.2,
        minSize: config.positionSizing?.minSize || 0.01
      },
      
      // Performance tracking
      performance: {
        totalReturn: 0,
        annualizedReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        calmarRatio: 0,
        volatility: 0,
        beta: 0,
        alpha: 0
      },
      
      // Holdings and history
      positions: [],
      closedPositions: [],
      orders: [],
      cashFlows: [{
        date: new Date(),
        type: 'deposit',
        amount: config.initialCapital || 10000,
        balance: config.initialCapital || 10000
      }],
      
      // Metadata
      created: new Date(),
      lastUpdated: new Date(),
      active: true,
      currency: config.currency || 'USD',
      benchmark: config.benchmark || 'SPY'
    };
    
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  addPosition(portfolioId, positionConfig) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) throw new Error(`Portfolio ${portfolioId} not found`);
    
    const position = {
      id: positionConfig.id || this.generatePositionId(),
      portfolioId,
      symbol: positionConfig.symbol,
      side: positionConfig.side || 'long', // long, short
      
      // Entry details
      entryTime: positionConfig.entryTime || new Date(),
      entryPrice: positionConfig.entryPrice,
      quantity: positionConfig.quantity,
      entryValue: positionConfig.entryPrice * positionConfig.quantity,
      
      // Risk management
      stopLoss: positionConfig.stopLoss,
      takeProfit: positionConfig.takeProfit,
      trailingStop: positionConfig.trailingStop,
      
      // Current status
      currentPrice: positionConfig.currentPrice || positionConfig.entryPrice,
      currentValue: (positionConfig.currentPrice || positionConfig.entryPrice) * positionConfig.quantity,
      unrealizedPnL: 0,
      realizedPnL: 0,
      
      // Strategy information
      strategyId: positionConfig.strategyId,
      signals: positionConfig.signals || [],
      
      // Metadata
      status: 'open', // open, closed, pending
      source: positionConfig.source || 'manual',
      tags: positionConfig.tags || [],
      notes: positionConfig.notes || ''
    };
    
    // Validate position
    if (!this.validatePosition(portfolio, position)) {
      throw new Error('Position validation failed');
    }
    
    // Update portfolio
    portfolio.availableCapital -= position.entryValue;
    portfolio.positions.push(position.id);
    portfolio.lastUpdated = new Date();
    
    this.positions.set(position.id, position);
    return position;
  }

  closePosition(positionId, exitPrice, exitTime = new Date()) {
    const position = this.positions.get(positionId);
    if (!position) throw new Error(`Position ${positionId} not found`);
    
    const portfolio = this.portfolios.get(position.portfolioId);
    if (!portfolio) throw new Error(`Portfolio ${position.portfolioId} not found`);
    
    // Calculate final P&L
    const exitValue = exitPrice * position.quantity;
    const grossPnL = position.side === 'long' ? 
      exitValue - position.entryValue : 
      position.entryValue - exitValue;
    
    const commission = this.calculateCommission(position.entryValue) + this.calculateCommission(exitValue);
    const netPnL = grossPnL - commission;
    
    // Update position
    position.status = 'closed';
    position.exitTime = exitTime;
    position.exitPrice = exitPrice;
    position.exitValue = exitValue;
    position.grossPnL = grossPnL;
    position.netPnL = netPnL;
    position.commission = commission;
    position.holdingPeriod = exitTime - position.entryTime;
    position.returnPercent = (grossPnL / position.entryValue) * 100;
    
    // Update portfolio
    portfolio.availableCapital += exitValue;
    portfolio.currentCapital += netPnL;
    portfolio.positions = portfolio.positions.filter(id => id !== positionId);
    portfolio.closedPositions.push(positionId);
    portfolio.lastUpdated = new Date();
    
    // Add cash flow
    portfolio.cashFlows.push({
      date: exitTime,
      type: 'trade_pnl',
      amount: netPnL,
      balance: portfolio.currentCapital,
      positionId: positionId
    });
    
    this.updatePortfolioPerformance(portfolio.id);
    return position;
  }

  updatePosition(positionId, currentPrice, timestamp = new Date()) {
    const position = this.positions.get(positionId);
    if (!position || position.status !== 'open') return null;
    
    const portfolio = this.portfolios.get(position.portfolioId);
    if (!portfolio) return null;
    
    // Update current values
    position.currentPrice = currentPrice;
    position.currentValue = currentPrice * position.quantity;
    
    // Calculate unrealized P&L
    position.unrealizedPnL = position.side === 'long' ?
      (currentPrice - position.entryPrice) * position.quantity :
      (position.entryPrice - currentPrice) * position.quantity;
    
    // Check stop loss and take profit
    const shouldClose = this.checkExitConditions(position, currentPrice);
    if (shouldClose.exit) {
      this.closePosition(positionId, currentPrice, timestamp);
      return { position, action: 'closed', reason: shouldClose.reason };
    }
    
    // Update trailing stop
    if (position.trailingStop) {
      this.updateTrailingStop(position, currentPrice);
    }
    
    return { position, action: 'updated' };
  }

  checkExitConditions(position, currentPrice) {
    // Stop loss check
    if (position.stopLoss) {
      const hitStopLoss = position.side === 'long' ?
        currentPrice <= position.stopLoss :
        currentPrice >= position.stopLoss;
      
      if (hitStopLoss) {
        return { exit: true, reason: 'stop_loss' };
      }
    }
    
    // Take profit check
    if (position.takeProfit) {
      const hitTakeProfit = position.side === 'long' ?
        currentPrice >= position.takeProfit :
        currentPrice <= position.takeProfit;
      
      if (hitTakeProfit) {
        return { exit: true, reason: 'take_profit' };
      }
    }
    
    return { exit: false };
  }

  updateTrailingStop(position, currentPrice) {
    if (!position.trailingStop || !position.trailingStop.active) return;
    
    const { distance, type } = position.trailingStop; // distance can be percentage or absolute
    
    if (position.side === 'long') {
      const newStopPrice = type === 'percentage' ?
        currentPrice * (1 - distance) :
        currentPrice - distance;
      
      if (newStopPrice > position.stopLoss) {
        position.stopLoss = newStopPrice;
        position.trailingStop.lastUpdate = new Date();
      }
    } else {
      const newStopPrice = type === 'percentage' ?
        currentPrice * (1 + distance) :
        currentPrice + distance;
      
      if (newStopPrice < position.stopLoss) {
        position.stopLoss = newStopPrice;
        position.trailingStop.lastUpdate = new Date();
      }
    }
  }

  calculatePositionSize(portfolioId, symbol, entryPrice, riskAmount, stopLoss) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) throw new Error(`Portfolio ${portfolioId} not found`);
    
    const method = portfolio.positionSizing.method;
    let size = 0;
    
    switch (method) {
      case 'fixed_percent':
        size = (portfolio.availableCapital * portfolio.positionSizing.baseSize) / entryPrice;
        break;
        
      case 'volatility':
        // Use ATR-based sizing
        const atrMultiplier = 2.0;
        const atr = riskAmount || (entryPrice * 0.02); // Default 2% if no ATR provided
        size = (portfolio.availableCapital * portfolio.positionSizing.baseSize) / (atrMultiplier * atr);
        break;
        
      case 'risk_parity':
        // Size based on risk per trade
        const riskPerTrade = portfolio.currentCapital * portfolio.riskSettings.maxPositionRisk;
        const stopDistance = Math.abs(entryPrice - stopLoss);
        size = stopDistance > 0 ? riskPerTrade / stopDistance : 0;
        break;
        
      case 'kelly':
        // Simplified Kelly Criterion (requires win rate and avg win/loss data)
        const winRate = portfolio.performance.winRate || 0.5;
        const avgWin = 1.5; // Average win multiplier
        const avgLoss = 1.0; // Average loss multiplier
        const kellyPercent = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
        const safeKelly = Math.max(0, Math.min(kellyPercent * 0.25, portfolio.positionSizing.maxSize)); // 25% of Kelly
        size = (portfolio.availableCapital * safeKelly) / entryPrice;
        break;
        
      case 'equal_weight':
        const maxPositions = portfolio.riskSettings.maxPositions;
        size = (portfolio.availableCapital / maxPositions) / entryPrice;
        break;
        
      default:
        size = (portfolio.availableCapital * portfolio.positionSizing.baseSize) / entryPrice;
    }
    
    // Apply size constraints
    const maxSize = (portfolio.availableCapital * portfolio.positionSizing.maxSize) / entryPrice;
    const minSize = (portfolio.availableCapital * portfolio.positionSizing.minSize) / entryPrice;
    
    return Math.max(minSize, Math.min(size, maxSize));
  }

  validatePosition(portfolio, position) {
    // Check available capital
    if (position.entryValue > portfolio.availableCapital) {
      console.warn('Insufficient capital for position');
      return false;
    }
    
    // Check max positions
    if (portfolio.positions.length >= portfolio.riskSettings.maxPositions) {
      console.warn('Maximum positions reached');
      return false;
    }
    
    // Check position size limits
    const positionRisk = position.entryValue / portfolio.currentCapital;
    if (positionRisk > portfolio.riskSettings.maxPositionRisk) {
      console.warn('Position size exceeds risk limit');
      return false;
    }
    
    // Check portfolio risk
    const portfolioRisk = this.calculatePortfolioRisk(portfolio.id);
    if (portfolioRisk > portfolio.riskSettings.maxPortfolioRisk) {
      console.warn('Portfolio risk limit exceeded');
      return false;
    }
    
    return true;
  }

  calculatePortfolioRisk(portfolioId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return 0;
    
    let totalRisk = 0;
    
    for (const positionId of portfolio.positions) {
      const position = this.positions.get(positionId);
      if (position && position.status === 'open') {
        const positionRisk = Math.abs(position.unrealizedPnL) / portfolio.currentCapital;
        totalRisk += positionRisk;
      }
    }
    
    return totalRisk;
  }

  updatePortfolioPerformance(portfolioId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return;
    
    // Get all closed positions
    const closedPositions = portfolio.closedPositions.map(id => this.positions.get(id)).filter(Boolean);
    
    if (closedPositions.length === 0) return;
    
    // Calculate basic metrics
    const totalTrades = closedPositions.length;
    const winningTrades = closedPositions.filter(p => p.netPnL > 0);
    const losingTrades = closedPositions.filter(p => p.netPnL <= 0);
    
    const totalPnL = closedPositions.reduce((sum, p) => sum + p.netPnL, 0);
    const totalReturn = (totalPnL / portfolio.initialCapital) * 100;
    
    const winRate = (winningTrades.length / totalTrades) * 100;
    
    const grossProfit = winningTrades.reduce((sum, p) => sum + p.netPnL, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, p) => sum + p.netPnL, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    // Calculate returns for time-based metrics
    const returns = this.calculateDailyReturns(portfolio);
    
    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = volatility > 0 ? (avgReturn / volatility) * Math.sqrt(252) : 0;
    
    // Calculate maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown(portfolio);
    
    // Annualized return
    const daysSinceStart = (new Date() - portfolio.created) / (1000 * 60 * 60 * 24);
    const annualizedReturn = daysSinceStart > 0 ? totalReturn * (365 / daysSinceStart) : 0;
    
    // Calmar ratio
    const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
    
    // Update performance metrics
    portfolio.performance = {
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      calmarRatio: Math.round(calmarRatio * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      totalTrades: totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin: winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? grossLoss / losingTrades.length : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(p => p.netPnL)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(p => p.netPnL)) : 0
    };
    
    portfolio.lastUpdated = new Date();
  }

  calculateDailyReturns(portfolio) {
    const cashFlows = [...portfolio.cashFlows].sort((a, b) => a.date - b.date);
    const returns = [];
    
    for (let i = 1; i < cashFlows.length; i++) {
      const currentBalance = cashFlows[i].balance;
      const previousBalance = cashFlows[i - 1].balance;
      
      if (previousBalance > 0) {
        const dailyReturn = (currentBalance - previousBalance) / previousBalance;
        returns.push(dailyReturn);
      }
    }
    
    return returns;
  }

  calculateVolatility(returns) {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / (returns.length - 1);
    
    return Math.sqrt(variance);
  }

  calculateMaxDrawdown(portfolio) {
    const cashFlows = [...portfolio.cashFlows].sort((a, b) => a.date - b.date);
    let maxDrawdown = 0;
    let peak = portfolio.initialCapital;
    
    for (const flow of cashFlows) {
      if (flow.balance > peak) {
        peak = flow.balance;
      } else {
        const drawdown = ((peak - flow.balance) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  }

  calculateCommission(value) {
    // Simple commission calculation - can be made more sophisticated
    const commissionRate = 0.001; // 0.1%
    return value * commissionRate;
  }

  initializeDefaultPortfolio() {
    this.createPortfolio({
      id: 'default',
      name: 'Default Portfolio',
      description: 'Default trading portfolio',
      initialCapital: 10000
    });
  }

  // Utility methods
  generatePortfolioId() {
    return 'portfolio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generatePositionId() {
    return 'position_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Public API methods
  getPortfolio(id) {
    return this.portfolios.get(id);
  }

  getAllPortfolios() {
    return Array.from(this.portfolios.values());
  }

  getPosition(id) {
    return this.positions.get(id);
  }

  getPortfolioPositions(portfolioId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return [];
    
    return portfolio.positions.map(id => this.positions.get(id)).filter(Boolean);
  }

  getPortfolioValue(portfolioId) {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return 0;
    
    const openPositions = this.getPortfolioPositions(portfolioId);
    const positionsValue = openPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
    
    return portfolio.availableCapital + positionsValue;
  }

  deletePortfolio(id) {
    const portfolio = this.portfolios.get(id);
    if (portfolio) {
      // Close all positions first
      for (const positionId of portfolio.positions) {
        this.positions.delete(positionId);
      }
      for (const positionId of portfolio.closedPositions) {
        this.positions.delete(positionId);
      }
    }
    
    return this.portfolios.delete(id);
  }
}

// Risk Management Helper Class
class RiskManager {
  constructor() {
    this.correlationMatrix = new Map();
  }

  calculatePositionRisk(position, portfolio) {
    const positionValue = position.currentValue || position.entryValue;
    return positionValue / portfolio.currentCapital;
  }

  calculatePortfolioHeatMap(portfolioId, portfolioManager) {
    const positions = portfolioManager.getPortfolioPositions(portfolioId);
    const heatMap = {};
    
    positions.forEach(position => {
      const risk = Math.abs(position.unrealizedPnL) / position.entryValue;
      heatMap[position.symbol] = {
        risk: risk,
        value: position.currentValue,
        pnl: position.unrealizedPnL,
        riskLevel: risk > 0.1 ? 'high' : risk > 0.05 ? 'medium' : 'low'
      };
    });
    
    return heatMap;
  }

  generateRiskReport(portfolioId, portfolioManager) {
    const portfolio = portfolioManager.getPortfolio(portfolioId);
    const positions = portfolioManager.getPortfolioPositions(portfolioId);
    
    if (!portfolio) return null;
    
    const totalPortfolioValue = portfolioManager.getPortfolioValue(portfolioId);
    const totalRisk = positions.reduce((sum, pos) => {
      return sum + Math.abs(pos.unrealizedPnL);
    }, 0);
    
    const riskPercentage = (totalRisk / totalPortfolioValue) * 100;
    
    return {
      portfolioValue: totalPortfolioValue,
      totalRisk: totalRisk,
      riskPercentage: riskPercentage,
      riskLevel: riskPercentage > 15 ? 'high' : riskPercentage > 8 ? 'medium' : 'low',
      maxDrawdown: portfolio.performance.maxDrawdown,
      sharpeRatio: portfolio.performance.sharpeRatio,
      positions: positions.length,
      recommendations: this.generateRiskRecommendations(riskPercentage, portfolio)
    };
  }

  generateRiskRecommendations(riskPercentage, portfolio) {
    const recommendations = [];
    
    if (riskPercentage > 15) {
      recommendations.push('Consider reducing position sizes - portfolio risk is high');
    }
    
    if (portfolio.positions.length > portfolio.riskSettings.maxPositions * 0.8) {
      recommendations.push('Approaching maximum position limit - consider consolidation');
    }
    
    if (portfolio.performance.maxDrawdown > 10) {
      recommendations.push('Maximum drawdown is significant - review stop-loss levels');
    }
    
    if (portfolio.performance.sharpeRatio < 1.0) {
      recommendations.push('Sharpe ratio could be improved - review strategy performance');
    }
    
    return recommendations;
  }
}

export default PortfolioManager;