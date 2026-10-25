// Draws the row view-models from lib/workspaceTree.js. Row heights come from lib/listScroll.js.
import { ROW_H, SPACER_H } from "../lib/listScroll.js";

const KEY_W = 16;
const MARKER_W = 16;

const fg = (alpha) => themeColor("foreground", alpha);

function Guide({ guide }) {
  return (
    <div class="relative flex-shrink-0 h-full" style={{ width: guide.width }}>
      <div class="absolute top-0 h-full" style={{ left: guide.line, width: 1, backgroundColor: fg(0.12) }} />
    </div>
  );
}

function Marker({ marker, focused }) {
  const color = marker.dashed ? fg(0.4) : focused ? themeColor("primary", 1) : fg(0.75);
  return (
    <div class="flex items-center justify-center flex-shrink-0" style={{ width: MARKER_W }}>
      <div
        class="flex items-center justify-center rounded-[3px]"
        style={{
          width: 11, height: 11,
          border: `1.5px ${marker.dashed ? "dashed" : "solid"} ${color}`,
          backgroundColor: marker.checked && !marker.dashed ? color : "transparent",
        }}
      >
        {marker.checked && !marker.dashed && (
          <span class="text-[8px] font-bold" style={{ color: ctx.theme.colors.background }}>✓</span>
        )}
      </div>
    </div>
  );
}

function Label({ row }) {
  const { prefix, prefixMono, text } = row.label;
  const bold = row.focused || row.onFocusPath;
  const muted = row.kind === "virtual";
  const textColor = muted ? fg(0.45) : row.focused ? fg(0.95) : fg(0.7);
  return (
    <div class="flex flex-row items-baseline flex-1 min-w-0 gap-[5px] px-[4px]">
      {prefix && (
        <span class={`flex-shrink-0 ${prefixMono ? "text-[10px]" : "text-[12px]"}`} style={{ color: fg(0.45) }}>{prefix}</span>
      )}
      <span class={`text-[12px] truncate min-w-0 ${bold ? "font-bold" : ""}`} style={{ color: textColor }}>{text}</span>
      {row.isGroup && <span class="text-[12px] flex-shrink-0" style={{ color: fg(0.45) }}>/</span>}
    </div>
  );
}

function AttentionBadge({ attention }) {
  const color = ctx.theme.colors["ansi-yellow"];
  const text = attention.count > 99 ? "99+" : String(attention.count);
  return (
    <div
      class="flex items-center justify-center flex-shrink-0 rounded-full h-[15px] min-w-[15px] px-[4px]"
      style={attention.inherited
        ? { border: `1.25px solid ${color}` }
        : { backgroundColor: color }}
    >
      <span class="text-[9px] font-bold" style={{ color: attention.inherited ? color : ctx.theme.colors.background }}>{text}</span>
    </div>
  );
}

function Trailing({ row }) {
  const busy = ctx.theme.colors["ansi-cyan"];
  return (
    <div class="flex flex-row items-center flex-shrink-0 gap-[6px] pr-[4px]">
      {row.hiddenChildren > 0 && <span class="text-[10px]" style={{ color: fg(0.4) }}>+{row.hiddenChildren}</span>}
      {row.status && (
        <span class="text-[10px]" style={{ color: row.status.tone === "ok" ? ctx.theme.colors["ansi-green"] : fg(0.4) }}>{row.status.text}</span>
      )}
      {(row.agentWorking || row.agentWorkingInside) && (
        <span class="text-[11px]" style={{ color: busy, opacity: row.agentWorkingInside ? 0.5 : 1 }}>◑</span>
      )}
      {row.attention.count > 0 && <AttentionBadge attention={row.attention} />}
      <div class="flex justify-end flex-shrink-0" style={{ width: KEY_W }}>
        <span class="text-[10px]" style={{ color: row.focused ? fg(0.9) : fg(0.4) }}>{row.hotkey ?? ""}</span>
      </div>
    </div>
  );
}

function Row({ row, events }) {
  const bg = row.focused ? { backgroundColor: themeColor("primary", 0.14) } : {};
  const click = row.switchTo ? { on_click: [events.switchWorkspace({ workspace: row.switchTo })] } : {};
  return (
    <div class="flex flex-row items-center w-full rounded-md flex-shrink-0 pl-[4px]" style={{ height: ROW_H, ...bg }} {...click}>
      {row.guides.map((g) => <Guide guide={g} />)}
      {row.marker ? <Marker marker={row.marker} focused={row.focused} /> : <div class="flex-shrink-0 w-[4px]" />}
      <Label row={row} />
      <Trailing row={row} />
    </div>
  );
}

function EdgePill({ text }) {
  const color = ctx.theme.colors["ansi-yellow"];
  return (
    <div class="absolute left-0 w-full flex justify-center" style={{ pointerEvents: "none" }}>
      <div class="rounded-full h-[18px] px-[8px] flex items-center" style={{ border: `1.25px solid ${color}`, backgroundColor: ctx.theme.colors.background }}>
        <span class="text-[10px] font-bold" style={{ color }}>{text}</span>
      </div>
    </div>
  );
}

export default function WorkspaceTree({ rows, hiddenCount, scrollTop, viewportH, edges, events }) {
  return (
    <div class="relative w-full flex-shrink-0 overflow-hidden" style={{ height: viewportH }}>
      <div class="flex flex-col w-full" style={{ marginTop: -scrollTop }}>
        {rows.map((r) => r.type === "spacer"
          ? <div class="flex-shrink-0" style={{ height: SPACER_H }} />
          : <Row row={r} events={events} />)}
        {hiddenCount > 0 && (
          <span class="text-[10px] px-[10px] pt-[8px]" style={{ color: fg(0.4) }}>{hiddenCount} older envs not shown</span>
        )}
      </div>
      {edges.above > 0 && <div class="absolute top-0 left-0 w-full"><EdgePill text={`↑ ${edges.above} need you`} /></div>}
      {edges.below > 0 && <div class="absolute bottom-0 left-0 w-full"><EdgePill text={`↓ ${edges.below} need you`} /></div>}
    </div>
  );
}
