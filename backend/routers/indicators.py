"""
Professional Technical Indicators Router using TA-Lib
Provides comprehensive technical analysis with industry-standard calculations
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import asyncio

from services.talib_service import get_talib_service, TALibService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/indicators", tags=["technical-indicators"])

class IndicatorRequest(BaseModel):
    """Request schema for technical indicators"""
    symbol: str = Field(..., description="Trading symbol (e.g., BTC/USD, AAPL)")
    market: str = Field(default="crypto", description="Market type: crypto, stocks")
    interval: int = Field(default=1, ge=1, description="Time interval in minutes")
    limit: int = Field(default=300, ge=1, le=1000, description="Number of data points")
    days: int = Field(default=30, ge=1, le=365, description="Days of historical data")
    provider: Optional[str] = Field(default="auto", description="Data provider preference")
    include_patterns: bool = Field(default=True, description="Include candlestick patterns")
    include_volume: bool = Field(default=True, description="Include volume indicators")
    cache_ttl: int = Field(default=300, ge=0, description="Cache TTL in seconds")

class IndicatorResponse(BaseModel):
    """Response schema for technical indicators"""
    symbol: str
    market: str
    indicators: Dict[str, Any]
    metadata: Dict[str, Any]
    ohlc_sample: List[Dict[str, Any]] = Field(default_factory=list, description="Recent OHLC data sample")
    cache_info: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None

# Simple in-memory cache for indicators
_indicator_cache = {}
_cache_timestamps = {}

def _get_cache_key(symbol: str, market: str, interval: int, days: int) -> str:
    """Generate cache key for indicators"""
    return f"{symbol}_{market}_{interval}_{days}"

def _is_cache_valid(cache_key: str, ttl_seconds: int) -> bool:
    """Check if cached data is still valid"""
    if cache_key not in _cache_timestamps:
        return False
    
    cache_time = _cache_timestamps[cache_key]
    return (datetime.now() - cache_time).total_seconds() < ttl_seconds

async def _get_ohlc_data(symbol: str, market: str, interval: int, days: int, provider: str) -> List[Dict[str, Any]]:
    """Get OHLC data from appropriate connector"""
    try:
        if market == "crypto":
            from connectors.crypto_router import fetch_history_crypto
            data = await fetch_history_crypto(symbol, interval, days, provider=provider)
        else:  # stocks
            from connectors.stocks_router import fetch_stock_history
            data = await fetch_stock_history(symbol, interval, days, provider=provider)
        
        return data or []
        
    except Exception as e:
        logger.error(f"Error fetching OHLC data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")

@router.post("/calculate", response_model=IndicatorResponse)
async def calculate_indicators(
    request: IndicatorRequest,
    talib_service: TALibService = Depends(get_talib_service)
) -> IndicatorResponse:
    """
    Calculate comprehensive technical indicators using TA-Lib
    
    This endpoint provides professional-grade technical analysis including:
    - Moving Averages (SMA, EMA, WMA, DEMA, TEMA, etc.)
    - Momentum Indicators (RSI, MACD, Stochastic, CCI, MFI, etc.)
    - Trend Indicators (ADX, PSAR, Aroon, etc.)
    - Volatility Indicators (ATR, Bollinger Bands, etc.)
    - Volume Indicators (OBV, AD Line, etc.)
    - Cycle Indicators (Hilbert Transform based)
    - Candlestick Pattern Recognition
    """
    
    try:
        # Check cache first
        cache_key = _get_cache_key(request.symbol, request.market, request.interval, request.days)
        
        if _is_cache_valid(cache_key, request.cache_ttl) and cache_key in _indicator_cache:
            cached_result = _indicator_cache[cache_key]
            cached_result.cache_info = {
                "cache_hit": True,
                "cached_at": _cache_timestamps[cache_key].isoformat(),
                "ttl_remaining": request.cache_ttl - (datetime.now() - _cache_timestamps[cache_key]).total_seconds()
            }
            logger.info(f"Returning cached indicators for {request.symbol}")
            return cached_result
        
        # Fetch fresh OHLC data
        logger.info(f"Calculating TA-Lib indicators for {request.symbol} ({request.market})")
        ohlc_data = await _get_ohlc_data(request.symbol, request.market, request.interval, request.days, request.provider or "auto")
        
        if not ohlc_data:
            return IndicatorResponse(
                symbol=request.symbol,
                market=request.market,
                indicators={},
                metadata={"error": "No market data available"},
                error="No market data available for the specified symbol and timeframe"
            )
        
        # Limit data to requested amount
        if len(ohlc_data) > request.limit:
            ohlc_data = ohlc_data[-request.limit:]
        
        logger.info(f"Processing {len(ohlc_data)} data points for {request.symbol}")
        
        # Calculate TA-Lib indicators
        indicators = talib_service.calculate_all_indicators(
            ohlc_data, 
            include_patterns=request.include_patterns
        )
        
        # Check for calculation errors
        if "error" in indicators:
            return IndicatorResponse(
                symbol=request.symbol,
                market=request.market,
                indicators={},
                metadata={"error": indicators["error"]},
                error=indicators["error"]
            )
        
        # Extract metadata
        metadata = indicators.pop('_metadata', {})
        metadata.update({
            "calculation_time": datetime.now().isoformat(),
            "data_source": f"{request.market}_{request.provider or 'auto'}",
            "parameters": {
                "symbol": request.symbol,
                "market": request.market,
                "interval": request.interval,
                "days": request.days,
                "limit": request.limit
            }
        })
        
        # Create response
        response = IndicatorResponse(
            symbol=request.symbol,
            market=request.market,
            indicators=indicators,
            metadata=metadata,
            ohlc_sample=ohlc_data[-10:],  # Last 10 bars for reference
            cache_info={
                "cache_hit": False,
                "cached_at": datetime.now().isoformat(),
                "ttl_seconds": request.cache_ttl
            }
        )
        
        # Cache the result
        if request.cache_ttl > 0:
            _indicator_cache[cache_key] = response
            _cache_timestamps[cache_key] = datetime.now()
        
        logger.info(f"Successfully calculated {metadata.get('total_indicators', 0)} indicators for {request.symbol}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating indicators for {request.symbol}: {e}")
        return IndicatorResponse(
            symbol=request.symbol,
            market=request.market,
            indicators={},
            metadata={"error": f"Calculation failed: {str(e)}"},
            error=f"Technical indicator calculation failed: {str(e)}"
        )

@router.get("/info")
async def get_indicator_info(
    talib_service: TALibService = Depends(get_talib_service)
) -> Dict[str, Any]:
    """Get information about available TA-Lib indicators and functions"""
    try:
        info = talib_service.get_indicator_info()
        
        # Add service status
        info.update({
            "service_status": "active",
            "supported_markets": ["crypto", "stocks"],
            "supported_intervals": "1+ minutes",
            "cache_enabled": True,
            "pattern_recognition": True,
            "api_version": "1.0.0"
        })
        
        return info
        
    except Exception as e:
        logger.error(f"Error getting indicator info: {e}")
        return {"error": f"Failed to get indicator information: {str(e)}"}

@router.get("/functions/{group}")
async def get_function_group(
    group: str,
    talib_service: TALibService = Depends(get_talib_service)
) -> Dict[str, Any]:
    """Get detailed information about a specific TA-Lib function group"""
    try:
        import talib
        
        function_groups = talib.get_function_groups()
        
        if group not in function_groups:
            available_groups = list(function_groups.keys())
            raise HTTPException(
                status_code=404, 
                detail=f"Function group '{group}' not found. Available groups: {available_groups}"
            )
        
        functions = function_groups[group]
        
        # Get detailed info for each function in the group
        function_details = {}
        for func_name in functions:
            try:
                func = getattr(talib, func_name)
                # Get function info if available
                info = talib.abstract.Function(func_name).info if hasattr(talib, 'abstract') else None
                function_details[func_name] = {
                    "name": func_name,
                    "available": True,
                    "info": info
                }
            except Exception as func_error:
                function_details[func_name] = {
                    "name": func_name,
                    "available": False,
                    "error": str(func_error)
                }
        
        return {
            "group": group,
            "function_count": len(functions),
            "functions": function_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting function group info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get function group info: {str(e)}")

@router.delete("/cache")
async def clear_cache() -> Dict[str, Any]:
    """Clear the indicator cache"""
    global _indicator_cache, _cache_timestamps
    
    cache_size = len(_indicator_cache)
    _indicator_cache.clear()
    _cache_timestamps.clear()
    
    return {
        "message": f"Cache cleared successfully",
        "items_removed": cache_size,
        "cache_size": len(_indicator_cache)
    }

@router.get("/cache/stats")
async def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    return {
        "cache_size": len(_indicator_cache),
        "cached_symbols": list(set([key.split('_')[0] for key in _indicator_cache.keys()])),
        "oldest_entry": min(_cache_timestamps.values()).isoformat() if _cache_timestamps else None,
        "newest_entry": max(_cache_timestamps.values()).isoformat() if _cache_timestamps else None
    }

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check for the indicators service"""
    try:
        talib_service = get_talib_service()
        info = talib_service.get_indicator_info()
        
        return {
            "status": "healthy",
            "talib_available": info.get("talib_available", False),
            "talib_version": info.get("talib_version", "unknown"),
            "total_functions": info.get("total_functions", 0),
            "cache_size": len(_indicator_cache),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }