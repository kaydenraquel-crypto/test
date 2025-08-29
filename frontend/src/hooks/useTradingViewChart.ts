import { useEffect, useRef, useCallback } from 'react';
import { 
  createChart, 
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  Time,
  SeriesType,
  ColorType,
  DeepPartial,
  ChartOptions,
  CrosshairMode,
  PriceScaleMode,
} from 'lightweight-charts';

export interface TradingViewChartOptions {
  height?: number;
  width?: number;
  backgroundColor?: string;
  textColor?: string;
  gridColor?: string;
  upColor?: string;
  downColor?: string;
  showVolume?: boolean;
  showGrid?: boolean;
  showCrosshair?: boolean;
  autoScale?: boolean;
  logScale?: boolean;
}

export interface ChartSeries {
  id: string;
  series: ISeriesApi<SeriesType>;
  type: 'main' | 'indicator' | 'overlay' | 'volume';
}

export interface UseTradingViewChartReturn {
  chartRef: React.RefObject<IChartApi | null>;
  containerRef: React.RefObject<HTMLDivElement>;
  mainSeriesRef: React.RefObject<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>;
  volumeSeriesRef: React.RefObject<ISeriesApi<"Histogram"> | null>;
  seriesRefs: React.RefObject<ChartSeries[]>;
  updateMainData: (data: CandlestickData[] | LineData[], type: 'candlestick' | 'line' | 'area') => void;
  updateVolumeData: (data: HistogramData[]) => void;
  addIndicatorSeries: (id: string, data: LineData[], options: any, priceScaleId?: string) => void;
  removeIndicatorSeries: (id: string) => void;
  clearAllIndicators: () => void;
  fitContent: () => void;
  takeScreenshot: () => string;
}

