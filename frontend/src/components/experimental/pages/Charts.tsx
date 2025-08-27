import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
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
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  FitScreen,
  Search,
  Save,
  Download,
  Share,
  MoreVert,
} from '@mui/icons-material';
import { useTradingData } from '../../../contexts/TradingDataContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  Time,
  SeriesType,
  ChartOptions,
  DeepPartial,
  CrosshairMode,
  PriceScaleMode,
  TickMarkType,
} from 'lightweight-charts';

// Interface definitions
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SeriesRef {
  id: string;
  series: ISeriesApi<SeriesType>;
  type: 'indicator' | 'overlay' | 'volume';
}

interface TechnicalIndicator {
  name: string;
  key: string;
  category: string;
  enabled: boolean;
  color: string;
  period?: number;
  params?: Record<string, any>;
}

interface ChartSettings {
  chartType: 'candlestick' | 'line' | 'area' | 'ohlc';
  theme: 'light' | 'dark' | 'auto';
  showVolume: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  showPriceScale: boolean;
  showTimeScale: boolean;
  autoScale: boolean;
  logScale: boolean;
  timeVisible: boolean;
  secondsVisible: boolean;
}

interface DrawingTool {
  id: string;
  type: 'trendline' | 'horizontal' | 'fibonacci' | 'rectangle' | 'channel';
  name: string;
  icon: string;
  active: boolean;
}

