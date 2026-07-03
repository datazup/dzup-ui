# dzup-ui — Component Bug Backlog (browser QA against `docs/features.md`)

> Findings from driving the live Storybook (`http://localhost:6006`) with Playwright
> and exercising every story for the 24 components in `docs/features.md`. Each
> component was checked across **appearance, behavior, state, props, slots, expose,
> and accessibility**.
>
> **Method:** loaded every story in `/iframe.html`, captured console/page errors,
> and scripted the documented interactions (keyboard, pointer, scroll) while reading
> back DOM/ARIA state. No story produced a console error or render crash — all bugs
> below are interaction/accessibility defects.
>
> **Status legend:** `[ ]` open · `[x]` fixed
> **Components that passed clean (no bugs):** DzRating, DzCalendar, DzTour,
> DzTagsInput, DzMention, DzKnob, DzFab/DzSpeedDial, DzToolbar, DzMegaMenu,
> DzDataView, DzDescriptions, DzOrderList, DzMeterGroup, DzPanel, DzAnchor,
> DzBackTop, DzFloatLabel, DzBlockUI, DzQRCode, DzWatermark.

---

# [x] B0 DzTreeSelect — collapsed parent nodes cannot be expanded with the mouse

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/features.md exactly.</role>

<task>Fix DzTreeSelect (packages/core/src/components/forms/DzTreeSelect.*) so a mouse user can expand any collapsed parent node to reveal its children. Today, clicking a collapsed parent — including its expand chevron — commits a selection and closes the overlay instead of expanding the node.</task>

<observed>
  Story: Core/Forms/DzTreeSelect → Single (core-forms-dztreeselect--single).
  The panel opens with "Fruit" pre-expanded (Apple, Banana, Citrus) plus collapsed "Vegetable" and "Citrus".
  - Clicking anywhere on the "Vegetable" row closes the whole panel (the node is treated as a selection/commit in single mode), so its children "Carrot"/"Potato" are never reachable.
  - Clicking precisely on the chevron SVG of a collapsed node also closes the panel — the chevron's click is not separated from the row's select handler and does not stop propagation.
  - Proof the data/logic is fine: focusing the "Vegetable" treeitem and pressing ArrowRight DOES expand it (item count 6 → 8, adding Carrot/Potato). Only the pointer path is broken.
</observed>

<requirements>
  - Clicking a node's expand/collapse chevron must toggle aria-expanded on that treeitem and must NOT commit a selection or close the overlay (call stopPropagation on the toggle control).
  - Decide and implement the intended row-click semantics for parent nodes consistently: either (a) clicking a parent row expands/collapses it (leaf rows select), or (b) the chevron is the sole expand affordance and clicking a parent row selects it — but in case (b) the chevron must still work (it currently does not). Match the behavior described in docs/features.md ("type-to-search filter prunes the tree; closes on select in single mode").
  - Mouse and keyboard expansion must reach the same end state.
</requirements>

<steps>
  1. Reproduce in the browser: open the Single story, click the "Vegetable" chevron, observe the panel closing instead of expanding.
  2. Locate the row/chevron click handlers in DzTreeSelect.vue (and any composed DzTree usage). Separate the expand-toggle handler from the select/commit handler and stop propagation on the toggle.
  3. Verify: clicking the chevron of "Vegetable" and "Citrus" expands them in place (panel stays open, children render); clicking a leaf still selects and closes in single mode.
  4. Add/extend tests in DzTreeSelect.spec.ts for pointer-driven expansion of a collapsed parent.
