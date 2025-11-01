#!/usr/bin/env bash
# Cycle current Home Assistant light selection (next/prev) and update banner
set -euo pipefail

HA_CLI="/home/kantord/.local/bin/ha-i3"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ha-i3"
TARGET_FILE="$CACHE_DIR/target"
ENTITY_ID_DEFAULT="light.tradfri_bulb_4"
LABEL_DEFAULT="Living room desk"

dir="${1:-next}"  # next|prev

mkdir -p "$CACHE_DIR"

# Get list of lights (entity_id<TAB>label), one per line
if ! list="$($HA_CLI list 2>/dev/null)"; then
  notify-send -u low "Lights" "Cannot list lights"
  exit 1
fi

mapfile -t lines < <(printf '%s\n' "$list" | sed '/^\s*$/d')
count=${#lines[@]}
if [ "$count" -eq 0 ]; then
  notify-send -u low "Lights" "No lights found"
  exit 1
fi

# Current target
cur_entity="$ENTITY_ID_DEFAULT"
cur_label="$LABEL_DEFAULT"
if [ -f "$TARGET_FILE" ]; then
  IFS=$'\t' read -r ce cl < "$TARGET_FILE" || true
  [ -n "${ce:-}" ] && cur_entity="$ce"
  [ -n "${cl:-}" ] && cur_label="$cl"
fi

# Find index of current entity
idx=-1
for i in "${!lines[@]}"; do
  ent=${lines[$i]%%$'\t'*}
  if [ "$ent" = "$cur_entity" ]; then idx=$i; break; fi
done

if [ "$idx" -lt 0 ]; then
  idx=0
fi

if [ "$dir" = "prev" ]; then
  new_idx=$(( (idx - 1 + count) % count ))
else
  new_idx=$(( (idx + 1) % count ))
fi

new_line=${lines[$new_idx]}
new_entity=${new_line%%$'\t'*}
new_label=${new_line#*$'\t'}
if [ "$new_entity" = "$new_label" ]; then
  new_label="$new_entity"
fi

printf '%s\t%s\n' "$new_entity" "$new_label" > "$TARGET_FILE"

# Refresh persistent banner in-place (same tag, no flash)
notify-send -a "" -u low -t 0 \
  -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
  "Lights" "$new_label (space to pick)"

