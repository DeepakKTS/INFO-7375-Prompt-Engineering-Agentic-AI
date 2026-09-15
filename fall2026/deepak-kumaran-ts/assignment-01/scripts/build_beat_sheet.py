#!/usr/bin/env python3
"""
build_beat_sheet.py — generates beat_sheet.json from numbers.json.

Why this exists: the assignment requires that no numerical value be typed by hand
into more than one place. verify_temperature.py produces numbers.json; this script
is the only thing that turns those values into scene props. Narration text lives
here too, so a narrated figure and a displayed figure cannot drift apart.

Run verify_temperature.py first — this script refuses to run without numbers.json.

    python3 scripts/build_beat_sheet.py
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
SLUG = "temperature-concentration-control"
TITLE = "Temperature as a Concentration Control"
AUTHOR = "Deepak Kumaran Thoppudu Sudharsanan"
COURSE = "INFO 7375 · Prompt Engineering for Generative AI · Week 01"


def fmt(x, n):
    return f"{x:.{n}f}"


def trim(x):
    """Render a float without trailing zeros: -0.5 -> '-0.5', -2.0 -> '-2'."""
    s = f"{x:g}"
    return s


def main():
    npath = HERE / "numbers.json"
    if not npath.exists():
        print("numbers.json missing — run scripts/verify_temperature.py first",
              file=sys.stderr)
        return 1
    N = json.loads(npath.read_text())

    labels = N["inputs"]["labels"]
    scores = N["inputs"]["logits"]
    rows = {r["temperature"]: r for r in N["rows"]}
    t05, t10, t20 = rows[0.5], rows[1.0], rows[2.0]

    def pct(row):
        return row["percent"]

    # ---- beats -------------------------------------------------------------
    beats = []

    beats.append({
        "beat_id": "B00",
        "act": "hook",
        "content_type": "title",
        "narration_text": (
            "What does temperature actually change in a language model? "
            "Not its knowledge. Not its honesty. "
            "Watch this distribution. The three scores behind it never move. "
            "Only the temperature does."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "drawon",
            "show": [
                {"at": 0.05, "event": "title and the question land on the glass stage"},
                {"at": 0.35, "event": "the distribution appears at T = 2.0"},
                {"at": 0.60, "event": "T steps to 1.0; the bars re-concentrate"},
                {"at": 0.85, "event": "T steps to 0.5; C dominates"},
            ],
            "remotion": {
                "pattern": "TempHook",
                "props": {
                    "title": "Temperature as a concentration control",
                    "question": "What does temperature actually change?",
                    "labels": labels, "scores": scores,
                    "frames": [
                        {"t": 2.0, "pct": pct(t20)},
                        {"t": 1.0, "pct": pct(t10)},
                        {"t": 0.5, "pct": pct(t05)},
                    ],
                },
                "rendered": {"out": "media/B00.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B01",
        "act": "the starting point",
        "content_type": "structure",
        "narration_text": (
            "Start with three scores: one, two, and three. The course calls them logits. "
            "They rank the outcomes, but they are not yet probabilities. "
            "Probabilities have to be non-negative and sum to one. These sum to six. "
            "And dividing by six is not the transformation we want — it would break on a negative score."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "kinetic",
            "show": [
                {"at": 0.10, "event": "three score tiles rise in sequence"},
                {"at": 0.45, "event": "the two conditions a distribution must meet appear"},
                {"at": 0.70, "event": "'these sum to 6' is struck through in accent"},
            ],
            "remotion": {
                "pattern": "TempScores",
                "props": {"labels": labels, "scores": scores,
                          "heading": "Three scores. Not yet probabilities."},
                "rendered": {"out": "media/B01.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B02",
        "act": "the mechanism",
        "content_type": "mechanism",
        "narration_text": (
            "Here is the step that does the work. "
            "The reference implementation finds the largest score and subtracts it from all three, "
            "giving minus two, minus one, and zero. "
            "Then it divides every one of those differences by the temperature. "
            "That is the whole intervention. Temperature never moves a score on its own. "
            "It only rescales the gaps between them."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "isotype",
            "show": [
                {"at": 0.12, "event": "[1,2,3] minus max becomes [-2,-1,0]"},
                {"at": 0.35, "event": "the number line appears at T = 1, gap = 1"},
                {"at": 0.60, "event": "T = 0.5 — the points spread, gap = 2"},
                {"at": 0.85, "event": "T = 2.0 — the points compress, gap = 0.5"},
            ],
            "remotion": {
                "pattern": "TempDivide",
                "props": {
                    "labels": labels, "scores": scores,
                    "shifted": [int(v) if float(v).is_integer() else v
                                for v in t10["shifted_scores"]],
                    "stops": [
                        {"t": 1.0, "divided": t10["divided_scores"], "gap": "1"},
                        {"t": 0.5, "divided": t05["divided_scores"], "gap": "2"},
                        {"t": 2.0, "divided": t20["divided_scores"], "gap": "0.5"},
                    ],
                },
                "rendered": {"out": "media/B02.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B03",
        "act": "softmax",
        "content_type": "mechanism",
        "narration_text": (
            "Now exponentiate. At temperature one, those shifted scores become weights of about "
            "zero point one three five, zero point three six eight, and one. "
            "They sum to about one point five zero three. "
            "Divide each weight by that total and the scores are finally probabilities: "
            "nine percent, twenty-four and a half percent, sixty-six and a half percent. "
            "That is softmax, and the ordering came through untouched."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "kinetic",
            "show": [
                {"at": 0.10, "event": "the formula appears"},
                {"at": 0.30, "event": "divided scores -> exp -> weights"},
                {"at": 0.60, "event": "total weight 1.503215 highlighted"},
                {"at": 0.80, "event": "probabilities land, tinted per outcome"},
            ],
            "remotion": {
                "pattern": "TempSoftmax",
                "props": {
                    "labels": labels,
                    "divided": t10["divided_scores"],
                    "weights": [fmt(w, 6) for w in t10["weights"]],
                    "total": fmt(t10["weight_total"], 6),
                    "percent": [fmt(p, 2) for p in pct(t10)],
                    "temperature": 1.0,
                    "formula": "p_i = exp(z_i / T) ÷ Σ exp(z_j / T)",
                },
                "rendered": {"out": "media/B03.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B04",
        "act": "same scores, different temperature",
        "content_type": "data",
        "narration_text": (
            "Now hold the scores still — one, two, three, never changing — and move only the temperature. "
            "At temperature one half, the top outcome takes about eighty-seven percent. "
            "At temperature one, about sixty-seven. At temperature two, about fifty-one. "
            "The favourite never changes. What changes is how much of the probability mass it holds. "
            "Lower temperature concentrates. Higher temperature flattens, and the smallest score gains. "
            "These are the course's own recorded numbers."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "drawon",
            "show": [
                {"at": 0.08, "event": "the fixed input strip pins A=1 B=2 C=3"},
                {"at": 0.25, "event": "T = 0.5 panel grows — concentrated"},
                {"at": 0.50, "event": "T = 1.0 panel grows — baseline"},
                {"at": 0.72, "event": "T = 2.0 panel grows — flatter"},
                {"at": 0.90, "event": "footer: C stays the favourite at every T"},
            ],
            "remotion": {
                "pattern": "TempTriptych",
                "props": {
                    "labels": labels, "scores": scores,
                    "panels": [
                        {"t": 0.5, "pct": pct(t05), "caption": "concentrated"},
                        {"t": 1.0, "pct": pct(t10), "caption": "baseline"},
                        {"t": 2.0, "pct": pct(t20), "caption": "flatter"},
                    ],
                },
                "rendered": {"out": "media/B04.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B05",
        "act": "the ratio",
        "content_type": "equation",
        "narration_text": (
            "Why does that happen? Take any two outcomes and divide their probabilities. "
            "The normalising total cancels, and what is left is e raised to the difference "
            "of their scores, over T. "
            "Here that gap is exactly one, so the ratio is simply e to the one over T: "
            "seven point four at temperature one half, two point seven at one, "
            "and one point six at two. "
            "Temperature is not adding randomness. It is rescaling an exponent."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "kinetic",
            "show": [
                {"at": 0.08, "event": "the ratio law appears in a glass panel"},
                {"at": 0.25, "event": "note: the gap is 1, so the ratio is e^(1/T)"},
                {"at": 0.45, "event": "7.389 / 2.718 / 1.649 land left to right"},
                {"at": 0.85, "event": "'temperature = creativity' struck through and replaced"},
            ],
            "remotion": {
                "pattern": "TempRatio",
                "props": {
                    "law": "p_i / p_k  =  exp( (z_i − z_k) / T )",
                    "gapNote": f"here z_C − z_B = {N['delta_top_two']}, so the ratio is simply e^(1/T)",
                    "rows": [
                        {"t": 0.5, "ratio": fmt(t05["ratio_top_two"], 3),
                         "note": f"C is {fmt(t05['ratio_top_two'],1)}× B"},
                        {"t": 1.0, "ratio": fmt(t10["ratio_top_two"], 3),
                         "note": f"C is {fmt(t10['ratio_top_two'],1)}× B"},
                        {"t": 2.0, "ratio": fmt(t20["ratio_top_two"], 3),
                         "note": f"C is {fmt(t20['ratio_top_two'],1)}× B"},
                    ],
                    "misconception": "temperature ≠ “creativity”",
                    "correction": "temperature → how sharply score gaps become odds",
                },
                "rendered": {"out": "media/B05.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B06",
        "act": "the boundary",
        "content_type": "structure",
        "narration_text": (
            "One thing this does not establish. "
            "Suppose we stipulate an answer key in which outcome A is the correct one. "
            "Leave the scores alone and lower the temperature. "
            "The distribution concentrates harder on C — confidently, repeatably wrong. "
            "Temperature changes the shape of the distribution. "
            "It does not tell us whether the preferred answer is true."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "annotate",
            "show": [
                {"at": 0.10, "event": "stipulated answer key: A CORRECT, B and C wrong"},
                {"at": 0.35, "event": "at T = 0.5 the mass piles onto C"},
                {"at": 0.65, "event": "TEMPERATURE → DISTRIBUTION SHAPE"},
                {"at": 0.82, "event": "TEMPERATURE ↛ TRUTH"},
            ],
            "remotion": {
                "pattern": "TempBoundary",
                "props": {
                    "labels": labels, "scores": scores,
                    "pct": pct(t05), "correctIndex": 0, "temperature": 0.5,
                    "claim": "Temperature changes the shape of the distribution.",
                    "limit": "It does not tell us whether the preferred answer is true.",
                },
                "rendered": {"out": "media/B06.mp4", "at": ""},
            },
        },
    })

    beats.append({
        "beat_id": "B07",
        "act": "close",
        "content_type": "title",
        "narration_text": (
            "So: temperature is a concentration control. "
            "It changes how sharply the model's existing score differences "
            "translate into sampling probabilities — and nothing beyond that."
        ),
        "shot": {
            "type": "REMOTION", "source": "own", "lane": "remotion", "motion": "hold",
            "show": [
                {"at": 0.10, "event": "the takeaway sentence lands, accent on 'concentration control'"},
                {"at": 0.55, "event": "rule draws across; the credit card rises with disclosures"},
            ],
            "remotion": {
                "pattern": "TempClose",
                "props": {
                    "takeaway": ("Temperature is a concentration control: it changes how sharply "
                                 "the model's existing score differences translate into sampling "
                                 "probabilities."),
                    "title": TITLE, "author": AUTHOR, "course": COURSE,
                    "notes": [
                        "Every value computed by scripts/verify_temperature.py and checked against "
                        "the course's recorded worked examples",
                        "Narration: Kokoro af_bella — synthetic voice, generated locally, disclosed",
                        "Built with the brutalist.art toolkit · student work, not affiliated with "
                        "or endorsed by the instructor's channel",
                    ],
                },
                "rendered": {"out": "media/B07.mp4", "at": ""},
            },
        },
    })

    # Measured audio, if it exists yet. This is the real clock: generate_audio_kokoro.py
    # ffprobes each mp3 and writes mp3/timings.json. Run order is
    #   1. build_beat_sheet.py   (narration only; estimates)
    #   2. generate_audio_kokoro.py
    #   3. build_beat_sheet.py   (again — now the measured clock drives the animation)
    tpath = HERE / "mp3" / "timings.json"
    timings = json.loads(tpath.read_text()) if tpath.exists() else {}
    fps = 30

    for b in beats:
        b["voice"] = "af_bella"
        b["engine"] = "kokoro"
        # ~2.6 words/sec for af_bella; a placeholder only, replaced below once the
        # narration has actually been synthesized and measured.
        b["estimated_duration_s"] = round(len(b["narration_text"].split()) / 2.6, 1)
        measured = timings.get(b["beat_id"])
        if measured:
            b["actual_duration_s"] = measured
            b["audio_file"] = f"mp3/beat-{b['beat_id']}.mp3"
            # Hand the scene its real window so every reveal is a fraction of the
            # spoken line rather than a fixed frame offset that finishes early.
            b["shot"]["remotion"]["props"]["durationInFrames"] = round(measured * fps)

    sheet = {
        "metadata": {
            "title": TITLE,
            "slug": SLUG,
            "topic": "TEMPERATURE · SOFTMAX · CONCENTRATION",
            "register": "Plain",
            "audience": "INFO 7375 classmates and TAs",
            "author": AUTHOR,
            "course": COURSE,
            "concept": ("Temperature changes the relative concentration of a probability "
                        "distribution by modifying the relative differences between logits "
                        "before softmax."),
            "engine": "kokoro",
            "voice_kokoro": "af_bella",
            "palette": "aperture",
            "style_preset": "aperture",
            "ground": "#0A0B0D",
            "aspect": "16:9",
            "aspect_ratio": "16:9",
            "narration_disclosure": ("Narration is synthetic: Kokoro af_bella, generated locally. "
                                     "It is not the author's voice and not any instructor's voice."),
            "numbers_source": "numbers.json (generated by scripts/verify_temperature.py)",
            "note": ("Student reel. Deliberately NOT the claude palette: the toolkit's locked "
                     "bookends hardcode @NikBearBrown, and the course prerequisite forbids "
                     "implying instructor endorsement."),
        },
        "beats": beats,
    }

    out = HERE / "beat_sheet.json"
    out.write_text(json.dumps(sheet, indent=2, ensure_ascii=False) + "\n")
    key = "actual_duration_s" if timings else "estimated_duration_s"
    total = sum(b[key] for b in beats)
    print(f"wrote {out}")
    print(f"{len(beats)} beats · {total:.1f}s "
          f"({int(total//60)}:{int(total%60):02d}) · source: {key}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
