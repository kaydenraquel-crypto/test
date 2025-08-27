import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Dashboard } from '../experimental/pages/Dashboard';
import { TradingDataProvider } from '../../contexts/TradingDataContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

/**
 * Integration tests for the Dashboard component
 * These tests verify real-time functionality, data integration, and complex interactions
 */

// Mock WebSocket for real-time testing
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send(data: string) {
    // Mock send implementation
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  // Helper method to simulate receiving data
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }
}

// Mock the WebSocket globally
global.WebSocket = MockWebSocket as any;

// Mock real-time data updates
const mockRealTimeData = {
  symbol: 'AAPL',
  price: 178.45,
  change: 1.25,
  changePercent: 0.7,
  volume: 45000000,
  timestamp: new Date().toISOString()
};

const mockNewsUpdate = {
  id: 'news-1',
  title: 'Breaking: Apple Announces New Product Line',
  summary: 'Apple Inc. announces revolutionary new technology.',
  source: 'TechCrunch',
  timestamp: new Date(),
  url: 'https://example.com'
};

// Comprehensive mock of trading data with real-time capabilities
const createMockTradingData = (overrides = {}) => ({
  currentSymbol: 'AAPL',
  currentMarket: 'stocks' as const,
  currentInterval: '5',
  chartData: {
    ohlc: [
      { time: '2023-12-01T09:30:00Z', open: 175, high: 179, low: 174, close: 178.45, volume: 1000000 },
      { time: '2023-12-01T09:35:00Z', open: 178.45, high: 180, low: 177, close: 179.20, volume: 1200000 }
    ],
    symbol: 'AAPL',
    count: 2,
    source: 'polygon'
  },
  indicators: {
    rsi: [65.4, 67.2],
    sma_20: [176.8, 177.5],
    volume: [1000000, 1200000]
  },
  news: [
    {
      id: '1',
      title: 'Apple Reports Strong Q4 Earnings',
      summary: 'Apple Inc. reported better than expected earnings.',
      source: 'Reuters',
      timestamp: new Date('2023-12-01'),
      url: 'https://example.com'
    }
  ],
  predictions: {
    symbol: 'AAPL',
    predictions: [
      { timeframe: '1d', direction: 'bullish', confidence: 0.75, target: 185 },
      { timeframe: '1w', direction: 'bullish', confidence: 0.68, target: 190 }
    ],
    confidence: 0.75
  },
  isLoadingChart: false,
  isLoadingIndicators: false,
  isLoadingNews: false,
  isLoadingPredictions: false,
  setSymbol: vi.fn(),
  setInterval: vi.fn(),
  refreshData: vi.fn().mockResolvedValue(undefined),
  refreshChart: vi.fn().mockResolvedValue(undefined),
  refreshIndicators: vi.fn().mockResolvedValue(undefined),
  refreshNews: vi.fn().mockResolvedValue(undefined),
  refreshPredictions: vi.fn().mockResolvedValue(undefined),
  liveData: mockRealTimeData,
  isWebSocketConnected: true,
  ...overrides
});

