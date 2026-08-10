param(
    [Parameter(Mandatory)][string]$BackupFile,
    [Parameter(Mandatory)][ValidatePattern('^[a-zA-Z0-9_-]+$')][string]$TargetDatabase,
    [switch]$AllowFuelWiseOverwrite,
    [ValidatePattern('^[a-zA-Z0-9_.-]+$')][string]$Container = "fuelwise-postgres",
    [ValidatePattern('^[a-zA-Z0-9_-]+$')][string]$DatabaseUser = "fuelwise"
)

$ErrorActionPreference = "Stop"
$resolvedBackup = (Resolve-Path -LiteralPath $BackupFile).Path
if ($TargetDatabase -eq "fuelwise" -and -not $AllowFuelWiseOverwrite) {
    throw "Refusing to overwrite the main FuelWise database. Re-run with -AllowFuelWiseOverwrite only after maintenance mode and a fresh backup."
}

$suffix = [guid]::NewGuid().ToString("N").Substring(0, 10)
$containerFile = "/tmp/fuelwise-restore-$suffix.dump"
try {
    & docker cp $resolvedBackup "${Container}:${containerFile}"
    if ($LASTEXITCODE -ne 0) { throw "Could not copy backup into PostgreSQL container" }
    & docker exec $Container pg_restore -U $DatabaseUser -d $TargetDatabase --clean --if-exists --no-owner --no-acl --exit-on-error $containerFile
    if ($LASTEXITCODE -ne 0) { throw "Database restore failed" }
    Write-Output "Restore completed for database: $TargetDatabase"
}
finally {
    & docker exec $Container rm -f $containerFile 2>$null
}
