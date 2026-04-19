#!/usr/bin/env bash
INPUT=$(cat)
OUT_DIR=/tmp/claude-usage
mkdir -p "$OUT_DIR"

SESSION=$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"')
CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
EMAIL=$(jq -r '.claudeAiOauth.subscriptionType // "claude"' "$CONFIG_DIR/.credentials.json" 2>/dev/null || echo claude)
NOW=$(date +%s)

TMP=$(mktemp "$OUT_DIR/.tmp.XXXXXX")
printf '%s' "$INPUT" \
  | jq --arg email "$EMAIL" --argjson ts "$NOW" '. + {_relay: {email: $email, written_at: $ts}}' \
  > "$TMP"
mv "$TMP" "$OUT_DIR/$SESSION.json"

printf '%s' "$INPUT" | jq -r 'if .rate_limits.five_hour then "5h:\(.rate_limits.five_hour.used_percentage | round)%" else "" end' 2>/dev/null
