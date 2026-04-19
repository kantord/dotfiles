#!/usr/bin/env bash
if ! distrobox list 2>/dev/null | grep -q ubuntu-podman; then
  distrobox create \
    --name ubuntu-podman \
    --image ubuntu:24.04 \
    --init \
    --additional-packages "podman systemd-container gnome-session gnome-terminal nautilus dbus-x11"
fi
distrobox enter ubuntu-podman
