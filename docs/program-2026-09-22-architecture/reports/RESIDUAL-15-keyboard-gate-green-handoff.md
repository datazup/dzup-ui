# RESIDUAL-15 — the keyboard gate back to green, by making its claims true

*Written incrementally, 2026-09-29. Repository: `ui/dzup-ui` (OSS, scope `@dzup-ui/*`).
HEAD `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`, 402 dirty paths at entry, uncommitted by
design.*

---

## 0. The item

RESIDUAL-14 audited the keyboard gate's own citations, found **52 of 220 (12.9 %)** naming a
real file for the wrong claim, repaired 20 structurally, corrected 5 rows — and **left the gate
RED with the true counts rather than raising a ceiling**:

| | Baseline `4e4e46f` | RESIDUAL-14 exit |
|---|---:|---:|
| rows | 404 | **401** |
| `backed` | 404 | **385** |
| `unbacked` (ceiling 0) | 0 | **9 — over** |
| `undetermined` (ceiling 0) | 0 | **7 — over** |

This packet closes that red **honestly**: every remaining row is made genuinely backed or
legitimately withdrawn, and only then do the ceilings return to being met.

**Entry measurement re-taken, not assumed.**
`node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-keyboard.ts --json`,
exit **1**:
`{"declarations":104,"explicitNone":19,"withBindings":85,"rows":401,"backed":385,"unbacked":9,"undetermined":7}`,
`byRoute` `own 137 · part 13 · renders 8 · composable 10 · primitive 151 · platform 60 · spec 6`.
Two violations, both named: `unbacked-declaration` (9 over 0) and `undetermined-declaration`
(7 over 0). The 16 rows are exactly the ones RESIDUAL-14 §4.1/§4.2 named — checked one by one,
not counted.

---

## 1. `D-RES14-1` — `DzDataGrid`: implemented, and why (a) rather than (b)

RESIDUAL-14 gave this one **no recommendation**, so the first thing done was to read the
component rather than the packet. Six `apg: 'grid'` cell rows, published since TASK-R5-O5,
against a family whose only keyboard handling was the header's sort and the filter popover's
`Escape`. The audit's citation for all six was `reka-ui/dist/RovingFocus/utils.js`, reached
through the row-selection **checkbox**, with the gate's own `what` field printing
`CheckboxIndicator`.

### 1.1 What the component turned out to be

Five facts decided it, and every one of them is the opposite of the case where withdrawal is
right:

| | |
|---|---|
| **The cells are the component's own** | `DzDataGridBody.vue:113` renders `<td role="gridcell">` from a `v-for` over `ctx.columns`, plus one optional selection cell at `:99`. The only `<slot />` is **inside** a cell (`#cell`, `:121`) — never around one. Nothing about a cell is the consumer's |
| **The grid ARIA was already complete** | `role="grid"` (`DzDataGrid.vue:179`), `rowgroup` on `<thead>`/`<tbody>`, `row`, `columnheader`, `gridcell`. Nothing had to be restructured to make navigation announceable — the announcement was already there and the behaviour was not |
| **There is an exact address space** | the root renders a real `<table>`, so `HTMLTableElement.rows` / `row.cells` addresses every cell in document order: row 0 is the header `<tr>`, rows 1…n the body's, and **both render the same number of cells**. No parallel index to register, count or keep in step |
| **One context already reaches both halves** | `DZ_DATA_GRID_KEY` is provided by the root and injected by `DzDataGridHeader.vue:45` and `DzDataGridBody.vue:50`, so one focus state serves both without plumbing |
| **The mechanisms already exist here** | `DzToolbar.vue`'s `applyTabStop` roving `tabindex`, `useDzDirection()` for the inline mirror this anatomy's `rtl.keyboard: 'swap-horizontal'` declares, `DzCalendar.vue`'s direction-resolved arrow pair |

**Decision: (a), implement.** Withdrawal is the right answer for a grid whose cells a consumer
supplies; this is not one. Nothing needed restructuring — no template was reshaped, no prop,
emit, slot or part changed, and the new code is one composable plus six attributes across two
sub-parts. RESIDUAL-14's own words about (b) are the other half of the reason: it *"leaves a
grid that announces a grid pattern to a screen reader and does not implement it, which is
arguably worse than an untrue docs table"* — on the component `DzTable.types.ts:41` points
buyers at for advanced features.

### 1.2 What was built

`packages/core/src/composables/useDataGrid/useDataGridNavigation.ts` — new, a sibling of
`useDataGridSort.ts` / `useDataGridPagination.ts`, so no composable directory is added.

- Arrows on both axes, with the inline pair resolved through `useDzDirection()`: `ArrowRight`
  is the inline **end**, which is the next column in LTR and the previous one in RTL.
