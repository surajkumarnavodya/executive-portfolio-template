<#
    verify-perf-edits.ps1

    Run this from the ROOT of your git repo (the folder containing home.html /
    index.html) after applying the performance changes by hand.

        powershell -ExecutionPolicy Bypass -File .\verify-perf-edits.ps1

    It checks the five edits independently of file hashes, so reformatting or
    line-ending differences will not cause false alarms. Anything printed in
    red is a real problem that will change how the page renders.
#>

$ErrorActionPreference = 'Stop'
$fail = 0
$warn = 0

function Ok   ($m) { Write-Host "  [ OK ]   $m" -ForegroundColor Green }
function Bad  ($m) { Write-Host "  [FAIL]   $m" -ForegroundColor Red;    $script:fail++ }
function Warn ($m) { Write-Host "  [WARN]   $m" -ForegroundColor Yellow; $script:warn++ }
function Head ($m) { Write-Host "`n$m" -ForegroundColor Cyan }

# ---------------------------------------------------------------- entry point
$page = $null
foreach ($c in @('home.html','index.html')) { if (Test-Path $c) { $page = $c; break } }
if (-not $page) { Write-Host "No home.html or index.html here. Run this from the repo root." -ForegroundColor Red; exit 1 }
Write-Host "Verifying repo at: $(Get-Location)"
Write-Host "Entry page       : $page"

$html = Get-Content $page -Raw

# ------------------------------------------------- 1. critical CSS inlining
Head "1. Critical CSS inlined into $page"

