# Wave 1 runbook and owner decision sheet — manual AT execution

> **TASK-R2-O2, phase 2.** Prepared 2026-09-18 against `main` @ `2d51eec`
> (dirty tree). **Phase 1 — the schema — is done and validated; this document is
> the handover to a human.** Nothing below may be executed by an agent, and no
> result cell in this repository has been or will be written by one.
>
> Companion: [`at-pairing-decision-packet.md`](./at-pairing-decision-packet.md)
> (pairing vocabulary + criterion C9 options).

---

## 0. Why an agent stopped here

The scaffold holds **534 cells and 0 executed**. That is not a gap an agent may
close. An AT matrix row is a record that *a person with a screen reader drove
this component and heard this*; a row an agent writes is a fabrication, and a
fabricated row is worse than an empty one because an empty one is true.

This task's agent half was to make sure that when a person does run a cell, the
result is recorded correctly and **cannot be misreported**. Specifically, the
resolver used to publish `pass` for a component whose every pairing had been
recorded `fail` — so the first honest AT session in this repository's history
would have been published as a clean pass. That is fixed, proved by a seeded
regression, and §1 says what else changed.

---

## 1. What changed under the scaffold since N1-O4 wrote the scripts

Read this before running a cell; three of the five items change what you record.

| # | Change | Effect on a tester |
|---|---|---|
| 1 | **`CellState` gained `fail`; `resolveAtManual` decides the cell.** An all-`fail` component now reads `fail`, an all-`blocked` one reads `present`, and `pass` requires every task on every required pairing. | **Your `fail` will be published as a failure.** Previously it would have been published as a pass. |
| 2 | **The run record has a `task` column.** Eight columns: `pair · task · result · versions · tester · date · sourceCommit · notes`. | Record **one row per `{task, pair}`** you drove, naming the task. The generated `*` rows mean "nobody ran this pairing"; leave them and append beneath. |
| 3 | **Pairings are tier-differentiated.** `requiredAtPairs(tier)` — B: 1 · C: 3 · D: 6. Every scaffold file's Pairs table marks each pairing **required** or **optional** for that component. | Wave 1's two pairings are both *required* at Tier C and D. Optional pairings are still recorded if you run them. |
| 4 | **`DzSidebar` is APG `landmarks`, not `treeview`.** It ships `role="navigation"`; APG says explicitly not to use the tree pattern for page links. Its tasks are now `reach, navigate, activate, live`. | The capitalised "do not file this mismatch again" warning is gone from its script. Its `select`/`typeahead` steps became `activate` and a widened `navigate`. |
| 5 | **`DzCommandPalette` no longer owes `error`.** Declared in `AT_TASK_OPT_OUTS` with its reason, printed in the scaffold header. | There is no longer an `error` step asking you to write "not applicable" in the notes. |

`validate:at-scripts` is now link 18 of `validate:all`, so a script that sends
you to a story that no longer exists turns the build red before it wastes your
time.

---

## 2. Wave 1 — scope

**`nvda-firefox` + `jaws-chrome` over the 22 Tier C/D components.**

| | |
|---|---|
| Cells | **44** (22 components × 2 pairings) |
| Step-runs | **248** (124 steps × 2 pairings) |
| Estimate | **~21 h ≈ 2.6 tester-days** (3 min setup + 4 min/step per pairing, +10 % defect write-ups) |
| Platform | Windows only. **No Mac or mobile device is needed for wave 1** — that is the main reason to start here. |
| Ratchet moved | AT cells executed **0/534 → 44/534**; required cells **0/136 → 44/136** |

Both pairings are Windows + a desktop browser, both are *required* at Tier C
and D, and together they are the two that disagree most: NVDA reads the tree
you authored, JAWS reads the tree it thinks you meant.

### 2a. Order — Tier D first, then by blast radius

Run in this order. It is Tier D first (the one component whose failure is a
security-boundary failure), then the components whose patterns are shared by
the most other components, so that a defect found early is a defect found once.

