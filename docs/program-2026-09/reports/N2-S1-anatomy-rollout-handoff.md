# TASK-N2-S1 — Anatomy declarations + typed `ui` prop, rollout by family slices

> **Standing: locally qualified, worktree-dirty.** Nothing here is committed,
> pushed, dispatched to CI or published. Every number binds to
> `ui/dzup-ui` `main` @ `51dec93` with the uncommitted N1 + N2 program on top
> (180 working-tree entries at task start; ~40 under `packages/core/src/` from
> N1's WCAG work, none of them reverted).
>
> **ADR-19 is still *Proposed*.** This packet rolls out the contract it defines
> and adds two gates that enforce it. Accepting the ADR remains an owner
> decision (TASK-N5-05); §11 files the `data-scope` evaluation as an input to
> that packet.

---

## 1. The corrected baseline table — every number in the task brief re-measured

The brief carried six figures. **Five of them are wrong**, and the two the
orchestrator flagged in advance were not the only two. Every row below was
measured on this tree before any file was edited.

| # | Task brief says | Measured | Verdict |
|---|---|---|---|
| 1 | anatomy "9/144 declared" | **9 `.anatomy.ts` files; 8 belong to public components.** `DzDialogContent.anatomy.ts` is a compound part, and the ratchet's denominator is public components. | **Half-wrong.** 9 is the file count, 8 the ratchet-relevant count. The generated site already published 8 (`apps/docs/evidence/styling-posture.md`). |
| 2 | "ratchet 137" | **136.** `yarn validate:ownership` printed, verbatim: `136/136 public components without anatomy`. `unclassified-ceiling.json:maxWithoutAnatomy` = `136`, lowered from 137 on 2026-08-24 by `DzFileUpload`. | **Wrong** — confirms **B2**. The brief's "137 → 124" would have booked a phantom −1. |
| 3 | "`data-part` emitted by 22 files" | **12 files** emit a static `data-part=` in `packages/core/src`. At `8d80bc39` (the commit the reassessment measured) it was 12 as well. No measurement I can construct yields 22: 12 `.vue`, 24 files if `.spec.ts` are included, 31 across all of `packages/`. | **Wrong, and unreproducible.** See finding **S1-F1** — the reassessment, and ADR-19 before it, counted `TeamMemberBadge` as a `data-part` emitter because it contains `data-part`**icipant-id**. |
| 4 | "attribute outruns declaration 2.4×" | 12 emitters ÷ 9 declarations = **1.33×**, and the composition is not what the ratio implies: 5 of the 12 are `DzTable*` compound parts whose names `DzTable.anatomy.ts` already declares. | **Wrong** — the arithmetic consequence of row 3. |
| 5 | "13 undeclared emitters" → "ratchet 137 → 124" | **7 files** emit `data-part=` with no `.anatomy.ts` beside them; only **1** is a public component (`DzCodeBlock`). By *part occurrence* rather than by file, **12 emissions** were undeclared anywhere. | **Wrong.** The alignment pass cannot move the ratchet by 13, because 13 undeclared public emitters do not exist. It moves it by **1**. |
| 6 | "5 pilots" for the `ui` prop | **4 public components** (`DzButton`, `DzInput`, `DzSelect`, `DzTable`) **+ 1 compound part** (`DzDialogContent`). `DzDialog.types.ts` carries `ui?: DzDialogContentUi` on `DzDialogContentProps`; `DzDialog` itself has no `ui`. | **Wrong** — confirms **B-D2-F8**. Booked from **4**. |

### The corrected arithmetic, stated explicitly

- The anatomy ratchet ceiling is **136**, not 137.
- The alignment pass is **136 → 135** (one public component, `DzCodeBlock`), not
  136 → 123 and certainly not 137 → 124. **There is no set of 13 undeclared
  public emitters to align.** The brief's ×13 target was derived from row 3's
  phantom 22.
- The rollout is therefore driven by **family completion**, not by alignment.
- Delivered: **136 → 113** (−23). Three families complete, plus the one
  alignment component.

### What the 12 emitters actually were, before this packet

| Emitting file | Kind | Parts emitted | Declared where |
|---|---|---|---|
| `DzButton.vue` | public | `root`, `spinner` | own anatomy |
| `DzInput.vue` | public | `root control input prefix suffix spinner clear error` | own anatomy |
| `DzSelect.vue` | public | 14 names | own anatomy — **except 3** (S1-F2) |
| `DzTable.vue` | public | `root content title` | own anatomy |
| `DzCodeBlock.vue` | public | `header filename language copy-button content line-number` | **nowhere** → fixed |
| `DzTableBody/Cell/Footer/Header/Row.vue` | compound part ×5 | `body cell footer header row` | `DzTable.anatomy.ts` (parent) |
| `DzDialogContent.vue` | compound part | `overlay content header viewport footer` | own anatomy |
| `DzOptionsState.vue` | **unmanifested internal** | `options-state options-message options-retry` | **nowhere** → ratcheted, S1-F2 |

And one gap running the other way, which no count in the brief had a slot for:
**`DzFileUpload` declared `parts: ['root']` and its template emitted no
`data-part` at all.** A declaration with nothing behind it — the exact shape
ADR-19 exists to make impossible — on the component that lowered the ratchet to
136 in the first place.

---

## 2. What was implemented, and the API effect

### 2.1 Two new gates

| File | What it does | `validate:all` |
|---|---|---|
| `packages/tooling/src/validators/tv-slot-calls.ts` (+ `.spec.ts`, 20 tests) | **The G1 guard.** Fails on a `tv()` slot function bound without being called. | `validate:tv-slots`, new link |
| `packages/tooling/src/validators/anatomy-parts.ts` (+ `anatomy-parts-ceilings.json`) | Source-level alignment between emitted `data-part` and declaring anatomies — the hook **ADR-19 assigns to `validate:contract-parity` and which was never built**. | `validate:anatomy-parts`, new link |

`yarn validate:all` **33 → 35 links**.

### 2.2 One gate widened

`packages/tooling/src/validators/rtl.ts` — `checkRtlDeclarations` now reads the
component's **`.vue` template** as well as its `.variants.ts`. It read
`.variants.ts` alone, and **14 templates across the catalog write a physical
layout utility inline** (19 occurrences). The widening turned the gate red
immediately on `DzSelect` — a pilot (S1-F4).

### 2.3 One test helper corrected

`packages/testing/src/anatomy.ts` — `expectAnatomy` now stops descending at a
descendant carrying `data-part="root"`, because that is another component's
root. Without the boundary the rollout is self-limiting; see S1-F3. Seven new
specs in `anatomy.spec.ts` pin both directions.

### 2.4 Component changes — 23 new anatomy declarations, 22 new `ui` props

| Family | Public components | Declared before | Declared after | `ui` before | `ui` after |
|---|---|---|---|---|---|
| **inputs** | 8 | 1 (`DzInput`) | **8 / 8** | 1 | **8 / 8** |
| **buttons** | 8 (+2 compound parts) | 1 (`DzButton`) | **8 / 8** | 1 | **8 / 8** |
| **typography** | 8 | 0 | **8 / 8** | 0 | **8 / 8** |
| data (alignment only) | 19 | 1 (`DzTable`) | 2 (`+DzCodeBlock`) | 1 | 1 |
| forms (repair only) | 28 | 2 | 2 | 1 | 1 |

New files: 23 `Dz{Name}.anatomy.ts`, 3 family conformance specs, 1 Playwright
spec, 2 validators + 1 validator spec + 1 ceilings file. Modified: 22 `.vue`
(parts + `ui` wiring), 22 `.types.ts` (the `ui` prop), `DzSelect.anatomy.ts`,
`DzSelect.vue`, `DzFileUpload.vue`, `DzCodeBlock.vue`, and the two compound
parts `DzSplitButtonAction.vue` / `DzSplitButtonMenu.vue`.

`DzCodeBlock` gets an anatomy but **no `ui` prop**: it is the alignment case,
not part of a completed family, and the packet books `ui` adoption strictly by
family so the docs site's per-family claim stays exact. That is why the two
counts differ by one — measured in the artifact:
`27 components with a ui prop · 26 public + 1 compound part`.

**API effect: additive only.**

- `ui?: Dz{Name}Ui` is a new optional prop on 22 components. Nothing existing
  changes shape.
- `data-part` / `data-state` attributes are added, never renamed or removed.
  **No part was renamed** — where a shipped name is awkward it is declared as
  shipped and the rename is routed to the owner (S1-F2, §5).
- `class` keeps its existing target on every component. On the field
  components, `class` continues to land on `control` (the visual field), which
  is where it has always landed and what `DzInput` established; `ui.root`
  reaches the outer node.
- Two type narrowings are deliberate and both *reduce* what a `ui` map accepts
  rather than widening it, so neither can break an existing call:
  `DzSplitButtonUi` is `Pick<…, 'root'>` (§5).
- Three CSS class changes, all **LTR-identical** (§8): `DzTextarea`'s spinner
  `right-` → `inset-e-`, `DzSelect`'s item indicator `left-1` → `inset-s-1` and
  its item label `pl-6` → `ps-6`.

### 2.5 Generated artifacts regenerated (not hand-edited)

- `packages/core/manifests/component-ownership.manifest.json` —
  `yarn generate:ownership:core`
- `apps/storybook/stories/_data/anatomy.generated.ts` — same generator
- `packages/core/docs/rtl-matrix.md` — `yarn generate:rtl-matrix`
- `packages/tooling/src/ownership/unclassified-ceiling.json` —
  `maxWithoutAnatomy` 136 → 113, with the reason written into the file's
  `$comment` the way the previous four movements were

**`generate:exports` was NOT run** (B3). `public-api.manifest.json` is
byte-unchanged.

---

## 3. The G1 guard — the highest-leverage thing in the packet

N1-O3 finding **G1**: `DzLightbox` bound **ten** `tv()` slot functions without
calling them (`:class="styles.closeButton"`), so `normalizeClass` returned the
empty string and the component **rendered with no classes at all** — no
backdrop, no blur, no sizing, no positioning. Typecheck, lint, unit specs,
contract specs and the story-DoD gate all passed. N1's handoff closed with the
observation that a one-expression validator would have caught it.

`yarn validate:tv-slots` is that validator. For every `.vue` under
`packages/core/src` it resolves the slot names of every `tv({ slots })` recipe
in scope (sibling `.variants.ts`, relatively-imported `*.variants.ts`, inline
`tv()`), finds the identifiers those recipes are bound to
(`const styles = computed(() => fooVariants({…}))` and the destructured form),
and fails on any `binder.slot` / `binder.value.slot` not followed by a call.

**Current state: green, `130 of 209 SFCs have a slot recipe in scope`.** The
denominator is printed deliberately — a check that scans nothing also reports
nothing, and 77 `.variants.ts` files declare slots, so the surface this guards
is most of the catalogue.

### Proven failing, twice, on the real defect

Seeded the exact G1 line back into `DzLightbox.vue`
(`:class="styles.closeButton()"` → `:class="styles.closeButton"`):

```
✗ packages/core/src/components/media/DzLightbox.vue:164
  `styles.closeButton` is a tv() slot FUNCTION bound without being called. Vue's
  normalizeClass has no case for a function, so this renders with NO classes.
  Write `styles.closeButton()`. (N1-O3 finding G1 — DzLightbox shipped ten of
  these and every gate in the repository passed.)

1 bound-but-uncalled tv() slot(s). Each one renders its element with no classes at all.
```

exit 1. Restored; `sha256sum` of `DzLightbox.vue` back to
`98f60d148121c77b9e9964331cf9da77b167aecdc57f0db55ba59948c9f1a17a`, gate back to
exit 0.

**The first seeded run reported line 106 for a defect on line 164** — the
validator stripped comments by deleting them, and `DzLightbox` carries a 58-line
header comment explaining this very bug. Fixed by blanking comments
character-for-character instead, which is now pinned by a spec that asserts
`stripComments` preserves both length and line count.

Two further false-positive classes were found and closed by observation, not by
reasoning:

1. **A slot literally named `value`.** `DzStatCard`, `DzAnimatedNumber`,
   `DzCountdown` and `DzTreeSelect` all declare one, so `styles.value.root()`
   matched the pattern with `slot = value`. All four were reported on the first
   run. Fixed by excluding a trailing `.` as well as a trailing `(`.
2. **An HTML comment in a template.** The natural place to write
   `<!-- was :class="styles.overlay" before the fix -->` is three lines from the
   corrected binding. The spec that caught this is `ignores an expression that
   only appears inside a comment`, and it failed on its first run.

Escape hatch: `tv-slot-ok: <reason>` on the line, matching
`hardcoded-string-ok` and `rtl-physical-ok`. Zero uses today.

---

## 4. Findings

> Ten in total. **S1-F10 is in §15**, because it was found last, is about
> another packet's evidence rather than this one's code, and needed the room.

### S1-F1 🟠 — the `22 data-part emitters` figure is a substring false positive, and it has been propagating since ADR-19 was written

`TeamMemberBadge.vue` emits `:data-participant-id`, and **`data-part` is a
substring of `data-participant-id`**. ADR-19's own measured baseline table says
*"`data-part` — 7 occurrences in 2 files (`DzCodeBlock.vue`,
`TeamMemberBadge.vue`)"*; `TeamMemberBadge` has never emitted a `data-part`.
The reassessment's capability matrix inherited the same loose match and reports
22 emitting component files; a precise `data-part\s*=` match gives **12**, at
HEAD and at the commit the reassessment measured.

