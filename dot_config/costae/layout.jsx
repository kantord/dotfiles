import BashCard from './components/BashCard.jsx';
import WeatherCard from './components/WeatherCard.jsx';
import ClaudeUsageCard from './components/ClaudeUsageCard.jsx';
import WorkspaceList from './components/WorkspaceList.jsx';
import NotificationPanel from './components/NotificationPanel.jsx';
import MonitorDot from './components/MonitorDot.jsx';

const notifications = useJSONStream("~/.cargo/bin/costae-notify")?.notifications ?? [];

<root>
  <panel id="sidebar" anchor="left" width={250} height={ctx.screen_height} outer_gap={8}>
    <container
      tw="flex flex-col h-full w-full px-4 py-4"
      style={{ backgroundImage: "url(root-bg)", backgroundSize: "100% 100%" }}
    >
      <container tw="flex-1 flex flex-col w-full">
        <Module bin="~/.cargo/bin/costae-i3">
          {(data, events) => <WorkspaceList workspaces={data?.workspaces} events={events} />}
        </Module>
      </container>
      <container tw="flex flex-col gap-[10px] w-full">
        <WeatherCard />
        <ClaudeUsageCard />
        <BashCard label="DATE" cmd={`date +"%b %-d"`} />
        <BashCard label="TIME" cmd={`date +"%H:%M"`} />
      </container>
    </container>
  </panel>

  {(useJSONStream("costae:outputs") ?? []).map(o => <MonitorDot o={o} />)}

  {notifications.map((n, i) => <NotificationPanel n={n} i={i} ctx={ctx} />)}
</root>