- `Home` / `End` to the first and last cell of the focused row.
- **`PageUp` / `PageDown` are two new declared rows**, ten rows at a time, clamping at the
  header row and the last row. Declared in the same change as the handler, which is what keeps
  `maxUndeclaredHandlers` at 0; `PAGE_ROWS`' docblock records why ten (the grid's own
  pagination default).
- **No wrapping** — the APG `grid` behaviour; a ring is `toolbar`/`menu`. Every key is consumed
  even at an edge, because all eight scroll a document by default.
- The **body** gets a roving `tabindex`: exactly one body cell is in the tab order and it
  follows the user, so the cells are reachable by keyboard at all, which they were not.
- The **header** participates in arrow navigation: a non-sortable `<th>` moves from no
  `tabindex` to `tabindex="-1"`, which adds **no** tab stop and makes it reachable by `ArrowUp`
  from the first body row.
- Navigation acts **only when the cell itself has focus** (`event.target !==
  event.currentTarget` returns), so the selection checkbox, the filter button, the popover's
  fields and any `#cell` control keep their own keys.
- `DzDataGridHeader.vue` gains `onHeaderCellKeydown`: sort first (it prevents `Enter`/`Space`
  only), then navigation, which names none of the sort keys — so the two cannot collide.

### 1.3 The rejected alternatives, recorded in the anatomy

Three are recorded in `DzDataGrid.anatomy.ts`'s keyboard comment and in the composable's module
docblock: **(b)** withdraw the six rows, **(c)** withdraw the rows *and* `role="grid"`, and —
inside (a) — **the strict single-tab-stop grid**, which is the one a reader is most likely to
ask about. That last is the letter of the pattern (one tab stop, Enter or F2 to enter a cell's
widget) and it was rejected because it **removes** things: the per-column header tab stops that
`DzDataGrid.contract.spec.ts:136`, `:158` and `DzDataGrid.spec.ts:146` assert and a keyboard
user already has, every consumer's `#cell` control from the tab order, and it adds a modal
cell-entry idiom nothing else in this library uses — in exchange for conformance with a part of
the pattern **no declared row states**, since this anatomy declares no `Tab` row at all. What
the six rows claim is arrow, Home and End movement between cells. That is what is implemented,
and the net tab-order change is **one stop added**, not N removed.

---

## 2. The other three decisions

### `D-RES14-3` — `DzCalendar` year paging: **implemented** (2 rows)

