"""
Enhanced Alpaca Markets connector for US stocks
Free tier provides real-time and historical data for all US stocks
"""
import os
import asyncio
import aiohttp
import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

logger = logging.getLogger(__name__)

# Alpaca configuration
ALPACA_KEY = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET = os.getenv("ALPACA_SECRET_KEY", "")
ALPACA_BASE_URL = "https://data.alpaca.markets"
ALPACA_WS = "wss://stream.data.alpaca.markets/v2/iex"  # free IEX stream (may be 15-min delay); use /sip for paid

def alpaca_stream_available() -> bool:
    return bool(ALPACA_KEY and ALPACA_SECRET)

def _interval_to_alpaca_timeframe(interval_minutes: int) -> str:
    """Convert interval in minutes to Alpaca timeframe"""
    if interval_minutes == 1:
        return "1Min"
    elif interval_minutes == 5:
        return "5Min"
    elif interval_minutes == 15:
        return "15Min"
    elif interval_minutes == 30:
        return "30Min"
    elif interval_minutes == 60:
        return "1Hour"
    elif interval_minutes >= 1440:
        return "1Day"
    else:
        # Default to closest available
        return "1Min"

async def fetch_alpaca_bars(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    """
    Fetch historical bars from Alpaca for US stocks
    
    Args:
        symbol: Stock symbol (e.g., "AAPL", "TSLA", "SPY")
        interval: Interval in minutes
        days: Number of days of history
    
    Returns:
        List of OHLCV dictionaries
    """
    if not ALPACA_KEY:
        logger.warning("ALPACA_API_KEY not configured, skipping Alpaca data")
        return []
    
    try:
        timeframe = _interval_to_alpaca_timeframe(interval)
        
        # Calculate start and end dates
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Format dates for API
        start_str = start_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        end_str = end_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # Build API URL
        url = f"{ALPACA_BASE_URL}/v2/stocks/{symbol.upper()}/bars"
        params = {
            "timeframe": timeframe,
            "start": start_str,
            "end": end_str,
            "limit": 10000,  # Max limit
            "adjustment": "raw"  # No dividend/split adjustments
        }
        
        headers = {
            "APCA-API-KEY-ID": ALPACA_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET,
        }
        
        logger.info(f"Fetching Alpaca data for {symbol} ({timeframe}, {days} days)")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, params=params) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Alpaca API error {response.status}: {error_text}")
                    return []
                
                data = await response.json()
                
                if "bars" not in data:
                    logger.warning(f"No bars data for {symbol} from Alpaca")
                    return []
                
                bars = data["bars"]
                if not bars:
                    logger.warning(f"Empty bars data for {symbol} from Alpaca")
                    return []
                
                # Convert to our standard format
                ohlc_data = []
                for bar in bars:
                    ohlc_data.append({
                        "ts": int(datetime.fromisoformat(bar["t"].replace("Z", "+00:00")).timestamp()),
                        "open": float(bar["o"]),
                        "high": float(bar["h"]),
                        "low": float(bar["l"]),
                        "close": float(bar["c"]),
                        "volume": float(bar["v"])
                    })
                
                logger.info(f"Successfully fetched {len(ohlc_data)} bars from Alpaca for {symbol}")
                return ohlc_data
                
    except Exception as e:
        logger.error(f"Alpaca fetch error for {symbol}: {e}")
        return []

async def stream_alpaca_bars(symbol: str, interval: int = 1) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Minimal Alpaca websocket client for bar updates.
    NOTE: Replace with official SDK for production. Interval control is limited.
    """
    import websockets
    async with websockets.connect(ALPACA_WS, ping_interval=20, ping_timeout=20) as ws:
        await ws.send(json.dumps({"action": "auth", "key": ALPACA_KEY, "secret": ALPACA_SECRET}))
        # Subscribe to minute aggregates
        await ws.send(json.dumps({"action": "subscribe", "bars": [symbol]}))
        async for raw in ws:
            try:
                msg = json.loads(raw)
                if isinstance(msg, list):
                    for item in msg:
                        if item.get("T") == "b" and item.get("S") == symbol:
                            # Bar message: time t, open o, high h, low l, close c, volume v
                            yield {
                                "ts": int(item["t"] / 1000000000),  # ns -> s
                                "open": float(item["o"]),
                                "high": float(item["h"]),
                                "low": float(item["l"]),
                                "close": float(item["c"]),
                                "volume": float(item["v"]),
                            }
            except Exception:
                continue
