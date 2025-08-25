
import asyncio
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from connectors.crypto_kraken import kraken_ohlc_stream
from connectors.crypto_kraken_rest import fetch_recent_ohlc_kraken, fetch_ohlc_days_kraken
from connectors.stocks_yfinance import fetch_recent_ohlc as yf_fetch_recent_ohlc, fetch_ohlc_days_yf
from connectors.stocks_alpaca import alpaca_stream_available, stream_alpaca_bars
from signals.indicators import compute_indicators
from signals.strategies import combined_signals
from ml.predictor import predict_prices_multi_horizon
from news.news_api import get_news_for_symbol
from llm.llm_client import analyze_asset_with_llm

load_dotenv()

app = FastAPI(title="NovaSignal Backend", version="0.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoryRequest(BaseModel):
    symbol: str
    market: str = "crypto"  # or stocks
    interval: int = 5
    days: int = 30  # 1,7,30,90 typical

@app.get("/api/history")
async def api_history(symbol: str, market: str = "crypto", interval: int = 5, days: int = 30):
    if market == "crypto":
        data = await fetch_ohlc_days_kraken(symbol, interval=interval, days=days)
    else:
        data = await fetch_ohlc_days_yf(symbol, interval=interval, days=days)
    return {"ohlc": data}

# (Existing ws endpoints, indicators, predict, etc. remain unchanged in your file)
