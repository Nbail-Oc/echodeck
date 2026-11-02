Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Get-Location).Path
$srcDir = Join-Path $root "games-extension"
$zipPath = Join-Path $root "twitch-arcade-extension.zip"

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

# Build ZipArchive with clean forward-slash entries
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $srcDir "panel.html"), "panel.html")
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $srcDir "panel.js"), "panel.js")
$archive.Dispose()

$len = (Get-Item $zipPath).Length
Write-Host "twitch-arcade-extension.zip created successfully! Size: $len bytes"

