import { SidebarSection } from "@gh/kantord/dotfiles-tauler";
import { SECTION_CONTENT_W, TAULER_ACCUMULATE } from "../lib/layout.js";

const SAMPLER = `${import.meta.dirname}/../bin/system-samples`;
const SAMPLE_INTERVAL_S = 2;
const SAMPLE_COUNT = 60;
const WINDOW_S = (SAMPLE_COUNT - 1) * SAMPLE_INTERVAL_S;
const WINDOW_LABEL_MIN = (SAMPLE_COUNT * SAMPLE_INTERVAL_S) / 60;
const GRIDLINES = [25, 50, 75];
const CPU_COLOR = (colors) => colors["ansi-cyan"];
const MEM_COLOR = (colors) => colors["ansi-magenta"];
const GRID_OPACITY = 0.08;
const CPU_FILL_OPACITY = 0.18;
const CPU_STROKE_W = 1.5;
const MEM_STROKE_W = 1.2;

// Width left inside <SidebarSection>'s own padding (see lib/layout.js).
const CHART_W = SECTION_CONTENT_W;
const CHART_H = 64;

function drawHistory(svg, d3, samples, now, colors) {
  const x = d3.scaleLinear().domain([now - WINDOW_S, now]).range([0, CHART_W]);
  const y = d3.scaleLinear().domain([0, 100]).range([CHART_H - 1, 1]);
  const line = (field) => d3.line().x((d) => x(d.t)).y((d) => y(d[field])).curve(d3.curveMonotoneX);

  svg.append("g").selectAll("line").data(GRIDLINES).join("line")
    .attr("x1", 0).attr("x2", CHART_W).attr("y1", y).attr("y2", y)
    .attr("stroke", colors.foreground).attr("stroke-opacity", GRID_OPACITY);

  svg.append("path").datum(samples)
    .attr("fill", CPU_COLOR(colors)).attr("fill-opacity", CPU_FILL_OPACITY)
    .attr("d", d3.area().x((d) => x(d.t)).y0(CHART_H).y1((d) => y(d.cpu)).curve(d3.curveMonotoneX));
  svg.append("path").datum(samples)
    .attr("fill", "none").attr("stroke", CPU_COLOR(colors)).attr("stroke-width", CPU_STROKE_W)
    .attr("d", line("cpu"));
  svg.append("path").datum(samples)
    .attr("fill", "none").attr("stroke", MEM_COLOR(colors)).attr("stroke-width", MEM_STROKE_W)
    .attr("d", line("mem"));
}

export default function SystemChart() {
  const samples = useJSONStream("/usr/bin/bash",
    `"${SAMPLER}" ${SAMPLE_INTERVAL_S} | ${TAULER_ACCUMULATE} -n ${SAMPLE_COUNT}`) ?? [];
  const latest = samples.at(-1);
  if (!latest) return null;

  const colors = ctx.theme.colors;
  return (
    <SidebarSection gap={6}>
      <div class="flex flex-row justify-between w-full">
        <span class="text-[10px] text-muted-foreground">System · {WINDOW_LABEL_MIN} min</span>
        <span class="text-[10px]" style={{ color: CPU_COLOR(colors) }}>cpu {Math.round(latest.cpu)}%</span>
        <span class="text-[10px]" style={{ color: MEM_COLOR(colors) }}>mem {Math.round(latest.mem)}%</span>
      </div>
      <D3Figure
        key={`system/${latest.t}/${colors.background}`}
        width={CHART_W}
        height={CHART_H}
        draw={(svg, d3) => drawHistory(svg, d3, samples, latest.t, colors)}
      />
    </SidebarSection>
  );
}
