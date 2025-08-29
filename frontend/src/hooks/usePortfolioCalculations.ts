import { useState, useEffect, useMemo, useCallback } from 'react';

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  sector?: string;
  lastUpdated?: Date;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  positionsCount: number;
  winnersCount: number;
  losersCount: number;
  topGainer?: PortfolioPosition;
  topLoser?: PortfolioPosition;
  largestPosition?: PortfolioPosition;
  sectorAllocation: { [sector: string]: number };
  diversificationScore: number;
  lastUpdated: Date;
}

export interface PortfolioRisk {
  portfolioBeta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  valueAtRisk: number;
  concentrationRisk: number;
}

export interface UsePortfolioCalculationsOptions {
  positions: PortfolioPosition[];
  realTimePrices?: { [symbol: string]: number };
  enableRealTimeUpdates?: boolean;
  updateInterval?: number;
  riskFreeRate?: number;
}

/**
 * Custom hook for portfolio calculations and real-time updates
 * Provides comprehensive portfolio analytics including P&L, risk metrics, and sector allocation
 */
export function usePortfolioCalculations({
  positions,
  realTimePrices = {},
  enableRealTimeUpdates = true,
  updateInterval = 1000,
  riskFreeRate = 0.02
}: UsePortfolioCalculationsOptions) {
  
  const [calculatedPositions, setCalculatedPositions] = useState<PortfolioPosition[]>(positions);
  const [lastCalculationTime, setLastCalculationTime] = useState(new Date());

  // Calculate individual position metrics
  const calculatePosition = useCallback((position: PortfolioPosition, realTimePrice?: number): PortfolioPosition => {
    const currentPrice = realTimePrice || position.currentPrice;
    const marketValue = currentPrice * position.quantity;
    const totalCost = position.avgPrice * position.quantity;
    const unrealizedPL = marketValue - totalCost;
    const unrealizedPLPercent = (unrealizedPL / totalCost) * 100;
    
    // Calculate day change (mock calculation - in real app would use previous day's close)
    const previousClose = currentPrice * (1 - (Math.random() - 0.5) * 0.02); // Mock previous close
    const dayChange = (currentPrice - previousClose) * position.quantity;
    const dayChangePercent = ((currentPrice - previousClose) / previousClose) * 100;

    return {
      ...position,
      currentPrice,
      marketValue,
      unrealizedPL,
      unrealizedPLPercent,
      dayChange,
      dayChangePercent,
      lastUpdated: new Date()
    };
  }, []);

  // Calculate portfolio summary metrics
  const portfolioSummary = useMemo((): PortfolioSummary => {
    if (calculatedPositions.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalPL: 0,
        totalPLPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        positionsCount: 0,
        winnersCount: 0,
        losersCount: 0,
        sectorAllocation: {},
        diversificationScore: 0,
        lastUpdated: new Date()
      };
    }

    const totalValue = calculatedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const totalCost = calculatedPositions.reduce((sum, pos) => sum + (pos.avgPrice * pos.quantity), 0);
    const totalPL = calculatedPositions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
    const totalPLPercent = (totalPL / totalCost) * 100;
    const dayChange = calculatedPositions.reduce((sum, pos) => sum + pos.dayChange, 0);
    const dayChangePercent = (dayChange / totalValue) * 100;

    const winners = calculatedPositions.filter(pos => pos.unrealizedPL > 0);
    const losers = calculatedPositions.filter(pos => pos.unrealizedPL < 0);

    // Find top performers
    const topGainer = calculatedPositions.reduce((prev, current) => 
      prev.unrealizedPLPercent > current.unrealizedPLPercent ? prev : current
    );
    
    const topLoser = calculatedPositions.reduce((prev, current) => 
      prev.unrealizedPLPercent < current.unrealizedPLPercent ? prev : current
    );

    const largestPosition = calculatedPositions.reduce((prev, current) => 
      prev.marketValue > current.marketValue ? prev : current
    );

    // Calculate sector allocation
    const sectorAllocation: { [sector: string]: number } = {};
    calculatedPositions.forEach(position => {
      const sector = position.sector || 'Unknown';
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + position.marketValue;
    });

    // Calculate diversification score (Herfindahl index)
    const positionWeights = calculatedPositions.map(pos => pos.marketValue / totalValue);
    const herfindahlIndex = positionWeights.reduce((sum, weight) => sum + weight * weight, 0);
    const diversificationScore = (1 - herfindahlIndex) * 100; // Convert to 0-100 scale

    return {
      totalValue,
      totalCost,
      totalPL,
      totalPLPercent,
      dayChange,
      dayChangePercent,
      positionsCount: calculatedPositions.length,
      winnersCount: winners.length,
      losersCount: losers.length,
      topGainer,
      topLoser,
      largestPosition,
      sectorAllocation,
      diversificationScore,
      lastUpdated: lastCalculationTime
    };
  }, [calculatedPositions, lastCalculationTime]);

  // Calculate portfolio risk metrics
  const portfolioRisk = useMemo((): PortfolioRisk => {
    if (calculatedPositions.length === 0) {
      return {
        portfolioBeta: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0,
        valueAtRisk: 0,
        concentrationRisk: 0
      };
    }

    // Mock risk calculations - in a real app, these would use historical data
    const returns = calculatedPositions.map(pos => pos.unrealizedPLPercent / 100);
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility

    const portfolioBeta = 1.0 + (Math.random() - 0.5) * 0.5; // Mock beta
    const excessReturn = avgReturn * 252 - riskFreeRate; // Annualized excess return
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    // Mock other risk metrics
    const maxDrawdown = Math.max(...returns.map(r => Math.abs(Math.min(r, 0)))) * 100;
    const valueAtRisk = portfolioSummary.totalValue * 0.05; // 5% VaR
    
    // Concentration risk based on position sizes
    const positionWeights = calculatedPositions.map(pos => pos.marketValue / portfolioSummary.totalValue);
    const maxWeight = Math.max(...positionWeights);
    const concentrationRisk = maxWeight * 100;

    return {
      portfolioBeta,
      sharpeRatio,
      maxDrawdown,
      volatility,
      valueAtRisk,
      concentrationRisk
    };
  }, [calculatedPositions, portfolioSummary, riskFreeRate]);

  // Update positions with real-time prices
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    const interval = setInterval(() => {
      setCalculatedPositions(currentPositions => 
        currentPositions.map(position => 
          calculatePosition(position, realTimePrices[position.symbol])
        )
      );
      setLastCalculationTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [realTimePrices, enableRealTimeUpdates, updateInterval, calculatePosition]);

  // Initial calculation when positions change
  useEffect(() => {
    setCalculatedPositions(
      positions.map(position => calculatePosition(position, realTimePrices[position.symbol]))
    );
    setLastCalculationTime(new Date());
  }, [positions, calculatePosition, realTimePrices]);

  // Performance analytics
  const performanceMetrics = useMemo(() => {
    const { totalPL, totalCost, dayChange } = portfolioSummary;
    
    return {
      totalReturn: (totalPL / totalCost) * 100,
      annualizedReturn: ((Math.pow(1 + totalPL / totalCost, 365 / 30) - 1) * 100), // Assuming 30 days of data
      dayReturn: (dayChange / (portfolioSummary.totalValue - dayChange)) * 100,
      winRate: portfolioSummary.winnersCount / portfolioSummary.positionsCount * 100,
      avgWin: portfolioSummary.winnersCount > 0 
        ? calculatedPositions.filter(p => p.unrealizedPL > 0)
            .reduce((sum, p) => sum + p.unrealizedPL, 0) / portfolioSummary.winnersCount 
        : 0,
      avgLoss: portfolioSummary.losersCount > 0 
        ? calculatedPositions.filter(p => p.unrealizedPL < 0)
            .reduce((sum, p) => sum + Math.abs(p.unrealizedPL), 0) / portfolioSummary.losersCount 
        : 0
    };
  }, [portfolioSummary, calculatedPositions]);

  // Utility functions
  const getPositionsByPerformance = useCallback((type: 'winners' | 'losers' | 'all' = 'all') => {
    const filtered = type === 'winners' 
      ? calculatedPositions.filter(p => p.unrealizedPL > 0)
      : type === 'losers'
      ? calculatedPositions.filter(p => p.unrealizedPL < 0)
      : calculatedPositions;

    return filtered.sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent);
  }, [calculatedPositions]);

  const getPositionsBySector = useCallback((sector: string) => {
    return calculatedPositions.filter(p => p.sector === sector);
  }, [calculatedPositions]);

  const recalculate = useCallback(() => {
    setCalculatedPositions(
      positions.map(position => calculatePosition(position, realTimePrices[position.symbol]))
    );
    setLastCalculationTime(new Date());
  }, [positions, calculatePosition, realTimePrices]);

  return {
    // Data
    positions: calculatedPositions,
    portfolioSummary,
    portfolioRisk,
    performanceMetrics,
    lastUpdated: lastCalculationTime,

    // Utility functions
    getPositionsByPerformance,
    getPositionsBySector,
    recalculate,

    // Status
    isCalculating: false, // Could be used for async calculations
  };
}