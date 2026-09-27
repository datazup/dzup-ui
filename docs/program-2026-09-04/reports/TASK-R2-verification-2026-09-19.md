# Independent verification of the 2026-09-19 programme work — and the corrections it produced

> Measured **2026-09-19** at `main` @ `2d51eec`, working tree dirty
> (**448 paths at start, 451 at end** — the three added are
> `docs/program-2026-09-04/README.md` and `packages/tooling/src/perf-bench.spec.ts`,
> which were tracked and clean before this pass edited them, and **this report**;
> every one of the original 448 is preserved untouched).
>
> **Why this is a report and not a ledger section.** README §5 `<handoff>` puts
> substantive artifacts under `reports/` and keeps `EXECUTION-STATUS.md` as the
> index — that is how `TASK-R2-O5-geometry-review.md`, the decision sheets and
> the pairing packet are filed. This audit crosses **seven tasks** and belongs to
> none of them, so a per-task row would misfile it and a new ledger section would
> put 300 lines of prose inside a table of one-line statuses. The ledger gets a
> pointer; the evidence lives here.

---

## 0. What this pass is, and what it deliberately is not

An independent verification measured **22 claims** made by the 2026-09-19
programme work. It found **1 refuted as worded** and **11 discrepancies** in the
evidence trail. This pass **corrected the record**. It did not redo the work, and
it changed code behaviour **nowhere**.

**The single code edit** is a doc-comment in
`packages/tooling/src/perf-bench.spec.ts` that asserted something false. No
executable line was touched, in that file or any other.

**Everything re-measured before being written.** Every number below was measured
in this session by the command or script named beside it; nothing was copied
forward from a handoff, including the numbers the verifier supplied. Where my
measurement differs from the verifier's, the difference is stated (§4).

---

## 1. The refuted claim

**Claim 12 — "raw colour literals 5 → 0" — is refuted as worded.** It reads as
*removal*. Nothing was removed.

`packages/tooling/src/perf/tier-fixtures.ts` still contains, and is meant to
contain, the literals the ratchet implies were deleted:

| line | literals |
|---|---|
| `:152` | `#3366ff` |
| `:154` | `#000000` · `#ffffff` · `#ff0000` · `#00ff00` · `#0000ff` |

**They are load-bearing, and the reason *is* recorded** — in
`TASK-R2-O7-handoff.md` §4 and in the file itself. They are `DzColorPicker`'s
`modelValue` and `presets`: values the component **parses**, not styling. The
fixture exists to isolate that component's paint cost, and `var(--dz-primary)`
is a string the picker rejects, which would mount an empty shell and make the
fixture measure nothing.

What actually moved is the **violation count** `validate:tokens` reports, `5 → 0`,
achieved with the **pre-existing, line-scoped** `// token-check-disable-line`
directive — a mechanism that is at HEAD (`color-lint.ts:194-195`) and was not
invented for this.

**Two details the original framing blurred, both measured here:**

- **Six hex values are present; the validator flags five.** `#000000` is not
  matched because the hex pattern requires at least one `a`–`f` letter
  (`color-lint.ts:135`), so numeric ids like `#1234` do not trip it. "5" is a
  violation count, never a literal count.
- **Two corrections to the verifier's own account of the mechanism**, both
  checked at HEAD: `color-lint.ts` lives at
  `packages/tooling/src/token-checks/color-lint.ts`, not `src/validators/`; and
  `DzColorPicker.spec.ts` is precedent for the **file**-scoped
  `token-check-disable-file`, not the line-scoped directive. The line-scoped
  precedent at HEAD is `token-check-disable-next-line` in
  `stories/data/DzCodeBlock.stories.ts:32` and `stories/media/DzQRCode.stories.ts:113`.

The handoff body (§4) was honest throughout; only the ratchet line and the
ledger row framed it as removal. Both are corrected in place.

### 1.1 What the refutation uncovered — D139

Checking *how* the suppression works produced a finding the verification did not
have. `checkSource()` decides the **file-scoped** exemption with
`content.includes(FILE_ALLOW_RAW_VALUES_MARKER)` (`color-lint.ts:338`) — a
**comment-blind substring test over the whole file**. `tier-fixtures.ts:149`
contains the sentence explaining why the file-scoped marker was *rejected*, and
it spells the marker out. **Naming it applies it.**

