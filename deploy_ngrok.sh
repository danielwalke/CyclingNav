#!/usr/bin/env bash

# ==============================================================================
# 🚲 RadTour Deutschland - Direct Deployment with ngrok
# ==============================================================================
# Usage:
#   ./deploy_ngrok.sh [PORT]
# Example:
#   ./deploy_ngrok.sh 5173
# ==============================================================================

set -e

PORT=${1:-5173}

echo "=========================================================="
echo "🚲 Starting RadTour Deutschland with ngrok Tunnel"
echo "=========================================================="

# 1. Check for ngrok installation
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed or not in PATH."
    echo "Please install ngrok: https://ngrok.com/download"
    echo "Or via: winget install ngrok.ngrok  /  npm install -g ngrok"
    exit 1
fi

# 2. Check for node and npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH."
    exit 1
fi

# 3. Ensure node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# 4. Build optimized production bundle
echo "🔨 Building production assets..."
npm run build

# 5. Start background preview server
echo "🚀 Starting web server on port ${PORT}..."
npm run preview -- --port "${PORT}" --host &
SERVER_PID=$!

# Trap Ctrl+C and exit signals to clean up background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down server and ngrok..."
    kill "$SERVER_PID" 2>/dev/null || true
    killall ngrok 2>/dev/null || true
    echo "✅ Done."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 6. Wait for server to become responsive
echo "⏳ Waiting for server to start on port ${PORT}..."
sleep 2

# 7. Start ngrok in background
echo "🌐 Starting ngrok tunnel on port ${PORT}..."
ngrok http "${PORT}" --log=stdout > /dev/null &
NGROK_PID=$!

# 8. Query local ngrok API for public URL
echo "⏳ Fetching public tunnel URL..."
PUBLIC_URL=""
for i in {1..10}; do
    sleep 1
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*' | head -n 1 || true)
    if [ -n "$PUBLIC_URL" ]; then
        break
    fi
done

echo ""
echo "=========================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "=========================================================="
if [ -n "$PUBLIC_URL" ]; then
    echo "🌍 Public HTTPS URL: ${PUBLIC_URL}"
    echo "📱 Open this link on your smartphone or bike computer!"
else
    echo "⚠️  Could not automatically retrieve tunnel URL from ngrok API."
    echo "👉 Check ngrok Web Interface at: http://127.0.0.1:4040"
fi
echo "🏠 Local URL:        http://localhost:${PORT}"
echo "=========================================================="
echo "Press Ctrl+C to stop the server and close the tunnel."
echo ""

# Keep script running
wait "$SERVER_PID"
