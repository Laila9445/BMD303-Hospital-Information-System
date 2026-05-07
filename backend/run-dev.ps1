# Simple run script for course project development
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Clinic System - Development Mode" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (!(Test-Path "CLINICSYSTEM.csproj")) {
    Write-Host "ERROR: run from backend directory where CLINICSYSTEM.csproj is located" -ForegroundColor Red
    exit 1
}

# Clean old DB files
Remove-Item "*.db" -Force -ErrorAction SilentlyContinue 2>$null

# Build
Write-Host "Building project..." -ForegroundColor Yellow
dotnet build CLINICSYSTEM.csproj -c Debug --nologo -q

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Run
Write-Host ""
Write-Host "Starting API server..." -ForegroundColor Green
Write-Host "http://localhost:5000" -ForegroundColor Cyan
Write-Host "http://localhost:5000/swagger - Swagger UI" -ForegroundColor Cyan
Write-Host ""

$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://localhost:5000"

dotnet run -c Debug --project CLINICSYSTEM.csproj --no-build --no-launch-profile

