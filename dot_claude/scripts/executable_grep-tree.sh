#!/usr/bin/env bash
# Usage: grep-tree.sh <regexp> <max_bytes> <glob> [dir]
# hson --tree with hard --grep, scoped to files matching glob. Pre-approved for single-approval use.
set -euo pipefail
PATTERN="${1:?Usage: grep-tree.sh <regexp> <max_bytes> <glob> [dir]}"
MAX_BYTES="${2:?Usage: grep-tree.sh <regexp> <max_bytes> <glob> [dir]}"
GLOB="${3:?Usage: grep-tree.sh <regexp> <max_bytes> <glob> [dir]}"
DIR="${4:-.}"
mapfile -t FILES < <(rg --files --glob "$GLOB" "$DIR" 2>/dev/null)
[ ${#FILES[@]} -eq 0 ] && { echo "No files matched '$GLOB' in $DIR" >&2; exit 1; }
hson -C "$MAX_BYTES" --tree --grep "$PATTERN" "${FILES[@]}"
