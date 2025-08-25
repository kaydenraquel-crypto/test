import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Badge,
  Paper,
  ButtonGroup,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  ShowChart,
  Timeline,
  TrendingUp,
  TrendingDown,
  BarChart,
  CandlestickChart,
  Settings as SettingsIcon,
  Visibility,
  VisibilityOff,
  Palette,
  Tune,
  Add,
  Remove,
  RestartAlt,
  Refresh,
} from '@mui/icons-material';
import { useTradingData } from '../../../contexts/TradingDataContext';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi,
  CandlestickData,
  LineData
} from 'lightweight-charts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const indicators = [
  {
    category: 'Trend Indicators',
    items: [
      { name: 'Simple Moving Average (SMA)', key: 'sma', period: 20, enabled: true, color: '#2196F3' },
      { name: 'Exponential Moving Average (EMA)', key: 'ema', period: 12, enabled: true, color: '#FF9800' },
      { name: 'Bollinger Bands', key: 'bb', period: 20, enabled: false, color: '#9C27B0' },
      { name: 'MACD', key: 'macd', enabled: false, color: '#4CAF50' },
      { name: 'Parabolic SAR', key: 'psar', enabled: false, color: '#F44336' },
      { name: 'Ichimoku Cloud', key: 'ichimoku', enabled: false, color: '#795548' },
    ]
  },
  {
    category: 'Momentum Oscillators',
    items: [
      { name: 'RSI (14)', key: 'rsi', period: 14, enabled: false, color: '#3F51B5' },
      { name: 'Stochastic %K', key: 'stochastic', period: 14, enabled: false, color: '#E91E63' },
      { name: 'Williams %R', key: 'williams', period: 14, enabled: false, color: '#009688' },
      { name: 'CCI', key: 'cci', period: 20, enabled: false, color: '#607D8B' },
      { name: 'ROC', key: 'roc', period: 12, enabled: false, color: '#FF5722' },
      { name: 'Momentum', key: 'momentum', period: 10, enabled: false, color: '#8BC34A' },
    ]
  },
  {
    category: 'Volume Indicators',
    items: [
      { name: 'Volume', key: 'volume', enabled: true, color: '#9E9E9E' },
      { name: 'On-Balance Volume (OBV)', key: 'obv', enabled: false, color: '#CDDC39' },
      { name: 'Volume Rate of Change', key: 'vroc', enabled: false, color: '#FFC107' },
      { name: 'Accumulation/Distribution', key: 'ad', enabled: false, color: '#673AB7' },
      { name: 'Chaikin Money Flow', key: 'cmf', enabled: false, color: '#03DAC6' },
    ]
  },
  {
    category: 'Volatility Indicators',
    items: [
      { name: 'Average True Range (ATR)', key: 'atr', period: 14, enabled: false, color: '#FF6B6B' },
      { name: 'Bollinger Band Width', key: 'bbw', period: 20, enabled: false, color: '#4ECDC4' },
      { name: 'Standard Deviation', key: 'stddev', period: 20, enabled: false, color: '#45B7D1' },
      { name: 'Volatility Index', key: 'vix', enabled: false, color: '#96CEB4' },
    ]
  }
];

const overlays = [
  { name: 'Support & Resistance Lines', key: 'sr_lines', enabled: false },
  { name: 'Fibonacci Retracements', key: 'fibonacci', enabled: false },
  { name: 'Trend Lines', key: 'trend_lines', enabled: false },
  { name: 'Price Channels', key: 'channels', enabled: false },
  { name: 'Pivot Points', key: 'pivot_points', enabled: false },
  { name: 'Volume Profile', key: 'volume_profile', enabled: false },
];

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1mo' },
];

