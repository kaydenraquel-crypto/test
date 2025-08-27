import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { PositionManager } from '../PositionManager';
import { Position } from '../../../types/trading';

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    side: 'long',
    quantity: 0.5,
    averagePrice: 44000,
    markPrice: 45000,
    unrealizedPnl: 500,
    realizedPnl: 0,
    margin: 2200,
    leverage: 10,
    timestamp: Date.now() - 3600000,
    updateTime: Date.now(),
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    side: 'short',
    quantity: 2.0,
    averagePrice: 2800,
    markPrice: 2750,
    unrealizedPnl: 100,
    realizedPnl: 0,
    margin: 560,
    leverage: 5,
    timestamp: Date.now() - 7200000,
    updateTime: Date.now(),
  },
];

const mockOnClosePosition = vi.fn();
const mockOnModifyPosition = vi.fn();
const mockOnSubmitOrder = vi.fn();

describe('PositionManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPositionManager = (props = {}) => {
    const defaultProps = {
      positions: mockPositions,
      onClosePosition: mockOnClosePosition,
      onModifyPosition: mockOnModifyPosition,
      onSubmitOrder: mockOnSubmitOrder,
      totalEquity: 50000,
      ...props,
    };

    return render(<PositionManager {...defaultProps} />);
  };

  test('renders positions table correctly', () => {
    renderPositionManager();
    
    expect(screen.getByText('Positions')).toBeInTheDocument();
    expect(screen.getByText('2 Open')).toBeInTheDocument();
    
    // Check if positions are displayed
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
  });

  test('displays portfolio summary correctly', () => {
    renderPositionManager();
    
    expect(screen.getByText('Unrealized P&L')).toBeInTheDocument();
    expect(screen.getByText('$600.00')).toBeInTheDocument(); // Total unrealized PnL
    expect(screen.getByText('Total P&L')).toBeInTheDocument();
    expect(screen.getByText('Margin Used')).toBeInTheDocument();
    expect(screen.getByText('$2,760.00')).toBeInTheDocument(); // Total margin
  });

  test('shows position details correctly', () => {
    renderPositionManager();
    
    // BTC position
    expect(screen.getByText('LONG')).toBeInTheDocument();
    expect(screen.getByText('0.5000')).toBeInTheDocument(); // Quantity
    expect(screen.getByText('$44,000.00')).toBeInTheDocument(); // Average price
    expect(screen.getByText('$45,000.00')).toBeInTheDocument(); // Mark price
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // Unrealized PnL
    
    // ETH position
    expect(screen.getByText('SHORT')).toBeInTheDocument();
    expect(screen.getByText('2.0000')).toBeInTheDocument(); // Quantity
  });

  test('calculates portfolio risk correctly', () => {
    renderPositionManager();
    
    // Portfolio risk should be (total margin / total equity) * 100
    // (2760 / 50000) * 100 = 5.5%
    expect(screen.getByText('5.5%')).toBeInTheDocument();
  });

  test('opens modify position dialog', async () => {
    renderPositionManager();
    
    const modifyButtons = screen.getAllByRole('button', { name: /modify position/i });
    fireEvent.click(modifyButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Modify Position')).toBeInTheDocument();
      expect(screen.getByLabelText('Stop Loss Price')).toBeInTheDocument();
      expect(screen.getByLabelText('Take Profit Price')).toBeInTheDocument();
    });
  });

  test('opens close position dialog', async () => {
    renderPositionManager();
    
    const closeButtons = screen.getAllByRole('button', { name: /close position/i });
    fireEvent.click(closeButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Close Position')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to close this position?')).toBeInTheDocument();
    });
  });

  test('closes position successfully', async () => {
    mockOnClosePosition.mockResolvedValue(undefined);
    renderPositionManager();
    
    const closeButtons = screen.getAllByRole('button', { name: /close position/i });
    fireEvent.click(closeButtons[0]);
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /close position/i });
      fireEvent.click(confirmButton);
    });
    
    await waitFor(() => {
      expect(mockOnClosePosition).toHaveBeenCalledWith('1');
    });
  });

  test('modifies position with stop loss and take profit', async () => {
    mockOnModifyPosition.mockResolvedValue(undefined);
    renderPositionManager();
    
    const modifyButtons = screen.getAllByRole('button', { name: /modify position/i });
    fireEvent.click(modifyButtons[0]);
    
    await waitFor(() => {
      const stopLossInput = screen.getByLabelText('Stop Loss Price');
      const takeProfitInput = screen.getByLabelText('Take Profit Price');
      
      fireEvent.change(stopLossInput, { target: { value: '43000' } });
      fireEvent.change(takeProfitInput, { target: { value: '46000' } });
      
      const updateButton = screen.getByRole('button', { name: /update position/i });
      fireEvent.click(updateButton);
    });
    
    await waitFor(() => {
      expect(mockOnModifyPosition).toHaveBeenCalledWith('1', 43000, 46000);
    });
  });

  test('shows hedge position option when onSubmitOrder is provided', () => {
    renderPositionManager();
    
    const hedgeButtons = screen.getAllByRole('button', { name: /hedge position/i });
    expect(hedgeButtons).toHaveLength(2); // One for each position
  });

  test('does not show hedge option when onSubmitOrder is not provided', () => {
    renderPositionManager({ onSubmitOrder: undefined });
    
    const hedgeButtons = screen.queryAllByRole('button', { name: /hedge position/i });
    expect(hedgeButtons).toHaveLength(0);
  });

  test('creates hedge position', async () => {
    mockOnSubmitOrder.mockResolvedValue(undefined);
    renderPositionManager();
    
    const hedgeButtons = screen.getAllByRole('button', { name: /hedge position/i });
    fireEvent.click(hedgeButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Hedge Position')).toBeInTheDocument();
      
      const quantityInput = screen.getByLabelText('Hedge Quantity');
      fireEvent.change(quantityInput, { target: { value: '0.25' } });
      
      const createHedgeButton = screen.getByRole('button', { name: /create hedge/i });
      fireEvent.click(createHedgeButton);
    });
    
    await waitFor(() => {
      expect(mockOnSubmitOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: 'BTC/USDT',
          side: 'sell', // Opposite of long position
          type: 'market',
          quantity: 0.25,
        })
      );
    });
  });

  test('shows empty state when no positions', () => {
    renderPositionManager({ positions: [] });
    
    expect(screen.getByText('No Open Positions')).toBeInTheDocument();
    expect(screen.getByText('Your positions will appear here once you start trading')).toBeInTheDocument();
  });

  test('displays leverage badges correctly', () => {
    renderPositionManager();
    
    expect(screen.getByText('10x')).toBeInTheDocument(); // BTC position leverage
    expect(screen.getByText('5x')).toBeInTheDocument(); // ETH position leverage
  });

  test('calculates PnL percentages correctly', () => {
    renderPositionManager();
    
    // BTC: (45000 - 44000) / 44000 * 100 = 2.27%
    expect(screen.getByText('+2.27%')).toBeInTheDocument();
    
    // ETH (short): (2800 - 2750) / 2800 * 100 = 1.79% (inverted for short)
    expect(screen.getByText('+1.79%')).toBeInTheDocument();
  });

  test('shows high risk warning when portfolio risk is high', () => {
    const highRiskPositions = [
      {
        ...mockPositions[0],
        margin: 40000, // High margin to trigger warning
      }
    ];
    
    renderPositionManager({ positions: highRiskPositions });
    
    expect(screen.getByText(/high portfolio risk detected/i)).toBeInTheDocument();
  });
});