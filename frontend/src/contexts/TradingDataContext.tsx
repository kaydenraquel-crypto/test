import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getHistory, getIndicators, getPredictions, getNews, BACKEND } from '../lib/api';
import { tradingCache } from '../lib/cache';
import { useReconnectingWebSocket } from '../hooks/useReconnectingWebSocket';

// Types
interface TradingData {
  ohlc: any[];
  symbol: string;
  count: number;
  source?: string;
}

interface IndicatorData {
  [key: string]: (number | null)[];
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  url?: string;
}

interface PredictionData {
  symbol: string;
  predictions: any[];
  confidence?: number;
}

interface TradingDataContextType {
  // Current state
  currentSymbol: string;
  currentMarket: 'crypto' | 'stocks';
  currentInterval: string;
  chartData: TradingData | null;
  indicators: IndicatorData;
  news: NewsItem[];
  predictions: PredictionData | null;
  
  // Loading states
  isLoadingChart: boolean;
  isLoadingIndicators: boolean;
  isLoadingNews: boolean;
  isLoadingPredictions: boolean;
  
  // Actions
  setSymbol: (symbol: string, market?: 'crypto' | 'stocks') => void;
  setInterval: (interval: string) => void;
  refreshData: () => Promise<void>;
  refreshChart: () => Promise<void>;
  refreshIndicators: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshPredictions: () => Promise<void>;
  
  // WebSocket data
  liveData: any;
  isWebSocketConnected: boolean;
}

const TradingDataContext = createContext<TradingDataContextType | null>(null);

interface TradingDataProviderProps {
  children: ReactNode;
  initialSymbol?: string;
  initialMarket?: 'crypto' | 'stocks';
  initialInterval?: string;
}

