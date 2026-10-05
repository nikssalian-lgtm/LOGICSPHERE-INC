$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$credentials = Get-Content "$root/.local/database.json" -Raw | ConvertFrom-Json
$env:DB_CONNECTION = 'mysql'
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '3307'
$env:DB_DATABASE = 'logicsphere_test'
$env:DB_USERNAME = 'logicsphere_test_app'
$env:DB_PASSWORD = $credentials.test
$env:APP_ENV = 'testing'
Push-Location "$root/backend"
try { & "$root/.tools/php/php.exe" artisan test; exit $LASTEXITCODE } finally { Pop-Location }
