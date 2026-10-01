# RESIDUAL-17 — a two-way ratchet on `pass`/`present`, and the portal hydration harness

*Written incrementally, 2026-09-29. Repository: `ui/dzup-ui` (OSS, scope `@dzup-ui/*`).
HEAD `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`, **421 dirty paths at entry**, uncommitted by
design. The entry `git status --porcelain` was snapshotted to the session scratchpad
(`RESIDUAL-17-entry-git-status.txt`, 421 lines) before any edit.*

---

## 0. The two items

RESIDUAL-16 removed **42 false cells** — 27 that published `pass` and 15 that published `present` —
and **every gate stayed green**. It raised two decisions this packet closes:

- **`D-RES16-3`** — nothing in this repository refuses a manufactured `pass`. The capability gate
  ratchets `stale` and *reports* `unrun`; `pass` and `present` have no baseline at all, so the
  repo's most-quoted evidence numbers can move in **either** direction unobserved: silent
  **inflation** (a loosened predicate credits cells nothing exercised — exactly what `storyCheck`
  did for 27 cells) and silent **deflation** (a regression quietly drops real evidence).
- **`D-RES16-2`** — `portal-hydration` reused `ssr-sample`'s predicate over the same directory, so
  **16 of 19 citations named a spec that never reaches a teleport and 0 of 19 hydrate anything**.
  RESIDUAL-16 shipped 3 noted `present` + 15 `unrun` and recommended writing the harness next
  (its option (d)).

**Entry state** (`packages/core/docs/capability-matrix.json` in the working tree, 144 rows,
1,662 cells) — measured, not copied:

| | |
|---|---:|
| `pass` | **558** |
| `fail` | **0** |
| `present` | **608** |
| `stale` | **22** |
| `unrun` | **400** |
| `excepted` | **74** |

*Written incrementally: §1 the ratchet, §2 the harness, §3 the movement, §4 decisions,
§5 validation, §6 residue, §7 not done, §8 ranked next. Every section was appended as its phase
closed.*

---

## 1. Item 1 — `D-RES16-3`: a two-way, per-kind ratchet on `pass` and `present`

### 1.1 Why a ceiling would have been the wrong instrument

Gate 7 holds `stale` with a **ceiling**, and a ceiling is one-way by nature: a fall is good news
and only has to be *recorded*. `pass` and `present` are not like that, and both failure directions
are measured rather than imagined:

| Direction | What it can be | Measured instance |
|---|---|---|
| **rise** | a loosened predicate crediting cells nothing exercised | RESIDUAL-16: `storyCheck` read "absent from the failing set" as "passed", so **27** `state-stories` cells published `pass` for a check never asked of them |
| **fall** | a regression quietly dropping real evidence | an a11y spec losing its `axe(` call, a story losing an export, a lane that stopped running — none of which any gate in this repository could see |

So **neither direction is free**. Gate 8 (`evidence-ratchet`) is in
`packages/tooling/src/validators/capability-matrix.ts`; the record is the new `evidenceCells` block
in `packages/tooling/src/validators/capability-matrix-ceilings.json`.

### 1.2 The three clauses

1. **Per kind, per state, both directions.** Every recorded kind's `pass` and `present` must equal
   the measurement exactly. The diagnostic names **the kind, the state, the direction and the
   delta** — `` `state-stories` / pass ROSE 60 → 87 (+27) `` — because "`pass` moved" is not
   actionable. Per **kind** for the same reason `staleCellKinds` is per kind: a single total of 558
   is equally satisfied by trading 27 real passes in one column for 27 invented ones in another.
   That exact case is pinned by a test (*fails on a cross-kind swap that leaves the TOTAL
   identical*).
2. **The kind set is pinned, in both directions.** A kind the matrix publishes that the record does
   not know is an error — *a new evidence column arriving with credit already in it is the one shape
   clause 1 cannot see*. So is a recorded kind the matrix has stopped publishing **in any state**.
   All 23 kinds are recorded, **zeros included** (`at-manual` and `perf-baseline` hold `{0, 0}`):
   an entry that only appears once a column earns credit cannot notice the column earning it. And
   "zero credit" is deliberately distinguished from "the row is gone" — `at-manual` publishes 89
   cells and holds no credit at all.
3. **`totals` must equal the sum of `kinds`.** The headline a report quotes cannot drift from the
   table that holds it. This is `runtime-floor-ceilings.json`'s device (`maxBreaches` must EQUAL the
   list) applied to a tally.

### 1.3 How a legitimate move is declared — in ONE change, and why that matters

**The tension is real and it is resolved deliberately.** RESIDUAL-16 legitimately *lowered* `pass`
by 27 by removing false cells, and every future honest audit will do the same. A ratchet that made
that expensive would buy an unmovable number at the price of discouraging the only activity that
has ever found a false `pass` in this repository. So:

> **A legitimate move is one edit to that kind's entry in `capability-matrix-ceilings.json`, in the
> same change that moves the number** — the same handshake `staleCells.ceiling` already uses — plus
> one line in the block's `//moves` log saying why.

Three things make that genuinely one change rather than nominally one:

- **The gate does the arithmetic.** Each violation message ends with the literal replacement:
  `Set "state-stories": { "pass": 87, "present": 0 } in packages/tooling/src/validators/capability-matrix-ceilings.json in the SAME change`.
- **The gate prints the whole corrected block**, `totals` and all 23 `kinds`, ready to paste, so a
  multi-kind audit is one paste and not 23 arithmetic decisions. Printed only when gate 8 fired.
- **That printed block is asserted to be the actual fix.** The case *prints a block that is ACTUALLY
  the fix — parsed, it equals the measurement* parses what the CLI prints and re-runs the gate
  against it. The "honesty is cheap" claim is worth nothing if the offered remedy is wrong, so it is
  a test rather than a sentence.

