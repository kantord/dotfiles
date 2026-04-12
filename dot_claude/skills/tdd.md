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

### Agent 1: Test Writer

**Goal:** Depends on the nature of the task — determine your mode first.

**Mode A — New behavior (feature/fix):**
- Target ONE behavioral claim. Write the minimum test(s) that express it.
- Before writing anything new: check if an existing test can be refactored into a parametric/rstest form to accommodate the new case as an additional example. Prefer that over a new standalone test.
- Avoid reading implementation files unless absolutely necessary to understand existing interfaces
- Write tests that will fail for the RIGHT reason (not compilation errors from missing types)
- Be specific enough that a lazy implementer cannot fake a solution

**Mode B — Pure refactor (no public API change):**
- Do NOT write new behavioral tests
- Audit test coverage of the code areas the refactor will touch
- Report gaps — areas where a regression would NOT be caught by existing tests
- Write gap-filling tests if gaps exist, targeting existing behavior (not the refactor itself)
- If coverage is already sufficient, explicitly state that and stand down

**Mode C — Refactor that moves/renames public symbols:**
- Write tests targeting the new public interface shape
- Also perform the Mode B coverage audit for affected code paths

**All modes — scope check (mandatory):**

Before finishing, count how many tests you are writing from scratch AND how many existing tests you would need to retire or significantly change. If either number is greater than 3, STOP and report to the coordinator:

> "Scope signal: I need to write N new tests and retire/change M existing ones. A simpler preceding change — [brief description] — would reduce this. Coordinator: proceed as-is, or apply divide-and-conquer?"

Do NOT proceed past this point without coordinator confirmation.

**All modes:**
- Check `CLAUDE.md` for project-specific test patterns, fixtures, and conventions
- Clearly state which mode you are operating in and why
- You MAY see and modify existing uncommitted test changes from earlier flows in the same baby step
- Write reasoning and decisions to `/tmp/tdd-test-context.md`

**Output:** Modified test files (if any) + `/tmp/tdd-test-context.md`

---

### Agent 2: Implementer

**Goal:** Make the failing tests pass with the simplest possible implementation.

**Rules:**
- Check `CLAUDE.md` for build commands and project conventions before starting
- Start by running the tests and reading the FAILURES, not the test source
- Only read test source when the failure message is genuinely ambiguous
- Be intentionally lazy — implement exactly what the tests require, nothing more
- Do not add features, abstractions, or future-proofing beyond what tests demand
- If you can "fake" a solution that passes all tests, do it — the test agent should have prevented this
- Run linter/clippy/type checker after tests pass
- Write reasoning and decisions to `/tmp/tdd-impl-context.md`

**Hard constraint — test integrity:**
You MUST NOT delete, modify, or retire any test. If making the tests pass seems to require removing or changing an existing test, STOP immediately and report to the coordinator:

> "Blocked: making the new tests pass appears to require modifying/deleting [specific test(s)]. I have not made those changes. Coordinator: please decide how to handle."

Do not work around this by commenting tests out, adding `#[ignore]`, or any other suppression. Stop and flag.

**Output:** Modified implementation files + `/tmp/tdd-impl-context.md`

---

### Agent 3: Reviewer

**Goal:** Catch correctness issues that the existing tests do NOT already cover.

**Scope:**
- Read the full diff (`git diff main` or relevant commits)
- Read both `/tmp/tdd-test-context.md` and `/tmp/tdd-impl-context.md`
- Ask: is there a correctness problem here that would NOT be caught by the current test suite?
- If the tests appear to adequately cover the behavior, say so quickly and stand down — do not re-verify what the tests already prove
- If you suspect tests are poorly written or have coverage gaps, flag those specifically

**Distinguish between:**
- **Refactor issues (R)**: structure, naming, readability — addressable without new tests
- **TDD cycle issues (T)**: missing/wrong behavior, inadequate coverage — require new failing tests
- **Out of scope (O)**: valid concerns but not part of this task

- Write full review to `/tmp/tdd-review.md`

**Output:** `/tmp/tdd-review.md`

---

### Agent 4: Refactorer

**Goal:** Improve structure, readability, and simplicity of the implementation. NOT to add new behavior.

**Orientation:** The coordinator writes an hson snapshot to a tmp file and passes the path. Read it for codebase context. If the file is missing, empty, or the content looks wrong, warn the coordinator explicitly — that is the validation signal.

**Rules:**
1. Read the hson tmp file passed by the coordinator (see `headson` skill for context on what it contains)
2. Read the git diff to understand what changed
3. Read `/tmp/tdd-review.md`
4. **Critically evaluate the review** — not all feedback is correct or in scope
5. Read `/tmp/tdd-test-context.md` and `/tmp/tdd-impl-context.md`
6. Refactor ONLY for structure/readability/simplicity — no new behavior
7. Run tests + linter to confirm nothing broke
8. Report back to the coordinator:
   - Which review points were addressed
   - Which require a new TDD cycle (need new failing tests)
   - Which are out of scope
   - Whether to trigger the Simplicity Agent (see below)

**Trigger the Simplicity Agent if:**
- Test count in the file has grown noticeably across recent flows
- You notice redundant tests or parametric consolidation opportunities
- The reviewer flagged over-engineering

**Output:** Refactored code + report to coordinator

---

### Agent 5: Simplicity Agent (triggered, not always-running)

**Goal:** Reduce accidental complexity without hurting correctness or confidence.

**Trigger conditions:** Invoked by coordinator after refactorer flags it, when test count has grown, or at the end of a baby step.

**Scope:**
- Look for redundant tests that test the same behavioral claim from slightly different angles — propose consolidating or removing them
- Look for opportunities to convert standalone tests into parametric/rstest form (fewer lines, same coverage)
- Look for over-engineered implementation code — abstractions for one-use-site, premature generalization
- Look for unnecessary complexity in test setup or fixtures
- Do NOT remove tests that cover distinct behavioral claims, even if similar-looking
- Run tests after any changes to confirm nothing broke

**Output:** Simplified test and/or implementation files + report to coordinator

---

## Coordinator Responsibilities

### Between each agent

After reading each agent's output, do a quick soft-signal scan before proceeding:
- Any mention of test deletions, modifications, or retirements? → stop, decide
- Any scope flags from the test writer? → stop, decide (see Divide and Conquer)
- Any "blocked" reports from the implementer? → stop, decide
- Test count growing unexpectedly? → consider triggering Simplicity Agent

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

### hson context for agents

Before launching agents that need codebase orientation (Refactorer, Simplicity Agent, and optionally Implementer), use the pre-approved wrapper script:

```bash
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh src 50000 "<changed_module>")
```

The script writes hson output to a `/tmp` file, prints a 3-line sanity preview to stderr, and returns the path on stdout. It is pre-approved globally — no per-session approval needed.

Pass `$HSON_TMP` in the agent prompt. The agent reads it for context and **must warn you** if it was absent or unhelpful — that warning is the validation signal. Never embed the full hson output in your own context.
