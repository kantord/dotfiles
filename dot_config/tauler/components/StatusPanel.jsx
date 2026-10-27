// Everything below the workspace list, in one "meters" layout: no card, no dividers.
// Spacing and a shared rhythm do the grouping: every meter is a label on the left, its value
// on the right and a 3px bar underneath. The CPU/memory chart sits bare above them, the time
// anchors the bottom. Every part has a fixed height so PANEL_H is exact and the list above can
// size itself without measuring.
import { Weather, Clock, ClaudeUsage, OutputVolume, AudioChannels, Plot, Area, Line, Scale } from "@gh/kantord/dotfiles-tauler";
import { Slider } from "@ui/slider";
import { PANEL_H, PANEL_PAD_X, PANEL_CONTENT_W, TAULER_ACCUMULATE } from "../lib/layout.js";
import { formatDuration } from "../lib/formatDuration.js";

const LINE_H = 14;          // label/value line of a meter
const BAR_H = 3;
const SLIDER_H = 12;
const METER_GAP = 10;       // between meters
const CHART_H = 44;
const TIME_H = 34;
const MAX_ACCOUNTS = 2;

const SAMPLER = `${import.meta.dirname}/../bin/system-samples`;
const SAMPLE_INTERVAL_S = 2;
const SAMPLE_COUNT = 60;
const WINDOW_S = (SAMPLE_COUNT - 1) * SAMPLE_INTERVAL_S;
const VOLUME_STEP = 5;
const WARN_PERCENT = 70;
const CRITICAL_PERCENT = 90;

const fg = (alpha) => themeColor("foreground", alpha);
const muted = () => fg(0.45);

function MeterLine({ label, value }) {
  return (
    <div class="flex flex-row justify-between items-baseline w-full" style={{ height: LINE_H }}>
      <span class="text-[10px]" style={{ color: muted() }}>{label}</span>
      <span class="text-[10px]" style={{ color: fg(0.82) }}>{value}</span>
    </div>
  );
}

function Bar({ percent, color }) {
  return (
    <div class="flex flex-row w-full rounded-full overflow-hidden" style={{ height: BAR_H, backgroundColor: fg(0.12) }}>
      <div style={{ width: `${Math.max(0, Math.min(100, percent))}%`, height: BAR_H, backgroundColor: color }} />
    </div>
  );
}

// CPU (filled) and memory over the sample window, edge to edge, no axes. Plot keys the figure by
// what it draws, so it redraws exactly when a sample or the theme's colours change.
function History({ samples, now, colors }) {
  return (
    <Plot width={PANEL_CONTENT_W} height={CHART_H} margin={{ top: 1, right: 0, bottom: 1, left: 0 }} data={samples} x="t">
      <Scale channel="x" domain={[now - WINDOW_S, now]} />
      <Scale channel="y" domain={[0, 100]} />
      <Area y="cpu" curve="monotone" fill={colors["ansi-cyan"]} fillOpacity={0.18} />
      <Line y="cpu" curve="monotone" stroke={colors["ansi-cyan"]} strokeWidth={1.5} />
      <Line y="mem" curve="monotone" stroke={colors["ansi-magenta"]} strokeWidth={1.2} opacity={0.8} />
    </Plot>
  );
}

function SystemChart() {
  const samples = useJSONStream("/usr/bin/bash",
    `"${SAMPLER}" ${SAMPLE_INTERVAL_S} | ${TAULER_ACCUMULATE} -n ${SAMPLE_COUNT}`) ?? [];
  const latest = samples.at(-1);
  const colors = ctx.theme.colors;
  return (
    <div class="flex flex-col w-full gap-[6px] flex-shrink-0">
      <div class="flex flex-row justify-between items-baseline w-full" style={{ height: LINE_H }}>
        <span class="text-[10px]"><span style={{ color: muted() }}>cpu </span><span style={{ color: colors["ansi-cyan"] }}>{latest ? Math.round(latest.cpu) : "–"}%</span></span>
        <span class="text-[10px]"><span style={{ color: muted() }}>mem </span><span style={{ color: colors["ansi-magenta"] }}>{latest ? Math.round(latest.mem) : "–"}%</span></span>
      </div>
      {latest
        ? <History samples={samples} now={latest.t} colors={colors} />
        : <div style={{ height: CHART_H }} />}
    </div>
  );
}

