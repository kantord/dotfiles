# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **chezmoi dotfiles repository** for managing configuration files across multiple systems (Arch Linux, Ubuntu, macOS, GitHub Codespaces). Chezmoi handles templating, multi-OS support, and synchronization of user configuration.

## Common Commands

```bash
./setup.sh                    # Main entry point - installs chezmoi and applies dotfiles
chezmoi apply                 # Apply changes from source to home directory (auto-reloads i3)
chezmoi diff                  # Preview changes before applying
chezmoi data                  # Show template data (platform, environment vars)
```

**Important:** After editing files in this repo, run `chezmoi apply` to copy them to their target locations. This automatically reloads i3 via `run_after_restart_i3.sh`. Simply reloading i3 (`$mod+Shift+r`) won't apply chezmoi changes.

**Testing in CI:**
- GitHub Actions workflows in `.github/workflows/` test on Ubuntu, macOS, and Codespaces
- CI runs `./setup.sh` followed by `chezmoi data` validation

## Architecture

### Chezmoi Naming Conventions
- `dot_` prefix → becomes `.` (e.g., `dot_zshrc` → `~/.zshrc`)
- `private_` prefix → file permissions set to 0600
- `executable_` prefix → file permissions set to 0755
- `.tmpl` suffix → processed as Go template
- `run_before_*.sh` / `run_after_*.sh` → lifecycle hooks executed during apply

### Key Configuration Files
- `.chezmoi.yaml.tmpl` - Platform detection and template variables
- `.chezmoiexternal.toml` - External dependencies (Powerlevel10k, zsh-vi-mode, twm-status-builder)
- `dot_required-packages.txt.tmpl` - Platform-conditional package list

### Directory Structure
- `dot_config/` → `~/.config/` (XDG config home)
  - `nvim/` - Neovim with LazyVim base (Lua config in `lua/plugins/`)
  - `i3/` - i3 window manager with extensive scripts in `scripts/`
  - `hypr/` - Hyprland compositor config
  - `kitty/` - Terminal emulator config
- `dot_local/bin/` → `~/.local/bin/` (user executables)
- `private_dot_ssh/` → `~/.ssh/` (SSH keys with private permissions)

### Template System
Templates use Go template syntax with variables from `.chezmoi.yaml.tmpl`:
- `{{ .platform }}` - "arch", "ubuntu", "macos", or "codespaces"
- `{{ .chezmoi.os }}` - Operating system
- Conditional blocks: `{{if eq .platform "arch"}}...{{end}}`

### Run Scripts (Lifecycle Hooks)
- `run_before_maintain_etc_files.sh` - Updates `/etc/pacman.conf`
- `run_before_remove_zsh_bytecode.sh` - Cleans compiled Zsh files
- `run_after_custom_keyboard_layout.sh` - Installs X11 keyboard layout
- `run_after_restart_i3.sh` - Reloads i3 window manager
- `run_install_oh-my-zsh.sh` - Installs Oh My Zsh with plugins

## Notable Integrations

- **Home Assistant** - Smart home control via `dot_local/bin/executable_ha-i3` and i3 scripts
- **Theme System** - Coordinated theming between Kitty terminal and i3bar via `chtheme()` function
- **Git** - GPG signing with SSH keys, difftastic for diffs, delta pager

## Shell Aliases (from dot_zshrc)
- `gpp` = git push
- `gff` = git push --force-with-lease
- `gswm` = git switch main
- `tss` = tig status
- `ggc` = git commit