*Consequence.* The whole *"attribute outruns declaration 2.4×"* framing — this
task's stated motivation — is an artefact of a grep. The real ratio was 1.33×,
and the real problem was not that many components emitted parts without a
declaration but that **one public component did (`DzCodeBlock`), one
unmanifested internal did (`DzOptionsState`), and one declaring component
(`DzSelect`) emitted three parts outside its own declaration.** `staticPartsIn`
in the new validator anchors the attribute name with `=` and a word boundary,
and carries the reason in a comment so it is not loosened again.

### S1-F2 🔴 — `DzOptionsState` is an unexported internal that injects three undeclared `data-part` names into seven public components

`packages/core/src/components/forms/DzOptionsState.vue` is not exported from any
barrel, is **absent from `component-ownership.manifest.json` and from
`component-meta.json`**, and emits `data-part="options-state"`,
`"options-message"` and `"options-retry"`. It is rendered by **`DzSelect`,
`DzCascader`, `DzCombobox`, `DzListbox`, `DzMultiSelect`, `DzTransfer` and
`DzTreeSelect`** — so those three names are in the public DOM of seven form
components, and no generated artifact in the repository knows the component
exists.

`DzSelect` — an ADR-19 **pilot** — also writes the same three names inline in
its own template and declared none of them. `expectAnatomy` never saw it because
no spec mounts the failed-async branch, and no source-level check existed.

