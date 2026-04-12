# Global Claude Code Instructions

## Committing Changes

Never run `git commit` yourself — not even when the user says "yes", "go ahead", or "commit for me". The user always runs the commit command themselves.

When work is ready to commit: suggest a message (using the `commit-msg` skill), stage the relevant files, and print the exact `git commit -m "..."` command for the user to run. Stop there.

## Default Coding Workflow: TDD

For any coding task (feature, bug fix, refactor, data model change), use the TDD workflow by default. Skip it only for tasks with no testable behavior: documentation edits, config-only changes, or trivial one-line fixes.

Five pre-configured subagents handle the cycle. They live in `~/.claude/agents/tdd-*.md` and are loaded automatically. Invoke them via the `Agent` tool — mention the agent name in the prompt and Claude Code routes to the right one:

```
Agent: "Use the tdd-test-writer agent to write failing tests for [behavioral claim]. 
       Project: /path/to/repo. Context: [what the test should express]."
```

**The four mandatory stages — never skip any:**

1. **tdd-test-writer** — writes failing test(s) for one behavioral claim; performs mandatory scope check
2. **tdd-implementer** — makes tests pass with minimal implementation; stops and flags if any existing test would need modification
3. **tdd-reviewer** — checks for correctness gaps the tests don't already cover; stands down quickly if tests are adequate
4. **tdd-refactorer** — applies R-category review findings; reports whether tdd-simplicity should run

**What to pass each agent:** task-specific context only (file paths, behavioral claim, hson snapshot path, outputs from previous agents). The agents already know their roles and rules — do not re-explain them.

**hson snapshots** (pre-approved, no confirmation needed):
```bash
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh <src_dir> 50000 "<weak_grep>")
# Hard-guarantee a symbol is present:
HSON_TMP=$(~/.claude/scripts/hson-snapshot.sh <src_dir> 50000 "" "<grep_pattern>")
```

See the `tdd` skill for full workflow details including divide-and-conquer, scope checks, and the simplicity agent.

## Issue-Linked Branches

When starting work in a git repository, check the current branch name. If the branch name contains an issue number (e.g. `issue-4612`, `fix/issue-123`, `feature-456`, `bugfix-789`), use the `gh` CLI to fetch the issue and understand its context before proceeding.

**How to detect an issue number:** Look for patterns like `issue-<N>`, `issues/<N>`, `fix/<N>`, `feat/<N>`, or any branch segment that is purely numeric (e.g. `my-feature-1234`). Extract the number and look it up.

**How to fetch the issue:**
```bash
gh issue view <NUMBER>
```

If the repo is a fork or non-default remote, you may need to specify `--repo owner/repo`. Try without `--repo` first since `gh` can usually infer it from the git remote.

Use the issue title, description, and any linked comments to understand:
- What problem is being solved
- Any acceptance criteria or constraints mentioned
- Related issues or PRs referenced in the thread

Apply this context when answering questions, writing code, or suggesting changes — so your work is aligned with the stated goal of the issue.
