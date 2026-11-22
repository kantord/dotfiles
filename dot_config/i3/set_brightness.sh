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

# No snapping: the knob steps finer than the ten-dot bar can show, so the bar
# is a coarse gauge and the number beside it is the truth.
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
  "Brightness" "$bar ${value}%"

# Record the value so the knob can step relative to it — `ddcutil getvcp` is
# far too slow to sit in a knob's hot path.
STATE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/i3-brightness"
mkdir -p "$STATE_DIR"
printf '%s\n' "$value" > "$STATE_DIR/screen"

ddcutil set 10 "$value"
