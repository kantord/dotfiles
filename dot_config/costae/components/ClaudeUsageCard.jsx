export default function ClaudeUsageCard() {
  const data = useJSONStream("/usr/bin/bash", "while true; do ~/.local/bin/claude-usage-stream.sh; sleep 60; done");
  const accounts = data?.accounts ?? [];
  if (accounts.length === 0) return null;
  return (
    <container tw="flex flex-col gap-[4px] rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md px-3 py-[8px]">
      {accounts.map(a => {
        const resetsStr = a.resetsIn < 3600
          ? `${Math.floor(a.resetsIn / 60)}m`
          : a.resetsIn < 86400
          ? `${Math.floor(a.resetsIn / 3600)}h`
          : `${Math.floor(a.resetsIn / 86400)}d`;
        const color = a.percent >= 90 ? '#f38ba8' : a.percent >= 70 ? '#fab387' : '#a6e3a1';
        return (
          <container tw="flex flex-col gap-[6px]">
            <text tw="text-[10px] text-[rgba(255,255,255,0.6)]">Claude · {a.label}</text>
            <container tw="flex flex-row items-baseline justify-between">
              <text tw="text-[15px] text-white font-bold" style={{ color }}>{a.percent}%</text>
              <text tw="text-[10px] text-[rgba(255,255,255,0.6)]">resets {resetsStr}</text>
            </container>
            <container tw="flex flex-row w-full h-[4px] rounded-full bg-[rgba(255,255,255,0.15)]">
              <container tw="h-[4px] rounded-full" style={{ flex: a.percent, backgroundColor: color }} />
              <container style={{ flex: 100 - a.percent }} />
            </container>
          </container>
        );
      })}
    </container>
  );
}
