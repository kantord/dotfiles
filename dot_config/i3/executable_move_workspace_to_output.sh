#!/usr/bin/env bash
set -euo pipefail

# List active outputs
mapfile -t outputs < <(i3-msg -t get_outputs | jq -r '.[] | select(.active) | .name')

if [ "${#outputs[@]}" -eq 0 ]; then
  notify-send "i3" "No active outputs found"
  exit 1
fi

# Current output of the focused workspace
current_output="$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused) | .output')"

# Preselect current output in rofi
selected_row=0
for idx in "${!outputs[@]}"; do
  if [ "${outputs[$idx]}" = "$current_output" ]; then
    selected_row="$idx"
    break
  fi
done

choice="$(printf '%s\n' "${outputs[@]}" | rofi -dmenu -i -p 'Move workspace to output' -selected-row "$selected_row")"

if [ -z "${choice:-}" ]; then
  exit 0
fi

if [ "$choice" = "$current_output" ]; then
  exit 0
fi

i3-msg "move workspace to output $choice" >/dev/null
