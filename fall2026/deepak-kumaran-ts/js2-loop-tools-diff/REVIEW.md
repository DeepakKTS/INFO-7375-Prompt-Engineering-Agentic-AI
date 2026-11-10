# REVIEW.md: review packet for one Claude Code change

One non-trivial change I asked Claude Code to make, reviewed on evidence (Chapter 6).

## 1. The change I asked for
- Date and time (ET): TODO(Deepak)
- Model: TODO(Deepak)
- Prompt excerpt (my exact words): TODO(Deepak)

## 2. The defect, reproduced before any patch
- Repro command:
- Output (failing):
- Commit the repro ran against:

## 3. My test, written before the patch
- Test name and file:
- Commit hash (must be earlier than the patch commit):
- Written by: TODO(Deepak) confirm you wrote it, and say what help, if any, you had.
- Output against the unpatched code (red):

## 4. The diff, read as a change in behavior
- Patch commit hash:
- `git diff <test-commit>..<patch-commit> --stat`:
- Full diff:
- Hunk by hunk, behavior before and after:

## 5. Scope
- Files I expected the patch to touch:
- Files it actually touched:
- Anything outside the requested change:

## 6. Commands I ran myself
TODO(Deepak): paste each command with its ET time and output. At minimum: the red test before the patch, the full pytest after, and the git diff.

## 7. Decision
TODO(Deepak): Accept, Revise or Reject, and the evidence that decided it. If Revise, what changed and the new commit hash.

## 8. A case my test would still miss
TODO(Deepak): one concrete input or condition the test does not cover, and why.