</steps>
```

---

# [x] B1 DzTreeSelect — tree panel violates the ARIA tree/combobox keyboard pattern

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in docs/features.md exactly and meet WCAG AA.</role>

<task>Make DzTreeSelect's overlay conform to the ARIA combobox-with-tree pattern. Several required semantics for keyboard and screen-reader users are missing.</task>

<observed>
  Story: Core/Forms/DzTreeSelect → Single.
  - The trigger correctly exposes role="combobox", aria-haspopup="tree", aria-expanded, and aria-controls.
  - BUT every treeitem carries tabindex="0" (all 6 nodes are in the tab sequence) instead of a single roving tabindex="0" with the rest at tabindex="-1".
  - treeitems are missing aria-level (and have no aria-setsize/aria-posinset), so depth is not exposed to assistive tech.
  - The combobox never sets aria-activedescendant, and pressing ArrowDown while the trigger is focused does not move focus/active node into the tree (focus stays on the combobox button).
</observed>

<requirements>
  - Apply roving tabindex inside role="tree": exactly one treeitem has tabindex="0" at a time; Arrow Up/Down move it; the rest are tabindex="-1".
  - Add aria-level to every treeitem reflecting its depth (1-based); add aria-setsize/aria-posinset per group where practical.
  - From the focused combobox trigger, ArrowDown (and ArrowUp) must open the panel if closed and move the active treeitem into view; expose the active node via aria-activedescendant on the combobox per the APG combobox pattern.
  - Keep existing ArrowLeft/ArrowRight collapse/expand behavior (already working) intact.
</requirements>

<steps>
  1. Audit how DzTreeSelect composes DzTree; prefer fixing the shared tree keyboard/roving-tabindex logic so DzTree benefits too.
  2. Implement roving tabindex + aria-level + aria-activedescendant wiring.
  3. Verify with the browser: Tab into the trigger, press ArrowDown to enter the tree, arrow through nodes, and confirm a screen-reader announces level and position.
  4. Add contract/a11y tests asserting one tabindex=0 node, aria-level present, and aria-activedescendant updates on navigation.
</steps>
```

---

# [x] B2 DzCascader — incomplete combobox keyboard/semantics on the trigger

```xml
<role>You are a Vue 3 + TypeScript accessibility-focused component engineer in dzup-ui. Follow the repo conventions in docs/features.md exactly.</role>

<task>Complete the combobox semantics on the DzCascader trigger (packages/core/src/components/forms/DzCascader.*). Column navigation already works well; two trigger-level gaps remain.</task>

<observed>
  Story: Core/Forms/DzCascader → Default (core-forms-dzcascader--default).
  Working: aria-haspopup="listbox" and aria-expanded on the trigger; Enter and Space open the panel and move focus onto the first option ("China"); once an option is focused, ArrowUp/Down move within a column, ArrowRight enters the child column, ArrowLeft returns; click expansion, changeOnSelect, and the flat filterable search all behave correctly.
  Gaps:
  - The trigger element has no role="combobox" (it exposes aria-haspopup/aria-expanded but no role), so it is not announced as a combobox. (Note: the sibling DzTreeSelect trigger DOES set role="combobox" — make them consistent.)
  - Pressing ArrowDown while the trigger is focused does nothing (panel stays closed). The combobox convention is that ArrowDown opens the panel and focuses the first option, just as Enter/Space already do.
</observed>

<requirements>
  - Add role="combobox" to the DzCascader trigger with the existing aria-expanded/aria-controls wiring.
  - Make ArrowDown (and ArrowUp) on the focused trigger open the panel and place focus on the first (or last) option, matching the Enter/Space behavior.
  - Do not regress the existing, working column keyboard navigation or the Enter/Space open path.
</requirements>

<steps>
  1. Reproduce: focus the trigger, press ArrowDown, observe nothing happens; inspect the trigger element and confirm role is absent.
  2. Add role="combobox" and an ArrowDown/Up open handler on the trigger in DzCascader.vue.
  3. Verify in the browser across Default, ChangeOnSelect, HoverExpand, and Filterable stories.
  4. Extend DzCascader.spec.ts with trigger-keyboard-open and role assertions.
</steps>
```

---

# [x] B3 DzAffix — "Affix Top" and "Affix Bottom" stories never pin (target/scroll-container mismatch)

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/features.md exactly.</role>

