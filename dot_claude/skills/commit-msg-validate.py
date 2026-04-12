#!/usr/bin/env python3
"""Validate a git commit message subject line against length budget."""

import sys


def validate(message: str) -> tuple[str, str]:
    """Returns (status, explanation). Status: PASS, SOFT_FAIL, HARD_FAIL."""
    subject = message.strip().splitlines()[0] if message.strip() else ""
    n = len(subject)
    if n <= 71:
        return "PASS", f"{n} chars — within budget"
    elif n <= 89:
        return "SOFT_FAIL", f"{n} chars — acceptable only if shortening loses essential clarity"
    else:
        return "HARD_FAIL", f"{n} chars — exceeds hard limit of 89, must shorten"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: commit-msg-validate.py <message>", file=sys.stderr)
        sys.exit(1)

    msg = sys.argv[1]
    status, explanation = validate(msg)
    print(f"{status}: {explanation}")
    if status == "HARD_FAIL":
        sys.exit(2)
    elif status == "SOFT_FAIL":
        sys.exit(1)
