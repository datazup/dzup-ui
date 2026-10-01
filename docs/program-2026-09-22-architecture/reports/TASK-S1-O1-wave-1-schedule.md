# TASK-S1-O1 — wave-1 schedule, the costed 1.0 options, and what a tester needs

> **Programme:** [2026-09-22 architecture](../README.md) · **Task:** TASK-S1-O1, phase 2
> **Measured at** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`. Every number in this
> document was counted at that commit from `e2e/at-matrix/index.json` and the
> quality matrix, not carried forward from a ledger — §7 lists the three
> inherited figures that did **not** survive re-measurement.
>
> **Status: `[!]` blocked on one decision, and it is a name.** Everything
> mechanical is built, green and proved. What is missing is a person with a
> screen reader and a date in a calendar.
>
> **Predecessors — cited, not re-derived.** The pairing vocabulary and the C9
> analysis are [`at-pairing-decision-packet.md`](../../program-2026-09-04/reports/at-pairing-decision-packet.md);
> the per-component order, the recording rules and decisions D112–D115 are
> [`TASK-R2-O2-wave-1-runbook.md`](../../program-2026-09-04/reports/TASK-R2-O2-wave-1-runbook.md).
> This document adds what those two could not: the **ingest path** (built by this
> task — [`../../qa/at-run-record.md`](../../qa/at-run-record.md)), the **costs
> re-measured at HEAD**, and **calendar** time beside tester-hours.

---

## 0. The state, in four numbers

| | |
|---|---|
| AT cells | **534** (89 Tier B–D components × 6 pairings) |
| Executed | **0** — verified by grep at `4e4e46f`, not read from a ledger |
| Required by the tier ladder | **136** (B 67 × 1 · C 21 × 3 · D 1 × 6) |
| Required and executed | **0** |

Nothing here is a deficiency of the machinery. Scripts: **22 of 22** Tier C/D
components, **124** steps, every story id resolving against 1,648 built
stories, `validate:at-scripts` **exit 0**. Scaffold: 89 files, schema 1.1.0,
`validate:at-matrix` **exit 0**. Resolver: an all-`fail` run resolves to `fail`,
proved by seeded regression. Ingest: `yarn at:ingest`, 53 refusal tests, proved
end to end against a scratch copy of the matrix. Archive gate:
`yarn validate:at-runs`, link 57 of `validate:all`.

**An agent has never written and will never write a result cell here**
(`<evidence_rules>`; README §8). That is why the number is 0 and why it is
trustworthy.

---

## 1. Wave 1 — the 44 cells, named

**`nvda-firefox` + `jaws-chrome` across the 22 Tier C/D components.**
44 cells · 248 step-runs · **20.6 tester-hours**.

### 1a. Why these 44 and not another 44

Four reasons, in the order they decided it:

1. **Tier, not popularity.** Tier C is where the catalog's composite, stateful
   widgets live — the ones with a popup, a collection and a value, where the
   pairings actually disagree. Tier D is the one component whose failure is a
   data-boundary failure. Tier B's 67 components are single widgets asking a
   simpler question ("are name, role and state announced"), and 55 Tier A
   components are excluded from the scaffold by design.
2. **Both pairings are *required* at Tier C and D**, from
   `requiredAtPairs()` in `@dzup-ui/contracts`. A cell that does not gate
   qualification is worth running and is not worth running *first*.
3. **They are the two that disagree most.** NVDA reads the tree you authored;
   JAWS reads the tree it thinks you meant. Running both on the same component
   in the same sitting is the cheapest way to tell an authoring defect from an
   AT heuristic.
4. **Windows only.** No Mac, no iPhone, no Android device. This is the largest
   single reason to start here: wave 1 needs one machine that most testers
   already have, and it is a **strict subset of every 1.0 option in §2** — so
   running it commits the project to nothing.

### 1b. The run order — Tier D first, then by shared pattern

Measured at `4e4e46f`. Estimate model: 3 min setup per cell + 4 min per
step-run + 10 % for defect write-ups.

| # | Component | Tier | APG | Tasks | Steps | wave-1 step-runs | Est. |
|---|---|---|---|---|---|---|---|
| 1 | `DzFileUpload` | **D** | `button` | reach, activate, non-drag, error | 4 | 8 | 41 min |
| 2 | `DzCombobox` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 77 min |
| 3 | `DzMultiSelect` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 77 min |
| 4 | `DzCascader` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 77 min |
| 5 | `DzTreeSelect` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 77 min |
| 6 | `DzMention` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 77 min |
| 7 | `DzDatePicker` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error | 7 | 14 | 68 min |
| 8 | `DzDateRangePicker` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error | 7 | 14 | 68 min |
| 9 | `DzTimePicker` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error | 7 | 14 | 68 min |
| 10 | `DzCommandPalette` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, live | 7 | 14 | 68 min |
| 11 | `DzDataGrid` | C | `grid` | reach, navigate, select, live | 4 | 8 | 41 min |
| 12 | `DzCalendar` | C | `grid` | reach, navigate, select, live | 4 | 8 | 41 min |
| 13 | `DzTable` | C | `table` | reach, navigate, non-drag, live | 4 | 8 | 41 min |
| 14 | `DzOrderList` | C | `listbox` | reach, navigate, typeahead, select, non-drag, live | 6 | 12 | 59 min |
| 15 | `DzTransfer` | C | `listbox` | reach, navigate, typeahead, select, live | 5 | 10 | 50 min |
| 16 | `DzPersonaSelector` | C | `listbox` | reach, navigate, typeahead, select, live | 5 | 10 | 50 min |
| 17 | `DzTree` | C | `treeview` | reach, navigate, select, typeahead, live | 5 | 10 | 50 min |
| 18 | `DzMegaMenu` | C | `menubar` | reach, navigate, open, activate, dismiss, live | 6 | 12 | 59 min |
| 19 | `DzSidebar` | C | `landmarks` | reach, navigate, activate, live | 4 | 8 | 41 min |
| 20 | `DzTour` | C | `dialog` | open, reach, dismiss, live | 4 | 8 | 41 min |
| 21 | `DzDataView` | C | `custom` | reach, activate, live | 3 | 6 | 32 min |
| 22 | `DzColorPicker` | C | `custom` | reach, activate | 2 | 4 | 23 min |
| | | | | **124** | **248** | | **20.6 h** |

**Nine of the 22 are APG `combobox` (rows 2–10). Run them consecutively.** The
announcement contract is identical, so the second is faster than the first, and
a defect in the shared listbox/popup plumbing arrives as the same note nine
times rather than nine unrelated notes — which is the difference between one
fix and nine tickets.

`DzFileUpload` is first because it is the only Tier D component in the catalog
and the only one whose mis-announcement is a security finding rather than an
inconvenience.

### 1c. Calendar time — the number that actually schedules

Tester-hours are not calendar days. Screen-reader listening is fatiguing and
six productive hours a day is a realistic ceiling; JAWS in demo mode reboots
every 40 minutes, which fits the 23–77-minute components badly.

| Arrangement | Wave 1 (20.6 h) lands in |
|---|---|
| Dedicated tester, full days | **~4 working days ≈ 1 calendar week** |
| One day a week | **~4 calendar weeks** |
| Four hours a week | **~6 calendar weeks** |
| External contractor, booked block | **~3 days + 1–2 weeks lead time** |

Plan against the arrangement, not the hours. The failure mode this table exists
to prevent is "21 hours" being heard as "three days" and then taking a quarter.

---

## 2. The honest 1.0 options, costed at HEAD

**The claim is the deliverable here, not the hours.** Overclaiming is the real
risk: the European Accessibility Act has made screen-reader evidence a
procurement gate, and a 1.0 that says "WCAG AA" over 534 unrun cells is a
statement that cannot be retracted once a buyer has relied on it.

README §7 item 4 names **three** options. TASK-R2-O2's tier ladder created a
**fourth** after that sentence was written; it is in owner-register row 32
(D114) and missing from row 30 (D112). All four are costed here and the
register is corrected — see §7.

| # | Option | Cells | Tester-hours | Calendar (dedicated) | **What 1.0 may then claim** | What it forgoes |
|---|---|---|---|---|---|---|
| **1** | **Narrow the claim to Tier A/B** | 67 (B × `nvda-firefox`) | **18.5 h** + **3–4 agent-days to script Tier B first** (D115: 67 cells, none scripted) | ~1 week testing, ~1 week scripting before it | *"Every Tier A/B component has been driven with NVDA + Firefox by a named tester. Tier C/D carry no manual AT evidence and are marked experimental."* | The 22 most-used components ship marked `experimental`. Honest, and commercially awkward — these are the components buyers evaluate. |
| **2** | **Narrow the pair set to what ran** | 44 (wave 1) | **20.6 h** | ~1 week | *"Every Tier C/D component has passed NVDA + Firefox and JAWS + Chrome. The other four pairings are recorded `unrun` and are not claimed."* | Nothing is forfeited that was ever held. The claim is true, small, and per-pairing checkable from the repository. Says nothing about VoiceOver, iOS or Android. |
| **3** | **Move C9 post-1.0** | 0 | **0 h** | immediate | *"1.0 makes no manual assistive-technology claim."* — and the README's WCAG AA claim **must be qualified in the same change**. | Everything. Only honest if the qualification happens; shipping unqualified "WCAG AA" over 534 unrun cells is the precise outcome criterion C9 exists to prevent, and it is the **default that happens if nobody decides**. |
| **4** | **Satisfy the tier ladder** | 136 (B 67 · C 63 · D 6) | **50.5 h** (wave 1 is 20.6 of it) + Tier B scripting | ~2.5 weeks testing | *"Every component has passed the AT pairings its risk tier requires"* — a claim `requiredAtPairs()` defines in a published contract, not one the release notes assert. | ~30 h beyond wave 1. Still says nothing about the non-required pairings, which stay visibly `unrun`. |

For context, the two totals nobody is proposing: **full Tier C/D × 6 pairings =
132 cells ≈ 61.8 h**; **all 534 cells ≈ 172.8 h ≈ 4.3 tester-months**. The
second is why the tier ladder exists.

### 2a. Recommendation — **option 4, reached through option 2**

Run wave 1 first, and decide between 2 and 4 with a defect count in hand.

This is the same recommendation the R2-O2 packet made, and re-measurement
strengthened rather than weakened it:

- **Wave 1 is not a bet.** It is a strict subset of options 1 (no — see below),
  2 and 4, so no hour spent on it is wasted by a later decision. *Precisely: it
  is a subset of 2 and 4. It is **not** a subset of option 1, which needs Tier B
  instead.* That asymmetry is the argument for deciding option 1 **now or
  never**: it is the only option whose first hour is different work.
- **Option 4 is cheaper than it was thought to be.** 50.5 h, not the 55–60 h
  the inherited estimate carried (§7). At ~30 h beyond wave 1 it is roughly
  three more dedicated tester-days for the only claim in the set whose meaning
  a buyer can verify from the repository rather than from prose.
- **The decision after wave 1 writes itself.** If wave 1 comes back clean, 4 is
  30 h away and worth it. If wave 1 finds a dozen defects, *those defects are
  the 1.0 blocker* and the pairing count stops being the interesting question —
  which is itself the strongest argument for running wave 1 before choosing.

**Option 3 is the one to refuse explicitly**, because it is what happens by
default. Not because deferring is dishonest — it is defensible, and stated
plainly it is fine — but because the honest version of it requires
simultaneously editing the README's accessibility claim, and a deferral that
forgets that half is indistinguishable from an overclaim.

---

## 3. What a tester needs, exactly

### 3a. Machine and software

| | |
|---|---|
| OS | **Windows 11.** One machine. Nothing else in wave 1. |
| Pairing 1 | **NVDA** (free — nvaccess.org) **+ Firefox** |
| Pairing 2 | **JAWS + Chrome.** Licensed (~$95/yr home, ~$1,300 professional) **or demo mode**, which runs 40 minutes per boot and then needs a restart. |
| Under test | Storybook, built and served locally. `yarn storybook:build` then serve `apps/storybook/storybook-static`, or `yarn storybook` for dev. |
| Headphones | Yes — an open speaker makes a two-hour session unpleasant for everyone nearby, and that is how sessions get cut short. |

**No Mac, iOS device or Android device is needed for wave 1.** Those are
pairings 3–6 and belong to option 4's Tier D row and beyond.

### 3b. Before the first session — two commands

```bash
yarn validate:at-scripts   # exit 0 = every story id still resolves
yarn validate:at-matrix    # exit 0 = the scaffold is readable
```

Run `validate:at-scripts` **at the start of every testing day.** It is the gate
whose failure is measured in tester-hours: a drifted script sends somebody to a
story id that no longer exists, and they find out forty minutes in. It was
green at `4e4e46f` — 22/22 components, 124 steps, all 1,648 story ids resolving.

### 3c. During a session — one file

```
e2e/at-matrix/scripts/{Component}.at-script.md
```

**Read only this.** It carries, already written: the exact Storybook story to
open (gated against the built stories), the environment that story sets up, one
numbered step per task with the keys to press, the announcements the AT must
produce as a checklist, the APG clause each expectation comes from, and the
known open defects **to read after recording**, so a known issue is not re-filed
as new.

Beside it, `e2e/at-matrix/{Component}.md` carries the component's **declared
keyboard contract**. Drive those keys, not the pattern's from memory. A key that
does not do what the table says is a defect in the component **or** in the
contract — record which.

Do **not** read this schedule, the runbook, or the pairing packet while testing.

### 3d. Session length and shape

A component is **23–77 minutes**, and both pairings of one component belong in
one sitting — the second is faster because the contract is fresh. Two to three
components is a productive half-day. The nine `combobox` components (rows 2–10
above) are ~11 h together and are the block worth protecting from interruption.

### 3e. After a session — the ingest path

Built by this task. Full format and the complete refusal list:
[`docs/qa/at-run-record.md`](../../qa/at-run-record.md).

```bash
yarn at:ingest my-session.json --dry-run   # see the rows, write nothing
yarn at:ingest my-session.json             # append + archive + rebuild index
yarn validate:at-matrix
yarn validate:at-runs
```

Write one JSON per `{component, pair}`. The lane appends one eight-column row
per step beneath the append-only marker, archives the whole record under
`e2e/at-matrix/runs/`, and rebuilds `index.json`. It **refuses a record whole**
— nothing is written — if it is missing the tester, the AT or browser version,
the OS or the `sourceCommit`; if the date is not a real past day; if a step
names a task the component does not owe; if the verdict is stronger than its
steps; or if it duplicates a session already recorded.

Hand-editing the markdown is still allowed and still validated. The reason to
prefer the lane is that the table has eight columns and a session has more facts
than that: `os`, what the script said to listen for, and which defect id a
failure became have no column, and six months later a row reading
`fail — announces count only` cannot be reproduced by anyone.

**Then file every `fail` and `partial` as a task** — component · task · pairing
· AT · severity. A defect that lives only in a `notes` column is a defect nobody
is going to fix.

---

## 4. Cadence after wave 1 (D113)

A cell goes stale when its component's source changes, and this repository moves
daily. `validate:at-matrix` reports staleness per cell against the component's
last commit, so the work is always enumerable rather than guessed.

| Option | Steady-state cost | The hole in it |
|---|---|---|
| (a) Event-driven — re-run a component's required pairings when its cell goes stale | ≈ 16 h/quarter for Tier C/D | An untouched component's evidence ages indefinitely without ever going *stale*: the AT itself changes, and NVDA 2027.1 is not NVDA 2026.2. |
| (b) Calendar — one full sweep per release train | ~50 h per minor (option 4's full ladder) | A component changed the day after the sweep ships on a pass about different code. |
| (c) **Both** — event-driven continuously, one full sweep per minor release | ≈ 16 h/quarter + ~50 h per minor | None that matters. ≈ 0.75–1.0 FTE-weeks per quarter for Tier C/D. |

**Recommendation: (c).** Each of (a) and (b) alone has a failure the other
covers, and the two failures are the two ways AT evidence silently expires.

---

## 5. What this task built, so the owner knows what is already paid for

| Piece | Where | Proof |
|---|---|---|
| Record format | `docs/qa/at-run-record.md` | — |
| Ingest lane | `packages/tooling/src/quality/at-ingest.ts` · `yarn at:ingest` | 53 specs, every one an assertion that something is refused |
| Archive gate | `packages/tooling/src/validators/at-runs.ts` · `yarn validate:at-runs` | 8 specs; **link 57** of `validate:all` |
| Scaffold fixes still hold | `at-matrix.spec.ts` (22) · `at-matrix.spec.ts` validator (13) | re-run at `4e4e46f`, exit 0 |
| Scripts not stale | `yarn validate:at-scripts` | exit 0, 22/22, 124 steps, 1,648 story ids resolve |
| Real matrix untouched | `e2e/at-matrix/` | **534 `unrun`, 0 executed**, `git status --porcelain e2e/at-matrix/` empty |

The end-to-end proof of the ingest lane was run against a **copy** of the matrix
in a temporary directory, with a record marked `"fixture": true`, and destroyed.
The lane refuses a `fixture` record against `e2e/at-matrix/` under every
circumstance, and `validate:at-runs` refuses one found sitting there.

---

## 6. What the owner must decide, and who they must name

| # | Decision | Options | Recommendation | Blocks |
|---|---|---|---|---|
| **D112** 🔴 | **A named tester and a wave-1 date.** This is the gate. Nothing else is missing. | (a) name an internal tester, buy one JAWS seat (~$95/yr home, ~$1,300 pro); (b) internal tester, JAWS demo mode, accept a reboot every 40 min; (c) contract an external tester for ~21 h; (d) defer | **(b) to start, (a) if wave 1 justifies wave 2.** Demo mode costs reboots, not fidelity. Not (c) first: wave 1 is also how the scripts get debugged by real use, and that feedback is worth more in-house than the hours saved. | all 534 cells |
| **D114** 🔴 | **Which 1.0 accessibility claim.** §2. | 1 · 2 · 3 · 4 | **4 via 2.** Decide after wave 1's defect count — except **option 1, which must be decided now or never**, being the only option whose first hour is different work. | the 1.0 release statement |
| **D113** 🟠 | **Cadence.** §4. | (a) event-driven · (b) per release · (c) both | **(c)** | whether the evidence stays true |
| **D115** 🟠 | **Script Tier B?** 67 cells, none scripted. | (a) script it (3–4 agent-days) then run 18.5 h; (b) run unscripted; (c) leave `unrun` and say so | **(a), after wave 1** — unless **option 1** is chosen, in which case (a) is immediate and on the critical path. Never (b): unscripted runs are how two testers come to disagree about what "tested" means. | options 1 and 4 |

**The one thing that must happen: a person's name in D112 and a date.** Wave 1
is 20.6 tester-hours on one Windows machine, ~4 working days dedicated or ~4
weeks at a day a week, and it is a subset of both recommended options, so it can
start before D114 is settled.

---

## 7. Inherited numbers that did not survive re-measurement

Recorded because the register and the runbook are cited by other documents, and
because a number carried forward four times is the kind that stops being
checked.

| Figure | Inherited | Measured at `4e4e46f` | Why |
|---|---|---|---|
| Full Tier C/D claim (132 cells) | **≈ 75 h** (register row 30; N1-O4 §5.2) | **61.8 h** | Applying the runbook's own stated model (3 min/cell setup + 4 min/step-run + 10 %) to the step counts at HEAD. The 13 h gap is most likely per-day environment setup and JAWS demo-mode reboots, which the model does not carry. **Schedule against 75 h; do arithmetic with 61.8 h.** Not corrected in the register — it is a planning figure with slack in it, and the slack is real. |
| Tier ladder (136 cells) | **55–60 h** (pairing packet §5) | **50.5 h** | Same model, same cause. Materially changes option 4: ~30 h beyond wave 1, not ~35. |
| Tier B sweep (67 cells) | **≈ 25 h** (pairing packet §5, runbook D115) | **18.5 h** of testing — but **plus 3–4 agent-days of scripting**, which the 25 h did not name | Option 1's real cost is two different budgets in two different currencies, and presenting it as "25 h" understated the lead time while overstating the tester-hours. |

| Register inconsistency | Correction |
|---|---|
| Row 30 (**D112**) lists **three** C9 options; row 32 (**D114**) lists **four**. README §7 item 4 says three. The fourth — claim the tier ladder — was created by TASK-R2-O2's tier ladder *after* those sentences were written. | Row 30 corrected to list the fourth option and point at §2 of this document. Row 32 was already right. **No verdict, cost or recommendation was changed** — only the option count, which was stale in one of two places. |

Wave 1's own estimate — **20.6 h** — reproduced the inherited ~21 h exactly, and
the 22-component list, 124 steps and 248 step-runs all reproduced at HEAD. The
runbook's wave-1 scope is confirmed by measurement, not merely cited.