What the gate deliberately will **not** do is move the number itself. There is no
`--write-baseline` flag, because a ratchet an agent can discharge by running a command is not a
ratchet. The record is the place a reader looks to see that a withdrawal was *declared* rather than
absorbed, and `//moves` is where the reason lives.

**Item 2 of this very packet is the first declared move** (§2.5) — so the mechanism is exercised by
a real correction in this batch, not only by seeded ones.

### 1.4 The baseline seeded — measured NOW, per kind, never hand-copied

Derived from `packages/core/docs/capability-matrix.json` by script (`evidence-kinds.txt` in the
scratchpad), **not** from any report's totals, and seeded at the **post-RESIDUAL-16** values:
`pass` **558** · `present` **608** over **1,662** cells and **23** kinds — never at the pre-audit
585 / 623, which an audit had just shown to be false. Seeding a ratchet at numbers known to be
inflated would have written the inflation into the record permanently.

| Kind | `pass` | `present` | | Kind | `pass` | `present` |
|---|---:|---:|---|---|---:|---:|
| `a11y-narrative` | 22 | 0 | | `perf-baseline` | 0 | 0 |
| `at-manual` | 0 | 0 | | `portal-hydration` | 0 | 3 |
| `axe` | 0 | 61 | | `real-world-story` | 22 | 0 |
| `browser-matrix` | 88 | 0 | | `rtl-contract` | 0 | 89 |
| `browser-play` | 86 | 0 | | `ssr-sample` | 0 | 94 |
| `contract-spec` | 0 | 142 | | `state-stories` | 60 | 0 |
| `controlled-uncontrolled` | 0 | 1 | | `story-light-dark` | 142 | 0 |
| `csp-fixture` | 0 | 1 | | `threat-model` | 0 | 15 |
| `data-scenarios` | 0 | 8 | | `token-contrast` | 138 | 0 |
| `keyboard-spec` | 0 | 16 | | `unit-spec` | 0 | 141 |
| `malicious-corpus` | 0 | 15 | | `url-policy` | 0 | 15 |
| `non-drag-alternative` | 0 | 7 | | **total** | **558** | **608** |

`fail` is 0 and `stale` 22 (gate 7); `unrun` 400 and `excepted` 74 remain report-only — `unrunCells`
already states why, and a cell moving `pass` → `excepted` is caught by `pass` falling.

### 1.5 Proved both ways, end to end, on the real tree

Each seed is a **byte copy taken first**, the edit made by hand, the CLI run with its exit code read
from a log file, then the copy restored and verified with `sha256sum -c`. No `git checkout` or
`git restore` was used anywhere in this batch.

**(a) RISE — a loosened predicate.** `storyCheck`'s applicability arm was short-circuited and its
final arm restored to RESIDUAL-16's exact pre-audit inversion
(`sources.storyDod.get(check)?.has(component) === true ? 'unrun' : 'pass'`) — the predicate that
produced the 27 false passes:

```
exit 1 · 2 capability-matrix violation(s)
  evidence ratchet (two-way, per kind): pass 585 (recorded 558) · present 608 (recorded 608)
✗ [evidence-ratchet] `state-stories` / pass ROSE 60 → 87 (+27). …
   Set "state-stories": { "pass": 87, "present": 0 } in …capability-matrix-ceilings.json in the SAME change
✗ [freshness] …capability-matrix.json is stale.
```

**Non-zero, the kind named, the delta named, the direction named.** The second violation is
`freshness` and is correct: the committed artifact no longer matches the loosened generator. **This
is the RESIDUAL-16 change replayed** — the same 27 cells, the same +27 — and it now fails.

**(b) FALL — a real citation dropped.** `packages/core/stories/data/DzCalendar.stories.ts`'s
`export const Accessibility` renamed to `SeededAwayNarrative`, which is exactly what a real
regression looks like (`story-dod.ts:391` is `ctx.exports.includes('Accessibility')`):

```
exit 1 · 2 capability-matrix violation(s)
  evidence ratchet (two-way, per kind): pass 557 (recorded 558) · present 608 (recorded 608)
✗ [evidence-ratchet] `a11y-narrative` / pass FELL 22 → 21 (-1). A fall is not automatically bad
   news — RESIDUAL-16's audit rightly removed 27 false `pass` cells — but it must be DECLARED
   rather than absorbed, so a reader can tell a correction from a regression. …
```

**Non-zero, the kind named.** A ceiling would have let this through for free.

**A negative control, recorded because it is evidence about the gate's reach.** The fall was first
seeded on `packages/core/stories/buttons/DzButton.stories.ts` and the gate stayed **green at exit
0**, correctly: `a11y-narrative` is a Tier C/D row and `DzButton` is Tier A, so no cell existed to
lose and nothing had in fact moved. The gate did not fire on a seed that changed no evidence.

**Restores verified:** one `sha256sum -c` over all three touched files —
`generate-capability-matrix.ts` `7f462e89…`, `DzCalendar.stories.ts` `b1ae3481…`,
`DzButton.stories.ts` `41979b29…` — all `OK`.

**Unit proof, 12 new cases** in `packages/tooling/src/validators/capability-matrix.spec.ts` (16
→ 28, all passing): baseline green · rise · fall · cross-kind swap at an identical total ·
unrecorded kind carrying credit · recorded kind gone from the model · zero-credit kind *not*
confused with a removed one · `totals` drifted from `kinds` · `//` comment keys ignored · the
printed block parsed and re-checked · the **shipped** record against the **shipped** matrix (not a
tautology: it fails the day either moves without the other) · all 23 kinds recorded with the
post-audit totals.

