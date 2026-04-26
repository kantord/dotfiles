#!/usr/bin/env bash
# Usage: hson-snapshot.sh <source_dir> [budget] [weak_grep_pattern] [grep_pattern] [capped_grep_pattern]
# Writes hson output to a /tmp file. Prints the path to stdout. Sanity preview to stderr.
# --grep: hard guarantee, matches bypass budget — use only for narrow/known-small patterns.
# --capped-grep: matches compete against budget; prints "N shown, M hidden" to stderr.
# --weak-grep: biases priority queue, no guarantee, no file filtering.
# Pre-approved for single-approval use in TDD cycles.
set -euo pipefail
SRC="${1:-.}"
BUDGET="${2:-50000}"
WEAK_GREP="${3:-}"
GREP="${4:-}"
CAPPED_GREP="${5:-}"

TMP=$(mktemp /tmp/hson-ctx-XXXXXX.txt)

ARGS=(--recursive "$SRC" -C "$BUDGET" --tree)
[ -n "$WEAK_GREP" ]   && ARGS+=(--weak-grep "$WEAK_GREP")
[ -n "$GREP" ]        && ARGS+=(--grep "$GREP")
[ -n "$CAPPED_GREP" ] && ARGS+=(--capped-grep "$CAPPED_GREP" --count-matches)

hson "${ARGS[@]}" > "$TMP"
head -3 "$TMP" >&2
echo "$TMP"
