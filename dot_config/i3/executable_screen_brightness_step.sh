#!/usr/bin/env bash
# Step monitor brightness (knob 3, $mod+i / $mod+Shift+i in brightness mode).
# Usage: screen_brightness_step.sh up|down
#
# Steps relative to the value set_brightness.sh last wrote, since reading the
# monitor back over DDC/CI takes long enough to make a knob feel broken.
set -euo pipefail

STATE_FILE="${XDG_CACHE_HOME:-$HOME/.cache}/i3-brightness/screen"
STEP=5

cur=50
if [ -r "$STATE_FILE" ]; then
  read -r cached < "$STATE_FILE" || true
  [[ "${cached:-}" =~ ^[0-9]+$ ]] && cur="$cached"
fi

case "${1:-up}" in
  up)   new=$((cur + STEP)) ;;
  down) new=$((cur - STEP)) ;;
  *) exit 1 ;;
esac

((new < 0)) && new=0
((new > 100)) && new=100

exec bash "$HOME/.config/i3/set_brightness.sh" "$new"
