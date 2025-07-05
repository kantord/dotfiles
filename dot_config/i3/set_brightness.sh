#!/usr/bin/env bash
# set-brightness 0-100            – i3 / Dunst friendly
# • Shows a 10-dot Unicode bar
# • Replaces its own previous pop-up (stack-tag)
# • Uses critical urgency so it’s always on top
# • Sends the rounded value to ddcutil VCP code 0x10

set -euo pipefail

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
  -h "string:x-canonical-private-synchronous:i3wm.set-brightness.notification" \
  "Brightness" "$bar"

ddcutil set 10 "$value"
