#!/usr/bin/env bash
# Set Home Assistant light brightness by percent (0-100)
# - Shows a 10-dot bar via notify-send (critical, replaces itself)
# - Snaps to nearest 10 for consistency with monitor brightness mode
# - Controls a single target light entity

set -euo pipefail

ENTITY_ID_DEFAULT="light.tradfri_bulb_4"
LABEL_DEFAULT="Living room desk"

# Resolve target from env override, then cached selection, else defaults
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ha-i3"
TARGET_FILE="$CACHE_DIR/target"

ENTITY_ID="${ENTITY_ID:-}"
LABEL="${LABEL:-}"

if [ -z "$ENTITY_ID" ] && [ -f "$TARGET_FILE" ]; then
  # target file format: entity_id<TAB>friendly_name
  IFS=$'\t' read -r cached_entity cached_label < "$TARGET_FILE" || true
  if [ -n "${cached_entity:-}" ]; then
    ENTITY_ID="$cached_entity"
    if [ -z "$LABEL" ] && [ -n "${cached_label:-}" ]; then LABEL="$cached_label"; fi
  fi
fi

[ -n "$ENTITY_ID" ] || ENTITY_ID="$ENTITY_ID_DEFAULT"
[ -n "$LABEL" ] || LABEL="$LABEL_DEFAULT"

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
  -t 0 \
  -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
  "$LABEL" "$bar"

# 0% should turn light off for a crisp UX
if [ "$value" -eq 0 ]; then
  /home/kantord/.local/bin/ha-i3 set "$ENTITY_ID" 0
  (
    sleep 0.8
    notify-send -a "" -u low -t 0 \
      -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
      "Lights" "$LABEL (space to pick)"
  ) >/dev/null 2>&1 &
  exit 0
fi

/home/kantord/.local/bin/ha-i3 set "$ENTITY_ID" "$value"
(
  sleep 0.8
  notify-send -a "" -u low -t 0 \
    -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
    "Lights" "$LABEL (space to pick)"
) >/dev/null 2>&1 &
