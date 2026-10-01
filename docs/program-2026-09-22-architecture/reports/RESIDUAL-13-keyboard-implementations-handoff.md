# RESIDUAL-13 — implementing the keyboard the published tables already promised

**Batch:** RESIDUAL-13 · **Date:** 2026-09-29 · **Repo:** `ui/dzup-ui` (OSS, `@dzup-ui/*`)
**Entry HEAD:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` · **entry dirty paths:** 362
**Raised by:** `RESIDUAL-12-anatomy-keyboard-contracts-handoff.md` §4 — findings `F1`–`F11`,
registered as `D-RES12-1` (the 28 unbacked rows) and `D-RES12-2` (F11).

> Written incrementally, a section per component, because four agents stalled in this
> session and only incremental writes survived. RESIDUAL-12 recorded the same discipline.

---

## 0. The two items

| item | RESIDUAL-12's words | shape |
|---|---|---|
| `D-RES12-1` 🔴 | **28 rows have nothing behind them** across ten components, and *"none of them is a documentation error"* — each is *"a published contract that states what its APG pattern requires, against code that does not do it"* | published accessibility claims that are false |
| `D-RES12-2` | `expectKeyboardContract` is *"exported and called from zero component specs"*, and it is *"the mechanism that would settle all 8 undetermined rows"* | a checker wired to nothing |

Two of the 28 are outright Level A failures rather than gaps: `DzToolbar` is
`role="toolbar"` with **no key handling at all**, and `DzListItem` is a focusable row with
an `@click` and **no key activation** — SC 2.1.1, and the one item where *deleting* the
declaration would have hidden the defect.

*(Sections 1 onward are appended as each phase completes.)*

---

## 1. Entry measurement

`node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-keyboard.ts`,
exit **0**, on `4e4e46f` with the uncommitted tree, before any edit in this batch:

```
402 declared bindings across 85 components (104 anatomy declarations, 19 declare
keyboard: 'none'); 366 backed, 28/28 unbacked, 8/8 undetermined
owners: own 128 · compound part 13 · renders 8 · composable 7 · Reka primitive 154 · platform 56
reverse drift: 0/0
```

The 28, per component: `DzCarousel` 2 · `DzCascader` 2 · `DzColorPicker` 6 ·
`DzDatePicker` 2 · `DzDateRangePicker` 2 · `DzListItem` 2 · `DzTimePicker` 4 ·
`DzToolbar` 4 · `DzTour` 2 · `DzTransfer` 2.

The 8 undetermined: `DzAnchor` Enter · `DzCheckboxGroup` Space · `DzCollapse` Enter+Space ·
`DzFieldArray` Enter+Space · `DzOrderList` `<character>` · `DzRadioGroup` Space.

---

## 2. The two Level A failures, done first

### 2.1 `F1` / `DzToolbar` — a declared APG toolbar that had no key handling at all

`DzToolbar.vue`'s own header said *"Pure layout (tv() only) — no interaction logic"* while
its root said `role="toolbar"` and its anatomy published four navigation rows and a `Tab`
row whose action text is *"Move out of the toolbar; the toolbar is one tab stop."* Those
two statements cannot both be true.

**What it now does.** `DzToolbar.vue` owns a roving-focus group over the controls in its
three regions:

| key | effect |
|---|---|
| ArrowRight / ArrowLeft | next / previous control, **wrapping**, mirrored in a RTL document |
| ArrowDown / ArrowUp | the same on the block axis, **only** when `orientation="vertical"` |
| Home / End | first / last control |
| Tab | enters and leaves once — exactly one control carries `tabindex="0"` |

Five decisions inside it, each written down in the source:

1. **The mechanism is this repository's, not a new one.** `DzSpeedDial.onMenuKeydown` is
   the closest existing analogue — a `role="menu"` roving over buttons — and the shape is
   reused line for line: an orientation-derived `forward`/`backward` key pair, a
   `querySelectorAll` in DOM order, a modulo-clamped index, `focus()`. `DzRating` supplies
   the RTL half (`dzDirection.value === 'rtl' ? … : …`). Reka's `RovingFocusGroup` was the
   obvious alternative and does not fit: it needs each control wrapped in a
   `RovingFocusItem`, and every control in a toolbar arrives through a `<slot />` as the
   consumer's own markup.
2. **The single tab stop needs a marker of its own.** The first roving pass writes
   `tabindex="-1"` onto every control but one; without a marker the second pass reads those
   back as the author's deliberate opt-outs and the toolbar ends up with one reachable
   control and no way back. `data-dz-toolbar-item` is what makes "we moved this" and "the
   author took this out" distinguishable — and it is why an author's own `tabindex="-1"` is
   still honoured.
3. **A text field keeps its arrows.** APG is explicit that a field inside a toolbar owns
   caret movement, so `isTextEntry` returns before the switch. Non-text `<input>` types have
   no caret and are ordinary controls.
4. **The regions are slots, so the control list changes without this component
   re-rendering.** A `MutationObserver` on `childList`/`subtree` re-establishes the tab stop.
   Attributes are deliberately **not** observed: the callback writes `tabindex`, and
   observing attributes would make it re-enter itself.
5. **Two rows are new, and they are an addition rather than a correction.**
   `orientation: 'vertical'` has always been a supported prop reaching
   `aria-orientation="vertical"`, so an AT user was told the bar navigates the block axis
   while only the inline arrows were declared. They carry `when: 'orientation vertical'` —
   two words on purpose, because a single lowercase word is read as a part or state name and
   `vertical` is neither.

**Tests: 14 new in `DzToolbar.spec.ts`** (14 → 28), each driving the key and asserting the
effect — which control has focus and which one carries the tab stop — never that a handler
exists. Region crossing, wrap at both ends, RTL swap, the vertical axis *and* that
ArrowRight does nothing on it, a disabled control skipped, an author's `tabindex="-1"` left
alone, a text field keeping its arrows, and `focusin` moving the tab stop.

### 2.2 `F9` / `DzListItem` — a focusable row with a click and no key

**What it now does.** An `interactive`, non-disabled row activates on Enter and on Space,
consuming both, and emits the same `click` a pointer produces.

**The emit-signature decision RESIDUAL-12 left open.** `DzListItemEmits` types `click` as
`[event: MouseEvent]`.

- **Rejected: widen it to `MouseEvent | KeyboardEvent`.** A consumer whose handler is typed
  `(event: MouseEvent) => void` stops compiling — which makes a keyboard fix a breaking
  change for everybody who never had the bug.
- **Taken: synthesise the click.** `handleKeydown` calls `.click()` on the row, which is
  precisely how the platform activates a `<button>`. The published signature stays *true*
  rather than merely unchanged, and a keyboard activation and a pointer activation become
  the same event for every listener — this component's own `@click`, and any `onClick` a
  consumer passed through `$attrs`. A test asserts that last part directly.

**Tests: a new `DzListItem.spec.ts`, 9 tests.** A new file rather than more cases in
`DzList.spec.ts`, for a mechanical reason: `capability-matrix.json`'s `keyboard-spec` cell
resolves the spec beside the component (`generate-capability-matrix.ts`'s `sidecar` →
`{dir}/{component}.spec.ts`), so keys asserted only in a parent's spec read as no keyboard
evidence at all. The tests assert the emitted activation, that both keys are consumed, that
a non-interactive row is neither focusable nor activatable, that a disabled row is inert,
and that Escape is left to the document.

### 2.3 `F14` fell out of `F11` on the first call site, and had to be settled here

The very first `expectKeyboardContract` call failed — on `DzListItem`, and not for a
keyboard reason:

```
Binding `Enter` is scoped to `interactive`, which is neither a declared part nor a
declared state. Declared parts: root, item-label; states: active, disabled.
```

That is RESIDUAL-12 §4 **`F14`** arriving unprompted: the rule calls a single-word `when`
*"almost always a typo"*, **12 values in live use are legitimate prop names**, and nothing
called the rule, so neither half was ever true. `F11` cannot be done without settling it.

**Settled as: a `when` may name a prop**, made sayable through a new
`KeyboardCheckOptions.conditions` option rather than by deleting the rule. Two alternatives
rejected, both recorded in the option's own doc comment:

- **Delete the rule** — it is the only thing between a published row and a context that does
  not exist, and a typo'd `when` still renders on the documentation page.
- **Declare the prop as a `state`** — `states` is the `data-state` vocabulary and
  `validate:anatomy-parts` holds a component to emitting what it declares, so this trades a
  docs-only inaccuracy for a false attribute claim that the parts gate would then have to be
  told to ignore.

It is per-call rather than derived on purpose: the anatomy does not carry the component's
prop names, and a check that guessed them would pass for the guess rather than for the
component.

**Count after these two components: `unbacked` 28 → 22, `undetermined` 8 (unmoved),
reverse drift 0. Rows 402 → 404** (the two new vertical toolbar rows, both `own`-backed).

---

## 3. Working down `F2`–`F8`, one component at a time

### 3.1 `F4` / `DzCascader` — Home and End were absent from a switch that had everything else

The smallest of the ten. `onColumnsKeydown` already had a `switch` over ArrowDown, ArrowUp
and the direction-aware in/out pair, and `firstEnabledIndex` / `lastEnabledIndex` already
existed for the open/close path. Two `case` arms, reusing both helpers.

They move **within the focused column**, which is the listbox the row is about — crossing
columns is what the inline arrows do. **4 tests**: End then Home in the root column, End
inside a *child* column (so the assertion is that it does not cross), and that both keys are
consumed rather than left to scroll the page.

### 3.2 `F7` / `DzCarousel` — a region with prev/next buttons and no arrows

`DzCarousel.vue` was a `role="region"` and a slot. `onKeydown` on the root now moves the
slide, direction-aware, and `next()`/`prev()` already honour `loop` and `disabled`.

**The region is still not a tab stop, deliberately.** A carousel region is not a focus
target in the APG pattern: the keys arrive because focus is on one of its own controls
(previous, next, a dot) and the event bubbles to the root, which is exactly what an unscoped
row means by *"wherever the component has focus"*. Adding `tabindex` to satisfy the row
would put a new stop on every page with a carousel in order to implement a row that never
asked for one. A test asserts both halves: the key works from the Next button, and the region
carries no `tabindex`.

**Only the inline axis**, because only the inline axis is declared. `orientation` chooses
which way the content translates and is never announced to an assistive technology, so a
block-axis pair would be a new claim rather than this one — unlike `DzToolbar`, whose
`aria-orientation="vertical"` says the block axis out loud.

**7 tests**, including the RTL swap, the bounded-versus-`loop` end behaviour, and a disabled
carousel leaving the key to the document rather than swallowing it.

**One `F14` instance removed rather than papered over.** Both of `DzCarousel`'s
`Enter`/`' '` rows were scoped `when: 'control'` — a single lowercase word that is neither a
declared part nor a prop, which is exactly the shape `checkKeyboardContract` calls "almost
always a typo". It was one: the previous and next buttons **are** the declared `action`
part. The rows now say `when: 'action'`, `validate:anatomy-keyboard` resolves them against
that node's own `<button>` through the scoped platform route (re-measured: still backed),
and the spec needs no `conditions` escape at all.

**Count after these two: `unbacked` 22 → 18.**

### 3.3 `F8` / `DzTour` — a trapped dialog whose step keys were not bound

`useFocusTrap` made `Tab` real and `useEscapeKey` made `Escape` real; the two step rows
were bound to nothing. `onPanelKeydown` on the step panel now advances and retreats.

Three decisions:

1. **Not direction-aware, and that is the declaration rather than an omission.**
   `DzTour`'s anatomy says `rtl: { keyboard: 'none' }` and neither row carries
   `rtl: 'mirrored'` (owner decision D36, recorded in the anatomy). A tour advances through
   a *sequence of steps*, which has no inline axis to mirror, so ArrowRight advances in
   every writing direction. Mirroring it would contradict the declaration, and
   `keyboard-contract.spec.ts` already asserts that contradiction cannot be written down.
2. **ArrowRight on the last step does nothing.** The Next *button* calls `finish()` there;
   an arrow does not, because closing a modal is not what a press meant to read the next
   step asked for. The key is left unconsumed in that position, and a test asserts both.
3. **A field in the step's slot keeps its arrows**, through the shared helper below.

**5 tests**, including both boundaries asserted as *not consumed* — the honest shape, since
a declined key belongs to the document.

### 3.4 `F6` / `DzTransfer` — two unbacked rows, and two more that were backed for the wrong reason

This one grew on measurement. `Home` and `End` were the two RESIDUAL-12 named, but reading
where the **other** two were attributed is what made it a four-row repair:

```
ArrowDown  backed  packages/core/src/components/forms/optionsStateFocus.ts:294
ArrowUp    backed  packages/core/src/components/forms/optionsStateFocus.ts:280
```

That citation is `retryRouteOwnerKeydown`, which moves focus onto the **retry control of the
async error state**. Real behaviour, correctly cited, and *not what the rows say*: both
declare *"Move focus to the next / previous option"*, and in a pane that had options nothing
did it. **A citation can be true about a file and false about the claim, and that is the one
failure mode this validator cannot catch for itself** — worth recording as a property of the
gate rather than of this component.

`onPaneKeydown`, bound on both `role="listbox"` panes, now owns all four. It uses
`event.currentTarget` as the pane rather than a template ref, because there are two panes
and only the source one ever needed a ref. The two handlers cannot collide:
`retryRouteOwnerKeydown` does nothing unless a retry control exists, which is only the async
**error** state, and in that state a pane renders no options, so this handler returns before
it prevents anything. Re-measured: all four rows now cite `DzTransfer.vue`.

**No wrapping.** The APG `listbox` moves to the next option and stops; a ring is the
`toolbar`/`menu` behaviour, which is why `DzToolbar` wraps and this does not. A test asserts
the non-wrap at both ends.

**One defect found by a failing test of my own, in the component and not the test.** The
first draft read the starting option from `event.target` alone. A key delivered to the
*pane* — which is what a browser does when the container has focus, and what a dispatch at
the listbox does — then started from nowhere, so ArrowDown jumped to the first option from
wherever focus actually was. It now falls back to the document's focus, with the order and
the reason in the source.

**8 tests**, including a disabled option that is never a destination, the two panes
navigating independently, and an empty pane leaving the key to the document.

### 3.5 One shared helper, deliberately not public

`packages/core/src/utilities/keyboardTargets.ts` — `ownsItsOwnCaret(node)`. Four components
in this batch needed the same guard (a text field owns its own arrows), so it is one
function rather than four copies. It is **not** exported from `utilities/index.ts` or from
the package entry, on purpose: `packages/core/src/index.ts` is what `generate:ownership`
classifies, so a public export would add a symbol to the ownership manifest for a four-line
DOM predicate — and `unclassified` is a frozen ratchet. The exclusion list is written as
"which `<input>` types have no caret" rather than as an inclusion list, because `type` has
grown several times and every addition has been text-ish.

**Count after `DzTour` and `DzTransfer`: `unbacked` 18 → 14.** Remaining: `DzColorPicker` 6,
`DzTimePicker` 4, `DzDatePicker` 2, `DzDateRangePicker` 2.

### 3.6 `F3` / `DzTimePicker` — the list opened and nothing moved the highlight

RESIDUAL-12's phrasing was the specification: `Enter` **is** backed (the trigger is a real
`<button>`), *"so the list opens; nothing moves the highlight once it is open."* Two halves
of one declared `combobox` contract, and only the first existed.

- `onTriggerKeydown` — ArrowDown / ArrowUp open the list, which is literally the first
  clause of both rows' action text.
- `onColumnKeydown` — ArrowDown / ArrowUp / Home / End move focus among a **column's**
  enabled options.

**Scoped to the column, not the panel**, and that is the shape of the widget: a time is
chosen from two to four independent unit listboxes (hours, minutes, seconds, meridiem), and
"the next option" in an hours column is the next hour. A handler that walked the panel would
step from `23` to `00 minutes`. A test asserts that End in Hours never lands in Minutes.

The `select` layout needs none of it — native `<select>` elements own all four keys
themselves, which is also why the platform route in `anatomy-keyboard.ts` deliberately
refuses to credit those keys to that `<select>`.

**10 tests**, including the bounded case (`min: '09:00'`): Home lands on `09`, not on the
`disabled` `00`.

### 3.7 `F2` / `DzColorPicker` — six rows withdrawn, and the evidence for withdrawing them

**This is the one withdrawal in the batch, and it is the `DzChip`/`DzTag` disposition rather
than the `DzListItem` one.** Reading `DzColorPicker.vue` is what settled it: **there is no
colour pointer, no saturation axis and no value axis.** The panel is a native
`<input type="color">` sized by `canvasHeight`, a hex text field, and a grid of preset
`<button>`s. The six APG `slider` rows do not describe an unimplemented behaviour of this
component; they describe a *different* component.

The distinction from `DzListItem` is measurable, not aesthetic:

| | `DzListItem` | `DzColorPicker` |
|---|---|---|
| is there a pointer action the key should mirror? | **yes** — `@click` emits | no — there is no pointer-driven axis, only a native input |
| can a keyboard user do the thing at all today? | **no** | **yes** — Tab to the hex field and type `#ff0000`, or open the native colour input, which the platform operates fully |
| so the gap is | an **SC 2.1.1 failure**; deleting the rows hides it | a false **description** of how, with no failure behind it |

