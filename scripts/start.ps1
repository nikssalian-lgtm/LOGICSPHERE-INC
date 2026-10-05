param([switch]$Test, [int]$Port = 0)
$ErrorActionPreference = 'Stop'
# Codex-managed Windows environments can expose duplicate Path/PATH keys; remove the duplicate before spawning children.
$launchPath = $env:PATH
[Environment]::SetEnvironmentVariable('PATH', $null, 'Process')
[Environment]::SetEnvironmentVariable('Path', $launchPath, 'Process')
$root = Split-Path $PSScriptRoot -Parent
$local = Join-Path $root '.local'
New-Item -ItemType Directory -Force $local | Out-Null
$php = Join-Path $root '.tools/php/php.exe'
if (!(Test-Path $php)) { $php = (Get-Command php -ErrorAction Stop).Source }
$mysql = Join-Path $root '.tools/mysql/mysql-8.4.11-winx64/bin/mysqld.exe'
if (Test-Path $mysql) {
    $mysqlPidFile = Join-Path $local 'mysql.pid'
    $running = $false
    if (Test-Path $mysqlPidFile) {
        $existing = Get-Process -Id ([int](Get-Content $mysqlPidFile)) -ErrorAction SilentlyContinue
        $running = $existing -and $existing.Path -eq $mysql
    }
    if (!$running) {
        $baseDir = (Split-Path (Split-Path $mysql)).Replace('\','/')
        $dataDir = (Join-Path $local 'mysql-data').Replace('\','/')
        $process = Start-Process $mysql -ArgumentList '--no-defaults',"--basedir=$baseDir","--datadir=$dataDir",'--bind-address=127.0.0.1','--port=3307','--mysqlx=OFF','--console' -WindowStyle Hidden -PassThru -RedirectStandardOutput "$local/mysql.stdout.log" -RedirectStandardError "$local/mysql.stderr.log"
        $process.Id | Set-Content $mysqlPidFile
    }
}
$suffix = if ($Test) { 'e2e' } else { 'dev' }
$apiPort = if ($Test) { 8001 } else { 8000 }
$webPort = if ($Test) { 3001 } else { 3000 }
if ($Port -ne 0) { $webPort = $Port }
$environment = if ($Test) { '--env=e2e' } else { '--env=local' }
function Start-TrackedProcess($name, $file, $arguments, $directory) {
    $pidFile = Join-Path $local "$name.pid"
    if (Test-Path $pidFile) {
        $existing = Get-Process -Id ([int](Get-Content $pidFile)) -ErrorAction SilentlyContinue
        if ($existing -and $existing.Path -eq $file) { Write-Output "$name is already running."; return }
    }
    $process = Start-Process -FilePath $file -ArgumentList $arguments -WorkingDirectory $directory -WindowStyle Hidden -PassThru -RedirectStandardOutput "$local/$name.stdout.log" -RedirectStandardError "$local/$name.stderr.log"
    $process.Id | Set-Content $pidFile
}
Start-TrackedProcess "api-$suffix" $php @('artisan','serve','--host=127.0.0.1',"--port=$apiPort",$environment) "$root/backend"
Start-TrackedProcess "queue-$suffix" $php @('artisan','queue:work','--sleep=1','--tries=3', $environment) "$root/backend"
$env:API_INTERNAL_URL = "http://127.0.0.1:$apiPort"
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:NEXT_DIST_DIR = if ($Test) { '.next-e2e' } else { '.next' }
$next = Join-Path $root 'frontend/node_modules/next/dist/bin/next'
$mode = if ($Test) { 'dev' } else { 'start' }
Start-TrackedProcess "web-$suffix" (Get-Command node).Source @($next,$mode,'--hostname','127.0.0.1','--port',"$webPort") "$root/frontend"
Write-Output "Website: http://127.0.0.1:$webPort | Admin: http://127.0.0.1:$webPort/admin"
