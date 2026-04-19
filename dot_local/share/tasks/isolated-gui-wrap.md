# isolated-gui-wrap

Run a GUI app inside a Docker container, with its window appearing natively on
the host desktop, while isolating filesystem, network, and clipboard access.

## Architecture

```
Host (i3 / X11)
│
├── nested-sway  ← X11 window on i3 desktop (WLR_BACKENDS=x11)
│   │             hosts Wayland socket: $XDG_RUNTIME_DIR/wayland-nest
│   │
│   └── [Wayland clients from container rendered here]
│
└── docker container
    ├── WAYLAND_DISPLAY=wayland-nest  (socket bind-mounted read-write)
    ├── /workspace                    (host path, read-only or none)
    ├── network: none  (or allowlist)
    └── app
        ├── (if Wayland-native) → connects directly to wayland-nest
        └── (if X11) → cage → XWayland → app
                        cage connects to wayland-nest as a Wayland client
                        XWayland serves X11 apps inside the container
```

## Security properties

| Boundary        | Isolated? | Notes                                              |
|-----------------|-----------|----------------------------------------------------|
| Filesystem      | yes       | no host mounts by default; opt-in `--ro`/`--rw`   |
| Network         | yes       | `--network none` by default                        |
| Clipboard       | yes       | Wayland compositor mediates; no bridge to host X11 |
| Process tree    | yes       | Docker PID namespace                               |
| Display (read)  | yes       | app only sees its own Wayland surface              |
| Keylogging      | yes       | Wayland per-client input isolation                 |

Clipboard is isolated because the app connects to nested-sway's Wayland socket,
not to the host X11 server. nested-sway does not bridge its clipboard to host
X11 by default. The user can paste into the app by focusing the nested-sway
window and using the terminal/compositor clipboard within it.

## wrap pseudocode

```
wrap [OPTIONS] <image> <cmd> [args...]

Options:
  --ro <path>    mount host path into /workspace read-only
  --rw <path>    mount host path into /workspace read-write
  --net          enable network access (default: none)
  --x11          app is X11-only; wrap in cage inside container

Steps:
  1. ensure nested-sway is running
       if not: WLR_BACKENDS=x11 WLR_NO_HARDWARE_CURSORS=1
               sway --unsupported-gpu -c ~/.config/sway/nested.conf &
               wait for socket to appear

  2. WAYLAND_SOCKET=$XDG_RUNTIME_DIR/$(swaymsg -s $SWAYSOCK ... get socket)

  3. docker run --rm
       -e WAYLAND_DISPLAY=wayland-0
       -v $WAYLAND_SOCKET:/run/user/1000/wayland-0
       [-v <path>:/workspace[:ro]]
       [--network none | --network <allowlist>]
       <image>
       [cage --] <cmd> [args...]
         ^
         only needed for X11 apps; cage connects to wayland-0
         and provides XWayland for the app inside

  4. container stdout/stderr stream to the calling terminal (default docker
     behaviour — no special handling needed)

  5. on container exit: optionally stop nested-sway if no other clients
```

## Example invocations

```bash
# Wayland-native app, no filesystem, no network
wrap myimage firefox

# Electron dev server, source tree read-only, stdout in terminal
wrap --ro ~/projects/myapp nodeimage bash -c "cd /workspace && npm run dev"

# X11-only legacy app
wrap --x11 legacyimage xterm

# Agent with read-only workspace
wrap --ro ~/projects/myapp agentimage claude --dangerously-skip-permissions
```

## Open questions

- nested-sway lifecycle: shared across wraps vs. per-wrap instance
- clipboard bridge (opt-in): xclip/wl-copy proxy between host and container
- GPU passthrough for apps that need hardware acceleration
- audio (pipewire socket forwarding, similar pattern to Wayland socket)
