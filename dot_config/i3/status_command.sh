#!/bin/bash

export I3_GNOME_POMODORO_ENV_PATH="/home/kantord/.local/bin/i3-gnome-pomodoro"

while true; do
    $I3_GNOME_POMODORO_ENV_PATH status --blinkstick > /dev/null
    s="$HOME/.config/i3/scripts/twm-status-builder/twm-status-builder.sh"
    echo "$($s 'bluetooth/headphones')| $($s 'mpd')│ $($s 'calendar/summary')│ $($s 'pomodoro')│ $($s 'weather:Barcelona') │ $(date +"%H:%M")"
    sleep 1
done
