# FRICTIONAL — Week 01 video

An honest log of what I tried, what broke, and what I decided. Dated entries, written
as I worked. Where a step was straightforward I say so rather than manufacturing
difficulty.

---

## 2026-09-14 — Finding the inputs

**What I was working on:** starting the Week 01 explainer video.

**I tried / expected:** I expected the course checkout and the Brutalist toolkit to be
sitting in my assignment folder. Neither was — the folder was empty.

**What happened:** both existed only as downloaded zips
(`brutalist.art-main.zip`, `info-7375-prompt-engineering-for-generative-ai-main.zip`).
I had also not registered that the course ships its *own* spec for this assignment at
`prerequisites/brutalist-video.md`, which turned out to be more specific than my own
plan in several places.

**What I did:** extracted the course repo to a sibling folder for reference, cloned
`brutalist.art` properly from GitHub rather than working from the zip, so the toolkit
revision is recorded: `ba2d0e0f043f5b3b35a50d336e0fc66fbfecfc0c` (2026-09-07).

**What I understand now:** the course doc's instructions beat my assumptions in three
places — build at 1080p not 4K, avoid equation beats on a first video, and keep the
toolkit checkout outside the submitted repository. I followed the course doc.

---

## 2026-09-14 — The concept was already the chapter's own heading

**I tried / expected:** I picked "temperature as a concentration control" expecting to
have to assemble the argument myself from scattered chapter text.

**What happened:** `chapters/01-randomness-and-first-prompts.md:192` is a section
titled, verbatim, *"Temperature is a concentration control, not a fact checker."* The
ratio derivation I intended to build as my "enhancement" is at `:194-200`, including
the line *"This expression explains the temperature effect without requiring a slogan
about creativity."*

**What I did:** rewrote my plan to follow the chapter's own argument rather than a
parallel one. This felt like a loss at first (less original) and then like the right
call: the assignment rewards explaining the course material correctly, not inventing a
competing framing.

**Still uncertain:** whether leaning this hard on the chapter's structure reads as
faithful or as unoriginal. I decided faithful, and put the original work into the
*demonstration* — the animated number line and the ratio triptych — rather than into
the argument.

---

## 2026-09-14 — Discovering I needed no invented numbers

**I tried / expected:** I assumed I would need a constructed numerical example and had
planned the `CONSTRUCTED ILLUSTRATION` labelling for it.

**What happened:** the chapter supplies the logits (`[1,2,3]`, `:134`), the
temperatures (`0.5/1.0/2.0`, `:206`), the intermediate weights (`:154`), and the
repository ships `research/worked-examples.json` with the recorded results.

**What I did:** wrote `scripts/verify_temperature.py` to recompute everything with the
course's own `probabilities()` and assert **exact** equality against that JSON, plus a
subprocess run of `main.py` diffed against our T=1 row. All five checks pass. My
independently computed table matched to the last digit.

**What I understand now:** the honest labelling problem got smaller, not bigger. The
only constructed element left is the answer key in the boundary beat — and the chapter
constructs the same device at `:214` and explicitly warns at `:216` not to report it as
an observed model error, so I used the chapter's own wording on the on-screen chip.

**Evidence:** `evidence/verify-output.txt`, `numbers.json`, `FACTCHECK.md`.

---

## 2026-09-15 — `./setup --install` failed on a dependency that cannot exist

**I tried:** `./setup --install` in a fresh venv, expecting the standard install.

**What happened:**

```
ERROR: No matching distribution found for manim<0.19,>=0.18
Python dependency install FAILED — see pip output above.
```

Because pip aborts the whole `-r requirements.txt` on one failure, this also silently
took down Pillow, kokoro-onnx and faster-whisper. The readiness table then showed
audio, captions, Manim **and** compile all blocked, which looked far worse than the
real problem.

**Diagnosis:** `python3 -m pip index versions manim` returns
`0.21.0, 0.20.1, 0.20.0, 0.19.2, 0.19.1, 0.19.0, 0.14.0, 0.13.1, …` — there is no
0.18.x on PyPI at all. The toolkit's pin `manim>=0.18,<0.19` is an **empty window**;
this would fail for anyone, not just on Python 3.13.

**What I did:** installed the remaining dependencies individually, deliberately
omitting `manim` and `manimpango`:

```bash
python3 -m pip install "kokoro-onnx>=0.4" "mutagen>=1.47,<1.48" "Pillow>=10.2,<11" \
                       "numpy>=2.0.2" "faster-whisper>=1.0,<2"
```

**Result:** every feature this video uses reports ready — audio, captions, Remotion
beats, slates/previz/compile, fonts. The two Manim rows stay blocked. That is
acceptable and expected: the course prerequisite says *"For this first video, use
existing chart/diagram components and avoid equation beats… The doctor may still report
that unused feature as blocked: record it honestly."* This reel has zero Manim beats,
so all mathematics is typeset in Remotion instead.

**Also missing at the start:** `ffmpeg`/`ffprobe` were not installed at all.
`brew install ffmpeg` fixed it (9.0.1). Without ffprobe there is no audio clock, so
nothing else would have worked.

---

## 2026-09-15 — The toolkit's own smoke test fails its own validator

