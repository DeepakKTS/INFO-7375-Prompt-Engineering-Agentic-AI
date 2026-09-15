# SOURCES

Everything this video was built from, separated by origin. Where a category is empty,
it says so explicitly rather than being omitted.

---

## 1. Course material

Repository: `info-7375-prompt-engineering-for-generative-ai`, main branch, obtained
2026-09-14. A reference copy is kept outside this folder at `../../../info-7375-course/`.
It is **not** vendored into this submission.

| File | Used for |
|---|---|
| `chapters/01-randomness-and-first-prompts.md` | The concept and its framing. Section `:192` *"Temperature is a concentration control, not a fact checker"* is the video's thesis. Formula `:140-144`; max-subtraction `:152-164`; ratio law `:194-200`; results table `:206-210`; the constructed-hypothetical device `:214-216`. |
| `lessons/01-randomness-and-first-prompts/code/main.py` | The reference implementation. `probabilities()` and `sample()` are reproduced verbatim in `scripts/verify_temperature.py`, with a provenance header. |
| `lessons/01-randomness-and-first-prompts/code/tests/test_main.py` | Run as part of evidence gathering: 6 tests, all pass. |
| `lessons/01-randomness-and-first-prompts/docs/en.md` | The boundary claim, `:27` — *"Temperature changes the distribution, not the truth of the answer."* Also `:37`, which specifies comparing temperatures 0.5 and 2.0. |
| `research/worked-examples.json` (`chapters.01`) | The recorded results my computed table is asserted against, exactly. |
| `prerequisites/brutalist-video.md` | The course's own spec for this assignment. Followed over my own assumptions on 1080p output, avoiding equation beats, keeping the toolkit outside the repo, and not implying instructor endorsement. |
| `prerequisites/github-submission.md`, `frictional.md`, `relative-quartile.md` | Submission and documentation requirements. |
| `youtube/README.md` | Film-folder conventions (`REVIEW.md`, `BUILD-PROMPT.md`, `SOURCES.md`, `final/`). |

Copies of the specific evidence used are in `evidence/`:
`course-main-py-output.txt`, `course-tests-output.txt`, `course-main.py.reference-copy`,
`course-worked-examples.json`, `verify-output.txt`.

---

## 2. Toolkit

**brutalist.art** — https://github.com/nikbearbrown/brutalist.art
Revision `ba2d0e0f043f5b3b35a50d336e0fc66fbfecfc0c` (2026-09-07).
Cloned as a sibling directory, not vendored here, per `youtube/README.md`.

Components used:

| Part | Role |
|---|---|
| `runtime/scripts/generate_audio_kokoro.py` | Local Kokoro TTS; ffprobes each mp3 to produce the master clock |
| `runtime/scripts/remotion_scenes.py` | Renders each `shot.remotion.pattern` to `media/<beat>.mp4` |
| `runtime/scripts/compile.py` | Assembles the per-beat clips and audio into the master |
| `runtime/scripts/run.sh` (`./art run`) | Gate sequence + render + compile |
| `runtime/qc/final_frame_check.py` | Gate V — frame-level visual QC, contact sheet |
| `runtime/remotion/` | The Remotion project the new scene components were added to |

**Not used:** the `ai-explainer` skill's locked bookends (`ClaudeComposerAsk`,
`ClaudeVerdictArtifact`, `ClaudeTitleOutro`), the `claude` palette, Higgsfield, and
Manim. Reasons in `FRICTIONAL.md`. No paid service, no API key, and no account was used
at any point. Total spend: **$0.00**.

---

## 3. Code

| File | What it does | Author |
|---|---|---|
| `scripts/verify_temperature.py` | Computes every displayed number and runs five checks, including exact agreement with `research/worked-examples.json` and a live subprocess run of the course `main.py`. Writes `numbers.json`. | Mine, except `probabilities()` / `sample()`, reproduced verbatim from the course and labelled as such in the file |
| `scripts/build_beat_sheet.py` | Generates `beat_sheet.json` from `numbers.json` and the measured audio timings, so no figure is hand-typed into a scene | Mine |
| `src/tokens/aperture.ts` | The Aperture palette and glass surface recipe, with computed WCAG ratios | Mine |
| `src/tokens/geistFont.ts` | Geist loader; fails loudly rather than falling back to a system face | Mine |
| `src/scenes/apertureKit.tsx` | Shared scene parts and the `useAt()` fraction-of-beat timing helper | Mine |
| `src/scenes/Temp*.tsx` (8 files) | The eight beat components | Mine |