// Popular trading symbols for search
const POPULAR_SYMBOLS = [
  // Crypto
  { symbol: 'BTC/USD', name: 'Bitcoin', market: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', market: 'crypto' },
  { symbol: 'ADA/USD', name: 'Cardano', market: 'crypto' },
  { symbol: 'SOL/USD', name: 'Solana', market: 'crypto' },
  { symbol: 'DOT/USD', name: 'Polkadot', market: 'crypto' },
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'stocks' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'stocks' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'stocks' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', market: 'stocks' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'stocks' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'stocks' },
  { symbol: 'META', name: 'Meta Platforms Inc.', market: 'stocks' },
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Technical indicators configuration
const TECHNICAL_INDICATORS: TechnicalIndicator[] = [
  // Trend Indicators
  { name: 'Simple Moving Average (SMA)', key: 'sma', category: 'Trend', enabled: false, color: '#2196F3', period: 20 },
  { name: 'Exponential Moving Average (EMA)', key: 'ema', category: 'Trend', enabled: false, color: '#FF9800', period: 12 },
  { name: 'Bollinger Bands', key: 'bb', category: 'Trend', enabled: false, color: '#9C27B0', period: 20 },
  { name: 'MACD', key: 'macd', category: 'Momentum', enabled: false, color: '#4CAF50' },
  { name: 'Parabolic SAR', key: 'psar', category: 'Trend', enabled: false, color: '#F44336' },
  { name: 'Ichimoku Cloud', key: 'ichimoku', category: 'Trend', enabled: false, color: '#795548' },
  
  // Momentum Oscillators
  { name: 'RSI (14)', key: 'rsi', category: 'Momentum', enabled: false, color: '#3F51B5', period: 14 },
  { name: 'Stochastic %K', key: 'stochastic', category: 'Momentum', enabled: false, color: '#E91E63', period: 14 },
  { name: 'Williams %R', key: 'williams', category: 'Momentum', enabled: false, color: '#009688', period: 14 },
  { name: 'CCI', key: 'cci', category: 'Momentum', enabled: false, color: '#607D8B', period: 20 },
  { name: 'ROC', key: 'roc', category: 'Momentum', enabled: false, color: '#FF5722', period: 12 },
  { name: 'Momentum', key: 'momentum', category: 'Momentum', enabled: false, color: '#8BC34A', period: 10 },
  
  // Volume Indicators
  { name: 'Volume', key: 'volume', category: 'Volume', enabled: true, color: '#9E9E9E' },
  { name: 'On-Balance Volume (OBV)', key: 'obv', category: 'Volume', enabled: false, color: '#CDDC39' },
  { name: 'Volume Rate of Change', key: 'vroc', category: 'Volume', enabled: false, color: '#FFC107' },
  { name: 'Accumulation/Distribution', key: 'ad', category: 'Volume', enabled: false, color: '#673AB7' },
  { name: 'Chaikin Money Flow', key: 'cmf', category: 'Volume', enabled: false, color: '#03DAC6' },
  
  // Volatility Indicators
  { name: 'Average True Range (ATR)', key: 'atr', category: 'Volatility', enabled: false, color: '#FF6B6B', period: 14 },
  { name: 'Bollinger Band Width', key: 'bbw', category: 'Volatility', enabled: false, color: '#4ECDC4', period: 20 },
  { name: 'Standard Deviation', key: 'stddev', category: 'Volatility', enabled: false, color: '#45B7D1', period: 20 },
  { name: 'Volatility Index', key: 'vix', category: 'Volatility', enabled: false, color: '#96CEB4' },
];

const DRAWING_TOOLS: DrawingTool[] = [
  { id: 'trendline', type: 'trendline', name: 'Trend Line', icon: '📈', active: false },
  { id: 'horizontal', type: 'horizontal', name: 'Horizontal Line', icon: '➖', active: false },
  { id: 'fibonacci', type: 'fibonacci', name: 'Fibonacci Retracement', icon: '🌀', active: false },
  { id: 'rectangle', type: 'rectangle', name: 'Rectangle', icon: '▭', active: false },
  { id: 'channel', type: 'channel', name: 'Price Channel', icon: '📊', active: false },
];

const TIMEFRAMES = [
  { label: '1m', value: '1', interval: 1 },
  { label: '5m', value: '5', interval: 5 },
  { label: '15m', value: '15', interval: 15 },
  { label: '1h', value: '60', interval: 60 },
  { label: '4h', value: '240', interval: 240 },
  { label: '1D', value: '1440', interval: 1440 },
  { label: '1W', value: '10080', interval: 10080 },
  { label: '1M', value: '43200', interval: 43200 },
];

export function Charts() {
  const muiTheme = useMuiTheme();
  const { theme, chartSettings } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chart settings state
  const [localChartSettings, setLocalChartSettings] = useState<ChartSettings>({
    chartType: 'candlestick',
    theme: 'dark',
    showVolume: true,
    showGrid: true,
    showCrosshair: true,
    showPriceScale: true,
    showTimeScale: true,
    autoScale: true,
    logScale: false,
    timeVisible: true,
    secondsVisible: false,
  });
  
  // Indicators state
  const [activeIndicators, setActiveIndicators] = useState<Record<string, boolean>>({
    volume: true,
  });
  const [drawingTools, setDrawingTools] = useState<DrawingTool[]>(DRAWING_TOOLS);
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null);
  
  // Chart refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indicatorSeriesRef = useRef<SeriesRef[]>([]);
  
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

  // Create chart theme based on NovaSignal theme
  const chartTheme = useMemo((): DeepPartial<ChartOptions> => ({
    layout: {
      background: { type: ColorType.Solid, color: theme.backgroundColor },
      textColor: theme.textColor,
      fontSize: 12,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    grid: {
      vertLines: { 
        color: theme.gridColor,
        visible: localChartSettings.showGrid,
        style: 1,
      },
      horzLines: { 
        color: theme.gridColor,
        visible: localChartSettings.showGrid,
        style: 1,
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        visible: localChartSettings.showCrosshair,
        labelVisible: true,
        color: theme.textColor,
        width: 1,
        style: 3,
      },
      horzLine: {
        visible: localChartSettings.showCrosshair,
        labelVisible: true,
        color: theme.textColor,
        width: 1,
        style: 3,
      },
    },
    rightPriceScale: {
      visible: localChartSettings.showPriceScale,
      borderColor: theme.gridColor,
      mode: localChartSettings.logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
      autoScale: localChartSettings.autoScale,
      scaleMargins: {
        top: 0.1,
        bottom: localChartSettings.showVolume ? 0.4 : 0.1,
      },
    },
    timeScale: {
      visible: localChartSettings.showTimeScale,
      borderColor: theme.gridColor,
      timeVisible: localChartSettings.timeVisible,
      secondsVisible: localChartSettings.secondsVisible,
      tickMarkFormatter: (time: Time) => {
        const date = new Date((time as number) * 1000);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) {
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      },
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      axisPressedMouseMove: {
        time: true,
        price: true,
      },
      axisDoubleClickReset: {
        time: true,
        price: true,
      },
      mouseWheel: true,
      pinch: true,
    },
  }), [theme, localChartSettings]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🎯 Initializing TradingView Lightweight Charts...');

    const chart = createChart(chartContainerRef.current, {
      ...chartTheme,
      width: chartContainerRef.current.clientWidth,
      height: fullscreen ? window.innerHeight - 100 : 500,
    });

    chartRef.current = chart;

    // Create main price series
    let mainSeries: ISeriesApi<"Candlestick" | "Line" | "Area">;
    
    if (localChartSettings.chartType === 'candlestick') {
      mainSeries = chart.addCandlestickSeries({
        upColor: theme.upColor,
        downColor: theme.downColor,
        borderDownColor: theme.downColor,
        borderUpColor: theme.upColor,
        wickDownColor: theme.downColor,
        wickUpColor: theme.upColor,
      });
    } else if (localChartSettings.chartType === 'line') {
      mainSeries = chart.addLineSeries({
        color: theme.upColor,
        lineWidth: 2,
        lineType: 0,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
      });
    } else {
      mainSeries = chart.addAreaSeries({
        lineColor: theme.upColor,
        topColor: `${theme.upColor}40`,
        bottomColor: `${theme.backgroundColor}00`,
        lineWidth: 2,
      });
    }

    mainSeriesRef.current = mainSeries;

    // Create volume series if enabled
    if (localChartSettings.showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Set volume scale
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeriesRef.current = volumeSeries;
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: fullscreen ? window.innerHeight - 100 : 500,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [chartTheme, localChartSettings.chartType, localChartSettings.showVolume, fullscreen, theme]);

  // Update chart data when data changes
  useEffect(() => {
    if (!chartData?.ohlc || !mainSeriesRef.current) return;

    try {
      console.log(`📊 Updating chart with ${chartData.ohlc.length} candles for ${currentSymbol}`);

      // Convert data to lightweight-charts format
      const formattedData = chartData.ohlc
        .map((candle: any) => {
          const timestamp = Math.floor(new Date(candle.date || candle.ts || candle.time).getTime() / 1000);
          const ohlc = {
            time: timestamp as Time,
            open: parseFloat(candle.open || candle.o),
            high: parseFloat(candle.high || candle.h),
            low: parseFloat(candle.low || candle.l),
            close: parseFloat(candle.close || candle.c),
          };

          // Validate data
          if (
            isNaN(timestamp) || 
            isNaN(ohlc.open) || isNaN(ohlc.high) || 
            isNaN(ohlc.low) || isNaN(ohlc.close) ||
            ohlc.high < ohlc.low
          ) {
            return null;
          }

          return ohlc;
        })
        .filter(Boolean)
        .sort((a, b) => (a!.time as number) - (b!.time as number));

      // Convert for different chart types
      if (localChartSettings.chartType === 'line' || localChartSettings.chartType === 'area') {
        const lineData = formattedData.map(candle => ({
          time: candle!.time,
          value: candle!.close,
        }));
        mainSeriesRef.current.setData(lineData as LineData[]);
      } else {
        mainSeriesRef.current.setData(formattedData as CandlestickData[]);
      }

      // Update volume data if available
      if (volumeSeriesRef.current && chartData.ohlc[0]?.volume !== undefined) {
        const volumeData = formattedData.map((candle, index) => ({
          time: candle!.time,
          value: parseFloat(chartData.ohlc[index]?.volume || '0'),
          color: candle!.close >= candle!.open ? '#26a69a40' : '#ef534040',
        }));
        volumeSeriesRef.current.setData(volumeData as HistogramData[]);
      }

      // Fit content
      chartRef.current?.timeScale().fitContent();

    } catch (error) {
      console.error('❌ Error updating chart data:', error);
    }
  }, [chartData, currentSymbol, localChartSettings.chartType]);

  // Add technical indicators
  useEffect(() => {
    if (!chartRef.current || !indicatorData || !chartData?.ohlc) return;

    console.log('📈 Adding technical indicators...');

    // Clear existing indicator series
    indicatorSeriesRef.current.forEach(({ series }) => {
      chartRef.current?.removeSeries(series);
    });
    indicatorSeriesRef.current = [];

    const timestamps = chartData.ohlc.map((candle: any) => 
      Math.floor(new Date(candle.date || candle.ts || candle.time).getTime() / 1000) as Time
    );

    // Add enabled indicators
    Object.entries(activeIndicators).forEach(([key, enabled]) => {
      if (!enabled || !indicatorData[key]) return;

      const indicator = TECHNICAL_INDICATORS.find(ind => ind.key === key);
      if (!indicator) return;

      try {
        if (key === 'sma' || key === 'ema') {
          // Moving averages as line series
          const data = timestamps.map((time, index) => ({
            time,
            value: indicatorData[key][index],
          })).filter(point => point.value !== null && !isNaN(point.value));

          const series = chartRef.current!.addLineSeries({
            color: indicator.color,
            lineWidth: 2,
            title: indicator.name,
            crosshairMarkerVisible: false,
          });

          series.setData(data);
          indicatorSeriesRef.current.push({ id: key, series, type: 'overlay' });

        } else if (key === 'bb') {
          // Bollinger Bands - upper and lower
          if (indicatorData.bb_upper && indicatorData.bb_lower) {
            const upperData = timestamps.map((time, index) => ({
              time,
              value: indicatorData.bb_upper[index],
            })).filter(point => point.value !== null && !isNaN(point.value));

            const lowerData = timestamps.map((time, index) => ({
              time,
              value: indicatorData.bb_lower[index],
            })).filter(point => point.value !== null && !isNaN(point.value));

            const upperSeries = chartRef.current!.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: 'BB Upper',
              lineStyle: 2,
            });

            const lowerSeries = chartRef.current!.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: 'BB Lower',
              lineStyle: 2,
            });

            upperSeries.setData(upperData);
            lowerSeries.setData(lowerData);

            indicatorSeriesRef.current.push(
              { id: `${key}_upper`, series: upperSeries, type: 'overlay' },
              { id: `${key}_lower`, series: lowerSeries, type: 'overlay' }
            );
          }

        } else if (key === 'rsi' || key === 'stochastic' || key === 'williams') {
          // Oscillators - separate scale
          const data = timestamps.map((time, index) => ({
            time,
            value: indicatorData[key][index],
          })).filter(point => point.value !== null && !isNaN(point.value));

          const series = chartRef.current!.addLineSeries({
            color: indicator.color,
            lineWidth: 2,
            title: indicator.name,
            priceScaleId: `oscillator_${key}`,
          });

          // Configure oscillator scale
          chartRef.current!.priceScale(`oscillator_${key}`).applyOptions({
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
            mode: PriceScaleMode.Normal,
          });

          series.setData(data);
          indicatorSeriesRef.current.push({ id: key, series, type: 'indicator' });

        } else if (key === 'macd') {
          // MACD with histogram
          if (indicatorData.macd_line && indicatorData.macd_signal && indicatorData.macd_histogram) {
            const macdData = timestamps.map((time, index) => ({
              time,
              value: indicatorData.macd_line[index],
            })).filter(point => point.value !== null && !isNaN(point.value));

            const signalData = timestamps.map((time, index) => ({
              time,
              value: indicatorData.macd_signal[index],
            })).filter(point => point.value !== null && !isNaN(point.value));

            const histogramData = timestamps.map((time, index) => ({
              time,
              value: indicatorData.macd_histogram[index],
              color: indicatorData.macd_histogram[index] >= 0 ? '#26a69a' : '#ef5350',
            })).filter(point => point.value !== null && !isNaN(point.value));

            const macdSeries = chartRef.current!.addLineSeries({
              color: indicator.color,
              lineWidth: 2,
              title: 'MACD',
              priceScaleId: 'macd',
            });

            const signalSeries = chartRef.current!.addLineSeries({
              color: '#ff9800',
              lineWidth: 2,
              title: 'MACD Signal',
              priceScaleId: 'macd',
            });

            const histogramSeries = chartRef.current!.addHistogramSeries({
              title: 'MACD Histogram',
              priceScaleId: 'macd',
            });

            chartRef.current!.priceScale('macd').applyOptions({
              scaleMargins: { top: 0.1, bottom: 0.1 },
              mode: PriceScaleMode.Normal,
            });

            macdSeries.setData(macdData);
            signalSeries.setData(signalData);
            histogramSeries.setData(histogramData as HistogramData[]);

            indicatorSeriesRef.current.push(
              { id: 'macd_line', series: macdSeries, type: 'indicator' },
              { id: 'macd_signal', series: signalSeries, type: 'indicator' },
              { id: 'macd_histogram', series: histogramSeries, type: 'indicator' }
            );
          }
        }

        console.log(`✅ Added ${indicator.name} indicator`);
      } catch (error) {
        console.error(`❌ Error adding ${indicator.name} indicator:`, error);
      }
    });

  }, [activeIndicators, indicatorData, chartData]);

  // Event handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleIndicator = useCallback((key: string) => {
    setActiveIndicators(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const handleSymbolChange = useCallback((newSymbol: string) => {
    const market = newSymbol.includes('/') || newSymbol.includes('USDT') || newSymbol.includes('USD') ? 'crypto' : 'stocks';
    setSymbol(newSymbol, market as any);
    setShowSymbolSearch(false);
  }, [setSymbol]);

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    setInterval(newTimeframe);
  }, [setInterval]);

  const handleChartTypeChange = useCallback((newType: 'candlestick' | 'line' | 'area' | 'ohlc') => {
    setLocalChartSettings(prev => ({ ...prev, chartType: newType }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
  }, []);

  const resetChart = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  const filteredSymbols = useMemo(() => {
    return POPULAR_SYMBOLS.filter(s => 
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group indicators by category
  const indicatorsByCategory = useMemo(() => {
    const categories: Record<string, TechnicalIndicator[]> = {};
    TECHNICAL_INDICATORS.forEach(indicator => {
      if (!categories[indicator.category]) {
        categories[indicator.category] = [];
      }
      categories[indicator.category].push(indicator);
    });
    return categories;
  }, []);

  return (
    <Box 
      sx={{ 
        p: fullscreen ? 1 : 3, 
        height: fullscreen ? '100vh' : '100%', 
        overflow: 'auto',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      {!fullscreen && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            🚀 Professional Trading Charts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced TradingView Lightweight Charts with comprehensive technical analysis
          </Typography>
        </Box>
      )}

      {/* Chart Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            {/* Symbol Search */}
            <Box sx={{ position: 'relative', minWidth: 200 }}>
              <Button
                startIcon={<Search />}
                onClick={() => setShowSymbolSearch(true)}
                sx={{ 
                  justifyContent: 'flex-start',
                  minWidth: 200,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {currentSymbol} ({currentMarket.toUpperCase()})
              </Button>
              
              <Dialog 
                open={showSymbolSearch} 
                onClose={() => setShowSymbolSearch(false)}
                maxWidth="sm" 
                fullWidth
              >
                <DialogTitle>
                  🔍 Search Trading Symbols
                </DialogTitle>
                <DialogContent>
                  <Autocomplete
                    options={filteredSymbols}
                    getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Search symbols..." 
                        variant="outlined" 
                        fullWidth 
                        autoFocus
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {option.symbol}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.name} • {option.market.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    onChange={(_, value) => {
                      if (value) handleSymbolChange(value.symbol);
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowSymbolSearch(false)}>Cancel</Button>
                </DialogActions>
              </Dialog>
            </Box>

            {/* Chart Type */}
            <ToggleButtonGroup
              value={localChartSettings.chartType}
              exclusive
              onChange={(_, value) => value && handleChartTypeChange(value)}
              size="small"
            >
              <ToggleButton value="candlestick">
                <Tooltip title="Candlestick">
                  <CandlestickChart />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="line">
                <Tooltip title="Line Chart">
                  <ShowChart />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="area">
                <Tooltip title="Area Chart">
                  <BarChart />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Timeframes */}
            <Stack direction="row" spacing={1}>
              {TIMEFRAMES.map((tf) => (
                <Button
                  key={tf.value}
                  size="small"
                  variant={currentInterval === tf.value ? 'contained' : 'outlined'}
                  onClick={() => handleTimeframeChange(tf.value)}
                  sx={{ minWidth: 48, fontSize: '0.75rem' }}
                >
                  {tf.label}
                </Button>
              ))}
            </Stack>

            {/* Chart Actions */}
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={() => refreshChart()} 
                  disabled={isLoadingChart}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fit Screen">
                <IconButton onClick={resetChart}>
                  <FitScreen />
                </IconButton>
              </Tooltip>

              <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <IconButton onClick={toggleFullscreen}>
                  {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>

              {/* Connection Status */}
              <Chip 
                label={isWebSocketConnected ? 'LIVE' : 'DISCONNECTED'} 
                color={isWebSocketConnected ? 'success' : 'error'}
                size="small"
                variant="outlined"
                icon={isWebSocketConnected ? <TrendingUp /> : <TrendingDown />}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Chart Area */}
        <Grid size={{ xs: 12, lg: fullscreen ? 12 : 9 }}>
          <Card sx={{ height: fullscreen ? 'calc(100vh - 160px)' : '600px' }}>
            <CardContent sx={{ height: '100%', p: 1 }}>
              {/* Chart Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 1,
                px: 1,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {currentSymbol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentMarket.toUpperCase()} • {TIMEFRAMES.find(tf => tf.value === currentInterval)?.label}
                  </Typography>
                  {isLoadingChart && <CircularProgress size={16} />}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                  
                  <Switch
                    checked={localChartSettings.showVolume}
                    onChange={(e) => setLocalChartSettings(prev => ({ ...prev, showVolume: e.target.checked }))}
                    size="small"
                  />
                  <Typography variant="caption">Volume</Typography>
                </Box>
              </Box>
              
              {/* Chart Container */}
              {chartData && chartData.ohlc && chartData.ohlc.length > 0 ? (
                <Box 
                  ref={chartContainerRef}
                  sx={{ 
                    height: 'calc(100% - 50px)', 
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: theme.backgroundColor,
                    border: `1px solid ${theme.gridColor}`,
                  }}
                />
              ) : (
                <Box sx={{ 
                  height: 'calc(100% - 50px)', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    {isLoadingChart ? (
                      <>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="h6" color="primary" gutterBottom>
                          Loading Chart Data...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fetching {currentSymbol} data
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CandlestickChart sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" color="primary" gutterBottom>
                          No Chart Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Try refreshing or selecting a different symbol
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<Refresh />}
                          onClick={refreshChart}
                        >
                          Load Data
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Technical Analysis Panel */}
        {!fullscreen && (
          <Grid size={{ xs: 12, lg: 3 }}>
            <Card sx={{ height: '600px', overflow: 'hidden' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={600}>
                    📊 Technical Analysis
                  </Typography>
                </Box>
                
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Indicators" />
                  <Tab label="Drawing" />
                  <Tab label="Settings" />
                </Tabs>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {/* Indicators Tab */}
                  <TabPanel value={tabValue} index={0}>
                    {Object.entries(indicatorsByCategory).map(([category, indicators]) => (
                      <Accordion key={category} defaultExpanded={category === 'Trend'}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {category} ({indicators.filter(ind => activeIndicators[ind.key]).length}/{indicators.length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          <List dense>
                            {indicators.map((indicator) => (
                              <ListItem key={indicator.key} sx={{ px: 2 }}>
                                <ListItemIcon>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      bgcolor: indicator.color,
                                      opacity: activeIndicators[indicator.key] ? 1 : 0.3,
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={indicator.name}
                                  secondary={indicator.period ? `Period: ${indicator.period}` : undefined}
                                  primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
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
                    
                    <Box sx={{ p: 2, mt: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<RestartAlt />}
                        onClick={() => setActiveIndicators({ volume: true })}
                      >
                        Reset All
                      </Button>
                    </Box>
                  </TabPanel>

                  {/* Drawing Tools Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Drawing Tools
                      </Typography>
                      <Grid container spacing={1}>
                        {drawingTools.map((tool) => (
                          <Grid size={{ xs: 6 }} key={tool.id}>
                            <Button
                              fullWidth
                              size="small"
                              variant={activeDrawingTool === tool.id ? 'contained' : 'outlined'}
                              onClick={() => setActiveDrawingTool(
                                activeDrawingTool === tool.id ? null : tool.id
                              )}
                              sx={{ 
                                minHeight: 60,
                                flexDirection: 'column',
                                fontSize: '0.75rem',
                                textTransform: 'none',
                              }}
                            >
                              <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>{tool.icon}</Box>
                              {tool.name}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                      
                      <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                        Drawing tools are coming soon! 🎨
                      </Alert>
                    </Box>
                  </TabPanel>

                  {/* Settings Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Chart Settings
                      </Typography>
                      
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={localChartSettings.showGrid}
                              onChange={(e) => setLocalChartSettings(prev => 
                                ({ ...prev, showGrid: e.target.checked }))}
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Show Grid</Typography>}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={localChartSettings.showCrosshair}
                              onChange={(e) => setLocalChartSettings(prev => 
                                ({ ...prev, showCrosshair: e.target.checked }))}
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Show Crosshair</Typography>}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={localChartSettings.autoScale}
                              onChange={(e) => setLocalChartSettings(prev => 
                                ({ ...prev, autoScale: e.target.checked }))}
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Auto Scale</Typography>}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={localChartSettings.logScale}
                              onChange={(e) => setLocalChartSettings(prev => 
                                ({ ...prev, logScale: e.target.checked }))}
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">Log Scale</Typography>}
                        />
                        
                        <Divider />
                        
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Save />}
                          size="small"
                        >
                          Save Settings
                        </Button>
                        
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Download />}
                          size="small"
                        >
                          Export Chart
                        </Button>
                      </Stack>
                    </Box>
                  </TabPanel>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Data Status Footer */}
      {!fullscreen && (
        <Box sx={{ mt: 2 }}>
          <Card>
            <CardContent sx={{ py: 2 }}>
              <Grid container spacing={3}>
                {/* Data Status */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📈 Market Data
                  </Typography>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Data Points</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {chartData?.count || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Source</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {chartData?.source || 'API'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={isWebSocketConnected ? 'Real-time' : 'Historical'} 
                        color={isWebSocketConnected ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* Active Indicators */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🎯 Active Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(activeIndicators)
                      .filter(([_, enabled]) => enabled)
                      .map(([key, _]) => {
                        const indicator = TECHNICAL_INDICATORS.find(ind => ind.key === key);
                        return indicator ? (
                          <Chip
                            key={key}
                            label={indicator.name.split(' ')[0]}
                            size="small"
                            sx={{
                              bgcolor: `${indicator.color}20`,
                              color: indicator.color,
                              fontWeight: 600,
                            }}
                          />
                        ) : null;
                      })}
                    {Object.values(activeIndicators).filter(Boolean).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No indicators active
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}