<task>Fix the DzAffix demos so the pinning behavior is actually demonstrable, and make DzAffix resilient when its slotted content lives inside a scrollable ancestor rather than the window.</task>

<observed>
  Stories in Core/Layout/DzAffix:
  - Affix Top (core-layout-dzaffix--affix-top) and Affix Bottom (core-layout-dzaffix--affix-bottom) place the DzAffix inside a `<div class="h-64 overflow-auto …">` panel but rely on the default `target` (window). The window never scrolls (content fits the viewport), so the affix never activates: scrolling the inner panel to any depth never produces a position:fixed element and the label stays "Scroll to pin me" / "Keep scrolling" — it never flips to "Pinned to top" / "Pinned to bottom".
  - Within Container (core-layout-dzaffix--within-container) passes `:target="getTarget"` (the panel) and works correctly: scrolling pins the toolbar (a position:fixed "Toolbar (pinned)" element appears and the data-affixed flag flips).
  So the component logic is sound; the two default stories are mis-wired and the documented behavior is not observable to anyone viewing them.
</observed>

<requirements>
  - Make the Affix Top and Affix Bottom sections demonstrably pin/unpin when the user scrolls them. Preferred fix: pass a `:target` that returns the surrounding `h-64 overflow-auto` panel (mirroring the Within Container story), since that is the scrollable region in the iframe.
  - Optionally (component-level hardening): when no explicit `target` is provided, detect the nearest scrollable ancestor of the affixed content and listen to it in addition to (or instead of) the window, so the "defaults to window" path still works when the content is nested in a scroller. If you change the default-target semantics, update the prop docs.
  - Keep the placeholder-prevents-layout-jump behavior and the `change` event intact.
</requirements>

<steps>
  1. Reproduce: open Affix Top, scroll the panel fully, confirm nothing ever pins.
  2. Update the Affix Top and Affix Bottom stories in packages/core/stories/layout/DzAffix.stories.ts to supply a container `:target` (as Within Container does), OR implement nearest-scrollable-ancestor detection in DzAffix.vue.
  3. Verify in the browser that both sections flip to their pinned label and render a fixed element while scrolled, and unpin when scrolled back.
  4. Add/extend tests covering the nested-scroll-container case.
</steps>
```

---

> ## Round 2 — `docs/new-features.md` components (TASK-NF-25 … 38)
>
> Browser QA driving the live Storybook (`http://localhost:6006`) with Playwright,
> exercising every story for the 14 Round-2 components across **appearance,
> behavior, state, props, slots, expose, and accessibility**. Each story was
> loaded in `/iframe.html`, console/page errors were captured, and the documented
> interactions (keyboard, pointer, scroll, resize) were scripted while reading
> back DOM/ARIA state.
>
> **Components that passed clean (no bugs):** DzInputMask, DzListbox,
> DzImageComparison, DzInfiniteScroll, DzCountdown, DzColorModeToggle, DzKbd,
> DzRelativeTime, DzScrollProgress, DzVisuallyHidden.

---

# [x] B4 DzPopconfirm — `icon`-prop stories crash to the Storybook error screen

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/new-features.md exactly.</role>

<task>Fix the DzPopconfirm stories (packages/core/stories/overlays/DzPopconfirm.stories.ts) so that the two stories which pass a Lucide icon component as a story `arg` render their canvas instead of the Storybook "Error rendering story" screen. The DzPopconfirm component itself is fine; the defect is that a raw functional component placed in `args` breaks Storybook's vue3 source-code generator.</task>

