# tools/package-live.ps1 — build the live-site deploy artifact.
#
# This is what actually gets served at the real domain — it is NOT the
# buyer-facing template package (see tools/package-template.ps1 for that).
# Uses `git archive` against a real commit (default: HEAD), never the working
# directory, so anything not tracked by git -- .vs/, stray *.patch files,
# local scratch files -- can never end up in the artifact, regardless of
# what's sitting on disk when this is run.
#
# The Studio/template system (studio.html, portfolio.json, the Studio-only JS
# modules, demo data) is excluded below. It used to be reachable at the live
# domain because GitHub Pages serves the repo root as-is -- including
# studio.html's "Export Website ZIP" feature, which fetches same-origin
# sibling files like config.js and index.html. This script (driven by
# .github/workflows/deploy-live.yml) is what closes that: the live domain now
# serves only this artifact's contents, which never contain the Studio system
# in the first place.
#
# Usage:
#   tools/package-live.ps1 [-Out <path>] [-Ref <git-ref>]
#   tools/package-live.ps1                                  # -> portfolio-live.zip @ HEAD
#   tools/package-live.ps1 -Out dist/v1.5.2.zip -Ref v1.5.2  # explicit output + tag/ref

param(
    [string]$Out = "portfolio-live.zip",
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

# Excluded from the live artifact but kept in the repo:
#   .github/                            - repo-only CI/config, not served
#   .vs/                                 - never tracked, listed here only for clarity
#   tools/                               - packaging/build tooling, not served
#   assets/dev/                          - internal component/theme test harness
#   assets/tests/                        - test runner and test files
#   docs/                                - template buyer documentation, not relevant to a live visitor
#   screenshots/                         - marketplace listing images
#   studio.html, component-catalog.html  - the template product's own pages
#   portfolio.json, portfolio.template.json - Studio's data-driven content model
#   assets/css/studio.css                - Studio-only styling
#   assets/js/studio-app.js              - Studio ES module (builder UI)
#   assets/js/content-service.js         - Studio ES module
#   assets/js/asset-store.js             - Studio ES module
#   assets/js/portfolio-data-service.js  - Studio's JSON import/export + zip-export
#   assets/js/config.demo.js             - the template's fictional identity config
#   assets/demo-data/                    - fictional sample content for Studio previews
#   index.template.html, portfolio.template.json, assets/images/profile-placeholder.* -
#                                           template-only source files (package-template's
#                                           raw material), never referenced by index.html
#   CLAUDE.md, AGENTS.md, .github/copilot-instructions.md - AI-assistant session
#                                           logs; internal development narrative
#                                           (including security-decision reasoning
#                                           that shouldn't be publicly readable)
#   README.md, LICENSE.txt               - template product documentation/licence
#                                           terms, not live-site content
#   .gitattributes, .gitignore           - git-only metadata, meaningless once deployed
#   assets/js/asset-integration-test.js  - manual Studio console test harness (lives
#                                           outside assets/tests/, so the exclusion
#                                           above doesn't already catch it; references
#                                           a "home.html" this repo hasn't had in a
#                                           long time — confirmed stale, not just unused)
#   verify-perf-edits.ps1                - one-off manual verification script from a
#                                           past editing session, same stale-reference
#                                           problem as above
#   robots.template.txt, sitemap.template.xml, site.template.webmanifest -
#                                           package-template's raw material, never
#                                           referenced by the real index.html
git archive --format=zip --output=$Out $Ref -- . `
    ':!.github' `
    ':!.vs' `
    ':!tools' `
    ':!assets/dev' `
    ':!assets/tests' `
    ':!docs' `
    ':!screenshots' `
    ':!CLAUDE.md' `
    ':!AGENTS.md' `
    ':!README.md' `
    ':!LICENSE.txt' `
    ':!studio.html' `
    ':!component-catalog.html' `
    ':!portfolio.json' `
    ':!portfolio.template.json' `
    ':!assets/css/studio.css' `
    ':!assets/js/studio-app.js' `
    ':!assets/js/content-service.js' `
    ':!assets/js/asset-store.js' `
    ':!assets/js/portfolio-data-service.js' `
    ':!assets/js/config.demo.js' `
    ':!assets/demo-data' `
    ':!index.template.html' `
    ':!portfolio.template.json' `
    ':!assets/images/profile-placeholder.jpg' `
    ':!assets/images/profile-placeholder.webp' `
    ':!assets/images/profile-placeholder.avif' `
    ':!assets/images/og-image-placeholder.png' `
    ':!.gitattributes' `
    ':!.gitignore' `
    ':!assets/js/asset-integration-test.js' `
    ':!verify-perf-edits.ps1' `
    ':!robots.template.txt' `
    ':!sitemap.template.xml' `
    ':!site.template.webmanifest'

if ($LASTEXITCODE -ne 0) {
    throw "git archive failed with exit code $LASTEXITCODE"
}

$size = (Get-Item $Out).Length / 1MB
Write-Host ("Wrote {0} ({1:N2} MB) from {2}" -f $Out, $size, $Ref)

$validator = Join-Path $root "tools\validate_release.js"
if (Test-Path $validator) {
    Write-Host "Validating live release artifact..."
    node $validator --mode live --zip $Out
    if ($LASTEXITCODE -ne 0) { throw "Release validation failed with exit code $LASTEXITCODE" }
}
