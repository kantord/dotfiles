---
name: headson
description: Use the hson (headson) command to get a budget-constrained, semantically prioritized overview of a codebase or JSON/YAML files. Use when you need to orient yourself in a codebase, understand structure before making changes, or ingest as much meaningful code as possible within a token budget.
---

# Using hson (headson)

`hson` is a budget-respecting codebase compressor — not a truncator. Unlike `head`/`tail` which cut at arbitrary positions, `hson` distributes a character or line budget intelligently across an entire codebase, prioritizing structurally important lines (public structs, traits, function signatures, type definitions) and recently-modified files (via git frequency). What gets dropped is the least informative content. The result fits exactly in the budget and is maximally meaningful within it.

Install: `cargo install headson`

## Key insight

With a global character budget (`-C`), you can ingest an entire codebase in a single step — getting the most meaningful X characters of code rather than the first X characters. This is a valid and efficient strategy for agent codebase orientation.

## Core flags

```bash
-n, --lines <N>          Per-file line budget
-N, --global-lines <N>   Total line budget across all files
-C, --global-bytes <N>   Total byte budget across all files (best for token control)
-c, --bytes <N>          Per-file byte budget
-u, --chars <N>          Per-file Unicode character budget
--tree                   Directory tree layout with inline previews
-r, --recursive          Recursively expand directories
--grep <REGEX>           HARD: guarantee inclusion of matching lines (budget applies to rest)
--igrep <REGEX>          Case-insensitive --grep
--weak-grep <REGEX>      SOFT: bias priority toward matches without guaranteeing inclusion
--weak-igrep <REGEX>     Case-insensitive --weak-grep
-g, --glob <PATTERN>     Additional glob patterns to include
```

## Typical usage patterns

### 1. Broad codebase orientation (start here)
```bash
hson --recursive src -n 5 --tree
```
With a tight budget, hson auto-prioritizes: public types, traits, impl blocks, function signatures. Gives a structural skeleton of the whole codebase.

### 2. Full codebase within a token budget
```bash
hson --recursive src -C 50000 --tree
```
Single command to get the most meaningful 50KB of the codebase. Good for agent context loading.

### 3. Focused on relevant files (before making changes)
```bash
hson --recursive src -C 50000 --tree --weak-grep "usage_stats|EnvStats"
```
`--weak-grep` biases the budget toward files/lines matching the pattern without excluding everything else.

### 4. Force-include specific symbols
```bash
hson --recursive src -C 50000 --tree --grep "UserIntentSignals|activation_buffer"
```
`--grep` guarantees those lines appear regardless of budget; remaining budget covers everything else.

### 5. Drill into a specific file
```bash
hson path/to/file.rs -n 80
```

### 6. Combine hard and soft grep
```bash
hson --recursive src -C 60000 --tree --grep "pub struct|pub trait" --weak-grep "frecency"
```
Force-include all public type definitions, bias remaining budget toward frecency-related code.

## Budget strategy

- For agent codebase orientation: `-C 40000` to `-C 80000` is usually a good range
- Combine with `--tree` for directory structure context
- Use `--weak-grep` with recently changed file names to bias toward the diff area
- You never need to apply `hson` multiple times with a strict global budget — one call gives you everything that fits, optimally distributed
