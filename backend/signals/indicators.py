
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator, MACD, ADXIndicator, IchimokuIndicator, PSARIndicator
from ta.momentum import RSIIndicator, StochasticOscillator, WilliamsRIndicator, ROCIndicator, StochRSIIndicator
from ta.volatility import BollingerBands, AverageTrueRange, KeltnerChannel, DonchianChannel
from ta.volume import OnBalanceVolumeIndicator, MFIIndicator, ChaikinMoneyFlowIndicator, VolumePriceTrendIndicator, VolumeWeightedAveragePrice
from ta.others import DailyReturnIndicator, CumulativeReturnIndicator

def _to_df(ohlc: List[Dict[str, Any]]) -> pd.DataFrame:
    if not ohlc:
        return pd.DataFrame(columns=["ts","open","high","low","close","volume"])
    df = pd.DataFrame(ohlc).sort_values("ts").reset_index(drop=True)
    return df

def compute_advanced_momentum(df: pd.DataFrame) -> Dict[str, List]:
    """Advanced momentum indicators"""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df.get("volume", pd.Series([1] * len(df)))
    
    indicators = {}
    
    try:
        # Stochastic Oscillator
        stoch = StochasticOscillator(high=high, low=low, close=close, window=14, smooth_window=3)
        indicators["stoch_k"] = stoch.stoch()
        indicators["stoch_d"] = stoch.stoch_signal()
        
        # Williams %R
        williams_r = WilliamsRIndicator(high=high, low=low, close=close, lbp=14)
        indicators["williams_r"] = williams_r.williams_r()
        
        # Rate of Change
        roc = ROCIndicator(close=close, window=12)
        indicators["roc"] = roc.roc()
        
        # Stochastic RSI
        stoch_rsi = StochRSIIndicator(close=close, window=14, smooth1=3, smooth2=3)
        indicators["stoch_rsi"] = stoch_rsi.stochrsi()
        indicators["stoch_rsi_k"] = stoch_rsi.stochrsi_k()
        indicators["stoch_rsi_d"] = stoch_rsi.stochrsi_d()
        
        # Money Flow Index (requires volume)
        if volume.sum() > 0:
            mfi = MFIIndicator(high=high, low=low, close=close, volume=volume, window=14)
            indicators["mfi"] = mfi.money_flow_index()
        else:
            indicators["mfi"] = pd.Series([None] * len(df))
            
    except Exception as e:
        print(f"Advanced momentum calculation error: {e}")
        for key in ["stoch_k", "stoch_d", "williams_r", "roc", "stoch_rsi", "stoch_rsi_k", "stoch_rsi_d", "mfi"]:
            indicators[key] = pd.Series([None] * len(df))
    
    return indicators

def compute_advanced_trend(df: pd.DataFrame) -> Dict[str, List]:
    """Advanced trend indicators"""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    
    indicators = {}
    
    try:
        # Average Directional Index (ADX)
        adx = ADXIndicator(high=high, low=low, close=close, window=14)
        indicators["adx"] = adx.adx()
        indicators["adx_pos"] = adx.adx_pos()
        indicators["adx_neg"] = adx.adx_neg()
        
        # Parabolic SAR
        psar = PSARIndicator(high=high, low=low, close=close, step=0.02, max_step=0.2)
        indicators["psar"] = psar.psar()
        indicators["psar_up"] = psar.psar_up()
        indicators["psar_down"] = psar.psar_down()
        
        # Ichimoku Cloud
        ichimoku = IchimokuIndicator(high=high, low=low, window1=9, window2=26, window3=52)
        indicators["ichimoku_a"] = ichimoku.ichimoku_a()
        indicators["ichimoku_b"] = ichimoku.ichimoku_b()
        indicators["ichimoku_base"] = ichimoku.ichimoku_base_line()
        indicators["ichimoku_conversion"] = ichimoku.ichimoku_conversion_line()
        
        # Multiple EMAs for trend analysis
        for period in [8, 21, 50, 200]:
            ema = EMAIndicator(close=close, window=period)
            indicators[f"ema_{period}"] = ema.ema_indicator()
            
    except Exception as e:
        print(f"Advanced trend calculation error: {e}")
        for key in ["adx", "adx_pos", "adx_neg", "psar", "psar_up", "psar_down", 
                   "ichimoku_a", "ichimoku_b", "ichimoku_base", "ichimoku_conversion",
                   "ema_8", "ema_21", "ema_50", "ema_200"]:
            indicators[key] = pd.Series([None] * len(df))
    
    return indicators

