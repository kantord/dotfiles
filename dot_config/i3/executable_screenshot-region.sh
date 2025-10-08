#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="/home/kantord/Pictures/Screenshots"
mkdir -p "$OUTPUT_DIR"

# Region selection (single interaction). If canceled, bail out.
if ! region="$(slop -f '%x,%y %wx%h')"; then
  notify-send "📸 Screenshot canceled" "No region selected."
  exit 0
fi

# Parse region: "X,Y WxH" -> convert to geometry format "WxH+X+Y"
pos="${region%% *}"  # "X,Y"
size="${region#* }"  # "WxH"
x="${pos%,*}"
y="${pos#*,}"
geometry="${size}+${x}+${y}"

timestamp="$(date +'%Y-%m-%d_%H-%M-%S')"
outfile="$OUTPUT_DIR/screenshot-${timestamp}.png"

# Take screenshot using scrot
if scrot -a "${x},${y},${size%x*},${size#*x}" "$outfile"; then
  notify-send "📸 Screenshot saved" "$(basename "$outfile")"
else
  notify-send "❌ Screenshot failed" "Could not capture region."
  exit 1
fi
