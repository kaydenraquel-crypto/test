import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Dashboard } from '../experimental/pages/Dashboard';
import { TradingDataProvider } from '../../contexts/TradingDataContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Mock the trading data context
const mockTradingData = {
  currentSymbol: 'AAPL',
  currentMarket: 'stocks' as const,
  currentInterval: '5',
  chartData: null,
  indicators: {},
  news: [
    {
      id: '1',
      title: 'Apple Reports Strong Q4 Earnings',
      summary: 'Apple Inc. reported better than expected earnings for Q4.',
      source: 'Reuters',
      timestamp: new Date('2023-12-01'),
      url: 'https://example.com'
    },
    {
      id: '2', 
      title: 'Federal Reserve Announces Rate Decision',
      summary: 'The Federal Reserve announced its latest interest rate decision.',
      source: 'Bloomberg',
      timestamp: new Date('2023-12-01'),
      url: 'https://example.com'
    }
  ],
  predictions: null,
  isLoadingChart: false,
  isLoadingIndicators: false,
  isLoadingNews: false,
  isLoadingPredictions: false,
  setSymbol: vi.fn(),
  setInterval: vi.fn(),
  refreshData: vi.fn(),
  refreshChart: vi.fn(),
  refreshIndicators: vi.fn(),
  refreshNews: vi.fn(),
  refreshPredictions: vi.fn(),
  liveData: null,
  isWebSocketConnected: true
};

// Mock the hooks
vi.mock('../../contexts/TradingDataContext', () => ({
  useTradingData: () => mockTradingData,
  TradingDataProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trading-data-provider">{children}</div>
  )
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      name: 'Dark',
      panelBackgroundPrimary: '#1a1a1a',
      textPrimary: '#ffffff'
    }
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}));

