---
"@dzup-ui/contracts": patch
---

**A failed screen-reader run is no longer published as a pass, and risk tiers now say which AT pairings they owe.**

The manual assistive-technology matrix resolved a component's evidence cell by
counting run records whose `result` was not `unrun` and **never reading the
value**. A component whose every AT/browser pairing a human had recorded as
`fail` therefore published `state: 'pass'`. So did an all-`blocked` run, and so
did one pairing out of six. The defect was measured — not theorised — in
TASK-N1-O4 §6.2, and it was latent only because 0 of 534 cells had ever been
executed: the first honest screen-reader session in this repository's history
would have been published as a clean pass.

It is fixed at the source. The evidence vocabulary gained a `fail` state, and
resolution moved into one pure function with a rule that never resolves upward:
any recorded `fail` or `partial` makes the cell `fail`; a `blocked` run makes it
`present`; `pass` requires every task to have passed on every pairing the
component's tier requires. A failure outranks staleness too — a failure that has
not been re-run against newer code is still a failure, and demoting it to the
neutral-reading `stale` would launder it exactly as `pass` did.

**New in `@dzup-ui/contracts`:** `TIER_AT_PAIR_INCREMENT` and
`requiredAtPairs(tier)` — which AT/browser pairings a risk tier requires,
accumulated from Tier A upward so that Tier D ⊇ Tier C ⊇ Tier B is a property of
the data rather than a rule to remember. Tier B owes NVDA + Firefox; Tier C adds
JAWS + Chrome and VoiceOver + Safari; Tier D owes all six. Previously there was
no differentiation at all, so the one component in the catalog whose primary job
is a data boundary owed exactly what a badge owed.

**This narrows nothing.** The scaffold still carries a row for all six pairings
on all 89 Tier B–D components — 534 cells, unchanged — because an unrun cell has
to stay visible. The tier table only says which cells hold a component's evidence
state hostage, and both numbers are always reported together.

Run records also gained a `task` column, so a result can finally say which of the
component's tasks it is evidence about; the scaffold had instructed testers to
"append one row per {task, pair}" since the day it shipped, with no column to put
one in.
