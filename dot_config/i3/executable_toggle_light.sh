#!/usr/bin/env bash
# Toggle the current Home Assistant light on/off
# - Uses cached target from ha_light_common
# - If turning on and no previous brightness is known, defaults to 60%
set -euo pipefail

. /home/kantord/.config/i3/ha_light_common.sh

resolve_target

HA_CLI="/home/kantord/.local/bin/ha-i3"

get_state_and_brightness() {
  # Echo: state brightness(0-255 or empty)
  local st state b
  st=$($HA_CLI state "$ENTITY_ID" 2>/dev/null || true)
  if command -v jq >/dev/null 2>&1; then
    state=$(printf '%s' "$st" | jq -r '.state // empty' 2>/dev/null || true)
    b=$(printf '%s' "$st" | jq -r '.attributes.brightness // empty' 2>/dev/null || true)
  else
    state=$(printf '%s' "$st" | grep -o '"state":"[^"]*"' | head -n1 | cut -d'"' -f4 || true)
    b=$(printf '%s' "$st" | grep -o '"brightness":[0-9]\+' | head -n1 | cut -d: -f2 || true)
  fi
  printf '%s %s\n' "${state:-}" "${b:-}"
}

brightness_to_pct() {
  # Round: (b*100 + 127)/255
  local b="$1" p
  if ! [[ "$b" =~ ^[0-9]+$ ]]; then printf '0'; return; fi
  p=$(( (b * 100 + 127) / 255 ))
  printf '%d' "$p"
}

state_brightness=$(get_state_and_brightness)
cur_state=${state_brightness%% *}
cur_b_raw=${state_brightness#* }

if [ "${cur_state:-off}" = "on" ]; then
  # Turn off
  $HA_CLI set "$ENTITY_ID" 0
  show_temp_then_restore "Lights" "$LABEL: off" 0.8
else
  # Turn on: use last known brightness if available, otherwise default to 60%
  pct=$(brightness_to_pct "${cur_b_raw:-}")
  if [ -z "$pct" ] || [ "$pct" -le 0 ]; then pct=60; fi
  $HA_CLI set "$ENTITY_ID" "$pct"
  show_temp_then_restore "Lights" "$LABEL: on (${pct}%)" 0.8
fi

