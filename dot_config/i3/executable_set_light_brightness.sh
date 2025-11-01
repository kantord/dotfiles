#!/usr/bin/env bash
# Set Home Assistant light brightness by percent (0-100)
# - Shows a 10-dot bar via notify-send (critical, replaces itself)
# - Snaps to nearest 10 for consistency with monitor brightness mode
# - Controls a single target light entity

set -euo pipefail

ENTITY_ID="${ENTITY_ID:-light.tradfri_bulb_4}"
LABEL="${LABEL:-Living room desk}"

value=${1:-50}
((value < 0)) && value=0
((value > 100)) && value=100
value=$(((value + 5) / 10 * 10)) # snap to nearest 10 %

filled=$((value / 10))
empty=$((10 - filled))

DOT_FILLED=$'\u25CF' # ● black circle
DOT_EMPTY=$'\u25CB'  # ○ white circle

bar=""
for ((i = 0; i < filled; i++)); do bar+=$DOT_FILLED; done
for ((i = 0; i < empty; i++)); do bar+=$DOT_EMPTY; done

notify-send -a "" \
  -u critical \
  -t 800 \
  -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
  "$LABEL" "$bar"

# 0% should turn light off for a crisp UX
if [ "$value" -eq 0 ]; then
  /home/kantord/.local/bin/ha-i3 set "$ENTITY_ID" 0
  exit 0
fi

/home/kantord/.local/bin/ha-i3 set "$ENTITY_ID" "$value"
