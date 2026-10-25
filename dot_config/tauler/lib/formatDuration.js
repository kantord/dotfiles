const UNITS = [["d", 86400], ["h", 3600], ["m", 60]];
const MAX_PARTS = 2;

// 3 -> "<1m", 7140 -> "1h 59m", 90000 -> "1d 1h"
export function formatDuration(seconds) {
  const parts = [];
  let rest = Math.max(0, seconds);
  for (const [suffix, size] of UNITS) {
    const count = Math.floor(rest / size);
    rest -= count * size;
    if (count > 0) parts.push(`${count}${suffix}`);
  }
  return parts.slice(0, MAX_PARTS).join(" ") || "<1m";
}
