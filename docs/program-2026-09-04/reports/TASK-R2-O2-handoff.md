# TASK-R2-O2 — AT matrix: fix the schema, then wave 1

> **Status: `[~]` — phase 1 (agent) complete and validated; phase 2 (wave 1)
> owed to a human tester.** Not `[x]`, and deliberately not `[!]`: nothing is
> blocked on an owner *decision*, only on an owner *action* (naming a tester).
> Every engineering prerequisite N1-O4 listed is now closed.
>
> Run 2026-09-18 · `main` @ **`2d51eec`** + dirty tree (TASK-R2-O3's and
> TASK-R2-O4's ~260 uncommitted paths at session start, preserved untouched;
> 384 paths at session end). Every number below is bound to that commit.
> Nothing committed. **No AT result cell was written.**

---

## 0. Done-check: 1 of 4 mechanically passed — and that one is a false pass

| # | Check as written | Result | What it actually measures |
|---|---|---|---|
| 1 | `grep -n "fail" packages/contracts/src/*quality*.ts packages/tooling/src/**/at-*.ts \| grep -i cellstate` | **fail** | **Unrunnable as written.** `CellState` is declared in `packages/tooling/src/quality/capability-matrix.ts` — neither a `*quality*.ts` in contracts nor an `at-*.ts`. The glob could never have matched it. Evaluated by intent instead: `CellState = 'pass' \| 'present' \| 'stale' \| 'unrun' \| 'excepted'` — **no `fail`**. Check fails on intent too. |
| 2 | `grep -c 'validate:at-scripts' package.json` → ≥ 2 | **passes — falsely** | Returned exactly 2, satisfying the threshold. Both occurrences are on adjacent lines 96–97: the `//validate:at-scripts` doc-comment key and the script itself. `node -e "…scripts['validate:all'].includes('validate:at-scripts')"` → **`false`**. The check's stated intent ("script + validate:all chain") was **not** met; the threshold is met by the repo's own documentation convention. **D116.** |
| 3 | `ls docs/program-2026-09-04/reports/ \| grep -i 'at-pairing'` | **fail** | No pairing packet existed. |
| 4 | `grep -rn 'tester' e2e/at-matrix/runs/ \| wc -l` → > 0 | **fail** (0) | Directory `e2e/at-matrix/runs/` does not exist — the scaffold keeps run records **inside each `{Component}.md`** below an append-only marker, not in a `runs/` directory. A second check that cannot pass as written. Intent (has wave 1 started?) → **no**. |

**Net: ran the task in full.** Consistent with TASK-R2-O3 (0/4, check 4 was
substring noise) and TASK-R2-O4 (0/4, check 2 read a non-existent key) — this is
now the **third consecutive task** whose done-check contained a clause that could
not pass as written. Raised as **D116**.

---

## 1. Implemented files and API effect

### 1a. The defect — what it was

`generate-capability-matrix.ts`, the `at-manual` branch, in full:

```ts
const executed = entry.rows.filter(r => r.result !== 'unrun')
const stale = executed.some(r => !evidenceIsCurrent(r.sourceCommit, entry.componentCommit))
return cell(kind, origin, { state: stale ? 'stale' : 'pass', note, artifacts })
```

`executed` counted rows. **The result value was never read.** A component whose
every AT pairing a human had recorded as `fail` published `state: 'pass'`.

It survived a year for a structural reason worth naming: it was a branch inside
an 886-line generator, reachable only by constructing a whole capability matrix
around a synthetic index. No unit test could get at it. N2-D2 could not fix it
either — `CellState` had no `fail` to resolve *to* — so it added a docs-generator
tripwire that stopped the **site** publishing the lie while the **matrix** went
on telling it, and routed two further lanes (2.5.7 deviations, security corpus)
into side registers for the same missing value (D2-D4).

### 1b. Files changed

