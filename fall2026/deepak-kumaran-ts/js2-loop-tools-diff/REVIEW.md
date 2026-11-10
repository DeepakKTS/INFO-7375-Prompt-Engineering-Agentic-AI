# REVIEW.md: review packet for one Claude Code change

One non-trivial change I asked Claude Code to make, reviewed on evidence (Chapter 6).

## 1. The change I asked for
- Date and time (ET): TODO(Deepak)
- Model: TODO(Deepak)
- Prompt excerpt (my exact words): TODO(Deepak)

## 2. The defect, reproduced before any patch
- Repro command (SEEDED fault injection: the summary.json write raises OSError; fake transport, temp folder): `.venv/bin/python -I evidence/review/SEEDED_repro_state_then_error.py $PWD`, run from js2-loop-tools-diff/. Script and README: `evidence/review/`.
- Output (failing):
  ```
  jobwatch: ERROR: could not write the run record: OSError: SEEDED: disk full
  exit 1 | state/seen.json exists: True | summary.json exists: False
  ```
  The run exited ERROR (1) but state/seen.json had been created, and no summary.json was written. GATE.md section 1: state changes only on FINISHED or INCOMPLETE; on ERROR it reports "the fact that state was not updated"; summary.json and the exit code always agree.
- Commit the repro ran against: f9af923 at Gate 5a (from Claude Code's scratchpad), and again from evidence/review/ at 231bd1f (15:27 ET), with the same output. jobwatch/loop.py is identical at both and up to the test commit 7309446 (`git diff --quiet 9d5f957 7309446 -- jobwatch/loop.py` exit 0). Cause in the code: `Loop.run` replaced state (jobwatch/loop.py:269 at 7309446) before `_finish` wrote the run record (:385-389), and `_finish` returned ERROR at :392 when that write failed.

## 3. My test, written before the patch
- Test name and file: `test_error_exit_does_not_create_state` and `test_error_exit_leaves_existing_state_byte_identical`, in `tests/js2/test_review_state_on_error.py`.
- Commit hash (must be earlier than the patch commit): 7309446 (15:40 ET), the parent of the patch commit 3a4c1fb. An earlier commit, 49ce61d (15:37 ET), held only an outline.
- Written by: TODO(Deepak) confirm you wrote it, and say what help, if any, you had.
- Output against the unpatched code (red): `evidence/review/red-before-patch.txt`, committed in 7309446: `2 failed in 0.33s`. Both failures are on the state assertions: `assert (wd / "state" / "seen.json").exists() is False` (True) and `assert seen.read_bytes() == before` (the run id inside the file changed from 20261110T200000Z to 20261110T200500Z). Claude Code reran the file at 7309446 before patching: `2 failed in 0.30s`, the same two tests.

## 4. The diff, read as a change in behavior
- Patch commit hash: 3a4c1fb (15:41 ET), written by Claude Code (Claude Opus 5.5).
- `git diff 7309446..3a4c1fb --stat`:
  ```
   .../js2-loop-tools-diff/jobwatch/loop.py           | 25 +++++++++++++---------
   1 file changed, 15 insertions(+), 10 deletions(-)
  ```
- Full diff:
  ```diff
  diff --git a/fall2026/deepak-kumaran-ts/js2-loop-tools-diff/jobwatch/loop.py b/fall2026/deepak-kumaran-ts/js2-loop-tools-diff/jobwatch/loop.py
  index 513e4ad..021a1fa 100644
  --- a/fall2026/deepak-kumaran-ts/js2-loop-tools-diff/jobwatch/loop.py
  +++ b/fall2026/deepak-kumaran-ts/js2-loop-tools-diff/jobwatch/loop.py
  @@ -263,15 +263,7 @@ class Loop:
           self.context = {}
   
           status = decide_exit(self.results, budget_hit, error)
  -        state_updated = False
  -        if status in (FINISHED, INCOMPLETE):
  -            try:
  -                self._commit_state(state_doc, status)
  -                state_updated = True
  -            except Exception as e:
  -                error = {"error": f"state write failed: {type(e).__name__}: {e}", "step": "state replace"}
  -                status = ERROR
  -        return self._finish(status, error, budget_hit, unvisited, budgets, state_raw, state_updated)
  +        return self._finish(status, error, budget_hit, unvisited, budgets, state_raw, state_doc)
   
       def _visit(self, board, budgets, budget, last_at, state_doc, resume):
           key = board_key(board)
  @@ -354,8 +346,11 @@ class Loop:
           self.policy.arm_state_commit(status)
           self.tools.write_file(STATE_PATH, json_bytes(doc))
   
  -    def _finish(self, status, error, budget_hit, unvisited, budgets, state_raw, state_updated):
  +    def _finish(self, status, error, budget_hit, unvisited, budgets, state_raw, state_doc):
           code = EXIT_CODES[status]
  +        # GATE.md section 1: state changes only on FINISHED or INCOMPLETE. The replace runs below,
  +        # only after the run record is written, so a failed record write leaves state untouched.
  +        state_updated = status in (FINISHED, INCOMPLETE)
           failed = [r["key"] for r in self.results if r["status"] != "OK"]
           if error is not None:
               cause = f"{error['error']} (step: {error['step']})"
  @@ -390,6 +385,16 @@ class Loop:
           except Exception as e:
               print(f"jobwatch: ERROR: could not write the run record: {type(e).__name__}: {e}", file=sys.stderr)
               return EXIT_CODES[ERROR]
  +        if state_updated:
  +            try:
  +                self._commit_state(state_doc, status)
  +            except Exception as e:
  +                error = {"error": f"state write failed: {type(e).__name__}: {e}", "step": "state replace"}
  +                summary.update(exit=ERROR, exit_code=EXIT_CODES[ERROR], needs_deepak=True, state_updated=False,
  +                               error=error, cause=f"{error['error']} (step: state replace)")
  +                self.tools.write_file(f"{self.run_dir}/summary.json", json_bytes(summary))
  +                print(f"jobwatch: ERROR: {summary['cause']}", file=sys.stderr)
  +                return EXIT_CODES[ERROR]
           if code != 0:
               print(f"jobwatch: {status}: {cause}", file=sys.stderr)
           else:
  ```
- Hunk by hunk, behavior before and after:
  1. `Loop.run` (@@ -263): before, run() replaced state/seen.json for FINISHED or INCOMPLETE before the run record existed, and turned a failed state write into ERROR. After, run() only decides the exit and passes the new state document to `_finish`; it writes nothing.
  2. `_finish` signature (@@ -354): before, `_finish` received `state_updated`, already true when state had been written. After, it receives `state_doc` and sets `state_updated` from the exit (FINISHED or INCOMPLETE). summary.json records that intended outcome, and the write follows in hunk 3.
  3. After the run-record write (@@ -390): before, nothing ran after manifest.json, summary.json and trace.md were written. After, the state replace runs only once all three are written. If the record write fails, `_finish` returns ERROR at the existing line before this point, and state is not touched: this is the fix the two tests check. If the replace itself fails, summary.json is written again with exit ERROR, exit_code 1, state_updated false, needs_deepak true and the error; one stderr line is printed and 1 is returned. Before the patch, a failed state write also ended with an ERROR summary, so this keeps that behavior.
  Two side effects of the new order:
  - In trace.jsonl the state/seen.json write line now comes after the manifest, summary and trace.md lines.
  - trace.md no longer lists the state write, because trace.md is rendered before it. In the pre-patch run `runs/20261110T200748Z/trace.md` it is row 19.
- After the patch: `tests/js2/test_review_state_on_error.py` 2 passed (`evidence/review/green-after-patch-20261110T204159Z.txt`). The full suite gave 444 passed (`evidence/review/full-suite-after-patch-20261110T204159Z.txt`). Both runs were by Claude Code.

## 5. Scope
- Files I expected the patch to touch: jobwatch/loop.py only.
- Files it actually touched: jobwatch/loop.py only (1 file changed, 15 insertions, 10 deletions; stat above).
- Anything outside the requested change:
  - The summary.json rewrite when the state replace fails (hunk 3, second half) is more than the two tests need. It is there so that the new order does not leave summary.json saying FINISHED next to exit code 1 when the state write fails. No test in the suite covers it. A SEEDED check run by Claude Code after the patch covers it: `evidence/review/SEEDED_check_state_replace_failure.py`, output `evidence/review/SEEDED_check_state_replace_failure-output.txt`, which shows exit 1, no state file, and summary.json exit ERROR.
  - The trace order change described in section 4.

Windows that remain after the patch (facts from the code at 3a4c1fb and the SEEDED check):
- (a) If the state replace fails after the run record is written, summary.json is rewritten to ERROR, but trace.md and the trace.jsonl "exit" line still carry the first exit. The SEEDED check output shows `trace.md line 3: Exit: **FINISHED** (code 0)` next to `summary exit: ERROR 1`.
- (b) If that summary.json rewrite also fails, its exception is not caught. summary.json then still says FINISHED or INCOMPLETE with state_updated true, while state is unchanged.
- (c) If the process stops between the summary.json write and the state replace (killed, or a KeyboardInterrupt, which `except Exception` does not catch; Gate 5a candidate 3), summary.json says state_updated true and state is unchanged.
- In all three, state/seen.json itself is either the old file or the new one, never a partial file, because tools.write_file writes a temp file and then calls os.replace. (b) and (c) are not tested.

## 6. Commands I ran myself
TODO(Deepak): paste each command with its ET time and output. At minimum: the red test before the patch, the full pytest after, and the git diff.

## 7. Decision
TODO(Deepak): Accept, Revise or Reject, and the evidence that decided it. If Revise, what changed and the new commit hash.

## 8. A case my test would still miss
TODO(Deepak): one concrete input or condition the test does not cover, and why.
