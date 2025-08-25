// Dynamic chart loader to reduce initial bundle size
import type { 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  LineData, 
  HistogramData,
  DeepPartial,
  ChartOptions,
  CandlestickSeriesOptions,
  LineSeriesOptions,
  HistogramSeriesOptions 
} from 'lightweight-charts'

// Lazy load the chart library
export const loadChartLibrary = async () => {
  const { createChart } = await import('lightweight-charts')
  return { createChart }
}

// Chart creation helper with lazy loading
export const createLazyChart = async (
  container: HTMLElement,
  options?: DeepPartial<ChartOptions>
): Promise<IChartApi> => {
  const { createChart } = await loadChartLibrary()
  return createChart(container, options)
}

// Export types for use throughout the app
export type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  DeepPartial,
  ChartOptions,
  CandlestickSeriesOptions,
  LineSeriesOptions,
  HistogramSeriesOptions
}