**Rejected: build a real two-dimensional HSV slider.** It is the change that would make the
old rows true, and it is a redesign of a published panel — a saturation/value canvas with a
draggable thumb, a hue slider, HSV conversion, new parts and new tokens — which would replace
the one element in the panel that is *already* fully keyboard- and AT-operable with a custom
one that has to earn that back. It also repaints the component, and visual capture is
owner-gated on linux while this machine is win32, so nothing here could qualify it. Raised
as **`D-RES13-1`** rather than half-done.

**Six true rows replaced them**, each scoped to the node it is about so the validator
resolves it there: Enter/Space on `trigger` (platform `<button>`), Escape (Reka's
`DismissableLayer`), Tab (Reka's `FocusScope`), Enter on `item` (the preset buttons),
`<character>` on `input` (the hex field). Re-measured: all six backed, and the row count is
unchanged at 404.

**9 tests, with the lane's limit stated rather than hidden.** jsdom implements no default
actions for keyboard events — Enter on a `<button>` does not synthesise a click — so for the
three platform rows each test asserts the two halves it can: that the component does **not**
intercept the key, and that the activation the platform produces from it has the declared
effect. Escape and the hex field are driven end to end. One test asserts the withdrawal
itself, so a future 2D slider has to change it.

### 3.8 `F5` / `DzDatePicker` + `DzDateRangePicker` — corrected, then implemented

Both pickers declared `Home` / `End` as `when: 'list open'`, APG `combobox`, *"Move to the
first / last option."* — the combobox template's words, in a popover that is a **calendar
grid with no option list**. RESIDUAL-12's measurement (Reka's calendar primitives own the
arrows and the page keys, not these two) is correct and is not the whole answer: the **APG
date-picker-dialog pattern does specify Home and End** — the first and last day of the
focused week.

