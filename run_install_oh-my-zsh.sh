#!/bin/bash

if [ ! -d "$HOME/.oh-my-zsh" ]; then
    # Oh My Zsh is not installed, so install it
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
fi