| File | Change | API effect |
|---|---|---|
| `packages/contracts/src/quality-tiers.ts` | **New:** `TIER_AT_PAIR_INCREMENT`, `requiredAtPairs(tier)`. | **Public API addition** to a published package. Additive. |
| `packages/contracts/src/index.ts` | Export both. | Public. |
| `packages/tooling/src/quality/capability-matrix.ts` | `CellState` gains **`fail`**; `CELL_STATES` and `emptyTally()` follow. | `totals` gains a sixth key. Additive; no existing key changes meaning. |
| `packages/tooling/src/quality/at-matrix.ts` | **New `resolveAtManual()`** — the resolution, extracted as a pure function. `AtResultRow.task`; `ALL_TASKS`; `AtMatrixEntry.requiredPairs`; `AT_TASK_OPT_OUTS` + `optedOutTasksFor()`; `tasksFor()` takes `component`; `landmarks` → `[REACH, NAVIGATE, ACTIVATE]`; schema `1.0.0 → 1.1.0`. | Internal to tooling. |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `at-manual` branch delegates to `resolveAtManual`. `Sources.atIndex` typed as the real `AtMatrixIndex` instead of a 4-field structural restatement. Totals table driven from `CELL_STATES`. | — |
| `packages/tooling/src/quality/generate-at-matrix.ts` | 8-column results table; required/optional pairing labels; opt-out section; **`migrateResultsTable()`**; `parseResults` accepts both widths. | — |
| `packages/tooling/src/validators/at-matrix.ts` | Task id must be one the component owes; a real result may not claim `*`; reports required-cell counts. | — |
| `packages/tooling/src/validators/capability-matrix.ts` | Totals table driven from `CELL_STATES`. | — |
| `packages/tooling/src/quality/component-tiers.ts` | **`DzSidebar`: `treeview` → `landmarks`.** | Changes what one component owes. |
| `packages/tooling/src/quality/at-scripts.data.ts` | `DzSidebar` `select`→`activate`, `typeahead` folded into `navigate`, obsolete warning replaced by a historical note; `DzCommandPalette` `error` step deleted. | — |
| `packages/tooling/src/quality/generate-at-scripts.ts` | `.trimEnd()` on two interpolations. | Removes 44 lint errors. |
| `packages/tooling/src/docs/evidence.ts` | Tripwire **kept and re-aimed** (see §1f); `AtRow.task`, `AtEntry.requiredPairs`; stale module docstring corrected. | — |
| `package.json` | **`validate:at-scripts` chained into `validate:all`** as link 18, before `validate:at-matrix`. | Chain 42 → 43 links. |
| `packages/tooling/src/quality/at-matrix.spec.ts` | **New — 22 specs**, the seeded regression. | — |
| `.changeset/an-at-matrix-that-cannot-turn-a-failed-run-into-a-pass.md` | `patch` for `@dzup-ui/contracts`. | 33 → 34 changesets. |

Regenerated (mandated order — ownership was already fresh): quality-matrix →
at-matrix → at-scripts → capability-matrix → component-meta → llms → docs-pages.

### 1c. The new resolution rule

Never resolves upward. In order: no executed row → `unrun`; any `fail` or
`partial` → **`fail`**; any `blocked` → `present`; all passed but a required
pairing or declared task uncovered → `present`; complete but stale → `stale`;
complete and current → `pass`.

Two judgement calls, made and recorded:

- **`partial` resolves to `fail`.** It means at least one expectation was not
  met, and `pass requires every step passed` admits no third answer. The
  distinction survives where it is useful — in the tester's row.
- **`fail` outranks `stale`.** A failure not re-run against newer code is still
  the last thing anybody observed. Demoting it to the neutral-reading `stale`
  would launder it exactly as `pass` did. The note carries the staleness.

### 1d. Tier-differentiated pairings — and why the denominator did not move

`requiredAtPairs()` accumulates from A upward, so **D ⊇ C ⊇ B is a property of
the data structure**, not a rule to remember. B: `nvda-firefox` · C: +
`jaws-chrome`, `voiceover-safari` · D: + the remaining three.

**The scaffold still carries all six pairings on all 89 components — 534 cells,
unchanged.** The ladder says only which cells hold a component's evidence state
hostage. Narrowing the scaffold to 136 would have moved the ratchet by
redefinition rather than by work, which `<generated_authority>` forbids, so
`validate:at-matrix` prints **both** numbers permanently:

