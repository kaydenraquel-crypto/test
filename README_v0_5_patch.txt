
NovaSignal v0.5 Patch — History Preload (1D/1W/1M/3M) + Prediction Lookback by Days
====================================================================================

WHAT'S NEW
- Backend:
  - New endpoint: GET /api/history?symbol=&market=&interval=&days=
  - Kraken REST range fetch with pagination (crypto).
  - yfinance history fetch (stocks).
  - Predict endpoint accepts optional lookback_days to feed longer windows to the model.

- Frontend:
  - History selector (1D, 1W, 1M, 3M).
  - Preloads historical candles into the chart, then seamlessly merges live WebSocket updates.
  - Indicators and predictions use the same window to stay aligned.

HOW TO APPLY
1) Unzip into your project root:
   C:\Users\iseel\Documents\NovaSignal_v0_2\
   (Allow overwrite.)

2) Restart backend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\backend
   .\.venv\Scripts\python.exe -m pip install --upgrade pip
   .\.venv\Scripts\python.exe -m pip install yfinance httpx
   .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

3) Frontend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\frontend
   npm run dev

NOTES
- Very small intervals (like 1m) for 1M window can be heavy; 5m or 15m is a good sweet spot.
- Alpaca live streaming still works; history for stocks uses yfinance (delayed). We can add Polygon/IEX next.
- If you changed your backend URL, set VITE_BACKEND_URL in the frontend environment.
