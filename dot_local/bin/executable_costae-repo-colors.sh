#!/usr/bin/env bash

ENVS_DIR="${ENWIRO_ENVS_DIR:-$HOME/.enwiro_envs}"
COLORS_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/costae/repo-colors.json"

normalize_repo() {
  case "$1" in
    sep) echo "stacklok-enterprise-platform" ;;
    *)   echo "$1" ;;
  esac
}

update_and_emit() {
  local existing="{}"
  [ -f "$COLORS_FILE" ] && existing=$(cat "$COLORS_FILE")

  local repos=()
  for d in "$ENVS_DIR"/*/; do
    [ -d "$d" ] || continue
    local name
    name=$(basename "$d")
    name="${name%%#*}"
    name="${name%%@*}"
    name=$(normalize_repo "$name")
    repos+=("$name")
  done

  local unique
  unique=$(printf '%s\n' "${repos[@]}" | sort -u | jq -R . | jq -sc .)

  result=$(echo "$existing" | jq -c \
    --argjson repos "$unique" \
    'reduce $repos[] as $r (.; if has($r) then . else . + {($r): ((keys | length) * 137 % 360)} end)')

  mkdir -p "$(dirname "$COLORS_FILE")"
  echo "$result" > "$COLORS_FILE"
  echo "$result"
}

while true; do
  update_and_emit
  sleep 60
done