$styleCount = ([regex]::Matches($html, '<style\s+id="critical-css">')).Count
if ($styleCount -eq 1) { Ok "exactly one <style id=`"critical-css`"> block" }
elseif ($styleCount -eq 0) { Bad "no <style id=`"critical-css`"> block found" }
else { Bad "$styleCount critical-css blocks found - there must be exactly 1" }

if ($styleCount -ge 1) {
    $m = [regex]::Match($html, '<style\s+id="critical-css">(?<css>.*?)</style>', 'Singleline')
    $css = $m.Groups['css'].Value
    Write-Host "           inlined CSS size: $($css.Length) bytes (expected ~35,142)"
    if ($css.Length -lt 30000) { Bad "block looks truncated - a paste probably got cut short" }
    elseif ($css.Length -gt 40000) { Warn "block is larger than expected - check for a duplicated paste" }
    else { Ok "block size is in the expected range" }

    # brace balance catches a truncated or half-pasted block
    $open  = ([regex]::Matches($css, '\{')).Count
    $close = ([regex]::Matches($css, '\}')).Count
    if ($open -eq $close) { Ok "braces balanced ($open pairs)" } else { Bad "unbalanced braces: $open '{' vs $close '}' - CSS is corrupt" }

    foreach ($needle in @(':root', '[data-bs-theme="dark"]', '.telemetry', '.navbar', '.hero', '@keyframes tick')) {
        if ($css.Contains($needle)) { Ok "contains $needle" } else { Bad "missing $needle - block is incomplete" }
    }
}

# cascade order: the block MUST come after the Bootstrap stylesheets
$iBoot  = $html.IndexOf('bootstrap-icons@1.11.3')
$iStyle = $html.IndexOf('<style id="critical-css">')
if ($iBoot -ge 0 -and $iStyle -ge 0) {
    if ($iStyle -gt $iBoot) { Ok "block sits AFTER the Bootstrap Icons link (cascade order correct)" }
    else { Bad "block sits BEFORE Bootstrap - Bootstrap will override your styles until the async bundle loads" }
}

# ------------------------------------------------- 2. deferred bundle
Head "2. Bundle loads without blocking"

if ($html -match 'rel="preload"[^>]*template\.min\.css[^>]*as="style"' -or
    $html -match 'rel="preload"\s+href="assets/dist/css/template\.min\.css"') { Ok "preload link present" }
else { Bad "no <link rel=preload as=style> for template.min.css" }

if ($html -match "this\.rel='stylesheet'") { Ok "onload swap present" } else { Bad "missing onload=`"this.rel='stylesheet'`"" }
if ($html -match '<noscript><link\s+rel="stylesheet"[^>]*template\.min\.css') { Ok "noscript fallback present" }
else { Bad "missing <noscript> fallback - page is unstyled without JS" }

# there must be no plain blocking link left outside the noscript
$stripped = [regex]::Replace($html, '(?s)<noscript>.*?</noscript>', '')
if ($stripped -match '<link\s+rel="stylesheet"\s+href="assets/dist/css/template\.min\.css"') {
    Bad "a blocking <link> to template.min.css still exists outside <noscript> - the deferral is cancelled out"
} else { Ok "no leftover blocking link to the bundle" }

if ($html -match 'rel="preconnect"\s+href="https://cdn\.jsdelivr\.net"') { Ok "preconnect for cdn.jsdelivr.net present" }
else { Warn "preconnect for cdn.jsdelivr.net missing (minor - costs a little font latency)" }

# ------------------------------------------------- 3. bundle rebuilt
Head "3. assets/dist/css/template.min.css rebuilt without studio.css"

$bundlePath = 'assets/dist/css/template.min.css'
if (Test-Path $bundlePath) {
    $bundle = Get-Content $bundlePath -Raw
    $studio = ([regex]::Matches($bundle, 'studio-')).Count
    if ($studio -eq 0) { Ok "0 studio-* rules in the bundle" } else { Bad "$studio studio-* references still in the bundle - it was not rebuilt" }
    Write-Host "           bundle size: $((Get-Item $bundlePath).Length) bytes (expected ~108,875)"
    $o = ([regex]::Matches($bundle,'\{')).Count; $c = ([regex]::Matches($bundle,'\}')).Count
    if ($o -eq $c) { Ok "braces balanced ($o pairs)" } else { Bad "unbalanced braces: $o vs $c - bundle is corrupt" }
} else { Bad "$bundlePath not found" }

# ------------------------------------------------- 4. dead CSS removed
Head "4. Dead rules removed from assets/css/style.css"

$sp = 'assets/css/style.css'
if (Test-Path $sp) {
    $s = Get-Content $sp -Raw
    foreach ($dead in @('stagger', '.c-form', '.cf-note', '.executive-ribbon strong')) {
        $n = ([regex]::Matches($s, [regex]::Escape($dead))).Count
        if ($n -eq 0) { Ok "'$dead' fully removed" } else { Bad "'$dead' still present ($n occurrences)" }
    }
    # .pulse must go, but @keyframes pulse must STAY
    if ($s -match '(?m)^\.pulse\s*\{') { Bad "'.pulse{' rule still present" } else { Ok "'.pulse' rule removed" }
    if ($s -match '@keyframes\s+pulse') { Ok "@keyframes pulse KEPT (still used by .copilot-head .dot::after)" }
    else { Bad "@keyframes pulse was deleted - the Copilot status dot animation is now broken" }
    if ($s -match '@keyframes\s+stagger-in') { Bad "@keyframes stagger-in still present (orphaned)" } else { Ok "@keyframes stagger-in removed" }

    $o = ([regex]::Matches($s,'\{')).Count; $c = ([regex]::Matches($s,'\}')).Count
    if ($o -eq $c) { Ok "braces balanced ($o pairs)" } else { Bad "unbalanced braces: $o vs $c - style.css is corrupt" }
} else { Bad "$sp not found" }

# ------------------------------------------------- 5. untouched files
Head "5. Files that must NOT have changed"

foreach ($f in @('assets/css/variables.css','assets/css/responsive.css','assets/css/studio.css','assets/dist/js/template.min.js')) {
    if (Test-Path $f) { Ok "$f present" } else { Bad "$f missing" }
}
try {
    $dirty = & git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0) {
        $changed = ($dirty | Where-Object { $_ -match '\.js$' -and $_ -notmatch 'tools/' })
        if ($changed) { Warn "JS files show as modified - this change set should not touch any JS:`n$($changed -join "`n")" }
        else { Ok "no unexpected JS modifications" }
    }
} catch { Warn "git not available on PATH - skipped the working-tree check" }

# ------------------------------------------------- 6. new assets
Head "6. New files"

$avif = @(Get-ChildItem 'screenshots' -Filter *.avif -ErrorAction SilentlyContinue).Count
$webp = @(Get-ChildItem 'screenshots' -Filter *.webp -ErrorAction SilentlyContinue).Count
if ($avif -eq 5 -and $webp -eq 5) { Ok "screenshots: 5 .avif + 5 .webp" } else { Warn "screenshots: $avif .avif, $webp .webp (expected 5 each) - cosmetic only, no page impact" }
if (Test-Path 'tools/README.md') { Ok "tools/ present" } else { Warn "tools/ missing - you lose the ability to regenerate the critical block" }

# ------------------------------------------------------------------- summary
Write-Host ""
if ($fail -eq 0 -and $warn -eq 0) { Write-Host "ALL CHECKS PASSED - safe to commit." -ForegroundColor Green }
elseif ($fail -eq 0) { Write-Host "PASSED with $warn warning(s) - safe to commit, review the warnings." -ForegroundColor Yellow }
else { Write-Host "$fail FAILURE(S), $warn warning(s) - do NOT commit until these are fixed." -ForegroundColor Red }
Write-Host ""
exit ([int]($fail -gt 0))
