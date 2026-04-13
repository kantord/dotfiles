---
name: tdd
description: Run a strict TDD cycle using specialized subagents (test writer, implementer, reviewer, refactorer, simplicity agent). Use as the default workflow for any coding implementation task — features, bug fixes, refactors, or data model changes. Check for project-specific overrides in CLAUDE.md before starting.
---

# TDD Workflow

This skill implements a strict Red-Green-Refactor TDD cycle using specialized subagents. The main Claude instance acts as coordinator — launching agents, reading their outputs, and deciding next steps.

**This is the default workflow for coding tasks.** Before starting, check the project's `CLAUDE.md` for any project-specific overrides (test patterns, build commands, special constraints).

## Key distinctions

- **Baby step**: a unit of independently mergeable work (one commit, potentially one PR)
- **TDD flow**: a non-mergeable sub-step that advances toward a baby step

One baby step can — and often should — be multiple TDD flows. Do not try to fit everything into one flow.

## Principles

- XP micro-cycle philosophy: each flow targets **one behavioral claim**. Not one test file, not one feature — one claim. Pragmatically this often means one new test written from scratch, plus minor updates to existing tests.
- If a step needs more than ~3 new tests, that is a signal the step should be split (see: Divide and Conquer below)
- The coordinator NEVER makes scope decisions autonomously — always ask the user
- Agents do NOT make changes outside their mandate — they flag and stop instead

---

## The Agents

Five pre-configured subagents handle the TDD cycle. Invoke each by name — their role definitions, tool restrictions, and behavioral rules live in `~/.claude/agents/tdd-*.md`.

| Agent | Name to invoke | Tools |
|-------|---------------|-------|
| Test Writer | `tdd-test-writer` | Read, Grep, Glob, Write, Edit, Bash |
| Implementer | `tdd-implementer` | Read, Grep, Glob, Write, Edit, Bash |
| Reviewer | `tdd-reviewer` | Read, Grep, Glob, Bash (read-only) |
| Refactorer | `tdd-refactorer` | Read, Grep, Glob, Write, Edit, Bash |
| Simplicity Agent | `tdd-simplicity` | Read, Grep, Glob, Write, Edit, Bash |

**What to pass each agent:** task-specific context only — file paths, behavioral claim, baby step description, hson snapshot path, any context from previous agents. The agent already knows its role and rules.

**Key behaviors to know:**
- Test writer performs a mandatory scope check: if >3 tests or >3 existing tests affected, it flags to coordinator before proceeding
- Implementer stops and flags if any existing test would need to be modified/deleted
- Reviewer stands down quickly if tests are adequate — it only flags what tests don't already prove
- Refactorer reports whether the Simplicity Agent should be triggered
- Simplicity Agent only removes a test if it can point to another that covers the same claim

---

## Coordinator Responsibilities

### Between each agent

After reading each agent's output, do a quick soft-signal scan before proceeding:
- Any mention of test deletions, modifications, or retirements? → stop, decide
- Any scope flags from the test writer? → stop, decide (see Divide and Conquer)
- Any "blocked" reports from the implementer? → stop, decide
- Test count growing unexpectedly? → consider triggering Simplicity Agent

**After the test-writer specifically:** run `git diff --stat` and check for non-test production file changes that are not type definitions. If the test-writer touched function bodies, control flow, or logic in production files, revert those hunks (`git checkout -- <file>` or a targeted `git restore -p`) before launching the implementer. Note what was reverted in your handoff prompt so the implementer knows what it needs to write. This keeps the red-green gap honest.

You can be mostly passive when agents are operating cleanly. The agents will push back when something is wrong — your job is to notice those pushbacks and route them correctly.

### After each full cycle

1. Read the refactorer's report
2. **Always ask the user** before deciding whether to start a new TDD cycle or advance — never make this call unilaterally
3. If a task is too large, split it — restart with a smaller sub-task

### When a baby step is complete

Always:
1. Show a brief diff summary
2. Ask the user to manually review the changes
3. Ask what they want to do:
   - **Pure refactor** → suggest commit, potentially merge to main
   - **Behavior change** → suggest commit + PR
   - **User-facing feature** → suggest commit + PR + consider release
