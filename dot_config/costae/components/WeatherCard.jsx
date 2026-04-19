function uvLabel(raw) {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return "—";
  if (n <= 2) return `Low (${n})`;
  if (n <= 5) return `Moderate (${n})`;
  if (n <= 7) return `High (${n})`;
  if (n <= 10) return `Very High (${n})`;
  return `Extreme (${n})`;
}

function uvColor(raw) {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return "rgba(255,255,255,0.5)";
  if (n <= 2) return "#a6e3a1";
  if (n <= 5) return "#f9e2af";
  if (n <= 7) return "#fab387";
  return "#f38ba8";
}

export default function WeatherCard() {
  const w = useJSONStream("/usr/bin/bash", `while true; do data=$(curl -s --max-time 10 'wttr.in/Barcelona?format=%C|%t|%f|%h|%u' 2>/dev/null); cond=$(echo "$data"|cut -d'|' -f1); temp=$(echo "$data"|cut -d'|' -f2); feels=$(echo "$data"|cut -d'|' -f3); humidity=$(echo "$data"|cut -d'|' -f4); uv=$(echo "$data"|cut -d'|' -f5); printf '{"cond":"%s","temp":"%s","feels":"%s","humidity":"%s","uv":"%s"}\\n' "$cond" "$temp" "$feels" "$humidity" "$uv"; sleep 180; done`);
  return (
    <container tw="flex flex-col gap-[4px] rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md px-3 py-[8px]">
      <container tw="flex flex-row items-baseline justify-between">
        <text tw="text-[15px] text-white font-bold">{w?.temp ?? "…"}</text>
        <text tw="text-[10px] text-[rgba(255,255,255,0.6)]">feels {w?.feels ?? "…"}</text>
      </container>
      <container tw="flex flex-row justify-between">
        <text tw="text-[10px] text-[rgba(255,255,255,0.8)]">{w?.cond ?? "—"}</text>
        <text tw="text-[10px] text-[rgba(255,255,255,0.6)]">RH {w?.humidity ?? "—"}</text>
      </container>
      <container tw="flex flex-row justify-between">
        <text tw="text-[10px]" style={{ color: uvColor(w?.uv) }}>UV {uvLabel(w?.uv)}</text>
        <container />
      </container>
    </container>
  );
}