### 1.6 Chaining — `validate:all` is unchanged at 62 links

Gate 8 lives **inside** `validate:capability-matrix`, which is already a link of `validate:all`, so
it is reached without appending anything. **The link count stays 62** and every existing link number
in every report in this programme still holds — nothing was inserted and nothing renumbered.
`package.json`'s `//validate:capability-matrix` note was extended to describe gate 8.

---

## 2. Item 2 — `D-RES16-2`: the `portal-hydration` harness

`packages/core/tests/ssr/portal-hydration.spec.ts`, **5 tests**, the shape RESIDUAL-11 proved on
`DzStepper` (`form-layouts-ssr.spec.ts:157`): render on the server, hydrate the string, assert the
hydration changed **nothing**.

### 2.1 The population was measured before anything was written

All **24** rows carrying a `portal-hydration` cell were probed: SSR-rendered with `open: true` and
the minimum required props, then hydrated, then the teleport anchors and the byte difference read
off. The probe and its output are in the scratchpad (`probe1.log`, `probe2.log`, `probe3.log`).

| | Components | What the measurement showed |
|---|---:|---|
| **Teleport anchor pair in the server output** | **4** | `DzBlockUI` `DzPopconfirm` `DzSidebar` `DzTour` — and they are exactly the four whose `.vue` contains a native Vue `<Teleport>` |
| **No teleport in the server output at all** | **20** | every one portals through a Reka UI `*Portal` primitive, which renders **nothing** on the server |

`DzSelect` and `DzTreeSelect` were re-probed with correct props after a first attempt threw on
argument shape; both confirmed `anchors=false` at 2,439 and 1,326 bytes. Nothing was decided from a
component's source alone.

### 2.2 The harness hydrates FOUR components, and asserts four clauses on each

1. **The portal branch was taken on the server** — the anchor pair, in the server string.
2. **The teleported content the server produced**, read from `renderToString`'s SSR context
   (`ctx.teleports`). **This is new and it is the half nothing in the repository had ever looked
   at.** `ssr-smoke.spec.ts` only ever examined the *return value* of `renderToString`, and for a
   teleporting component that is the anchor pair — the panel goes to the context. Measured:
   `DzTour` **3,471 bytes** of `role="dialog"` panel and spotlight mask; `DzPopconfirm` **2,771
   bytes** of `role="alertdialog"` panel; `DzSidebar` **61 bytes** (its mobile overlay is closed);
   `DzBlockUI` **50 bytes** (its teleport is *disabled*, so the overlay is in the component's own
   output, between the anchors).
3. **Hydration rewrote zero bytes** of the component's own output.
4. **Every diagnostic hydration produced is a hydration notice** — captured from both
   `console.warn` and `console.error`, never printed, and asserted to contain nothing else. A file
   that passed while spraying Vue warnings into a green suite would be the RESIDUAL-11 failure mode
   over again.

Each component also carries its own structural claim, because clauses 1 and 3 together are
satisfied by a component that emits an empty anchor pair and has stopped rendering: `DzTour` paints
nothing into the document flow (`server` is exactly the 40-byte anchor pair); `DzSidebar`'s whole
navigation is server-rendered in place; `DzPopconfirm` keeps its **trigger** in the flow and its
panel out of it; `DzBlockUI`'s overlay, spinner and accessible name are asserted to be *between* the
anchors and after the blocked content.

### 2.3 The byte-equality result, and the one normalization

**0 bytes rewritten, all four.** Three of the four also satisfy the stricter raw comparison
`client === server`, and that is asserted where it holds so the normalization is not silently
load-bearing everywhere.

The normalization: `container.innerHTML = serverHtml` then reading it back is a **parse and
re-serialize**, and the DOM serializer is not byte-faithful to `renderToString` — `DzBlockUI`'s
server output carries a valueless `data-blocked` and the DOM prints `data-blocked=""`. So the
baseline is taken from a **second, never-hydrated container** holding the same string, and
`client === baseline` is then exactly "did hydration change the tree" with the serializer's quirks
on both sides. For `DzBlockUI` the raw difference is asserted to be **precisely** that one
attribute (`server.replace('data-blocked aria-busy', 'data-blocked="" aria-busy') === baseline`, and
`server !== baseline` first so the case cannot go vacuous), so the accommodation cannot grow to
cover a real rewrite. RESIDUAL-11's `DzStepper` test never met this because that tree has no
valueless attribute.

### 2.4 What the harness does NOT prove, established by a control rather than asserted away

It does not prove hydration **claims** the server-rendered content sitting in the teleport *target*
rather than re-creating it. That was attempted: inject `ctx.teleports` into `document.body`, then
hydrate. `DzTour` and `DzPopconfirm` then each produced one `Hydration node mismatch` and a changed
`body` (3,522 → 6,662 and 2,925 → 5,517 bytes — the panel rendered twice).

**Before writing that up as a two-component defect, the fixture was controlled.** Four minimal
shapes were measured — a plain `h(Teleport, { to: 'body' }, [h('div', …)])`, one with an author
comment first, one wrapping a `Transition`, one `v-if`-guarded — and **all four fail identically**,
including the plain `div` whose server payload is
`<!--teleport start anchor--><div id="p">panel</div><!--teleport anchor-->`. So the mismatch belongs
to **hand-placing a teleport target in jsdom**, not to the components. Asserting there would have
been a defect claim against `DzTour` and `DzPopconfirm` on the strength of a broken fixture.

The target half therefore needs a real SSR document in a real engine, and it is raised as
**`D-RES17-1`** rather than left to be discovered. `DzBlockUI` is the one component for which the
teleported content *is* in the component's own output, so for it the full claim — teleported content
survives SSR **and** hydration — is evidenced end to end today.

