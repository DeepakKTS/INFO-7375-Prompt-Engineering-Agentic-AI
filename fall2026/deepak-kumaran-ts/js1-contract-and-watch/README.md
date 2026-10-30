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

## Map
CONTRACT.md · jobwatch/ · tests/ · evidence/ · state/ · labels/ · prompts/ · reports/ · SOURCES.md · FRICTIONAL.md

## Sign-off — Job-Search Agent 1
Checked:
How:
Not checked:
Not claiming:
Signed or withheld:

## Driver's seat
| part of the task | Claude did | I did | why that part stays mine | evidence (commit / edit / dated quote) |
|---|---|---|---|---|
