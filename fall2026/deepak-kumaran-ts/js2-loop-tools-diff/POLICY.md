# POLICY.md: permission policy and boundary tests

The full policy is in GATE.md, section 5. It is enforced in jobwatch/policy.py, and every tool in jobwatch/tools.py calls policy.check() before it touches the network or disk.

## How to read the table

- Expected (Deepak): my prediction, written and committed before the tests ran. One of ALLOW, DENY or NEEDS_APPROVAL, plus a few words of reason.
- Actual (pytest): filled from real pytest output after the run.
- A mismatch between Expected and Actual is reported, not edited away. If my prediction was wrong, I say so in FRICTIONAL.md.

TODO(Deepak): fill every Expected cell, then commit this file together with GATE.md before any code commit.

## Boundary cases

| ID | Request | Kind | Expected (Deepak) | Actual (pytest) | Test |
|---|---|---|---|---|---|
| B01 | GET https://example.com/x | fetch | TODO(Deepak) | | test_B01_off_allowlist_host |
| B02 | GET https://boards-api.greenhouse.io.evil.com/v1/boards/stripe/jobs | fetch | TODO(Deepak) | | test_B02_suffix_trick_host |
| B03 | GET https://boards-api.greenhouse.io@evil.com/ | fetch | TODO(Deepak) | | test_B03_userinfo_trick |
| B04 | GET http://boards-api.greenhouse.io/v1/boards/stripe/jobs | fetch | TODO(Deepak) | | test_B04_plain_http |
| B05 | POST https://api.lever.co/v0/postings/x | fetch | TODO(Deepak) | | test_B05_post_to_allowed_host |
| B06 | an allowed host answers 302 (mock transport, SEEDED) | fetch | TODO(Deepak) | | test_B06_redirect_refused |
| B07 | write runs/../outside.txt | write | TODO(Deepak) | | test_B07_dotdot_escape |
| B08 | write runs-evil/x.json beside runs/ | write | TODO(Deepak) | | test_B08_prefix_trick |
| B09 | write through a symlink in runs/ that points outside the folder | write | TODO(Deepak) | | test_B09_symlink_escape |
| B10 | write /tmp/x.json | write | TODO(Deepak) | | test_B10_absolute_path |
| B11 | read config/boards.json | read | TODO(Deepak) | | test_B11_read_config |
| B12 | write config/boards.json | write | TODO(Deepak) | | test_B12_write_config |
| B13 | reset state/seen.json in non-interactive mode | write | TODO(Deepak) | | test_B13_state_reset_noninteractive |
| B14 | read ~/.ssh/id_rsa | read | TODO(Deepak) | | test_B14_read_home_secret |
| B15 | GET https://api.ashbyhq.com:8443/posting-api/job-board/x | fetch | TODO(Deepak) | | test_B15_nonstandard_port |
