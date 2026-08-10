param(
    [Parameter(Mandatory)][string]$BackupFile,
    [ValidatePattern('^[a-zA-Z0-9_.-]+$')][string]$Container = "fuelwise-postgres",
    [ValidatePattern('^[a-zA-Z0-9_-]+$')][string]$DatabaseUser = "fuelwise"
)

$ErrorActionPreference = "Stop"
$resolvedBackup = (Resolve-Path -LiteralPath $BackupFile).Path
if ([System.IO.Path]::GetExtension($resolvedBackup) -ne ".dump") { throw "Backup file must use the .dump extension" }

$suffix = [guid]::NewGuid().ToString("N").Substring(0, 10)
$temporaryDatabase = "fuelwise_restore_check_$suffix"
$containerFile = "/tmp/fuelwise-restore-$suffix.dump"

try {
    & docker cp $resolvedBackup "${Container}:${containerFile}"
    if ($LASTEXITCODE -ne 0) { throw "Could not copy the backup into PostgreSQL container" }

    & docker exec $Container createdb -U $DatabaseUser $temporaryDatabase
    if ($LASTEXITCODE -ne 0) { throw "Could not create temporary restore database" }

    & docker exec $Container pg_restore -U $DatabaseUser -d $temporaryDatabase --no-owner --no-acl --exit-on-error $containerFile
    if ($LASTEXITCODE -ne 0) { throw "Restore verification failed" }

    $tableCount = & docker exec $Container psql -U $DatabaseUser -d $temporaryDatabase -tAc "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';"
    if ($LASTEXITCODE -ne 0 -or [int]$tableCount -lt 1) { throw "Restored database contains no application tables" }

    Write-Output "Restore verified successfully: $tableCount public tables"
}
finally {
    & docker exec $Container dropdb -U $DatabaseUser --if-exists $temporaryDatabase 2>$null
    & docker exec $Container rm -f $containerFile 2>$null
}
