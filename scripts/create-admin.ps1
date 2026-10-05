$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$php = Join-Path $root '.tools/php/php.exe'
if (!(Test-Path $php)) { $php = (Get-Command php -ErrorAction Stop).Source }
& $php "$root/backend/artisan" app:create-admin
exit $LASTEXITCODE
