"""
Mock stock data generator for testing when real providers are unavailable
Provides realistic-looking OHLCV data for development and testing
"""
import random
import time
from typing import List, Dict, Any
import math

def generate_realistic_ohlcv(symbol: str, interval: int, count: int, base_price: float = 100.0) -> List[Dict[str, Any]]:
    """
    Generate realistic-looking OHLCV data for testing with proper market hours
    
    Args:
        symbol: Stock symbol
        interval: Interval in minutes 
        count: Number of bars to generate
        base_price: Starting price
    
    Returns:
        List of OHLCV dictionaries
    """
    data = []
    
    # Create more realistic timestamps aligned with market hours
    # Start from recent trading session and work backwards
    import datetime
    
    now = datetime.datetime.now()
    # If it's weekend or after hours, use last Friday's close
    if now.weekday() >= 5:  # Saturday or Sunday
        days_back = now.weekday() - 4  # Go back to Friday
        market_close = now.replace(hour=16, minute=0, second=0, microsecond=0) - datetime.timedelta(days=days_back)
    else:
        # Use today but earlier time
        market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
        if now.hour < 9:  # Before market open, use previous day
            market_close -= datetime.timedelta(days=1)
    
    # Generate timestamps working backwards from market close
    current_time = int(market_close.timestamp())
    current_price = base_price
    
    # Define some symbol-specific base prices for realism
    symbol_prices = {
        "AAPL": 150.0, "MSFT": 300.0, "GOOGL": 2500.0, "AMZN": 3000.0, 
        "TSLA": 800.0, "META": 250.0, "NVDA": 400.0, "SPY": 420.0, "QQQ": 350.0,
        "JPM": 140.0, "V": 220.0, "JNJ": 160.0, "WMT": 140.0, "PG": 145.0,
        "HD": 300.0, "MA": 350.0, "DIS": 90.0, "ADBE": 500.0, "NFLX": 400.0,
        "KO": 60.0, "PEP": 170.0, "INTC": 30.0, "CSCO": 50.0, "VZ": 40.0,
        "T": 18.0, "XOM": 100.0, "CVX": 150.0, "BAC": 35.0, "WFC": 45.0,
        "UNH": 450.0, "PFE": 50.0, "ABT": 110.0, "TMO": 550.0, "LLY": 500.0,
        "IWM": 180.0, "DIA": 340.0, "VTI": 200.0, "VOO": 380.0, "BND": 80.0,
        "RGTI": 5.0, "RGT": 25.0, "GME": 20.0, "AMC": 8.0, "BB": 6.0, "NOK": 4.0
    }
    
    if symbol in symbol_prices:
        current_price = symbol_prices[symbol]
    
    # Add some randomness based on symbol
    random.seed(hash(symbol) % 1000)
    
    for i in range(count):
        # Generate realistic price movement
        volatility = 0.02  # 2% volatility
        
        # Higher volatility for meme stocks
        if symbol in ["GME", "AMC", "BB", "RGTI", "RGT"]:
            volatility = 0.05  # 5% volatility
        elif symbol in ["TSLA", "NVDA"]:
            volatility = 0.03  # 3% volatility
        
        # Price change (-2% to +2% typically)
        price_change_pct = random.uniform(-volatility, volatility)
        price_change = current_price * price_change_pct
        
        # New close price
        new_close = max(0.01, current_price + price_change)  # Don't go below $0.01
        
        # Generate OHLC around the close
        high_extra = random.uniform(0, volatility * 0.5) * new_close
        low_extra = random.uniform(0, volatility * 0.5) * new_close
        
        open_price = current_price  # Previous close becomes current open
        high_price = max(open_price, new_close) + high_extra
        low_price = min(open_price, new_close) - low_extra
        close_price = new_close
        
        # Ensure OHLC relationships are valid
        high_price = max(high_price, open_price, close_price)
        low_price = min(low_price, open_price, close_price)
        
        # Generate realistic volume
        base_volume = 1000000  # 1M shares average
        if symbol in ["AAPL", "MSFT", "TSLA", "SPY", "QQQ"]:
            base_volume = 50000000  # 50M for high-volume stocks
        elif symbol in ["RGTI", "RGT", "BB", "NOK"]:
            base_volume = 100000  # 100K for small caps
        
        volume_multiplier = random.uniform(0.3, 2.0)  # 30% to 200% of average
        volume = int(base_volume * volume_multiplier)
        
        # Create the OHLCV bar
        bar = {
            "ts": current_time + (i * interval * 60),
            "open": round(open_price, 2),
            "high": round(high_price, 2), 
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume
        }
        
        data.append(bar)
        current_price = close_price  # Update for next iteration
    
    return data

def is_mock_enabled() -> bool:
    """Check if mock data should be used (when real providers fail)"""
    import os
    return os.getenv("USE_MOCK_STOCK_DATA", "false").lower() == "true"

# Test the generator
if __name__ == "__main__":
    print("Testing mock stock data generator...")
    
    test_symbols = ["AAPL", "TSLA", "RGTI", "SPY"]
    for symbol in test_symbols:
        data = generate_realistic_ohlcv(symbol, 5, 10)  # 10 bars, 5-minute interval
        print(f"\n{symbol}: Generated {len(data)} bars")
        if data:
            latest = data[-1]
            print(f"  Latest: ${latest['close']:.2f} (Vol: {latest['volume']:,})")