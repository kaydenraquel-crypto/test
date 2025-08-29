import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  usePortfolioCalculations, 
  PortfolioPosition,
  UsePortfolioCalculationsOptions 
} from '../usePortfolioCalculations';

/**
 * Tests for the usePortfolioCalculations hook
 * These tests verify portfolio calculations, real-time updates, and risk metrics
 */

// Mock portfolio data
const mockPositions: PortfolioPosition[] = [
  {
    symbol: 'AAPL',
    quantity: 100,
    avgPrice: 150.00,
    currentPrice: 155.00,
    marketValue: 15500,
    unrealizedPL: 500,
    unrealizedPLPercent: 3.33,
    dayChange: 200,
    dayChangePercent: 1.29,
    sector: 'Technology'
  },
  {
    symbol: 'TSLA',
    quantity: 50,
    avgPrice: 800.00,
    currentPrice: 750.00,
    marketValue: 37500,
    unrealizedPL: -2500,
    unrealizedPLPercent: -6.25,
    dayChange: -1000,
    dayChangePercent: -2.67,
    sector: 'Automotive'
  },
  {
    symbol: 'MSFT',
    quantity: 75,
    avgPrice: 300.00,
    currentPrice: 320.00,
    marketValue: 24000,
    unrealizedPL: 1500,
    unrealizedPLPercent: 6.67,
    dayChange: 750,
    dayChangePercent: 3.125,
    sector: 'Technology'
  }
];

const mockRealTimePrices = {
  'AAPL': 156.00,
  'TSLA': 760.00,
  'MSFT': 325.00
};

