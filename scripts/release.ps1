[CmdletBinding()]
param(
  [ValidateSet('patch', 'minor', 'major')]
  [string]$Bump = 'patch',

  [string]$Message,

  [switch]$DryRun,

  [switch]$Yes
)

$ErrorActionPreference = 'Stop'

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string[]]$Args
  )
  $output = & git @Args 2>&1
  $text = if ($null -eq $output) {
    ''
  }
  elseif ($output -is [System.Array]) {
    $output -join [Environment]::NewLine
  }
  else {
    [string]$output
  }
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed: $text"
  }
  return $text
}

function Get-RepoRoot {
  return (Invoke-Git -Args @('rev-parse', '--show-toplevel')).Trim()
}

function Get-CurrentBranch {
  return (Invoke-Git -Args @('rev-parse', '--abbrev-ref', 'HEAD')).Trim()
}

function Get-DefaultRemote {
  $remotes = (Invoke-Git -Args @('remote')).Split([Environment]::NewLine, [System.StringSplitOptions]::RemoveEmptyEntries)
  if ($remotes -contains 'ddre-intranet-sharepoint') { return 'ddre-intranet-sharepoint' }
  if ($remotes -contains 'origin') { return 'origin' }
  if ($remotes.Count -gt 0) { return $remotes[0] }
  throw 'No git remotes configured.'
}

function Test-WorkingTreeClean {
  $status = (Invoke-Git -Args @('status', '--porcelain')).Trim()
  return [string]::IsNullOrWhiteSpace($status)
}

function Parse-SemVer {
  param([Parameter(Mandatory = $true)][string]$Version)
  if ($Version -notmatch '^([0-9]+)\.([0-9]+)\.([0-9]+)$') {
    throw "Unsupported version format '$Version' (expected X.Y.Z)."
  }
  return [pscustomobject]@{
    Major = [int]$Matches[1]
    Minor = [int]$Matches[2]
    Patch = [int]$Matches[3]
  }
}

function Bump-SemVer {
  param(
    [Parameter(Mandatory = $true)][string]$Version,
    [Parameter(Mandatory = $true)][ValidateSet('patch', 'minor', 'major')][string]$Bump
  )
  $v = Parse-SemVer -Version $Version
  switch ($Bump) {
    'patch' { $v.Patch += 1 }
    'minor' { $v.Minor += 1; $v.Patch = 0 }
    'major' { $v.Major += 1; $v.Minor = 0; $v.Patch = 0 }
  }
  return "$($v.Major).$($v.Minor).$($v.Patch)"
}

function Update-JsonFileRaw {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][hashtable]$Replacements
  )

  $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  foreach ($key in $Replacements.Keys) {
    $value = $Replacements[$key]
    $content = $content -replace [regex]::Escape($key), [regex]::Escape($value)
  }
  Set-Content -LiteralPath $Path -Value $content -Encoding UTF8
}

function Set-PackageSolutionVersion {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$NewVersion
  )

  $json = Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
  $solutionVersion = "$NewVersion.0"

  $json.solution.version = $solutionVersion
  if ($null -ne $json.solution.features) {
    foreach ($feature in $json.solution.features) {
      if ($null -ne $feature.version) {
        $feature.version = $solutionVersion
      }
    }
  }

  $newContent = $json | ConvertTo-Json -Depth 100
  Set-Content -LiteralPath $Path -Value ($newContent + "`n") -Encoding UTF8
}

function Invoke-Gates {
  param([Parameter(Mandatory = $true)][string]$RepoRoot)

  $spfxDir = Join-Path $RepoRoot 'spfx/ddre-intranet'
  if (-not (Test-Path -LiteralPath $spfxDir)) {
    throw "SPFx directory not found: $spfxDir"
  }

  Push-Location $spfxDir
  try {
    Write-Host "Running gates in $spfxDir" -ForegroundColor Cyan
    & npm run format:check
    if ($LASTEXITCODE -ne 0) { throw 'format:check failed' }

    & npm run lint
    if ($LASTEXITCODE -ne 0) { throw 'lint failed' }

    & npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw 'typecheck failed' }

    & npm test
    if ($LASTEXITCODE -ne 0) { throw 'tests failed' }

    & npm run build
    if ($LASTEXITCODE -ne 0) { throw 'build failed' }
  }
  finally {
    Pop-Location
  }
}

$repoRoot = Get-RepoRoot
Set-Location $repoRoot

$branch = Get-CurrentBranch
if ($branch -eq 'HEAD') {
  throw 'Detached HEAD is not supported for release.'
}

if (-not (Test-WorkingTreeClean)) {
  throw 'Working tree is not clean. Commit or stash changes before releasing.'
}

$remote = Get-DefaultRemote

$pkgPath = Join-Path $repoRoot 'spfx/ddre-intranet/package.json'
$lockPath = Join-Path $repoRoot 'spfx/ddre-intranet/package-lock.json'
$solutionPath = Join-Path $repoRoot 'spfx/ddre-intranet/config/package-solution.json'

$pkg = Get-Content -LiteralPath $pkgPath -Raw -Encoding UTF8 | ConvertFrom-Json
$oldVersion = [string]$pkg.version
$newVersion = Bump-SemVer -Version $oldVersion -Bump $Bump
$tag = "v$newVersion"

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "chore(release): $tag"
}

Write-Host "Branch: $branch" -ForegroundColor Gray
Write-Host "Remote: $remote" -ForegroundColor Gray
Write-Host "Bump:   $oldVersion -> $newVersion ($Bump)" -ForegroundColor Yellow
Write-Host "Tag:    $tag" -ForegroundColor Yellow
Write-Host "Commit: $Message" -ForegroundColor Yellow

if ($DryRun) {
  Write-Host 'Dry run: no files or git state will be modified.' -ForegroundColor Cyan
  exit 0
}

if (-not $Yes) {
  $answer = Read-Host 'Proceed? (y/N)'
  if ($answer -notin @('y', 'Y', 'yes', 'YES')) {
    Write-Host 'Aborted.' -ForegroundColor Yellow
    exit 1
  }
}

Invoke-Gates -RepoRoot $repoRoot

Write-Host 'Updating versions...' -ForegroundColor Cyan

# package.json (minimal diff via raw replacement)
$pkgOldToken = '"version": "' + $oldVersion + '"'
$pkgNewToken = '"version": "' + $newVersion + '"'
Update-JsonFileRaw -Path $pkgPath -Replacements @{ ($pkgOldToken) = $pkgNewToken }

# package-lock.json (update top-level + packages[''].version)
$lockOldToken = '"version": "' + $oldVersion + '"'
$lockNewToken = '"version": "' + $newVersion + '"'
Update-JsonFileRaw -Path $lockPath -Replacements @{ ($lockOldToken) = $lockNewToken }

# package-solution.json (set solution + feature versions to X.Y.Z.0)
Set-PackageSolutionVersion -Path $solutionPath -NewVersion $newVersion

Invoke-Git -Args @('add', 'spfx/ddre-intranet/package.json', 'spfx/ddre-intranet/package-lock.json', 'spfx/ddre-intranet/config/package-solution.json') | Out-Null
Invoke-Git -Args @('commit', '-m', $Message) | Out-Null

# Create lightweight tag
Invoke-Git -Args @('tag', $tag) | Out-Null

Write-Host 'Pushing commit and tag...' -ForegroundColor Cyan
Invoke-Git -Args @('push', $remote, 'HEAD') | Out-Null
Invoke-Git -Args @('push', $remote, $tag) | Out-Null

Write-Host "Release complete: $tag" -ForegroundColor Green
