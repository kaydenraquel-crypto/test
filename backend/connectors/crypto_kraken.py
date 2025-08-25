\
import asyncio
import json
import websockets
from typing import AsyncGenerator, Dict, Any

KRAKEN_WS = "wss://ws.kraken.com"

async def kraken_ohlc_stream(symbol: str, interval: int = 1) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Streams OHLC candles from Kraken for a given trading pair (e.g., 'XBT/USD').
    Yields per-candle dicts with: ts, open, high, low, close, volume
    """
    subscribe_msg = {
        "event": "subscribe",
        "pair": [symbol],
        "subscription": {"name": "ohlc", "interval": interval}
    }
    async with websockets.connect(KRAKEN_WS, ping_interval=20, ping_timeout=20) as ws:
        await ws.send(json.dumps(subscribe_msg))
        async for raw in ws:
            try:
                msg = json.loads(raw)
                if isinstance(msg, dict):
                    # system/status or subscription status
                    continue
                if isinstance(msg, list) and len(msg) >= 2:
                    payload = msg[1]
                    # payload is list like [time, etime, open, high, low, close, vwap, volume, count]
                    if isinstance(payload, list) and len(payload) >= 8:
                        ts = float(payload[1])  # candle end time seconds
                        yield {
                            "ts": int(ts),
                            "open": float(payload[2]),
                            "high": float(payload[3]),
                            "low": float(payload[4]),
                            "close": float(payload[5]),
                            "volume": float(payload[7]),
                        }
            except Exception:
                continue
