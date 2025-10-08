#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="/home/kantord/Videos"
PIDFILE="/tmp/ffmpeg-recording.pid"
LOGFILE="/tmp/ffmpeg-recording.log"

# If already recording, don't start a new one
if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  notify-send "🎥 Already recording" "Use recording mode exit to stop."
  exit 0
fi

mkdir -p "$OUTPUT_DIR"

# Region selection (single interaction). If canceled, bail out.
if ! region="$(slop -f '%x,%y %wx%h')"; then
  notify-send "🎥 Recording canceled" "No region selected."
  exit 0
fi

timestamp="$(date +'%Y-%m-%d_%H-%M-%S')"
outfile="$OUTPUT_DIR/recording-${timestamp}.mp4"

# Parse region: "X,Y WxH" -> extract W and H, ensure even dimensions for H.264
size="${region#* }"  # "WxH"
width="${size%x*}"
height="${size#*x}"

# Round down to even numbers (H.264 requires dimensions divisible by 2)
width=$(( width & ~1 ))
height=$(( height & ~1 ))

# Start ffmpeg (no audio), backgrounded; store PID
# -INT (stop) will finalize the file cleanly
# Use ultrafast for low CPU, tweak as you wish.
ffmpeg -y \
  -f x11grab -video_size "${width}x${height}" -i ":0.0+${region%% *}" \
  -r 30 -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  "$outfile" >"$LOGFILE" 2>&1 &

echo $! > "$PIDFILE"

notify-send "🎥 Recording started" "Saving to: $(basename "$outfile")"
# Enter i3 recording mode only if ffmpeg started
i3-msg 'mode "recording"'