| # | Component | Tier | APG | Tasks | Steps | wave-1 step-runs | Est. |
|---|---|---|---|---|---|---|---|
| 1 | `DzFileUpload` | **D** | `button` | reach, activate, non-drag, error | 4 | 8 | 38 min |
| 2 | `DzCombobox` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 70 min |
| 3 | `DzMultiSelect` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 70 min |
| 4 | `DzCascader` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 70 min |
| 5 | `DzTreeSelect` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 70 min |
| 6 | `DzMention` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error, live | 8 | 16 | 70 min |
| 7 | `DzDatePicker` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error | 7 | 14 | 62 min |
| 8 | `DzDateRangePicker` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error | 7 | 14 | 62 min |
| 9 | `DzTimePicker` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, error | 7 | 14 | 62 min |
| 10 | `DzCommandPalette` | C | `combobox` | reach, open, navigate, typeahead, select, dismiss, live | 7 | 14 | 62 min |
| 11 | `DzDataGrid` | C | `grid` | reach, navigate, select, live | 4 | 8 | 38 min |
| 12 | `DzCalendar` | C | `grid` | reach, navigate, select, live | 4 | 8 | 38 min |
| 13 | `DzTable` | C | `table` | reach, navigate, non-drag, live | 4 | 8 | 38 min |
| 14 | `DzOrderList` | C | `listbox` | reach, navigate, typeahead, select, non-drag, live | 6 | 12 | 54 min |
| 15 | `DzTransfer` | C | `listbox` | reach, navigate, typeahead, select, live | 5 | 10 | 46 min |
| 16 | `DzPersonaSelector` | C | `listbox` | reach, navigate, typeahead, select, live | 5 | 10 | 46 min |
| 17 | `DzTree` | C | `treeview` | reach, navigate, select, typeahead, live | 5 | 10 | 46 min |
| 18 | `DzMegaMenu` | C | `menubar` | reach, navigate, open, activate, dismiss, live | 6 | 12 | 54 min |
| 19 | `DzSidebar` | C | `landmarks` | reach, navigate, activate, live | 4 | 8 | 38 min |
| 20 | `DzTour` | C | `dialog` | open, reach, dismiss, live | 4 | 8 | 38 min |
| 21 | `DzDataView` | C | `custom` | reach, activate, live | 3 | 6 | 30 min |
| 22 | `DzColorPicker` | C | `custom` | reach, activate | 2 | 4 | 22 min |
| | | | | **124** | **248** | **≈ 20.6 h** |

Nine of the 22 are APG `combobox`. Running them consecutively (2–10) is
deliberate: the announcement contract is the same, so the second one takes
less than the first, and a defect in the shared listbox/popup plumbing shows up
as the same note nine times rather than nine unrelated notes.

### 2b. Per-component runbook — where it already is

**Do not read this document while testing.** Each component has a generated,
executable script at:

```
e2e/at-matrix/scripts/{Component}.at-script.md
```

Each one carries, already written: the exact Storybook story to open (gated —
every id is checked against the 1,648 built stories), the environment the story
sets up, one numbered step per task with the keys to press, the announcements
the AT must produce as a checklist, the APG clause each expectation comes from,
and the known open defects to read **after** recording so a known issue is not
re-filed as new.

Regenerate with `yarn generate:at-scripts`; verify with `yarn validate:at-scripts`.

The scaffold file you append your results to is `e2e/at-matrix/{Component}.md`,
and it carries the declared keyboard contract for that component — **drive those
keys, not the pattern's from memory.**

---

## 3. How to record a run

Append to the table below the marker in `e2e/at-matrix/{Component}.md`. It is
**append-only**: never edit a row that is already there. The history is what
distinguishes a new regression from a known one.

```
| pair | task | result | versions | tester | date | sourceCommit | notes |
|---|---|---|---|---|---|---|---|
| nvda-firefox | * | unrun | - | - | - | - | not executed |          ← leave this
| nvda-firefox | select | fail | NVDA 2026.1 / Firefox 143 | e.isic | 2026-09-20 | 2d51eec | announces "blank" on ArrowDown |
```

| Column | Rule |
|---|---|
| `pair` | One of the six ids. The Pairs table in the file says which are **required** at this tier. |
| `task` | One task id from the file's Tasks table. `*` is reserved for the generated unrun rows — **a real result may not use it**; the validator refuses it. |
| `result` | `pass` · `fail` · `partial` · `blocked` · `unrun`. |
| `versions` | AT and browser versions, e.g. `NVDA 2026.1 / Firefox 143`. |
| `tester` | A real name or handle. |
| `date` | ISO. |
| `sourceCommit` | `git rev-parse --short HEAD` **at the moment you ran it.** Recorded so the row can go stale honestly. |
| `notes` | Free text. On a `fail` or `partial`, name what you heard. |

