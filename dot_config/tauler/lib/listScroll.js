// Rows are a fixed height, so scroll position and off-screen hints come from arithmetic
// instead of measuring a DOM that tauler does not have.
export const ROW_H = 24;
export const SPACER_H = 8;
// "N older envs not shown" line under the list (WorkspaceTree.jsx).
export const HIDDEN_LINE_H = 22;

export const rowHeight = (row) => (row.type === "spacer" ? SPACER_H : ROW_H);
export const rowsHeight = (rows) => rows.reduce((h, r) => h + rowHeight(r), 0);
export const contentHeight = (rows, hiddenCount) => rowsHeight(rows) + (hiddenCount > 0 ? HIDDEN_LINE_H : 0);

/**
 * Overflow ladder. When the rows don't fit, give up group spacing first; only if that
 * still isn't enough does the list scroll (scrollView keeps focus in view, edge pills
 * count what's hidden).
 * @returns {{ rows, compact: boolean }}
 */
export function fitRows(rows, viewportH, hiddenCount = 0) {
  if (contentHeight(rows, hiddenCount) <= viewportH) return { rows, compact: false };
  return { rows: rows.filter((r) => r.type !== "spacer"), compact: true };
}

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
export function scrollView(rows, viewportH, previousTop = 0, hiddenCount = 0) {
  const spans = spansOf(rows);
  const max = Math.max(0, contentHeight(rows, hiddenCount) - viewportH);
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
