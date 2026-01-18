# Quick Start Script for FollowUpAI

Write-Host "🚀 FollowUpAI - Quick Start" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "1. Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database started successfully`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start database. Make sure Docker is running.`n" -ForegroundColor Red
    exit 1
}

# Setup Backend
Write-Host "2. Setting up backend..." -ForegroundColor Yellow
Set-Location backend

# Create .env if doesn't exist
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env file. Please edit it with your API keys." -ForegroundColor Yellow
    Write-Host "Press any key to continue after editing .env..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Create virtual environment if doesn't exist
if (-not (Test-Path venv)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate and install
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt -q

Write-Host "✅ Backend setup complete`n" -ForegroundColor Green

# Go back to root
Set-Location ..

# Setup Frontend
Write-Host "3. Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

# Create .env.local if doesn't exist
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
}

# Install dependencies
if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Frontend setup complete`n" -ForegroundColor Green

Set-Location ..

Write-Host "`n====================================`n" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`nTo start the application:`n" -ForegroundColor White
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python -m uvicorn main:app --reload`n" -ForegroundColor White

Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev`n" -ForegroundColor White

Write-Host "Then open: http://localhost:3000`n" -ForegroundColor Cyan
