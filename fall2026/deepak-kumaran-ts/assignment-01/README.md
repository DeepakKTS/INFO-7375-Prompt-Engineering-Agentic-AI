# INFO 7375 — Week 01 Video

**Name:** Deepak Kumaran Thoppudu Sudharsanan
**Course:** INFO 7375 · Prompt Engineering for Generative AI · Week 01
**Concept:** Temperature as a concentration control

**Why this concept:** it is small enough to demonstrate completely in three minutes,
and Chapter 1 supplies every number needed to prove it, so nothing has to be asserted.

**Runtime:** 2:39 (158.96s of measured narration) · 1920×1080 · 30 fps

---

## What the video teaches

Temperature does not add randomness and it is not a creativity dial. It changes the
**relative concentration** of a probability distribution by dividing the differences
between scores before those scores are exponentiated and normalised.

The video demonstrates this on the chapter's own three-outcome example. The scores
`[1, 2, 3]` are held fixed for the entire video while temperature is the only thing
that moves. The viewer sees the largest score's share fall from 86.7% at T=0.5 to
50.6% at T=2.0 without the ranking ever changing, and then sees why: the ratio of any
two probabilities is `exp((z_i − z_k)/T)`, so temperature rescales an exponent. Because
the gap between the top two scores here is exactly 1, that ratio is exactly `e^(1/T)` —
7.389, 2.718, 1.649.

It closes on the boundary. Lowering the temperature concentrates the distribution on
the top-scoring outcome whether or not that outcome is correct. **Temperature changes
the shape of the distribution; it does not tell you whether the preferred answer is
true.**

A viewer should finish able to answer both "what exactly changes when temperature
changes?" and "what does temperature not tell us?"

---

## Repository structure

```
assignment-01/
├── README.md              this file
├── BUILD-PROMPT.md        every command actually run, including the ones that failed
├── SOURCES.md             course material, toolkit, third-party licences, AI disclosure
├── FRICTIONAL.md          dated engineering log
├── FACTCHECK.md           every claim, its source, and its verdict
├── REVIEW.md              defects found by watching the cut, and the fixes
├── CHECKS-REPORT.md       the QC results
├── SHOTLIST.md            per-beat plan with measured durations
├── PROMPTS.md             what was asked of Claude and what was done with it
├── beat_sheet.json        GENERATED — the narration + visual plan
├── numbers.json           GENERATED — every figure in the video, with provenance
├── scripts/
│   ├── verify_temperature.py   computes and proves every number (run this first)
│   ├── check_contrast.py       asserts the palette's WCAG ratios
│   ├── build_beat_sheet.py     numbers.json + measured audio -> beat_sheet.json
│   └── sync_src.sh             copies the scene sources back from the toolkit
├── src/
│   ├── tokens/            aperture.ts (palette + glass), geistFont.ts (font loader)
│   ├── scenes/            apertureKit.tsx + the eight Temp*.tsx beat components
│   └── Root.registration.tsx.txt   the exact Root.tsx block needed to register them
├── evidence/              captured course output, test output, verification log
└── video/                 the rendered MP4
```

`media/`, `clips/` and the mp3s are generated and git-ignored; everything needed to
regenerate them is tracked.

---

## Requirements

| | version used |
|---|---|
| Python | 3.13.2 |
| Node | 26.5.0 (≥ 20 required) |
| ffmpeg / ffprobe | 9.0.1 (`brew install ffmpeg`) |
| brutalist.art | rev `ba2d0e0f043f5b3b35a50d336e0fc66fbfecfc0c` |

LaTeX is **not** needed — there are no Manim beats. No API key, no account, no paid
service. Total cost: **$0.00**.

Two setup steps in the toolkit fail for reasons that are not this project's doing (an
unsatisfiable `manim` pin, and a smoke fixture that fails its own slug validator). Both
are diagnosed with workarounds in `BUILD-PROMPT.md` §2 and logged in `FRICTIONAL.md`.

---

## Build

```bash
# 1. prove the numbers — the build must not proceed if this fails
python3 scripts/verify_temperature.py

# 2. beat sheet from the verified numbers
python3 scripts/build_beat_sheet.py

# 3. narration; ffprobe on these mp3s is the master clock
cd ../../../../brutalist.art && source .venv/bin/activate
python3 runtime/scripts/generate_audio_kokoro.py "$REEL"

# 4. feed the measured durations back into the scene props
cd "$REEL" && python3 scripts/build_beat_sheet.py

# 5. render and assemble
cd ../../../../brutalist.art
./art run   "$REEL"
./art final "$REEL" --height 1080 --out "$REEL/video"
```

Full detail, including the toolkit install and the Geist and scene-registration steps,
is in `BUILD-PROMPT.md`.

---

## Verification

No number appears on screen unless `scripts/verify_temperature.py` has cleared it.
That script runs five checks:

1. every distribution sums to 1 (tolerance 1e-12)
2. `p_i/p_k` equals `exp((z_i − z_k)/T)` (tolerance 1e-12)
3. the course's max-subtracted form equals the direct form (max delta 1.1e-16)
4. **our table equals `research/worked-examples.json` → `chapters.01` exactly**
5. a live subprocess run of the course `main.py` matches our T=1.0 row exactly

Check 4 is the one that matters: it is what makes "these are the course's numbers" a
verifiable statement rather than a claim. The output is `numbers.json`, and
`build_beat_sheet.py` generates the scene props from that file — so there is no path by
which an unverified figure reaches the screen, and no figure is typed by hand twice.

`scripts/check_contrast.py` separately asserts that every text colour clears WCAG AA
against the ground, so the accessibility claim in `src/tokens/aperture.ts` cannot rot.

Claude assisted throughout and wrote these scripts. **Claude did not independently
verify any claim** — the verification is done by deterministic code that fails loudly,
which is the only form of that claim worth making. See `SOURCES.md` §4.

---

## Rebuild — shortest complete sequence

```bash
export REEL="$PWD"
python3 scripts/verify_temperature.py && python3 scripts/build_beat_sheet.py \
  && cd ../../../../brutalist.art && source .venv/bin/activate \
  && python3 runtime/scripts/generate_audio_kokoro.py "$REEL" \
  && (cd "$REEL" && python3 scripts/build_beat_sheet.py) \
  && ./art run "$REEL" \
  && ./art final "$REEL" --height 1080 --out "$REEL/video"
```

---

## Output

`video/temperature-concentration-control.mp4`

---

## AI contribution

Built with Claude Code (Opus 5). Claude located the source material, ran the Chapter 1
code, drafted the narration and beat structure, wrote the verification script and the
eight Remotion scene components, diagnosed the two toolkit install failures, and caught
the animation-timing defect described in `REVIEW.md`.

I chose the concept and the boundary claim, resolved the branding and aesthetic
conflicts, decided not to pad the runtime to a target, and reviewed the rendered cut.

**The narration is synthetic** — Kokoro `af_bella`, generated locally. It is not my
voice and not any instructor's voice. This is stated on screen in the closing card.

No Claude API call was made by this project, and no Claude output, transcript, or
generated asset appears in the video. Full breakdown in `SOURCES.md`.
