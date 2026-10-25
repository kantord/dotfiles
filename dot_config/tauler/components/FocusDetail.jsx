// The strip under the list: what the focused workspace is about, in full. No divider: spacing separates it.
// Fixed height (DETAIL_H) so the list's height stays arithmetic; long text is cut, not wrapped further.
import { DETAIL_H } from "../lib/layout.js";

const BODY_LINES = 3;
const BODY_LINE_H = 18;

export default function FocusDetail({ detail }) {
  const fg = (alpha) => themeColor("foreground", alpha);
  const metaColor = detail?.metaTone === "busy" ? ctx.theme.colors["ansi-cyan"] : fg(0.45);
  return (
    <div class="flex flex-col w-full flex-shrink-0 overflow-hidden gap-[4px] px-[4px] pt-[12px] pb-[8px]"
         style={{ height: DETAIL_H }}>
      <div class="flex flex-row items-baseline w-full gap-[8px]" style={{ height: 14 }}>
        <span class="text-[10px] truncate min-w-0 flex-1" style={{ color: fg(0.45) }}>{detail?.title ?? ""}</span>
        <span class="text-[10px] flex-shrink-0" style={{ color: metaColor }}>{detail?.meta ?? ""}</span>
      </div>
      <div class="w-full overflow-hidden" style={{ height: BODY_LINES * BODY_LINE_H }}>
        <span class="text-[11px]" style={{ lineHeight: `${BODY_LINE_H}px`, color: fg(0.82) }}>{detail?.body ?? ""}</span>
      </div>
    </div>
  );
}
