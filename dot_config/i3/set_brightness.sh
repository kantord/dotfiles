#!/usr/bin/env bash
# Usage: set-brightness 0-100
# Shows a ☀ icon plus a 10-dot bar made of plain-Unicode circles.

set -euo pipefail

value=${1:-50}

# Clamp to 0-100 and snap to the nearest 10 %
((value < 0)) && value=0
((value > 100)) && value=100
value=$(((value + 5) / 10 * 10))

filled=$((value / 10))
empty=$((10 - filled))

ICON=$'\u2600'       # ☀  (black sun with rays)
DOT_FILLED=$'\u25CF' # ●  (black circle)
DOT_EMPTY=$'\u25CB'  # ○  (white circle)

bar=""
for ((i = 0; i < filled; i++)); do bar+=$DOT_FILLED; done
for ((i = 0; i < empty; i++)); do bar+=$DOT_EMPTY; done

notify-send "$ICON  $bar"
ddcutil set 10 "$value" # or: ddcutil setvcp 10 "$value"
