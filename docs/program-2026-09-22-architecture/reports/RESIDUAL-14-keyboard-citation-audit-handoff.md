# RESIDUAL-14 — the keyboard gate's blind spot, audited

*Written incrementally, 2026-09-29. Repository: `ui/dzup-ui` (OSS, scope `@dzup-ui/*`).
HEAD `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`, 396 dirty paths at entry, uncommitted by
design.*

---

## 0. The item

RESIDUAL-13 closed `maxUnbackedDeclarations` **28 → 0** and `maxUndeterminedDeclarations`
**8 → 0**, so `yarn validate:anatomy-keyboard` reports **404 of 404** keyboard rows backed.
Its own §3.4 raised the reason that is not good enough, and its §10 ranked it seventh:

> `DzTransfer`'s arrows cited a real file for the wrong claim, and **366 backed citations have
> never been sampled against their action text**.

This packet is that audit. It has one deliverable — **how many of the 404 backed citations
actually support what their row says the key does** — and one consequence, which is that the
two ceilings driven to zero were driven there on the strength of citations nobody had read.

**Entry measurement, `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-keyboard.ts --json`, exit 0:**

| | |
|---|---|
| anatomy declarations | 104 (19 declare `keyboard: 'none'`, 85 declare bindings) |
| rows | **404** |
| `backed` / `unbacked` / `undetermined` | **404 / 0 / 0** |
| by route | `own` 153 · `primitive` 156 · `platform` 61 · `part` 13 · `renders` 8 · `composable` 7 · `spec` 6 |
| distinct citation sites behind the 404 rows | **220**, in **90** files |

220 sites is small enough to read **all** of them, so this is a **census, not a sample** —
every one of the 404 rows was adjudicated against its citation. §2 states the method.

---

## 1. The known instance, reproduced — why `DzTransfer`'s arrows cited the wrong claim

`DzTransfer.anatomy.ts` declares, **unscoped** (no `when`), `apg: 'listbox'`:

```
{ key: 'ArrowDown', action: 'Move focus to the next option.',     apg: 'listbox' }
{ key: 'ArrowUp',   action: 'Move focus to the previous option.', apg: 'listbox' }
```

Before RESIDUAL-13 both read `backed` at
`packages/core/src/components/forms/optionsStateFocus.ts:294` / `:280`. That file is real and
that line is real. It is inside `retryRouteOwnerKeydown`, whose own docblock says what it
does: *"`ArrowDown` / `ArrowUp` move focus onto the **retry control**"* of the async error
state. Not "the next option".

**The mechanism, exactly.** `ownerOf` resolves routes 1–4 with **two independent file-wide
predicates that are never related to one another**:

```ts
if (fileRoute !== route || !file.handles)   // (a) does this FILE do anything with a key event?
  continue
const line = file.keys.get(key)             // (b) does this FILE name the key ANYWHERE?
if (line !== undefined)
  return { owner: { route, citation: `${rel(file.path)}:${line}` } }
```

`file.handles` is `HANDLER_TOKEN.test(source)` over the whole file. `file.keys` is
`keysNamedIn(source)` over the whole file. Nothing requires the handler that satisfies (a) to
be the handler that names the key in (b), nor that either be bound to the node the row is
about, nor that what it does resemble the row's `action`. `optionsStateFocus.ts` reached
`DzTransfer`'s closure as a sibling `.ts` import under route `own`; it contains keyboard
handling (true) and it names `ArrowDown` (true, via
`isPlainArrow(event, 'ArrowDown')` — `keysNamedIn`'s bare-`NAMED_KEY`-followed-by-`)` arm
reads a **function argument** as a key comparison); therefore the row is `backed`.

**So the defect is not "a wrong file was picked".** It is that the predicate has no term for
the claim: *file contains a keyboard handler* ∧ *file mentions the key in a key-ish shape* ⇒
*this row is satisfied*. Nothing else. The `platform` route (6) was already scoped to the node
the row is about — RESIDUAL-12 scoped it deliberately, to catch `DzChip` — and routes 1–4 were
not. **That asymmetry is the blind spot**, and §2 shows it is not confined to `DzTransfer`.

---

## 2. The census — all 404 rows against their action text

### 2.1 Method

Not a sample. The 404 rows collapse to **220 distinct `file:line` citation sites**, so every
site was read once, in the presence of every row that leans on it, and every row adjudicated.
Two mechanical screens ran first to direct the reading (`flag-citations.mjs`, scratchpad,
read-only):

1. **Is the cited node or key literal inside a comment?** — the RESIDUAL-02/05 `filesMentioning`
   question, asked of this artifact.
2. **Does the cited line exist where the citation says it does?** — `templateNodesIn` computes
   `line` against the **template body slice**, not the file, so every platform citation derived
   from a template node points at the wrong file line.

Each row was then placed in one of three buckets, with a fourth recorded separately:

| Bucket | Meaning |
|---|---|
| **G — genuine** | the cited site is part of the mechanism that produces the row's stated action, on a node the row is about |
| **W — real file, wrong claim** | the cited site is real code or a real element, but the behaviour there is **not** the row's stated action, or it is a different node that does something else. The row may still be *true*; the **citation does not back it** |
| **U — undecidable** | not determinable from the citation plus a bounded read of the component |
| *(sub-count)* **I — imprecise** | counted in **G**: the right *class* of node on a sibling of the same class (e.g. `PaginationFirst` standing in for a page button). Not a false green |

*(Bucket totals and the full per-row disposition land in §2.3 once the census closes; §2.2
records the findings as they were measured.)*

### 2.2 Findings

*(appended per phase — see the dated sections below)*

#### 2.2.1 Routes `part` (13), `renders` (8), `composable` (7), `spec` (6) — 34 rows, 32 **G**

Thirty-two read back; **two do not**, and they are named at the end of this list. The
sharp ones first:

- `DzTabs` `Delete`/`Backspace` *(when closable)* "Close the focused tab" →
  `DzTabTrigger.vue:65`, inside a `props.closable` guard. The compound-part route working as
  designed.
- `DzResizable`/`DzSplitter`/`DzTable` direction-aware arrows → the `stepKeys` / `narrowerKey`
  computed that names exactly the key the row names, in the axis the row names.
- `DzTree`'s eight treeview keys → `DzTreeItem.vue`'s `switch` arms, one per row, each calling
  the navigation the row describes.
- `useEscapeKey.ts:25` (3 rows) and `useFocusTrap.ts:91` (4 rows) — the two composables really
  are the owners.
- **Four** of the six `spec`-route rows back their action **at the floor the route claims**
  (`platform: ['Enter', ' ']` asserts a rendered node whose own documented behaviour is that
  key; for a checkbox, Space *is* the toggle). The route's docblock already states it does not
  prove the effect.
- **The other two `spec` rows are `W`, and they are the third instance in this repository of
  prose whose meaning is the opposite of what it grants.** `DzCheckboxGroup`'s `Space` cited
  `DzCheckboxGroup.spec.ts:153` and `DzRadioGroup`'s cited `DzRadioGroup.spec.ts:133`. Both
  lines are **comments**, and `specAssertedKeys`'s regex —
  `/(?:handled|platform)\s*:\s*\[([^\]]*)\]/` — matched the `platform: [' ']` and
  `handled: [' ']` **inside them** before reaching the real `expectKeyboardContract` call two
  lines below. `DzRadioGroup`'s comment reads *"`handled: [' ']` would be false while the
  behaviour is correct"* — a sentence explaining that an assertion **would not hold** is what
  granted the row its citation. The assertions themselves are real and both rows are true; the
  citation was prose, and after comment-stripping they point at `:158` and `:135`.

#### 2.2.2 Route `platform` (61 rows) — three distinct false-green mechanisms

**(a) A comment is evidence — 6 rows.** `templateNodesIn` finds its template with
`source.indexOf('<template>')` and does not care that the match is inside a JSDoc `@example`,
nor that the file is a `.ts` with no template at all.
`packages/core/src/i18n/useComponentMessages.ts` — an i18n composable, 130 lines, **no
markup** — carries this in its docblock at lines 13–14:

```
 * <template>
 *   <button :aria-label="dzMessages.clear" />
```

so the file yields a template node whose text is a `<button>`, and because every component
that shows a message imports it under route `own`, that `<button>` in a comment is the
platform backing for **six rows across three components**:

