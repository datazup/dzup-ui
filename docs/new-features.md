# dzup-ui — New Component Features (Round 2 Gap Analysis)

> **Round 2** backlog of new components for the **free** tier (`apps/storybook` +
> `packages/core`). Round 1 (`docs/features.md`, TASK-NF-01 … 24) closed the obvious
> gaps against PrimeVue, CoreUI/Bootstrap-Vue, Ant Design Vue, and MUI. The free tier
> now ships ~155 components across 11 families, so this round targets the **remaining**
> primitives those libraries expose that `dzup-ui` still lacks — plus a few
> differentiating utilities that round out the surface.
>
> Numbering **continues** from Round 1: this file starts at `TASK-NF-25`.
>
> **Scope:** free tier only. Every item below is a general-purpose primitive that
> belongs in the open library. Enterprise surfaces (Kanban, Gantt, charts, editors,
> virtualized data grids, builders, whiteboard, etc.) live in `@dzup-ui/pro` and are
> **out of scope** here. Each candidate below was verified to exist in **neither**
> `packages/core` **nor** `dzup-ui-pro/packages/pro` before being listed.

## How these tasks are written

Each task is a **ready-to-run prompt** for a coding agent, authored per Anthropic's
[prompt-engineering guidance](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct):
a clear role, the motivation/context behind the work, sequential numbered steps,
`<example>` snippets, XML-tagged structure, and instructions phrased as _what to do_
rather than what to avoid. Copy a prompt block verbatim into an agent to execute it.

Every prompt assumes the shared conventions below. Re-read these before starting any task.

```xml
<repo_conventions source="CLAUDE.md — authoritative, overrides defaults">
  <packages>contracts (types, zero runtime deps) → tokens → core (depends on tokens + contracts). compat is never imported by stable core.</packages>
  <file_layout dir="packages/core/src/components/{family}/">
    Dz{Name}.vue                 — &lt;script setup lang="ts"&gt; implementation
    Dz{Name}.types.ts            — Props/Emits/Slots interfaces, extend Base*Props from @dzup-ui/contracts
    Dz{Name}.tokens.ts           — component-local --dz-{component}-* token mappings (anatomy indirection)
    Dz{Name}.variants.ts         — tv() style definitions from tailwind-variants
    Dz{Name}.contract.spec.ts    — Contract Spec v1 conformance tests
    Dz{Name}.spec.ts             — unit/behaviour tests (vitest)
    index.ts                     — public exports
  </file_layout>
  <stories>NOT colocated. Author at packages/core/stories/{family}/Dz{Name}.stories.ts. Add a status badge (experimental | beta | stable | deprecated). Stories are auto-discovered by apps/storybook/.storybook/main.ts.</stories>
  <styling>
    Use tv() in .variants.ts. NO &lt;style scoped&gt;. NO raw color literals, NO hardcoded Tailwind color classes.
    All CSS values reference design tokens via var(--dz-*). Token naming: --dz-{component}-{property}. Global tokens: --dz-primary, --dz-radius-sm, --dz-shadow-xs, etc. (ADR-04, ADR-17).
  </styling>
  <api>
    withDefaults(defineProps&lt;Props&gt;(), {...}); typed defineEmits; typed defineSlots.
    v-model via defineModel (ADR-16) — never manual prop+emit.
    Relative imports use explicit .ts extensions (e.g. import { cn } from '../../utilities/cn.ts').
    Headless interaction/a11y primitives come from Reka UI where one fits (ADR-07).
    Prefer existing composables (useFloating, useClickOutside, useEscapeKey, useScrollSpy, useFocusTrap, useTheme, useClipboard) over new dependencies.
  </api>
  <canonical_types from="@dzup-ui/contracts">
    CanonicalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    CanonicalTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    Base prop interfaces: BaseAccessibilityProps, BaseBehaviorProps, BaseAppearanceProps&lt;TSize,TVariant&gt;, BaseValidationProps, BaseInteractiveProps&lt;TVariant&gt;, BaseFormControlProps&lt;TVariant&gt;.
    Variant taxonomies are FROZEN per ADR-02 — if a new component needs a variant set not already in contracts, propose it as a typed addition to contracts/src, do not invent ad-hoc string unions in core.
  </canonical_types>
  <quality_gates>yarn typecheck → 0 errors. yarn lint → 0 errors. 80%+ coverage. Contract Spec v1 conformance. WCAG AA (keyboard + screen-reader + visible focus).</quality_gates>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done
> **Priority:** 🔴 P0 (high-value, broadly expected) · 🟠 P1 (strong addition) · 🟢 P2 (polish/utility)

---

## 🔴 P0 — Primitives users expect from a serious form/overlay library

### [x] TASK-NF-25 — `DzInputMask` (format-masked text input)

_Gap: PrimeVue `InputMask`, Vuetify mask, Cleave-style inputs. `dzup-ui` has
`DzInput`, `DzNumberInput`, and `DzOtpInput` but no general masked input for phone
numbers, dates, SSNs, postcodes, or license keys — a baseline data-entry primitive._

```xml
<role>You are a Vue 3 + TypeScript component engineer in the dzup-ui design system. Follow <repo_conventions> from docs/new-features.md exactly.</role>