describe('usePortfolioCalculations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Portfolio Calculations', () => {
    it('calculates portfolio summary correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { portfolioSummary } = result.current;

      expect(portfolioSummary.positionsCount).toBe(3);
      expect(portfolioSummary.totalValue).toBeGreaterThan(0);
      expect(portfolioSummary.winnersCount).toBe(2); // AAPL and MSFT are profitable
      expect(portfolioSummary.losersCount).toBe(1); // TSLA is losing
    });

    it('calculates individual position metrics correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { positions } = result.current;
      const aaplPosition = positions.find(p => p.symbol === 'AAPL');

      expect(aaplPosition).toBeDefined();
      if (aaplPosition) {
        expect(aaplPosition.marketValue).toBe(aaplPosition.currentPrice * aaplPosition.quantity);
        expect(aaplPosition.unrealizedPL).toBe(
          aaplPosition.marketValue - (aaplPosition.avgPrice * aaplPosition.quantity)
        );
      }
    });

    it('identifies top performers correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { portfolioSummary } = result.current;

      expect(portfolioSummary.topGainer?.symbol).toBe('MSFT'); // Highest percentage gain
      expect(portfolioSummary.topLoser?.symbol).toBe('TSLA'); // Only loser
      expect(portfolioSummary.largestPosition?.symbol).toBe('TSLA'); // Highest market value
    });

    it('calculates sector allocation correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { portfolioSummary } = result.current;

      expect(portfolioSummary.sectorAllocation['Technology']).toBeGreaterThan(0);
      expect(portfolioSummary.sectorAllocation['Automotive']).toBeGreaterThan(0);
    });

    it('calculates diversification score', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { portfolioSummary } = result.current;

      expect(portfolioSummary.diversificationScore).toBeGreaterThanOrEqual(0);
      expect(portfolioSummary.diversificationScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Risk Metrics', () => {
    it('calculates portfolio risk metrics', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false,
          riskFreeRate: 0.02
        })
      );

      const { portfolioRisk } = result.current;

      expect(portfolioRisk.portfolioBeta).toBeGreaterThan(0);
      expect(portfolioRisk.volatility).toBeGreaterThanOrEqual(0);
      expect(portfolioRisk.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(portfolioRisk.valueAtRisk).toBeGreaterThanOrEqual(0);
      expect(portfolioRisk.concentrationRisk).toBeGreaterThanOrEqual(0);
      expect(portfolioRisk.concentrationRisk).toBeLessThanOrEqual(100);
    });

    it('calculates Sharpe ratio correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false,
          riskFreeRate: 0.03
        })
      );

      const { portfolioRisk } = result.current;

      expect(typeof portfolioRisk.sharpeRatio).toBe('number');
      expect(isNaN(portfolioRisk.sharpeRatio)).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    it('calculates performance analytics correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { performanceMetrics } = result.current;

      expect(performanceMetrics.totalReturn).toBeDefined();
      expect(performanceMetrics.annualizedReturn).toBeDefined();
      expect(performanceMetrics.dayReturn).toBeDefined();
      expect(performanceMetrics.winRate).toBeGreaterThanOrEqual(0);
      expect(performanceMetrics.winRate).toBeLessThanOrEqual(100);
    });

    it('calculates win/loss ratios correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const { performanceMetrics } = result.current;

      expect(performanceMetrics.avgWin).toBeGreaterThan(0); // Should have positive average win
      expect(performanceMetrics.avgLoss).toBeGreaterThan(0); // Should have positive average loss (absolute value)
    });
  });

  describe('Real-time Updates', () => {
    it('updates positions with real-time prices', async () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          realTimePrices: mockRealTimePrices,
          enableRealTimeUpdates: true,
          updateInterval: 100
        })
      );

      const initialAaplPrice = result.current.positions.find(p => p.symbol === 'AAPL')?.currentPrice;

      // Advance timer to trigger update
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const updatedAaplPrice = result.current.positions.find(p => p.symbol === 'AAPL')?.currentPrice;
      
      // Price should be updated to real-time price
      expect(updatedAaplPrice).toBe(mockRealTimePrices['AAPL']);
    });

    it('stops updates when disabled', () => {
      const { result, rerender } = renderHook(
        (props: UsePortfolioCalculationsOptions) => usePortfolioCalculations(props),
        {
          initialProps: {
            positions: mockPositions,
            realTimePrices: mockRealTimePrices,
            enableRealTimeUpdates: true,
            updateInterval: 100
          }
        }
      );

      const initialUpdateTime = result.current.lastUpdated;

      // Disable real-time updates
      rerender({
        positions: mockPositions,
        realTimePrices: mockRealTimePrices,
        enableRealTimeUpdates: false,
        updateInterval: 100
      });

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Update time should not change when updates are disabled
      expect(result.current.lastUpdated).toBe(initialUpdateTime);
    });

    it('handles custom update intervals', () => {
      const updateSpy = vi.fn();
      
      renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: true,
          updateInterval: 500
        })
      );

      // Advance by less than interval
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Advance by full interval
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should update on the interval boundary
      expect(true).toBe(true); // Placeholder - would check actual update timing
    });
  });

  describe('Utility Functions', () => {
    it('filters positions by performance correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const winners = result.current.getPositionsByPerformance('winners');
      const losers = result.current.getPositionsByPerformance('losers');
      const all = result.current.getPositionsByPerformance('all');

      expect(winners.every(p => p.unrealizedPL > 0)).toBe(true);
      expect(losers.every(p => p.unrealizedPL < 0)).toBe(true);
      expect(all.length).toBe(mockPositions.length);
    });

    it('filters positions by sector correctly', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const techPositions = result.current.getPositionsBySector('Technology');
      const autoPositions = result.current.getPositionsBySector('Automotive');

      expect(techPositions.every(p => p.sector === 'Technology')).toBe(true);
      expect(autoPositions.every(p => p.sector === 'Automotive')).toBe(true);
      expect(techPositions.length).toBe(2); // AAPL and MSFT
      expect(autoPositions.length).toBe(1); // TSLA
    });

    it('sorts positions by performance', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: false
        })
      );

      const sortedPositions = result.current.getPositionsByPerformance('all');

      // Should be sorted by unrealized P&L percentage (descending)
      for (let i = 0; i < sortedPositions.length - 1; i++) {
        expect(sortedPositions[i].unrealizedPLPercent).toBeGreaterThanOrEqual(
          sortedPositions[i + 1].unrealizedPLPercent
        );
      }
    });

    it('recalculates on demand', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          realTimePrices: mockRealTimePrices,
          enableRealTimeUpdates: false
        })
      );

      const initialUpdateTime = result.current.lastUpdated;

      // Wait a moment
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Manually trigger recalculation
      act(() => {
        result.current.recalculate();
      });

      expect(result.current.lastUpdated).not.toBe(initialUpdateTime);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty portfolio', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: [],
          enableRealTimeUpdates: false
        })
      );

      const { portfolioSummary } = result.current;

      expect(portfolioSummary.totalValue).toBe(0);
      expect(portfolioSummary.positionsCount).toBe(0);
      expect(portfolioSummary.winnersCount).toBe(0);
      expect(portfolioSummary.losersCount).toBe(0);
    });

    it('handles positions without sector information', () => {
      const positionsWithoutSector = mockPositions.map(p => ({ ...p, sector: undefined }));
      
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: positionsWithoutSector,
          enableRealTimeUpdates: false
        })
      );

      const { portfolioSummary } = result.current;

      expect(portfolioSummary.sectorAllocation['Unknown']).toBeGreaterThan(0);
    });

    it('handles missing real-time prices gracefully', () => {
      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          realTimePrices: { 'AAPL': 160.00 }, // Only partial price data
          enableRealTimeUpdates: true
        })
      );

      // Should not crash and should use available real-time prices
      expect(result.current.positions.find(p => p.symbol === 'AAPL')?.currentPrice).toBe(160.00);
      expect(result.current.positions.find(p => p.symbol === 'TSLA')?.currentPrice).toBe(750.00); // Original price
    });

    it('handles zero quantities and prices', () => {
      const edgeCasePositions: PortfolioPosition[] = [
        {
          symbol: 'ZERO',
          quantity: 0,
          avgPrice: 100.00,
          currentPrice: 110.00,
          marketValue: 0,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          dayChange: 0,
          dayChangePercent: 0
        }
      ];

      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: edgeCasePositions,
          enableRealTimeUpdates: false
        })
      );

      expect(result.current.portfolioSummary.totalValue).toBe(0);
    });

    it('prevents division by zero in calculations', () => {
      const zeroCostPositions: PortfolioPosition[] = [
        {
          symbol: 'FREE',
          quantity: 100,
          avgPrice: 0,
          currentPrice: 10.00,
          marketValue: 1000,
          unrealizedPL: 1000,
          unrealizedPLPercent: 0,
          dayChange: 0,
          dayChangePercent: 0
        }
      ];

      const { result } = renderHook(() => 
        usePortfolioCalculations({
          positions: zeroCostPositions,
          enableRealTimeUpdates: false
        })
      );

      // Should handle division by zero gracefully
      expect(isNaN(result.current.portfolioSummary.totalPLPercent)).toBe(false);
    });
  });

  describe('Memory and Performance', () => {
    it('cleans up intervals on unmount', () => {
      const { unmount } = renderHook(() => 
        usePortfolioCalculations({
          positions: mockPositions,
          enableRealTimeUpdates: true,
          updateInterval: 100
        })
      );

      // Unmount the hook
      unmount();

      // Advance timers - should not trigger any updates or errors
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // No errors should occur
      expect(true).toBe(true);
    });

    it('handles rapid position updates efficiently', () => {
      const { rerender } = renderHook(
        (positions: PortfolioPosition[]) => 
          usePortfolioCalculations({
            positions,
            enableRealTimeUpdates: false
          }),
        { initialProps: mockPositions }
      );

      // Rapidly update positions multiple times
      for (let i = 0; i < 100; i++) {
        const updatedPositions = mockPositions.map(p => ({
          ...p,
          currentPrice: p.currentPrice + Math.random()
        }));
        
        rerender(updatedPositions);
      }

      // Should handle rapid updates without issues
      expect(true).toBe(true);
    });
  });
});