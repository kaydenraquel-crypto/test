"""
Finnhub stock data connector - Free tier with good US stock coverage
"""
import os
import asyncio
import logging
from typing import List, Dict, Any
import aiohttp
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def fetch_finnhub_bars(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    """
    Fetch stock data from Finnhub.io (free tier)
    
    Args:
        symbol: Stock symbol (e.g., "AAPL")
        interval: Interval in minutes
        days: Number of days of history
    
    Returns:
        List of OHLCV dictionaries
    """
    
    # API key from environment (we already have this configured)
    api_key = os.getenv("FINNHUB_API_KEY", "")
    if not api_key or api_key in ["your_finnhub_key_here", ""]:
        logger.debug("Finnhub API key not configured")
        return []
    
    try:
        # Calculate date range (Unix timestamps)
        end_time = datetime.now()
        start_time = end_time - timedelta(days=days + 2)  # Add buffer for weekends
        
        # Finnhub resolution mapping
        if interval == 1:
            resolution = "1"
        elif interval == 5:
            resolution = "5"
        elif interval == 15:
            resolution = "15"
        elif interval == 30:
            resolution = "30"
        elif interval == 60:
            resolution = "60"
        else:
            resolution = "D"  # Daily
        
        # Build Finnhub API URL
        url = "https://finnhub.io/api/v1/stock/candle"
        params = {
            "symbol": symbol,
            "resolution": resolution,
            "from": int(start_time.timestamp()),
            "to": int(end_time.timestamp()),
            "token": api_key
        }
        
        logger.info(f"Fetching Finnhub data for {symbol} (resolution={resolution}, {days} days)")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"Finnhub API error {response.status}: {await response.text()}")
                    return []
                
                data = await response.json()
                
                # Check if we got data
                if data.get("s") != "ok" or not data.get("t"):
                    logger.warning(f"Finnhub returned no data for {symbol}: {data}")
                    return []
                
                # Convert to our format
                ohlc_data = []
                timestamps = data["t"]
                opens = data["o"]
                highs = data["h"]
                lows = data["l"]
                closes = data["c"]
                volumes = data["v"]
                
                for i in range(len(timestamps)):
                    ohlc_data.append({
                        "ts": int(timestamps[i]),
                        "open": float(opens[i]),
                        "high": float(highs[i]),
                        "low": float(lows[i]),
                        "close": float(closes[i]),
                        "volume": int(volumes[i])
                    })
                
                # Sort by timestamp
                ohlc_data.sort(key=lambda x: x["ts"])
                
                logger.info(f"✅ Finnhub: Got {len(ohlc_data)} bars for {symbol}")
                return ohlc_data[-1000:]  # Limit results
                
    except Exception as e:
        logger.error(f"Finnhub fetch error for {symbol}: {e}")
        return []

def finnhub_available() -> bool:
    """Check if Finnhub API key is configured"""
    api_key = os.getenv("FINNHUB_API_KEY", "")
    return bool(api_key and api_key not in ["your_finnhub_key_here", ""])

# Test function
async def test_finnhub():
    """Test Finnhub API"""
    test_symbols = ["AAPL", "TSLA", "SPY", "MSFT"]
    
    print("Testing Finnhub Stock API")
    print("=" * 40)
    
    for symbol in test_symbols:
        try:
            data = await fetch_finnhub_bars(symbol, 5, 1)  # 5-min bars, 1 day
            if data:
                latest = data[-1]
                print(f"PASS {symbol}: {len(data)} bars, Latest: ${latest['close']:.2f}")
            else:
                print(f"WARN {symbol}: No data")
        except Exception as e:
            print(f"FAIL {symbol}: Error - {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_finnhub())