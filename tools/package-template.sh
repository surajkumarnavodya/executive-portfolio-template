#!/usr/bin/env bash
# tools/package-template.sh — build the buyer-facing template distributable.
#
# This is what buyers receive — it is NOT the live site (see
# tools/package-live.sh for that). Uses `git archive` against a real commit
# (default: HEAD), never the working directory, so untracked local files can
# never end up in the zip.
#
# git archive pathspecs can exclude a whole file by path, but they can't
# substitute file CONTENT at a path two products share (e.g. both need a
# file at "index.html", but with different content). So this script excludes
# the live site's real files below, then does one explicit copy step to
# place the already-authored template-safe equivalents at those same paths —
# the same pattern tools/build_bundle.js already uses for the CSS bundle,
# not a new class of risk. See tools/build_template_content.js for how
# index.template.html itself is kept in sync with index.html.
#
# Usage:
#   tools/package-template.sh [output.zip] [git-ref]
#   tools/package-template.sh                        # -> executive-portfolio-template.zip @ HEAD
#   tools/package-template.sh dist/v1.5.2.zip v1.5.2  # explicit output + tag/ref

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT="${1:-executive-portfolio-template.zip}"
REF="${2:-HEAD}"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"

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
#                                        to assets/js/config.js — shipping both left every
#                                        buyer wondering which of the two files to edit
#   robots.txt, sitemap.xml, site.webmanifest - all three hardcode the live domain
#                                        (surajkumarnavodya.com) and/or real identity;
#                                        replaced below with their .template equivalents
#   .gitattributes, .gitignore        - git-only metadata, meaningless once deployed
#   assets/js/asset-integration-test.js, verify-perf-edits.ps1 - stale dev-only
#                                        scripts (see package-live.sh for detail)
git archive --format=zip --output="$WORKDIR/raw.zip" "$REF" -- . \
  ':!.github' \
  ':!.vs' \
  ':!tools' \
  ':!assets/dev' \
  ':!assets/tests' \
  ':!docs/ReleaseQA.md' \
  ':!screenshots' \
  ':!engineering.html' \
  ':!index.html' \
  ':!portfolio.json' \
  ':!assets/js/config.js' \
  ':!assets/js/config.demo.js' \
  ':!assets/js/ui.js' \
  ':!assets/dist/js/template.min.js' \
  ':!assets/images/profile.jpg' \
  ':!assets/images/profile.webp' \
  ':!assets/images/profile.avif' \
  ':!assets/f3230583c0ff' \
  ':!assets/bc8ab7cb7c05' \
  ':!og-image.png' \
  ':!robots.txt' \
  ':!sitemap.xml' \
  ':!site.webmanifest' \
  ':!CLAUDE.md' \
  ':!AGENTS.md' \
  ':!index.template.html' \
  ':!portfolio.template.json' \
  ':!assets/images/profile-placeholder.jpg' \
  ':!assets/images/profile-placeholder.webp' \
  ':!assets/images/profile-placeholder.avif' \
  ':!assets/images/og-image-placeholder.png' \
  ':!robots.template.txt' \
  ':!sitemap.template.xml' \
  ':!site.template.webmanifest' \
  ':!.gitattributes' \
  ':!.gitignore' \
  ':!assets/js/asset-integration-test.js' \
  ':!verify-perf-edits.ps1'

mkdir -p "$WORKDIR/site"
unzip -q "$WORKDIR/raw.zip" -d "$WORKDIR/site"

# Copy the already-authored template-safe substitutes from the working tree
# into place at the paths the live-only files were excluded from above.
# mkdir -p first: if every file that would live in a directory was excluded
# above (true for assets/images/, once profile.* is excluded), git archive
# never creates that directory at all.
mkdir -p "$WORKDIR/site/assets/js" "$WORKDIR/site/assets/images" "$WORKDIR/site/assets/dist/js"
cp index.template.html            "$WORKDIR/site/index.html"
# index.template.html deliberately loads config.demo.js directly (not
# config.js) so it can be opened straight from the source repo for a
# working local preview before packaging. In the package, config.demo.js's
# CONTENT is copied to config.js's PATH (below) and config.demo.js itself is
# excluded (redundant duplicate) — so the copied index.html's <script> tag
# has to be repointed at config.js, or it 404s in the shipped package. Found
# by actually running the built package in a browser, not by reading the code.
sed -i 's#assets/js/config\.demo\.js#assets/js/config.js#' "$WORKDIR/site/index.html"
cp portfolio.template.json        "$WORKDIR/site/portfolio.json"
cp assets/js/config.demo.js       "$WORKDIR/site/assets/js/config.js"
cp assets/images/profile-placeholder.jpg  "$WORKDIR/site/assets/images/profile.jpg"
cp assets/images/profile-placeholder.webp "$WORKDIR/site/assets/images/profile.webp"
cp assets/images/profile-placeholder.avif "$WORKDIR/site/assets/images/profile.avif"
cp assets/images/og-image-placeholder.png "$WORKDIR/site/og-image.png"
cp robots.template.txt            "$WORKDIR/site/robots.txt"
cp sitemap.template.xml           "$WORKDIR/site/sitemap.xml"
cp site.template.webmanifest      "$WORKDIR/site/site.webmanifest"

# ui.js's real Copilot KB (assets/js/ui.js's DEFAULT_KB) needs its own
# genericized build, then the shared JS bundle needs rebuilding with that
# genericized ui.js in place of the real one — the bundle is what index.html
# actually loads, so substituting only the source file wouldn't be enough.
node tools/build_template_ui.js assets/js/ui.js "$WORKDIR/ui.template.js"
cp "$WORKDIR/ui.template.js" "$WORKDIR/site/assets/js/ui.js"
node tools/build_bundle_js.js --override "ui.js=$WORKDIR/ui.template.js" --out "$WORKDIR/site/assets/dist/js/template.min.js"

# build_bundle_js.js only concatenates — real minification is a separate step
# (see tools/README.md). package-live.sh doesn't need this because it ships
# the already-minified, already-committed assets/dist/js/template.min.js
# unchanged; this script rebuilds the bundle fresh (to inject the genericized
# ui.js above) so it has to re-minify too, or buyers get a ~2x larger,
# un-minified bundle despite the "production bundle" README claim.
if command -v npx >/dev/null 2>&1; then
  npx --yes terser "$WORKDIR/site/assets/dist/js/template.min.js" \
    --compress --mangle --format comments=false \
    -o "$WORKDIR/site/assets/dist/js/template.min.js"
else
  echo "WARNING: npx not found — shipping the template bundle un-minified." >&2
fi

# Prefer the `zip` CLI; fall back to Python's stdlib zipfile where it's
# missing (e.g. Git Bash on Windows ships unzip, not zip).
if command -v zip >/dev/null 2>&1; then
  ( cd "$WORKDIR/site" && zip -q -r -X "$OLDPWD/$OUT" . )
else
  python3 - "$WORKDIR/site" "$OUT" <<'PYEOF'
import os, sys, zipfile
src, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, _dirs, files in os.walk(src):
        for name in files:
            full = os.path.join(root, name)
            zf.write(full, os.path.relpath(full, src))
PYEOF
fi

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1)) from $REF"

if [ -f "$ROOT/tools/validate_release.js" ]; then
  echo "Validating template release artifact..."
  node "$ROOT/tools/validate_release.js" --mode template --zip "$OUT"
fi
