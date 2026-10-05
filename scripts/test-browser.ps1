$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
& "$root/.tools/php/php.exe" "$root/backend/artisan" migrate --env=e2e --force
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& "$root/.tools/php/php.exe" "$root/backend/artisan" db:seed --env=e2e --class=BrowserTestSeeder --force
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& "$root/.tools/php/php.exe" "$PSScriptRoot/import-default-menus.php" --test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& "$root/.tools/php/php.exe" "$root/backend/artisan" cache:clear --env=e2e
& "$PSScriptRoot/start.ps1" -Test
Push-Location "$root/frontend"
try { & npm.cmd run test:e2e; exit $LASTEXITCODE } finally { Pop-Location }
