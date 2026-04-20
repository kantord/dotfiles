#!/usr/bin/env bash
# Usage: grep-extensions.sh [dir]
# Lists file counts by extension. Run before grep-raw/grep-tree if unsure of file types.
set -euo pipefail
DIR="${1:-.}"
rg --files "$DIR" 2>/dev/null | grep -oE '\.[^./]+$' | sort | uniq -c | sort -rn | head -30