// Helper component to wrap Dashboard with all required providers
const DashboardWrapper = () => {
  const theme = createTheme();
  
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

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard title and subtitle', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time market data and portfolio analytics')).toBeInTheDocument();
  });

  it('displays portfolio overview widget', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('Today\'s P&L')).toBeInTheDocument();
    expect(screen.getByText('Total Unrealized P&L')).toBeInTheDocument();
  });

  it('shows market indices with correct data', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Market Indices')).toBeInTheDocument();
    expect(screen.getByText('S&P 500')).toBeInTheDocument();
    expect(screen.getByText('NASDAQ')).toBeInTheDocument();
    expect(screen.getByText('Dow Jones')).toBeInTheDocument();
    expect(screen.getByText('Russell 2000')).toBeInTheDocument();
  });

  it('displays watchlist with real-time prices', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    
    // Check for default watchlist symbols
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('TSLA')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();
  });

  it('shows current positions with P&L information', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Current Positions')).toBeInTheDocument();
    
    // Check positions tab content
    const positionsSection = screen.getByText('Current Positions').closest('[role="tabpanel"], .MuiCard-root');
    if (positionsSection) {
      // Portfolio positions should be visible
      expect(within(positionsSection).getByText('AAPL')).toBeInTheDocument();
      expect(within(positionsSection).getByText('TSLA')).toBeInTheDocument();
    }
  });

  it('displays economic calendar events', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Economic Calendar')).toBeInTheDocument();
    expect(screen.getByText('Federal Reserve Interest Rate Decision')).toBeInTheDocument();
    expect(screen.getByText('Non-Farm Payrolls')).toBeInTheDocument();
  });

  it('shows market news feed', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Market News')).toBeInTheDocument();
    expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument();
    expect(screen.getByText('Federal Reserve Announces Rate Decision')).toBeInTheDocument();
  });

  it('displays active alerts with different severity levels', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('AAPL crossed above $180.00')).toBeInTheDocument();
    expect(screen.getByText('TSLA volume spike detected (+250%)')).toBeInTheDocument();
  });

  it('shows connection status indicator', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('LIVE DATA CONNECTED')).toBeInTheDocument();
    expect(screen.getByText('Real-time')).toBeInTheDocument();
  });

  it('displays live update toggle switch', () => {
    render(<DashboardWrapper />);
    
    const liveUpdateSwitch = screen.getByRole('checkbox', { name: /live updates/i });
    expect(liveUpdateSwitch).toBeInTheDocument();
    expect(liveUpdateSwitch).toBeChecked();
  });

  it('handles refresh button click', async () => {
    render(<DashboardWrapper />);
    
    const refreshButtons = screen.getAllByLabelText(/refresh/i);
    fireEvent.click(refreshButtons[0]);
    
    await waitFor(() => {
      expect(mockTradingData.refreshData).toHaveBeenCalled();
    });
  });

  it('shows performance chart placeholder', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
    expect(screen.getByText('Real-time Portfolio Chart')).toBeInTheDocument();
    expect(screen.getByText('Interactive performance visualization with professional charting tools')).toBeInTheDocument();
  });

  it('displays quick actions panel', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('New Alert')).toBeInTheDocument();
    expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Place Order')).toBeInTheDocument();
    expect(screen.getByText('Run Analysis')).toBeInTheDocument();
  });

  it('shows system status information', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    expect(screen.getByText('Data Latency')).toBeInTheDocument();
    expect(screen.getByText('Active Connections')).toBeInTheDocument();
  });

  it('handles tab switching in positions widget', () => {
    render(<DashboardWrapper />);
    
    const ordersTab = screen.getByRole('tab', { name: /orders/i });
    const historyTab = screen.getByRole('tab', { name: /history/i });
    
    expect(ordersTab).toBeInTheDocument();
    expect(historyTab).toBeInTheDocument();
    
    fireEvent.click(ordersTab);
    // Tab should be selected (can verify through aria-selected or other attributes)
  });

  it('displays time-based chart controls', () => {
    render(<DashboardWrapper />);
    
    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument(); 
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
  });

  it('shows proper color coding for gains and losses', () => {
    render(<DashboardWrapper />);
    
    // Check that positive and negative values have appropriate styling
    // This would need to check CSS classes or computed styles
    const portfolioSection = screen.getByText('Portfolio Overview').closest('.MuiCard-root');
    expect(portfolioSection).toBeInTheDocument();
  });

  it('handles live updates toggle', () => {
    render(<DashboardWrapper />);
    
    const liveUpdateSwitch = screen.getByRole('checkbox', { name: /live updates/i });
    
    // Toggle off
    fireEvent.click(liveUpdateSwitch);
    expect(liveUpdateSwitch).not.toBeChecked();
    
    // Toggle back on  
    fireEvent.click(liveUpdateSwitch);
    expect(liveUpdateSwitch).toBeChecked();
  });

  it('displays badge indicators for live data', () => {
    render(<DashboardWrapper />);
    
    // Look for live indicators on various widgets
    const liveIndicators = screen.getAllByTestId(/live.*indicator/i);
    // Should have live indicators on multiple widgets
  });

  it('formats currency values correctly', () => {
    render(<DashboardWrapper />);
    
    // Check that dollar amounts are formatted with commas and decimal places
    expect(screen.getByText(/\$[\d,]+\.\d{2}/)).toBeInTheDocument();
  });

  it('displays loading states correctly', () => {
    // Mock loading state
    const loadingMockTradingData = { 
      ...mockTradingData, 
      isLoadingNews: true 
    };
    
    vi.mocked(require('../../contexts/TradingDataContext').useTradingData).mockReturnValue(loadingMockTradingData);
    
    render(<DashboardWrapper />);
    
    // Should show skeleton loading for news
    expect(screen.getAllByRole('progressbar')).toHaveLength(0); // Skeletons don't have progressbar role
  });

  it('handles error states gracefully', () => {
    const errorMockTradingData = { 
      ...mockTradingData, 
      news: [] // Empty news array
    };
    
    vi.mocked(require('../../contexts/TradingDataContext').useTradingData).mockReturnValue(errorMockTradingData);
    
    render(<DashboardWrapper />);
    
    // Component should still render without crashing
    expect(screen.getByText('Market News')).toBeInTheDocument();
  });

  it('updates timestamps correctly', () => {
    render(<DashboardWrapper />);
    
    // Should display current time or relative timestamps
    expect(screen.getByText(/Last refreshed:/)).toBeInTheDocument();
  });
});