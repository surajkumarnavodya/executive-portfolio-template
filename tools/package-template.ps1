# tools/package-template.ps1 — build the buyer-facing template distributable.
#
# This is what buyers receive — it is NOT the live site (see
# tools/package-live.ps1 for that). Uses `git archive` against a real commit
# (default: HEAD), never the working directory, so untracked local files can
# never end up in the zip.
#
# git archive pathspecs can exclude a whole file by path, but they can't
# substitute file CONTENT at a path two products share (e.g. both need a
# file at "index.html", but with different content). So this script excludes
# the live site's real files below, then does one explicit copy step to
# place the already-authored template-safe equivalents at those same paths --
# the same pattern tools/build_bundle.js already uses for the CSS bundle,
# not a new class of risk. See tools/build_template_content.js for how
# index.template.html itself is kept in sync with index.html.
#
# Usage:
#   tools/package-template.ps1 [-Out <path>] [-Ref <git-ref>]
#   tools/package-template.ps1                                  # -> executive-portfolio-template.zip @ HEAD
#   tools/package-template.ps1 -Out dist/v1.5.2.zip -Ref v1.5.2  # explicit output + tag/ref

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

$workDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $workDir | Out-Null
try {
    $rawZip = Join-Path $workDir "raw.zip"

    # Excluded from the template package but kept in the repo:
    #   .github/, .vs/, tools/            - repo-only tooling, not part of the product
    #   assets/dev/, assets/tests/        - internal test harnesses
    #   docs/ReleaseQA.md                 - internal QA audit notes, not buyer documentation
    #   screenshots/                      - marketplace listing images
    #   engineering.html                  - live-site-only bonus page, not part of the template
    #   index.html                        - real content; replaced below with index.template.html
    #   portfolio.json                    - real data; replaced below with portfolio.template.json
    #   assets/js/config.js               - real identity/contact; replaced below with config.demo.js
    #   assets/images/profile.*           - real photo; replaced below with the placeholder avatar
    #   assets/aff991fc366a/              - the real résumé, at its random hashed path -- never shipped
    #   og-image.png                      - real branded social-preview image
    #   CLAUDE.md, AGENTS.md, .github/copilot-instructions.md - AI-assistant session
    #                                        logs about this real deployment, not buyer docs
    #   index.template.html, portfolio.template.json, assets/images/profile-placeholder.* -
    #                                        excluded at their OWN paths here; copied to their
    #                                        real in-product paths by the step below instead
    git archive --format=zip --output=$rawZip $Ref -- . `
        ':!.github' `
        ':!.vs' `
        ':!tools' `
        ':!assets/dev' `
        ':!assets/tests' `
        ':!docs/ReleaseQA.md' `
        ':!screenshots' `
        ':!engineering.html' `
        ':!index.html' `
        ':!portfolio.json' `
        ':!assets/js/config.js' `
        ':!assets/images/profile.jpg' `
        ':!assets/images/profile.webp' `
        ':!assets/images/profile.avif' `
        ':!assets/aff991fc366a' `
        ':!og-image.png' `
        ':!CLAUDE.md' `
        ':!AGENTS.md' `
        ':!index.template.html' `
        ':!portfolio.template.json' `
        ':!assets/images/profile-placeholder.jpg' `
        ':!assets/images/profile-placeholder.webp'

    if ($LASTEXITCODE -ne 0) {
        throw "git archive failed with exit code $LASTEXITCODE"
    }

    $siteDir = Join-Path $workDir "site"
    Expand-Archive -Path $rawZip -DestinationPath $siteDir -Force

    # Copy the already-authored template-safe substitutes from the working tree
    # into place at the paths the live-only files were excluded from above.
    # New-Item -Force first: if every file that would live in a directory was
    # excluded above (true for assets\images\, once profile.* is excluded),
    # git archive never creates that directory at all.
    New-Item -ItemType Directory -Force -Path (Join-Path $siteDir "assets\js") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $siteDir "assets\images") | Out-Null
    Copy-Item "index.template.html"                    (Join-Path $siteDir "index.html") -Force
    Copy-Item "portfolio.template.json"                 (Join-Path $siteDir "portfolio.json") -Force
    Copy-Item "assets\js\config.demo.js"                (Join-Path $siteDir "assets\js\config.js") -Force
    Copy-Item "assets\images\profile-placeholder.jpg"   (Join-Path $siteDir "assets\images\profile.jpg") -Force
    Copy-Item "assets\images\profile-placeholder.webp"  (Join-Path $siteDir "assets\images\profile.webp") -Force

    Compress-Archive -Path (Join-Path $siteDir "*") -DestinationPath $Out -Force
} finally {
    Remove-Item -Recurse -Force $workDir -ErrorAction SilentlyContinue
}

$size = (Get-Item $Out).Length / 1MB
Write-Host ("Wrote {0} ({1:N2} MB) from {2}" -f $Out, $size, $Ref)
