# CHECKS-REPORT

What was actually run against the finished video, and what it returned. Commands are
reproducible; nothing here is a summary of an expectation.

---

## 1. Numerical verification

```
$ python3 scripts/verify_temperature.py
```

| Check | Result |
|---|---|
| 1 — every distribution sums to 1 (tol 1e-12) | **PASS** (T=1.0 sums to 0.9999999999999999; within tolerance, reported honestly) |
| 2 — `p_i/p_k == exp((z_i − z_k)/T)` (tol 1e-12) | **PASS** — 7.389056 / 2.718282 / 1.648721 |
| 3 — max-subtracted form == direct form | **PASS** — max delta 1.11e-16 |
| 4 — table == `research/worked-examples.json` → `chapters.01` | **PASS — exact, all three temperatures, probabilities and seeded counts** |
| 5 — live subprocess run of course `main.py` | **PASS** — exact match on the T=1.0 row |

Full log: `evidence/verify-output.txt`. Exit code 0.

Course reference tests, run separately as evidence:

```
$ python3 -m unittest discover -s lessons/01-randomness-and-first-prompts/code/tests -v
Ran 6 tests in 0.000s — OK
```

Log: `evidence/course-tests-output.txt`.

## 2. Contrast

```
$ python3 scripts/check_contrast.py
  INK        #F5F7FA   18.35 : 1   AAA
  INK_DIM    #B4BCC7   10.27 : 1   AAA
  INK_FAINT  #98A1AE    7.54 : 1   AAA
  ACCENT     #F2A03D    9.25 : 1   AAA
  BLUE       #5B8CF5    6.11 : 1   AA
All text colours meet WCAG AA or better against the ground.
```

Every text colour clears AA; four of five clear AAA.

## 3. Static checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` over the Remotion project | **0 errors** |
| `json.load(beat_sheet.json)` | **valid** |
| beat ids match `^B[0-9A-Z]+$` | **8/8 pass** |
| every beat has `shot.remotion.pattern` | **8/8** |
| every beat has a `shot.show` block | **8/8** |
| slug matches `build_safety.py` regex `[A-Za-z0-9][A-Za-z0-9._-]*` | **pass** (`temperature-concentration-control`) |
| `./art scenes --check` on all 8 components | **8/8 RENDERABLE** |

## 4. Pipeline gates (`./art run`)

| Gate | Result |
|---|---|
| GATE F — FACTCHECK / SHOTLIST / PROMPTS present | **pass** |
| GATE L — beat-mix lint | **pass** |
| GATE A / B — Manim static + layout audit | **n/a**, zero Manim beats |
| Slot fill | **8/8 VIDEO**, zero slates |
| Motion histogram | kinetic 3, drawon 2, isotype 1, annotate 1, hold 1 — no language over the 40% cap |
| **GATE V — frame-level visual QC** | **PASS — 16 frames, 0 BLOCKER, 0 MAJOR** |

### Gate V history — this failed first, and why

The first compile returned **16 BLOCKER, 14 MAJOR** — an `edge-bleed` blocker and a
`low-contrast` major on every single sampled frame.

A uniform failure across every frame is a signal about the measurement, not eight
independent bugs, so I read the checker before changing any scene.
`final_frame_check.py::_background` takes the modal colour of the **four corner
patches** and treats anything more than 28/channel from it as content ink. The
background was a four-stop aurora gradient whose corners measured TL (25,34,53) against
BR (10,11,16) — a 37-per-channel spread. The gradient was therefore being counted as
content: it reached the frame edge (edge-bleed) and its large mid-dark area dragged the
ink/background luminance separation under the 0.30 floor.

There is a sanctioned escape hatch — declaring `qc.full_bleed: true` per beat. I did not
use it. Silencing edge-bleed would also blind the gate to genuine text clipping, which
is the defect it exists to catch. Instead:

