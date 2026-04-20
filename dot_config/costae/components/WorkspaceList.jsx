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

function WorkspaceName({ name, focused, urgent, subtitle, displayLabel }) {
  const sub = subtitle
    ? <text tw="text-[11px] text-[rgba(255,255,255,0.55)] truncate">{subtitle}</text>
    : null;
  const textClass = focused ? "text-[13px] text-white font-bold truncate"
    : urgent ? "text-[13px] text-[#f38ba8] truncate"
    : "text-[13px] text-[rgba(255,255,255,0.95)] truncate";
  const sep = name.indexOf(': ');
  if (sep > 0) {
    const key = name.slice(0, sep);
    const label = displayLabel ?? name.slice(sep + 2);
    return (
      <container tw="flex flex-row items-center gap-[8px] w-full">
        <KeyBadge label={key} focused={focused} urgent={urgent} />
        <container tw="flex flex-col min-w-0 flex-1">
          <text tw={textClass}>{label}</text>
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
  const label = displayLabel ?? name;
  return (
    <container tw="flex flex-col">
      <text tw={textClass}>{label}</text>
      {sub}
    </container>
  );
}

export default function WorkspaceList({ workspaces, events }) {
  const notifications = useJSONStream("~/.cargo/bin/costae-notify")?.notifications ?? [];
  const meta = useJSONStream("~/.local/bin/enwiro-meta-stream.sh") ?? {};
  globals.unread_notifs ??= {};

  const focusedWs = (workspaces ?? []).find(ws => ws.focused);
  if (focusedWs) {
    for (const env of Object.keys(globals.unread_notifs)) {
      if (focusedWs.name.endsWith(": " + env) || focusedWs.name === env) {
        delete globals.unread_notifs[env];
      }
    }
  }

  for (const n of notifications) {
    if (n.enwiro_env) {
      globals.unread_notifs[n.enwiro_env] = n.summary;
    }
  }

  return (
    <container tw="flex flex-col gap-[8px] pt-[16px] w-full">
      {(workspaces ?? []).map(ws => {
        const nameSep = ws.name.indexOf(': ');
        const envName = nameSep > 0 ? ws.name.slice(nameSep + 2) : ws.name;
        const matchedEnv = Object.keys(globals.unread_notifs).find(env =>
          ws.name.endsWith(": " + env) || ws.name === env
        );
        const notifText = matchedEnv !== undefined ? globals.unread_notifs[matchedEnv] : null;
        const envMeta = meta[envName] ?? {};
        const rawDesc = envMeta.description ?? null;
        const description = rawDesc ? rawDesc.replace(/^\[(issue|pr|PR|Issue)\]\s*/i, '') : null;
        const displayLabel = description;
        const subtitle = notifText ?? (description ? envName : null);
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
            <WorkspaceName name={ws.name} focused={ws.focused} urgent={urgent} subtitle={subtitle} displayLabel={displayLabel} />
          </container>
        );
      })}
    </container>
  );
}