<task>Create DzInputMask, a format-masked text input, in packages/core/src/components/inputs/.</task>

<motivation>Structured fields (phone, date, credit card, IBAN, custom keys) need to guide and constrain typing. Today teams hand-roll keydown handlers on DzInput. A reusable mask primitive that composes with DzFormField and emits both the masked and unmasked value removes that duplication and prevents inconsistent UX.</motivation>

<requirements>
  <api>
    - v-model via defineModel&lt;string&gt; holding the displayed (masked) value; also emit `update:unmasked` with formatting characters stripped.
    - Props extend BaseFormControlProps: size (CanonicalSize), variant (InputVariant), disabled, readonly, required, invalid, id, ariaLabel, placeholder.
    - mask (string) using tokens 9 = digit, a = letter, * = alphanumeric; everything else is a literal (e.g. "(999) 999-9999", "99/99/9999", "***-***").
    - slotChar (default '_') shown for unfilled positions; `autoClear` (boolean) clears the field on blur when input is incomplete.
  </api>
  <behavior>
    - As the user types, skip literal positions automatically and only accept characters matching the next mask token.
    - Support paste, backspace/delete, and caret placement that respects literal segments.
    - Expose a `completed` state (all tokens filled) for validation; integrate with DzFormField invalid styling.
  </behavior>
  <a11y>Keep it a native &lt;input&gt; under the hood so screen readers and form autofill work. Announce the expected format via aria-describedby pointing at a DzFormDescription. Meet WCAG AA focus and contrast using tokens only.</a11y>
</requirements>

<steps>
  1. Scaffold the 7-file layout for inputs/DzInputMask.
  2. Implement a small pure mask engine (apply mask, compute next caret, strip literals) as a local helper so it is unit-testable in isolation.
  3. Define types extending BaseFormControlProps; build tv() variants reusing the existing DzInput token surface where possible (--dz-input-*).
  4. Implement .vue with defineModel, caret management, and the update:unmasked emit.
  5. Write .contract.spec.ts and .spec.ts (typing through literals, paste, backspace, autoClear, completed state, unmasked emit, disabled/readonly).
  6. Author packages/core/stories/inputs/DzInputMask.stories.ts: Phone, Date, CreditCard, CustomKey, WithFormField, Sizes matrix. Tag status 'experimental'.
  7. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzInputMask v-model="phone" mask="(999) 999-9999" @update:unmasked="raw = $event" /&gt;
</example>
```

---

### [x] TASK-NF-26 — `DzListbox` (always-visible selectable list)

_Gap: PrimeVue `Listbox`, MUI selectable List, Headless UI `Listbox`, Ant `List` with
selection. `dzup-ui` has `DzSelect`/`DzMultiSelect` (collapsed dropdowns) and `DzList`
(display only) but no inline, keyboard-navigable selection list for filter panels,
settings, and side-by-side pickers._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzListbox, an always-visible single/multi-select list, in packages/core/src/components/forms/.</task>

<motivation>Dropdown selects hide their options; many UIs (faceted filters, transfer sources, preference panels) need the choices visible at all times with full keyboard navigation. DzList only renders content and DzTransfer is a heavier dual-list. A focused Listbox primitive fills the space between them and can become the building block DzTransfer reuses.</motivation>

<requirements>
  <api>
    - v-model via defineModel for the selected value(s); `multiple` (boolean) switches between a single value and an array.
    - options prop: array of { label, value, disabled?, icon? }; support `optionLabel`/`optionValue`/`optionGroup` keys for arbitrary objects.
    - Props extend BaseFormControlProps: size, disabled, invalid, id, ariaLabel. Add `filter` (boolean) for a built-in search field, `checkmark` (boolean) to show a selected check, and `emptyMessage`.
  </api>
  <behavior>
    - Roving tabindex: Up/Down move active option, Home/End jump, Enter/Space toggle, typeahead by first letter; Shift+click and Shift+Arrow range-select in multiple mode.
    - When filter is on, narrowing the list keeps keyboard navigation scoped to visible options.
  </behavior>
  <a11y>Implement with Reka UI Listbox primitives if available, else role="listbox" with role="option" children and aria-selected/aria-multiselectable wired correctly. Manage aria-activedescendant. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold forms/DzListbox (7 files) plus a DzListboxOption.vue subcomponent if the markup warrants it.
  2. Define types extending BaseFormControlProps with the options/group model.
  3. Build tv() variants and --dz-listbox-* tokens (item height, selected background, active ring) mapping to global semantic tokens.
  4. Implement .vue: roving focus, single/multi selection, optional filter, typeahead.
  5. Write .contract.spec.ts and .spec.ts (selection, multiple, range select, keyboard nav, filter, disabled options, a11y attributes).
  6. Author packages/core/stories/forms/DzListbox.stories.ts: Single, Multiple, WithFilter, Grouped, Disabled, InsideFormField. Tag status 'experimental'.
  7. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzListbox v-model="selected" multiple filter checkmark :options="cities" /&gt;
</example>
```