Calculations actually run: the softmax at T ∈ {0.5, 1.0, 2.0} over logits `[1,2,3]`;
the probability ratio `p_C/p_B` and its closed form `exp(Δz/T)`; the max-subtracted
versus direct softmax comparison; seeded sampling at `seed=7, count=1000`. Output is
`numbers.json` and `evidence/verify-output.txt`.

---

## 4. Claude's contribution

Claude (Claude Code, Opus 5) was used throughout. Specifically it:

- located the course and toolkit files and read the chapter, lesson, and toolkit docs
- ran the Chapter 1 code and captured its output
- drafted the narration script and the beat structure
- wrote `verify_temperature.py`, `build_beat_sheet.py`, and the eight Remotion components
- diagnosed the `manim>=0.18,<0.19` empty-pin install failure and the `_smoke` slug bug
- identified that scene animations were finishing ~5s into 20–26s beats, and implemented
  the fraction-of-beat timing fix
- drafted this documentation

**What Claude did not do:** it did not independently verify any claim. The verification
in this project is done by `scripts/verify_temperature.py`, which is deterministic code
I can run, read, and defend — not by a model asserting something is correct. Claude
wrote that script; the script is what establishes the numbers, and its assertions fail
loudly if the course evidence ever disagrees.

No Claude API call was made by this project, and **no Claude conversation, transcript,
or model output appears in the video**. Nothing in the video is presented as a Claude
response, because nothing in it is one.

---

## 5. Student-created material

Mine: the choice of concept and of the boundary claim to state; the decision to build
on the chapter's own framing rather than a parallel one; the narration script and its
rewriting for speech; the eight-beat structure; the Aperture visual design (palette,
glass-as-chrome-only rule, layout, motion); the number-line gap visualisation in B02 and
the pinned-input triptych in B04; the decision to show no percentages during the B00
sweep; the resolution of the branding and aesthetic conflicts; the decision not to pad
the runtime; and the review of the rendered cut.

---

## 6. Third-party assets

| Asset | Source | Creator | Licence | Use |
|---|---|---|---|---|
| Geist Sans, Geist Mono | npm `geist@1.7.2` | Vercel, with basement.studio | SIL Open Font License 1.1 | All on-screen typography. Licence copy shipped alongside the fonts at `runtime/remotion/public/fonts/Geist-LICENSE-OFL.txt` |
| Kokoro v1.0 (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) | `thewh1teagle/kokoro-onnx`, release `model-files-v1.0` | Kokoro / hexgrad | Apache-2.0 (model weights); `kokoro-onnx` Apache-2.0 | Narration voice `af_bella`, generated locally |
| Remotion | npm `remotion@4.x` | Remotion / Jonny Burger | Remotion Licence — free for individuals and small teams; this is unfunded individual coursework | Rendering the scene components |
| brutalist.art | GitHub, rev `ba2d0e0f` | Nik Bear Brown | see repository | Audio clock, render orchestration, assembly, QC gates |
| FFmpeg 9.0.1 | Homebrew | FFmpeg team | LGPL/GPL | Duration measurement, conform, assembly |

**No other third-party assets are used.** There is no stock footage, no stock imagery,
no music, no sound effects, no icon set, no AI-generated image or video, and no
screen recording of any product interface. Every frame is drawn by the scene
components in this repository.

---

## 7. Synthetic narration disclosure

The narration is **not a human voice**. It is Kokoro `af_bella`, a local neural TTS
voice, generated offline by `runtime/scripts/generate_audio_kokoro.py` at a cost of
$0.00. It is not my voice, not any instructor's voice, and not a clone of anyone. This
is stated on screen in the closing card and in `beat_sheet.json`
(`metadata.narration_disclosure`).
