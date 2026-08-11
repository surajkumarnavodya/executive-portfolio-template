# tools/package.ps1 — build the buyer-facing distributable zip.
#
# Uses `git archive` against a real commit (default: HEAD), never the working
# directory, so anything not tracked by git -- .vs/, stray *.patch files,
# local scratch files -- can never end up in the zip, regardless of what's
# sitting on disk when this is run. Tracked files that shouldn't ship to
# buyers (source docs, dev-only pages, this tools/ directory itself) are
# excluded below with pathspec magic; they stay in the repo, just not in
# the archive.
#
# Usage:
#   tools/package.ps1 [-Out <path>] [-Ref <git-ref>]
#   tools/package.ps1                                    # -> executive-portfolio-template.zip @ HEAD
#   tools/package.ps1 -Out dist/v1.5.1.zip -Ref v1.5.1    # explicit output + tag/ref

param(
    [string]$Out = "executive-portfolio-template.zip",
    [string]$Ref = "HEAD"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$outDir = Split-Path -Parent $Out
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}
if (Test-Path $Out) {
    Remove-Item -Force $Out
}

# Excluded from the buyer package but kept in the repo:
#   .github/            - repo-only CI/config, not part of the product
#   .vs/                - never tracked, listed here only for clarity
#   tools/               - this packaging tooling and the CSS build scripts
#   assets/dev/          - internal component/theme test harness
#   assets/tests/        - test runner and test files
#   docs/ReleaseQA.md    - internal QA audit notes, not buyer documentation
#   screenshots/         - marketplace listing images, not part of the site
git archive --format=zip --output=$Out $Ref -- . `
    ':!.github' `
    ':!.vs' `
    ':!tools' `
    ':!assets/dev' `
    ':!assets/tests' `
    ':!docs/ReleaseQA.md' `
    ':!screenshots'

if ($LASTEXITCODE -ne 0) {
    throw "git archive failed with exit code $LASTEXITCODE"
}

$size = (Get-Item $Out).Length / 1MB
Write-Host ("Wrote {0} ({1:N2} MB) from {2}" -f $Out, $size, $Ref)
