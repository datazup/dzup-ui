# RESIDUAL-19 — what `contract-spec` and `unit-spec` actually prove: 283 citations, 94 withdrawn

**Repository** `ui/dzup-ui` (OSS, scope `@dzup-ui/*`) · **HEAD** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`
· **entry dirty paths** 459 → **exit 462** · **date** 2026-09-30

> **STATUS: INCOMPLETE — the closing gates did not run.** `yarn validate:all` and `yarn test` were
> started and the host stopped the run for low memory before either began (§5). Everything above
> them in §5 ran and is green. **Do not quote this batch as validated until those two are run.**

## 0. The two items

1. **`contract-spec` / `unit-spec` measured existence, not conformance** — RESIDUAL-16 §9 and
   RESIDUAL-17 §7 item 7 / §8 item 1: 283 citations, the last of RESIDUAL-16's named kinds left
   untightened.
2. **The three `toBeTruthy()`-only SSR citations** RESIDUAL-16 §3.3 named — `DzCheckboxGroup`,
   `DzPersonaSelector`, `DzTreeSelect` in `packages/core/tests/ssr/form-controls-ssr.spec.ts`.

This batch was run in the orchestrating session, not in a fresh subagent: four subagent launches
died on HTTP 529 before any of them wrote a byte (the tree was verified identical to entry each time).

---

## 1. The population — re-measured, and the claimed number holds

Census by script over `packages/core/docs/capability-matrix.json` at entry:

| Kind | `present` | `unrun` | By tier (`present`) |
|---|---:|---:|---|
| `contract-spec` | **142** | 2 | A 54 · B 66 · C 21 · D 1 |
| `unit-spec` | **141** | 3 | A 54 · B 65 · C 21 · D 1 |

**283, as claimed.** One artifact per cell, so 283 citations and 283 distinct files.

**The premise was understated.** The generator did not check "existence plus one live assertion" —
that was RESIDUAL-16's *audit* criterion. The generator's own rule was the sidecar file being on disk
(`generate-capability-matrix.ts`, the two `case` arms this batch replaced). An empty
`DzX.contract.spec.ts` would have been `present`.

## 2. The criterion — stated before the judging, and taken from the repository

`packages/contracts/src/quality-tiers.ts` documents the two kinds:

- `contract-spec` — *"`Dz{Name}.contract.spec.ts` — Contract Spec v1 props/events/slots/ARIA."*
- `unit-spec` — *"`Dz{Name}.spec.ts` — render and behaviour units."*

The strongest existing contract specs (`DzButton`, `DzBackTop`) are laid out in exactly those four
sections. So the criterion is the cell's own sentence, made checkable:

| Surface | **Owed** when the component itself declares it | **Touched** when the spec's live code has |
|---|---|---|
| `props` | `Dz{Name}Props` declares a member | `props:` / `attrs:` / `.setProps(` / an attribute on the component's tag / `h(Dz{Name}, { … })` |
| `events` | `Dz{Name}Emits` declares a member | `.emitted(` / an `on{Event}` listener / `@event=` |
| `slots` | `Dz{Name}Slots` declares a member | `slots:` / `<template #…>` / children in the component's tag / `h(Dz{Name}, …, { default … })` |
| `aria` | the `<template>` writes `role` or an `aria-*` other than `aria-hidden` | `aria-*` / `role` / `getByRole` / `toHaveAccessible…` |
| `behaviour` (`unit-spec`) | the SFC calls `defineEmits` or `defineModel` | `.trigger(` / `.setValue(` / `.setProps(` / `.emitted(` / `dispatchEvent` / `userEvent` / `fireEvent` / `.click()` |

"Live code" is the comment-stripped file with every `it.skip` / `it.todo` / `it.fails` block blanked,
and at least one live block must contain an `expect`.

### 2.1 The stated limit — this is a surface-touched predicate, not a conformance proof

Whether Contract Spec v1 *conformance* is decidable from text is not settled here, and the module
says so in its header. What the predicate does **not** do:

- it does not check that **every** declared member is covered — one asserted event satisfies `events`
  on a component that declares five;
- it **cannot tell an assertion from its negation** (RESIDUAL-17 §7 item 1). That limit is pinned by
  a test named for it rather than worked around;
- **applicability is conservative by construction**: inherited members (`extends BaseEvents`), an
  interface declared in another component's `.types.ts`, and ARIA bound from script are invisible, so
  the surface is treated as *not owed*. The predicate can under-ask; it is built not to over-ask.
  `describe.skip` is not recognised (no component spec uses it today — grep returns zero).

Two over-asks were found by reading verdicts and removed **before** the numbers below were taken:
`aria-hidden` on a decorative icon no longer makes ARIA owed (7 components stopped owing it, 2 of which — `DzStatCard` among them —
had been judged W for it), and a
render-function mount `h(DzRadio, { value })` now counts as touching props (`DzRadio`).

## 3. The verdicts — 283 adjudicated, 94 withdrawn

| Kind | Citations | **G** | **W** | W by tier |
|---|---:|---:|---:|---|
| `contract-spec` | 142 | **62** | **80** | A 22 · B 37 · C 20 · D 1 |
| `unit-spec` | 141 | **127** | **14** | A 4 · B 10 · C 0 · D 0 |

Surfaces owed across the 142 contract specs: props 138 · events 67 · slots 129 · ARIA 111.

**`contract-spec` W by surface** (a spec can miss more than one; 36 miss two or three):

| Missing | Count | Components |
|---|---:|---|
| `events` | **41** | DzAccordion DzAffix DzAnchor DzAnimatedNumber DzAvatar DzBlockUI DzCalendar DzCarousel DzCheckbox DzCheckboxGroup DzCommandPalette DzCopyButton DzCountdown DzDataView DzDeferredContent DzImage DzImageComparison DzInfiniteScroll DzLightbox DzList DzListbox DzMegaMenu DzOrderList DzOtpInput DzPanel DzQRCode DzRadioGroup DzResizable DzScrollProgress DzSearchInput DzSegmented DzSidebar DzSpeedDial DzStepper DzSwitch DzTagsInput DzToast DzTour DzTransfer DzTree DzTreeSelect |
| `slots` | **44** | DzAnchor DzAnimatedNumber DzCalendar DzCascader DzCodeBlock DzColorModeToggle DzColorPicker DzCombobox DzCommandPalette DzCopyButton DzCountdown DzDataGrid DzDatePicker DzDateRangePicker DzDescriptions DzFab DzFileUpload DzKnob DzListbox DzMegaMenu DzMention DzMeterGroup DzMultiSelect DzPagination DzPasswordInput DzPersonaSelector DzProgress DzQRCode DzRangeSlider DzRating DzRelativeTime DzRunStatusBadge DzSearchInput DzSegmented DzSelect DzSlider DzTagsInput DzTimePicker DzTokenProgressBar DzTour DzTransfer DzTree DzTreeSelect TeamMemberBadge |
| `aria` | **34** | DzAppShell DzAvatar DzCheckbox DzCodeBlock DzCollapse DzColorPicker DzCombobox DzDatePicker DzDateRangePicker DzEmpty DzFileUpload DzImage DzKbd DzLightbox DzMultiSelect DzNotification DzPasswordInput DzRadio DzRangeSlider DzResizable DzResult DzRunStatusBadge DzScrollArea DzSearchInput DzSegmented DzSidebar DzSlider DzSplitter DzSwitch DzTag DzTimePicker DzToast DzTransfer GovernanceBadge |
| `props` | 0 | — |

**`unit-spec` W — all 14 are `no-behaviour`:** DzAlert DzAsyncBoundary DzAvatar DzDialog DzFab DzImage
DzInput DzLightbox DzPopover DzSegmented DzSheet DzTextarea DzToast DzTooltip.

**Read by hand, not only scripted** — a sample across every surface: `DzCheckbox.contract.spec.ts`
has nine tests and none mentions `change`; `DzAccordion`'s seven never assert `change` or `revealed`;
`DzTour`'s ten never assert `finish`/`close`/`change`; `DzSelect` declares `trigger`/`item` slots and
fills none; `DzInput.spec.ts` has 23 tests and never types into the input; `DzDialog.spec.ts` has 25
and never opens or closes anything by interaction. The per-row verdicts are `verdicts.json` in the
session scratchpad.

### 3.1 The number that frames the owner decision

**Of the 80 contract specs, 50 are covered when the contract spec and the unit spec are read
together** — the missing surface is asserted in `Dz{Name}.spec.ts` instead. Only **30** leave a
declared surface untouched by *either* file (A 4 · B 13 · C 12 · D 1). So most of the fall is
assertions living in the wrong file for the column that names them, not assertions that do not
exist. That is `D-RES19-1` (§4). Six components lose **both** cells: DzAvatar DzFab DzImage DzLightbox
DzSegmented DzToast.

## 4. What was changed

| File | Change |
|---|---|
| `packages/tooling/src/quality/spec-contract-surfaces.ts` | **new** — `surfacesOwed`, `missingContractSurfaces`, `unitSpecGap`, `liveSpec`, `declaredMembers`, `hasBehaviour` |
| `packages/tooling/src/quality/spec-contract-surfaces.spec.ts` | **new** — 25 tests, fixtures reduced from real files, incl. comment-only, skipped-only, no-assertion, longer-name and the pinned negation limit |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | the two existence `case` arms replaced by exported, pure `sidecarSpecCell` |
| `packages/tooling/src/validators/capability-matrix-ceilings.json` | gate 8 move declared: `contract-spec` 142 → 62, `unit-spec` 141 → 127, `totals.present` 611 → 517, one `//moves` line |
| `packages/core/tests/ssr/form-controls-ssr.spec.ts` | item 2 — three `toBeTruthy()` assertions replaced (§4.2) |
| generated | `capability-matrix.json`, `capability.generated.ts`, `component-meta.json`, `llms*.txt`, docs pages, `nav.json` — via `yarn regenerate:all` |

A withdrawn cell is **`unrun` with the spec still cited** and a note naming the missing surfaces. That
is the shape the Tier D gate already reads as "a gap somebody has made a place for", so
`DzFileUpload`'s withdrawn `contract-spec` does not trip it. **No spec was written to win a cell back.**

### 4.1 Movement

| | pass | present | unrun | excepted | stale | fail |
|---|---:|---:|---:|---:|---:|---:|
| entry | 558 | 611 | 397 | 74 | 22 | 0 |
| **exit** | **558** | **517** | **491** | 74 | 22 | 0 |

Per tier after (`pass/fail/present/stale/unrun/excepted`): A `106/0/150/0/90/4` · B `300/0/264/0/287/66`
· C `145/0/92/21/112/4` · D `7/0/11/1/2/0`. Only `contract-spec` and `unit-spec` moved.

### 4.2 Item 2 — the three SSR assertions

| Component | Was | Now |
|---|---|---|
| `DzCheckboxGroup` | `toBeTruthy()` | two children, one in the model: `role="group"`, 2 × `role="checkbox"`, exactly 1 `aria-checked="true"` and 1 `"false"` |
| `DzTreeSelect` | `toBeTruthy()` ×2 | the trigger label contains `Alpha` through `value` **and** `modelValue`, and an unselected render does not contain it |
| `DzPersonaSelector` | `toBeTruthy()` | `value="Ada Lovelace"` — the model is an id, the field must show the name |

The real server output was probed first with a temporary spec (deleted; none survives). Moves no cell.
The same file still has `toBeTruthy()`-only assertions for `DzOtpInput`, `DzMultiSelect` and
`DzCombobox`, which RESIDUAL-16 did not name; left, and listed in §7.

## 5. Validation — every exit code read from a log file

| Gate | Exit | Result |
|---|---:|---|
| `vitest run spec-contract-surfaces.spec.ts` | **0** | 25 / 25 |
| `vitest run form-controls-ssr.spec.ts` | **0** | 50 / 50 |
| `yarn generate:capability-matrix` + `yarn validate:capability-matrix`, **before** declaring | **1** | gate 8 fired exactly twice: `` `contract-spec` / present FELL 142 → 62 (-80) ``, `` `unit-spec` / present FELL 141 → 127 (-14) `` |
| same, **after** declaring | **0** | `pass 558 (recorded 558) · present 517 (recorded 517)`; "no Tier D cell is unexplained" |
| `yarn regenerate:all` | **0** | 7 of 7 steps (steps 3–6 owed by the capability change) |
| `yarn typecheck:tooling` | **0** | no output |
| `eslint --max-warnings 0` over the 4 changed source files | **0** | no output, no `--fix` |
| targeted `vitest run` over `packages/tooling/src/quality`, `validators/capability-matrix.spec.ts`, `src/docs` | **not run** | started; the host stopped the batch for low memory during startup |
| **`yarn validate:all`** | **NOT RUN** | same stop |
| **`yarn test`** ×2 | **NOT RUN** | same stop |

**The stop was the host's, not a gate's**: the harness killed the background run for system memory
pressure and instructs that it not be restarted without the owner asking. So the three rows above are
owed. The specific risk they would catch: `packages/tooling/src/docs/evidence.spec.ts` (the
component-meta join), any spec that pins the old 611 / 142 / 141 figures, and `docs-size`.

### 5.1 Seeded breaks — six, each predicted before it was measured, all restored byte-identically

| # | Seed | Predicted | Measured |
|---|---|---|---|
| P1 fall | `DzBackTop.contract.spec.ts`: its only event test → `it.skip` | `contract-spec` present 62 → 61, gate 8 exit 1 | **exit 1**, `FELL 62 → 61 (-1)` |
| P2 control | `DzCheckbox.contract.spec.ts`: add an `emitted('change')` assertion only (ARIA still missing) | no move, exit 0 | **exit 0**, 517 recorded 517 |
| P3 rise | same file: add the event **and** an `aria-label` assertion | 62 → 63, gate 8 exit 1 | **exit 1**, `ROSE 62 → 63 (+1)` |
| S1 | `DzCheckboxGroup.vue`: context `modelValue` → an empty computed | 1 test | **1 failed / 49 passed** — the group test |
| S2 | `DzTreeSelect.vue`: trigger renders `.key` instead of `.label` | 1 test | **1 failed / 49** — `expected '…>a</spa…' to contain 'Alpha'` |
| S3 | `DzPersonaSelector.vue`: `label: p.id` | 1 test | **1 failed / 49** — `to contain 'value="Ada Lovelace"'` |

`sha256sum -c` printed `OK` for all seven files involved, including `capability-matrix.json` and
`capability.generated.ts` after the final regeneration. P2 is worth noting: it is a **negated**
assertion and it satisfied `events` — the stated limit, observed.

## 6. Ratchets and residue

**NO CEILING WAS RAISED AND NO ALLOWLIST WAS WIDENED.** `capability-matrix-ceilings.json` was opened
once, for gate 8's declared move **downward**. `staleCells` 22 / ceiling 22, `staleCellKinds`,
`unrunCells.baseline` (still 400 at `4e4e46f`; tree now reads 491) untouched.
`anatomy-keyboard-ceilings.json` not opened. Not re-read this batch because `validate:all` did not
run: `unclassified`, `maxWithoutAnatomy`, `maxProposedCitedFromCode`, AT, locales, inline-style
(`regenerate:all` step 7 printed 81 static + 52 bound = **133**, unmoved), `maxUndeclaredHandlers`.

**Dirty paths 459 → 462 (+3, nothing removed):** ` M packages/core/tests/ssr/form-controls-ssr.spec.ts`,
`?? …/spec-contract-surfaces.ts`, `?? …/spec-contract-surfaces.spec.ts`. Every other file this batch
changed was already dirty at entry. ` M yarn.lock` untouched; no `yarn install`; `npx` never used; no
process killed by name; no git state change beyond the `git fetch` recorded in
`INTEGRATION-origin-main-2026-09-30.md`.

**Changesets: none.** Tooling (unpublished), one test file, generated artifacts and docs.

## 7. Owner decisions

### `D-RES19-1` 🔴 RAISED — is a contract judged per file or across the sidecar pair?

50 of the 80 withdrawn `contract-spec` cells have the missing surface asserted in the unit spec.

- **(a)** Keep per-file (as landed). The column means what its name says; 80 cells are owed work, 50 of
  them a move of existing assertions into the contract spec.
- **(b)** Credit across the pair. Restores 50 cells with no spec change, and makes `contract-spec` and
  `unit-spec` two names for one fact.
- **(c)** Keep per-file, and add a note on the 50 saying the assertion exists next door.

**Recommendation: (a), then (c) if the 50 are not scheduled.** (b) undoes the distinction the two
kinds exist to draw.

### `D-RES19-2` 🟡 RAISED — should "every declared member" be the bar?

The predicate asks for one touch per surface. A per-member rule (every declared event asserted, every
slot filled) is mechanically possible for events and slots and would withdraw more cells. Not done:
it is a standard the repository has not written down. **Recommendation: decide after the 80 are
worked, not before.**

**Closed:** RESIDUAL-17 §7 items 6 and 7. **Untouched:** `D-RES13-1`, `D-RES13-2` (reporter half),
`D-RES16-1`, `D-RES17-1`.

## 8. Not done, named

1. **`yarn validate:all`, `yarn test` ×2 and the wider targeted tooling run** (§5). This is the item
   that matters.
2. **No independent verification pass** has been run over this batch.
3. **The 94 withdrawn cells are not re-earned** — by design; they are the next packet.
4. `DzOtpInput`, `DzMultiSelect`, `DzCombobox` still assert only `toBeTruthy()` in
   `form-controls-ssr.spec.ts`.
5. `describe.skip` is not recognised by `liveSpec`; inherited `Emits`/`Slots` members are not
   followed.
6. **The whole batch sits on a tree 92 commits behind `origin/main`.** Its generated outputs are among
   the 157 generated conflicts already counted; its three source files are not touched upstream.

## 9. Ranked next packet

1. **Run the owed gates** (§8 item 1), then an independent verification of this batch.
2. **Commit, then merge `origin/main`** — `INTEGRATION-origin-main-2026-09-30.md`. Re-seed gate 8 from
   the merged tree in one declared move.
3. **The 30 contract specs no file covers** (§3.1) — real missing assertions, Tier C/D first:
   `DzFileUpload` (D), then the 12 Tier C.
4. **The 50 pair-covered contract specs** — per `D-RES19-1`.
5. **The 14 unit specs with no behaviour** — `DzInput`, `DzTextarea` and `DzDialog` first.
