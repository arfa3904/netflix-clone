# Run Netflix Clone and open in Chrome
# Requires Node.js from https://nodejs.org (LTS)

$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\node\node.exe"
)

$nodeExe = $null
foreach ($p in $nodePaths) {
    if (Test-Path $p) { $nodeExe = $p; break }
}

if (-not $nodeExe) {
    Write-Host "Node.js not found. Install from https://nodejs.org (LTS), then run this script again." -ForegroundColor Red
    Start-Process "https://nodejs.org"
    exit 1
}

$nodeDir = Split-Path $nodeExe
$npmCmd = Join-Path $nodeDir "npm.cmd"
$env:Path = "$nodeDir;$env:Path"

$projectRoot = $PSScriptRoot
Set-Location $projectRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    & $npmCmd install
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "Starting dev server and opening Chrome in a few seconds..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; `$env:Path = '$nodeDir;' + `$env:Path; npm run dev"

Start-Sleep -Seconds 6
$url = "http://localhost:5173"
Start-Process "chrome" -ArgumentList $url -ErrorAction SilentlyContinue
if (-not $?) { Start-Process $url }
Write-Host "Chrome should open at $url" -ForegroundColor Green