Measured by driving `checkSource()` on the real file, four ways:

| condition | violations |
|---|---|
| as it ships today | **0** |
| file-marker string neutralised, `-line` directives kept | **0** |
| `-line` directives stripped, file-marker string kept | **0** |
| both removed — the true raw count | **5** |

Row 2 proves the intended narrow suppression **is** sufficient on its own. Rows 1
and 3 prove it is **not** what is load-bearing: the file is *also* exempt
file-wide for group 1, which is the precise outcome its comment says it avoided.
So §4's claim that *"the other 21 fixtures stay armed"* is **false**.

Registered as **D139**, with the blast radius measured across all **1,731**
`.ts`/`.vue` files under `packages/`: 16 carry a marker string, 11 apply one
deliberately, and **5 are exempt purely because they name one in prose**. Only
`tier-fixtures.ts` currently suppresses real violations. The sharpest instance is
`stories/forms/DzColorPicker.stories.ts:2`, whose comment reads *"Deliberately
NOT `token-check-disable-file`"* — and thereby applies it, disarming the guard
TASK-FREE2-07 installed against that exact regression.

**Not fixed.** Deleting a marker's name from a comment re-arms a gate over 21
fixtures; that is a behaviour change this pass is not authorised to make.

---

## 2. The discrepancies, ranked

Ranked by what a reader would get wrong if the record stood. ✎ = corrected in
place; ⚑ = registered as a defect instead, because fixing it changes behaviour.

| # | Sev | Discrepancy | Recorded | Measured | Where |
|---|---|---|---|---|---|
| 1 | 🔴 | **Claim 12** — "colour literals 5 → 0" reads as removal | literals removed | **5 literals retained, suppressed line-by-line**; the *violation count* went 5 → 0 | ✎ §1 |
| 2 | 🔴 | **"the other 21 fixtures stay armed"** | armed | **unarmed** — the rejection comment applies the file-scoped marker | ⚑ **D139** |
| 3 | 🔴 | **`perf-bench.spec.ts:117`: "`size` … gates always"** | gates always | **gates never** — nothing asserts a `size:*` metric anywhere | ✎ + ⚑ **D140** |
| 4 | 🔴 | **`browser-degradation` presented as a landed gate** | landed, proven | proven code, **zero protection** — its baseline is untracked | ⚑ **D141** |
| 5 | 🟠 | **`known-failures.json`'s 28 entries "stand"** | 28 entries present | **`entries: []`** since `closedAt` 2026-08-31 (all 46 closed: 28 Target Size + 18 Reflow) | ✎ §3.3 |
| 6 | 🟠 | **`stale` cell count** | unreported | **12 → 22**, a regression, while three sibling ratchets improved | ⚑ **D143** |
| 7 | 🟠 | **Unit tests "+22: DzResizable 13 → 20, DzSplitter 13 → 18"** | +22 | **+25: 9 → 21, 13 → 19, 55 → 62** = **77 → 102** | ✎ §3.1 |
| 8 | 🟠 | **§9.2 sums to 100; §9.14 says 102** — internal contradiction | both printed | **102 is right**; the breakdown was wrong | ✎ §3.1 |
| 9 | 🟠 | **i18n ratchet "112 → 116"** bound to a moment, not a commit | 112 → 116 | **110 → 116 (+6) against HEAD** | ✎ §3.2 |
| 10 | 🟠 | **`DzTableCell` `role="separator"` on a `<button>`** | conformant | **not permitted by ARIA-in-HTML**, and ungated | ⚑ **D142** |
| 11 | 🟠 | **`DZUP_BROWSER_EVIDENCE_*` exits 0** over arbitrary files | banner ⇒ safe | banner fires, **exit 0** — a green transcript over fabricated data | ⚑ **D144** |
| 12 | 🟢 | **`locales/{en,de,pseudo}.json`** | three packs | **two** — no `pseudo.json` exists | ✎ §3.4 |
| 13 | 🟢 | **`validate:all` "37 links"** | 37 | **44** (HEAD 43 + `validate:at-scripts`) | ✎ §3.6 |
| 14 | 🟢 | **`dirtyPathCount` 427 vs 443 at one `sourceCommit`** | unexplained | **both honest**, different moments | ✎ §3.5 |
| 15 | 🟢 | **Unit-test ratchet baseline "81"** | 81 | **77** at HEAD | ✎ §3.1 |

