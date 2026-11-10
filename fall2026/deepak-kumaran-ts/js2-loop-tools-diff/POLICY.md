# POLICY.md: permission policy and boundary tests

The full policy is in GATE.md, section 5. It is enforced in jobwatch/policy.py, and every tool in jobwatch/tools.py calls policy.check() before it touches the network or disk.

## How to read the table

- Expected (Deepak): my prediction, written and committed before the tests ran. One of ALLOW, DENY or NEEDS_APPROVAL, plus a few words of reason.
- Actual (pytest): filled from real pytest output after the run.
- A mismatch between Expected and Actual is reported, not edited away. If my prediction was wrong, I say so in FRICTIONAL.md.
- B05: no tool can send POST, so B05 is tested by calling policy.check(method="POST", ...) directly.
- B06: no real 3xx appeared in evidence/manual-capture/CAPTURE.md, so B06 uses a SEEDED mock transport.


## Boundary cases

| ID | Request | Kind | Expected (Deepak) | Actual (pytest) | Test |
|---|---|---|---|---|---|
| B01 | GET https://example.com/x | fetch | DENY — Host is not allowlisted. | | test_B01_off_allowlist_host |
| B02 | GET https://boards-api.greenhouse.io.evil.com/v1/boards/stripe/jobs | fetch | DENY — Hostname suffix does not match the trusted domain. | | test_B02_suffix_trick_host |
| B03 | GET https://boards-api.greenhouse.io@evil.com/ | fetch | DENY — Userinfo confusion; actual destination is evil.com. | | test_B03_userinfo_trick |
| B04 | GET http://boards-api.greenhouse.io/v1/boards/stripe/jobs | fetch | DENY — Plain HTTP is not permitted. | | test_B04_plain_http |
| B05 | POST https://api.lever.co/v0/postings/x (via policy.check) | fetch | DENY — POST is not an approved fetch method. | | test_B05_post_to_allowed_host |
| B06 | an allowed host answers 302 (SEEDED mock transport) | fetch | DENY — Redirects are not trusted; destination must be revalidated. | | test_B06_redirect_refused |
| B07 | write runs/../outside.txt | write | DENY — Path traversal escapes the permitted directory. | | test_B07_dotdot_escape |
| B08 | write runs-evil/x.json beside runs/ | write | DENY — Sibling directory is outside the runs/ boundary. | | test_B08_prefix_trick |
| B09 | write through a symlink in runs/ that points outside the folder | write | DENY — Symlink resolves outside the JS2 folder. | | test_B09_symlink_escape |
| B10 | write /tmp/x.json | write | DENY — Resolved /private/tmp path is outside the JS2 folder. | | test_B10_absolute_path |
| B11 | read config/boards.json | read | DENY — Configuration read is not covered by the verification exception. | | test_B11_read_config |
| B12 | write config/boards.json, non-interactive | write | NEEDS_APPROVAL — Protected configuration write in non-interactive mode. | | test_B12_write_config |
| B13 | reset state/seen.json, non-interactive | write | NEEDS_APPROVAL — Destructive state reset in non-interactive mode. | | test_B13_state_reset_noninteractive |
| B14 | read ~/.ssh/id_rsa | read | DENY — Private SSH key is sensitive credential material. | | test_B14_read_home_secret |
| B15 | GET https://api.ashbyhq.com:8443/posting-api/job-board/x | fetch | DENY — Non-standard port 8443 is not allowlisted. | | test_B15_nonstandard_port |
| B16 | GET https://203.0.113.10/v1/boards/stripe/jobs | fetch | DENY — IP-literal destination bypasses hostname-based trust matching. | | test_B16_ip_literal |
