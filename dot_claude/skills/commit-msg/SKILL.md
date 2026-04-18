---
name: commit-msg
description: Suggest and validate a commit message. Use whenever work looks ready to commit — proactively, without waiting to be asked. Runs a sub-agent to improve the message and validates length against a hard budget.
---

# Commit Message Skill

Use this skill whenever work looks ready to commit. The goal is a message that is clear to a future reader with no conversational context, matching the repo's commit style.

## Step 1: Gather context

Run these in parallel:
```bash
# Recent commit style
git log --oneline -100

# Diff to commit
git diff --cached   # if staged
# or
git diff main       # if comparing to main

# Codebase structure (brief)
hson --recursive src -C 20000 --tree 2>/dev/null || hson --recursive . -C 20000 --tree --glob "**/*.rs" --glob "**/*.ts" --glob "**/*.py" 2>/dev/null
```

## Step 2: Draft a commit message

Based on the diff and your understanding of the change, draft a commit message following the repo's style (semantic commits, scope, etc. — inferred from `git log`).

## Step 3: Launch the commit-msg-reviewer sub-agent

Pass the sub-agent:
- Your draft commit message
- The last 100 commits (oneline)
- The hson codebase overview
- The full diff

The sub-agent's job: simulate a future reader with no conversational context. Improve the message to be maximally clear on its own. Return a single improved commit message string.

**Sub-agent prompt template:**
```
You are reviewing a proposed commit message for a git repository.
Your job is to improve it so it reads clearly to a future person
with no knowledge of the current conversation or task context.

## Recent commit history (style reference)
<paste git log --oneline -100>

## Codebase overview
<paste hson output>

## Diff
<paste diff>

## Proposed commit message
<paste draft>

Return ONLY the improved commit message string, nothing else.
Do not add explanation. Match the style of recent commits.
```

## Step 4: Validate length

Run the validation script:
```bash
python3 ~/.claude/skills/commit-msg-validate.py "<message>"
```

**Validation rules:**
- ≤ 71 chars → PASS
- 72–89 chars → SOFT FAIL — acceptable only if a shorter message would lose essential clarity, or semantic commit scoping genuinely requires it. Explain why if you accept it.
- ≥ 90 chars → HARD FAIL — not allowed, must shorten

## Step 5: Present to user

Show:
- The final commit message
- Its character count and validation result
- If SOFT FAIL: your justification for accepting it

Ask the user to confirm before committing.
