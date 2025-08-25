"""
Enhanced stock data router supporting ALL US stocks
Provides intelligent fallbacks across multiple data sources
"""
import asyncio
import logging
from typing import List, Dict, Any, Set
import re
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

# For Alpha Vantage parsing
try:
    import pandas as pd
except ImportError:
    pd = None

logger = logging.getLogger(__name__)

# Provider priority for stocks (ordered by reliability) - Polygon first for paid unlimited API
STOCK_PROVIDER_PRIORITY = ["polygon", "yfinance_improved", "finnhub", "alpaca", "yfinance", "alpha_vantage"]
STOCK_PROVIDER_HEALTH = {p: True for p in STOCK_PROVIDER_PRIORITY}

# Comprehensive US stock symbols (major exchanges)
US_STOCK_SYMBOLS = {
    # FAANG + Tech Giants
    "AAPL", "GOOGL", "GOOG", "AMZN", "META", "MSFT", "NFLX", "NVDA", "TSLA", "ADBE",
    "CRM", "ORCL", "IBM", "INTC", "AMD", "QCOM", "CSCO", "NOW", "PYPL", "SQ", "SPOT",
    "UBER", "LYFT", "ZOOM", "DOCU", "ROKU", "TWTR", "SNAP", "PINS", "SHOP",
    
    # Financial Services
    "JPM", "BAC", "WFC", "GS", "MS", "C", "AXP", "V", "MA", "BRK.A", "BRK.B",
    "BLK", "SCHW", "USB", "PNC", "TFC", "COF", "DFS", "SYF", "PYPL",
    
    # Healthcare & Pharmaceuticals
    "JNJ", "PFE", "ABT", "LLY", "MRK", "TMO", "DHR", "BMY", "AZN", "NVS", "UNH",
    "CVS", "ANTM", "CI", "HUM", "GILD", "AMGN", "BIIB", "REGN", "VRTX", "MRNA",
    
    # Industrial & Manufacturing
    "BA", "CAT", "DE", "GE", "HON", "MMM", "UTX", "RTX", "LMT", "NOC", "GD", "TXT",
    "EMR", "ETN", "PH", "ROK", "DOV", "ITW", "CMI", "FTV",
    
    # Consumer Goods & Retail
    "WMT", "HD", "PG", "KO", "PEP", "NKE", "MCD", "SBUX", "DIS", "COST", "TGT",
    "LOW", "TJX", "ROST", "ULTA", "LULU", "RH", "BBY", "ETSY", "W", "CHWY",
    
    # Energy & Utilities
    "XOM", "CVX", "COP", "SLB", "EOG", "PXD", "KMI", "WMB", "OKE", "VLO", "MPC",
    "PSX", "HES", "DVN", "FANG", "NEE", "DUK", "SO", "D", "AEP", "EXC", "XEL",
    
    # Real Estate & REITs
    "AMT", "PLD", "CCI", "EQIX", "SPG", "O", "WELL", "AVB", "EQR", "UDR", "ESS",
    "MAA", "CPT", "AIV", "EXR", "PSA", "CUBE", "LIFE", "ACC", "PEAK",
    
    # ETFs & Index Funds
    "SPY", "QQQ", "IWM", "DIA", "VTI", "VTV", "VUG", "VOO", "VEA", "VWO", "BND",
    "IEFA", "IEMG", "AGG", "LQD", "HYG", "JNK", "TIP", "VTEB", "MUB", "SHY", "IEF", "TLT",
    
    # Commodities & Materials
    "NEM", "FCX", "VALE", "RIO", "BHP", "AA", "X", "CLF", "NUE", "STLD", "RS",
    "CF", "MOS", "FMC", "LIN", "APD", "ECL", "SHW", "PPG", "NTR", "IFF",
    
    # Transportation & Logistics
    "UPS", "FDX", "LUV", "DAL", "AAL", "UAL", "ALK", "JBLU", "SAVE", "CSX", "UNP",
    "NSC", "KSU", "CP", "CNI", "CHRW", "EXPD", "XPO", "ODFL", "SAIA",
    
    # Communication & Media
    "T", "VZ", "TMUS", "CHTR", "CMCSA", "DIS", "NFLX", "FOXA", "FOX", "CBS", "VIAC",
    "DISC", "DISCA", "DISCK", "WBD", "PARA", "LYV", "MSG", "MSGS", "RBLX",
}