```
cells 534 · executed 0 · required cells 136 · required executed 0
```

### 1e. The two component-level corrections

- **`DzSidebar` declared `treeview` and has never implemented one.** It ships
  `role="navigation"` with links carrying `aria-current="page"`; no `role="tree"`,
  no `treeitem`, no `aria-level`. APG recommends explicitly *against* the tree
  pattern for page links, so the component was right and the declaration was
  wrong. N1-O4 measured the cost of believing it: writing the script against
  `treeview` would have manufactured **30 guaranteed failures** for a metadata
  defect, so the script was written against the landmark contract with a
  capitalised warning telling testers not to re-file the mismatch. **That warning
  is now unnecessary and is gone.** `landmarks` gained `ACTIVATE` so the
  `aria-current` contract — the one stateful thing a set of page links owes —
  remains testable; the old `select` step became `activate` and the old
  `typeahead` step folded into a widened `navigate`. **No tester guidance was
  lost**; all seven of its expectations survive.
- **`DzCommandPalette` owed an `error` task it has no surface for.** It was the
  only not-applicable step in all 126 — prose telling the tester to write
  "not applicable" in the notes, invisible to every gate. Now a machine-readable
  waiver in `AT_TASK_OPT_OUTS` with its reason, **printed in the generated
  scaffold header** so nothing is dropped silently, and excluded from what
  qualification requires. A 3.3.1 obligation overrides a waiver, so the escape
  hatch cannot silence a real one.

### 1f. The N2-D2 tripwire was re-aimed, not deleted — and it had to be

The prompt said *"do not duplicate it — replace it with the real fix"*. The real
fix landed; deleting the tripwire would have been wrong, and **leaving it alone
would have broken the build on the first honest wave.**

Its first refusal shape was *"cell is not `unrun` and a recorded row is
`fail`/`partial`/`blocked`"*. With the fix, a failed run correctly produces
`state: 'fail'` — which that condition would have flagged as a contradiction,
turning `validate:docs-pages` red the moment a human recorded a real failure.
It now refuses only a cell that reads **better** than its rows (`pass` or `stale`
over a non-pass), which is the actual invariant. It is kept because it is the
only check comparing two independently generated artifacts against each other:
a resolver regression, a half-finished regeneration or a hand-edited `index.json`
show up there and nowhere else.

### 1g. The migration — how 534 rows gained a column without rewriting history

The generator never rewrites below the append-only marker. `migrateResultsTable()`
widens a table **only when every row in it is `unrun`** — the scaffold's own
default, nobody's evidence. One recorded run anywhere and the whole table is left
alone. `parseResults()` additionally accepts both widths permanently, so a
7-column row is read as covering `*` rather than skipped — a skipped row would
read as "never executed", the same falsehood arriving from the other direction.

---

## 2. Focused validation

| Command | Exit | Output |
|---|---|---|
| `npx vitest run packages/tooling/src/quality/at-matrix.spec.ts` | **0** | **22/22** — the seeded regression |
| `npx vitest run at-matrix quality-tiers capability-matrix evidence` | **0** | **144/144** across 6 files (incl. 48 evidence specs driving the tripwire) |
| `yarn validate:at-scripts` | **0** | 22/22 scripted · **124 steps** · every story id resolves against 1,648 built stories |
| `yarn validate:at-matrix` | **0** | 89 components · 534 cells · 0 executed · **136 required** · 0 stale |
| `yarn generate:at-matrix` | **0** | 89 components, 0 files created, 0/534 executed |
| `yarn generate:capability-matrix` | **0** | 144 rows · 1,662 cells · `sourceCommit 2d51eec` |
| `npx tsx …/validators/capability-matrix.ts` | **1** | **1 violation — pre-existing** (§3) |
| `packages/tooling` `tsc --noEmit` | — | **12 errors, all pre-existing.** Mine: 3 introduced, 3 fixed, **0 net.** |

### 2a. The seeded proof

