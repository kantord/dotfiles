# CLAUDE.md

Public chezmoi source (`~/.local/share/chezmoi`). This repository is public:
never add hostnames, credentials, company or work details here. Those belong
in the private layer.

## Two-source layout

- This repo is the primary chezmoi source and owns `.chezmoi.yaml.tmpl`
  (the config data every template sees: platform, packageManager, gitEmail...).
- `~/repos/dotfiles-private` is a second chezmoi source, cloned by
  `.chezmoiexternal.toml` and applied by `run_after_apply-private-dotfiles.sh`
  with its own state file (`~/.config/chezmoi/chezmoistate-private.boltdb`).
- A target file must be managed by exactly one of the two sources.

## Commands

```bash
chezmoi apply    # applies this repo, then the private layer
chezmoi diff     # this repo only
chezmoi --source ~/repos/dotfiles-private --persistent-state ~/.config/chezmoi/chezmoistate-private.boltdb diff
```