So the rows were **corrected** (`when: 'calendar open'`, `apg: 'grid'`, the week wording)
and then **implemented**, which is neither withdrawal nor leaving a false row standing.
`onCalendarKeydown` finds the focused day's `<tr>` and focuses the first or last enabled day
in it.

**Focus is moved in the DOM and Reka's `placeholder` is deliberately left alone**, and the
reason is a measurement rather than a shortcut: `placeholder` is bound **one-way** from
`useDatePicker`'s `placeholderDate`, so Reka's own `shiftFocus` already moves focus with
`candidateDay.focus()` while `data-focused` stays where it was. This handler behaves exactly
like the arrows the component already has, and Reka's per-cell arrow handler reads that
cell's own `day` prop, so navigation continues correctly from wherever Home/End lands.

**10 tests across the two.** One is worth naming: *"leaves Home and End to the field when
focus is not in the grid"* asserts that focus does not move, and **deliberately does not
assert consumption** — measured, Reka's own `DateFieldInput` already calls
`preventDefault()` on Home in a segment, so an assertion on `defaultPrevented` there would
pass for Reka's reason rather than for ours.

---

## 4. `maxUnbackedDeclarations` — 28 → 0

```
unbacked  28 ──▶ 0
  implemented   22   DzToolbar 4 · DzListItem 2 · DzCascader 2 · DzCarousel 2 · DzTour 2
                     DzTransfer 2 · DzTimePicker 4 · DzDatePicker 2 · DzDateRangePicker 2
  withdrawn      6   DzColorPicker's six APG `slider` rows (§3.7)
                ────
                 28
```

