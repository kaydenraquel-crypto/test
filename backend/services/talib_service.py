"""
TA-Lib Technical Indicators Service
Industry-standard technical analysis using TA-Lib library
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Union
import logging
import json

# TA-Lib imports with error handling
try:
    import talib
    TALIB_AVAILABLE = True
except ImportError:
    TALIB_AVAILABLE = False
    talib = None

logger = logging.getLogger(__name__)

class TALibService:
    """Professional-grade technical analysis service using TA-Lib"""
    
    def __init__(self):
        if not TALIB_AVAILABLE:
            logger.warning("TA-Lib not available. Please install: pip install TA-Lib")
            raise ImportError("TA-Lib is required but not installed")
    
    def _prepare_data(self, ohlc_data: List[Dict[str, Any]]) -> Dict[str, np.ndarray]:
        """Convert OHLC data to TA-Lib compatible numpy arrays"""
        if not ohlc_data:
            raise ValueError("No OHLC data provided")
        
        df = pd.DataFrame(ohlc_data).sort_values("ts").reset_index(drop=True)
        
        return {
            'open': df['open'].astype(float).values,
            'high': df['high'].astype(float).values,
            'low': df['low'].astype(float).values,
            'close': df['close'].astype(float).values,
            'volume': df.get('volume', pd.Series([0] * len(df))).astype(float).values
        }
    
    def _clean_array(self, array: np.ndarray) -> List[Optional[float]]:
        """Clean numpy array for JSON serialization"""
        if array is None:
            return []
        
        result = []
        for val in array:
            if np.isnan(val) or np.isinf(val):
                result.append(None)
            else:
                result.append(float(val))
        return result
    
    def calculate_overlap_indicators(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[float]]]:
        """Calculate overlap indicators (Moving Averages, Bollinger Bands, etc.)"""
        indicators = {}
        close = data['close']
        high = data['high']
        low = data['low']
        
        try:
            # Simple Moving Averages
            for period in [5, 10, 20, 50, 100, 200]:
                if len(close) >= period:
                    sma = talib.SMA(close, timeperiod=period)
                    indicators[f'sma_{period}'] = self._clean_array(sma)
            
            # Exponential Moving Averages
            for period in [8, 12, 21, 26, 50]:
                if len(close) >= period:
                    ema = talib.EMA(close, timeperiod=period)
                    indicators[f'ema_{period}'] = self._clean_array(ema)
            
            # Bollinger Bands
            if len(close) >= 20:
                bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)
                indicators['bb_upper'] = self._clean_array(bb_upper)
                indicators['bb_middle'] = self._clean_array(bb_middle)
                indicators['bb_lower'] = self._clean_array(bb_lower)
            
            # Parabolic SAR
            if len(high) >= 5:
                psar = talib.SAR(high, low, acceleration=0.02, maximum=0.2)
                indicators['psar'] = self._clean_array(psar)
            
            # Weighted Moving Average
            if len(close) >= 20:
                wma = talib.WMA(close, timeperiod=20)
                indicators['wma_20'] = self._clean_array(wma)
            
            # Double Exponential Moving Average
            if len(close) >= 21:
                dema = talib.DEMA(close, timeperiod=21)
                indicators['dema_21'] = self._clean_array(dema)
            
            # Triple Exponential Moving Average
            if len(close) >= 21:
                tema = talib.TEMA(close, timeperiod=21)
                indicators['tema_21'] = self._clean_array(tema)
            
            # Triangular Moving Average
            if len(close) >= 20:
                trima = talib.TRIMA(close, timeperiod=20)
                indicators['trima_20'] = self._clean_array(trima)
            
            # Kaufman Adaptive Moving Average
            if len(close) >= 30:
                kama = talib.KAMA(close, timeperiod=30)
                indicators['kama_30'] = self._clean_array(kama)
            
            # MESA Adaptive Moving Average
            if len(close) >= 32:
                mama, fama = talib.MAMA(close, fastlimit=0.5, slowlimit=0.05)
                indicators['mama'] = self._clean_array(mama)
                indicators['fama'] = self._clean_array(fama)
                
        except Exception as e:
            logger.error(f"Error calculating overlap indicators: {e}")
        
        return indicators
    
    def calculate_momentum_indicators(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[float]]]:
        """Calculate momentum indicators (RSI, MACD, Stochastic, etc.)"""
        indicators = {}
        close = data['close']
        high = data['high']
        low = data['low']
        volume = data['volume']
        
        try:
            # RSI (Relative Strength Index)
            if len(close) >= 14:
                rsi = talib.RSI(close, timeperiod=14)
                indicators['rsi_14'] = self._clean_array(rsi)
            
            # MACD (Moving Average Convergence Divergence)
            if len(close) >= 26:
                macd, macd_signal, macd_hist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
                indicators['macd'] = self._clean_array(macd)
                indicators['macd_signal'] = self._clean_array(macd_signal)
                indicators['macd_histogram'] = self._clean_array(macd_hist)
            
            # Stochastic Oscillator
            if len(high) >= 14:
                slowk, slowd = talib.STOCH(high, low, close, fastk_period=14, slowk_period=3, slowd_period=3)
                indicators['stoch_slowk'] = self._clean_array(slowk)
                indicators['stoch_slowd'] = self._clean_array(slowd)
            
            # Fast Stochastic
            if len(high) >= 5:
                fastk, fastd = talib.STOCHF(high, low, close, fastk_period=5, fastd_period=3)
                indicators['stochf_fastk'] = self._clean_array(fastk)
                indicators['stochf_fastd'] = self._clean_array(fastd)
            
            # Stochastic RSI
            if len(close) >= 14:
                stochrsi_fastk, stochrsi_fastd = talib.STOCHRSI(close, timeperiod=14, fastk_period=5, fastd_period=3)
                indicators['stochrsi_fastk'] = self._clean_array(stochrsi_fastk)
                indicators['stochrsi_fastd'] = self._clean_array(stochrsi_fastd)
            
            # Williams %R
            if len(high) >= 14:
                willr = talib.WILLR(high, low, close, timeperiod=14)
                indicators['willr_14'] = self._clean_array(willr)
            
            # Commodity Channel Index
            if len(high) >= 14:
                cci = talib.CCI(high, low, close, timeperiod=14)
                indicators['cci_14'] = self._clean_array(cci)
            
            # Money Flow Index
            if len(high) >= 14 and volume.sum() > 0:
                mfi = talib.MFI(high, low, close, volume, timeperiod=14)
                indicators['mfi_14'] = self._clean_array(mfi)
            
            # Average Directional Movement Index
            if len(high) >= 14:
                adx = talib.ADX(high, low, close, timeperiod=14)
                indicators['adx_14'] = self._clean_array(adx)
            
            # Directional Movement Indicators
            if len(high) >= 14:
                plus_di = talib.PLUS_DI(high, low, close, timeperiod=14)
                minus_di = talib.MINUS_DI(high, low, close, timeperiod=14)
                indicators['plus_di_14'] = self._clean_array(plus_di)
                indicators['minus_di_14'] = self._clean_array(minus_di)
            
            # Directional Movement
            if len(high) >= 14:
                plus_dm = talib.PLUS_DM(high, low, timeperiod=14)
                minus_dm = talib.MINUS_DM(high, low, timeperiod=14)
                indicators['plus_dm_14'] = self._clean_array(plus_dm)
                indicators['minus_dm_14'] = self._clean_array(minus_dm)
            
            # Balance of Power
            if len(high) >= 1:
                bop = talib.BOP(data['open'], high, low, close)
                indicators['bop'] = self._clean_array(bop)
            
            # Rate of Change
            if len(close) >= 10:
                roc = talib.ROC(close, timeperiod=10)
                indicators['roc_10'] = self._clean_array(roc)
            
            # Rate of Change Percentage
            if len(close) >= 10:
                rocp = talib.ROCP(close, timeperiod=10)
                indicators['rocp_10'] = self._clean_array(rocp)
            
            # Rate of Change Ratio
            if len(close) >= 10:
                rocr = talib.ROCR(close, timeperiod=10)
                indicators['rocr_10'] = self._clean_array(rocr)
            
            # TRIX
            if len(close) >= 30:
                trix = talib.TRIX(close, timeperiod=30)
                indicators['trix_30'] = self._clean_array(trix)
                
        except Exception as e:
            logger.error(f"Error calculating momentum indicators: {e}")
        
        return indicators
    
    def calculate_volume_indicators(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[float]]]:
        """Calculate volume indicators (OBV, AD, etc.)"""
        indicators = {}
        close = data['close']
        high = data['high']
        low = data['low']
        volume = data['volume']
        
        try:
            # Skip volume indicators if no volume data
            if volume.sum() == 0:
                logger.warning("No volume data available, skipping volume indicators")
                return indicators
            
            # On Balance Volume
            obv = talib.OBV(close, volume)
            indicators['obv'] = self._clean_array(obv)
            
            # Accumulation/Distribution Line
            ad = talib.AD(high, low, close, volume)
            indicators['ad_line'] = self._clean_array(ad)
            
            # Accumulation/Distribution Oscillator
            if len(high) >= 21:
                adosc = talib.ADOSC(high, low, close, volume, fastperiod=3, slowperiod=10)
                indicators['ad_oscillator'] = self._clean_array(adosc)
                
        except Exception as e:
            logger.error(f"Error calculating volume indicators: {e}")
        
        return indicators
    
    def calculate_volatility_indicators(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[float]]]:
        """Calculate volatility indicators (ATR, NATR, TRANGE)"""
        indicators = {}
        close = data['close']
        high = data['high']
        low = data['low']
        
        try:
            # Average True Range
            if len(high) >= 14:
                atr = talib.ATR(high, low, close, timeperiod=14)
                indicators['atr_14'] = self._clean_array(atr)
            
            # Normalized Average True Range
            if len(high) >= 14:
                natr = talib.NATR(high, low, close, timeperiod=14)
                indicators['natr_14'] = self._clean_array(natr)
            
            # True Range
            if len(high) >= 1:
                trange = talib.TRANGE(high, low, close)
                indicators['trange'] = self._clean_array(trange)
                
        except Exception as e:
            logger.error(f"Error calculating volatility indicators: {e}")
        
        return indicators
    
    def calculate_price_transform_indicators(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[float]]]:
        """Calculate price transform indicators (AVGPRICE, MEDPRICE, TYPPRICE, WCLPRICE)"""
        indicators = {}
        open_price = data['open']
        high = data['high']
        low = data['low']
        close = data['close']
        
        try:
            # Average Price
            avgprice = talib.AVGPRICE(open_price, high, low, close)
            indicators['avgprice'] = self._clean_array(avgprice)
            
            # Median Price
            medprice = talib.MEDPRICE(high, low)
            indicators['medprice'] = self._clean_array(medprice)
            
            # Typical Price
            typprice = talib.TYPPRICE(high, low, close)
            indicators['typprice'] = self._clean_array(typprice)
            
            # Weighted Close Price
            wclprice = talib.WCLPRICE(high, low, close)
            indicators['wclprice'] = self._clean_array(wclprice)
            
        except Exception as e:
            logger.error(f"Error calculating price transform indicators: {e}")
        
        return indicators
    
    def calculate_cycle_indicators(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[float]]]:
        """Calculate cycle indicators (HT_DCPERIOD, HT_DCPHASE, etc.)"""
        indicators = {}
        close = data['close']
        
        try:
            # Hilbert Transform - Dominant Cycle Period
            if len(close) >= 32:
                ht_dcperiod = talib.HT_DCPERIOD(close)
                indicators['ht_dcperiod'] = self._clean_array(ht_dcperiod)
            
            # Hilbert Transform - Dominant Cycle Phase
            if len(close) >= 32:
                ht_dcphase = talib.HT_DCPHASE(close)
                indicators['ht_dcphase'] = self._clean_array(ht_dcphase)
            
            # Hilbert Transform - Phasor Components
            if len(close) >= 32:
                ht_inphase, ht_quadrature = talib.HT_PHASOR(close)
                indicators['ht_inphase'] = self._clean_array(ht_inphase)
                indicators['ht_quadrature'] = self._clean_array(ht_quadrature)
            
            # Hilbert Transform - SineWave
            if len(close) >= 32:
                ht_sine, ht_leadsine = talib.HT_SINE(close)
                indicators['ht_sine'] = self._clean_array(ht_sine)
                indicators['ht_leadsine'] = self._clean_array(ht_leadsine)
            
            # Hilbert Transform - Trend vs Cycle Mode
            if len(close) >= 32:
                ht_trendmode = talib.HT_TRENDMODE(close)
                indicators['ht_trendmode'] = self._clean_array(ht_trendmode)
                
        except Exception as e:
            logger.error(f"Error calculating cycle indicators: {e}")
        
        return indicators
    
    def calculate_pattern_recognition(self, data: Dict[str, np.ndarray]) -> Dict[str, List[Optional[int]]]:
        """Calculate candlestick pattern recognition indicators"""
        indicators = {}
        open_price = data['open']
        high = data['high']
        low = data['low']
        close = data['close']
        
        try:
            # Major candlestick patterns
            patterns = {
                'doji': talib.CDLDOJI(open_price, high, low, close),
                'hammer': talib.CDLHAMMER(open_price, high, low, close),
                'hanging_man': talib.CDLHANGINGMAN(open_price, high, low, close),
                'shooting_star': talib.CDLSHOOTINGSTAR(open_price, high, low, close),
                'inverted_hammer': talib.CDLINVERTEDHAMMER(open_price, high, low, close),
                'marubozu': talib.CDLMARUBOZU(open_price, high, low, close),
                'spinning_top': talib.CDLSPINNINGTOP(open_price, high, low, close),
                'engulfing': talib.CDLENGULFING(open_price, high, low, close),
                'dark_cloud_cover': talib.CDLDARKCLOUDCOVER(open_price, high, low, close),
                'piercing_pattern': talib.CDLPIERCING(open_price, high, low, close),
                'morning_star': talib.CDLMORNINGSTAR(open_price, high, low, close),
                'evening_star': talib.CDLEVENINGSTAR(open_price, high, low, close),
                'three_white_soldiers': talib.CDL3WHITESOLDIERS(open_price, high, low, close),
                'three_black_crows': talib.CDL3BLACKCROWS(open_price, high, low, close),
                'harami': talib.CDLHARAMI(open_price, high, low, close),
                'harami_cross': talib.CDLHARAMICROSS(open_price, high, low, close)
            }
            
            for pattern_name, pattern_data in patterns.items():
                # Convert to list of integers (0, 100, -100)
                indicators[f'pattern_{pattern_name}'] = [int(x) if not np.isnan(x) else 0 for x in pattern_data]
                
        except Exception as e:
            logger.error(f"Error calculating pattern recognition: {e}")
        
        return indicators
    
    def calculate_all_indicators(self, ohlc_data: List[Dict[str, Any]], 
                               include_patterns: bool = True) -> Dict[str, Any]:
        """Calculate comprehensive set of TA-Lib indicators"""
        try:
            if not ohlc_data:
                return {"error": "No OHLC data provided"}
            
            # Prepare data
            data = self._prepare_data(ohlc_data)
            
            if len(data['close']) < 5:
                return {"error": "Insufficient data points (minimum 5 required)"}
            
            # Calculate all indicator categories
            all_indicators = {}
            
            # Overlap Studies (Moving Averages, Bollinger Bands, etc.)
            overlap = self.calculate_overlap_indicators(data)
            all_indicators.update(overlap)
            
            # Momentum Indicators (RSI, MACD, Stochastic, etc.)
            momentum = self.calculate_momentum_indicators(data)
            all_indicators.update(momentum)
            
            # Volume Indicators (OBV, AD Line, etc.)
            volume_indicators = self.calculate_volume_indicators(data)
            all_indicators.update(volume_indicators)
            
            # Volatility Indicators (ATR, NATR, etc.)
            volatility = self.calculate_volatility_indicators(data)
            all_indicators.update(volatility)
            
            # Price Transform Indicators
            price_transform = self.calculate_price_transform_indicators(data)
            all_indicators.update(price_transform)
            
            # Cycle Indicators
            cycle = self.calculate_cycle_indicators(data)
            all_indicators.update(cycle)
            
            # Pattern Recognition (optional, can be computationally expensive)
            if include_patterns:
                patterns = self.calculate_pattern_recognition(data)
                all_indicators.update(patterns)
            
            # Add metadata
            all_indicators['_metadata'] = {
                'total_indicators': len([k for k in all_indicators.keys() if not k.startswith('_')]),
                'data_points': len(data['close']),
                'data_range': {
                    'start_ts': int(ohlc_data[0]['ts']),
                    'end_ts': int(ohlc_data[-1]['ts'])
                },
                'price_summary': {
                    'open': float(data['open'][0]),
                    'close': float(data['close'][-1]),
                    'high': float(np.max(data['high'])),
                    'low': float(np.min(data['low'])),
                    'change': float(data['close'][-1] - data['open'][0]),
                    'change_pct': float((data['close'][-1] - data['open'][0]) / data['open'][0] * 100) if data['open'][0] != 0 else 0
                },
                'talib_version': talib.__version__ if hasattr(talib, '__version__') else 'unknown',
                'engine': 'talib'
            }
            
            return all_indicators
            
        except Exception as e:
            logger.error(f"Error calculating TA-Lib indicators: {e}")
            return {"error": f"TA-Lib calculation failed: {str(e)}"}
    
    def get_indicator_info(self) -> Dict[str, Any]:
        """Get information about available TA-Lib indicators"""
        if not TALIB_AVAILABLE:
            return {"error": "TA-Lib not available"}
        
        try:
            # Get function groups
            function_groups = talib.get_function_groups()
            
            info = {
                "talib_available": True,
                "talib_version": talib.__version__ if hasattr(talib, '__version__') else 'unknown',
                "total_functions": len(talib.get_functions()),
                "function_groups": {}
            }
            
            for group_name, functions in function_groups.items():
                info["function_groups"][group_name] = {
                    "count": len(functions),
                    "functions": functions
                }
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting TA-Lib info: {e}")
            return {"error": f"Failed to get TA-Lib info: {str(e)}"}

# Global service instance
_talib_service = None

def get_talib_service() -> TALibService:
    """Get or create TA-Lib service instance"""
    global _talib_service
    if _talib_service is None:
        try:
            _talib_service = TALibService()
        except ImportError as e:
            logger.error(f"TA-Lib service not available: {e}")
            raise e
    return _talib_service