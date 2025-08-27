import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning,
  Security,
  TrendingUp,
  TrendingDown,
  Settings,
  Assessment,
  Timeline,
  Shield,
  NotificationsActive,
  Block,
} from '@mui/icons-material';
import { RiskMetrics, Position, TradingPreferences, TradingAlert } from '../../types/trading';

interface RiskManagerProps {
  riskMetrics: RiskMetrics;
  positions: Position[];
  preferences: TradingPreferences;
  alerts: TradingAlert[];
  onUpdatePreferences: (preferences: TradingPreferences) => void;
  onClosePosition?: (positionId: string) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  className?: string;
}

interface RiskLimitsDialog {
  open: boolean;
  preferences: TradingPreferences;
}

export const RiskManager: React.FC<RiskManagerProps> = ({
  riskMetrics,
  positions,
  preferences,
  alerts,
  onUpdatePreferences,
  onClosePosition,
  onAcknowledgeAlert,
  className,
}) => {
  const [limitsDialog, setLimitsDialog] = useState<RiskLimitsDialog>({
    open: false,
    preferences: { ...preferences },
  });

  // Calculate risk levels
  const riskLevels = useMemo(() => {
    const portfolioRisk = (riskMetrics.totalRisk / riskMetrics.portfolioValue) * 100;
    const varRisk = (riskMetrics.valueAtRisk / riskMetrics.portfolioValue) * 100;
    const drawdownRisk = riskMetrics.maxDrawdown * 100;
    
    return {
      portfolio: {
        value: portfolioRisk,
        level: portfolioRisk > 80 ? 'high' : portfolioRisk > 60 ? 'medium' : 'low',
        color: portfolioRisk > 80 ? 'error' : portfolioRisk > 60 ? 'warning' : 'success',
      },
      var: {
        value: varRisk,
        level: varRisk > 10 ? 'high' : varRisk > 5 ? 'medium' : 'low',
        color: varRisk > 10 ? 'error' : varRisk > 5 ? 'warning' : 'success',
      },
      drawdown: {
        value: drawdownRisk,
        level: drawdownRisk > 20 ? 'high' : drawdownRisk > 10 ? 'medium' : 'low',
        color: drawdownRisk > 20 ? 'error' : drawdownRisk > 10 ? 'warning' : 'success',
      },
    };
  }, [riskMetrics]);

  // Get high-risk positions
  const highRiskPositions = useMemo(() => {
    return positions.filter(position => {
      const positionValue = position.quantity * position.markPrice;
      const positionRisk = (positionValue / riskMetrics.portfolioValue) * 100;
      const pnlPercent = position.averagePrice > 0 
        ? ((position.markPrice - position.averagePrice) / position.averagePrice) * 100
        : 0;
      
      return positionRisk > 10 || Math.abs(pnlPercent) > 20 || position.leverage > 50;
    });
  }, [positions, riskMetrics.portfolioValue]);

  // Critical alerts
  const criticalAlerts = useMemo(() => {
    return alerts.filter(alert => 
      alert.severity === 'error' && !alert.acknowledged
    );
  }, [alerts]);

  const openLimitsDialog = () => {
    setLimitsDialog({
      open: true,
      preferences: { ...preferences },
    });
  };

  const closeLimitsDialog = () => {
    setLimitsDialog({
      open: false,
      preferences: { ...preferences },
    });
  };

  const saveLimits = () => {
    onUpdatePreferences(limitsDialog.preferences);
    closeLimitsDialog();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  return (
    <>
      <Card className={className}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Risk Manager
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Configure Risk Limits">
                <IconButton onClick={openLimitsDialog} size="small">
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<Warning />}>
              <Typography variant="body2" fontWeight={600}>
                {criticalAlerts.length} Critical Risk Alert{criticalAlerts.length > 1 ? 's' : ''}
              </Typography>
              {criticalAlerts.slice(0, 2).map(alert => (
                <Typography key={alert.id} variant="caption" display="block">
                  • {alert.message}
                </Typography>
              ))}
              {criticalAlerts.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{criticalAlerts.length - 2} more alerts
                </Typography>
              )}
            </Alert>
          )}

          {/* Risk Overview */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Portfolio Risk
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} color={`${riskLevels.portfolio.color}.main`}>
                    {formatPercent(riskLevels.portfolio.value)}
                  </Typography>
                  <Chip 
                    label={riskLevels.portfolio.level.toUpperCase()} 
                    size="small"
                    color={getRiskColor(riskLevels.portfolio.level)}
                    variant="filled"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(riskLevels.portfolio.value, 100)}
                  color={getRiskColor(riskLevels.portfolio.level)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Value at Risk (1D)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} color={`${riskLevels.var.color}.main`}>
                    {formatCurrency(riskMetrics.valueAtRisk)}
                  </Typography>
                  <Chip 
                    label={riskLevels.var.level.toUpperCase()} 
                    size="small"
                    color={getRiskColor(riskLevels.var.level)}
                    variant="filled"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(riskLevels.var.value * 10, 100)}
                  color={getRiskColor(riskLevels.var.level)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Max Drawdown
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} color={`${riskLevels.drawdown.color}.main`}>
                    {formatPercent(riskLevels.drawdown.value)}
                  </Typography>
                  <Chip 
                    label={riskLevels.drawdown.level.toUpperCase()} 
                    size="small"
                    color={getRiskColor(riskLevels.drawdown.level)}
                    variant="filled"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(riskLevels.drawdown.value * 5, 100)}
                  color={getRiskColor(riskLevels.drawdown.level)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Portfolio Metrics */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Portfolio Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Sharpe Ratio
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {riskMetrics.sharpeRatio.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Volatility
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatPercent(riskMetrics.volatility * 100)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Beta to Market
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {riskMetrics.betaToMarket.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Portfolio Value
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatCurrency(riskMetrics.portfolioValue)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* High Risk Positions */}
          {highRiskPositions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="warning.main">
                High Risk Positions ({highRiskPositions.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Side</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Size</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>P&L</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Risk %</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {highRiskPositions.map((position) => {
                      const positionValue = position.quantity * position.markPrice;
                      const positionRisk = (positionValue / riskMetrics.portfolioValue) * 100;
                      const pnlPercent = position.averagePrice > 0 
                        ? ((position.markPrice - position.averagePrice) / position.averagePrice) * 100
                        : 0;

                      return (
                        <TableRow key={position.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {position.symbol}
                              </Typography>
                              {position.leverage > 50 && (
                                <Chip 
                                  label={`${position.leverage}x`} 
                                  size="small" 
                                  color="error" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={position.side.toUpperCase()}
                              size="small"
                              color={position.side === 'long' ? 'success' : 'error'}
                              icon={position.side === 'long' ? <TrendingUp /> : <TrendingDown />}
                            />
                          </TableCell>
                          
                          <TableCell align="right">
                            <Typography variant="body2" fontFamily="monospace">
                              {position.quantity.toFixed(4)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              color={position.unrealizedPnl >= 0 ? 'success.main' : 'error.main'}
                              fontFamily="monospace"
                            >
                              {formatCurrency(position.unrealizedPnl)}
                            </Typography>
                            <Typography variant="caption" display="block" fontFamily="monospace">
                              {formatPercent(pnlPercent)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              color={positionRisk > 15 ? 'error.main' : 'warning.main'}
                            >
                              {formatPercent(positionRisk)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            {onClosePosition && (
                              <Tooltip title="Close Position">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onClosePosition(position.id)}
                                >
                                  <Block fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Recent Risk Alerts */}
          {alerts.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Recent Alerts ({alerts.length})
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {alerts.slice(0, 5).map((alert) => (
                  <Alert
                    key={alert.id}
                    severity={alert.severity}
                    sx={{ mb: 1 }}
                    action={
                      onAcknowledgeAlert && !alert.acknowledged ? (
                        <Button size="small" onClick={() => onAcknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                      ) : null
                    }
                  >
                    <Box>
                      <Typography variant="body2">{alert.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(alert.timestamp).toLocaleString()}
                        {alert.symbol && ` • ${alert.symbol}`}
                      </Typography>
                    </Box>
                  </Alert>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Risk Limits Dialog */}
      <Dialog open={limitsDialog.open} onClose={closeLimitsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Risk Management Settings
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Position Limits */}
            <Typography variant="h6" gutterBottom>
              Position Limits
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Position Size"
                  value={limitsDialog.preferences.maxPositionSize}
                  onChange={(e) => setLimitsDialog({
                    ...limitsDialog,
                    preferences: {
                      ...limitsDialog.preferences,
                      maxPositionSize: Number(e.target.value)
                    }
                  })}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography variant="body2">$</Typography>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Daily Loss Limit"
                  value={limitsDialog.preferences.dailyLossLimit}
                  onChange={(e) => setLimitsDialog({
                    ...limitsDialog,
                    preferences: {
                      ...limitsDialog.preferences,
                      dailyLossLimit: Number(e.target.value)
                    }
                  })}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography variant="body2">$</Typography>,
                  }}
                />
              </Grid>
            </Grid>

            {/* Auto Stop Loss */}
            <Typography variant="h6" gutterBottom>
              Automatic Risk Controls
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={limitsDialog.preferences.autoStopLoss}
                    onChange={(e) => setLimitsDialog({
                      ...limitsDialog,
                      preferences: {
                        ...limitsDialog.preferences,
                        autoStopLoss: e.target.checked
                      }
                    })}
                  />
                }
                label="Auto Stop Loss"
              />
              
              {limitsDialog.preferences.autoStopLoss && (
                <Box sx={{ ml: 4, mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Default Stop Loss: {limitsDialog.preferences.defaultStopLossPercent}%
                  </Typography>
                  <Slider
                    value={limitsDialog.preferences.defaultStopLossPercent}
                    onChange={(_, value) => setLimitsDialog({
                      ...limitsDialog,
                      preferences: {
                        ...limitsDialog.preferences,
                        defaultStopLossPercent: value as number
                      }
                    })}
                    min={1}
                    max={20}
                    step={0.5}
                    marks={[
                      { value: 1, label: '1%' },
                      { value: 5, label: '5%' },
                      { value: 10, label: '10%' },
                      { value: 20, label: '20%' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={limitsDialog.preferences.autoTakeProfit}
                    onChange={(e) => setLimitsDialog({
                      ...limitsDialog,
                      preferences: {
                        ...limitsDialog.preferences,
                        autoTakeProfit: e.target.checked
                      }
                    })}
                  />
                }
                label="Auto Take Profit"
                sx={{ mt: 2 }}
              />
              
              {limitsDialog.preferences.autoTakeProfit && (
                <Box sx={{ ml: 4, mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Default Take Profit: {limitsDialog.preferences.defaultTakeProfitPercent}%
                  </Typography>
                  <Slider
                    value={limitsDialog.preferences.defaultTakeProfitPercent}
                    onChange={(_, value) => setLimitsDialog({
                      ...limitsDialog,
                      preferences: {
                        ...limitsDialog.preferences,
                        defaultTakeProfitPercent: value as number
                      }
                    })}
                    min={5}
                    max={100}
                    step={5}
                    marks={[
                      { value: 5, label: '5%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </Box>

            {/* Notifications */}
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={limitsDialog.preferences.confirmationDialogs}
                    onChange={(e) => setLimitsDialog({
                      ...limitsDialog,
                      preferences: {
                        ...limitsDialog.preferences,
                        confirmationDialogs: e.target.checked
                      }
                    })}
                  />
                }
                label="Confirmation Dialogs"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={limitsDialog.preferences.soundAlerts}
                    onChange={(e) => setLimitsDialog({
                      ...limitsDialog,
                      preferences: {
                        ...limitsDialog.preferences,
                        soundAlerts: e.target.checked
                      }
                    })}
                  />
                }
                label="Sound Alerts"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeLimitsDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveLimits}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};