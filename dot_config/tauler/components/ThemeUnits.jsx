import {
  KittyConfig, KittyTheme, I3Theme, GtkTheme, ColorScheme, Gtk3Css,
  RofiConfig, RofiTheme, RecentFilesTheme,
} from "@gh/kantord/dotfiles-tauler";

// Config files for other programs, written from the active theme.
export default function ThemeUnits() {
  return [
    <RofiTheme />,
    <RecentFilesTheme />,
    <RofiConfig />,
    <KittyConfig />,
    <KittyTheme />,
    <I3Theme />,
    <GtkTheme />,
    <ColorScheme />,
    <Gtk3Css />,
  ];
}
