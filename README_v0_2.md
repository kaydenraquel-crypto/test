# NovaSignal v0.2

## New in v0.2
- **One‑click Windows installer** (`install.ps1`) — installs Python & Node with winget, sets up everything.
- **On‑chart buy/sell markers** for strategy signals.
- **Multi‑pane charts**: RSI and MACD get their own panels with toggles.
- **Overlay toggles**: SMA, EMA, Bollinger Bands.

## TL;DR (Windows)
1. Unzip this folder to **C:\Users\YOURNAME\Documents\NovaSignal_v0_2** (you said you'll use Documents).
2. Right‑click **install.ps1** → *Run with PowerShell* (allow execution for this file if prompted).
3. Double‑click **run_all.bat** (or use the `.ps1` equivalents).

Backend → http://127.0.0.1:8000  
Frontend → http://127.0.0.1:5173

> If you use a different path, scripts still work (they run relatively).

## Keys (optional but recommended)
Copy `.env.example` → `.env` and fill in: `ALPACA_*`, `NEWSAPI_KEY`, `FINNHUB_KEY`, and LLM config for Grok.
