#!/usr/bin/env python3
"""
check_contrast.py — asserts the Aperture palette's WCAG contrast ratios.

The comment block in src/tokens/aperture.ts states a contrast ratio for every ink
colour. A comment is a claim, not a check. This script recomputes each ratio with the
WCAG 2.1 relative-luminance formula and fails if any text pair drops below AA (4.5:1),
so the claim cannot rot as the palette is tuned.

    python3 scripts/check_contrast.py
"""
import re
import sys
from pathlib import Path

TOKENS = Path(__file__).resolve().parent.parent / "src" / "tokens" / "aperture.ts"
AA = 4.5


def srgb_to_lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)


def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def main():
    src = TOKENS.read_text()
    tok = dict(re.findall(r"(\w+):\s*'(#[0-9A-Fa-f]{6})'", src))
    ground = tok["GROUND"]

    # Text colours must clear AA. Bars are large graphical objects, reported only.
    text_keys = ["INK", "INK_DIM", "INK_FAINT", "ACCENT", "BLUE"]
    bar_keys = ["OUT_A", "OUT_B", "OUT_C"]

    print(f"ground {ground}\n")
    failed = []
    for k in text_keys:
        r = ratio(tok[k], ground)
        grade = "AAA" if r >= 7 else "AA" if r >= AA else "FAIL"
        print(f"  {k:<10} {tok[k]}  {r:6.2f} : 1   {grade}")
        if r < AA:
            failed.append((k, r))
    print()
    for k in bar_keys:
        print(f"  {k:<10} {tok[k]}  {ratio(tok[k], ground):6.2f} : 1   (bar fill, non-text)")

    if failed:
        print("\nFAILED — text colours below WCAG AA:", file=sys.stderr)
        for k, r in failed:
            print(f"  {k} at {r:.2f}:1 (needs {AA}:1)", file=sys.stderr)
        return 1
    print("\nAll text colours meet WCAG AA or better against the ground.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
