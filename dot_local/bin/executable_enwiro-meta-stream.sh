#!/usr/bin/env bash
ENVS_DIR="${ENWIRO_ENVS_DIR:-$HOME/.enwiro_envs}"
while true; do
  result=$(
    for meta_file in "$ENVS_DIR"/*/meta.json; do
      [ -f "$meta_file" ] || continue
      env_name=$(basename "$(dirname "$meta_file")")
      jq -c --arg name "$env_name" '{($name): {cookbook: (.cookbook // ""), description: (.description // null)}}' "$meta_file" 2>/dev/null
    done | jq -sc 'add // {}'
  )
  echo "${result:-{\}}"
  sleep 30
done
