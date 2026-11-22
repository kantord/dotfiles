#!/usr/bin/env bash
# Macropad key: step into the screen-brightness mode, and back out to wherever
# you were. The mode to return to is recorded on the way in rather than hardcoded
# to "default", so cycling out of a mode you entered from, say, resize returns
# you to resize.
set -euo pipefail

STATE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/i3-mode-cycle"
STATE_FILE="$STATE_DIR/return-to"

cur=$(i3-msg -t get_binding_state 2>/dev/null | jq -r '.name // "default"')

if [ "$cur" = "brightness" ]; then
  back="default"
  # IFS= keeps a mode name with leading/trailing spaces intact.
  [ -r "$STATE_FILE" ] && IFS= read -r back < "$STATE_FILE"
  i3-msg "mode \"${back:-default}\"" >/dev/null
  exit 0
fi

mkdir -p "$STATE_DIR"
printf '%s\n' "$cur" > "$STATE_FILE"
i3-msg 'mode "brightness"' >/dev/null
notify-send -a "" -u low -t 1200 \
  -h "string:x-canonical-private-synchronous:i3wm.set-brightness.notification" \
  "Screen brightness" "knob 3, or a…; for presets"