export function useTradingViewChart(
  options: TradingViewChartOptions = {}
): UseTradingViewChartReturn {
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const seriesRefs = useRef<ChartSeries[]>([]);

  const {
    height = 500,
    backgroundColor = '#0f0f23',
    textColor = '#ffffff',
    gridColor = '#2a2d4e',
    upColor = '#26a69a',
    downColor = '#ef5350',
    showVolume = true,
    showGrid = true,
    showCrosshair = true,
    autoScale = true,
    logScale = false,
  } = options;

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
        fontSize: 12,
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      },
      grid: {
        vertLines: { 
          color: gridColor,
          visible: showGrid,
          style: 1,
        },
        horzLines: { 
          color: gridColor,
          visible: showGrid,
          style: 1,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          visible: showCrosshair,
          labelVisible: true,
          color: textColor,
          width: 1,
          style: 3,
        },
        horzLine: {
          visible: showCrosshair,
          labelVisible: true,
          color: textColor,
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        visible: true,
        borderColor: gridColor,
        mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
        autoScale: autoScale,
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.4 : 0.1,
        },
      },
      timeScale: {
        visible: true,
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
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
      width: containerRef.current.clientWidth,
      height: height,
    };

    const chart = createChart(containerRef.current, chartOptions);
    chartRef.current = chart;

    // Create main candlestick series by default
    const mainSeries = chart.addCandlestickSeries({
      upColor: upColor,
      downColor: downColor,
      borderDownColor: downColor,
      borderUpColor: upColor,
      wickDownColor: downColor,
      wickUpColor: upColor,
    });
    mainSeriesRef.current = mainSeries;

    // Add to series tracking
    seriesRefs.current.push({
      id: 'main',
      series: mainSeries,
      type: 'main',
    });

    // Create volume series if enabled
    if (showVolume) {
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

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeriesRef.current = volumeSeries;
      seriesRefs.current.push({
        id: 'volume',
        series: volumeSeries,
        type: 'volume',
      });
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chart) {
        chart.applyOptions({ 
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      seriesRefs.current = [];
    };
  }, [
    backgroundColor,
    textColor,
    gridColor,
    upColor,
    downColor,
    showVolume,
    showGrid,
    showCrosshair,
    autoScale,
    logScale,
    height,
  ]);

  // Update main series data
  const updateMainData = useCallback((
    data: CandlestickData[] | LineData[], 
    type: 'candlestick' | 'line' | 'area'
  ) => {
    if (!chartRef.current || !containerRef.current) return;

    // Remove existing main series
    const existingMainIndex = seriesRefs.current.findIndex(s => s.type === 'main');
    if (existingMainIndex !== -1) {
      chartRef.current.removeSeries(seriesRefs.current[existingMainIndex].series);
      seriesRefs.current.splice(existingMainIndex, 1);
    }

    // Create new main series based on type
    let newMainSeries: ISeriesApi<"Candlestick" | "Line" | "Area">;

    if (type === 'candlestick') {
      newMainSeries = chartRef.current.addCandlestickSeries({
        upColor: upColor,
        downColor: downColor,
        borderDownColor: downColor,
        borderUpColor: upColor,
        wickDownColor: downColor,
        wickUpColor: upColor,
      });
      newMainSeries.setData(data as CandlestickData[]);
    } else if (type === 'line') {
      newMainSeries = chartRef.current.addLineSeries({
        color: upColor,
        lineWidth: 2,
        lineType: 0,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
      });
      newMainSeries.setData(data as LineData[]);
    } else {
      newMainSeries = chartRef.current.addAreaSeries({
        lineColor: upColor,
        topColor: `${upColor}40`,
        bottomColor: `${backgroundColor}00`,
        lineWidth: 2,
      });
      newMainSeries.setData(data as LineData[]);
    }

    mainSeriesRef.current = newMainSeries;
    seriesRefs.current.unshift({
      id: 'main',
      series: newMainSeries,
      type: 'main',
    });
  }, [upColor, downColor, backgroundColor]);

  // Update volume data
  const updateVolumeData = useCallback((data: HistogramData[]) => {
    if (!volumeSeriesRef.current) return;
    volumeSeriesRef.current.setData(data);
  }, []);

  // Add indicator series
  const addIndicatorSeries = useCallback((
    id: string,
    data: LineData[],
    seriesOptions: any,
    priceScaleId?: string
  ) => {
    if (!chartRef.current) return;

    // Remove existing series with same ID
    removeIndicatorSeries(id);

    const series = chartRef.current.addLineSeries({
      ...seriesOptions,
      priceScaleId: priceScaleId,
    });

    series.setData(data);

    // Configure separate price scale if provided
    if (priceScaleId && priceScaleId !== '') {
      chartRef.current.priceScale(priceScaleId).applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        mode: PriceScaleMode.Normal,
      });
    }

    seriesRefs.current.push({
      id,
      series,
      type: priceScaleId ? 'indicator' : 'overlay',
    });
  }, []);

  // Remove indicator series
  const removeIndicatorSeries = useCallback((id: string) => {
    if (!chartRef.current) return;

    const index = seriesRefs.current.findIndex(s => s.id === id);
    if (index !== -1) {
      chartRef.current.removeSeries(seriesRefs.current[index].series);
      seriesRefs.current.splice(index, 1);
    }
  }, []);

  // Clear all indicators (keeping main and volume)
  const clearAllIndicators = useCallback(() => {
    if (!chartRef.current) return;

    const indicatorsToRemove = seriesRefs.current.filter(s => 
      s.type === 'indicator' || s.type === 'overlay'
    );

    indicatorsToRemove.forEach(({ series }) => {
      chartRef.current?.removeSeries(series);
    });

    seriesRefs.current = seriesRefs.current.filter(s => 
      s.type === 'main' || s.type === 'volume'
    );
  }, []);

  // Fit chart content
  const fitContent = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  // Take screenshot
  const takeScreenshot = useCallback((): string => {
    if (!chartRef.current) return '';
    return chartRef.current.takeScreenshot().toDataURL();
  }, []);

  return {
    chartRef,
    containerRef,
    mainSeriesRef,
    volumeSeriesRef,
    seriesRefs,
    updateMainData,
    updateVolumeData,
    addIndicatorSeries,
    removeIndicatorSeries,
    clearAllIndicators,
    fitContent,
    takeScreenshot,
  };
}