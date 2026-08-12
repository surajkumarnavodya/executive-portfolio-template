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
    #   assets/js/ui.js                   - real Portfolio Copilot KB (DEFAULT_KB); replaced below
    #                                        with a genericized build (tools/build_template_ui.js)
    #   assets/dist/js/template.min.js    - the shared bundle compiles ui.js in; rebuilt below with
    #                                        the genericized ui.js so the compiled bundle can't leak
    #                                        real content even though it's not fetched separately
    #   assets/images/profile.*           - real photo; replaced below with the placeholder avatar
    #   assets/f3230583c0ff/              - the real PM/delivery résumé, at its random hashed path
    #   assets/bc8ab7cb7c05/              - the real engineering résumé, at its random hashed path
    #                                        (both never shipped)
    #   og-image.png                      - real branded social-preview image
    #   CLAUDE.md, AGENTS.md, .github/copilot-instructions.md - AI-assistant session
    #                                        logs about this real deployment, not buyer docs
    #   index.template.html, portfolio.template.json, assets/images/profile-placeholder.* -
    #                                        excluded at their OWN paths here; copied to their
    #                                        real in-product paths by the step below instead
    #   assets/js/config.demo.js          - excluded at its OWN path once step below copies it
    #                                        to assets/js/config.js -- shipping both left every
    #                                        buyer wondering which of the two files to edit
    #   robots.txt, sitemap.xml, site.webmanifest - all three hardcode the live domain
    #                                        (surajkumarnavodya.com) and/or real identity;
    #                                        replaced below with their .template equivalents
    #   .gitattributes, .gitignore        - git-only metadata, meaningless once deployed
    #   assets/js/asset-integration-test.js, verify-perf-edits.ps1 - stale dev-only
    #                                        scripts (see package-live.ps1 for detail)
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
        ':!assets/js/config.demo.js' `
        ':!assets/js/ui.js' `
        ':!assets/dist/js/template.min.js' `
        ':!assets/images/profile.jpg' `
        ':!assets/images/profile.webp' `
        ':!assets/images/profile.avif' `
        ':!assets/f3230583c0ff' `
        ':!assets/bc8ab7cb7c05' `
        ':!og-image.png' `
        ':!robots.txt' `
        ':!sitemap.xml' `
        ':!site.webmanifest' `
        ':!CLAUDE.md' `
        ':!AGENTS.md' `
        ':!index.template.html' `
        ':!portfolio.template.json' `
        ':!assets/images/profile-placeholder.jpg' `
        ':!assets/images/profile-placeholder.webp' `
        ':!assets/images/profile-placeholder.avif' `
        ':!assets/images/og-image-placeholder.png' `
        ':!robots.template.txt' `
        ':!sitemap.template.xml' `
        ':!site.template.webmanifest' `
        ':!.gitattributes' `
        ':!.gitignore' `
        ':!assets/js/asset-integration-test.js' `
        ':!verify-perf-edits.ps1'

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
    New-Item -ItemType Directory -Force -Path (Join-Path $siteDir "assets\dist\js") | Out-Null
    Copy-Item "index.template.html"                    (Join-Path $siteDir "index.html") -Force
    # index.template.html deliberately loads config.demo.js directly (not
    # config.js) so it can be opened straight from the source repo for a
    # working local preview before packaging. In the package, config.demo.js's
    # CONTENT is copied to config.js's PATH (below) and config.demo.js itself
    # is excluded (redundant duplicate) -- so the copied index.html's <script>
    # tag has to be repointed at config.js, or it 404s in the shipped
    # package. Found by actually running the built package in a browser, not
    # by reading the code.
    $indexPath = Join-Path $siteDir "index.html"
    (Get-Content $indexPath -Raw) -replace 'assets/js/config\.demo\.js', 'assets/js/config.js' |
        Set-Content $indexPath -NoNewline
    Copy-Item "portfolio.template.json"                 (Join-Path $siteDir "portfolio.json") -Force
    Copy-Item "assets\js\config.demo.js"                (Join-Path $siteDir "assets\js\config.js") -Force
    Copy-Item "assets\images\profile-placeholder.jpg"   (Join-Path $siteDir "assets\images\profile.jpg") -Force
    Copy-Item "assets\images\profile-placeholder.webp"  (Join-Path $siteDir "assets\images\profile.webp") -Force
    Copy-Item "assets\images\profile-placeholder.avif"  (Join-Path $siteDir "assets\images\profile.avif") -Force
    Copy-Item "assets\images\og-image-placeholder.png"  (Join-Path $siteDir "og-image.png") -Force
    Copy-Item "robots.template.txt"                     (Join-Path $siteDir "robots.txt") -Force
    Copy-Item "sitemap.template.xml"                    (Join-Path $siteDir "sitemap.xml") -Force
    Copy-Item "site.template.webmanifest"                (Join-Path $siteDir "site.webmanifest") -Force

    # ui.js's real Copilot KB (assets/js/ui.js's DEFAULT_KB) needs its own
    # genericized build, then the shared JS bundle needs rebuilding with that
    # genericized ui.js in place of the real one -- the bundle is what
    # index.html actually loads, so substituting only the source file
    # wouldn't be enough.
    $uiTemplate = Join-Path $workDir "ui.template.js"
    node tools\build_template_ui.js assets\js\ui.js $uiTemplate
    if ($LASTEXITCODE -ne 0) { throw "build_template_ui.js failed with exit code $LASTEXITCODE" }
    Copy-Item $uiTemplate (Join-Path $siteDir "assets\js\ui.js") -Force
    node tools\build_bundle_js.js --override "ui.js=$uiTemplate" --out (Join-Path $siteDir "assets\dist\js\template.min.js")
    if ($LASTEXITCODE -ne 0) { throw "build_bundle_js.js failed with exit code $LASTEXITCODE" }

    # build_bundle_js.js only concatenates -- real minification is a separate
    # step (see tools/README.md). package-live.ps1 doesn't need this because
    # it ships the already-minified, already-committed
    # assets/dist/js/template.min.js unchanged; this script rebuilds the
    # bundle fresh (to inject the genericized ui.js above) so it has to
    # re-minify too, or buyers get a ~2x larger, un-minified bundle despite
    # the "production bundle" README claim.
    $bundlePath = Join-Path $siteDir "assets\dist\js\template.min.js"
    npx --yes terser $bundlePath --compress --mangle --format comments=false -o $bundlePath
    if ($LASTEXITCODE -ne 0) { Write-Warning "terser minification failed (exit $LASTEXITCODE) -- shipping the template bundle un-minified." }

    Compress-Archive -Path (Join-Path $siteDir "*") -DestinationPath $Out -Force
} finally {
    Remove-Item -Recurse -Force $workDir -ErrorAction SilentlyContinue
}

$size = (Get-Item $Out).Length / 1MB
Write-Host ("Wrote {0} ({1:N2} MB) from {2}" -f $Out, $size, $Ref)

$validator = Join-Path $root "tools\validate_release.js"
if (Test-Path $validator) {
    Write-Host "Validating template release artifact..."
    node $validator --mode template --zip $Out
    if ($LASTEXITCODE -ne 0) { throw "Release validation failed with exit code $LASTEXITCODE" }
}