RESIDUAL-14 recommended it and it is four lines. `onGridKeydown`'s two page arms now read
`event.shiftKey ? cur.subtract({ years: 1 }) : cur.subtract({ months: 1 })` and the mirror.
`setFocused` already moves the visible month from the focused date, so the panel follows with
no extra plumbing (ADR-13's `@internationalized/date` clamps the day for the target month).
Both rows cite the same switch arm, which genuinely implements both under the ternary, and
RESIDUAL-14's `R2` is satisfied because `shiftKey` is inside the innermost block containing the
citing line.

### `D-RES14-2` — `DzTransfer` type-ahead: **implemented** (1 row)

Decided from the code, and the code said build it. `onPaneKeydown` already enumerates the
pane's options as DOM elements (`[role="option"]:not([data-disabled])`) and already resolves the
focused one through `focusedIndexIn`, so type-ahead is a `default:` arm and one short function —
the `DzOrderList.vue:454` shape RESIDUAL-13 established for the identical row. Withdrawing would
have left two sibling listboxes in one library with different contracts for the same pattern,
and the panes hold hundreds of items where a keystroke jump is the affordance a keyboard user
expects.

Three specifics, each with a test: the label is read from the **rendered** option's
`textContent`, so it matches what a screen reader announces and keeps working when a consumer
fills `#item`; the search starts **after** the focused option and wraps, so repeating a
character cycles; and `ownsItsOwnCaret(event.target)` guards a field a consumer put inside an
option. The pane's `searchable` `<input>` is a **sibling** of the `role="listbox"` that carries
the handler, not a descendant, so it never reaches the type-ahead at all.

**The shared-helper question RESIDUAL-14 raised is answered "no", and measurably so.**
`keysNamedIn` reads both `/typeahead/i` and `event.key.length === 1` as the `<character>`
placeholder, so a shared `typeAhead` would hand every importer credit for listbox type-ahead
through routes 1–4 — precisely the failure `utilities/keyboardTargets.ts`'s docblock refuses
(*"a shared helper that named the keys would hand every importer credit for every key in it"*).
Two short functions readable beside their own `switch` are the cheaper mistake. Recorded in the
function's docblock.

### `D-RES14-4` — `DzSplitButton`: **withdrawn** (1 unbacked + 1 undetermined), with evidence

`DzSplitButtonMenu.vue` is a `<div class="relative">` containing a `<slot>` whose fallback is a
bare `<button data-part="trigger" type="button" aria-haspopup="true">` at `:55`. No `open` ref,
no context field for menu state, no `reka-ui` import, no `keydown` in either file. Both
`@example` blocks in the family (`DzSplitButton.vue:13`, `DzSplitButtonMenu.vue:10`) show the
menu **composed into the slot** — and RESIDUAL-14 §2.3 found that those very examples were what
had been crediting the rows.

The deciding fact: **`DzDropdownMenu` already publishes and implements both rows.**
`DzDropdownMenu.anatomy.ts:96` declares `Escape` → *"Close the menu and return focus to the
trigger."* — the identical sentence — backed through `DismissableLayer`; `:66` declares
`ArrowDown`, and `DzDropdownMenuTrigger.vue` wraps Reka's `DropdownMenuTrigger`. This is
RESIDUAL-14 §5's own `DzTable` → `DzDataGrid` move: a row belongs to the component that
implements it, and a second copy on a wrapper is a promise the wrapper cannot keep.

**A third row was corrected in the same pass, and it was not on the work list.** `Enter`
*(trigger)* read `backed` because the platform route reaches a real `<button>` — but its action
text said *"open the menu and focus its first item"*, which that citation does not show. By
RESIDUAL-14's own tightened rule that is a latent `W` the census let through. It is re-described
to *"Activate the disclosure; the menu composed into its slot is what opens."* and its `apg`
drops from `menu-button` to `button`. **No markup changed.**

Rejected alternatives recorded in `DzSplitButton.anatomy.ts`: **(a)** implement the menu-button
contract here, which means this component owning a menu rather than slotting one and changes
what the slot *means* from "your menu" to "your items" — a breaking change to the published API
of both examples, and a second implementation of `DzDropdownMenu` inside a button family;
**(c)** document both rows as requirements *on the slotted menu*, for which there is no column,
`conditions` admitting a prop name rather than a slot.

---

## 3. The seven `undetermined` rows — and RESIDUAL-14's "mechanical" fix does not work

RESIDUAL-14 §6 called six of the seven *"scheduled work, not an owner judgement"*: one
`expectKeyboardContract` call each, *"asserting `Tab` in its `platform` list"*. **Measured, that
call throws.** `PLATFORM_OWNERS` in `@dzup-ui/testing`'s `keyboard.ts` has no entry for `Tab`
and says why in its own docblock — *"activation and text entry only, **never navigation**"* —
so the check reports *"the rendered tree contains no element whose documented HTML behaviour is
that key"*. The refusal is **correct and was kept**: `Tab` is not a behaviour of an element, it
is the document's focus order, and a `Tab` entry in that table would credit any focusable node
for any `Tab` row.

Worse, a single key list could not tell the five rows apart, because they make **opposite**
claims:

| Row | Claim | Mechanism |
|---|---|---|
| `DzCheckboxGroup` | each box is its own tab stop | every node in the order |
| `DzStepper` | each navigable step is its own tab stop | every node in the order |
| `DzInfiniteScroll` | the feed adds no keys; the items' own order stands | every node in the order |
| `DzRadioGroup` | the group is **one** tab stop | a roving `tabindex` |
| `DzToolbar` | the toolbar is **one** tab stop | a roving `tabindex` |

RESIDUAL-14 §2.2.4 caught exactly that inversion being published: `DzCheckboxGroup`'s "each box
is its own tab stop" cited `RovingFocusItem.js`, *"which is what makes a group **one** tab stop
— the citation asserts the opposite of the row"*.

**So the resolution was widened rather than the ceiling**, which is what the ceilings file's own
comment says makes `undetermined` fall: *"widening the resolution shows up as THIS number
falling rather than as `unbacked` rising"*.

`expectKeyboardContract` gains **`tabStops: { of, expect }`** (`@dzup-ui/testing`, a `minor`):
it names which shape the row claims, counts how many of the matched nodes are in the tab order,
and **drives the key** — a cancelable `Tab` keydown the component must not have consumed,
because every one of these sentences begins "move to"/"move out of". It refuses a set of fewer
than two nodes (a claim about order over one node is not a claim about anything, and the
component has to be mounted with the children a consumer would supply). `specAssertedKeys` in
the validator credits **`Tab` and only `Tab`** from it, anchored on the option's opening brace
so a sentence about it grants nothing.

**One measurement changed the implementation.** `DzRadioGroup` first read *"0 of 2 matched
node(s) are in the tab order"* — a correct implementation reported broken. Reka builds "one tab
stop" on the **root**: `RovingFocusGroup.js` renders
`tabindex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0` on the group and
`RovingFocusItem.js` renders `isCurrentTabStop ? 0 : -1` on each item, so at rest the measured
shape is `radiogroup=0 | radio=-1 | radio=-1`. `querySelectorAll` searches descendants only, so
the root is now counted when it matches the selector — the same way the `platform` check already
reads it. A second measurement is recorded in that spec: `focusableItemsCount` is `0` during the
root's first render because the items register in their own `onMounted`, so the **synchronous**
DOM reads `radiogroup=-1` and the group looks unreachable; the test awaits two ticks and says so.

**Six `expectKeyboardContract` sites added, five of them carrying `tabStops`:**

| Site | What it asserts |
|---|---|
| `DzCheckboxGroup.spec.ts:175` | `tabStops: { of: '[role="checkbox"]', expect: 'each' }`, added to the existing "every box its own tab stop" test |
| `DzRadioGroup.spec.ts:166` | `tabStops: { of: '[role="radiogroup"],[role="radio"]', expect: 'one' }` — new test |
| `DzStepper.spec.ts:268` | `tabStops: { of: '[role="button"]', expect: 'each' }` — new test and new import, `modelValue: 2` so all three steps are reachable |
| `DzToolbar.spec.ts:338` | `tabStops: { of: 'button', expect: 'one' }`, added to the existing contract test |
| `DzInfiniteScroll.spec.ts:172` | `tabStops: { of: '[data-part="content"] a[href]', expect: 'each' }` — new test and new import, plus a loop asserting the feed consumes none of the APG `feed` keys |
| `DzTransfer.spec.ts` | the existing call is unchanged; the `<character>` row is settled by implementation, not by this route |

The sixth and seventh rows were not of that kind and were not forced into it: `DzTransfer`
`<character>` is `D-RES14-2` (implemented, route `own`) and `DzSplitButton` `Escape` is
`D-RES14-4` (withdrawn). **Nothing was left unsettled** — the measured `undetermined` is **0**,
so there is no "genuinely cannot be settled" case to name.

**Two `DzStepper` tests, not one**, because "each step is its own tab stop" is a claim about
*navigable* steps: the second asserts that an `upcoming` step is not a `role="button"` and not
focusable at all, which is why the first needs `modelValue: 2` to be a claim over three nodes.

**One thing observed and deliberately not chased.** Both group specs slot **three** children and
only **two** render — `mountGroup()` in `DzRadioGroup.spec.ts` and `DzCheckboxGroup.spec.ts`
produce `labels=2 buttons=2 text="Option AOption B"`. It is pre-existing, the checked-in
`DzCheckboxGroup` test asserts `toHaveLength(2)` deliberately, and none of the assertions added
here depends on the count (the helper counts the nodes it finds). Named so it is not discovered
as this packet's doing; it is a `@vue/test-utils` array-slot question, not a keyboard one.

---

## 4. The ledger — one entry narrowed, none deleted

`packages/tooling/src/validators/anatomy-keyboard-rejected-citations.json` still holds **25
entries**. Nothing was removed.

- **`DzTransfer` `<character>` was `DzTransfer.vue:*`** — every line of the file, the widening
  RESIDUAL-14 needed because the only thing naming a printable character was the pane's search
  `<input>` and `templateNodesIn` printed a template-body offset for it. Once the pane has a
  real `typeAheadIndex`, that wildcard would have refused the **true** owner too. It is
  **narrowed** to the two lines the source and target search `<input>`s sit on (`:414`, `:530`),
  which still do not back the row. Narrowing is what the re-citation earns; deleting the entry
  is not, and the entry's own `why` now records both halves. Route `own` is asked before
  `platform`, so the entry is inert — which is the point: it is a guard against the citation
  coming back, not a subtraction.
- **`DzDataGrid`'s six `reka-ui/dist` entries were left in place**, although the ledger's rule
  would now permit removal. They remain true (no Reka primitive backs those rows and the family
  imports none), routes 1–4 are asked before route 5 so they cost nothing, and an inert entry is
  a ratchet against the regression. Their `why` text is now history rather than a live finding;
  that is recorded here rather than rewritten there.

---

## 5. The ceilings — never raised, and now met

**Nothing was lowered, because nothing had been raised.** RESIDUAL-14 left both values at `0`
and the gate red with the true measurement. What changed is the measurement.

| | Baseline `4e4e46f` | RESIDUAL-14 exit | Now |
|---|---:|---:|---:|
| rows | 404 | 401 | **401** |
| `backed` | 404 | 385 | **401** |
| **measured `unbacked`** | 0 | **9** | **0** |
| **measured `undetermined`** | 0 | **7** | **0** |
| `undeclaredHandlers` | 0 | 0 | **0** |
| `maxUnbackedDeclarations` (ceiling) | 0 | 0 | **0 — unmoved, and met** |
| `maxUndeterminedDeclarations` (ceiling) | 0 | 0 | **0 — unmoved, and met** |
| `maxUndeclaredHandlers` (ceiling) | 0 | 0 | **0 — unmoved, and met** |
| by route | — | own 137 · part 13 · renders 8 · composable 10 · primitive 151 · platform 60 · spec 6 | own 140 · part 13 · renders 8 · composable 18 · primitive 151 · platform 60 · spec 11 |

**The arithmetic, on 401 rows both times.** `unbacked` **9 → 0**: `DzDataGrid` −6 (implemented),
`DzCalendar` −2 (implemented), `DzSplitButton` −1 (withdrawn). `undetermined` **7 → 0**: five
`Tab` rows −5 (route `spec`, via `tabStops`), `DzTransfer` `<character>` −1 (implemented, route
`own`), `DzSplitButton` `Escape` −1 (withdrawn). Rows went 401 → 399 on the two `DzSplitButton`
withdrawals, then 399 → 401 on the two new `DzDataGrid` page rows — **the same total as
RESIDUAL-14's exit reached by a different route**, said here so the coincidence does not read as
"nothing changed".

The ceilings file's two `$comment` blocks — which RESIDUAL-14 deliberately left saying *"ZERO
since RESIDUAL-13"* and named as stale so it would not be discovered — now carry the RESIDUAL-14
finding and the RESIDUAL-15 closure, naming each row and each anatomy comment. **The three
values were not opened for writing**; they re-read `0`, `0`, `0`.

---

## 6. Proof — seeded breaks on component source

Three seeds, each on **implementation** and never on a test, each restored by byte copy and
verified with `sha256sum -c`. The failing tests were predicted before each run and matched
exactly: **1 / 2 / 2**.

| Seed | The break | Failed | Which, exactly |
|---|---|---:|---|
| **A** `composables/useDataGrid/useDataGridNavigation.ts` | the direction mirror removed — `inlineEnd`/`inlineStart` hard-coded to `ArrowRight`/`ArrowLeft` instead of resolving `dzDirection` | **1** of 53 | `dzDataGrid — APG grid cell navigation > mirrors the inline pair in a RTL document, which is what rtl: mirrored declares` |
| **B** `components/data/DzCalendar.vue` | `event.shiftKey ?` dropped from both page arms, so both keys move a month again | **2** of 25 | `dzCalendar — keyboard grid navigation > shift+PageUp moves focus back one year and emits panelChange` · `… > shift+PageDown moves focus forward one year, and the unmodified key still moves a month` |
| **C** `components/forms/DzTransfer.vue` | type-ahead match weakened from `label.startsWith(needle)` to `label.includes(needle)` | **2** of 34 | `dzTransfer — APG listbox navigation inside a pane > matches case-insensitively and skips a disabled option even when it is the only match` · `… > reads the label a consumer slotted, not the item, which is what a screen reader announces` |

**Restoration is hash-verified, not assumed.** The three pre-seed sha256 sums; all three
`sha256sum -c` → `OK`, exit 0, after restore:

```
a9f76e3b948ea12d3ee811de894f5934d9cfee26a4d0ba2ef774fcaa5e92bc6c  useDataGridNavigation.ts
b86b635161c8c40b69615aa41288d9710f5aee17061ae618dffdf6529959c662  DzCalendar.vue
9b1526a28342fa440a2f3bba10c71a6823ec4d177d3e7ca20e1cb1e8a6a042fd  DzTransfer.vue
```

Every newly-backed key has a spec that **drives the key and asserts the effect** — where focus
landed, which year the panel shows, which option the search found, how many nodes are in the tab
order — never that a handler exists. `press()` in the grid spec focuses the cell, dispatches a
cancelable event and returns it, so consumption and destination are separate assertions;
`attachTo: document.body` throughout, because `focus()` on a detached node leaves
`document.activeElement` at `<body>` and every assertion would pass for the wrong reason.

**Seven proof cases added to `anatomy-keyboard.spec.ts`** (52 → 59 tests) and **nine to
`packages/testing/src/keyboard.spec.ts`** (24 → 33). Two matter for this packet's own honesty:
*"the route RESIDUAL-14 scheduled could not have worked: `platform` credits no navigation key"*
reads the shipped `PLATFORM_OWNERS` table and asserts it names no `Tab` **and** still carries
the sentence that says why — so a later hand cannot quietly reverse the refusal; and *"refuses
'each' when a roving tabindex has taken the siblings OUT of the order"* is the inversion
RESIDUAL-14 found published, now failing on every run. The other widening cases assert that
`tabStops` credits **only** `Tab`, grants nothing for the word alone or for a sentence about it,
and needs the `expectKeyboardContract` call as well as the option.

---

## 7. Validation — every exit code read from a log file

Commands as run, from the repository root, `yarn` (4.16.0) or the module path. **No `npx`.**
Every redirect is an absolute path in the session scratchpad; no result was read through a pipe.

| Command | Exit | Log | Verdict |
|---|---:|---|---|
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-keyboard.ts --json` *(entry)* | **1** | `kb-entry.json` | 401 rows · 385 backed · **9 unbacked · 7 undetermined** — the red this packet was sent to close |
| *(same, exit measurement)* | **0** | `kb-mid3.json` | **401 rows · 401 backed · 0 unbacked · 0 undetermined · 0 reverse drift · `violations: []`** |
| `yarn regenerate:all` ×2 | **0**, **0** | `regen.log`, `regen2.log` | 7 of 7 steps each time. The second run is owed: a spec edit landed while the first `validate:all` was scanning, so the capability matrix and `nav.json` were refreshed again (`artifactSha256 7727ca0017fa…`) |
| `node node_modules/eslint/bin/eslint.js` *(22 changed files)* | **0** | `lint2.log` | clean. `lint1.log` had 3 findings — two `jsdoc/no-multi-asterisks` (a wrapped line beginning `*(trigger)*` / `*shape*`) and one `test/prefer-lowercase-title`. **All three fixed by hand**; `--fix` was never run |
| `yarn typecheck` | **0** | `tc.log` | — |
| `yarn typecheck:tooling` | **0** | `tct.log` | — the gate `vue-tsc -p tsconfig.json` does not cover |
| **`yarn validate:all`** | **0** | `validate-all.log` | **53 `✓`, ZERO `✗`** |
| **`yarn validate:all`** *(re-run on the settled tree — see §7.2)* | **0** | `validate-all2.log` | **53 `✓`, ZERO `✗`** — the exit state |
| **`yarn test`** | **0** | `test1.log` | **578 files, 11,451 passed, 3 skipped, 1 todo, ZERO failed** |
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/anatomy-keyboard.spec.ts` | **0** | `valspec2.log` | **59 tests, all pass** — including the two RESIDUAL-14 left red (*"is at or under every checked-in ceiling"* and *"closes both ratchets at zero…"*), neither of which was edited |
| `… packages/testing/src/keyboard.spec.ts` | **0** | `kbspec1.log` | 33 tests, all pass |

`anatomy-keyboard`'s line in `validate:all`, quoted rather than paraphrased:

```
✓ anatomy-keyboard: 401 declared bindings across 85 components (104 anatomy declarations,
  19 declare keyboard: 'none'); 401 backed, 0/0 unbacked, 0/0 undetermined
  owners: own 140 · compound part 13 · renders 8 · composable 18 · Reka primitive 151
          · platform 60 · runtime spec 11
  reverse drift: 0/0 key(s) handled but not declared
```

### 7.1 Pre-existing vs new, separated

**New: nothing red.** `validate:all` went from **52 `✓` / one `✗`** to **53 `✓` / zero `✗`**;
`yarn test` from **2 failed** to **0**. Both are the same fact — the two ceilings are met — read
by two gates. The two failing tests were *not* edited: they assert
`totals.unbacked <= ceilings.maxUnbackedDeclarations` and `totals.unbacked === 0`, and they pass
because the totals moved.

**Pre-existing and untouched:**

- the `warn: README.md links to ../../DESIGN.md, which is outside the package` warning — a warn,
  not a `✗`, and present before this packet;
- `STALE @dzup-ui/core: dist (…) predates packages/core/src/components/forms/DzTransfer.vue` and
  the same for `@dzup-ui/testing`, inside `validate:published-imports`. This is the normal shape
  in an uncommitted tree — `dist/` is generated and never committed (ADR-12), so any source edit
  makes it older than its source. The link itself still reads **`validate:published-imports
  PASSED`**, 32 entries verified. Named because it is new *text* this packet caused, and it is
  not a new *failure*.

**`D-RES13-2` did not occur.** The single `yarn test` run printed a clean summary and exited 0,
so there was no phantom exit to chase and nothing to quote twice.

### 7.2 Why `validate:all` was run twice

The first run is the authoritative green above. It scanned while two things were still moving:
two regression tests were added to `DzDataGrid.spec.ts` (`Space` cycles the sort, `Escape` closes
the filter popover — coverage owed because this packet **rewired** that `<th>`'s `@keydown` from a
conditional `handleHeaderKeyDown` into `onHeaderCellKeydown`), and `regenerate:all` was then owed
again. The second run is over the settled tree and **is the exit state: exit 0, 53 `✓`, zero
`✗`**, with `anatomy-keyboard` reading the same 401/401 line quoted above. Both runs are recorded
rather than only the later one, because a number nobody read is how a ratchet drifts.

### 7.3 Ratchets and artifacts — old → new

| | Entry | Exit |
|---|---|---|
| `maxUnbackedDeclarations` | 0, **exceeded by 9** | **0 — unmoved, and met** |
| `maxUndeterminedDeclarations` | 0, **exceeded by 7** | **0 — unmoved, and met** |
| `maxUndeclaredHandlers` | 0, met | **0 — unmoved, and met** |
| keyboard rows / `backed` | 401 / 385 | **401 / 401** |
| Capability `pass` / `fail` | 585 / 0 | **585 / 0 — unmoved** |
| Capability `present` / `unrun` | 620 / 388 | **623 / 385** — three `keyboard-spec` cells moved `unrun` → `present`: `DzTransfer` (all 8 bindings now exercised), `DzInfiniteScroll` (its one `Tab` row), `DzDataGrid` (all 12) |
| Capability `stale` / `excepted` | 22 / 47 | **22 / 47 — frozen, unmoved** |
| AT cells executed | 0 of 534 | **0 of 534 — frozen, unmoved** |
| `unclassified` | 29 | **29 — frozen** (`ownership-manifest: 29/29`) |
| `maxWithoutAnatomy` | 41 | **41 — frozen** (`ownership-manifest: 41/41`) |
| `maxProposedCitedFromCode` | 3 | **3 — frozen** |
| locales ≥ 95 % | 1 | **1 — frozen** |
| inline-style sites | 133 | **133 — frozen** (81 static + 52 bound, `regen2.log` step 7) |
| `validate:anatomy-parts` | 626 emissions, 0/0, 0/0 | **626, 0/0, 0/0 — unmoved** |
| Ownership manifest entries | 1338 | **1341** — the three symbols the new composable exports (`useDataGridNavigation`, `UseDataGridNavigationReturn`, `DataGridCellPosition`) |
| Rejected-citations ledger | 25 entries | **25 — one narrowed, none deleted** |
| Changesets (`?? .changeset/*.md`) | **21** | **23** |

**No allowlist was widened, no ceiling raised, no ledger entry deleted, no baseline replaced, and
nothing was committed.**

### 7.4 The browser lane

**Not run, and argued rather than assumed.** Nothing here moves a painted pixel: no
`.variants.ts`, token, class, colour or layout changed. The template edits are `tabindex` and
`@keydown` **attributes** on existing `<th>`/`<td>` nodes plus one `v-for` gaining an index — no
node added, removed or reordered — and the inline-style inventory re-reads **133 sites,
unmoved**, which is the artifact that would notice a markup shift. **RESIDUAL-11's `DzSelect`
placeholder fix was not touched.** **No lane leaked and no process was killed** — no `kill`, no
`taskkill`, and nothing was matched by process name at any point in this packet.

---

## 8. Residue — every dirty path attributed

`git status --porcelain` at entry: **402**. At exit: **416** — measured, not estimated, by
diffing the two sorted listings. The difference is **exactly fourteen paths, all additions**;
**nothing was removed and no status letter changed**. ` M yarn.lock` is the owner's `yarn install`
and was never touched — **`yarn install` was not run**.

| Path | Why |
|---|---|
| `packages/core/src/components/data/DzCalendar.vue` | **new dirty** — `Shift` year paging (§2) |
| `packages/core/src/components/data/DzCalendar.spec.ts` | **new dirty** — two year-paging tests |
| `packages/core/src/components/data/DzDataGrid.anatomy.ts` | **new dirty** — two new page rows + the `D-RES14-1` decision record |
| `packages/core/src/components/data/DzDataGrid.types.ts` | **new dirty** — two context fields |
| `packages/core/src/components/data/DzDataGrid.vue` | **new dirty** — creates the navigation and provides it |
| `packages/core/src/components/data/DzDataGridBody.vue` | **new dirty** — roving `tabindex` + `@keydown` on both cell kinds |
| `packages/core/src/components/data/DzDataGridHeader.vue` | **new dirty** — `tabindex="-1"` fallback + `onHeaderCellKeydown` |
| `packages/core/src/components/data/DzDataGrid.spec.ts` | **new dirty** — 13 new tests (42 → 55) |
| `packages/core/src/components/data/DzInfiniteScroll.spec.ts` | **new dirty** — `tabStops` + the feed-consumes-nothing loop |
| `packages/core/src/components/navigation/DzStepper.spec.ts` | **new dirty** — `tabStops` + the unreachable-step test |
| `packages/core/src/composables/useDataGrid/index.ts` | **new dirty** — exports the new composable |
| `packages/core/src/composables/useDataGrid/useDataGridNavigation.ts` | **new file** — the grid navigation |
| `.changeset/the-data-grid-now-navigates-its-cells-and-the-calendar-pages-by-year.md` | **new file** — `@dzup-ui/core: minor` |
| `.changeset/expect-keyboard-contract-can-now-assert-the-shape-of-a-tab-order.md` | **new file** — `@dzup-ui/testing: minor` |

Already dirty at entry and edited inside this packet, so the listing does not change:
`DzTransfer.vue` / `DzTransfer.spec.ts` · `DzSplitButton.anatomy.ts` · `DzToolbar.spec.ts` ·
`DzCheckboxGroup.spec.ts` · `DzRadioGroup.spec.ts` · `packages/testing/src/keyboard.ts` and its
spec · `anatomy-keyboard.ts` and its spec · `anatomy-keyboard-ceilings.json` (the two `$comment`
blocks only — the three values were not opened) · `anatomy-keyboard-rejected-citations.json` ·
`EXECUTION-STATUS.md` · the `regenerate:all` outputs. This report and the register addendum live
under `docs/program-2026-09-22-architecture/reports/`, which appears as a single `??` directory
entry, so they do not change the count either.

**Nothing temporary was left behind.** No scratch directory was created inside the repository at
any point; the three seed copies, their sha256 manifest and every log lived in the session
scratchpad. **No file was restored with `git checkout` or `git restore`**, and **no scripted bulk
replacement was run over a source file** — one Node line-splice on `DzRadioGroup.spec.ts` was
mangled by the shell's backtick expansion, was **detected immediately by reading the file**, and
was repaired with exact-string edits; nothing else went through a shell heredoc.

---

## 9. Not done, and named rather than left to be discovered

- **`tabStops` does not prove the browser's tab order matches DOM order.** `tabindex` above zero,
  `inert` and portals all reorder it. The option's docblock says so; `packages/core` has a browser
  lane for that and it was not run.
- **`DzStepper`'s `keyboard-spec` capability cell stays `unrun`** although its `Tab` row is now
  backed. That cell greps the spec for key **names** and `tabStops` dispatches `Tab` inside the
  helper. A derivation gap in the capability generator, not a false claim — and the cheapest fix
  is for that generator to read `tabStops` the way `specAssertedKeys` now does.
- **Both group specs slot three children and render two.** `mountGroup()` in
  `DzRadioGroup.spec.ts` and `DzCheckboxGroup.spec.ts` measure `labels=2 buttons=2
  text="Option AOption B"`. Pre-existing, encoded in a checked-in `toHaveLength(2)`, and nothing
  added here depends on the count. A `@vue/test-utils` array-slot question worth ten minutes.
- **The 25 ledger entries are still judgements, not proofs**, and six of them (`DzDataGrid`'s) are
  now inert history rather than live findings.
- **The 6 `I`-flagged rows were not repaired** — `DzPagination`'s three on `PaginationFirst`,
  `DzTagsInput`'s `Enter` on a prop default, `DzPersonaSelector`'s `<character>` on an
  `import { useTypeahead }` line, `DzColorPicker`'s `Tab` on `FocusScope`. Right class of node,
  cousin cited, no false green.
- **The weakest platform route is still the weakest**: a text `<input>` credits `<character>` and
  `<digit>`, and `DzMention` is the case that keeps it.
- **`D-RES14-4` option (c) stays open on its own merits** — a way to declare a requirement *on a
  slotted subtree*. It is no longer blocking anything: `tabStops` settled the five `Tab` rows
  without it, and `DzSplitButton`'s `Escape` was withdrawn rather than waiting for it.
- **`maxWithoutAnatomy` 41** — unmoved for several batches; 41 components whose keyboard contract
  this gate cannot check at all.
- **RESIDUAL-11 §9.3's `DzSelect` placeholder item is untouched**, as instructed.
- Still open and untouched: register #2 / `D127` the commit · `D-RES13-1` (`DzColorPicker`'s 2-D
  HSV slider) · `F12` · `F13` · the nine short `keyboard-spec` cells · `D112` · `D-S1O4-1` /
  `D-S1O4-3` · the Playwright-matrix CI job · the linux visual accept pass · RESIDUAL-10 §7.3's
  single `ciGate` derivation · `D-RES09-1` · `D-RES07-1` · `D-RES06-2` · `D-RES04-2` · `D91` ·
  ADR-18/19/20 acceptance.

---

## 10. Ranked next packet

1. **Register #2 / `D127` — commit the 416-path worktree.** Now the single act that unblocks the
   most by a wide margin: both gates are green, 23 measured changesets sit behind it, and every
   number in this report is bound to an uncommitted tree.
2. **Audit the *other* artifacts that resolve a claim by scanning text.** RESIDUAL-14 §10 item 6,
   unmoved and still the largest open question: which other gate credits a claim because a *file*
   mentions a *token*? `validate:adr-references`, `hardcoded-strings` and the `at-matrix` are the
   candidates and all three publish. Two instances of this defect have now been found by accident,
   six months apart.
3. **`maxWithoutAnatomy` 41.** Forty-one components whose keyboard contract nothing checks — the
   largest remaining hole in the gate this batch just made trustworthy.
4. **Teach the capability generator to read `tabStops`** (and, while there, the nine short
   `keyboard-spec` cells). One derivation, three cells today, and it stops a true row reading as
   unexercised.
5. **`D-RES14-4` option (c)** — a column for "required of the slotted subtree" — on its own
   merits rather than to unblock a component.
6. **The 6 `I`-flagged citations**, which are cheap and would take the audit's own residue to
   zero.
