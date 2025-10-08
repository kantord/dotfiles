#!/usr/bin/env bash
set -euo pipefail

PIDFILE="/tmp/ffmpeg-recording.pid"

if [[ ! -f "$PIDFILE" ]]; then
  notify-send "🎥 No active recording" "Nothing to stop."
  i3-msg 'mode "default"' >/dev/null
  exit 0
fi

pid="$(cat "$PIDFILE")"
rm -f "$PIDFILE"

# Ask ffmpeg to stop cleanly (same as Ctrl+C)
if kill -INT "$pid" 2>/dev/null; then
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
