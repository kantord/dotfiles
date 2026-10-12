#!/usr/bin/env bash
# start|stop the voxtype dictation daemon.
#
# The daemon keeps the Parakeet model resident so there is no model-load delay
# on the first dictation. On the CUDA build that is ~3.4 GB of VRAM, which can
# starve games; the CPU build (voxtype-onnx-avx2) holds none.
set -euo pipefail

# Optionally capture from one specific PipeWire source for this process only, so
# the system default source is left alone (video calls etc.). Put the node name
# from `pactl list short sources` on one line in ~/.config/voxtype/capture-source;
# without the file the default source is used. PULSE_SOURCE has no effect here
# because voxtype captures through cpal's ALSA backend, and a raw ALSA device name
# can't be used because PipeWire holds the card exclusively.
MIC=$(cat "${XDG_CONFIG_HOME:-$HOME/.config}/voxtype/capture-source" 2>/dev/null || true)

# Match on comm, not the full command line: the binary is voxtype-onnx-avx2 or
# voxtype-onnx-cuda-13 (the name changes with the active variant, so a fixed name misses it), and
# matching the full command line would also match the shell running this script.
voxtype_pids() {
  ps -eo pid,comm | awk '$2 ~ /^voxtype/ { print $1 }'
}

case "${1:-}" in
  start)
    if [ -n "$(voxtype_pids)" ]; then exit 0; fi
    # Only pin the mic if that node actually exists. The node is specific to
    # one machine; elsewhere PIPEWIRE_NODE would name a node that isn't there,
    # which fails silently — capture just comes from the wrong device, or from
    # nothing, with no error anywhere. Falling back to the default source is
    # both correct on other hosts and debuggable on this one.
    # Captured rather than piped into grep -q: under `set -o pipefail`, grep -q
    # closing the pipe early kills pactl with SIGPIPE and the pipeline reports
    # failure on a *successful* match, silently selecting the wrong microphone.
    sources=$(pactl list short sources 2>/dev/null || true)
    if [ -n "$MIC" ] && grep -qF "$MIC" <<<"$sources"; then
      setsid env PIPEWIRE_NODE="$MIC" voxtype daemon >/dev/null 2>&1 </dev/null &
    else
      setsid voxtype daemon >/dev/null 2>&1 </dev/null &
    fi
    ;;
  stop)
    voxtype_pids | xargs -r kill
    # Wait for the processes to actually be gone. Without this, toggling the
    # mode quickly leaves `start` looking at a still-dying process, so it
    # no-ops and you end up with no daemon at all and no error anywhere.
    for _ in $(seq 50); do
      if [ -z "$(voxtype_pids)" ]; then exit 0; fi
      sleep 0.1
    done
    voxtype_pids | xargs -r kill -9
    ;;
  *)
    echo "usage: ${0##*/} start|stop" >&2
    exit 64
    ;;
esac
