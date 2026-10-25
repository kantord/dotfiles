import { SIDEBAR_PAD, TAULER_I3 } from "../lib/layout.js";
import WeatherCard from "./WeatherCard.jsx";
import SystemChart from "./SystemChart.jsx";
import ClaudeUsageCard from "./ClaudeUsageCard.jsx";
import VolumeCard from "./VolumeCard.jsx";
import ClockCard from "./ClockCard.jsx";
import WorkspaceList from "./WorkspaceList.jsx";

// The wallpaper slice goes in as an <img> node: much cheaper than `backgroundImage: url(root-bg)`.
function Backdrop() {
  return <img src="tauler:root-bg" class="absolute top-0 left-0 w-full h-full" />;
}

export default function Sidebar() {
  return (
    <div class="relative w-full h-full">
      <Backdrop />
      <div class="relative flex flex-col w-full h-full"
           style={{ paddingLeft: SIDEBAR_PAD.left, paddingRight: SIDEBAR_PAD.right, paddingTop: SIDEBAR_PAD.y, paddingBottom: SIDEBAR_PAD.y }}>
        <div class="flex-1 min-h-0 flex flex-col w-full">
          {/* <I3Layout> registers the gaps for this same bin, so none are passed here. */}
          <Module bin={TAULER_I3}>
            {(data, events) => <div class="flex-1 min-h-0 flex flex-col w-full">
              <WorkspaceList workspaces={data?.workspaces} events={events} />
            </div>}
          </Module>
        </div>
        <div class="flex flex-col w-full">
          <WeatherCard />
          <SystemChart />
          <ClaudeUsageCard />
          <VolumeCard />
          <ClockCard />
        </div>
      </div>
    </div>
  );
}