*What was done.* The three names are now declared in `DzSelect.anatomy.ts` (as
`parts` + `optionalParts`), which is additive and makes that pilot's declaration
true. `DzOptionsState`'s own three emissions are held by a **checked-in ceiling
of 3** in `anatomy-parts-ceilings.json`: they are governed only when *every*
host declares them, which needs the forms family slice, which this packet did
not have the budget for. The ceiling ratchets down and the file names all seven
hosts.

*Owner decision.* The names themselves — `options-state`, `options-message`,
`options-retry` — are kebab-case and role-describing, so they are legal ADR-19
part names, but they carry a component-name prefix that reads like a namespace
and none is in the shared vocabulary. **Renaming is breaking**, so nothing was
renamed. → **S1-D1**.

### S1-F3 🔴 — the styling contract does not compose, and the rollout made that visible on its second family

`expectAnatomy` walks the whole rendered subtree. The moment `DzFab` and
`DzIconButton` declared anatomies, `DzSpeedDial` — which renders one `DzFab`
trigger and one `DzIconButton` per action — started reporting:

```
• part "root" appears 5 times.
• the DOM emits data-part="icon", which the anatomy does not declare.
• the DOM emits data-state="closed", which the anatomy does not declare.
• the DOM emits data-state="idle", which the anatomy does not declare.
```

None of those is `DzSpeedDial`'s. **This failure mode is self-limiting by
construction**: as coverage grows, every component that composes a declared one
either breaks or has to re-declare its children's entire surface as its own,
which is the opposite of what parts are for. It did not appear in the five
pilots because no pilot composes another declaring component — `DzInput` renders
`DzSpinner`, which has no anatomy.

*What was done.* `expectAnatomy` now treats a descendant carrying
`data-part="root"` as an anatomy boundary and does not descend into it. That is
a **mechanical** marker, not an invented convention: ADR-19 §3 makes `root`
universal, so a nested `root` *is* another component's root. Compound parts are
deliberately not boundaries — `DzTableRow` emits `row`, not `root`, precisely
because `DzTable` owns that name. Seven specs pin it, including
`STILL reports an undeclared part inside this component's own boundary` and
`does NOT treat a compound part as a boundary`.

*The residual case the boundary cannot fix.* `DzTooltipTrigger` merges its
attributes **onto its child**, so `DzRelativeTime`'s `<time data-part="root">`
also carries the tooltip's `data-state="closed"`. There is no nested element to
stop at — the leak lands on the same node. Declaring `open`/`closed` in
`DzRelativeTime` would document another component's lifecycle as its own;
silencing the state check would remove the rule that found it. The spec asserts
the leak explicitly so a change to it is visible, and the case is filed as the
strongest single argument in the `data-scope` evaluation (§11). → **S1-D2**.

### S1-F4 🔴 — `validate:rtl` read the wrong file, and the utilities its regex names do not exist in Tailwind 4

Three separate defects in one gate, found by rolling the contract out.

**(a) The gate read `.variants.ts` only.** A physical layout utility written
inline in a template was invisible. Measured across the catalogue: **14
templates carry 19 such utilities** —
`DzCardHeader`, `DzDataView`, `DzTableCell`, `DzNotification`, `DzToast`,
`DzCombobox`, `DzDatePicker`, `DzDateRangePicker`, `DzFormLabel`,
`DzMultiSelect`, `DzPersonaSelector`, `DzTextarea`, `DzImageComparison`,
`DzSidebarItem`. Fixed: `rtlSourcesFor()` now returns both files, checked
separately so an `rtl-physical-ok` marker in one does not excuse the other. The
widened gate went red on its first run against a **pilot**:

```
✗ DzSelect declares mirrors: 'layout' but packages/core/src/components/forms/DzSelect.vue:311 uses `pl-6`.
```

