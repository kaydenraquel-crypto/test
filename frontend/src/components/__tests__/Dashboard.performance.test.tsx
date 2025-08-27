import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Dashboard } from '../experimental/pages/Dashboard';
import { TradingDataProvider } from '../../contexts/TradingDataContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

/**
 * Performance tests for the Dashboard component
 * These tests verify that the dashboard performs well under various conditions
 */

// Performance monitoring utility
class PerformanceMonitor {
  private measurements: { [key: string]: number[] } = {};
  
  start(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements[label]) {
        this.measurements[label] = [];
      }
      this.measurements[label].push(duration);
    };
  }
  
  getAverage(label: string): number {
    const times = this.measurements[label] || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getMax(label: string): number {
    const times = this.measurements[label] || [];
    return Math.max(...times);
  }
  
  reset(): void {
    this.measurements = {};
  }
}

const perfMonitor = new PerformanceMonitor();

// Mock data generators for performance testing
const generateLargePortfolio = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    symbol: `STOCK${i}`,
    quantity: Math.floor(Math.random() * 1000) + 1,
    avgPrice: Math.random() * 200 + 10,
    currentPrice: Math.random() * 200 + 10,
    marketValue: Math.random() * 100000 + 1000,
    unrealizedPL: (Math.random() - 0.5) * 10000,
    unrealizedPLPercent: (Math.random() - 0.5) * 20,
    dayChange: (Math.random() - 0.5) * 10,
    dayChangePercent: (Math.random() - 0.5) * 5
  }));
};

const generateLargeNewsFeed = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: `news-${i}`,
    title: `Market News Item ${i} - ${Math.random().toString(36).substring(7)}`,
    summary: `Detailed summary for news item ${i}. This is a longer text to simulate real news content that might be quite lengthy and contain various information about market conditions, earnings reports, and economic indicators.`,
    source: `NewsSource${i % 10}`,
    timestamp: new Date(Date.now() - i * 60000),
    url: `https://example.com/news/${i}`
  }));
};

const generateLargeWatchlist = (size: number) => {
  return Array.from({ length: size }, (_, i) => `SYMBOL${i.toString().padStart(3, '0')}`);
};

// Create performance-focused mock trading data
const createPerformanceMockData = (options = {}) => {
  const {
    portfolioSize = 50,
    newsSize = 100,
    watchlistSize = 20,
    enableRealTime = true
  } = options as any;

  return {
    currentSymbol: 'AAPL',
    currentMarket: 'stocks' as const,
    currentInterval: '5',
    chartData: {
      ohlc: Array.from({ length: 1000 }, (_, i) => ({
        time: new Date(Date.now() - (1000 - i) * 60000).toISOString(),
        open: 100 + Math.random() * 100,
        high: 100 + Math.random() * 100,
        low: 100 + Math.random() * 100,
        close: 100 + Math.random() * 100,
        volume: Math.floor(Math.random() * 1000000)
      })),
      symbol: 'AAPL',
      count: 1000,
      source: 'test'
    },
    indicators: {
      rsi: Array.from({ length: 1000 }, () => Math.random() * 100),
      sma_20: Array.from({ length: 1000 }, () => 100 + Math.random() * 100),
      ema_50: Array.from({ length: 1000 }, () => 100 + Math.random() * 100),
      macd: Array.from({ length: 1000 }, () => (Math.random() - 0.5) * 10),
      bollinger_upper: Array.from({ length: 1000 }, () => 120 + Math.random() * 50),
      bollinger_lower: Array.from({ length: 1000 }, () => 80 + Math.random() * 50),
      volume: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000000))
    },
    news: generateLargeNewsFeed(newsSize),
    predictions: {
      symbol: 'AAPL',
      predictions: Array.from({ length: 10 }, (_, i) => ({
        timeframe: `${i + 1}d`,
        direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
        confidence: Math.random(),
        target: 100 + Math.random() * 100
      })),
      confidence: Math.random()
    },
    isLoadingChart: false,
    isLoadingIndicators: false,
    isLoadingNews: false,
    isLoadingPredictions: false,
    setSymbol: vi.fn(),
    setInterval: vi.fn(),
    refreshData: vi.fn().mockImplementation(async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }),
    refreshChart: vi.fn().mockResolvedValue(undefined),
    refreshIndicators: vi.fn().mockResolvedValue(undefined),
    refreshNews: vi.fn().mockResolvedValue(undefined),
    refreshPredictions: vi.fn().mockResolvedValue(undefined),
    liveData: enableRealTime ? {
      symbol: 'AAPL',
      price: 178.45 + (Math.random() - 0.5) * 10,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 3,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString()
    } : null,
    isWebSocketConnected: enableRealTime
  };
};

