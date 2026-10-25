import { HAIRLINE } from "../lib/layout.js";

// Outer margin is transparent so the shadow has room to bleed instead of being clipped.
// Vertical padding (17) + border (1) = 18 = rounded-2xl's radius, so corners are never cut mid-arc.
// No left margin: the sidebar's own padding already gives the left shadow room.
export default function WorkspaceFrame({ Contents }) {
  return (
    <div class="w-full h-full py-[6px] pr-[6px]">
      <div class="relative w-full h-full rounded-2xl border bg-background px-[1px] py-[17px]"
           style={{ borderColor: HAIRLINE, boxShadow: "0 0 12px rgba(0,0,0,0.35)" }}>
        <Contents class="w-full h-full" />
      </div>
    </div>
  );
}
