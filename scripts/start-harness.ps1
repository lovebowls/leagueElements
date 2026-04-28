$repoRoot = Split-Path -Parent $PSScriptRoot

$watchCommand = "Set-Location '$repoRoot'; npm run dev"
$serverCommand = "Set-Location '$repoRoot'; npx http-server . -p 8080 -c-1"

Start-Process powershell -ArgumentList '-NoExit', '-Command', $watchCommand
Start-Process powershell -ArgumentList '-NoExit', '-Command', $serverCommand

Write-Host 'Harness started.'
Write-Host 'Build watcher: npm run dev'
Write-Host 'Static server: http://localhost:8080'
Write-Host 'Open: http://localhost:8080/src/elements/leagueAdminElement/test-league-admin-element.html'