---

### [x] TASK-NF-27 — `DzPopconfirm` (inline confirm popover)

_Gap: Ant Design `Popconfirm`, Element Plus `Popconfirm`, PrimeVue `ConfirmPopup`.
`dzup-ui` has `DzConfirmDialog` (a blocking modal) and `DzPopover` (free-form), but no
lightweight "are you sure?" bubble anchored to the trigger — the standard pattern for
delete/destructive actions in tables and toolbars._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzPopconfirm, an anchored confirmation popover, in packages/core/src/components/overlays/.</task>

<motivation>A full modal is heavy for low-risk confirmations like deleting a row. Peer libraries ship a popover that appears next to the trigger with a short message and confirm/cancel buttons. This is the most-requested overlay still missing from dzup-ui. Build it on the same floating/positioning composable that already powers DzPopover and DzTooltip so behaviour stays consistent.</motivation>

<requirements>
  <api>
    - Trigger via default slot; controlled `open` through defineModel&lt;boolean&gt; with uncontrolled fallback.
    - Props: title, description, confirmText (default 'Confirm'), cancelText (default 'Cancel'), tone (CanonicalTone, default 'danger' for destructive intent), icon, placement, loading (for async confirm).
    - Emits: confirm, cancel. Support an async confirm: keep the popover open and show the confirm button in loading state until the returned promise settles.
  </api>
  <behavior>
    - Open on trigger click; close on confirm, cancel, Escape, or outside click (reuse useEscapeKey + useClickOutside).
    - Return focus to the trigger on close. Confirm button is focused on open for fast keyboard confirmation.
  </behavior>
  <a11y>role="alertdialog" with aria-labelledby/aria-describedby pointing at title/description. Trap focus within the popover while open (useFocusTrap). Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold overlays/DzPopconfirm (7 files).
  2. Define types; reuse DzButton for the action buttons and DzIcon for the leading icon.
  3. Position with the shared useFloating composable; build tv() variants + --dz-popconfirm-* tokens.
  4. Implement .vue: open state, async confirm/loading, focus management, dismissal paths.
  5. Write .contract.spec.ts and .spec.ts (confirm, cancel, escape, outside click, async loading, focus return, a11y roles).
  6. Author packages/core/stories/overlays/DzPopconfirm.stories.ts: Default, DestructiveDelete, AsyncConfirm, CustomTexts, PlacementMatrix. Tag status 'experimental'.
  7. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzPopconfirm title="Delete this run?" tone="danger" @confirm="remove(row)"&gt;
    &lt;DzIconButton icon="trash" aria-label="Delete" /&gt;
  &lt;/DzPopconfirm&gt;
</example>
```

---

## 🟠 P1 — Strong additions that round out the library

### [x] TASK-NF-28 — `DzMasonry` (cascading column layout)

_Gap: MUI `Masonry`, Ant cascading galleries. `dzup-ui` has `DzGrid` and `DzFlex` but
no masonry layout that packs variable-height items into balanced columns — wanted for
image walls, card feeds, and dashboards._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzMasonry, a responsive masonry/cascading-column layout, in packages/core/src/components/layout/.</task>

<motivation>Grids force uniform row heights, which crops or letterboxes variable-height content. Masonry packs items into the shortest column to minimise gaps. A token-driven, SSR-safe masonry primitive lets product teams build feeds and galleries without pulling a third-party layout library.</motivation>

<requirements>
  <api>
    - columns prop: number, or a responsive object keyed by CanonicalSize breakpoints (e.g. { xs: 1, md: 2, lg: 3 }).
    - gap prop referencing spacing tokens; `sequential` (boolean) to place items left-to-right by order vs. shortest-column balancing.
    - Default slot renders arbitrary children; the component distributes them into columns.
  </api>
  <behavior>
    - Recompute column assignment on container resize (ResizeObserver) and when children change.
    - Provide a CSS-columns fast path for the common case and a measured-JS path when exact shortest-column balancing is requested.
  </behavior>
  <a11y>Preserve DOM order for reading/tab order regardless of visual column placement, or document the trade-off and offer an `ordered` mode that keeps source order. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold layout/DzMasonry (7 files).
  2. Define types with the responsive columns model; build tv() variants + --dz-masonry-* tokens (gap).
  3. Implement resize-aware distribution with a ResizeObserver; debounce recomputation.
  4. Write .contract.spec.ts and .spec.ts (column counts, responsive breakpoints, gap tokens, reflow on resize, dynamic children).
  5. Author packages/core/stories/layout/DzMasonry.stories.ts: ImageWall, CardFeed, ResponsiveColumns, WithGap. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzMasonry :columns="{ xs: 1, md: 2, lg: 3 }" gap="md"&gt;
    &lt;DzImageCard v-for="p in photos" :key="p.id" v-bind="p" /&gt;
  &lt;/DzMasonry&gt;
</example>
```

---

### [x] TASK-NF-29 — `DzImageComparison` (before/after slider)

