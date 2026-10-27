const I3_MODE = `${import.meta.dirname}/../bin/i3-mode`;

// No compositor, so the panel can't be transparent: the pill fills its whole window, square corners.
const FONT_PX = 13;
const CHAR_W = 0.6 * FONT_PX;  // JetBrains Mono's advance width is 0.6em
const PAD_X = 14;
const HEIGHT = 28;
const BOTTOM_MARGIN = 48;

// i3's binding mode (resize, gaming, ...) as a floating panel centred near the bottom of the
// primary screen; no panel at all in the default mode.
export default function ModeIndicator() {
  const mode = useJSONStream(I3_MODE)?.mode?.trim();
  if (!mode || mode === "default") return null;

  const width = Math.ceil(mode.length * CHAR_W) + 2 * PAD_X;
  return (
    <panel id="i3-mode" above width={width} height={HEIGHT}
           x={Math.round((ctx.screen_width - width) / 2)} y={ctx.screen_height - HEIGHT - BOTTOM_MARGIN}>
      <div class="flex items-center justify-center w-full h-full bg-primary text-primary-foreground font-bold"
           style={{ fontSize: FONT_PX }}>
        {mode}
      </div>
    </panel>
  );
}
