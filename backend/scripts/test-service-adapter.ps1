# Test Service Adapter Implementation
# Windows PowerShell script

# Set up the environment
Write-Host "Setting up test environment..." -ForegroundColor Cyan
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
Set-Location ..

# Compile TypeScript files
Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
npx tsc

# Run the test script
Write-Host "Running service type tests..." -ForegroundColor Cyan
node ./dist/scripts/testServiceTypes.js

# Exit with the same status as the test script
exit $LASTEXITCODE
