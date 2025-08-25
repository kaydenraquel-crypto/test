"""
Improved Yahoo Finance connector with better error handling
"""
import asyncio
import logging
from typing import List, Dict, Any
import aiohttp
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

async def fetch_yfinance_improved(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    """
    Fetch stock data from Yahoo Finance with improved error handling
    
    Args:
        symbol: Stock symbol (e.g., "AAPL")
        interval: Interval in minutes  
        days: Number of days of history
    
    Returns:
        List of OHLCV dictionaries
    """
    
    try:
        # Calculate period
        if days <= 1:
            period = "1d"
        elif days <= 5:
            period = "5d"
        elif days <= 30:
            period = "1mo"
        elif days <= 90:
            period = "3mo"
        else:
            period = "1y"
        
        # Yahoo Finance interval mapping
        if interval == 1:
            yf_interval = "1m"
        elif interval == 5:
            yf_interval = "5m"
        elif interval == 15:
            yf_interval = "15m"
        elif interval == 30:
            yf_interval = "30m"
        elif interval == 60:
            yf_interval = "1h"
        else:
            yf_interval = "1d"
        
        # Use Yahoo Finance query API directly (more reliable than yfinance library)
        url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol
        params = {
            "range": period,
            "interval": yf_interval,
            "includePrePost": "false",
            "useYfid": "true",
            "includeAdjustedClose": "true",
            "includeDividends": "false"
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        logger.info(f"Fetching improved Yahoo Finance data for {symbol} ({yf_interval}, {period})")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as response:
                if response.status != 200:
                    logger.error(f"Yahoo Finance API error {response.status}")
                    return []
                
                data = await response.json()
                
                # Check if we got valid data
                if "chart" not in data or not data["chart"]["result"]:
                    logger.warning(f"Yahoo Finance returned no data for {symbol}")
                    return []
                
                result = data["chart"]["result"][0]
                
                # Check if market data exists
                if not result.get("timestamp") or not result.get("indicators"):
                    logger.warning(f"Yahoo Finance missing timestamp/indicators for {symbol}")
                    return []
                
                timestamps = result["timestamp"]
                quotes = result["indicators"]["quote"][0]
                
                # Extract OHLCV data
                opens = quotes.get("open", [])
                highs = quotes.get("high", [])
                lows = quotes.get("low", [])
                closes = quotes.get("close", [])
                volumes = quotes.get("volume", [])
                
                # Convert to our format with proper timezone handling
                ohlc_data = []
                for i in range(len(timestamps)):
                    # Skip bars with missing data
                    if (i >= len(opens) or opens[i] is None or
                        i >= len(highs) or highs[i] is None or
                        i >= len(lows) or lows[i] is None or
                        i >= len(closes) or closes[i] is None):
                        continue
                    
                    # Yahoo Finance timestamps are in UTC, but for display purposes
                    # we can keep them as-is since the frontend will handle timezone conversion
                    ohlc_data.append({
                        "ts": int(timestamps[i]),
                        "open": float(opens[i]),
                        "high": float(highs[i]),
                        "low": float(lows[i]),
                        "close": float(closes[i]),
                        "volume": int(volumes[i] if i < len(volumes) and volumes[i] is not None else 0)
                    })
                
                logger.info(f"✅ Yahoo Finance Improved: Got {len(ohlc_data)} bars for {symbol}")
                return ohlc_data[-1000:]  # Limit results
                
    except Exception as e:
        logger.error(f"Yahoo Finance improved fetch error for {symbol}: {e}")
        return []

# Test function
async def test_yfinance_improved():
    """Test improved Yahoo Finance API"""
    test_symbols = ["AAPL", "TSLA", "MSFT", "GOOGL", "SPY"]
    
    print("Testing Improved Yahoo Finance API")
    print("=" * 45)
    
    for symbol in test_symbols:
        try:
            data = await fetch_yfinance_improved(symbol, 5, 1)  # 5-min bars, 1 day
            if data:
                latest = data[-1]
                print(f"PASS {symbol}: {len(data)} bars, Latest: ${latest['close']:.2f}")
            else:
                print(f"WARN {symbol}: No data")
        except Exception as e:
            print(f"FAIL {symbol}: Error - {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_yfinance_improved())