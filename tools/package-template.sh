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
#   assets/images/profile.*           - real photo; replaced below with the placeholder avatar
#   assets/aff991fc366a/              - the real résumé, at its random hashed path — never shipped
#   og-image.png                      - real branded social-preview image
#   CLAUDE.md, AGENTS.md, .github/copilot-instructions.md - AI-assistant session
#                                        logs about this real deployment, not buyer docs
#   index.template.html, portfolio.template.json, assets/images/profile-placeholder.* -
#                                        excluded at their OWN paths here; copied to their
#                                        real in-product paths by the step below instead
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
  ':!assets/images/profile.jpg' \
  ':!assets/images/profile.webp' \
  ':!assets/images/profile.avif' \
  ':!assets/aff991fc366a' \
  ':!og-image.png' \
  ':!CLAUDE.md' \
  ':!AGENTS.md' \
  ':!index.template.html' \
  ':!portfolio.template.json' \
  ':!assets/images/profile-placeholder.jpg' \
  ':!assets/images/profile-placeholder.webp'

mkdir -p "$WORKDIR/site"
unzip -q "$WORKDIR/raw.zip" -d "$WORKDIR/site"

# Copy the already-authored template-safe substitutes from the working tree
# into place at the paths the live-only files were excluded from above.
# mkdir -p first: if every file that would live in a directory was excluded
# above (true for assets/images/, once profile.* is excluded), git archive
# never creates that directory at all.
mkdir -p "$WORKDIR/site/assets/js" "$WORKDIR/site/assets/images"
cp index.template.html            "$WORKDIR/site/index.html"
cp portfolio.template.json        "$WORKDIR/site/portfolio.json"
cp assets/js/config.demo.js       "$WORKDIR/site/assets/js/config.js"
cp assets/images/profile-placeholder.jpg  "$WORKDIR/site/assets/images/profile.jpg"
cp assets/images/profile-placeholder.webp "$WORKDIR/site/assets/images/profile.webp"

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
