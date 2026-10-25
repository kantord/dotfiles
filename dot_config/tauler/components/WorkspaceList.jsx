import { EnwiroEnvs, ClaudeRecaps } from "@gh/kantord/dotfiles-tauler";
import WorkspaceTree from "./WorkspaceTree.jsx";
import FocusDetail from "./FocusDetail.jsx";
import { scrollView, fitRows } from "../lib/listScroll.js";
import { focusDetail } from "../lib/focusDetail.js";
import { listViewportHeight } from "../lib/layout.js";
import { newMemory, trackAgents, unreadNotifications, clearFocused, updateLinger, finishedAgents } from "../lib/workspaceMemory.js";
import {
  fromTaulerInputs, buildTree, computeRows, defaultPolicies, findPath, nodeIdForWorkspace, PLACEHOLDER_DESC,
} from "../lib/workspaceTree.js";

const TICK_S = 1;

const usableDescription = (d) => (d && !PLACEHOLDER_DESC.test(d) ? d : null);

const envNameOf = (ws) => defaultPolicies.parseName(ws.name).env;

const memory = () => (globals.workspaceTree ??= newMemory());

export default function WorkspaceList({ workspaces, events }) {
  // Its only job is to re-render once a second so a lingering branch collapses on time.
  useJSONStream("/usr/bin/bash", `while :; do echo '{}'; sleep ${TICK_S}; done`);
  const notifications = useJSONStream("~/.cargo/bin/tauler-notify")?.notifications ?? [];
  return (
    <EnwiroEnvs>
      {(envs) => {
        const open = new Set((workspaces ?? []).map(envNameOf));
        const dirs = envs.filter((e) => open.has(e.name) && !usableDescription(e.description) && e.workspace).map((e) => e.workspace);
        return (
          <ClaudeRecaps dirs={dirs}>
            {(recaps) => <Tree workspaces={workspaces ?? []} envs={envs} recaps={recaps} notifications={notifications} events={events} />}
          </ClaudeRecaps>
        );
      }}
    </EnwiroEnvs>
  );
}

function Tree({ workspaces, envs, recaps, notifications, events }) {
  const mem = memory();
  const focusedWs = workspaces.find((w) => w.focused);
  trackAgents(mem, workspaces);
  clearFocused(mem, focusedWs, notifications);
  const unread = unreadNotifications(mem, notifications);
  const snapshot = fromTaulerInputs(
    { tauler_i3: { workspaces }, enwiro_envs: envs, claude_recaps: recaps },
    { notifications: unread.map((n) => ({ env: n.enwiro_env, text: n.summary })), previousAgentState: finishedAgents(mem) },
  );

  const tree = buildTree(snapshot);
  const focusedId = focusedWs ? nodeIdForWorkspace(focusedWs.name) : null;
  const lingerIds = updateLinger(mem, findPath(tree.roots, focusedId) ?? []);

  const { rows: raw, hiddenCount } = computeRows(tree, snapshot, { focusedId, lingerIds });
  // Monitor names are deliberately never shown: a real row's status would only ever be its output name.
  const all = raw.map((r) => (r.type === "row"
    ? { ...r, status: r.kind === "real" ? null : r.status, switchTo: tree.byId.get(r.activateTarget)?.ws?.name ?? null }
    : r));

  // Exact, because everything else in the sidebar has a fixed height (lib/layout.js).
  const viewportH = listViewportHeight(ctx.screen_height);
  const { rows } = fitRows(all, viewportH, hiddenCount);
  const { scrollTop, edges } = scrollView(rows, viewportH, mem.scrollTop, hiddenCount);
  mem.scrollTop = scrollTop;

  const detail = focusDetail(focusedId ? tree.byId.get(focusedId) : null, snapshot.now);

  return (
    <div class="flex flex-col w-full flex-shrink-0">
      <WorkspaceTree rows={rows} hiddenCount={hiddenCount} scrollTop={scrollTop} viewportH={viewportH} edges={edges} events={events} />
      <FocusDetail detail={detail} />
    </div>
  );
}
