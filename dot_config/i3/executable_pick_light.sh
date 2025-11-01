#!/usr/bin/env bash
# Pick a Home Assistant light via rofi and cache selection
set -euo pipefail

HA_CLI="/home/kantord/.local/bin/ha-i3"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ha-i3"
TARGET_FILE="$CACHE_DIR/target"

mkdir -p "$CACHE_DIR"

if ! command -v rofi >/dev/null 2>&1; then
  notify-send -u low "Light picker" "rofi not found"
  exit 1
fi

# Get list: entity_id<TAB>friendly_name
if ! list="$($HA_CLI list)"; then
  notify-send -u normal "Light picker" "Failed to list lights"
  exit 1
fi

choice=$(printf '%s\n' "$list" | rofi -dmenu -i -p "Pick light")

# No selection → do nothing
if [ -z "$choice" ]; then
  exit 0
fi

# Expect a tab-delimited line; fallback to entire choice as entity id
entity_id=${choice%%$'\t'*}
label=${choice#*$'\t'}
if [ "$entity_id" = "$label" ]; then
  label="$entity_id"
fi

printf '%s\t%s\n' "$entity_id" "$label" > "$TARGET_FILE"

notify-send -u low -t 800 -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
  "Controlling" "$label"

