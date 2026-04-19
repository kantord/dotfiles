#!/usr/bin/env bash
OUT_DIR=/tmp/claude-usage
NOW=$(date +%s)
STALE=900

if ! ls "$OUT_DIR"/*.json &>/dev/null 2>&1; then
  echo '{"accounts":[]}'
  exit 0
fi

jq -sc --argjson now "$NOW" --argjson stale "$STALE" '
  map(select($now - ._relay.written_at <= $stale))
  | group_by(._relay.email)
  | map(max_by(._relay.written_at))
  | map(select(.rate_limits.five_hour != null))
  | map({
      label: ._relay.email,
      percent: (.rate_limits.five_hour.used_percentage | floor),
      resetsIn: ((.rate_limits.five_hour.resets_at - $now) | if . < 0 then 0 else . end)
    })
  | {accounts: .}
' "$OUT_DIR"/*.json 2>/dev/null || echo '{"accounts":[]}'
