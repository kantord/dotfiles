# dotfiles

Public chezmoi source for my configuration. It carries the shared, machine
independent setup and pulls in an optional private layer
(`~/repos/dotfiles-private`) that holds anything personal or work specific.

```bash
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply kantord
```
