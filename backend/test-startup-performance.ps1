#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Backend Startup Performance Testing Script
.DESCRIPTION
    Measures and monitors the startup time of the Clinic Backend API
.EXAMPLE
    .\test-startup-performance.ps1
#>

$projectPath = "C:\Users\Best By\OneDrive - Nile University\Desktop\Software Engineering\Clinic(hospital sys)\Clinic(hospital sys)"
$projectFile = "$projectPath\backend\CLINICSYSTEM.csproj"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Backend Startup Performance Tester" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if project file exists
if (-not (Test-Path $projectFile)) {
    Write-Host "ERROR: Project file not found at: $projectFile" -ForegroundColor Red
    exit 1
}

Write-Host "Project Path: $projectPath" -ForegroundColor Yellow
Write-Host "Project File: $projectFile" -ForegroundColor Yellow
Write-Host ""

# Test 1: Build Time
Write-Host "TEST 1: Measuring Build Time..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
$buildStart = Get-Date
& dotnet build $projectFile --configuration Release --no-restore 2>&1 | tail -5
$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalSeconds
Write-Host ""
Write-Host "Build Time: $([Math]::Round($buildTime, 2)) seconds" -ForegroundColor Yellow
Write-Host ""

# Test 2: Startup Time
Write-Host "TEST 2: Measuring Startup Time (20 seconds max)..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Note: Server will be stopped after startup measurement" -ForegroundColor Yellow
Write-Host ""

$startupStart = Get-Date

# Run app with timeout
$processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
$processStartInfo.FileName = "dotnet"
$processStartInfo.Arguments = "run --project $projectFile"
$processStartInfo.WorkingDirectory = $projectPath
$processStartInfo.UseShellExecute = $false
$processStartInfo.RedirectStandardOutput = $true
$processStartInfo.RedirectStandardError = $true
$processStartInfo.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($processStartInfo)

# Monitor output for "ready" indicators
$readyPatterns = @(
    "Now listening on",
    "Application started",
    "ready to accept"
)

$readyDetected = $false
$timeout = 30  # seconds

$startMonitor = Get-Date
$outputLines = @()

while (($readyDetected -eq $false) -and ((Get-Date) - $startMonitor).TotalSeconds -lt $timeout) {
    if (-not $process.HasExited) {
        $line = $process.StandardOutput.ReadLine()
        if ($null -ne $line) {
            $outputLines += $line
            
            foreach ($pattern in $readyPatterns) {
                if ($line -match $pattern) {
                    $readyDetected = $true
                    break
                }
            }
            
            # Show output in real-time
            Write-Host $line -ForegroundColor Cyan
        }
    }
    else {
        break
    }
}

$startupEnd = Get-Date
$startupTime = ($startupEnd - $startupStart).TotalSeconds

# Kill the process
if (-not $process.HasExited) {
    $process.Kill()
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Server stopped (measurement complete)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "STARTUP TIME: $([Math]::Round($startupTime, 2)) seconds" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Display results
Write-Host "PERFORMANCE SUMMARY" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build Time ......... $([Math]::Round($buildTime, 2))s" -ForegroundColor Yellow
Write-Host "Startup Time ....... $([Math]::Round($startupTime, 2))s" -ForegroundColor Yellow
Write-Host ""

# Performance evaluation
if ($startupTime -le 5) {
    Write-Host "? EXCELLENT - Startup is very fast!" -ForegroundColor Green
    Write-Host "   (Target: < 5 seconds achieved)" -ForegroundColor Green
}
elseif ($startupTime -le 10) {
    Write-Host "? GOOD - Startup is acceptable" -ForegroundColor Green
    Write-Host "   (Target: < 10 seconds achieved)" -ForegroundColor Green
}
elseif ($startupTime -le 15) {
    Write-Host "??  FAIR - Startup could be faster" -ForegroundColor Yellow
    Write-Host "   (Current: ~$([Math]::Round($startupTime, 2))s, Target: < 10s)" -ForegroundColor Yellow
}
else {
    Write-Host "? SLOW - Startup performance needs investigation" -ForegroundColor Red
    Write-Host "   (Current: ~$([Math]::Round($startupTime, 2))s, Target: < 5-10s)" -ForegroundColor Red
}

Write-Host ""
Write-Host "RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

if ($startupTime -gt 10) {
    Write-Host "1. Check if SQL Server is running:" -ForegroundColor Yellow
    Write-Host "   - Open SQL Server Management Studio" -ForegroundColor Gray
    Write-Host "   - Ensure 'DESKTOP-UERNKOD' server is online" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Check database connection:" -ForegroundColor Yellow
    Write-Host "   - Connection string in appsettings.Development.json" -ForegroundColor Gray
    Write-Host "   - Verify database 'ClinicSystemDb_Dev' exists" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. Check logging configuration:" -ForegroundColor Yellow
    Write-Host "   - Ensure 'Default' log level is 'Error' (not 'Information')" -ForegroundColor Gray
    Write-Host "   - Location: appsettings.Development.json" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "4. For detailed diagnostics:" -ForegroundColor Yellow
Write-Host "   - Run: dotnet run --project backend/CLINICSYSTEM.csproj --verbosity diagnostic" -ForegroundColor Gray
Write-Host ""

Write-Host "5. To view detailed logs:" -ForegroundColor Yellow
Write-Host "   - Check 'logs/clinic-api-*.txt' files" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