_Gap: img-comparison-slider (React/Vue/Angular), Nuxt UI / Magic UI compare widgets.
No peer in this list ships it natively, so it is both a real demand and a
differentiator. `dzup-ui` has `DzImage`, `DzLightbox`, and `DzCarousel` but nothing for
side-by-side before/after reveal._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzImageComparison, a draggable before/after image reveal slider, in packages/core/src/components/media/.</task>

<motivation>Before/after sliders are the clearest way to show edits, restorations, A/B variants, and data-quality diffs. Teams currently embed third-party widgets that ignore the design system's tokens and a11y baseline. A first-party, keyboard-accessible component keeps these visuals on-brand and accessible.</motivation>

<requirements>
  <api>
    - Slots `before` and `after` (each typically a DzImage), plus convenience props beforeSrc/afterSrc/beforeAlt/afterAlt.
    - v-model:position via defineModel&lt;number&gt; (0–100, default 50); `orientation` ('horizontal' | 'vertical'); optional before/after labels.
    - handle slot to customise the divider grip.
  </api>
  <behavior>
    - Drag the handle (pointer events) and click anywhere on the track to move it.
    - Keyboard: focus the handle, Arrow keys nudge, Shift+Arrow jump by 10, Home/End to extremes.
  </behavior>
  <a11y>Handle is role="slider" with aria-valuemin/max/now and an accessible label describing it reveals the after image. Ensure both images carry alt text. Meet WCAG AA; respect prefers-reduced-motion for any transition.</a11y>
</requirements>

<steps>
  1. Scaffold media/DzImageComparison (7 files).
  2. Define types; build tv() variants + --dz-image-comparison-* tokens (handle size, divider color/width, label chip).
  3. Implement pointer drag + click-to-set + full keyboard handling; clamp position 0–100.
  4. Write .contract.spec.ts and .spec.ts (drag, click, keyboard, vertical orientation, v-model sync, labels, a11y slider attrs).
  5. Author packages/core/stories/media/DzImageComparison.stories.ts: Horizontal, Vertical, WithLabels, CustomHandle, Controlled. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzImageComparison before-src="/raw.jpg" after-src="/edited.jpg"
    before-alt="Original" after-alt="Edited" v-model:position="pos" /&gt;
</example>
```

---

### [x] TASK-NF-30 — `DzInfiniteScroll` (viewport-sentinel loader)

_Gap: Element Plus `InfiniteScroll`, Vuetify infinite scroll, Ant `List` infinite
loading. `dzup-ui` has `DzPagination` and `DzDataGridPagination` but no scroll-driven
"load more" primitive for feeds and long lists._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzInfiniteScroll, an IntersectionObserver-based load-more wrapper, in packages/core/src/components/data/.</task>

<motivation>Paginated feeds increasingly load on scroll rather than via page numbers. Teams wire up IntersectionObserver by hand and get the edge cases wrong (firing during load, no end state, no error retry). A small, declarative primitive standardises the pattern and pairs with DzList, DzDataView, and DzTable.</motivation>

<requirements>
  <api>
    - Default slot for the already-rendered items; a sentinel is rendered after them.
    - Props: disabled, loading, hasMore (boolean), `distance` (px threshold), `direction` ('down' | 'up' for reverse/chat lists).
    - Emit `load-more` when the sentinel enters the viewport and not currently loading and hasMore is true.
    - Slots: loading, end (no-more-items), error + a `retry` exposed for failed loads.
  </api>
  <behavior>
    - Debounce/guard so load-more fires once per intersection until the parent flips loading back off.
    - Use a single IntersectionObserver scoped to the nearest scroll container; clean up on unmount.
  </behavior>
  <a11y>Expose aria-busy during loading and an aria-live polite region announcing "loading more" and "end of results". Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold data/DzInfiniteScroll (7 files); consider extracting a useInfiniteScroll composable in composables/ for reuse.
  2. Define types; build minimal tv() variants + --dz-infinite-scroll-* tokens (sentinel spacing).
  3. Implement IntersectionObserver logic with loading guard, direction handling, and retry.
  4. Write .contract.spec.ts and .spec.ts (fires once, respects hasMore/disabled/loading, end + error slots, retry, cleanup) — mock IntersectionObserver.
  5. Author packages/core/stories/data/DzInfiniteScroll.stories.ts: BasicFeed, EndState, ErrorRetry, ReverseChat. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzInfiniteScroll :loading="loading" :has-more="hasMore" @load-more="fetchNext"&gt;
    &lt;DzList :items="rows" /&gt;
  &lt;/DzInfiniteScroll&gt;
</example>
```

---

### [x] TASK-NF-31 — `DzCountdown` (live countdown timer)

_Gap: Ant Design `Statistic.Countdown`, Element Plus `Countdown`. `dzup-ui` has
`DzStatCard` for static figures but nothing that ticks down to a deadline — needed for
sales timers, token-expiry warnings, scheduled-run ETAs, and OTP resend windows._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzCountdown, a live countdown/elapsed timer, in packages/core/src/components/data/.</task>

