#!/usr/bin/env bash
DISP=2
while [ -e /tmp/.X${DISP}-lock ]; do DISP=$((DISP + 1)); done

Xephyr :${DISP} -screen 1920x1080 -ac &
XEPHYR_PID=$!
sleep 0.5

distrobox enter ubuntu-podman -- bash -c "DISPLAY=:${DISP} dbus-launch --exit-with-session gnome-session"

kill $XEPHYR_PID 2>/dev/null
