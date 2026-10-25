// What the workspace list remembers between ticks. Every function takes the memory object
// (tauler keeps it in `globals`), so none of this touches tauler's runtime.
import { defaultPolicies } from "./workspaceTree.js";

export const LINGER_MS = 4000;

export const newMemory = () => ({
  agent: {},        // last agent state per workspace name
  finished: {},     // workspaces whose agent went working -> idle and wasn't looked at yet
  seenNotifs: [],   // notification ids cleared by focusing their env
  path: [],         // focus path of the previous tick
  linger: [],       // previous focus path, still held open
  lingerUntil: 0,
  scrollTop: 0,
});

const envNameOf = (ws) => defaultPolicies.parseName(ws.name).env;

/** Records each workspace's agent state and flags the ones that just finished. */
export function trackAgents(mem, workspaces) {
  for (const ws of workspaces) {
    const state = defaultPolicies.agentState({ ...ws, windows: ws.focused_windows ?? [], previousAgentState: null });
    if (state === "working") delete mem.finished[ws.name];
    else if (state === "idle" && mem.agent[ws.name] === "working") mem.finished[ws.name] = true;
    mem.agent[ws.name] = state;
  }
}

/** `previousAgentState` for fromTaulerInputs: finished agents still count as having been working. */
export const finishedAgents = (mem) =>
  Object.fromEntries(Object.keys(mem.finished).map((name) => [name, "working"]));

/** Notifications for an env the user has not focused since they arrived. */
export const unreadNotifications = (mem, notifications) =>
  notifications.filter((n) => n.enwiro_env && !mem.seenNotifs.includes(n.id));

/** Focusing a workspace clears what asked for attention there. */
export function clearFocused(mem, focusedWs, notifications) {
  if (focusedWs) {
    delete mem.finished[focusedWs.name];
    const env = envNameOf(focusedWs);
    for (const n of notifications) if (n.enwiro_env === env && !mem.seenNotifs.includes(n.id)) mem.seenNotifs.push(n.id);
  }
  // Ids that are gone for good need no remembering.
  mem.seenNotifs = mem.seenNotifs.filter((id) => notifications.some((n) => n.id === id));
}

/** When focus moves, the previous path stays open for LINGER_MS. Returns the ids to hold open. */
export function updateLinger(mem, path, now = Date.now()) {
  if (path.join() !== mem.path.join()) {
    mem.linger = mem.path.slice(0, -1);
    mem.lingerUntil = now + LINGER_MS;
    mem.path = path;
  }
  return now < mem.lingerUntil ? mem.linger : [];
}