<motivation>Deadlines and expiry windows are common across product UIs, and a correct timer is fiddly (drift-free ticking, format, pause/resume, finish event, cleanup). A shared primitive prevents each team from re-implementing setInterval logic and keeps formatting consistent.</motivation>

<requirements>
  <api>
    - target prop (Date | number timestamp | ms duration) and `mode` ('to' a target time | 'duration' counting down a span).
    - format prop (token string, default 'HH:mm:ss', supporting D, H, m, s, and ms); `valueStyle` via tone/size from canonical types.
    - autoStart (default true), and exposed start/pause/reset methods; emit `finish` once at zero and `change` on each tick.
    - Default/value slot receives the structured remaining { days, hours, minutes, seconds, ms } for custom rendering.
  </api>
  <behavior>
    - Tick on requestAnimationFrame or a self-correcting interval to avoid drift; stop at zero (no negative).
    - Pause when the tab is hidden if `pauseOnHidden` is set; resume on visibility.
  </behavior>
  <a11y>Wrap the live value in an aria-live polite region with a sensible update granularity (do not spam SR every animation frame — announce per second). Provide an accessible label. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold data/DzCountdown (7 files); extract the ticking/formatting logic into a pure, testable helper (and optionally a useCountdown composable).
  2. Define types; build tv() variants + --dz-countdown-* tokens reusing typography/number tokens.
  3. Implement drift-corrected ticking, finish/change emits, start/pause/reset, slot payload.
  4. Write .contract.spec.ts and .spec.ts using fake timers (counts down, format tokens, finish fires once, pause/reset, no negative, cleanup on unmount).
  5. Author packages/core/stories/data/DzCountdown.stories.ts: ToDeadline, DurationTimer, CustomFormat, SlotRender, PauseResume. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzCountdown :target="expiresAt" format="mm:ss" @finish="resendEnabled = true" /&gt;
</example>
```

---

### [x] TASK-NF-32 — `DzColorModeToggle` (theme switch control)

_Gap: Nuxt UI `ColorModeButton`, Mantine color-scheme toggle. `dzup-ui` already ships
`useTheme` and `DzThemeProvider` but exposes no ready-made control — every consumer
builds their own light/dark/system switch._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzColorModeToggle, a light/dark/system theme switch, in packages/core/src/components/navigation/.</task>

<motivation>Dark mode is table-stakes, and the plumbing already exists via useTheme/DzThemeProvider — what is missing is the off-the-shelf control. Shipping one (with the FOUC-safe behaviour from ADR-15) means consumers get a correct, accessible toggle for free instead of re-deriving it.</motivation>

<requirements>
  <api>
    - Bind to the existing useTheme composable; do NOT introduce a parallel theme store.
    - `variant` prop: 'icon' (single button that cycles), 'switch' (DzSwitch-style), 'segmented' (light/dark/system via DzSegmented).
    - Props: showSystem (include the 'system' option, default true), size (CanonicalSize), labels override for i18n.
  </api>
  <behavior>
    - Reflect and update the current resolved mode; when 'system', follow prefers-color-scheme and update live on OS change.
    - Persist the choice through useTheme's existing persistence; avoid a flash on load (honor ADR-15).
  </behavior>
  <a11y>Use a real button/switch with aria-pressed or role="switch"/aria-checked, an accessible label that states the action ("Switch to dark theme"), and announce the new mode. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Read packages/core/src/composables/useTheme and providers/DzThemeProvider to wire to the real API before coding.
  2. Scaffold navigation/DzColorModeToggle (7 files), composing DzIconButton/DzSwitch/DzSegmented for the three variants.
  3. Define types; build tv() variants + --dz-color-mode-toggle-* tokens (icon swap, transition).
  4. Implement variant rendering, system-following, and persistence via useTheme.
  5. Write .contract.spec.ts and .spec.ts (cycles modes, reflects external theme change, system follows matchMedia — mocked, persistence, a11y state).
  6. Author packages/core/stories/navigation/DzColorModeToggle.stories.ts: IconCycle, SwitchStyle, Segmented, WithoutSystem. Tag status 'experimental'.
  7. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzColorModeToggle variant="segmented" :show-system="true" /&gt;
</example>
```

---

## 🟢 P2 — Polish & utility primitives

### [x] TASK-NF-33 — `DzKbd` (keyboard key hint)

_Gap: shadcn `Kbd`, Mantine `Kbd`, Nuxt UI `Kbd`. `dzup-ui` has `DzCode` and `DzCode`
inline type but no styled keyboard-key element — used in docs, tooltips, menus, and
next to the existing DzCommandPalette to show shortcuts._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzKbd, a keyboard-key display element, in packages/core/src/components/typography/.</task>

<motivation>Shortcut hints appear throughout a product (command menus, tooltips, help). A small Kbd primitive standardises their look and, crucially, can render platform-aware modifiers (⌘ on macOS, Ctrl on Windows/Linux) so the same markup is correct everywhere — a nicety most peer libraries omit.</motivation>

