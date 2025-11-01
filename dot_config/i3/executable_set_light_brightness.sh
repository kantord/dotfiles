#!/usr/bin/env bash
# Set Home Assistant light brightness by percent (0-100)
# - Shows a 10-dot bar via notify-send (critical, replaces itself)
# - Snaps to nearest 10 for consistency with monitor brightness mode
# - Reuses shared helpers to manage target + banner
set -euo pipefail

. /home/kantord/.config/i3/ha_light_common.sh

resolve_target

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

notify-send -a "" -u critical -t 0 -h "$TAG" "$LABEL" "$bar"

# 0% should turn light off for a crisp UX
if [ "$value" -eq 0 ]; then
  /home/kantord/.local/bin/ha-i3 set "$ENTITY_ID" 0
  show_temp_then_restore "Lights" "$LABEL (space to pick)" 0.8
  exit 0
fi

/home/kantord/.local/bin/ha-i3 set "$ENTITY_ID" "$value"
show_temp_then_restore "Lights" "$LABEL (space to pick)" 0.8
