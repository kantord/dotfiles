export const TAULER_I3 = "~/.cargo/bin/tauler-i3";
export const TAULER_ACCUMULATE = "~/.cargo/bin/tauler-accumulate";

export const SIDEBAR_W = 272;
// Top/bottom padding matches the workspace frame's outer margin, so the list and the frame start on the same line.
export const SIDEBAR_PAD = { left: 10, right: 16, y: 6 };
export const SIDEBAR_CONTENT_W = SIDEBAR_W - SIDEBAR_PAD.left - SIDEBAR_PAD.right;

// Everything below the list has a fixed height, so the list's height is arithmetic, not a guess.
export const DETAIL_H = 88;   // focused-workspace strip (FocusDetail.jsx)
export const PANEL_H = 236;   // status panel (StatusPanel.jsx)
export const listViewportHeight = (screenHeight) => screenHeight - 2 * SIDEBAR_PAD.y - DETAIL_H - PANEL_H;

// Status panel: no card, just the row inset the list uses.
export const PANEL_PAD_X = 4;
export const PANEL_CONTENT_W = SIDEBAR_CONTENT_W - 2 * PANEL_PAD_X;

export const HAIRLINE = "rgba(128,128,128,0.15)";
