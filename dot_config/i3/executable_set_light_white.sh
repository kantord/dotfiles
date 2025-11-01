#!/usr/bin/env bash
# Set white spectrum (color temperature) preserving brightness
# Accepts a Kelvin value (e.g., 2700 3000 4000 ...)
set -euo pipefail

. /home/kantord/.config/i3/ha_light_common.sh

resolve_target

K_IN=${1:-}
if ! [[ "$K_IN" =~ ^[0-9]+$ ]]; then
  exit 0
fi

kelvin_to_mireds() { printf '%d' $(( 1000000 / $1 )); }

# If available, read min/max mireds from state; otherwise use safe defaults
MIN_M=153
MAX_M=500
if command -v jq >/dev/null 2>&1; then
  st=$(/home/kantord/.local/bin/ha-i3 state "$ENTITY_ID") || st=""
  v=$(printf '%s' "$st" | jq -er '.attributes.min_mireds' 2>/dev/null || true); [ -n "${v:-}" ] && MIN_M="$v"
  v=$(printf '%s' "$st" | jq -er '.attributes.max_mireds' 2>/dev/null || true); [ -n "${v:-}" ] && MAX_M="$v"
fi

M=$(kelvin_to_mireds "$K_IN")
(( M < MIN_M )) && M=$MIN_M
(( M > MAX_M )) && M=$MAX_M
# Recompute Kelvin to apply based on clamped mireds
K_APPLY=$(( 1000000 / M ))

# Show white selection replacing banner, then restore
notify-send -a "" -u low -t 0 -h "$TAG" "White" "${K_IN}K"

# Apply via ha-i3 ct (sends both kelvin and color_temp)
/home/kantord/.local/bin/ha-i3 ct "$ENTITY_ID" "$K_APPLY"

show_temp_then_restore "Lights" "$LABEL (space to pick)" 0.8
