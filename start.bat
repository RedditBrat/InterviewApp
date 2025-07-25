@echo off
echo 🚀 Starting Interview Assistant Pro on Windows...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

REM Check if main dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing main dependencies...
    npm install
)

REM Check if React dependencies are installed
if not exist "src\renderer\node_modules" (
    echo 📦 Installing React dependencies...
    cd src\renderer
    npm install
    cd ..\..
)

echo.
echo ✅ Dependencies installed!
echo.
echo 🎯 Starting application in development mode...
echo    - Main app will start in Electron
echo    - React dev server will start on http://localhost:3000
echo    - The app includes demo mode for testing
echo.
echo 💡 Tips:
echo    - Configure your OpenRouter API key in Settings
echo    - Use Test Mode to try example questions
echo    - Check the DEPLOYMENT_GUIDE.md for full instructions
echo.

REM Start the application
npm run dev