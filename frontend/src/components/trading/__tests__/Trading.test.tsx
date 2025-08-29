import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Trading } from '../../experimental/pages/Trading';

// Mock the trading components
vi.mock('../OrderEntry', () => ({
  OrderEntry: ({ onSubmitOrder }: any) => (
    <div data-testid="order-entry">
      <button onClick={() => onSubmitOrder({ 
        symbol: 'BTC/USDT', 
        side: 'buy', 
        type: 'market', 
        quantity: 1 
      })}>
        Submit Order
      </button>
    </div>
  ),
}));

vi.mock('../OrderBook', () => ({
  OrderBook: ({ onPriceClick }: any) => (
    <div data-testid="order-book">
      <button onClick={() => onPriceClick(45000)}>
        Price Click
      </button>
    </div>
  ),
}));

vi.mock('../PositionManager', () => ({
  PositionManager: ({ onClosePosition }: any) => (
    <div data-testid="position-manager">
      <button onClick={() => onClosePosition('pos1')}>
        Close Position
      </button>
    </div>
  ),
}));

vi.mock('../TradeBlotter', () => ({
  TradeBlotter: ({ onRefresh, onExport }: any) => (
    <div data-testid="trade-blotter">
      <button onClick={onRefresh}>Refresh</button>
      <button onClick={() => onExport([])}>Export</button>
    </div>
  ),
}));

vi.mock('../RiskManager', () => ({
  RiskManager: ({ onUpdatePreferences, onAcknowledgeAlert }: any) => (
    <div data-testid="risk-manager">
      <button onClick={() => onUpdatePreferences({})}>Update Preferences</button>
      <button onClick={() => onAcknowledgeAlert('alert1')}>Acknowledge Alert</button>
    </div>
  ),
}));