Rows went **402 → 404**: `DzToolbar` gained two `when: 'orientation vertical'` rows (new,
`own`-backed) and `DzColorPicker` exchanged six rows for six. Owners moved
`own 128 → 152` · `primitive 154 → 156` · `platform 56 → 60`. **Reverse drift stayed 0/0**
throughout — every handler added was declared in the same change.

Two rows were also **re-attributed** without changing the count: `DzTransfer`'s
ArrowDown/ArrowUp moved from `optionsStateFocus.ts` (the async-error retry route) to
`DzTransfer.vue`'s real listbox navigation. They read as backed before and after; only one of
those readings was true.

---

## 5. Item 2 / `F11` — the helper nothing called, and the ratchet it closed

RESIDUAL-12: *"`expectKeyboardContract` is exported and called from nothing … also the
mechanism that would settle all 8 undetermined rows."* It is now called from **eight**
component specs, and all eight rows are settled — but **not by one mechanism**, because the
eight were not one problem. Reading them individually is what produced three answers.

| row(s) | what it actually was | how it closed |
|---|---|---|
| `DzOrderList` `<character>` | **the behaviour did not exist** — RESIDUAL-12 `F10`: *"a full roving-focus grab/move implementation and no type-ahead of any kind"*. It read `undetermined` only because the rows are slotted | **implemented** (§5.1) |
| `DzAnchor` `Enter` | the `<a href>` is real and built with `h()`, where a template scan cannot see it | **static resolution extended** (§5.2) |
| `DzCheckboxGroup` Space · `DzCollapse` Enter + Space · `DzFieldArray` Enter + Space · `DzRadioGroup` Space | the receiving node is genuinely **the consumer's** | **runtime assertion** (§5.3) |

### 5.1 `DzOrderList` — a type-ahead that had to be written, not asserted

No spec can settle a row whose behaviour is absent, and this one was: the row promised *"Move
focus to the next option whose label starts with that character."* and nothing in the
component compared a character to anything.

**The label is read from the rendered row**, through the `itemEls` list the component already
keeps for roving focus, and that is the decision rather than a detail. The rows are slotted:
the default renders the item and a consumer's item slot renders whatever they like, so the DOM
text is the only thing that matches what a screen reader announces. Matching `String(item)`
would have worked for the default and silently stopped working for every consumer who filled
the slot — the larger half of real use. A test asserts exactly that: with a slot rendering
`Zebra` before each label, typing `z` steps to the *next* row, which is only true if the
rendered text is what was read.

Search starts after the focused row and wraps, so repeating a character cycles through
same-initial options. It is inert while a row is **grabbed**: during a reorder the arrows move
the item, and stealing focus mid-move would abandon the grab without cancelling it.
**8 tests**, including the modified-character and disabled-list refusals.

### 5.2 `DzAnchor` — following the edge instead of widening the verdict

`DzAnchor` builds its links with `h('a', { href, … })` and its template is a `<nav>` and
nothing else, so the scoped platform route had no node to look at.

`renderFunctionNodesIn` turns each `h('tag', { … })` into the **opening tag it produces** and
the *same* `PLATFORM_KEYS` table decides. Nothing about what counts as platform behaviour
changed; only the set of nodes the table is offered. Two limits are deliberate: only a
**string-literal** tag (`h(SomeComponent, …)` is a component, and guessing what it renders is
the assumption this validator refuses), and attribute **presence** rather than value — except
the part attribute, which keeps its literal because that is what scopes a row to a node.

Measured effect: `platform` 60 → 61. One row moved and nothing else did.

**One defect in the first draft, found by a test written against it.** Keys were read a line at
a time, which lost every key but the first on a **one-line** props object — the shape the
`<ul>` has, so the `<ul>` lost the attribute that scopes a row to it. It now splits on commas
at depth zero and outside a string. The spec's fixture is `DzAnchor`-shaped for that reason: a
one-line object on the `<ul>` and a nested `style` object on the `<a>`, so both failure modes
are pinned.

### 5.3 The `spec` route — the seventh, and the narrowest

For the remaining six no static resolution is possible even in principle: `DzCheckboxGroup` is
a `<div role="group">` and a `<slot />`, and the checkbox is the application's. The ceilings
file already said how this falls — a runtime assertion *"would settle every slot case"* — so
the route is the one RESIDUAL-12 anticipated rather than a new idea.

**Four conditions, each the guard on a way it could be abused:**

1. **Only for a row that would otherwise be `undetermined` because of a `<slot />`.** It is
   asked *after* every static route and *before* the undetermined verdicts, so it can turn
   `undetermined` into `backed` and can **never** reach an `unbacked` row. `unbacked` means the
   closure resolved completely and nothing owns the key; no spec can change that, and a route
   that let one would be a way of silencing the gate instead of answering it.
2. **The spec must call `expectKeyboardContract`**, so the declared table is checked for
   coherence and reachability against a real mounted tree.
3. **The key must appear in that call's `handled` or `platform` list** — the two lists that
   assert something. Merely mentioning a key in a spec is not an assertion and is not accepted.
4. **The assertion is enforced by a different gate.** `yarn test` fails if it stops holding,
   so the route cites a check that *runs*, not one that *exists*.

A unit test pins the first condition from outside: every `spec` verdict must be on a component
that renders a `<slot />`, and its citation must end in `.spec.ts:<line>`.

**What it does not prove** is in its own doc comment: that the key produces the right *effect*.
Only the component's own behaviour spec knows what "toggle" means, and the `keyboard-spec`
capability cell is the measurement for that.

### 5.4 `platform` — the option the runtime half needed, and the measurement that forced it

The first attempt used `handled`, which asserts the component called `preventDefault()`. It
**failed**, and the reason is measured rather than guessed: Reka's `CheckboxRoot.js` and
`RadioGroupItem.js` both prevent **Enter only**, because Space on a `<button>` *is* the
activation and preventing it would break the toggle. `handled: [' ']` is therefore false on a
component that behaves correctly.

So `expectKeyboardContract` gained **`platform`**, which asserts the opposite and correct
thing: that the **rendered** tree — the consumer's children included — contains an element
whose own documented HTML behaviour is that key. It is the runtime twin of the validator's
`PLATFORM_KEYS` and is kept as narrow: activation and text entry only, **never navigation**. A
test asserts that refusal directly, and another asserts that `handled` and `platform` give
*opposite* answers on the same Reka-shaped tree — which is the whole argument for having both.

### 5.5 The eight call sites, and the fixture each one needed

| spec | call | the tree it needed |
|---|---|---|
| `DzToolbar` | `handled` on the four inline keys, and the block pair on a vertical bar | three buttons across two regions |
| `DzListItem` | `handled: ['Enter', ' ']` · `conditions: ['interactive']` | a row inside an `interactive` `DzList` |
| `DzCarousel` | `handled: ['ArrowRight', 'ArrowLeft']` | slides plus the previous/next controls |
| `DzTour` | `handled: ['ArrowLeft']`, from the **second** step | the step panel, after one advance |
| `DzTransfer` | `handled` on all four listbox keys | both panes, with options |
| `DzTimePicker` · `DzColorPicker` · `DzDatePicker` · `DzDateRangePicker` | coherence + reachability, no `handled` | the panel **open** |
| `DzCheckboxGroup` · `DzRadioGroup` | `platform: [' ']` | real `DzCheckbox` / `DzRadio` children |
| `DzCollapse` | `platform: ['Enter', ' ']` · `conditions: ['trigger']` | a **whole disclosure** — a consumer's button beside the region it controls |
| `DzFieldArray` | `platform: ['Enter', ' ']` · `conditions: ['action']` | a consumer's remove button per row, and an add button |

