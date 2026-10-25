// Theme colours as CSS values come from tauler's `themeColor(token, alpha)`
// global; this file only adds the light-theme correction for text.
//
// Never write `rgba(255,255,255,…)` for "text on the sidebar": that is white
// on a dark theme and invisible on a light one.
export const isDark = () => ctx.theme.mode === 'dark';

// Text in the foreground colour at `alpha` of full strength. A faint grey reads
// on a dark surface and vanishes on a light one, so light themes get a floor:
// 0.2 -> 0.4, 0.5 -> 0.62, 0.92 -> 0.94. Use `themeColor` for fills, `ink` for text.
export function ink(alpha = 1) {
  return themeColor('foreground', isDark() ? alpha : 0.3 + 0.7 * alpha);
}