**On the count.** The verification reported **11** discrepancies; this pass
measured **15** at the granularity it corrected them, because three of its items
each carried more than one wrong number (the unit-test row alone carries four)
and because §1.1's D139 was found while checking claim 12 rather than supplied.
No attempt is made to reconstruct the verifier's exact partition — the list above
is what was measured here.

---

## 3. The corrections, with their measurements

### 3.1 Unit tests — `77 → 102` (+25), not `+22`

Measured twice, agreeing.

*Statically*, counting `it(`/`test(` at file scope in `git show HEAD:<spec>`
versus the worktree — no `.each` blocks exist in any of the three, so static and
runtime counts must match:

| spec | HEAD `2d51eec` | worktree | Δ |
|---|---|---|---|
| `layout/DzResizable.spec.ts` | 9 | **21** | +12 |
| `layout/DzSplitter.spec.ts` | 13 | **19** | +6 |
| `data/DzTable.spec.ts` | 55 | **62** | +7 |
| **total** | **77** | **102** | **+25** |

*By running them* — `yarn vitest run` over the three files:
**3 files passed · 102 tests passed · exit 0**. 21 + 19 + 62 = 102. ✓

The recorded `"+22: DzResizable 13 → 20, DzSplitter 13 → 18, DzTable 55 → 62"` is
wrong on four of its six numbers **and sums to 100**, contradicting the same
handoff's own ratchet row of `102`. The `102` was right all along; the breakdown
and the `81` baseline were not. Corrected at
`TASK-R2-O5-handoff.md` §9.2 step 5, §9.13, §9.14 and the live-progress
checklist, and in the `EXECUTION-STATUS.md` row.

### 3.2 i18n catalog — `110 → 116` against HEAD

Measured by flattening `messages.*` in
`packages/core/src/i18n/locales/en.json`, at `git show HEAD:…` and in the
worktree: **110 → 116**, six keys, none removed. (Whole-document key counts are
113 → 119; the extra three are the `locale` / `direction` / `fallback` envelope,
which is not catalog content.)

The `112` is real but is **TASK-R2-O5's own phase-1 result**, not a repository
baseline — and both phases belong to that same task:

| phase | date | keys | added |
|---|---|---|---|
| HEAD `2d51eec` | — | **110** | — |
| phase 1 — SC 3.3.8 | 2026-09-18 | **112** | `DzPasswordInput.showPassword` · `.hidePassword` |
| phase 2 — D117/A steppers | 2026-09-19 | **116** | `DzResizableHandle.shrinkPane` · `.growPane` · `DzTableCell.narrowColumn` · `.widenColumn` |

Restated bound to HEAD with both phases kept visible, per
`<evidence_rules>` ("bind every quoted metric to a commit").

### 3.3 `known-failures.json` — the 28 stay **closed**

`e2e/matrix/known-failures.json` carries **`entries: []`**. It records
`closedAt: "2026-08-31"` and `closedBy: "TASK-N1-O3. All 46 entries — 28 WCAG 2.2
SC 2.5.8 Target Size and 18 SC 1.4.10 Reflow — were closed and removed…"`.

The intent is confirmed by `TASK-R2-O5-geometry-review.md` §4 and §4.1, which say
it correctly three times: *"28 entries **left** `known-failures.json` on the
strength of these changes"*, *"reverting them re-opens 28 measured failures"*,
*"the 28 entries stay closed"*. Only the ledger's compression — *"`known-failures.json`'s
28 entries stand"* — inverted it. Rewritten to name the right artifact and the
right fact: the 28 that TASK-N1-O3 **closed** stay closed; a revert would have had
to put them back with their measured numbers, which is what makes the file a
ratchet.

### 3.4 `pseudo.json` does not exist

`ls packages/core/src/i18n/locales/` → exactly **`de.json`** and **`en.json`**, at
HEAD and in the worktree. No pseudo-locale pack exists or was written. The
implemented-files row naming `locales/{en,de,pseudo}.json` is corrected.

