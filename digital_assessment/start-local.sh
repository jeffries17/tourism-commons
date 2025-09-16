#!/bin/bash

# Tourism Commons Digital Assessment - Start Local Development
echo "🚀 Starting local development environment..."

# Check if we're in the right directory
if [ ! -f "digital_assessment/app/api/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f "digital_assessment/app/api/.env" ]; then
    echo "❌ Environment file not found. Please run ./setup-local.sh first"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down services..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🔥 Starting Firebase emulators..."
cd digital_assessment/functions
firebase emulators:start --only functions,hosting &
FIREBASE_PID=$!
cd ../../

# Wait a moment for Firebase to start
sleep 5

echo "🌐 Starting API server..."
cd digital_assessment/app/api
npm run dev &
API_PID=$!
cd ../../

# Wait a moment for API to start
sleep 3

echo "💻 Starting web application..."
cd digital_assessment/app/web
npm run dev &
WEB_PID=$!
cd ../../

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Services available at:"
echo "- Web App: http://localhost:5173"
echo "- API Server: http://localhost:8787"
echo "- Firebase Functions: http://localhost:5009"
echo "- Firebase Emulator UI: http://localhost:4003"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait

