#!/usr/bin/env python3
"""
verify_temperature.py — the single source of truth for every number in the video.

INFO 7375 Week 01 · Temperature as a concentration control
Author: Deepak Kumaran Thoppudu Sudharsanan

WHAT THIS DOES

Nothing in the video is typed by hand. This script computes every on-screen value,
proves each one against the course's own recorded evidence, and writes numbers.json,
which the beat sheet and the Remotion scenes read. If a number cannot be verified,
this script exits non-zero and the build stops.

THE FIVE CHECKS

  1. SUM       every distribution sums to 1.0                        (tolerance 1e-12)
  2. RATIO     p_i / p_k == exp((z_i - z_k) / T)                      (tolerance 1e-12)
  3. SHIFT     the max-subtracted form == the direct form             (tolerance 1e-12)
  4. COURSE    our table == research/worked-examples.json["chapters"]["01"]  (EXACT)
  5. DEMO      our T=1.0 row == a live subprocess run of the course main.py (EXACT)

Checks 4 and 5 are the ones that matter. They are what make the claim
"these are the course's numbers" true rather than merely asserted.

PROVENANCE OF THE ALGORITHM

probabilities() and sample() below are reproduced verbatim from the course
reference implementation at:

    lessons/01-randomness-and-first-prompts/code/main.py

They are vendored (not imported) so this script runs standalone from the submission
folder. Check 5 re-runs the real course file as a subprocess and diffs the output, so
the vendored copy cannot silently drift from the original.

USAGE

    python3 scripts/verify_temperature.py
    python3 scripts/verify_temperature.py --course-repo /path/to/course/checkout
    python3 scripts/verify_temperature.py --out src/numbers.json
"""

import argparse
import json
import math
import subprocess
import sys
from collections import Counter
from pathlib import Path
import random

TOL = 1e-12

# ---------------------------------------------------------------------------
# The course inputs. Not our choices — the chapter's.
#
#   logits [1, 2, 3]          chapters/01-randomness-and-first-prompts.md:134
#                             ("Our constructed input is the list [1, 2, 3]")
#   T in {0.5, 1.0, 2.0}      chapters/01-...:206-210 (the printed table)
#                             lessons/01-.../docs/en.md:37 ("at temperatures 0.5 and 2.0")
#   seed 7, count 1000        lessons/01-.../code/main.py:19 (sample() defaults)
# ---------------------------------------------------------------------------
LOGITS = [1, 2, 3]
TEMPERATURES = [0.5, 1.0, 2.0]
SEED = 7
COUNT = 1000
LABELS = ["A", "B", "C"]  # display labels for outcomes 0, 1, 2


# --- vendored verbatim from the course main.py ------------------------------
def probabilities(logits, temperature=1.0):
    if not logits or not math.isfinite(temperature) or temperature <= 0:
        raise ValueError("Need logits and a positive finite temperature")
    if not all(math.isfinite(x) for x in logits):
        raise ValueError("Logits must be finite")
    peak = max(logits)
    weights = [math.exp((x - peak) / temperature) for x in logits]
    total = sum(weights)
    return [weight / total for weight in weights]


def sample(logits, count=1000, seed=7, temperature=1.0):
    if type(count) is not int or count < 0:
        raise ValueError("Count must be nonnegative")
    rng = random.Random(seed)
    return dict(Counter(rng.choices(range(len(logits)),
                                    probabilities(logits, temperature), k=count)))
# --- end vendored -----------------------------------------------------------


def direct_softmax(logits, temperature):
    """The textbook form, WITHOUT max-subtraction: exp(z/T) / sum exp(z/T).

    Used only by check 3, to show the subtraction the course code performs
    changes the intermediate weights but not the resulting distribution.
    Reference: chapters/01-randomness-and-first-prompts.md:156-164.
    """
    weights = [math.exp(x / temperature) for x in logits]
    total = sum(weights)
    return [w / total for w in weights]


class Failure(Exception):
    pass


def check(condition, label, detail):
    if not condition:
        raise Failure(f"{label}: {detail}")
    print(f"  PASS  {label}")


def build_table():
    """Compute every value the video displays."""
    rows = []
    for T in TEMPERATURES:
        p = probabilities(LOGITS, T)
        # shifted scores: what the course implementation actually exponentiates
        peak = max(LOGITS)
        shifted = [x - peak for x in LOGITS]
        divided = [s / T for s in shifted]
        weights = [math.exp(d) for d in divided]
        rows.append({
            "temperature": T,
            "shifted_scores": shifted,
            "divided_scores": divided,
            "weights": weights,
            "weight_total": sum(weights),
            "probabilities": p,
            "percent": [v * 100.0 for v in p],
            # the ratio of the top two outcomes: the mechanism, made visible
            "ratio_top_two": p[2] / p[1],
            "ratio_closed_form": math.exp((LOGITS[2] - LOGITS[1]) / T),
            "counts": {str(k): v for k, v in
                       sorted(sample(LOGITS, COUNT, SEED, T).items())},
        })
    return rows


