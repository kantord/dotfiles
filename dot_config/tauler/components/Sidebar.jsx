import { SIDEBAR_PAD, TAULER_I3 } from "../lib/layout.js";
import WorkspaceList from "./WorkspaceList.jsx";
import StatusPanel from "./StatusPanel.jsx";

// The wallpaper slice goes in as an <img> node: much cheaper than `backgroundImage: url(root-bg)`.
function Backdrop() {
  return <img src="tauler:root-bg" class="absolute top-0 left-0 w-full h-full" />;
}

// Two zones, both with known heights: the workspace list (with its focus strip) on top,
// the status panel at the bottom. WorkspaceList computes its own height from lib/layout.js.
export default function Sidebar() {
  return (
    <div class="relative w-full h-full">
      <Backdrop />
      <div class="relative flex flex-col justify-between w-full h-full"
           style={{ paddingLeft: SIDEBAR_PAD.left, paddingRight: SIDEBAR_PAD.right, paddingTop: SIDEBAR_PAD.y, paddingBottom: SIDEBAR_PAD.y }}>
        {/* <I3Layout> registers the gaps for this same bin, so none are passed here. */}
        <Module bin={TAULER_I3}>
          {(data, events) => <WorkspaceList workspaces={data?.workspaces} events={events} />}
        </Module>
        <StatusPanel />
      </div>
    </div>
  );
}
