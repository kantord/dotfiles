#!/usr/bin/env bash

export NVIM_APPNAME="${NVIM_APPNAME:-"lvim"}"

export LUNARVIM_RUNTIME_DIR="${LUNARVIM_RUNTIME_DIR:-"/home/kantord/.local/share/lunarvim"}"
export LUNARVIM_CONFIG_DIR="${LUNARVIM_CONFIG_DIR:-"/home/kantord/.config/lvim"}"
export LUNARVIM_CACHE_DIR="${LUNARVIM_CACHE_DIR:-"/home/kantord/.cache/lvim"}"

export LUNARVIM_BASE_DIR="${LUNARVIM_BASE_DIR:-"/home/kantord/.local/share/lunarvim/lvim"}"

exec -a "$NVIM_APPNAME" neovide -- -u "$LUNARVIM_BASE_DIR/init.lua" "$@"
