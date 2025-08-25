# NovaSignal Backend (FastAPI)

## Features (MVP)
- Crypto real-time OHLC via Kraken WebSocket (no API key needed)
- Optional stocks support via Alpaca Market Data (if keys provided); fallback to delayed polling via yfinance
- Indicator and strategy endpoints (SMA/EMA/RSI/MACD + simple crossover strategy)
- Simple PyTorch LSTM forecaster for multi-horizon predictions (baseline)
- News aggregation stub (NewsAPI / Finnhub if keys present)
- LLM analysis stub with pluggable providers (Grok or others via env)

## Run (dev)
```bash
# from backend/
python -m venv .venv
. .venv/Scripts/activate  # Windows
# or: source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# set env (see ../.env.example)
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Environment
- `ALPACA_API_KEY`, `ALPACA_API_SECRET` (optional, for real-time US stocks)
- `NEWSAPI_KEY` (optional)
- `FINNHUB_KEY` (optional)
- `LLM_PROVIDER` (e.g., `xai`, `openai`, `generic`), `LLM_API_KEY`, `LLM_API_BASE`, `LLM_MODEL`
