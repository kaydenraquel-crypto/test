import asyncio
import time
import re
from typing import List, Dict, Any
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

# Enhanced provider priority with health monitoring
PROVIDER_PRIORITY = ["binance", "kraken", "coinbase", "yfinance"]
PROVIDER_HEALTH = {"binance": True, "kraken": True, "coinbase": True, "yfinance": True}

# Rate limiting to prevent API abuse
LAST_REQUEST_TIME = defaultdict(float)
MIN_REQUEST_INTERVAL = 2.0  # 2 seconds between requests per provider

async def fetch_history_crypto(symbol: str, interval: int, days: int, provider: str = "auto") -> List[Dict[str, Any]]:
    """
    Fetch crypto history with intelligent provider fallbacks and health monitoring
    """
    
    if provider != "auto":
        # Use specific provider
        return await _fetch_from_provider(symbol, interval, days, provider)
    
    # Filter to healthy providers only
    healthy_providers = [p for p in PROVIDER_PRIORITY if PROVIDER_HEALTH.get(p, True)]
    
    # Try providers in order of reliability
    for prov in healthy_providers:
        try:
            logger.info(f"🔄 Trying {prov} for {symbol} ({days} days)...")
            start_time = asyncio.get_event_loop().time()
            
            data = await _fetch_from_provider(symbol, interval, days, prov)
            
            elapsed = asyncio.get_event_loop().time() - start_time
            
            if data and len(data) > 0:
                logger.info(f"✅ Success with {prov}: {len(data)} candles in {elapsed:.2f}s")
                # Mark provider as healthy
                PROVIDER_HEALTH[prov] = True
                return data
            else:
                logger.warning(f"⚠️ {prov} returned no data for {symbol}")
                
        except Exception as e:
            logger.warning(f"❌ {prov} failed for {symbol}: {e}")
            # Don't immediately mark as unhealthy for single failures
            continue
    
    logger.error(f"💥 All providers failed for {symbol}")
    return []

