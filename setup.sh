#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        JobTrackr — Setup & Run           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v) detected"

echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then echo "❌ Backend install failed"; exit 1; fi
echo "✅ Backend ready"

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then echo "❌ Frontend install failed"; exit 1; fi
echo "✅ Frontend ready"

cd ..
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        All done! Run instructions:       ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Terminal 1: cd backend && npm run dev   ║"
echo "║  Terminal 2: cd frontend && npm start    ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Frontend  →  http://localhost:3000      ║"
echo "║  Backend   →  http://localhost:5000      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "⚙️  MongoDB URI can be changed in: backend/.env"
echo ""
