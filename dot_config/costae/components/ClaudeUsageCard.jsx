import { Card } from '@ui/card';
import { Progress } from '@ui/progress';

export default function ClaudeUsageCard() {
  const data = useJSONStream("/usr/bin/bash", "while true; do ~/.local/bin/claude-usage-stream.sh; sleep 60; done");
  const accounts = data?.accounts ?? [];
  if (accounts.length === 0) return null;
  // THEME-GAP: status colors #f38ba8/#fab387/#a6e3a1 in inline style are semantic (high/medium/ok) — no theme token equivalent
  return (
    <Card tw="flex flex-col gap-[4px] py-[8px]">
      {accounts.map(a => {
        const resetsStr = a.resetsIn < 3600
          ? `${Math.floor(a.resetsIn / 60)}m`
          : a.resetsIn < 86400
          ? `${Math.floor(a.resetsIn / 3600)}h`
          : `${Math.floor(a.resetsIn / 86400)}d`;
        const color = a.percent >= 90 ? '#f38ba8' : a.percent >= 70 ? '#fab387' : '#a6e3a1';
        return (
          <container tw="flex flex-col gap-[6px]">
            <text tw="text-[10px] text-muted-foreground">Claude · {a.label}</text>
            <container tw="flex flex-row items-baseline justify-between">
              <text tw="text-[15px] text-foreground font-bold" style={{ color }}>{a.percent}%</text>
              <text tw="text-[10px] text-muted-foreground">resets {resetsStr}</text>
            </container>
            <Progress value={a.percent} color={color} />
          </container>
        );
      })}
    </Card>
  );
}
