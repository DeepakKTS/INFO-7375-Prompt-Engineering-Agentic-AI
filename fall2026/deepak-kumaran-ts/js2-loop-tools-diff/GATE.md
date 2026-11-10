# GATE.md: exits, budgets, repeat rule, error policy and permission policy

Job-Search Agent 2, "The Loop, the Tools, and the Diff". Deepak Kumaran T S, INFO 7375, fall 2026.

TODO(Deepak): Status is DRAFT. Edit this file, then delete this line and commit it before any commit that adds or changes a .py file.

Provenance: the first draft was written in a claude.ai chat (Claude Opus 5.5, 2026-11-10) from my plan. My edits: TODO(Deepak) list what you changed, or write "kept as drafted after checking each section against the brief".

Started from: my JS1 agent, "The Contract and the Watch", personal repo commit b91c877 (graded 95/100). Lectern and the Reallocation Engine were not used.

## 1. Exits

Every run ends in exactly one exit. runs/<run-id>/summary.json and the process exit code always agree.

| Exit | Code | When | What it reports |
|---|---|---|---|
| FINISHED | 0 | Every planned board was fetched, validated and diffed within budget. | Per board: posting count, new ids, sha256 of the raw bytes. |
| INCOMPLETE | 3 | The loop visited every planned board, but at least one failed under the error policy. | Which boards failed, the HTTP status or error class, and retries used. |
| BUDGET_EXHAUSTED | 4 | A budget in config/budgets.json was reached before the plan was done. | Which budget, the value reached, and the boards not visited. |
| ERROR | 1 | Corrupt or unreadable state, a policy denial raised by our own code, or an unexpected exception. | The error, the step where it happened, and the fact that state was not updated. |

These rules hold for every exit:
- A board that failed or was not visited is never reported as "0 new". Its count is null and its reason is recorded.
- state/seen.json changes only on FINISHED or INCOMPLETE, only for boards that succeeded, and only through one atomic replace at the end of the run.
- A clean exit is not proof of a right answer. `python -m jobwatch verify runs/<run-id>` is the independent check (section 7).

## 2. Budgets

Values live only in config/budgets.json. The code reads that file and nothing else. There is no command-line override.

| Budget | Value | Counts |
|---|---|---|
| max_boards | 6 | boards planned for one run |
| max_requests | 20 | every HTTP request, retries included |
| max_seconds | 120 | wall-clock seconds from loop start |
| request_timeout_seconds | 10 | per request |
| min_seconds_between_same_host | 1 | spacing between requests to one host |
| max_retries_per_action | 1 | see section 4 |

Arithmetic check: 6 boards with one retry each is 12 requests, under 20. In the worst case, 6 boards that all time out twice need about 6 x (10 + 2 + 10) = 132 s, which exceeds 120 s. That run ends BUDGET_EXHAUSTED by design rather than running long.

Who may change a budget: only Deepak, by adding a dated entry below and committing it with the edited config/budgets.json. A write to config/ needs approval under the permission policy, so the agent cannot change its own budget.

### Budget decisions
- B-1, 2026-11-10, Deepak: initial values above. Reason: three to five boards with one retry each fit inside 20 requests, and 120 s covers timeouts plus backoff for that plan. TODO(Deepak) confirm or change, then delete this marker.

## 3. Repeat rule

An action is identified by:
- a fetch: (tool, method, canonical URL). The canonical URL has a lowercase scheme and host, no default port, sorted query parameters and no fragment.
- a read or write: (tool, resolved real path).

What the loop does:
- The first fetch of an action runs. One retry is allowed only when section 4 permits it.
- Any further identical fetch in the same run is refused, logged as REPEAT in the trace, and the board is marked FAILED with reason "repeat".
- A second write to the same path in one run is refused, except the single atomic state replace at the end.

## 4. Error policy

