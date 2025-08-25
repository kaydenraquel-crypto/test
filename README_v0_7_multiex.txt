
NovaSignal v0.7 — Multi-Exchange Crypto + Polygon autodetect
============================================================

What's new
- Crypto providers: **auto**, **Kraken**, **Binance**, **Coinbase (keys)**, **Polygon (key)**.
- Auto mode prefers: Polygon (if POLYGON_API_KEY) → Binance → Kraken.
- WebSocket streaming:
  * Kraken (default), **Binance** option added.
  * Coinbase WS is not included in this patch (REST requires auth); we use Coinbase REST for history if COINBASE_API_KEY is set.
- Indicators/predictions fetch crypto OHLC via the selected provider (router with fallbacks).

Install
1) Unzip into your project root:
   C:\Users\iseel\Documents\NovaSignal_v0_2\
   Allow overwrite.

2) Backend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\backend
   .\.venv\Scripts\python.exe -m pip install --upgrade pip
   .\.venv\Scripts\python.exe -m pip install httpx websockets
   .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

3) Frontend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\frontend
   npm run dev

Env keys (optional, for auto/provider)
- POLYGON_API_KEY=...
- COINBASE_API_KEY=...
- (Later if we add Coinbase WS: you'll also need secret/signing)
- ALPACA_API_KEY / ALPACA_API_SECRET (stocks WS, separate patch already supports)

Usage
- In the UI, pick Crypto → Provider: **Auto / Kraken / Binance / Coinbase / Polygon**.
- For Polygon/Coinbase, if the key is missing or a request fails, backend will gracefully fall back (auto path).

Notes
- Coinbase "Advanced Trade" API enforces auth even for candles; REST fetch in this patch uses COINBASE_API_KEY header only.
- If you need robust Coinbase, we can add the full HMAC signing (CB-ACCESS-SIGN, CB-ACCESS-TIMESTAMP) next.
- Polygon is used for **history/indicators**; WS streaming remains Kraken/Binance for now.
