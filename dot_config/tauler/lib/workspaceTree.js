// workspace-tree.js
// Pure logic for the tree-style workspace list. No rendering, no I/O.
// Input: a snapshot of i3 workspaces + enwiro envs + recaps + notifications.
// Output: a flat list of row view-models that any renderer can draw.
//
// Every decision lives in a small, named, swappable policy (see `defaultPolicies`).

// ---------------------------------------------------------------------------
// Adapter: the shape tauler's sources produce today -> the normalized snapshot
// ---------------------------------------------------------------------------

/**
 * @param {object} inputs  `inputs` object as captured in fixtures/workspace-list.real.json
 * @param {object} [extra] { now (unix s), notifications: [{ env, text }], previousAgentState: { [wsName]: 'working'|'idle' } }
 */
export function fromTaulerInputs(inputs, extra = {}) {
  const recaps = inputs.claude_recaps || {};
  return {
    now: extra.now ?? Math.floor(Date.now() / 1000),
    workspaces: (inputs.tauler_i3?.workspaces || []).map((w) => ({
      name: w.name,
      focused: !!w.focused,
      urgent: !!w.urgent,
      visible: w.visible && !w.focused ? (w.output || true) : null, // i3 "visible on another output"
      windows: w.focused_windows || [],
      previousAgentState: extra.previousAgentState?.[w.name] ?? null,
    })),
    envs: (inputs.enwiro_envs || []).map((e) => ({
      name: e.name,
      description: e.description || null,
      status: e.status?.type || null, // done | cooked | evergreen
      outcome: e.status?.outcome || null,
      since: e.statusSince || 0,
      slot: e.scores?.slot ?? 0,
      recap: recaps[e.workspace] || null,
    })),
    notifications: extra.notifications || [],
  };
}

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

