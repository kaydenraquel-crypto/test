#!/usr/bin/env python3
"""
Debug script to test indicators and find infinite values
"""
import asyncio
import json
from connectors.crypto_router import fetch_history_crypto
from signals.indicators import compute_indicators
from signals.strategies import combined_signals

async def debug_indicators():
    print("Fetching BTC/USD data...")
    
    # Get some data
    data = await fetch_history_crypto("BTC/USD", 5, 1, "auto")
    print(f"Got {len(data)} data points")
    
    if not data:
        print("No data available")
        return
    
    # Test indicators
    print("Computing indicators...")
    try:
        indicators = compute_indicators(data[:100])  # Use smaller dataset
        print("Indicators computed successfully")
        
        # Try to serialize to JSON to find the problematic value
        json_str = json.dumps(indicators)
        print("JSON serialization successful")
        
    except Exception as e:
        print(f"Error in indicators: {e}")
        
        # Check for inf values in indicators
        def find_inf_values(obj, path=""):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    find_inf_values(v, f"{path}.{k}")
            elif isinstance(obj, list):
                for i, v in enumerate(obj):
                    find_inf_values(v, f"{path}[{i}]")
            elif isinstance(obj, float):
                if obj == float('inf') or obj == float('-inf'):
                    print(f"Found inf value at: {path} = {obj}")
                elif obj != obj:  # NaN check
                    print(f"Found NaN value at: {path} = {obj}")
        
        try:
            find_inf_values(indicators)
        except Exception as e2:
            print(f"Error analyzing indicators: {e2}")
    
    # Test signals
    print("Computing signals...")
    try:
        signals = combined_signals(data[:100], indicators)
        print("Signals computed successfully")
        
        # Try to serialize signals
        json_str = json.dumps(signals)
        print("Signals JSON serialization successful")
        
    except Exception as e:
        print(f"Error in signals: {e}")

if __name__ == "__main__":
    asyncio.run(debug_indicators())