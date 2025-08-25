import asyncio
import json
import websockets
from typing import AsyncGenerator, Dict, Any, List
import httpx
import logging

logger = logging.getLogger(__name__)

BINANCE_WS = "wss://stream.binance.us:9443/ws"  # Binance.US WebSocket
BINANCE_REST = "https://api.binance.us/api/v3"  # Binance.US REST API

def _to_binance_symbol(symbol: str) -> str:
    """Convert various symbol formats to Binance format"""
    if not symbol:
        return ""
    
    # Remove common separators and convert to uppercase
    s = symbol.upper().replace("/", "").replace("-", "").replace("_", "")
    
    # Common mappings for Binance
    mappings = {
        "XBTUSD": "BTCUSDT",
        "XBTUSDT": "BTCUSDT", 
        "BTCUSD": "BTCUSDT",
        "ETHUSD": "ETHUSDT",
        "ADAUSD": "ADAUSDT",
        "SOLUSD": "SOLUSDT",
        "DOTUSD": "DOTUSDT",
        "LINKUSD": "LINKUSDT",
        "UNIUSD": "UNIUSDT",
        "MATICUSD": "MATICUSDT",
        "AVAXUSD": "AVAXUSDT",
        "LTCUSD": "LTCUSDT",
        "BCHUSD": "BCHUSDT",
    }
    
    if s in mappings:
        return mappings[s]
    
    # Auto-convert USD to USDT (Binance standard)
    if s.endswith("USD") and not s.endswith("USDT"):
        return s.replace("USD", "USDT")
    
    # Handle slash notation (ETH/USD -> ETHUSDT)
    if "/" in symbol:
        base, quote = symbol.split("/", 1)
        base = base.upper().strip()
        quote = quote.upper().strip()
        
        # Convert common quotes to Binance format
        if quote == "USD":
            quote = "USDT"
        elif quote == "BTC":
            quote = "BTC"  # Keep as BTC
        
        return f"{base}{quote}"
    
    return s

def _interval_to_binance(interval: int) -> str:
    """Convert interval minutes to Binance format"""
    if interval <= 1: return "1m"
    if interval <= 3: return "3m"
    if interval <= 5: return "5m"
    if interval <= 15: return "15m"
    if interval <= 30: return "30m"
    if interval <= 60: return "1h"
    if interval <= 120: return "2h"
    if interval <= 240: return "4h"
    if interval <= 360: return "6h"
    if interval <= 480: return "8h"
    if interval <= 720: return "12h"
    if interval <= 1440: return "1d"
    if interval <= 4320: return "3d"
    if interval <= 10080: return "1w"
    return "1M"  # 1 month

