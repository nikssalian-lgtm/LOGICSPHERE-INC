param([switch]$Test, [switch]$Database)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$suffix = if ($Test) { 'e2e' } else { 'dev' }
$names = @("web-$suffix", "queue-$suffix", "api-$suffix")
if ($Database) { $names += 'mysql' }
foreach ($name in $names) {
    $pidFile = Join-Path $root ".local/$name.pid"
    if (!(Test-Path $pidFile)) { continue }
    $processId = [int](Get-Content $pidFile)
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$processId"
    if (!$process) { continue }
    if (!$process.CommandLine.Contains($root) -and !$process.ExecutablePath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to stop $name because the process no longer belongs to this project."
    }
    if ($name -eq 'mysql') {
        & "$root/.tools/php/php.exe" "$PSScriptRoot/shutdown-db.php"
        if ($LASTEXITCODE -ne 0) { throw 'Database shutdown failed; the database was not forcibly stopped.' }
        continue
    }
    $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$processId")
    Stop-Process -Id $processId -ErrorAction SilentlyContinue
    foreach ($child in $children) {
        if ($child.ExecutablePath -and ($child.ExecutablePath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or $child.CommandLine.Contains($root))) {
            Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue
        }
    }
    Write-Output "Stopped $name."
}
