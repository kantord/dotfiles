#!/usr/bin/env bash
# Usage: grep-raw.sh <regexp> <max_lines> <glob> [dir]
# Raw ripgrep results with file:line context. Pre-approved for single-approval use.
set -euo pipefail
PATTERN="${1:?Usage: grep-raw.sh <regexp> <max_lines> <glob> [dir]}"
MAX_LINES="${2:?Usage: grep-raw.sh <regexp> <max_lines> <glob> [dir]}"
GLOB="${3:?Usage: grep-raw.sh <regexp> <max_lines> <glob> [dir]}"
DIR="${4:-.}"
rg --with-filename --line-number --no-heading --color=never --glob "$GLOB" "$PATTERN" "$DIR" | head -"$MAX_LINES"