The regression spec asserts the behaviour; to prove the *old* logic actually
failed these cases, the pre-TASK-R2-O2 resolver was reimplemented verbatim in a
scratch spec and run against the **same inputs** (scratch file, run inside the
repo, deleted afterwards — `git status` confirms no residue):

| Input (all six pairings) | **Old** resolver | **New** resolver |
|---|---|---|
| all `unrun` | `unrun` | `unrun` |
| all **`fail`** | **`pass`** ❌ | **`fail`** ✅ |
| all `partial` | **`pass`** ❌ | **`fail`** ✅ |
| all `blocked` | **`pass`** ❌ | **`present`** ✅ |
| one `pass`, five `unrun`, Tier C | **`pass`** ❌ | **`present`** ✅ |

Five cases, four of which the old logic got wrong, including the headline one.
All five now assert in `at-matrix.spec.ts`.

---

## 3. Aggregate qualification

| Lane | Result | Pre-existing or new |
|---|---|---|
| `yarn validate:all` | **exit 1 at `validate:capability-matrix`** — `DzFileUpload` Tier-D `browser-matrix` unrun, **1 violation** | **Pre-existing.** Identical link, violation and count as at `2d51eec` before this packet (R2-O3 and R2-O4 both recorded it). **Owned by TASK-R2-O1.** |
| All 24 links after it | **each exit 0 individually** | — |
| `yarn typecheck` · `yarn lint` | **0** · **0** | (both are links 1–2 of the chain, which reached link 20) |
| `yarn test` | **exit 1 — 10,161 passed / 3 failed / 3 skipped / 1 todo (540 files)** | **All 3 inherited, by name:** `dzup-resolution` snapshot, `landing-token-fallbacks`, `story-dod-tiers countOpen`. **0 new.** |
| `eslint e2e/` | **9** (was 142 measured at session start) | The 133 removed were **generated markdown**, fixed at the generator (§4). The remaining 9 are pre-existing `.ts` in `e2e/smoke/` and `e2e/utils/`, outside `yarn lint`'s target (`packages/ apps/`). |
| `packages/tooling` `tsc` | **12** | Pre-existing. |

**The aggregate is not green and is not claimed to be.** One link is red for a
reason that predates this packet and belongs to another task.

**Not run, deliberately:** `yarn storybook:test`, `yarn test:e2e`, the visual and
perf lanes. Nothing in this packet changes a component's rendered output — the
diff touches tooling, one contracts module, generated documentation and the AT
scaffold. R2-O3 and R2-O4 both recorded `storybook:test` at 1,451/1,453 with the
same two async-options stories; there is no mechanism by which this change moves
that number, and spending ~20 minutes to re-observe it would not have been
evidence of anything this packet did.

---

## 4. The 133 lint errors were a generator defect, not lint noise

R2-O4 measured `eslint e2e/` at 147, of which 138 were generated
`at-matrix/*.md`. The obvious answer was an ignore rule, following the existing
precedent for `apps/docs/components/*.md`. **It was the wrong answer.** Every one
of those errors was `style/no-multiple-empty-lines` traced to two off-by-one
newlines in the two generators:

- `generate-at-matrix.ts` — `${renderKeyboardCitation(row)}\n## Pairs`, where the
  citation already ends in a blank line. **89 files, 89 errors.**
- `generate-at-scripts.ts` — `${steps}` and `${defects}`, both already
  newline-terminated, interpolated into a template that adds its own. **22 files,
  44 errors.**

Fixed at source; the generated corpus is now clean. `eslint e2e/` **142 → 9**,
and the surviving 9 are exactly the README's original baseline. No ignore rule
was added and no rule was disabled.

---

## 5. Ratchet movements