function usageColor(percent) {
  const colors = ctx.theme.colors;
  if (percent >= CRITICAL_PERCENT) return colors["ansi-red"];
  if (percent >= WARN_PERCENT) return colors["ansi-yellow"];
  return colors["ansi-green"];
}

function UsageMeters() {
  return (
    <ClaudeUsage>
      {(accounts) => accounts.slice(0, MAX_ACCOUNTS).map((account) => (
        <div class="flex flex-col w-full gap-[5px] flex-shrink-0">
          <MeterLine label={`claude ${account.label}`} value={`${account.percent}% · ${formatDuration(account.resetsIn)}`} />
          <Bar percent={account.percent} color={usageColor(account.percent)} />
        </div>
      ))}
    </ClaudeUsage>
  );
}

const isPlayingOutputStream = (channel) =>
  channel.type === "stream" && channel.kind === "output" && channel.state === "running";

// Same rhythm as the other meters, but the bar is the real slider, so it can be dragged.
function VolumeMeter() {
  return (
    <AudioChannels>
      {(channels) => {
        const playing = channels.filter(isPlayingOutputStream).length;
        return (
          <OutputVolume>
            {(volume, actions) => (
              <div class="flex flex-col w-full gap-[5px] flex-shrink-0">
                <div class="flex flex-row justify-between items-baseline w-full" style={{ height: LINE_H }}>
                  <div on_click={[actions.toggleMute()]}>
                    <span class="text-[10px]" style={{ color: muted() }}>{volume?.muted ? "volume · muted" : "volume"}</span>
                  </div>
                  <span class="text-[10px]" style={{ color: fg(0.82) }}>
                    {volume?.volume ?? 0}%{playing > 0 ? ` · ${playing} app${playing > 1 ? "s" : ""}` : ""}
                  </span>
                </div>
                <div class="w-full" style={{ height: SLIDER_H }}>
                  <Slider value={volume?.muted ? 0 : volume?.volume ?? 0} min={0} max={100} step={VOLUME_STEP} on_change={actions.setVolume} />
                </div>
              </div>
            )}
          </OutputVolume>
        );
      }}
    </AudioChannels>
  );
}

function TimeWeather() {
  return (
    <div class="flex flex-row items-end justify-between w-full flex-shrink-0" style={{ height: TIME_H }}>
      <Clock>{(time) => <span class="text-[28px]" style={{ lineHeight: "30px", color: fg(0.95) }}>{time ?? ""}</span>}</Clock>
      <Weather>
        {(w) => (
          <div class="flex flex-col items-end gap-[1px]">
            <span class="text-[12px] font-bold" style={{ color: fg(0.95) }}>{w?.temp || "…"}</span>
            <span class="text-[10px] truncate" style={{ color: muted(), maxWidth: 140 }}>{w?.cond?.toLowerCase() || "—"}</span>
          </div>
        )}
      </Weather>
    </div>
  );
}

export default function StatusPanel() {
  return (
    <div class="flex flex-col justify-end w-full flex-shrink-0 overflow-hidden"
         style={{ height: PANEL_H, paddingLeft: PANEL_PAD_X, paddingRight: PANEL_PAD_X }}>
      <SystemChart />
      <div class="flex flex-col w-full flex-shrink-0" style={{ marginTop: 18, gap: METER_GAP }}>
        <UsageMeters />
        <VolumeMeter />
      </div>
      <div class="flex-shrink-0" style={{ height: 22 }} />
      <TimeWeather />
    </div>
  );
}
