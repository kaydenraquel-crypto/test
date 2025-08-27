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
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Close,
  Edit,
  Warning,
  Timeline,
  Assessment,
  Security,
  Calculate,
} from '@mui/icons-material';
import { Position, Order, OrderRequest, OrderSide } from '../../types/trading';

interface PositionManagerProps {
  positions: Position[];
  onClosePosition: (positionId: string) => Promise<void>;
  onModifyPosition: (positionId: string, stopLoss?: number, takeProfit?: number) => Promise<void>;
  onSubmitOrder?: (order: OrderRequest) => Promise<void>;
  totalEquity: number;
  className?: string;
}

interface ModifyPositionDialog {
  open: boolean;
  position: Position | null;
  stopLoss: string;
  takeProfit: string;
  quantity: string;
  action: 'close' | 'modify' | 'hedge';
}

export const PositionManager: React.FC<PositionManagerProps> = ({
  positions,
  onClosePosition,
  onModifyPosition,
  onSubmitOrder,
  totalEquity,
  className,
}) => {
  const [dialog, setDialog] = useState<ModifyPositionDialog>({
    open: false,
    position: null,
    stopLoss: '',
    takeProfit: '',
    quantity: '',
    action: 'modify',
  });
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
    const totalRealizedPnl = positions.reduce((sum, pos) => sum + pos.realizedPnl, 0);
    const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0);
    const totalNotional = positions.reduce((sum, pos) => sum + (pos.quantity * pos.markPrice), 0);
    
    return {
      totalUnrealizedPnl,
      totalRealizedPnl,
      totalPnl: totalUnrealizedPnl + totalRealizedPnl,
      totalMargin,
      totalNotional,
      portfolioRisk: totalEquity > 0 ? (totalMargin / totalEquity) * 100 : 0,
    };
  }, [positions, totalEquity]);

  const openPosition = (position: Position, action: 'close' | 'modify' | 'hedge') => {
    setDialog({
      open: true,
      position,
      stopLoss: '',
      takeProfit: '',
      quantity: position.quantity.toString(),
      action,
    });
  };

  const closeDialog = () => {
    setDialog({
      open: false,
      position: null,
      stopLoss: '',
      takeProfit: '',
      quantity: '',
      action: 'modify',
    });
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      setIsLoading({ ...isLoading, [positionId]: true });
      await onClosePosition(positionId);
      closeDialog();
    } catch (error) {
      console.error('Failed to close position:', error);
    } finally {
      setIsLoading({ ...isLoading, [positionId]: false });
    }
  };

  const handleModifyPosition = async () => {
    if (!dialog.position) return;

    try {
      setIsLoading({ ...isLoading, [dialog.position.id]: true });
      
      const stopLoss = dialog.stopLoss ? parseFloat(dialog.stopLoss) : undefined;
      const takeProfit = dialog.takeProfit ? parseFloat(dialog.takeProfit) : undefined;
      
      await onModifyPosition(dialog.position.id, stopLoss, takeProfit);
      closeDialog();
    } catch (error) {
      console.error('Failed to modify position:', error);
    } finally {
      setIsLoading({ ...isLoading, [dialog.position.id]: false });
    }
  };

  const handleHedgePosition = async () => {
    if (!dialog.position || !onSubmitOrder) return;

    try {
      setIsLoading({ ...isLoading, [dialog.position.id]: true });
      
      const hedgeOrder: OrderRequest = {
        symbol: dialog.position.symbol,
        side: dialog.position.side === 'long' ? 'sell' : 'buy',
        type: 'market',
        quantity: parseFloat(dialog.quantity),
        timeInForce: 'IOC',
      };
      
      await onSubmitOrder(hedgeOrder);
      closeDialog();
    } catch (error) {
      console.error('Failed to hedge position:', error);
    } finally {
      setIsLoading({ ...isLoading, [dialog.position.id]: false });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'success.main';
    if (pnl < 0) return 'error.main';
    return 'text.secondary';
  };

  const getPositionRisk = (position: Position) => {
    const notional = position.quantity * position.markPrice;
    return totalEquity > 0 ? (notional / totalEquity) * 100 : 0;
  };

  return (
    <>
      <Card className={className}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Positions
            </Typography>
            <Chip
              label={`${positions.length} Open`}
              size="small"
              color={positions.length > 0 ? 'primary' : 'default'}
            />
          </Box>

          {/* Portfolio Summary */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Unrealized P&L
                </Typography>
                <Typography variant="body2" fontWeight={600} color={getPnlColor(portfolioMetrics.totalUnrealizedPnl)}>
                  {formatCurrency(portfolioMetrics.totalUnrealizedPnl)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total P&L
                </Typography>
                <Typography variant="body2" fontWeight={600} color={getPnlColor(portfolioMetrics.totalPnl)}>
                  {formatCurrency(portfolioMetrics.totalPnl)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Margin Used
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(portfolioMetrics.totalMargin)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Portfolio Risk
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={portfolioMetrics.portfolioRisk > 80 ? 'error.main' : 
                         portfolioMetrics.portfolioRisk > 60 ? 'warning.main' : 'text.primary'}
                >
                  {portfolioMetrics.portfolioRisk.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Risk Warning */}
          {portfolioMetrics.portfolioRisk > 80 && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<Warning />}>
              High portfolio risk detected. Consider reducing position sizes.
            </Alert>
          )}

          {/* Positions Table */}
          {positions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Open Positions
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Your positions will appear here once you start trading
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Side</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Avg Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Mark Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>P&L</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Risk %</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {positions.map((position) => {
                    const pnlPercent = position.averagePrice > 0 
                      ? ((position.markPrice - position.averagePrice) / position.averagePrice) * 100
                      : 0;
                    const adjustedPnlPercent = position.side === 'short' ? -pnlPercent : pnlPercent;
                    const riskPercent = getPositionRisk(position);

                    return (
                      <TableRow
                        key={position.id}
                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {position.symbol}
                            </Typography>
                            <Chip
                              label={`${position.leverage}x`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 18 }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={position.side.toUpperCase()}
                            size="small"
                            color={position.side === 'long' ? 'success' : 'error'}
                            icon={position.side === 'long' ? <TrendingUp /> : <TrendingDown />}
                            sx={{ fontWeight: 600, minWidth: 80 }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontFamily="monospace">
                            {position.quantity.toFixed(4)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontFamily="monospace">
                            {formatCurrency(position.averagePrice)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontFamily="monospace">
                            {formatCurrency(position.markPrice)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={getPnlColor(position.unrealizedPnl)}
                              fontFamily="monospace"
                            >
                              {formatCurrency(position.unrealizedPnl)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={getPnlColor(adjustedPnlPercent)}
                              fontFamily="monospace"
                            >
                              {formatPercent(adjustedPnlPercent)}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography
                              variant="body2"
                              color={riskPercent > 10 ? 'error.main' : 
                                     riskPercent > 5 ? 'warning.main' : 'text.primary'}
                              fontFamily="monospace"
                            >
                              {riskPercent.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(riskPercent, 100)}
                              sx={{
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: riskPercent > 10 ? 'error.main' : 
                                          riskPercent > 5 ? 'warning.main' : 'success.main',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Modify Position">
                              <IconButton
                                size="small"
                                onClick={() => openPosition(position, 'modify')}
                                disabled={isLoading[position.id]}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Close Position">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openPosition(position, 'close')}
                                disabled={isLoading[position.id]}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {onSubmitOrder && (
                              <Tooltip title="Hedge Position">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => openPosition(position, 'hedge')}
                                  disabled={isLoading[position.id]}
                                >
                                  <Security fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Position Action Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.action === 'close' && 'Close Position'}
          {dialog.action === 'modify' && 'Modify Position'}
          {dialog.action === 'hedge' && 'Hedge Position'}
        </DialogTitle>
        
        <DialogContent>
          {dialog.position && (
            <Box sx={{ py: 1 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {dialog.position.symbol}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Side
                    </Typography>
                    <Typography variant="body2">
                      {dialog.position.side.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body2">
                      {dialog.position.quantity.toFixed(4)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Unrealized P&L
                    </Typography>
                    <Typography
                      variant="body2"
                      color={getPnlColor(dialog.position.unrealizedPnl)}
                    >
                      {formatCurrency(dialog.position.unrealizedPnl)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mark Price
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(dialog.position.markPrice)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {dialog.action === 'close' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Are you sure you want to close this position? This action cannot be undone.
                </Alert>
              )}

              {dialog.action === 'modify' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Stop Loss Price"
                    value={dialog.stopLoss}
                    onChange={(e) => setDialog({ ...dialog, stopLoss: e.target.value })}
                    type="number"
                    fullWidth
                    placeholder="Optional"
                  />
                  <TextField
                    label="Take Profit Price"
                    value={dialog.takeProfit}
                    onChange={(e) => setDialog({ ...dialog, takeProfit: e.target.value })}
                    type="number"
                    fullWidth
                    placeholder="Optional"
                  />
                </Box>
              )}

              {dialog.action === 'hedge' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="info">
                    Create an opposite position to hedge your risk.
                  </Alert>
                  <TextField
                    label="Hedge Quantity"
                    value={dialog.quantity}
                    onChange={(e) => setDialog({ ...dialog, quantity: e.target.value })}
                    type="number"
                    fullWidth
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>
            Cancel
          </Button>
          
          {dialog.action === 'close' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => dialog.position && handleClosePosition(dialog.position.id)}
              disabled={!dialog.position || isLoading[dialog.position.id]}
            >
              Close Position
            </Button>
          )}
          
          {dialog.action === 'modify' && (
            <Button
              variant="contained"
              onClick={handleModifyPosition}
              disabled={!dialog.position || isLoading[dialog.position.id]}
            >
              Update Position
            </Button>
          )}
          
          {dialog.action === 'hedge' && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleHedgePosition}
              disabled={!dialog.position || isLoading[dialog.position.id] || !dialog.quantity}
            >
              Create Hedge
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};