### 3.5 `dirtyPathCount` — a snapshot, not a property of the commit

Confirmed as stated: `packages/core/security/coverage.json` carries
`dirtyPathCount: 427`, `e2e/matrix/browser-evidence.json` carries `443`, both
stamped `sourceCommit: 2d51eec`. **Both are honest**, taken at different moments
of a tree that gained paths all day.

**The stamps are not rewritten** — they are measurements, and back-dating one to
match the other would destroy the provenance the field exists to record. Instead
a note was added to `TASK-R2-O1-handoff.md` §0.2: `sourceCommit` is the only
field comparable across artifacts; a difference in `dirtyPathCount` means *"these
ran at different moments"*, never *"one of them is wrong"*.

### 3.6 `validate:all` has 44 links

Counted from `package.json` rather than quoted:

```
node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"   → 44
```

and diffed against HEAD: **HEAD 43 → worktree 44**, the single addition being
`yarn validate:at-scripts`; nothing removed. README §5's `<validation>` block said
*"typecheck + lint + 35 validators = 37 links"*. Corrected to **44** (typecheck +
lint + 42 validators), with the counting command inlined so the next agent counts
instead of quoting.

Other occurrences of "37" were checked and **left alone** — every one is
historical and correctly bound to its commit (`program-2026-09` ledgers at
`99b963a`, `TASK-R3-O1-handoff.md`'s "link 16/37 at `99b963a`", and the ratchet
board's own `16 (of 37) → 22 (of 44)`).

---

## 4. Where this pass differs from the verification it is correcting

Three of the verifier's supporting details did not survive re-measurement. None
changes a conclusion; all three are recorded so the next reader is not sent to a
path that does not exist.

| Verifier said | Measured |
|---|---|
| `color-lint.ts` is at `packages/tooling/src/validators/color-lint.ts` | **`packages/tooling/src/token-checks/color-lint.ts`**; `src/validators/color-lint.ts` does not exist, at HEAD or in the worktree |
| line-scoped precedent is `DzColorPicker.spec.ts` | That file uses the **file**-scoped `token-check-disable-file`. Line-scoped precedent at HEAD is `-next-line` in `DzCodeBlock.stories.ts:32` and `DzQRCode.stories.ts:113` |
| the bare `catch {}` is at `capability-matrix.ts` ~line 58 | **`:103-105`**; `readCommittedBrowserEvidence()` begins at `:91`. (`:58` is inside the file's header comment.) |

And one thing the verification **missed**, found while checking claim 12: **D139**
(§1.1). The narrow suppression the whole of §4 argues for is not what is holding
the gate green; the file is accidentally exempt file-wide, and the mechanism
that does it has four more instances.

Two of the verifier's figures were **stronger than claimed** on re-measurement,
and are recorded at the stronger value:

- **`size:*` budgets** — not merely "not wired into a gate": **no code path
  asserts a `size:*` metric at all**. They are produced by
  `perf/capture-baselines.ts:250` and read by nobody. See **D140**.
- **The `DzTableCell` ARIA risk has precedent** — `axeGates.ts:126` already
  records an open, ungated `aria-allowed-role` instance (`DzMention` putting
  `role="combobox"` on a `<textarea>`), so gating the rule closes two. See **D142**.

---

## 5. Defects registered

Six, continuing from D138. **None is fixed here** — each is an owner call or a
follow-on packet, and four of them would change gate behaviour.

| # | Sev | One line |
|---|---|---|
| **D139** | 🟠 | A comment explaining why a file-scoped lint marker was *rejected* switches that marker on (`content.includes()` is comment-blind) |
| **D140** | 🔴 | The 22 `size:*` budgets are enforced by nothing; 20 of 22 breached, worst +15.8 % — extends D135 and corrects the comment that denied it |
| **D141** | 🔴 | `browser-degradation` is inert until the ledger is committed; plus a bare `catch {}` that cannot tell a corrupt HEAD ledger from a missing one |
| **D142** | 🟠 | `role="separator"` on a `<button>` — an ARIA-in-HTML risk nobody gates, on the component whose SC 2.5.7 evidence depends on it |
| **D143** | 🟠 | `stale` cells 12 → 22 — a ratchet that regressed unnoticed because `stale` is `report`-level |
| **D144** | 🟠 | `DZUP_BROWSER_EVIDENCE_*` exits 0, so the debug hatch can certify a tree as well as prove a gate |

Full findings, evidence, options and recommendations are in
[`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md) § *Owner decisions raised by
this program*.

**The one recommendation worth repeating here**, because it is the only one with
a cheap, immediate check: after the owner commits
`e2e/matrix/browser-evidence.json`, re-run `yarn validate:capability-matrix` and
confirm the note reads **"N committed `pass` cell(s) compared"** and *not*
**"no committed browser ledger"**. That sentence is the only evidence the gate is
live.

---

## 6. Structural invariants — all held

Each verified in this session, not assumed.

| Invariant | Evidence |
|---|---|
| **Nothing committed** | `git rev-parse --short HEAD` → `2d51eec`, unchanged from session start |
| **Nothing published, pushed, stashed, checked out or cleaned** | none attempted; no such command was run |
| **No baseline accepted** | `packages/core/perf/baselines.json` and `e2e/visual/` PNGs: not in `git status` as touched by this pass; no `visual:accept` run |
| **No workflow edited** | `git status --porcelain -- .github/` → empty |
| **AT cells untouched** | `validate:at-matrix` → **534 cells · 0 executed · 534 unrun**, `required executed 0`. Exit 0 |
| **No ceiling raised** | no edit to `adr-registry.json`, `ANATOMY_PART_EXTENSIONS`, `wcag-deviations.json`, the Storybook size budget, or any `max*` field |
| **No exception added** | `known-failures.json` and `engine-exceptions.json` not touched; **no new `eslint-disable`, `token-check-*` marker, or `test.fail()` was written anywhere** |
| **No suppression silencing a real failure** | the only code edit is a doc-comment; it removes a false claim and adds none. D139 documents an *existing* over-suppression rather than adding one |
| **All pre-existing dirty work preserved** | **448 → 451 paths**; the three added are `docs/program-2026-09-04/README.md` and `packages/tooling/src/perf-bench.spec.ts` (tracked and clean before this pass edited them) and this report. Every one of the original 448 is untouched by it |

---

## 7. Aggregate

`yarn validate:all`, run end to end, exit code read from a file and never through
a pipe:

```
yarn validate:all > validate-all.log 2>&1 ; echo "exit $?"   → exit 0
```

**44 of 44 links green.** The chain's own composition was verified the same way
it is now documented — counted from `package.json`, not quoted.

---

## 8. Files changed by this verification

| File | Change |
|---|---|
| `docs/program-2026-09-04/README.md` | §5 `<validation>`: `37 links` → **44**, with the counting command inlined |
| `docs/program-2026-09-04/EXECUTION-STATUS.md` | R2-O7 row: colour-literal ratchet reframed as suppression, not removal · R2-O5 row: i18n bound to HEAD, unit tests `+22 → +25`, `known-failures.json` sentence rewritten · register: **D139–D144** · pointer to this report |
| `docs/program-2026-09-04/reports/TASK-R2-O7-handoff.md` | §4: correction block for D139 and the "21 fixtures stay armed" claim · §11: ratchet row reworded + correction note · §11 preamble: "fixing them" → "suppressing them" |
| `docs/program-2026-09-04/reports/TASK-R2-O5-handoff.md` | §9.2 steps 4–5, §9.13, §9.14 and the live-progress checklist: i18n bound to HEAD, unit tests corrected to `77 → 102`, `pseudo.json` removed · §9.14: correction block |
| `docs/program-2026-09-04/reports/TASK-R2-O1-handoff.md` | §0.2: note that `dirtyPathCount` is a point-in-time snapshot and will differ between artifacts stamped at the same commit |
| `packages/tooling/src/perf-bench.spec.ts` | **The only code edit.** The doc-comment claiming `size` "gates always" replaced with the three measured reasons it does not (D140). No executable line touched |
| `docs/program-2026-09-04/reports/TASK-R2-verification-2026-09-19.md` | This report (new) |

Nothing committed. The owner commits.
