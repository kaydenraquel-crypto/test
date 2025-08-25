// src/lib/api.ts
// Centralized API client for NovaSignal (v0.7.7 + LLM)
// ---------- Config ----------
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
// Export BACKEND for App.tsx
export const BACKEND = BASE;
// Enhanced request helper with robust error handling
import { fetchWithRetry, createApiError } from './errorHandling';
import coinDeskService from '../services/coindesk.js';
async function request(path, init) {
    try {
        return await fetchWithRetry(`${BASE}${path}`, init, 3, 1000);
    }
    catch (error) {
        // Enhanced error context
        const apiError = error instanceof Error
            ? createApiError(error.message, undefined, path)
            : createApiError('Unknown API error', undefined, path);
        console.error(`🚨 API Request failed: ${path}`, apiError);
        throw apiError;
    }
}
// ---------- Public API ----------
export const API = {
    // History - Enhanced with CoinDesk for crypto data
    async history(params) {
        // Use CoinDesk for crypto data when provider is coindesk or auto
        if (params.market === 'crypto' && (params.provider === 'coindesk' || params.provider === 'auto')) {
            try {
                console.log('📈 Using CoinDesk for crypto data:', params.symbol);
                const data = await coinDeskService.getCryptoHistoricalData(
                    params.symbol, 
                    `${params.interval}min`, 
                    params.days * 24 * (60 / params.interval) // Convert days to data points
                );
                
                return {
                    ohlc: data.data,
                    symbol: data.symbol,
                    count: data.count,
                    source: 'coindesk'
                };
            } catch (error) {
                console.warn('CoinDesk failed, falling back to backend:', error);
                // Fall through to backend request
            }
        }
        
        // Use backend for stocks or when CoinDesk fails
        const q = new URLSearchParams({
            symbol: params.symbol,
            market: params.market,
            interval: String(params.interval),
            days: String(params.days),
            provider: params.provider || "auto",
        });
        return request(`/api/history?${q.toString()}`);
    },
    // Indicators + signals
    async indicators(body) {
        return request("/api/indicators", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    // Predictions (demo)
    async predict(body) {
        return request("/api/predict", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    // News
    async news(params) {
        const q = new URLSearchParams({
            symbol: params.symbol,
            market: params.market,
            limit: String(params?.limit ?? 12),
        });
        return request(`/api/news?${q.toString()}`);
    },
    // ---------- NEW: LLM Analysis ----------
    // Hits your new /api/llm/analyze backend route (OpenAI under the hood)
    async analyzeLLM(body) {
        return request("/api/llm/analyze", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
};
// ---------- Legacy Function Exports (for App.tsx compatibility) ----------
export const getHistory = API.history;
export const getIndicators = API.indicators;
export const getPredictions = API.predict;
export const getNews = (symbol, market, limit) => API.news({ symbol, market, limit });
export default API;