### 2.5 The predicate was tightened, and one cell LOST its credit

`spec-capability-refs.ts`'s `portal-hydration` arm now requires **three** terms, not two: the server
render, the **teleport anchor pair in the asserted output**, and a **hydration** (`.mount(` with the
dot, or a file-level helper reaching it — a bare `mount(` is Vue Test Utils, which renders from
scratch and hydrates nothing; that exclusion is pinned by a test). `exercisedBy`'s fourth parameter
became a `CapabilityCalls` pair so the hydration shape is resolved per file exactly as the SSR shape
already was.

**`PORTAL_OPENED` was DELETED as a proof of the branch, on measurement.** RESIDUAL-16 accepted
`open: true` in the call; RESIDUAL-17 measured that it means nothing. `DzCommandPalette` rendered
`open: true` emits `<!--[--><!--v-if--><!--]-->` — **27 bytes, no teleport, `ctx.teleports` empty** —
and hydration then *replaces* those 27 bytes with an anchor pair. So the branch was never taken on
the server and the cell had been credited on a hypothesis. **`DzCommandPalette` loses its
`portal-hydration` cell**, which is a real demotion of a cell RESIDUAL-16 had counted among its three
good ones. It is now `unrun` with the reason named, and that reason is **asserted** in the harness's
fifth test so it goes red the day Reka server-renders its portals.

### 2.6 The movement, and 20 cells that stay `unrun` with the reason

| | Before | After | Δ |
|---|---:|---:|---:|
| `portal-hydration` `present` | 3 | **4** | **+1** |
| `portal-hydration` `unrun` | 21 | **20** | **−1** |
| `ssr-sample` `present` | 94 | **96** | **+2** |
| `ssr-sample` `unrun` | 50 | **48** | **−2** |

**Re-credited: 4 cells** (`DzBlockUI`, `DzPopconfirm`, `DzSidebar`, `DzTour`), of which **2 are
new** (`DzBlockUI`, `DzPopconfirm`) and 2 were retained through the new harness rather than the old
citation. **Lost: 1** (`DzCommandPalette`). `ssr-sample` gained **2** — `DzBlockUI` and
`DzPopconfirm` — because **the harness is the first spec in this repository that server-renders
either of them at all**. That is a fact worth stating on its own: before this file, two of the four
components that genuinely portal on the server had **no SSR assertion of any kind**.

**Staying `unrun`, 20 cells, one named reason:** `DzCascader` `DzColorPicker` `DzCombobox`
`DzCommandPalette` `DzConfirmDialog` `DzContextMenu` `DzDataGrid` `DzDialog` `DzDropdownMenu`
`DzLightbox` `DzMultiSelect` `DzPersonaSelector` `DzPopover` `DzRelativeTime` `DzSelect` `DzSheet`
`DzSpeedDial` `DzTimePicker` `DzTooltip` `DzTreeSelect`. The reason, in the cell's own note: *they
portal through a Reka UI `*Portal` primitive, which renders nothing on the server — `renderToString`
emits a false `v-if` and `ctx.teleports` is empty — so there is no teleported content for SSR to
preserve and none for hydration to match.* **No citation was manufactured for any of them.**

### 2.7 Seeded breaks on SOURCE, with the predicted set stated before the count

Both seeds are `.vue` edits, both byte-copied first and restored with `sha256sum -c`, and both run
against the same bounded set of **10 spec files / 167 passing tests** (the files that name either
component), baselined green first.

| Seed (on source) | Predicted | Measured |
|---|---|---|
| `DzBlockUI.vue` `:disabled="!fullScreen"` → `:disabled="fullScreen"` — the overlay leaves the component's own output | the new harness's `DzBlockUI` test, **plus** `DzBlockUI`'s own unit + contract suites and `portal-target.spec.ts`, because moving the overlay out of the root is client-visible too | **14 failed / 153 passed**, exactly that set: 1 harness + 1 portal-target + 4 contract + 8 unit. Harness message: `expected '<!--teleport start-->' to contain 'data-part="overlay"'` |
| `DzTour.vue` `v-if="open && activeStep"` → `v-if="false && open && activeStep"` — RESIDUAL-10's defect, the branch not taken | the new harness's `DzTour` test, `ssr-smoke.spec.ts`'s `DzTour` SSR test, `portal-target.spec.ts`, and `DzTour`'s own unit + contract tests that assert the panel renders | **20 failed / 147 passed**, exactly that set: 1 harness + 1 ssr-smoke + 1 portal-target + 4 contract + 13 unit |

Both seeds are broad because both are *client-visible* regressions, and that is stated rather than
dressed up. The claim that the harness reaches something nothing else did is made **structurally
instead of by a seed**, because it is stronger: `DzBlockUI` and `DzPopconfirm` both read
`ssr-sample: unrun` before this batch, so **no spec server-rendered either component**, and their
entire SSR and hydration behaviour was unasserted.

**Restores:** one `sha256sum -c` over both files — `DzBlockUI.vue` `e2eb7a9d…`, `DzTour.vue`
`4082a15a…` — both `OK`.

### 2.8 A limitation of the citation machinery, found by being bitten by it

On the first regeneration after the harness landed, **`DzCommandPalette` re-acquired the
`portal-hydration` cell it had just lost.** Cause: the harness's *counter-example* test quotes the
anchor markers in its expected post-hydration string, and `spec-capability-refs.ts` matches on the
text of the asserting block — **a text predicate cannot tell an assertion from its negation.** The
cell would have claimed "teleported content survives SSR and hydration" citing the test that
disproves it.

