#!/bin/bash

echo "========================================"
echo "🚀 Starting NovaSignal Trading Platform"
echo "========================================"

echo ""
echo "📋 Starting backend server (FastAPI)..."
cd backend
gnome-terminal --title="NovaSignal Backend" -- bash -c "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000; exec bash" &

echo ""
echo "⏱️  Waiting 3 seconds for backend to start..."
sleep 3

echo ""
echo "🌐 Starting frontend development server (Vite)..."
cd ../frontend
gnome-terminal --title="NovaSignal Frontend" -- bash -c "npm run dev; exec bash" &

echo ""
echo "✅ NovaSignal is starting up!"
echo ""
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:8000"
echo "📖 API docs available at: http://localhost:8000/docs"
echo ""
echo "💡 Both servers are running in separate terminal windows"
echo "   Close those windows to stop the servers"

