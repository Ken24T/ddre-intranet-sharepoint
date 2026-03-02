<#
.SYNOPSIS
    Detects accidental code loss by comparing the current working tree against a baseline.

.DESCRIPTION
    Scans for source files (.ts, .tsx) that exist in the baseline but are missing from
    the current branch. Also reports overall file/line statistics.

    Created after commit 83f8404 silently deleted 71 files (13,313 lines) during a
    destructive tree sync. This script provides a manual safety net.

.PARAMETER Baseline
    A git reference (tag, commit, branch) to compare against.
    Defaults to the most recent vX.Y.Z tag.

.PARAMETER IncludeAll
    When set, checks all file types, not just .ts/.tsx source files.

.EXAMPLE
    ./scripts/safety-check.ps1
    Compare HEAD against the last shipped tag.

.EXAMPLE
    ./scripts/safety-check.ps1 -Baseline v0.10.0
    Compare HEAD against a specific version.

.EXAMPLE
    ./scripts/safety-check.ps1 -Baseline main -IncludeAll
    Compare HEAD against main, checking all file types.
#>

param(
    [string]$Baseline,
    [switch]$IncludeAll
)

$ErrorActionPreference = "Stop"

# ── Find repo root ────────────────────────────────────────────────
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    Write-Error "Not inside a git repository."
    exit 1
}
Push-Location $repoRoot

try {
    # ── Determine baseline ────────────────────────────────────────
    if (-not $Baseline) {
        $Baseline = git describe --tags --abbrev=0 --match "v*" 2>$null
        if (-not $Baseline) {
            # Fallback: most recent safety tag
            $Baseline = git tag -l "safety/*" --sort=-creatordate | Select-Object -First 1
        }
        if (-not $Baseline) {
            Write-Error "No baseline found. Specify one with -Baseline <ref>."
            exit 1
        }
    }

    # Verify the baseline exists
    $null = git rev-parse --verify $Baseline 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Baseline '$Baseline' does not exist."
        exit 1
    }

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  SAFETY CHECK — Code Loss Detection" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Baseline:  $Baseline" -ForegroundColor White
    Write-Host "  Current:   HEAD ($(git rev-parse --short HEAD))" -ForegroundColor White
    Write-Host "  Branch:    $(git branch --show-current)" -ForegroundColor White
    Write-Host ""

    # ── Get deleted files ─────────────────────────────────────────
    $allDeleted = git diff "$Baseline..HEAD" --name-only --diff-filter=D 2>$null

    if ($IncludeAll) {
        $deletedFiles = $allDeleted
    } else {
        $deletedFiles = $allDeleted | Where-Object { $_ -match '\.(ts|tsx)$' }
    }

    $deletedCount = if ($deletedFiles) { ($deletedFiles | Measure-Object).Count } else { 0 }

    # ── Get overall stats ─────────────────────────────────────────
    $statLine = git diff "$Baseline..HEAD" --shortstat 2>$null
    $added = 0
    $removed = 0
    if ($statLine -match '(\d+) insertions?\(\+\)') { $added = [int]$Matches[1] }
    if ($statLine -match '(\d+) deletions?\(-\)') { $removed = [int]$Matches[1] }
    $netLines = $added - $removed

    # ── Get added files ───────────────────────────────────────────
    $allAdded = git diff "$Baseline..HEAD" --name-only --diff-filter=A 2>$null
    if ($IncludeAll) {
        $addedFiles = $allAdded
    } else {
        $addedFiles = $allAdded | Where-Object { $_ -match '\.(ts|tsx)$' }
    }
    $addedCount = if ($addedFiles) { ($addedFiles | Measure-Object).Count } else { 0 }

    # ── Report ────────────────────────────────────────────────────
    $fileType = if ($IncludeAll) { "all files" } else { ".ts/.tsx source files" }

    Write-Host "  Summary ($fileType):" -ForegroundColor Yellow
    Write-Host "    Files added:    +$addedCount" -ForegroundColor Green
    Write-Host "    Files deleted:  -$deletedCount" -ForegroundColor $(if ($deletedCount -gt 0) { "Red" } else { "Green" })
    Write-Host "    Lines:          +$added / -$removed (net: $netLines)" -ForegroundColor $(if ($netLines -lt 0) { "Red" } else { "Green" })
    Write-Host ""

    # ── Deleted files detail ──────────────────────────────────────
    if ($deletedCount -eq 0) {
        Write-Host "  [PASS] No source files deleted since $Baseline." -ForegroundColor Green
        Write-Host ""
    } elseif ($deletedCount -le 5) {
        Write-Host "  [INFO] $deletedCount file(s) deleted since ${Baseline}:" -ForegroundColor Yellow
        $deletedFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
        Write-Host ""
        Write-Host "  Review these deletions to confirm they are intentional." -ForegroundColor Yellow
        Write-Host ""
    } elseif ($deletedCount -le 20) {
        Write-Host "  [WARNING] $deletedCount files deleted since $Baseline!" -ForegroundColor Red
        $deletedFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        Write-Host ""
        Write-Host "  This exceeds the safe threshold (5 files). Verify this is intentional:" -ForegroundColor Red
        Write-Host "    git diff $Baseline..HEAD --stat --diff-filter=D" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "  [CRITICAL] $deletedCount files deleted since $Baseline!" -ForegroundColor Red
        Write-Host "  This looks like a destructive tree reset, not a normal change." -ForegroundColor Red
        Write-Host ""
        Write-Host "  First 20 deleted files:" -ForegroundColor Red
        $deletedFiles | Select-Object -First 20 | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        Write-Host "    ... and $($deletedCount - 20) more" -ForegroundColor Red
        Write-Host ""
        Write-Host "  To see the full list:" -ForegroundColor White
        Write-Host "    git diff $Baseline..HEAD --name-only --diff-filter=D" -ForegroundColor White
        Write-Host ""
        Write-Host "  To recover:" -ForegroundColor White
        Write-Host "    git checkout $Baseline -- <file-path>" -ForegroundColor White
        Write-Host ""
    }

    # ── Safety tags ───────────────────────────────────────────────
    $safetyTags = git tag -l "safety/*" --sort=-creatordate | Select-Object -First 5
    if ($safetyTags) {
        Write-Host "  Recent safety tags (recovery points):" -ForegroundColor Cyan
        $safetyTags | ForEach-Object {
            $tagDate = git log -1 --format="%ci" $_ 2>$null
            Write-Host "    $_  ($tagDate)" -ForegroundColor Cyan
        }
        Write-Host ""
    } else {
        Write-Host "  No safety tags found. They will be created automatically" -ForegroundColor DarkGray
        Write-Host "  before future merges to the default branch." -ForegroundColor DarkGray
        Write-Host ""
    }

    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""

    # ── Exit code ─────────────────────────────────────────────────
    if ($deletedCount -gt 20) {
        exit 2  # Critical
    } elseif ($deletedCount -gt 5) {
        exit 1  # Warning
    } else {
        exit 0  # OK
    }

} finally {
    Pop-Location
}