**I tried:** `./art smoke`, the toolkit's documented end-to-end proof, before trusting
the pipeline with my reel.

**What happened:**

```
[smoke] --- GATE 0: Kokoro narration ---
[kokoro] REFUSED: metadata.slug must be a filename, not a path
[smoke] FAIL: generate_audio_kokoro.py failed
```

**Diagnosis:** `runtime/scripts/build_safety.py:186` validates slugs against
`[A-Za-z0-9][A-Za-z0-9._-]*` — the first character must be alphanumeric. The smoke
fixture's own slug is `_smoke`, which starts with an underscore. The fixture cannot
pass the validator it is checked by. This is an upstream bug, not a problem with my
environment.

**What I did:** rather than patch the toolkit (not mine to change, and the course says
not to modify reference material), I copied the fixture to a temp directory, changed
only the slug to `smoketest`, and ran the pipeline manually. It produced a 13.9s mp4
with both video and audio streams decoding, from real `af_bella` synthesis. The
pipeline is sound; only the fixture's slug is wrong.

**What this told me that mattered:** my own slug had to satisfy that regex.
`temperature-concentration-control` does.

---

## 2026-09-15 — The mistake I would have shipped

**What happened:** I rendered three stills early to check the typeface was loading, and
noticed the numbers were right and the layout was fine. What I nearly missed was a
timing problem that no still can show: every scene's animation finished in about five
seconds, while the narration for those beats runs twenty to twenty-six seconds. Four
fifths of each beat would have been a frozen slide with a voice over it — precisely the
"PPT test" failure the toolkit's SHOW-DON'T-TELL law describes.

**Why it happened:** I had written the reveal delays as fixed frame offsets
(`useRise(22)`, `useRise(150)`) while the beat length is set by measured audio. The two
were never connected.

**What I did:** added `useAt()` so every reveal is expressed as a fraction of the beat,
and wired `calculateMetadata` in `Root.tsx` so each composition's length is the measured
mp3 duration passed through the beat sheet. `build_beat_sheet.py` now runs twice —
before audio to write narration, after audio to feed the real clock back into the props.

**What I understand now:** "audio-first" in this toolkit is not only about the final
concatenation. If the visuals do not also read the clock, you get a correctly-timed
video full of static frames. A duration probe would have called that file perfect.

---

## 2026-09-15 — Two conflicts I had to resolve rather than ignore

**1. The branding conflict.** The `ai-explainer` skill's bookends are locked to the
instructor's channel: `OUTRO-LOCK.md` and `ClaudeTitleOutro.tsx` hardcode
`const HANDLE = '@NikBearBrown'` with no prop override, and the IN-FOR-BEAR law scripts
the cold open as *"this is Liam, in for Bear."* But `prerequisites/brutalist-video.md`
says: *"Do not imply a synthetic narrator is me, Bear, or an official endorsement."*

Following the skill would have violated the course rule. I used the toolkit's engine —
Kokoro clock, Remotion renderer, `compile.py` assembler, the QC gates — with my own
palette (`aperture`) and my own closing card. Setting `metadata.palette` to something
other than `claude` also means `compile.py::lint_skin` does not demand the locked
bookends.

**2. The aesthetic conflict.** I wanted an Apple-style liquid-glass look.
`DESIGN-PRINCIPLES.md` effectively forbids it for the Claude skin — that palette is a
*fidelity* replication of a real product, with flat cream surfaces and hairline
borders, and only two of roughly 700 existing scenes use `backdropFilter` at all.

Since I was already off the Claude skin for the branding reason, this resolved itself.
But I kept one rule from the Brutalist doctrine because it is a genuine legibility
constraint, not a style preference: **glass is chrome only**. Every glyph and every
data bar sits on an opaque fill. Contrast ratios are documented in
`src/tokens/aperture.ts` and were computed rather than eyeballed, because Gate V treats
low contrast as a blocking defect and translucency makes contrast depend on whatever
happens to be behind it.

---

## 2026-09-15 — Runtime: what I did not do

The measured narration totals 158.96s (2:39). I had been aiming at 3:00–3:30.

I considered adding trailing holds to reach three minutes. `compile.py` supports it
cleanly — it pads audio with `apad` and freeze-extends video to whatever
`actual_duration_s` says, so I could have bought twenty seconds without touching the
script.

I did not, for two reasons. The toolkit's duration-planner doctrine is explicit —
*"Duration is an output, never a target… Padding to reach 1:00 is as wrong as
compressing to reach 0:30"* — and 2:39 sits inside the assignment's stated 2–4 minute
window. Adding silence to hit a number would have been padding by any honest
description. The runtime is what the explanation needs.

**What Claude contributed across this build:** located the files, read the toolkit and
chapter, drafted the narration and the beat sheet, wrote the verification script and
the eight Remotion components, diagnosed the manim pin and the smoke-test slug bug, and
caught the animation-timing defect on review. **What I did:** chose the concept and the
boundary claim, decided the branding and aesthetic conflicts above, judged the runtime
question, and watched the rendered cut. **What I have not delegated:** the claim that
these numbers are the course's numbers — that is asserted by a script I can run, read,
and defend, which is the only form of that claim I am willing to make.
