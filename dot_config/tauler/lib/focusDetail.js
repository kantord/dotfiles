// What the focused-workspace strip says. Pure: takes a tree node from lib/workspaceTree.js.
// This is where recaps, descriptions and full window titles end up, since tauler has no tooltips.
import { defaultPolicies, PLACEHOLDER_DESC } from "./workspaceTree.js";

const AGENT_PREFIX = /^[◐◓◑◒⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏✳]\s*/;
const TYPE_PREFIX = /^\[[^\]]+\]\s*/;

const age = (s) => (s < 3600 ? `${Math.max(1, Math.round(s / 60))}m` : s < 86400 ? `${Math.round(s / 3600)}h` : `${Math.round(s / 86400)}d`);

/**
 * @param {object|null} node  tree node ({ ws, env, ... }) of the focused workspace
 * @param {number} now        unix seconds
 * @returns {{ title, body, meta, metaTone: 'busy'|'muted' } | null}
 */
export function focusDetail(node, now) {
  if (!node) return null;
  const { ws, env } = node;
  const title = ws?.name ?? env?.name ?? node.id;

  const description = env?.description && !PLACEHOLDER_DESC.test(env.description) ? env.description.replace(TYPE_PREFIX, "") : null;
  const firstWindow = ws?.windows?.[0]?.replace(AGENT_PREFIX, "") ?? "";
  let body = env?.recap || description || firstWindow;
  const otherWindows = (ws?.windows?.length ?? 0) - 1;
  if (!env?.recap && !description && otherWindows > 0) body += `  & ${otherWindows} more window${otherWindows > 1 ? "s" : ""}`;

  const agent = ws ? defaultPolicies.agentState({ windows: ws.windows ?? [] }) : null;
  let meta = "", metaTone = "muted";
  if (agent === "working") { meta = "◑ working"; metaTone = "busy"; }
  else if (agent === "idle") meta = "✳ idle";
  else if (env?.status && env.since) meta = `${env.status} · ${age(now - env.since)}`;

  return { title, body, meta, metaTone };
}
