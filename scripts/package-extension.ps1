Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Get-Location).Path
$staging = Join-Path $root "extension-staging"
$zipPath = Join-Path $root "echodeck-extension.zip"

if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Force -Path $staging | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $staging "stickers") | Out-Null

# Copy HTML & JS
Copy-Item (Join-Path $root "public\panel.html") -Destination (Join-Path $staging "panel.html")
Copy-Item (Join-Path $root "public\panel.js") -Destination (Join-Path $staging "panel.js")

# Copy 3 stickers
Copy-Item (Join-Path $root "public\stickers\speed-laugh.gif") -Destination (Join-Path $staging "stickers\speed-laugh.gif")
Copy-Item (Join-Path $root "public\stickers\streamer.gif") -Destination (Join-Path $staging "stickers\streamer.gif")
Copy-Item (Join-Path $root "public\stickers\meme1.webp") -Destination (Join-Path $staging "stickers\meme1.webp")

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

# Build ZipArchive with clean forward-slash entries
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $staging "panel.html"), "panel.html")
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $staging "panel.js"), "panel.js")
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $staging "stickers\speed-laugh.gif"), "stickers/speed-laugh.gif")
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $staging "stickers\streamer.gif"), "stickers/streamer.gif")
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $staging "stickers\meme1.webp"), "stickers/meme1.webp")
$archive.Dispose()

Remove-Item -Recurse -Force $staging

$len = (Get-Item $zipPath).Length
Write-Host "echodeck-extension.zip created successfully with 6 buzzers & 3 stickers! Size: $len bytes"