<observed>
  Stories: Core/Overlays/DzPopconfirm → Destructive Delete (core-overlays-dzpopconfirm--destructive-delete) and Async Confirm (core-overlays-dzpopconfirm--async-confirm).
  - Both stories declare `args: { ..., icon: Trash2 }` / `icon: AlertTriangle` (lucide-vue-next components). On load each logs `Error rendering story '…': TypeError: Cannot destructure property 'slots' of 'undefined' as it is undefined` originating in Storybook's `generateSingleChildSourceCode` (@storybook/vue3-vite) while it tries to serialise the Lucide component arg into a source snippet (the stack points at lucide-vue-next).
  - The canvas is REPLACED by Storybook's error display: the trigger button is not visible and the popover cannot be opened or exercised at all — these two stories are completely unusable in the browser.
  - Proof the component is sound: the Default, Custom Texts, Placement Matrix, and Interactive stories (which do NOT put a Lucide component in `args`) all work fully — open on trigger click, focus the confirm button on open, expose role="alertdialog" with resolving aria-labelledby, close on confirm/cancel/Escape/outside-click, return focus to the trigger, and the async-loading path keeps the popover open with a disabled spinner button until `loading` clears. DzIcon also renders a Lucide component correctly via `<component :is="icon">`, so the `icon` feature works when the component is provided through the render setup/slot rather than through `args`.
</observed>

<requirements>
  - Make Destructive Delete and Async Confirm render and be interactive in the browser (no "Error rendering story", no console TypeError).
  - Keep the leading-icon demonstration intact (the Trash2 / AlertTriangle glyph must still appear in the popover header when opened). Provide the icon to DzPopconfirm without placing the raw Lucide component in the serialised `args` — e.g. expose it from `setup()` and bind it in the template (`:icon="Trash2"`), and/or set `parameters.docs.source` / mark the `icon` argType so Storybook does not try to source-generate the component value.
  - Do not regress the working stories or the DzPopconfirm `icon` prop / `#icon` slot API.
</requirements>

