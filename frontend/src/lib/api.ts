// src/lib/api.ts
// Centralized API client for NovaSignal (v0.7.7 + LLM)

export type Candle = {
  time: number;           // ms epoch (frontend will normalize if needed)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type IndicatorResponse = {
  ohlc: any[]; // raw candles from backend; normalize on the frontend
  indicators: Record<string, number[] | Record<string, number>>;
  signals: { time: number; type: "buy" | "sell" | "neutral"; label?: string }[];
};

export type PredictResponse = {
  predictions: Record<string, number>;
};

export type NewsItem = {
  title: string;
  url?: string;
  source?: string;
  score?: number | null;
};

export type NewsResponse = {
  news: NewsItem[];
};

// ---------- Config ----------
const BASE = (typeof window !== 'undefined' && (window as any).__VITE_API_BASE) || "http://localhost:8000";

// Export BACKEND for App.tsx
export const BACKEND = BASE;

// Enhanced request helper with robust error handling
import { fetchWithRetry, createApiError } from './errorHandling'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await fetchWithRetry<T>(`${BASE}${path}`, init, 3, 1000)
  } catch (error) {
    // Enhanced error context
    const apiError = error instanceof Error
      ? createApiError(error.message, undefined, path)
      : createApiError('Unknown API error', undefined, path)
    
    console.error(`🚨 API Request failed: ${path}`, apiError)
    throw apiError
  }
}

// ---------- Public API ----------
export const API = {
  // History
  async history(params: { symbol: string; market: string; interval: number; days: number; provider?: string }) {
    const q = new URLSearchParams({
      symbol: params.symbol,
      market: params.market,
      interval: String(params.interval),
      days: String(params.days),
      provider: params.provider || "auto",
    });
    return request<{ ohlc: any[] }>(`/api/history?${q.toString()}`);
  },

  // Indicators + signals
  async indicators(body: { symbol: string; interval: number; limit: number; market: string; provider?: string }) {
    return request<IndicatorResponse>("/api/indicators", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Predictions (demo)
  async predict(body: {
    symbol: string;
    market: string;
    interval: number;
    horizons: string[];
    lookback: number;
    provider?: string;
    lookback_days?: number;
  }) {
    return request<PredictResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // News
  async news(params: { symbol: string; market: string; limit?: number }) {
    const q = new URLSearchParams({
      symbol: params.symbol,
      market: params.market,
      limit: String(params?.limit ?? 12),
    });
    return request<NewsResponse>(`/api/news?${q.toString()}`);
  },

  // ---------- NEW: LLM Analysis ----------
  // Hits your new /api/llm/analyze backend route (OpenAI under the hood)
  async analyzeLLM(body: {
    symbol: string;
    market: string;
    summary: string;
    indicators: Record<string, unknown>;
    signals: Array<{ time: number; type: "buy" | "sell" | "neutral"; label?: string }>;
    news: NewsItem[];
  }) {
    return request<{ analysis?: string; error?: string }>("/api/llm/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// ---------- Legacy Function Exports (for App.tsx compatibility) ----------
export const getHistory = API.history;
export const getIndicators = API.indicators;
export const getPredictions = API.predict;
export const getNews = (symbol: string, market: string, limit?: number) => 
  API.news({ symbol, market, limit });

export default API;