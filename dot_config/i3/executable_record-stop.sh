#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${XDG_RUNTIME_DIR:?XDG_RUNTIME_DIR is not set}"
PIDFILE="$RUNTIME_DIR/ffmpeg-recording.pid"

if [[ ! -f "$PIDFILE" ]]; then
  notify-send "🎥 No active recording" "Nothing to stop."
  i3-msg 'mode "default"' >/dev/null
  exit 0
fi

pid="$(cat "$PIDFILE")"
rm -f "$PIDFILE"

# Only signal the process if it really is ffmpeg (guards against a stale or wrong PID).
# Ask ffmpeg to stop cleanly (same as Ctrl+C)
if [[ "$(ps -o comm= -p "$pid" 2>/dev/null)" == ffmpeg ]] && kill -INT "$pid" 2>/dev/null; then
  # Wait until ffmpeg actually exits and closes the file
  while kill -0 "$pid" 2>/dev/null; do
    sleep 0.2
  done
  # Flush FS buffers to be extra-safe
  sync
  notify-send "✅ Recording saved" "File finalized successfully."
else
  notify-send "⚠️ Couldn't stop recording" "Process already ended?"
fi

# Back to normal i3 mode
i3-msg 'mode "default"' >/dev/null
