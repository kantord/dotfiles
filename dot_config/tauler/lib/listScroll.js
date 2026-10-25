// Rows are a fixed height, so scroll position and off-screen hints come from arithmetic
// instead of measuring a DOM that tauler does not have.
export const ROW_H = 24;
export const SPACER_H = 8;

export const rowHeight = (row) => (row.type === "spacer" ? SPACER_H : ROW_H);
const rowsHeight = (rows) => rows.reduce((h, r) => h + rowHeight(r), 0);

function spansOf(rows) {
  let y = 0;
  return rows.map((r) => {
    const top = y;
    y += rowHeight(r);
    return { top, bottom: y };
  });
}

/**
 * Keeps the focused row in view, starting from the previous scroll position.
 * @returns {{ scrollTop: number, edges: { above: number, below: number } }}
 *   edges = rows needing attention that are scrolled out of view
 */
export function scrollView(rows, viewportH, previousTop = 0) {
  const spans = spansOf(rows);
  const max = Math.max(0, rowsHeight(rows) - viewportH);
  let top = Math.min(previousTop, max);

  const i = rows.findIndex((r) => r.focused);
  if (i >= 0) {
    if (spans[i].top < top) top = spans[i].top - ROW_H;
    else if (spans[i].bottom > top + viewportH) top = spans[i].bottom - viewportH + ROW_H;
  }
  const scrollTop = Math.max(0, Math.min(top, max));

  const edges = { above: 0, below: 0 };
  rows.forEach((r, k) => {
    if (r.type !== "row" || r.attention.count === 0) return;
    if (spans[k].bottom <= scrollTop) edges.above += 1;
    else if (spans[k].top >= scrollTop + viewportH) edges.below += 1;
  });
  return { scrollTop, edges };
}
