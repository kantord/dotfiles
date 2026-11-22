# Sounds

## workspace-switch-click.ogg

- **Source:** `Audio/switch16.ogg` from Kenney's "UI SFX Set"
  (<https://www.kenney.nl/>), by Kenney Vleugels.
- **Licence:** Creative Commons Zero (CC0 1.0),
  <https://creativecommons.org/publicdomain/zero/1.0/>. Attribution is not
  required; credit is given here as a courtesy.
- **Modification:** volume lowered with `ffmpeg -af volume=0.2`.
- **Used by:** `workspace_step.sh` (played with `pactl play-sample`), uploaded
  at startup by the `pactl upload-sample` line in `config`.
