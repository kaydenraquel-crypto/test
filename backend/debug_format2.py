#!/usr/bin/env python3
"""
Debug the specific formatting issue
"""

def test_formatting():
    trading_rec = {
        'entry_price': None,
        'stop_loss': None,
        'take_profit': None
    }
    
    print("Testing safe formatting...")
    try:
        entry_price = f"${trading_rec.get('entry_price'):.2f}" if trading_rec.get('entry_price') else 'N/A'
        print(f"Entry price: {entry_price}")
    except Exception as e:
        print(f"ERROR in entry_price: {e}")
        
    try:
        stop_loss = f"${trading_rec.get('stop_loss'):.2f}" if trading_rec.get('stop_loss') else 'N/A'
        print(f"Stop loss: {stop_loss}")
    except Exception as e:
        print(f"ERROR in stop_loss: {e}")
        
    try:
        take_profit = f"${trading_rec.get('take_profit'):.2f}" if trading_rec.get('take_profit') else 'N/A'
        print(f"Take profit: {take_profit}")
    except Exception as e:
        print(f"ERROR in take_profit: {e}")

if __name__ == "__main__":
    test_formatting()