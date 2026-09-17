# TASK-R5-O8 — Metadata description debt

> **Baseline:** HEAD `99b963a` on `main`, unmoved for the whole task, plus the
> uncommitted working tree of twelve prior packets. Every number below is bound
> to that commit **and** that tree; the committed `component-meta.json` at
> `99b963a` is itself stale relative to the tree (it records 1,725 props where a
> fresh extraction finds 1,798), so the ratchet *ceilings* — not the committed
> artifact's totals — are the baseline the debt is measured against. They agreed:
> a fresh extraction of the dirty tree measured exactly the recorded 63 / 21 /
> 106 / 26.
>
> **Authority:** no commit, push, publish, CI dispatch or baseline replacement.

---

## 0. Check-first protocol (README §4)

The `<done_check>` was run first. **All three checks failed, and two of the three
were written against a schema that does not exist** — flagged here because a
fresh agent would otherwise read them as passing:

| `<done_check>` command | Result |
| --- | --- |
| `require('./packages/core/docs/component-meta.ratchets.json')` | **No such file.** The ratchets live in `packages/tooling/src/validators/component-meta-ceilings.json`, read by `validate:component-meta`. |
| `m.records.filter(r => !r.description)` | **`m.records` is `undefined`** — the artifact's array is `m.components`. As written the expression throws; with the key corrected it returned `["DzAsyncBoundary", "DzErrorBoundary", "DzFieldArray"]`. |
| `m.records.find(r => r.name === 'DzAccordion').props.length` | Same key error; corrected, it returned **0**. |

So: none passed, the full task was run. The corrected commands are recorded in
§8 so the next agent's done-check works.

---

## 1. Implemented files and API effect

**75 source files** (69 `.vue`, 6 `.types.ts`) plus 9 pipeline files. Every
description is authored in source; nothing was typed into a generated file.

### 1.1 Pipeline — `packages/tooling`

| File | Change | API effect |
| --- | --- | --- |
| `src/meta/extract-component-meta.ts` | `emitsDocIndex(program)` — a name-keyed `Dz…Emits` index built once per `ts.Program` (declarations **and** `export … as …` aliases), replacing the path guess as a *fallback*; `synthesiseModelEventDescription()` (decision **A2-D2**); `documentationBlocks()` — header search over every comment block in file order, not the first of each dialect. | Additive. `{Name}.types.ts` still wins; the index only fills what it left empty. |
| `src/meta/component-meta.ts` | `DescriptionSource` gains `'model-synthesised'`; `CatalogExtractionQuality` gains `eventsModelSynthesised`. | Artifact schema is additive — no consumer field removed or retyped. |
| `src/meta/generate-component-meta.ts` | Accumulates and prints `eventsModelSynthesised`. | — |
| `src/validators/component-meta.ts` | Summary line reports synthesised prose separately; the `exposed` source label corrected from `none exist in source` (no longer true). | — |
| `src/validators/component-meta-ceilings.json` | Four ratchets lowered to 0, each with a re-measured reason. | Gate tightened. |
| `src/validators/llms-ceilings.json` | Two ratchets lowered to 0. | Gate tightened. |
| `src/{validators/component-meta,docs/docs-pages,playground/playground}.spec.ts` | Fixture totals gain the new field. | Test-only. |

`descriptionSource: "model-synthesised"` is the marker `<a2_d2>` asks for:
`totals.eventsModelSynthesised` counts it separately, and
`eventsWithDescription − eventsModelSynthesised` is the authored count.

### 1.2 Source — descriptions authored

