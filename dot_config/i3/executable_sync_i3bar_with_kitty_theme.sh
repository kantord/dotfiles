#!/usr/bin/env bash
set -euo pipefail

kitty_theme="${XDG_CONFIG_HOME:-$HOME/.config}/kitty/current-theme.conf"
out_dir="${XDG_CONFIG_HOME:-$HOME/.config}/i3"
out_file="$out_dir/kitty-bar.conf"

kitty_bg="#000000"
if [[ -r "$kitty_theme" ]]; then
  theme_bg_line="$(grep -m1 -E '^background[[:space:]]+#' "$kitty_theme" || true)"
  if [[ -n "$theme_bg_line" ]]; then
    kitty_bg="$(awk '{print $2}' <<<"$theme_bg_line")"
  fi
fi

mkdir -p "$out_dir"

tmp_file="$(mktemp --tmpdir="$out_dir" .kitty-bar.conf.XXXXXX)"
trap 'rm -f "$tmp_file"' EXIT
cat >"$tmp_file" <<EOF
bar {
  status_command "bash /home/kantord/.config/i3/status_command.sh"
  colors {
    background $kitty_bg
  }
}
EOF
mv -f "$tmp_file" "$out_file"

if command -v i3-msg >/dev/null 2>&1; then
  i3-msg reload >/dev/null 2>&1 || true
fi