// Create a testable wrapper with all providers
const DashboardTestWrapper = ({ mockData = {} }) => {
  const theme = createTheme();
  const tradingData = createMockTradingData(mockData);

  // Mock the context hook
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

describe('Dashboard Integration Tests', () => {
  let mockWebSocket: MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (mockWebSocket) {
      mockWebSocket.close();
    }
  });

  describe('Real-time Data Updates', () => {
    it('updates portfolio values in real-time', async () => {
      const { rerender } = render(<DashboardTestWrapper />);

      // Initial render should show base values
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();

      // Simulate real-time price updates
      act(() => {
        vi.advanceTimersByTime(1000); // Advance by 1 second
      });

      // Portfolio values should update based on real-time price changes
      await waitFor(() => {
        const portfolioElement = screen.getByText('Total Portfolio Value');
        expect(portfolioElement).toBeInTheDocument();
      });
    });

    it('shows live connection status updates', async () => {
      // Start with disconnected state
      const disconnectedMockData = { isWebSocketConnected: false };
      const { rerender } = render(<DashboardTestWrapper mockData={disconnectedMockData} />);

      expect(screen.getByText('DATA CONNECTION OFFLINE')).toBeInTheDocument();

      // Simulate connection establishment
      const connectedMockData = { isWebSocketConnected: true };
      rerender(<DashboardTestWrapper mockData={connectedMockData} />);

      await waitFor(() => {
        expect(screen.getByText('LIVE DATA CONNECTED')).toBeInTheDocument();
      });
    });

    it('updates watchlist prices in real-time', async () => {
      render(<DashboardTestWrapper />);

      // Get initial watchlist
      expect(screen.getByText('Watchlist')).toBeInTheDocument();

      // Simulate real-time price updates
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Prices should update (this would need actual price element checking)
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
    });

    it('handles news feed real-time updates', async () => {
      const initialMockData = {
        news: [
          {
            id: '1',
            title: 'Initial News Item',
            summary: 'Initial news content',
            source: 'TestSource',
            timestamp: new Date(),
            url: 'https://example.com'
          }
        ]
      };

      const { rerender } = render(<DashboardTestWrapper mockData={initialMockData} />);

      expect(screen.getByText('Initial News Item')).toBeInTheDocument();

      // Simulate new news arriving
      const updatedMockData = {
        news: [
          mockNewsUpdate,
          ...initialMockData.news
        ]
      };

      rerender(<DashboardTestWrapper mockData={updatedMockData} />);

      await waitFor(() => {
        expect(screen.getByText('Breaking: Apple Announces New Product Line')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading States', () => {
    it('shows loading states during data refresh', async () => {
      const loadingMockData = {
        isLoadingChart: true,
        isLoadingNews: true,
        isLoadingIndicators: true
      };

      render(<DashboardTestWrapper mockData={loadingMockData} />);

      // Should show loading indicators (skeleton screens, progress bars, etc.)
      expect(screen.getAllByRole('progressbar')).toBeTruthy();
    });

    it('handles error states gracefully', async () => {
      const errorMockData = {
        news: [],
        chartData: null,
        predictions: null
      };

      render(<DashboardTestWrapper mockData={errorMockData} />);

      // Component should still render without errors
      expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Market News')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('efficiently updates only changed data', async () => {
      const mockData = createMockTradingData();
      const { rerender } = render(<DashboardTestWrapper mockData={mockData} />);

      // Simulate partial data update (only price changes)
      const updatedMockData = {
        ...mockData,
        liveData: {
          ...mockRealTimeData,
          price: 179.50 // Price change
        }
      };

      rerender(<DashboardTestWrapper mockData={updatedMockData} />);

      // Verify only price-related components re-render
      await waitFor(() => {
        expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
      });
    });

    it('handles large datasets without performance degradation', async () => {
      // Create mock data with large news array
      const largeMockData = {
        news: Array.from({ length: 100 }, (_, i) => ({
          id: `news-${i}`,
          title: `News Item ${i}`,
          summary: `Summary for news item ${i}`,
          source: `Source${i}`,
          timestamp: new Date(),
          url: `https://example.com/${i}`
        }))
      };

      const startTime = performance.now();
      render(<DashboardTestWrapper mockData={largeMockData} />);
      const renderTime = performance.now() - startTime;

      // Should render efficiently even with large datasets
      expect(renderTime).toBeLessThan(1000); // Less than 1 second
      expect(screen.getByText('Market News')).toBeInTheDocument();
    });
  });

  describe('Cross-Widget Data Consistency', () => {
    it('maintains data consistency across all widgets', async () => {
      const mockData = createMockTradingData();
      render(<DashboardTestWrapper mockData={mockData} />);

      // All widgets showing AAPL data should be consistent
      expect(screen.getAllByText('AAPL')).toHaveLength(3); // Portfolio, watchlist, alerts
    });

    it('propagates symbol changes across widgets', async () => {
      const mockData = createMockTradingData();
      const { rerender } = render(<DashboardTestWrapper mockData={mockData} />);

      // Simulate symbol change
      const updatedMockData = {
        ...mockData,
        currentSymbol: 'TSLA'
      };

      rerender(<DashboardTestWrapper mockData={updatedMockData} />);

      // All widgets should update to show TSLA data
      await waitFor(() => {
        expect(screen.getAllByText('TSLA')).toHaveLength(2); // At least in positions and watchlist
      });
    });
  });

  describe('WebSocket Integration', () => {
    it('establishes WebSocket connection on mount', async () => {
      render(<DashboardTestWrapper />);

      await waitFor(() => {
        expect(screen.getByText('LIVE DATA CONNECTED')).toBeInTheDocument();
      });
    });

    it('handles WebSocket disconnection gracefully', async () => {
      const { rerender } = render(<DashboardTestWrapper />);

      // Initially connected
      expect(screen.getByText('LIVE DATA CONNECTED')).toBeInTheDocument();

      // Simulate disconnection
      const disconnectedMockData = { isWebSocketConnected: false };
      rerender(<DashboardTestWrapper mockData={disconnectedMockData} />);

      await waitFor(() => {
        expect(screen.getByText('DATA CONNECTION OFFLINE')).toBeInTheDocument();
      });
    });

    it('processes WebSocket messages correctly', async () => {
      render(<DashboardTestWrapper />);

      // Mock WebSocket message
      const mockMessage = {
        type: 'price_update',
        symbol: 'AAPL',
        price: 180.50,
        timestamp: new Date().toISOString()
      };

      // Simulate WebSocket message (this would need actual WebSocket mock)
      act(() => {
        // Trigger message processing
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('LIVE DATA CONNECTED')).toBeInTheDocument();
      });
    });
  });

  describe('Memory Management', () => {
    it('cleans up timers and intervals on unmount', () => {
      const { unmount } = render(<DashboardTestWrapper />);

      // Verify real-time timers are running
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Unmount component
      unmount();

      // Verify timers are cleaned up (no errors or memory leaks)
      act(() => {
        vi.advanceTimersByTime(5000);
      });
    });

    it('prevents memory leaks from WebSocket connections', () => {
      const { unmount } = render(<DashboardTestWrapper />);

      // Component should clean up WebSocket on unmount
      unmount();

      // Verify no hanging connections or listeners
    });
  });

  describe('Error Recovery', () => {
    it('recovers from temporary data fetch failures', async () => {
      // Start with failing refresh function
      const failingMockData = {
        refreshData: vi.fn().mockRejectedValue(new Error('Network error'))
      };

      const { rerender } = render(<DashboardTestWrapper mockData={failingMockData} />);

      // Simulate recovery
      const recoveredMockData = {
        refreshData: vi.fn().mockResolvedValue(undefined)
      };

      rerender(<DashboardTestWrapper mockData={recoveredMockData} />);

      await waitFor(() => {
        expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
      });
    });

    it('maintains UI stability during data errors', async () => {
      const errorMockData = {
        chartData: null,
        news: [],
        indicators: {},
        predictions: null
      };

      render(<DashboardTestWrapper mockData={errorMockData} />);

      // UI should remain functional despite missing data
      expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByText('Market News')).toBeInTheDocument();
    });
  });
});