| Population | Count | Where the JSDoc went |
| --- | --- | --- |
| `defineModel`-synthesised props (`modelValue`, `open`, `blocked`, `first`/`layout`/`sortField`/`sortOrder`, `focusedDate`/`value`, `position`, `current`) | 57 | Above the `defineModel(...)` call. **Measured before writing any of it**: `vue-component-meta` reads that block (probe on `DzInput` — `modelValue` came back with the probe text). |
| Authored props | 6 | `DzAsyncBoundary` (`delay`/`onError`/`timeout`), `DzErrorBoundary` (`onError`), `DzFieldArray` (`min`/`max`) — in their `.types.ts`. |
| `defineExpose` members | 26 (+1 new) | On the object-literal **property** inside `defineExpose({ … })`. Also measured first: prose on the *call* or on the function declaration is invisible to the extractor; prose on the property is read. |
| Slots | 21 | **9 needed no prose at all** — `DzCard` and its three sub-parts declared no `defineSlots<…>()`, so their slots were inferred from the template and the documented `DzCard*Slots` interfaces were dead code nothing read; declaring them (type-only, no runtime effect) made the existing prose reachable. **12 were authored:** `DzAsyncBoundary` 3, `DzErrorBoundary` 2, `DzFieldArray` 2 in their types files; `DzDataGridBody`, the three `DzForm*` parts and `DzThemeProvider` in inline `defineSlots<{…}>()` blocks, none of which declared slots before. |
| Events | 35 authored | 25 of the 35 needed **no authoring at all** — the prose already existed and was unreachable: 24 in the parent's types file (`DzContextMenu.types.ts`, not the non-existent `DzContextMenuContent.types.ts`) and one behind an export alias (`DzResizableEmits as DzSplitterEmits`). The other **10 were authored here**: `DzTagsInput` × 5, `DzFieldArray` × 3, `DzAsyncBoundary.timeout`, and `DzDataGridBody.rowClick`, which also needed a named local interface because Vue's `ShortEmits` erases JSDoc from an inline `defineEmits<{…}>()`. Note that `descriptionSource` cannot tell the two groups apart afterwards — both read back as `emits-interface`, which is correct: the point of the fix is that authored prose is authored prose wherever the interface lives. |
| Events `update:*` | 71 | Synthesised — decision **A2-D2** below. |
| Component descriptions | 3 | `DzAsyncBoundary`, `DzErrorBoundary`, `DzFieldArray` SFC headers. |

### 1.3 Source — `DzAccordion` union-props extraction (A3-D3)

`DzAccordion.types.ts` gains `DzAccordionRootProps` (a flat interface) +
`_DzAccordionRootCoversUnion`, a compile-time assertion that
`DzAccordionProps extends DzAccordionRootProps`. `DzAccordion.vue` passes the
flat interface to `defineProps`; the `(props as DzAccordionSingleProps)` cast is
gone. `DzAccordionSlots.default` and the four `DzCard*Slots` members became
optional (`?`) — they were declared required and are optional in fact, which
`defineSlots` then enforced against the existing specs.

**Public API unchanged and strictly improved**, measured three ways at `99b963a`:

1. `vue/compiler-sfc`'s `compileScript` already flattens the union to exactly
   these eleven members + `modelValue` — the runtime declaration is identical.
2. `DzAccordionProps`, `DzAccordionSingleProps` and `DzAccordionMultipleProps`
   are untouched and still exported from `components/data/index.ts`.
3. The union was not buying discrimination — it was **destroying type checking**.
   A probe component under `packages/core/src/` compiled clean with
   `<DzAccordion :size="123" type="multiple" collapsible />`, while
   `<DzTabs :size="123" />` was rejected `TS2322` by the same `vue-tsc` run. The
   probe was proven live first by seeding a deliberate `TS2322` in its script
   block. The probe directory was deleted.

`DzAccordion` now extracts **12 props, 3 events, 1 slot, 1 exposed member**
(was 0 / 0 / 0 / 0).

---

## 2. How the descriptions were checked against the code, not against plausibility

- Every `defineModel` description was written from the **declared type and
  default read out of the artifact**, cross-checked against the `defineModel`
  line and the component's own header (`DzTimePicker` → canonical 24h
  `HH:mm`/`HH:mm:ss`; `DzDatePicker` → ISO `YYYY-MM-DD`; `DzPagination` →
  one-based, default 1; `DzStepper`/`DzCarousel` → zero-based index).