| Condition | Retry | Board result | Why |
|---|---|---|---|
| HTTP 4xx other than 429 (for example a bad board token returning 404) | none | FAILED | The answer is deterministic. A retry repeats it and spends budget. |
| HTTP 429 | none | FAILED, Retry-After recorded | The host asked us to slow down. Retrying would ignore that. |
| Timeout, connection error, HTTP 5xx | 1, after 2 s | FAILED if the retry also fails | Likely transient. GET is idempotent and reads only public data, so a retry cannot change anything on the server. The retry counts against max_requests. |
| HTTP 200 with a non-JSON content-type or body | 1, after 2 s | FAILED if the retry also fails | Lever's public endpoint has been reported to return HTML intermittently. Same reasoning as a transient error. |
| HTTP 200, JSON, wrong shape | none | FAILED | A retry would return the same shape. |
| HTTP 3xx | none | FAILED, redirect refused | The permission policy forbids following redirects. |
| HTTP 200, JSON, valid shape, zero postings | none | OK with count 0 | Not an error to the loop, but it is the finished-wrong-answer risk. verify flags it (section 7). |
| state/seen.json corrupt or unreadable | none | run exits ERROR before any fetch | Diffing against bad state would report wrong "new" postings. |
| An action that needs approval | none | interactive: ask Deepak y/N; non-interactive: denied and logged | Approval belongs to Deepak. |

Escalation to Deepak: every ERROR exit and every approval request.

The loop never invents a value. A failed board has count null, its error saved, and its raw response bytes saved when there were any.

## 5. Permission policy

Enforced in jobwatch/policy.py, called by every tool in jobwatch/tools.py. Not enforced by any prompt.

Network:
- Method: GET only.
- Scheme and port: https on 443 only. No userinfo in the URL. No IP literals.
- Redirects: refused, never followed.
- Hosts, matched exactly after parsing:

| Host | System |
|---|---|
| boards-api.greenhouse.io | Greenhouse |
| api.lever.co | Lever |
| api.ashbyhq.com | Ashby |
| api.eu.lever.co | Lever EU. TODO(Deepak): keep only if chosen at Gate 0, otherwise delete this row. |

Disk (paths resolved with os.path.realpath, containment checked with os.path.commonpath):
- Read: config/, fixtures/, state/, runs/ inside this folder.
- Write: runs/<run-id>/ only.
- state/seen.json: changed only by the atomic replace at the end of a FINISHED or INCOMPLETE run.

Needs Deepak's approval:
- resetting or overwriting state outside the end-of-run replace
- any delete
- any write to config/

Never, with or without approval:
- apply, email, message or log in anywhere
- any method other than GET
- read the home directory, SSH keys, environment secrets or credentials
- contact any host not in the table above

## 6. Wrong versions the tests must catch

Plausible but wrong implementations. Each needs a test that fails against it. Phase 2 fills the last column.

| ID | Wrong version | Example input it gets wrong | Test that catches it |
|---|---|---|---|
| W01 | Path check with str.startswith | runs-evil/x.json beside runs/ | |
| W02 | Host check by substring or endswith | boards-api.greenhouse.io.evil.com; https://evil.com/boards-api.greenhouse.io | |
| W03 | Host taken from the raw string, not the parsed URL | https://boards-api.greenhouse.io@evil.com/ | |
| W04 | Following redirects | a 302 from an allowed host | |
| W05 | Path check without realpath | a symlink inside runs/ pointing outside | |
| W06 | Failed board counted as 0 new | a 404 board | |
| W07 | Timeout reported as FINISHED | a board that times out twice (SEEDED) | |
| W08 | Retries not counted against max_requests | many boards with 5xx (SEEDED) | |
| W09 | Retrying a 404 | a bad board token | |
| W10 | Lever HTML body parsed as an empty list | an HTML 200 response (SEEDED) | |
| W11 | Empty 200 accepted with no independent check | an empty board that had postings last run | |

## 7. Independent check

`python -m jobwatch verify runs/<run-id>` lives in jobwatch/verify.py and does not import the loop's summary logic. It:
- recomputes every board's count from the saved raw bytes and checks each sha256 against the manifest
- flags SUSPECT when a board had more than 0 postings in the prior run and has 0 now
- flags UNCONFIRMED when a board's first observation is a 200 with 0 postings
- flags INVALID when a saved response is not JSON
- reports a mismatch when its counts differ from summary.json

A second independent check, outside the program, is my own manual curl capture in evidence/manual-capture/.