export function TradingDataProvider({ 
  children, 
  initialSymbol = 'AAPL',
  initialMarket = 'stocks',
  initialInterval = '5'
}: TradingDataProviderProps) {
  // Core state
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
  const [currentMarket, setCurrentMarket] = useState<'crypto' | 'stocks'>(initialMarket);
  const [currentInterval, setCurrentInterval] = useState(initialInterval);
  
  // Data state
  const [chartData, setChartData] = useState<TradingData | null>(null);
  const [indicators, setIndicators] = useState<IndicatorData>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  
  // Loading states
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  
  // WebSocket connection
  const { 
    data: liveData, 
    isConnected: isWebSocketConnected 
  } = useReconnectingWebSocket(
    `${BACKEND.replace('http', 'ws')}/ws/stocks/ohlc?symbol=${currentSymbol}&interval=${currentInterval}&provider=polygon`
  );


  // Chart data fetching
  const refreshChart = useCallback(async () => {
    if (!currentSymbol) return;
    
    setIsLoadingChart(true);
    try {
      const days = 30;
      const interval = parseInt(currentInterval);
      
      // Check cache first
      const cachedHistory = tradingCache.getHistory(currentSymbol, currentMarket, interval, days);
      if (cachedHistory) {
        const data: TradingData = {
          ohlc: cachedHistory,
          symbol: currentSymbol,
          count: cachedHistory.length,
          source: 'cache'
        };
        setChartData(data);
        setIsLoadingChart(false);
        return;
      }

      const response = await getHistory({
        symbol: currentSymbol,
        market: currentMarket,
        interval: interval,
        days: days,
        provider: 'polygon'
      });

      const data: TradingData = {
        ohlc: response.ohlc || [],
        symbol: response.symbol || currentSymbol,
        count: response.count || 0,
        source: response.source
      };

      setChartData(data);
      tradingCache.setHistory(currentSymbol, currentMarket, interval, days, data.ohlc);
      
      console.log(`📊 Chart data loaded: ${data.count} candles for ${currentSymbol}`);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoadingChart(false);
    }
  }, [currentSymbol, currentMarket, currentInterval]);

  // Indicators fetching
  const refreshIndicators = useCallback(async () => {
    if (!currentSymbol) return;
    
    setIsLoadingIndicators(true);
    try {
      const interval = parseInt(currentInterval);
      const limit = 200; // Number of indicator data points
      
      // Check cache first
      const cachedIndicators = tradingCache.getIndicators(currentSymbol, currentMarket, interval, limit);
      if (cachedIndicators) {
        setIndicators(cachedIndicators);
        setIsLoadingIndicators(false);
        return;
      }

      const response = await getIndicators({
        symbol: currentSymbol,
        market: currentMarket,
        interval: interval,
        limit: limit,
        provider: 'polygon'
      });

      setIndicators(response);
      tradingCache.setIndicators(currentSymbol, currentMarket, interval, limit, response);
      
      console.log(`📈 Indicators loaded for ${currentSymbol}:`, Object.keys(response || {}).length);
    } catch (error) {
      console.error('Error loading indicators:', error);
    } finally {
      setIsLoadingIndicators(false);
    }
  }, [currentSymbol, currentMarket, currentInterval]);

  // News fetching
  const refreshNews = useCallback(async () => {
    if (!currentSymbol) return;
    
    setIsLoadingNews(true);
    try {
      // Check cache first
      const cachedNews = tradingCache.getNews(currentSymbol, currentMarket);
      if (cachedNews) {
        const formattedNews: NewsItem[] = cachedNews.map((item: any, index: number) => ({
          id: item.id || `${currentSymbol}-${index}`,
          title: item.title || item.headline || 'No title',
          summary: item.summary || item.description || 'No summary available',
          source: item.source || 'Unknown',
          timestamp: new Date(item.published || item.timestamp || Date.now()),
          url: item.url
        }));
        setNews(formattedNews);
        setIsLoadingNews(false);
        return;
      }

      const response = await getNews({
        symbol: currentSymbol,
        market: currentMarket,
        limit: 20
      });

      const newsData = Array.isArray(response) ? response : response.articles || [];
      const formattedNews: NewsItem[] = newsData.map((item: any, index: number) => ({
        id: item.id || `${currentSymbol}-${index}`,
        title: item.title || item.headline || 'No title',
        summary: item.summary || item.description || 'No summary available',
        source: item.source || 'Unknown',
        timestamp: new Date(item.published || item.timestamp || Date.now()),
        url: item.url
      }));

      setNews(formattedNews);
      tradingCache.setNews(currentSymbol, currentMarket, newsData);
      
      console.log(`📰 News loaded: ${formattedNews.length} articles for ${currentSymbol}`);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  }, [currentSymbol, currentMarket]);

  // Predictions fetching
  const refreshPredictions = useCallback(async () => {
    if (!currentSymbol) return;
    
    setIsLoadingPredictions(true);
    try {
      const interval = parseInt(currentInterval);
      
      // Check cache first
      const cachedPredictions = tradingCache.getPredictions(currentSymbol, currentMarket, interval);
      if (cachedPredictions) {
        setPredictions(cachedPredictions);
        setIsLoadingPredictions(false);
        return;
      }

      const response = await getPredictions({
        symbol: currentSymbol,
        market: currentMarket
      });

      const predictionData: PredictionData = {
        symbol: currentSymbol,
        predictions: Array.isArray(response) ? response : response.predictions || [],
        confidence: response.confidence
      };

      setPredictions(predictionData);
      tradingCache.setPredictions(currentSymbol, currentMarket, interval, predictionData);
      
      console.log(`🔮 Predictions loaded for ${currentSymbol}`);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [currentSymbol, currentMarket, currentInterval]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      refreshChart(),
      refreshIndicators(),
      refreshNews(),
      refreshPredictions()
    ]);
  }, [refreshChart, refreshIndicators, refreshNews, refreshPredictions]);

  // Actions
  const setSymbol = useCallback((symbol: string, market: 'crypto' | 'stocks' = currentMarket) => {
    setCurrentSymbol(symbol);
    setCurrentMarket(market);
    console.log(`🎯 Symbol changed to: ${symbol} (${market})`);
  }, [currentMarket]);

  const setInterval = useCallback((interval: string) => {
    setCurrentInterval(interval);
    console.log(`⏱️ Interval changed to: ${interval}`);
  }, []);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [currentSymbol, currentMarket, currentInterval]);

  const contextValue: TradingDataContextType = {
    // Current state
    currentSymbol,
    currentMarket,
    currentInterval,
    chartData,
    indicators,
    news,
    predictions,
    
    // Loading states
    isLoadingChart,
    isLoadingIndicators,
    isLoadingNews,
    isLoadingPredictions,
    
    // Actions
    setSymbol,
    setInterval,
    refreshData,
    refreshChart,
    refreshIndicators,
    refreshNews,
    refreshPredictions,
    
    // WebSocket data
    liveData,
    isWebSocketConnected
  };

  return (
    <TradingDataContext.Provider value={contextValue}>
      {children}
    </TradingDataContext.Provider>
  );
}

export const useTradingData = (): TradingDataContextType => {
  const context = useContext(TradingDataContext);
  if (!context) {
    throw new Error('useTradingData must be used within a TradingDataProvider');
  }
  return context;
};