4. Never auto-commit or auto-merge — the user always decides
5. Consider running the Simplicity Agent one final time across the whole baby step's changes

---

## Working in Low-Coverage / Legacy Code

Standard TDD assumes a working test baseline. In areas with zero or near-zero test coverage, two additional baby step types precede the normal A→B→C→D cycle:

### Make-it-testable baby step

If the test-writer reports a "Testability signal" (code can't be unit-tested without extraction), the right response is a dedicated extraction baby step before any behavioral work:

1. Extract the untestable code into a pure function or injectable dependency — no behavior change, no new tests yet
2. Run the test-writer in **Mode B** to confirm the extraction didn't regress anything
3. Only then start the Mode A or Mode D cycle on the extracted, now-testable unit

This is a baby step in its own right — independently reviewable and committable. Do not skip it by writing an integration test that can't be easily extended.

### Characterize-first baby step (Mode D)

If the code area has no tests at all, run the test-writer in **Mode D** first:

1. The test-writer pins existing behavior as-is — not what should be true, what currently is true
2. Review the Mode D output: are there behaviors being pinned that are actually wrong? Those are T-category findings for later cycles, not things to bake in.
3. Only after a Mode D baseline exists, start the normal Mode A cycle for the new behavior

**Important:** Mode D tests are not the goal — they are scaffolding. Once Mode A tests exist that cover the same claims, Mode D tests become candidates for the Simplicity Agent.

### Routing signals

| Test-writer report | Coordinator action |
|---|---|
| "Testability signal" | Plan a make-it-testable baby step; ask user to confirm before proceeding |
| "Mode D complete" | Review pinned behaviors; ask user: run Mode A now, or pin more first? |
| "Fixture signal" | Ask user: add a builder/factory baby step before continuing, or proceed and accept the debt? |
| "Cannot reproduce" (Mode E) | Stop — the user's assumption may be wrong or the area needs Mode D first. Report back before proceeding. |

---

## Divide and Conquer

When the test writer triggers a scope signal, or when a step feels too large, apply divide and conquer:

**The principle:** It is hard to make a large step simple, but it is easier to imagine a slightly simpler version of it. Apply recursively until the step becomes trivial.

**Process:**
1. Identify the simpler preceding change suggested by the test writer (or propose one yourself)
2. Ask the user: proceed with that simpler change first, or proceed with the original step?
3. If the user agrees to split: run a new TDD flow for the simpler change first
4. After that flow completes, the original step should be noticeably easier

**Soft limit: 3 levels of recursion.** If after 3 rounds of splitting the step is still not simple, that is a signal for user intervention — the problem likely requires a design rethink, a spike, or explicit feedback about the approach. Do not keep splitting indefinitely.

---

## /tmp Files Reference

| File | Written by | Read by |
|------|-----------|---------|
| `/tmp/tdd-test-context.md` | Test agent | Implementer, Reviewer, Refactorer |
| `/tmp/tdd-impl-context.md` | Implementer | Reviewer, Refactorer |
| `/tmp/tdd-review.md` | Reviewer | Refactorer, Coordinator |

---

## Starting a Cycle

When invoking this skill, specify:
- What task is being worked on (and its source — issue number, PR, description)
- The exact sub-task / behavioral claim for this cycle
- Any relevant context from previous cycles
- Any project-specific overrides found in `CLAUDE.md`
- **For bug reports or behavior change requests:** use Mode E. Tell the test-writer the user's claim, not the desired fix. The first cycle proves the problem exists; only then does the implementer fix it.

### hson context for agents

Before launching agents that need codebase orientation (Refactorer, Simplicity Agent, and optionally Implementer), use the pre-approved wrapper script:

```bash
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh src 50000 "<changed_module>")
```

The script writes hson output to a `/tmp` file, prints a 3-line sanity preview to stderr, and returns the path on stdout. It is pre-approved globally — no per-session approval needed.

Pass `$HSON_TMP` in the agent prompt. The agent reads it for context and **must warn you** if it was absent or unhelpful — that warning is the validation signal. Never embed the full hson output in your own context.
