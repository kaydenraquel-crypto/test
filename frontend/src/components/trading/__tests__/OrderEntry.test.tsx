import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { OrderEntry } from '../OrderEntry';
import { MarketData, OrderRequest } from '../../../types/trading';

const mockMarketData: MarketData = {
  symbol: 'BTC/USDT',
  lastPrice: 45000,
  bid: 44990,
  ask: 45010,
  volume: 1000000,
  change24h: 500,
  changePercent24h: 1.12,
  high24h: 46000,
  low24h: 44000,
  timestamp: Date.now(),
};

const mockOnSubmitOrder = vi.fn();
const mockOnValidateOrder = vi.fn();

describe('OrderEntry Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderOrderEntry = (props = {}) => {
    const defaultProps = {
      marketData: mockMarketData,
      availableBalance: 10000,
      onSubmitOrder: mockOnSubmitOrder,
      onValidateOrder: mockOnValidateOrder,
      tradingMode: 'paper' as const,
      ...props,
    };

    return render(<OrderEntry {...defaultProps} />);
  };

  test('renders order entry form correctly', () => {
    renderOrderEntry();
    
    expect(screen.getByText('Order Entry')).toBeInTheDocument();
    expect(screen.getByText('PAPER')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByText('Sell')).toBeInTheDocument();
    expect(screen.getByLabelText('Order Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  test('displays market data correctly', () => {
    renderOrderEntry();
    
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('$44990.00')).toBeInTheDocument(); // Bid
    expect(screen.getByText('$45000.00')).toBeInTheDocument(); // Last
    expect(screen.getByText('$45010.00')).toBeInTheDocument(); // Ask
  });

  test('switches between buy and sell modes', () => {
    renderOrderEntry();
    
    const sellButton = screen.getByRole('button', { name: /sell/i });
    fireEvent.click(sellButton);
    
    expect(screen.getByRole('button', { name: /sell btc/i })).toBeInTheDocument();
  });

  test('handles order type changes', () => {
    renderOrderEntry();
    
    const orderTypeSelect = screen.getByLabelText('Order Type');
    fireEvent.mouseDown(orderTypeSelect);
    
    const limitOption = screen.getByRole('option', { name: /limit order/i });
    fireEvent.click(limitOption);
    
    // Price field should appear for limit orders
    expect(screen.getByLabelText('Price')).toBeInTheDocument();
  });

  test('validates order submission', async () => {
    mockOnValidateOrder.mockReturnValue('Invalid quantity');
    renderOrderEntry();
    
    const quantityInput = screen.getByLabelText('Quantity');
    const submitButton = screen.getByRole('button', { name: /buy btc/i });
    
    fireEvent.change(quantityInput, { target: { value: '0.5' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid quantity')).toBeInTheDocument();
    });
  });

  test('submits order successfully', async () => {
    mockOnSubmitOrder.mockResolvedValue(undefined);
    renderOrderEntry();
    
    const quantityInput = screen.getByLabelText('Quantity');
    const submitButton = screen.getByRole('button', { name: /buy btc/i });
    
    fireEvent.change(quantityInput, { target: { value: '0.5' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmitOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: 'BTC/USDT',
          side: 'buy',
          type: 'market',
          quantity: 0.5,
        })
      );
    });
  });

  test('calculates estimated cost correctly', () => {
    renderOrderEntry();
    
    const quantityInput = screen.getByLabelText('Quantity');
    fireEvent.change(quantityInput, { target: { value: '1' } });
    
    // Should show estimated cost based on ask price for buy orders
    expect(screen.getByText('$45010.00')).toBeInTheDocument();
  });

  test('shows percentage quantity selector', () => {
    renderOrderEntry();
    
    const percentageSwitch = screen.getByLabelText('Use Percentage');
    fireEvent.click(percentageSwitch);
    
    expect(screen.getByText('Balance: 25%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('adjusts leverage slider', () => {
    renderOrderEntry();
    
    const leverageSlider = screen.getByRole('slider', { name: /leverage/i });
    fireEvent.change(leverageSlider, { target: { value: '10' } });
    
    expect(screen.getByText('Leverage: 10x')).toBeInTheDocument();
  });

  test('shows advanced options', () => {
    renderOrderEntry();
    
    expect(screen.getByText('Time in Force')).toBeInTheDocument();
    expect(screen.getByText('Post Only')).toBeInTheDocument();
    expect(screen.getByText('Reduce Only')).toBeInTheDocument();
  });

  test('displays live trading warning', () => {
    renderOrderEntry({ tradingMode: 'live' });
    
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('Live Trading Mode - Real money will be used')).toBeInTheDocument();
  });

  test('handles stop orders correctly', () => {
    renderOrderEntry();
    
    const orderTypeSelect = screen.getByLabelText('Order Type');
    fireEvent.mouseDown(orderTypeSelect);
    
    const stopOption = screen.getByRole('option', { name: /stop order/i });
    fireEvent.click(stopOption);
    
    expect(screen.getByLabelText('Stop Price')).toBeInTheDocument();
  });

  test('handles trailing stop orders', () => {
    renderOrderEntry();
    
    const orderTypeSelect = screen.getByLabelText('Order Type');
    fireEvent.mouseDown(orderTypeSelect);
    
    const trailingStopOption = screen.getByRole('option', { name: /trailing stop/i });
    fireEvent.click(trailingStopOption);
    
    expect(screen.getByLabelText('Trailing Amount')).toBeInTheDocument();
  });
});