#!/bin/bash

# Define the file containing the list of required packages
readarray -t packages < <(cat "$HOME/.required-packages.txt" | grep -v "^$" | awk '{$1=$1};1')

install_packages_apt() {
  sudo apt update
  sudo apt install -y software-properties-common
  sudo add-apt-repository ppa:neovim-ppa/unstable -y
  sudo apt update
  sudo apt install -y "${packages[@]}"
  sudo apt autoremove -y
  sudo apt clean

  echo "This is the Neovim version installed:"
  nvim --version

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
    yes | LV_BRANCH='release-1.3/neovim-0.9' bash <(curl -s https://raw.githubusercontent.com/LunarVim/LunarVim/release-1.3/neovim-0.9/utils/installer/install.sh)
  fi
}

maintain_lunarvim_plugins ()
{
  lvim=$HOME/.local/bin/lvim
  $lvim --headless "+Lazy! sync" +qa

  # Parsers
  # This is done automatically, but this way it will be done before LunarVim is opened 
  # Mostly relevant in Codespaces as it will speed up the initial experience
  $lvim --headless "+TSUpdateSync comment" +qa
  $lvim --headless "+TSUpdateSync regex" +qa
  $lvim --headless "+TSUpdateSync markdown_inline" +qa
  $lvim --headless "+TSUpdateSync python" +qa
  $lvim --headless "+TSUpdateSync tsx" +qa
  $lvim --headless "+TSUpdateSync javascript" +qa
  $lvim --headless "+TSUpdateSync typescript" +qa
  $lvim --headless "+TSUpdateSync json" +qa
  $lvim --headless "+TSUpdateSync bash" +qa
}

install_atuin ()
{
  bash <(curl https://raw.githubusercontent.com/atuinsh/atuin/main/install.sh)
}

install_system_packages ()
{
  # Check if apt is available
  if command -v apt &>/dev/null; then
    install_packages_apt
  elif command -v pacman &>/dev/null; then
    install_packages_pacman
  else
    echo "Error: Neither apt nor pacman is available. This script is designed for systems with apt or pacman."
    exit 1
  fi
}

install_cargo_packages () {
  cargo install --features i3 wmfocus
}

install_system_packages
install_lunarvim
maintain_lunarvim_plugins
install_atuin
install_cargo_packages
