import DateTimeCard from './components/DateTimeCard.jsx';
import WeatherCard from './components/WeatherCard.jsx';
import ClaudeUsageCard from './components/ClaudeUsageCard.jsx';
import GithubCard from './components/GithubCard.jsx';
import GithubReviewCard from './components/GithubReviewCard.jsx';
import WorkspaceList from './components/WorkspaceList.jsx';
import NotificationPanel from './components/NotificationPanel.jsx';
import CalendarSidebar from './components/CalendarSidebar.jsx';
// import MonitorDot from './components/MonitorDot.jsx';

export default function render() {

const notifications = useJSONStream("~/.cargo/bin/costae-notify")?.notifications ?? [];
const outputs = useJSONStream("costae:outputs") ?? [];
const dp1Output = outputs.find(o => o.name === "DP-1");
const primaryOutput = outputs.find(o => o.name === ctx.output);
const dpr = primaryOutput ? primaryOutput.height / ctx.screen_height : 1;
const dp1Height = dp1Output ? Math.round(dp1Output.height / dpr) : ctx.screen_height;

return <root>
  <panel id="sidebar" anchor="left" width={250} height={ctx.screen_height} outer_gap={8}>
    <container tw="flex flex-col h-full w-full px-4 py-4 bg-[#1e1e1e]">
      <container tw="flex-1 flex flex-col w-full">
        <Module bin="~/.cargo/bin/costae-i3">
          {(data, events) => <WorkspaceList workspaces={data?.workspaces} events={events} />}
        </Module>
      </container>
      <container tw="bg-primary w-full h-[4px] rounded-full" />
      <container tw="flex flex-col gap-[10px] w-full">
        <GithubCard />
        <GithubReviewCard />
        <WeatherCard />
        <ClaudeUsageCard />
        <DateTimeCard />
      </container>
    </container>
  </panel>

  <panel id="calendar" anchor="right" output="DP-1" width={60} height={dp1Height}>
    <container tw="h-full w-full py-4 px-1 bg-[#1e1e1e]">
      <CalendarSidebar />
    </container>
  </panel>

  {/* (useJSONStream("costae:outputs") ?? []).map(o => <MonitorDot o={o} />) */}

  {notifications.map((n, i) => <NotificationPanel n={n} i={i} ctx={ctx} />)}
</root>;

}