- The seven dual-model controls (`DzCascader`, `DzInplace`, `DzKnob`,
  `DzMention`, `DzRating`, `DzTagsInput`, `DzTreeSelect`) are described from
  `useDualModel`'s actual contract — reads prefer the default model and fall
  back to the named one, writes go to both — not from a guess about precedence.
- `DzContextMenu` / `DzTooltip` / `DzDropdownMenu` `open` is described as
  uncontrolled-by-default because their `defineModel<boolean | undefined>('open')`
  has **no default** and is forwarded straight to Reka's `v-model:open`.
- Every exposed member was read at its implementation before being described
  (`useCountdown.start/pause/reset`'s no-op guards, `DzDeferredContent.loaded`
  starting `true` when `IntersectionObserver` is absent, `DzFloatLabel.controlId`
  preferring the slotted control's own id, `DzInputMask.unmasked` being the
  stripped value, `DzStepper.revealItem` emitting `change` where
  `DzTabs.revealItem` does not).
- `DzTagsInput.blur` is described as firing "after any `addOnBlur` commit"
  because the blur handler commits first (`DzTagsInput.vue:280`).
- **Sample for review (≥10 % per family)** is §7.
- **One description could not be written truthfully and is recorded as a
  defect, not dressed up** — `DzAsyncBoundary.delay` (decision **D52**).

---

## 3. Focused validation — exact commands and exit codes

```
yarn generate:ownership                                        exit 0
yarn generate:quality-matrix                                   exit 0   (144: A55 B67 C21 D1, unchanged)
yarn generate:capability-matrix                                exit 0
yarn generate:component-meta                                   exit 0
yarn generate:llms                                             exit 0
yarn generate:docs-pages                                       exit 0
yarn validate:component-meta                                   exit 0
yarn validate:llms                                             exit 0
yarn validate:docs-pages                                       exit 0
yarn validate:playground-parity                                exit 0
yarn validate:mcp                                              exit 0
yarn validate:ownership                                        exit 0
yarn validate:exports                                          exit 0
yarn typecheck   (vue-tsc -p packages/core/tsconfig.json)      exit 0
yarn lint                                                      exit 0
npx vitest run packages/tooling/src/{meta,docs,playground} \
  packages/tooling/src/validators/{component-meta,llms}.spec.ts  exit 0  (7 files, 203 tests)
npx vitest run <the 6 touched component families>              exit 0  (18 files, 213 tests)
./node_modules/.bin/tsc --noEmit -p packages/tooling/tsconfig.json  exit 2, 13 errors (pre-existing, see §5)
```

`validate:component-meta` final report:

```
  field      total  described  source
  props       1810       1810  vue-component-meta
  events       362        362  0 extractor + 292 emits-interface + 70 model-synthesised (A2-D2, generated not authored)
  slots        327        327  vue-component-meta
  exposed       27         27  vue-component-meta
  examples: 143/208 have a real story source; 128 also yield a paste-ready template
  ratchets: unclassifiable 0 · unresolvedTypes 0 · publicComponentsWithoutRecord 0 ·
            propsWithoutDescription 0 · slotsWithoutDescription 0 · eventsWithoutDescription 0 ·
            exposedWithoutDescription 0 · publicComponentsWithoutExample 1 · componentsWithoutStaticTemplate 80
```

### 3.1 Determinism and seeded-failure proof (lessons 1 and 2)