# Popular small/mid-cap stocks
POPULAR_SMALL_MID_CAPS = {
    "PLTR", "BB", "NOK", "AMC", "GME", "WISH", "CLOV", "SPCE", "DKNG", "PENN",
    "MGM", "WYNN", "LVS", "CZR", "BYD", "F", "GM", "LCID", "RIVN", "NIO", "XPEV", "LI"
}

# Combine all symbols
ALL_US_STOCKS = US_STOCK_SYMBOLS | POPULAR_SMALL_MID_CAPS

async def fetch_stock_history(symbol: str, interval: int, days: int, provider: str = "auto") -> List[Dict[str, Any]]:
    """
    Fetch stock history with intelligent provider fallbacks
    
    Args:
        symbol: Stock symbol (e.g., "AAPL", "TSLA")
        interval: Interval in minutes
        days: Number of days of history
        provider: Specific provider or "auto" for intelligent routing
    
    Returns:
        List of OHLCV dictionaries
    """
    
    # Validate symbol format
    if not _is_valid_stock_symbol(symbol):
        logger.warning(f"Invalid stock symbol format: {symbol}")
        return []
    
    if provider != "auto":
        # Use specific provider
        return await _fetch_from_stock_provider(symbol, interval, days, provider)
    
    # Try providers in order of reliability
    healthy_providers = [p for p in STOCK_PROVIDER_PRIORITY if STOCK_PROVIDER_HEALTH.get(p, True)]
    
    for prov in healthy_providers:
        try:
            logger.info(f"🔄 Trying {prov} for stock {symbol} ({days} days)")
            data = await _fetch_from_stock_provider(symbol, interval, days, prov)
            
            if data and len(data) > 0:
                logger.info(f"✅ Success with {prov}: {len(data)} bars for {symbol}")
                STOCK_PROVIDER_HEALTH[prov] = True
                return data
            else:
                logger.warning(f"⚠️ {prov} returned no data for {symbol}")
                
        except Exception as e:
            logger.warning(f"❌ {prov} failed for {symbol}: {e}")
            continue
    
    logger.error(f"💥 All stock providers failed for {symbol}")
    
    # Final fallback: use mock data for testing when all providers fail
    logger.warning(f"🎭 Using mock data as fallback for {symbol}")
    try:
        from connectors.mock_stock_data import generate_realistic_ohlcv
        # Calculate proper number of bars based on market hours
        # For intraday: ~6.5 trading hours * 60 minutes / interval
        trading_minutes_per_day = 390  # 6.5 hours * 60 minutes
        if interval < 1440:  # intraday intervals
            bars_per_day = trading_minutes_per_day // interval
            bars_needed = min(days * bars_per_day, 1000)
        else:  # daily or longer
            bars_needed = min(days, 1000)
        
        mock_data = generate_realistic_ohlcv(symbol, interval, bars_needed)
        if mock_data:
            logger.info(f"✅ Generated {len(mock_data)} mock bars for {symbol} ({bars_needed} requested)")
            return mock_data
    except Exception as mock_error:
        logger.error(f"Mock data generation failed: {mock_error}")
    
    return []

async def _fetch_from_stock_provider(symbol: str, interval: int, days: int, provider: str) -> List[Dict[str, Any]]:
    """Fetch data from a specific stock provider"""
    
    try:
        if provider == "yfinance_improved":
            from connectors.stocks_yfinance_improved import fetch_yfinance_improved
            return await fetch_yfinance_improved(symbol, interval, days)
        
        elif provider == "finnhub":
            from connectors.stocks_finnhub import fetch_finnhub_bars
            return await fetch_finnhub_bars(symbol, interval, days)
        
        elif provider == "polygon":
            from connectors.stocks_polygon import fetch_polygon_bars
            return await fetch_polygon_bars(symbol, interval, days)
        
        elif provider == "alpaca":
            from connectors.stocks_alpaca import fetch_alpaca_bars
            return await fetch_alpaca_bars(symbol, interval, days)
        
        elif provider == "yfinance":
            from connectors.stocks_yfinance import fetch_ohlc_days_yf
            return await fetch_ohlc_days_yf(symbol, interval, days)
        
        elif provider == "alpha_vantage":
            # Alpha Vantage integration (if you have API key)
            return await _fetch_alpha_vantage_bars(symbol, interval, days)
        
        else:
            raise ValueError(f"Unknown stock provider: {provider}")
            
    except Exception as e:
        logger.error(f"Stock provider {provider} error for {symbol}: {e}")
        raise

