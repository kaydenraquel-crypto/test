"""
Polygon.io stock data connector - Free tier provides good stock data
"""
import os
import asyncio
import logging
from typing import List, Dict, Any
import aiohttp
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def fetch_polygon_bars(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    """
    Fetch stock data from Polygon.io (free tier)
    
    Args:
        symbol: Stock symbol (e.g., "AAPL")
        interval: Interval in minutes
        days: Number of days of history
    
    Returns:
        List of OHLCV dictionaries
    """
    
    # Free tier API key from environment
    api_key = os.getenv("POLYGON_API_KEY", "")
    if not api_key or api_key in ["your_polygon_key_here", ""]:
        logger.debug("Polygon API key not configured")
        return []
    
    try:
        # Calculate date range - use proper market dates
        end_date = datetime.now()
        # Go back further to ensure we get market days (skip weekends)
        start_date = end_date - timedelta(days=days + 3)  # Extra buffer for weekends/holidays
        
        # Polygon interval mapping
        if interval == 1:
            multiplier, timespan = 1, "minute"
        elif interval == 5:
            multiplier, timespan = 5, "minute"
        elif interval == 15:
            multiplier, timespan = 15, "minute"
        elif interval == 30:
            multiplier, timespan = 30, "minute"
        elif interval == 60:
            multiplier, timespan = 1, "hour"
        else:
            multiplier, timespan = 1, "day"
        
        # Build Polygon API URL with from/to in path (correct format)
        from_date = start_date.strftime("%Y-%m-%d")
        to_date = end_date.strftime("%Y-%m-%d")
        url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{from_date}/{to_date}"
        params = {
            "adjusted": "true",
            "sort": "asc",
            "limit": 5000,
            "apikey": api_key
        }
        
        logger.info(f"Fetching Polygon data for {symbol} ({timespan}, {days} days)")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"Polygon API error {response.status}: {await response.text()}")
                    return []
                
                data = await response.json()
                logger.info(f"Polygon API response status: {data.get('status')}, results count: {data.get('resultsCount', 0)}")
                
                # Check if we got results (accept OK or DELAYED status)
                status = data.get("status")
                results = data.get("results")
                if status not in ["OK", "DELAYED"] or not results:
                    logger.warning(f"Polygon returned no data for {symbol} (status: {status}): {data}")
                    return []
                
                # Convert to our format
                ohlc_data = []
                for bar in data["results"]:
                    ohlc_data.append({
                        "ts": int(bar["t"] / 1000),  # Convert milliseconds to seconds
                        "open": float(bar["o"]),
                        "high": float(bar["h"]),
                        "low": float(bar["l"]),
                        "close": float(bar["c"]),
                        "volume": int(bar.get("v", 0))
                    })
                
                logger.info(f"✅ Polygon: Got {len(ohlc_data)} bars for {symbol}")
                return ohlc_data[-1000:]  # Limit results
                
    except Exception as e:
        logger.error(f"Polygon fetch error for {symbol}: {e}")
        return []

def polygon_available() -> bool:
    """Check if Polygon API key is configured"""
    api_key = os.getenv("POLYGON_API_KEY", "")
    return bool(api_key and api_key not in ["your_polygon_key_here", ""])

# Test function
async def test_polygon():
    """Test Polygon.io API"""
    test_symbols = ["AAPL", "TSLA", "SPY"]
    
    print("🧪 Testing Polygon.io Stock API")
    print("=" * 40)
    
    for symbol in test_symbols:
        try:
            data = await fetch_polygon_bars(symbol, 5, 1)  # 5-min bars, 1 day
            if data:
                latest = data[-1]
                print(f"✅ {symbol}: {len(data)} bars, Latest: ${latest['close']:.2f}")
            else:
                print(f"⚠️ {symbol}: No data")
        except Exception as e:
            print(f"❌ {symbol}: Error - {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_polygon())