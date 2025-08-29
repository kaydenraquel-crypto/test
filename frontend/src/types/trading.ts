// Trading Types and Interfaces
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop' | 'oco';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected' | 'expired';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'DAY';
export type PositionSide = 'long' | 'short';
export type TradingMode = 'paper' | 'live';
export type AccountType = 'paper' | 'live' | 'demo';

export interface MarketData {
  symbol: string;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  trailingAmount?: number;
  timeInForce: TimeInForce;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  timestamp: number;
  updateTime: number;
  clientOrderId?: string;
  fees?: number;
  commission?: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  quantity: number;
  averagePrice: number;
  markPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  margin: number;
  leverage: number;
  timestamp: number;
  updateTime: number;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  timestamp: number;
  fees: number;
  commission: number;
  pnl?: number;
}

export interface Account {
  id: string;
  type: AccountType;
  balance: number;
  availableBalance: number;
  totalEquity: number;
  marginUsed: number;
  marginAvailable: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnl: number;
  dayPnl: number;
  positions: Position[];
  openOrders: Order[];
  todayTrades: Trade[];
}

export interface RiskMetrics {
  portfolioValue: number;
  totalRisk: number;
  valueAtRisk: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  betaToMarket: number;
  correlation: { [symbol: string]: number };
}

export interface TradingSession {
  id: string;
  startTime: number;
  endTime?: number;
  totalTrades: number;
  winRate: number;
  grossPnl: number;
  netPnl: number;
  maxDrawdown: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  trailingAmount?: number;
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
  postOnly?: boolean;
  clientOrderId?: string;
}

export interface TradingPreferences {
  defaultOrderType: OrderType;
  defaultTimeInForce: TimeInForce;
  confirmationDialogs: boolean;
  soundAlerts: boolean;
  maxPositionSize: number;
  dailyLossLimit: number;
  autoStopLoss: boolean;
  defaultStopLossPercent: number;
  autoTakeProfit: boolean;
  defaultTakeProfitPercent: number;
  tradingHotkeys: { [key: string]: string };
}

export interface PortfolioAllocation {
  symbol: string;
  allocation: number;
  currentWeight: number;
  targetWeight: number;
  rebalanceAmount: number;
}

export interface TradingAlert {
  id: string;
  type: 'price' | 'volume' | 'pnl' | 'margin' | 'order' | 'position';
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  symbol?: string;
  orderId?: string;
  positionId?: string;
}

export interface ChartIndicator {
  id: string;
  name: string;
  type: 'overlay' | 'oscillator';
  enabled: boolean;
  parameters: { [key: string]: any };
  color?: string;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parameters: { [key: string]: any };
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}