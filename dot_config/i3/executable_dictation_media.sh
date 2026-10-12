#!/usr/bin/env bash
# pause|resume media playback around dictation mode.
#
# Deliberately not `playerctl play-pause`: with no -p that acts on whichever
# player playerctl happens to sort first, which is not necessarily the one that
# was actually playing. That's how you end up resuming a Chromium tab from an
# hour ago instead of the music you just paused. Instead, record the exact
# player instances that were Playing and resume only those, by name.
set -uo pipefail

STATE="${XDG_RUNTIME_DIR:-/tmp}/dictation-paused-players"

# `playerctl -a metadata` omits players with no track loaded (a Stopped
# Chromium tab never appears in it), so enumerate with -l and ask each player
# for its status individually rather than parsing one bulk call.
playing_players() {
  local p
  for p in $(playerctl -l 2>/dev/null); do
    [ "$(playerctl -p "$p" status 2>/dev/null)" = "Playing" ] && printf '%s\n' "$p"
  done
}

case "${1:-}" in
  pause)
    : >"$STATE"
    while read -r p; do
      # Only record players that actually accepted the pause, so resume can't
      # revive something that was never ours to pause.
      playerctl -p "$p" pause 2>/dev/null && printf '%s\n' "$p" >>"$STATE"
    done < <(playing_players)
    ;;
  resume)
    # No state file means nothing was playing when dictation started.
    [ -f "$STATE" ] || exit 0
    while read -r p; do
      # Browser instance names embed a PID, so if the browser restarted during
      # dictation this no-ops. That is the right failure mode: better to resume
      # nothing than to resume the wrong player.
      [ -n "$p" ] && playerctl -p "$p" play 2>/dev/null
    done <"$STATE"
    rm -f "$STATE"
    ;;
  *)
    echo "usage: ${0##*/} pause|resume" >&2
    exit 64
    ;;
esac

exit 0
