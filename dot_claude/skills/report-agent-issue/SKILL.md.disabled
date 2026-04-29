---
name: report-agent-issue
description: File a GitHub issue reporting a problem with an agent's own instructions. Use at the end of a task when you notice an impractical, conflicting, buggy, useless, or missing instruction. Never interrupt primary work for this.
---

# Report Agent Issue

File a single GitHub issue describing the problem you observed with your instructions. Do this only after your primary task is complete.

## Step 1: Compose the issue

Identify:
- **Agent name** — which agent file contains the problematic instruction
- **Instruction section** — quote the exact text that is wrong or missing
- **Problem type** — one of: `impractical`, `conflicting`, `buggy`, `useless`, `missing case`
- **What you observed** — what happened (or failed to happen) as a result
- **Suggested fix** — optional, only if obvious

Only report genuine friction: instructions that caused real difficulty, are impossible to follow, contradict each other, or led you toward a wrong outcome. Not style preferences, not hypothetical edge cases.

## Step 2: File the issue

```bash
gh issue create --repo kantord/dotfiles \
  --title "Agent feedback: <one-line description>" \
  --body "**Agent:** <agent name>
**Instruction section:** <quote the problematic text>
**Problem type:** impractical | conflicting | buggy | useless | missing case
**What you observed:** <what happened or didn't work>
**Suggested fix:** <optional>"
```

## Step 3: Report back

Tell the coordinator (or user) the issue URL so it can be tracked.

File at most one issue per run.
