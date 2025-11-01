#!/bin/bash

export I3_GNOME_POMODORO_ENV_PATH="/home/kantord/.local/bin/i3-gnome-pomodoro"

while true; do
    $I3_GNOME_POMODORO_ENV_PATH status --blinkstick > /dev/null
    s="$HOME/.config/i3/scripts/twm-status-builder/twm-status-builder.sh"
    light="$HOME/.config/i3/light_status.sh"
    light_segment=""
    if [ -x "$light" ]; then
        ls_out="$($light)"
        if [ -n "$ls_out" ]; then
            light_segment="│ $ls_out "
        fi
    fi
    echo "$($s 'battery/headphones')| $($s 'battery/controllers')| $($s 'battery/laptop')| $($s 'mpd')│ $($s 'calendar/summary')│ $($s 'pomodoro')│ $($s 'weather:Barcelona') $light_segment│ $(date +"%H:%M")"
    sleep 1
done
