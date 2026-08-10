param(
    [string]$BackupDirectory = (Join-Path $PSScriptRoot "..\backups"),
    [ValidateRange(1, 3650)][int]$RetentionDays = 14,
    [ValidatePattern('^[a-zA-Z0-9_.-]+$')][string]$Container = "fuelwise-postgres",
    [ValidatePattern('^[a-zA-Z0-9_-]+$')][string]$Database = "fuelwise",
    [ValidatePattern('^[a-zA-Z0-9_-]+$')][string]$DatabaseUser = "fuelwise"
)

$ErrorActionPreference = "Stop"
$resolvedBackupDirectory = [System.IO.Path]::GetFullPath($BackupDirectory)
New-Item -ItemType Directory -Path $resolvedBackupDirectory -Force | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fileName = "fuelwise-$timestamp.dump"
$containerFile = "/tmp/$fileName"
$backupFile = Join-Path $resolvedBackupDirectory $fileName
$metadataFile = "$backupFile.json"

try {
    & docker exec $Container pg_dump -U $DatabaseUser -d $Database --format=custom --compress=9 --no-owner --no-acl --file=$containerFile
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed with exit code $LASTEXITCODE" }

    & docker cp "${Container}:${containerFile}" $backupFile
    if ($LASTEXITCODE -ne 0) { throw "docker cp failed with exit code $LASTEXITCODE" }

    & docker exec $Container pg_restore --list $containerFile | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Backup integrity check failed" }

    $file = Get-Item -LiteralPath $backupFile
    $hash = Get-FileHash -LiteralPath $backupFile -Algorithm SHA256
    [ordered]@{
        created_at = (Get-Date).ToUniversalTime().ToString("o")
        database = $Database
        format = "PostgreSQL custom"
        size_bytes = $file.Length
        sha256 = $hash.Hash.ToLowerInvariant()
        retention_days = $RetentionDays
    } | ConvertTo-Json | Set-Content -LiteralPath $metadataFile -Encoding UTF8

    Get-ChildItem -LiteralPath $resolvedBackupDirectory -Filter "fuelwise-*.dump" -File |
        Where-Object { $_.LastWriteTimeUtc -lt (Get-Date).ToUniversalTime().AddDays(-$RetentionDays) } |
        ForEach-Object {
            $expiredMetadata = "$($_.FullName).json"
            Remove-Item -LiteralPath $_.FullName -Force
            if (Test-Path -LiteralPath $expiredMetadata) { Remove-Item -LiteralPath $expiredMetadata -Force }
        }

    Write-Output $backupFile
}
finally {
    & docker exec $Container rm -f $containerFile 2>$null
}
