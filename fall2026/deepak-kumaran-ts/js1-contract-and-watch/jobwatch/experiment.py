"""`experiment`: score prompts, and the rule as a baseline, against the hand labels of one set.

CONTRACT.md Interfaces › experiment, with Amendments A7 (--run), A8 (output, held-out refusals),
A10 (--prompt-b optional on development), A11 (development reuses saved results) and A12 (counts).
"""
import json
import math
import os
import subprocess
from statistics import NormalDist

from jobwatch.errors import BAD_RULE_VERDICT, OK, REFUSED, Stop
from jobwatch.evidence import EXPERIMENTS_DIR, OutDir, atomic_write, json_bytes, sha256_hex, utc_iso
from jobwatch.inputs import load_resume
from jobwatch.judge import judge_posting, make_client, saved_judgment
from jobwatch.labels import SETS, load_hand_labels, load_split
from jobwatch.postings import posting_document
from jobwatch.prompt import load_prompt
from jobwatch.rule import apply_rule
from jobwatch.saved_run import load_saved_run, postings_for
from jobwatch.validator import Invalid, check_verdict

OUTCOMES = ("accepted_correct", "accepted_wrong", "rejected", "error")
Z95 = NormalDist().inv_cdf(0.975)


def wilson(k, n, z=Z95):
    """The 95% Wilson score interval for k successes in n trials."""
    p = k / n
    d = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / d
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [max(0.0, centre - half), min(1.0, centre + half)]


def outcome(status, verdict, hand_label):
    if status == "accepted":
        return "accepted_correct" if verdict == hand_label else "accepted_wrong"
    return "rejected" if status == "rejected" else "error"


def score(outcomes):
    n = len(outcomes)
    counts = {o: outcomes.count(o) for o in OUTCOMES}
    return {"n": n, "counts": counts, "pass_rate": counts["accepted_correct"] / n,
            "wilson_95": wilson(counts["accepted_correct"], n)}


def _git(*argv):
    return subprocess.run(["git", *argv], capture_output=True, text=True)


def check_committed(prompt_paths):
    """held-out refuses if prompts/ or a prompt file is untracked or has uncommitted changes (A8)."""
    status = _git("status", "--porcelain", "--", "prompts/", *prompt_paths)
    if status.returncode != 0:
        raise Stop(REFUSED, "held-out refused: git status could not check prompts/ for uncommitted changes")
    if status.stdout.strip():
        raise Stop(REFUSED, "held-out refused: prompts/ or a prompt file has uncommitted changes")
    for path in prompt_paths:
        if _git("ls-files", "--error-unmatch", "--", path).returncode != 0:
            raise Stop(REFUSED, f"held-out refused: {path} is not committed")


def _provenance(saved, resume_path, resume_sha, model, ids):
    return {"run_dir": saved.run_dir, "run_id": saved.run_id, "raw_path": saved.raw_path,
            "raw_sha256": saved.raw_sha256, "resume_path": resume_path, "resume_sha256": resume_sha,
            "model": model, "posting_ids": ids}


def _reusable(target, prompt, provenance):
    """The saved results.json of a development target, if it was made from the same inputs (A11)."""
    try:
        previous = json.loads((target / "results.json").read_bytes())
    except (OSError, ValueError):
        raise Stop(REFUSED, f"{target.as_posix()} exists but has no readable results.json; it is incomplete") from None
    same = previous.get("prompt_sha256") == prompt.sha256 and all(
        previous.get(k) == provenance[k] for k in ("raw_sha256", "resume_sha256", "model", "posting_ids")
    )
    if not same:
        raise Stop(REFUSED, f"{target.as_posix()} was made from a different run, résumé, model or set; "
                            "it cannot be reused")
    return previous


def _saved_judgment(target, pid, resume, doc):
    raw_path = (target / "claude" / f"{pid}.response.txt").as_posix()
    judgment = saved_judgment(target, pid, pid, resume, doc, raw_path)
    if judgment is not None:
        return judgment
    try:
        judgment = json.loads((target / "claude" / f"{pid}.validation.json").read_bytes())
    except (OSError, ValueError):
        judgment = None
    if not isinstance(judgment, dict) or judgment.get("status") != "error":
        raise Stop(REFUSED, f"{target.as_posix()}: no saved response or error for posting {pid}")
    return judgment