async def binance_ohlc_stream(symbol: str, interval: int = 5) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Stream real-time OHLC data from Binance WebSocket
    
    Args:
        symbol: Trading pair (e.g., 'ETH/USD', 'BTC/USD')
        interval: Timeframe in minutes
    
    Yields:
        Dict with keys: ts, open, high, low, close, volume
    """
    binance_symbol = _to_binance_symbol(symbol)
    if not binance_symbol:
        raise ValueError(f"Invalid symbol: {symbol}")
    
    binance_interval = _interval_to_binance(interval)
    stream_name = f"{binance_symbol.lower()}@kline_{binance_interval}"
    ws_url = f"{BINANCE_WS}/{stream_name}"
    
    logger.info(f"Connecting to Binance WebSocket: {ws_url}")
    
    try:
        async with websockets.connect(
            ws_url, 
            ping_interval=20, 
            ping_timeout=20,
            close_timeout=10
        ) as ws:
            logger.info(f"Connected to Binance stream for {symbol}")
            
            async for message in ws:
                try:
                    data = json.loads(message)
                    
                    if 'k' in data:  # Kline/candlestick data
                        k = data['k']
                        
                        # Only yield completed candles or the most recent one
                        yield {
                            "ts": int(k['t']) // 1000,  # Convert ms to seconds
                            "open": float(k['o']),
                            "high": float(k['h']),
                            "low": float(k['l']),
                            "close": float(k['c']),
                            "volume": float(k['v']),
                        }
                        
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse Binance message: {e}")
                    continue
                except KeyError as e:
                    logger.warning(f"Unexpected Binance message format: {e}")
                    continue
                except Exception as e:
                    logger.error(f"Error processing Binance message: {e}")
                    continue
                    
    except websockets.exceptions.ConnectionClosed as e:
        logger.warning(f"Binance WebSocket connection closed: {e}")
        raise
    except Exception as e:
        logger.error(f"Binance WebSocket error: {e}")
        raise

async def fetch_binance_ohlc(symbol: str, interval: int = 5, limit: int = 500) -> List[Dict[str, Any]]:
    """
    Fetch historical OHLC data from Binance REST API
    
    Args:
        symbol: Trading pair (e.g., 'ETH/USD', 'BTC/USD') 
        interval: Timeframe in minutes
        limit: Number of candles to fetch (max 1000)
    
    Returns:
        List of OHLC dictionaries
    """
    binance_symbol = _to_binance_symbol(symbol)
    if not binance_symbol:
        logger.error(f"Invalid symbol: {symbol}")
        return []
    
    binance_interval = _interval_to_binance(interval)
    
    url = f"{BINANCE_REST}/klines"
    params = {
        "symbol": binance_symbol,
        "interval": binance_interval,
        "limit": min(limit, 1000)  # Binance max is 1000
    }
    
    logger.debug(f"Fetching Binance history: {url} with params {params}")
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not isinstance(data, list):
                logger.error(f"Unexpected Binance response format: {type(data)}")
                return []
            
            result = []
            for candle in data:
                if len(candle) < 6:
                    logger.warning(f"Incomplete candle data: {candle}")
                    continue
                    
                try:
                    result.append({
                        "ts": int(candle[0]) // 1000,  # Convert ms to seconds
                        "open": float(candle[1]),
                        "high": float(candle[2]),
                        "low": float(candle[3]),
                        "close": float(candle[4]),
                        "volume": float(candle[5]),
                    })
                except (ValueError, IndexError) as e:
                    logger.warning(f"Failed to parse candle: {candle}, error: {e}")
                    continue
            
            logger.info(f"Successfully fetched {len(result)} candles for {symbol} from Binance")
            return result
            
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            logger.error(f"Binance API error (invalid symbol?): {symbol} -> {binance_symbol}")
        else:
            logger.error(f"Binance HTTP error {e.response.status_code}: {e}")
        return []
    except httpx.RequestError as e:
        logger.error(f"Binance request error: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected Binance error: {e}")
        return []

async def fetch_binance_ohlc_days(symbol: str, interval: int, days: int, max_bars: int = 5000) -> List[Dict[str, Any]]:
    """
    Fetch multiple days of historical data from Binance
    
    Args:
        symbol: Trading pair
        interval: Timeframe in minutes
        days: Number of days to fetch
        max_bars: Maximum number of bars to return
    
    Returns:
        List of OHLC dictionaries
    """
    # Calculate how many requests we need
    bars_per_day = (24 * 60) // interval
    total_bars_needed = min(days * bars_per_day, max_bars)
    
    # Binance allows max 1000 bars per request
    requests_needed = (total_bars_needed + 999) // 1000
    
    all_data = []
    
    for i in range(requests_needed):
        limit = min(1000, total_bars_needed - len(all_data))
        if limit <= 0:
            break
            
        try:
            batch = await fetch_binance_ohlc(symbol, interval, limit)
            if not batch:
                break
                
            all_data.extend(batch)
            
            # Rate limiting - be nice to Binance
            if i < requests_needed - 1:
                await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Error fetching batch {i+1}: {e}")
            break
    
    # Remove duplicates and sort
    if all_data:
        unique_data = {item["ts"]: item for item in all_data}
        all_data = sorted(unique_data.values(), key=lambda x: x["ts"])
        all_data = all_data[-max_bars:]  # Keep only the most recent
    
    logger.info(f"Fetched {len(all_data)} total candles for {symbol}")
    return all_data

# Test function
async def test_binance_connector():
    """Test the Binance connector"""
    symbol = "ETH/USD"
    
    print(f"Testing Binance connector with {symbol}")
    print(f"Binance symbol: {_to_binance_symbol(symbol)}")
    
    # Test historical data
    print("\nFetching historical data...")
    history = await fetch_binance_ohlc(symbol, 5, 100)
    if history:
        print(f"Got {len(history)} candles")
        print(f"Latest: {history[-1]}")
    else:
        print("No historical data")
    
    # Test WebSocket (for 10 seconds)
    print("\nTesting WebSocket stream for 10 seconds...")
    try:
        timeout_occurred = False
        async with asyncio.timeout(10):
            async for candle in binance_ohlc_stream(symbol, 5):
                print(f"Live candle: {candle}")
    except asyncio.TimeoutError:
        timeout_occurred = True
        print("WebSocket test completed (timeout)")
    
    print("Binance connector test finished!")

if __name__ == "__main__":
    asyncio.run(test_binance_connector())