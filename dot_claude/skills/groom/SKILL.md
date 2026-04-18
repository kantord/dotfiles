---
name: groom
description: Multi-step codebase grooming workflow. Audits code for publish-readiness, builds a prioritized todo list, then walks through each finding one at a time showing before/after and suggesting a commit message after each fix. Use when preparing a codebase for publication or a quality pass.
---

# Codebase Grooming Workflow

A structured, iterative quality pass. The goal is to move a codebase toward publish-readiness one finding at a time, with full visibility into each change before it happens.

## Phase 1 — Audit

Invoke the `code-review` skill on the target scope (whole repo, a module, or a set of files). Collect all findings.

## Phase 2 — Build the todo list

For each finding, create a task via `TaskCreate` with:
- Subject format: `[BLOCKING|IMPORTANT|MINOR] file:line — short description`
- Description: what's wrong and the one-sentence fix

Group and order tasks: BLOCKING first, then IMPORTANT, then MINOR. Within each group, tackle foundational changes before downstream ones (e.g. error types before callers, trait changes before impls).

Before creating tasks, check whether any findings are actually false alarms — verify in the code that the issue is real.

## Phase 3 — Work through tasks one by one

For each task, in order:

### 3a. Show the current code
Read and display the relevant lines. Cite file:line.

### 3b. Show the proposed change
Present a clear before/after. Be specific — show actual code, not descriptions.

### 3c. Discuss if needed
If the change has non-obvious tradeoffs, design implications, or requires a decision (e.g. which error type, whether a dependency upgrade is warranted), raise it before touching anything. Ask the user to decide. If research is needed (e.g. checking a library's API), spawn a subagent.

### 3d. Implement
Only after the user agrees. Use TDD for behavioral changes. For pure refactors (moves, renames, constant extraction) that have no behavioral effect, skip TDD and make the change directly.

### 3e. Suggest a commit message
After each completed task, invoke the `commit-msg` skill and present the suggested message with the exact `git add` + `git commit` command for the user to run.

Mark the task completed.

## Phase 4 — History cleanup (optional)

If the commit history is messy (e.g. all "." messages), offer to squash into logical groups:
1. Spawn an Explore agent to analyze commits by file changes and propose groupings
2. Generate a rebase todo file using `pick` + `exec git commit --amend -m "..."` + `fixup` — fully non-interactive
3. Run: `GIT_SEQUENCE_EDITOR="cp /tmp/rebase-todo" git rebase -i --root`
4. Verify with `git log --oneline`, then suggest `git push --force-with-lease`

## Key rules

- **Never implement without showing before/after first.** The user decides what gets changed.
- **One task at a time.** Don't batch unrelated changes into one commit.
- **Suggest commit message after every task** — don't wait to be asked.
- **False alarms get deleted**, not fixed. If the code turns out to be correct, close the task and explain why.
- **Research before deciding.** For library API questions, dependency upgrades, or design tradeoffs, spawn a subagent to get facts before recommending a direction.
- **Larger structural changes need a prototype first.** If a task involves redesigning a trait, changing a public API, or touching many files, spawn a throw-away prototype agent in a worktree to surface complications before committing to TDD cycles.