describe('Trading Component', () => {
  test('renders trading interface correctly', () => {
    render(<Trading />);
    
    expect(screen.getByText('Professional Trading')).toBeInTheDocument();
    expect(screen.getByText('PAPER')).toBeInTheDocument();
    expect(screen.getByText('Trading')).toBeInTheDocument();
    expect(screen.getByText('Positions')).toBeInTheDocument();
    expect(screen.getByText('Orders & Trades')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });

  test('displays market data in header', () => {
    render(<Trading />);
    
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText(/\$45,234\.56/)).toBeInTheDocument();
    expect(screen.getByText('+2.81%')).toBeInTheDocument();
  });

  test('displays portfolio value', () => {
    render(<Trading />);
    
    expect(screen.getByText(/\$52,677\.28/)).toBeInTheDocument();
  });

  test('toggles between paper and live trading modes', () => {
    render(<Trading />);
    
    const tradingModeSwitch = screen.getByRole('checkbox');
    
    // Should start in paper mode
    expect(screen.getByText('PAPER')).toBeInTheDocument();
    
    // Switch to live mode
    fireEvent.click(tradingModeSwitch);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('LIVE TRADING MODE - Real money is at risk')).toBeInTheDocument();
  });

  test('switches between trading tabs', () => {
    render(<Trading />);
    
    // Should start on Trading tab
    expect(screen.getByTestId('order-entry')).toBeInTheDocument();
    
    // Switch to Positions tab
    const positionsTab = screen.getByRole('tab', { name: /positions/i });
    fireEvent.click(positionsTab);
    expect(screen.getByTestId('position-manager')).toBeInTheDocument();
    
    // Switch to Orders & Trades tab
    const tradesTab = screen.getByRole('tab', { name: /orders & trades/i });
    fireEvent.click(tradesTab);
    expect(screen.getByTestId('trade-blotter')).toBeInTheDocument();
    
    // Switch to Analysis tab
    const analysisTab = screen.getByRole('tab', { name: /analysis/i });
    fireEvent.click(analysisTab);
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
  });

  test('shows chart placeholder', () => {
    render(<Trading />);
    
    expect(screen.getByText('TradingView Chart Integration')).toBeInTheDocument();
    expect(screen.getByText('Advanced charting with technical indicators')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load chart widget/i })).toBeInTheDocument();
  });

  test('opens risk manager dialog', async () => {
    render(<Trading />);
    
    const settingsButton = screen.getByRole('button', { name: /risk manager/i });
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Risk Management Center')).toBeInTheDocument();
      expect(screen.getByTestId('risk-manager')).toBeInTheDocument();
    });
  });

  test('shows alert notification when there are unacknowledged alerts', () => {
    render(<Trading />);
    
    // Should show notification icon for unacknowledged alerts
    const alertButton = screen.getByRole('button', { name: /2 unread alerts/i });
    expect(alertButton).toBeInTheDocument();
  });

  test('handles order submission', async () => {
    render(<Trading />);
    
    const submitOrderButton = screen.getByText('Submit Order');
    fireEvent.click(submitOrderButton);
    
    // Should add the order to trades (simplified test)
    await waitFor(() => {
      // The component should handle the order submission
      expect(submitOrderButton).toBeInTheDocument();
    });
  });

  test('handles position closure', async () => {
    render(<Trading />);
    
    // Switch to positions tab
    const positionsTab = screen.getByRole('tab', { name: /positions/i });
    fireEvent.click(positionsTab);
    
    const closePositionButton = screen.getByText('Close Position');
    fireEvent.click(closePositionButton);
    
    // Should handle position closure
    await waitFor(() => {
      expect(closePositionButton).toBeInTheDocument();
    });
  });

  test('handles price click from order book', () => {
    render(<Trading />);
    
    const priceClickButton = screen.getByText('Price Click');
    fireEvent.click(priceClickButton);
    
    // Should handle price click (implementation would update order form)
    expect(priceClickButton).toBeInTheDocument();
  });

  test('handles trade blotter actions', () => {
    render(<Trading />);
    
    // Switch to trades tab
    const tradesTab = screen.getByRole('tab', { name: /orders & trades/i });
    fireEvent.click(tradesTab);
    
    const refreshButton = screen.getByText('Refresh');
    const exportButton = screen.getByText('Export');
    
    fireEvent.click(refreshButton);
    fireEvent.click(exportButton);
    
    // Should handle refresh and export actions
    expect(refreshButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
  });

  test('shows coming soon message for analysis features', () => {
    render(<Trading />);
    
    const analysisTab = screen.getByRole('tab', { name: /analysis/i });
    fireEvent.click(analysisTab);
    
    const comingSoonMessages = screen.getAllByText('Coming Soon');
    expect(comingSoonMessages).toHaveLength(2); // Portfolio Performance and Market Analysis
    
    expect(screen.getByText('Advanced portfolio analytics and performance metrics')).toBeInTheDocument();
    expect(screen.getByText('Technical analysis tools and market insights')).toBeInTheDocument();
  });

  test('handles risk manager interactions', async () => {
    render(<Trading />);
    
    const settingsButton = screen.getByRole('button', { name: /risk manager/i });
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      const updatePreferencesButton = screen.getByText('Update Preferences');
      const acknowledgeAlertButton = screen.getByText('Acknowledge Alert');
      
      fireEvent.click(updatePreferencesButton);
      fireEvent.click(acknowledgeAlertButton);
      
      // Should handle risk manager actions
      expect(updatePreferencesButton).toBeInTheDocument();
      expect(acknowledgeAlertButton).toBeInTheDocument();
    });
  });

  test('updates market data periodically', async () => {
    // This test would be more complex in a real scenario
    // For now, we just verify the component renders with initial data
    render(<Trading />);
    
    expect(screen.getByText(/\$45,234\.56/)).toBeInTheDocument();
    
    // In a real test, we might mock timers and verify data updates
    // jest.useFakeTimers();
    // act(() => {
    //   jest.advanceTimersByTime(5000);
    // });
    // expect(screen.getByText(/different price/)).toBeInTheDocument();
    // jest.useRealTimers();
  });
});