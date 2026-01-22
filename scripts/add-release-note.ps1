<#
.SYNOPSIS
  Adds a new release note entry to the What's New panel.

.DESCRIPTION
  This script adds a new patch release entry to releaseNotes.ts. It can be run
  automatically when creating a new feature branch or manually when shipping
  changes. The script detects the current version and creates a placeholder
  entry that can be edited later.

.PARAMETER Title
  The title for the patch release (e.g., "Vault API Integration").

.PARAMETER Category
  The category for the first item: feature, improvement, bugfix, or security.
  Default is 'feature'.

.PARAMETER Description
  Optional description for the first item.

.PARAMETER ItemTitle
  The title for the first release item. Defaults to Title if not provided.

.PARAMETER DryRun
  Show what would be done without making changes.

.EXAMPLE
  .\add-release-note.ps1 -Title "Vault API Integration" -Category feature
  
.EXAMPLE
  .\add-release-note.ps1 -Title "Bug Fixes" -Category bugfix -ItemTitle "Fixed login issue"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Title,

  [ValidateSet('feature', 'improvement', 'bugfix', 'security')]
  [string]$Category = 'feature',

  [string]$Description = '',

  [string]$ItemTitle = '',

  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Get paths
$RepoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $RepoRoot) {
  Write-Error "Not in a git repository"
  exit 1
}

$ReleaseNotesPath = Join-Path $RepoRoot "spfx/intranet-core/src/webparts/intranetShell/components/data/releaseNotes.ts"
$PackageJsonPath = Join-Path $RepoRoot "spfx/intranet-core/package.json"

if (-not (Test-Path $ReleaseNotesPath)) {
  Write-Error "Release notes file not found: $ReleaseNotesPath"
  exit 1
}

if (-not (Test-Path $PackageJsonPath)) {
  Write-Error "package.json not found: $PackageJsonPath"
  exit 1
}

# Get current version from package.json
$packageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "Current version: $currentVersion" -ForegroundColor Cyan

# Parse version
if ($currentVersion -notmatch '^(\d+)\.(\d+)\.(\d+)$') {
  Write-Error "Invalid version format: $currentVersion"
  exit 1
}

$major = [int]$Matches[1]
$minor = [int]$Matches[2]
$patch = [int]$Matches[3]

$minorVersion = "$major.$minor"
$today = Get-Date -Format "yyyy-MM-dd"

# Use ItemTitle or fall back to Title
$actualItemTitle = if ($ItemTitle) { $ItemTitle } else { $Title }

# Read release notes file
$content = Get-Content $ReleaseNotesPath -Raw

# Check if this version already exists
if ($content -match "version: '$currentVersion'") {
  Write-Host "Version $currentVersion already has a release note entry." -ForegroundColor Yellow
  Write-Host "Edit the existing entry in releaseNotes.ts instead." -ForegroundColor Yellow
  exit 0
}

# Build the new patch entry
$descriptionLine = if ($Description) {
  "`n            description: '$($Description -replace "'", "\'")'"
} else {
  ""
}

$newPatchEntry = @"
      {
        version: '$currentVersion',
        date: '$today',
        title: '$($Title -replace "'", "\'")',
        items: [
          {
            id: 'item-$currentVersion-1',
            title: '$($actualItemTitle -replace "'", "\'")',
            category: '$Category',$descriptionLine
          },
        ],
      },
"@

# Find the right minor release to insert into
$minorReleasePattern = "id: 'release-$minorVersion'"

if ($content -match $minorReleasePattern) {
  # Insert into existing minor release (after 'patches: [')
  $patchesPattern = "(?<=id: 'release-$minorVersion'[\s\S]*?patches: \[)(\s*)"
  
  if ($content -match $patchesPattern) {
    $newContent = $content -replace $patchesPattern, "`n$newPatchEntry"
    
    if ($DryRun) {
      Write-Host "`n[DRY RUN] Would add release note for v$currentVersion to v$minorVersion release:" -ForegroundColor Yellow
      Write-Host $newPatchEntry -ForegroundColor Gray
    } else {
      Set-Content $ReleaseNotesPath -Value $newContent -NoNewline
      Write-Host "✓ Added release note for v$currentVersion" -ForegroundColor Green
      Write-Host "  Title: $Title" -ForegroundColor Gray
      Write-Host "  Category: $Category" -ForegroundColor Gray
      Write-Host "  File: $ReleaseNotesPath" -ForegroundColor Gray
    }
  } else {
    Write-Error "Could not find patches array in release $minorVersion"
    exit 1
  }
} else {
  Write-Host "Minor release v$minorVersion not found in release notes." -ForegroundColor Yellow
  Write-Host "You may need to create a new minor release section manually." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Add this patch entry to the appropriate minor release:" -ForegroundColor Cyan
  Write-Host $newPatchEntry -ForegroundColor Gray
  exit 0
}

Write-Host ""
Write-Host "Remember to update the release note with specific changes before shipping!" -ForegroundColor Cyan
