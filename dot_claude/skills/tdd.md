---
name: tdd
description: Run a strict TDD cycle using 4 specialized subagents (test writer, implementer, reviewer, refactorer). Use as the default workflow for any coding implementation task — features, bug fixes, refactors, or data model changes. Check for project-specific overrides in CLAUDE.md before starting.
---

# TDD Workflow

This skill implements a strict Red-Green-Refactor TDD cycle using 4 subagents. The main Claude instance acts as coordinator — launching agents, reading their outputs, and deciding next steps.

**This is the default workflow for coding tasks.** Before starting, check the project's `CLAUDE.md` for any project-specific overrides to this workflow (test patterns, build commands, special constraints).

## Principles

- XP philosophy: implementation agent is intentionally lazy — the test agent must enforce correctness
- Each cycle targets ONE atomic task (or a sub-task of one)
- The coordinator NEVER makes scope decisions autonomously — always ask the user

---

## The 4 Agents

### Agent 1: Test Writer
**Goal:** Depends on the nature of the task — determine your mode first.

**Mode A — New behavior (feature/fix):**
- Write failing tests that express intent. Communicate intent through test failures, not just test code
- Avoid reading implementation files unless absolutely necessary to understand existing interfaces
- Write tests that will fail for the RIGHT reason (not compilation errors from missing types)
- Be specific enough that a lazy implementer cannot fake a solution
- Never write tests that could pass with a trivially wrong implementation

**Mode B — Pure refactor (no public API change):**
- Do NOT write new behavioral tests
- Audit test coverage of the code areas the refactor will touch
- Report gaps — areas where a regression would NOT be caught by existing tests
- Write gap-filling tests if gaps exist, targeting existing behavior (not the refactor itself)
- If coverage is already sufficient, explicitly state that and stand down
- Note: integration tests should rarely need changing; e2e tests should never need changing for a pure refactor

**Mode C — Refactor that moves/renames public symbols (rare):**
- Write tests targeting the new public interface shape — confirm it exists and behaves correctly
- Also perform the Mode B coverage audit for affected code paths

**All modes:**
- Check `CLAUDE.md` for project-specific test patterns, fixtures, and conventions
- Clearly state which mode you are operating in and why
- Write reasoning and decisions to `/tmp/tdd-test-context.md`

**Output:** Modified test files (if any) + `/tmp/tdd-test-context.md`

---

### Agent 2: Implementer
**Goal:** Make the failing tests pass with the simplest possible implementation.

**Rules:**
- Check `CLAUDE.md` for build commands and project conventions before starting
- Start by running the tests and reading the FAILURES, not the test source
- Only read test source code when the failure message is genuinely ambiguous
- Be intentionally lazy — implement exactly what the tests require, nothing more
- Do not add features, abstractions, or future-proofing beyond what tests demand
- If you can "fake" a solution that passes all tests, do it — the test agent should have prevented this
- Run linter/clippy/type checker after tests pass
- Write reasoning and decisions to `/tmp/tdd-impl-context.md`

**Output:** Modified implementation files + `/tmp/tdd-impl-context.md`

---

### Agent 3: Reviewer
**Goal:** Deep review of the diff produced by the test + implementation agents.

**Rules:**
- Read the full diff (`git diff main` or relevant commits)
- Read both `/tmp/tdd-test-context.md` and `/tmp/tdd-impl-context.md`
- Evaluate: correctness, test quality, implementation quality, structure, missed edge cases
- Distinguish between:
  - **Refactor issues**: structure, naming, readability — addressable without new tests
  - **TDD cycle issues**: missing/wrong behavior, inadequate coverage — require new failing tests
  - **Out of scope**: valid concerns but not part of this task
- Be critical but fair — note if the implementation is correctly lazy per XP principles
- Write full review to `/tmp/tdd-review.md`

**Output:** `/tmp/tdd-review.md`

---

### Agent 4: Refactorer
**Goal:** Improve structure, readability, and simplicity. NOT to add new behavior.

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
   - Which review points were addressed by refactoring
   - Which require a new TDD cycle (need new failing tests)
   - Which are out of scope for this task
   - Whether the task is truly complete

**Output:** Refactored code + report to coordinator

---

## Coordinator Responsibilities

After each full cycle:
1. Read the refactorer's report
2. **Always ask the user** before deciding whether to start a new TDD cycle or advance — never make this call unilaterally
3. If a task is too large, split it — restart with a smaller sub-task
4. Never accept false test results — if tests pass for the wrong reason, trigger a new test-writing cycle

**When a task is complete**, always:
1. Show a brief diff summary
2. Ask the user to manually review the changes
3. Ask what they want to do:
   - **Pure refactor** → suggest commit, potentially merge to main
   - **Behavior change** → suggest commit + PR
   - **User-facing feature** → suggest commit + PR + consider release
4. Never auto-commit or auto-merge — the user always decides

**Critical rule:** Any scope decision — is something out of scope? is the task complete? should we extend it? — must be presented to the user as a question, not decided autonomously.

---

## /tmp Files Reference

| File | Written by | Read by |
|------|-----------|---------|
| `/tmp/tdd-test-context.md` | Test agent | Reviewer, Refactorer |
| `/tmp/tdd-impl-context.md` | Implementer | Reviewer, Refactorer |
| `/tmp/tdd-review.md` | Reviewer | Refactorer, Coordinator |

## Starting a Cycle

When invoking this skill, specify:
- What task is being worked on (and its source — issue number, PR, description)
- The exact sub-task for this cycle
- Any relevant context from previous cycles
- Any project-specific overrides found in `CLAUDE.md`

### hson context for agents

Before launching agents that need codebase orientation (Refactorer, and optionally Implementer), write an hson snapshot to a tmp file:

```bash
HSON_TMP=$(mktemp /tmp/hson-ctx-XXXXXX.txt)
hson --recursive src -C 50000 --tree --weak-grep "<changed_module>" > "$HSON_TMP" \
  && head -3 "$HSON_TMP"   # inline sanity check
```

Pass `$HSON_TMP` in the agent prompt. The agent reads it for context and **must warn you** if it was absent or unhelpful — that warning is the validation signal. Never embed the full hson output in your own context.
