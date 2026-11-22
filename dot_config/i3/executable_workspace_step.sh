#!/usr/bin/env bash
# Move to the next/previous workspace on the focused output (knob 3).
# Usage: workspace_step.sh next|prev
#
# i3's own next_on_output/prev_on_output wrap around; this clamps instead, so
# the knob has findable extremes the way the colour and brightness knobs do.
set -euo pipefail

# Tactile click for the knob turn itself — fired unconditionally (even if
# clamped at an end below). Plays a sample pre-loaded into PulseAudio's cache
# at i3 startup (see config), ~5ms to trigger vs ~390ms for `paplay` decoding
# the file fresh each time. Backgrounded regardless, so it never delays the
# switch even in the unlikely case pactl hangs.
pactl play-sample workspace-switch-click >/dev/null 2>&1 &

ws_json=$(i3-msg -t get_workspaces)

# Restrict to the focused output, keeping i3's ordering.
output=$(jq -r '.[] | select(.focused) | .output' <<<"$ws_json")
[ -n "$output" ] || exit 0

mapfile -t names < <(jq -r --arg o "$output" '.[] | select(.output == $o) | .name' <<<"$ws_json")
cur=$(jq -r --arg o "$output" '[.[] | select(.output == $o)] | map(.focused) | index(true) // -1' <<<"$ws_json")
[ "$cur" -ge 0 ] || exit 0

case "${1:-next}" in
  next) idx=$((cur + 1)) ;;
  prev) idx=$((cur - 1)) ;;
  *) exit 1 ;;
esac

# Already at an end: stay put rather than jumping to the far side.
((idx < 0)) && exit 0
((idx >= ${#names[@]})) && exit 0

# The whole thing must be a single argument: i3-msg parses leading --flags as
# its own options and dies on --no-auto-back-and-forth otherwise.
i3-msg "workspace --no-auto-back-and-forth \"${names[$idx]}\"" >/dev/null
