# Global Claude Code Instructions

## Committing Changes

Never run `git commit` yourself — not even when the user says "yes", "go ahead", or "commit for me". The user always runs the commit command themselves.

When work is ready to commit: suggest a message (using the `commit-msg` skill), stage the relevant files, and print the exact `git commit -m "..."` command for the user to run. Stop there.

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
