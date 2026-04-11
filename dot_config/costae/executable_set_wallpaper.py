#!/usr/bin/env python3
"""
Set a Slack-style OKLab gradient wallpaper on the main display (DP-4).

OKLab interpolation produces perceptually uniform gradients — no muddy
midpoints like you get from plain RGB or even sRGB interpolation.

Usage: python3 set_wallpaper.py
"""

import subprocess
import re
import os
import numpy as np
from PIL import Image


# ── colour helpers ────────────────────────────────────────────────────────────

def oklab_to_linear_srgb(L, a, b):
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_**3, m_**3, s_**3
    r =  4.0767416621*l - 3.3077115913*m + 0.2309699292*s
    g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
    b_ = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    return np.stack([r, g, b_], axis=-1)


def linear_to_srgb(x):
    return np.where(x <= 0.0031308, 12.92 * x, 1.055 * x ** (1.0 / 2.4) - 0.055)


def oklab_gradient(stops: list[tuple[float, np.ndarray]], t: np.ndarray) -> np.ndarray:
    """
    Interpolate through OKLab colour stops.
    stops: [(position 0..1, oklab_array), ...]  — must be sorted by position.
    t: any-shape array of blend values 0..1.
    Returns same-shape array with an extra trailing dim of 3 (L, a, b).
    """
    result = np.zeros(t.shape + (3,))
    for i in range(len(stops) - 1):
        t0, c0 = stops[i]
        t1, c1 = stops[i + 1]
        mask = (t >= t0) & (t <= t1)
        local_t = (t[mask] - t0) / (t1 - t0)
        result[mask] = c0 * (1 - local_t[..., None]) + c1 * local_t[..., None]
    return result


# ── monitor detection ─────────────────────────────────────────────────────────

def get_monitor_geometry(output_name: str) -> tuple[int, int]:
    info = subprocess.check_output(["xrandr"]).decode()
    pattern = rf"{re.escape(output_name)} connected.*?\n\s+(\d+)x(\d+).*?\*"
    m = re.search(pattern, info)
    if not m:
        raise ValueError(f"Monitor {output_name!r} not found or not active")
    return int(m.group(1)), int(m.group(2))


# ── gradient config ───────────────────────────────────────────────────────────

OUTPUT = "DP-4"

# OKLab [L, a, b]  —  L: lightness 0–1 | a: green↔red | b: blue↔yellow
#
# Three stops give the aurora / Slack "peak saturation in the middle" feel.
# Diagonal blend (top-left → bottom-right).
STOPS: list[tuple[float, np.ndarray]] = [
    (0.00, np.array([0.22, 0.10, -0.24])),   # deep violet-indigo
    (0.45, np.array([0.48, 0.20, -0.08])),   # vivid magenta — the pop
    (1.00, np.array([0.35, -0.12, -0.14])),  # rich teal-blue
]


# ── build gradient ────────────────────────────────────────────────────────────

def make_gradient(width: int, height: int) -> Image.Image:
    xs = np.linspace(0, 1, width)
    ys = np.linspace(0, 1, height)
    xv, yv = np.meshgrid(xs, ys)
    t = (xv + yv) / 2.0  # diagonal blend

    lab = oklab_gradient(STOPS, t)
    linear = oklab_to_linear_srgb(lab[..., 0], lab[..., 1], lab[..., 2])
    srgb = linear_to_srgb(np.clip(linear, 0, 1))
    return Image.fromarray((srgb * 255).astype(np.uint8), "RGB")


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    w, h = get_monitor_geometry(OUTPUT)
    print(f"Generating {w}×{h} gradient for {OUTPUT}…")
    img = make_gradient(w, h)

    out_path = os.path.expanduser("~/.config/costae/wallpaper.png")
    img.save(out_path)
    print(f"Saved → {out_path}")

    subprocess.run(["xwallpaper", "--output", OUTPUT, "--zoom", out_path], check=True)
    print("Wallpaper set.")


if __name__ == "__main__":
    main()