<steps>
  1. Reproduce: open Destructive Delete, observe the error screen and the console TypeError from generateSingleChildSourceCode; confirm the trigger is not clickable.
  2. Refactor both stories to supply the icon via the render closure (return it from setup, bind `:icon` in the template) instead of via the top-level `args.icon`; remove the Lucide component from any serialised args.
  3. Verify in the browser that both stories render, the trigger opens the popover, the header glyph shows, and confirm/cancel/Escape all work — and that no "Error rendering story" message is logged.
  4. Sweep the rest of the library for the same pattern (a Lucide/functional component placed directly in a story's `args`) and apply the same fix where present.
</steps>
```

---

# [x] B5 DzMasonry — measured-JS path (`sequential: false`) collapses to a sliver

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/new-features.md exactly.</role>

<task>Fix DzMasonry (packages/core/src/components/layout/DzMasonry.*) so the measured-JS balancing path (`sequential: false`) fills its container width instead of collapsing to a narrow sliver when no explicit width is imposed by an ancestor.</task>

<observed>
  Stories: Core/Layout/DzMasonry → Image Wall (core-layout-dzmasonry--image-wall, args `sequential: false, columns: 4`) and Dark Mode Preview (which also uses the measured/flex path).
  - The masonry root in the measured path renders `display:flex` (masonryColumnContainer = `flex [gap:…]`) with each column `flex-1 min-w-0`. Because every flex child is `flex-1 min-w-0`, the container has NO intrinsic width, so under a shrink-to-fit ancestor (Storybook's `body.sb-main-centered`, which centers content with flex) it collapses: measured container width ≈ 100px, each of the 4 columns ≈ 13px, and the tiles render as thin vertical strips. Screenshot confirms the Image Wall is a centered column of ~13px-wide slivers rather than a 4-column image wall.
  - The CSS fast path is unaffected: Card Feed (`sequential: true`) and Responsive Columns (responsive `columns` object) use native `columns-N`, which establishes width from content and renders full-width (≈920px), with the column count correctly tracking the viewport (4 → 3 → 1 across 1280/800/500px).
  - So the bug is specific to the measured-JS flex container having no width when the ancestor does not impose one.
</observed>

<requirements>
  - The measured-JS path must fill the available inline size of its parent the same way the CSS path does (target: add `w-full` / `width:100%` to the `masonryColumnContainer` flex row, or otherwise give it an intrinsic/explicit width), so Image Wall and Dark Mode render as proper multi-column walls regardless of whether the ancestor is shrink-to-fit.
  - After the fix, the 4 columns in Image Wall must span the container with distinct, evenly distributed item x-positions (not ~29px apart), and resizing must still rebalance.
  - Do not regress the CSS fast path, the `gap` token mapping, the responsive `columns` object, or DOM/reading order.
</requirements>

<steps>
  1. Reproduce: open Image Wall, measure the container/column widths (container ≈100px, columns ≈13px) and screenshot the sliver layout.
  2. Add a width to the measured-path container (masonryColumn(s) variants in DzMasonry.variants.ts — e.g. `masonryColumnContainer` → `flex w-full …`) and re-check.
  3. Verify in the browser that Image Wall and Dark Mode fill the width with four balanced columns, and that ResizeObserver rebalancing still fires on viewport change.
  4. Add/extend tests asserting the measured container fills its parent width (not shrink-to-fit) and that items distribute across all columns.
</steps>
```

---

# [x] B6 DzAnimatedNumber — integer count-up shows fractional digits mid-tween

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/new-features.md exactly.</role>

<task>Fix DzAnimatedNumber (packages/core/src/components/data/DzAnimatedNumber.*) so a plain integer count-up renders whole numbers while animating, instead of showing fractional digits during the tween.</task>

<observed>
  Story: Core/Data/DzAnimatedNumber → Integer (core-data-dzanimatednumber--integer), which animates to 12,345 with no `format` prop.
  - Sampling the visible figure during the tween yields fractional values: "6,537.13", "7,986.171", "9,196.183", "10,193.985", "11,483.426", … before settling on "12,345". Each frame interpolates a float and formats it with a default `Intl.NumberFormat` (default `maximumFractionDigits: 3`), so the counter visibly flickers through `.13` / `.985` decimals — it reads as broken for an integer counter.
  - The settled value is correct (12,345) and the SR live region only announces the final value, so this is purely a mid-animation appearance defect on the visible (`aria-hidden`) figure.
  - For comparison, the Currency and Percent stories pass an explicit `format` with fixed fraction digits and look correct; Reduced Motion correctly snaps to the final value with no tween.
</observed>

<requirements>
  - During the tween, the displayed figure must respect the integer-ness of the value: when no fractional precision is requested (no `format`, or a `format` whose `maximumFractionDigits` is 0), round each interpolated frame to a whole number before formatting so the count-up steps through integers only.
  - When the consumer's `format` does request fraction digits (currency, percent, decimals), keep the current per-frame fractional formatting.
  - Do not change the final settled value, the SR live-region announcement, the reduced-motion snap, or the start/complete emits.
</requirements>

<steps>
  1. Reproduce: open the Integer story and sample the visible figure across the first second; observe the fractional frames.
  2. In the figure's per-frame formatting, derive the effective fraction-digit count from the resolved Intl options (or default to 0 when none is given) and round the interpolated value accordingly before `format()`.
  3. Verify in the browser that the Integer count-up shows only whole numbers while animating and still lands on 12,345, and that Currency/Percent are unchanged.
  4. Add/extend tests asserting integer-only frames for the no-format case and preserved fractional frames when `format` requests them.
</steps>
```

---

# [x] B7 DzAnimatedNumber — "On Scroll" story animates on load and never demonstrates `startOnView`

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/new-features.md exactly.</role>

<task>Fix the On Scroll story (packages/core/stories/data/DzAnimatedNumber.stories.ts → core-data-dzanimatednumber--on-scroll) so it actually demonstrates `startOnView`: the count-up should stay at its origin until the figure is scrolled into view.</task>

<observed>
  Story: Core/Data/DzAnimatedNumber → On Scroll (args `startOnView: true, value: 1_000_000`).
  - The figure begins counting immediately on load without any scrolling: reading the visible figure ~700ms after mount already shows "861,962.761" climbing toward 1,000,000.
  - Cause: the scroll frame is `<div class="h-[320px] overflow-auto">` containing a `h-[280px]` spacer followed by the number block. 280px spacer < 320px frame, so ~40px of the number block is already visible at load — the IntersectionObserver (default viewport root, clipped by the scroller) sees it intersecting and fires `startInitial()` straight away. The story's instruction "↓ Scroll down to trigger the count-up" is therefore never exercised.
  - The component's gating mechanism itself is sound (IntersectionObserver wiring, `displayValue = from` while waiting), so the fix is to make the demo place the figure genuinely below the fold.
</observed>

<requirements>
  - Make the spacer taller than the scroll frame (e.g. spacer height ≥ the frame's `h-[320px]`, or reduce the frame height) so the number block starts fully out of view and the count-up only begins after the user scrolls it into the frame.
  - After the fix, the figure must read its origin (`from`, default 0 → "0") before scrolling and only animate to 1,000,000 once scrolled into view.
  - Keep the rest of the story (formatting, label, size) intact.
</requirements>

<steps>
  1. Reproduce: open On Scroll, observe the figure already counting at load without scrolling.
  2. Increase the spacer height (or shrink the frame) so the number sits below the visible region initially.
  3. Verify in the browser that the figure shows "0" until scrolled into view, then counts up once revealed.
</steps>
```

---

# [x] B8 DzDeferredContent — "Repeat Observe" reveal counter never increments past 1 (misleading demo)

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow the repo conventions in docs/new-features.md exactly.</role>

<task>Resolve the contradiction in the Repeat Observe story (packages/core/stories/layout/DzDeferredContent.stories.ts → core-layout-dzdeferredcontent--repeat-observe): its "Mounted {{ reveals }} time(s)" counter is wired to `@load`, but DzDeferredContent emits `load` only once, so the counter stays at 1 even though the content correctly re-mounts on every entry. Either expose a per-reveal signal from the component or fix the demo to reflect the real (working) re-mount behavior.</task>

<observed>
  Story: Core/Layout/DzDeferredContent → Repeat Observe (args `once: false`).
  - The component's `once:false` behavior is correct: scrolling the block into view mounts it (`data-loaded`, content present), scrolling it away re-defers it (`data-loaded` cleared, `aria-busy="true"`, placeholder shown), and scrolling back re-mounts it. Verified across multiple enter/leave cycles.
  - BUT the story's counter "Mounted N time(s)" is bound to `@load="reveals++"`, and DzDeferredContent guards `load` with a `hasLoaded` flag so it fires exactly once (documented: "load is emitted exactly once, on the first reveal"). The counter therefore reads "Mounted 1 time(s)" forever, directly contradicting the story's own caption "Re-mounted on every entry (scroll away and back)". A viewer concludes the re-defer feature is broken when it is not.
</observed>

<requirements>
  - Make the Repeat Observe demo's counter reflect reality. Preferred: keep `load` as a once-only event and emit a separate event on every reveal when `once:false` (e.g. a `reveal` event, or a `show`/`hide` pair), then bind the counter to that; document the new event in DzDeferredContent.types.ts and the component docstring. Alternatively, if no new event is added, change the demo to count via the exposed `loaded` state transitions so the displayed number tracks actual re-mounts.
  - Do not change the documented "fires once" semantics of `load`; add to the API rather than redefining it.
  - Keep the verified once:false re-defer/re-mount behavior and the SSR/no-IO immediate-render fallback intact.
</requirements>

<steps>
  1. Reproduce: open Repeat Observe, scroll the block in/out repeatedly, observe the counter stuck at "Mounted 1 time(s)" while the content visibly re-mounts.
  2. Add a per-reveal event (or repurpose the demo to use the exposed `loaded` state) and rewire the story counter to it.
  3. Verify in the browser that the counter increments on each re-entry and that `@load` still fires only once.
  4. Add/extend tests for the new per-reveal event under `once:false` and for `load` firing exactly once.
</steps>
```
