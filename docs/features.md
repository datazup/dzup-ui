# dzup-ui — New Component Features (Competitive Gap Analysis)

> Backlog of new components for the **free** tier (`apps/storybook` + `packages/core`),
> derived from a gap analysis against **PrimeVue**, **CoreUI / Bootstrap-Vue**,
> **Ant Design Vue**, and **MUI**. Every item below exists in two or more of those
> libraries but has **no equivalent** in `dzup-ui` today.
>
> **Scope:** free tier only. Enterprise components (Kanban, Gantt, FormBuilder,
> WorkflowDesigner, OrganizationChart, Terminal, Dock) are intentionally **out of
> scope** — they belong in `@dzup-ui/pro`. Everything here is a general-purpose
> primitive appropriate for the open library.

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

## 🔴 P0 — High-value components users expect from a serious library

### [x] TASK-NF-01 — `DzRating` (star/icon rating input)

_Gap: PrimeVue `Rating`, Ant Design `Rate`, MUI `Rating`. `dzup-ui` has no rating
control at all — a baseline form primitive for reviews, feedback, and quality scores._

```xml
<role>You are a Vue 3 + TypeScript component engineer working in the dzup-ui design system. Follow <repo_conventions> from docs/new-features.md exactly.</role>

<task>Create DzRating, a star/icon rating input, in packages/core/src/components/forms/.</task>

<motivation>Rating is a baseline form primitive present in every major peer library; teams currently have to hand-roll it. It must behave like a real form control so it composes with DzFormField and participates in validation.</motivation>

<requirements>
  <api>
    - v-model:value via defineModel&lt;number&gt; (ADR-16).
    - Props extend BaseFormControlProps: size (CanonicalSize), tone (default 'warning' for the classic gold star), disabled, readonly, required, invalid, id, ariaLabel.
    - count (default 5), allowHalf (boolean), allowClear (click selected value to reset to 0), icon + emptyIcon slots/props (default to a star glyph via DzIcon).
  </api>
  <behavior>
    - Keyboard: Arrow Left/Right adjust by one (or 0.5 when allowHalf), Home/End jump to min/max, number keys 1-9 set directly.
    - Hover preview updates the visual fill without committing until click.
    - Respects readonly (display-only, focusable for SR) and disabled (not focusable).
  </behavior>
  <a11y>Implement as role="slider" with aria-valuemin/max/now/text, or wrap a Reka UI primitive if one fits. Provide an accessible label and per-star labels. Meet WCAG AA contrast for filled vs empty states using tokens only.</a11y>
</requirements>

<steps>
  1. Scaffold the 7-file component layout for forms/DzRating.
  2. Define DzRatingProps/Emits/Slots in .types.ts extending the contracts base interfaces.
  3. Define --dz-rating-* tokens (size dimensions, filled/empty/hover colors) mapping to global semantic tokens in .tokens.ts; build tv() variants in .variants.ts.
  4. Implement .vue with defineModel, hover state, and full keyboard handling.
  5. Write .contract.spec.ts (Contract Spec v1) and .spec.ts (value commit, half-steps, clear, keyboard, disabled/readonly, a11y attributes).
  6. Author packages/core/stories/forms/DzRating.stories.ts: Default, HalfStars, ReadOnly, Sizes matrix, CustomIcon, and a DzFormField-integrated example. Tag status 'experimental'.
  7. Run yarn typecheck, yarn lint, and the component tests; resolve all findings.
</steps>

<example name="intended usage">
  &lt;DzRating v-model:value="score" :count="5" allow-half tone="warning" /&gt;
</example>
```

---

### [x] TASK-NF-02 — `DzCalendar` (full month/week calendar surface)

_Gap: PrimeVue `Calendar` (inline), Ant Design `Calendar`, CoreUI `Calendar`.
`dzup-ui` has `DzDatePicker` (a popover input) but no full-surface calendar for
displaying/selecting against a month or week grid with event cells._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzCalendar, a full-surface month/week calendar for date selection and day-cell content, in packages/core/src/components/data/.</task>

<motivation>DzDatePicker covers compact date entry but cannot display a month at a glance or render content inside day cells (events, counts, badges). A calendar surface is expected for dashboards, scheduling, and activity views. Reuse the date math/composable that already powers DzDatePicker rather than duplicating it.</motivation>

<requirements>
  <api>
    - v-model:value via defineModel for the selected date(s); support mode prop: 'single' | 'multiple' | 'range'.
    - view prop: 'month' | 'week' (default 'month'); v-model:focusedDate for the visible period; controllable header (prev/next/today).
    - Props extend BaseAppearanceProps (size) + BaseBehaviorProps (disabled, readonly). minDate, maxDate, disabledDate(date) predicate, firstDayOfWeek, locale.
    - #day slot receives { date, isToday, isSelected, isOutsideMonth, isDisabled } so consumers render event badges/dots inside cells. Default slot renders the day number.
  </api>
  <behavior>Roving-tabindex grid: Arrow keys move by day, PageUp/PageDown by month, Home/End to week edges, Enter/Space selects. Today and selected cells are visually distinct via tokens.</behavior>
  <a11y>role="grid" with rows/cells, aria-selected on day buttons, aria-label per day (full date), and a live region announcing the visible month on navigation.</a11y>
</requirements>

