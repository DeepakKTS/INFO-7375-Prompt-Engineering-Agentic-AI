# FACTCHECK — Temperature as a Concentration Control

Every claim the narration makes, with its source and verdict. A claim is only
cleared if it can be traced to the course material or recomputed from the course's
own implementation.

Course checkout used: `info-7375-prompt-engineering-for-generative-ai` (main branch,
downloaded 2026-09-14). Paths below are relative to that checkout.

Legend — **COURSE TEXT**: stated in the chapter or lesson. **COURSE OUTPUT**:
produced by running the course's own code. **CONSTRUCTED**: invented by me, and
labelled as such on screen.

---

## Conceptual claims

| # | Claim (as narrated) | Source | Type | Verdict |
|---|---|---|---|---|
| 1 | Temperature is a concentration control | `chapters/01-randomness-and-first-prompts.md:192` — section heading: *"Temperature is a concentration control, not a fact checker"* | COURSE TEXT | ✅ |
| 2 | The scores are called logits and are not yet probabilities | `chapters/01:134-136` — *"Call its entries scores, or logits… It does not yet express chances."* | COURSE TEXT | ✅ |
| 3 | Probabilities must be non-negative and sum to one | `chapters/01:136` — *"Probabilities must be nonnegative and sum to one."* | COURSE TEXT | ✅ |
| 4 | The scores [1,2,3] sum to 6, but dividing by 6 is a different transformation that would not handle negative scores | `chapters/01:136` — *"These scores sum to six. Dividing each by six would produce one possible distribution, but it would be a different transformation… also accepts negative finite scores."* | COURSE TEXT | ✅ |
| 5 | The implementation subtracts the largest score, then divides by temperature | `lessons/01-randomness-and-first-prompts/code/main.py:14-15` — `peak = max(logits)`; `math.exp((x - peak) / temperature)` | COURSE OUTPUT | ✅ |
| 6 | Subtracting the max changes intermediate weights but not the distribution | `chapters/01:156-164` — the cancellation derivation; independently re-verified as CHECK 3 in `scripts/verify_temperature.py` (max delta 1.1e-16) | COURSE TEXT + recomputed | ✅ |
| 7 | The softmax formula is `p_i = exp(z_i/T) / Σ_j exp(z_j/T)` | `chapters/01:140-144`, verbatim | COURSE TEXT | ✅ |
| 8 | Temperature only rescales the gaps between scores; it never moves a score alone | Follows directly from claim 5: `(x - peak)` is a difference, and `T` divides only that difference. Stated in the chapter as *"their positive difference is divided by T"* (`:200`) | COURSE TEXT | ✅ |
| 9 | Lower T concentrates; higher T flattens and the smallest score gains | `chapters/01:212` — *"its share moves from about eighty-seven percent to about fifty-one percent… The smallest score gains probability as the distribution flattens."* | COURSE TEXT | ✅ |
| 10 | The ordering never changes under positive T | `chapters/01:148` — *"it cannot make a smaller score become the largest probability under this formula."* | COURSE TEXT | ✅ |
| 11 | The ratio law: `p_i/p_k = exp((z_i − z_k)/T)` | `chapters/01:196-198`, verbatim | COURSE TEXT | ✅ |
| 12 | This explains temperature without a creativity slogan | `chapters/01:200` — *"This expression explains the temperature effect without requiring a slogan about creativity."* | COURSE TEXT | ✅ |
| 13 | **Temperature does not establish truth** | `chapters/01:192, 212, 214-216`; `lessons/01/docs/en.md:27` — *"Temperature changes the distribution, not the truth of the answer."* | COURSE TEXT | ✅ |

---

## Numerical claims

All figures are produced by `scripts/verify_temperature.py`, which computes them with
the course's own `probabilities()` and then asserts exact equality against
`research/worked-examples.json` key `chapters.01`. Output is `numbers.json`; the beat
sheet is generated from that file, so no figure is typed by hand anywhere.

| # | Value shown | Where | Verdict |
|---|---|---|---|
| 14 | logits `[1, 2, 3]` | `chapters/01:134` — the chapter's own constructed input | ✅ COURSE INPUT |
| 15 | temperatures `0.5 / 1.0 / 2.0` | `chapters/01:206-210`; `lessons/01/docs/en.md:37` | ✅ COURSE-CHOSEN |
| 16 | shifted scores `[-2, -1, 0]` | `chapters/01:154`, verbatim | ✅ |
| 17 | weights `0.135335 / 0.367879 / 1`, total `1.503215` | `chapters/01:154`, verbatim | ✅ |
| 18 | T=0.5 → `1.5876% / 11.7310% / 86.6813%` | `worked-examples.json`; recomputed exactly | ✅ |
| 19 | T=1.0 → `9.0031% / 24.4728% / 66.5241%` | `worked-examples.json`; also the live stdout of `main.py` | ✅ |
| 20 | T=2.0 → `18.6324% / 30.7196% / 50.6480%` | `worked-examples.json`; recomputed exactly | ✅ |
| 21 | ratios `7.389 / 2.718 / 1.649` | computed as `p_C/p_B`; asserted equal to `exp(1/T)` to 1e-12 (CHECK 2) | ✅ |
| 22 | divided scores per T: `[-2,-1,0]`, `[-4,-2,0]`, `[-1,-0.5,0]`; gaps `1 / 2 / 0.5` | computed from `(z − max)/T` | ✅ |

`verify_temperature.py` output, all five checks passing, is preserved at
`evidence/verify-output.txt`.

---

## The one constructed element

**The answer key in B06.** The narration says *"Suppose we stipulate an answer key in
which outcome A is the correct one."* Nothing in the course says A is correct — there
is no ground truth for these toy outcomes, which is the entire point of the beat.

This is taken directly from the chapter, which introduces the same device:

> *"Suppose, as an explicitly constructed hypothetical, the three labels are proposed
> answers to a question whose independently checked answer is label zero."* — `:214`

and immediately warns:

> *"Do not report that hypothetical as an observed Claude error."* — `:216`

Accordingly the beat is labelled on screen with two chips —
**`CONSTRUCTED HYPOTHETICAL · ch.1 §214`** and **`NOT A CLAUDE RUN`** — and the
narration says "stipulate", not "is". The distribution shown alongside it (1.6 / 11.7
/ 86.7 at T=0.5) is real course output; only the correct/wrong labelling is stipulated.

---

## Script fact-check pass — two corrections made

A full sentence-by-sentence audit of the narration was run against the sources after
the first master was rendered. Every numerical value passed. Two statements did not,
and both were corrected and re-rendered.

### C1 — the scores' provenance was never stated (B01)

**Problem.** The narration introduced the scores as "one, two, and three" and the
closing beat refers to "the model's existing score differences". Combined with the
hook's framing — "what does temperature actually change in a language model?" — a
viewer could reasonably conclude that `[1, 2, 3]` are logits emitted by a real model.
They are not, and the chapter is emphatic about it:

> *"The word does not give these numbers extra authority. In this example I have chosen
> them; no model produced them."* — `chapters/01-randomness-and-first-prompts.md:134`

The on-screen chip said `COURSE INPUT`, but nothing said *hand-chosen*, and nothing
said *not model output*.

**Correction.** B01 now says: *"The chapter chose these by hand — no model produced
them."* The beat carries two chips instead of one: `COURSE INPUT · ch.1 §134` and
`CHOSEN BY HAND · NOT MODEL OUTPUT`.

### C2 — "any two outcomes … that gap is exactly one" was false (B05)

**Problem.** The narration read: *"Take any two outcomes and divide their
probabilities … Here that gap is exactly one."* That is true only for the **top two**
outcomes. Across the full set:

| pair | gap | ratio at T = 0.5 |
|---|---:|---:|
| B − A | 1 | 7.389 |
| C − B | 1 | 7.389 |
| **C − A** | **2** | **54.598** |

A viewer applying the sentence as spoken to outcomes A and C would compute 7.389 where
the correct value is 54.598. The on-screen text was right (`z_C − z_B = 1`); the spoken
line generalised where it should not have.

**Correction.** B05 now says: *"Between the top two outcomes that difference is exactly
one, so their ratio is simply e to the one over T."*

### Checked and confirmed correct (no change needed)

- every spoken figure matches `numbers.json` to the precision stated, and each is
  prefixed with "about" where rounded — 0.135335 / 0.367879 / 1; total 1.503215;
  9 / 24.5 / 66.5 %; 87 / 67 / 51 %; ratios 7.4 / 2.7 / 1.6
- "about eighty-seven percent" and "about fifty-one percent" match the chapter's own
  rounding at `:212`
- "it would break on a negative score" — dividing by the sum yields a negative value
  for a negative score, violating non-negativity; the chapter's stated reason for
  rejecting that normaliser (`:136`)
- "That is the whole intervention" — `temperature` appears exactly once in
  `probabilities()`, in `(x - peak) / temperature`
- "It only rescales the gaps" — dividing by T scales every pairwise difference by 1/T
- "Temperature is not adding randomness" — randomness lives in `sample()`, not in
  `probabilities()`; the chapter rejects the creativity/randomness framing at `:200`
- the B06 answer key names outcome A, matching the chapter's own hypothetical, which
  stipulates "label zero" (`:214`)

---

## Claims deliberately NOT made

- No claim that any Claude model exposes a temperature setting. The chapter warns this
  toy *"is not a promise about which controls any Claude model exposes"* (`:218`).
- No claim about temperature 0. The course function rejects `T <= 0`, and the chapter
  notes low temperature is not the same operation as taking the argmax (`:218`).
- No claim that these probabilities are calibrated confidence. The chapter is explicit
  that they *"are not calibrated probabilities that a generated claim is true"*
  (`lessons/01/docs/en.md:94`).
- No Claude transcript appears anywhere in this video. None was generated for it.
- No claim about sampling counts. The seeded counts are in `numbers.json` as evidence
  but are deliberately kept off screen: distribution-versus-sample is a second concept
  and this video teaches one.
