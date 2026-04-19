const poll = (cmd) => useStringStream("/usr/bin/bash", `while true; do ${cmd}; sleep 1; done`);
const weather = useJSONStream("/usr/bin/bash", `while true; do data=$(curl -s --max-time 10 'wttr.in/Barcelona?format=%C|%t|%f|%h|%u' 2>/dev/null); cond=$(echo "$data"|cut -d'|' -f1); temp=$(echo "$data"|cut -d'|' -f2); feels=$(echo "$data"|cut -d'|' -f3); humidity=$(echo "$data"|cut -d'|' -f4); uv=$(echo "$data"|cut -d'|' -f5); printf '{"cond":"%s","temp":"%s","feels":"%s","humidity":"%s","uv":"%s"}\\n' "$cond" "$temp" "$feels" "$humidity" "$uv"; sleep 180; done`);

const notifications = useJSONStream("~/.cargo/bin/costae-notify")?.notifications ?? [];
const claudeUsage = useJSONStream("/usr/bin/bash", "while true; do ~/.local/bin/claude-usage-stream.sh; sleep 60; done");

function Card({ label, content }) {
  return (
    <container tw="flex flex-col gap-1 rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md px-3 py-[10px]">
      <text tw="text-[10px] text-[rgba(255,255,255,0.9)]">{label}</text>
      <text tw="text-[14px] text-white">{content}</text>
    </container>
  );
}

function BashCard({ label, cmd }) {
  return <Card label={label} content={poll(cmd)} />;
}

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

