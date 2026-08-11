#!/usr/bin/env bash
# tools/package.sh — build the buyer-facing distributable zip.
#
# Uses `git archive` against a real commit (default: HEAD), never the working
# directory, so anything not tracked by git — .vs/, stray *.patch files, local
# scratch files — can never end up in the zip, regardless of what's sitting
# on disk when this is run. Tracked files that shouldn't ship to buyers
# (source docs, dev-only pages, this tools/ directory itself) are excluded
# below with pathspec magic; they stay in the repo, just not in the archive.
#
# Usage:
#   tools/package.sh [output.zip] [git-ref]
#   tools/package.sh                              # -> executive-portfolio-template.zip @ HEAD
#   tools/package.sh dist/v1.5.1.zip v1.5.1        # explicit output + tag/ref

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT="${1:-executive-portfolio-template.zip}"
REF="${2:-HEAD}"

mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"

# Excluded from the buyer package but kept in the repo:
#   .github/            - repo-only CI/config, not part of the product
#   .vs/                - never tracked, listed here only for clarity
#   tools/               - this packaging tooling and the CSS build scripts
#   assets/dev/          - internal component/theme test harness
#   assets/tests/        - test runner and test files
#   docs/ReleaseQA.md    - internal QA audit notes, not buyer documentation
#   screenshots/         - marketplace listing images, not part of the site
git archive --format=zip --output="$OUT" "$REF" -- . \
  ':!.github' \
  ':!.vs' \
  ':!tools' \
  ':!assets/dev' \
  ':!assets/tests' \
  ':!docs/ReleaseQA.md' \
  ':!screenshots'

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1)) from $REF"
