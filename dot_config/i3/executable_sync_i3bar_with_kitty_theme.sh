#!/usr/bin/env bash
set -euo pipefail

kitty_config_dir="${XDG_CONFIG_HOME:-$HOME/.config}/kitty"
kitty_theme_primary="$kitty_config_dir/themes.conf"
kitty_theme_fallback="$kitty_config_dir/current-theme.conf"
out_dir="${XDG_CONFIG_HOME:-$HOME/.config}/i3"
out_file="$out_dir/kitty-bar.conf"

declare -A visited=()

extract_bg_from_file() {
  local file="$1"
  local line included_file_path included_file_raw

  [[ -r "$file" ]] || return 1
  [[ -n "${visited[$file]:-}" ]] && return 1
  visited["$file"]=1

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    if [[ "$line" =~ ^[[:space:]]*background[[:space:]]+(#[0-9a-fA-F]{6,8})\b ]]; then
      printf '%s\n' "${BASH_REMATCH[1]}"
      return 0
    fi

    if [[ "$line" =~ ^[[:space:]]*include[[:space:]]+(.+)$ ]]; then
      included_file_raw="${BASH_REMATCH[1]}"
      included_file_raw="${included_file_raw%%#*}"
      included_file_raw="$(printf '%s' "$included_file_raw" | xargs)"
      [[ -z "$included_file_raw" ]] && continue

      if [[ "$included_file_raw" = /* ]]; then
        included_file_path="$included_file_raw"
      else
        included_file_path="$kitty_config_dir/$included_file_raw"
      fi

      if extract_bg_from_file "$included_file_path"; then
        return 0
      fi
    fi
  done <"$file"

  return 1
}

kitty_bg="$(
  # Most reliable: kitty writes the active theme colors here.
  if [[ -r "$kitty_config_dir/current-theme.conf" ]]; then
    grep -m1 -E '^[[:space:]]*background[[:space:]]+#' "$kitty_config_dir/current-theme.conf" \
      | awk '{print $2}' && exit 0
  fi

  # If we are running inside kitty, query the colors directly.
  if command -v kitty >/dev/null 2>&1; then
    kitty @ get-colors 2>/dev/null | awk '$1 == "background" { print $2; exit }' && exit 0
  fi

  # Fallback: parse config files and follow include directives.
  extract_bg_from_file "$kitty_theme_primary" || extract_bg_from_file "$kitty_theme_fallback" || printf '%s\n' '#000000'
)"

mkdir -p "$out_dir"

umask 077
cat >"$out_file" <<EOF
bar {
  status_command "bash /home/kantord/.config/i3/status_command.sh"
  colors {
    background $kitty_bg
  }
}
EOF

if command -v hsetroot >/dev/null 2>&1; then
  hsetroot -solid "$kitty_bg" >/dev/null 2>&1 || true
fi