function ClaudeUsageCard({ data }) {
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

function WeatherCard({ w }) {
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

function KeyBadge({ label, focused, urgent }) {
  if (/^\d+$/.test(label) && parseInt(label, 10) > 10) {
    return <container tw="flex-shrink-0 w-[26px]" />;
  }
  return (
    <container tw={focused
      ? "flex flex-col items-center justify-center flex-shrink-0 w-[26px] py-[2px] rounded bg-[rgba(203,166,247,0.45)] border border-[rgba(203,166,247,0.7)]"
      : urgent
      ? "flex flex-col items-center justify-center flex-shrink-0 w-[26px] py-[2px] rounded bg-[rgba(243,139,168,0.45)] border border-[rgba(243,139,168,0.7)]"
      : "flex flex-col items-center justify-center flex-shrink-0 w-[26px] py-[2px] rounded bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.2)]"
    }>
      <text tw="text-[12px] text-white font-bold">{label}</text>
    </container>
  );
}

function WorkspaceName({ name, focused, urgent, subtitle }) {
  const sub = <text tw="text-[11px] text-[rgba(255,255,255,0.55)] truncate">{subtitle ?? ""}</text>;
  const sep = name.indexOf(': ');
  if (sep > 0) {
    const key = name.slice(0, sep);
    const label = name.slice(sep + 2);
    return (
      <container tw="flex flex-row items-center gap-[8px] w-full">
        <KeyBadge label={key} focused={focused} urgent={urgent} />
        <container tw="flex flex-col min-w-0 flex-1">
          <text tw={focused ? "text-[13px] text-white font-bold truncate" : urgent ? "text-[13px] text-[#f38ba8] truncate" : "text-[13px] text-[rgba(255,255,255,0.95)] truncate"}>
            {label}
          </text>
          {sub}
        </container>
      </container>
    );
  }
  if (/^\d+$/.test(name)) {
    return (
      <container tw="flex flex-row items-center gap-[8px]">
        <KeyBadge label={name} focused={focused} urgent={urgent} />
        <container tw="flex flex-col min-w-0 flex-1">
          {sub}
        </container>
      </container>
    );
  }
  return (
    <container tw="flex flex-col">
      <text tw={focused ? "text-[13px] text-white font-bold truncate" : urgent ? "text-[13px] text-[#f38ba8] truncate" : "text-[13px] text-[rgba(255,255,255,0.95)] truncate"}>
        {name}
      </text>
      {sub}
    </container>
  );
}

function WorkspaceList({ workspaces, notifications, events }) {
  globals.unread_notifs ??= {};

  // Clear unread marker when a workspace is focused
  const focusedWs = (workspaces ?? []).find(ws => ws.focused);
  if (focusedWs) {
    for (const env of Object.keys(globals.unread_notifs)) {
      if (focusedWs.name.endsWith(": " + env) || focusedWs.name === env) {
        delete globals.unread_notifs[env];
      }
    }
  }

  // Accumulate unread notifications (env → summary text)
  for (const n of notifications) {
    if (n.enwiro_env) {
      globals.unread_notifs[n.enwiro_env] = n.summary;
    }
  }

  return (
    <container tw="flex flex-col gap-[8px] pt-[16px] w-full">
      {(workspaces ?? []).map(ws => {
        const matchedEnv = Object.keys(globals.unread_notifs).find(env =>
          ws.name.endsWith(": " + env) || ws.name === env
        );
        const notifText = matchedEnv !== undefined ? globals.unread_notifs[matchedEnv] : null;
        const urgent = ws.urgent || notifText !== null;
        return (
        <container
          tw={ws.focused
            ? "flex flex-col justify-center px-3 h-[52px] rounded-lg border border-[#cba6f7] bg-[rgba(255,255,255,0.08)] backdrop-blur-md w-full"
            : urgent
            ? "flex flex-col justify-center px-3 h-[52px] rounded-lg border border-[#f38ba8] bg-[rgba(255,255,255,0.08)] backdrop-blur-md w-full"
            : "flex flex-col justify-center px-3 h-[52px] rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md w-full"
          }
          on_click={{ ...events.switchWorkspace, workspace: ws.name }}
        >
          <WorkspaceName name={ws.name} focused={ws.focused} urgent={urgent} subtitle={notifText} />
        </container>
        );
      })}
    </container>
  );
}

const NOTIF_W = 340;
const NOTIF_H = 72;
const NOTIF_GAP = 8;
const NOTIF_MARGIN = 16;

<root>
  <panel id="sidebar" anchor="left" width={250} height={ctx.screen_height} outer_gap={8}>
    <container
      tw="flex flex-col h-full w-full px-4 py-4"
      style={{ backgroundImage: "url(root-bg)", backgroundSize: "100% 100%" }}
    >
      <container tw="flex-1 flex flex-col w-full">
        <Module bin="~/.cargo/bin/costae-i3">
          {(data, events) => <WorkspaceList workspaces={data?.workspaces} notifications={notifications} events={events} />}
        </Module>
      </container>
      <container tw="flex flex-col gap-[10px] w-full">
        <WeatherCard w={weather} />
        <ClaudeUsageCard data={claudeUsage} />
        <BashCard label="DATE" cmd={`date +"%b %-d"`} />
        <BashCard label="TIME" cmd={`date +"%H:%M"`} />
      </container>
    </container>
  </panel>

  {(useJSONStream("costae:outputs") ?? []).map(o => (
    <panel
      id={`monitor-dot-${o.name}`}
      output={o.name}
      above={true}
      x={o.screen_width - 40}
      y={8}
      width={32}
      height={32}
    >
      <container tw="flex items-center justify-center w-full h-full rounded-full bg-red-500" />
    </panel>
  ))}

  {notifications.map((n, i) => (
    <panel
      id={`notif-pos-${i}`}
      above={true}
      x={ctx.screen_width - NOTIF_W - NOTIF_MARGIN}
      y={NOTIF_MARGIN + i * (NOTIF_H + NOTIF_GAP)}
      width={NOTIF_W}
      height={NOTIF_H}
    >
      <container
        tw="flex flex-col justify-center h-full w-full px-4 gap-[3px] rounded-lg border border-[rgba(255,255,255,0.25)] bg-[rgba(10,10,10,0.75)] backdrop-blur-md"
        style={{ backgroundImage: "url(root-bg)", backgroundSize: "100% 100%" }}
      >
        <text tw="text-[13px] font-bold text-white">{n.summary}</text>
        {n.body ? <text tw="text-[12px] text-[rgba(255,255,255,0.75)]">{n.body}</text> : <container />}
      </container>
    </panel>
  ))}
</root>