Two of those fixtures are the interesting ones. **`DzCollapse` renders the region and nothing
else**, so its trigger node is not merely slotted — it is the application's own *sibling*
element, which is exactly what its anatomy already said (*"it handles no key; the trigger that
owns the disclosure does"*). The tree the contract is about is a real disclosure, so that is
the tree the assertion runs against. **`DzFieldArray` is renderless** with `parts: 'none'`, so
*every* element in its output is the consumer's, the add and remove controls included.

`DzTour`'s `handled: ['ArrowLeft']` is asserted from the second step on purpose: on step one
the component legitimately declines the key. Consumption is a claim about a key being acted
on, not about it being swallowed everywhere.

### 5.6 `maxUndeterminedDeclarations` — 8 → 0

```
undetermined  8 ──▶ 0
  implemented           1   DzOrderList <character>
  resolved statically   1   DzAnchor Enter
  asserted at runtime   6   DzCheckboxGroup 1 · DzCollapse 2 · DzFieldArray 2 · DzRadioGroup 1
                       ───
                        8
```

**No case remains that cannot be settled**, and that is why the ceiling is zero rather than a
smaller number: a node a source scan can reach is decided statically, and a node only a
consumer supplies is decided by a spec that supplies one. The two mechanisms together leave no
third place for an answer to hide.

### 5.7 `F14`, settled because `F11` could not be done without it

Recorded in §2.3, where it happened. Its resolution is a new `conditions` option rather than a
deleted rule, and it is now exercised by three call sites (`DzListItem` `interactive`,
`DzCollapse` `trigger`, `DzFieldArray` `action`) plus `DzCarousel`, whose two rows were
re-scoped to a **real declared part** instead of admitting the loose word. A rule that had
never run now runs in eight specs.

**Final gate reading — every one of the 404 rows is backed:**

```
anatomy-keyboard: 404 declared bindings across 85 components (104 anatomy
  declarations, 19 declare keyboard: 'none'); 404 backed, 0/0 unbacked,
  0/0 undetermined
  owners: own 153 · compound part 13 · renders 8 · composable 7 ·
          Reka primitive 156 · platform 61 · runtime spec 6
  reverse drift: 0/0 key(s) handled but not declared
```

---

## 6. Seeded breaks — three components, each failing exactly the intended tests

`sha256` of the three files recorded **before** the first seed, in
`scratchpad/r13/seed-hashes.txt`. Every restore is the **inverse edit**, verified by
`sha256sum -c`. **`git checkout` was not used anywhere in this batch**, and the three files are
byte-identical to their pre-seed state.

Each seed removes behaviour from **component source, never from a test**, and the prediction
was written down before the run.

```
SEED A   DzToolbar.vue — delete the `case 'Home': next = 0; break` arm
  gate  exit 1
        x DzToolbar declares `Home` as APG `toolbar` — "Move focus to the first
          control." — and nothing handles it: not DzToolbar's own source, not a
          compound part, not a component it renders, not a composable, not a Reka
          primitive it imports, and no native element it renders.
        x unbacked-declaration: 1 ... over the ceiling of 0
  spec  exit 1 — 2 failed | 26 passed, and they are the two predicted:
        x dzToolbar -- APG toolbar roving focus > focuses the first control on Home
          and the last on End
        x dzToolbar -- APG toolbar roving focus > conforms to its declared keyboard
          contract and consumes each inline navigation key
        restored -> sha256sum -c   OK (3 of 3)

SEED B   DzListItem.vue — narrow the activation guard to `event.key !== 'Enter'`,
         so the Space arm is gone and Enter is untouched
  gate  exit 1
        x DzListItem declares ` ` (when interactive) as APG `button` — "Activate the
          row." — and nothing handles it ...
        x unbacked-declaration: 1 ... over the ceiling of 0
  spec  exit 1 — 3 failed | 6 passed, and they are the three predicted:
        x activates on Space
        x consumes both activation keys, so Space does not scroll the page under the row
        x conforms to its declared keyboard contract, both keys consumed
        The six that stayed green are the proof the seed was surgical: "activates on
        Enter" still passes, and so do both refusals (a non-interactive row, a
        disabled row) and the Escape case.
        restored -> sha256sum -c   OK (3 of 3)

SEED C   DzTransfer.vue — delete the `case 'End'` arm
  gate  exit 1
        x DzTransfer declares `End` as APG `listbox` — "Move focus to the last
          option." — and nothing handles it ...
        x unbacked-declaration: 1 ... over the ceiling of 0
  spec  exit 1 — 6 failed | 23 passed, and they are the six predicted — every test
        that drives End, and only those:
        x moves to the first option on Home and the last on End
        x skips a disabled option — Item D is never a destination
        x does not wrap, because a listbox is not a ring
        x navigates each pane independently rather than across both
        x consumes all four navigation keys
        x conforms to its declared keyboard contract, with the four listbox keys consumed
        restored -> sha256sum -c   OK (3 of 3)
```

**Why these three.** A and B are the two Level A failures, so the seeds prove the repairs that
matter most are load-bearing. C is the broadest deliberately: one deleted `case` takes down six
tests, which is the evidence that the tests assert an *effect* — where focus is — rather than
the presence of a handler. A spec that only checked "there is a keydown listener" would have
stayed green through all three seeds.

**After the third restore the gate reads green again** — `404 backed, 0/0 unbacked, 0/0
undetermined` — which is the check that the restores were complete rather than approximate.

---

## 7. Validation — every exit code read from a log file, never from a notice

All commands from the repository root, each writing to an **absolute** path under the session
scratchpad, with `echo "exit $?"` appended to that same file. No exit code was read through a
pipe or from a harness notice.

| command | exit | evidence |
|---|---|---|
| `yarn validate:all` | **0** | **62 links** · **53** `✓` · **0** `✗` (`grep -c` on the log) |
| `yarn test` | **0** | **578 files** (was 576) · **11,389 passed** (was 11,261) · 3 skipped · 1 todo · **0 failed** · `grep -c FAIL` → **0** · **0 unhandled errors** · 396.19 s. Two earlier runs exited **1** on a reporter-RPC timeout that carries no test; §7.1 is the measurement and the finding. |
| `yarn regenerate:all` | **0** | 7 of 7 steps |
| `yarn typecheck:tooling` | **0** | |
| `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p tsconfig.json` | **0** | after the one error described in §7.2 |
| `node node_modules/eslint/bin/eslint.js --max-warnings 0 <37 files>` | **0** | every fix by hand; §7.3 |
| `node node_modules/tsx/dist/cli.mjs …/anatomy-keyboard.ts` | **0** | 404 rows · **404 backed** · 0/0 unbacked · 0/0 undetermined · 0/0 drift |
| `yarn storybook:test` (the browser lane) | see §7.4 | run **once**, app-locally |

### 7.1 An intermittent non-zero exit on a green suite, measured five ways

The run this batch is handed back on:

```
Test Files  578 passed (578)
     Tests  11389 passed | 3 skipped | 1 todo (11393)
  Duration  396.19s
exit 0
```

Two earlier `yarn test` runs produced the same test numbers and exited **1**:

```
Test Files  578 passed (578)
     Tests  11389 passed | 3 skipped | 1 todo (11393)
    Errors  1 error
```

**Not one test failed in any of them and `grep -c FAIL` is 0 throughout.** The error is
`[vitest-worker]: Timeout calling "onTaskUpdate"` raised from
`node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53` — the **worker-to-reporter RPC** missing its
window, which vitest itself describes as something that *"might cause false positive tests"*
rather than a failure. It carries no file and no test.

It appeared twice, was **measured rather than excused**, and is **absent from the run this batch
is handed back on**. Five runs:

| # | invocation | files | tests | `onTaskUpdate` | exit |
|---|---|---|---|---|---|
| 1 | `yarn test`, immediately after `validate:all`'s two Vite builds | 578 | 11,389 passed | **1** | **1** |
| 2 | `yarn test`, while the browser lane had just finished and the session was polling the log every few seconds | 578 | 11,389 passed | **1** | **1** |
| 3 | `vitest run` **minus this batch's two new spec files** | 576 | 11,356 passed | 0 | **0** |
| 4 | `vitest run`, every file, nothing excluded | **578** | **11,389 passed** | 0 | **0** |
| 5 | **`yarn test`, quiet machine — the run this batch is handed back on** | **578** | **11,389 passed** | **0** | **0** |

**Run 3 is the one that would have misled.** Its obvious reading is *"two new files tip the runner
over"* — and run 4 refutes it: the **same 578 files, both new ones included, exit 0**. So neither
the file count nor any test in the suite is the cause. Run 5 then produces a clean `yarn test`,
which rules out the wrapper as a *deterministic* cause too — the first draft of this section had
concluded that `test:prepare && vitest run` was the trigger, and run 5 is what corrected it.

What is left is **machine contention**, and the two failing runs are the two contended ones: run 1
started seconds after `validate:all`'s two Vite builds, and run 2 ran while the browser lane had
just released ~17 node processes and this session was polling the log file every few seconds. Runs
4 and 5 were on a quiet machine. The error is a **worker-to-reporter RPC window**, which is
exactly what contention on the main thread produces, and it carries no file and no test because
there is no test behind it.

**The suite is green: 578 files, 11,389 passed, 0 failed, 0 unhandled errors, `yarn test`
exit 0** — and the flake is still worth raising, because a gate that fails intermittently under
load is a gate that will fail on a busy CI runner and be read as a defect. It is **not new to this
batch**: the same error is recorded at
`docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md:177` as one of four unhandled errors on a
363-second run, weeks before this work, and `vitest.config.ts`'s own comment records this suite
already raising `testTimeout` from 30 s to 60 s for a timeout that *"timed out only in
`yarn test:coverage`, i.e. only in the CI job that gates merges."* Same class: a gate at the edge
of its own timing budget.

Raised as **`D-RES13-2`** and **not fixed here**, because every candidate fix is a change to a
gate's own configuration — splitting `test:prepare` out of the `test` script, or pinning
`poolOptions.threads.maxThreads` below the CPU count — and choosing one of those to make a change
fit is the wrong order.

### 7.2 The typecheck error `vue-tsc -p tsconfig.json` caught and the earlier run did not

One error, and it is worth recording because it is the *inverse* of the trap RESIDUAL-12 hit.
RESIDUAL-12 found 15 errors that only `typecheck:tooling` sees; this batch's single error was in
`packages/core`, which the root typecheck **does** cover — and the root typecheck had already
passed, because it ran **before** `DzFieldArray.spec.ts` was written. The lesson is not about
which config covers what: it is that a typecheck is evidence about the tree at the moment it
ran.

```
DzFieldArray.spec.ts(169,15): error TS2322
  Type 'DzFieldArrayAppendSlotProps<unknown>' is not assignable to
  type '{ append: () => void }' — Target signature provides too few arguments.
```

The slot hands out `append: (item?: unknown) => void` and the test had narrowed it to
`() => void`. Fixed by typing the handler to the signature the slot declares — which is
§2.1's `DzListItem` argument in miniature: the published shape is the shape.

### 7.3 Lint — 32 errors and 10 warnings, every one fixed by hand

`--fix` was **not** used, per this repository's own record of it corrupting a string literal.
The interesting ones, because they are properties of this codebase's config rather than of my
typing:

- **`antfu/curly` "consistent"** on two character-scanning loops: when one branch of an
  `if`/`else if` chain needs braces, every branch must have them.
- **`regexp/use-ignore-case`** on `[A-Za-z_$]` — replaced by the `i` flag.
- **`style/quotes`** on a 21-line array of double-quoted source lines, which is also the reason
  the `renderFunctionNodesIn` fixture is now a single template literal rather than a
  `join('\n')`.
- **`jsdoc/no-multi-asterisks`** on three doc lines whose continuation began with a markdown
  `**` — the same rule that cost RESIDUAL-11 a run and RESIDUAL-12 a fix.
- **`test/prefer-lowercase-title`** on `it('Home focuses …')` and two `it('FAILS when …')`,
  which is why those titles read as they do.
- **`vue/attributes-order`** — an inserted `@keydown` must come *after* the `aria-*` bindings,
  in four `DzTimePicker` roll columns and two `DzTransfer` panes.

### 7.4 The browser lane — run once, and why it was needed rather than optional

RESIDUAL-12 ran it because two components' *rendered output* changed. Here the case is
stronger: this batch binds **new `keydown` handlers on seven components whose story `play()`
functions drive keys** — measured, `DzOrderList` 10 keyboard calls, `DzCascader` 8,
`DzTimePicker` 5, `DzTour` 3, `DzCheckboxGroup` 3, `DzColorPicker` 1, `DzToolbar` 1 — and
`DzToolbar`'s roving `tabindex` changes what `userEvent.tab()` reaches.

The keys those play functions drive were checked against the keys this batch added **before**
the run, so the expectation was specific rather than hopeful: `DzOrderList`'s play functions
use Space, Escape and the arrows and **no printable character**, so type-ahead cannot interfere;
`DzCascader`'s use the arrows and Enter, and this batch added only Home/End; `DzTour`'s use
Enter and Escape, and this batch added the arrows; `DzToolbar`'s single `tab()` lands on the
control that still carries `tabindex="0"`.

Invoked **app-locally** (`yarn storybook:test`, which delegates to `apps/storybook`'s own
vitest), never with the root binary, because `validate:browser-lane`'s own note records that the
cross-install invocation launches a browser, connects it and then dies at collection with no
error for about seven minutes. `validate:browser-lane` is a separate link and checks only that
the lane is invocable, is still a browser lane and can still fail CI — it does **not** run it.

### 7.5 The re-runs, and what they establish

Superseded by the five-run table in §7.1, which is where the measurement ended up. The short
version, and it took three wrong readings to get there: *a load flake* (refuted by the second
failure), then *two new files tip the runner over* (refuted by `vitest run` over all 578),
then *the `test:prepare` chaining is the trigger* (refuted by a clean `yarn test`). What stands is
**contention**, and what is handed back is `yarn test` **exit 0** with every test this batch added
included.

### 7.6 Capability movement — seven cells, all the right way

**`present` 613 → 620 · `unrun` 395 → 388.** Seven of 1,662, and each one is worth naming
because the cell is strict: `keyboard-spec` is `present` only when **every** declared key is
asserted **by name** in the unit spec beside the component.

```
DzToolbar     keyboard-spec  unrun -> present   all 7 declared bindings exercised
DzListItem    keyboard-spec  unrun -> present   all 2
DzTransfer    keyboard-spec  unrun -> present   all 8
DzCollapse    keyboard-spec  unrun -> present   all 2
DzColorPicker keyboard-spec  unrun -> present   all 6 — the withdrawal is what made the
                                                cell satisfiable, exactly as removing
                                                DzChip's two false rows did in RESIDUAL-12
DzFieldArray  keyboard-spec  unrun -> present   all 2
DzListItem    unit-spec      unrun -> present   there was no `DzListItem.spec.ts` for the
                                                sidecar resolver to find at all
```

**Nine components' cells were deliberately left `unrun`**, and the reason is a refusal rather
than an omission. Each is one or two key literals short — `DzTour` lacks `'Tab'`,
`DzCheckboxGroup` lacks `'Tab'`, `DzCarousel` lacks Enter and Space, `DzCascader` three,
`DzOrderList` two, `DzRadioGroup` four, `DzTimePicker` three, `DzDatePicker` and
`DzDateRangePicker` five each — and the only honest way to close one is a test that **drives the
key and asserts its effect**. Adding a key literal to satisfy a regex is the fabrication this
programme exists to remove, and it would move a published evidence cell on the strength of a
string.

Everything else unmoved: `pass` **585** · `fail` **0** · `stale` **22** · `excepted` **47** ·
rows **144** / cells **1662** · `unclassified` **29/29** · `maxWithoutAnatomy` **41/41** ·
`maxProposedCitedFromCode` **3** (ceiling 3) · **AT 0 of 534** · locales ≥ 95 % **1** ·
inline-style sites **133** (81 static in 78 files + 52 bound in 38 files — the artifact's bytes
changed because it records line numbers and three edited `.vue` files gained lines; its totals
did not) · browser lane **170 / 1,462**.

**No ceiling was raised, no allowlist was widened, and no new ceiling file was created.** The
only `*ceiling*.json` opened for writing is `anatomy-keyboard-ceilings.json`, and both numbers in
it went **down**.

---

## 8. Residue — nothing left behind, and every dirty path attributed

| thing | state |
|---|---|
| probe files | **none.** No probe was written inside the repository at any point. Every log, hash file and draft lives in the session scratchpad **outside** it, and the scratch directory was created by a command that touches nothing inside. |
| the three seeded files | `DzToolbar.vue`, `DzListItem.vue`, `DzTransfer.vue`. Every restore was the **inverse edit**, verified by `sha256sum -c` against a hash file recorded **before** the first seed. **`git checkout` was not used anywhere in this batch.** |
| the mangled spec, and how it was recovered without git | A scripted replacement on `packages/tooling/src/validators/anatomy-keyboard.spec.ts` computed an **empty** search string (its `indexOf` for the end marker resolved earlier in the file than the start), so `split('').join(block)` inserted the block between **every character** and left a 342,799-line file. The file is untracked — created by RESIDUAL-12 — so `git checkout` could not have helped even if it were permitted. It was recovered by **inverting the insertion**: `split(block).join('')` removed **13,174** occurrences and returned a 276-line file, and the 31 tests then passed unchanged. Recorded because it is the second time in this programme that a shell heredoc's backslash handling has damaged a source file, and the lesson is the one already in the toolchain notes: **write the script to a file and run it, never inline it in a heredoc.** |
| `yarn.lock` | **untouched.** No `yarn install` was run and none is owed. Its ` M` remains the owner's install. |
| screenshots / PNGs / baselines | none. No baseline was written, replaced or accepted. The visual lane was **not** run. |
| processes | **none killed.** `chromium` 0 → 0 · `msedge` 0 → 0 · `headless_shell` 0 → 0 · `node` 40 → 23 · `chrome` 35 → **36**. The `chrome` delta is **+1** and is the user's own browser; the lane's engine is `chromium`, which is **0 both times**, so a leak is ruled out by the count that would show one. **No `taskkill`, no kill-by-name, no kill at all** — reported and not acted on, per the batch that killed 37 `chrome.exe` and may have closed the user's browser. |
| git | nothing committed, pushed, stashed, reverted, checked out, cleaned, pulled, merged or rebased. No CI dispatch, no publish, no deployment, no baseline replacement. |

### 8.1 Dirty paths — 362 → 396, and all 34 are attributed

```
git status --porcelain | wc -l        before 362   after 396
diff <before listing> <after listing>  ->  34 added, 0 removed, 0 status letters changed
```

**Nothing that was dirty at entry stopped being dirty.** The 34 new paths:

```
 M packages/core/src/components/layout/DzToolbar.vue            F1  roving focus
 M packages/core/src/components/layout/DzToolbar.anatomy.ts      F1  +2 vertical rows
 M packages/core/src/components/layout/DzToolbar.spec.ts         F1  +14 tests
 M packages/core/src/components/data/DzListItem.vue              F9  Enter/Space activation
 M packages/core/src/components/data/DzListItem.anatomy.ts       F9  the disposition comment
 M packages/core/src/components/data/DzOrderList.vue             F10 type-ahead
 M packages/core/src/components/data/DzOrderList.spec.ts         F10 +8 tests
 M packages/core/src/components/media/DzCarousel.vue             F7  arrow navigation
 M packages/core/src/components/media/DzCarousel.anatomy.ts      F7  + the F14 re-scope
 M packages/core/src/components/overlays/DzTour.vue              F8  step keys
 M packages/core/src/components/overlays/DzTour.spec.ts          F8  +6 tests
 M packages/core/src/components/forms/DzTimePicker.vue           F3  trigger + column keys
 M packages/core/src/components/forms/DzTimePicker.anatomy.ts    F3  the comment
 M packages/core/src/components/forms/DzTimePicker.spec.ts       F3  +10 tests
 M packages/core/src/components/forms/DzColorPicker.anatomy.ts   F2  6 rows withdrawn, 6 added
 M packages/core/src/components/forms/DzColorPicker.spec.ts      F2  +9 tests
 M packages/core/src/components/forms/DzDatePicker.vue           F5  grid Home/End
 M packages/core/src/components/forms/DzDatePicker.anatomy.ts    F5  rows corrected
 M packages/core/src/components/forms/DzDatePicker.spec.ts       F5  +6 tests
 M packages/core/src/components/forms/DzDateRangePicker.vue      F5  the same pair
 M packages/core/src/components/forms/DzDateRangePicker.anatomy.ts   F5
 M packages/core/src/components/forms/DzDateRangePicker.spec.ts  F5  +4 tests
 M packages/core/src/components/forms/DzCascader.spec.ts         F4  +4 tests
 M packages/core/src/components/forms/DzTransfer.spec.ts         F6  +8 tests
 M packages/core/src/components/forms/DzCheckboxGroup.spec.ts    F11 runtime assertion
 M packages/core/src/components/forms/DzRadioGroup.spec.ts       F11 runtime assertion
 M packages/core/src/components/forms/DzFieldArray.spec.ts       F11 runtime assertion
 M packages/core/src/components/layout/DzCollapse.spec.ts        F11 runtime assertion
 M packages/testing/src/keyboard.ts                              F11 + F14 two new options
?? packages/core/src/components/data/DzListItem.spec.ts          F9  the new spec, 9 tests
?? packages/core/src/utilities/keyboardTargets.ts                the shared internal helper
?? packages/testing/src/keyboard.spec.ts                         the spec the helper never had
?? .changeset/ten-components-now-do-the-keyboard-their-tables-promised.md
?? .changeset/a-keyboard-contract-can-now-be-asserted-where-source-cannot-reach.md
```

Files this batch edited that were **already** dirty at entry, and so appear in neither list —
verified by name against the entry snapshot rather than assumed:

```
 M packages/core/src/components/forms/DzCascader.vue         F4  two `case` arms
 M packages/core/src/components/forms/DzTransfer.vue         F6  pane navigation
 M packages/core/src/components/media/DzCarousel.spec.ts     F7  +7 tests
?? packages/tooling/src/validators/anatomy-keyboard.ts       the render-function reader + `spec` route
?? packages/tooling/src/validators/anatomy-keyboard.spec.ts  +8 tests (31 total)
?? packages/tooling/src/validators/anatomy-keyboard-ceilings.json   both ceilings to 0
 M packages/core/manifests/component-ownership.manifest.json  regenerated
 M packages/core/docs/capability-matrix.json + component-meta.json + llms*   regenerated
 M packages/core/security/inline-style-inventory.json         regenerated (line numbers)
 M apps/docs/** + .vitepress/generated/nav.json               regenerated
 M docs/program-2026-09-22-architecture/EXECUTION-STATUS.md    this batch's ledger entry
?? docs/program-2026-09-22-architecture/reports/               this report
 M docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md   §19
```

---

## 9. Not done, and named rather than left to be discovered

- **`D-RES13-2` — `yarn test` exits 1 on a green suite** (§7.1). One reporter-RPC unhandled
  error, no file, no test; `vitest run` over the same 578 files exits 0. Three options costed in
  register §19.5; **recommendation: split `test:prepare` out of the `test` script.** Not fixed
  here because it is a change to a gate's own configuration.
- **`D-RES13-1` is a design question, not a defect.** Should
  `DzColorPicker` get a real two-dimensional HSV slider — the change that would make its six
  withdrawn rows true? Three options are costed in register §19.4;
  **recommendation: leave it** until an accessibility review asks otherwise. The panel is
  honest and operable today, and a redesign chosen to make a withdrawn table come back is the
  wrong reason to do one.
- **Nine `keyboard-spec` cells are one or two keys short of `present`**, listed in §7.6. Closing
  one means a test that drives the key and asserts its effect; a key literal added to satisfy a
  regex would move a published evidence cell on the strength of a string.
- **`F12` is untouched** — the rest of axe's `incomplete` bucket. RESIDUAL-12's shape for it (a
  rule at a time, with a reason each, and a ratchet on how many rules are admitted) still stands,
  and the measured objection to a blanket assertion still stands too.
- **`F13` is untouched** — `DzChip` and `DzTag` still name their remove button
  `` `Remove ${ariaLabel ?? ''}` ``, so an unnamed chip's icon-only button is named the literal
  `"Remove "`, untranslated. It needs a message catalogue for those two components.
- **The visual lane was not run and RESIDUAL-11 §9.3's `DzSelect` item is deliberately
  untouched.** Nothing in this batch moves a painted pixel — no `.variants.ts`, token or class
  changed; `tabindex` is not a style. Visual capture is owner-gated and the authoritative
  platform is linux while this machine is win32, so a local run would have qualified nothing.
- Still open and untouched: register #2 / `D127` the commit · `D112` the named AT tester ·
  `D-S1O4-1` / `D-S1O4-3` · the Playwright-matrix CI job · the linux visual accept pass ·
  RESIDUAL-10 §7.3's single `ciGate` derivation · `D-RES09-1` · `D-RES07-1` · `D-RES06-2` ·
  `D-RES04-2` · `D91` · ADR-18/19/20 acceptance.

---

## 10. Ranked next packet

1. **Register #2 / `D127` — commit the 396-path worktree.** Owner-only, and unchanged as the
   single act that unblocks the most. Two more published-component changesets now sit behind it
   (57 pending), and every assertion in this batch is qualified against an uncommitted tree.
2. **`D-RES13-1` — decide `DzColorPicker`.** It is the only thing this batch raised, the options
   are costed, and a decision either closes it or schedules real work. Ten minutes of owner
   judgement.
3. **Close the nine short `keyboard-spec` cells, honestly.** `DzTour` and `DzCheckboxGroup` need
   one `'Tab'` assertion each — a test that Tab is *not* consumed, which is a real claim about a
   component that must not trap focus. `DzCarousel` needs Enter/Space on its controls.
   Those three are cheap; the other six are a test per key and should be scheduled, not
   squeezed.
4. **`F12` — decide what else in axe's `incomplete` bucket is gated.** Still the shape
   RESIDUAL-12 proposed, and still worth doing a rule at a time.
5. **`F13` — give `DzChip` and `DzTag` a message catalogue.** Two published components, one
   untranslated literal, and a remove button whose accessible name is `"Remove "` when the chip
   is unnamed.
6. **Audit the other direction of the gate's one blind spot.** §3.4 found a citation that was
   true about a file and false about the claim. `DzTransfer`'s two rows are fixed, but the same
   shape could exist elsewhere: **366 rows were `backed` at entry and nobody has read a sample
   of those citations against the action text they are supposed to support.** A sampled audit —
   say every `own` row whose citation is in a file other than the obvious one — is the cheapest
   way to find out whether this was one instance or a class.
7. **`maxWithoutAnatomy` 41.** Unmoved for several batches, and every component in it is a
   component whose keyboard contract cannot be checked at all, because this whole gate is keyed
   on having an anatomy.
