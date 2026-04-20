---
name: grep-ai
description: Three pre-approved codebase search scripts. Run grep-extensions first if unsure of file types. Use grep-tree for structural exploration (what class/function/module surrounds a match). Use grep-raw for exact file:line coordinates. Both search scripts require a glob to avoid wasting budget on non-code files.
---

# grep-ai

```bash
~/.claude/scripts/grep-extensions.sh [dir]
~/.claude/scripts/grep-raw.sh <regexp> <max_lines> <glob> [dir]
~/.claude/scripts/grep-tree.sh <regexp> <max_bytes> <glob> [dir]
```

**grep-extensions** — file counts by extension, sorted by frequency. Run this first if you don't know the repo's file types. Use the output to pick your `<glob>`.

**grep-raw** — verbatim `rg` output, `file:line:content` per match. Use when you need exact coordinates (before `Read`, `Edit`, or `sed`).

**grep-tree** — `hson --tree --grep` scoped to files matching `<glob>`. Guarantees matched lines plus all structural ancestors (function → class → module). Best for code (`.go`, `.rs`, `.ts`, `.py`, etc.), markdown, JSON, YAML. **Avoid on flat text files** (changelogs, man pages) — no nesting structure, wastes budget. Output is verbatim with line numbers for code; canonical (no line numbers) for JSON/YAML and plain text. Because hson already adds structural context around every match, the pattern does not need to be generic — prefer a specific symbol or concept (`TokenValidator`, `migrate`, `errorComponent`) over a broad keyword that matches most of the codebase (`error`, `route`, `handler`). If the pattern is too broad, fall back to grep-raw.

**Workflow:** grep-extensions if unsure → grep-tree to orient → grep-raw for exact positions.

**grep-tree budgets:** `20000` quick · `50000` normal · `100000` deep

**Glob examples:** `*.go` · `*.rs` · `*.{ts,tsx}` · `*.py` · `**/*.md`
