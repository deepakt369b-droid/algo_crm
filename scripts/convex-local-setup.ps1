#!/usr/bin/env pwsh
# Script to setup Convex local backend

Write-Host "Setting up Convex Local Backend..."

# 1. Start Convex Docker container
Write-Host "Starting Docker containers..."
docker compose up convex -d

# 2. Wait for Convex to be ready
Write-Host "Waiting for Convex to be ready on http://localhost:3211/version..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3211/version" -ErrorAction Stop
        $ready = $true
        break
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Error "Convex failed to start within the expected time."
    exit 1
}

Write-Host "Convex is ready!"

# 3. Push schema
Write-Host "Pushing schema to Convex local backend..."
$env:CONVEX_DEPLOYMENT="local"
$env:NEXT_PUBLIC_CONVEX_URL="http://localhost:3211"
npx convex dev --once

Write-Host "Convex setup complete! Dashboard available at http://localhost:3210"
