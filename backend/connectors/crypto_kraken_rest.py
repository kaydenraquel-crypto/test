import asyncio
from typing import List, Dict, Any, Optional
import httpx
import time as _time
import logging

logger = logging.getLogger(__name__)

def _to_kraken_pair(symbol: str) -> str:
    """Convert various symbol formats to Kraken format"""
    if not symbol:
        return ""
    
    s = symbol.upper().replace("-", "").replace("/", "")
    
    # Common BTC mappings
    if s in ("BTCUSD", "XBTUSD", "BTC/USD", "XBT/USD"): 
        return "XBTUSD"
    if s in ("BTCEUR", "XBTEUR", "BTC/EUR", "XBT/EUR"): 
        return "XBTEUR"
    
    # Common ETH mappings
    if s in ("ETHUSD", "ETH/USD"): 
        return "ETHUSD"
    if s in ("ETHEUR", "ETH/EUR"): 
        return "ETHEUR"
    if s in ("ETHBTC", "ETH/BTC", "ETHXBT", "ETH/XBT"): 
        return "ETHXBT"
    
    # Common other cryptos
    if s in ("ADAUSD", "ADA/USD"): 
        return "ADAUSD"
    if s in ("DOTUSD", "DOT/USD"): 
        return "DOTUSD"
    if s in ("SOLUSD", "SOL/USD"): 
        return "SOLUSD"
    if s in ("LINKUSD", "LINK/USD"): 
        return "LINKUSD"
    if s in ("UNIUSD", "UNI/USD"): 
        return "UNIUSD"
    if s in ("MATICUSD", "MATIC/USD"): 
        return "MATICUSD"
    
    # For other symbols, try to format them for Kraken
    # Many Kraken pairs end with USD, EUR, XBT, etc.
    if "/" in symbol:
        base, quote = symbol.split("/", 1)
        base = base.upper().strip()
        quote = quote.upper().strip()
        
        # Convert common quote currencies to Kraken format
        if quote == "BTC":
            quote = "XBT"
        
        return f"{base}{quote}"
    
    # Return as-is if no mapping found
    return s

def _is_valid_symbol(symbol: str) -> bool:
    """Basic validation for symbol format"""
    if not symbol or len(symbol) < 3:
        return False
    
    # Must contain only letters, numbers, and common separators
    allowed_chars = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/")
    return all(c in allowed_chars for c in symbol.upper())

def _interval_to_kraken(interval: int) -> int:
    """Map interval minutes to Kraken supported intervals"""
    if interval <= 1: return 1
    if interval <= 5: return 5
    if interval <= 15: return 15
    if interval <= 30: return 30
    if interval <= 60: return 60
    if interval <= 240: return 240
    if interval <= 1440: return 1440
    if interval <= 10080: return 10080
    return 21600

