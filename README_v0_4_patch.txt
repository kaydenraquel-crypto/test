
NovaSignal v0.4 Patch — Heikin-Ashi + ATR Bands
===============================================

WHAT THIS ADDS
- Backend: ATR(14) in indicators response.
- Frontend: Heikin‑Ashi candle toggle, ATR Bands overlay (with multiplier control).
- Keeps v0.3 features: safe mapping, N-candle wait, signal markers + toggles, multi-pane RSI/MACD, overlays.

HOW TO APPLY
1) Unzip this archive into your project root:
   C:\Users\iseel\Documents\NovaSignal_v0_2\
   Allow files to overwrite.

2) Backend (restart with deps):
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\backend
   .\.venv\Scripts\python.exe -m pip install --upgrade pip
   .\.venv\Scripts\python.exe -m pip install ta
   .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

3) Frontend:
   cd C:\Users\iseel\Documents\NovaSignal_v0_2\frontend
   npm run dev

NOTES
- ATR bands derive from displayed candles (standard or Heikin‑Ashi).
- For best results, let a few candles stream in before toggling overlays.
