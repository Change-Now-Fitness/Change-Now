param(
    [string]$Version = "1.0"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$packageRoot = Join-Path $PSScriptRoot "ChangeNow-Binary-Release-$Version"
$androidDir = Join-Path $packageRoot "android"
$serverDir = Join-Path $packageRoot "server"
$backendExportDir = Join-Path $serverDir "ChangeNow-backend-server"
$backendZipPath = Join-Path $serverDir "ChangeNow-backend-server.zip"
$backendZipTempPath = Join-Path $PSScriptRoot "ChangeNow-backend-server-$Version.zip"
$releaseZipPath = Join-Path $PSScriptRoot "ChangeNow-Binary-Release-$Version.zip"
$releaseApkSource = Join-Path $repoRoot "frontend\android\app\build\outputs\apk\release\app-release.apk"
$releaseApkDest = Join-Path $androidDir "ChangeNow-1.0-local-emulator-release.apk"

if (-not (Test-Path $releaseApkSource)) {
    throw "Release APK not found at $releaseApkSource. Build it before packaging."
}

if (Test-Path $packageRoot) {
    Remove-Item -Recurse -Force $packageRoot
}

if (Test-Path $releaseZipPath) {
    Remove-Item -Force $releaseZipPath
}

if (Test-Path $backendZipTempPath) {
    Remove-Item -Force $backendZipTempPath
}

New-Item -ItemType Directory -Path $androidDir | Out-Null
New-Item -ItemType Directory -Path $serverDir | Out-Null
New-Item -ItemType Directory -Path $backendExportDir | Out-Null

Copy-Item $releaseApkSource $releaseApkDest
Copy-Item (Join-Path $PSScriptRoot "course-release-notes.md") (Join-Path $packageRoot "RELEASE_NOTES.md")
Copy-Item (Join-Path $PSScriptRoot "course-staff-access.md") (Join-Path $packageRoot "COURSE_STAFF_ACCESS.md")

$backendFiles = @(
    ".env",
    ".env.example",
    ".dockerignore",
    "Dockerfile",
    "README.md",
    "dbconnection.js",
    "ecosystem.config.js",
    "package-lock.json",
    "package.json",
    "server.js"
)

foreach ($file in $backendFiles) {
    $sourcePath = Join-Path $repoRoot "backend\$file"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath (Join-Path $backendExportDir $file)
    }
}

$backendDirs = @(
    "config",
    "controllers",
    "middleware",
    "routes",
    "scripts",
    "services"
)

foreach ($dir in $backendDirs) {
    Copy-Item (Join-Path $repoRoot "backend\$dir") (Join-Path $backendExportDir $dir) -Recurse
}

& tar.exe -a -cf $backendZipTempPath -C $serverDir "ChangeNow-backend-server"
if ($LASTEXITCODE -ne 0) {
    throw "Failed to create backend zip with tar.exe"
}

Move-Item $backendZipTempPath $backendZipPath
Remove-Item -Recurse -Force $backendExportDir

& tar.exe -a -cf $releaseZipPath -C $PSScriptRoot "ChangeNow-Binary-Release-$Version"
if ($LASTEXITCODE -ne 0) {
    throw "Failed to create release zip with tar.exe"
}

Write-Host "Created package folder: $packageRoot"
Write-Host "Created release zip: $releaseZipPath"
