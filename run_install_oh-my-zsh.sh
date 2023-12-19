#!/bin/bash

if [ ! -d "$HOME/.oh-my-zsh/oh-my-zsh.sh" ]; then
    rm -rf $HOME/.oh-my-zsh
    ZSH= sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
fi