<steps>
  1. Audit DzDatePicker for an existing date composable; extend/reuse it. Scaffold data/DzCalendar (7 files).
  2. Model the grid (weeks × days) as a computed matrix; implement roving-tabindex keyboard nav.
  3. Token the cell sizing, today ring, selected fill, range fill, and outside-month muting (--dz-calendar-*).
  4. Implement single/multiple/range selection through defineModel; emit 'update:value' and 'panelChange'.
  5. Tests: contract spec + month rollover, range edges, disabledDate, keyboard grid nav, slot rendering, a11y roles.
  6. Stories at stories/data/DzCalendar.stories.ts: Month, Week, RangeSelection, WithEventDots (using #day), DisabledDates, MinMax. Status 'experimental'.
  7. Pass typecheck, lint, tests.
</steps>
```

---

### [x] TASK-NF-03 — `DzTour` (guided product onboarding tour)

_Gap: Ant Design `Tour`, plus widespread third-party demand. A spotlight/coachmark
walkthrough that highlights elements in sequence. Nothing comparable exists in `dzup-ui`._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzTour, a step-by-step product walkthrough that spotlights target elements and shows a popover with title/description/controls, in packages/core/src/components/overlays/.</task>

<motivation>Onboarding tours drive feature adoption and are absent from the library, forcing product teams onto heavyweight third-party packages that don't match the design tokens. Build it on the same positioning primitive already used by DzPopover/DzTooltip (Reka UI / floating engine) so anchoring and collision handling are consistent.</motivation>

<requirements>
  <api>
    - v-model:open (defineModel&lt;boolean&gt;) and v-model:current (defineModel&lt;number&gt; step index).
    - steps: Array&lt;{ target: string | HTMLElement | (() =&gt; el); title?; description?; placement?; }&gt; — target resolves to the element to spotlight.
    - Props: mask (boolean, default true — dim everything except the target), scrollIntoView (default true). Slots for custom step body, footer, and indicators.
    - Emits: 'finish', 'close', 'change' (step index).
  </api>
  <behavior>A full-viewport mask with a transparent cutout over the active target (SVG/box-shadow technique), a popover anchored to the target with Back/Next/Skip/Finish, step indicator dots, and auto-scroll to off-screen targets. Re-measure on resize/scroll.</behavior>
  <a11y>Trap focus within the step popover, Esc closes, aria-modal semantics, and announce step changes. Ensure the spotlight cutout never traps keyboard users.</a11y>
</requirements>

<steps>
  1. Scaffold overlays/DzTour. Decide composition: a DzTour root + internal step popover; reuse the existing overlay positioning utility.
  2. Implement target resolution + bounding-box measurement with a ResizeObserver/scroll listener; render the mask cutout via tokens (--dz-tour-mask, --dz-tour-radius).
  3. Wire defineModel for open/current; implement Back/Next/Skip/Finish and indicator dots.
  4. Tests: contract spec + step advance/regress, finish/skip emits, target re-measure, focus trap, Esc.
  5. Stories at stories/overlays/DzTour.stories.ts: BasicThreeStep, NoMask, CustomFooter, ControlledStep. Status 'experimental'.
  6. Pass typecheck, lint, tests.
</steps>
```

---

### [x] TASK-NF-04 — `DzTreeSelect` (hierarchical dropdown select)

_Gap: PrimeVue `TreeSelect`, Ant Design `TreeSelect`. `dzup-ui` has `DzTree` and
`DzSelect` separately but no select whose options are a collapsible tree._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzTreeSelect, a form select whose overlay panel is a DzTree, in packages/core/src/components/forms/.</task>

<motivation>Selecting from hierarchical data (categories, org units, file trees, permission scopes) is common and currently requires bolting DzTree into a DzPopover by hand. Compose the two existing components rather than reimplementing tree or overlay logic.</motivation>

<requirements>
  <api>
    - v-model:value via defineModel; selectionMode: 'single' | 'multiple' | 'checkbox'.
    - Props extend BaseFormControlProps (size, variant=InputVariant, tone, disabled, readonly, invalid, required, placeholder). nodes: tree data; expandedKeys (v-model), filter (boolean) for type-to-search.
    - Trigger displays selected label(s) as text or DzChip/DzTag tokens when multiple; #value and #node slots for customization.
  </api>
  <behavior>Open on click/Enter/Space/ArrowDown; type-ahead filter prunes the tree; checkbox mode supports parent/child propagation and indeterminate state; closes on select in single mode, stays open in multiple.</behavior>
  <a11y>Combobox pattern: role="combobox" trigger with aria-expanded/controls, the panel as role="tree", full keyboard tree nav, and selected-state announced.</a11y>
</requirements>

<steps>
  1. Scaffold forms/DzTreeSelect. Compose DzPopover (overlay) + DzTree (panel) + DzInput-styled trigger using existing variants.
  2. Map selection/expansion/checkbox propagation onto DzTree's API; reuse its keyboard handling.
  3. Token the trigger to match DzSelect exactly (same --dz-input-* family) so it's visually identical to other selects.
  4. Tests: contract spec + single/multiple/checkbox selection, filter, parent/child propagation, keyboard, disabled.
  5. Stories at stories/forms/DzTreeSelect.stories.ts: Single, MultipleChips, CheckboxPropagation, Filterable, InFormField. Status 'experimental'.
  6. Pass typecheck, lint, tests.
</steps>
```

---

### [x] TASK-NF-05 — `DzCascader` (cascading multi-level select)

_Gap: Ant Design `Cascader`, PrimeVue `CascadeSelect`. For ordered hierarchical
choices (country → state → city) shown as sliding columns. No `dzup-ui` equivalent._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzCascader, a select that reveals child options column-by-column as each level is chosen, in packages/core/src/components/forms/.</task>

<motivation>Cascading selection is the ergonomic choice for deep, strictly-ordered taxonomies where a tree would be visually heavy. It is a distinct interaction from DzTreeSelect (columns vs expandable tree) and both are worth having.</motivation>

<requirements>
  <api>
    - v-model:value via defineModel (array of keys representing the selected path).
    - Props extend BaseFormControlProps (size, variant, tone, disabled, readonly, invalid, placeholder). options: nested {label, value, children?, disabled?}. changeOnSelect (allow selecting a non-leaf), expandTrigger: 'click' | 'hover', filter (flatten + search paths).
    - #value slot for custom selected-path rendering (default shows 'A / B / C').
  </api>
  <behavior>Each chosen level appends the next column; leaf selection commits and closes (unless changeOnSelect). Filter mode renders a flat searchable list of full paths.</behavior>
  <a11y>Combobox trigger + listbox columns; Arrow Right enters a child column, Arrow Left returns, Up/Down move within a column, Enter selects.</a11y>
</requirements>

<steps>
  1. Scaffold forms/DzCascader. Reuse DzPopover for the overlay; render columns from the active path.
  2. Implement path state, column derivation, hover/click expand triggers, and the flat filter mode.
  3. Token columns/active-item to the shared --dz-input-* / menu families.
  4. Tests: contract spec + path commit, changeOnSelect, hover trigger, filter, keyboard column nav.
  5. Stories at stories/forms/DzCascader.stories.ts: Default, ChangeOnSelect, HoverExpand, Filterable. Status 'experimental'.
  6. Pass typecheck, lint, tests.
</steps>
```

---

### [ ] TASK-NF-06 — `DzTagsInput` (free-text token / chips input)

_Gap: PrimeVue `AutoComplete` (multiple) / `Chips`, Ant Design `Select tags mode`,
MUI `Autocomplete freeSolo`. `dzup-ui` has `DzMultiSelect`/`DzCombobox` (pick from a
fixed list) but no input where users type arbitrary tokens (tags, emails, keywords)._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzTagsInput, a text field that turns typed entries into removable chips, in packages/core/src/components/forms/.</task>

<motivation>Entering an open-ended set of values (tags, recipient emails, keywords) is common and distinct from selecting from a predefined list. Render committed tokens with the existing DzChip/DzTag so styling stays consistent. Prefer Reka UI's TagsInput primitive if available (ADR-07).</motivation>

<requirements>
  <api>
    - v-model:value via defineModel&lt;string[]&gt;.
    - Props extend BaseFormControlProps (size, variant, tone, disabled, readonly, invalid, placeholder). max (limit), allowDuplicates (default false), delimiters (default [Enter, ','] ), validate(token) =&gt; boolean for per-token validation (e.g. email), addOnBlur.
    - #tag slot to customize each chip.
  </api>
  <behavior>Type + delimiter commits a token; Backspace on an empty field removes the last; invalid tokens (per validate) are rejected with a tone='danger' flash; paste splits on delimiters. Honor max and allowDuplicates.</behavior>
  <a11y>role="listbox"/group of removable tokens, each chip's remove control labelled, field announces token count, keyboard remove via Backspace/Delete with focus management.</a11y>
</requirements>

<steps>
  1. Scaffold forms/DzTagsInput. Use Reka UI TagsInput if present; otherwise build on DzInput + DzChip.
  2. Implement commit/remove, delimiter + paste splitting, validation, max, dedupe.
  3. Token the wrapper to the --dz-input-* family so it sits flush with other form controls; chips use --dz-chip-*.
  4. Tests: contract spec + add/remove, delimiters, paste, validate rejection, max, duplicate handling, Backspace, disabled/readonly.
  5. Stories at stories/forms/DzTagsInput.stories.ts: Default, EmailValidation, MaxTags, NoDuplicates, InFormField. Status 'experimental'.
  6. Pass typecheck, lint, tests.
</steps>
```

---

### [x] TASK-NF-07 — `DzMention` (@mention textarea)

_Gap: Ant Design `Mentions`. An input that opens a suggestion menu when a trigger
character (`@`, `#`) is typed. Common in comments, chat, and AI prompt boxes — and
directly relevant to this product's domain._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>

<task>Create DzMention, a textarea/input that surfaces a suggestion dropdown when a configurable trigger character is typed, in packages/core/src/components/forms/.</task>

<motivation>Comment fields, chat, and prompt editors need @mentions and #references. Given this product's AI/collaboration domain (DzPersonaSelector, DzTeamMemberBadge, DzTokenProgressBar already exist), a first-class mention input is high-leverage. Build on DzTextarea and DzPopover/DzMenu so behavior and styling are consistent.</motivation>

<requirements>
  <api>
    - v-model:value via defineModel&lt;string&gt; (the raw text including trigger tokens).
    - Props extend BaseFormControlProps. triggers: Array&lt;{ char: string; options: {label,value,...}[] | ((query)=&gt;Promise) }&gt; — supports async option resolution. multiline (default true → textarea, else single-line input). filter (boolean, default true).
    - #option slot to render rich suggestions (avatar + name); emits 'search' (char, query) and 'select' (char, option).
  </api>
  <behavior>Detect the active trigger + query at the caret; open an anchored menu; Up/Down navigate, Enter/Tab insert the option at the caret and close; Esc dismisses. Inserting replaces the partial token and repositions the caret.</behavior>
  <a11y>Combobox-with-listbox pattern bound to the caret position; aria-activedescendant on the active suggestion; screen reader announces the open suggestion list and count.</a11y>
</requirements>

<steps>
  1. Scaffold forms/DzMention on top of DzTextarea/DzInput + DzPopover + DzMenu.
  2. Implement caret/query detection, async option resolution with a loading state, insertion + caret repositioning.
  3. Token the suggestion menu to the --dz-menu-* family.
  4. Tests: contract spec + trigger detection, filtering, async resolution, keyboard insert, multiple triggers, Esc.
  5. Stories at stories/forms/DzMention.stories.ts: UserMentions (@), Hashtags (#), AsyncSearch, MultiTrigger. Status 'experimental'.
  6. Pass typecheck, lint, tests.
</steps>
```

---

## 🟠 P1 — Strong additions that round out the library

### [ ] TASK-NF-08 — `DzKnob` (rotary numeric input)

_Gap: PrimeVue `Knob`. A circular dial for bounded numeric values — compact and
expressive for settings, audio/level controls, and dashboard inputs._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzKnob, an SVG circular dial numeric input, in packages/core/src/components/forms/.</task>
<motivation>A knob is a compact, visual alternative to a slider for bounded values and reads well on dashboards. It must remain a real, accessible form control, not a decorative widget.</motivation>
<requirements>
  - v-model:value via defineModel&lt;number&gt;. Props extend BaseFormControlProps: size, tone (arc color), disabled, readonly.
  - min (0), max (100), step (1), valueTemplate (e.g. '{value}%'), strokeWidth, showValue. Render with SVG arcs; the filled arc uses tokens (--dz-knob-range, --dz-knob-value).
  - Pointer drag (angle → value) and keyboard: Arrow/PageUp-Down adjust, Home/End to bounds.
  - a11y: role="slider" with aria-valuemin/max/now/text and an accessible label.
</requirements>
<steps>1. Scaffold forms/DzKnob. 2. Implement angle↔value math, pointer drag, keyboard. 3. Token arcs + label. 4. Tests: contract spec + drag, keyboard, bounds, step, template. 5. Stories stories/forms/DzKnob.stories.ts: Default, Stepped, Tones, ReadOnly. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [ ] TASK-NF-09 — `DzSpeedDial` + `DzFab` (floating action button)

_Gap: PrimeVue `SpeedDial`, MUI `Fab`/`SpeedDial`. A pinned circular action button
that fans out secondary actions. No floating action affordance exists today._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzFab (single floating action button) and DzSpeedDial (a DzFab that expands a radial/linear menu of actions) in packages/core/src/components/buttons/.</task>
<motivation>A persistent primary action (compose, add, ask AI) is a common pattern with no current primitive; teams hack it with absolutely-positioned DzButtons. Build DzFab on DzIconButton, and DzSpeedDial as DzFab + a list of DzIconButton actions.</motivation>
<requirements>
  - DzFab: extends DzButton appearance props; tone, size; renders a circular elevated button (--dz-fab-* tokens, shadow from --dz-shadow-*). Slot for icon.
  - DzSpeedDial: items: {icon,label,onClick,disabled}[]; direction: 'up'|'down'|'left'|'right'; type: 'linear'|'radial'; v-model:open (defineModel). Opens on click (and optional hover); each action shows a DzTooltip label.
  - a11y: trigger has aria-expanded/haspopup; actions are a focusable group; Esc closes; staggered reveal via CSS transitions only.
</requirements>
<steps>1. Scaffold buttons/DzFab then buttons/DzSpeedDial. 2. Implement expansion geometry (linear + radial) and defineModel open state. 3. Token sizing/elevation/offsets. 4. Tests: contract spec + open/close, item click, directions, Esc, a11y. 5. Stories stories/buttons/DzSpeedDial.stories.ts: Fab, LinearUp, Radial, WithLabels. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [ ] TASK-NF-10 — `DzToolbar` (action bar layout)

_Gap: PrimeVue `Toolbar`, Bootstrap `Btn toolbar`. A semantic start/center/end action
bar. `dzup-ui` has `DzButtonGroup` and `DzAppShell` but no general toolbar primitive._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzToolbar, a horizontal action bar with start/center/end slots, in packages/core/src/components/layout/.</task>
<motivation>Page and panel headers repeatedly need a "controls left, title middle, actions right" bar with consistent spacing, wrap, and overflow behavior. Standardizing it removes bespoke flex markup across apps.</motivation>
<requirements>
  - Named slots: #start, #center, #end (default slot = start). Props extend BaseAppearanceProps (size → control density, variant: 'flat'|'outlined'|'elevated' mapped to existing surface tokens). wrap (boolean), sticky (boolean).
  - Pure layout component — tv() only, no interaction logic. Tokens --dz-toolbar-* for gap/padding/border/background referencing global surface tokens.
  - a11y: role="toolbar" with aria-orientation; ensure logical tab order start→center→end.
</requirements>
<steps>1. Scaffold layout/DzToolbar. 2. Implement slotted flex layout with wrap/sticky variants. 3. Token spacing/surface. 4. Tests: contract spec + slot placement, variants, sticky class, role. 5. Stories stories/layout/DzToolbar.stories.ts: Default, TitleCentered, Sticky, ResponsiveWrap. Status 'beta'. 6. typecheck/lint/tests green.</steps>
```

---

### [ ] TASK-NF-11 — `DzMegaMenu` (multi-column navigation menu)

_Gap: PrimeVue `MegaMenu`, Bootstrap mega-menu patterns. A horizontal nav bar whose
items open wide multi-column panels. `dzup-ui` menus are single-column only._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzMegaMenu, a horizontal navigation bar where top-level items open multi-column dropdown panels, in packages/core/src/components/navigation/.</task>
<motivation>Marketing sites and large apps need grouped, multi-column navigation that a single-column DzMenu/DzDropdownMenu cannot express. Reuse DzPopover positioning and DzMenuItem rendering.</motivation>
<requirements>
  - model: items with nested column groups: {label, items: {label, items: [...]}[] }. orientation: 'horizontal'|'vertical'. Each panel renders N columns of grouped links.
  - #item / #group slots for custom rendering (icons, descriptions, featured cards). breakpoint prop to collapse into a stacked/accordion menu on small screens.
  - a11y: role="menubar" + roving tabindex; Arrow keys move across/into panels; Esc closes; hover and keyboard both open; focus returns to the trigger on close.
</requirements>
<steps>1. Scaffold navigation/DzMegaMenu reusing DzPopover + DzMenuItem. 2. Implement menubar keyboard model + multi-column panels + responsive collapse. 3. Token panel/column spacing to --dz-menu-*. 4. Tests: contract spec + open/close, column rendering, keyboard menubar nav, responsive collapse, Esc. 5. Stories stories/navigation/DzMegaMenu.stories.ts: Horizontal, WithFeaturedCard, Responsive. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [ ] TASK-NF-12 — `DzDataView` (list/grid switchable data display)

_Gap: PrimeVue `DataView`. Renders a collection as a list or card grid with built-in
paging/sorting and a layout toggle. `dzup-ui` has `DzTable`/`DzDataGrid` (tabular) but
no card/list collection renderer._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzDataView, a data collection renderer with list/grid layouts, paging, and sorting, in packages/core/src/components/data/.</task>
<motivation>Product catalogs, galleries, and dashboards display records as cards/list rows rather than table cells. DzDataView fills the space between DzList (simple) and DzDataGrid (tabular), reusing DzPagination and the card primitives.</motivation>
<requirements>
  - items: T[]; v-model:layout 'list'|'grid'; #item slot receives ({ item, index, layout }) for full control of each cell; #header/#empty/#footer slots.
  - Built-in DzPagination (paginator boolean, rows, v-model:first) and sort (sortField, sortOrder) via a sort-options slot/control. dataKey for stable keys.
  - Pure presentation over data — no fetching. Grid uses DzGrid; loading state via DzSkeleton; empty state via DzEmpty.
  - a11y: layout toggle is a labelled segmented control (reuse DzSegmented); list is a real list; announce page changes.
</requirements>
<steps>1. Scaffold data/DzDataView reusing DzPagination, DzGrid, DzSegmented, DzEmpty, DzSkeleton. 2. Implement layout toggle, paging, sorting. 3. Token grid gap/list divider to existing families. 4. Tests: contract spec + layout switch, paging, sort, empty, loading, slot rendering. 5. Stories stories/data/DzDataView.stories.ts: ListLayout, GridLayout, Paginated, Sortable, Loading, Empty. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [ ] TASK-NF-13 — `DzDescriptions` (key/value detail list)

_Gap: Ant Design `Descriptions`. A bordered, responsive label/value grid for read-only
record detail. `dzup-ui` has no structured key/value display primitive._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzDescriptions, a responsive label/value detail grid, in packages/core/src/components/data/.</task>
<motivation>Detail/summary panes (profile fields, settings summaries, record metadata) need consistent label/value layout. Teams currently rebuild this with ad-hoc grids; a primitive guarantees alignment, borders, and responsive column collapse.</motivation>
<requirements>
  - items: {label, value, span?}[] OR DzDescriptionsItem child components for slot-rich values. columns (responsive number), layout: 'horizontal'|'vertical', bordered (boolean), size (CanonicalSize → density).
  - Tokens --dz-descriptions-* for label color, border, and row/cell padding from global surface tokens. Items can span multiple columns.
  - a11y: render as a definition list (dl/dt/dd) so the label↔value relationship is exposed to assistive tech.
</requirements>
<steps>1. Scaffold data/DzDescriptions (+ optional DzDescriptionsItem sub-part documented in a *Parts story). 2. Implement responsive column/span layout, bordered + sizes. 3. Token labels/borders/padding. 4. Tests: contract spec + column spans, bordered, vertical layout, dl semantics. 5. Stories stories/data/DzDescriptions.stories.ts: Horizontal, Vertical, Bordered, ResponsiveColumns, WithSlots. Status 'beta'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-14 — `DzOrderList` (reorderable list)

_Gap: PrimeVue `OrderList`. A single list whose items can be reordered by drag and by
up/down controls. `dzup-ui` has `DzTransfer` (two-list move) but no in-place reorder._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzOrderList, a reorderable list with drag and keyboard controls, in packages/core/src/components/data/.</task>
<motivation>Ordering priorities, building playlists/sequences, and arranging dashboard widgets all need in-place reordering. DzTransfer moves items between lists but cannot reorder within one. Reuse DzList/DzListItem for rendering.</motivation>
<requirements>
  - v-model:value via defineModel&lt;T[]&gt; (the ordered array). #item slot for row content; selectable (multi-select to move groups).
  - Reorder via pointer drag (with a drag handle) AND via Move Up / Move Down / Move To Top / Bottom controls. Emit 'reorder' with {from,to}.
  - a11y: keyboard reordering (e.g. Space to grab, Arrow to move, Space to drop) with live-region announcements of position changes; respects prefers-reduced-motion for the drag animation.
</requirements>
<steps>1. Scaffold data/DzOrderList reusing DzList/DzListItem + DzIconButton controls. 2. Implement drag reorder + control-button reorder + keyboard grab/move/drop. 3. Token handle/selected/drop-indicator. 4. Tests: contract spec + drag reorder, button reorder, multi-select move, keyboard, announcements. 5. Stories stories/data/DzOrderList.stories.ts: Default, WithControls, MultiSelect, CustomItem. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-15 — `DzMeterGroup` (multi-segment meter)

_Gap: PrimeVue `MeterGroup`. Displays multiple proportional values in one bar with a
legend (storage used by type, budget allocation, token usage by model). `dzup-ui`'s
`DzProgress` shows a single value only._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzMeterGroup, a segmented proportional meter with legend, in packages/core/src/components/feedback/.</task>
<motivation>Showing a breakdown of a whole (usage by category, quota allocation) needs a multi-segment bar; DzProgress only renders one value. This is directly useful alongside the existing DzTokenProgressBar for AI usage dashboards.</motivation>
<requirements>
  - values: {label, value, tone?|color-token?, icon?}[]; max (default = sum of values); orientation 'horizontal'|'vertical'; size (CanonicalSize).
  - Renders contiguous segments sized by proportion, an optional legend (#legend slot, default chips with label + value), and #label/#start/#end slots. Each segment colored via tone tokens only (no raw colors).
  - a11y: role="meter" semantics per segment (aria-valuenow/min/max/label) or an accessible summary; legend ties color↔label for non-color-only meaning.
</requirements>
<steps>1. Scaffold feedback/DzMeterGroup. 2. Compute proportions, render segments + legend, support orientation. 3. Token segment colors via semantic tone tokens + radius. 4. Tests: contract spec + proportion math, max override, legend, orientation, a11y. 5. Stories stories/feedback/DzMeterGroup.stories.ts: StorageBreakdown, Vertical, CustomLegend, TokenUsage. Status 'beta'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-16 — `DzPanel` (collapsible titled container)

_Gap: PrimeVue `Fieldset` + `Panel`. A bordered container with a header/legend and
optional collapse. `dzup-ui` has `DzCard`, `DzAccordion`, and `DzCollapse` but no
single titled, optionally-toggleable panel for grouping form sections._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzPanel, a titled container with header actions and optional collapse, in packages/core/src/components/layout/.</task>
<motivation>Grouping a form section or settings block under a titled, optionally-collapsible frame is common; DzAccordion implies a multi-item group and DzCard has no built-in collapse or legend. A standalone panel fills that gap. (Name it DzPanel; expose a `legend` variant to cover the Fieldset use case.)</motivation>
<requirements>
  - Props: header (string) or #header slot; #actions slot (header-right controls); collapsible (boolean) + v-model:collapsed via defineModel; variant: 'outlined'|'elevated'|'legend' (legend = fieldset-style inset title). size, tone.
  - Reuse DzCollapse for the expand/collapse animation; tokens --dz-panel-* mapping to surface/border/shadow globals.
  - a11y: header toggle is a button with aria-expanded controlling the region id; collapsed content is hidden from tab order.
</requirements>
<steps>1. Scaffold layout/DzPanel reusing DzCollapse. 2. Implement header/actions slots, collapsible defineModel, three variants. 3. Token surfaces/borders. 4. Tests: contract spec + collapse toggle, variants, actions slot, a11y. 5. Stories stories/layout/DzPanel.stories.ts: Outlined, Elevated, Collapsible, LegendFieldset, WithActions. Status 'beta'. 6. typecheck/lint/tests green.</steps>
```

---

## 🟢 P2 — Polish & utility primitives

### [ ] TASK-NF-17 — `DzAnchor` (scrollspy section navigation)

_Gap: Ant Design `Anchor`. An in-page table-of-contents nav that highlights the
section currently in view and smooth-scrolls on click — ideal for docs and long forms._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzAnchor, a scrollspy section-navigation list, in packages/core/src/components/navigation/.</task>
<motivation>Long documentation and settings pages need a sidebar TOC that tracks scroll position. This is also useful inside the Storybook docs pages themselves.</motivation>
<requirements>
  - items: {href, label, children?}[] (nested). Uses IntersectionObserver to set the active link; click smooth-scrolls (respects prefers-reduced-motion). offsetTop prop; v-model:active for control. affix (boolean) to stick while scrolling.
  - a11y: nav landmark with aria-current on the active link; keyboard activ: Enter scrolls and moves focus to the target heading.
</requirements>
<steps>1. Scaffold navigation/DzAnchor with an IntersectionObserver composable. 2. Implement active tracking, smooth scroll, nesting, optional affix. 3. Token active marker/indent. 4. Tests: contract spec + active tracking (mocked IO), click scroll, nesting, aria-current. 5. Stories stories/navigation/DzAnchor.stories.ts: Default, Nested, Affixed. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-18 — `DzAffix` (sticky-on-scroll wrapper)

_Gap: Ant Design `Affix`. Pins its content to the viewport once it would scroll past a
threshold. A small primitive that many sticky-toolbar/CTA patterns depend on._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzAffix, a wrapper that fixes its slotted content to the viewport past a scroll threshold, in packages/core/src/components/layout/.</task>
<motivation>Sticky CTAs, toolbars, and summary cards need reliable affix behavior with no layout shift. CSS position:sticky covers many cases but not container-relative or offset-bottom pinning; a primitive standardizes both.</motivation>
<requirements>
  - Props: offsetTop or offsetBottom (number); target (scroll container, default window). Emits 'change' (affixed boolean). Maintains a placeholder of the original size to prevent layout jump.
  - Recompute on scroll/resize (throttled). No visual styling beyond the fixed positioning — purely behavioral.
  - a11y: content semantics unchanged; ensure focus and tab order are unaffected when pinned.
</requirements>
<steps>1. Scaffold layout/DzAffix with a scroll/resize composable. 2. Implement threshold detection, fixed positioning, size placeholder, offsetTop/Bottom. 3. Tests: contract spec + pin/unpin at threshold (mocked scroll), placeholder sizing, change emit. 4. Stories stories/layout/DzAffix.stories.ts: AffixTop, AffixBottom, WithinContainer. Status 'experimental'. 5. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-19 — `DzInplace` (inline edit)

_Gap: PrimeVue `Inplace`. Renders read-only display text that swaps to an editable
field on activation — lightweight inline editing for tables, profiles, and settings._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzInplace, a display→edit toggle wrapper, in packages/core/src/components/forms/.</task>
<motivation>Editable cells and "click to edit" fields are everywhere (table cells, profile fields) and are currently hand-wired. A primitive standardizes the display/edit swap, save/cancel, and focus handling.</motivation>
<requirements>
  - #display slot (read view) and #edit slot (the input). v-model:active via defineModel for open state; v-model:value passthrough. Activate on click/Enter; Esc cancels (restores prior value), Enter/blur commits (configurable saveOn).
  - Emits 'open','save','cancel'. Optional built-in mode that renders a DzInput when no #edit slot is supplied.
  - a11y: display view is a button (role/keyboard); on activate, focus moves into the editor; on close, focus returns to the display trigger.
</requirements>
<steps>1. Scaffold forms/DzInplace. 2. Implement open/commit/cancel + focus management + saveOn. 3. Token the display affordance (hover hint). 4. Tests: contract spec + activate, save, cancel/restore, focus return, default input mode. 5. Stories stories/forms/DzInplace.stories.ts: TextField, InTableCell, CustomEditor. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-20 — `DzQRCode` (QR code renderer)

_Gap: Ant Design `QRCode`. Renders a QR for a value with size/error-correction/logo
options — useful for share links, 2FA enrolment, and mobile handoff._

> **Done.** Dependency chosen: [`qrcode-generator`](https://www.npmjs.com/package/qrcode-generator)
> `^2.0.4` (MIT, ~5 KB, zero deps). It only produces the QR module _matrix_
> (`isDark(row, col)`); DzQRCode renders the SVG itself so the module/background
> colors map to `var(--dz-foreground)` / `var(--dz-background)` tokens (ADR-04)
> instead of baked-in hex — which `node-qrcode`'s SVG output cannot do. Status:
> `experimental`. Files: `packages/core/src/components/media/DzQRCode.*` +
> `packages/core/stories/media/DzQRCode.stories.ts`.

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzQRCode, a token-styled QR code renderer, in packages/core/src/components/media/.</task>
<motivation>Share links, 2FA setup, and desktop→mobile handoff all need QR codes; teams pull in a one-off dependency that ignores the design tokens. Wrap a small, well-maintained QR generator and theme it.</motivation>
<requirements>
  - Props: value (string, required); size; errorLevel 'L'|'M'|'Q'|'H'; color + background (default to --dz-foreground / --dz-background tokens); #logo slot or icon prop centered; status 'active'|'loading'|'expired' with an overlay + #expired refresh action.
  - Render to canvas or SVG. Choose a lightweight MIT-licensed QR lib and add it to packages/core deps; document the choice in the PR.
  - a11y: role="img" with an aria-label describing the encoded value's purpose (not the raw payload).
</requirements>
<steps>1. Select + add the QR dependency. Scaffold media/DzQRCode. 2. Implement rendering, error levels, logo, status overlay. 3. Token colors/background/radius. 4. Tests: contract spec + renders for value, error level prop, status overlay, aria-label. 5. Stories stories/media/DzQRCode.stories.ts: Default, WithLogo, ErrorLevels, ExpiredState. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-21 — `DzWatermark` (content watermark overlay)

_Gap: Ant Design `Watermark`. Tiles repeating text/image over its content for
ownership/confidentiality marking — relevant for previews and shared documents._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzWatermark, a wrapper that overlays tiled text/image marks over slotted content, in packages/core/src/components/media/.</task>
<motivation>Confidential previews, trial/demo states, and shared exports often need a subtle repeating watermark. A primitive makes it consistent and tamper-resistant.</motivation>
<requirements>
  - Props: content (string | string[]) or image; rotate (default -22deg), gap, fontSize/color (token-based, low-opacity), zIndex. Renders a canvas-generated tile as a repeating background over a default slot.
  - Optionally observe DOM mutations to re-apply if the overlay node is removed (tamper resistance), gated behind a prop.
  - a11y: the watermark is aria-hidden and pointer-events:none so it never blocks interaction or screen readers.
</requirements>
<steps>1. Scaffold media/DzWatermark. 2. Generate the tile via canvas → data URL; layer it as a non-interactive overlay. 3. Token default color/opacity. 4. Tests: contract spec + multi-line content, rotate/gap props, aria-hidden + pointer-events, optional mutation re-apply. 5. Stories stories/media/DzWatermark.stories.ts: TextMark, MultiLine, OverImage. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-22 — `DzBackTop` (scroll-to-top button)

_Gap: Ant Design `BackTop`, PrimeVue `ScrollTop`. A button that appears after
scrolling and returns to the top. Tiny, ubiquitous, and currently missing._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzBackTop, a scroll-to-top affordance, in packages/core/src/components/navigation/.</task>
<motivation>Long pages need a quick return-to-top; this is a trivial but expected utility. Build it on DzFab/DzIconButton so styling is shared.</motivation>
<requirements>
  - Props: visibilityHeight (px before it appears, default 400), target (scroll container, default window), duration (smooth-scroll ms, respect prefers-reduced-motion). Default slot overrides the icon. Fade/slide in via CSS transition.
  - a11y: a real button with an accessible label ('Back to top'); keyboard-activatable; hidden from tab order while not visible.
</requirements>
<steps>1. Scaffold navigation/DzBackTop reusing DzFab/DzIconButton + a scroll composable. 2. Implement visibility threshold + smooth scroll. 3. Token offset/position. 4. Tests: contract spec + appears past threshold (mocked scroll), scrolls to top on click, label, hidden when not visible. 5. Stories stories/navigation/DzBackTop.stories.ts: Default, CustomThreshold, InScrollContainer. Status 'beta'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-23 — `DzFloatLabel` (floating-label field wrapper)

_Gap: PrimeVue `FloatLabel`, MUI floating labels. A wrapper whose label animates from
placeholder position to a floated caption when the field is focused/filled._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzFloatLabel, a wrapper that floats a label above any dzup form input on focus/fill, in packages/core/src/components/forms/.</task>
<motivation>The float-label pattern is a popular, space-efficient labeling style. Offering it as an opt-in wrapper (rather than baking it into every input) keeps DzInput/DzSelect/etc. simple while giving teams the option.</motivation>
<requirements>
  - Slot wraps a single dzup form control (DzInput, DzSelect, DzTextarea, DzNumberInput, ...). Props: label (string), variant 'over'|'in'|'on' (label rest/float positions). Detects focus + filled state from the slotted control to drive the float transition.
  - Must associate the label with the control's id for a11y (htmlFor/id wiring) — never a purely visual label. Transition via CSS only; respect prefers-reduced-motion.
</requirements>
<steps>1. Scaffold forms/DzFloatLabel. 2. Detect focus/filled via events on the slotted control; wire label↔control id. 3. Token label rest/float typography + color. 4. Tests: contract spec + floats on focus, stays floated when filled, three variants, label/id association. 5. Stories stories/forms/DzFloatLabel.stories.ts: OverInput, WithSelect, Variants. Status 'experimental'. 6. typecheck/lint/tests green.</steps>
```

---

### [x] TASK-NF-24 — `DzBlockUI` (content loading mask)

_Gap: PrimeVue `BlockUI`. Masks and disables an arbitrary region during async work
with an optional spinner/message. `dzup-ui` has `DzSkeleton`/`DzSpinner`/`DzAsyncBoundary`
but no "freeze this panel while saving" overlay._

```xml
<role>You are a Vue 3 + TypeScript component engineer in dzup-ui. Follow <repo_conventions> exactly.</role>
<task>Create DzBlockUI, an overlay that blocks interaction with its slotted content during async operations, in packages/core/src/components/feedback/.</task>
<motivation>Saving a form or refreshing a panel should prevent further interaction with that region without unmounting it (which DzAsyncBoundary does for full replacement). DzBlockUI dims + disables in place, preserving content and scroll position.</motivation>
<requirements>
  - v-model:blocked via defineModel&lt;boolean&gt;. Default slot = blocked content; #overlay slot for custom mask content (default = DzSpinner + optional message). fullScreen (boolean) to mask the viewport.
  - While blocked: capture pointer events, set aria-busy, and move focus out of / trap focus away from the blocked region so keyboard users can't tab into disabled controls.
  - Token the scrim color/opacity (--dz-blockui-mask) and blur from global tokens; respect prefers-reduced-motion for the fade.
</requirements>
<steps>1. Scaffold feedback/DzBlockUI reusing DzSpinner. 2. Implement scrim, pointer capture, aria-busy, focus containment, fullScreen mode. 3. Token mask/blur. 4. Tests: contract spec + blocks pointer/keyboard when blocked, aria-busy, custom overlay slot, fullScreen, unblock restores. 5. Stories stories/feedback/DzBlockUI.stories.ts: PanelBlock, WithMessage, FullScreen. Status 'beta'. 6. typecheck/lint/tests green.</steps>
```

---

## Summary — gap map

| #   | Component         | Closest peer(s)                           | dzup-ui status          | Family     | Priority |
| --- | ----------------- | ----------------------------------------- | ----------------------- | ---------- | -------- |
| 01  | DzRating          | PrimeVue Rating · AntD Rate · MUI Rating  | missing                 | forms      | 🔴 P0    |
| 02  | DzCalendar        | PrimeVue/AntD/CoreUI Calendar             | only DatePicker         | data       | 🔴 P0    |
| 03  | DzTour            | AntD Tour                                 | missing                 | overlays   | 🔴 P0    |
| 04  | DzTreeSelect      | PrimeVue/AntD TreeSelect                  | Tree+Select separate    | forms      | 🔴 P0    |
| 05  | DzCascader        | AntD Cascader · PrimeVue CascadeSelect    | missing                 | forms      | 🔴 P0    |
| 06  | DzTagsInput       | PrimeVue Chips · AntD tags · MUI freeSolo | done                    | forms      | 🔴 P0    |
| 07  | DzMention         | AntD Mentions                             | missing                 | forms      | 🔴 P0    |
| 08  | DzKnob            | PrimeVue Knob                             | done                    | forms      | 🟠 P1    |
| 09  | DzSpeedDial/DzFab | PrimeVue SpeedDial · MUI Fab              | done                    | buttons    | 🟠 P1    |
| 10  | DzToolbar         | PrimeVue Toolbar                          | done                    | layout     | 🟠 P1    |
| 11  | DzMegaMenu        | PrimeVue MegaMenu                         | done                    | navigation | 🟠 P1    |
| 12  | DzDataView        | PrimeVue DataView                         | done                    | data       | 🟠 P1    |
| 13  | DzDescriptions    | AntD Descriptions                         | done                    | data       | 🟠 P1    |
| 14  | DzOrderList       | PrimeVue OrderList                        | Transfer only           | data       | 🟠 P1    |
| 15  | DzMeterGroup      | PrimeVue MeterGroup                       | single Progress         | feedback   | 🟠 P1    |
| 16  | DzPanel           | PrimeVue Panel/Fieldset                   | Card/Accordion/Collapse | layout     | 🟠 P1    |
| 17  | DzAnchor          | AntD Anchor                               | done                    | navigation | 🟢 P2    |
| 18  | DzAffix           | AntD Affix                                | missing                 | layout     | 🟢 P2    |
| 19  | DzInplace         | PrimeVue Inplace                          | missing                 | forms      | 🟢 P2    |
| 20  | DzQRCode          | AntD QRCode                               | missing                 | media      | 🟢 P2    |
| 21  | DzWatermark       | AntD Watermark                            | missing                 | media      | 🟢 P2    |
| 22  | DzBackTop         | AntD BackTop · PrimeVue ScrollTop         | missing                 | navigation | 🟢 P2    |
| 23  | DzFloatLabel      | PrimeVue FloatLabel · MUI                 | done                    | forms      | 🟢 P2    |
| 24  | DzBlockUI         | PrimeVue BlockUI                          | AsyncBoundary only      | feedback   | 🟢 P2    |

> **Deliberately excluded (Pro / enterprise tier):** Kanban, Gantt, FormBuilder,
> WorkflowDesigner, OrganizationChart, Terminal, Dock, Editor/rich-text (heavy
> dependency; revisit as a Pro component), full Charting. These do not belong in the
> free `apps/storybook` scope.

## Sources

- [PrimeVue — Vue UI Component Library](https://primevue.org/) ([Knob](https://primevue.org/knob/), [Rating](https://primevue.org/rating/), [OrganizationChart](https://primevue.org/organizationchart/))
- [PrimeVue components overview (DeepWiki)](https://deepwiki.com/primefaces/primevue/3.1-primevue-components)
- [CoreUI for Vue.js components](https://coreui.io/vue/docs/getting-started/introduction.html) · [coreui-vue GitHub](https://github.com/coreui/coreui-vue)
- [Anthropic — Prompt engineering: Be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct)
