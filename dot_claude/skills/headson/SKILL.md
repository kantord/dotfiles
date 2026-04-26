---
name: headson
description: Use the hson (headson) command to get a budget-constrained, semantically prioritized overview of a codebase or JSON/YAML files. Use when you need to orient yourself in a codebase, understand structure before making changes, or ingest as much meaningful code as possible within a token budget.
---

# Using hson (headson)

`hson` is a budget-respecting codebase compressor — not a truncator. Unlike `head`/`tail` which cut at arbitrary positions, `hson` uses an indentation-tree scoring algorithm to surface the most structurally important lines within a budget. What gets dropped is the least informative content (blank lines, closing braces, duplicate boilerplate). The result fits exactly in the budget and is maximally meaningful within it.

Install: `cargo install headson`

## How the algorithm works (accurate as of v0.16)

**Indentation tree scoring.** In code mode (`.rs`, `.py`, `.ts`, etc.), each line's indentation depth becomes its depth in a tree. Block-introducing lines (function headers, struct definitions, impl blocks, control flow openers) become parents of their body lines. Parents get a small priority bonus (`CODE_PARENT_LINE_BONUS`), so signatures appear before bodies when the budget is tight.

**Priority scoring.** A min-heap assigns each node a score from its parent's score plus positional penalties and bonuses. Lower score = higher priority. Large penalties (magnitude 10¹²) are applied to:
- Blank lines → reliably cut first under any meaningful budget
- Brace/paren-only lines (`}`, `);`, etc.) → same, reliably absent under tight budgets
- Duplicate lines (same trimmed text seen elsewhere in the fileset) → boilerplate imports deprioritized

**No cross-reference awareness.** The algorithm has no keyword awareness and no def-usage graph. It does not understand `pub`, `fn`, `struct`, or `impl` as special tokens — structural importance is inferred entirely from indentation structure. A line calling `important_fn` does not score higher than one calling `obscure_fn`. (cruxlines-style analysis is planned but not yet integrated.)

**Frecency = file ordering only.** Git edit frecency (via `frecenfile`) determines which files appear first in `--recursive` filesets — most recently/frequently edited files surface first under tight global budgets. Frecency has no effect on which lines within a file are included.

## Core flags

```bash
-n, --lines <N>          Per-file line budget
-N, --global-lines <N>   Total line budget across all files
-C, --global-bytes <N>   Total byte budget across all files (best for token control)
-c, --bytes <N>          Per-file byte budget
--tree                   Directory tree layout with inline previews
-r, --recursive          Recursively expand directories
--grep <REGEX>           HARD: guarantee inclusion of matching lines + all ancestors (budget applies to rest)
--igrep <REGEX>          Case-insensitive --grep
--weak-grep <REGEX>      SOFT: move matches to front of priority queue, no guarantee
--weak-igrep <REGEX>     Case-insensitive --weak-grep
--capped-grep <REGEX>    AUDITED: like --grep but budget is a hard cap; hidden matches are counted
--capped-igrep <REGEX>   Case-insensitive --capped-grep
--count-matches          Print "N shown, M hidden" summary to stderr (use with --capped-grep)
-g, --glob <PATTERN>     Additional glob patterns to include
```

## --grep vs --capped-grep vs --weak-grep

**`--grep` (hard guarantee):**
- Every matching line AND all its indentation ancestors are always included, regardless of budget
- **The budget does NOT cap grep matches** — matches are "free" and added on top of whatever the budget covers
- A broad pattern on a large codebase can produce output far exceeding the budget
- In filesets: files with zero matches are dropped by default
- Use when you MUST see a specific symbol and don't care about output size

**`--capped-grep` (audited / best-effort):**
- Matches are attempted in priority order against the budget — no forced inclusion past the cap
- Always pair with `--count-matches` to get a `"N shown, M hidden"` summary on stderr
- When `M = 0` you got everything; when `M > 0` you know to narrow the pattern or increase the budget
- In filesets: files with zero matches are dropped (same as `--grep`)
- **Use this as the default grep mode** — it's safe to use with any budget and tells you if it was enough

**`--weak-grep` (soft priority boost):**
- Matches move to the front of the priority queue, no guarantee, no filtering of files
- Use when you want to bias toward an area without excluding non-matching files

## Reading hson output as a map, not a complete view