| Fix | Effect |
|---|---|
| Flattened the ground to a near-uniform plate (residual radial within ~4/channel) | edge-bleed 16 → 0 |
| Lifted `INK_DIM` and `INK_FAINT` (#A8B0BC→#B4BCC7, #7A8390→#98A1AE) | better small-label readability; contrast metric up |
| Removed decorative bar glows | large mid-dark areas no longer averaged in as ink |
| Lowered glass alpha 0.055/0.085 → 0.040/0.060 | panels now sit below the ink threshold — they are chrome, which is what `aperture.ts` always claimed they were |
| `TempClose` centred → `space-between` | underfill 51% → 99% |

Final per-frame separations after the fixes (floor 0.30): B00 0.643 · B01 0.613 ·
B02 0.529 · B03 0.703 · B04 0.616 · B05 0.678 · B06 0.614 · B07 0.799.

## 5. Output probe

```
$ ffprobe video/temperature-concentration-control.mp4
```

| Property | Value |
|---|---|
| Duration | **159.17 s (2:39)** — inside the assignment's 2–4 min window |
| Resolution | **1920 × 1080** |
| Video | h264, 24 fps |
| Audio | aac, 48 kHz, stereo |
| Audio level | mean **−24.2 dB**, max **−3.5 dB** — no clipping, far above the −40 dB floor |
| Silent gaps > 1.5 s | **0** |
| File size | 8.2 MB |

## 6. Visual inspection — frames actually read

Frames were extracted with `ffmpeg -ss <t> -frames:v 1` at the first frame, the last
frame, and roughly 60% and 90% through each beat, then **looked at**. A clean probe
cannot tell you a number is stale or a typeface silently fell back.

| Item | Result |
|---|---|
| Geist actually rendering | **confirmed** — and `geistFont.ts` throws rather than falling back, so a silent substitution cannot occur |
| Every on-screen number vs `numbers.json` | **match** — weights 0.135335/0.367879/1.000000, total 1.503215, 9.00/24.47/66.52%, 1.6/11.7/86.7%, 18.6/30.7/50.6%, ratios 7.389/2.718/1.649, gaps 1/2/0.5 |
| Text clipping / overlap | none |
| Provenance chips legible | **yes** — including both chips on B06 |
| Blank frames | none |
| First / last frame | correct |
| Aspect ratio, file naming | correct |

### Two defects found by looking, and fixed

1. **B00 displayed "T = 0.9".** The hook tweens bar heights between verified
   distributions, and the temperature readout was being interpolated along with them.
   0.9 is not a course temperature, and the bars at that instant were a linear blend
   rather than the true softmax at 0.9 — so the label was a number the project could
   not support. Fixed by snapping the readout to the stop the bars are moving toward,
   in both `TempHook` and `TempDivide`. No displayed figure is now un-verified at any
   frame of the video.

2. **B07 course line wrapped**, orphaning "01" onto its own line on the final card.
   Fixed with `nowrap` and a narrower notes column.

A third defect — scene animations completing ~5 s into 20–26 s beats — was found
earlier and is documented in `REVIEW.md` R3.

## 7. Semantic review (as a TA would ask)

| Question | Answer |
|---|---|
| Can a student explain temperature after watching once? | Yes — the mechanism is shown three times at increasing depth: gaps rescaled (B02), gaps become probabilities (B03), and why (B05). |
| Does the video *show* what temperature changes? | Yes. B02's gap bracket shrinks from 2 to 1 to 0.5 on screen; B04 holds the input fixed and varies only T. |
| Are the numbers reproducible? | Yes — one command, asserted against the course's own recorded file. |
| Are constructed examples labelled? | Yes — the single constructed element (B06's answer key) carries two chips and uses the chapter's own wording. |
| Does it state what temperature does *not* establish? | Yes, in narration and on screen, in the beat given the most emphatic visual treatment. |
| One concept or a chapter summary? | One. Sampling counts, calibration, and tokenisation are all deliberately excluded — noted in `FACTCHECK.md`. |
| Can every sentence be sourced on request? | Yes — `FACTCHECK.md` maps all 22 claims to file and line. |

## Status

**Numerical verification: PASS · Audio: PASS · Visual: PASS · Gate V: PASS (0/0)**