async def _fetch_from_provider(symbol: str, interval: int, days: int, provider: str) -> List[Dict[str, Any]]:
    """Fetch data from a specific provider with rate limiting and enhanced error handling"""
    
    # Rate limiting check
    now = time.time()
    last_request = LAST_REQUEST_TIME[provider]
    
    if now - last_request < MIN_REQUEST_INTERVAL:
        wait_time = MIN_REQUEST_INTERVAL - (now - last_request)
        logger.info(f"⏱️ Rate limiting {provider}: waiting {wait_time:.1f}s")
        await asyncio.sleep(wait_time)
    
    LAST_REQUEST_TIME[provider] = time.time()
    
    try:
        if provider == "binance":
            from connectors.crypto_binance import fetch_binance_ohlc_days
            return await fetch_binance_ohlc_days(symbol, interval, days)
        
        elif provider == "kraken":
            from connectors.crypto_kraken_rest import fetch_ohlc_days_kraken
            return await fetch_ohlc_days_kraken(symbol, interval, days)
        
        elif provider == "coinbase":
            try:
                from connectors.crypto_coinbase import fetch_coinbase_ohlc
                # Coinbase doesn't have a days function, so calculate limit
                bars_needed = min(days * (1440 // interval), 300)  # Max 300 for Coinbase
                return await fetch_coinbase_ohlc(symbol, interval, bars_needed)
            except ImportError:
                logger.warning("Coinbase connector not available")
                return []
        
        elif provider == "yfinance":
            # Enhanced yfinance crypto support
            return await _fetch_yfinance_crypto(symbol, interval, days)
        
        else:
            raise ValueError(f"Unknown provider: {provider}")
            
    except Exception as e:
        # Log detailed error for debugging
        logger.error(f"Provider {provider} error for {symbol}: {type(e).__name__}: {e}")
        raise

async def _fetch_yfinance_crypto(symbol: str, interval: int, days: int) -> List[Dict[str, Any]]:
    """Enhanced Yahoo Finance crypto fetching"""
    
    # Convert to Yahoo Finance crypto format
    yf_symbol = _to_yfinance_crypto_symbol(symbol)
    
    try:
        from connectors.stocks_yfinance import fetch_recent_ohlc
        
        # Calculate appropriate limit for days
        bars_per_day = 1440 // interval  # minutes per day / interval
        limit = days * bars_per_day
        
        data = await fetch_recent_ohlc(yf_symbol, interval=interval, limit=limit)
        
        logger.info(f"Yahoo Finance crypto: {len(data) if data else 0} bars for {yf_symbol}")
        return data or []
        
    except Exception as e:
        logger.error(f"Yahoo Finance crypto error: {e}")
        return []

def _to_yfinance_crypto_symbol(symbol: str) -> str:
    """Convert crypto symbol to Yahoo Finance format"""
    mappings = {
        "BTC/USD": "BTC-USD",
        "ETH/USD": "ETH-USD", 
        "ADA/USD": "ADA-USD",
        "SOL/USD": "SOL1-USD",  # Yahoo uses SOL1
        "DOT/USD": "DOT1-USD",   # Yahoo uses DOT1
        "LINK/USD": "LINK-USD",
        "UNI/USD": "UNI3-USD",   # Yahoo uses UNI3
        "MATIC/USD": "MATIC-USD",
        "AVAX/USD": "AVAX-USD",
        "LTC/USD": "LTC-USD",
        "XBT/USD": "BTC-USD",    # Convert XBT to BTC
        "BCH/USD": "BCH-USD",
        "ATOM/USD": "ATOM1-USD",
        "ALGO/USD": "ALGO-USD",
        "FIL/USD": "FIL-USD",
    }
    
    s = symbol.upper()
    if s in mappings:
        return mappings[s]
    
    # Convert slash to dash for Yahoo
    if "/" in symbol:
        return symbol.upper().replace("/", "-")
    
    # Default: assume USD pair
    return f"{symbol.upper()}-USD"

async def get_provider_health() -> Dict[str, bool]:
    """Get current provider health status"""
    return PROVIDER_HEALTH.copy()

async def reset_provider_health():
    """Reset all providers to healthy status"""
    global PROVIDER_HEALTH
    PROVIDER_HEALTH = {p: True for p in PROVIDER_PRIORITY}
    logger.info("🔄 Reset all provider health status")

# Enhanced stream selection with fallbacks
async def get_crypto_stream(symbol: str, interval: int, provider: str = "auto"):
    """Get WebSocket stream with intelligent provider selection"""
    
    if provider == "auto":
        # Try providers in order until one works
        healthy_providers = [p for p in PROVIDER_PRIORITY[:2] if PROVIDER_HEALTH.get(p, True)]  # Only WS providers
        
        for prov in healthy_providers:
            try:
                logger.info(f"🔄 Trying {prov} stream for {symbol}")
                return await get_crypto_stream(symbol, interval, prov)
            except Exception as e:
                logger.warning(f"❌ Stream provider {prov} failed: {e}")
                continue
        raise Exception("All stream providers failed")
    
    elif provider == "binance":
        from connectors.crypto_binance import binance_ohlc_stream
        return binance_ohlc_stream(symbol, interval)
    
    elif provider == "kraken":
        from connectors.crypto_kraken import kraken_ohlc_stream
        return kraken_ohlc_stream(symbol, interval)
    
    else:
        raise ValueError(f"Unknown stream provider: {provider}")

# Performance monitoring
class ProviderStats:
    def __init__(self):
        self.stats = {p: {"requests": 0, "failures": 0, "avg_time": 0} for p in PROVIDER_PRIORITY}
    
    def record_request(self, provider: str, success: bool, duration: float):
        if provider in self.stats:
            self.stats[provider]["requests"] += 1
            if not success:
                self.stats[provider]["failures"] += 1
            # Update average time
            current_avg = self.stats[provider]["avg_time"]
            count = self.stats[provider]["requests"]
            self.stats[provider]["avg_time"] = (current_avg * (count - 1) + duration) / count
    
    def get_stats(self):
        return self.stats.copy()

# Global stats instance
provider_stats = ProviderStats()

# Test all providers with enhanced reporting
async def test_all_providers():
    """Enhanced provider testing with performance metrics"""
    test_symbol = "ETH/USD"
    
    print(f"🧪 Testing all providers with {test_symbol}")
    print("=" * 60)
    
    for provider in PROVIDER_PRIORITY:
        print(f"\n🔍 Testing {provider.upper()}")
        start_time = asyncio.get_event_loop().time()
        
        try:
            data = await _fetch_from_provider(test_symbol, 5, 1, provider)
            elapsed = asyncio.get_event_loop().time() - start_time
            
            if data:
                print(f"✅ {provider}: {len(data)} candles in {elapsed:.2f}s")
                print(f"   📊 Latest: {data[-1] if data else 'None'}")
                provider_stats.record_request(provider, True, elapsed)
            else:
                print(f"⚠️ {provider}: No data in {elapsed:.2f}s")
                provider_stats.record_request(provider, False, elapsed)
        except Exception as e:
            elapsed = asyncio.get_event_loop().time() - start_time
            print(f"❌ {provider}: Error in {elapsed:.2f}s - {e}")
            provider_stats.record_request(provider, False, elapsed)
    
    print(f"\n🚀 Testing auto fallback...")
    try:
        start_time = asyncio.get_event_loop().time()
        data = await fetch_history_crypto(test_symbol, 5, 1, "auto")
        elapsed = asyncio.get_event_loop().time() - start_time
        
        if data:
            print(f"✅ Auto fallback: {len(data)} candles in {elapsed:.2f}s")
        else:
            print(f"❌ Auto fallback: No data in {elapsed:.2f}s")
    except Exception as e:
        print(f"❌ Auto fallback: Error - {e}")
    
    # Print performance stats
    print(f"\n📈 Performance Stats:")
    stats = provider_stats.get_stats()
    for provider, data in stats.items():
        if data["requests"] > 0:
            success_rate = ((data["requests"] - data["failures"]) / data["requests"]) * 100
            print(f"   {provider}: {success_rate:.1f}% success, {data['avg_time']:.2f}s avg")

# Comprehensive crypto symbol validation
MAJOR_CRYPTO_BASES = {
    # Top 50 by market cap
    'BTC', 'XBT', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE', 'AVAX',
    'SHIB', 'MATIC', 'LTC', 'UNI', 'LINK', 'BCH', 'ALGO', 'VET', 'ICP', 'FIL',
    'TRX', 'ETC', 'XLM', 'MANA', 'HBAR', 'THETA', 'SAND', 'AXS', 'NEAR', 'ATOM',
    'FLOW', 'EOS', 'XTZ', 'CHZ', 'AAVE', 'MKR', 'SNX', 'COMP', 'YFI', 'SUSHI',
    'GRT', 'ENJ', 'BAT', 'ZRX', 'CRV', 'REN', 'LRC', 'STORJ', 'NMR', 'BAND',
    
    # Additional popular cryptos
    'USDC', 'USDT', 'DAI', 'BUSD', 'LUNA', 'UST', 'FTT', 'CRO', 'LEO', 'HT',
    'OKB', 'MIOTA', 'XMR', 'XEM', 'NEO', 'DASH', 'ZEC', 'QTUM', 'OMG', 'ZIL',
    'ICX', 'LSK', 'NANO', 'DGB', 'SC', 'MAID', 'STEEM', 'REP', 'KNC', 'ANT',
    'MLN', 'STORJ', 'GNT', 'SALT', 'POWR', 'RCN', 'MTL', 'SNT', 'ADX', 'PAY',
    'TNT', 'CFI', 'BNT', 'FUN', 'DNT', 'MYST', 'WINGS', 'RLC', 'GUP', 'TKN',
    
    # DeFi tokens
    'CAKE', 'CREAM', 'ALPHA', 'BAKE', 'AUTO', 'ELF', 'FOR', 'SXP', 'HARD', 'XVS',
    'VAI', 'WIN', 'TWT', 'SFP', 'LINA', 'DEGO', 'NBS', 'PROS', 'LIT', 'SLP',
    'PHA', 'DODO', 'SWRV', 'JULB', 'BURGER', 'SPARTA', 'WATCH', 'BELT', 'BOR',
    'REEF', 'DEXE', 'DF', 'FIS', 'OM', 'POND', 'DEGO', 'UNFI', 'CVP', 'RAMP',
    
    # Meme coins and trending
    'PEPE', 'FLOKI', 'BABYDOGE', 'SAFEMOON', 'ELONGATE', 'CATGE', 'HOKK', 'KISHU',
    'EMAX', 'HUSKY', 'ROCKETMOON', 'MOONSHOT', 'DIAMOND', 'POODL', 'GRUMPY',
    'CORGI', 'AKITA', 'CORGIB', 'SHIBAINU', 'DOGEFATHER', 'MARS', 'MOON', 'ROCKET'
}

VALID_QUOTE_CURRENCIES = {
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KRW',  # Fiat
    'BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'DAI', 'BUSD', 'UST'  # Crypto
}

def validate_crypto_symbol(symbol: str) -> bool:
    """Enhanced crypto symbol validation for comprehensive coverage"""
    if not symbol or len(symbol) < 5:  # Minimum like "A/B"
        return False
    
    if "/" not in symbol:
        return False
    
    parts = symbol.split("/")
    if len(parts) != 2:
        return False
    
    base, quote = parts
    if len(base) < 2 or len(quote) < 2:
        return False
    
    base_upper = base.upper()
    quote_upper = quote.upper()
    
    # Check against comprehensive lists
    if base_upper in MAJOR_CRYPTO_BASES and quote_upper in VALID_QUOTE_CURRENCIES:
        return True
    
    # Additional pattern matching for new/unknown tokens
    # Most crypto symbols are 2-10 characters, uppercase letters
    if (re.match(r'^[A-Z0-9]{2,10}$', base_upper) and 
        quote_upper in VALID_QUOTE_CURRENCIES):
        return True
    
    return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_all_providers())