
NovaSignal v0.6 — Data Source Toggle (Kraken / yfinance / Alpaca)
=================================================================

WHAT'S NEW
- Frontend: Data source selector per market.
  * Crypto: "Kraken" (default).
  * Stocks: "Auto" (default), "yfinance" (polling), "Alpaca" (live if keys present).
- Backend: WebSocket /ws/stocks/ohlc now accepts ?provider=auto|yfinance|alpaca.
  * "alpaca" streams live bars when ALPACA keys are configured; otherwise it falls back to yfinance polling.
- Indicators/Predictions endpoints accept a "provider" field but currently use yfinance for stock history (most robust).

HOW TO APPLY
1) Unzip this patch into your project folder:
   C:\Users\iseel\Documents\NovaSignal_v0_2\
   Allow file overwrites.

2) Restart backend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\backend
   .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

3) Restart frontend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\frontend
   npm run dev

NOTES
- When you add ALPACA_API_KEY/ALPACA_API_SECRET in backend/.env, switch Stocks provider to "Alpaca" to get live intraday WS.
- We can add Polygon/IEX support similarly if you'd like.