def compute_advanced_volatility(df: pd.DataFrame) -> Dict[str, List]:
    """Advanced volatility indicators"""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    
    indicators = {}
    
    try:
        # Keltner Channel
        keltner = KeltnerChannel(high=high, low=low, close=close, window=20, window_atr=10)
        indicators["keltner_high"] = keltner.keltner_channel_hband()
        indicators["keltner_low"] = keltner.keltner_channel_lband()
        indicators["keltner_mid"] = keltner.keltner_channel_mband()
        
        # Donchian Channel
        donchian = DonchianChannel(high=high, low=low, close=close, window=20)
        indicators["donchian_high"] = donchian.donchian_channel_hband()
        indicators["donchian_low"] = donchian.donchian_channel_lband()
        indicators["donchian_mid"] = donchian.donchian_channel_mband()
        
        # Bollinger Band Width and %B
        bb = BollingerBands(close, window=20, window_dev=2)
        bb_high = bb.bollinger_hband()
        bb_low = bb.bollinger_lband()
        bb_mid = bb.bollinger_mavg()
        
        indicators["bb_width"] = (bb_high - bb_low) / bb_mid * 100
        indicators["bb_percent"] = (close - bb_low) / (bb_high - bb_low) * 100
        
        # Historical Volatility
        returns = close.pct_change()
        indicators["hist_vol"] = returns.rolling(window=20).std() * np.sqrt(252) * 100
        
    except Exception as e:
        print(f"Advanced volatility calculation error: {e}")
        for key in ["keltner_high", "keltner_low", "keltner_mid", "donchian_high", 
                   "donchian_low", "donchian_mid", "bb_width", "bb_percent", "hist_vol"]:
            indicators[key] = pd.Series([None] * len(df))
    
    return indicators

def compute_advanced_volume(df: pd.DataFrame) -> Dict[str, List]:
    """Advanced volume indicators"""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df.get("volume", pd.Series([1] * len(df)))
    
    indicators = {}
    
    try:
        if volume.sum() > 0:
            # On Balance Volume
            obv = OnBalanceVolumeIndicator(close=close, volume=volume)
            indicators["obv"] = obv.on_balance_volume()
            
            # Volume Weighted Average Price
            vwap = VolumeWeightedAveragePrice(high=high, low=low, close=close, volume=volume, window=20)
            indicators["vwap"] = vwap.volume_weighted_average_price()
            
            # Chaikin Money Flow
            cmf = ChaikinMoneyFlowIndicator(high=high, low=low, close=close, volume=volume, window=20)
            indicators["cmf"] = cmf.chaikin_money_flow()
            
            # Volume Rate of Change
            volume_roc = volume.pct_change(periods=12) * 100
            indicators["vol_roc"] = volume_roc
            
            # Price Volume Trend
            pv_trend = ((close.pct_change() * volume).cumsum())
            indicators["pv_trend"] = pv_trend
            
        else:
            # No volume data available
            for key in ["obv", "vwap", "cmf", "vol_roc", "pv_trend"]:
                indicators[key] = pd.Series([None] * len(df))
                
    except Exception as e:
        print(f"Advanced volume calculation error: {e}")
        for key in ["obv", "vwap", "cmf", "vol_roc", "pv_trend"]:
            indicators[key] = pd.Series([None] * len(df))
    
    return indicators

def compute_custom_indicators(df: pd.DataFrame) -> Dict[str, List]:
    """Custom sophisticated indicators"""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    
    indicators = {}
    
    try:
        # Supertrend Indicator
        atr = AverageTrueRange(high=high, low=low, close=close, window=10).average_true_range()
        hl2 = (high + low) / 2
        multiplier = 3.0
        
        upper_band = hl2 + (multiplier * atr)
        lower_band = hl2 - (multiplier * atr)
        
        supertrend = pd.Series(index=close.index, dtype=float)
        trend = pd.Series(index=close.index, dtype=int)
        
        for i in range(1, len(close)):
            if close.iloc[i] <= lower_band.iloc[i-1]:
                supertrend.iloc[i] = upper_band.iloc[i]
                trend.iloc[i] = -1
            elif close.iloc[i] >= upper_band.iloc[i-1]:
                supertrend.iloc[i] = lower_band.iloc[i]
                trend.iloc[i] = 1
            else:
                supertrend.iloc[i] = supertrend.iloc[i-1]
                trend.iloc[i] = trend.iloc[i-1]
        
        indicators["supertrend"] = supertrend
        indicators["supertrend_signal"] = trend
        
        # Squeeze Momentum (Bollinger Bands + Keltner Channel)
        bb = BollingerBands(close, window=20, window_dev=2)
        bb_upper = bb.bollinger_hband()
        bb_lower = bb.bollinger_lband()
        
        kc = KeltnerChannel(high=high, low=low, close=close, window=20)
        kc_upper = kc.keltner_channel_hband()
        kc_lower = kc.keltner_channel_lband()
        
        squeeze = (bb_upper < kc_upper) & (bb_lower > kc_lower)
        indicators["squeeze"] = squeeze.astype(int)
        
        # Fibonacci Retracement Levels (dynamic)
        window = 50
        rolling_high = high.rolling(window=window).max()
        rolling_low = low.rolling(window=window).min()
        
        diff = rolling_high - rolling_low
        indicators["fib_23.6"] = rolling_high - (diff * 0.236)
        indicators["fib_38.2"] = rolling_high - (diff * 0.382)
        indicators["fib_50.0"] = rolling_high - (diff * 0.500)
        indicators["fib_61.8"] = rolling_high - (diff * 0.618)
        
        # Market Regime Detection (Trending vs Ranging)
        adx = ADXIndicator(high=high, low=low, close=close, window=14).adx()
        regime = pd.Series(index=close.index, dtype=str)
        regime[adx > 25] = "trending"
        regime[adx <= 25] = "ranging"
        indicators["market_regime"] = regime
        
    except Exception as e:
        print(f"Custom indicators calculation error: {e}")
        for key in ["supertrend", "supertrend_signal", "squeeze", "fib_23.6", "fib_38.2", 
                   "fib_50.0", "fib_61.8", "market_regime"]:
            indicators[key] = pd.Series([None] * len(df))
    
    return indicators