const SPINNER = /^[◐◓◑◒⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/; // Claude Code title spinner frames => working
const IDLE = /^✳/;

/** The github cookbook's stand-in description when it could not resolve a title. */
export const PLACEHOLDER_DESC = /^Work on (PR or issue|issue|PR) #[0-9]+ in /;

export const defaultPolicies = {
  /** "3: repo@branch" -> { key: "3", env: "repo@branch" }; "2" -> { key: "2", env: "" }; "." -> { key: null, env: "" } */
  parseName(name) {
    const m = name.match(/^(\d+):\s*(.*)$/);
    if (m) return { key: m[1], env: m[2] };
    if (/^\d+$/.test(name)) return { key: name, env: '' };
    return { key: null, env: '' };
  },

  /** Ancestor-first ids. repo -> repo@branch | repo#n | repo.gha@run -> .../segment */
  groupPath(env) {
    const slash = env.split('/');
    const head = slash[0];
    const repo = head.split(/[@#]/)[0].replace(/\.gha$/, '');
    const ids = [repo];
    if (head !== repo) ids.push(head);
    let acc = head;
    for (let i = 1; i < slash.length; i++) { acc += '/' + slash[i]; ids.push(acc); }
    return ids;
  },

  /** Should an env that is NOT open in i3 still appear as a data-only row? */
  retain(env, now) {
    const age = now - env.since;
    if (env.status === 'done') return age < 7 * 86400;
    if (env.status === 'cooked') return age < 2 * 86400 && env.slot > 0.5;
    return false;
  },

  /** 'working' | 'finished' | 'idle' | null, from window titles. */
  agentState(ws) {
    for (const t of ws.windows) {
      if (SPINNER.test(t)) return 'working';
      if (IDLE.test(t)) return ws.previousAgentState === 'working' ? 'finished' : 'idle';
    }
    return null;
  },

  /** Own attention count for a node (not including children). */
  attention(node, snapshot, policies) {
    let n = 0;
    const ws = node.ws;
    if (ws) {
      if (ws.urgent) n++;
      for (const t of ws.windows) if (/Action Required/.test(t)) n++;
      if (policies.agentState(ws) === 'finished') n++;
    }
    if (node.env) for (const x of snapshot.notifications) if (x.env === node.env.name) n++;
    return n;
  },

  /** Hotkeys are only shown/kept-open for 1..10. */
  isKeyed(node) { return !!(node.ws && node.key && Number(node.key) >= 1 && Number(node.key) <= 10); },

  /** Label = { prefix, prefixMono, text }. Recaps/descriptions never go in the row, only the tooltip. */
  label(node) {
    const { id, ws, env } = node;
    if (id.startsWith('ws:')) return { prefix: '', prefixMono: false, text: ws.windows.length ? cleanTitle(ws.windows[0]) : id.slice(3) };
    if (id.includes('/')) return { prefix: '/', prefixMono: false, text: id.split('/').pop() };
    const m = id.match(/^([^@#]+?)(\.gha)?([@#])(.+)$/);
    if (!m) return { prefix: '', prefixMono: false, text: id };
    const desc = env?.description ? env.description.replace(/^\[[^\]]+\]\s*/, '') : '';
    if (m[2]) return { prefix: 'ci', prefixMono: true, text: desc || m[4] };
    if (m[3] === '#') return { prefix: '#' + m[4], prefixMono: true, text: PLACEHOLDER_DESC.test(env?.description || '') ? '' : desc };
    return { prefix: '@', prefixMono: false, text: m[4] };
  },

  /** Indentation strategy: px width of the guide column for a given ancestor level, and where its 1px line sits. */
  indent: taper(12, 8, 6),
};

export function cleanTitle(t) {
  return t.replace(/\s+[-—]\s+(Google Chrome|Chromium|Mozilla Firefox)$/, '');
}

export function steps(w = 14) { return () => ({ width: w, line: Math.floor(w / 2) }); }
export function taper(...widths) { return (level) => { const w = widths[Math.min(level, widths.length - 1)]; return { width: w, line: Math.floor(w / 2) }; }; }
export function rail(w = 5) { return () => ({ width: w, line: 2 }); }

// ---------------------------------------------------------------------------
// Tree
// ---------------------------------------------------------------------------

/**
 * Node: { id, ws|null, env|null, key|null, virtual:boolean, children: Node[] }
 *   real     = has ws (exists in i3)
 *   virtual  = env only, retained by policy (data-only row)
 *   group    = neither (implicit parent from naming)
 */
export function buildTree(snapshot, policies = defaultPolicies) {
  const roots = [];
  const byId = new Map();
  const envByName = new Map(snapshot.envs.map((e) => [e.name, e]));
  const openEnvs = new Set();

  const ensure = (id, list) => {
    let n = byId.get(id);
    if (!n) { n = { id, ws: null, env: null, key: null, virtual: false, children: [] }; byId.set(id, n); list.push(n); }
    return n;
  };
  const place = (envName) => {
    let list = roots, node = null;
    for (const id of policies.groupPath(envName)) { node = ensure(id, list); list = node.children; }
    return node;
  };

  for (const ws of snapshot.workspaces) {
    const { key, env } = policies.parseName(ws.name);
    if (!env) { const n = { id: 'ws:' + ws.name, ws, env: null, key, virtual: false, children: [] }; byId.set(n.id, n); roots.push(n); continue; }
    const n = place(env);
    n.ws = ws; n.key = key; n.env = envByName.get(env) || null;
    openEnvs.add(env);
  }

  let hiddenCount = 0;
  for (const e of snapshot.envs) {
    if (openEnvs.has(e.name)) continue;
    if (!policies.retain(e, snapshot.now)) { hiddenCount++; continue; }
    const n = place(e.name);
    n.env = e; n.virtual = true;
  }
  return { roots, byId, hiddenCount };
}

export function findPath(roots, id, acc = []) {
  for (const n of roots) {
    const p = [...acc, n.id];
    if (n.id === id) return p;
    const r = findPath(n.children, id, p);
    if (r) return r;
  }
  return null;
}

export function nodeIdForWorkspace(name, policies = defaultPolicies) {
  const { env } = policies.parseName(name);
  return env ? policies.groupPath(env).at(-1) : 'ws:' + name;
}

export function firstRealDescendant(node) {
  if (node.ws) return node.id;
  for (const c of node.children) { const r = firstRealDescendant(c); if (r) return r; }
  return null;
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

/**
 * @param {object} tree       from buildTree
 * @param {object} snapshot
 * @param {object} view       { focusedId?, lingerIds?: string[], seen?: Set<string>, keepKeyedVisible?: boolean }
 * @returns {Array<Row|Spacer>}
 *
 * Row: {
 *   type: 'row', id, depth, guides: [{ width, line }],
 *   kind: 'real'|'virtual'|'group',
 *   label: { prefix, prefixMono, text }, isGroup,
 *   marker: null | { checked: boolean, dashed: boolean },   // tasks only; plain rows have no marker
 *   focused, onFocusPath,
 *   hotkey: string|null,
 *   hiddenChildren: number,                                  // shown as "+n"
 *   status: null | { text, tone: 'ok'|'muted' },             // data-only rows, or output name when visible elsewhere
 *   agentWorking: boolean, agentWorkingInside: boolean,
 *   attention: { count, inherited: boolean },               // inherited = includes folded descendants
 *   tooltip: string,
 *   activateTarget: string|null,                             // node id to focus on click; null = not clickable
 * }
 */
export function computeRows(tree, snapshot, view = {}, policies = defaultPolicies) {
  const seen = view.seen || new Set();
  const linger = new Set(view.lingerIds || []);
  const keepKeyed = view.keepKeyedVisible ?? true;
  const focusedId = view.focusedId
    ?? (() => { const f = snapshot.workspaces.find((w) => w.focused); return f ? nodeIdForWorkspace(f.name, policies) : null; })();
  const path = findPath(tree.roots, focusedId) || [];
  const onPath = new Set(path);

  const containsKeyed = (n) => policies.isKeyed(n) || n.children.some(containsKeyed);
  const ownAttn = (n) => (seen.has(n.id) ? 0 : policies.attention(n, snapshot, policies));
  const subtreeAttn = (n) => ownAttn(n) + n.children.reduce((s, c) => s + subtreeAttn(c), 0);
  const anyWorking = (n) => (n.ws && policies.agentState(n.ws) === 'working') || n.children.some(anyWorking);
  const age = (s) => (s < 3600 ? Math.max(1, Math.round(s / 60)) + 'm' : s < 86400 ? Math.round(s / 3600) + 'h' : Math.round(s / 86400) + 'd');

  const rows = [];
  let lastTopWasBranch = false;

  const walk = (nodes, depth, ancestors) => {
    for (let n of nodes) {
      // Compact a pure group with exactly one child into a single row: "enwiro · ci Rust Workflow on main"
      let compact = '';
      while (!n.ws && !n.virtual && n.children.length === 1) { compact += n.id.split('/').pop() + ' · '; n = n.children[0]; }

      const kids = n.children;
      const fullyOpen = onPath.has(n.id) || linger.has(n.id);
      const shown = fullyOpen ? kids : keepKeyed ? kids.filter(containsKeyed) : [];
      const hidden = kids.filter((k) => !shown.includes(k));
      const isGroup = !n.ws && !n.virtual;
      const kind = n.ws ? 'real' : n.virtual ? 'virtual' : 'group';
      const focused = n.id === focusedId;

      const lbl = policies.label(n);
      if (compact) { lbl.prefix = compact + (lbl.prefix && lbl.prefix !== '/' ? lbl.prefix : ''); }

      const own = ownAttn(n);
      const inheritedAttn = hidden.reduce((s, k) => s + subtreeAttn(k), 0);
      const agent = n.ws ? policies.agentState(n.ws) : null;

      let status = null;
      if (n.virtual && n.env) {
        const a = age(snapshot.now - n.env.since);
        status = n.env.status === 'done' ? { text: 'done · ' + a, tone: 'ok' } : { text: 'not opened · ' + a, tone: 'muted' };
      } else if (n.ws?.visible && !focused) {
        status = { text: typeof n.ws.visible === 'string' ? n.ws.visible : 'other screen', tone: 'muted' };
      }

      const isTask = !!n.env && (n.env.status === 'cooked' || n.env.status === 'done');
      const branchy = isGroup || kids.length > 0;
      if (depth === 0 && rows.length && (branchy || lastTopWasBranch)) rows.push({ type: 'spacer' });
      if (depth === 0) lastTopWasBranch = branchy;

      rows.push({
        type: 'row',
        id: n.id,
        depth,
        guides: ancestors.map((_, level) => policies.indent(level)),
        kind,
        isGroup,
        label: lbl,
        marker: isTask ? { checked: n.env.status === 'done', dashed: !!n.virtual } : null,
        focused,
        onFocusPath: !focused && onPath.has(n.id),
        hotkey: policies.isKeyed(n) ? n.key : null,
        hiddenChildren: hidden.length,
        status,
        agentWorking: agent === 'working',
        agentWorkingInside: agent !== 'working' && hidden.some(anyWorking),
        attention: { count: own + inheritedAttn, inherited: inheritedAttn > 0 },
        tooltip: [
          n.ws ? n.ws.name : n.env ? `${n.env.name}${n.virtual ? ' (not open)' : ''}` : n.id + '/',
          n.ws?.visible ? `visible on ${n.ws.visible}` : null,
          n.env?.description,
          n.env?.recap,
        ].filter(Boolean).join('\n'),
        activateTarget: n.virtual ? null : isGroup ? firstRealDescendant(n) : n.id,
      });

      if (shown.length) walk(shown, depth + 1, [...ancestors, n.id]);
    }
  };
  walk(tree.roots, 0, []);
  return { rows, hiddenCount: tree.hiddenCount, focusedId, path };
}
