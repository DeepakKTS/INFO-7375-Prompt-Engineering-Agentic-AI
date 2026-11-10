# CLAUDE.md: working rules for js2-loop-tools-diff

Read these before any work: private/ASSIGNMENT.md (the brief and rubrics), private/JS1_HANDOFF.md (what JS1 built), private/CLAUDE_CODE_PROMPT.md (the phase plan with gates).

## Scope
- Work only inside this folder.
- JS1 (../js1-contract-and-watch/) is graded (95/100). It is read-only. Never edit, stage or commit anything there.
- No git push, no class-repo action and no PR change unless Deepak types "push" in this session.

## Honesty
- Past tense only for what ran in this session and is on disk.
- Every number in a doc comes from a committed file. Cite the path.
- Label every fixture, mock or simulated run SEEDED in its filename, trace and docs.
- Any Claude output shown in the submission carries the model name and date.
- Never state how an endpoint behaves unless it was captured in evidence/.
- If live behavior differs from the plan, or a step is impossible, say so and stop. Never substitute silently.

## Files and sections Claude never writes
- FRICTIONAL.md (any content at all)
- SIGNOFF.md (all of it, including the driver's seat table)
- The "Expected (Deepak)" column of POLICY.md
- Every section of REVIEW.md that carries Deepak's marker
- The failing test for the review packet
Leave every Deepak marker in place in those files. presubmit_check.sh fails while any remain, which is intended.

## Agent safety, enforced in code
- HTTP GET only, to exact allow-listed hosts, https on port 443, redirects refused.
- All network and disk access goes through jobwatch/tools.py, which calls policy.check() first.
- Paths are contained with os.path.realpath plus os.path.commonpath. Never str.startswith.
- The agent never applies, emails, messages, logs in, or uses any non-GET method.
- Fictional persona only (Riley Okafor, @example.com). No real resume, contacts or tokens.

## Process
- Stop at every GATE in the phase plan and wait for Deepak.
- GATE.md and POLICY.md (with Deepak's predictions) are committed before the first commit that adds or changes a .py file in this folder.
- Commit evidence before writing about it. Small commits, subjects prefixed "js2:".
- Never weaken, skip, xfail or delete a test to get green. Report failures and stop.
- After each phase, append factual lines (ET time, command, exit code, commit hash) to private/SESSION_LOG.md, then print 3 short questions to help Deepak write his FRICTIONAL entry.