async def fetch_recent_ohlc_kraken(symbol: str, interval: int = 1, limit: int = 300) -> List[Dict[str, Any]]:
    """Fetch recent OHLC data from Kraken with improved error handling"""
    
    # Validate input
    if not _is_valid_symbol(symbol):
        logger.warning(f"Invalid symbol format: {symbol}")
        return []
    
    pair = _to_kraken_pair(symbol)
    if not pair:
        logger.warning(f"Could not convert symbol to Kraken format: {symbol}")
        return []
    
    intr = _interval_to_kraken(interval)
    url = f"https://api.kraken.com/0/public/OHLC?pair={pair}&interval={intr}"
    
    logger.debug(f"Fetching Kraken OHLC: {url}")
    
    out: List[Dict[str, Any]] = []
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            
            # Check for Kraken API errors
            if "error" in data and data["error"]:
                error_msg = ", ".join(data["error"])
                logger.error(f"Kraken API error for {symbol}: {error_msg}")
                return []
            
            result = data.get("result", {})
            if not result:
                logger.warning(f"No result data for {symbol}")
                return []
            
            # Find the OHLC data (Kraken returns it with the pair name as key)
            series = None
            for k, v in result.items():
                if isinstance(v, list) and k != "last":
                    series = v
                    break
            
            if not series:
                logger.warning(f"No OHLC series found for {symbol}")
                return []
            
            # Convert to our format
            for row in series[-limit:]:
                if len(row) >= 7:
                    try:
                        out.append({
                            "ts": int(float(row[0])),
                            "open": float(row[1]),
                            "high": float(row[2]),
                            "low": float(row[3]),
                            "close": float(row[4]),
                            "volume": float(row[6]),
                        })
                    except (ValueError, IndexError) as e:
                        logger.warning(f"Failed to parse OHLC row: {row}, error: {e}")
                        continue
            
            logger.debug(f"Successfully fetched {len(out)} candles for {symbol}")
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching {symbol}: {e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching {symbol}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error fetching {symbol}: {e}")
    
    return out

async def fetch_ohlc_days_kraken(symbol: str, interval: int, days: int, max_bars: int = 5000) -> List[Dict[str, Any]]:
    """Fetch historical OHLC data using Kraken REST pagination with improved error handling"""
    
    # Validate input
    if not _is_valid_symbol(symbol):
        logger.warning(f"Invalid symbol format: {symbol}")
        return []
    
    pair = _to_kraken_pair(symbol)
    if not pair:
        logger.warning(f"Could not convert symbol to Kraken format: {symbol}")
        return []
    
    intr = _interval_to_kraken(interval)
    # Compute since timestamp (approx)
    since = int(_time.time()) - days * 86400
    
    logger.debug(f"Fetching {days} days of {symbol} history from Kraken")
    
    out: List[Dict[str, Any]] = []
    
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            last = since
            
            for attempt in range(20):  # Safety loop
                url = f"https://api.kraken.com/0/public/OHLC?pair={pair}&interval={intr}&since={last}"
                
                try:
                    r = await client.get(url)
                    r.raise_for_status()
                    data = r.json()
                    
                    # Check for Kraken API errors
                    if "error" in data and data["error"]:
                        error_msg = ", ".join(data["error"])
                        logger.error(f"Kraken API error for {symbol}: {error_msg}")
                        break
                    
                    result = data.get("result", {})
                    new_last = result.get("last")  # Server time of last data
                    
                    # Find the OHLC series
                    series = None
                    for k, v in result.items():
                        if isinstance(v, list) and k != "last":
                            series = v
                            break
                    
                    if series:
                        for row in series:
                            if len(row) >= 7:
                                try:
                                    out.append({
                                        "ts": int(float(row[0])),
                                        "open": float(row[1]),
                                        "high": float(row[2]),
                                        "low": float(row[3]),
                                        "close": float(row[4]),
                                        "volume": float(row[6]),
                                    })
                                except (ValueError, IndexError) as e:
                                    logger.warning(f"Failed to parse OHLC row: {row}, error: {e}")
                                    continue
                        
                        if len(out) >= max_bars:
                            logger.debug(f"Reached max_bars limit ({max_bars}) for {symbol}")
                            break
                    
                    # Check if we got new data
                    if not new_last or new_last == last:
                        logger.debug(f"No more data available for {symbol}")
                        break
                    
                    last = new_last
                    
                    # Rate limiting - be nice to Kraken API
                    if attempt < 19:
                        await asyncio.sleep(0.1)
                        
                except httpx.HTTPStatusError as e:
                    logger.error(f"HTTP error on attempt {attempt + 1} for {symbol}: {e.response.status_code}")
                    break
                except httpx.RequestError as e:
                    logger.error(f"Request error on attempt {attempt + 1} for {symbol}: {e}")
                    break
                    
    except Exception as e:
        logger.error(f"Unexpected error fetching history for {symbol}: {e}")
    
    # Deduplicate and sort
    if out:
        uniq = {o["ts"]: o for o in out}
        out = [uniq[k] for k in sorted(uniq.keys())]
        out = out[-max_bars:]  # Keep only the most recent max_bars
        
        logger.debug(f"Successfully fetched {len(out)} historical candles for {symbol}")
    else:
        logger.warning(f"No historical data retrieved for {symbol}")
    
    return out