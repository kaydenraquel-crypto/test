# test_imports.py
# Run this in your backend directory to see which import fails

print("Testing imports...")

try:
    from openai import OpenAI
    print("[OK] openai import successful")
except Exception as e:
    print(f"[FAIL] openai import failed: {e}")

try:
    from connectors.crypto_kraken import kraken_ohlc_stream
    print("[OK] crypto_kraken import successful")
except Exception as e:
    print(f"[FAIL] crypto_kraken import failed: {e}")

try:
    from connectors.crypto_kraken_rest import fetch_recent_ohlc_kraken
    print("[OK] crypto_kraken_rest import successful")
except Exception as e:
    print(f"[FAIL] crypto_kraken_rest import failed: {e}")

try:
    from connectors.stocks_yfinance import fetch_recent_ohlc
    print("[OK] stocks_yfinance import successful")
except Exception as e:
    print(f"[FAIL] stocks_yfinance import failed: {e}")

try:
    from connectors.stocks_alpaca import alpaca_stream_available, stream_alpaca_bars
    print("[OK] stocks_alpaca import successful")
except Exception as e:
    print(f"[FAIL] stocks_alpaca import failed: {e}")

try:
    from connectors.crypto_router import fetch_history_crypto
    print("[OK] crypto_router import successful")
except Exception as e:
    print(f"[FAIL] crypto_router import failed: {e}")

try:
    from signals.indicators import compute_indicators
    print("[OK] signals.indicators import successful")
except Exception as e:
    print(f"[FAIL] signals.indicators import failed: {e}")

try:
    from signals.strategies import combined_signals
    print("[OK] signals.strategies import successful")
except Exception as e:
    print(f"[FAIL] signals.strategies import failed: {e}")

try:
    from news.news_api import get_news_for_symbol
    print("[OK] news.news_api import successful")
except Exception as e:
    print(f"[FAIL] news.news_api import failed: {e}")

print("Import test complete!")