def experiment(args, *, client=None, clock):
    held_out = args.set == "held-out"
    resume, resume_raw = load_resume(args.resume)
    prompts = [("A", args.prompt_a, load_prompt(args.prompt_a))]
    if args.prompt_b:
        prompts.append(("B", args.prompt_b, load_prompt(args.prompt_b)))
    elif held_out:
        raise Stop(REFUSED, "--set held-out needs both --prompt-a and --prompt-b")
    if len(prompts) == 2 and prompts[0][2].sha256 == prompts[1][2].sha256:
        raise Stop(REFUSED, "--prompt-a and --prompt-b have the same sha256; omit --prompt-b to score one prompt")

    saved = load_saved_run(args.run)
    ids = load_split()[SETS[args.set]]
    if not ids:
        raise Stop(REFUSED, f"labels/split.json has no {args.set} ids")
    labels = load_hand_labels(ids)
    jobs = postings_for(saved, ids)
    docs = {pid: posting_document(jobs[pid]) for pid in ids}
    provenance = _provenance(saved, args.resume, sha256_hex(resume_raw), args.model, ids)

    rule_rows = []
    for pid in ids:
        verdict = apply_rule(resume, jobs[pid])
        try:
            check_verdict(verdict, resume, docs[pid])
        except Invalid as e:
            raise Stop(BAD_RULE_VERDICT, f"the rule produced an invalid verdict for {pid} ({e.reason})") from None
        rule_rows.append({"posting_id": pid, "hand_label": labels[pid], "verdict": verdict["verdict"],
                          "outcome": outcome("accepted", verdict["verdict"], labels[pid])})
    baseline = {**score([r["outcome"] for r in rule_rows]), "postings": rule_rows}

    # Every refusal comes before the first call.
    plan = []
    for name, path, prompt in prompts:
        target = EXPERIMENTS_DIR / args.set / prompt.sha256[:12]
        if target.exists():
            if held_out:
                raise Stop(REFUSED, f"held-out refused: {target.as_posix()} already exists; the held-out set runs once")
            plan.append((name, path, prompt, target, _reusable(target, prompt, provenance)))
        else:
            plan.append((name, path, prompt, target, None))
    if held_out:
        check_committed([path for _, path, _ in prompts])
    if any(previous is None for *_, previous in plan):
        if not os.environ.get("ANTHROPIC_API_KEY"):
            raise Stop(REFUSED, "experiment calls the judge and needs ANTHROPIC_API_KEY")
        client = client or make_client()

    started = utc_iso(clock())
    print(f"experiment {args.set}: {len(ids)} postings from {saved.raw_path}")
    for name, path, prompt, target, previous in plan:
        if previous is None:
            out = OutDir(target)
            judgments = {}
            for pid in ids:
                judgments[pid] = judge_posting(client, prompt, args.model, resume, pid, docs[pid], out, clock)
                out.write_json(f"claude/{pid}.validation.json", judgments[pid])
        else:
            judgments = {pid: _saved_judgment(target, pid, resume, docs[pid]) for pid in ids}
        rows = [{"posting_id": pid, "hand_label": labels[pid], **judgments[pid],
                 "outcome": outcome(judgments[pid]["status"], judgments[pid]["verdict"], labels[pid])}
                for pid in ids]
        result = score([r["outcome"] for r in rows])
        results = {
            "kind": "experiment",
            "set": args.set,
            "created_at": previous["created_at"] if previous else started,
            **({"rescored_at": started} if previous else {}),
            **provenance,
            "prompt_path": prompt.path,
            "prompt_sha256": prompt.sha256,
            **result,
            "postings": rows,
            "baseline_rule": baseline,
        }
        atomic_write(target / "results.json", json_bytes(results))
        how = "re-scored from saved responses" if previous else "called"
        print(f"  {name} {path} (sha256 {prompt.sha256[:12]}, {how}): {_summary(result)}")
        print(f"    {(target / 'results.json').as_posix()}")
    print(f"  rule (record, baseline): {_summary(baseline)}")
    return OK


def _summary(result):
    c, n = result["counts"], result["n"]
    lo, hi = result["wilson_95"]
    return (", ".join(f"{o} {c[o]}" for o in OUTCOMES)
            + f"; pass rate {c['accepted_correct']}/{n} = {result['pass_rate']:.3f}, 95% Wilson [{lo:.3f}, {hi:.3f}]")
