// src/components/WatchlistPanel.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Star, Plus, X, TrendingUp, TrendingDown, Activity, AlertTriangle, Eye } from 'lucide-react'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap?: number
  isAlert: boolean
  alertPrice?: number
  lastUpdated: number
}

interface Props {
  onSymbolSelect?: (symbol: string) => void
  selectedSymbol?: string
}

const WatchlistPanel: React.FC<Props> = ({ 
  onSymbolSelect,
  selectedSymbol 
}) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      price: 43250.50,
      change24h: 1050.25,
      changePercent24h: 2.45,
      volume24h: 28500000000,
      marketCap: 850000000000,
      isAlert: false,
      lastUpdated: Date.now()
    },
    {
      symbol: 'ETHUSDT',
      name: 'Ethereum',
      price: 2580.25,
      change24h: -31.75,
      changePercent24h: -1.23,
      volume24h: 15200000000,
      marketCap: 310000000000,
      isAlert: true,
      alertPrice: 2500,
      lastUpdated: Date.now()
    },
    {
      symbol: 'BNBUSDT',
      name: 'BNB',
      price: 315.67,
      change24h: 2.81,
      changePercent24h: 0.89,
      volume24h: 850000000,
      marketCap: 47000000000,
      isAlert: false,
      lastUpdated: Date.now()
    },
    {
      symbol: 'SOLUSDT',
      name: 'Solana',
      price: 98.45,
      change24h: -0.66,
      changePercent24h: -0.67,
      volume24h: 2100000000,
      marketCap: 42000000000,
      isAlert: false,
      lastUpdated: Date.now()
    },
    {
      symbol: 'ADAUSDT',
      name: 'Cardano',
      price: 0.4589,
      change24h: 0.0143,
      changePercent24h: 3.21,
      volume24h: 380000000,
      marketCap: 16200000000,
      isAlert: false,
      lastUpdated: Date.now()
    }
  ])

  const [showAddSymbol, setShowAddSymbol] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume'>('symbol')
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')

  // Popular symbols to add
  const popularSymbols = [
    'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT', 'LTCUSDT', 
    'MATICUSDT', 'ATOMUSDT', 'FILUSDT', 'XRPUSDT', 'TRXUSDT'
  ]

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => {
        if (!prev || !Array.isArray(prev) || prev.length === 0) {
          return prev;
        }
        return prev.map(item => {
        const volatility = item.symbol === 'BTCUSDT' ? 0.0015 : 0.002
        const change = (Math.random() - 0.5) * volatility
        const newPrice = item.price * (1 + change)
        const priceChange24h = newPrice - (item.price - item.change24h)
        const changePercent24h = (priceChange24h / (newPrice - priceChange24h)) * 100

        return {
          ...item,
          price: newPrice,
          change24h: priceChange24h,
          changePercent24h: changePercent24h,
          lastUpdated: Date.now()
        }
        });
      });
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const addSymbolToWatchlist = useCallback((symbol: string) => {
    if (!watchlist || !Array.isArray(watchlist) || watchlist.find(item => item.symbol === symbol)) return

    const basePrice = Math.random() * 100 + 10
    const change24h = (Math.random() - 0.5) * basePrice * 0.05
    
    const newItem: WatchlistItem = {
      symbol: symbol,
      name: symbol.replace('USDT', ''),
      price: basePrice,
      change24h: change24h,
      changePercent24h: (change24h / basePrice) * 100,
      volume24h: Math.random() * 1000000000,
      isAlert: false,
      lastUpdated: Date.now()
    }

    setWatchlist(prev => [...prev, newItem])
    setNewSymbol('')
    setShowAddSymbol(false)
  }, [watchlist])

  const removeSymbolFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => {
      if (!prev || !Array.isArray(prev)) return prev;
      return prev.filter(item => item.symbol !== symbol);
    });
  }, [])

    const toggleAlert = useCallback((symbol: string, alertPrice?: number) => {
    setWatchlist(prev => {
      if (!prev || !Array.isArray(prev)) return prev;
      return prev.map(item => 
        item.symbol === symbol
          ? { ...item, isAlert: !item.isAlert, alertPrice: alertPrice || item.price }
          : item
      );
    });
  }, [])

  const sortedWatchlist = React.useMemo(() => {
    if (!watchlist || !Array.isArray(watchlist) || watchlist.length === 0) {
      return [];
    }
    const sorted = [...watchlist].sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'price':
          aVal = a.price
          bVal = b.price
          break
        case 'change':
          aVal = a.changePercent24h
          bVal = b.changePercent24h
          break
        case 'volume':
          aVal = a.volume24h
          bVal = b.volume24h
          break
        default:
          aVal = a.symbol
          bVal = b.symbol
      }

      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
      }
      
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return sorted
  }, [watchlist, sortBy, sortAsc])

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4)
    if (price < 10) return price.toFixed(3)
    if (price < 100) return price.toFixed(2)
    return Math.round(price).toLocaleString()
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
    return volume.toFixed(0)
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(1)}T`
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`
    if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(1)}M`
    return 'N/A'
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star style={{ color: '#fbbf24', width: '20px', height: '20px' }} />
          <h3 style={{ color: '#00d4aa', margin: 0 }}>Watchlist</h3>
          <span style={{ 
            color: '#666', 
            fontSize: '14px',
            backgroundColor: '#2a2a2a',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
{watchlist?.length ?? 0} symbols
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '6px',
              color: '#888',
              cursor: 'pointer'
            }}
          >
            <Eye style={{ width: '16px', height: '16px' }} />
          </button>
          
          <button
            onClick={() => setShowAddSymbol(!showAddSymbol)}
            style={{
              backgroundColor: '#00d4aa',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'black',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add
          </button>
        </div>
      </div>

      {/* Add Symbol Panel */}
      {showAddSymbol && (
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Enter symbol (e.g., XRPUSDT)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && newSymbol && addSymbolToWatchlist(newSymbol)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: 'white',
                marginBottom: '8px'
              }}
            />
            <button
              onClick={() => newSymbol && addSymbolToWatchlist(newSymbol)}
              disabled={!newSymbol}
              style={{
                backgroundColor: newSymbol ? '#00d4aa' : '#444',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                color: newSymbol ? 'black' : '#888',
                cursor: newSymbol ? 'pointer' : 'not-allowed'
              }}
            >
              Add Symbol
            </button>
          </div>
          
          <div style={{ marginBottom: '8px', color: '#888', fontSize: '14px' }}>
            Popular symbols:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            {popularSymbols.filter(sym => !watchlist?.find(item => item.symbol === sym)).map(symbol => (
              <button
                key={symbol}
                onClick={() => addSymbolToWatchlist(symbol)}
                style={{
                  backgroundColor: '#333',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {symbol.replace('USDT', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {['symbol', 'price', 'change', 'volume'].map(sort => {
          if (!sort) return null; // Skip undefined values
          return (
            <button
              key={sort}
              onClick={() => {
                if (sortBy === sort) {
                  setSortAsc(!sortAsc)
                } else {
                  setSortBy(sort as any)
                  setSortAsc(true)
                }
              }}
              style={{
                backgroundColor: sortBy === sort ? '#00d4aa' : '#2a2a2a',
                color: sortBy === sort ? 'black' : '#ccc',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
              {sortBy === sort && (
                sortAsc ? '↑' : '↓'
              )}
            </button>
          );
        })}
      </div>

      {/* Watchlist Items */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {sortedWatchlist && sortedWatchlist.length > 0 ? sortedWatchlist.map(item => (
          <div
            key={item.symbol}
            onClick={() => onSymbolSelect && onSymbolSelect(item.symbol)}
            style={{
              backgroundColor: selectedSymbol === item.symbol ? '#1a3a2e' : '#2a2a2a',
              border: `1px solid ${selectedSymbol === item.symbol ? '#00d4aa' : '#333'}`,
              borderRadius: '8px',
              padding: viewMode === 'compact' ? '8px' : '12px',
              marginBottom: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Left: Symbol and Name */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: viewMode === 'compact' ? '14px' : '16px'
                  }}>
                    {item.symbol.replace('USDT', '')}
                  </span>
                  {item.isAlert && (
                    <AlertTriangle style={{
                      color: '#fbbf24',
                      width: '16px',
                      height: '16px'
                    }} />
                  )}
                </div>
                
                {viewMode === 'detailed' && (
                  <div style={{
                    color: '#888',
                    fontSize: '12px'
                  }}>
                    {item.name} • Vol: {formatVolume(item.volume24h)}
                    {item.marketCap && ` • MC: ${formatMarketCap(item.marketCap)}`}
                  </div>
                )}
              </div>

              {/* Center: Price */}
              <div style={{
                textAlign: 'right',
                flex: 1
              }}>
                <div style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: viewMode === 'compact' ? '14px' : '16px'
                }}>
                  ${formatPrice(item.price)}
                </div>
              </div>

              {/* Right: Change and Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                justifyContent: 'flex-end'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    color: item.changePercent24h >= 0 ? '#00d4aa' : '#ff6b6b',
                    fontWeight: 'bold',
                    fontSize: viewMode === 'compact' ? '12px' : '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {item.changePercent24h >= 0 ? (
                      <TrendingUp style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <TrendingDown style={{ width: '12px', height: '12px' }} />
                    )}
                    {item.changePercent24h >= 0 ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                  </div>
                  
                  {viewMode === 'detailed' && (
                    <div style={{
                      color: '#888',
                      fontSize: '12px'
                    }}>
                      {item.change24h >= 0 ? '+' : ''}${item.change24h.toFixed(2)}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAlert(item.symbol, item.price)
                    }}
                    style={{
                      backgroundColor: item.isAlert ? '#fbbf24' : 'transparent',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Activity style={{
                      width: '12px',
                      height: '12px',
                      color: item.isAlert ? 'black' : '#888'
                    }} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSymbolFromWatchlist(item.symbol)
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <X style={{
                      width: '12px',
                      height: '12px',
                      color: '#888'
                    }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div style={{
            color: '#888',
            textAlign: 'center',
            padding: '20px'
          }}>
            No symbols in watchlist
          </div>
        )}
      </div>

      {(watchlist?.length ?? 0) === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#888',
          padding: '40px 20px'
        }}>
          <Star style={{
            width: '48px',
            height: '48px',
            color: '#444',
            marginBottom: '16px'
          }} />
          <div>No symbols in your watchlist</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Click the "Add" button to start tracking symbols
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {(watchlist?.length ?? 0) > 0 && (
        <div style={{
          borderTop: '1px solid #333',
          paddingTop: '12px',
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#888'
        }}>
          <div>
            {watchlist?.filter(item => item.changePercent24h >= 0)?.length ?? 0} gaining
          </div>
          <div>
            {watchlist?.filter(item => item.changePercent24h < 0)?.length ?? 0} declining  
          </div>
          <div>
            {watchlist?.filter(item => item.isAlert)?.length ?? 0} alerts active
          </div>
        </div>
      )}
    </div>
  )
}

export default WatchlistPanel