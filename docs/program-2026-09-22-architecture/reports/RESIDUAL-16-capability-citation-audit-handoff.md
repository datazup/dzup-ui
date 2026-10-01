# RESIDUAL-16 — do the capability matrix's citations evidence the capability?

*Written incrementally, 2026-09-29. Repository: `ui/dzup-ui` (OSS, scope `@dzup-ui/*`).
HEAD `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`, 416 dirty paths at entry, uncommitted by
design. Entry `git status --porcelain` snapshotted to the session scratchpad
(`RESIDUAL-16-git-status-entry.txt`, 416 lines) before any edit.*

---

## 0. The item

RESIDUAL-05 closed `D-RES02-2` by making evidence attribution **structural**: a spec must
**load** the component (import it, bind it from a barrel, or name it to a template-literal
dynamic import) rather than merely contain its characters. That moved `present` 608 → 605 and
`unrun` 400 → 403, and its own §2.4 and its ranked-next item 5 said what it had *not* done:

> It does not prove the spec *asserts* anything about the component — only that the component is
> loaded rather than mentioned. … **Outcome-verify the 193 surviving citations.**

RESIDUAL-14 then ran the equivalent audit on a different artifact — the anatomy keyboard tables —
as a **census of all 220 distinct citation sites behind 404 rows**, and found **52 of 404 rows
(12.9 %)** cited a real file for the wrong claim, through six distinct mechanisms. That is direct
evidence that *structurally attributed* and *actually supports the claim* are different
properties.

This packet asks the second question of the capability matrix: **does each citation the matrix
publishes actually evidence the capability its cell claims?** A spec that genuinely imports and
renders `DzFoo` does not evidence `DzFoo`'s `axe` cell if it never runs axe, nor its `ssr-sample`
cell if it never calls `renderToString`, nor its `keyboard-spec` cell if it never dispatches a
key.

**Entry state** (`packages/core/docs/capability-matrix.json` at `4e4e46f`, 144 rows, 1,662 cells):

| | |
|---|---|
| `pass` | **585** |
| `fail` | 0 |
| `present` | **623** |
| `stale` | 22 |
| `unrun` | **385** |
| `excepted` | 47 |

*(Sections are appended as each phase closes. §1 the population, §2 the criteria, §3 the census,
§4 what was tightened and the proof each way, §5 the movement, §6 decisions, §7 validation,
§8 residue.)*

---

## 1. The population — a census, not a sample

Every cell the committed `capability-matrix.json` credits as `present` or `pass`, paired with
every artifact it publishes:

| | |
|---|---|
| `present` + `pass` cells | **1,208** (623 + 585) |
| cell→citation **pairs** | **1,634** |
| distinct `(kind, file)` citations | **798** |
| distinct citation paths | **544** |
| `present`/`pass` cells publishing **no** artifact | **0** |

1,634 is larger than RESIDUAL-14's 404, but it collapses hard: 17 of the 21 kinds cite a
per-component sidecar, a story file or a ledger, so the work is one read per distinct site plus
one adjudication per pair. **Every pair was adjudicated** — by a scanner that opens the cited
file, isolates the `it(`/`test(` block the component appears in, and applies the kind's criterion
— with **every non-`G` verdict opened and read by hand**, plus a read-through of all 16 distinct
`axe`/`ssr`/`portal` sites (the 200 pairs this packet was sent for) and a sample of the `G`
verdicts in every other kind. No sampling was needed and none was used.

### 1.1 Two scanner defects found and fixed before any verdict was trusted

Both would have produced false verdicts, and both are failure modes this repository has already
documented:

1. **A regex comment-stripper read `accept: 'image/*'` (`ssr-smoke.spec.ts:527`) as an open block
   comment** and blanked everything to the next `*/` at line 905 — 378 lines, including every
   `it(` between them. That is exactly what `spec-component-refs.ts`'s `stripComments` docblock
   warns about ("every regex that strips comments eventually eats a `//` inside a URL or a `/*`
   inside a string"). The census was re-run against **that** function, with `preserveLines: true`.
2. **Paren-matching over test source must skip regex literals.** `/data-state="([^"]*)"/g` reads
   as a quoted string that swallows the `(` and leaves the `)` to close the call early, and a
   regex holding an unbalanced paren runs the block on to EOF. Measured on `ssr-smoke.spec.ts`:
   two runaway blocks (731→852, 813→1206), which credited **every overlay** with the DzStepper
   test's teleport assertions and turned 9 wrong `portal-hydration` verdicts into 10 right-looking
   ones. The corrected scanner is `scan.mts` in the session scratchpad.

---

## 2. The criterion, per input kind — stated before the judging

A citation is **G (genuine)** only if the cited file, opened, exercises the capability the cell
claims for **that component**. **W** is a real file that does not. **U** is undecidable.

| Kind | What the cell claims | The citation must show |
|---|---|---|
| `axe` | an axe assertion over the component | an `axe(…)` / `toHaveNoViolations` call in a **live** test whose rendered tree contains the component |
| `ssr-sample` | the component in an SSR render sample | `renderToString` (directly or through a file-level helper that reaches it) over the component, in a **live** test |
| `portal-hydration` | teleported content survives SSR **and hydration** | an SSR render of the component **with its portal branch taken**, plus an assertion on the teleport boundary |
| `keyboard-spec` | an asserted keyboard table | a **dispatched or asserted** key event in a live test (`trigger('keydown')`, `new KeyboardEvent`, `expectKeyboardContract`, or an assertion over an emitted `KeyboardEvent.key`) |
| `unit-spec` / `contract-spec` | render and behaviour units / Contract Spec v1 | a live test with an `expect(` and a mount/render of the component (directly or in shared setup) |
| `controlled-uncontrolled` | both value paths asserted | `update:modelValue` **and** a default/uncontrolled path, in code rather than prose |
| `non-drag-alternative` | a keyboard equivalent for every drag | a key event dispatched **or asserted** in a live test |
| `state-stories` | stories for each state the component declares | a `States` export in the cited story file — or, where the component declares no state prop, an explicit statement that there is nothing to demonstrate |
| `story-light-dark` | a light/dark story | `darkModeDecorator` **applied** (not imported), in code |
| `a11y-narrative` / `real-world-story` | an APG narrative / a real composition | an `Accessibility` / `RealWorld*` export |
| `browser-play` | a `play()` driven in a real engine | `play: async` in code |
| `rtl-contract` | RTL declared **and** asserted | an `rtl:` declaration in the anatomy **and** a gate that checks it against the component's own variants |
| `browser-matrix` | 3 engines × 8 conditions | per-component, per-project results in the tracked ledger |
| `token-contrast` | every colour pair the component ships passes | a corpus gate that covers the catalogue — the cell declares `scope: 'corpus'` and says so |
| `threat-model` / `malicious-corpus` / `url-policy` / `csp-fixture` | a written model / hostile corpus / URL policy / CSP fixture | a per-component artifact, or a class-level one whose manifest declares this component and whose declared boundary matches |

---

## 3. The headline — 1,634 citations, adjudicated one by one

| | Pairs | Share |
|---|---:|---:|
| **G — the citation genuinely evidences the cell's capability** | **1,590** | **97.3 %** |
| **W — loads or exists, but does not exercise that capability** | **44** | **2.7 %** |
| **U — undecidable** | **0** | 0 % |

**W by kind:** `state-stories` **27** · `portal-hydration` **16** · `ssr-sample` **1**.

### 3.1 Per kind

| Kind | Pairs | G | W | Note |
|---|---:|---:|---:|---|
| `browser-matrix` | 352 | 352 | 0 | 89 components × 24 projects in the tracked ledger, 24 recorded runs |
| `rtl-contract` | 178 | 178 | 0 | 89 anatomies declare `rtl:` in code; `validate:rtl` checks each against its own variants |
| `contract-spec` | 142 | 142 | 0 | 9 assert through shared setup rather than an inline mount |
| `story-light-dark` | 142 | 142 | 0 | |
| `unit-spec` | 141 | 141 | 0 | 8 through shared setup |
| `token-contrast` | 138 | 138 | 0 | corpus-scoped and declared so; `validate:tokens` runs the cited checker |
| `ssr-sample` | 120 | **119** | **1** | 3 of the 119 assert only `toBeTruthy()` — see §3.3 |
| `state-stories` | 87 | **60** | **27** | §3.2(a) — **all 27 are `pass`** |
| `browser-play` | 86 | 86 | 0 | |
| `axe` | 61 | 61 | 0 | 38 as the render subject, 23 as the root of an inline template |
| `threat-model` + `malicious-corpus` + `url-policy` | 90 | 90 | 0 | 14 components each via a class-level artifact; every one declares the `url` boundary |
| `a11y-narrative` | 22 | 22 | 0 | |
| `real-world-story` | 22 | 22 | 0 | |
| `portal-hydration` | 19 | **3** | **16** | §3.2(b) |
| `keyboard-spec` | 16 | 16 | 0 | |
| `data-scenarios` | 8 | 8 | 0 | |
| `non-drag-alternative` | 7 | 7 | 0 | 2 exercise the keyboard path by **asserting the emitted** `KeyboardEvent`, not by dispatching one |
| `csp-fixture` | 2 | 2 | 0 | |
| `controlled-uncontrolled` | 1 | 1 | 0 | |

**`U = 0` is a claim, so here is its basis.** Every distinct `(kind, file)` site behind a non-`G`
verdict was opened and read; so were all 16 `axe`/`ssr`/`portal` sites in full (5,832 lines), the
story-DoD check definitions, the browser ledger, the security coverage manifest and the RTL
validator. Nothing was decided from a file name or a test title.

### 3.2 The two mechanisms

**(a) `state-stories` — "not applicable" is published as `pass`, 27 times. This is the
consequential one, because it is the only one that touches `pass`.**

`generate-capability-matrix.ts:422`:

```ts
function storyCheck(sources: Sources, component: string, check: string): CellState {
  if (!sources.storyFile.has(component))
    return 'unrun'
  return sources.storyDod.get(check)?.has(component) === true ? 'unrun' : 'pass'
}
```

The comment above the map that feeds it says *"a component absent from the failing set passed the
check"*. **A component the check does not APPLY to is also absent from that set.** The `states`
check is the one with a non-trivial `applies` clause — `ctx => ctx.stateProps.length > 0`, derived
from the component's own `.types.ts`, which `story-dod.ts` documents at length as the DoD's "as
applicable" clause finally meaning something. `DodCheckResult` carries `applicable` as a **count**
and not as a **set**, so the generator cannot tell "passed" from "never asked".

Measured: `checkStoryDod()` reports `states` as `applicable=56, passing=53, violations=3`, over
170 story files. Of the 87 `state-stories` cells reading `pass`, **60 cite a story file that
exports `States`; 27 cite a story file that does not and never had to.** Those 27 are
`pass` — a capability this repository reports as passing that was never exercised, with a story
file printed beside it as the evidence.

The 27, all Tier B except two Tier C: `DzBackTop` `DzBlockUI` `DzCard` `DzCollapse`
`DzColorModeToggle` `DzDialog` `DzFieldArray` `DzInputMask` `DzKnob` `DzLightbox` `DzListItem`
`DzNotification` `DzPanel` `DzPopover` `DzRating` `DzScrollArea` `DzSheet` `DzSplitter`
`DzStepper` `DzStepperItem` `DzTagsInput` `DzToast` `DzToolbar` `DzTooltip` `DzTreeItem` ·
`DzTour` (C) `DzTreeSelect` (C).

**(b) `portal-hydration` is `ssr-sample` under another name — 16 of 19.**

The two resolvers are **the same predicate** — `filesLoadingComponent(sources.ssrSpecs, …)`,
called twice. `portal-hydration` has no term for a teleport and no term for hydration; any
component loaded by any file under `packages/core/tests/ssr/` gets it. The cell claims
*"Teleported content survives SSR and hydration"*.

Opened, of the 19 citations:

| | |
|---|---|
| show the portal branch taken and assert the teleport boundary | **3** — `DzSidebar` (`teleport start`/`end` anchors plus its own subtree), `DzTour` (`open: true`, anchor pair, nothing painted), `DzCommandPalette` (`open: true`, nothing in the document flow) |
| render the component **closed**, so the teleport branch is never reached | **8** — `DzDialog` `DzTooltip` `DzPopover` `DzSheet` `DzDropdownMenu` `DzContextMenu` (all *"passes its slot through and adds no element in SSR"*), plus `DzSelect` ×2 |
| have no teleport in the test at all | **8** — `DzDataGrid` (grid roles), and the seven form controls in `form-controls-ssr.spec.ts` that assert a *value* renders |
| **hydrate anything** | **0** |

The last line is the sharpest: **no `portal-hydration` citation hydrates.** `ssr-smoke.spec.ts`
contains no hydration at all — only a comment at :76 pointing at the file that does — and
`form-controls-ssr.spec.ts` says so itself in its header: *"What this does not do is drive a
hydration mismatch."* The only hydration in the SSR lane is in `dz-provider-ssr.spec.ts`
(providers) and `form-layouts-ssr.spec.ts:157` (`DzStepper`), and neither is cited by a
`portal-hydration` cell.

### 3.3 The single `ssr-sample` W, and three weak greens

- **`DzAccordion`'s `ssr-sample` cites `ssr-smoke.spec.ts:293`, which is `it.skip`** — *"blocked by
  Reka UI AccordionRoot SSR stall"*. The predicate counts the dynamic
  `import('…/DzAccordion.vue')` inside a test that never runs. It keeps a genuine citation from
  `form-layouts-ssr.spec.ts:99`, so the **cell** stays `present` and loses one artifact. That is
  the RESIDUAL-05 shape exactly: the false citation is harmless in effect, and no gate could see
  it.
- **Three citations assert only `toBeTruthy()`** — `DzCheckboxGroup`, `DzPersonaSelector`,
  `DzTreeSelect` in `form-controls-ssr.spec.ts`. `ssr-smoke.spec.ts`'s own header records why that
  is nearly nothing: *"`renderToString` returns `'<!---->'` — seven bytes, truthy — for a
  component that renders nothing."* They are counted **G**: an SSR render really happens and the
  cell is `present`, which claims a sample exists, not that it asserts much. They are named here
  because the assertion cannot fail on an empty render.

---

## 4. What was tightened, and the proof each way

Two predicates and one data shape. Every rule is pinned by a test that **reconstructs the old
predicate inline, shows it crediting something wrong, then shows the shipped predicate rejecting
it** — RESIDUAL-05's and RESIDUAL-14's method. 24 new cases across two new spec files, plus 4
added to `story-dod.spec.ts`; all pass.

### 4.1 `T1` — a citation must exercise the capability, not merely load the component

New module `packages/tooling/src/quality/spec-capability-refs.ts`. It **wraps** rather than
replaces `filesLoading`: loading is still required and is still the thing a comment cannot do, so
RESIDUAL-05's floor is intact. What is added is the second requirement — a **live** test block in
that file must both name the component and do the thing the cell claims:

| Kind | Added term |
|---|---|
| `axe` | `axe(…)` / `toHaveNoViolations` in the block |
| `ssr-sample` | `renderToString`, or a file-level helper whose body reaches it, called in the block |
| `portal-hydration` | the above **and** the portal branch taken — the teleport anchor pair asserted, or `open: true` |

`generate-capability-matrix.ts`'s three call sites now pass their kind, and
`filesLoadingComponent` is `filesExercisingCapability`.

**Proof, `portal-hydration`** (`spec-capability-refs.spec.ts`):

- *"the OLD predicate credits an overlay rendered CLOSED, whose teleport is never reached"* —
  `oldPredicate(CLOSED_OVERLAY, 'DzDialog')` is `true`, over the real `ssr-smoke.spec.ts` shape
  (`ssrRender(DzDialog, { open: false }, …)`).
- *"the NEW predicate rejects it"* — `filesExercising(…, 'portal-hydration')` is `[]`.
- *"…and still credits it for `ssr-sample`, which is the claim that test DOES support"* — the
  same file, same component, `['closed.spec.ts']`. **The rejection is not a blanket one.**
- *"credits a portal rendered OPEN with its anchor pair asserted"* — the `DzTour` shape passes.

**Proof, the skipped test:** the old predicate credits the dynamic import inside `it.skip`; the
new one rejects it; flipping `it.skip(` to `it(` credits it again.

**Proof, `axe`:** the old predicate credits `cards.a11y.spec.ts`'s `it('has role="button" …')`,
which renders `DzCard` and never runs axe; the new one rejects it and credits the block that
awaits `axe(container)`. A fourth case pins the **inline-template root** shape — 23 of the 61
`axe` citations mount through `render({ template, components })` rather than `render(DzFoo)`, and
a predicate that only looked for the latter would have moved every one to `unrun`.

**Proof the floor still holds:** a `// Note: DzGhost is tested in another.a11y.spec.ts.` beside a
real axe run grants `DzGhost` nothing, while `DzCard` in the same file keeps its citation. And a
docblock quoting `await axe(container)` does not satisfy `exercisedBy`, because it reads
comment-stripped text — the mechanism RESIDUAL-14 measured 18 times.

### 4.2 `T2` — "the check was never asked" is not a pass

`DodCheckResult` gained two fields — `applicableFiles` and `passingFiles` — because `applicable`
was a **count** and its one consumer was inverting `violations` as if a count could tell
*passed* from *never asked*. `storyCheck` now answers in four arms, **in this order**:

1. no story file → `unrun`;
2. **the story satisfies the check → `pass`**, whatever applicability says;
3. it does not and the check does not apply → `excepted`, with the reason and a citation a reader
   can open;
4. it does not and the check did apply → `unrun`.

**Arm 2 is first because measurement forced it.** The first version of this change asked
applicability first and moved **36** cells, of which **9 were wrong**: `DzInput`, `DzTextarea`,
`DzNumberInput`, `DzPasswordInput`, `DzSearchInput`, `DzListbox`, `DzMention`, `DzAnchor` and
`DzCascader` all export a real `States` story, and `states` never asks them because their state
props are inherited from `BaseFormControlProps` while `story-dod.ts` reads the component's **own**
`.types.ts` (deliberately narrowed by N1-O1 defect D6). Demoting `DzInput`'s `States` story to
"nothing to demonstrate" would have been a second false claim in the opposite direction. With arm
2 first the movement is **27**, which is exactly the census figure.

**Proof** (`story-check-state.spec.ts`, 6 cases): the old inversion answers `pass` for a component
the check does not apply to; the new resolution answers `excepted` and says why; a `States` story
still reads `pass` where applicability says the check does not apply; applicable-and-passing is
`pass` and applicable-and-failing is `unrun`; no story file is `unrun` and **not** `excepted`
("nobody wrote a story" is a gap, and must not acquire a reason it has not earned"); and a check
with no applicability narrowing (`dark-mode`) resolves **identically to the old predicate**, both
ways, so the four-arm form is not a behaviour change where nothing was wrong.

`story-dod.spec.ts` adds four whole-corpus cases: `applicableFiles` and `applicable` must agree
(a list is only an improvement on a count if they cannot drift), every violation must be a file
the check applied to, `states` must apply to strictly fewer files than `dark-mode`, and
`passingFiles`/`applicableFiles` must disagree **in both directions** — which is the `DzInput`
case, asserted rather than narrated.

### 4.3 A citation for the exception

An `excepted` story cell no longer cites the story file — it is evidence of nothing there — and
cites the component's **`.types.ts`** instead: the file `story-dod.ts` reads to decide
applicability, and therefore the one a reader must open to check the exception.

### 4.4 What was NOT changed, and why

- **Hydration is not required of `portal-hydration`.** No citation in this repository hydrates a
  teleporting component, so requiring it would move all 19 cells including the 3 good ones, and
  would demand a harness that exists only in `dz-provider-ssr.spec.ts`. The evidence for the
  narrower reading is in the repository's own words — `ssr-smoke.spec.ts:1032`: *"A teleporting
  component that renders to string at all is the claim that row makes: SSR has no DOM to teleport
  INTO, so the component must degrade rather than reach for one."* **The rejected alternative** was
  to redefine the kind silently to mean what the tests happen to do. Instead every surviving cell's
  note now says *"The SSR half only … the `and hydration` half of this kind is unevidenced"*, and
  `D-RES16-2` asks the owner to split the kind or demote the survivors.
- **`toBeTruthy()`-only SSR citations were kept.** `present` claims a sample exists, and one does.
  Three are named in §3.3; strengthening them is a spec change, not a generator change.
- **`token-contrast`'s 138 corpus `pass` cells were not demoted.** The cell declares
  `scope: 'corpus'`, its note says the gate covers every pair in the catalogue at once, and
  `validate:tokens` runs the cited checker. That is an aggregate **labelled** as one, which is the
  opposite of the substitution this matrix exists to prevent.
- **No ceiling was raised and no allowlist widened.** `capability-matrix-ceilings.json` was not
  opened for writing.

---

## 5. The movement — and `pass` fell by 27

| | Entry (`4e4e46f` tree) | After | Δ |
|---|---:|---:|---:|
| `pass` | **585** | **558** | **−27** |
| `fail` | 0 | 0 | — |
| `present` | **623** | **608** | **−15** |
| `stale` | 22 | **22** | — |
| `unrun` | **385** | **400** | **+15** |
| `excepted` | 47 | **74** | **+27** |
| cells | 1,662 | 1,662 | — |

Per tier, after: A `106/0/176/0/64/4` · B `300/0/307/0/244/66` · C `145/0/113/21/91/4` ·
D `7/0/12/1/1/0`.

**Yes — 27 cells lost `pass`, and that is the headline.** Every one is `state-stories`, every one
was "the check never asked" published as "the check passed", and every one cited a story file that
does not contain the story. Named in §3.2(a). They are now `excepted` with a reason and a
different citation, not `pass`, and not `unrun` either — because a component declaring none of
`disabled`/`loading`/`readonly`/`invalid`/`error`/`required` owes no `States` story, and calling
that a gap invites somebody to add a meaningless one to `DzVisuallyHidden`. The in-repo precedent
is `keyboard: 'none'` → `excepted`, derived by this same generator since TASK-R5-O5.

**15 cells lost `present`** — all `portal-hydration`, all to `unrun`: `DzCascader`
`DzColorPicker` `DzCombobox` `DzContextMenu` `DzDataGrid` `DzDialog` `DzDropdownMenu`
`DzMultiSelect` `DzPersonaSelector` `DzPopover` `DzSelect` `DzSheet` `DzTimePicker` `DzTooltip`
`DzTreeSelect`. Three survive: `DzCommandPalette`, `DzSidebar`, `DzTour`.

**One cell lost an artifact without changing state:** `DzAccordion`'s `ssr-sample`, 3 → 2.

**Nothing else moved.** No `axe`, `unit-spec`, `contract-spec`, `rtl-contract`, `browser-matrix`,
`token-contrast`, `keyboard-spec`, `data-scenarios`, `non-drag-alternative`,
`controlled-uncontrolled`, security or other story cell changed state or citation — the tightened
`axe` predicate accepted all 61 of its citations, which is the census result turned into a
standing rule rather than a one-off measurement.

### 5.1 The gate is GREEN, and that is itself a finding

`yarn validate:capability-matrix` exits **0**: *"fresh, and no Tier D cell is unexplained"*.
`unrun 400 (baseline 400)` — drift **zero**, because the recorded baseline is 400 and the
tightening put the number back there. `22 stale cell(s) — ceiling 22` is untouched, and gate 5
compared 2,112 committed browser `pass` cells with **0 degraded**.

So a change that removed 27 false `pass` cells and 15 false `present` cells fails nothing.
**No ratchet in this repository holds `pass` or `present` at all** — `capability-matrix-ceilings.json`
ratchets `stale` and *reports* `unrun`, and the only gate that can notice evidence getting worse is
gate 5, which is specific to the browser ledger. `D-RES16-3` raises that.

One bookkeeping mismatch, deliberately left: `unrunCells.perTier` records
`A 65 / B 247 / C 87 / D 1` **at `4e4e46f`**, which is still true of `4e4e46f`; the working tree
now reads `A 64 / B 244 / C 91 / D 1` for the same total of 400. The gate compares only the total.
The file was not edited, because editing the ratchet file is the one move this packet was told not
to make, and the record is of a commit rather than of a tree.

### 5.2 One board row moved the wrong way — reported, not hidden

`EXECUTION-STATUS.md`'s ratchet board carries **"Tier C/D unrun with nothing on disk
('unexplained')"**, at-open 48, target 0, owned by S1-O2 and recorded there as **35 at `4e4e46f`**.
Measured here under the definition *Tier C/D cell, `unrun`, zero artifacts*:

| | Total | By kind |
|---|---:|---|
| Entry tree | **34** | `axe` 15 · `controlled-uncontrolled` 19 |
| After | **42** | `axe` 15 · `controlled-uncontrolled` 19 · **`portal-hydration` 8** |

**+8, and every one is a Tier C `portal-hydration` cell that used to cite a file which did not
evidence its claim.** The row moves away from its target, and that is the honest price: those eight
cells had an artifact and now have none, because the artifact was not evidence. The board's own
figure was **not edited** — the row is S1-O2's to move and its number is bound to a commit, not to
a tree — but the movement is recorded in this report and again in `EXECUTION-STATUS.md`'s
RESIDUAL-16 section, so it is visible in the same place the target is.

---

## 6. Owner decisions raised — three

### `D-RES16-1` 🔴 **RAISED** — 27 `state-stories` cells were `pass` because nobody asked

**Measured.** §3.2(a). The `states` DoD check applies to 56 of 170 story files; the other 114 are
components whose own `.types.ts` declares none of the six state props. The generator read "absent
from the failing set" as "passed", so 27 of them published `state-stories: pass` with their story
file cited. **This packet has already moved them to `excepted`** — the question is whether that is
the state the owner wants.

**Options.** **(a)** keep `excepted` with the derived reason and the `.types.ts` citation — what
ships now, and what `keyboard: 'none'` already does for `keyboard-spec`. **(b)** `unrun`, treating
"no States story" as a gap whatever the props say — honest about the artifact, but it asks 27
components to add a story demonstrating states they do not have. **(c)** remove the cell from the
row entirely for non-applicable components, so the tier requirement itself is derived — the
cleanest, and the largest change, because `requiredEvidence(tier)` is currently tier-driven and
trait-driven only.

**Recommendation: (a), and (c) as the eventual shape.** (a) is reversible and already true; (c) is
where "as applicable" belongs if it is to be a property of the model rather than of one resolver.

**Cost of doing nothing:** none now — the numbers are already honest. The risk is that a future
reader sees `excepted` **74** and reads a laundering where there was a correction, which is why
every one of the 27 carries a note naming the mechanism and the packet.

### `D-RES16-2` 🔴 **RAISED** — `portal-hydration` claims hydration and nothing hydrates

**Measured.** §3.2(b). The kind is documented as *"Teleported content survives SSR and
hydration."* Of its 19 citations, 3 evidence the SSR half with the portal branch taken and **0**
evidence hydration; the only hydration in the SSR lane is `dz-provider-ssr.spec.ts` (providers) and
`form-layouts-ssr.spec.ts:157` (`DzStepper`), neither of which is a teleporting component's portal.

**Options.** **(a)** split the kind — `portal-ssr` (what 3 cells now evidence) and
`portal-hydration` (which nothing evidences, so 18 cells read `unrun` until a hydration harness
exists). **(b)** keep one kind and demote the 3 survivors to `unrun`, so the column is honestly
empty — maximally truthful, and it deletes the only real portal evidence in the repository from
view. **(c)** keep what ships now: 3 `present` whose note says which half is missing, 15 `unrun`.
**(d)** write the missing harness — hydrate an opened overlay into its server markup and assert the
teleported subtree — which is a spec task, not a generator one, and is the only option that makes
the cell mean what it says.

**Recommendation: (c) now, (d) next, and (a) only if (d) is declined.** (c) is what a `present`
cell with an explicit note is for; (d) is cheap for `DzTour` and `DzSidebar`, whose SSR output is
already byte-asserted, and `form-layouts-ssr.spec.ts:157` is a working model of the assertion.

**Cost of doing nothing:** 3 cells read `present` for a kind whose name promises twice what they
show. The note makes that visible; the name still overstates.

### `D-RES16-3` 🔴 **RAISED** — nothing in this repository refuses a manufactured `pass`

**Measured.** §5.1. `pass` fell 585 → 558 and `present` 623 → 608, and `yarn validate:all` exits
**0** with 53 `✓` and no `✗`. The capability gate ratchets `stale` (ceiling 22, two-way) and
*reports* `unrun`; `pass` and `present` have no ratchet, no baseline and no per-kind record. Gate 5
guards browser `pass` cells specifically and saw 0 degraded because no browser cell moved.

That is the same asymmetry three packets in a row have now paid for: RESIDUAL-02's substring
citations, RESIDUAL-14's 52 keyboard rows and this packet's 27 false `pass` cells were all found by
reading, and in every case *"the totals did not move, so no gate fired"* was the reason they had
survived.

**Options.** **(a)** record `passCells` and `presentCells` in `capability-matrix-ceilings.json` as
two-way handshakes per kind, exactly as `staleCellKinds` holds the stale *set*: a rise must be
explained, a fall must lower the record in the same change. **(b)** a weaker floor: hold only
`pass` per tier as a report, like `unrun`. **(c)** nothing, on the argument that this matrix exists
to show gaps and a gate on `pass` becomes a reason to manufacture one.

**Recommendation: (a), scoped per kind.** The objection behind (c) is real for `unrun` and does not
transfer: a ratchet on `pass` cannot be satisfied by hiding a gap, only by producing evidence or by
writing down that the evidence was withdrawn. Per-kind matters for the same reason
`staleCellKinds` does — 585 is also satisfied by trading 27 real passes for 27 invented ones.

**Cost of doing nothing:** the next false `pass` is found by the next audit or not at all. This
packet's own change would have passed unnoticed in either direction.

**Not raised, because they need a spec rather than a decision:**
`DzCheckboxGroup`/`DzPersonaSelector`/`DzTreeSelect`'s `toBeTruthy()`-only SSR assertions (§3.3) —
`'<!---->'` is truthy, so those three cannot fail on an empty render. Strengthening them is three
one-line assertions in `form-controls-ssr.spec.ts` and moves no cell.

---

## 7. Validation — every exit code read from a log file

Never through a pipe; each command was run as `cmd > <absolute>.log 2>&1; echo "exit $?"` and the
log then read.

| Command | Exit | Result |
|---|---:|---|
| `yarn typecheck:tooling` | **0** | run three times across the change |
| `node node_modules/eslint/bin/eslint.js <6 changed files>` | **0** | two errors fixed **by hand**, never `--fix` |
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/quality/spec-capability-refs.spec.ts` | **0** | 18 passed |
| `node node_modules/vitest/vitest.mjs run <4 specs>` | **0** | 82 passed |
| `yarn regenerate:all` | **0** | 7 of 7 steps, twice (the second after a note-text correction) |
| `yarn generate:capability-matrix` | **0** | |
| `yarn validate:capability-matrix` | **0** | `✓ fresh, and no Tier D cell is unexplained` · `unrun 400 (baseline 400)` · `22 stale — ceiling 22` · browser-degradation 0 of 2,112 |
| **`yarn validate:all`** | **0** (×2) | **62 links, 53 `✓`, zero `✗`** — identical to entry, on both runs (the second after the docs edits, so `docs-size` and `doc-snippets` are measured against this report: `✓ every budgeted artifact is inside its ceiling` · `✓ 20 fixture-backed snippet(s) match their fixtures`) |
| **`yarn test`** | **0** (×2) | **580 files, 11,479 passed, 3 skipped, 1 todo, 0 failed** — identical summary on both runs |

### 7.1 Pre-existing vs new, separated

**New in this batch:** +2 spec files, +28 tests (18 + 6 + 4), and the cell movement in §5.
Nothing else.

**Pre-existing, untouched, and reported so a reader does not attribute them here:**

- `DzToolbar.vue:52/55` — three `TS7022`/`TS7024` implicit-`any` errors printed inside the
  `validate:all` log by a step that exits 0. Not in a file this batch opened.
- `docs-freshness` prints `! [stale] 155 of 160 input(s) are NEWER than the built site` and
  `⚠ … the BUILD is unmeasured or stale`. Off CI this is a report by design — an ordinary local
  edit makes the dist stale within seconds.
- 22 `perf-baseline` stale cells, blocked on owner decisions `D-S1O4-1`/`D-S1O4-2`.
- `D-RES13-2` (the intermittent reporter-RPC `onTaskUpdate` exit 1 on a green suite) **did not
  reproduce on either run**: `yarn test` exited **0** both times, with the identical summary
  (`580 passed | 11479 passed | 3 skipped | 1 todo`). Both runs are quoted, per the standing rule,
  even though neither needed a re-run.

### 7.2 Frozen ratchets — every one re-read, none moved

`unclassified` **29/29** · `maxWithoutAnatomy` **41/41** · `maxProposedCitedFromCode` **3**
(ceiling 3) · AT executed **0 of 534** · locales ≥ 95 % **1** (floor 1) · inline-style sites
**133** (81 static + 52 bound) · `maxUndeclaredHandlers` **0** · `anatomy-keyboard`
**0 / 0 / 0**, **401 of 401 backed** · `staleCells` **22**, ceiling 22 · `staleCellKinds`
`["perf-baseline"]`. `capability-matrix-ceilings.json` and `anatomy-keyboard-ceilings.json` were
not opened for writing.

### 7.3 No lane leaked, and nothing was killed

No browser lane was invoked by this batch — the work is a generator, a validator field and two
spec files. **No process was killed by name or otherwise.** `yarn test` and `yarn validate:all`
each ran to completion and exited on their own.

---

## 8. Residue — every dirty path attributed

**416 at entry → 421 at exit: +5, all of them this batch's, and every pre-existing path
preserved.** The entry `git status --porcelain` was snapshotted to the session scratchpad
(`RESIDUAL-16-git-status-entry.txt`) before the first edit and diffed against the exit listing;
the diff is exactly these five lines and nothing else.

| Path | Status | Why |
|---|---|---|
| `packages/tooling/src/quality/spec-capability-refs.ts` | `??` new | `T1` — the outcome half of a citation |
| `packages/tooling/src/quality/spec-capability-refs.spec.ts` | `??` new | 18 cases, both directions per rule |
| `packages/tooling/src/quality/story-check-state.spec.ts` | `??` new | 6 cases pinning `storyCheck`'s four arms |
| `packages/tooling/src/validators/story-dod.ts` | ` M` | `applicableFiles` + `passingFiles` on `DodCheckResult` |
| `packages/tooling/src/validators/story-dod.spec.ts` | ` M` | 4 whole-corpus cases for the two new fields |

**Already dirty at entry, and modified again here** (so no new path appears):
`packages/tooling/src/quality/generate-capability-matrix.ts` (the three resolvers, `storyCheck`,
`storyCell`, the two new source maps) · `packages/core/docs/capability-matrix.json` ·
`packages/core/docs/component-meta.json` · `apps/docs/.vitepress/generated/nav.json`
(`artifactSha256` now `116a169fdaf3…`) · `apps/docs/evidence/*.md` and `apps/docs/components/*.md`
(153 files) · `packages/core/docs/llms*.txt` ·
`packages/core/security/inline-style-inventory.json` (regenerated, **unchanged at 133 sites**) ·
`docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` and
`reports/owner-decision-register-2026-09-22.md`. This report lives under the already-untracked
`docs/program-2026-09-22-architecture/reports/`.

**` M yarn.lock` is the owner's `yarn install` and was not touched.** `yarn install` was never run;
`npx` was never used.

### 8.1 Scratchpad, for anyone re-running the census

`C:\Users\Ekii\AppData\Local\Temp\claude\…\1fbe2666-…\scratchpad\`: `RESIDUAL-16-pairs.tsv` (all
1,634 pairs) · `scan.mts` (the regex-aware block scanner) · `census2.mts` (axe/ssr/portal) ·
`census3.mts` (the code-derived kinds) · `census-stories.mts` (the five story kinds) ·
`verdicts*.tsv` (per-pair verdicts) · `capability-matrix.BEFORE.json` (byte copy, sha256
`e2f74ee9…`, verified against the original before any regeneration) · every gate log.

---

## 9. Not done, and named rather than left to be discovered

1. **The three `toBeTruthy()`-only SSR assertions** (§3.3). Three one-line changes; moves no cell.
2. **The `portal-hydration` hydration harness** (`D-RES16-2` option (d)). `DzTour` and `DzSidebar`
   already byte-assert their SSR output and `form-layouts-ssr.spec.ts:157` is a working model.
3. **`contract-spec`/`unit-spec` measure existence plus one live assertion, not conformance.** All
   283 citations are genuine by that criterion, but the criterion is thin: a sidecar with one
   `expect(mount(DzFoo).exists()).toBe(true)` satisfies it. Measuring *Contract Spec v1
   conformance* means reading the harness's own coverage, which is a packet.
4. **`rtl-contract` is declaration + a source gate, never a computed layout.** `validate:rtl` says
   so itself (*"whether `margin-inline-start` actually resolves to the right physical edge … is
   `expectRtlComputed` in the Playwright lane"*). All 178 citations are genuine at that scope; the
   browser half is unmeasured here.
5. **`token-contrast`'s 138 `pass` cells are one corpus gate.** Declared, noted, and still the
   largest single block of `pass` in the matrix. Whether a corpus gate should produce 138
   component-scoped `pass` cells or one `corpus`-scoped one is TASK-R2-O1's own open question.
6. **`state-stories` is now `excepted` for 27 components; the other four story checks were not
   re-examined for the same asymmetry** because all four declare `applies: () => true` — asserted
   in `story-dod.spec.ts`, so a fifth check with a narrowing clause will surface as a test failure
   rather than as 27 more false passes.

---

## 10. Ranked next packet

1. **`D-RES16-3`, option (a)** — a per-kind two-way ratchet on `pass` and `present`. Three packets
   in a row have found false evidence by reading, and in all three the reason it survived is that
   no number moved. This is the one change that makes the *next* one fail loudly.
2. **`D-RES16-2`, option (d)** — write the portal hydration assertion for `DzTour` and `DzSidebar`.
   Cheapest way to make a published kind mean its own name.
3. **`D-RES16-1`** — ratify `excepted` (or choose (c) and derive the cell's existence from
   applicability).
4. **Item 3 of §9** — what `contract-spec` actually proves. 283 citations, the largest unexamined
   claim left in the matrix, and the criterion this packet used for them is the weakest one it used
   for anything.