<requirements>
  <api>
    - Default slot for raw key content, OR a `keys` prop (string[] like ['mod', 'k']) that renders a combo with separators.
    - `platformAware` (default true): map the synthetic 'mod' to ⌘ on macOS and Ctrl elsewhere; map 'alt'/'shift'/'enter'/'esc' to symbols.
    - size (CanonicalSize), `separator` (default '+' or none for joined chips).
  </api>
  <behavior>Render each key as its own &lt;kbd&gt; chip; pure presentational, no interaction state.</behavior>
  <a11y>Use semantic &lt;kbd&gt; elements; provide an aria-label spelling out the combo in words ("Command K") so screen readers do not read bare symbols. Meet WCAG AA contrast via tokens.</a11y>
</requirements>

<steps>
  1. Scaffold typography/DzKbd (7 files).
  2. Define types; build tv() variants + --dz-kbd-* tokens (key background, border, shadow, font).
  3. Implement platform detection (SSR-safe) and the synthetic-key → symbol map.
  4. Write .contract.spec.ts and .spec.ts (slot vs keys prop, platform mapping for mac/non-mac — mock userAgent/navigator, aria-label spelling, sizes).
  5. Author packages/core/stories/typography/DzKbd.stories.ts: SingleKey, Combo, PlatformAware, Sizes, InsideTooltip. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzKbd :keys="['mod', 'k']" /&gt;  &lt;!-- ⌘K on macOS, Ctrl+K elsewhere --&gt;
</example>
```

---

### [x] TASK-NF-34 — `DzRelativeTime` (auto-updating timestamp)

_Gap: Element Plus `Time`, Ant relative time helpers, `<relative-time>` web component.
`dzup-ui` has no component that renders "3 minutes ago" and keeps it fresh — useful in
activity feeds, run histories, and comment threads._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzRelativeTime, a self-updating relative timestamp, in packages/core/src/components/typography/.</task>

<motivation>Relative timestamps must re-render as time passes and degrade gracefully (an absolute tooltip, correct ICU pluralisation, locale awareness). Hand-rolled versions drift or never update. A primitive built on the platform Intl.RelativeTimeFormat gives correct, dependency-free localisation.</motivation>

<requirements>
  <api>
    - value prop (Date | number | ISO string). `mode` ('relative' default | 'absolute'); `locale` override (else document/Intl default).
    - `updateInterval` auto-derived from age (every second under a minute, every minute under an hour, etc.) with an override.
    - `tooltip` (default true): wrap in DzTooltip showing the full absolute date.
  </api>
  <behavior>Use Intl.RelativeTimeFormat; pick the largest sensible unit; clear timers on unmount; recompute the interval as the value ages.</behavior>
  <a11y>Render inside a &lt;time&gt; element with a machine-readable datetime attribute; the absolute value is available to assistive tech. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold typography/DzRelativeTime (7 files); extract a pure format function (value, now, locale) → string for unit testing, plus an optional useRelativeTime composable.
  2. Define types; minimal tv() variants + --dz-relative-time-* tokens (inherits text tokens).
  3. Implement the adaptive interval, Intl formatting, and DzTooltip integration.
  4. Write .contract.spec.ts and .spec.ts with fake timers and a fixed "now" (unit selection, updates over time, absolute mode, locale, &lt;time&gt; datetime, cleanup).
  5. Author packages/core/stories/typography/DzRelativeTime.stories.ts: JustNow, MinutesAgo, AbsoluteMode, Localized, InFeed. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzRelativeTime :value="run.startedAt" /&gt;  &lt;!-- "2 minutes ago", updates live --&gt;
</example>
```

---

### [x] TASK-NF-35 — `DzAnimatedNumber` (count-up value)

_Gap: Ant `Statistic` animated value, Mantine `NumberFormatter`, count-up widgets.
`dzup-ui` `DzStatCard` shows static numbers; an animated, formatted figure adds polish
to dashboards and KPIs._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzAnimatedNumber, a number that animates between values, in packages/core/src/components/data/.</task>

<motivation>Animated counters draw attention to changing metrics and feel responsive. Done naively they jank or ignore reduced-motion. A token-driven primitive with correct Intl formatting and accessibility handles those concerns once.</motivation>

<requirements>
  <api>
    - v-model or `value` prop (number); animates from the previous value to the new one whenever it changes.
    - duration, easing (token-referenced), `format` via Intl.NumberFormat options (currency, percent, decimals), prefix/suffix slots.
    - `startOnView` (default true): begin the first animation only when scrolled into view (IntersectionObserver).
  </api>
  <behavior>Animate with requestAnimationFrame; interpolate then format each frame; cancel/restart cleanly on rapid value changes.</behavior>
  <a11y>Respect prefers-reduced-motion by snapping to the final value with no animation. Mark the animating digits aria-hidden and expose the final formatted value to screen readers (aria-label or a visually-hidden node) so SR users are not flooded. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold data/DzAnimatedNumber (7 files); extract the tween into a pure helper.
  2. Define types; tv() variants + --dz-animated-number-* tokens (font, easing default).
  3. Implement rAF tween, Intl formatting per frame, startOnView, reduced-motion snap.
  4. Write .contract.spec.ts and .spec.ts (animates to target, formats, reduced-motion path, mid-flight value change, startOnView with mocked IntersectionObserver, SR value).
  5. Author packages/core/stories/data/DzAnimatedNumber.stories.ts: Integer, Currency, Percent, OnScroll, ReducedMotion. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzAnimatedNumber :value="revenue" :format="{ style: 'currency', currency: 'USD' }" /&gt;
