#!/usr/bin/env bash
set -euo pipefail

MAX_ENTRIES=50
LOOKBACK_DAYS=30

HOT_DIRS=(
  "$HOME/Downloads"
  "$HOME/Pictures/Screenshots"
  "$HOME/Desktop"
)

collect() {
  python3 - <<'PY'
import datetime, os, sys, urllib.parse, xml.etree.ElementTree as ET

xbel = os.path.expanduser("~/.local/share/recently-used.xbel")
if not os.path.exists(xbel):
    sys.exit(0)
try:
    root = ET.parse(xbel).getroot()
except ET.ParseError:
    sys.exit(0)

for b in root.findall("bookmark"):
    href = b.get("href", "")
    if not href.startswith("file://"):
        continue
    path = urllib.parse.unquote(href[len("file://"):])
    if not os.path.isfile(path):
        continue
    stamp = b.get("modified") or b.get("added") or ""
    try:
        ts = datetime.datetime.fromisoformat(stamp.replace("Z", "+00:00")).timestamp()
    except ValueError:
        try:
            ts = os.path.getmtime(path)
        except OSError:
            continue
    print(f"{ts:.6f}\t{path}")
PY

  local cutoff_min=$(( LOOKBACK_DAYS * 24 * 60 ))
  local d
  for d in "${HOT_DIRS[@]}"; do
    [[ -d "$d" ]] || continue
    find "$d" -type f -mmin "-$cutoff_min" \
      -not -path '*/.*' \
      -printf '%T@\t%p\n' 2>/dev/null || true
  done
}

candidates=$(
  collect \
    | sort -rn -t $'\t' -k1,1 \
    | awk -F'\t' -v n="$MAX_ENTRIES" '!seen[$2]++ && c < n { print $2; c++ }'
)

if [[ -z "$candidates" ]]; then
  notify-send "Recent files" "Nothing found."
  exit 0
fi

icon_for() {
  # For types covered by a registered XDG thumbnailer (images natively, videos
  # via ffmpegthumbnailer, PDFs via evince, audio cover art via tumbler+taglib,
  # etc.), pass the file path so rofi generates/loads the thumbnail. For
  # everything else, fall back to a mime-type icon.
  local lower="${1,,}"
  case "$lower" in
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.bmp|*.svg|*.avif|*.heic|*.heif|*.tiff|*.tif| \
    *.mp4|*.mkv|*.webm|*.avi|*.mov|*.m4v|*.wmv|*.flv| \
    *.mp3|*.flac|*.wav|*.ogg|*.opus|*.m4a|*.aac| \
    *.pdf|*.epub| \
    *.otf|*.ttf|*.woff|*.woff2)
      printf '%s' "$1" ;;
    *.zip|*.tar|*.tgz|*.tar.gz|*.tar.xz|*.tar.bz2|*.7z|*.rar|*.gz|*.xz|*.bz2)
      printf 'package-x-generic' ;;
    *)
      printf 'text-x-generic' ;;
  esac
}

menu_input() {
  # Note: ${path/#$HOME/~} works in zsh but bash mis-parses the / inside $HOME
  # as the pattern/replacement separator. Use prefix-strip + prepend instead.
  local path display icon stripped
  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    stripped="${path#"$HOME"}"
    if [[ "$stripped" != "$path" ]]; then
      display="~$stripped"
    else
      display="$path"
    fi
    icon="$(icon_for "$path")"
    printf '%s\0icon\x1f%s\n' "$display" "$icon"
  done <<<"$candidates"
}

choice=$(menu_input | PREVIEW=true rofi -dmenu -i -matching fuzzy -p "recent" \
  -no-custom -show-icons -theme ~/.config/rofi/recent-files.rasi) || exit 0

selected="${choice/#\~/$HOME}"
if [[ ! -f "$selected" ]]; then
  notify-send "Recent files" "File not found: $selected"
  exit 1
fi

printf %s "$selected" | xclip -selection clipboard
printf %s "$selected" | xclip -selection primary
notify-send "📋 Path copied" "$selected"