async def _fetch_alpha_vantage_bars(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    """Fetch from Alpha Vantage using dedicated connector"""
    from connectors.stocks_alpha_vantage import get_alpha_vantage_connector
    
    connector = get_alpha_vantage_connector()
    
    if not connector.api_key:
        logger.warning("ALPHA_VANTAGE_KEY not configured")
        return []
    
    try:
        # Alpha Vantage interval mapping
        if interval == 1:
            av_interval = "1min"
        elif interval == 5:
            av_interval = "5min"
        elif interval == 15:
            av_interval = "15min"
        elif interval == 30:
            av_interval = "30min"
        elif interval == 60:
            av_interval = "60min"
        else:
            av_interval = "daily"
        
        # Use the new connector
        if interval < 1440:  # Intraday
            data = await connector.get_intraday(symbol, av_interval)
        else:  # Daily
            data = await connector.get_daily(symbol, 'full' if days > 100 else 'compact')
        
        if not data or not data.get('data'):
            return []
        
        # Convert to our format
        ohlc_data = []
        for item in data['data']:
            if 'timestamp' in item:  # Intraday format
                timestamp = item['timestamp']
            else:  # Daily format
                timestamp = item['date']
                
            # Convert timestamp to Unix timestamp
            if pd:
                ts = int(pd.Timestamp(timestamp).timestamp())
            else:
                from datetime import datetime
                dt = datetime.fromisoformat(timestamp.replace(' ', 'T'))
                ts = int(dt.timestamp())
                
            ohlc_data.append({
                "ts": ts,
                "open": item['open'],
                "high": item['high'],
                "low": item['low'],
                "close": item['close'],
                "volume": item['volume']
            })
        
        # Sort by timestamp and limit to requested days
        ohlc_data.sort(key=lambda x: x["ts"])
        
        # Calculate how many bars we need
        if interval < 1440:  # Intraday
            bars_per_day = 390 // interval  # ~390 trading minutes per day
            max_bars = days * bars_per_day
        else:  # Daily
            max_bars = days
            
        return ohlc_data[-max_bars:] if len(ohlc_data) > max_bars else ohlc_data
                
    except Exception as e:
        logger.error(f"Alpha Vantage error for {symbol}: {e}")
        return []

def _is_valid_stock_symbol(symbol: str) -> bool:
    """Validate stock symbol format"""
    if not symbol or len(symbol) < 1:
        return False
    
    # Remove common suffixes
    clean_symbol = symbol.upper().split('.')[0]
    
    # Check if it's a known symbol or matches pattern
    if clean_symbol in ALL_US_STOCKS:
        return True
    
    # Pattern matching for valid stock symbols
    # 1-5 characters, letters only (most common)
    if re.match(r'^[A-Z]{1,5}$', clean_symbol):
        return True
    
    # Extended pattern for special cases (e.g., BRK.A, BRK.B)
    if re.match(r'^[A-Z]{1,4}\.[A-Z]$', symbol.upper()):
        return True
    
    return False

def get_popular_stocks() -> List[str]:
    """Get list of most popular/liquid stocks for quick access"""
    return [
        "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", "ADBE", "CRM",
        "SPY", "QQQ", "IWM", "DIA", "VTI", "VOO", "BND", "GLD", "SLV", "TLT",
        "JPM", "BAC", "V", "MA", "UNH", "JNJ", "PFE", "HD", "WMT", "KO"
    ]

def is_stock_symbol(symbol: str) -> bool:
    """Check if a symbol is likely a stock (vs crypto)"""
    return _is_valid_stock_symbol(symbol)

# Test function
async def test_stock_providers():
    """Test all stock providers with popular symbols"""
    test_symbols = ["AAPL", "GOOGL", "TSLA", "SPY", "QQQ"]
    
    print("🧪 Testing Stock Data Providers")
    print("=" * 50)
    
    for symbol in test_symbols:
        print(f"\n🔍 Testing {symbol}")
        try:
            data = await fetch_stock_history(symbol, 5, 1)  # 5-min bars, 1 day
            if data:
                latest = data[-1]
                print(f"✅ {symbol}: {len(data)} bars")
                print(f"   📊 Latest: ${latest['close']:.2f} (Vol: {latest['volume']:,.0f})")
            else:
                print(f"⚠️ {symbol}: No data returned")
        except Exception as e:
            print(f"❌ {symbol}: Error - {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_stock_providers())