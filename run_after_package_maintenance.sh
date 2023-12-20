#!/bin/bash

# Define the file containing the list of required packages
readarray -t packages < <(cat "$HOME/.required-packages.txt" | grep -v "^$" | awk '{$1=$1};1')

install_packages_apt() {
  # allows installing latest neovim 
  sudo add-apt-repository ppa:neovim-ppa/stable

  # Update the package list using sudo
  sudo apt update

  sudo apt install -y "${packages[@]}"

  # Cleanup
  sudo apt autoremove -y
  sudo apt clean

  echo "Package installation completed."
}

install_packages_pacman() {
  # Update the package list using sudo
  sudo pacman -Syu

  # Install all packages at once using sudo
  sudo pacman -S --needed --noconfirm "${packages[@]}"

  echo "Package installation completed."
}

install_lunarvim() {
  if [ ! -d "$HOME/.local/share/lunarvim/lvim" ]; then
    yes no | LV_BRANCH='release-1.3/neovim-0.9' bash <(curl -s https://raw.githubusercontent.com/LunarVim/LunarVim/release-1.3/neovim-0.9/utils/installer/install.sh)
  fi
}

# Check if apt is available
if command -v apt &>/dev/null; then
  install_packages_apt
  install_lunarvim
elif command -v pacman &>/dev/null; then
  install_packages_pacman
  install_lunarvim
else
  echo "Error: Neither apt nor pacman is available. This script is designed for systems with apt or pacman."
  exit 1
fi
