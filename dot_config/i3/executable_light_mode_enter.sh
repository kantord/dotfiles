#!/usr/bin/env bash
# Enter light control mode and show a transient notification
set -euo pipefail

# Determine current target label (reuse logic from light_status)
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ha-i3"
TARGET_FILE="$CACHE_DIR/target"
ENTITY_ID_DEFAULT="light.tradfri_bulb_4"
LABEL_DEFAULT="Living room desk"

if [ -f "$TARGET_FILE" ]; then
  IFS=$'\t' read -r entity label < "$TARGET_FILE" || true
  [ -n "${entity:-}" ] || entity="$ENTITY_ID_DEFAULT"
  [ -n "${label:-}" ] || label="$LABEL_DEFAULT"
else
  entity="$ENTITY_ID_DEFAULT"
  label="$LABEL_DEFAULT"
fi

# Show entry notification; brightness/pick actions will replace it via the same tag
notify-send -a "" -u low -t 0 \
  -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
  "Lights" "$label (space to pick)"

i3-msg 'mode "light-brightness"' >/dev/null 2>&1 || true