Fixed by holding the marker string in a file-level constant that only the counter-example uses,
with the reason written at the constant. The rejected alternative was to move the counter-example
out of `packages/core/tests/ssr/` — the directory the generator reads as the SSR evidence corpus —
which would have hidden the limitation instead of naming it. The four positive tests still quote the
markers inline, because they are the evidence and must read as such. **This is a real residual
weakness of the predicate and it is in §7.**

---

## 3. The movement — capability matrix, entry → exit

| | Entry (working tree at 421 dirty paths) | Exit | Δ |
|---|---:|---:|---:|
| `pass` | **558** | **558** | — |
| `fail` | 0 | 0 | — |
| `present` | **608** | **611** | **+3** |
| `stale` | **22** | **22** | — |
| `unrun` | **400** | **397** | **−3** |
| `excepted` | **74** | **74** | — |
| cells | 1,662 | 1,662 | — |

Per tier, after: A `106/0/176/0/64/4` · B `300/0/311/0/240/66` · C `145/0/112/21/92/4` ·
D `7/0/12/1/1/0`. The whole `+3` is item 2's: `portal-hydration` `present` +1 and `ssr-sample`
`present` +2, with `unrun` −3 to match. **`pass` did not move at all** — this packet added a gate on
it and produced no new `pass` cell, which is the honest shape for a packet whose job was to hold the
number rather than raise it.

`unrun` is reported, not gated, and now reads `unrun 397 (baseline 400, -3)`. The recorded
`unrunCells.baseline` of 400 is **bound to `4e4e46f`** and was **not edited** — that file's `//`
says the block is a record of a commit, and `unrunCells.perTier` carries the same deliberate
mismatch RESIDUAL-16 left. The tree now reads `A 64 / B 240 / C 92 / D 1`.

### 3.1 The gate is GREEN, and this time that means something

`yarn validate:capability-matrix` exits **0**: *"fresh, and no Tier D cell is unexplained"* ·
`22 stale cell(s) — ceiling 22` · browser-degradation **0 of 2,112** ·
**`evidence ratchet (two-way, per kind): pass 558 (recorded 558) · present 611 (recorded 611) over
23 kind(s)`**.

The difference from RESIDUAL-16 is the whole point of item 1: that packet moved 42 cells and nothing
noticed. This packet moved 3, **gate 8 went red naming both kinds and both deltas**, and the record
was corrected in the same change with the reason in `//moves`. The green is now a statement rather
than an absence.

### 3.2 The board row that RESIDUAL-16 moved the wrong way moved back by 1

`EXECUTION-STATUS.md`'s ratchet board carries **"Tier C/D unrun with nothing on disk
('unexplained')"**, at-open 48, target 0, owned by S1-O2, recorded there as 35 at `4e4e46f` and
measured by RESIDUAL-16 at **42** after its correction (Tier C/D cell, `unrun`, zero artifacts).
Measured here under the same definition: **41** — `DzCommandPalette`'s Tier C `portal-hydration`
cell is the one that moved, and it moved because it lost a citation that was not evidence. The
board's own figure is **not edited**: the row is S1-O2's and its number is bound to a commit, not to
a tree. The movement is recorded here and again in `EXECUTION-STATUS.md`'s RESIDUAL-17 section.

---

## 4. Owner decisions — one raised, two closed by this packet

### `D-RES17-1` 🔴 **RAISED** — the teleport TARGET half of hydration is unmeasurable in jsdom

**Measured.** §2.4. The harness proves the component's own server output survives hydration byte for
byte for all four portalling components, and for `DzBlockUI` — whose teleport is disabled, so the
overlay is in that output — the full claim is evidenced end to end. For `DzTour`, `DzPopconfirm` and
`DzSidebar` the teleported content goes to `body`, and whether hydration **claims** it or re-creates
it cannot be decided here: injecting `ctx.teleports` into `document.body` and hydrating produces one
`Hydration node mismatch` for **four minimal `<Teleport>` controls**, including a plain
`h(Teleport, { to: 'body' }, [h('div')])`. The fixture is what fails, not the components.

**Options.** **(a)** accept the harness's scope — `portal-hydration` means "the component's own SSR
output, with the branch taken, survives hydration", with the note saying so (what ships now).
**(b)** add a real-engine SSR lane that serves a genuine document with the teleport target populated,
and assert the target subtree there; this is a Playwright/Vite fixture like `test:e2e:csp`, so it is
a lane, not a spec. **(c)** split the kind into `portal-ssr` and `portal-target-hydration`, the
second reading `unrun` for all 24 until (b) exists.

**Recommendation: (a) now, (b) when a browser-qualified SSR lane is next opened.** (c) buys accuracy
in the column name at the cost of 24 more cells and a second kind nothing evidences; the note already
carries the distinction and is asserted by the harness.

**Cost of doing nothing:** three cells read `present` for a kind whose name covers slightly more
than they show — materially less than the 16-of-19 overstatement RESIDUAL-16 found, and now written
into the cell rather than into a report.

### `D-RES16-2` — **CLOSED by option (d)**, the harness written

RESIDUAL-16 recommended *"(c) now, (d) next"*. (d) is done. The kind is not split and its survivors
are not demoted; instead the predicate requires what the name says, four cells evidence it, one cell
that should never have had it lost it, and 20 carry a measured reason. `D-RES17-1` carries forward
the one half that remains out of reach. **Option (a) — splitting the kind — is no longer
recommended:** the reason it was on the table was that nothing evidenced hydration, and now four
things do.

### `D-RES16-3` — **CLOSED by option (a)**, per-kind and two-way

