# SHOTLIST — Temperature as a Concentration Control

One row per beat: what is on screen, which component draws it, where its numbers come
from, and what the viewer is meant to take away. Durations are the **measured** Kokoro
narration (`mp3/timings.json`), not estimates.

Every beat is a Remotion composition in the `INFO7375-Temperature` folder of
`brutalist.art/runtime/remotion/src/Root.tsx`. Zero Manim beats — LaTeX/dvisvgm is not
installed, and the course prerequisite advises avoiding equation beats on a first
video, so all mathematics is typeset in Remotion.

| Beat | Len | Component | On screen | Numbers from | Takeaway |
|---|---:|---|---|---|---|
| B00 | 11.97s | `TempHook` | Title + question; a distribution re-concentrating as T steps 2.0 → 1.0 → 0.5 | `numbers.json` (bar heights only; **no percentages** — see note) | Something changes, and only T moved |
| B01 | 22.14s | `TempScores` | Three score tiles; the two conditions; "these sum to 6" struck through | course input `[1,2,3]` | Scores rank outcomes; they are not chances |
| B02 | 21.40s | `TempDivide` | `[1,2,3] − max → [-2,-1,0]`, then a number line whose gaps stretch and compress as T steps | `divided_scores`, gaps `1 / 2 / 0.5` | **Temperature rescales gaps, not values** |
| B03 | 24.06s | `TempSoftmax` | Pipeline: divided → `exp` → weights → `÷ 1.503215` → probabilities | `weights`, `weight_total`, `percent` at T=1 | How scores become probabilities |
| B04 | 25.90s | `TempTriptych` | **Centrepiece.** Pinned input strip; three panels T=0.5/1.0/2.0 side by side, bars growing | `percent` for all three T | Same input, one variable, visible concentration |
| B05 | 25.60s | `TempRatio` | The ratio law in a glass panel; 7.389 / 2.718 / 1.649; "creativity" struck and replaced | `ratio_top_two` | **Why** it happens — the exponent is rescaled |
| B06 | 21.27s | `TempBoundary` | Stipulated answer key with A correct; mass piles on C; `TEMPERATURE → SHAPE`, `TEMPERATURE ↛ TRUTH` | `percent` at T=0.5 | What this does **not** establish |
| B07 | 10.84s | `TempClose` | Takeaway sentence; credit card with author, course, disclosures | — | One faithful sentence |

**Total measured narration: 163.18s (2:43).** Assembled runtime is slightly longer
because `compile.py` pads each beat's tail to a whole frame.

## Note on B00

The hook is the only beat where bar heights move continuously between verified
distributions. Interpolated bar heights are fine; an interpolated *number* would not
be, so no percentage is displayed in B00. The only figure shown is T itself, which is
always parked on a course-chosen value. Percentages first appear in B03 and B04, where
they sit on recorded values.

## Provenance chips (on-screen labelling)

| Beat | Chip |
|---|---|
| B01 | `COURSE INPUT · ch.1 §Part 2` |
| B02 | `COURSE CODE · main.py` |
| B03 | `COURSE OUTPUT · ch.1 §154` |
| B04 | `COURSE OUTPUT · worked-examples.json` |
| B05 | `COURSE SOURCE · ch.1 §194` |
| B06 | `CONSTRUCTED HYPOTHETICAL · ch.1 §214` + `NOT A CLAUDE RUN` |

## Motion budget

`kinetic` ×5, `drawon` ×1, `hold` ×1, plus the hook. No language exceeds the 40% cap
in the toolkit's MOTION.md. Every reveal is a fraction of the beat's measured audio
window (`useAt()` in `apertureKit.tsx`), so no beat freezes into a static slide while
narration continues.
