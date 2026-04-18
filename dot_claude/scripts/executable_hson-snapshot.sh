#!/usr/bin/env bash
# Usage: hson-snapshot.sh <source_dir> [budget] [weak_grep_pattern] [grep_pattern]
# Writes hson output to a /tmp file. Prints the path to stdout. Sanity preview to stderr.
# --grep guarantees matched lines + ancestors regardless of budget.
# --weak-grep biases priority queue without guaranteeing inclusion.
# Pre-approved for single-approval use in TDD cycles.
set -euo pipefail
SRC="${1:-.}"
BUDGET="${2:-50000}"
WEAK_GREP="${3:-}"
GREP="${4:-}"

TMP=$(mktemp /tmp/hson-ctx-XXXXXX.txt)

ARGS=(--recursive "$SRC" -C "$BUDGET" --tree)
[ -n "$WEAK_GREP" ] && ARGS+=(--weak-grep "$WEAK_GREP")
[ -n "$GREP" ]      && ARGS+=(--grep "$GREP")

hson "${ARGS[@]}" > "$TMP" 2>/dev/null
head -3 "$TMP" >&2
echo "$TMP"
