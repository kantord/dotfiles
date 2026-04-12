const poll = (cmd) => useStringStream("/usr/bin/bash", `while true; do ${cmd}; sleep 1; done`);

const notifications = useJSONStream("/home/kantord/.cargo/bin/costae-notify")?.notifications ?? [];

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

function KeyBadge({ label, focused, urgent }) {
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

function WorkspaceName({ name, focused, urgent }) {
  const sep = name.indexOf(': ');
  if (sep > 0) {
    const key = name.slice(0, sep);
    const label = name.slice(sep + 2);
    return (
      <container tw="flex flex-row items-center gap-[8px] w-full">
        <KeyBadge label={key} focused={focused} urgent={urgent} />
        <text tw={focused ? "text-[16px] text-white font-bold truncate min-w-0" : urgent ? "text-[16px] text-[#f38ba8] truncate min-w-0" : "text-[16px] text-[rgba(255,255,255,0.95)] truncate min-w-0"}>
          {label}
        </text>
      </container>
    );
  }
  if (/^\d+$/.test(name)) {
    return (
      <container tw="flex flex-row">
        <KeyBadge label={name} focused={focused} urgent={urgent} />
      </container>
    );
  }
  return (
    <text tw={focused ? "text-[16px] text-white font-bold truncate" : urgent ? "text-[16px] text-[#f38ba8] truncate" : "text-[16px] text-[rgba(255,255,255,0.95)] truncate"}>
      {name}
    </text>
  );
}

function WorkspaceList({ workspaces, events }) {
  return (
    <container tw="flex flex-col gap-[8px] pt-[16px] w-full">
      {(workspaces ?? []).map(ws => (
        <container
          tw={ws.focused
            ? "flex flex-col gap-[2px] px-3 py-2 rounded-lg border border-[#cba6f7] bg-[rgba(255,255,255,0.08)] backdrop-blur-md w-full"
            : ws.urgent
            ? "flex flex-col gap-[2px] px-3 py-2 rounded-lg border border-[#f38ba8] bg-[rgba(255,255,255,0.08)] backdrop-blur-md w-full"
            : "flex flex-col gap-[2px] px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md w-full"
          }
          on_click={{ ...events.switchWorkspace, workspace: ws.name }}
        >
          <WorkspaceName name={ws.name} focused={ws.focused} urgent={ws.urgent} />
        </container>
      ))}
    </container>
  );
}

const NOTIF_W = 340;
const NOTIF_H = 72;
const NOTIF_GAP = 8;
const NOTIF_MARGIN = 16;

<root>
  <panel id="topbar" anchor="top" output="HDMI-0" width={ctx.outputs?.find(o => o.name === "HDMI-0")?.screen_width ?? 1920} height={36}>
    <container
      tw="flex flex-row items-center justify-end h-full w-full px-4 gap-[16px]"
      style={{ backgroundImage: "url(root-bg)", backgroundSize: "100% 100%" }}
    >
      <text tw="text-[14px] text-white">{poll(`date +"%b %-d"`)}</text>
      <text tw="text-[14px] text-white">{poll(`date +"%H:%M"`)}</text>
    </container>
  </panel>

  <panel id="sidebar" anchor="left" width={250} height={ctx.screen_height} outer_gap={8}>
    <container
      tw="flex flex-col h-full w-full px-4 py-4"
      style={{ backgroundImage: "url(root-bg)", backgroundSize: "100% 100%" }}
    >
      <container tw="flex-1 flex flex-col w-full">
        <Module bin="/home/kantord/.cargo/bin/costae-i3">
          {(data, events) => <WorkspaceList workspaces={data?.workspaces} events={events} />}
        </Module>
      </container>
      <container tw="flex flex-col gap-[10px] w-full">
        <BashCard label="DATE" cmd={`date +"%b %-d"`} />
        <BashCard label="TIME" cmd={`date +"%H:%M"`} />
        <image src="/home/kantord/.config/costae/tux.png" tw="w-[80px] h-[80px]" />
      </container>
    </container>
  </panel>

  {notifications.map((n, i) => (
    <panel
      id={`notif-${n.id}`}
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
