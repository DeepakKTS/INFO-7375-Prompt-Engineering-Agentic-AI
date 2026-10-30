# SOURCES

## Used
- Greenhouse Job Board API docs: https://developers.greenhouse.io/job-board.html
- Python 3.__, anthropic __, jsonschema __, pytest __ (exact versions in requirements.txt)

## Written by me
<!-- CONTRACT.md sections, the rule, wrong versions, failure sentence, acceptance tests,
labeling rule, all 20 hand labels, reports' conclusions, FRICTIONAL.md, sign-off -->
- The rule, wrong versions and failure sentence: my decisions, drafted with Claude in chat on
  2026-10-29, then reviewed, edited and adopted by me; edited for clarity by Claude Code in session
  on 2026-10-29.
- Acceptance cases 9, 10, 13: cases and expected verdicts drafted with Claude (chat), hand-checked
  and adopted by me on 2026-10-29; test code typed by Claude Code from my answers.
- CONTRACT.md report.json shape, run_id, manifest fields, state file, prompt file format and Order
  step 2b; the citable posting document and the report counts' definitions; the persona's targets;
  the Wrong versions' demo lines; the widened case 10: drafted with
  Claude in chat on 2026-10-29, reviewed and adopted by me; written into CONTRACT.md,
  examples/persona_resume.json and ACCEPTANCE_CASES.md by Claude Code in session on 2026-10-29.

## Contributed by Claude
- Claude (claude.ai chat, 2026-10-27): planning checklist; folder scaffold and report templates;
  CLAUDE.md working rules; fictional persona résumé; scripts/presubmit_check.sh;
  first drafts of CONTRACT.md In / Out / Refuses.
- Claude (claude.ai chat, 2026-10-29): revised In / Out / Refuses and added Order of
  operations, Run labels and Interfaces, answering Claude Code's planning questions; acceptance cases 16 and 17;
  the whole-word matching definition used in The rule; tests/conftest.py (test fakes
  that fix the seam's duck types).
- Claude Code (2026-10-29/30): tests/spec/, written from my ACCEPTANCE_CASES.md before any implementation.
- Claude Code (dates): <!-- what it implemented, which suggestions you rejected -->
- Claude API as the judge under test (model, dates): responses saved under evidence/.
