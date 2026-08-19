[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$PublicPath
)

$ErrorActionPreference = "Stop"
$themeRoot = (Resolve-Path $PSScriptRoot).Path
$target = (Resolve-Path -LiteralPath $PublicPath).Path
$indexPath = Join-Path $target "index.html"

if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
  throw "MCSManager index.html was not found: $indexPath"
}

$files = @(
  "northstar-v10.css",
  "northstar-v10.js",
  "fonts\MapleMono-Bold.woff2",
  "fonts\MapleMono-Regular.woff2",
  "fonts\MapleMono-SemiBold.woff2",
  "img\logo.png"
)

foreach ($relative in $files) {
  $source = Join-Path $themeRoot $relative
  $destination = Join-Path $target $relative
  $parent = Split-Path -Parent $destination
  New-Item -ItemType Directory -Path $parent -Force | Out-Null
  Copy-Item -LiteralPath $source -Destination $destination -Force
}

$html = Get-Content -LiteralPath $indexPath -Raw
$version = "20260819-32"
$cssTag = '<link rel="stylesheet" href="./northstar-v10.css?v=' + $version + '">'
$jsTag = '<script src="./northstar-v10.js?v=' + $version + '"></script>'

if ($html -match 'northstar-v10\.css') {
  $html = $html -replace '(?i)<link\b[^>]*northstar-v10\.css[^>]*>', $cssTag
} else {
  $html = $html -replace '(?i)</head>', "    $cssTag`r`n  </head>"
}
if ($html -match 'northstar-v10\.js') {
  $html = $html -replace '(?i)<script\b[^>]*northstar-v10\.js[^>]*></script>', $jsTag
} else {
  $html = $html -replace '(?i)</body>', "    $jsTag`r`n  </body>"
}

Set-Content -LiteralPath $indexPath -Value $html -Encoding UTF8
Write-Output "Northstar installed into $target"
