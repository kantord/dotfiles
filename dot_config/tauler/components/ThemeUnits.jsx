import { KittyTheme, I3Theme, GtkTheme, ColorScheme, Gtk3Css } from "@gh/kantord/dotfiles-tauler";
import I3ConfigUnit from "./I3ConfigUnit.jsx";
import KittyConfigUnit from "./KittyConfigUnit.jsx";
import RofiConfigUnit from "./RofiConfigUnit.jsx";
import RofiThemeUnit from "./RofiThemeUnit.jsx";
import RecentFilesTheme from "./RecentFilesTheme.jsx";

// Config files for other programs. The ones imported from the package only map the active
// theme's colours; the local ones hold this machine's own settings.
export default function ThemeUnits() {
  return [
    <RofiThemeUnit />,
    <RecentFilesTheme />,
    <RofiConfigUnit />,
    <KittyConfigUnit />,
    <KittyTheme />,
    <I3Theme />,
    <I3ConfigUnit />,
    <GtkTheme />,
    <ColorScheme />,
    <Gtk3Css />,
  ];
}