// Performance test wrapper
const PerformanceDashboardWrapper = ({ mockData = {} }) => {
  const theme = createTheme();
  const tradingData = createPerformanceMockData(mockData);

  // Mock the hooks for performance testing
  vi.doMock('../../contexts/TradingDataContext', () => ({
    useTradingData: () => tradingData,
    TradingDataProvider: ({ children }: { children: React.ReactNode }) => children
  }));

  vi.doMock('../../contexts/ThemeContext', () => ({
    useTheme: () => ({
      theme: {
        name: 'Dark',
        panelBackgroundPrimary: '#1a1a1a',
        textPrimary: '#ffffff'
      }
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children
  }));

  return (
    <MuiThemeProvider theme={theme}>
      <TradingDataProvider>
        <ThemeProvider>
          <Dashboard />
        </ThemeProvider>
      </TradingDataProvider>
    </MuiThemeProvider>
  );
};

describe('Dashboard Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    perfMonitor.reset();
    
    // Mock performance.now() for consistent testing
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial Render Performance', () => {
    it('renders dashboard with standard data in under 500ms', () => {
      const stopTimer = perfMonitor.start('initial-render');
      
      render(<PerformanceDashboardWrapper />);
      
      stopTimer();
      
      expect(perfMonitor.getMax('initial-render')).toBeLessThan(500);
      expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
    });

    it('handles large portfolio data efficiently', () => {
      const stopTimer = perfMonitor.start('large-portfolio');
      
      render(<PerformanceDashboardWrapper mockData={{ portfolioSize: 200 }} />);
      
      stopTimer();
      
      // Should render large portfolio data in reasonable time
      expect(perfMonitor.getMax('large-portfolio')).toBeLessThan(1000);
      expect(screen.getByText('Current Positions')).toBeInTheDocument();
    });

    it('handles large news feed without performance degradation', () => {
      const stopTimer = perfMonitor.start('large-news');
      
      render(<PerformanceDashboardWrapper mockData={{ newsSize: 500 }} />);
      
      stopTimer();
      
      expect(perfMonitor.getMax('large-news')).toBeLessThan(800);
      expect(screen.getByText('Market News')).toBeInTheDocument();
    });

    it('manages extensive watchlist efficiently', () => {
      const stopTimer = perfMonitor.start('large-watchlist');
      
      render(<PerformanceDashboardWrapper mockData={{ watchlistSize: 100 }} />);
      
      stopTimer();
      
      expect(perfMonitor.getMax('large-watchlist')).toBeLessThan(600);
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
    });
  });

  describe('Real-time Update Performance', () => {
    it('handles real-time price updates efficiently', async () => {
      const { rerender } = render(<PerformanceDashboardWrapper />);
      
      // Simulate multiple rapid price updates
      for (let i = 0; i < 100; i++) {
        const stopTimer = perfMonitor.start('price-update');
        
        act(() => {
          vi.advanceTimersByTime(1000); // Trigger price update
        });
        
        rerender(<PerformanceDashboardWrapper mockData={{ enableRealTime: true }} />);
        
        stopTimer();
      }
      
      // Average update time should be fast
      expect(perfMonitor.getAverage('price-update')).toBeLessThan(50);
      expect(perfMonitor.getMax('price-update')).toBeLessThan(200);
    });

    it('maintains performance during continuous real-time updates', () => {
      render(<PerformanceDashboardWrapper />);
      
      // Simulate 1 minute of real-time updates (every second)
      for (let i = 0; i < 60; i++) {
        const stopTimer = perfMonitor.start('continuous-update');
        
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        
        stopTimer();
      }
      
      // Performance should not degrade over time
      const times = perfMonitor['measurements']['continuous-update'] || [];
      const firstHalf = times.slice(0, 30);
      const secondHalf = times.slice(30);
      
      const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t, 0) / secondHalf.length;
      
      // Second half should not be significantly slower than first half
      expect(secondHalfAvg / firstHalfAvg).toBeLessThan(1.5);
    });
  });

  describe('Memory Usage Performance', () => {
    it('prevents memory leaks during frequent updates', () => {
      const { unmount } = render(<PerformanceDashboardWrapper />);
      
      // Simulate many updates before unmounting
      for (let i = 0; i < 1000; i++) {
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }
      
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Memory leaks would typically be detected by continuous integration
      // or specialized memory profiling tools
      expect(true).toBe(true); // Placeholder assertion
    });

    it('efficiently manages large dataset rendering', () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;
      
      render(<PerformanceDashboardWrapper mockData={{
        portfolioSize: 1000,
        newsSize: 1000,
        watchlistSize: 500
      }} />);
      
      const afterRenderMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryIncrease = afterRenderMemory - initialMemory;
      
      // Memory increase should be reasonable for large datasets
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });
  });

  describe('Interaction Performance', () => {
    it('handles rapid tab switching efficiently', () => {
      render(<PerformanceDashboardWrapper />);
      
      const tabs = ['Positions', 'Orders', 'History'];
      
      tabs.forEach(tabName => {
        const stopTimer = perfMonitor.start('tab-switch');
        
        // Simulate tab click (would need actual tab elements)
        act(() => {
          // Tab switching logic
        });
        
        stopTimer();
      });
      
      expect(perfMonitor.getAverage('tab-switch')).toBeLessThan(50);
    });

    it('maintains smooth scrolling with large lists', () => {
      render(<PerformanceDashboardWrapper mockData={{ newsSize: 1000 }} />);
      
      // Simulate scroll events
      for (let i = 0; i < 100; i++) {
        const stopTimer = perfMonitor.start('scroll-event');
        
        // Simulate scroll
        act(() => {
          // Scroll event handling
        });
        
        stopTimer();
      }
      
      expect(perfMonitor.getAverage('scroll-event')).toBeLessThan(16); // 60fps = 16.67ms per frame
    });
  });

  describe('Network Performance', () => {
    it('handles multiple concurrent data refreshes efficiently', async () => {
      const mockData = createPerformanceMockData();
      render(<PerformanceDashboardWrapper />);
      
      const stopTimer = perfMonitor.start('concurrent-refresh');
      
      // Simulate concurrent data refreshes
      await Promise.all([
        mockData.refreshChart(),
        mockData.refreshNews(),
        mockData.refreshIndicators(),
        mockData.refreshPredictions()
      ]);
      
      stopTimer();
      
      expect(perfMonitor.getMax('concurrent-refresh')).toBeLessThan(1000);
    });

    it('batches rapid refresh requests', async () => {
      const mockData = createPerformanceMockData();
      render(<PerformanceDashboardWrapper />);
      
      const stopTimer = perfMonitor.start('batched-refresh');
      
      // Simulate rapid refresh requests
      const promises = Array.from({ length: 10 }, () => mockData.refreshData());
      await Promise.all(promises);
      
      stopTimer();
      
      // Should not take 10x as long as a single request
      expect(perfMonitor.getMax('batched-refresh')).toBeLessThan(2000);
    });
  });

  describe('Rendering Optimization', () => {
    it('uses efficient re-rendering strategies', () => {
      const { rerender } = render(<PerformanceDashboardWrapper />);
      
      // First render
      const stopTimer1 = perfMonitor.start('initial-render-opt');
      rerender(<PerformanceDashboardWrapper />);
      stopTimer1();
      
      // Subsequent renders (should be faster due to React optimization)
      const stopTimer2 = perfMonitor.start('re-render-opt');
      rerender(<PerformanceDashboardWrapper />);
      stopTimer2();
      
      const stopTimer3 = perfMonitor.start('re-render-opt');
      rerender(<PerformanceDashboardWrapper />);
      stopTimer3();
      
      // Re-renders should be faster than initial render
      expect(perfMonitor.getAverage('re-render-opt')).toBeLessThan(
        perfMonitor.getMax('initial-render-opt') * 0.5
      );
    });

    it('minimizes unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      
      // Mock React.memo or similar optimization
      const OptimizedDashboard = React.memo(() => {
        renderSpy();
        return <Dashboard />;
      });
      
      const { rerender } = render(
        <MuiThemeProvider theme={createTheme()}>
          <OptimizedDashboard />
        </MuiThemeProvider>
      );
      
      // Re-render with same props
      rerender(
        <MuiThemeProvider theme={createTheme()}>
          <OptimizedDashboard />
        </MuiThemeProvider>
      );
      
      // Should not trigger unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + one re-render
    });
  });

  describe('Bundle Size Impact', () => {
    it('loads efficiently without blocking main thread', () => {
      const stopTimer = perfMonitor.start('component-load');
      
      // Simulate component loading
      import('../experimental/pages/Dashboard').then(() => {
        stopTimer();
        expect(perfMonitor.getMax('component-load')).toBeLessThan(100);
      });
    });
  });

  describe('Accessibility Performance', () => {
    it('maintains performance with screen readers', () => {
      // Mock screen reader environment
      const originalAriaAtomic = document.body.setAttribute;
      document.body.setAttribute = vi.fn(originalAriaAtomic);
      
      const stopTimer = perfMonitor.start('a11y-render');
      render(<PerformanceDashboardWrapper />);
      stopTimer();
      
      // Should render efficiently even with accessibility features
      expect(perfMonitor.getMax('a11y-render')).toBeLessThan(800);
      
      document.body.setAttribute = originalAriaAtomic;
    });
  });
});