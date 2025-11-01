#!/usr/bin/env bash
# Print current selected light for i3bar, if any
set -euo pipefail

CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ha-i3"
TARGET_FILE="$CACHE_DIR/target"

if [ -f "$TARGET_FILE" ]; then
  IFS=$'\t' read -r entity label < "$TARGET_FILE" || exit 0
  [ -n "${label:-}" ] || label="$entity"
  # Use a simple bulb glyph; keep it short
  printf '💡 %s' "$label"
fi