</example>
```

---

### [x] TASK-NF-36 — `DzScrollProgress` (page reading-progress bar)

_Gap: Mantine reading progress, common docs-site progress bars. `dzup-ui` has
`DzProgress` (value-bound) and `DzBackTop` but no scroll-position indicator for long
articles, docs, and onboarding pages._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzScrollProgress, a scroll-position progress indicator, in packages/core/src/components/feedback/.</task>

<motivation>Long-form pages benefit from a thin bar showing how far the reader has scrolled. It is a small but expected piece of polish for documentation and marketing surfaces, and reuses the scroll-tracking pattern already present in useScrollSpy/useScrollToTop.</motivation>

<requirements>
  <api>
    - `target` (window default, or a ref/selector to a scroll container).
    - `position` ('top' | 'bottom'), `variant` ('bar' default | 'circular'), thickness, tone (CanonicalTone).
    - Expose the 0–100 progress value via a slot and a `change` emit for custom UIs.
  </api>
  <behavior>Track scroll with a passive, rAF-throttled listener; recompute on resize/content change; clamp 0–100.</behavior>
  <a11y>Provide role="progressbar" with aria-valuenow/min/max and an accessible label ("Page scroll progress"); the bar is decorative-supplementary so do not steal focus. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold feedback/DzScrollProgress (7 files); reuse or extend an existing scroll composable rather than adding a new listener pattern.
  2. Define types; tv() variants + --dz-scroll-progress-* tokens (height, fill).
  3. Implement throttled scroll tracking for both window and element targets; bar + circular variants.
  4. Write .contract.spec.ts and .spec.ts (computes percentage from scroll metrics — mocked, clamps, top/bottom, change emit, a11y attrs, cleanup).
  5. Author packages/core/stories/feedback/DzScrollProgress.stories.ts: TopBar, BottomBar, Circular, ScopedContainer. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzScrollProgress position="top" tone="primary" /&gt;
</example>
```

---

### [x] TASK-NF-37 — `DzVisuallyHidden` (screen-reader-only wrapper)

_Gap: Reka/Radix `VisuallyHidden`, Chakra `VisuallyHidden`. A foundational a11y
utility for labels that must exist for assistive tech but stay invisible — currently
teams copy ad-hoc `sr-only` markup._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzVisuallyHidden, a screen-reader-only content wrapper, in packages/core/src/components/typography/.</task>

<motivation>Many components (icon buttons, live regions, skip links) need text that is announced but not painted. A single audited primitive guarantees the correct, robust hiding technique (not display:none, which removes it from the a11y tree) instead of scattered one-off classes. Prefer Reka UI's VisuallyHidden primitive if it is already a dependency (ADR-07).</motivation>

<requirements>
  <api>
    - Polymorphic `as` prop (default 'span') so it can wrap inline or block content.
    - `focusable` (boolean): when true, becomes visible on focus (skip-link pattern).
    - Default slot for the hidden content.
  </api>
  <behavior>Apply the standard clip-rect + 1px technique that keeps content in the accessibility tree; when focusable and focused, reveal it in place.</behavior>
  <a11y>This component IS the a11y primitive — verify with tests that content remains reachable by accessible-name computation and is not display:none/aria-hidden. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Check whether Reka UI exposes VisuallyHidden; if so, wrap it; otherwise implement the clip technique directly.
  2. Scaffold typography/DzVisuallyHidden (7 files — variants may be minimal); --dz tokens likely unnecessary, document why if omitted.
  3. Implement the polymorphic `as` and focusable reveal.
  4. Write .contract.spec.ts and .spec.ts (content present in DOM/a11y tree, not display:none, focusable reveal on focus, polymorphic as).
  5. Author packages/core/stories/typography/DzVisuallyHidden.stories.ts: HiddenLabel, SkipLink (focusable), InsideIconButton. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzButton&gt;&lt;DzIcon name="save" /&gt;&lt;DzVisuallyHidden&gt;Save document&lt;/DzVisuallyHidden&gt;&lt;/DzButton&gt;