export function Charts() {
  const [tabValue, setTabValue] = useState(0);
  const [activeIndicators, setActiveIndicators] = useState<any>({});
  const [activeOverlays, setActiveOverlays] = useState<any>({});
  const [chartType, setChartType] = useState('candlestick');
  
  // Chart refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  // Get trading data from context
  const {
    currentSymbol,
    currentMarket,
    currentInterval,
    chartData,
    indicators: indicatorData,
    isLoadingChart,
    isLoadingIndicators,
    setSymbol,
    setInterval,
    refreshChart,
    refreshIndicators,
    liveData,
    isWebSocketConnected
  } = useTradingData();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleIndicator = (key: string) => {
    setActiveIndicators((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleOverlay = (key: string) => {
    setActiveOverlays((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetAllIndicators = () => {
    setActiveIndicators({});
    setActiveOverlays({});
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f0f23' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#2a2d4e' },
        horzLines: { color: '#2a2d4e' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2a2d4e',
      },
      timeScale: {
        borderColor: '#2a2d4e',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data when chartData changes
  useEffect(() => {
    if (!chartData || !candlestickSeriesRef.current || !chartData.ohlc) return;

    try {
      // Convert data to lightweight-charts format and deduplicate
      const rawData: CandlestickData[] = chartData.ohlc.map((candle: any) => ({
        time: Math.floor(new Date(candle.date || candle.ts).getTime() / 1000),
        open: parseFloat(candle.open || candle.o),
        high: parseFloat(candle.high || candle.h),
        low: parseFloat(candle.low || candle.l),
        close: parseFloat(candle.close || candle.c),
      })).filter(candle => 
        !isNaN(candle.time) && 
        !isNaN(candle.open) && 
        !isNaN(candle.high) && 
        !isNaN(candle.low) && 
        !isNaN(candle.close)
      );

      // Deduplicate by timestamp and sort
      const timeMap = new Map<number, CandlestickData>();
      rawData.forEach(candle => {
        // Keep the last entry for each timestamp (most recent data)
        timeMap.set(candle.time, candle);
      });
      
      const formattedData = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);

      console.log(`📊 Setting chart data: ${formattedData.length} candles for ${currentSymbol}`);
      candlestickSeriesRef.current.setData(formattedData);

      // Fit content to show all data
      chartRef.current?.timeScale().fitContent();
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [chartData, currentSymbol]);

  // Add indicators as line series
  useEffect(() => {
    if (!chartRef.current || !indicators || !chartData) return;

    // Clear existing indicator series (simplified - in production you'd track these)
    // For now, just add SMA and EMA if they're active and available
    
    if (activeIndicators.sma && indicators.sma) {
      try {
        const smaData: LineData[] = chartData.ohlc.map((candle: any, index: number) => ({
          time: Math.floor(new Date(candle.date || candle.ts).getTime() / 1000),
          value: indicators.sma[index]
        })).filter(point => point.value !== null && !isNaN(point.value));

        const smaSeries = chartRef.current.addLineSeries({
          color: '#2196F3',
          lineWidth: 2,
          title: 'SMA',
        });
        
        smaSeries.setData(smaData);
        console.log(`📈 Added SMA indicator with ${smaData.length} points`);
      } catch (error) {
        console.error('Error adding SMA indicator:', error);
      }
    }

    if (activeIndicators.ema && indicators.ema) {
      try {
        const emaData: LineData[] = chartData.ohlc.map((candle: any, index: number) => ({
          time: Math.floor(new Date(candle.date || candle.ts).getTime() / 1000),
          value: indicators.ema[index]
        })).filter(point => point.value !== null && !isNaN(point.value));

        const emaSeries = chartRef.current.addLineSeries({
          color: '#FF9800',
          lineWidth: 2,
          title: 'EMA',
        });
        
        emaSeries.setData(emaData);
        console.log(`📈 Added EMA indicator with ${emaData.length} points`);
      } catch (error) {
        console.error('Error adding EMA indicator:', error);
      }
    }
  }, [activeIndicators, indicators, chartData]);

  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    const market = newSymbol.includes('/') || newSymbol.includes('USDT') ? 'crypto' : 'stocks';
    setSymbol(newSymbol, market);
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    // Convert display timeframe to interval
    const intervalMap: { [key: string]: string } = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1h': '60',
      '4h': '240',
      '1d': '1440',
      '1w': '10080',
      '1mo': '43200'
    };
    
    const interval = intervalMap[newTimeframe] || '5';
    setInterval(interval);
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Advanced Charting
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Professional charting tools with comprehensive technical indicators and overlays
        </Typography>
      </Box>

      {/* Chart Controls */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              label="Symbol"
              value={currentSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              placeholder="AAPL, BTC/USD, TSLA..."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <MenuItem value="candlestick">Candlestick</MenuItem>
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="area">Area</MenuItem>
                <MenuItem value="ohlc">OHLC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  size="small"
                  variant={currentInterval === tf.value.replace(/[^0-9]/g, '') ? 'contained' : 'outlined'}
                  onClick={() => handleTimeframeChange(tf.value)}
                  sx={{ minWidth: '48px' }}
                >
                  {tf.label}
                </Button>
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refreshChart()}
              fullWidth
              disabled={isLoadingChart}
            >
              Refresh
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 1 }}>
            <Button
              variant="outlined"
              onClick={resetAllIndicators}
              fullWidth
              sx={{ minWidth: 'auto', px: 2 }}
              title="Reset All Indicators"
            >
              <RestartAlt />
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Chart Area */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {currentSymbol} - {currentMarket.toUpperCase()}
                  </Typography>
                  {isWebSocketConnected && (
                    <Chip 
                      label="LIVE" 
                      color="success" 
                      size="small" 
                      variant="filled"
                      sx={{ animation: 'pulse 2s infinite' }}
                    />
                  )}
                  {isLoadingChart && (
                    <CircularProgress size={20} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Badge
                    badgeContent={Object.values(activeIndicators).filter(Boolean).length}
                    color="primary"
                  >
                    <Chip
                      icon={<ShowChart />}
                      label="Indicators"
                      size="small"
                      variant="outlined"
                    />
                  </Badge>
                  <Badge
                    badgeContent={Object.values(activeOverlays).filter(Boolean).length}
                    color="secondary"
                  >
                    <Chip
                      icon={<Timeline />}
                      label="Overlays"
                      size="small"
                      variant="outlined"
                    />
                  </Badge>
                </Box>
              </Box>
              
              {chartData && chartData.ohlc && chartData.ohlc.length > 0 ? (
                <Box 
                  ref={chartContainerRef}
                  sx={{ 
                    height: 'calc(100% - 60px)', 
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                />
              ) : (
                <Box sx={{ 
                  height: 'calc(100% - 60px)', 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'primary.main'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    {isLoadingChart ? (
                      <>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="h6" color="primary.main" gutterBottom>
                          Loading Chart Data...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fetching {currentSymbol} data from API
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CandlestickChart sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" color="primary.main" gutterBottom>
                          No Chart Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Try refreshing or selecting a different symbol
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<Refresh />}
                          onClick={() => refreshChart()}
                        >
                          Retry Loading Data
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Indicators & Overlays Panel */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Card sx={{ height: '600px', overflow: 'hidden' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>
                  Technical Analysis
                </Typography>
              </Box>
              
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
              >
                <Tab label="Indicators" />
                <Tab label="Overlays" />
              </Tabs>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <TabPanel value={tabValue} index={0}>
                  {/* Indicators */}
                  {indicators.map((category, categoryIndex) => (
                    <Accordion key={categoryIndex} defaultExpanded={categoryIndex < 2}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2" fontWeight={500}>
                          {category.category}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List dense>
                          {category.items.map((indicator) => (
                            <ListItem key={indicator.key} sx={{ px: 2 }}>
                              <ListItemIcon>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: indicator.color,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={indicator.name}
                                secondary={indicator.period ? `Period: ${indicator.period}` : undefined}
                                primaryTypographyProps={{ variant: 'body2' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                              <ListItemSecondaryAction>
                                <Switch
                                  edge="end"
                                  checked={activeIndicators[indicator.key] || false}
                                  onChange={() => toggleIndicator(indicator.key)}
                                  size="small"
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {/* Overlays */}
                  <List>
                    {overlays.map((overlay) => (
                      <ListItem key={overlay.key}>
                        <ListItemIcon>
                          <Timeline />
                        </ListItemIcon>
                        <ListItemText
                          primary={overlay.name}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={activeOverlays[overlay.key] || false}
                            onChange={() => toggleOverlay(overlay.key)}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Quick Actions
                    </Typography>
                    <ButtonGroup fullWidth size="small" sx={{ mb: 2 }}>
                      <Button startIcon={<Add />}>Add Line</Button>
                      <Button startIcon={<Tune />}>Settings</Button>
                    </ButtonGroup>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<Palette />}
                    >
                      Color Theme
                    </Button>
                  </Box>
                </TabPanel>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Status & Active Indicators Summary */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Data Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📊 Data Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Symbol:</Typography>
                  <Typography variant="body2" fontWeight={500}>{currentSymbol}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Market:</Typography>
                  <Typography variant="body2" fontWeight={500}>{currentMarket.toUpperCase()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Interval:</Typography>
                  <Typography variant="body2" fontWeight={500}>{currentInterval}min</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Data Points:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {chartData?.count || 0} candles
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Source:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {chartData?.source || 'API'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">WebSocket:</Typography>
                  <Chip 
                    label={isWebSocketConnected ? 'Connected' : 'Disconnected'} 
                    color={isWebSocketConnected ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Indicators */}
        {Object.values(activeIndicators).filter(Boolean).length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📈 Active Indicators
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {indicators.flatMap(cat => cat.items)
                    .filter(ind => activeIndicators[ind.key])
                    .map((indicator) => (
                      <Chip
                        key={indicator.key}
                        label={indicator.name}
                        onDelete={() => toggleIndicator(indicator.key)}
                        size="small"
                        sx={{
                          bgcolor: indicator.color + '20',
                          color: indicator.color,
                          '& .MuiChip-deleteIcon': {
                            color: indicator.color,
                          },
                        }}
                      />
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}