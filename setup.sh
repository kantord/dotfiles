#!/usr/bin/env bash
# This script should mainly be used by GitHub Codespaces

# exit on error and print each command 
set -euxo pipefail

# ~/.dotfiles ==> directory where this script is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -e ~/.dotfiles ]] || ln -s "$DIR" ~/.dotfiles

# download and install chezmoi to ~/.local/bin
[[ -e ~/.local/bin/chezmoi ]] || BINDIR=~/.local/bin sh -c "$(curl -fsSL get.chezmoi.io)"

# Set default shell to zsh
if [ "$(uname)" != "Darwin" ]; then
    # Set default shell to zsh
    sudo chsh "$(id -un)" --shell "/usr/bin/zsh"
fi

# Start Zsh to trigger any setup that would run when it's first opened
~/.local/bin/chezmoi --source ~/.dotfiles init --apply --verbose
