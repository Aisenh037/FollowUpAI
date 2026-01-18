# Quick Start WITHOUT Docker - For FollowUpAI

Write-Host "🚀 FollowUpAI - Quick Start (No Docker)" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Setup Backend
Write-Host "1. Setting up backend..." -ForegroundColor Yellow
Set-Location backend

# Create virtual environment if doesn't exist
if (-not (Test-Path venv)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate and install
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

Write-Host "✅ Backend setup complete`n" -ForegroundColor Green

# Go back to root
Set-Location ..

# Setup Frontend
Write-Host "2. Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

# Install dependencies
if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Frontend setup complete`n" -ForegroundColor Green

Set-Location ..

Write-Host "`n====================================`n" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`nNOTE: Using SQLite database (no Docker needed!)`n" -ForegroundColor Yellow
Write-Host "To start the application:`n" -ForegroundColor White
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python -m uvicorn main:app --reload`n" -ForegroundColor White

Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev`n" -ForegroundColor White

Write-Host "Then open: http://localhost:3000`n" -ForegroundColor Cyan
