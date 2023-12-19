#!/bin/bash

install_packages_apt() {
  # Update the package list using sudo
  sudo apt update

  # Read the package names into an array
  mapfile -t packages < "$package_file"

  # Install all packages at once using sudo
  sudo apt install -y "${packages[@]}"

  # Cleanup
  sudo apt autoremove -y
  sudo apt clean

  echo "Package installation completed."
}

install_packages_pacman() {
  # Update the package list using sudo
  sudo pacman -Syu

  # Read the package names into an array
  mapfile -t packages < "$package_file"

  # Install all packages at once using sudo
  sudo pacman -S --noconfirm "${packages[@]}"

  echo "Package installation completed."
}

install_lunarvim() {
  if ! command -v nvim &> /dev/null; then
    yes no | LV_BRANCH='release-1.3/neovim-0.9' bash <(curl -s https://raw.githubusercontent.com/LunarVim/LunarVim/release-1.3/neovim-0.9/utils/installer/install.sh)
  fi
}

# Define the file containing the list of required packages
package_file="./required-packages.txt"

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
