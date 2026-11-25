import {
  KittyConfig, AdjustLineHeight, AllowRemoteControl, AutoReloadConfig, BoldFont, BoldItalicFont, EnableAudioBell,
  FontFamily, FontSize, InactiveTextAlpha, InitialWindowHeight, InitialWindowWidth, InputDelay,
  ItalicFont, ProgressBar, RememberWindowSize, RepaintDelay, ScrollbackLines, ShellIntegration,
} from "@gh/kantord/dotfiles-tauler";

// kitty's static settings. kitty.conf itself stays a thin chezmoi-managed stub that `include`s
// the file written here: `kitten themes` rewrites kitty.conf's colour block on disk, and tauler
// would overwrite that edit on its next Sweep if it owned kitty.conf whole.
export default function KittyConfigUnit() {
  return (
    <KittyConfig path="~/.config/kitty/tauler-kitty-settings.conf">
      <FontFamily value="JetBrains Mono" />
      <BoldFont value="auto" />
      <ItalicFont value="auto" />
      <BoldItalicFont value="auto" />
      {/* Deprecated in kitty 0.48.2 (favor of modify_font), kept as a
          faithful port of the real settings — migrating is a separate
          decision. */}
      <AdjustLineHeight value="100%" />
      <FontSize value="14" />
      <AutoReloadConfig value="0.5" />
      <ProgressBar value="top" />
      <ScrollbackLines value="10000" />
      <EnableAudioBell value="no" />
      <ShellIntegration value="enabled" />
      {/* No `shell` here: it is the one setting that breaks kitty outright
          when the program is missing. Set it in your own kitty.conf, after
          the `include`. */}
      <RememberWindowSize value="no" />
      <InitialWindowWidth value="830" />
      <InitialWindowHeight value="700" />
      <InactiveTextAlpha value="0.85" />
      <RepaintDelay value="8" />
      <InputDelay value="2" />
      <AllowRemoteControl value="yes" />
    </KittyConfig>
  );
}
