#!/bin/sh
# Separate state file: the outer chezmoi holds a lock on the default one
# while run scripts execute.
set -eu
private_source="$HOME/repos/dotfiles-private"
state="${XDG_CONFIG_HOME:-$HOME/.config}/chezmoi/chezmoistate-private.boltdb"
[ -d "$private_source/.git" ] || exit 0
exec chezmoi --source "$private_source" --persistent-state "$state" apply