The recommendation was *"(a), scoped per kind"*. Gate 8 is that, with the kind **set** pinned and
`totals` bound to the sum as two extra clauses, and with the declaration mechanism deliberately
made cheap (§1.3) so the objection behind option (c) — that a gate on `pass` discourages honest
audits — is answered by construction rather than by argument.

**`D-RES16-1` is untouched.** Ratifying the 27 `excepted` cells is the owner's and was not
re-litigated; `state-stories` reads `pass` 60 / `excepted` 29, unmoved.

---

## 5. Validation — every exit code read from a log FILE, never through a pipe

Each command was run as `cmd > <absolute>.log 2>&1; echo "exit $?"` and the log then read.

| Command | Exit | Result |
|---|---:|---|
| `yarn typecheck:tooling` | **0** | run **4** times across the change |
| `node node_modules/eslint/bin/eslint.js <7 changed files>` | **0** | one `style/indent-binary-ops` finding fixed **by hand** (the ternary was lifted into two named constants), never `--fix` |
| `node …/vitest.mjs run packages/tooling/src/validators/capability-matrix.spec.ts` | **0** | **28** passed |
| `node …/vitest.mjs run packages/tooling/src/quality/spec-capability-refs.spec.ts` | **0** | **22** passed |
| `node …/vitest.mjs run packages/core/tests/ssr/portal-hydration.spec.ts` | **0** | **5** passed, and **no diagnostic reaches the reporter** |
| `node …/tsx/dist/cli.mjs …/validators/capability-matrix.ts` | **1** → **0** | red naming `portal-hydration +1` and `ssr-sample +2`; green after the record was corrected in one edit each |
| `yarn regenerate:all` | **0** | **7 of 7** steps, run twice |
| `yarn generate:capability-matrix` | **0** | run twice (the second after the §2.8 fix) |
| `yarn validate:capability-matrix` | **0** | `✓ fresh, and no Tier D cell is unexplained` · `unrun 397 (baseline 400, -3)` · `22 stale — ceiling 22` · browser-degradation **0 of 2,112** · `evidence ratchet … pass 558 (recorded 558) · present 611 (recorded 611) over 23 kind(s)` |
| **`yarn validate:all`** | **0** (×2) | **62 links, 53 `✓`, ZERO `✗`** — identical to entry, on both runs. The second is the authoritative one: it ran **after** every docs, register and status edit, so the numbers above are measured against this report at its full length. See §5.2 |
| **`yarn test`** | **1**, **0**, **1** (×3) | **all three runs 581 files, 11,500 passed, 3 skipped, 1 todo, ZERO failed.** Every non-zero exit is an unhandled error in `apps/landing`, not a test. See §5.1 |

**Seeded runs, all read from log files:** the two gate-8 seeds (exit **1** each, §1.5) and the two
source seeds (exit **1**, 14 and 20 failures, §2.7), plus a green baseline over the same 10-file set
(exit **0**, 167 passed) and a negative control that correctly stayed green (§1.5).

### 5.1 `yarn test` — three runs, ZERO failed tests in all three, two non-zero exits

**The test result is identical on every run and it is green:**

| Run | Exit | Summary | `Errors` |
|---:|---:|---|---|
| 1 | **1** | `581 passed (581)` · `11500 passed \| 3 skipped \| 1 todo` | 1 |
| 2 | **0** | **identical** | — |
| 3 | **1** | **identical** | 59 |

**Not one test failed in any run.** Every non-zero exit comes from vitest's `Unhandled Errors`
channel, and every unhandled error is in **`apps/landing`** — a package this batch never opened.

**Run 1, 1 error:**

```
Uncaught Exception: ReferenceError: requestAnimationFrame is not defined
 ❯ lowPriority node_modules/@formkit/auto-animate/index.mjs:173:9
 ❯ Timeout._onTimeout node_modules/@formkit/auto-animate/index.mjs:161:45
This error originated in "apps/landing/src/gallery/render.spec.ts"
```

**Run 3, 59 errors, classified — 58 of them the same one:**

| Count | Error | Origin |
|---:|---|---|
| **58** | `ReferenceError: requestAnimationFrame is not defined` (same `@formkit/auto-animate` frame) | `apps/landing/src/pages.interactions.spec.ts` |
| 1 | `Error: [vitest-worker]: Timeout calling "onTaskUpdate"` | reporter RPC |
| 1 | `Error: chunk load failed` | worker transport |

A timer callback in `@formkit/auto-animate` firing after its jsdom environment was torn down. It
scales with host load rather than with anything in the tree: run 3 followed a complete `validate:all`
including a full `yarn build` on a machine that had also slept, and the same suite that produced one
such error produced 58.

**`D-RES13-2` reproduced verbatim in run 3** — `[vitest-worker]: Timeout calling "onTaskUpdate"`, the
exact reporter-RPC symptom the standing note describes as machine contention on a green suite. Per
the standing rule **all three runs are quoted**, and run 2's exit **0** with the identical summary is
the clean data point.

**Nothing here is attributable to this batch.** The three `apps/landing` paths dirty in the tree
(`package.json`, `playground-template/package.json`, `src/generated/counts.ts`) were **already dirty
at entry** — the entry-to-exit `git status` diff is one line and none of them is in it — and neither
erroring spec file is among them. This batch's own new spec, `portal-hydration.spec.ts`, runs clean
and **emits no diagnostic at all**: its hydration notices are captured from `console.warn` *and*
`console.error` by design (§2.2 clause 4).

### 5.2 The authoritative `validate:all` ran AFTER every docs edit, and a killed wrapper is recorded

The programme's convention is to run `validate:all` twice, the second time after the report is
written, so `docs-size` and `doc-snippets` measure the tree a reader will actually get. Both runs
here exit **0** with **62 links, 53 `✓`, zero `✗`**.

