#!/bin/bash

path_to_search="$HOME/.oh-my-zsh/custom/themes/powerlevel10k/"

if [ -d "$path_to_search" ]; then
    find "$path_to_search" -type f -name '*.zwc' -exec rm -vf {} + >/dev/null 2>&1
fi
