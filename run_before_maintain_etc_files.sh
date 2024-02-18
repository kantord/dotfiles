#!/bin/bash

SCRIPT_DIR="/home/kantord/.local/share/chezmoi"

function maintain_file() {
  chezmoi_version=$1
  etc_version=$2

  if cmp --silent -- "$chezmoi_version" "$etc_version"; then
    echo "$etc_version is already up to date"
  else
    sudo mkdir -p $(dirname "$etc_version")
    sudo cp $SCRIPT_DIR/$chezmoi_version $etc_version
  fi
}


maintain_file .pacman.conf /etc/pacman.conf
maintain_file .dual-function-keys.yaml /etc/interception/dual-function-keys/my-mappings.yaml
maintain_file .udevmon.yaml /etc/interception/udevmon.yaml

sudo systemctl restart udevmon || true
