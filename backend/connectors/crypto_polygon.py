
from typing import List, Dict, Any
import os
import time
import httpx

def to_polygon_crypto_ticker(symbol: str) -> str:
    # Polygon crypto tickers: X:BTCUSD
    s = symbol.upper().replace("/", "")
    s = s.replace("-", "")
    s = s.replace("XBT", "BTC")
    if s.endswith("USDT"):
        base = s[:-4]
        quote = "USDT"
    elif s.endswith("USD"):
        base = s[:-3]
        quote = "USD"
    else:
        # default assume USD
        base = s
        quote = "USD"
    return f"X:{base}{quote}"

def to_polygon_multiplier_and_timespan(minutes: int):
    # map minutes to (multiplier, timespan)
    if minutes in (1,5,15,30,60):
        return minutes, "minute"
    if minutes >= 1440:
        return 1, "day"
    return 1, "minute"

async def fetch_recent_ohlc_polygon(symbol: str, interval: int = 1, limit: int = 300) -> List[Dict[str, Any]]:
    api_key = os.getenv("POLYGON_API_KEY")
    if not api_key:
        return []
    ticker = to_polygon_crypto_ticker(symbol)
    mult, span = to_polygon_multiplier_and_timespan(interval)
    # Use the last N bars up to now
    url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/{mult}/{span}/now/{limit}?adjusted=true&sort=asc&apiKey={api_key}"
    out: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        r.raise_for_status()
        js = r.json()
        results = js.get("results", [])
        for b in results:
            out.append({
                "ts": int(b["t"] // 1000),
                "open": float(b["o"]),
                "high": float(b["h"]),
                "low": float(b["l"]),
                "close": float(b["c"]),
                "volume": float(b.get("v", 0.0)),
            })
    return out