- `generate:component-meta` was run **four** times across the task; the artifact
  hashed `735c82d4ff01ad9783bbf801cbf1c3a89e0ccf470f11b283b4226c548f107e95`
  on every run after the last source edit, including after the `DzDataGridBody`
  lint reorder (a source move that must not change extraction — it didn't).
- **Seeded failure, end-to-end:** the `modelValue` JSDoc was deleted from
  `DzInput.vue`, the artifact regenerated and the validator re-run:
  `exit 1 — ✗ [ratchet] propsWithoutDescription is 1, above the ceiling of 0`.
  Restored, regenerated, `exit 0`, and the artifact hashed identically again.
  The zeroes are a live gate, not a claim.
- **The header fix came out of a seeded failure I caused.** After the first full
  regeneration, `DzBlockUI`, `DzPopconfirm` and `DzTour` silently *lost* their
  component descriptions: `componentDescription()` read only the first comment
  block of each dialect, and a one-line JSDoc written above the SFC header (to
  document `defineModel`) sorted first and won. Moving my comments would have
  hidden a real fragility, so `documentationBlocks()` now scans every block in
  file order. A description-by-description diff of all 208 records against the
  `99b963a` artifact confirms **exactly 3 changed** — the three intended ones —
  and no `intent` value moved.

---

## 4. Ratchet movements (old → new)

| Ratchet | File | Old | New |
| --- | --- | --- | --- |
| `propsWithoutDescription` | `component-meta-ceilings.json` | 63 | **0** |
| `slotsWithoutDescription` | `component-meta-ceilings.json` | 21 | **0** |
| `eventsWithoutDescription` | `component-meta-ceilings.json` | 106 | **0** |
| `exposedWithoutDescription` | `component-meta-ceilings.json` | 26 | **0** |
| `componentsWithoutDescription` | `llms-ceilings.json` | 3 | **0** |
| `publicComponentsWithNoMembers` | `llms-ceilings.json` | 1 | **0** |
| `componentsWithoutStaticTemplate` | `component-meta-ceilings.json` | 80 | 80 — unchanged, see D53 |
| `publicComponentsWithoutExample` | `component-meta-ceilings.json` | 1 | 1 — `DzThemeProvider` has no stories file |
| `unclassifiable` / `unresolvedTypes` / `publicComponentsWithoutRecord` | `component-meta-ceilings.json` | 0 | 0 |
| `publicComponentsUnreachableFromLlms` / `publicComponentsWithoutExampleInLlms` | `llms-ceilings.json` | 0 | 0 |
| docs-page sections (R5-O5) | `validate:docs-pages` | intent 144 · variants 49 · parts 41 · provider 39 · keyboard 41 · locale 41 · states 41 · api 0 · usage 0 · operational 0 | **unchanged** — no section ratchet moved in either direction |

No ceiling was raised. The four description ratchets and both `llms` ratchets
are now floors at 0: any new undescribed member turns the gate red.

Denominators moved because extraction improved, and that is reported rather than
absorbed: props 1,798 → 1,810, events 359 → 362, slots 326 → 327, exposed 26 → 27
(all +DzAccordion, which previously extracted nothing).

---

---

## 5. Aggregate qualification

`yarn validate:all` (40 links) run **end-to-end, exit code read directly**:

```
yarn validate:all                                              exit 1
  → link 17/40, validate:capability-matrix:
      ✗ [tier-d] DzFileUpload is Tier D and its `browser-matrix` cell is unrun
        with no artifact … 12 stale cell(s)
```

**Pre-existing, not mine, and byte-identical to the brief's description.** The
input it needs (`test-results/matrix-report.json`) is absent, so every cell that
reads it is `unrun`. **Links 1–16 all passed inside the aggregate run**, and
every one of the 23 links *after* the failing one was run individually and
passed (§3, plus `visual-baselines`, `tokens`, `tokens:refs`, `tokens:dtcg`,
`tokens:schema`, `package-names`, `doc-snippets`, `engines`, `adr-references`,
`readme-facts`, `externals`, `dts`, `changelog`, `release-policy`, `peers`,
`licenses` — all exit 0). **The aggregate is not green and is not called green.**

One transient red in the first aggregate run was **mine and is fixed**:
`validate:rtl` failed on `DzContextMenu` because a JSDoc I wrote contained the
words *right-click* and the gate reads prose as a physical-direction utility.
Reworded; `validate:rtl` exit 0. Recorded as **D55** — a validator that can be
turned red by a comment is a false-positive surface, not a style rule.

**Full suite** — `yarn test`:

```
Test Files  3 failed | 525 passed (528)
     Tests  3 failed | 9777 passed | 4 skipped | 1 todo (9785)
```

| Failure | Ownership |
| --- | --- |
| `token-checks/landing-token-fallbacks.spec.ts` | **inherited** at `99b963a` |
| `validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver` | **inherited** at `99b963a` |
| `resolution/dzup-resolution.spec.ts > covers exactly the specifiers the packages declare` | **another packet's** — the inline snapshot lacks `@dzup-ui/tokens/css/high-contrast`. `packages/tokens/package.json` was already modified in the working tree at this task's START (`git status` line 546) and `git show HEAD:packages/tokens/package.json` contains no `high-contrast`, so it belongs to the high-contrast tokens packet (TASK-R5-O7), which this task is told not to touch. |

**No new failure from this task.** Typecheck lanes: `yarn typecheck` (core)
**exit 0**; `packages/tooling` `tsc` **13 errors, unchanged** — verified by a
counterfactual run with the union `defineProps<DzAccordionProps>()` restored,
which also produced 13.

---

## 6. Owner decisions raised (D50 – D57)

**D50 🟠 — A2-D2 SETTLED: `update:*` events get a synthesised description with
its own `descriptionSource`.**
71 of the 106 undescribed events were `defineModel`-synthesised. Vue generates
the emit; there is no member anywhere in the repository to carry a JSDoc, so no
source work can ever close them.
Options: **(a) synthesise one sentence per event, stamped
`descriptionSource: "model-synthesised"` and counted in
`totals.eventsModelSynthesised` — TAKEN**; (b) require every component to
hand-author an `update:modelValue` member in its Emits interface — 71 near-
identical sentences, and a second declaration of what `defineModel` already
declares; (c) leave the cells blank — the status quo, a blank API row on every
`v-model` component's docs page and in every MCP answer.
The synthesised sentence says only what the mechanism guarantees — *"Emitted
when the `v-model:x` binding changes, with the new value"* — and deliberately
says nothing about what the value **means**, because that belongs on the prop,
which *is* authorable and was authored here. **Open sub-question for the owner:**
`eventsModelSynthesised` (70) is reported, **not ratcheted**. A ceiling would
rise legitimately every time a component gains a `defineModel`, so a downward
ratchet would be wrong; but nothing currently stops the synthesiser's population
from growing by mis-classification. **rec.** leave it reported, and revisit if
`eventsFromEmitsInterface` ever falls.

**D51 🟠 — A3-D3 SETTLED: `DzAccordion` takes a flat `DzAccordionRootProps` in
`defineProps`; the exported union is untouched.**
Options: **(a) a flat interface transcribing what Vue's SFC compiler already
flattens the union to, guarded by a compile-time `extends` assertion — TAKEN**;
(b) resolve the union inside the extractor through the checker's `ts.Program` —
rejected, it would mean re-implementing props *and* events *and* slots *and*
exposed for one component, i.e. the second extraction mechanism this task file's
governing rule forbids; (c) wait for a `vue-component-meta` upgrade — TASK-R5-O9's
lane, and the `<stop_conditions>` branch, but not required: the fix needed no
toolchain change; (d) delete `DzAccordionSingleProps`/`MultipleProps` and ship
one flat exported type — a breaking type change for no extraction gain.
**The owner should see the finding that made (a) safe:** the union was not
enforcing its discrimination. `<DzAccordion :size="123" type="multiple"
collapsible />` type-checked **clean** under `vue-tsc` at `99b963a`, while the
same mistake on `DzTabs` was rejected. (a) therefore *restores* prop checking
rather than loosening it. **It does not restore the discrimination** — `type:
"multiple"` with `collapsible` is still accepted, as it was before. **rec.** a
follow-up that expresses the constraint in a way the language service can read
(a `collapsible?: never` refinement, or a runtime dev warning), owned by whoever
next holds the Accordion.

**D52 🟠 — `DzAsyncBoundary.delay` is a published prop the component never reads.**
Declared in `DzAsyncBoundary.types.ts:6`, defaulted to `undefined` in
`DzAsyncBoundary.vue:10`, and **referenced nowhere else in the component**. Its
own unit spec asserts only that it is "accepted … without throwing". The same
class as **D40** (`DzButton.asChild`). Per `<stop_conditions>` the intent was not
described; the published description says the prop has no effect today.
Options: (a) **implement it** — the evident intent is "wait this long before
showing the `loading` slot", which is a real and useful behaviour and a new
implementer this task's `<scope>` forbids; (b) **remove the prop** — breaking,
therefore a `minor` while 0.x, and the honest correction; (c) leave it documented
as inert — taken here, because it is the only option available to this task.
**rec. (a)**, sequenced with D40 so the two inert props are settled together.

**D53 🟢 — `componentsWithoutStaticTemplate` stays at 80 and is not this
pipeline's to lower.**
Re-measured into three populations: 64 compound parts with no stories file (by
design); `DzThemeProvider`, which has no stories file either; and 15 public
components whose primary story is `= {}` (Storybook renders straight from `args`
— `DzIcon`, `DzEmoji`, `DzCopyButton`, `DzIconButton`) or an interpolated
`` `${…}` `` template literal the extractor refuses rather than publish
half-substituted (`DzAccordion`, `DzFlex`, `DzGrid`, `DzMasonry`).
Options: (a) **leave it — taken**, and the `<stop_conditions>` instruction:
"a template would need a story that does not exist" is a story-dod follow-up;
(b) add a `Default` story with a literal template to the 15 — real work, real
value, and it belongs to whoever owns story-dod; (c) relax the extractor to
substitute the interpolations — rejected, it would publish markup no story
actually renders. **rec. (b)**.

**D54 🟢 — `DzDataGridBodySlots` describes a slot the component does not render
and omits the one it does.**
`DzDataGrid.types.ts:292` declares `default?: () => unknown`; `DzDataGridBody.vue`
renders only `<slot name="cell" …>`. Nothing imports the interface, so the drift
was invisible. Left alone here — correcting an exported type is an API change
this task's `<scope>` forbids — and the real `cell` slot was declared inline in
the component instead.
Options: (a) **leave the stale interface — taken**, with the contradiction now
on record; (b) rewrite `DzDataGridBodySlots` to declare `cell` and use it from
the component — the clean fix, a type change to an exported symbol; (c) delete
the interface. **rec. (b)**.

**D55 🟢 — `validate:rtl` reads prose as CSS utilities.**
The gate flags any `right-*` / `left-*` token in a component that declares
`mirrors: 'layout'`, and it does not exclude comments: the phrase *"opens on
right-click"* inside a JSDoc block turned the whole aggregate red at link 10.
Options: (a) **reword the comment — taken**, zero risk, and the gate stays as
strict as it is; (b) make the scanner skip comment ranges — correct, but it
changes what an existing ratcheted gate sees and belongs to the RTL packet;
(c) leave it and accept prose collisions. **rec. (b)**, with D36/F-4's owner.

**D56 🟢 — five slot-interface members were declared required and are optional in
fact.** `DzAccordionSlots.default` and the four `DzCard*Slots` members
(`default`, `header`, `footer`, `actions`, `media`) were `name: () => VNode[]`,
not `name?:`. Nothing enforced it until `defineSlots<…>()` was declared, at which
point five existing specs failed `TS2739` for mounting a card with one slot.
A card with no footer is legal and always has been, so the interfaces were wrong.
Marked optional. Options: (a) **make them optional — taken**, a loosening that
matches shipped behaviour; (b) keep them required and fix the specs — would make
a legal usage a type error. **rec. (a)**; recorded because it edits exported
types.

**D57 🟢 — the TASK-R5-O8 `<done_check>` cannot run as written** (the **D42**
pattern again). It names `packages/core/docs/component-meta.ratchets.json`,
which does not exist, and reads `m.records`, which is `m.components`. Two of the
three checks throw rather than fail. Options: (a) **amend the task file to the
corrected block in §8 — no code change**; (b) add a `component-meta.ratchets.json`
alias so the check works as written — a second artifact for one number.
**rec. (a)**.

---

## 7. Description sample for review (≥ 10 % per family)

The population is the 147 members this task closed by authoring or recovery —
the exact members `component-meta.json` recorded as undescribed at `99b963a` +
dirty tree, plus `DzAccordion`'s two newly-extractable ones. The 70 synthesised
`update:*` descriptions are excluded from the sample because they are one
generated sentence, quoted in full in §1.

**buttons** — 3 members closed, 1 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzSpeedDial` | prop `open` | Whether the action list is expanded; `false` keeps it collapsed behind the trigger. |

**cards** — 9 members closed, 1 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzCard` | slot `actions` | Action buttons area |

**data** — 17 members closed, 2 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzAnimatedNumber` | exposed `displayText` | The rendered figure as the formatted string on screen, from the same formatter the template uses. |
| `DzDataGridBody` | event `rowClick` | Emitted when a row is clicked, with the row and its zero-based index. Fires before selection toggles. |

**feedback** — 13 members closed, 2 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzAsyncBoundary` | prop `delay` | Declared and accepted, but **not read by the component**: there is no code path in `DzAsyncBoundary.vue` that uses it, so setting it has no effect today. Owner decision D52 (TASK-R5-O8) settles whether to implement the intended "wait this long before showing the loading slot" behaviour or to withdraw the prop. |
| `DzAsyncBoundary` | event `timeout` | Emitted once when the default slot has been suspended for `timeout` ms. Carries no payload and changes nothing on screen. |

**forms** — 44 members closed, 5 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzCascader` | prop `modelValue` | The selected path as an array of keys, root first, bound with the contract-conforming default `v-model`. Left `undefined` the component reads the legacy `v-model:value` instead; writes go to both (ADR-16, `useDualModel`). |
| `DzFieldArray` | prop `min` | Fewest rows the array may hold — removing below it is a no-op. `undefined` sets no lower bound. |
| `DzFormLabel` | slot `default` | The label text. Rendered inside the `<label>` whose `for` the field context resolves. |
| `DzPersonaSelector` | prop `modelValue` | Id of the selected persona; the default empty string selects none. |
| `DzSwitch` | prop `modelValue` | Whether the switch is on; `false` renders it off. |

**inputs** — 15 members closed, 2 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzInput` | prop `modelValue` | The field's text value; the default empty string renders an empty input. |
| `DzNumberInput` | exposed `inputRef` | The underlying `<input>` element, for focus, selection and measurement. `null` before mount. |

**layout** — 3 members closed, 1 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzCollapse` | prop `modelValue` | Whether the panel is expanded; `false` renders it collapsed. |

**media** — 4 members closed, 1 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzCarousel` | prop `modelValue` | Zero-based index of the slide currently in view; defaults to `0`, the first slide. |

**navigation** — 9 members closed, 1 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzMenuItem` | event `click` | Item clicked |

**overlays** — 29 members closed, 3 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzCommandPalette` | prop `open` | Whether the palette overlay is open; `false` keeps it closed. |
| `DzDialogContent` | event `openAutoFocus` | Focus event when dialog opens -- call event.preventDefault() to prevent auto-focus |
| `DzPopoverContent` | event `interactOutside` | Any interaction outside popover content |

**providers** — 1 members closed, 1 sampled

| Component | Member | Published description |
| --- | --- | --- |
| `DzThemeProvider` | slot `default` | The application tree the theme context covers. Rendered unwrapped inside `DzProvider`. |

**Total closed by authoring or recovery: 147** (plus 70 synthesised under A2-D2). Sampled: 20. Misses: 9.

Two rows above are deliberately short (`DzCard.actions` → "Action buttons area",
`DzMenuItem.click` → "Item clicked"). **Those are pre-existing authored prose
that nothing could reach** — they were already in the types file, and this task's
job for them was to make the pipeline read them, not to rewrite them. Improving
that prose is a separate, purely editorial pass and was not done here, so the
handoff does not claim it.

---

## 8. Corrected `<done_check>` for the next agent

```bash
# 1. the four description ratchets, all at 0
node -e "const c=require('./packages/tooling/src/validators/component-meta-ceilings.json');
  console.log(['propsWithoutDescription','slotsWithoutDescription','eventsWithoutDescription','exposedWithoutDescription']
    .map(k=>k+'='+c[k].ceiling).join(' '))"
# → propsWithoutDescription=0 slotsWithoutDescription=0 eventsWithoutDescription=0 exposedWithoutDescription=0

# 2. no component without a description  (the key is `components`, not `records`)
node -e "const m=require('./packages/core/docs/component-meta.json');
  console.log(m.components.filter(r=>!r.description).map(r=>r.name))"        # → []

# 3. DzAccordion extracts its API
node -e "const m=require('./packages/core/docs/component-meta.json');
  console.log(m.components.find(r=>r.name==='DzAccordion').props.length)"    # → 12

# 4. and the gate agrees
yarn validate:component-meta ; echo \"exit \$?\"                               # → exit 0
```

---

## 9. Ranked next packet

1. **🟠 Author the 15 missing `Default` stories with literal templates
   (D53).** The only remaining number in this pipeline's ratchet set that can
   move, and it moves `componentsWithoutStaticTemplate` 80 → 65 and
   `publicComponentsWithoutExample` 1 → 0 (`DzThemeProvider`). Story-dod's lane.
2. **🟠 Settle the two inert published props together — `DzButton.asChild`
   (D40) and `DzAsyncBoundary.delay` (D52).** Both are now *documented as inert*,
   which is honest but is not a resolution; both are a `minor` to remove while
   0.x. A third could appear at any time and nothing would catch it — an
   "accepted but never read" scan over `defineProps` members is a small, high-
   value gate.
3. **🟢 Editorial pass over the ~30 recovered one-word descriptions**
   ("Item clicked", "Escape key pressed", "Body content"). They now reach the
   docs pages and `llms.txt` for the first time, so their quality is visible for
   the first time; the `quality_bar` this task applied to new prose has not been
   applied to inherited prose.
4. **🟢 `validate:rtl` comment-awareness (D55)** and **`DzDataGridBodySlots`
   (D54)** — both one-file fixes in packets that already exist.
5. **🟠 `@intent` 144/144 (D37)** is still the largest single documentation debt
   in the docs-page contract and is untouched by this task. With props, events,
   slots and exposed now at 0, it is the only section-level number a person must
   write by hand.

---

## 10. `git status --short` — start and end

| | Paths |
| --- | --- |
| **START** (before any edit) | **690** |
| **END** | **713** |

`comm` over the two sorted lists: **0 paths removed** from the dirty set,
**23 added**. Nothing belonging to the twelve prior packets was reverted,
stashed or checked out. The 23 additions:

```
apps/docs/components/index.md
packages/core/src/components/feedback/DzAsyncBoundary.{types.ts,vue}
packages/core/src/components/feedback/DzErrorBoundary.{types.ts,vue}
packages/core/src/components/forms/DzFieldArray.{types.ts,vue}
packages/core/src/components/forms/DzForm{Description,Label,Message}.vue
packages/core/src/components/layout/DzDeferredContent.vue
packages/core/src/components/overlays/Dz{ContextMenu,Dialog,DropdownMenu,Popover,Sheet,Tooltip}.vue
packages/core/src/providers/DzThemeProvider.vue
packages/tooling/src/playground/playground.spec.ts
packages/tooling/src/validators/component-meta.{spec.ts,ts}
packages/tooling/src/validators/{component-meta-ceilings,llms-ceilings}.json
```

Every other file this task edited was already dirty from a prior packet.
Three scratch probe files (`.probe-r5o8.ts`, `.probe2-r5o8.mjs`,
`.spec-props.json`) and one probe directory
(`packages/core/src/__probe/`) were created during measurement and **deleted**;
`ls` confirms none remains.