**What to trust:**
- Every line shown is verbatim source text — no paraphrasing
- Line numbers are faithful: a jump from `11:` to `31:` means lines 12–30 were cut
- If a line at depth 3 appears, all its indentation ancestors are present — you will never see an orphaned body without its function header

**Truncation signals in code mode:**
- Line number gaps are the primary signal: `718: pub fn build_order(` then `876: fn compute_duplicate_line_counts(` means lines 719–875 were cut
- No explicit "body omitted" marker — the gap is the signal

**The right mental model — use it as a symbol table:**
Under a moderate budget, hson gives you the complete public API surface (all function/struct/impl signatures) even for large files, with bodies omitted. Use that map to identify *which* functions to read with a direct file read. Truncated body lines are not a bug — they tell you where to look next.

**When to follow up with a direct read:**
- Line number gap is large (>20 lines) and those lines are semantically critical
- You need to verify control flow, not just signatures
- You see a truncated string (`…` in a value) and need the full value

## Budget rules of thumb (for Rust files)

| Goal | Budget |
|------|--------|
| API surface only (all signatures) | `-n <file_lines / 20>` |
| Mostly complete with bodies | `-n <file_lines / 2>` |
| Full fidelity | `-n <file_lines>` (a few % of blank/brace lines still pruned) |
| Multi-file recursive | Use `-C <total_chars>` to prevent early files consuming everything |

**Important:** The default budget is 500 bytes per file — roughly 10–12 lines of Rust. Always override explicitly for code exploration.

## Typical usage patterns

### 1. Codebase orientation (start here)
```bash
hson --recursive src -n 5 --tree
```
Tight per-file budget → only signatures. Gives a structural skeleton of the whole codebase.

### 2. Full codebase within a token budget
```bash
hson --recursive src -C 50000 --tree
```
Single command to get the most meaningful 50KB. Good for broad agent context loading.

### 3. Bias toward a module (before making changes)
```bash
hson --recursive src -C 50000 --tree --weak-grep "usage_stats|EnvStats"
```
`--weak-grep` moves matching files/lines to the front — they appear first and are more likely to be fully included.

### 4. Search within a budget (safe default for agents)
```bash
hson --recursive src -C 50000 --tree --capped-grep "Supervisor|Reconcile" --count-matches
```
All matches that fit within 50KB are included; `stderr` tells you how many were hidden. If hidden > 0, narrow the pattern. Use this instead of `--grep` when you can't predict how many matches exist.

### 5. Guarantee specific symbols are present
```bash
hson --recursive src -C 50000 --tree --grep "pub fn activation_percentile_scores"
```
The function signature + all its ancestors are unconditionally included. Remaining budget covers everything else. Only use `--grep` when the pattern is narrow and you're certain it won't flood the output.

### 6. Combine hard and soft
```bash
hson --recursive src -C 60000 --tree --grep "pub struct|pub trait" --weak-grep "frecency"
```
Force-include all public type definitions; bias remaining budget toward frecency-related code.

### 7. Single file, mostly complete
```bash
# For a 300-line file, -n 150 gives most bodies
hson path/to/file.rs -n 150
```

## Passing hson context to sub-agents (without polluting coordinator context)

Use the pre-approved wrapper script (single approval, works across all sessions):

```bash
# With weak-grep pattern:
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh src 50000 "<weak_grep_pattern>")

# Without pattern:
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh src 50000)

# Audited search — safe default when pattern breadth is unknown:
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh src 50000 "" "" "Supervisor|Reconcile")
# stderr will print "N shown, M hidden" — check M before proceeding

# With hard grep guarantee (use only for narrow, known-small patterns):
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh src 50000 "" "pub fn my_function")
```

The script writes to `/tmp`, prints a 3-line preview to stderr as a sanity check, and returns the path on stdout. Pre-approved via `Bash(/home/kantord/.claude/scripts/hson-snapshot.sh:*)` in global settings (absolute path required — tilde expansion does not work in permission rules).

Pass `$HSON_TMP` in the agent prompt. Brief the agent on what the snapshot provides:
- State the budget and any grep patterns used
- Remind the agent: **line number gaps = truncated body; use as a map to guide direct reads**
- If you used `--grep`, tell the agent: "the matched symbols and all their ancestors are guaranteed present"
- Ask the agent to warn you if the snapshot was absent or unhelpful — that is the validation signal