| Component | Key | Action the row states |
|---|---|---|
| `DzAnchor` | `Enter` | Follow the link. |
| `DzBreadcrumb` | `Tab` | Move to the next crumb; every crumb is its own tab stop. |
| `DzBreadcrumb` | `Enter` | Follow the focused crumb. |
| `DzSidebar` | `Tab` | Move to the next item or group toggle; every one is its own tab stop. |
| `DzSidebar` | `Enter` | Activate the focused item, or expand and collapse the focused group. |
| `DzSidebar` | `' '` | Activate the focused item, or expand and collapse the focused group. |

This is `filesMentioning` again, in a different artifact, and it is worse in one respect: the
validator's own source says at `anatomy-keyboard.ts:1163` that *"citing
`useComponentMessages.ts` as the focusable node behind a `Tab` row is a citation nobody can
read back"* — it scoped the `Tab` route to template **nodes** to prevent exactly this, and the
node it now cites is prose. It also **shadows RESIDUAL-13's own fix**: `DzAnchor`'s `Enter`
was the row `renderFunctionNodesIn` was written for, and the comment's `<button>` is found
first.

**6 rows → W.**

**(b) `<component :is>` is credited with `<button>` activation whatever it can resolve to — 3 rows.**
`PLATFORM_KEYS`'s activation token is
`/<button[\s/>]|<\s*component\s[^>]*\bis=/` — "a `<component :is>` that **can** be one". It
does not read the expression. `DzTableCell.vue`'s root is

```
<component :is="header ? 'th' : 'td'" data-part="cell" …>
```

which can be a `th` or a `td` and nothing else. It is cited as the `<button>` behind
`DzTable`'s three sortable-header rows. **And `DzTable` has no sorting at all** —
`DzTable.types.ts:41` says *"Column sorting (sort indicators, sort-change emits) →
DzDataGrid"*, `sortable` appears in the `data` family only in `DzDataGrid.vue` /
`DzDataGridHeader.vue`, and none of `DzTable`'s five compound parts carries a sort control.

| Row | Verdict |
|---|---|
| `Enter` *(when header sortable)* "Cycle the focused column sort." | **W** — and the row is wrong |
| `' '` *(when header sortable)* "Cycle the focused column sort." | **W** — and the row is wrong |
| `Enter`+`Shift` *(when header sortable)* "Add the focused column to the existing sort rather than replacing it." | **W** — and the row is wrong |

These are three published accessibility claims for a feature the component's own types file
says it deliberately does not have. Corrected in §5, not counted away.

**(c) First matching node in document order wins, with no relation to the action — 3 rows.**
For an unscoped row whose root takes no focus, `ownerOf` walks `ownAndParts` and returns the
**first** node the platform table matches. Document order, not relevance.

| Row | Cited | What the citation actually shows | Verdict |
|---|---|---|---|
| `DzTimePicker` `Enter` "Select the highlighted option and close the time list." | `reka-ui/dist/Popover/PopoverTrigger.js` (`as` → `<button>`) | the **trigger**, whose Enter *opens* the list. The row's claim is backed — by the option `<button type="button" @click="selectHour(h)">` at `DzTimePicker.vue:636`, which is not what is cited | **W** |
| `DzToolbar` `Tab` "Move out of the toolbar; the toolbar is one tab stop." | `DzButton.vue` (`<component>` is focusable) | that *something* is focusable. "One tab stop" is the roving-tabindex code at `DzToolbar.vue:125`, which is real and uncited | **W** |
| `DzInfiniteScroll` `Tab` "Move to the next focusable element **inside the loaded items**; the feed adds no keys of its own." | `DzButton.vue` via `DzButton`'s root | the error-state **retry** button at `DzInfiniteScroll.vue:145`. The loaded items are the consumer's `<slot />` at `:133` | **W** |

