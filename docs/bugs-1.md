# dzup-ui — Component Bug Backlog (browser QA of the pre-existing library)

> Findings from driving the live Storybook (`http://localhost:6006`) with Playwright
> and exercising every story for the components that are **not** documented in
> `docs/features.md` or `docs/new-features.md` (i.e. the ~95 pre-existing core
> components, as opposed to the 38 gap-analysis components already covered in
> `docs/bugs.md`). Each component was checked across **appearance, behavior, state,
> props, slots, expose, and accessibility**.
>
> **Method:** loaded all 1066 pre-existing-component stories in `/iframe.html`,
> captured console/page errors and Storybook render-error overlays, ran axe-core
> (WCAG 2.0/2.1 A/AA) on every story, and scripted the documented interactions
> (keyboard, pointer, focus) while reading back DOM/ARIA state. Story play-function
> assertion failures (the authors' own checks running live in the browser) were
> harvested as additional signal.
>
> **Excluded as noise:** axe `color-contrast` hits on story-scaffolding labels and
> the outline button variant; `net::ERR_NAME_NOT_RESOLVED` on the DzImage/DzAvatar
> fallback demos (those stories use intentionally-broken remote URLs and fail only
> because the headless run is offline — the fallback behaviour itself is correct).
>
> **Status legend:** `[ ]` open · `[x]` fixed
>
> **Components exercised with no defects found** (appearance/behavior/state/props/
> slots/expose/a11y all checked): DzButton, DzButtonGroup, DzIconButton, DzCopyButton,
> DzToggleButton, DzCard, DzImageCard, DzStatCard, DzChip, DzTag, DzAccordion,
> DzTimeline, DzTimelineItem, DzList, DzListItem, DzDataGrid, DzTable, DzAlert,
> DzBadge, DzEmpty, DzResult, DzProgress, DzSpinner, DzSkeleton, DzNotification,
> DzRunStatusBadge, DzTokenProgressBar, DzAsyncBoundary, DzErrorBoundary, DzCheckbox,
> DzCheckboxGroup, DzRadio, DzRadioGroup, DzSwitch, DzSlider, DzRangeSlider,
> DzColorPicker, DzDatePicker, DzDateRangePicker, DzTimePicker, DzCombobox,
> DzMultiSelect, DzFileUpload, DzTransfer, DzFieldArray, DzPersonaSelector,
> DzFormField, DzInput, DzInputGroup, DzPasswordInput, DzSearchInput, DzTextarea,
> DzAppShell, DzCollapse, DzContainer, DzDivider, DzFlex, DzGrid, DzStack,
> DzSplitter, DzResizable, DzAspectRatio, DzSpacer, DzScrollArea (component OK; one
> broken story below), DzAvatar, DzAvatarGroup, DzCarousel, DzIcon, DzImage,
> DzLightbox, DzBreadcrumb, DzMenu, DzPagination, DzSegmented, DzSidebar, DzStepper,
> DzStepperItem, DzPopover, DzTooltip, DzContextMenu, DzDropdownMenu, DzBlockquote,
> DzCaption, DzCode, DzCodeBlock, DzHeading, DzText.

---

# [x] B0 DzDialog — modal dialog exposes no `aria-modal` and has no accessible name

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA (ADR-07 Reka UI).</role>

<task>Fix DzDialog (packages/core/src/components/overlays/DzDialog*.vue) so its rendered modal content element exposes aria-modal="true" and is associated with its title via aria-labelledby (and with its description via aria-describedby). Today the open dialog has neither, so screen readers announce an unnamed, non-modal dialog.</task>

<observed>
  Story: Core/Overlays/DzDialog → Default (core-overlays-dzdialog--default), and confirmed on Sheet/ConfirmDialog which share DzDialogContent.
  - With the dialog open, the role="dialog" content element renders these attributes only: data-dismissable-layer, tabindex="-1", class, role="dialog", data-state="open", style. There is NO aria-modal, NO aria-labelledby, NO aria-describedby.
  - A DzDialogTitle ("Dialog Title") and DzDialogDescription are present in the DOM, but the dialog's accessible name resolves to empty because aria-labelledby is never wired to the title's id.
  - The DzDialog/DzSheet/DzConfirmDialog "Interactive", "Accessibility: Focus Management" and "Interactive: Confirm Flow" play functions all fail live in the browser on `expect(dialog).toHaveAttribute("aria-modal","true")` — the authors expect aria-modal and it is absent.
  - Root cause: DzDialogTitle correctly wraps Reka's DialogTitle (whose comment says "Reka UI auto-sets aria-labelledby on the dialog content"), but DzDialogContent.vue passes `:aria-labelledby="ariaLabelledby"` (and `:aria-describedby`, `:aria-label`) where those props default to `undefined`, plus `v-bind="{ ...$attrs, class: undefined }"`. Binding `aria-labelledby` to `undefined` removes the attribute and clobbers Reka's automatic association; the modal aria-modal is likewise not surfaced.
  - Focus trap and Escape-to-close DO work (Tab cycles within the dialog; Escape closes and returns focus to the trigger), so only the ARIA semantics are wrong.
</observed>

<requirements>
  - The open modal content must expose aria-modal="true" when the dialog is modal (the DzDialog `modal` prop defaults to true).
  - When a DzDialogTitle is present, the content's aria-labelledby must resolve to that title's id (accessible name = the title text); when a DzDialogDescription is present, aria-describedby must resolve to it. Preserve Reka's automatic wiring instead of overriding it.
  - Only forward `aria-label`/`aria-labelledby`/`aria-describedby` to DialogContent when the corresponding prop is actually provided — do not bind them to `undefined` (which strips Reka's auto-generated values). Apply the same fix to DzSheetContent.
  - Do not regress the working focus trap, Escape/outside-click dismissal, focus return, or transitions.
</requirements>

<steps>
  1. Reproduce: open the Default story, inspect the role="dialog" element, and confirm aria-modal/aria-labelledby/aria-describedby are absent while a DzDialogTitle exists in the DOM.
  2. In DzDialogContent.vue (and DzSheetContent.vue) stop binding aria-* to undefined — conditionally spread them only when defined — and verify Reka's auto aria-labelledby/aria-describedby and aria-modal survive.
  3. Verify in the browser: the open dialog reports aria-modal="true" and an accessible name equal to the title text across Default, With Custom Slot Content, and Real World: Form Dialog.
  4. Re-run the DzDialog/DzSheet/DzConfirmDialog play functions and confirm the aria-modal assertions pass; add a contract/a11y test asserting aria-modal + resolved aria-labelledby on the open content.
</steps>
```

---

# [x] B1 DzSheet — sheet content exposes no `aria-modal` and has no accessible name

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA.</role>

<task>Fix DzSheet (packages/core/src/components/overlays/DzSheet*.vue) so the open sheet (a role="dialog" surface) exposes aria-modal="true" and is labelled by its DzSheetTitle via aria-labelledby. This is the same defect class as B0 and likely shares the DzSheetContent attribute-binding pattern.</task>

<observed>
  Story: Core/Overlays/DzSheet → Default (core-overlays-dzsheet--default).
  - With the sheet open, the role="dialog" element renders: data-dismissable-layer, tabindex="-1", class ("fixed z-50 …"), data-side="right", role="dialog", data-state="open", style. There is NO aria-modal, NO aria-labelledby, NO aria-describedby.
  - A "Sheet Title" heading is present in the DOM but is not associated as the accessible name, so the sheet's name resolves to empty.
  - Escape closes the sheet and returns focus to the trigger correctly; focus is moved into the sheet on open. Only the ARIA semantics are wrong.
</observed>

<requirements>
  - The open sheet must expose aria-modal="true" (DzSheet is modal) and an accessible name from its DzSheetTitle via aria-labelledby; wire aria-describedby to DzSheetDescription when present.
  - In DzSheetContent.vue, forward aria-label/aria-labelledby/aria-describedby only when explicitly provided so Reka's automatic association (and aria-modal) is not stripped by undefined bindings.
  - Keep the side variants, focus management, Escape/outside-click dismissal, and transitions intact.
</requirements>

<steps>
  1. Reproduce: open the Default and Side Gallery stories, inspect the role="dialog" element, confirm aria-modal/aria-labelledby absent.
  2. Apply the same conditional-aria-binding fix as B0 to DzSheetContent.vue.
  3. Verify the open sheet reports aria-modal="true" and a title-derived accessible name across Default, Side Gallery, With Rich Slot Content, and Real World: Mobile Navigation.
  4. Add an a11y/contract test asserting aria-modal + resolved aria-labelledby on the open sheet.
</steps>
```

---

# [x] B2 DzConfirmDialog — `confirm`/`cancel` functions leak onto the dialog DOM node as string attributes

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly.</role>

<task>Fix DzConfirmDialog (packages/core/src/components/overlays/DzConfirmDialog.vue) so handler functions passed by consumers are never serialized onto a real DOM element. Today the open confirm dialog's role="dialog" element carries `confirm="function(...args){…}"` and `cancel="function(...args){…}"` attributes — raw function source rendered into the HTML. (It also shares the missing-aria-modal / no-accessible-name defect from B0.)</task>

<observed>
  Story: Core/Overlays/DzConfirmDialog → Default (core-overlays-dzconfirmdialog--default).
  - When the dialog opens, the role="dialog" content element's attribute list includes `confirm="function(...args) { var _a…"` and `cancel="function(...args) { var _a…"` — both are the stringified handler functions, plus role, data-state, etc.
  - DzConfirmDialog declares `confirm` and `cancel` as EMITS (DzConfirmDialogEmits), not props. It renders `<DzDialogContent v-bind="{ ...$attrs, class: undefined }">`. When the story (or any consumer) binds the handlers as attribute-style bindings rather than `@confirm`/`@cancel` listeners, the function values fall through `$attrs` and are spread straight onto DzDialogContent → onto Reka's DialogContent → onto the DOM, where Vue serializes the function as a string attribute.
  - Functionally the buttons still work, but the dialog DOM is polluted with executable-source attributes (invalid HTML, larger DOM, potential info leak of handler internals).
</observed>

<requirements>
  - The open confirm dialog's content element must not carry any `confirm`/`cancel` (or other function-valued) attributes. Function-valued fallthrough attrs must never reach a DOM element.
  - Either consume `confirm`/`cancel` strictly as emits and filter non-DOM-safe entries out of the `$attrs` spread before forwarding to DzDialogContent, or stop spreading arbitrary `$attrs` onto the content node. Keep legitimate pass-through attributes (id, class, data-*, aria-*) working.
  - Fix the Default/relevant DzConfirmDialog stories to wire the handlers via `@confirm`/`@cancel` (not as serialized args) so the demo matches the documented API.
  - Roll the B0 aria-modal + accessible-name fix into this component's open content as well (it composes DzDialogContent).
</requirements>

<steps>
  1. Reproduce: open the Default story, inspect the role="dialog" element, and confirm the `confirm=`/`cancel=` function attributes are present.
  2. Filter function-valued entries from the spread (or drop the spread) in DzConfirmDialog.vue; ensure emits still fire on button click.
  3. Update DzConfirmDialog.stories.ts to use `@confirm`/`@cancel` listeners and remove any function values from serialized `args`.
  4. Verify in the browser that no function attributes appear on the dialog node and the confirm/cancel emits still fire; add a test asserting the content node has no `confirm`/`cancel` attribute.
</steps>
```

---

# [x] B3 DzCommandPalette — Escape does not close the palette

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA.</role>

<task>Make Escape dismiss DzCommandPalette (packages/core/src/components/overlays/DzCommandPalette.vue). Today pressing Escape never closes the palette — it only clears the search query — so a keyboard user cannot dismiss it with the standard key.</task>

<observed>
  Story: Core/Overlays/DzCommandPalette → Default (core-overlays-dzcommandpalette--default).
  - Open the palette (focus lands on the search input, role="dialog" + role="listbox" visible).
  - Press Escape immediately with an empty query: the palette stays open (role="dialog" still rendered, focus still in the input).
  - Type a query ("xyz"), then press Escape: the query is cleared to empty but the palette remains open.
  - So Escape clears the query when non-empty and otherwise does nothing; there is no key path that closes the overlay. (By contrast DzDialog/DzSheet/DzPopover all close on Escape.)
</observed>

<requirements>
  - Escape must close the command palette. Either: (a) close immediately on Escape regardless of query; or (b) if you intentionally adopt the "first Escape clears query, second Escape closes" pattern, then Escape on an already-empty query MUST close it. Pick one, implement it, and document it.
  - Keep focus return to the trigger on close (reuse useEscapeKey if the palette is built on the shared overlay/dialog primitive).
  - Do not regress search filtering, arrow-key navigation, Enter-to-run, or outside-click dismissal.
</requirements>

<steps>
  1. Reproduce: open the Default story, press Escape with an empty query, observe it stays open.
  2. Locate the keydown handling in DzCommandPalette.vue (and any wrapped Reka primitive). Ensure Escape propagates to a close path when the query is empty.
  3. Verify in the browser across Default, With Keyboard Shortcuts, and Real World: IDE Command Palette that Escape closes the palette and returns focus to the trigger.
  4. Add a test for Escape-closes (empty and non-empty query) and for focus return.
</steps>
```

---

# [x] B4 DzTabs — the active tab is not keyboard-reachable (no roving tabindex="0")

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA (APG Tabs pattern).</role>

<task>Fix DzTabs (packages/core/src/components/navigation/DzTabs.vue) so the tablist participates in the keyboard tab sequence. Today every tab trigger has tabindex="-1" — including the selected one — so a keyboard user pressing Tab skips the entire tablist and can never reach or operate the tabs without a pointer.</task>

<observed>
  Story: Core/Navigation/DzTabs → Default (core-navigation-dztabs--default).
  - The three role="tab" elements report tabindex "-1, -1, -1" while aria-selected is "true, false, false". The active tab ("Account") has tabindex="-1" instead of the required tabindex="0".
  - Because no tab has tabindex="0", there is no roving-tabindex entry point: pressing Tab from before the tablist moves focus straight past all tabs.
  - When focus is forced onto a tab programmatically, ArrowRight DOES move selection/focus correctly (Account → Password), so the arrow-key model works — only the tab-stop is missing.
</observed>

<requirements>
  - Apply APG roving tabindex: exactly one tab has tabindex="0" at a time (the active tab, or the focused tab in a manual-activation model) and all others have tabindex="-1". Tab/Shift+Tab must be able to land on that one tab.
  - Keep the existing ArrowLeft/Right (and ArrowUp/Down for vertical orientation), Home/End, and selection behavior intact.
  - Verify the Vertical Orientation and Disabled Tab stories: a disabled tab must be skipped by arrow navigation and must not be the tabindex="0" entry.
</requirements>

<steps>
  1. Reproduce: open the Default story, read tabindex on all role="tab" elements, confirm none is "0".
  2. Fix the tabindex assignment in DzTabs.vue (or the wrapped Reka Tabs trigger) so the active/focused tab gets tabindex="0".
  3. Verify in the browser: Tab reaches the active tab, ArrowRight/Left move between tabs, the tablist is fully keyboard-operable across Default, Vertical Orientation, and Disabled Tab.
  4. Add a contract/a11y test asserting exactly one tab has tabindex="0" and it is the active tab.
</steps>
```

---

# [x] B5 DzTree — treeitems are not keyboard-navigable (no roving tabindex, no aria-level, arrows do nothing)

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA (APG Tree View pattern).</role>

<task>Fix DzTree (packages/core/src/components/data/DzTree.vue + DzTreeItem.vue) so the tree is operable by keyboard and exposes structural semantics. Today treeitems have no tabindex (no roving focus), no aria-level, and Arrow keys do not move between nodes. This is the base component behind DzTreeSelect, so fixing it also addresses the composed-widget gaps noted in docs/bugs.md (B1).</task>

<observed>
  Story: Core/Data/DzTree → Default (core-data-dztree--default) and With Selection.
  - The role="treeitem" elements have no `tabindex` attribute at all (none is "0", none is "-1") — there is no roving-tabindex entry point and the items are not in the focus order.
  - Treeitems have no `aria-level` (depth is not exposed to assistive tech); aria-setsize/aria-posinset are likewise absent.
  - Focusing the first item then pressing ArrowDown does not move focus (it stays on the first node); ArrowRight does not move/expand focus either. So roving keyboard navigation is non-functional.
  - axe additionally reports aria-required-children / listitem / aria-toggle-field-name issues on the tree, consistent with the structure not following the tree role contract.
</observed>

<requirements>
  - Implement APG roving tabindex inside role="tree": exactly one treeitem has tabindex="0" at a time; the rest are tabindex="-1". Tab lands on that node; ArrowUp/Down move focus between visible nodes; ArrowRight expands a collapsed node (or moves to first child), ArrowLeft collapses (or moves to parent); Home/End jump to first/last; type-ahead optional.
  - Add aria-level (1-based depth) to every treeitem; add aria-setsize/aria-posinset per sibling group where practical.
  - Ensure the expand/collapse control exposes an accessible name (resolve the axe aria-toggle-field-name finding) and the tree/treeitem role children contract is satisfied.
  - Enter/Space activates selection (where the tree is selectable); keep the existing checkbox and selection modes working. Mouse expansion must reach the same end state as keyboard.
</requirements>

<steps>
  1. Reproduce: open the Default story, focus the first treeitem, press ArrowDown — observe focus does not move; inspect tabindex (absent) and aria-level (absent).
  2. Implement roving-tabindex focus management and arrow-key navigation in DzTree/DzTreeItem; add aria-level/setsize/posinset from the node depth.
  3. Verify in the browser across Default, With Selection, With Checkboxes, and Real World: File Explorer that arrow keys traverse/expand nodes and a single node holds tabindex="0".
  4. Add contract/a11y tests asserting one tabindex="0" treeitem, aria-level present per node, and ArrowDown/Right/Left navigation. Re-check that DzTreeSelect inherits the fix.
</steps>
```

---

# [x] B6 DzOtpInput — renders one extra (length+1) stray focusable input

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA.</role>

<task>Fix DzOtpInput (packages/core/src/components/inputs/DzOtpInput.vue) so it renders exactly `length` input cells. Today a configured length of 6 produces 7 `<input>` elements: the 6 real cells plus an extra ~1px-wide text input that is still in the tab order, adding a stray tab stop and breaking cell-count semantics.</task>

<observed>
  Story: Core/Inputs/DzOtpInput → Default (length=6) and Interactive: Complete Event (length=6).
  - querySelectorAll('input') returns 7 elements. Inputs #0–#5 are the visible 40px cells (inputmode="numeric"). Input #6 is ~1px wide, has no inputmode, and is not aria-hidden — it is a real, focusable text input appended after the cells.
  - The Interactive story's own play function fails live in the browser: `expect(cells.length).toBe(6)` receives 7.
  - The extra input creates an unexpected Tab stop after the last cell and confuses any code/test that counts cells; the 6-cell entry/paste/backspace flow itself works.
</observed>

<requirements>
  - For length=N, expose exactly N focusable OTP cells and no stray extra input. If a hidden mirror/aggregate input is genuinely needed (e.g. for form submission), it must be removed from the tab order (tabindex="-1") and hidden from assistive tech (aria-hidden="true") and not counted as a cell.
  - The Tab sequence must move first-cell → … → last-cell with no extra stop afterward.
  - Keep numeric/text modes, masking, paste-to-fill, backspace navigation, the `complete` emit, sizes, and disabled/readonly intact.
</requirements>

<steps>
  1. Reproduce: open the Default story, count inputs (7 for length=6), and identify the ~1px extra input (#6).
  2. In DzOtpInput.vue (and the Reka PinInput wiring, if used) remove or properly hide the extra input so only N cells render and are focusable.
  3. Verify in the browser that length=4/6/8 render exactly that many cells, Tab stops only on cells, and the Interactive play assertion (`cells.length === 6`) passes.
  4. Add a test asserting cell count equals `length` and that no extra focusable input exists.
</steps>
```

---

# [x] B7 DzNumberInput — stepper buttons at min/max are styled/aria disabled but remain operable

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA.</role>

<task>Make DzNumberInput (packages/core/src/components/inputs/DzNumberInput.vue) consistent at the value bounds. Today, at min (and symmetrically at max) the decrease/increase stepper is given aria-disabled="true" and a disabled style class but is not actually disabled — it stays focusable and clickable, so its visual/ARIA state contradicts its interactivity.</task>

<observed>
  Story: Core/Inputs/DzNumberInput → Interactive (min=0).
  - At the lower bound (value 0) the "Decrease value" button reports aria-disabled="true" and carries the `dz-disabled-button` class, but it has no `disabled` attribute. It remains in the tab order and accepts clicks (clicks are no-ops because the value is correctly clamped at 0).
  - The story's own play function fails live in the browser: `expect(decreaseButton).toBeDisabled()` reports "Received element is not disabled" for the aria-disabled button.
  - Value clamping at the bound works; the defect is the inconsistent disabled semantics (and the resulting confusing state for keyboard/SR users who can still focus/activate a button presented as disabled).
</observed>

<requirements>
  - At a bound, pick ONE coherent model for the stepper and apply it consistently to both decrease and increase:
    (a) Truly disable the button at the bound (`disabled`), removing it from the tab order and making clicks impossible; OR
    (b) Keep it focusable with aria-disabled="true" per APG, but then it must NOT be presented as a fully disabled control elsewhere, and the story/contract test must assert aria-disabled rather than `disabled`.
  - Whichever model is chosen, the visual style, the ARIA state, the actual interactivity, and the story play assertion must all agree.
  - Keep value clamping, keyboard increment/decrement on the field, step, and the `min`/`max` props working.
</requirements>

<steps>
  1. Reproduce: open the Interactive story, drive the value to 0, inspect the decrease button (aria-disabled="true", `dz-disabled-button` class, no `disabled` attribute), and confirm it is still focusable.
  2. Decide on model (a) or (b) and implement it for both stepper buttons at both bounds in DzNumberInput.vue.
  3. Align DzNumberInput.stories.ts play assertions with the chosen model and verify they pass in the browser.
  4. Add/extend a test asserting the stepper's disabled semantics at min and max are internally consistent.
</steps>
```

---

# [x] B8 DzScrollArea — "Real World: Code Block" story crashes to the error screen

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly.</role>

<task>Fix the DzScrollArea "Real World: Code Block" story (packages/core/stories/layout/DzScrollArea.stories.ts → RealWorldCodeBlock / core-layout-dzscrollarea--real-world-code-block) so it renders. Today it crashes to Storybook's "Error rendering story" screen because the code sample it intends to DISPLAY contains a live Vue interpolation that the outer render template evaluates. The DzScrollArea component itself is fine.</task>

<observed>
  Story: Core/Layout/DzScrollArea → Real World: Code Block.
  - On load the canvas is replaced by Storybook's error display and the console logs: `Error rendering story 'core-layout-dzscrollarea--real-world-code-block': TypeError: Cannot read properties of undefined (reading 'name')`.
  - Cause: the story's `render()` template string puts an example code listing inside `<pre><code>…</code></pre>`. The example's surrounding tags are HTML-entity-escaped (`&lt;DzContainer&gt;` etc.) and render as literal text, BUT the example also contains the mustache `{{ item.name }}` (inside a `v-for="item in items"` snippet) which is NOT escaped. The outer Storybook render template therefore treats `{{ item.name }}` as a real interpolation and evaluates `item.name`; `item`/`items` do not exist in the render scope, so it throws "Cannot read properties of undefined (reading 'name')".
  - Every other DzScrollArea story (Orientation Gallery, Scrollbar Type Gallery, Horizontal Tag List, Real World: Chat Messages, Interactive: Overflow Scroll, etc.) renders and scrolls correctly.
</observed>

<requirements>
  - The Code Block story must render the example verbatim without the outer template evaluating it. Make the displayed code inert — e.g. wrap the `<pre>`/`<code>` in `v-pre`, or escape the mustaches (`&lbrace;&lbrace; item.name &rbrace;&rbrace;` / `{{ '{{' }} item.name {{ '}}' }}`), or move the sample into a plain string constant bound with `v-text`.
  - After the fix, the story shows the code sample as text inside a scrollable DzScrollArea (no error screen, no console TypeError) and both scrollbars work for the overflowing code.
  - Sweep the other story files for the same pattern (a Vue mustache inside a displayed code/`<pre>` block) and apply the same inert-rendering fix where present.
</requirements>

<steps>
  1. Reproduce: open the Real World: Code Block story and observe the error screen + the `reading 'name'` TypeError.
  2. Make the `<pre><code>` sample inert (v-pre or escaped mustaches) in DzScrollArea.stories.ts.
  3. Verify in the browser that the story renders the code sample and scrolls in both directions with no console error.
  4. Grep the stories for other un-escaped `{{ … }}` inside displayed code blocks and fix any matches.
</steps>
```

---

# [x] B9 DzSelect — the combobox trigger has no accessible name

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA.</role>

<task>Give the DzSelect trigger (packages/core/src/components/forms/DzSelect.vue) a proper accessible name. Today the `<button role="combobox">` trigger has no accessible name, so axe-core flags `button-name` (impact: serious) on every DzSelect story and screen readers announce an unnamed combobox.</task>

<observed>
  Story: Core/Forms/DzSelect → Default (core-forms-dzselect--default) — and 13 more DzSelect stories.
  - Running axe-core (button-name rule) on the open/closed Default story returns a violation whose node is the trigger: `<button id="v-0" … role="combobox" type="button" aria-controls="reka-s…">` with no accessible name. The trigger has no aria-label and no aria-labelledby.
  - The placeholder text ("Select a fruit…") is rendered inside the button, but it is not exposed as the button's accessible name per axe's computation, so the control resolves to an empty name.
  - The violation is systemic: it fires on Default, Variant Gallery, Size Gallery, Disabled, Disabled Items, Invalid State, States, Custom Slots, Dark Mode Preview, Interactive, and Real World: Country Selector. (DzCombobox shows the related aria-input-field-name finding — review it in the same pass.)
</observed>

<requirements>
  - The DzSelect trigger must have a stable accessible name regardless of whether a value is selected. Wire it via the form field label (aria-labelledby to a DzFormField/label id) when present, and/or accept and forward an `ariaLabel` prop; ensure the placeholder/selected value text actually contributes to the accessible name (not aria-hidden).
  - After the fix, axe `button-name` must pass on all DzSelect stories and a screen reader must announce a named combobox plus its current value.
  - Do the same review for DzCombobox's aria-input-field-name finding so the form-control family is consistent.
  - Do not change the visual trigger, the listbox open/close, keyboard selection, or the variant/size styling.
</requirements>

<steps>
  1. Reproduce: open the Default story and run axe button-name (or inspect the role="combobox" button) — confirm no accessible name.
  2. Add label/aria wiring in DzSelect.vue (and verify DzFormField association) so the trigger always has a name.
  3. Verify in the browser with axe across the DzSelect stories that button-name passes, and that the name reflects label + value.
  4. Add an a11y test asserting the trigger has a non-empty accessible name with and without a selected value.
</steps>
```

---

# [x] B10 DzSplitButton — loading/disabled state produces a button with no accessible name

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly and meet WCAG AA.</role>

<task>Ensure every DzSplitButton control keeps an accessible name in all states (packages/core/src/components/buttons/DzSplitButton.vue). Today, in the loading/disabled states, a button renders with no accessible name, which axe-core flags as `button-name` (impact: serious).</task>

<observed>
  Stories: Core/Buttons/DzSplitButton → Loading (core-buttons-dzsplitbutton--loading) and States (core-buttons-dzsplitbutton--states).
  - axe `button-name` fires on both stories. Enumerating the visible buttons in the States story yields one `<button>` with an empty accessible name (no text, no aria-label) alongside the correctly-named "Save" main action and "More options" toggle.
  - In the Default story both parts are named ("Save" main, "More save options" toggle with aria-haspopup="true"), so the defect is specific to the loading/disabled rendering — the main action's label appears to be replaced by a spinner without preserving an accessible name.
</observed>

<requirements>
  - In the loading state, the main action button must retain an accessible name (e.g. keep the visible label next to the spinner, or supply an aria-label / visually-hidden label such as "Saving…"). The same must hold for the dropdown toggle in every state.
  - After the fix, axe `button-name` passes on the Loading and States stories, and a screen reader announces a name for both the main action and the toggle while loading/disabled.
  - Do not change the split layout, the dropdown behavior, or the disabled styling.
</requirements>

<steps>
  1. Reproduce: open the States and Loading stories, enumerate buttons, and find the one with an empty accessible name; confirm axe button-name fires.
  2. Preserve an accessible name in the loading/disabled rendering in DzSplitButton.vue (and DzButton's loading path if the label is dropped there).
  3. Verify in the browser with axe that button-name passes across Default, Loading, States, and any icon-only split-button story.
  4. Add an a11y test asserting both split-button parts have non-empty accessible names while loading and disabled.
</steps>
```

---

# [x] B11 DzToast — "Interactive: Dismiss" flow renders no trigger and never shows the expected toast

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in CLAUDE.md exactly.</role>

<task>Fix the DzToast "Interactive: Dismiss" story/flow (packages/core/stories/feedback/DzToast.stories.ts → core-feedback-dztoast--interactive-dismiss) so the toast it is meant to demonstrate actually appears and can be dismissed. Today the story's play function fails live in the browser and no usable trigger renders in the canvas, so the show/dismiss interaction cannot be exercised.</task>

<observed>
  Story: Core/Feedback/DzToast → Interactive: Dismiss.
  - The story's play function fails with `TestingLibraryElementError: Unable to find an element with the text: Changes saved.` — the expected toast text never appears.
  - Enumerating visible buttons in the canvas (excluding Storybook's own hidden controls) returns an empty list: there is no visible "show toast" trigger to click, so the documented dismiss flow has no entry point.
  - Other DzToast stories and DzToastParts render their toast content; the defect is specific to this interactive show/dismiss demo (either the trigger is not rendered, the toast provider/viewport is missing, or the show call does not mount the toast).
</observed>

<requirements>
  - The Interactive: Dismiss story must render a working trigger that shows a toast containing the expected text ("Changes saved."), and the toast must be dismissable (auto-dismiss and/or an explicit close control) so the play function passes.
  - Ensure the toast provider/viewport required by DzToast is present in the story setup; confirm the show API used by the demo actually mounts a toast into the live DOM.
  - Verify aria-live/role semantics on the shown toast (status vs alert) remain correct and that focus is not stolen on show.
</requirements>

<steps>
  1. Reproduce: open the Interactive: Dismiss story, observe no visible trigger and the play failure ("Changes saved." not found).
  2. Determine whether the trigger/provider is missing in the story or whether the component's show path fails to mount; fix the responsible layer (story setup and/or DzToast.vue).
  3. Verify in the browser that clicking the trigger shows the "Changes saved." toast and that it can be dismissed, and that the play function passes.
  4. Add/restore a test for the show→dismiss cycle and the toast's aria-live semantics.
</steps>
```
