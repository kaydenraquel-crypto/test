import asyncio
import json
import websockets
from typing import AsyncGenerator, Dict, Any, List
import httpx
import logging

logger = logging.getLogger(__name__)

COINBASE_WS = "wss://advanced-trade-ws.coinbase.com"
COINBASE_REST = "https://api.exchange.coinbase.com"

def _to_coinbase_symbol(symbol: str) -> str:
    """Convert symbol to Coinbase format (e.g., 'ETH/USD' -> 'ETH-USD')"""
    if not symbol:
        return ""
    
    # Common mappings
    mappings = {
        "XBTUSD": "BTC-USD",
        "XBT/USD": "BTC-USD",
        "BTC/USD": "BTC-USD",
        "ETH/USD": "ETH-USD",
        "ADA/USD": "ADA-USD",
        "SOL/USD": "SOL-USD",
        "DOT/USD": "DOT-USD",
        "LINK/USD": "LINK-USD",
        "UNI/USD": "UNI-USD",
        "MATIC/USD": "MATIC-USD",
        "AVAX/USD": "AVAX-USD",
        "LTC/USD": "LTC-USD",
    }
    
    s = symbol.upper()
    if s in mappings:
        return mappings[s]
    
    # Convert slash to dash (Coinbase standard)
    if "/" in symbol:
        return symbol.upper().replace("/", "-")
    
    # If no slash, assume USD pair
    if "-" not in symbol and len(symbol) >= 3:
        return f"{symbol.upper()}-USD"
    
    return symbol.upper()

def _interval_to_seconds(interval: int) -> int:
    """Convert interval minutes to seconds"""
    return interval * 60

async def coinbase_ohlc_stream(symbol: str, interval: int = 5) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Stream real-time OHLC data from Coinbase WebSocket
    Note: Coinbase provides tick data, we'll need to build candles
    """
    coinbase_symbol = _to_coinbase_symbol(symbol)
    if not coinbase_symbol:
        raise ValueError(f"Invalid symbol: {symbol}")
    
    # Coinbase Advanced Trade WebSocket
    subscribe_message = {
        "type": "subscribe",
        "product_ids": [coinbase_symbol],
        "channels": ["ticker"]
    }
    
    logger.info(f"Connecting to Coinbase WebSocket for {coinbase_symbol}")
    
    try:
        async with websockets.connect(COINBASE_WS) as ws:
            # Subscribe to ticker updates
            await ws.send(json.dumps(subscribe_message))
            logger.info(f"Subscribed to Coinbase ticker for {coinbase_symbol}")
            
            # Simple approach: convert ticker to OHLC-like data
            async for message in ws:
                try:
                    data = json.loads(message)
                    
                    if data.get("type") == "ticker" and data.get("product_id") == coinbase_symbol:
                        # Convert ticker to candle format
                        # Note: This is a simplified approach - real implementation would aggregate ticks
                        price = float(data.get("price", 0))
                        volume = float(data.get("volume_24h", 0))
                        
                        if price > 0:
                            yield {
                                "ts": int(data.get("time", "0")),
                                "open": price,
                                "high": price,
                                "low": price,
                                "close": price,
                                "volume": volume,
                            }
                            
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse Coinbase message: {e}")
                    continue
                except Exception as e:
                    logger.error(f"Error processing Coinbase message: {e}")
                    continue
                    
    except Exception as e:
        logger.error(f"Coinbase WebSocket error: {e}")
        raise

async def fetch_coinbase_ohlc(symbol: str, interval: int = 5, limit: int = 300) -> List[Dict[str, Any]]:
    """
    Fetch historical OHLC data from Coinbase Pro API
    """
    coinbase_symbol = _to_coinbase_symbol(symbol)
    if not coinbase_symbol:
        logger.error(f"Invalid symbol: {symbol}")
        return []
    
    # Coinbase uses granularity in seconds
    granularity = _interval_to_seconds(interval)
    
    # Coinbase Pro historical rates endpoint
    url = f"{COINBASE_REST}/products/{coinbase_symbol}/candles"
    params = {
        "granularity": granularity,
    }
    
    logger.debug(f"Fetching Coinbase history: {url} with params {params}")
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not isinstance(data, list):
                logger.error(f"Unexpected Coinbase response format: {type(data)}")
                return []
            
            result = []
            for candle in data[:limit]:  # Coinbase returns newest first
                if len(candle) < 6:
                    continue
                    
                try:
                    # Coinbase format: [timestamp, low, high, open, close, volume]
                    result.append({
                        "ts": int(candle[0]),  # Already in seconds
                        "open": float(candle[3]),
                        "high": float(candle[2]),
                        "low": float(candle[1]),
                        "close": float(candle[4]),
                        "volume": float(candle[5]),
                    })
                except (ValueError, IndexError) as e:
                    logger.warning(f"Failed to parse Coinbase candle: {candle}, error: {e}")
                    continue
            
            # Sort by timestamp (oldest first)
            result.sort(key=lambda x: x["ts"])
            
            logger.info(f"Successfully fetched {len(result)} candles for {symbol} from Coinbase")
            return result
            
    except httpx.HTTPStatusError as e:
        logger.error(f"Coinbase HTTP error {e.response.status_code}: {e}")
        return []
    except httpx.RequestError as e:
        logger.error(f"Coinbase request error: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected Coinbase error: {e}")
        return []

# Test function
async def test_coinbase_connector():
    """Test the Coinbase connector"""
    symbol = "ETH/USD"
    
    print(f"Testing Coinbase connector with {symbol}")
    print(f"Coinbase symbol: {_to_coinbase_symbol(symbol)}")
    
    # Test historical data
    print("\nFetching historical data...")
    history = await fetch_coinbase_ohlc(symbol, 300, 100)  # 5-minute candles
    if history:
        print(f"Got {len(history)} candles")
        print(f"Latest: {history[-1]}")
    else:
        print("No historical data")
    
    print("Coinbase connector test finished!")

if __name__ == "__main__":
    asyncio.run(test_coinbase_connector())