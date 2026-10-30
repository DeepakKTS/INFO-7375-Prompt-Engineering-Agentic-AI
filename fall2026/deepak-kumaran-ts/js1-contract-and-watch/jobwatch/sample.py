"""`sample`: the same prompt on the same postings, n separate calls each (CONTRACT.md Interfaces, A7, A8, A13).

Every call is its own request with no prior messages. Postings come from the saved raw response
of --run; nothing is fetched.
"""
import os
from collections import Counter

from jobwatch.errors import OK, REFUSED, Stop
from jobwatch.evidence import SAMPLING_DIR, OutDir, new_stamp_dir, sha256_hex, utc_iso
from jobwatch.inputs import load_resume
from jobwatch.judge import judge_posting, make_client
from jobwatch.labels import SETS, load_split
from jobwatch.postings import posting_document
from jobwatch.prompt import load_prompt
from jobwatch.saved_run import load_saved_run, postings_for


def sample(args, *, client=None, clock):
    if args.n < 1:
        raise Stop(REFUSED, "--n must be at least 1")
    ids = args.posting_ids
    if len(set(ids)) != len(ids):
        raise Stop(REFUSED, "--posting-id repeats an id")
    resume, resume_raw = load_resume(args.resume)
    prompt = load_prompt(args.prompt)
    saved = load_saved_run(args.run)
    jobs = postings_for(saved, ids)
    split = load_split(required=False)
    if split is not None:
        held = [p for p in ids if p in set(split[SETS["held-out"]])]
        if held:
            raise Stop(REFUSED, f"held-out posting(s) refused before the final held-out run: {', '.join(held)}")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise Stop(REFUSED, "sample calls the judge and needs ANTHROPIC_API_KEY")

    client = client or make_client()
    started = clock()
    created_at = utc_iso(started)
    out = OutDir(new_stamp_dir(SAMPLING_DIR, started))
    calls = []
    for pid in ids:
        doc = posting_document(jobs[pid])
        for k in range(1, args.n + 1):
            stem = f"{pid}.{k}"
            judgment = judge_posting(client, prompt, args.model, resume, pid, doc, out, clock, stem=stem)
            out.write_json(f"claude/{stem}.validation.json", judgment)
            calls.append({"posting_id": pid, "k": k, **judgment})

    per_posting = {}
    for pid in ids:
        mine = [c for c in calls if c["posting_id"] == pid]
        per_posting[pid] = {
            "status": dict(Counter(c["status"] for c in mine)),
            "verdict": dict(Counter(c["verdict"] for c in mine if c["status"] == "accepted")),
        }
    results = {
        "kind": "sample",
        "created_at": created_at,
        "run_dir": saved.run_dir,
        "run_id": saved.run_id,
        "raw_path": saved.raw_path,
        "raw_sha256": saved.raw_sha256,
        "resume_path": args.resume,
        "resume_sha256": sha256_hex(resume_raw),
        "prompt_path": prompt.path,
        "prompt_sha256": prompt.sha256,
        "model": args.model,
        "n": args.n,
        "posting_ids": ids,
        "per_posting": per_posting,
        "calls": calls,
    }
    out.write_json("results.json", results)
    print(f"sample: {len(calls)} calls ({len(ids)} postings x {args.n}) written to {out.path.as_posix()}/")
    for pid in ids:
        status = per_posting[pid]["status"]
        print(f"  {pid}: " + ", ".join(f"{s} {status.get(s, 0)}" for s in ("accepted", "rejected", "error")))
    return OK
