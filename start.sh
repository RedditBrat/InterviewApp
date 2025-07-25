#!/bin/bash

echo "🚀 Starting Interview Assistant Pro..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing main dependencies..."
    npm install
fi

if [ ! -d "src/renderer/node_modules" ]; then
    echo "📦 Installing React dependencies..."
    cd src/renderer && npm install && cd ../..
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🎯 Starting application in development mode..."
echo "   - Main app will start in Electron"
echo "   - React dev server will start on http://localhost:3000"
echo "   - The app includes demo mode for testing"
echo ""
echo "💡 Tips:"
echo "   - Configure your OpenRouter API key in Settings"
echo "   - Use Test Mode to try example questions"
echo "   - Check the DEPLOYMENT_GUIDE.md for full instructions"
echo ""

# Start the application
npm run dev