**(b) The `PHYSICAL` regex names utilities Tailwind 4 does not have.** Its
`inset-[lr]-` clause matches `inset-l-` / `inset-r-`; Tailwind 4.2.2's inset
utilities are `top/right/bottom/left` (physical) and `inset-s-` / `inset-e-`
(logical). **That clause can never match**, and the utilities that *do* express
a physical inset — `left-…`, `right-…` — are not matched at all. Adding
`(?:^|[\s'"`])-?(?:left|right)-` was tried and reports **14 sites across 5
components**:

| Component | Site | Verdict |
|---|---|---|
| `DzDialog` | `DzDialog.variants.ts:47` — `close: 'absolute right-[var(--dz-spacing-4)]'` | **Real defect in a pilot.** The dialog close control is pinned to the physical right while the anatomy declares `mirrors: 'layout'`. |
| `DzDialog` | `DzDialog.variants.ts:22` — `content: 'fixed left-1/2 …'` paired with `-translate-x-1/2` | **False positive.** Symmetric centring. |
| `DzSpeedDial` | `DzSpeedDial.variants.ts:22` — `item: 'absolute left-1/2 top-1/2'` | **False positive.** Same centring idiom. |
| `DzFab` ×4, `DzSpeedDial` ×4 | `position` variants: `bottom-right`, `bottom-left`, `top-right`, `top-left` | **Deliberate.** The author names the side, which is the `rtl-physical-ok` case the marker exists for. |
| `DzSelect` ×2, `DzTextarea` ×1 | fixed in this packet | — |

The token scanner splits `left-1/2` into `left-1`, so the centring idiom and a
real `left-1` are indistinguishable without a real parse. **The widening was
therefore reverted** and the measured list recorded here: closing it needs the
true defects fixed and the centring idiom excluded in the same change — a
packet, not a line. The reasoning is written into `rtl.ts` above the regex.
→ **S1-D3**.

**(c) The obvious logical spelling generates nothing.** The first fix for
`DzTextarea`'s spinner was `end-[var(--dz-spacing-2)]`. Tailwind 4.2.2 has **no
`end-*` inset utility** — verified by reading the utility table out of
`node_modules/tailwindcss/dist/lib.js`, which pairs `inset-s`/`inset-e` with
`inset-inline-start`/`inset-inline-end`. That class would have generated no CSS
and silently unpinned the spinner: **exactly N1-O3 finding G2's shape**, a token
or utility name that looks right and the build drops. Corrected to `inset-e-`,
and the reason is written at the line so the next author does not repeat it.

### S1-F5 🟠 — `DzFileUpload` declared a part it never emitted

`DzFileUpload.anatomy.ts` declares `parts: ['root']` with no `optionalParts`;
`DzFileUpload.vue` emitted **no `data-part` at all**. `expectAnatomy` would have
caught it, and `DzFileUpload` has no spec that calls it. This is the component
that lowered the anatomy ratchet from 137 to 136 on 2026-08-24 — so the number
this whole task is measured against was moved by a declaration with nothing
behind it.

Fixed by emitting `data-part="root"`. The new `unemitted-declaration` rule holds
this class at a **ceiling of zero** from the start: there is no reading under
which a second one is acceptable.

### S1-F6 🟠 — the ADR's own validation hook was never built

ADR-19's *"Validation hooks"* table assigns to `validate:contract-parity`
(extended, by P3-02): *"declared parts/states exist in rendered DOM; no
undeclared `data-part`"*. `packages/tooling/src/validators/contract-parity.ts`
contains **zero occurrences of the string `anatomy`** — it checks that a
story-imported component has a contract spec and nothing else.

So the only thing comparing an emitted part to a declared one was
`expectAnatomy`, which runs on rendered DOM, in whatever branch a spec happens
to mount, for the 8 components that had an anatomy at all. `DzSelect`'s three
undeclared parts (F2) sat in a pilot for the life of the pilot as a direct
result. `validate:anatomy-parts` is the missing hook, built at source level
where it can see every branch of every template and components the manifest does
not know about.

### S1-F7 🟢 — the component-token prefix heuristic misfires on `DzText`

`referencedComponentTokens()` derives a component's token prefix from its name:
`DzText` → `--dz-text-`. That is the **global typography scale**
(`--dz-text-xs` … `--dz-text-xl`), shared by every component in the catalogue.
The moment `DzText` declared an anatomy, `validate:ownership` began reporting
five global tokens as its undeclared component-token override points.

`componentTokens: []` is the correct declaration, and the reason is written into
`DzText.anatomy.ts`: advertising `--dz-text-sm` as a `DzText` override point
would tell a consumer that re-mapping it restyles `DzText`, when it restyles the
whole library. The report is right about the reference and wrong about the
ownership. It is a *report*, not a failure, so nothing is blocked — but the same
collision will recur for any component whose name is also a token family.

### S1-F8 🟢 — `DzCodeBlock`'s `componentTokens` are empty because its whole token tier is dead

`DzCodeBlock.anatomy.ts` declares `componentTokens: []`, which looks like an
omission and is not. N2-T1 finding **K3** measured it: `CODEBLOCK_TOKENS` (15
names, publicly exported from `@dzup-ui/tokens`) is never imported by
`generate.ts`, `DzCodeBlock.tokens.ts` (14 names) is imported by nothing, and
the two tiers disagree on `--dz-codeblock-bg`. **No `--dz-codeblock-*` custom
property is emitted into any stylesheet**, and the component's own files
reference none. Declaring them would document override points that do not exist
in the CSS. The declaration carries the cross-reference to T1-D2 so that when
that tier is wired up, the names move here rather than being invented.

### S1-F9 🟠 — custody: one `git checkout --` was run on the dirty tree

**Disclosed in full, because the custody rule is absolute.** A scripted edit to
`packages/core/src/components/typography/DzBlockquote.vue` aborted on an
assertion *before* writing, and I ran `git checkout -- <that one file>` to be
sure of its state. That command is forbidden by the custody rules regardless of
outcome.

*What was verified afterwards, before continuing:* no handoff in
`docs/program-2026-09/` mentions `DzBlockquote`; and at that moment **every
other `.vue` in `packages/core/src/components/typography/` was unmodified
against HEAD**, so the family carried no uncommitted work for the checkout to
destroy. The evidence is consistent — N1's WCAG work touched no typography
component — but it is *inference*, not a diff I captured beforehand, and it is
recorded as such. No further git state-changing command was run.

---

## 5. Stop conditions — which fired, and what was done

The task names three. **All three fired.**

| Stop condition | Fired on | Response |
|---|---|---|
| *"an existing emitted part name violates ADR-19 naming (rename = breaking, owner lane)"* | `DzOptionsState`'s `options-state` / `options-message` / `options-retry`; `DzCodeBlock`'s `copy-button` / `line-number` / `filename` / `language` | **Nothing renamed.** Declared as shipped, reported as vocabulary extensions by `validate:anatomy-parts`, routed to **S1-D1**. |
| *"a component's structure cannot express per-part overrides without refactoring its template beyond styling scope"* | `DzSplitButton` — its `action` and `trigger` parts are rendered by **sibling components a consumer composes into the slot**, so routing classes to them means plumbing the `ui` map through `DZ_SPLIT_BUTTON_KEY` and having two more components read it | `DzSplitButtonUi` is narrowed to `Pick<…, 'root'>`, so `:ui="{ action: … }"` is a **type error** rather than a class that lands nowhere. Same mechanism `DzTable` already uses for `body`/`row`/`cell`. The parts remain fully selectable from a stylesheet. |
| *"dual-emit would regress the perf baselines"* | Not reached — no dual-emit was needed, because no legacy attribute was replaced. `DzSelect`'s existing `TODO(remove-after: 0.3.0)` dual-emit is untouched. | — |

A fourth, unstated one fired and is the substance of **S1-F3**: composition. It
was resolved inside the styling scope (a boundary rule in the test helper) but
its residual case is an owner input.

---

## 6. Ratchet trajectory

### The one this task owns

| Step | Ceiling | Δ | What moved it |
|---|---|---|---|
| At N2 start (**corrected**, B2) | **136** | — | Not 137 |
| after **inputs** family | 129 | **−7** | `DzInputGroup` `DzInputMask` `DzNumberInput` `DzOtpInput` `DzPasswordInput` `DzSearchInput` `DzTextarea` |
| after alignment (`DzCodeBlock`) | 128 | **−1** | The only public component emitting parts with no declaration |
| after **buttons** family | 121 | **−7** | `DzButtonGroup` `DzCopyButton` `DzFab` `DzIconButton` `DzSpeedDial` `DzSplitButton` `DzToggleButton` |
| after **typography** family | **113** | **−8** | all eight; the family had none |
| **Total** | **136 → 113** | **−23** | 3 complete families + 1 alignment |

Verbatim, on the final tree:

```
✓ ownership-manifest: 1327 entries fresh and internally consistent, runtime
  lookup in sync; 29/29 unclassified; 113/113 public components without anatomy
