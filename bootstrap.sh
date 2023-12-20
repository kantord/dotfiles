#!/usr/bin/env bash
# This script should mainly be used by GitHub Codespaces

# exit on error and print each command 
set -euxo pipefail

# ~/.dotfiles ==> directory where this script is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -e ~/.dotfiles ]] || ln -s "$DIR" ~/.dotfiles

# download and install chezmoi to ~/.local/bin
[[ -e ~/.local/bin/chezmoi ]] || BINDIR=~/.local/bin sh -c "$(curl -fsSL get.chezmoi.io)"

~/.local/bin/chezmoi --source ~/.dotfiles init --apply --verbose
