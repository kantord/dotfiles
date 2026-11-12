---
name: btrfs-space-guard
description: Check and fix btrfs "Device unallocated" drift before it causes ENOSPC with free space showing in df. Use when a write fails with "No space left on device" while df shows free space, when a build/data disk is btrfs, when the user asks about disk space or balance on btrfs, or when a session start or heavy job should warn about low unallocated space.
---

# btrfs space guard

## Why

On btrfs, `df` free space can be large while a write fails with ENOSPC. Data and metadata live in chunks. When "Device unallocated" reaches about 0, metadata cannot get a new chunk, and writes fail. Churn (many creates and deletes, build outputs) leaves half-empty chunks that only a balance returns to unallocated.

## Check (read-only, every btrfs mount)

1. List mounts: `findmnt -t btrfs -no TARGET,UUID`
2. For each mount: `btrfs filesystem usage -b <mount> | grep -E 'Device (size|unallocated)|Free \(estimated\)'`
   If it needs root, tell the user the exact `sudo` command.
3. Warn when Device unallocated is below 10 GiB. Below 2 GiB, treat as urgent.

Real sizes with reflinks (`du` overcounts them): `btrfs filesystem du -s <path>` (Exclusive column), or `sudo compsize -x <path>`.

## Fix: balance by hand

The user decides when. A balance rewrites data and can stall I/O, so never start it while they play a game or run a heavy job. Ask first.

1. Free some space first if unallocated is under 2 GiB. Balance needs room to relocate, and fails with ENOSPC at 1 MiB unallocated.
2. Run in the background, one at a time, with a small limit:
   `sudo btrfs balance start -dusage=50,limit=10 <mount>`
   Past runs took 8 seconds to 25 minutes.
3. Re-check unallocated. If still low, repeat with `-dusage=70,limit=10`, a raised usage threshold, or a higher limit.
4. If ENOSPC at start: `-dusage=0` first (frees empty chunks only), then `-dusage=5`, then `-dusage=20`, then step up.

## Never

- `btrfs filesystem defrag` on trees with reflinked copies: it breaks the sharing and multiplies disk use.
- Metadata balance (`-musage`) as a first move.
- `pkill`. Stop a balance with `sudo btrfs balance cancel <mount>`.
- Automatic background reclaim or timers by default. The kernel reclaim knobs (`dynamic_reclaim`, `periodic_reclaim`) and `btrfsmaintenance` timers can stall I/O at times the user does not choose, and the scheduler may ignore the idle I/O class. Offer them only if the user asks, with `OnBootSec=20min` instead of a clock time, and a one-week stutter trial.
- `scrub` on a schedule unless the user asks.

## Prevent

- Cut churn at the source: strip debug info from build outputs, limit retained build variants, remove finished worktrees.
- Put the check above into the session-start hook or the heavy-job wrapper of the project, printing a warning at under 10 GiB unallocated.
