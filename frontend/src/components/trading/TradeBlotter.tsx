import React, { useState, useMemo } from 'react';
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
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Search,
  FilterList,
  Download,
  Refresh,
  Timeline,
} from '@mui/icons-material';
import { Trade, OrderSide } from '../../types/trading';

interface TradeBlotterProps {
  trades: Trade[];
  onRefresh?: () => void;
  onExport?: (trades: Trade[]) => void;
  className?: string;
}

type SortField = 'timestamp' | 'symbol' | 'pnl' | 'quantity' | 'price';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  symbol: string;
  side: OrderSide | 'all';
  dateFrom: string;
  dateTo: string;
}

export const TradeBlotter: React.FC<TradeBlotterProps> = ({
  trades,
  onRefresh,
  onExport,
  className,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    symbol: 'all',
    side: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Get unique symbols for filter
  const availableSymbols = useMemo(() => {
    const symbols = Array.from(new Set(trades.map(trade => trade.symbol)));
    return symbols.sort();
  }, [trades]);

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    let filtered = trades.filter(trade => {
      const matchesSearch = searchTerm === '' || 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSymbol = filters.symbol === 'all' || trade.symbol === filters.symbol;
      const matchesSide = filters.side === 'all' || trade.side === filters.side;
      
      let matchesDate = true;
      if (filters.dateFrom) {
        matchesDate = matchesDate && trade.timestamp >= new Date(filters.dateFrom).getTime();
      }
      if (filters.dateTo) {
        matchesDate = matchesDate && trade.timestamp <= new Date(filters.dateTo).getTime();
      }
      
      return matchesSearch && matchesSymbol && matchesSide && matchesDate;
    });

    // Sort trades
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'pnl':
          aValue = a.pnl || 0;
          bValue = b.pnl || 0;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [trades, searchTerm, filters, sortField, sortDirection]);

  // Paginated trades
  const paginatedTrades = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredTrades.slice(startIndex, startIndex + pageSize);
  }, [filteredTrades, page, pageSize]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);
    const totalFees = filteredTrades.reduce((sum, trade) => sum + trade.fees + trade.commission, 0);
    const totalPnl = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = filteredTrades.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    return {
      totalTrades,
      totalVolume,
      totalFees,
      totalPnl,
      winRate,
    };
  }, [filteredTrades]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredTrades);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'success.main';
    if (pnl < 0) return 'error.main';
    return 'text.secondary';
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Card className={className}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Trade Blotter
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} size="small">
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {onExport && (
              <Tooltip title="Export Trades">
                <IconButton onClick={handleExport} size="small">
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Summary Statistics */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Trades
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {summaryStats.totalTrades}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Volume
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(summaryStats.totalVolume)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total P&L
              </Typography>
              <Typography variant="h6" fontWeight={600} color={getPnlColor(summaryStats.totalPnl)}>
                {formatCurrency(summaryStats.totalPnl)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Win Rate
              </Typography>
              <Typography variant="h6" fontWeight={600} color={summaryStats.winRate > 50 ? 'success.main' : 'text.primary'}>
                {summaryStats.winRate.toFixed(1)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Fees
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(summaryStats.totalFees)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small">
            <InputLabel>Symbol</InputLabel>
            <Select
              value={filters.symbol}
              onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
            >
              <MenuItem value="all">All Symbols</MenuItem>
              {availableSymbols.map(symbol => (
                <MenuItem key={symbol} value={symbol}>
                  {symbol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small">
            <InputLabel>Side</InputLabel>
            <Select
              value={filters.side}
              onChange={(e) => setFilters({ ...filters, side: e.target.value as OrderSide | 'all' })}
            >
              <MenuItem value="all">All Sides</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="From Date"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            label="To Date"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Trades Table */}
        {filteredTrades.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Trades Found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {searchTerm || filters.symbol !== 'all' || filters.side !== 'all' || filters.dateFrom || filters.dateTo
                ? 'Try adjusting your filters'
                : 'Your completed trades will appear here'
              }
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort('timestamp')}
                    >
                      Time {getSortIcon('timestamp')}
                    </TableCell>
                    <TableCell 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort('symbol')}
                    >
                      Symbol {getSortIcon('symbol')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Side</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity {getSortIcon('quantity')}
                    </TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort('price')}
                    >
                      Price {getSortIcon('price')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Fees</TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort('pnl')}
                    >
                      P&L {getSortIcon('pnl')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTrades.map((trade) => (
                    <TableRow
                      key={trade.id}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatDateTime(trade.timestamp)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {trade.symbol}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={trade.side.toUpperCase()}
                          size="small"
                          color={trade.side === 'buy' ? 'success' : 'error'}
                          icon={trade.side === 'buy' ? <TrendingUp /> : <TrendingDown />}
                          sx={{ fontWeight: 600, minWidth: 70 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="monospace">
                          {trade.quantity.toFixed(6)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="monospace">
                          {formatCurrency(trade.price)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="monospace">
                          {formatCurrency(trade.quantity * trade.price)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="monospace" color="error.main">
                          {formatCurrency(trade.fees + trade.commission)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {trade.pnl !== undefined ? (
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            fontWeight={600}
                            color={getPnlColor(trade.pnl)}
                          >
                            {formatCurrency(trade.pnl)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                          {trade.orderId.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredTrades.length)} of {filteredTrades.length} trades
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Rows</InputLabel>
                  <Select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
                
                <Pagination
                  count={Math.ceil(filteredTrades.length / pageSize)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  size="small"
                />
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};