Two things about the second run are worth recording rather than smoothing over.

**A foreground wrapper was killed at its 600-second limit mid-run, and the run was re-done rather
than read from the truncated log.** The partial log showed 49 `✓` and 0 `✗` with `yarn build` (link
60) just completed, so it was very probably green — but "very probably" is not an exit code, and a
truncated log has no exit code at all. It was re-run clean, in the background, and the exit code read
from a file. **No process was killed by this batch**: the harness's own timeout ended its wrapper,
nothing was matched by process name, and no `kill` or `taskkill` was ever issued.

**The host slept between the two runs** — the date rolled from 2026-09-29 to 2026-09-30 and the
killed run's build printed `✓ built in 811m 50s`, a wall-clock artifact of the sleep rather than a
build regression. The clean re-run is the one quoted.

**It was also checked, rather than assumed, that the docs edits could not have moved a gate.** No
`validate:all` link reads `docs/program-2026-09-22-architecture/` at all: `validate:doc-snippets`
scans `apps/docs/guide`, `validate:docs-size` budgets only `docsDist` and `storybookStatic`, and
`validate:docs-freshness` names no input under `docs/`. The ordering rule was still honoured — every
docs, register and status edit was finished before the authoritative run started — but the reason it
holds is now measured instead of inherited.

**The pre-existing notices, quoted from the authoritative run** so a reader can match them line for
line: **3 distinct** `TS7022`/`TS7024` implicit-`any` errors — `DzToolbar.vue:52:7` (TS7022),
`55:7` (TS7022), `55:25` (TS7024) — printed **6 times** because two typecheck steps each emit them,
inside steps that exit **0**; `docs-freshness`'s `! [stale] 155 of 160 input(s)` plus one
`⚠ the BUILD is unmeasured or stale`; and `22 stale cell(s) — ceiling 22`, all `perf-baseline`.

### 5.3 Pre-existing vs new, separated

**New in this batch:** +1 spec file (`portal-hydration.spec.ts`, 5 tests), +12 cases in
`capability-matrix.spec.ts` (16 → 28), +4 in `spec-capability-refs.spec.ts` (18 → 22), gate 8, and
the 3-cell movement in §3. **Nothing new is red.**

**Pre-existing, untouched, and named so a reader does not attribute them here:**

- `DzToolbar.vue:52/55` — three `TS7022`/`TS7024` implicit-`any` errors printed inside a
  `validate:all` step that exits 0. Not a file this batch opened.
- `docs-freshness` prints `! [stale] 155 of 160 input(s) are NEWER than the built site` and
  `⚠ … the BUILD is unmeasured or stale`. Off CI this is a report by design.
- 22 `perf-baseline` stale cells, blocked on `D-S1O4-1`/`D-S1O4-2`.
- The root `package.json`'s three `jsonc/sort-keys` findings, surfaced only because this batch
  linted that file **directly**. `yarn lint` scopes to `packages/ apps/ e2e/` and never reads it, so
  it is outside the gate and was not touched; the only edit to it was extending a `//` comment
  string.
- `D-RES13-2` did not reproduce as itself; §5.1 records the different flake that did.
- RESIDUAL-11's `DzSelect` placeholder fix was **not disturbed** — no `.vue` was left modified.

### 5.4 Frozen ratchets — every one re-read, none moved

`unclassified` **29/29** · `maxWithoutAnatomy` **41/41** · `maxProposedCitedFromCode` **3**
(ceiling 3, ADR-18/19/20) · AT executed **0 of 534** · locales ≥ 95 % **1** (floor 1) · inline-style
sites **133** (81 static in 78 files + 52 bound in 38 files) · `maxUndeclaredHandlers` **0** ·
`anatomy-keyboard` **0 / 0 / 0**, **401 of 401 backed** across 85 components · `staleCells` **22**,
ceiling **22** · `staleCellKinds` `["perf-baseline"]`.

**NO CEILING WAS RAISED AND NO ALLOWLIST WAS WIDENED.** `anatomy-keyboard-ceilings.json` was not
opened. `capability-matrix-ceilings.json` **was** opened — to **add** gate 8's record and then to
declare gate 8's own first move — and neither edit touches `staleCells`, `staleCellKinds` or
`unrunCells`. Adding a ratchet that did not exist is not raising one; the `+3` it records is
explained in `//moves` and evidenced by a spec file, and the gate that reports it went red first.

### 5.5 No lane was run, and no lane leaked

No browser lane was invoked. The change is one new jsdom spec, two tooling modules, one validator
gate and a JSON record; no `.vue`, `.variants.ts`, token, class or colour is left modified — the two
`.vue` files touched were seeded breaks, restored and verified with `sha256sum -c`. `yarn test`,
`yarn validate:all` and `yarn regenerate:all` each ran to completion and exited on their own.
**NO PROCESS WAS KILLED, by name or otherwise** — no `kill`, no `taskkill`, nothing matched on
`chrome.exe` or any other name at any point.

---

## 6. Residue — every dirty path attributed

**421 at entry → 422 at exit: +1**, and the diff of the two `git status --porcelain` snapshots is
**exactly one line**:

| Path | Status | Why |
|---|---|---|
| `packages/core/tests/ssr/portal-hydration.spec.ts` | `??` new | item 2 — the hydration harness, 5 tests |

**0 paths removed, 0 status letters changed.** Every other file this batch edited was already dirty
at entry, so no new path appears for any of them:

- `packages/tooling/src/validators/capability-matrix.ts` — gate 8, `tallyEvidenceCells`,
  `publishedKinds`, `evidenceBlockFor`, the printed record and the docblock
