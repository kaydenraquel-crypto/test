"""
Schema definitions for Technical Indicators API
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from enum import Enum

class MarketType(str, Enum):
    """Supported market types"""
    CRYPTO = "crypto"
    STOCKS = "stocks"

class DataProvider(str, Enum):
    """Supported data providers"""
    AUTO = "auto"
    BINANCE = "binance"
    KRAKEN = "kraken"
    YFINANCE = "yfinance"
    ALPACA = "alpaca"
    ALPHA_VANTAGE = "alpha_vantage"

class IndicatorGroup(str, Enum):
    """TA-Lib indicator groups"""
    OVERLAP = "Overlap Studies"
    MOMENTUM = "Momentum Indicators"
    VOLUME = "Volume Indicators"
    VOLATILITY = "Volatility Indicators"
    PRICE_TRANSFORM = "Price Transform"
    CYCLE = "Cycle Indicators"
    PATTERN = "Pattern Recognition"
    MATH_TRANSFORM = "Math Transform"
    MATH_OPERATORS = "Math Operators"
    STATISTIC = "Statistic Functions"

class IndicatorCalculationRequest(BaseModel):
    """Request for calculating technical indicators"""
    symbol: str = Field(..., description="Trading symbol", example="BTC/USD")
    market: MarketType = Field(default=MarketType.CRYPTO, description="Market type")
    interval: int = Field(default=1, ge=1, le=1440, description="Time interval in minutes")
    limit: int = Field(default=300, ge=10, le=1000, description="Maximum data points")
    days: int = Field(default=30, ge=1, le=365, description="Days of historical data")
    provider: Optional[DataProvider] = Field(default=DataProvider.AUTO, description="Data provider")
    
    # Indicator options
    include_patterns: bool = Field(default=True, description="Include candlestick patterns")
    include_volume: bool = Field(default=True, description="Include volume indicators")
    include_cycles: bool = Field(default=False, description="Include cycle indicators (computationally expensive)")
    
    # Performance options
    cache_ttl: int = Field(default=300, ge=0, le=3600, description="Cache TTL in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "symbol": "BTC/USD",
                "market": "crypto",
                "interval": 5,
                "limit": 200,
                "days": 7,
                "provider": "auto",
                "include_patterns": True,
                "include_volume": True,
                "cache_ttl": 300
            }
        }

class PriceSummary(BaseModel):
    """Price summary information"""
    open: float = Field(..., description="Opening price")
    close: float = Field(..., description="Closing price")
    high: float = Field(..., description="Highest price")
    low: float = Field(..., description="Lowest price")
    change: float = Field(..., description="Price change (close - open)")
    change_pct: float = Field(..., description="Percentage price change")

class DataRange(BaseModel):
    """Data range information"""
    start_ts: int = Field(..., description="Start timestamp (Unix)")
    end_ts: int = Field(..., description="End timestamp (Unix)")

class IndicatorMetadata(BaseModel):
    """Metadata about indicator calculations"""
    total_indicators: int = Field(..., description="Total number of indicators calculated")
    data_points: int = Field(..., description="Number of data points processed")
    data_range: DataRange = Field(..., description="Data time range")
    price_summary: PriceSummary = Field(..., description="Price summary")
    talib_version: str = Field(..., description="TA-Lib version used")
    engine: str = Field(..., description="Calculation engine")
    calculation_time: Optional[str] = Field(None, description="ISO timestamp of calculation")
    data_source: Optional[str] = Field(None, description="Data source identifier")

class CacheInfo(BaseModel):
    """Cache information"""
    cache_hit: bool = Field(..., description="Whether result came from cache")
    cached_at: str = Field(..., description="ISO timestamp when cached")
    ttl_remaining: Optional[float] = Field(None, description="TTL remaining in seconds")
    ttl_seconds: Optional[int] = Field(None, description="Original TTL in seconds")

class OHLCData(BaseModel):
    """OHLC data point"""
    ts: int = Field(..., description="Timestamp (Unix)")
    open: float = Field(..., description="Open price")
    high: float = Field(..., description="High price")
    low: float = Field(..., description="Low price")
    close: float = Field(..., description="Close price")
    volume: Optional[float] = Field(None, description="Volume")

class IndicatorCalculationResponse(BaseModel):
    """Response from indicator calculation"""
    symbol: str = Field(..., description="Trading symbol")
    market: str = Field(..., description="Market type")
    indicators: Dict[str, List[Union[float, int, str, None]]] = Field(..., description="Calculated indicators")
    metadata: IndicatorMetadata = Field(..., description="Calculation metadata")
    ohlc_sample: List[OHLCData] = Field(default_factory=list, description="Recent OHLC data sample")
    cache_info: CacheInfo = Field(..., description="Cache information")
    error: Optional[str] = Field(None, description="Error message if calculation failed")
    
    class Config:
        schema_extra = {
            "example": {
                "symbol": "BTC/USD",
                "market": "crypto",
                "indicators": {
                    "sma_20": [45000.0, 45100.0, 45200.0],
                    "rsi_14": [45.5, 52.3, 48.9],
                    "macd": [-125.5, -100.2, -75.8]
                },
                "metadata": {
                    "total_indicators": 75,
                    "data_points": 200,
                    "engine": "talib"
                },
                "cache_info": {
                    "cache_hit": False,
                    "cached_at": "2024-01-01T12:00:00Z"
                }
            }
        }

class IndicatorInfo(BaseModel):
    """Information about available indicators"""
    talib_available: bool = Field(..., description="Whether TA-Lib is available")
    talib_version: str = Field(..., description="TA-Lib version")
    total_functions: int = Field(..., description="Total number of TA-Lib functions")
    function_groups: Dict[str, Dict[str, Union[int, List[str]]]] = Field(..., description="Function groups")
    service_status: str = Field(..., description="Service status")
    supported_markets: List[str] = Field(..., description="Supported markets")
    api_version: str = Field(..., description="API version")

class FunctionDetail(BaseModel):
    """Detailed information about a TA-Lib function"""
    name: str = Field(..., description="Function name")
    available: bool = Field(..., description="Whether function is available")
    info: Optional[Dict[str, Any]] = Field(None, description="Function info from TA-Lib")
    error: Optional[str] = Field(None, description="Error message if unavailable")

class FunctionGroupResponse(BaseModel):
    """Response for function group information"""
    group: str = Field(..., description="Function group name")
    function_count: int = Field(..., description="Number of functions in group")
    functions: Dict[str, FunctionDetail] = Field(..., description="Function details")

class CacheStats(BaseModel):
    """Cache statistics"""
    cache_size: int = Field(..., description="Number of cached entries")
    cached_symbols: List[str] = Field(..., description="List of cached symbols")
    oldest_entry: Optional[str] = Field(None, description="Timestamp of oldest entry")
    newest_entry: Optional[str] = Field(None, description="Timestamp of newest entry")

class HealthStatus(BaseModel):
    """Health check status"""
    status: str = Field(..., description="Overall status")
    talib_available: bool = Field(..., description="TA-Lib availability")
    talib_version: str = Field(..., description="TA-Lib version")
    total_functions: int = Field(..., description="Total TA-Lib functions")
    cache_size: int = Field(..., description="Current cache size")
    timestamp: str = Field(..., description="Health check timestamp")
    error: Optional[str] = Field(None, description="Error message if unhealthy")

# Legacy compatibility schemas (for existing /api/indicators endpoint)
class LegacyIndicatorRequest(BaseModel):
    """Legacy indicator request format for backward compatibility"""
    symbol: str
    interval: int = 1
    limit: int = 300
    market: str = "crypto"
    provider: Optional[str] = "auto"

class LegacyIndicatorResponse(BaseModel):
    """Legacy indicator response format for backward compatibility"""
    ohlc: List[Dict[str, Any]]
    indicators: Dict[str, Any]
    signals: List[Dict[str, Any]]
    symbol: str
    market: str
    data_points: int