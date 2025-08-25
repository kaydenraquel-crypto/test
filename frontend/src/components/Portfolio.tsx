import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Plus, Minus, BarChart3, DollarSign, Percent, Target, AlertTriangle, Zap, Shield, Calculator, RefreshCw } from 'lucide-react';

interface Position {
  symbol: string;
  market: 'crypto' | 'stocks';
  quantity: number;
  entryPrice: number;
  entryDate: number;
  currentPrice?: number;
  lastUpdated?: number;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topGainer?: Position & { gainPercent: number };
  topLoser?: Position & { gainPercent: number };
  positions: number;
  diversificationScore: number;
  riskScore: number;
  avgHoldingDays: number;
  portfolioAlpha?: number;
  sharpeRatio?: number;
}

interface Props {
  currentSymbol?: string;
  currentMarket?: 'crypto' | 'stocks';
  currentPrice?: number;
  style?: React.CSSProperties;
}

const Portfolio: React.FC<Props> = ({ currentSymbol, currentMarket, currentPrice, style }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    market: 'crypto' as 'crypto' | 'stocks',
    quantity: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    riskLevel: 'medium' as 'low' | 'medium' | 'high'
  });
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [sortBy, setSortBy] = useState<'symbol' | 'value' | 'gainLoss' | 'date'>('gainLoss');
  const [showRiskManagement, setShowRiskManagement] = useState(false);

  // Load portfolio from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('novasignal_portfolio');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPositions(parsed);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      }
    }
  }, []);

  // Save portfolio to localStorage
  const savePortfolio = (newPositions: Position[]) => {
    try {
      localStorage.setItem('novasignal_portfolio', JSON.stringify(newPositions));
      setPositions(newPositions);
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    }
  };

  // Add a new position
  const addPosition = () => {
    if (!newPosition.symbol.trim() || !newPosition.quantity || !newPosition.entryPrice) {
      return;
    }

    const position: Position = {
      symbol: newPosition.symbol.toUpperCase().trim(),
      market: newPosition.market,
      quantity: parseFloat(newPosition.quantity),
      entryPrice: parseFloat(newPosition.entryPrice),
      entryDate: Date.now(),
      currentPrice: currentSymbol === newPosition.symbol.toUpperCase().trim() ? currentPrice : undefined,
      lastUpdated: Date.now(),
      stopLoss: newPosition.stopLoss ? parseFloat(newPosition.stopLoss) : undefined,
      takeProfit: newPosition.takeProfit ? parseFloat(newPosition.takeProfit) : undefined,
      notes: newPosition.notes.trim() || undefined,
      riskLevel: newPosition.riskLevel
    };

    // Check if position already exists
    const existingIndex = positions.findIndex(p => 
      p.symbol === position.symbol && p.market === position.market
    );

    let updatedPositions: Position[];
    if (existingIndex >= 0) {
      // Update existing position (average price)
      const existing = positions[existingIndex];
      if (existing) {
        const totalQuantity = existing.quantity + position.quantity;
        const totalValue = (existing.quantity * existing.entryPrice) + (position.quantity * position.entryPrice);
        const averagePrice = totalValue / totalQuantity;

        updatedPositions = [...positions];
        updatedPositions[existingIndex] = {
          ...existing,
          quantity: totalQuantity,
          entryPrice: averagePrice,
          lastUpdated: Date.now()
        };
      } else {
        // Fallback: add new position if existing is somehow undefined
        updatedPositions = [...positions, position];
      }
    } else {
      // Add new position
      updatedPositions = [...positions, position];
    }

    savePortfolio(updatedPositions);
    
    // Reset form
    setNewPosition({
      symbol: '',
      market: 'crypto',
      quantity: '',
      entryPrice: '',
      stopLoss: '',
      takeProfit: '',
      notes: '',
      riskLevel: 'medium'
    });
    setShowAddForm(false);
  };

  // Remove a position
  const removePosition = (symbol: string, market: 'crypto' | 'stocks') => {
    const updatedPositions = positions.filter(p => 
      !(p.symbol === symbol && p.market === market)
    );
    savePortfolio(updatedPositions);
  };

  // Calculate comprehensive portfolio statistics
  const stats: PortfolioStats = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let topGainer: (Position & { gainPercent: number }) | undefined;
    let topLoser: (Position & { gainPercent: number }) | undefined;
    let totalHoldingDays = 0;
    let riskScore = 0;

    const symbolCounts = new Map<string, number>();
    const marketCounts = new Map<string, number>();

    positions.forEach(position => {
      const cost = position.quantity * position.entryPrice;
      const value = position.quantity * (position.currentPrice || position.entryPrice);
      const gainPercent = ((value - cost) / cost) * 100;
      const holdingDays = (Date.now() - position.entryDate) / (1000 * 60 * 60 * 24);

      totalCost += cost;
      totalValue += value;
      totalHoldingDays += holdingDays;

      // Track diversification
      symbolCounts.set(position.symbol, (symbolCounts.get(position.symbol) || 0) + 1);
      marketCounts.set(position.market, (marketCounts.get(position.market) || 0) + 1);

      // Calculate risk score based on position size and risk level
      const positionWeight = cost / (totalCost || 1);
      const riskMultiplier = position.riskLevel === 'high' ? 3 : position.riskLevel === 'medium' ? 2 : 1;
      riskScore += positionWeight * riskMultiplier * 100;

      const positionWithGain = { ...position, gainPercent };

      if (!topGainer || gainPercent > topGainer.gainPercent) {
        topGainer = positionWithGain;
      }
      if (!topLoser || gainPercent < topLoser.gainPercent) {
        topLoser = positionWithGain;
      }
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const avgHoldingDays = positions.length > 0 ? totalHoldingDays / positions.length : 0;
    
    // Calculate diversification score (0-100)
    const uniqueSymbols = symbolCounts.size;
    const uniqueMarkets = marketCounts.size;
    const diversificationScore = Math.min(100, (uniqueSymbols * 10) + (uniqueMarkets * 20));

    // Simple Sharpe ratio approximation (using average daily return)
    const dailyReturn = totalGainLossPercent / (avgHoldingDays || 1);
    const sharpeRatio = dailyReturn / Math.max(0.1, Math.abs(dailyReturn) * 0.1);

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      topGainer,
      topLoser,
      positions: positions.length,
      diversificationScore,
      riskScore: Math.min(100, riskScore),
      avgHoldingDays,
      portfolioAlpha: totalGainLossPercent, // Simplified alpha
      sharpeRatio
    };
  }, [positions]);

  // Quick add current symbol
  const addCurrentSymbol = () => {
    if (currentSymbol && currentMarket && currentPrice) {
      setNewPosition({
        symbol: currentSymbol,
        market: currentMarket,
        quantity: '1',
        entryPrice: currentPrice.toString(),
        stopLoss: (currentPrice * 0.95).toString(), // 5% stop loss
        takeProfit: (currentPrice * 1.15).toString(), // 15% take profit
        notes: `Added from chart analysis`,
        riskLevel: 'medium'
      });
      setShowAddForm(true);
    }
  };

  // Update current prices for existing positions
  const updatePositionPrices = useCallback(() => {
    if (currentSymbol && currentPrice) {
      const updatedPositions = positions.map(position => {
        if (position.symbol === currentSymbol && position.market === currentMarket) {
          return {
            ...position,
            currentPrice,
            lastUpdated: Date.now()
          };
        }
        return position;
      });
      
      if (JSON.stringify(updatedPositions) !== JSON.stringify(positions)) {
        savePortfolio(updatedPositions);
      }
    }
  }, [currentSymbol, currentMarket, currentPrice, positions]);

  // Auto-update current prices
  useEffect(() => {
    updatePositionPrices();
  }, [updatePositionPrices]);

  // Sort positions
  const sortedPositions = useMemo(() => {
    const sorted = [...positions].sort((a, b) => {
      switch (sortBy) {
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'value':
          const valueA = a.quantity * (a.currentPrice || a.entryPrice);
          const valueB = b.quantity * (b.currentPrice || b.entryPrice);
          return valueB - valueA;
        case 'gainLoss':
          const gainA = ((a.quantity * (a.currentPrice || a.entryPrice)) - (a.quantity * a.entryPrice)) / (a.quantity * a.entryPrice) * 100;
          const gainB = ((b.quantity * (b.currentPrice || b.entryPrice)) - (b.quantity * b.entryPrice)) / (b.quantity * b.entryPrice) * 100;
          return gainB - gainA;
        case 'date':
          return b.entryDate - a.entryDate;
        default:
          return 0;
      }
    });
    return sorted;
  }, [positions, sortBy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="panel" style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 className="w-5 h-5" />
          Portfolio
          {positions.length > 0 && (
            <span style={{ 
              fontSize: '12px', 
              backgroundColor: '#e3f2fd', 
              color: '#1976d2', 
              padding: '2px 8px', 
              borderRadius: '12px' 
            }}>
              {positions.length} positions
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => updatePositionPrices()}
            style={{ 
              fontSize: '12px', 
              padding: '4px 8px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            title="Refresh prices"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          {currentSymbol && currentPrice && (
            <button
              onClick={addCurrentSymbol}
              style={{ 
                fontSize: '12px', 
                padding: '4px 8px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title={`Add ${currentSymbol} position`}
            >
              + Add {currentSymbol}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ 
              fontSize: '12px', 
              padding: '4px 8px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {showAddForm ? 'Cancel' : '+ Position'}
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      {positions.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {(['overview', 'detailed', 'analytics'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: viewMode === mode ? '#2196f3' : '#f5f5f5',
                color: viewMode === mode ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: '3px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {mode}
            </button>
          ))}
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Sort:</span>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as any)}
              style={{ fontSize: '11px', padding: '2px' }}
            >
              <option value="gainLoss">P&L %</option>
              <option value="value">Value</option>
              <option value="symbol">Symbol</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      {positions.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>Total Value</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {formatCurrency(stats.totalValue)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>Total P&L</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: stats.totalGainLoss >= 0 ? '#4caf50' : '#f44336',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                {stats.totalGainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatCurrency(stats.totalGainLoss)} ({formatPercent(stats.totalGainLossPercent)})
              </div>
            </div>
          </div>
          
          {viewMode === 'analytics' && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 8, 
              marginTop: 12, 
              paddingTop: 12, 
              borderTop: '1px solid #e9ecef' 
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#666' }}>Diversification</div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: stats.diversificationScore > 60 ? '#4caf50' : stats.diversificationScore > 30 ? '#ff9800' : '#f44336'
                }}>
                  {stats.diversificationScore.toFixed(0)}/100
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#666' }}>Risk Score</div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: stats.riskScore < 30 ? '#4caf50' : stats.riskScore < 60 ? '#ff9800' : '#f44336'
                }}>
                  {stats.riskScore.toFixed(0)}/100
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#666' }}>Avg Hold</div>
                <div style={{ fontSize: '12px', fontWeight: '500' }}>
                  {stats.avgHoldingDays.toFixed(0)}d
                </div>
              </div>
            </div>
          )}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 12, 
            marginTop: 12, 
            paddingTop: 12, 
            borderTop: '1px solid #e9ecef' 
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666' }}>Total Cost</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {formatCurrency(stats.totalCost)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666' }}>Positions</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {stats.positions}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Position Form */}
      {showAddForm && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #ddd'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Add Position</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
            <select 
              value={newPosition.market} 
              onChange={e => setNewPosition(prev => ({ ...prev, market: e.target.value as 'crypto' | 'stocks' }))}
              style={{ fontSize: '12px', padding: '4px' }}
            >
              <option value="crypto">Crypto</option>
              <option value="stocks">Stocks</option>
            </select>
            
            <input
              type="text"
              value={newPosition.symbol}
              onChange={e => setNewPosition(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              placeholder={newPosition.market === 'crypto' ? 'BTC/USD' : 'AAPL'}
              style={{ fontSize: '12px', padding: '4px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              value={newPosition.quantity}
              onChange={e => setNewPosition(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="Quantity"
              step="any"
              min="0"
              style={{ fontSize: '12px', padding: '4px' }}
            />
            
            <input
              type="number"
              value={newPosition.entryPrice}
              onChange={e => setNewPosition(prev => ({ ...prev, entryPrice: e.target.value }))}
              placeholder="Entry Price"
              step="any"
              min="0"
              style={{ fontSize: '12px', padding: '4px' }}
            />
          </div>
          
          {/* Risk Management Fields */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: 4 }}>Risk Management (Optional)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input
                type="number"
                value={newPosition.stopLoss}
                onChange={e => setNewPosition(prev => ({ ...prev, stopLoss: e.target.value }))}
                placeholder="Stop Loss"
                step="any"
                min="0"
                style={{ fontSize: '12px', padding: '4px' }}
              />
              
              <input
                type="number"
                value={newPosition.takeProfit}
                onChange={e => setNewPosition(prev => ({ ...prev, takeProfit: e.target.value }))}
                placeholder="Take Profit"
                step="any"
                min="0"
                style={{ fontSize: '12px', padding: '4px' }}
              />
              
              <select
                value={newPosition.riskLevel}
                onChange={e => setNewPosition(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                style={{ fontSize: '12px', padding: '4px' }}
              >
                <option value="low">🟢 Low Risk</option>
                <option value="medium">🟡 Medium Risk</option>
                <option value="high">🔴 High Risk</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              value={newPosition.notes}
              onChange={e => setNewPosition(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
              style={{ width: '100%', fontSize: '12px', padding: '4px' }}
            />
          </div>
          
          <button 
            onClick={addPosition} 
            style={{ 
              width: '100%',
              fontSize: '12px', 
              padding: '6px 12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Position
          </button>
        </div>
      )}

      {/* Positions List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {sortedPositions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 32, 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            border: '2px dashed #dee2e6'
          }}>
            <Target className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <div style={{ fontSize: '14px', marginBottom: 8 }}>No positions yet</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Add your first position to start tracking your portfolio
            </div>
          </div>
        ) : (
          sortedPositions.map((position, index) => {
            const cost = position.quantity * position.entryPrice;
            const currentValue = position.quantity * (position.currentPrice || position.entryPrice);
            const gainLoss = currentValue - cost;
            const gainLossPercent = (gainLoss / cost) * 100;
            const isCurrentSymbol = position.symbol === currentSymbol && position.market === currentMarket;

            return (
              <div
                key={`${position.symbol}-${position.market}-${position.entryDate}`}
                style={{
                  padding: 12,
                  backgroundColor: isCurrentSymbol ? '#e3f2fd' : index % 2 === 0 ? '#f9f9f9' : 'white',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {position.symbol}
                      </span>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px',
                        backgroundColor: position.market === 'crypto' ? '#ff9800' : '#2196f3',
                        color: 'white',
                        borderRadius: '10px',
                        textTransform: 'uppercase'
                      }}>
                        {position.market}
                      </span>
                      {isCurrentSymbol && (
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#4caf50', 
                          fontWeight: 'bold' 
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                      {position.quantity} {position.market === 'crypto' ? 'units' : 'shares'} @ {formatCurrency(position.entryPrice)}
                    </div>
                    
                    {/* Risk Indicators */}
                    {(position.riskLevel || position.stopLoss || position.takeProfit) && (
                      <div style={{ fontSize: '10px', marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                        {position.riskLevel && (
                          <span style={{ 
                            padding: '2px 4px', 
                            borderRadius: '3px',
                            backgroundColor: position.riskLevel === 'high' ? '#ffebee' : position.riskLevel === 'medium' ? '#fff3e0' : '#e8f5e8',
                            color: position.riskLevel === 'high' ? '#c62828' : position.riskLevel === 'medium' ? '#ef6c00' : '#2e7d32',
                            border: '1px solid ' + (position.riskLevel === 'high' ? '#ffcdd2' : position.riskLevel === 'medium' ? '#ffcc02' : '#c8e6c9')
                          }}>
                            {position.riskLevel === 'high' ? '🔴' : position.riskLevel === 'medium' ? '🟡' : '🟢'} {position.riskLevel}
                          </span>
                        )}
                        {position.stopLoss && (
                          <span style={{ color: '#f44336' }} title={`Stop Loss: ${formatCurrency(position.stopLoss)}`}>
                            <Shield className="w-3 h-3" />
                          </span>
                        )}
                        {position.takeProfit && (
                          <span style={{ color: '#4caf50' }} title={`Take Profit: ${formatCurrency(position.takeProfit)}`}>
                            <Target className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div style={{ fontSize: viewMode === 'detailed' ? '11px' : '12px' }}>
                      <div>Cost: <strong>{formatCurrency(cost)}</strong></div>
                      <div>Value: <strong>{formatCurrency(currentValue)}</strong></div>
                      {position.currentPrice && (
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          Current: {formatCurrency(position.currentPrice)}
                          {position.lastUpdated && (
                            <span style={{ marginLeft: 4 }}>({new Date(position.lastUpdated).toLocaleTimeString()})</span>
                          )}
                        </div>
                      )}
                      
                      {viewMode === 'detailed' && (
                        <>
                          {position.stopLoss && (
                            <div style={{ fontSize: '10px', color: '#f44336' }}>
                              Stop Loss: {formatCurrency(position.stopLoss)}
                            </div>
                          )}
                          {position.takeProfit && (
                            <div style={{ fontSize: '10px', color: '#4caf50' }}>
                              Take Profit: {formatCurrency(position.takeProfit)}
                            </div>
                          )}
                          {position.notes && (
                            <div style={{ fontSize: '10px', color: '#666', marginTop: 4, fontStyle: 'italic' }}>
                              📝 {position.notes}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: gainLoss >= 0 ? '#4caf50' : '#f44336',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      marginBottom: 4
                    }}>
                      {gainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(gainLossPercent)}
                    </div>
                    
                    <div style={{ 
                      fontSize: '12px',
                      color: gainLoss >= 0 ? '#4caf50' : '#f44336'
                    }}>
                      {formatCurrency(gainLoss)}
                    </div>
                    
                    <button
                      onClick={() => removePosition(position.symbol, position.market)}
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #f44336',
                        color: '#f44336',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginTop: 8
                      }}
                      title="Remove position"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div style={{ fontSize: '10px', color: '#999', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Added: {new Date(position.entryDate).toLocaleDateString()}</span>
                  {viewMode === 'detailed' && (
                    <span>Held: {Math.floor((Date.now() - position.entryDate) / (1000 * 60 * 60 * 24))}d</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Performance Highlights */}
      {positions.length > 1 && (stats.topGainer || stats.topLoser) && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8, fontWeight: 'bold' }}>
            Performance Highlights
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '11px' }}>
            {stats.topGainer && (
              <div>
                <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: 2 }}>
                  🚀 Top Gainer
                </div>
                <div>
                  {stats.topGainer.symbol}: {formatPercent(stats.topGainer.gainPercent)}
                </div>
              </div>
            )}
            
            {stats.topLoser && (
              <div>
                <div style={{ color: '#f44336', fontWeight: 'bold', marginBottom: 2 }}>
                  📉 Top Loser
                </div>
                <div>
                  {stats.topLoser.symbol}: {formatPercent(stats.topLoser.gainPercent)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;