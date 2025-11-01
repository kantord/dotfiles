#!/usr/bin/env bash
# Shared helpers for i3 HA light control scripts
set -euo pipefail

HA_CLI="/home/kantord/.local/bin/ha-i3"

ENTITY_ID_DEFAULT="light.tradfri_bulb_4"
LABEL_DEFAULT="Living room desk"

CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ha-i3"
TARGET_FILE="$CACHE_DIR/target"
TAG="string:x-canonical-private-synchronous:i3wm.set-light-brightness.notification"

resolve_target() {
  mkdir -p "$CACHE_DIR"
  : "${ENTITY_ID:=}"
  : "${LABEL:=}"
  if [ -z "${ENTITY_ID}" ] && [ -f "$TARGET_FILE" ]; then
    IFS=$'\t' read -r cached_entity cached_label < "$TARGET_FILE" || true
    if [ -n "${cached_entity:-}" ]; then
      ENTITY_ID="$cached_entity"
      if [ -z "$LABEL" ] && [ -n "${cached_label:-}" ]; then LABEL="$cached_label"; fi
    fi
  fi
  [ -n "$ENTITY_ID" ] || ENTITY_ID="$ENTITY_ID_DEFAULT"
  [ -n "$LABEL" ] || LABEL="$LABEL_DEFAULT"
}

show_banner_persistent() {
  notify-send -a "" -u low -t 0 -h "$TAG" "Lights" "$LABEL (space to pick)"
}

show_temp_then_restore() {
  # Args: title body [delay_seconds]
  local title="$1" body="$2" delay="${3:-0.8}"
  notify-send -a "" -u low -t 0 -h "$TAG" "$title" "$body"
  (
    sleep "$delay"
    notify-send -a "" -u low -t 0 -h "$TAG" "Lights" "$LABEL (space to pick)"
  ) >/dev/null 2>&1 &
}

