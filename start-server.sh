#!/bin/bash
# Multi-Server Setup Script for Quiz Interactive
# This script helps you run the app on a network-accessible server

echo "🚀 Quiz Interactive - Multi-Server Setup"
echo "==========================================="
echo ""

# Get server IP
echo "📍 Finding your server IP address..."

# Try to get the primary non-loopback IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    IP="localhost"
fi

echo "✅ Server IP: $IP"
echo ""
echo "Access the app from other machines at:"
echo "   🌐 http://$IP:5000"
echo ""

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 5000 is already in use. Kill the process? (y/n)"
    read -r -n 1 response
    if [[ "$response" == "y" ]]; then
        lsof -ti:5000 | xargs kill -9
        echo "Process killed"
    else
        echo "⚠️  Please free port 5000 and try again"
        exit 1
    fi
fi

echo ""
echo "Starting server..."
echo "==========================================="
echo ""

# Run the production build
npm run prod
