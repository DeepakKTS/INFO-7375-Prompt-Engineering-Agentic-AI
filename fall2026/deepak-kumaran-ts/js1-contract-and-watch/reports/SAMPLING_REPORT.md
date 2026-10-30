# Sampling report (Chapter 1)

Model: ___ · temperature: ___ (as sent) · prompt: prompts/v1.md @ commit 7e76329 · dates run: ___
"Fresh conversation" means: each call is a separate stateless API request with no prior messages.

## Postings chosen and why
Selection rule, fixed before any sampling call: from the 10 development ids in labels/split.json,
take those whose note in labels/labels.csv is `unsure`, then `level`, then `location`, then `work`,
sorted by id within each group, until there are 5. Every development note is `work`, so the rule
picks the 5 lowest development ids.

| # | posting_id | title | why chosen (e.g. borderline) | my hand label |
|---|---|---|---|---|
| 1 | 7983456 | Machine Learning Engineer, Radar | selection rule (note `work`, lowest ids) | relevant |
| 2 | 8144196 | AI Engineer | selection rule (note `work`, lowest ids) | relevant |
| 3 | 8174963 | Staff Security Engineer, Abuse Control | selection rule (note `work`, lowest ids) | relevant |
| 4 | 8175828 | Account Executive, Product Sales - Currency Management | selection rule (note `work`, lowest ids) | not_relevant |
| 5 | 8191708 | Account Executive, Product Sales - Open Issuance | selection rule (note `work`, lowest ids) | not_relevant |

## Every verdict
| posting_id | call 1 | call 2 | call 3 | call 4 | (more) | rejected by validator | agree with hand label |
|---|---|---|---|---|---|---|---|

## Spread
<!-- per posting: k of n agree; any flips; whether citations changed even when the verdict didn't -->

## What I can conclude / what I cannot
<!-- repeatability ≠ correctness; n=4 per posting; one model, one date, one prompt -->
