# 🚀 NovaSignal Quick Start Guide

## Prerequisites

Make sure you have installed:
- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **npm** or **yarn** (for frontend dependencies)

## Quick Start Scripts

Choose the script for your operating system:

### Windows (.bat file)
```bash
# Double-click or run in Command Prompt
start-novasignal.bat
```

### Windows (PowerShell)
```powershell
# Run in PowerShell
.\start-novasignal.ps1
```

### Linux/macOS (.sh file)
```bash
# Run in terminal
./start-novasignal.sh
```

## Manual Setup (if scripts don't work)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start the Servers

**Backend (Terminal 1):**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

## Access the Application

- **🌐 Frontend:** http://localhost:5173
- **🔧 Backend API:** http://localhost:8000  
- **📖 API Documentation:** http://localhost:8000/docs

## Features Available

✅ **Real-time Trading Charts** (Lightweight Charts)  
✅ **Technical Indicators** (RSI, MACD, SMA, EMA, Bollinger Bands)  
✅ **Alpha Vantage Data Integration**  
✅ **AI Financial Analysis** (GPT-powered)  
✅ **Market Scanner & News Feed**  
✅ **Portfolio Management**  
✅ **Advanced Analytics Dashboard**  
✅ **Symbol Search & Watchlist**  

## Troubleshooting

- If backend fails to start, check if Python dependencies are installed
- If frontend fails to start, run `npm install` in the frontend directory
- Make sure ports 5173 and 8000 are not being used by other applications
- For API rate limits, the app includes demo mode with mock data

## Environment Variables (Optional)

Create `.env` files for API keys:

**Backend (.env):**
```
ALPHA_VANTAGE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_ALPHA_VANTAGE_KEY=your_key_here
```

---

**Happy Trading! 📈💹**

