# REVIEW — watching the cut and fixing what was wrong

Required by the course film-folder convention (`youtube/README.md`): timestamped
problems, the change requested, the re-check, and the human decision.

A render completing is not a review. Everything below came from looking at frames or
listening to the cut, not from a duration probe.

---

## R1 · 2026-09-15 — Number line bunched into the right quarter

**Where:** B02 `TempDivide`, at T = 2.0.

**Problem:** the three points are plotted on a shared scale so that low and high
temperatures are directly comparable. That is the point of the beat — but at T = 2.0
the divided scores are `[-1, -0.5, 0]` against a scale spanning `-4 … 0`, so all three
dots crowd into the right-hand quarter and three quarters of the panel reads as empty
space rather than as measured distance.

**Requested change:** keep the shared scale (changing it per temperature would destroy
the comparison and would be dishonest), but make the emptiness legible as *scale* and
make the actual quantity explicit.

**Fix:** added half-unit tick marks along the axis, and drew the B→C gap as a labelled
bracket — `gap = 2` at T=0.5, `gap = 1` at T=1.0, `gap = 0.5` at T=2.0.

**Re-check:** re-rendered at frames 90 / 200 / 300. The bracket now shrinks visibly as
T rises, which states the beat's thesis — temperature rescales the gaps — as a number
rather than as a layout.

**Decision:** accepted. This made the beat better than my original design, not merely
un-broken.

---

## R2 · 2026-09-15 — Tick labels collided with the outcome labels

**Where:** B02, immediately after R1.

**Problem:** the numeric tick labels (`-4`, `-3`, `-2` …) were drawn below the axis, and
so were the outcome letters (`A`, `B`, `C`). Where a point sat on an integer they
overlapped and both became unreadable.

**Fix:** removed the tick numerals entirely — the marks alone carry the scale, and the
points already display their own values — and pushed the outcome letters clear of the
tick zone.

**Re-check:** re-rendered the same three frames. No overlap at any stop.

**Decision:** accepted.

---

## R3 · 2026-09-15 — The one that mattered: motion finished, narration kept going

**Where:** every beat.

**Problem:** this is not visible in a still, which is why I nearly shipped it. Each
scene's reveals were written as fixed frame offsets — `useRise(22)`, `useRise(150)` —
so every animation completed within roughly five seconds. The beats themselves run 11
to 26 seconds, set by the measured narration. B04 was the worst case: all motion done
by frame 150 of 777, leaving 21 seconds of frozen frame under a continuing voice-over.

That is a "video" that is really a slideshow with narration — the exact failure the
toolkit's SHOW-DON'T-TELL law describes, and it would have passed every automated check
in the pipeline. The mp4 decodes, the audio is in sync, the numbers are correct, the
duration is right.

**Root cause:** the beat's length comes from the audio clock, but the scene components
never read that clock. Two independent timing systems that were never connected.
Compounding it, `remotion_scenes.py` renders each composition at whatever
`durationInFrames` is registered in `Root.tsx`, then freeze-pads the result to the audio
length with ffmpeg — so the render itself was genuinely only ~5 seconds of motion
followed by a frozen tail.

**Fix, in two parts:**
1. `calculateMetadata` in `Root.tsx` now reads a `durationInFrames` prop, so each
   composition renders at its beat's real measured length.
2. `useAt()` in `apertureKit.tsx` converts a fraction into frames, and every reveal in
   all eight scenes was re-expressed as a fraction of the beat (`at(0.34)` rather than
   `44`). `build_beat_sheet.py` now runs a second pass after audio generation to feed
   the measured durations into the props.

**Re-check:** rendered clip durations against measured audio —
B00 12.00s / 11.97s, B01 18.93s / 18.92s, B02 21.40s / 21.40s. Motion now spans the
whole spoken line in each beat.

**Decision:** accepted. The lesson I am keeping: "audio-first" is not only about the
final concatenation. If the visuals do not also read the clock, you get a correctly
timed video full of static frames, and every automated gate will call it fine.

---

## R4 · 2026-09-15 — Runtime came in under target; decided not to pad

**Problem:** measured narration totals 158.96s (2:39). I had been aiming at 3:00–3:30.

**Options considered:** `compile.py` pads audio with `apad` and freeze-extends video to
whatever `actual_duration_s` says, so I could have added ~20 seconds of trailing holds
without touching the script, and hit three minutes exactly.

**Decision: do not pad.** The toolkit's duration doctrine is explicit — *"Duration is an
output, never a target… Padding to reach 1:00 is as wrong as compressing to reach
0:30."* 2:39 is inside the assignment's stated 2–4 minute window. Adding silence to
reach a round number would be padding under any honest description, and this is a video
about not overstating what you have.

**Human decision:** mine. Recorded here so the choice is inspectable rather than
implicit.

---

## What I checked on the final cut

See `CHECKS-REPORT.md` for the frame-by-frame results.
