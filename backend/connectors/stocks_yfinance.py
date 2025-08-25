
from typing import List, Dict, Any
import datetime as dt
import pandas as pd

try:
    import yfinance as yf
except Exception:
    yf = None

def _interval_to_yf(interval: int) -> str:
    if interval <= 1: return "1m"
    if interval <= 5: return "5m"
    if interval <= 15: return "15m"
    if interval <= 60: return "60m"
    return "1d"

async def fetch_recent_ohlc(symbol: str, interval: int = 1, limit: int = 300) -> List[Dict[str, Any]]:
    if yf is None:
        return []
    yf_intr = _interval_to_yf(interval)
    period = "7d" if yf_intr.endswith("m") else "1mo"
    data = yf.Ticker(symbol).history(period=period, interval=yf_intr, auto_adjust=False)
    if data.empty:
        return []
    data = data.tail(limit)
    out = []
    for ts, row in data.iterrows():
        out.append({
            "ts": int(ts.to_pydatetime().timestamp()),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": float(row.get("Volume", 0.0) or 0.0),
        })
    return out

async def fetch_ohlc_days_yf(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    if yf is None:
        return []
    yf_intr = _interval_to_yf(interval)
    # yfinance period limitation
    if days <= 7:
        period = "7d"
    elif days <= 30:
        period = "1mo"
    elif days <= 90:
        period = "3mo"
    else:
        period = "6mo"
    data = yf.Ticker(symbol).history(period=period, interval=yf_intr, auto_adjust=False)
    if data.empty:
        return []
    # filter last N days
    cutoff = pd.Timestamp.utcnow() - pd.Timedelta(days=days)
    data = data[data.index >= cutoff]
    out = []
    for ts, row in data.iterrows():
        out.append({
            "ts": int(ts.to_pydatetime().timestamp()),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": float(row.get("Volume", 0.0) or 0.0),
        })
    return out