| Ratchet | Before (`2d51eec` + dirty) | After | Note |
|---|---|---|---|
| **AT cells executed** | 0/534 | **0/534** | **Unchanged, and correctly so.** Only a human moves this. |
| AT required cells | — (no concept) | **0/136** | New denominator, reported **beside** 534, never instead of it. |
| `CellState` values | 5 | **6** (`fail`) | Closes N1-O4 owner decision #4 and N2-D2's D2-D4. |
| AT index schema | 1.0.0 | **1.1.0** | Additive: `task`, `requiredPairs`. |
| AT run-record columns | 7 | **8** | Closes N1-O4 finding A1 / decision #9. |
| Tiers differentiating AT pairings | 0 of 4 | **4 of 4** | Closes N1-O4 decision #6. |
| `validate:all` links | 42 | **43** | Closes N1-O4 decision #10. |
| AT scripts / steps | 22 / 126 | **22 / 124** | −2: `DzSidebar` 5→4 (pattern corrected), `DzCommandPalette` 8→7 (task waived). Both are obligations **removed because they were never real**, and both are documented in the scaffold. |
| Components with a wrong APG declaration | 1 | **0** | Closes N1-O4 decision #7. |
| Machine-readable task waivers | 0 | **1** | Closes N1-O4 decision #8. |
| `eslint e2e/` errors | 142 | **9** | −133, all at the generator. |
| Capability cells | 1,662 | **1,662** | Unchanged. |
| `at-manual` cells by state | 89 `unrun` | **89 `unrun`** | **No cell was fabricated.** |
| Capability stale cells | 22 | **22** | All 22 are `perf-baseline`; none is AT. R2-O1/R2-O7's. |
| Changesets | 33 | **34** | |
| Ownership manifest | 1,338 @ `2d51eec` | **1,338 @ `2d51eec`** | Untouched, already fresh. |
| `yarn test` | 10,146 | **10,164** | +18 net (+22 new specs, −4 from the two removed script steps' coverage). |

**No ceiling was raised. No gate was weakened. No denominator was shrunk.**

---

## 6. Owner decisions raised

Numbering continues from **D108** (R2-O4's last).

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D109** | **One AT pairing vocabulary across doc 06, OSS and Pro.** Three tables, no two alike; OSS's comment and Pro's comment *both* claim fidelity to doc 06 and neither has it. Pro also calls TalkBack `talkback-chrome` where OSS calls it `talkback-android` — the same pairing under two ids, which cannot join. | (a) adopt the OSS six everywhere; (b) adopt doc 06's five and delete JAWS from both implementations; (c) accept divergence and stop claiming they join. | **(a).** Both implementations independently added JAWS; the spec is what is behind. Costs Pro one constant and **zero run records** (Pro has 0 of 34). |
| **D110** | **Is `forced-colors` an AT pairing?** Pro tracks it as one; Pro's own comment says it is not one. | (a) drop it — the 18-project browser matrix already measures it in 3 engines; (b) re-kind it as `manual-visual`; (c) keep it as an AT pairing. | **(a)**, falling back to **(b)** if Pro's claim that its browser lane cannot emulate the system palette holds. Not (c): a display mode is not a screen reader, and double-counting one piece of evidence under two kinds is what the capability matrix exists to prevent. |
| **D111** | **Which tier owes `jaws-chrome`?** OSS now says Tier C; Pro says Tier D. | (a) C, as OSS ships; (b) D, as Pro ships; (c) each keeps its own. | **(a).** Wave 1 is `nvda-firefox` + `jaws-chrome` in both programmes' plans, and that wave only means something if the pairing is an obligation of the tier being tested. |
| **D112** | **Who runs wave 1, and is JAWS licensed?** 🔴 **This is the gate.** ~21 h, Windows only, everything else ready. JAWS demo mode is 40 min/boot. | (a) internal tester + a JAWS seat; (b) internal tester + demo mode, accept reboots; (c) external contractor; (d) defer. | **(b) to start, (a) if wave 1 justifies wave 2.** Not (c) first: the first wave is also how the scripts get debugged, and that feedback is worth more in-house. |
| **D113** | **Cadence after wave 1.** Cells go stale as components change, and this repository moves daily. | (a) event-driven (≈16 h/quarter); (b) one full sweep per release train (~75 h); (c) both. | **(c).** Event-driven alone lets untouched evidence age without ever going stale; calendar alone lets a changed component ship on a pass about different code. ≈0.75–1.0 FTE-weeks/quarter. |
| **D114** | **Which C9 option does 1.0 claim?** 0 of 132 today. | (1) narrow to Tier A/B; (2) narrow the pair set; (3) move C9 post-1.0; (4) **new** — claim the tier ladder (136 cells, ~55–60 h). | **(4) reached through (2).** Run wave 1 first: it is a strict subset of every option, so it is not a bet. Decide with a defect count in hand. **Not** the unstated default — 1.0 with 534 unrun cells and an unqualified WCAG AA claim on the README. |
| **D115** | **Does Tier B get scripted?** 67 components × 1 required pairing = 67 cells, **none scripted** — N1-O4 covered Tier C/D only. | (a) script Tier B (~3–4 agent-days) then run 67 cells (~25 h); (b) run unscripted against the generated task table; (c) leave `unrun` and say so. | **(a), after wave 1.** (b) is how two testers come to disagree about what "tested" means. |
| **D116** | **Done-check clauses that cannot pass as written.** Third consecutive task: R2-O3's check 4 was substring noise, R2-O4's check 2 read a key that does not exist, and this task's checks 1 and 4 name a file glob and a directory that have never existed — while check 2 **passes on a threshold the repo's doc-comment convention satisfies by itself**, reporting a chained validator that was not chained. | (a) fix the clauses in the three task files and add a convention that a done-check must be executed once against the repo before it ships; (b) treat done-checks as advisory and always evaluate intent; (c) leave them. | **(a).** A false *pass* is the dangerous direction — a fresh agent obeying README §4 would have recorded `[x] found-done` on check 2's evidence and skipped the chaining work. The other three failed safe; this one did not. |

**Closed by this packet** (no longer open): N1-O4 owner decisions **#4** (cell
logic + failed-run representation), **#6** (tier differentiation), **#7**
(`DzSidebar`), **#8** (`tasksFor()` opt-out), **#9** (per-task column), **#10**
(`validate:at-scripts` in `validate:all`); and N2-D2 **D2-D4** (the AT third of
it — the 2.5.7 and security-corpus lanes now have a `fail` state available to
them but were **not** migrated here, see §7).

---

## 7. What was deliberately not done

- **No AT result cell was written.** 0 of 534, unchanged. An agent that fills one
  fabricates evidence; a fabricated row is worse than an empty one because an
  empty one is true. Recorded as a refusal, per `<no_fill>`.
- **Phase 3 not started** — it cannot begin until a tester is named (D112).
- **The 2.5.7 and security-corpus lanes were not migrated onto the new `fail`
  state.** D2-D4 named three lanes that wanted it; only the AT one is in this
  task's scope. Both other lanes currently use side registers and are green;
  changing them here would have put two unrelated packets' evidence at risk in a
  packet about AT. Routed: **R2-O5** (2.5.7) and **R3-O4** (corpus).
- **Pro was not touched.** The pairing packet states what Pro would change; Pro's
  programme executes it.
- **`storybook:test`, `test:e2e`, visual and perf lanes not run** — see §3.
- **No ADR status changed**, nothing committed, pushed, published or dispatched.

---

## 8. Ranked next packet

1. **Name a tester (D112) and run wave 1** — 44 cells, ~21 h, Windows only. The
   only thing standing between this repository and the first non-zero value its
   AT ratchet has ever had. Runbook:
   [`TASK-R2-O2-wave-1-runbook.md`](./TASK-R2-O2-wave-1-runbook.md).
2. **TASK-R2-O1** — the `DzFileUpload` Tier-D `browser-matrix` violation is the
   single red link in `validate:all` and has been for three packets. It also owns
   the 22 stale `perf-baseline` cells.
3. **Decide D109–D111** (pairing vocabulary) — cheap now, and it gets cheaper the
   fewer run records exist. Both repositories are at zero; this is the floor.
4. **Decide D114** (C9 claim) — gates what 1.0 may say about accessibility, and
   the README's WCAG AA claim is written today.
5. **D115 / script Tier B** — 67 components, 67 required cells, no scripts. The
   largest remaining tranche of the AT ratchet.
6. **D116** — audit the remaining done-checks in this programme before another
   agent records `found-done` on one that cannot fail.