def compute_indicators(ohlc: List[Dict[str, Any]], sma_window: int = 20, ema_window: int = 20) -> Dict[str, Any]:
    """Enhanced indicators with sophisticated technical analysis"""
    df = _to_df(ohlc)
    if df.empty or len(df) < 20:  # Need minimum data for advanced indicators
        return {"error": "Insufficient data for indicator calculation"}

    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df.get("volume", pd.Series([1] * len(df)))

    def s2l(s):
        """Convert pandas Series to list, handling NaN and infinite values"""
        if isinstance(s, pd.Series):
            result = []
            for v in s:
                if pd.isna(v):
                    result.append(None)
                elif isinstance(v, str):
                    result.append(v)  # Keep strings as-is for market_regime
                else:
                    try:
                        float_val = float(v)
                        # Check for infinite values
                        if np.isinf(float_val) or np.isnan(float_val):
                            result.append(None)
                        else:
                            result.append(float_val)
                    except (ValueError, TypeError):
                        result.append(None)
            return result
        return [None] * len(df)

    # Basic indicators (existing)
    basic_indicators = {}
    try:
        sma = SMAIndicator(close, window=sma_window).sma_indicator()
        ema = EMAIndicator(close, window=ema_window).ema_indicator()
        rsi = RSIIndicator(close, window=14).rsi()
        
        macd_ind = MACD(close)
        macd = macd_ind.macd()
        macd_signal = macd_ind.macd_signal()
        macd_hist = macd_ind.macd_diff()

        bb = BollingerBands(close, window=20, window_dev=2)
        bb_high = bb.bollinger_hband()
        bb_low = bb.bollinger_lband()
        bb_mid = bb.bollinger_mavg()

        atr_ind = AverageTrueRange(high=high, low=low, close=close, window=14, fillna=False)
        atr = atr_ind.average_true_range()
        
        sma_list = s2l(sma)
        
        basic_indicators = {
            "sma": sma_list,
            "ema": s2l(ema),
            "rsi": s2l(rsi),
            "macd": s2l(macd),
            "macd_signal": s2l(macd_signal),
            "macd_hist": s2l(macd_hist),
            "bb_high": s2l(bb_high),
            "bb_low": s2l(bb_low),
            "bb_mid": s2l(bb_mid),
            "atr": s2l(atr),
        }
    except Exception as e:
        print(f"Basic indicators error: {e}")
        import traceback
        traceback.print_exc()
        basic_indicators = {key: [None] * len(df) for key in 
                          ["sma", "ema", "rsi", "macd", "macd_signal", "macd_hist", 
                           "bb_high", "bb_low", "bb_mid", "atr"]}

    # Advanced indicators
    advanced_momentum = compute_advanced_momentum(df)
    advanced_trend = compute_advanced_trend(df)
    advanced_volatility = compute_advanced_volatility(df)
    advanced_volume = compute_advanced_volume(df)
    custom_indicators = compute_custom_indicators(df)

    # Convert all to lists (but don't re-convert already converted lists)
    result = {}
    for indicators in [basic_indicators, advanced_momentum, advanced_trend, 
                      advanced_volatility, advanced_volume, custom_indicators]:
        for key, values in indicators.items():
            if isinstance(values, list):
                result[key] = values  # Already converted
            else:
                result[key] = s2l(values)  # Convert Series to list

    # Add summary statistics
    def safe_float(value):
        """Safely convert to float, returning None for inf/nan"""
        try:
            f_val = float(value)
            return None if (np.isinf(f_val) or np.isnan(f_val)) else f_val
        except (ValueError, TypeError):
            return None
    
    price_change = None
    if len(close) > 1:
        pct_change = close.pct_change().iloc[-1] * 100
        price_change = safe_float(pct_change)
    
    result["summary"] = {
        "total_indicators": len(result),
        "data_points": len(df),
        "last_price": safe_float(close.iloc[-1]) if len(close) > 0 else None,
        "price_change_pct": price_change
    }

    # Final cleanup to ensure JSON compliance
    def clean_for_json(obj):
        """Recursively clean object to be JSON compliant"""
        if isinstance(obj, dict):
            return {k: clean_for_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [clean_for_json(item) for item in obj]
        elif isinstance(obj, (int, float)):
            if np.isinf(obj) or np.isnan(obj):
                return None
            return obj
        else:
            return obj
    
    return clean_for_json(result)
