export const TAULER_I3 = "~/.cargo/bin/tauler-i3";
export const TAULER_ACCUMULATE = "~/.cargo/bin/tauler-accumulate";

export const SIDEBAR_W = 272;
export const SIDEBAR_PAD = { left: 10, right: 16, y: 10 };

// <SidebarSection>'s own horizontal padding (`px-3`), which lives in dotfiles-tauler.
const SECTION_PAD_X = 12;
export const SECTION_CONTENT_W = SIDEBAR_W - SIDEBAR_PAD.left - SIDEBAR_PAD.right - 2 * SECTION_PAD_X;

export const HAIRLINE = "rgba(128,128,128,0.15)";
