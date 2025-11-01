#!/usr/bin/env bash
# Set Home Assistant light color by name (or #RRGGBB)
# Reuses common helpers for target + notifications
set -euo pipefail

. /home/kantord/.config/i3/ha_light_common.sh

resolve_target

name_raw=${1:-}
[ -n "$name_raw" ] || exit 0

to_lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

# Map friendly names to HS values tuned for IKEA TRÅDFRI
name=$(to_lower "$name_raw")
h= s=95
case "$name" in
  red)     h=0   ;;
  orange)  h=30  ;;
  amber)   h=45  ;;
  green)   h=120 ;;
  teal)    h=165 ;;
  blue)    h=240 ;;
  sky)     h=200 ;;
  royal)   h=225 ;;
  purple)  h=280 ;;
  magenta) h=300 ;;
  pink)    h=330 ;;
  *) exit 0 ;; # unknown name: ignore
esac

# Capability check: require hs or rgb support
if command -v jq >/dev/null 2>&1; then
  if ! /home/kantord/.local/bin/ha-i3 state "$ENTITY_ID" \
    | jq -e '.attributes.supported_color_modes // [] | map(ascii_downcase) | any(. == "hs" or . == "rgb")' >/dev/null; then
      notify-send -a "" -u low -t 1200 -h "$TAG" "Lights" "$LABEL: color not supported"
      exit 0
  fi
fi

# Show color name (replaces banner), then restore
notify-send -a "" -u low -t 0 -h "$TAG" "Color" "$name_raw"

# Apply via ha-i3 hs; do not touch brightness
/home/kantord/.local/bin/ha-i3 hs "$ENTITY_ID" "$h" "$s"

# Restore banner after a moment
show_temp_then_restore "Lights" "$LABEL (space to pick)" 0.8
