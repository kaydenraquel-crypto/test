import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  TrendingUp,
  TrendingDown,
  Timeline,
} from '@mui/icons-material';
import { OrderBook as OrderBookType, OrderBookEntry } from '../../types/trading';

interface OrderBookProps {
  orderBook: OrderBookType;
  onPriceClick?: (price: number) => void;
  precision?: number;
  maxLevels?: number;
  showSpread?: boolean;
  showDepth?: boolean;
  className?: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  orderBook,
  onPriceClick,
  precision = 2,
  maxLevels = 20,
  showSpread = true,
  showDepth = true,
  className,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [groupingSize, setGroupingSize] = useState<number>(0.01);
  const [showOnlyTop, setShowOnlyTop] = useState<boolean>(false);
  const [highlightedPrice, setHighlightedPrice] = useState<number | null>(null);

  // Group order book entries by price levels
  const groupedBids = useMemo(() => {
    const grouped = new Map<number, OrderBookEntry>();
    
    orderBook.bids.forEach(entry => {
      const groupedPrice = Math.floor(entry.price / groupingSize) * groupingSize;
      const existing = grouped.get(groupedPrice);
      
      if (existing) {
        existing.quantity += entry.quantity;
        existing.total += entry.total;
      } else {
        grouped.set(groupedPrice, { ...entry, price: groupedPrice });
      }
    });
    
    return Array.from(grouped.values())
      .sort((a, b) => b.price - a.price)
      .slice(0, maxLevels);
  }, [orderBook.bids, groupingSize, maxLevels]);

  const groupedAsks = useMemo(() => {
    const grouped = new Map<number, OrderBookEntry>();
    
    orderBook.asks.forEach(entry => {
      const groupedPrice = Math.floor(entry.price / groupingSize) * groupingSize;
      const existing = grouped.get(groupedPrice);
      
      if (existing) {
        existing.quantity += entry.quantity;
        existing.total += entry.total;
      } else {
        grouped.set(groupedPrice, { ...entry, price: groupedPrice });
      }
    });
    
    return Array.from(grouped.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, maxLevels);
  }, [orderBook.asks, groupingSize, maxLevels]);

  // Calculate spread
  const spread = useMemo(() => {
    const bestBid = groupedBids[0]?.price || 0;
    const bestAsk = groupedAsks[0]?.price || 0;
    return bestAsk - bestBid;
  }, [groupedBids, groupedAsks]);

  const spreadPercent = useMemo(() => {
    const bestBid = groupedBids[0]?.price || 0;
    if (bestBid === 0) return 0;
    return (spread / bestBid) * 100;
  }, [spread, groupedBids]);

  // Find max quantity for depth visualization
  const maxQuantity = useMemo(() => {
    const allEntries = [...groupedBids, ...groupedAsks];
    return Math.max(...allEntries.map(entry => entry.quantity), 1);
  }, [groupedBids, groupedAsks]);

  const handlePriceClick = (price: number) => {
    setHighlightedPrice(price);
    onPriceClick?.(price);
    
    // Clear highlight after 2 seconds
    setTimeout(() => setHighlightedPrice(null), 2000);
  };

  const handleZoomIn = () => {
    setGroupingSize(prev => Math.max(prev / 2, 0.01));
    setZoom(prev => Math.min(prev * 1.5, 10));
  };

  const handleZoomOut = () => {
    setGroupingSize(prev => Math.min(prev * 2, 10));
    setZoom(prev => Math.max(prev / 1.5, 0.1));
  };

  const handleCenter = () => {
    setGroupingSize(0.01);
    setZoom(1);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(precision);
  };

  const formatQuantity = (quantity: number) => {
    if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}K`;
    }
    return quantity.toFixed(3);
  };

  return (
    <Card className={className}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Order Book
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomIn fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOut fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center">
              <IconButton size="small" onClick={handleCenter}>
                <CenterFocusStrong fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyTop}
                onChange={(e) => setShowOnlyTop(e.target.checked)}
                size="small"
              />
            }
            label="Top Only"
          />
          
          <Typography variant="caption" color="text.secondary">
            Group: ${groupingSize.toFixed(2)}
          </Typography>
        </Box>

        {/* Spread Display */}
        {showSpread && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Spread
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={500}>
                  ${spread.toFixed(precision)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {spreadPercent.toFixed(3)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Order Book Table */}
        <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                  Price
                </TableCell>
                <TableCell align="right" sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                  Total
                </TableCell>
                {showDepth && (
                  <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontWeight: 600, width: 60 }}>
                    Depth
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Asks (reverse order for display) */}
              {groupedAsks.slice().reverse().map((ask, index) => (
                <TableRow
                  key={`ask-${ask.price}`}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: highlightedPrice === ask.price ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handlePriceClick(ask.price)}
                >
                  <TableCell
                    sx={{
                      py: 0.25,
                      color: 'error.main',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatPrice(ask.price)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ py: 0.25, fontSize: '0.8rem', fontFamily: 'monospace' }}
                  >
                    {formatQuantity(ask.quantity)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ py: 0.25, fontSize: '0.8rem', fontFamily: 'monospace' }}
                  >
                    {formatQuantity(ask.total)}
                  </TableCell>
                  {showDepth && (
                    <TableCell sx={{ py: 0.25, px: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(ask.quantity / maxQuantity) * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: 'rgba(255, 82, 82, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'error.main',
                          },
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {/* Spread Row */}
              <TableRow>
                <TableCell
                  colSpan={showDepth ? 4 : 3}
                  sx={{
                    py: 1,
                    textAlign: 'center',
                    borderTop: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <TrendingDown color="error" fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      ${spread.toFixed(precision)} ({spreadPercent.toFixed(3)}%)
                    </Typography>
                    <TrendingUp color="success" fontSize="small" />
                  </Box>
                </TableCell>
              </TableRow>

              {/* Bids */}
              {groupedBids.map((bid, index) => (
                <TableRow
                  key={`bid-${bid.price}`}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: highlightedPrice === bid.price ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handlePriceClick(bid.price)}
                >
                  <TableCell
                    sx={{
                      py: 0.25,
                      color: 'success.main',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatPrice(bid.price)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ py: 0.25, fontSize: '0.8rem', fontFamily: 'monospace' }}
                  >
                    {formatQuantity(bid.quantity)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ py: 0.25, fontSize: '0.8rem', fontFamily: 'monospace' }}
                  >
                    {formatQuantity(bid.total)}
                  </TableCell>
                  {showDepth && (
                    <TableCell sx={{ py: 0.25, px: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(bid.quantity / maxQuantity) * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'success.main',
                          },
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Stats */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="success.main">
                Total Bids
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatQuantity(groupedBids.reduce((sum, bid) => sum + bid.quantity, 0))}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Last Update
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {new Date(orderBook.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="error.main">
                Total Asks
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatQuantity(groupedAsks.reduce((sum, ask) => sum + ask.quantity, 0))}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};