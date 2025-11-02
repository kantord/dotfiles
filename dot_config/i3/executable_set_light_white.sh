#!/usr/bin/env bash
# Set white spectrum (color temperature) preserving brightness
# Accepts a Kelvin value (e.g., 2700 3000 4000 ...)
set -euo pipefail

. /home/kantord/.config/i3/ha_light_common.sh

resolve_target

K_IN=${1:-}
if ! [[ "$K_IN" =~ ^[0-9]+$ ]]; then
  exit 0
fi

kelvin_to_mireds() { printf '%d' $(( 1000000 / $1 )); }

# Detect capabilities and choose strategy
supports_ct=false
st_json=""
if command -v jq >/dev/null 2>&1; then
  st_json=$(/home/kantord/.local/bin/ha-i3 state "$ENTITY_ID") || st_json=""
  if [ -n "$st_json" ] && printf '%s' "$st_json" | jq -e '.attributes.supported_color_modes | map(ascii_downcase) | any(. == "color_temp")' >/dev/null 2>&1; then
    supports_ct=true
  fi
fi

if $supports_ct; then
  # If available, read min/max mireds from state; otherwise use safe defaults
  MIN_M=153
  MAX_M=500
  if [ -n "$st_json" ]; then
    v=$(printf '%s' "$st_json" | jq -er '.attributes.min_mireds' 2>/dev/null || true); [ -n "${v:-}" ] && MIN_M="$v"
    v=$(printf '%s' "$st_json" | jq -er '.attributes.max_mireds' 2>/dev/null || true); [ -n "${v:-}" ] && MAX_M="$v"
  fi

  M=$(kelvin_to_mireds "$K_IN")
  (( M < MIN_M )) && M=$MIN_M
  (( M > MAX_M )) && M=$MAX_M
  # Recompute Kelvin to apply based on clamped mireds
  K_APPLY=$(( 1000000 / M ))

  # Show white selection replacing banner, then restore
  notify-send -a "" -u low -t 0 -h "$TAG" "White" "${K_IN}K"
  # Apply via ha-i3 ct (sends both kelvin and color_temp)
  /home/kantord/.local/bin/ha-i3 ct "$ENTITY_ID" "$K_APPLY"
  show_temp_then_restore "Lights" "$LABEL (space to pick)" 0.8
  exit 0
fi

# Fallback for bulbs without native color_temp support: approximate using HS
# Convert Kelvin -> RGB -> HS and apply via ha-i3 hs
# Tuning: make warmest warmer and coldest slightly less blue by remapping
# requested range [2200..6500] -> [2000..6000] and scaling saturation by K.
kelvin_to_rgb() {
  awk -v K="$1" '
    function clamp(x, a, b) { return x < a ? a : (x > b ? b : x) }
    BEGIN {
      if (K < 1000) K = 1000; if (K > 40000) K = 40000;
      t = K / 100.0;
      # Red
      if (t <= 66) R = 255; else R = 329.698727446 * ((t - 60) ^ (-0.1332047592));
      R = clamp(int(R + 0.5), 0, 255);
      # Green
      if (t <= 66) G = 99.4708025861 * log(t) - 161.1195681661; else G = 288.1221695283 * ((t - 60) ^ (-0.0755148492));
      G = clamp(int(G + 0.5), 0, 255);
      # Blue
      if (t >= 66) B = 255; else if (t <= 19) B = 0; else B = 138.5177312231 * log(t - 10) - 305.0447927307;
      B = clamp(int(B + 0.5), 0, 255);
      printf "%d %d %d\n", R, G, B;
    }
  '
}

rgb_to_hs() {
  awk -v R="$1" -v G="$2" -v B="$3" '
    function max(a,b){return a>b?a:b}
    function min(a,b){return a<b?a:b}
    BEGIN {
      r = R/255.0; g = G/255.0; b = B/255.0;
      mx = r; if (g>mx) mx=g; if (b>mx) mx=b;
      mn = r; if (g<mn) mn=g; if (b<mn) mn=b;
      d = mx - mn;
      # Saturation
      s = (mx == 0) ? 0 : d / mx;
      # Hue
      if (d == 0) {
        h = 0;
      } else if (mx == r) {
        h = ( (g - b) / d ); if (h < 0) h += 6;
      } else if (mx == g) {
        h = ( (b - r) / d ) + 2;
      } else {
        h = ( (r - g) / d ) + 4;
      }
      h_deg = h * 60.0;
      s_pct = s * 100.0;
      printf "%d %d\n", int(h_deg+0.5), int(s_pct+0.5);
    }
  '
}

K_SRC_LOW=2200
K_SRC_HIGH=6500
# Remap extremes for color-only bulbs: make warmest warmer, coolest less blue
K_MAP_LOW=1800
K_MAP_HIGH=5600
K_ADJ="$K_IN"
if [ "$K_IN" -le "$K_SRC_LOW" ]; then
  K_ADJ=$K_MAP_LOW
elif [ "$K_IN" -ge "$K_SRC_HIGH" ]; then
  K_ADJ=$K_MAP_HIGH
else
  # Linear remap within range
  # K_adj = low + (K - src_low) * (map_span / src_span)
  K_ADJ=$(( K_MAP_LOW + ( (K_IN - K_SRC_LOW) * (K_MAP_HIGH - K_MAP_LOW) ) / (K_SRC_HIGH - K_SRC_LOW) ))
fi

read -r R G B < <(kelvin_to_rgb "$K_ADJ")
read -r H S < <(rgb_to_hs "$R" "$G" "$B")

# Scale saturation by temperature using a stronger curve:
# - Warm end more saturated (closer to amber), cool end much less saturated
# - Quadratic blend to aggressively desaturate near cool end
warm_scale=100
cold_scale=35
span=$((K_MAP_HIGH - K_MAP_LOW))
pos=$((K_ADJ - K_MAP_LOW))
[ "$span" -le 0 ] && span=1
[ "$pos" -lt 0 ] && pos=0
[ "$pos" -gt "$span" ] && pos=$span
# t in [0,1]; use t^2 for stronger cool-end effect
t_num=$((pos * 10000 / span))   # fixed-point (x10000)
t2=$(( (t_num * t_num) / 10000 ))
scale_percent=$(( (warm_scale * (10000 - t2) + cold_scale * t2 + 5000) / 10000 ))
S=$(( (S * scale_percent + 50) / 100 ))
if [ "$S" -gt 100 ]; then S=100; fi
if [ "$S" -lt 0 ]; then S=0; fi

notify-send -a "" -u low -t 0 -h "$TAG" "White" "${K_IN}K (HS approx)"
/home/kantord/.local/bin/ha-i3 hs "$ENTITY_ID" "$H" "$S"
show_temp_then_restore "Lights" "$LABEL (space to pick)" 0.8
