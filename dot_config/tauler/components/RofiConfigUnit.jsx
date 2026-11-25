import {
  RofiConfig, ClickToExit, CombiModes, DisplayCombi, DisplayDrun, DisplayRun, DisplayWindow,
  DrunDisplayFormat, DrunExcludeCategories, DrunMatchFields, DrunShowActions, Matching, Modes,
  ShowIcons, Sort, Terminal, WindowFormat,
} from "@gh/kantord/dotfiles-tauler";

// rofi's behaviour (modes, matching, terminal, display formats). Its colours and layout are
// RofiThemeUnit.jsx and RecentFilesTheme.jsx.
export default function RofiConfigUnit() {
  return (
    <RofiConfig path="~/.config/rofi/config.rasi">
      <Modes value="combi,drun,run,window" />
      <CombiModes value="window,drun" />
      <Matching value="fuzzy" />
      {/* Sort disabled so combi falls back to combi-modes order (window
          before drun) — running apps surface above their launcher entries.
          fzf-style smart sort can be re-enabled per-invocation with
          Alt+grave. */}
      <Sort value="false" />
      <ShowIcons value="true" />
      <Terminal value="kitty" />
      {/* Window entries match against just the app class so they tie with
          the drun "Name" field on score, letting combi-modes order (window
          first) surface the running window above its drun launcher
          entry. */}
      <WindowFormat value="{c}" />
      <DrunDisplayFormat value="{name}" />
      <DrunShowActions value="false" />
      <DrunMatchFields value="name,generic,keywords" />
      <DrunExcludeCategories value="Settings;System;Building;Debugger;IDE;Profiling;RevisionControl;Translation" />
      {/* Single glyph for every mode — the prompt is just a visual cue, not
          a status indicator. See the prompt {} block in theme.rasi. */}
      <DisplayDrun value="❯" />
      <DisplayRun value="❯" />
      <DisplayWindow value="❯" />
      <DisplayCombi value="❯" />
      <ClickToExit value="true" />
    </RofiConfig>
  );
}