- `packages/tooling/src/validators/capability-matrix-ceilings.json` — the `evidenceCells` block and
  its `//moves` log
- `packages/tooling/src/validators/capability-matrix.spec.ts` — +12 cases (16 → 28)
- `packages/tooling/src/quality/spec-capability-refs.ts` — the hydration term, `CapabilityCalls`,
  `capabilityCallsIn`, `PORTAL_OPENED` deleted
- `packages/tooling/src/quality/spec-capability-refs.spec.ts` — +4 cases (18 → 22), three new
  fixtures
- `packages/tooling/src/quality/generate-capability-matrix.ts` — the two `portal-hydration` notes
  and the header docblock
- `package.json` — the `//validate:capability-matrix` note extended for gate 8
- `packages/core/docs/capability-matrix.json`, `component-meta.json`,
  `apps/docs/.vitepress/generated/nav.json`, `apps/docs/evidence/*.md`, `apps/docs/components/*.md`,
  `packages/core/docs/llms*.txt`, `packages/core/security/inline-style-inventory.json`
  (regenerated, **unchanged at 133 sites**)
- `docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` and
  `reports/owner-decision-register-2026-09-22.md`; this report lives under the already-untracked
  `reports/` directory

**` M yarn.lock` is the owner's `yarn install` and was not touched.** `yarn install` was never run;
`npx` was never used; `git checkout` and `git restore` were never used.

### 6.1 Byte copies, every one verified

Five files were edited temporarily and restored, each copied to the scratchpad **before** the edit
and verified afterwards with `sha256sum -c`:

| File | sha256 | Verified |
|---|---|---|
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `7f462e89…` | `OK` (and the later note edit is a 3-hunk diff, inspected: the seeded predicate is provably absent) |
| `packages/core/stories/data/DzCalendar.stories.ts` | `b1ae3481…` | `OK` |
| `packages/core/stories/buttons/DzButton.stories.ts` | `41979b29…` | `OK` |
| `packages/core/src/components/feedback/DzBlockUI.vue` | `e2eb7a9d…` | `OK` |
| `packages/core/src/components/overlays/DzTour.vue` | `4082a15a…` | `OK` |

Three temporary probe spec files were created under `packages/core/tests/ssr/` and **deleted**; the
exit `git status --porcelain` confirms none survives.

### 6.2 Scratchpad

`C:\Users\Ekii\AppData\Local\Temp\claude\…\1fbe2666-…\scratchpad\`:
`RESIDUAL-17-entry-git-status.txt` (421 lines) · `RESIDUAL-17-exit-git-status.txt` (422) ·
`evidence-kinds.txt` (the per-kind baseline, script-derived) · `probe1.log`/`probe2.log`/`probe3.log`
(the 24-component portal census) · `probe4.log`/`probe5.log`/`probe6.log` (the `ctx.teleports`
measurement and the four `<Teleport>` controls) · `seed-rise.log`/`seed-fall.log`/`seed-fall2.log` ·
`seedA.log`/`seedB.log`/`seed-baseline.log` · `bytecopies/` · every gate log.

---

## 7. Not done, named rather than left to be discovered

1. **A text predicate cannot tell an assertion from its negation** (§2.8). It bit this batch: the
   harness's counter-example re-credited `DzCommandPalette` on the first regeneration. Worked around
   by keeping the marker in a file-level constant, with the reason written at the constant. A real
   fix would scope the anchor term to the server-side subject of the assertion, which means parsing
   the block rather than matching it.
2. **The teleport TARGET half of hydration** — `D-RES17-1`. Needs a real SSR document in a real
   engine; four minimal controls establish that jsdom cannot host it.
3. **20 `portal-hydration` cells are `unrun` for a dependency's reason.** The reason is asserted, so
   it cannot go stale silently, but it is Reka UI's behaviour and not this repository's to fix. If
   Reka ever server-renders its portals, the harness goes red and 20 cells become creditable in one
   change.
4. **`excepted` is not ratcheted.** A cell moving `pass` → `excepted` is caught by `pass` falling,
   and `unrun` remains a report by `unrunCells`'s own stated design — but a cell moving
   `unrun` → `excepted` moves nothing gate 8 holds. Whether an exception count deserves a two-way
   record of its own is a smaller version of `D-RES16-1`.
5. **`unrunCells.baseline`/`perTier` still record `4e4e46f`** and the tree now reads 397 and
   `A 64 / B 240 / C 92 / D 1`. Left deliberately, as RESIDUAL-16 left it: those numbers are bound
   to a commit and the block is S1-O2's.
6. **The three `toBeTruthy()`-only SSR citations** (`DzCheckboxGroup`, `DzPersonaSelector`,
   `DzTreeSelect`) that RESIDUAL-16 named are still there. Three one-line assertions; moves no cell.
7. **`contract-spec`/`unit-spec` measure existence plus one live assertion, not conformance** — 283
   citations, still the largest unexamined claim in the matrix, and now the only one of the three
   kinds RESIDUAL-16 flagged that has not been tightened.

---

## 8. Ranked next packet

1. **Item 7 above — what `contract-spec` actually proves.** 283 citations, the weakest criterion any
   packet has used, and the last of RESIDUAL-16's named gaps. Gate 8 now means a tightening there
   will show its cost in a number instead of passing silently.
2. **`D-RES17-1` option (b)** — a real-engine SSR lane, which would also give the three
   `toBeTruthy()` citations somewhere real to become assertions.
3. **`D-RES16-1`** — ratify the 27 `excepted` cells, still the owner's.
4. **Item 1 above** — teach the citation predicate the difference between an assertion and its
   negation. Small, and it removes the one place this batch had to work around its own machinery.
