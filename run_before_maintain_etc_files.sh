#!/bin/bash

SCRIPT_DIR="/home/kantord/.local/share/chezmoi"

function maintain_file() {
  chezmoi_version=$1
  etc_version=$2

  if cmp --silent -- "$chezmoi_version" "$etc_version"; then
    echo "$etc_version is already up to date"
  else
    sudo cp $SCRIPT_DIR/$chezmoi_version $etc_version
  fi
}


maintain_file .pacman.conf /etc/pacman.conf
