# 🚀 Manual Startup Guide for NovaSignal

If the startup scripts aren't working, follow these manual steps:

## 📋 Prerequisites Check

First, make sure you have the required software installed:

```bash
# Check Python (should show Python 3.8+)
python --version

# Check Node.js (should show v16+)
node --version

# Check npm
npm --version
```

## 🔧 Step 1: Install Dependencies

### Frontend Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Backend Dependencies
```bash
# Navigate to backend directory (from project root)
cd backend

# Install dependencies
pip install -r requirements.txt
```

## 🚀 Step 2: Start the Servers

### Terminal 1: Backend Server
```bash
# Make sure you're in the backend directory
cd backend

# Start FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Terminal 2: Frontend Server
```bash
# Make sure you're in the frontend directory
cd frontend

# Start Vite development server
npm run dev
```

**Expected output:**
```
  VITE v7.1.3  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## 🌐 Step 3: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## 🔍 Troubleshooting

### If Backend Won't Start:
- Check if port 8000 is already in use
- Make sure you're in the `backend` directory
- Check if Python dependencies are installed

### If Frontend Won't Start:
- Check if port 5173 is already in use
- Make sure you're in the `frontend` directory
- Check if Node.js dependencies are installed

### If You See "SHORTCUT_KEYS is not defined":
- The conflicting JavaScript files have been removed
- Make sure you're running from the `frontend` directory
- Try clearing browser cache and refreshing

## 📁 Directory Structure
```
NovaSignal_v0_2/
├── frontend/          # React/TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── npm run dev
├── backend/           # Python/FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── python -m uvicorn main:app --reload
└── start-novasignal-debug.bat  # Windows startup script
```

## 💡 Pro Tips

1. **Keep both terminals open** - closing them stops the servers
2. **Check the URLs** - make sure both servers are running
3. **Look for error messages** - they'll tell you what's wrong
4. **Start backend first** - frontend needs the API to work

---

**Need help?** Check the terminal output for specific error messages!
