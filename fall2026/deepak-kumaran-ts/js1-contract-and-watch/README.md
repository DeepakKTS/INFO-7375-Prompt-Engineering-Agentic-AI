# Job-Search Agent 1: The Contract and the Watch

Language: Python 3.__ · Toolchain: <!-- python version, pip, the pinned deps --> · OS tested: ___

## From a fresh clone
```
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m pytest -q                                   # offline, no key needed
python -m jobwatch replay evidence/runs/<run-2-id>    # reproduces the reported run 2 offline, no key
```
Live run (network to boards-api.greenhouse.io only; key optional):
```
python -m jobwatch run --board <token> --resume examples/persona_resume.json
```

## What ran
| run | date (UTC) | kind | raw response | new postings |
|---|---|---|---|---|
| run 1 | 2026-10-30 02:58:37 UTC (2026-10-29 22:58 ET) | baseline, live | evidence/raw/20261030T025837Z_stripe.raw | 0 new. Produced by the code at e379a02; evidence committed in 61ec8b9. |
| run 2 | 2026-10-30 19:51:22 UTC (2026-10-30 15:51 ET); same UTC date as run 1 (2026-10-30), different ET date | live (state from run 1), judge claude-cli, prompts/v1.md | evidence/raw/20261030T195122Z_stripe.raw | 20 new: 17 agree, 0 disagree, 3 rejected (value_not_found). Evidence in 2453cf3; replay exit 0. |

## Map
CONTRACT.md · jobwatch/ · tests/ · evidence/ · state/ · labels/ · prompts/ · reports/ · SOURCES.md · FRICTIONAL.md

## Implementation choices not stated in CONTRACT.md
Made by Claude Code while implementing `run` (2026-10-29); the ones that changed the contract are Amendments A1–A6.
- Exit codes: a body that isn't `{"jobs": [...]}` and an unreadable `--from-file` exit 1; argument errors and unknown subcommands exit 2.
- `skipped_bad_id` lists a job entry that isn't a JSON object as `null`.
- `report.json` names the body's origin with `source`, `from_file` and `from_file_sha256` (the manifest's key names).
- Judgment fields:
  - `model` is the model the response names.
  - On `accepted`, `reason` is Claude's own reason text.
  - `citations`, `model`, `called_at` and `raw_path` are null wherever the status doesn't fill them.
  - On an API error, no response text exists, so `raw_path` is null.
- API error types: `api_error:` + `timeout`, `rate_limit`, `auth`, `5xx`, `connection`, `http_<code>` or `other`.
- Validator reason names: `not_json`, `duplicate_key`, `not_object`, `extra_keys`, `missing_keys`, `posting_id_not_string`, `posting_id_mismatch`, `bad_verdict`, `reason_not_string`, `reason_too_long`, `citations_not_list`, `citation_malformed`, `citation_bad_source`, `path_unresolved`, `path_not_text`, `value_empty`, `value_not_found`, `no_resume_citation`, `no_posting_citation`, plus `truncated`.
- Claude's output:
  - Whitespace around the JSON object is accepted.
  - NaN/Infinity and duplicate keys are rejected.
  - A citation must have exactly the keys `source`, `path` and `value`.
- Prompt file:
  - Only blank lines may come before the first `##` section.
  - A placeholder in the System section is refused.
  - Both sections are trimmed.
  - Placeholders are filled in one pass, so filled-in text is never re-scanned; the JSON is filled with `indent=2` and `ensure_ascii=False`.
  - The default `--prompt` is `prompts/v1.md`.
  - An empty `ANTHROPIC_API_KEY` counts as unset.
- Résumé checks run in this order: schema, then a token check on every target term, then privacy. Privacy scans string values only, not keys.
- Phone detection catches:
  - numbers written with a leading `+`;
  - 10- or 11-digit North American numbers, in any separator style;
  - 7-digit numbers with a separator.

  Dates such as `2023-01-15` are not treated as phone numbers.
- Board requests send a `User-Agent: jobwatch/1 (INFO 7375 coursework; read-only)` header.
- The case 14 test imports the matcher as `jobwatch.textmatch.whole_word_match`.
- The layout of `report.txt` is my own. Its header says a JUDGMENT is a model's output, not a fact.

Made by Claude Code while implementing `replay`, `sample`, `experiment` and `labels/make_split.py` (2026-10-30); the ones that changed the contract are Amendments A7–A13.
- `sample`, and `experiment` whenever it needs to call the judge, exit 2 without `ANTHROPIC_API_KEY`.
- A saved raw response whose sha256 differs from its manifest exits 2 in `sample` and `experiment`; in `replay`, every failure, sha256 mismatches included, exits 1.
- `sample` names each call's files `claude/<id>.<k>.*` (k = 1 to n); the validator result is `<stem>.validation.json`, holding the judgment object (status, reason, verdict, citations, model, called_at, raw_path).
- `held-out` runs `git status --porcelain -- prompts/ <prompt files>` and `git ls-files --error-unmatch` on each prompt file, and refuses if either finds anything or git itself fails (for example, outside a repository).
- The Wilson interval uses z = `NormalDist().inv_cdf(0.975)` (about 1.95996).
- `make_split.py` sorts the ids numerically, takes `random.Random(seed).sample(ids, 10)` (sorted) as development and the rest as held-out; it refuses to replace an existing `split.json` that differs, and leaves an identical one alone.
- `replay` takes `generated_at`, and an `error` judgment's `reason` and `called_at`, from the saved report.json, because nothing else records them; it also checks each saved `request.json` against one rebuilt from the prompt, and that the saved Claude files are for exactly the new ids.

## Sign-off — Job-Search Agent 1
Checked:
How:
Not checked:
- That the CLI replaced its default system prompt; inferred only from about 3.3k input tokens per call.
Not claiming:
Signed or withheld:

## Driver's seat
| part of the task | Claude did | I did | why that part stays mine | evidence (commit / edit / dated quote) |
|---|---|---|---|---|