**(d) The weakest platform route, credited against a listbox contract — 1 row.**
`DzTransfer`'s `<character>` row is APG `listbox` **type-ahead**: *"Move focus to the next
option whose label starts with that character."* It is backed by the pane's `searchable` text
`<input>` (`DzTransfer.vue`, true line ~355) — a field that **filters**, which is not moving
focus among options. `onPaneKeydown` handles `ArrowDown`/`ArrowUp`/`Home`/`End` and nothing
else; **no type-ahead exists anywhere in the component.** This is the same shape RESIDUAL-13
fixed on `DzOrderList` (whose `<character>` row "declared APG listbox type-ahead that did not
exist anywhere") and missed here — the second `DzTransfer` row of §3.4's own class. **W**, and
the row is unimplemented; raised as a decision in §6 rather than silently withdrawn.

**Genuine on this route**, including the deliberate weak cases, is everything else: the native
`<button>` roots of `DzButton`/`DzFab`/`DzIconButton`/`DzToggleButton`/`DzCopyButton`, Reka's
`as`-resolves-to-`<button>` primitives behind `DzCheckbox`/`DzSwitch`/`DzSegmented`/`DzRadio`/
`DzAccordion`, `DzStepperItem`'s `:tabindex="isClickable ? 0 : undefined"` root behind
`DzStepper`'s `Tab`, `DzColorPicker`'s three correctly part-scoped rows, and `DzPagination`'s
`Enter`/`' '`/`Tab` (counted **G**, flagged **I**: `PaginationFirst` is cited for "Go to the
focused page" — a cousin of the numbered page button, same class of node, same activation).

**(e) Every platform citation derived from a template node points at the wrong file line.**
`templateNodesIn` computes `line` against `source.slice(indexOf('<template>') + 10)`, so the
number is an offset into the template body and is printed as though it were a file line. **20
citation sites, 39 rows.** `DzButton.vue:2` is `import type { ButtonVariant … }`; the node is
at ~190. `DzTransfer.vue:47` is a `withDefaults` entry; the node is at ~355. This does not
change whether a claim is backed, so it is **not** counted in W — it is counted separately,
because a citation that cannot be opened is a citation that cannot be disputed, which is the
whole premise of the `backed` verdict.

#### 2.2.3 Route `own` (153 rows) — 22 **W**

**A comment is evidence here too, and one of them is prose that says the opposite (4 rows).**

| Row | Cited | What is actually at that line |
|---|---|---|
| `DzDatePicker` `End` *(calendar open)* | `DzDatePicker.vue:149` | a **docblock** sentence, *"the APG `grid` pattern for a date-picker dialog does specify Home and End: the first and last day"*. `keysNamedIn`'s unquoted-object-key arm reads `End:` **in prose**. The `Home` row of the same pair cites the real code at `:163` |
| `DzListbox` `<character>` | `DzListbox.vue:25` | a **docblock**: *"Reka provides … Enter/Space toggle, typeahead, and (via ListboxFilter) …"*. Matched by `/typeahead/i` |
| `DzSelect` `<character>` | `DzSelect.vue:366` | a **docblock**: *"the keydown still stops here, so **Reka's typeahead never sees** a query character"* — a sentence whose meaning is that the type-ahead **does not happen** is what grants the citation. RESIDUAL-05 §2.1 found the identical shape in `forms.a11y.spec.ts` |
| `DzCombobox`/`DzMultiSelect`/`DzSelect` `ArrowDown` | `optionsStateFocus.ts:294` | a **docblock** line quoting the Vue modifier chain `keydown.down.up.prevent`, matched by the alias arm |

**`DzTransfer`'s defect, unfixed, on three more components (6 rows).** RESIDUAL-13 repaired
`DzTransfer`'s two rows and did not ask who else that citation was serving. It was serving
three combobox hosts:

| Component | Key | Action the row states | Cited |
|---|---|---|---|
| `DzCombobox` | `ArrowUp` / `ArrowDown` | Open the list when closed, otherwise move to the previous/next option. | `optionsStateFocus.ts:280` / `:294` |
| `DzMultiSelect` | `ArrowUp` / `ArrowDown` | same | same |
| `DzSelect` | `ArrowUp` / `ArrowDown` | same | same |

`:280` is worse than `DzTransfer`'s was: it is
`function isPlainArrow(event: KeyboardEvent, key: 'ArrowDown' | 'ArrowUp'): boolean {` — a
**type annotation in a parameter list**, credited because a quoted key name followed by `)`
satisfies the bare-`NAMED_KEY` arm. The rows are **true** (Reka's `ComboboxInput` binds the
down/up modifier chain) and belong to route `primitive`; the citation is the retry-control
handler. **6 W.**

**`when` is not applied to routes 1–4 at all (2 rows).** `ownerOf` honours a row's declared
part only inside the `platform` route; routes `own`/`part`/`renders`/`composable` are asked
first and are file-wide.

| Row | Cited | What is at that line |
|---|---|---|
| `DzSearchInput` `Enter` *(when the clear part)* "Clear the field." | `DzSearchInput.vue:168` | `if (event.key === 'Enter') { cancelDebounce(); emit('search', …) }` — **submit**, not clear. The sibling Space row of the same part is correctly resolved through the platform route to the clear `<button>` |
| `DzTransfer` `Enter` *(when the transfer action)* "Move the selected items to the other list." | `DzTransfer.vue:385` | an `enter.prevent` binding calling `selectSourceItem(item)` — it **selects an option in the source pane** |

**A Shift-guarded site backing an unmodified row (4 rows).** `DzListbox`'s `ArrowDown`,
`ArrowUp`, `Home` and `End` rows ("Move focus to the next/previous/first/last option") cite
`DzListbox.vue:336`, `const NAV_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End']`, under the
section header *"Range-select interactions"* and the comment *"Capture Shift+Arrow/Home/End
before Reka navigates"*. `NAV_KEYS` is consulted only inside
`if (event.shiftKey && NAV_KEYS.includes(event.key))`. The **navigation** is Reka's
`ListboxRoot`; the cited site is the range-selection capture. **4 W.**

**`modifiers` is ignored, so a modified row is credited to the unmodified handler (4 rows).**
`ManifestKeyboardBinding` carries `modifiers` — `anatomy-source.ts:403` parses and validates
it — and `anatomy-keyboard.ts` keys **only** on `binding.key`.

| Row | Cited | Measured |
|---|---|---|
| `DzCalendar` `Shift`+`PageUp` "Move to the previous year." | `DzCalendar.vue:318` (`case 'PageUp': next = cur.subtract({ months: 1 })`) | `shiftKey` appears **nowhere** in `DzCalendar.vue` and there is no `years` arithmetic in it. The row is **unimplemented** |
| `DzCalendar` `Shift`+`PageDown` "Move to the next year." | `DzCalendar.vue:321` | same |
| `DzOrderList` `Alt`+`ArrowUp` "Move the selected item one position earlier." | `DzOrderList.vue:475` | the arm **does** move the item — when `grabbedIndex !== null`, i.e. after `Space` grabs it. `altKey` is read in exactly one place in the file, inside `typeAhead`, where it **rejects** the key. The row is wrong about the modifier |
| `DzOrderList` `Alt`+`ArrowDown` "…one position later." | `DzOrderList.vue:482` | same |

**One more, and the row is wrong (1 row).** `DzOrderList`'s Space row says "Select the focused
option." and cites `DzOrderList.vue:455` —
`const printable = event.key.length === 1 && event.key !== ' '`, the type-ahead's **exclusion**
of the space bar. The real `case ' ': case 'Spacebar': toggleGrab(index)` at `:501` **grabs the
item for reordering**; `Enter` at `:506` is what selects. **W**, and the published table
describes the wrong action.

The other **133** `own` rows read back cleanly — `DzCalendar`'s grid, `DzCascader`,
`DzKnob`, `DzRating`, `DzImageComparison`, `DzMegaMenu`, `DzToolbar`'s arrows (RESIDUAL-13's
own work), `DzTransfer`'s four repaired arrows, `DzTreeSelect`, `DzTreeItem`, `DzMention`,
`DzInputMask`, `DzNumberInput`, `DzTagsInput`, `DzTour`, `DzCommandPalette`'s Meta/Control+`k`
(the site reads both modifiers), `DzStepperItem`, `DzFileUpload`, `DzInplace`, `DzChip`/`DzTag`,
`DzListItem`, `DzSpeedDial`, `DzCard`, `DzMultiSelect`'s `Backspace`, `DzLightbox`,
`DzTimePicker`'s trigger and column arms, `DzDateRangePicker`.

#### 2.2.4 Route `primitive` (156 rows) — 15 **W**, and the largest single false green

**`DzDataGrid` declares a two-dimensional grid it does not implement (6 rows).**
The whole `DzDataGrid` family's only keyboard handling is in the **header**: sort
(`useDataGridHeader.ts:110`, Enter/Space, shift-aware) and the filter popover's `Escape`.
`DzDataGridBody.vue` emits a grid-cell role twice and handles **no key at all**; no file in
the family imports `reka-ui`, sets a roving `tabindex`, or moves a cell.

| Row | Cited | `what` the gate printed |
|---|---|---|
| `ArrowLeft` "Move focus one cell to the inline start." | `reka-ui/dist/RovingFocus/utils.js:10` | `CheckboxIndicator` |
| `ArrowRight` "…to the inline end." | `:12` | same |
| `ArrowUp` "Move focus one row up." | `:11` | same |
| `ArrowDown` "Move focus one row down." | `:13` | same |
| `Home` "Move focus to the first cell of the row." | `:15` | same |
| `End` "Move focus to the last cell of the row." | `:17` | same |

The grid's **row-selection checkbox** is what puts `CheckboxIndicator` in the closure;
`CheckboxIndicator`'s import graph reaches `RovingFocus/utils.js`, whose
`MAP_KEY_TO_FOCUS_INTENT` names all six keys. A **one-dimensional** roving-focus group cannot
implement a two-dimensional grid pattern, and the gate's own `what` field says out loud which
primitive it credited. **6 W** — six published `apg: 'grid'` accessibility claims, on the
component `DzTable.types.ts` points buyers at for "advanced features", with nothing behind them.

**`DzDataGrid`'s three sort rows are real and cited to nonsense (3 rows).**

| Row | Cited |
|---|---|
| `Enter` *(when header)* "Cycle the focused column sort." | `reka-ui/dist/Checkbox/CheckboxRoot.js:122` |
| `Enter`+`Shift` *(when header)* "Add the focused column to the existing sort rather than replacing it." | `reka-ui/dist/Checkbox/CheckboxRoot.js:122` |
| `' '` *(when header)* "Cycle the focused column sort." | `reka-ui/dist/Select/utils.js:10` |

All three are genuinely implemented, at
`packages/core/src/composables/useDataGridHeader/useDataGridHeader.ts:110–113`:

```ts
function handleHeaderKeyDown(event: KeyboardEvent, field: string): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    ctx.sort(field, event.shiftKey)
  }
}
```

**The composable route never saw it**, because `HANDLER_TOKEN` is **case-sensitive** —
`\bkeydown\b`, `\bonKey(?:down|up)\b` — and this file spells it `KeyDown` at every one of its
six occurrences and never lowercase. `file.handles` is therefore `false`, routes 1–4 skip the
file entirely, and route 5 hands the rows to whatever primitive happens to name `Enter`.
**3 W**, repaired rather than rejected in §3.

**Four more where the cited primitive is the wrong widget (4 rows).**

| Row | Cited | Why it does not back the claim |
|---|---|---|
| `DzSplitButton` `Enter` *(when root)* "Activate the primary action." | `reka-ui/dist/Menu/utils.js:5` | menu-item invocation. The primary action is the split button's own control; `DzSplitButton.vue` imports no `DzButton` and handles no key |
| `DzSplitButton` `' '` *(when root)* "Activate the primary action." | `reka-ui/dist/Menu/MenuContentImpl.js:202` | same |
| `DzCheckboxGroup` `Tab` "Move to the next checkbox; **each box in the group is its own tab stop**." | `reka-ui/dist/RovingFocus/RovingFocusItem.js:53` | a roving-focus item is what makes a group **one** tab stop — the citation asserts the opposite of the row. `DzCheckboxGroup.vue` is a `<div>` and a slot |
| `DzDataView` `Tab` "Move between the layout controls and the rendered items." | `RovingFocusItem.js:53` | `DzDataView.vue` has no `keydown`, no `tabindex` and no `reka-ui` import. The row is the document's plain focus order |

Both `Tab` cases exist because **route 5 is asked before the `Tab` platform rule**, so a
spurious primitive pre-empts the citation the validator's own comment says that row should get.
The same ordering is *correct* for the 19 dialog/overlay `Tab` rows, where `FocusScope.js:115`
really does manage the wrap — those are **G**.

**Verified genuine on this route** (opened and read, not assumed):
`DismissableLayer.js:72` behind 18 `Escape` rows · `FocusScope.js:115` behind 19 `Tab` rows ·
`Slider/utils.js` and `SliderImpl.js` behind 12 slider rows · `RovingFocus/utils.js` behind
`DzTabs` and `DzSegmented` (which do use roving focus) · `shared/useArrowNavigation.js:16–21`
(`e.key === "ArrowRight"` …) behind the menu/accordion/OTP arrows · `ListboxRoot.js:235`
(`event.key === kbd.END`) · `ListboxItem.js:76` (`withKeys(…, ["space"])`) ·
`ToastRootImpl.js:115` (`onKeyStroke("Escape", …)`) · `ToastViewport.js:81`
(`event.key === "Tab"`) · `Calendar`/`RangeCalendar` cell triggers · `TabsTrigger.js:61` ·
`RadioGroupItem.js:62–65` · `SwitchRoot.js:102` · `PinInputInput.js:177` ·
`useWindowSplitterPanelGroupBehavior.js:62` and `utils/calculate.js:42/45`.

### 2.3 The headline — 404 rows, adjudicated one by one

| | Rows | Share |
|---|---:|---:|
| **G — the citation genuinely backs what the row says the key does** | **352** | **87.1 %** |
| **W — a real file, and the wrong claim** | **52** | **12.9 %** |
| **U — could not be decided** | **0** | 0 % |
| *of which* **I — genuine, cousin cited** (sub-count of G, not a false green) | 6 | 1.5 % |

**W by route:** `own` **22** · `primitive` **15** · `platform` **13** · `spec` **2** · `part` 0 ·
`renders` 0 · `composable` 0.

> **52, not 46.** The reading pass in §2.2 found 46. Six more surfaced when the tightening
> was measured (§3.1), and they belong in this count because they fail the same test — the
> citation, opened, does not show the row's action:
> `DzTreeSelect`'s `ArrowRight`/`ArrowLeft` cited the two `/** ArrowRight: … */` docblocks
> above their functions rather than the switch arms · `DzCheckboxGroup`'s and
> `DzRadioGroup`'s `Space` cited a **comment** containing `platform: [' ']` and
> `handled: [' ']`, because `specAssertedKeys`'s regex matched the prose before the real
> call (and the second comment's sentence says that assertion *"would be false"*) ·
> `DzSplitButton`'s `Enter` *(trigger)* cited `Menu/utils.js:5`, a key-name list that does
> not show a trigger opening a menu, and its `ArrowDown` *(trigger)* cited
> `useArrowNavigation.js:19`, which moves focus among items and does not open anything.
> Both `DzSplitButton` citations were reached through a `<DzDropdownMenu>` in the file's
> own `@example`. The route sub-totals above are the corrected ones.

**W by mechanism** (a row is counted once, under the mechanism that admitted it):

| Mechanism | Rows |
|---|---:|
| **a comment is evidence** — a template block in a docblock, prose read by `keysNamedIn`, or prose read by `specAssertedKeys` | **18** |
| **first match wins**, in document or sorted-primitive order, with no relation to the row | **25** |
| **`modifiers` ignored** — a modified row credited to the unmodified handler | **5** |
| **`when` not applied to routes 1–4** | **2** |
| **a dynamic `is=` component credited with `<button>` activation** whatever it can resolve to | **2** |
| *(enabler, not a bucket)* `HANDLER_TOKEN` was case-sensitive and skipped the true owner | (3 of the 25) |
| *(also measured in §3.1, and counted inside the 25 and the 18)* the **closure** was built from prose — the `<Dz…>` render-edge walk read docblock `@example` blocks, so five slot-based containers' closures were the consumer's example markup | (6 rows) |

**`U = 0` is a claim, so here is its basis.** Every one of the 220 citation sites was opened —
including nine minified `reka-ui` dist lines quoted above — and every row was decided against
source rather than inferred from a primitive's name. The **I** sub-count is where that decision
was "right class of node, cousin cited": `DzPagination`'s three rows on `PaginationFirst`,
`DzTagsInput`'s `Enter` on the `delimiters: () => ['Enter', ',']` prop default,
`DzPersonaSelector`'s `<character>` on `ListboxRoot.js:6`'s `import { useTypeahead }` line, and
`DzColorPicker`'s `Tab` on `FocusScope` (which backs "Tab moves within the panel" but not the
row's *order* clause). Those are not false greens and are counted in G.

**Of the 52 W rows, 12 are rows that are themselves false** — the citation is wrong *because*
there is nothing to cite: `DzDataGrid` ×6 (grid navigation), `DzTable` ×3 (sortable header),
`DzCalendar` ×2 (year paging), `DzTransfer` ×1 (listbox type-ahead). The other **34 are true
rows with a citation that does not show it.**

### 2.4 A separate defect, counted separately — 39 citations point at the wrong line

`templateNodesIn` computes `line` against the template-body slice, not the file, so every
platform citation derived from a template node prints a **template-body offset as a file line**.
**20 sites, 39 rows.** Examples: `DzButton.vue:2` is an `import type` line (the node is at ~190) ·
`DzTransfer.vue:47` is a `withDefaults` entry (node at ~355) · `DzColorPicker.vue:93` is a
`computed` (node at ~244) · `DzMention.vue:17` is a docblock line (node at ~767). This does not
change whether a claim is backed, so it is not in the 52 — but "a citation a reader can open" is
the entire premise of a `backed` verdict, and 39 of them could not be opened.

---

## 3. What was tightened, and the proof each way

Five structural rules and one ledger. Every one is pinned by a test that
**reconstructs the old predicate inline, shows it accepting something wrong, then shows
the shipped predicate rejecting it** — RESIDUAL-05's method, except that seeding proves
it once and a test proves it on every run. 21 new cases in
`packages/tooling/src/validators/anatomy-keyboard.spec.ts`; all 21 pass.

### 3.1 `R1` — a comment is not evidence

`stripCommentsForScan(source, isVue)` blanks every comment **and preserves the line
count**, and its result is what `SourceFile.source` holds, so every scan downstream —
keys, handler token, template nodes, render-function nodes, Reka imports, relative
imports, the `<Dz…>` render edges, the slot token, `specAssertedKeys` — reads code
rather than prose without each one having to remember to. `.vue` is handled in two
regions (HTML comments everywhere, the JS scanner only inside `<script>`), because a
JavaScript comment scanner let loose on a template eventually eats a `/*` inside an
HTML comment. `templateNodesIn` now anchors on `/^<template>/m` — a **top-level SFC
block**, at column zero.

It reuses RESIDUAL-05's own `stripComments` from
`packages/tooling/src/quality/spec-component-refs.ts`, with one addition: a
`preserveLines` option. That function's docblock already claimed it kept the line count
stable and it did not — the block-comment branch emitted a single space. The default is
unchanged, because three published artifacts are derived from its output.

**Proof.** `the OLD predicate read a docblock @example as a template and found a
`<button>` in it` asserts `indexOf('<template>')` over the real
`useComponentMessages.ts` shape finds one and that a `<button>` follows it; `the NEW
predicate finds no template in it at all` asserts `templateNodesIn(strip(…))` is empty.
Four more cases pin line preservation, the file-line fix, the Vue-comment path, and
that a prose sentence naming `End:` grants nothing.

**Measured effect: 20 of the 52 wrong citations were repaired outright**, landing on
the real node or the real primitive:

| Rows | Was | Is |
|---:|---|---|
| 6 | `i18n/useComponentMessages.ts:2` (a docblock `<button>`) | `DzAnchor.vue:180` · `DzBreadcrumbItem.vue:64` ×2 · `DzSidebarItem.vue:120` ×3 |
| 6 | `optionsStateFocus.ts:280`/`:294` (a type annotation and a docblock) | `RovingFocus/utils.js` · `Listbox/ListboxContent.js` · `Select/SelectContentImpl.js` |
| 2 | `DzTreeSelect.vue:473`/`:486` (two `/** ArrowRight: … */` docblocks) | `:536` / `:542`, the switch arms |
| 2 | `DzCheckboxGroup.spec.ts:153` · `DzRadioGroup.spec.ts:133` — `specAssertedKeys`'s regex matched `platform: [' ']` and `handled: [' ']` **inside a comment**, and the second comment's sentence says that assertion *"would be false"* | `:158` / `:135`, the real `expectKeyboardContract` call |
| 1 | `DzDatePicker.vue:149` (prose) | `:163` |
| 1 | `DzListbox.vue:25` (prose) | `Listbox/ListboxContent.js:53` |
| 1 | `DzSelect.vue:366` (prose meaning the type-ahead never runs) | `Select/SelectContentImpl.js:6` |
| 1 | `Menu/utils.js:5` via a docblock render edge | `DzSplitButtonMenu.vue:55`, the trigger button |

**And a sixth mechanism the census had not separated: the closure itself was built from
prose.** `templateNodesIn`/the `<Dz…>` render-edge walk read docblock `@example` blocks,
so a slot-based container's closure was **the consumer's example markup**.
`DzCheckboxGroup`, `DzRadioGroup`, `DzStepper`, `DzSplitButton` and `DzToolbar` are all
a wrapper plus a `<slot />`; every `<DzCheckbox>`, `<DzRadio>`, `<DzStepperItem>`,
`<DzSplitButtonMenu>` and `<DzButton>` in those files is inside an `@example`. Their
keys were owned by components they do not render. Six rows moved to `undetermined` on
this alone — the validator's own verdict for "the node is the consumer's", and the right
one.

### 3.2 `R2` — a declared modifier is part of the contract

`ManifestKeyboardBinding.modifiers` has been parsed and validated since
`anatomy-source.ts:403`. This validator **never read it**. `ownerOf` now takes it, and:

- routes 1–4 require `readsModifiersAt(file.source, line, modifiers)` — the modifier's
  `KeyboardEvent` property must appear in the **innermost brace block containing the
  citing line, including its opening line**. Innermost, because a file-wide search for
  `altKey` is satisfied by `DzOrderList`'s type-ahead guard, which *rejects* Alt.
  Opening line included, because `DzCommandPalette` reads both its modifiers in an
  `if ((event.metaKey || event.ctrlKey) && event.key === 'k') {` header;
- the `primitive` route applies the same test to the cited dist line;
- the `platform` route **cannot satisfy a modified row at all**, with one exception that
  is not a component's doing either: `Shift`+`Tab`, the document's own reverse focus
  order. No native element has documented behaviour for `Shift`+`Enter`.

16 rows carry `modifiers`. The nine `Shift`+`Tab` rows all keep their citations
(`FocusScope.js:115` sits inside `handleKeyDown`, whose body reads `shiftKey` at 123;
`useFocusTrap.ts:91` likewise at 104), `DzCommandPalette`'s two keep theirs, and
`DzDataGrid`'s `Shift`+`Enter` keeps its — once `R4` lets the real owner be seen.

**Proof.** `the OLD predicate keyed on the key alone, so Shift+PageUp was the PageUp
handler` asserts `keysNamedIn` finds `PageUp` at the `subtract({ months: 1 })` arm; `the
NEW predicate refuses a site that never looks at the modifier` asserts
`readsModifiersAt(…, ['Shift']) === false` there and `=== true` with no modifiers. Three
more cases pin the `DzCommandPalette` header, the different-function case, and
innermost-block selection.

**Measured effect: 5 rows ejected.** `DzCalendar` `Shift`+`PageUp`/`PageDown` (year
paging that does not exist), `DzOrderList` `Alt`+`ArrowUp`/`ArrowDown` (the modifier is
not the precondition — corrected in the anatomy), `DzTable` `Shift`+`Enter`
(row withdrawn).

### 3.3 `R3` — the node must be able to be the element claimed

`PLATFORM_ACTIVATION_TOKEN` is split out of `PLATFORM_KEYS` and now **reads the dynamic
component's expression**. It admits a literal `<button>`, an expression that *names* an
activating tag, or an opaque identifier; it refuses an expression made only of string
literals none of which activates.

**Proof.** `the OLD predicate credited any dynamic component with <button> activation`
asserts the old `/<\s*component\s[^>]*\bis=/` matches `is="header ? 'th' : 'td'"`; `the
NEW predicate reads the expression` asserts the shipped token refuses that and accepts
`is="collapsible ? 'button' : 'div'"`, `is="computedTag"` and `<button type="button">`.

### 3.4 `R4` — a missed owner produces a *worse* owner, not no owner

`HANDLER_TOKEN` is case-insensitive **and boundary-free on the bare word**.
`useDataGridHeader.ts` spells it `handleHeaderKeyDown` at all six occurrences and never
lowercase, so `\bkeydown\b` failed twice over — on the capitals, and on a leading `\b`
that cannot hold inside an identifier. Erring loose is the safe direction here: `handles`
only *admits* a file to routes 1–4, and the file still has to name the key.

**Proof.** `the OLD handler token could not see handleHeaderKeyDown` asserts
`/\bkeydown\b/` and `/\bkeydown\b/i` both fail on it; `the NEW one does, and the real
owner is cited` asserts the shipped token matches **and** that every `DzDataGrid`
`when: 'header'` row in the live report is `backed` with `useDataGridHeader` in its
citation. **3 rows repaired**, from `Checkbox/CheckboxRoot.js:122` and
`Select/utils.js:10` to `useDataGridHeader.ts:110`.

### 3.5 `R5` — a part-scoped row is about the part it names

`when` was honoured by the `platform` route alone, so routes 1–4 — asked first, and
file-wide — satisfied a scoped row with any handler anywhere in the component. A scoped
row now admits the handler routes only if **the part's own subtree binds a keyboard
handler**. `subtreeOf` is a region test, not an opening-tag test, because a declared part
often is a region: `DzDataGrid`'s sort rows are scoped to `header`, which is the
`<thead>` at `DzDataGridHeader.vue:81`, while the `@keydown` is on the `<th>` at `:112`
inside it. A part this walk never sees is left alone — that case is `undetermined`
further down and must not be turned into `unbacked` here.

**Proof.** Two cases: the `<thead>` whose subtree contains the `@keydown` still admits
the handler routes; a self-closing `<button data-part="action" @click>` does **not** pick
up a `@keydown` on a following sibling.

**Measured effect: 2 rows repaired.** `DzSearchInput` `Enter` (clear) moved from the
submit handler to the clear `<button>` at `:259`; `DzTransfer` `Enter` moved from an
option's binding to the node carrying the `action` part at `:410`.

### 3.6 The ledger — the residue, recorded as data and enforced

`packages/tooling/src/validators/anatomy-keyboard-rejected-citations.json`, consumed
through the `RejectedCitation` interface. 25 entries covering 22 rows.

A checker can be made to prove that a citation is **code rather than prose**, that it
**reads the modifier the row declares**, that an element **can be** the element claimed,
and that the real owner's file is **not skipped**. It cannot be made to prove that the
behaviour at a real, correctly-bound handler is the behaviour a sentence describes.
RESIDUAL-05 drew the same line — *"an import proves the component is loaded, not that
the spec asserts anything about it. An import is the floor."* So the remaining 22
judgements are recorded, each with the evidence a reader has to be able to check, and
enforced.

Three properties make a denylist the right shape here rather than a smell:

1. **It can only lower the count.** A rejected citation is *skipped* and the walk keeps
   going — to the next line of the same file (hence `keyLinesIn`, which records every
   line a key is named on, not just the first), then to the next route. The row lands on
   a better owner or on none.
2. **It ratchets like a ceiling**, and the file says so: an entry may be **added** by any
   audit; an entry may be **removed** only when the row is re-cited to a site that is not
   the rejected one, or the row is withdrawn. *Deleting an entry to recover a `backed`
   count is the same act as raising a ceiling.*
3. **It is keyed on the row, not the file** — exactly, `when` and `modifiers` included.
   `DzSearchInput.vue:168` really is the `Enter` that submits and is not the `Enter` that
   clears, and those two rows differ only in `when`.

Two widenings were needed because a narrower entry only moved the citation:
`<file>:*` (every line of a file — `optionsStateFocus.ts` names `'ArrowUp'` twice inside
the same retry handler) and `<prefix>**` (every citation under a prefix — rejecting
`RovingFocus` for `DzDataGrid` handed the row `Select`, because the truth is that **no**
primitive owns it).

**Proof.** `no backed row is cited to a site the ledger rejects for it` recomputes the
match independently of the validator over the live report and asserts it is empty; `every
ledger entry carries the reason a reader has to be able to check` asserts shape; `records
every line a key is named on` pins the `DzOrderList` two-space case.

---

## 4. The true count after tightening — and the gate is RED

**`yarn validate:anatomy-keyboard` exits 1.** Deliberately, and it should stay that way
until the owner decides §6.

| | Baseline `4e4e46f` | Now | Δ |
|---|---:|---:|---:|
| rows | 404 | **401** | −3 (`DzTable`'s withdrawn rows) |
| **`backed`** | 404 | **385** | **−19** |
| **`unbacked`** (ceiling **0**) | 0 | **9** | **+9 — over** |
| **`undetermined`** (ceiling **0**) | 0 | **7** | **+7 — over** |
| `undeclaredHandlers` (ceiling 0) | 0 | **0** | unmoved |
| by route | own 153 · part 13 · renders 8 · composable 7 · primitive 156 · platform 61 · spec 6 | own 137 · part 13 · renders 8 · composable 10 · primitive 151 · platform 60 · spec 6 | |

**Neither ceiling was raised. `anatomy-keyboard-ceilings.json` was not opened for writing
by this packet**, and its three values re-read as they were at entry (`maxUnbackedDeclarations: 0`, `maxUndeterminedDeclarations: 0`,
`maxUndeclaredHandlers: 0`), and the ceilings file's own comment — *"a declared key is
either implemented or it is not a contract"* — is the reason. `unbacked 9 (baseline 0,
+9)` and `undetermined 7 (baseline 0, +7)` is the measurement; §6 is the decision.

> One thing in that file is now stale and was **deliberately left alone**: both `$comment`
> blocks say the count has been *"**ZERO since RESIDUAL-13**"*. That was true when it was
> written and the *values* are still `0`, which is what the ratchet is. Rewriting the prose
> would mean touching the ceilings file, and the next hand on it should be the owner's,
> carrying whichever of §6's decisions they take. Named here so it is not discovered.

### 4.1 The 9 `unbacked` rows, named

| Component | Key | Action the published table states | Why nothing backs it |
|---|---|---|---|
| `DzDataGrid` | `ArrowLeft` | Move focus one cell to the inline start. | **`D-RES14-1`.** No file in the `DzDataGrid` family handles an arrow, sets a roving `tabindex` or imports `reka-ui`. Its only key handling is the header's sort and the filter popover's `Escape` |
| `DzDataGrid` | `ArrowRight` | …to the inline end. | ” |
| `DzDataGrid` | `ArrowUp` | Move focus one row up. | ” |
| `DzDataGrid` | `ArrowDown` | Move focus one row down. | ” |
| `DzDataGrid` | `Home` | Move focus to the first cell of the row. | ” |
| `DzDataGrid` | `End` | Move focus to the last cell of the row. | ” |
| `DzCalendar` | `Shift`+`PageUp` | Move to the previous year. | **`D-RES14-3`.** `shiftKey` appears nowhere in `DzCalendar.vue` and neither does any year arithmetic |
| `DzCalendar` | `Shift`+`PageDown` | Move to the next year. | ” |
| `DzSplitButton` | `ArrowDown` *(trigger)* | Open the menu and focus its first item. | **`D-RES14-4`.** `DzSplitButtonMenu.vue` is a `<div>` and a bare `<button aria-haspopup>` inside a slot fallback. No `reka-ui`, no key handling, no menu — the menu is the consumer's |

### 4.2 The 7 `undetermined` rows, named

Every one is *the same shape*, and it is the shape `undetermined` exists for: the
component is a wrapper plus a `<slot />`, so the node that receives the key is the
consumer's. They were `backed` only because the closure was built from docblock
`@example` markup (§3.1).

| Component | Key | Action |
|---|---|---|
| `DzCheckboxGroup` | `Tab` | Move to the next checkbox; each box in the group is its own tab stop. |
| `DzRadioGroup` | `Tab` | Move out of the group; the group is one tab stop. |
| `DzStepper` | `Tab` | Move to the next navigable step; each step is its own tab stop. |
| `DzToolbar` | `Tab` | Move out of the toolbar; the toolbar is one tab stop. |
| `DzInfiniteScroll` | `Tab` | Move to the next focusable element inside the loaded items; the feed adds no keys of its own. |
| `DzSplitButton` | `Escape` *(menu open)* | Close the menu and return focus to the trigger. |
| `DzTransfer` | `<character>` | Move focus to the next option whose label starts with that character. |

**Six of the seven have a resolution route the validator already provides and no owner
decision is needed for it**: the `spec` route (RESIDUAL-13's seventh), which credits a
row that is undetermined for a `<slot />` reason when the component's spec asserts the
key through `expectKeyboardContract`'s `handled` or `platform` list. RESIDUAL-13 §10 item
3 had already scheduled exactly this for `DzTour` and `DzCheckboxGroup` — *"a test that
Tab is not consumed, which is a real claim about a component that must not trap focus"*.
It is a test per row and it was not squeezed into this packet. `DzTransfer`'s
`<character>` is the seventh and is **not** of that kind: it is `D-RES14-2`, a behaviour
that does not exist.

---

## 5. Rows corrected instead — five, in four anatomies

Where the citation was wrong because the **row** was wrong, the row was corrected, with
the measurement and the rejected alternative in the anatomy's own comment — the
convention RESIDUAL-13 used for `DzCarousel`'s `control` part and `DzColorPicker`'s six
withdrawn slider rows.

| Anatomy | Change | Evidence recorded in the comment |
|---|---|---|
| `DzTable.anatomy.ts` | **3 rows withdrawn** — `Enter`, `Space`, `Shift`+`Enter` scoped to a sortable header | `DzTable.types.ts:41` assigns column sorting to `DzDataGrid`; `sortable` appears nowhere in the `DzTable` family; `useDataGridHeader` — which the old comment credited — is imported only by `DzDataGridHeader.vue`. **Rejected alternative:** keep the rows and implement sorting, which contradicts the `DzTable`/`DzDataGrid` split this component already publishes, and `DzDataGrid` carries the same three rows correctly |
| `DzOrderList.anatomy.ts` | **3 rows re-described** — `Space` grabs and drops (it was "select"); the two `Alt`+arrow rows become plain arrows `when: 'grabbed'` | `case ' ': case 'Spacebar': toggleGrab(index)` at `:501`; `Enter` at `:506` is what selects; `altKey` is read once in the file, inside `typeAhead`, where it rejects the key. **Rejected alternative:** implement `Alt`+arrow as declared, which doubles the surface to document and test in order to make a mis-transcribed sentence true |
| `DzTimePicker.anatomy.ts` | `Enter` re-scoped to the `item` part | Unscoped, it was satisfied by the popover **trigger**, whose `Enter` *opens* the list; the node is the option `<button>` at `:636`. RESIDUAL-12 had already written the split down |
| `DzSplitButton.anatomy.ts` | `Enter` and `Space` re-scoped from `root` to `action` | `root` is the `role="group"` wrapper and activates on nothing; the primary action is `<button data-part="action">` at `DzSplitButtonAction.vue:59` |
| `DzTransfer.anatomy.ts` | `Enter` re-scoped from the free text `'transfer action'` to the declared part `action` | Free text leaves a row unscoped, and unscoped it was satisfied by an option's own `enter.prevent` binding in a pane |

No behaviour changed in any of the five. Every one is a published keyboard table, so a
changeset is owed and filed:
`.changeset/five-keyboard-tables-now-describe-what-the-components-do.md`.
`yarn validate:anatomy-parts` still reads 626 emissions, 0/0 undeclared, 0/0
declared-but-unemitted, and `packages/tooling/src/quality/keyboard-contract.spec.ts` —
which checks `when` against the declared part/state vocabulary and refuses a duplicate
key+modifier+context row — passes on all five.

---

## 6. Owner decisions raised — four, and the gate stays red until they land

Raised rather than decided, because each one is a choice between **building an
accessibility behaviour** and **withdrawing a published promise**, which is the shape
RESIDUAL-13 gave `D-RES13-1` for `DzColorPicker`. None of them is an invitation to raise
a ceiling: the ceiling is right and the tree is wrong.

### `D-RES14-1` — `DzDataGrid` publishes a grid it does not navigate *(6 rows)*

`role="grid"` at `DzDataGrid.vue:179`, `role="gridcell"` twice in `DzDataGridBody.vue`,
and **no cell navigation anywhere in the family**: no arrow handling, no roving
`tabindex`, no `reka-ui` import. The six declared `apg: 'grid'` rows are a WCAG 2.1.1
claim with nothing behind them, on the component `DzTable.types.ts` points buyers at for
"advanced features".

- **(a) Implement two-dimensional cell navigation.** The honest fix and real work: a
  roving `tabindex` over `role="gridcell"` nodes, arrows on both axes (inline-mirrored,
  per this anatomy's `rtl.keyboard: 'swap-horizontal'`), Home/End per row, and a decision
  about whether the header row participates. A day, plus tests, plus a changeset that
  changes the tab order of a published grid.
- **(b) Withdraw the six rows** and keep `role="grid"`. Cheap, and it makes the
  documentation honest — but it leaves a grid that announces a grid pattern to a screen
  reader and does not implement it, which is arguably worse than an untrue docs table.
- **(c) Withdraw the rows *and* the grid roles**, making it a table that happens to be
  featured. Consistent, and a published ARIA change.

**Not decidable by an agent**: (b) and (c) both remove something a consumer may rely on,
and (a) changes a published tab order. The rows stay `unbacked` and the gate stays red
until this is answered.

### `D-RES14-2` — `DzTransfer` declares listbox type-ahead it has never had *(1 row)*

*"Move focus to the next option whose label starts with that character"*, `apg: 'listbox'`,
backed until now by the pane's `searchable` text `<input>` — a field that **filters**.
`onPaneKeydown` handles `ArrowDown`/`ArrowUp`/`Home`/`End` and nothing else.

RESIDUAL-13 fixed this exact shape on `DzOrderList` (whose `<character>` row *"declared
APG listbox type-ahead that did not exist anywhere"*) by giving it a `typeAhead` that
reads each rendered row's own text. That function is **local to `DzOrderList.vue`** and
not shared.

- **(a) Implement type-ahead on the pane**, modelled on `DzOrderList.vue:454`, reading
  each option's rendered label so it matches what a screen reader announces. ~20 lines
  plus tests. Worth considering whether the two should become one shared helper, which
  is a second decision (`packages/core/src/utilities/keyboardTargets.ts` is the precedent
  for a deliberately non-public one).
- **(b) Withdraw the row.** APG's listbox pattern lists type-ahead as recommended rather
  than required, and the panes are searchable, which is a different and arguably better
  affordance.

### `D-RES14-3` — `DzCalendar` declares `Shift`+page-key year paging *(2 rows)*

Four lines of work — `event.shiftKey ? cur.subtract({ years: 1 }) : cur.subtract({ months: 1 })`
— against an APG date-grid behaviour the component's own table already promises.
**(a) implement it** or **(b) withdraw the two rows**. Recommended: (a). It is listed
here rather than done because it changes the keyboard of a published calendar, which is
a changeset and an owner's call, not a citation repair.

### `D-RES14-4` — `DzSplitButton`'s menu is the consumer's *(1 unbacked + 1 undetermined)*

`DzSplitButtonMenu.vue` is a `<div>` and a bare `<button data-part="trigger"
aria-haspopup="true">` inside a `<slot>` fallback, with no `reka-ui` import and no key
handling. So `ArrowDown` *(trigger)* → *"open the menu and focus its first item"* is
false, and `Escape` *(menu open)* → *"close the menu and return focus to the trigger"* is
the consumer's menu's business.

- **(a) Implement the menu-button contract** — `ArrowDown`/`ArrowUp` open and focus the
  first/last item, `Escape` closes and restores focus — which means this component owning
  a menu rather than slotting one.
- **(b) Withdraw `ArrowDown` and re-state `Escape` as a contract the consumer's menu
  satisfies**, which the `spec` route can then evidence.
- **(c) Document both rows as requirements *on the slotted menu*.** There is no column
  for that today; `conditions` in `expectKeyboardContract` is the nearest thing and it
  admits a prop, not a slot.

### Not raised, because they need a test rather than a decision

The other six `undetermined` rows (`DzCheckboxGroup`, `DzRadioGroup`, `DzStepper`,
`DzToolbar`, `DzInfiniteScroll` `Tab`, and `DzSplitButton` `Escape` under (b) above) are
settled by the `spec` route: one `expectKeyboardContract` call per component asserting
`Tab` in its `platform` list. RESIDUAL-13 §10 item 3 already scheduled two of them. That
is scheduled work, not an owner judgement, and it would take `undetermined` to 1.

---

## 7. Validation — every exit code read from a log file

Commands as run, from the repository root, `yarn` (4.16.0) or the module path. No `npx`.
Every redirect is an absolute path in the session scratchpad; no result was read through
a pipe.

| Command | Exit | Log | Verdict |
|---|---:|---|---|
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-keyboard.ts --json` *(entry)* | **0** | `kb-baseline.json` | 404/404 backed — the state this packet audited |
| `yarn regenerate:all` | **0** | `regen.log` | 7 of 7 steps; `nav.json` artifact sha256 `edf58a56a711…` |
| `node node_modules/eslint/bin/eslint.js` *(8 changed files)* | **0** | `lint-focused.log` | clean; every finding fixed **by hand** |
| `yarn typecheck` | **0** | `tc.log` | — |
| `yarn typecheck:tooling` | **0** | `tct.log` | — the gate `vue-tsc -p tsconfig.json` does not cover |
| **`yarn validate:all`** | **1** | `validate-all2.log` | **52 `✓`, one `✗` link: `anatomy-keyboard`.** Every other link green, including `anatomy-parts` (626 emissions, 0/0 undeclared, 0/0 unemitted), `ownership-manifest` (1338 entries fresh), `component-meta` (fresh, 144 components), `capability-matrix` (fresh), `quality-tiers`, `llms`, `token-references`, `rtl`, `story-dod` |
| **`yarn test`** | **1** | `test1.log` | **578 files, 11,408 passed, 2 failed, 3 skipped, 1 todo.** The two failures are `anatomy-keyboard.spec.ts` › *"is at or under every checked-in ceiling"* and › *"closes both ratchets at zero, which is what RESIDUAL-13 was for"* |
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/anatomy-keyboard.spec.ts` | **1** | `spec2.log` | 52 tests, 50 pass — **all 21 new proof cases pass**; the same 2 ceiling failures |

### 7.1 Pre-existing vs new, separated

**New, and intended:** the two red gates above, and only those. `validate:all` went from
53 `✓` / zero `✗` to 52 `✓` / one `✗`; `yarn test` went from 0 failures to 2. Both are
the *same* fact — `unbacked 9` and `undetermined 7` over ceilings of 0 — reported by two
gates. **A red gate that tells the truth is the intended end state of this packet.**

**Pre-existing and untouched:** the `README.md links to ../../DESIGN.md` warning at
`validate-all2.log:274` (a warn, not a `✗`, and present before this packet). `D-RES13-2`
— `yarn test` intermittently exiting 1 on a green suite with a reporter-RPC
`onTaskUpdate` error — **did not occur**: the single `yarn test` run of this packet
reported two named failing tests with assertion messages, not a phantom exit, so there
was nothing to re-run and nothing to quote twice.

**The browser lane was not run.** Nothing in this packet renders differently: no
`.variants.ts`, token, class, template or script changed in any component. The five
edited files are `*.anatomy.ts` declarations, plus tooling and a ledger. A browser run
would have qualified nothing, and the standing instruction is to run it at most once and
only if genuinely needed. **No lane leaked and no process was killed** — no `kill`, no
`taskkill`, and nothing was matched by process name at any point.

### 7.2 Ratchets and artifacts — old → new

| | Baseline | Now |
|---|---|---|
| `maxUnbackedDeclarations` | 0 | **0 — unmoved, and now exceeded by 9** |
| `maxUndeterminedDeclarations` | 0 | **0 — unmoved, and now exceeded by 7** |
| `maxUndeclaredHandlers` | 0 | 0 — unmoved, and still met (0 drift) |
| Capability `present` / `stale` / `unrun` / `excepted` | 620 / 22 / 388 / 47 | **1662 cells over 144 components — 388 `unrun`, 22 `stale`, 47 `excepted`** (`regen.log` step 6, `validate:all` `capability-matrix: fresh`). No cell moved: this packet changed no evidence, only keyboard declarations |
| AT cells executed | 0 of 534 | **0 of 534 — frozen, unmoved** |
| `unclassified` | 29 | **29 — frozen, unmoved** (`ownership-manifest: 29/29`) |
| `maxWithoutAnatomy` | 41 | **41 — frozen, unmoved** (`ownership-manifest: 41/41`) |
| `maxProposedCitedFromCode` | 3 | **3 — frozen, unmoved** |
| locales ≥ 95 % | 1 | **1 — frozen, unmoved** |
| inline-style sites | 133 | **133 — frozen, unmoved** (81 static + 52 bound, `regen.log` step 7) |
| `validate:anatomy-parts` | 626 emissions, 0/0, 0/0 | **626 emissions, 0/0, 0/0 — unmoved** |
| Changesets | 57 *(briefed)*; **20 measured in the entry snapshot** | **21** (+1, `five-keyboard-tables-now-describe-what-the-components-do.md`) |

> The changeset count is recorded as measured rather than as briefed. `git status
> --porcelain` at entry contained **20** `?? .changeset/*.md` paths; the brief said 57.
> The difference is not this packet's — nothing here deleted a changeset — and is most
> likely a different counting basis (`.changeset/` holds 58 files in total, tracked ones
> included). Recorded rather than reconciled, because a number nobody measured is how a
> ratchet drifts.

---

## 8. Residue — every dirty path attributed

`git status --porcelain` at entry: **396** paths. At exit: **402** — measured, not estimated,
by diffing the two sorted listings. The difference is **exactly six paths, all additions**;
**nothing was removed and no status letter changed**. Four are anatomy files that were clean at
entry and are now ` M`, two are new files:

| Path | Why |
|---|---|
| `packages/core/src/components/data/DzTable.anatomy.ts` | **new dirty** — 3 rows withdrawn (§5) |
| `packages/core/src/components/data/DzOrderList.anatomy.ts` | **new dirty** — 3 rows re-described (§5) |
| `packages/core/src/components/forms/DzTransfer.anatomy.ts` | **new dirty** — `Enter` re-scoped to the `action` part (§5) |
| `packages/core/src/components/buttons/DzSplitButton.anatomy.ts` | **new dirty** — `Enter`/`Space` re-scoped to `action` (§5) |
| `packages/tooling/src/validators/anatomy-keyboard-rejected-citations.json` | **new file** — the ledger (§3.6) |
| `.changeset/five-keyboard-tables-now-describe-what-the-components-do.md` | **new file** — owed for five published keyboard tables |

Already dirty at entry and edited inside this packet, so the listing does not change:

| Path | Why |
|---|---|
| `packages/tooling/src/validators/anatomy-keyboard.ts` | the five tightenings, `keyLinesIn`, `subtreeOf`, `enclosingBlockAt`, `readsModifiersAt`, `stripCommentsForScan`, `PLATFORM_ACTIVATION_TOKEN`, the ledger reader |
| `packages/tooling/src/validators/anatomy-keyboard.spec.ts` | 21 new proof cases in six describe blocks |
| `packages/tooling/src/quality/spec-component-refs.ts` | `stripComments` gains a `preserveLines` option; default behaviour unchanged, so the three artifacts derived from it are unaffected (`capability-matrix: fresh`) |
| `packages/core/src/components/forms/DzTimePicker.anatomy.ts` | `Enter` re-scoped to the `item` part (§5) — already ` M` at entry, so it is not one of the six |
| the `regenerate:all` outputs | `component-ownership.manifest.json`, `component-meta.json`, `capability-matrix.json`, `quality-matrix.json`, `llms.txt`/`llms-full.txt`, `apps/docs/**`, `nav.json`, `inline-style-inventory.json` — all already dirty, all refreshed by the sanctioned 7-step chain |

**Nothing temporary was left behind.** One scratch directory was created inside the
repository — `packages/tooling/src/validators/__probe/`, two throwaway `tsx` probes used
to measure whether comment-stripping the `reka-ui` dist changed the keys it names (it
does not: keys and line counts identical for `RovingFocusItem.js`,
`DismissableLayer.js` and `useArrowNavigation.js`). It was **removed** before any gate
ran, and `git status` confirms no path under it survives. Everything else lived in the
session scratchpad.

**No file was restored with `git checkout` or `git restore`, and no scripted bulk
replacement was run over a source file.** The five anatomy corrections and the validator
changes were made as targeted edits; the three mechanical touch-ups (the ledger's widened
citations, the six describe titles, two jsdoc rewordings) were exact-string Python
replacements with an `assert` on the needle, which fails rather than writing when the
needle is absent. Nothing was committed.

---

## 9. Not done, and named rather than left to be discovered

- **The 22 ledger entries are judgements, not proofs.** They are as good as the
  reasoning written beside each one, and that is the honest ceiling of this approach.
  The only thing that retires an entry is re-citing the row to something better.
- **`DzDataView`'s `Tab` row now cites its own `<select data-part="control">` at
  `:286`**, which is a real, focusable layout control and does back *"move between the
  layout controls and the rendered items"* — but the *items* half is still the
  consumer's, and the `spec` route is where that belongs.
- **The `I` sub-count (6 rows) was not repaired.** `DzPagination`'s three rows cite
  `PaginationFirst` for *"go to the focused page"* — the right class of node, a cousin of
  the numbered page button. `DzTagsInput`'s `Enter` cites the `delimiters` prop default.
  `DzPersonaSelector`'s `<character>` cites `ListboxRoot.js:6`, an `import { useTypeahead }`
  line. `DzColorPicker`'s `Tab` cites `FocusScope`, which backs "Tab moves within the
  panel" but not the row's *order* clause. None is a false green and none was ejected.
- **The weakest platform route is still the weakest.** A text `<input>` credits
  `<character>` and `<digit>`, and `PLATFORM_KEYS` says so in its own comment. `DzMention`
  is the case that keeps it: the component detects its trigger character by watching the
  model, not by comparing a key, so refusing the route would report a contract it does
  implement as unimplemented. Tightening it needs a way to distinguish a search field
  from type-ahead, which is a per-component fact.
- **`renderFunctionNodesIn` still only reads a string-literal tag**, by design
  (RESIDUAL-13), so a row behind `h(SomeComponent, …)` stays `undetermined`.
- **Nothing was done about the 41 components with no anatomy** (`maxWithoutAnatomy`,
  frozen). Every one is a component whose keyboard contract this gate cannot check at
  all, and it has been unmoved for several batches.
- **RESIDUAL-11 §9.3's `DzSelect` placeholder-colour item is untouched**, as instructed.
  Nothing here moves a painted pixel.
- Still open and untouched: register #2 / `D127` the commit · `D-RES13-1`
  (`DzColorPicker`'s 2-D HSV slider) · `F12` (axe's `incomplete` bucket) · `F13`
  (`DzChip`/`DzTag`'s untranslated `"Remove "`) · the nine short `keyboard-spec` cells ·
  `D112` · `D-S1O4-1` / `D-S1O4-3` · the Playwright-matrix CI job · the linux visual
  accept pass · RESIDUAL-10 §7.3's single `ciGate` derivation · `D-RES09-1` ·
  `D-RES07-1` · `D-RES06-2` · `D-RES04-2` · `D91` · ADR-18/19/20 acceptance.

---

## 10. Ranked next packet

1. **`D-RES14-1` — decide `DzDataGrid`.** Six rows, the largest false green this audit
   found, and the gate cannot go green without it. Ten minutes of owner judgement, then
   either a day of work or a three-line withdrawal.
2. **Register #2 / `D127` — commit the 402-path worktree.** Unchanged as the single act
   that unblocks the most, and now 21 measured changesets sit behind it.
3. **Close the six `Tab`-shaped `undetermined` rows with one `expectKeyboardContract`
   call each.** No decision needed, six small tests, and it takes `undetermined` 7 → 1.
   RESIDUAL-13 §10 item 3 already scheduled two of them.
4. **`D-RES14-3` — `DzCalendar`'s year paging.** Four lines and a changeset, and the
   recommendation is to implement.
5. **`D-RES14-2` and `D-RES14-4`.** Both are "build it or withdraw it", both costed
   above, and `D-RES14-2` should be decided together with whether `typeAhead` becomes a
   shared helper.
6. **Audit the *other* artifacts that resolve a citation by scanning text.** This packet
   and RESIDUAL-05 have now found the same defect in two of them, six months apart, by
   accident both times. The question worth asking once, deliberately, is: which other
   gate credits a claim because a *file* mentions a *token*? `validate:adr-references`,
   `hardcoded-strings` and the `at-matrix` are the candidates, and all three publish.
7. **`maxWithoutAnatomy` 41.** Unmoved for several batches; 41 components whose keyboard
   contract nothing checks.
