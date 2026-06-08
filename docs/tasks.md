# dzup-ui — Storybook Build-Out Tasks

> Source of truth for migrating proven patterns from **`apps/sandbox`** into
> **`apps/storybook`**, closing component-coverage gaps, and hardening the
> Storybook setup. Scope: `apps/storybook` and the co-located stories in
> `packages/core/stories/**`.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
> **Priority:** 🔴 P0 (foundation/blocking) · 🟠 P1 (coverage) · 🟢 P2 (polish/nice-to-have)

---

## 1. Analysis Summary (what already exists)

### 1.1 `apps/sandbox` — the work done so far ✅

A Vue 3 + Vite + `vue-router` SPA (port 3000) used as a live playground.

| Area | Detail |
|------|--------|
| Shell | `App.vue` wraps everything in `DzThemeProvider default-theme="system"` + custom `ThemeToggle` (light/dark via `useTheme`) |
| Routing | `router.ts` — 12 lazy routes: Home + 11 families |
| Pages | `HomePage`, `ButtonsPage`, `InputsPage`, `FormsPage`, `CardsPage`, `DataPage`, `FeedbackPage`, `LayoutPage`, `NavigationPage`, `OverlaysPage`, `MediaPage`, `TypographyPage` |
| Quality | Hand-crafted demos: variant / tone / size matrices, state rows, event handling, **real-world compositions** (e.g. `FormsPage` has a composed form with live JSON state preview, sticky preview card, validation badges, gallery grids) |
| Styling | App shell uses `<style scoped>` + `var(--dz-*)` tokens (sandbox-only; not subject to component ADR-04 rule) |
| Resolution | Workspace aliases to `packages/*/src` (mirrors Storybook's `viteFinal` aliases) |

**Takeaway:** the sandbox pages are a goldmine of curated, real-world demo
arrangements. Most can be lifted into Storybook as gallery / composition stories.

### 1.2 `apps/storybook` — current state 🚧

Storybook 10 + `@storybook/vue3-vite` (port 6006).

| Area | Detail |
|------|--------|
| `main.ts` | Globs `../../../packages/core/stories/**/*.stories.ts` + `../stories/**/*.mdx`; `viteFinal` re-declares workspace aliases; `docs.autodocs: 'tag'`; `typescript.check: false` |
| `preview.ts` | `definePreview` with `addonDocs()` + `addonA11y()`; `controls.matchers`; `layout: 'centered'`; `docs.toc`; `withThemeByDataAttribute({ light, dark }, attributeName: 'data-theme')` |
| `manager.ts` | `showRoots: true`, shortcuts enabled |
| Local stories | **Only** `stories/Introduction.mdx` (states "147 components" — actual count is **155 `.vue` files**) |
| Installed addons | `addon-a11y`, `addon-docs`, `addon-themes`, `@storybook/test@8.6.15` |
| Co-located stories | **99 `*.stories.ts`** in `packages/core/stories/**` covering all 11 families + 2 `compositions/` |

**Theming sanity check:** tokens key dark mode off `[data-theme="dark"]`
(`packages/tokens/dist/tokens.css`), and `withThemeByDataAttribute` toggles
exactly that attribute → ✅ theme switching is wired correctly. No core
component injects the theme context, so the `data-theme` decorator alone is
sufficient (a `DzThemeProvider` wrapper is optional, see TASK-0.5).

### 1.3 Coverage gaps (components with **no** `.stories.ts`)

| Family | Missing stories |
|--------|-----------------|
| buttons | `DzCopyButton` |
| data | `DzCodeBlock` |
| forms | `DzFieldArray`, `DzPersonaSelector` |
| overlays | `DzConfirmDialog` |
| feedback | `DzAsyncBoundary`, `DzErrorBoundary`, `DzRunStatusBadge`, `DzTokenProgressBar`, `GovernanceBadge`, `TeamMemberBadge` |

> Sub-part components (e.g. `DzCardBody`, `DzTabTrigger`, `DzDialogContent`) are
> intentionally documented inside their parent's `*Parts.stories.ts` and are not
> counted as gaps.

### 1.4 Configuration / consistency issues to fix

1. **Addon registration mismatch** — `main.ts` lists only `['@storybook/addon-docs']`; a11y + themes are registered only in `preview.ts`. Consolidate so the a11y panel and theme toolbar reliably appear.
2. **Import drift** — stories import types from `@storybook/vue3` and helpers from `@storybook/test@8.6.15` while the rest is SB10. Standardize on `@storybook/vue3-vite` + `storybook/test`.
3. **Stale count** in `Introduction.mdx` (147 ≠ 155).
4. **No MDX docs pages** beyond the intro (no per-family overview, theming, tokens, a11y, contributing).
5. **No automated testing / visual-regression / coverage** pipeline.

### 1.5 Research-informed direction (June 2026)

The plan below reflects current Storybook guidance. Key decisions:

- **Use `@storybook/addon-vitest`, not the legacy `test-runner`.** This Storybook is Vite-based, and the test-runner has been **superseded** by the Vitest addon, which runs every story's `play()` smoke test **and** the a11y audit in a real Playwright/Chromium browser, surfaces pass/fail in the sidebar + a test widget, and produces coverage reports. The test-runner is only recommended for non-Vite (Webpack/RsPack) builders. _(Sources at bottom.)_
- **Treat stories as the test suite.** "A story records a state; a `play()` makes it a test." Always `await` `userEvent`/`expect` calls inside `play()` so the Interactions panel can log/debug them. Don't chase 100% coverage — use it as a barometer for untested states, and pair interaction tests with visual regression to keep maintenance low.
- **Document like a design system, not just an API dump.** Best-practice component docs carry: description, live variant/state examples, an interactive `ArgTypes`/controls table, **when-to-use + do/don't guidance**, responsive behavior, and a **component status badge** (experimental / beta / stable / deprecated). Expose **theming controls** so consumers see brand/dark behavior, and keep the **A11y panel** visible.
- **Use Storybook doc blocks for token/visual docs** — `ColorPalette`, `Typeset`, `IconGallery`, `Canvas`, `Source`, `ArgTypes`, `Controls` — generated from `@dzup-ui/tokens` so docs can't drift from code.

---

## Sprint 0 — Foundation & Infrastructure 🔴

> Must land before family sprints so every later story inherits a consistent,
> correct baseline.

- [x] **TASK-0.1 — Reconcile addon registration.** `main.ts` `addons` now lists `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-themes` and agrees with `preview.ts`. _AC: pending a fresh `storybook dev` smoke check._
- [x] **TASK-0.2 — Standardize Storybook imports.** Codemodded all 99 stories `@storybook/vue3` → `@storybook/vue3-vite` and `@storybook/test` → `storybook/test`; dropped the pinned `@storybook/test@8.6.15` from `apps/storybook/package.json`.
- [x] **TASK-0.3 — Global decorators baseline.** Added a global `p-6` padding decorator in `preview.ts` (per-story `layout` overrides preserved) + a `galleryDecorator` (max-w-5xl) in `_shared/decorators.ts`.
- [x] **TASK-0.4 — Shared story utilities.** Created `packages/core/stories/_shared/` (`options.ts` SIZES/TONES/VARIANTS + argType fragments, `DemoGrid.ts` DemoRow/DemoGrid/DemoSection, `decorators.ts` darkModeDecorator, `status.ts`, barrel `index.ts`). Deduped the inline `data-theme="dark"` wrapper across **86 stories** → `darkModeDecorator`. _AC met._ (Also fixed the wrapper's broken `--dz-colors-background` → `--dz-background`.)
- [x] **TASK-0.5 — (Optional) `DzThemeProvider` global decorator.** Decided **against** a global provider; `withThemeByDataAttribute` alone is sufficient. Documented in [`storybook-decisions.md`](./storybook-decisions.md).
- [x] **TASK-0.6 — Docs IA scaffolding.** Added `GettingStarted.mdx`, `Theming.mdx`, `DesignTokens.mdx`, `Accessibility.mdx`, `Contributing.mdx`; pinned above `Core/*` via `storySort` in `preview.ts`.
- [x] **TASK-0.7 — Fix `Introduction.mdx`.** Corrected count (163 `.vue` files; "155"/"147" were both stale), regenerated the per-family table from the real inventory, linked the new MDX pages + status badges.
- [x] **TASK-0.8 — Story authoring template.** Added `_shared/Dz.stories.template.ts` (grouped argTypes, required story set, status tag, awaited `play()`); referenced from `Contributing.mdx`.
- [~] **TASK-0.9 — Adopt the Vitest addon (replaces test-runner).** Scaffolded `apps/storybook/vitest.config.ts` (`storybookTest` plugin, browser provider playwright/chromium), `.storybook/vitest.setup.ts`, deps + scripts in `package.json`. **Needs a one-time `yarn install` + `playwright install chromium` (network) to run green** — see decisions doc.
- [x] **TASK-0.9b — Wire a11y assertion level.** Set `a11y.test: 'todo'` globally in `preview.ts`; documented per-story override pattern in `Accessibility.mdx` / `Contributing.mdx`.
- [~] **TASK-0.10 — Coverage report.** Configured v8 coverage in `apps/storybook/vitest.config.ts`; published by the new `storybook-test` CI job (`storybook-coverage` artifact). Runs once TASK-0.9 install lands.
- [~] **TASK-0.11 — Visual regression.** Decided Playwright-snapshots-first (reuse existing Playwright), Chromatic as managed option; non-blocking → required (TASK-X.5). Documented in decisions doc; spec not yet written.
- [x] **TASK-0.12 — CI build job.** `storybook` build job already existed; added `storybook-test` job (play() + a11y + coverage, artifacts) to `.github/workflows/ci.yml`.
- [x] **TASK-0.13 — Component status system.** Taxonomy in `_shared/status.ts` (single source: tag → label/description/color); sidebar badge via `manager.ts` `renderLabel`; docs-header badge via `_blocks/StatusBadge.ts`. Tagged all 99 metas (`status:stable`, gaps/app-specific → `status:experimental`). _AC: badge render pending `storybook dev` smoke check._
- [x] **TASK-0.14 — Doc-block toolkit.** Used `<ColorPalette>` (Theming/DesignTokens MDX) fed from `@dzup-ui/tokens`; added `_blocks/DoDont.ts` (Do/Don't callout) and `_blocks/StatusBadge.ts`. Canvas/Source/ArgTypes/Controls patterns documented in `Contributing.mdx` for family pages.
- [x] **TASK-0.15 — (Optional) Figma/design reference.** Deferred `@storybook/addon-designs`; reserved the `design` parameter convention. Documented in decisions doc.

**Sprint 0 acceptance:** Storybook builds clean; addons consistent; shared story + MDX utils in place; **Vitest addon running `play()` + a11y in-browser**; status badges wired; CI build + tests green.

---

## Per-Family Sprints

> Each family sprint follows the same item structure:
> **(A) Port from sandbox** · **(B) Close coverage gaps** · **(C) Enrich existing stories (incl. `play()` browser tests)** · **(D) A11y + dark-mode + controls** · **(E) Family overview MDX**.
>
> Every family additionally (cross-cutting, applied as the family lands):
> tag each `meta` with a **status** (TASK-0.13), give each family MDX a **When to use + Do/Don't** section (TASK-0.14), and ensure each component meets the **Definition of Done** at the bottom.

---

## Sprint 1 — Buttons 🟠

Components: `DzButton`, `DzButtonGroup`, `DzIconButton`, `DzSplitButton` (+`Action`/`Menu`), `DzToggleButton`, `DzCopyButton`.
Existing stories: `DzButton`, `DzButtonGroup`, `DzIconButton`, `DzSplitButton`, `DzToggleButton`. **Gap: `DzCopyButton`.**

- [x] **TASK-1.A — Port `ButtonsPage`** demo arrangements. Verified already satisfied by the Sprint-0-era stories: variant row (`AllVariants`), tone×variant rows (`VariantToneMatrix`), baseline-aligned sizes (`AllSizes`), states (`States`), event counter (`Interactive`), `DzButtonGroup`, `DzIconButton` trio, `DzToggleButton` state label, `DzSplitButton` menu — each is a named story across the five existing button story files.
- [x] **TASK-1.B — Create `DzCopyButton.stories.ts`** (closes the family gap). `Default` (icon-only), `WithLabel`, `Size Gallery`, `States` (idle/disabled), `Custom Icon + Label Slot`, `Dark Mode`, `Accessibility: Announced State`, two `Real World` rows (install command / API key), and `Interactive: Copy Flow` — an awaited `play()` covering idle → copied (asserts `data-state` + announced "Copied" name) → reset after the 2s timeout.
- [x] **TASK-1.C — Enrich** with awaited `play()`: `DzSplitButton` (`Interactive` asserts the action handler fires; new `Interactive: Menu Select` opens the chevron menu via `aria-expanded` and selects a `menuitem`), `DzToggleButton` (`Interactive` asserts `aria-pressed`/`data-state` flip on click), `DzButtonGroup` (new `Interactive: Keyboard Navigation` asserts `role="group"` + sequential Tab focus — the group is a styling/inject wrapper with no roving tabindex, so standard Tab order is the supported model).
- [x] **TASK-1.D — A11y/controls**: focus-ring/ARIA story now present for every button component (added `Accessibility: Focus States` to `DzIconButton` and `DzButtonGroup`; already present on `DzButton`/`DzSplitButton`/`DzToggleButton`). Verified `aria-busy` on loading actions and `aria-pressed` on toggle render from the components; `argTypes` are grouped into Appearance/Behavior/Accessibility across the family.
- [x] **TASK-1.E — `Buttons.mdx`** overview (`apps/storybook/stories/Buttons.mdx`, title `Core/Buttons/Overview`): variant emphasis + tone-meaning tables, a component index with `StatusBadge`s and deep links, a "when to use which" section, accessibility notes, and four `DoDont` callouts.

---

## Sprint 2 — Inputs 🟢

Components: `DzInput`, `DzInputGroup`, `DzNumberInput`, `DzOtpInput`, `DzPasswordInput`, `DzSearchInput`, `DzTextarea`.
Existing stories: **all 7 present** ✅ (focus on enrichment).

- [x] **TASK-2.A — Port `InputsPage`** arrangements: covered by existing stories — `DzInput` `Variant Gallery`/`Size Gallery`/`States`/prefix-suffix stories, `DzInputGroup` `WithPrefix`/`WithSuffix`/`WithIconAddons`/`WithButtonAddon`, and per-component `Invalid`/`States`. All sandbox `InputsPage` sections are represented.
- [x] **TASK-2.C — Enrich** existing stories with awaited `play()` tests: `DzPasswordInput` (toggle visibility → `type` + button label flip), `DzSearchInput` (type → clear button → empty), `DzNumberInput` (min clamp disables decrement, step → `aria-valuenow`), `DzOtpInput` (type full 6-digit code across auto-advancing cells), `DzTextarea` (multi-line value), `DzInputGroup` (typed value → composed URL preview). `DzInput` already had one (Sprint 0). _All compile green under `storybook build`._
- [x] **TASK-2.D — A11y/controls**: `Invalid`/error stories present per component; `play()` tests now assert ARIA semantics (`role="spinbutton"`/`aria-valuenow`, search/clear labels, password toggle labels); all 7 share the canonical `Appearance/Behavior/State/Accessibility` `argTypes` buckets. `DzFormField` label-association guidance documented in `Inputs.mdx` (stories use `aria-label`/`aria-labelledby`).
- [x] **TASK-2.E — `Inputs.mdx`** overview added (`apps/storybook/stories/Inputs.mdx`, `Core/Inputs/Overview`): family table w/ status badges, when-to-use, **`DzInputGroup` vs prefix/suffix** guidance, validation/labelling, a11y notes, Do/Don't blocks.

---

## Sprint 3 — Forms 🟠

Components: `DzCheckbox(+Group)`, `DzRadio(+Group)`, `DzSelect`, `DzMultiSelect`, `DzCombobox`, `DzSwitch`, `DzSlider`, `DzRangeSlider`, `DzDatePicker`, `DzDateRangePicker`, `DzTimePicker`, `DzColorPicker`, `DzFileUpload`, `DzTransfer`, `DzFormField`/`Label`/`Description`/`Message`, `DzFieldArray`, `DzPersonaSelector`.
Existing stories: most present. **Gaps: `DzFieldArray`, `DzPersonaSelector`.**

- [x] **TASK-3.A — Port the flagship `FormsPage`** as `compositions/WorkspaceForm.stories.ts`: full composed form (Select, Combobox, DatePicker, MultiSelect w/ max-selections, RadioGroup, CheckboxGroup, tone-by-value Sliders, Switches, terms checkbox) **plus the live JSON state preview panel** and the "Ready / Missing required fields" badge. Scoped CSS → Tailwind + `var(--dz-*)` tokens; added `play()` (accept-terms → badge/preview reflect state) + `DarkMode`. _Build green._
- [x] **TASK-3.A2 — Port the "Control Variants and Sizes" gallery** as `forms/FormControlsGallery.stories.ts` (`Core/Forms/Control Gallery`): Select variants / Switch sizes / Slider tones via `DemoSection`, with `galleryDecorator` + `DarkMode`.
- [x] **TASK-3.B1 — Create `DzFieldArray.stories.ts`** (`status:experimental`): add/remove/reorder rows, min/max items, per-row validation via `DzFormField`, `DarkMode`, `play()` add-then-remove.
- [x] **TASK-3.B2 — Create `DzPersonaSelector.stories.ts`** (`status:experimental`): default, avatars + initials fallback, empty slot, disabled, interactive (`change` event), `DarkMode`, `play()` open-and-select. Confirmed **public API** (exported from `@dzup-ui/core`); resolves the Sprint-3 half of TASK-X.4.
- [~] **TASK-3.C — Enrich** with `play()`: ✅ `DzSelect` (open→select), `DzMultiSelect` (open→select→chip), `DzCombobox` (open→type-filter→select), `DzSlider`/`DzRangeSlider` (keyboard step via `aria-valuenow`), `DzTransfer` (move both directions). **Remaining:** `DzDatePicker`/`DzDateRangePicker` (min/max bounds) and `DzFileUpload` (drag-drop + file-type validation) — deferred (calendar-popover / file-`DataTransfer` harness).
- [~] **TASK-3.D — A11y/controls**: invalid/error stories present across most controls (e.g. `DzSelect` `InvalidState`/`States`) + added in new stories (FieldArray per-row, WorkspaceForm terms); `DzFormParts` documents Label↔control association + `DzFormMessage` live-region. **Remaining:** systematic required/invalid pass for the few controls still missing a dedicated state story.
- [x] **TASK-3.E — `Forms.mdx`** overview (`apps/storybook/stories/Forms.mdx`, `Core/Forms/Overview`): when-to-use table, composition pattern, prop-driven validation model, `v-model`/defineModel (ADR-16), Do/Don't callouts, a11y notes.

---

## Sprint 4 — Cards 🟢

Components: `DzCard` (+`Header`/`Body`/`Footer`), `DzImageCard`, `DzStatCard`.
Existing stories: `DzCard`, `DzImageCard`, `DzStatCard` ✅.

- [x] **TASK-4.A — Port `CardsPage`** arrangements: covered by existing stories — `DzCard` `Variant Gallery`/`Padding Gallery`/`With All Slots` (header+body+footer), `DzStatCard` `RealWorldDashboard` (stat grid), `DzImageCard` `RealWorldProductGrid` (image grid).
- [x] **TASK-4.A2 — Port the `DashboardCard` composition.** Fixed a correctness bug: `compositions/DashboardCard.stories.ts` passed non-existent `label`/`trend-label`/`tone` props to `DzStatCard` (real props are `title`/`description`), so titles rendered empty. Remapped all three stories and added a `play()` regression guard asserting the labels paint.
- [x] **TASK-4.C — Enrich**: added `Interactive (play test)` (clickable card — mouse + Enter/Space, asserts `role="button"`/`tabindex`) and `States: Loading Skeleton` (DzSkeleton header/body/footer) to `DzCard.stories.ts`; footer-actions covered by `With Footer Actions`; `*Parts` slots documented in `Cards.mdx` anatomy.
- [x] **TASK-4.D — A11y/dark-mode**: per-component `Dark Mode Preview` stories present across the family; interactive keyboard focus now verified by the `DzCard` `play()` test.
- [x] **TASK-4.E — `Cards.mdx`** overview: created `apps/storybook/stories/Cards.mdx` (`Core/Cards/Overview`) — when-to-use, variant-selection table, ASCII anatomy diagram (media/header/body/actions/footer), interactivity/a11y notes, and Do/Don't (incl. the `title` vs `label` gotcha).

---

## Sprint 5 — Data 🟠

Components: `DzTable`(+parts), `DzDataGrid`(+`Header`/`Body`/`Pagination`), `DzAccordion`(+parts), `DzList`/`DzListItem`, `DzTree`/`DzTreeItem`, `DzTimeline`/`DzTimelineItem`, `DzTag`, `DzChip`, `DzCodeBlock`.
Existing stories: most present. **Gap: `DzCodeBlock`.**

- [x] **TASK-5.A — Port `DataPage`** arrangements: the sandbox `DataPage.vue` is an unimplemented placeholder (TODO only), so there is nothing to lift. Verified the intended arrangements are already covered by existing stories — sortable headers (`DzDataGrid` `With Sorting`), pagination (`With Pagination`), accordion group (`DzAccordion`), list (`DzList`/`DzListItem`), tree (`DzTree`), timeline (`DzTimeline`), and tag/chip galleries (`DzTag`/`DzChip`).
- [x] **TASK-5.B — Create `DzCodeBlock.stories.ts`** (closes the family gap, `status:stable`): `Default` (controls), `Languages Gallery` (ts/bash/vue/json), `With Line Numbers`, `States` (header on/off), `Scroll: Max Height`, `Overflow: Long Line`, `With Extra Actions` (actions slot), `Dark Mode`, `Accessibility: Region & Copy Label`, `Real World: Install Instructions`, and `Interactive: Copy Flow` — an awaited `play()` driving the embedded `DzCopyButton` (idle → copied → reset).
- [x] **TASK-5.C — Enrich** with awaited `play()`: `DzDataGrid` (`With Sorting` asserts `aria-sort` none→asc→desc; `With Pagination` asserts page-1/page-2 row swap via Next; `With Row Selection` asserts select-all → "8 row(s)") + new `Performance: 1,000 Rows` story (sortable + paginated synthetic dataset); `DzAccordion` (`Collapsible` expand→collapse; `Multiple Selection Mode` proves two stay open); `DzTree` (`Default` click-to-expand; `Accessibility` ArrowRight/ArrowLeft expand/collapse on a focused branch); `DzTable` (`Accessibility` asserts `role="table"` + `th[scope=col]` + row count; new `Sticky Header` story asserts `position: sticky` + scroll). _Build green._
- [x] **TASK-5.D — A11y/controls**: semantics now asserted in `play()` — table `role`/`scope`/row count, grid `aria-sort`, accordion `aria-expanded`, tree `aria-expanded` + WAI-ARIA `tree`/`treeitem`/`group` roles; keyboard maps documented in the per-component `Accessibility` stories and consolidated in `Data.mdx`. _Note: `DzTreeItem` does not currently emit `aria-level`/`aria-setsize`; documented the implemented roles honestly rather than asserting attributes the component doesn't render (candidate follow-up for the component, not the stories)._
- [x] **TASK-5.E — `Data.mdx`** overview (`apps/storybook/stories/Data.mdx`, `Core/Data/Overview`): family table w/ status badges + deep links, **`DzTable` vs `DzDataGrid` decision matrix**, parts-composition map (Table/DataGrid/Accordion/Tree), Tag-vs-Chip guidance, a11y notes, and four Do/Don't callouts.

---

## Sprint 6 — Feedback 🟠

Components: `DzAlert`, `DzBadge`, `DzProgress`, `DzSpinner`, `DzSkeleton`, `DzToast`(+`Provider`/`Viewport`), `DzNotification`, `DzEmpty`, `DzResult`, `DzAsyncBoundary`, `DzErrorBoundary`, `DzRunStatusBadge`, `DzTokenProgressBar`, `GovernanceBadge`, `TeamMemberBadge`.
Existing stories: core set present. **Gaps: `DzAsyncBoundary`, `DzErrorBoundary`, `DzRunStatusBadge`, `DzTokenProgressBar`, `GovernanceBadge`, `TeamMemberBadge`.**

- [x] **TASK-6.A — Port `FeedbackPage`** arrangements: verified already satisfied by existing stories — `DzAlert` `Variant Gallery`/`Tone Gallery`/`Visual Matrix`/`Closable`, `DzBadge` tone gallery, `DzProgress` `Variant Gallery` (bar/circular)/`Tone Gallery`/`Indeterminate`, `DzSpinner` size gallery, `DzSkeleton` placeholders, and `DzToast` `Default` trigger demo. All sandbox `FeedbackPage` sections are represented.
- [x] **TASK-6.B1 — Create `DzErrorBoundary.stories.ts`** (`status:stable`): `Caught Error Fallback`, `Retry Action`, `Custom Fallback Slot`, `Nested Boundaries` (inner catches without killing outer), `Dark Mode`, and `Interactive: Catch & Recover` (awaited `play()`: trigger → fallback asserts thrown message → retry clears state → child re-renders). Uses an inline `Bomb` render-throwing helper component.
- [x] **TASK-6.B2 — Create `DzAsyncBoundary.stories.ts`** (`status:stable`): `Pending → Resolved`, `Skeleton Loading Fallback`, `Error State`, `Custom Spinner Fallback`, `Accessibility: Busy State` (`aria-busy`/`role="status"`), `Dark Mode`, `Real World: Lazy Panel`, and `Interactive: Load Flow` (awaited `play()` via `findByText`). Uses `async setup()` helper factories for resolve/reject children driven through `<Suspense>`.
- [x] **TASK-6.B3 — Scope confirmed (resolves Sprint-6 half of TASK-X.4).** `DzRunStatusBadge` + `DzTokenProgressBar` are public-exported but product-specific → documented under **`Core/Feedback/App-Specific/*`** (`status:experimental`), each with full story set + awaited `play()` asserting ARIA/data mapping. `GovernanceBadge`/`TeamMemberBadge` are unimplemented stubs (`<span data-stub>`, **not** exported from `@dzup-ui/core`) → **excluded** from docs. Recorded in [`storybook-decisions.md`](./storybook-decisions.md#task-x4--public-vs-app-specific-triage-feedback-components).
- [x] **TASK-6.C — Enrich**: added `DzToast` `Interactive: Dismiss` (awaited `play()` — close button emits `close` → toast hidden). Verified `DzProgress` `Indeterminate` already present (bar + circular) and `DzEmpty`/`DzResult` already have `With Action Buttons` action-slot stories. _(Toast stacking/auto-dismiss is covered by the existing `Interactive` full-system story; not re-asserted in `play()` since portalled viewport + timers are flaky.)_
- [x] **TASK-6.D — A11y/controls**: `role="alert"`/`aria-live` documented on `DzAlert` (`Accessibility: ARIA Roles`) and Reka-managed live regions on `DzToast`/`DzNotification`; `aria-busy`/`role="status"` on `DzAsyncBoundary` (`Accessibility: Busy State`); `aria-valuenow`/min/max asserted for `DzProgress` and `DzTokenProgressBar`; `role="status"` + `aria-label` asserted for `DzRunStatusBadge`. argTypes grouped Appearance/Behavior/Slots/Accessibility across new stories.
- [x] **TASK-6.E — `Feedback.mdx`** overview added (`apps/storybook/stories/Feedback.mdx`, `Core/Feedback/Overview`): status-communication taxonomy (inline / transient / loading / blocking), component index w/ status badges + deep links, when-to-use-which decision notes, a11y section, an **App-Specific** subsection (+ stub-exclusion note), and four `DoDont` callouts.

---

## Sprint 7 — Layout 🟢

Components: `DzContainer`, `DzGrid`, `DzFlex`, `DzStack`, `DzSpacer`, `DzDivider`, `DzAspectRatio`, `DzScrollArea`, `DzCollapse`, `DzAppShell`, `DzResizable`(+parts), `DzSplitter`(+parts).
Existing stories: **all present** ✅ (enrichment focus).

- [x] **TASK-7.A — Port `LayoutPage`** arrangements: the sandbox `LayoutPage.vue` is an unimplemented placeholder (TODO only), so there is nothing to lift. Verified the intended arrangements are already covered by existing stories — container widths (`DzContainer` `Max-Width Gallery`), grid columns/gaps (`DzGrid` `Column Gallery`/`Gap Gallery`), flex alignment matrix (`DzFlex` `Align Gallery`/`Justify Gallery`), stack spacing (`DzStack` `Gap Gallery`), and divider orientations (`DzDivider` `Orientation Gallery`).
- [x] **TASK-7.C — Enrich**: added `DzAppShell` `Real World: Dashboard` (nav sidebar + header chrome + stat-card grid + activity panel, token-driven); added awaited `play()` keyboard-resize tests to `DzResizable` `Interactive` and a new `DzSplitter` `Interactive: Keyboard Resize` (focus the `role="separator"` handle → ArrowRight → assert `@layout-change` repaints panel % off the 50/50 default); added `DzScrollArea` `Interactive: Overflow Scroll` (`play()` asserts `scrollHeight > clientHeight` on the Reka viewport + programmatic scroll); added `DzCollapse` `play()` to `Interactive` (toggle → counter increments + region `data-state` open/closed). _Build green._
- [x] **TASK-7.D — Responsive**: added a shared `RESPONSIVE_VIEWPORTS` map (`_shared/options.ts`, mobile 375 / tablet 768 / desktop 1280) and `Responsive: Mobile/Tablet/Desktop` viewport-parameterized stories (via `parameters.viewport.options` + story-level `globals.viewport`) to `DzGrid`, `DzContainer`, and `DzAppShell`.
- [x] **TASK-7.E — `Layout.mdx`** overview (`apps/storybook/stories/Layout.mdx`, `Core/Layout/Overview`): component index w/ status badges + deep links, **primitive selection guide** (Stack vs Flex vs Grid vs Container vs Spacer decision table), the token-mapped **spacing scale** (`none`→`xl` ↔ `--dz-spacing-*`), a11y notes (polymorphic `as`, visual-vs-DOM order, separator/region/handle roles), and four Do/Don't callouts.

---

## Sprint 8 — Navigation 🟠

Components: `DzTabs`(+`TabList`/`TabTrigger`/`TabContent`), `DzBreadcrumb`(+`Item`/`Separator`), `DzPagination`, `DzMenu`(+`Item`/`Separator`), `DzSidebar`(+`Header`/`Footer`/`Item`/`Section`), `DzStepper`/`DzStepperItem`, `DzSegmented`.
Existing stories: **all top-level present** ✅.

- [x] **TASK-8.A — Port `NavigationPage`** arrangements: the sandbox `NavigationPage.vue` is an unimplemented placeholder (TODO only), so there is nothing to lift. Verified the intended arrangements are already covered by existing stories — tabs variants (`DzTabs` `Variant Gallery` line/enclosed/pills), breadcrumb separators (`DzBreadcrumb` `Custom Separators`/`Icon Separator`), pagination sizes (`DzPagination` `Size Gallery`), segmented control (`DzSegmented` `Size Gallery`/`States`), stepper horizontal/vertical (`DzStepper` `Vertical Orientation`/`All Step States`), and sidebar sections (`DzSidebar` `Default` w/ `DzSidebarSection`).
- [x] **TASK-8.C — Enrich** with awaited `play()`: `DzTabs` (`Interactive` asserts click → `aria-selected` flips; `Accessibility` asserts Arrow-Right roving activates the next `role="tab"`), `DzPagination` (`Interactive` asserts page-1 `aria-current="page"` → Next → page-2 → Prev → page-1 via the labelled prev/next buttons), `DzStepper` (`Interactive` asserts the `aria-current="step"` item advances Account→Profile and back via Next/Previous), `DzMenu` (`Interactive` asserts click moves `aria-current="page"`; `Accessibility` asserts Tab order walks focusable items and skips the disabled one), `DzSidebar` (`Interactive` asserts collapse hides item labels + flips the toggle label). _All compile green under `storybook build`._
- [x] **TASK-8.D — A11y/controls**: semantics now asserted in `play()` — tabs `role="tab"`/`aria-selected` (Reka `tablist`), pagination `aria-current="page"` + descriptive prev/next `aria-label`s, stepper `aria-current="step"`, menu/sidebar-item `aria-current="page"` + `aria-disabled`; breadcrumb `aria-current="page"` documented in its `Accessibility` story. argTypes already grouped Appearance/Behavior/State/Accessibility across the family; keyboard maps consolidated in `Navigation.mdx`.
- [x] **TASK-8.E — `Navigation.mdx`** overview (`apps/storybook/stories/Navigation.mdx`, `Core/Navigation/Overview`): family table w/ status badges + deep links, a **Tabs vs Segmented vs Stepper** decision matrix, a **DzSidebar composition** map (DzMenu-in-sidebar guidance), a11y notes, and four Do/Don't callouts.

---

## Sprint 9 — Overlays 🟠

Components: `DzDialog`(+parts), `DzSheet`(+parts), `DzPopover`(+parts), `DzTooltip`(+parts), `DzDropdownMenu`(+parts), `DzContextMenu`(+parts), `DzCommandPalette`, `DzConfirmDialog`.
Existing stories: most present. **Gap: `DzConfirmDialog`.**

- [x] **TASK-9.A — Port `OverlaysPage`** arrangements: verified already satisfied by existing stories — the sandbox `OverlaysPage.vue` only covers Dialog / Dialog-sizes / Popover / Tooltip / Sheet, all represented by `DzDialog` `Size Gallery`, `DzSheet`/`DzPopover`/`DzTooltip` `Side Gallery` (+ `Alignment Options`), and `DzDropdownMenu`/`DzContextMenu` `Default`/`Side Gallery`. Nothing new to lift.
- [x] **TASK-9.B — Create `DzConfirmDialog.stories.ts`** (`status:stable`, closes the family gap): `Default` (controls), `Variant Gallery` (default/danger), `Danger: Destructive Confirm`, `States: Async Confirm (Loading)`, `With Custom Slot Content` (icon + body slots), `Dark Mode`, `Accessibility: Labelled Dialog`, `Real World: Unsaved Changes Guard`, and `Interactive: Confirm Flow` — an awaited `play()` (open → assert `role="dialog"`/`aria-modal` → click `data-testid=confirm-dialog-confirm` → asserts outcome + dialog closed).
- [x] **TASK-9.C — Enrich** with awaited `play()`: `DzDialog` (`Interactive` now asserts portalled `role="dialog"`/`aria-modal`, confirm closes; new assertions on `Accessibility` for Escape-close + return-focus), `DzSheet` (`Interactive` open → save → close), `DzPopover` (`Interactive` open via trigger → content visible → Escape closes), `DzCommandPalette` (`Interactive` open → type-to-filter the `combobox` → select `option` → asserts emitted selection + closed), `DzTooltip` (`Accessibility` hover trigger → tooltip text visible). _Note: `DzDropdownMenu`/`DzContextMenu` already ship `Interactive` event-handling stories; right-click (`contextmenu`) + roving-focus menus are left without a `play()` harness (flaky in-browser), consistent with the toast-stacking exclusion in Sprint 6._
- [x] **TASK-9.D — A11y/controls**: `role="dialog"` + `aria-modal="true"` + accessible-name (`aria-labelledby`) now asserted in the `DzDialog`/`DzConfirmDialog` `play()` tests; focus-trap return-focus + Escape-close asserted on `DzDialog` `Accessibility`; portalled overlays are opened inside `play()` so the a11y addon can scan them. Scroll-lock + portal/z-index behavior documented in `Overlays.mdx`. argTypes grouped Appearance/Behavior/State/Accessibility on the new `DzConfirmDialog` meta.
- [x] **TASK-9.E — `Overlays.mdx`** overview (`apps/storybook/stories/Overlays.mdx`, `Core/Overlays/Overview`): interruption taxonomy (modal / edge panel / contextual float), component index w/ status badges + deep links, when-to-use-which (Dialog vs Sheet vs ConfirmDialog, Popover vs Tooltip vs DropdownMenu vs ContextMenu), **layering/z-index/portal notes (ADR-07 Reka UI)**, a11y section, and four `DoDont` callouts.

---

## Sprint 10 — Media 🟢

Components: `DzAvatar`, `DzAvatarGroup`, `DzImage`, `DzIcon`, `DzCarousel`(+`Slide`/`Dots`/`Next`/`Previous`), `DzLightbox`.
Existing stories: **all present** ✅.

- [x] **TASK-10.A — Port `MediaPage`** arrangements: the sandbox `MediaPage.vue` is an unimplemented placeholder (TODO only), so there is nothing to lift. Verified the intended arrangements are already covered by existing stories — avatar sizes + fallback initials (`DzAvatar` `Size Gallery`/`Fallback Initials`), avatar group overflow (`DzAvatarGroup` `With Overflow (+N)`), image aspect ratio + loading/error fallback (`DzImage` `Aspect Ratio Gallery`/`With Fallback Image`/`Error State`), icon sizes (`DzIcon` `Size Gallery`), and carousel (`DzCarousel` `Default` + galleries).
- [x] **TASK-10.C — Enrich** with awaited `play()`: `DzCarousel` (`Default` asserts `region`/`aria-roledescription`, dot tablist `aria-selected`, next → dot nav → prev), `DzLightbox` (`Default` opens the portalled Reka dialog from `document.body`, asserts `1 / 3` → Next → `2 / 3` → Close removes the dialog), `DzImage` (new `Interactive: Broken Src → Fallback` — invalid base64 src errors → valid 1×1 PNG fallback loads → `data-state="loaded"`), `DzAvatar` (`Image Error (Fallback)` — broken data-URI → `data-state="fallback"` + initials render). _Offline-safe data-URI fixtures used so play() never hits the network. Autoplay-pause left documented, not asserted (timer flakiness, per Sprint 6 precedent)._
- [x] **TASK-10.D — A11y/controls**: semantics now asserted in `play()` — carousel `role="region"` + `aria-roledescription="carousel"` + dot `aria-selected`; icon decorative (`aria-hidden`, no role) vs meaningful (`role="img"` + `aria-label`) in `Accessibility: Decorative vs Meaningful`; avatar `role="img"` fallback state; lightbox focus-trap/ESC/arrow keys documented + dialog open/close exercised in `play()`. `alt` handling + fallback strategy consolidated in `Media.mdx`.
- [x] **TASK-10.E — `Media.mdx`** overview (`apps/storybook/stories/Media.mdx`, `Core/Media/Overview`): family table w/ status badges + deep links, when-to-use-which, **`DzIcon` usage with `lucide-vue-next`** (decorative vs meaningful), **avatar fallback strategy** (image → slot → initials), a11y notes, and four `DoDont` callouts.

---

## Sprint 11 — Typography 🟢

Components: `DzHeading`, `DzText`, `DzBlockquote`, `DzCaption`, `DzCode`.
Existing stories: **all present** ✅.

- [x] **TASK-11.A — Port `TypographyPage`** arrangements: the sandbox `TypographyPage.vue` is an unimplemented placeholder (TODO only), so there is nothing to lift. Verified the intended arrangements are already covered by existing stories — heading scale (`DzHeading` `All Heading Levels`/`Size Gallery`/`Weight Gallery`), text sizes/weights/tones (`DzText` `Size`/`Weight`/`Tone`/`Element` galleries), blockquote (`DzBlockquote`), caption (`DzCaption` `Tone Gallery`), and inline code (`DzCode` `Variant Gallery`/`Inline Code in Paragraph`).
- [x] **TASK-11.C — Enrich**: added `DzText` `Line Clamp (multi-line)` (single-line `truncate` prop vs `line-clamp-{n}` utility fall-through, since the component only ships single-line `truncate`); semantic-vs-visual already covered by `DzHeading` `Size vs Level Independence` (`level` element vs `size` appearance — note: `DzHeading` uses `level`+`size`, there is no `as` prop); added `DzCode` `DzCode vs DzCodeBlock` cross-reference story pointing to `Core/Data/DzCodeBlock` for header/line-numbers/copy needs.
- [x] **TASK-11.D — A11y/controls**: per-component `Accessibility` + `Dark Mode Preview` stories present (heading hierarchy, semantic elements, `aria-describedby` captions, code semantics); contrast + font-token mapping documented in `Typography.mdx` (tone tokens are theme tokens with dark-mode values; type scale → `--dz-text-*` table). argTypes already grouped Appearance/Behavior/Accessibility across the family.
- [x] **TASK-11.E — `Typography.mdx`** overview (`apps/storybook/stories/Typography.mdx`, `Core/Typography/Overview`): family table w/ status badges + deep links, when-to-use, **type scale & token mapping** table (DzText vs DzHeading step offset), semantic-vs-visual hierarchy section, a11y notes, and four Do/Don't callouts.

---

## Sprint 12 — Cross-Cutting & Hardening 🟠

- [x] **TASK-X.1 — Compositions library.** `Core/Compositions/*` now holds five: `WorkspaceForm` (Sprint 3) + `DashboardCard` + `FormComposition`, plus the two new flagship screens — `AppShellDashboard` (DzAppShell + DzSidebar + DzStatCard + DzGrid + DzCard, interactive sidebar collapse + `play()`) and `SettingsPage` (DzTabs + DzCard + DzFormField/DzInput/DzSelect/DzSwitch/DzTextarea, `play()` switches all three tabs). Both add `DarkMode`. _Build green._
- [x] **TASK-X.2 — Token & theming docs interactivity.** `DesignTokens.mdx`: added a `<Typeset>` type-scale fed from `var(--dz-text-*)` + live spacing bars (`var(--dz-spacing-*)`); `<ColorPalette>` (semantic + primitive) already live in `Theming.mdx`/`DesignTokens.mdx`. `Media.mdx`: live icon set via `<Canvas of={DzIconStories.IconGallery}>` — the React `<IconGallery>` block can't host `lucide-vue-next` (Vue) components, so the live Vue `DzIcon` gallery story is the in-sync source. Rationale in [`storybook-decisions.md`](./storybook-decisions.md#task-x2--token--theming-docs-interactivity).
- [~] **TASK-X.3 — A11y zero-violations gate.** Rollout mechanism documented (per-family `parameters: { a11y: { test: 'error' } }`); left global at `'todo'`. **Blocked on TASK-0.9** — cannot validate a family is clean until the Vitest addon install lands, so families are not yet flipped. Ready to roll out family-by-family once 0.9 is green.
- [x] **TASK-X.4 — Public vs app-specific triage.** Resolved. `DzPersonaSelector` (Sprint 3) → public. `DzRunStatusBadge`/`DzTokenProgressBar` → public but app-specific, documented under `Core/Feedback/App-Specific/*` (`status:experimental`). `GovernanceBadge`/`TeamMemberBadge` → unimplemented stubs, not exported, **excluded** from docs until Contract Spec v1. Full rationale in [`storybook-decisions.md`](./storybook-decisions.md#task-x4--public-vs-app-specific-triage-feedback-components).
- [ ] **TASK-X.5 — Visual-regression gate.** Promote Chromatic/snapshot check (TASK-0.10) to required once baselines are stable. _Gated on TASK-0.10/0.11 baselines — see [`storybook-decisions.md`](./storybook-decisions.md#task-x3--task-x5--task-x8--gated-on-infrastructure)._
- [x] **TASK-X.6 — Sidebar taxonomy polish.** `preview.ts` `storySort` now orders `Core` families by family-sprint order and pins each family's `Overview` MDX to the top (`['Overview', '*']`) so a family lands on its overview, not the first component alphabetically. Confirmed the `Core/<Family>/<Component>` title convention across all 12 families + compositions and `showRoots: true` (`manager.ts`). _Build green._
- [~] **TASK-X.7 — Performance budget.** Lazy-loaded the heavy `DzDataGrid` "Performance: 1,000 Rows" dataset via a story `loader` (`makeLargeData()`) so it's built only when viewed, not at file import; `DzCommandPalette` is already lazy (overlay/list mount on open). Captured a build baseline (~2 min build; `storybook-static/` ~13 MB / assets ~6.5 MB / 112 story chunks; largest chunks are vendor `iframe`/`axe`). **Follow-up:** wire a non-blocking CI size check on `storybook-static/` (bundlesize covers `packages/*/dist` only). Details in [`storybook-decisions.md`](./storybook-decisions.md#task-x7--performance-budget).
- [ ] **TASK-X.8 — Deploy.** Publish the static Storybook (e.g. internal Pages / Chromatic permalinks) and link it from the repo README. _Static build verified clean (`storybook-static/`); needs a hosting target + repo secrets. See [`storybook-decisions.md`](./storybook-decisions.md#task-x3--task-x5--task-x8--gated-on-infrastructure)._

---

## Definition of Done (per component story)

A component story is "done" when it has:

1. A **status tag** on `meta` (TASK-0.13) and a `docs.description.component` summary.
2. `argTypes` grouped into **Appearance / Behavior / State / Accessibility** with descriptions + default summaries.
3. `Default` (controls-driven) + at least one **gallery/matrix** story (variant × tone / sizes).
4. A **States** story (disabled / loading / readonly / invalid as applicable).
5. A **DarkMode** preview (via shared decorator, TASK-0.4).
6. At least one **`play()`** interaction test (where interactive), with **every `userEvent`/`expect` awaited** — green under the Vitest addon (TASK-0.9).
7. A passing **a11y** audit (`'todo'` minimum; `'error'` once the family is gated — TASK-X.3).
8. At least one **Real-World** usage story (ported/derived from the sandbox where one exists).
9. A family **`.mdx`** overview entry linking to it, including **When to use** + **Do/Don't**.

---

## Suggested execution order

`Sprint 0` → `Sprint 3 (Forms)` + `Sprint 6 (Feedback)` + `Sprint 9 (Overlays)` (highest gap/value) → remaining gap families `1/5` → enrichment families `2/4/7/8/10/11` → `Sprint 12`.

---

## References (research, June 2026)

- [Storybook 9 release — testing, a11y, coverage, tags](https://storybook.js.org/blog/storybook-9/)
- [Vitest addon — overview & setup](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)
- [Migrating to the Vitest addon from test-runner](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/migration-guide)
- [Interaction tests & the `play` function](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [How to test UIs with Storybook](https://storybook.js.org/docs/writing-tests)
- [4 ways to document your design system with Storybook](https://storybook.js.org/blog/4-ways-to-document-your-design-system-with-storybook/)
- [Top Storybook documentation examples (status, do/don't, guidelines) — Supernova](https://www.supernova.io/blog/top-storybook-documentation-examples-and-the-lessons-you-can-learn)
