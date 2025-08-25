
from typing import List, Dict, Any, Optional
import pandas as pd

def _to_df(ohlc: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(ohlc).sort_values("ts")
    return df

def ema_sma_cross_signals(df: pd.DataFrame, indicators: Dict[str, Any]) -> List[Dict[str, Any]]:
    sma = indicators.get("sma") or []
    ema = indicators.get("ema") or []
    signals: List[Dict[str, Any]] = []
    prev: Optional[str] = None
    for i in range(len(df)):
        s = sma[i] if i < len(sma) else None
        e = ema[i] if i < len(ema) else None
        if s is None or e is None:
            prev = None
            continue
        state = "above" if e > s else "below"
        if prev and prev != state:
            row = df.iloc[i]
            signals.append({
                "type": "buy" if state == "above" else "sell",
                "ts": int(row["ts"]),
                "price": float(row["close"]),
                "reason": "EMA crossed above SMA" if state == "above" else "EMA crossed below SMA",
                "tag": "ema_cross"
            })
        prev = state
    return signals

def macd_cross_signals(df: pd.DataFrame, indicators: Dict[str, Any]) -> List[Dict[str, Any]]:
    macd = indicators.get("macd") or []
    sig  = indicators.get("macd_signal") or []
    out: List[Dict[str, Any]] = []
    prev_diff = None
    for i in range(len(df)):
        m = macd[i] if i < len(macd) else None
        s = sig[i]  if i < len(sig)  else None
        if m is None or s is None:
            prev_diff = None
            continue
        diff = m - s
        if prev_diff is not None:
            crossed_up = prev_diff <= 0 and diff > 0
            crossed_dn = prev_diff >= 0 and diff < 0
            if crossed_up or crossed_dn:
                row = df.iloc[i]
                out.append({
                    "type": "buy" if crossed_up else "sell",
                    "ts": int(row["ts"]),
                    "price": float(row["close"]),
                    "reason": "MACD crossed above signal" if crossed_up else "MACD crossed below signal",
                    "tag": "macd_cross"
                })
        prev_diff = diff
    return out

def rsi_level_signals(df: pd.DataFrame, indicators: Dict[str, Any],
                      low: float = 30.0, high: float = 70.0) -> List[Dict[str, Any]]:
    rsi = indicators.get("rsi") or []
    out: List[Dict[str, Any]] = []
    prev = None
    for i in range(len(df)):
        v = rsi[i] if i < len(rsi) else None
        if v is None:
            prev = None
            continue
        if prev is not None:
            if prev < low <= v:
                row = df.iloc[i]
                out.append({
                    "type": "buy",
                    "ts": int(row["ts"]),
                    "price": float(row["close"]),
                    "reason": f"RSI crossed up {low}",
                    "tag": "rsi_levels"
                })
            if prev > high >= v:
                row = df.iloc[i]
                out.append({
                    "type": "sell",
                    "ts": int(row["ts"]),
                    "price": float(row["close"]),
                    "reason": f"RSI crossed down {high}",
                    "tag": "rsi_levels"
                })
        prev = v
    return out

def bollinger_touch_signals(df: pd.DataFrame, indicators: Dict[str, Any]) -> List[Dict[str, Any]]:
    bb_h = indicators.get("bb_high") or []
    bb_l = indicators.get("bb_low") or []
    out: List[Dict[str, Any]] = []
    was_below = False
    was_above = False
    for i in range(len(df)):
        close = float(df.iloc[i]["close"])
        h = bb_h[i] if i < len(bb_h) else None
        l = bb_l[i] if i < len(bb_l) else None
        if h is None or l is None:
            was_below = was_above = False
            continue
        if close < l:
            was_below = True
        elif was_below and close >= l:
            row = df.iloc[i]
            out.append({
                "type": "buy",
                "ts": int(row["ts"]),
                "price": float(row["close"]),
                "reason": "Re-entered from below lower Bollinger band",
                "tag": "bb_touch"
            })
            was_below = False

        if close > h:
            was_above = True
        elif was_above and close <= h:
            row = df.iloc[i]
            out.append({
                "type": "sell",
                "ts": int(row["ts"]),
                "price": float(row["close"]),
                "reason": "Re-entered from above upper Bollinger band",
                "tag": "bb_touch"
            })
            was_above = False
    return out

def combined_signals(ohlc: List[Dict[str, Any]], indicators: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not ohlc:
        return []
    df = _to_df(ohlc)
    out: List[Dict[str, Any]] = []
    out += ema_sma_cross_signals(df, indicators)
    out += macd_cross_signals(df, indicators)
    out += rsi_level_signals(df, indicators)
    out += bollinger_touch_signals(df, indicators)
    out.sort(key=lambda s: s["ts"])
    return out
