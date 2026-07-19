$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPort = 8003
$frontendPort = 5001
$startedBackend = $false
$startedFrontend = $false
$exitCode = 1

function Test-PortListening([int]$port) {
  return $null -ne (
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -First 1
  )
}

function Wait-ForPort([int]$port, [string]$service) {
  foreach ($attempt in 1..60) {
    if (Test-PortListening $port) {
      return
    }
    Start-Sleep -Milliseconds 500
  }
  throw "$service did not start on port $port within 30 seconds."
}

function Stop-Listener([int]$port, [string]$service) {
  $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($listener) {
    Stop-Process -Id $listener.OwningProcess -Force
    Write-Host "Stopped $service."
  }
}

function Import-E2EEnvironment {
  $environmentFile = Join-Path $projectRoot 'backend/.env.e2e'
  if (-not (Test-Path $environmentFile)) {
    throw 'Missing backend/.env.e2e. Copy backend/.env.e2e.example first.'
  }

  Get-Content $environmentFile | ForEach-Object {
    if ($_ -and -not $_.StartsWith('#')) {
      $name, $value = $_ -split '=', 2
      [Environment]::SetEnvironmentVariable(
        $name.Trim(), $value.Trim(), 'Process'
      )
    }
  }
}

try {
  Push-Location $projectRoot
  & docker compose -f docker-compose-db.yml up -d db db_test
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to start the E2E database services.'
  }

  & just e2e-reset
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to reset and seed the E2E database.'
  }

  Import-E2EEnvironment

  if (-not (Test-PortListening $backendPort)) {
    Start-Process -FilePath 'powershell.exe' `
      -ArgumentList @(
        '-NoLogo',
        '-NoProfile',
        '-Command',
        'poetry run python manage.py runserver 0.0.0.0:8003'
      ) `
      -WorkingDirectory (Join-Path $projectRoot 'backend') `
      -WindowStyle Hidden
    $startedBackend = $true
    Wait-ForPort $backendPort 'E2E backend'
  }

  if (-not (Test-PortListening $frontendPort)) {
    Start-Process -FilePath 'powershell.exe' `
      -ArgumentList @(
        '-NoLogo',
        '-NoProfile',
        '-Command',
        (
          '$env:BASE_URL = ''http://localhost:{0}''; bunx next dev -p {1} -H 0.0.0.0' -f
            $backendPort, $frontendPort
        )
      ) `
      -WorkingDirectory (Join-Path $projectRoot 'frontend') `
      -WindowStyle Hidden
    $startedFrontend = $true
    Wait-ForPort $frontendPort 'E2E frontend'
  }

  & just e2e-cypress
  $exitCode = $LASTEXITCODE
}
catch {
  Write-Error $_
}
finally {
  if ($startedFrontend) {
    Stop-Listener $frontendPort 'E2E frontend'
  }
  if ($startedBackend) {
    Stop-Listener $backendPort 'E2E backend'
  }
  Pop-Location
}

exit $exitCode
