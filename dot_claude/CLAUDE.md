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

1. **tdd-test-writer** — writes failing test(s) for one behavioral claim; performs mandatory scope check; runs tests and records red evidence in `/tmp/tdd-test-context.md`
2. **[RED GATE]** — before invoking the implementer, confirm `/tmp/tdd-test-context.md` contains a `## Red evidence` section showing at least one failure. If it is absent or shows all tests passing, do NOT proceed — investigate and resolve with the test writer first.
3. **tdd-implementer** — makes tests pass with minimal implementation; stops and flags if any existing test would need modification
4. **tdd-reviewer** — checks for correctness gaps the tests don't already cover; stands down quickly if tests are adequate
5. **tdd-refactorer** — applies R-category review findings; reports whether tdd-simplicity should run

**What to pass each agent:** task-specific context only (file paths, behavioral claim, hson snapshot path, outputs from previous agents). The agents already know their roles and rules — do not re-explain them.

**hson snapshots** (pre-approved, no confirmation needed):
```bash
~/.claude/scripts/hson-snapshot.sh <src_dir> 50000 "<weak_grep>"
# Hard-guarantee a symbol is present:
~/.claude/scripts/hson-snapshot.sh <src_dir> 50000 "" "<grep_pattern>"
```
The script prints the tmp file path on the last line of stdout — read it from the command output to pass to agents.

See the `tdd` skill for full workflow details including divide-and-conquer, scope checks, and the simplicity agent.

## Codebase Search

When searching an unfamiliar codebase, prefer the `grep-ai` skill over the native Grep tool. The key reason: `grep-tree` shows the **full structural ancestor chain** of every match (the function signature, class, module, and file it lives in) — something native Grep cannot do. Use native Grep only for quick one-off checks where you already know the file.

Typical decision:
- Don't know the file types yet → `grep-extensions` first
- Want to understand where something lives structurally → `grep-tree`
- Need an exact file:line to pass to Read/Edit → `grep-raw`

## Data Privacy — No Cross-Repo Leakage

**Never let data from one context bleed into a repo where it does not belong.** This applies to all agents, including those editing dotfiles, filing GitHub issues, or writing any file that will be committed to a repository.

Concrete rules:
- **Company data stays in company repos.** Code, config, internal hostnames, API endpoints, service names, team names, internal tool names, credentials, and anything else that is only known because of employment — never write any of it into a personal or public repo (including `kantord/dotfiles`).
- **Private repo data stays private.** If information comes from a private repository, treat it as private. Do not reference it, quote it, or embed it in a public repo, issue, or commit message.
- **Issues filed to public repos must be sanitized.** The `report-agent-issue` skill targets `kantord/dotfiles` (public). Strip any company-specific detail before filing — describe the structural problem only.
- **Dotfiles are public.** Chezmoi-managed files end up in a public git repo. Never add config values, paths, hostnames, or comments that reveal anything company-internal.

When in doubt: omit it.

## Editing Chezmoi-Managed Files

Many config files (agent definitions, skills, dotfiles) are managed by chezmoi. **Always edit the source, never the live file.** Source lives at `~/.local/share/chezmoi/` (e.g. `dot_claude/agents/tdd-test-writer.md` → `~/.claude/agents/tdd-test-writer.md`).

After editing the source, apply just that file — no password required:
```bash
chezmoi apply ~/.claude/agents/tdd-test-writer.md
```

Use the `chezmoi` skill for full source-path mapping and workflow details.

## Agent Self-Reporting

All agents (including this coordinator) should report genuine problems noticed with their own instructions — impractical, conflicting, buggy, useless, or missing cases. Do this after completing the primary task by invoking the `report-agent-issue` skill. Tell the user when you file one.

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

## Personal Profile

A compressed personality and expertise profile lives at `/home/kantord/repos/kd-personality-profile/`. It describes who Daniel Kantor is — his role, employer, interests, expertise areas, and work patterns — as structured working memory for AI agents.

**Load the profile when personal context would improve your answer.** Typical triggers:
- "What's relevant to me in this?" / "What should I care about here?"
- "How does this relate to my work?"
- Explaining or summarizing something where knowing his background changes what to emphasize
- Any question where the best answer depends on his role, expertise, or priorities

**How to load it:**
1. Read `profile/identity.md` — who he is, attribution rules, what to extract vs. ignore
2. Read `profile/index.md` — narrative summary, active topic index, miscellaneous context
3. Load relevant topic files from `profile/topics/` if the question touches a specific area

Do not answer relevance or filtering questions from generic first principles. Using the profile is what distinguishes a personalized answer from a generic one.
