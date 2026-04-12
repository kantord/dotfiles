---
name: chezmoi
description: Manage dotfiles through chezmoi. Use when adding new dotfiles to chezmoi management, editing managed files, or applying changes. The chezmoi source directory is the source of truth — edit there, then apply.
---

# Chezmoi Dotfile Management

Chezmoi manages dotfiles by keeping a source directory (`~/.local/share/chezmoi/`) that maps to destination paths (`~/`). The source is the source of truth.

## Key principle

**Edit in the source, apply to destination** — not the other way around. This keeps the source repo clean and avoids `chezmoi add` drift.

```
source: ~/.local/share/chezmoi/dot_claude/skills/tdd.md
destination: ~/.claude/skills/tdd.md
```

## Common operations

### Add a new file to chezmoi management
```bash
chezmoi add ~/.claude/skills/new-skill.md
# This copies destination → source. Use only for first-time addition.
```

### Edit a managed file (preferred workflow)
```bash
# 1. Edit directly in the source directory
# e.g. edit ~/.local/share/chezmoi/dot_claude/skills/tdd.md

# 2. Apply the specific file to destination
chezmoi apply ~/.claude/skills/tdd.md
# No password needed for specific file applies
```

### Check what would change
```bash
chezmoi diff
chezmoi diff ~/.claude/skills/tdd.md  # specific file
```

### Check status of managed files
```bash
chezmoi status
chezmoi status ~/.claude/skills/  # specific directory
```

### Apply all changes
```bash
chezmoi apply
```

## Source path mapping

| Destination | Source |
|-------------|--------|
| `~/.claude/` | `~/.local/share/chezmoi/dot_claude/` |
| `~/.claude/skills/` | `~/.local/share/chezmoi/dot_claude/skills/` |
| `~/.config/foo` | `~/.local/share/chezmoi/dot_config/foo` |

Dots in directory names become `dot_` prefix in the source.

## After editing skills or config

Always commit the source after changes:
```bash
cd ~/.local/share/chezmoi
git add .
git commit -m "feat: <description>"
```
