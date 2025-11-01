#!/usr/bin/env bash
# Exit light control mode and dismiss the entry notification
set -euo pipefail

# Replace the synchronous notification with an empty one that expires immediately
notify-send -a "" -u low -t 1 \
  -h "string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification" \
  "" ""

i3-msg 'mode "default"' >/dev/null 2>&1 || true