**A result with dashes in the metadata is refused by `validate:at-matrix`** —
"a result with nothing behind it is worse than `unrun`, because `unrun` is true".

### 3a. Choosing a result

- **`pass`** — every expectation in that step's checklist was met.
- **`fail`** — an expectation was not met. This now publishes as `fail`. Use it.
- **`partial`** — the step half-worked and the distinction is worth recording.
  It resolves to `fail` at the cell (pass requires every step passed); the
  *distinction survives in your row*, which is where it is useful.
- **`blocked`** — you started and could not finish (the story would not load, the
  AT crashed). Resolves to `present`, not `pass` and not `fail`.
- **`unrun`** — the AT or the device was not available. **A fact, not a
  placeholder, and never a substitute for `fail`.**

### 3b. After the wave

```bash
yarn validate:at-matrix                    # shape, substance, freshness
yarn generate:at-matrix                    # rebuilds index.json from the markdown
yarn generate:capability-matrix            # at-manual cells re-resolve
npx tsx packages/tooling/src/validators/capability-matrix.ts
yarn generate:docs-pages                   # the tripwire cross-checks the two
```

File every defect with component · task · pairing · AT · severity, and route
it to a task id. A defect that is only in a `notes` column is a defect nobody
is going to fix.

---

## 4. Owner decision sheet

Phase 2 cannot start until **D112** is answered. The rest can be answered in
parallel or deferred.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D112** | **Who tests, and is JAWS licensed?** This is the gate; everything else is ready. Wave 1 is ~21 h of one person's time on Windows. JAWS runs 40 minutes per boot in demo mode, which is workable for 38–70-minute components but adds reboots. | (a) name an internal tester and buy one JAWS seat (~$95/yr home, ~$1,300 professional); (b) internal tester, JAWS demo mode, accept the reboots; (c) contract an external accessibility tester for the ~21 h; (d) defer wave 1. | **(b) to start, (a) if wave 1 finds enough to justify wave 2.** Demo mode costs reboots, not fidelity. Do not start with (c): the first wave is also how the scripts get debugged, and that feedback is worth more in-house. |
| **D113** | **Cadence after wave 1.** A cell goes stale when its component changes, and the repository moves daily. | (a) event-driven — re-run a component's required pairings when its cell goes stale (≈16 h/quarter); (b) calendar — one full sweep per release train (~75 h); (c) both: event-driven continuously with a full sweep per minor release. | **(c).** Event-driven alone lets an untouched component's evidence age without ever going stale; calendar alone lets a changed component ship on a pass about different code. Steady state ≈ 0.75–1.0 FTE-weeks per quarter for Tier C/D. |
| **D114** | **Which C9 option does 1.0 claim?** Full analysis in [`at-pairing-decision-packet.md`](./at-pairing-decision-packet.md) §5. | (1) narrow the claim to Tier A/B; (2) narrow the pair set to what ran; (3) move C9 post-1.0; (4) claim the tier ladder (136 cells). | **(4), reached through (2).** Run wave 1 first — it is a strict subset of every option, so it is not a bet — then decide with a defect count in hand. **Not** the unstated default: 1.0 with 534 unrun cells and an unqualified WCAG AA claim. |
| **D115** | **Does Tier B get scripted?** Wave 1 covers Tier C/D only. Tier B is 67 components × 1 required pairing = 67 cells, and **none of them has a script** — N1-O4 wrote scripts for Tier C/D only. | (a) script Tier B (est. 3–4 agent-days) then run 67 cells (~25 h); (b) run Tier B unscripted against the generated task table; (c) leave Tier B `unrun` and say so. | **(a), after wave 1.** (b) is how testers and the matrix come to disagree about what "tested" means — the scripts exist precisely so two testers drive the same thing. Sequence it after wave 1 so the script format is debugged by real use first. |

### 4a. What is ready and waiting

| | |
|---|---|
| Scripts | **22/22** components · 124 steps · every story id gated against 1,648 built stories |
| Scaffold | **89** files · **534** cells · **136** required · schema `1.1.0` with the task column |
| Gates | `validate:at-scripts` **exit 0** (now in `validate:all`) · `validate:at-matrix` **exit 0** |
| Resolver | `fail` exists; all-fail → `fail` proved by seeded regression (22 specs) |
| Blocked on | **a named tester (D112).** Nothing else. |
