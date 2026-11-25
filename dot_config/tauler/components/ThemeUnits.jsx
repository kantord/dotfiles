import {
  KittyConfig, KittyTheme, I3Theme, GtkTheme, ColorScheme, Gtk3Css,
  RofiConfig, RofiTheme, RecentFilesTheme,
} from "@gh/kantord/dotfiles-tauler";
import I3ConfigUnit from "./I3ConfigUnit.jsx";

// Config files for other programs, written from the active theme.
export default function ThemeUnits() {
  return [
    <RofiTheme />,
    <RecentFilesTheme />,
    <RofiConfig />,
    <KittyConfig />,
    <KittyTheme />,
    <I3Theme />,
    <I3ConfigUnit />,
    <GtkTheme />,
    <ColorScheme />,
    <Gtk3Css />,
  ];
}