def run_checks(rows, course_repo):
    print("\nCHECK 1 — every distribution sums to 1")
    for r in rows:
        s = sum(r["probabilities"])
        check(abs(s - 1.0) < TOL, f"T={r['temperature']} sum={s!r}",
              f"deviates from 1 by {abs(s - 1.0)}")

    print("\nCHECK 2 — p_i/p_k == exp((z_i - z_k)/T)   [the ratio law]")
    for r in rows:
        got, want = r["ratio_top_two"], r["ratio_closed_form"]
        check(abs(got - want) < TOL,
              f"T={r['temperature']} ratio={got:.6f}",
              f"computed {got!r} != closed form {want!r}")

    print("\nCHECK 3 — max-subtracted form == direct form")
    for r in rows:
        a, b = r["probabilities"], direct_softmax(LOGITS, r["temperature"])
        worst = max(abs(x - y) for x, y in zip(a, b))
        check(worst < TOL, f"T={r['temperature']} max delta={worst:.2e}",
              f"forms disagree by {worst}")

    print("\nCHECK 4 — our table == the course's recorded worked examples  [THE REAL CHECK]")
    we_path = course_repo / "research" / "worked-examples.json"
    if not we_path.exists():
        raise Failure(f"CHECK 4: course evidence not found at {we_path}")
    recorded = json.loads(we_path.read_text())["chapters"]["01"]
    for r in rows:
        # the course JSON keys temperatures as "0.5", "1", "2"
        key = str(r["temperature"]).rstrip("0").rstrip(".") or "0"
        if key not in recorded:
            raise Failure(f"CHECK 4: no key {key!r} in worked-examples.json")
        ref = recorded[key]
        check(ref["p"] == r["probabilities"],
              f"T={r['temperature']} probabilities match exactly",
              f"\n      ours     {r['probabilities']}\n      course   {ref['p']}")
        ours = {str(k): v for k, v in r["counts"].items()}
        theirs = {str(k): v for k, v in ref["counts"].items()}
        check(ours == theirs,
              f"T={r['temperature']} seeded counts match exactly",
              f"\n      ours     {ours}\n      course   {theirs}")

    print("\nCHECK 5 — live subprocess run of the course main.py")
    main_py = (course_repo / "lessons" / "01-randomness-and-first-prompts"
               / "code" / "main.py")
    if not main_py.exists():
        raise Failure(f"CHECK 5: course main.py not found at {main_py}")
    proc = subprocess.run([sys.executable, str(main_py)],
                          capture_output=True, text=True)
    if proc.returncode != 0:
        raise Failure(f"CHECK 5: main.py exited {proc.returncode}: {proc.stderr}")
    demo = json.loads(proc.stdout)
    baseline = next(r for r in rows if r["temperature"] == 1.0)
    check(demo["probabilities"] == baseline["probabilities"],
          "T=1.0 probabilities match the live demo run",
          f"\n      ours {baseline['probabilities']}\n      demo {demo['probabilities']}")
    demo_counts = {str(k): v for k, v in sorted(demo["counts"].items())}
    check(demo_counts == baseline["counts"],
          "T=1.0 counts match the live demo run",
          f"\n      ours {baseline['counts']}\n      demo {demo_counts}")
    return proc.stdout


def print_table(rows):
    print("\n" + "=" * 78)
    print("TEMPERATURE AS A CONCENTRATION CONTROL")
    print(f"logits {LOGITS}  (outcome scores z)   ·   seed {SEED}   ·   {COUNT} draws")
    print("=" * 78)
    hdr = f"{'T':>5} | " + " | ".join(f"{f'P({l}) z={z}':>12}"
                                      for l, z in zip(LABELS, LOGITS))
    print(hdr + f" | {'P(C)/P(B)':>10}")
    print("-" * 78)
    for r in rows:
        cells = " | ".join(f"{v:>12.10f}" for v in r["probabilities"])
        print(f"{r['temperature']:>5} | {cells} | {r['ratio_top_two']:>10.6f}")
    print("-" * 78)
    print("Lower T  -> more concentrated on the largest score.")
    print("Higher T -> flatter; the smallest score gains probability.")
    print("Ordering never changes. Temperature reshapes concentration, not rank.")
    print("=" * 78)


def main():
    ap = argparse.ArgumentParser()
    here = Path(__file__).resolve().parent.parent
    ap.add_argument("--course-repo", type=Path,
                    default=here.parents[3] / "info-7375-course",
                    help="path to the INFO 7375 course checkout")
    ap.add_argument("--out", type=Path, default=here / "numbers.json")
    args = ap.parse_args()

    course_repo = args.course_repo.resolve()
    print(f"course repo : {course_repo}")
    print(f"output      : {args.out}")

    rows = build_table()
    try:
        demo_stdout = run_checks(rows, course_repo)
    except Failure as e:
        print(f"\nFAILED — {e}", file=sys.stderr)
        print("\nThe build must not proceed. No number in the video may be shown "
              "unless it is verified here.", file=sys.stderr)
        return 1

    print_table(rows)

    payload = {
        "_note": ("GENERATED by scripts/verify_temperature.py. Do not edit by hand. "
                  "Every number displayed in the video is read from this file."),
        "provenance": "COURSE OUTPUT",
        "source": {
            "algorithm": "lessons/01-randomness-and-first-prompts/code/main.py",
            "recorded_evidence": "research/worked-examples.json -> chapters.01",
            "chapter_table": "chapters/01-randomness-and-first-prompts.md:206-210",
            "chapter_section": ("chapters/01-randomness-and-first-prompts.md:192 "
                                "'Temperature is a concentration control, not a fact checker'"),
        },
        "inputs": {"logits": LOGITS, "labels": LABELS,
                   "temperatures": TEMPERATURES, "seed": SEED, "count": COUNT},
        "formula": "p_i = exp(z_i/T) / sum_j exp(z_j/T)",
        "ratio_law": "p_i/p_k = exp((z_i - z_k)/T)",
        "delta_top_two": LOGITS[2] - LOGITS[1],
        "rows": rows,
        "course_demo_stdout": demo_stdout,
        "checks_passed": ["sum", "ratio", "shift-equivalence",
                          "course-worked-examples", "live-demo-subprocess"],
    }
    args.out.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"\nwrote {args.out}")
    print("ALL CHECKS PASSED — these numbers are cleared for the video.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
