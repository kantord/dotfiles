#!/usr/bin/env bash
# This script should mainly be used by GitHub Codespaces

# exit on error and print each command 
set -euxo pipefail

install_chezmoi ()
{
  DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  [[ -e ~/.dotfiles ]] || ln -s "$DIR" ~/.dotfiles 
  [[ -e ~/.local/bin/chezmoi ]] || BINDIR=~/.local/bin sh -c "$(curl -fsSL get.chezmoi.io)"
  ~/.local/bin/chezmoi --source ~/.dotfiles init --apply --verbose
}


main() {}
  # This function should execute all install steps in the correct order
  install_chezmoi
}

# Calls main function. Otherwise the script will not do anything
main