```

Count and ceiling are equal, which is what a ratchet at rest looks like: the next
declaration fails the gate until `maxWithoutAnatomy` is lowered in the same
change.

### Ratchets this task initialises

| Ratchet | Value | Notes |
|---|---|---|
| **`data-part` emissions with no governing declaration** | **3** | All three are `DzOptionsState`. Falls to 0 with the forms family. Ceiling in `anatomy-parts-ceilings.json`, downward only. |
| **declared parts that no source emits** | **0** | Ceiling **zero** from the start (S1-F5). |
| **bound-but-uncalled `tv()` slots** | **0** of 130 slot-recipe SFCs | `validate:tv-slots`; ceiling is implicit zero. |
| **part names outside the ADR-19 vocabulary** | **13** across 7 components | Reported, never failed — §11 and S1-D1. |
| `ui` prop adopted / 144 public | **4 → 26** | Booked from **4**, per B-D2-F8. Plus 1 compound part (`DzDialogContent`, unchanged) → 27 records in `component-meta.json`. |
| families completely declared / 12 | **0 → 3** (`inputs`, `buttons`, `typography`) | The number the docs site's claim rests on. |
| `validate:all` links | **33 → 35** | `validate:tv-slots`, `validate:anatomy-parts` |

---

## 7. Validation — focused first, then widened

### 7.1 Focused (narrowest owning command)

| Command | Result |
|---|---|
| `tsx packages/tooling/src/validators/tv-slot-calls.ts` | **exit 0** — `every tv() slot is called where it is bound (130 of 209 SFCs have a slot recipe in scope)` |
| `tsx packages/tooling/src/validators/anatomy-parts.ts` | **exit 0** — `118 data-part emissions across 37 components (36 distinct names, 32 anatomy declarations); 3/3 undeclared, 0/0 declared-but-unemitted` |
| `tsx packages/tooling/src/validators/ownership-manifest.ts` | **exit 0** — `1327 entries fresh …; 29/29 unclassified; 113 public components without anatomy` |
| `tsx packages/tooling/src/validators/rtl.ts` | **exit 0** — `every component declaring mirrors: 'layout' uses logical properties; the matrix matches the declarations` |
| `vitest run packages/tooling/src/validators/tv-slot-calls.spec.ts` | **exit 0** — 20/20 |
| `vitest run packages/testing/src/anatomy.spec.ts` | **exit 0** — 34/34 (27 pre-existing + 7 new boundary specs) |
| `vitest run packages/core/src/components/inputs/inputs.anatomy.spec.ts` | **exit 0** — 40/40 |
| `vitest run packages/core/src/components/buttons/buttons.anatomy.spec.ts` | **exit 0** — 35/35 |
| `vitest run packages/core/src/components/typography/typography.anatomy.spec.ts` | **exit 0** — 26/26 |
| `vue-tsc --noEmit -p packages/core/tsconfig.json` | **exit 0** |
| `playwright test --list e2e/components/anatomy-parts.spec.ts` | **exit 0** — 135 tests collected (45 × 3 engines) |

### 7.2 Seeded-failure probes (mandatory; every gate proven able to fail)

| # | Seed | Result | Restored |
|---|---|---|---|
| 1 | `:class="styles.closeButton()"` → `:class="styles.closeButton"` in `DzLightbox.vue` | `validate:tv-slots` **exit 1**, named the file, line **164**, and the expression | `sha256` identical |
| 2 | The same seed before the line-number fix | Reported line **106** — the bug in the validator itself | Fixed, pinned by a spec |
| 3 | Four live components with a slot named `value` | First draft reported all four; the check is now `(?!\s*[.(])` | Pinned by `does not read the ref unwrap as a slot named 'value'` |
| 4 | An HTML comment quoting the wrong form | First draft flagged it; `stripComments` now blanks `<!-- -->` too | Pinned by a spec |
| 5 | The catalogue as found (`DzCodeBlock`, `DzOptionsState`, `DzSelect`, `DzFileUpload`) | `validate:anatomy-parts` **exit 1**, 13 violations across both rules | Fixed; now 3/3 under ceiling, 0/0 |
| 6 | The catalogue as found, `validate:rtl` with the widened source set | **exit 1** on `DzSelect.vue:311` `pl-6` — a **pilot** | Fixed to `ps-6` |
| 7 | `expectAnatomy` without the composition boundary | `DzSpeedDial` **failed** with 4 problems, none of them its own | Boundary added; 7 specs pin both directions |

Probes 2, 3, 4 and 6 are the valuable ones: **each is a defect that only an
observed failure could reveal**, which is the lesson N2-A2's F-4 and N2-A1's F8
recorded and this packet reproduced four more times.

### 7.3 Aggregate — see §12

### 7.4 Not run, and why

| Lane | Status | Reason |
|---|---|---|
| `yarn test:e2e` (3 engines) | **authored, not executed** | Needs a Storybook server or a static build, and Playwright's default `outputDir` is `test-results/` — **B-N1-F4**: `test-results/matrix-report.json` is git-ignored and is the sole copy of the chromium browser run. All three matrix reports were backed up and verified `sha256sum -c` **OK** after the only Playwright invocation made (`--list`, which starts no server and writes nothing). The spec is at maturity level **implemented**, not `browser-qualified`, and is reported as such. |
| Visual regression (`maxDiffPixels: 0`, win32-locked) | **not run** | No geometry was changed — see §8. |
| `yarn storybook:build` | **not run** | No story was added or changed. |

---

## 8. Geometry: what moved, and what did not

**No pixel should move in LTR.** Three CSS class changes were made, all of them
physical→logical swaps that are *definitionally identical* in a left-to-right
document:

| Component | Before | After | LTR effect |
|---|---|---|---|
| `DzTextarea` spinner | `absolute right-[var(--dz-spacing-2)]` | `absolute inset-e-[var(--dz-spacing-2)]` | `inset-inline-end` resolves to `right` — identical |
| `DzSelect` item indicator | `absolute left-1` | `absolute inset-s-1` | `inset-inline-start` resolves to `left` — identical |
| `DzSelect` item label | `pl-6` | `ps-6` | `padding-inline-start` resolves to `padding-left` — identical |

Everything else added is a `data-*` attribute or an extra `cn()` argument that
is `undefined` unless a consumer passes `ui`. **No spacing, size, border or
position token was changed.**

The **win32 visual lane at `maxDiffPixels: 0` is the gate that would say
otherwise**, and it was not run (§7.4). If it reports a diff, the cause is one
of the three rows above and acceptance is an owner call — **do not bulk-update
baselines** (N1-O6 removed `test:e2e:update` and made bulk `--update-snapshots`
refuse, deliberately).

One caveat stated rather than glossed: `ps-6`/`inset-s-1`/`inset-e-` must be
**generated** by the consumer's Tailwind build. They are — `ps-`, `pe-`, `ms-`,
`me-` are already used in 20 places across the catalogue by P4-05's logical
migration, and `inset-s`/`inset-e` were verified present in the Tailwind 4.2.2
utility table by reading it out of the installed package (§S1-F4c). This is
exactly the check that was *not* done for the `end-` spelling, which is why that
one was caught.

---

## 9. Unresolved owner decisions

| # | Decision | Why it is not mine |
|---|---|---|
| **S1-D1** | **The part-name vocabulary.** 13 declared names sit outside ADR-19 §3's shared vocabulary: `DzCodeBlock` — `filename`, `language`, `copy-button`, `line-number`; `DzInput`/`DzSearchInput` — `clear`; `DzNumberInput` — `decrement`, `increment`; `DzPasswordInput` — `toggle`; `DzSelect` — `options-state`, `options-message`, `options-retry`; `DzTable` — `body`, `row`, `cell`. Some should join the vocabulary (`clear`, `item` vs `row`), some are genuinely component-specific (`decrement`/`increment` — a stepper's two buttons are not interchangeable), and the three `options-*` read like a namespace and were never reviewed. | ADR-19 §3 says the vocabulary grows **deliberately**. Renaming a shipped name is breaking. |
| **S1-D2** | **Does a part need a scope marker?** See the evaluation in §11. The `DzRelativeTime`/`DzTooltipTrigger` case is the concrete one: an `asChild`-merged attribute puts a composed component's `data-state` on this component's declared root, and no boundary rule can separate them because it is one element. | ADR-19 acceptance packet input (TASK-N5-05). |
| **S1-D3** | **Close the `validate:rtl` regex gap.** 14 measured sites, of which `DzDialog`'s pinned close control is a real defect in a pilot and 8 are deliberate author-named FAB positions needing `rtl-physical-ok`. The centring idiom `left-1/2` has to be excluded in the same change. | Touches two pilots with visual baselines; needs its own packet. |
| **S1-D4** | **`DzOptionsState`'s status.** It is a public DOM surface with no manifest entry, no metadata record, no docs page and no contract. Either it becomes a compound part with a `parentComponent` (which of seven?), or it is inlined, or the ownership schema gains a kind for a shared internal. | Same class as A1-D1: the manifest schema has no kind that fits. |
| **S1-D5** | **`DzFileUpload` has no anatomy conformance spec.** Its declaration was false for eight days and only a new source-level gate found it. Every declaring component should call `expectAnatomy`; the three families this packet completed do, the five pilots do, `DzFileUpload` and the two providers do not. | Cheap, but it is a decision about what "declared" is required to mean. |
| **S1-D6** | **`data-scope` itself** — adopt, defer, or refuse. §11. | By design: the task files the evaluation, it does not decide. |
| **S1-D7** | **Re-verify `yarn validate:all` from a clean shell and reconcile the ledger.** §15: `quality-matrix.json` carried a staleness that predates this packet by ~11 hours, and three N2 tasks reported the aggregate gate exit 0 over it. Either those runs did not include `validate:quality-tiers`, or the reports are wrong. | It is a claim about other packets' evidence, not about this one's code. |

---

## 10. Ranked remaining-family order

Nine families remain (plus the two-component `providers`, already fully
declared). Ranked by *value ÷ cost*, with the blockers named.

| Rank | Family | Public | Declared | Cost signal | Why here |
|---|---|---|---|---|---|
| **1** | **cards** | 3 (+3 compound parts) | 0 | Smallest untouched family. `DzCardHeader`/`Body`/`Footer` are already-named compound parts — the `DzTable` pattern applies unchanged. | Cheapest complete family left; **one template physical utility** (`DzCardHeader` `ml-`) to resolve first. |
| **2** | **feedback** | 18 | 0 | 15 of 18 are Tier A. `DzSpinner` is composed by four components already declared, so it should be declared **next** regardless of family order. | High component count, low per-component cost. Two templates carry physical utilities (`DzNotification`, `DzToast`). |
| **3** | **overlays** | 10 (+23 compound parts) | 2 | The compound-part count is the highest in the catalogue; `DzDialog`/`DzDialogContent` already model it. | The task's stated third priority, and the family where `ui` is most valuable (backdrops, panels, portaled content). **Blocked on S1-D3** — `DzDialog`'s close control is a measured RTL defect. |
| **4** | **layout** | 18 | 0 | Tier A ×12. `core.css` already selects on `.dz-panel[data-size]` / `.dz-toolbar[data-variant]`, so the recipe attributes are *already public* and undeclared — ADR-19's opening argument, unaddressed. | Largest gap between "already public" and "declared". |
| **5** | **data** | 19 | 2 | `DzTable` and `DzCodeBlock` done. `DzDataGrid`, `DzTree`, `DzCalendar` are Tier C with deep slot recipes. | Partially started; the remaining 17 are the expensive ones. |
| **6** | **navigation** | 12 (+11 parts) | 0 | Tier B ×10. Two templates carry physical utilities. | Uniform cost, no blocker. |
| **7** | **media** | 10 (+4 parts) | 0 | `DzLightbox` is here — the G1 component — and `DzImageComparison` carries `left-`/`right-` by design. | Needs `rtl-physical-ok` decisions per component. |
| **8** | **forms** | 28 (+3 parts) | 2 | **The biggest and the most blocked.** | **Blocked on S1-D4**: `DzOptionsState` reaches 7 of these 28, and the undeclared-emission ratchet cannot reach 0 until every one of those 7 declares its three parts. Also the family the Pro form renderer consumes — so it is the highest-value and the one that most needs a decision first. |

**Recommended next packet:** `cards` + `feedback` together (21 public
components, ratchet 113 → 92), with `DzSpinner` first because four
already-declared components render it. Then take S1-D4 to the owner and do
`forms` as its own packet.

---

## 11. The `data-scope` evaluation — an ADR-19 acceptance input (TASK-N5-05)

*Filed as an input. Not decided here.*

### 11.1 The question

Ark UI (and Zag under it) emits a **`data-scope`** attribute beside every
`data-part`:

```html
<div data-scope="select" data-part="trigger" data-state="open">
```

so a selector reads `[data-scope=select][data-part=trigger]`. dzup-ui emits
`data-part` alone. Should it mark identity too?

### 11.2 What `data-scope` adds over `data-part` alone

**It makes a part selector unambiguous without a structural anchor.** ADR-19 §3
says a part name is scoped to its component, and this repository has already
paid for that being *true only by convention*. Two measured instances, both from
this program:

1. `styling-overrides.spec.ts` carries a comment recording that an earlier draft
   wrote `[data-part="content"]` intending a select's listbox and matched a
   `<table>` two components down. The fix was
   `[data-part="content"]:has([data-part="item"])` — a *structural* anchor
   standing in for the identity the attribute does not carry.
2. This packet's own `expectAnatomy` failure (S1-F3): `DzSpeedDial` reported
   `part "root" appears 5 times` because three nested components' roots are
   indistinguishable from its own **by attribute**. The fix was a boundary rule
   inferred from `data-part="root"` — again, structure standing in for identity.

Both fixes work. Both are inferences a consumer has to make correctly, in CSS,
where there is no `:has()` fallback in older engines and no test to catch the
mistake.

**It survives the case a boundary rule cannot.** `DzRelativeTime`'s `<time>`
carries the tooltip's `data-state="closed"` because `DzTooltipTrigger` merges
attributes onto its child. One element, two components' state. With a scope
marker the two are separable — `[data-scope=relative-time][data-part=root]` is
this component's node regardless of what else was merged onto it — and a
conformance check could read only the states whose scope matches. **This is the
one case in the packet where `data-part` alone is not sufficient, rather than
merely inconvenient.**

**It gives the docs site a per-component selector to publish.** Every component
page currently prints part names; it cannot print a copy-pasteable selector that
is correct in isolation.

### 11.3 What it costs

| Cost | Size |
|---|---|
| **DOM weight** | One attribute per named node. Measured on this tree: **118 static `data-part` sites** across 37 components today, growing to ~500+ at full rollout. At ~20 bytes per attribute that is ~10 KB of markup on a page that renders the whole catalogue — irrelevant for a page, non-trivial for a large SSR payload with thousands of rows. **`DzTable` is the case to measure**: `row` and `cell` repeat per record, so `data-scope` would be emitted once per cell. |
| **Migration** | **Additive** — a new attribute, no rename, no removal. Every existing `[data-part=…]` selector keeps working. This is the cheapest kind of change ADR-19 §6 recognises, and it ships as a minor. |
| **Authoring** | Mechanical, and it should be **generated rather than typed**: a scope value hand-written per node is the hand-typed-facts class this program has now recorded five times (P2-02 READMEs, T1-K4, A1-F3, A2-F-3, and A2's version literals). The right shape is one value per component, applied once — plausibly by a `useAnatomy(anatomy)` composable returning the attribute bag, which would also be the natural place to emit the recipe attributes ADR-19 §4 says a component should mirror and *most do not*. |
| **Contract surface** | A new public attribute is a new promise. Its value has to be stable, which means naming it is a decision (`select` vs `dz-select` vs `DzSelect`) and changing it is breaking. |
| **What it does not fix** | It does not make `expectAnatomy` composition-safe on its own — the helper would still need to know which scope it is checking. It does not resolve S1-D1 (the vocabulary), and it does not help a consumer who wants to style *all* triggers across the library. |

### 11.4 Competitor practice, as of the 2026 catalogue

| Library | Marks identity? | How |
|---|---|---|
| **Ark UI / Zag** | **Yes.** `data-scope="<machine>"` + `data-part="<node>"` on every anatomy node, generated by the state machine's anatomy helper — the author never types either. | Identity is a first-class part of the anatomy primitive. |
| **Base UI** | **No.** Parts are components (`<Select.Trigger>`); state is `data-*` (`data-popup-open`), styling is by rendered element. Identity is carried by the *component boundary*, not by an attribute. | The alternative answer: if every part is its own component, you never need to say which component a node belongs to. |
| **Radix / Reka** | **No.** `data-state`, `data-side`, `data-orientation`, `data-radix-*` internals. Same model as Base UI. | The primitives dzup-ui builds on — which is why Reka's markers show up in `expectAnatomy`'s exclusion list. |
| **Nuxt UI** | **No.** The `ui` prop keyed by slot name; no part attributes at all. | The source of dzup-ui's `ui` prop naming, and the reason `ui` was chosen over `parts`/`classes` (ADR-19 §5). |

**The pattern:** libraries that expose parts as *attributes on one component's
DOM* (Ark) mark scope; libraries that expose parts as *separate components*
(Base UI, Radix) do not need to. dzup-ui is in the first group and does not mark
scope — **the only one of the four in that position.**

### 11.5 What this packet recommends the acceptance packet weigh

Not a decision, but the shape of one:

- The **strongest argument for** is S1-F3's residual case, because it is the one
  place where structure demonstrably cannot substitute for identity.
- The **strongest argument against** is that it is a second public attribute
  whose only job is to disambiguate the first, on a library that has 113
  components still to declare a first one. Adding it now doubles the per-node
  contract before the per-node contract is finished.
- The **middle option nobody has costed**: emit `data-scope` **only where a
  component composes another declaring component** — the ~5 % of nodes where
  ambiguity is real. That keeps the DOM small and the promise narrow, at the
  cost of a rule a consumer has to learn ("scope is present when you need it").
  It is probably worse than either extreme, and it is recorded so the packet can
  reject it explicitly rather than not consider it.
- Whatever is decided, **the value must be generated, not typed** — see the
  authoring row above, and the five prior sightings of the hand-typed-facts
  class.

---

## 12. Aggregate qualification

### `yarn test`

```
Test Files  2 failed | 494 passed (496)
     Tests  2 failed | 9035 passed (9037)
  Duration  356.50s
```

**9,035 passing / 2 failing.** Baseline at task start was **8,907 / 2** (B5), so
**+128 tests**, all green. The two failures are **exactly B5's pre-existing
pair** and nothing else:

- `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts › every fallback matches the value its token resolves to`
- `packages/tooling/src/validators/story-dod-tiers.spec.ts › countOpen › subtracts a waiver`

Reported as pre-existing. Neither was touched, and no ceiling was moved to make
either pass.

The +128 breaks down as 40 (`inputs.anatomy.spec.ts`) + 35
(`buttons.anatomy.spec.ts`) + 26 (`typography.anatomy.spec.ts`) + 20
(`tv-slot-calls.spec.ts`) + 7 (`anatomy.spec.ts`, the composition boundary) =
**128**.

### `yarn lint`

**exit 0**, over `packages/ apps/` with `--max-warnings 0`, including all 31 new
files. Three autofixes were refused by hand rather than accepted:

| Rule | What the autofix would have done | Instead |
|---|---|---|
| `regexp/use-ignore-case` | Applied the `i` flag to the **whole** pattern, not to the character class the rule was looking at — making every slot-name match case-insensitive, so `styles.Root` would match `styles.root`. **N2-A1 finding F8's exact trap**, where the same rule would have changed a published JSON Schema `pattern` so clients rejected `DzButton`. | `eslint-disable-next-line` with the reason written at the line. |
| `jsdoc/no-multi-asterisks` ×2 | Eaten an asterisk out of `**G2**` and `*every one*`, leaving broken emphasis. **N2-D2 finding F-6.** | Sentences reworded. |
| `test/prefer-lowercase-title` | Turned `'STILL reports an undeclared part…'` into `'sTILL…'` — it lower-cases the first character only. **N2-D2 finding F-6 again.** | Test renamed deliberately. |

The nine files that *were* run through `--fix` (import ordering only) were
diffed line-by-line excluding `^import `, and **nothing but import order moved**
— the check N2-D2 recommended become routine.

### `yarn typecheck`

`vue-tsc --noEmit -p packages/core/tsconfig.json` — **exit 0**.

### `packages/tooling` `tsc` (not in `typecheck:all` — B-A1-F7)

**8 errors → 7 after fixing the one this packet introduced.** `tv-slot-calls.ts`
had a TS2345 (`body[index]` is `string | undefined` under
`noUncheckedIndexedAccess`) that `yarn typecheck`, `yarn lint` and
`yarn validate:all` were **all green over**, because `packages/tooling` is not in
`typecheck:all`. Found only by running `tsc -p packages/tooling/tsconfig.json` by
hand.

This is the **sixth sighting** of A1-F7 / A2-F-10, and the **second time it has
been in a newly added validator** — the code that enforces every gate is still
the code no gate type-checks. The remaining 7 are pre-existing and in
`perf-bench.spec.ts`, `accept-visual-baseline.ts`, `story-dod-triage.ts`,
`at-matrix.spec.ts` and `story-dod-tiers.spec.ts`; **none in this packet's
files.**

### `yarn validate:all`

**exit 0, 33 → 35 links** — `validate:tv-slots` and `validate:anatomy-parts`,
both green in the run:

```
✓ tv-slot-calls: every tv() slot is called where it is bound (130 of 209 SFCs have a slot recipe in scope)
✓ anatomy-parts: 118 data-part emissions across 37 components (36 distinct names,
  32 anatomy declarations); 3/3 undeclared, 0/0 declared-but-unemitted
```

It took **three runs** to get there, and both intermediate failures were the gate
working. Run 1: `validate:form-readiness` stale. Run 2:
`validate:quality-tiers` stale — **S1-F10**, the finding in §15. Run 3: exit 0.

The first was fixed by regenerating, not by editing: `validate:form-readiness`
reported
`docs/program-2026-08/form-controls-readiness-matrix.md is stale`. That is
**correct behaviour and a downstream win**, because the reason it went stale is
that seven `inputs` components now declare an `rtl` contract:

| Form-readiness clause | Before | After |
|---|---|---|
| **C6 — RTL** | 3 pass / 41 unrun | **10 pass / 34 unrun** |
| totals | 238 pass / 54 unrun | **245 pass / 47 unrun** |

**+7 on the C6 clause, from anatomy declarations alone.** The matrix is the
document that says what *Pro may rely on today*, so the anatomy rollout moves a
Pro-facing readiness number as a side effect — which is the argument for doing
`forms` next, and the reason `forms` is blocked on **S1-D4**.

### Generated artifacts regenerated after the API change

Because 22 components gained a public prop, the whole generated chain had to be
re-run (B9 / B11 / B13). All exit 0:

| Artifact | Result |
|---|---|
| `component-ownership.manifest.json` + `anatomy.generated.ts` | `1327 entries fresh …; 113 public components without anatomy` |
| `packages/core/docs/component-meta.json` | `208 components (144 public, 64 compound parts), 0 unclassifiable · props 1671/1734 described` (was 1649/1712 — **+22 props, all described**) |
| `packages/core/docs/llms{,-full}.txt` | 684 / 8,690 lines |
| `apps/docs/components/*.md` + `apps/docs/evidence/*.md` | 152 files, 1,923,655 B |
| `packages/core/docs/rtl-matrix.md` | rendered from the declarations |
| `docs/program-2026-08/form-controls-readiness-matrix.md` | 44 controls, counts above |

`generate:exports` was **not** run (B3); `public-api.manifest.json` is
byte-unchanged.

---

## 13. Maturity, stated per level

Per the program's ladder, and never collapsed into "done":

| Level | What is at it |
|---|---|
| **specified** | The `data-scope` evaluation (§11). The 3 `DzOptionsState` emissions, ratcheted with a named path to zero. |
| **implemented** | 23 anatomy declarations · 22 `ui` props · 2 validators · 1 gate widening · 1 test-helper correction · the Playwright spec (135 tests × 3 engines, **collected, not executed**). |
| **focused-validated** | Every row in §7.1, and all seven seeded-failure probes in §7.2. |
| **aggregate-qualified** | `yarn test` 9,035/2 · `yarn lint` 0 · `yarn typecheck` 0 · `yarn validate:all` 35 links, exit 0. §12. |
| **browser/AT-qualified** | **Not reached.** `e2e/components/anatomy-parts.spec.ts` is authored and unrun (§7.4). The win32 visual lane is unrun; no geometry moved in LTR (§8). |
| **packaged / released** | Not reached, not attempted, not authorised. |

Everything above is **locally qualified on a dirty worktree** and is therefore
not CI evidence, not release evidence and not production evidence — the same
standing as every other packet in the N1 and N2 lanes.

---

## 14. The seam for the next packet

Four things the next family slice should take literally rather than re-derive.

1. **Copy the file, not the idea.** `packages/core/src/components/inputs/DzInputMask.anatomy.ts`
   is the reference declaration for a field component and
   `packages/core/src/components/typography/DzCaption.anatomy.ts` for a
   single-node one. Both carry the four things a declaration has to say and a
   reason for each: why `componentTokens` is empty *when it is measured to be*,
   why the `rtl` answer is the one it is, and which parts are optional and why.
   A declaration with no reasons is the comment ADR-19 exists to replace.

2. **The family spec is the completeness claim.** `{family}.anatomy.spec.ts`
   holds one `CASES` table and a `PUBLIC_COMPONENTS` list that is **hard-coded on
   purpose** — a list derived from the directory would simply grow to include a
   new undeclared component and the "family is complete" claim would go quietly
   false. Add the family's file, not eight blocks in eight contract specs.

3. **Run `validate:anatomy-parts` before writing a line of template.** It prints
   the exact set of names a family already emits, which is what the declaration
   has to match. Every disagreement it reports is either a part to declare or a
   rename to route to the owner — never a name to change quietly.

4. **The four regenerations, in this order**, after any change to a public prop:
   `generate:ownership:core` → `generate:component-meta` → `generate:llms` →
   `generate:docs-pages`, then `generate:rtl-matrix` and
   `generate:form-readiness` if any `rtl` declaration changed. `validate:all`
   fails on each of them independently, which is how this packet discovered that
   the form-readiness matrix moves when an anatomy declares `rtl` (§12).

And one thing to *not* do: **do not widen `validate:rtl`'s `PHYSICAL` regex as a
drive-by.** The measured list is in §S1-F4 and it contains two pilots; it needs
its own packet (**S1-D3**).

---

## 15. S1-F10 🔴 — `quality-matrix.json` was already stale, and three N2 tasks reported `validate:all` exit 0 over it

Found while regenerating the artifact chain after the API change.
`yarn validate:all` failed on:

```
✗ [freshness] packages/core/docs/quality-matrix.json is stale.
  Run `yarn generate:quality-matrix` and commit the result.
```

Regenerating produced a diff of exactly three things:

| Change | Count | Whose |
|---|---|---|
| `hasAnatomy` `false` → `true` | 23 | **This packet's** |
| `sourceCommit` `8d80bc39…` → `51dec93…` | 1 | A re-bind **TASK-N0-05 did not perform on this artifact** |
| `exceptions` object removed from `DzFileUpload` (its `csp-fixture` and `url-policy` reasons) | 1 | **TASK-N1-O5's**, from 2026-09-01 13:02 |

The third one is the finding. `packages/tooling/src/quality/component-tiers.ts`
is modified in this same dirty worktree — N1-O5 deleted both exceptions and
replaced them with a comment explaining that *"a tier rule whose only member is
excepted from it is a rule that does not exist."* **The generated artifact was
never regenerated to match.**

`validate:quality-tiers`' freshness clause compares the full serialised matrix
with **only `sourceCommit` excluded** (`quality-tiers.ts:309-311`). So that
missing `exceptions` block is a difference that **predates this packet
entirely** — and therefore `yarn validate:all` should have been red for every
task run after 2026-09-01 13:02. The N2 ledger records `validate:all` **exit 0
with 33 links** for **N2-A3, N2-D1 and N2-D2**, all of which ran after that
timestamp, and B7 states it as a binding constraint.

*What this packet can and cannot say.* It **can** say, from the diff, that the
`exceptions` delta is not its own and that the comparator does not exclude it.
It **cannot** say which of the three explanations is true — the runs did not
include this validator, the reports are wrong, or the file was regenerated and
then reverted — because none of that is reconstructable from the tree.
Regenerating it here fixes the artifact and, as a side effect, re-binds a
`sourceCommit` that N0-05's re-bind pass missed.

*Why it matters beyond the one file.* This is the **admission-gate class**: the
aggregate gate is the single number every packet in this program reports, and a
number that six packets reported identically while one of its 33 links was red
is worth more scrutiny than any component defect in this handoff. → **S1-D7**,
and it should be the first thing the next orchestrator re-verifies from a clean
shell.

**Consequential regenerations, all forced by the above and all exit 0:**
`quality-matrix.json` → `capability-matrix.json` → `component-meta.json` →
`llms{,-full}.txt` → `apps/docs/**`. The capability matrix is what the docs
site's styling-posture page reads, so until it was regenerated the site was
publishing **"8 of 144 components have declared an anatomy"** beside a `ui` row
that already said **26** — two numbers from two artifacts, one stale. It now
reads **31 of 144** and **26 of 144**, which is the measured truth.