</example>
```

---

### [x] TASK-NF-38 — `DzDeferredContent` (lazy render on viewport)

_Gap: PrimeVue `DeferredContent`. Renders heavy content only when it scrolls into view —
a performance primitive for long pages with charts, images, or expensive lists._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzDeferredContent, a viewport-triggered lazy renderer, in packages/core/src/components/layout/.</task>

<motivation>Pages with many below-the-fold widgets pay a mount cost for content the user may never see. Deferring render until intersection improves first paint and reduces work. A declarative wrapper makes this opt-in without manual observer wiring, and complements DzInfiniteScroll (which loads more) by lazily mounting what is already listed.</motivation>

<requirements>
  <api>
    - Default slot is the deferred content; `placeholder` slot shown before it loads (default to a DzSkeleton).
    - Props: `rootMargin` and `threshold` (IntersectionObserver options), `once` (default true — stop observing after first reveal).
    - Emit `load` when the content is first rendered.
  </api>
  <behavior>Observe a sentinel; on intersection, mount the slot content (and keep it mounted when once=true). Fall back to immediate render if IntersectionObserver is unavailable (SSR/old engines).</behavior>
  <a11y>Ensure deferred content participates normally in tab/reading order once mounted; the placeholder must not announce false "loaded" state. Meet WCAG AA.</a11y>
</requirements>

<steps>
  1. Scaffold layout/DzDeferredContent (7 files); reuse the IntersectionObserver helper/composable created for DzInfiniteScroll (TASK-NF-30) if present, else extract a shared useIntersection composable.
  2. Define types; minimal tv() variants + --dz-deferred-content-* tokens.
  3. Implement sentinel observation, slot mounting, once behaviour, SSR fallback, load emit.
  4. Write .contract.spec.ts and .spec.ts (defers until intersection, renders placeholder first, once vs repeat, SSR/no-IO fallback, load emit, cleanup) — mock IntersectionObserver.
  5. Author packages/core/stories/layout/DzDeferredContent.stories.ts: DeferredImage, DeferredList, CustomPlaceholder, RepeatObserve. Tag status 'experimental'.
  6. Run yarn typecheck, yarn lint, and the tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzDeferredContent&gt;
    &lt;HeavyChart /&gt;
    &lt;template #placeholder&gt;&lt;DzSkeleton height="320px" /&gt;&lt;/template&gt;
  &lt;/DzDeferredContent&gt;
</example>
```

---

## Summary — gap map

| #   | Component         | Closest peer(s)                                   | dzup-ui status | Family     | Priority |
| --- | ----------------- | ------------------------------------------------- | -------------- | ---------- | -------- |
| 25  | DzInputMask       | PrimeVue InputMask · Vuetify mask                 | done           | inputs     | 🔴 P0    |
| 26  | DzListbox         | PrimeVue Listbox · Headless UI · MUI              | done           | forms      | 🔴 P0    |
| 27  | DzPopconfirm      | AntD Popconfirm · Element · PrimeVue ConfirmPopup | done           | overlays   | 🔴 P0    |
| 28  | DzMasonry         | MUI Masonry                                       | done           | layout     | 🟠 P1    |
| 29  | DzImageComparison | img-comparison-slider · Nuxt UI                   | done           | media      | 🟠 P1    |
| 30  | DzInfiniteScroll  | Element Plus · Vuetify · AntD List                | done           | data       | 🟠 P1    |
| 31  | DzCountdown       | AntD Statistic.Countdown · Element                | done           | data       | 🟠 P1    |
| 32  | DzColorModeToggle | Nuxt UI ColorModeButton · Mantine                 | done           | navigation | 🟠 P1    |
| 33  | DzKbd             | shadcn · Mantine · Nuxt UI Kbd                    | done           | typography | 🟢 P2    |
| 34  | DzRelativeTime    | Element Plus Time · `<relative-time>`             | done           | typography | 🟢 P2    |
| 35  | DzAnimatedNumber  | AntD Statistic · Mantine NumberFormatter          | done           | data       | 🟢 P2    |
| 36  | DzScrollProgress  | Mantine reading progress                          | done           | feedback   | 🟢 P2    |
| 37  | DzVisuallyHidden  | Reka/Radix · Chakra                               | done           | typography | 🟢 P2    |
| 38  | DzDeferredContent | PrimeVue DeferredContent                          | done           | layout     | 🟢 P2    |

> **Deliberately excluded (Pro / enterprise tier — already in `@dzup-ui/pro` or belongs there):**
> virtualized tables/scrollers (DzVirtualTable), charts/gauges/sparklines, rich-text and
> code editors, Kanban/Gantt/Scheduler, query/filter/form/report builders, whiteboard,
> diagram/network/org-chart, spreadsheet, AI chat. These are not general-purpose
> primitives and stay out of the free `apps/storybook` scope.

## Sources

- [PrimeVue — InputMask](https://primevue.org/inputmask/) · [Listbox](https://primevue.org/listbox/) · [DeferredContent](https://primevue.org/deferredcontent/)
- [Ant Design Vue — Popconfirm](https://www.antdv.com/components/popconfirm/) · [Statistic / Countdown](https://ant.design/components/statistic/)
- [MUI — Masonry](https://mui.com/material-ui/react-masonry/)
- [img-comparison-slider (React/Vue/Angular)](https://github.com/sneas/img-comparison-slider) · [@img-comparison-slider/vue](https://www.npmjs.com/package/@img-comparison-slider/vue)
- [Anthropic — Prompt engineering: Be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct)
