# @dzup-ui/tokens

## 0.3.0

### Minor Changes

- a01965f: **All six cascade layers are declared, so a consumer override wins by contract instead of by accident.**

  ADR-19 §2 decided six layers — `@layer dz-reset, dz-tokens, dz-base,
dz-components, dz-utilities, dz-overrides;` — and its Consequences promised that
  _"consumers gain `dz-overrides` immediately as a documented place to write, with
  no library change required"_. Three of the six existed nowhere. `dz-reset`,
  `dz-utilities` and `dz-overrides` were named by the ADR and emitted by nothing.

  The promise still appeared to hold, which is the part worth explaining. An
  **unregistered** layer sorts after every registered one, so a consumer writing
  `@layer dz-overrides { … }` did win — not because the library said so, but
  because nothing had claimed the name. That would have stopped being true the
  first time the library registered any layer after `dz-components`, silently, in a
  consumer's build, with no error anywhere.

  ```css
  /* your stylesheet, imported after the dzup ones */
  @layer dz-overrides {
    .dz-tab-close-btn {
      opacity: 0.5;
    } /* wins. no !important. */
  }
  ```

  **The statement ships in both stylesheets, and it has to.** CSS registers a layer
  at its _first_ appearance. `tokens.css` used to open `@layer dz-tokens` without
  declaring the order, so if a bundler emitted it before `core.css`, `dz-tokens`
  registered ahead of `dz-reset` and the shipped order depended on emit order.
  Both sheets now carry the same six-slot statement; `base.css` remains the single
  statement the docs evidence layer reads.

  **Box-model and document normalisation moved from `dz-base` into `dz-reset`,**
  which is where ADR-19's own table always put them. Nothing else in the library
  sets `box-sizing`, `margin` on `body`, or `scroll-behavior`, so no shipped
  selector changed weight — but a consumer now has the layer the ADR promised for
  resetting the reset.

  **One limit, measured and asserted rather than smoothed over.** A consumer sheet
  that opens `@layer dz-overrides { … }` _before_ the dzup stylesheets are
  evaluated registers that layer first; the library's statement then appends
  `dz-reset … dz-components` after it, `dz-components` wins, and the override
  silently does nothing. Repeating the statement in both sheets does not fix it and
  nothing the library ships can — it cannot make a declaration appear before a
  sheet that loads earlier. Import the dzup stylesheets first, or use unlayered
  CSS, which beats every library layer in either order. `yarn test:e2e:layer-order`
  asserts all of this in chromium, firefox and webkit **against the packed
  tarballs**, because what a consumer receives is the built artifact and every step
  between source and artifact can drop a layer statement.

  **What can break, and what to do.** This is a `minor` because two placements
  of consumer CSS that used to win now lose. Both were measured in Chromium and
  Firefox against the packed tarballs of this release and of the one before it,
  in both stylesheet emit orders (`docs/qa/changeset-audit-2026-09-26/REPORT.md`):
  - **Rules you wrote inside `@layer dz-reset`.** The library used to leave that
    name unregistered, so your `dz-reset` layer was appended last and beat
    `dz-components` and `dz-tokens`. It is now the first, lowest layer, as ADR-19
    §2 decided, and those rules lose. Move them to `@layer dz-overrides`, or make
    them unlayered.
  - **Reset overrides inside `@layer dz-base`, in a sheet loaded before the
    dzup stylesheets.** `box-sizing`, `body` margin and font, and
    `scroll-behavior` moved from `dz-base` to `dz-reset`. A `dz-base` rule that
    loads first now loses to them. Load the dzup stylesheets first, or move the
    rule to `dz-overrides`.

  Unlayered CSS, `@layer dz-overrides`, `dz-components`, `dz-utilities` and a
  layer of your own name behave exactly as before, in every position.

  **`data-state` is no longer typed by a union a shipped component violated.**
  `DataAttributes['data-state']` was typed `DataState`, a closed eight-value list;
  `DzButton` has emitted `idle | loading | disabled` — none of the three — since it
  shipped. ADR-19 §4 decided the widening and it had not been performed. It is now:
  the attribute is `string`, and `DataState` stays as the _named vocabulary_ to
  draw from where it fits. If you were assigning `DataAttributes['data-state']`
  into a `DataState`-typed variable, that no longer narrows on its own — read the
  component's own `states` array, which is where the constraint moved.

  The constraint is real rather than nominal because the check moved with it:
  `yarn validate:anatomy-parts` now reads every `data-state` literal a template can
  produce and fails when the component's anatomy does not declare it. Measured at
  the widening: zero violations across all 32 components that declare an anatomy.

  **Seven part names joined the shared vocabulary and seven were kept deliberately
  outside it.** `validate:anatomy-parts` had been reporting 14 shipped names beyond
  the original 30 — the mechanism ADR-19 §3 specified, working. `clear`, `toggle`,
  `filename`, `language`, `body`, `row` and `cell` name jobs that recur and are now
  vocabulary. `copy-button`, `line-number`, `decrement`, `increment` and the three
  `options-*` names are recorded in the new `ANATOMY_PART_EXTENSIONS` export with a
  reason each, so a reviewed extension is distinguishable from a name nobody has
  looked at. **Nothing was renamed** — renaming a shipped part name is breaking,
  which is exactly why the review happened now.

  **`ariaInvalid` gains its correct home on `BaseValidationProps`,** beside
  `invalid`, `error` and `required`. It is still declared on
  `BaseAccessibilityProps`, deprecated, so this release changes no component's prop
  surface; removing it there is the breaking half and ships on its own.

  **A vendor sublayer registry, empty on purpose.** ADR-19 §3 keeps Reka internals
  out of the parts contract; nothing said the same about a `[data-reka-*]`
  _selector_ inside `@layer dz-components`, which is the same bet on somebody
  else's markup with none of the visibility.
  `packages/core/src/styles/vendor-registry.json` records selector, owner, reason
  and exit condition, and `yarn validate:vendor-sublayers` fails on an incomplete
  entry, on an entry whose rule was deleted, and on a vendor-shaped selector with
  no entry. It ships with **zero** entries, measured rather than assumed — the only
  contact with Reka is a custom property the library reads — which is precisely why
  the third rule is there.

### Patch Changes

- 527dbd1: **A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**

  **WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three
  surfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All
  three were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this
  one: the criterion is about pointer input and asks for a single pointer without
  dragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on
  it and discarded the one plain press that might have been a non-drag path.

  Each of the three now carries a **stepper pair** — one control that shrinks, one
  that grows:
  - **Nothing moves until you reach for it.** The pair is absolutely positioned
    over the gutter (or, for a column, over the header cell) and rests fully
    transparent, so it occupies no layout and paints nothing: every splitter and
    every table header looks exactly as it did, and no consuming layout shifts.
    It is revealed by hovering the gutter, by focusing the separator, or by one
    tap on a device that has no hover. The **DOM** does gain two buttons per
    handle, so a consumer's own DOM snapshot of one of these three components will
    need re-recording — that is the one thing this change asks of you.
  - **It is the same step as the keyboard.** On a splitter, a press dispatches the
    very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`
    and `Shift` is still the full sweep. On a column, both paths call one
    function: 8 px, or 24 px with `Shift`.
  - **There is no prop to switch it off.** A conformance claim a consumer can
    withdraw is not one worth publishing.
  - Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,
    firefox and webkit.

  New `data-part` names you can style and test against: `step-decrease` and
  `step-increase` on the resizable, splitter and table anatomies. `DzTable`'s
  column-resize handle also gains `data-part="separator"` — it has carried
  `role="separator"` all along — plus `aria-valuenow` and `aria-valuemin`, so a
  screen reader is told the width it is changing.

  Four catalog keys, so nothing is hard-coded English:
  `DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,
  `DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.

  **The packages now declare a supported-browser floor.** All six published
  packages carry a `browserslist` key naming the same range. It is not a
  preference: it is the lowest range the published CSS can be generated for, so a
  declaration below it would be a promise the build could not keep. The
  browser-support evidence page reads it out of the tree and prints, beside it,
  the engines the matrix actually drives — a browser the floor admits and no lane
  measures is named as supported by declaration and nothing more.

  This is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and
  attribute above is **added**, none is removed, renamed or narrowed, and §3's
  accessibility carve-out puts a corrected rendered accessibility attribute in the
  patch position deliberately — we would rather ship the fix than hold it for a
  range bump.

## 0.2.0 (2026-08-10)

### Minor Changes

- New `DzPageHero` layout component + `.dz-prose` rich-content styles.

  **DzPageHero** — dark gradient hero band for top-level views (eyebrow,
  gradient h1, description, meta row, glass-treated actions cluster), extracted
  from docs-app's `DocsPageHero` so every app on the neural-indigo preset can
  share the band. Styling keys off the new `PAGE_HERO_TOKENS`
  (`--dz-page-hero-*`) in `@dzup-ui/tokens`, with `--dz-auth-brand-*` fallbacks.

  **.dz-prose** — typography for rendered rich content (markdown → sanitized
  HTML), ported from docs-app's `.docs-prose` and shipped unlayered in
  `dist/core.css` via base.css.

- de9cc6f: Add the public, versioned `ThemeRecipeV1` contract with strict validation and
  legacy migration, deterministic JSON and URL round trips, curated presets, and
  CSS-variable generation/application for palette, radius, shadow, density, font,
  mode, direction, and motion preferences. Include a framework-neutral Storybook
  preset and FOUC-cache helper so OSS and Pro catalogs share the same runtime axes.
- 6c5f522: Normalize the `warning` intent: every intent now exposes the same solid-fill state set (TASK-DS-10).

  `warning` was the only intent that shipped `-solid` / `-solid-hover`, so every
  consumer — `tv()` variants, the contrast gate, the story codemod — carried a
  `tone === 'warning'` branch, and each branch was a place to forget warning exists.

  **New tokens (additive; nothing was renamed or removed):**
  - `--dz-{intent}-solid` and `--dz-{intent}-solid-hover` for `primary`, `secondary`,
    `success`, `danger`, `info`. These resolve to the same primitive shades as
    `--dz-{intent}` / `--dz-{intent}-hover` (500/600 light, 400/300 dark), so **no
    published token changed color** and the swap is a visual no-op for those five.
  - `--dz-warning-hover`, which the intent was missing entirely.

  `--dz-warning-solid` / `--dz-warning-solid-hover` keep their exact values. They are
  no longer a bespoke pair — they are warning's members of a uniform family.

  **Why warning is shaped this way, and why the fill set has two states.** Near-black
  `--dz-warning-foreground` on `--dz-warning` (shade 500) measures **3.51:1** — below
  WCAG AA. A warning button therefore fills with shade 300 (8.44:1) and hovers to 400
  (5.87:1). The ramp affords no shade between 400 and 500, so a third, darker pressed
  step is not available at AA. The uniform fill set is `-solid` + `-solid-hover`; there
  is no `-solid-active` for any intent.

  **Behavior change.** `DzButton`, `DzToast` and `DzTabs` previously hovered solid
  `success` / `danger` / `info` fills with a `/90` alpha shortcut while `primary` used
  its designed `-hover` shade. All tones now hover to `--dz-{tone}-solid-hover` (the
  shade-600 step). This aligns them with `primary` and puts every hover fill under the
  contrast gate, which the alpha shortcut escaped.

  **`-active` reclassified.** `--dz-{intent}-active` is documented as a pressed _surface_
  color, not a text-bearing fill: no component puts `{intent}-foreground` on it, and
  `--dz-warning-active` could not carry it legibly. The contrast gate no longer asserts
  that pair (94 → 84 pairs), because it was gating a combination nothing renders.

  **Special cases removed:** `buildContrastPairs()` in `@dzup-ui/tooling`, the solid and
  outline compound variants across 15 `*.variants.ts` / `*.tokens.ts` files, and the
  `story-color-tokens` codemod all now loop over intents with no branch.

## 0.1.0 (2026-05-03)

### Minor Changes

- ddd50b7: Canonicalize sidebar color tokens and add the missing `--dz-appshell-sidebar-width` definition.
  - New canonical token names: `--dz-sidebar-foreground`, `--dz-sidebar-foreground-hover`, `--dz-sidebar-heading`, `--dz-sidebar-header-bg`, `--dz-sidebar-footer-bg`. These already existed at the semantic tier; they are now also emitted at the component default tier, fixing the cascade collision that prevented `@datazup/dzup-theme` and similar brand presets from cleanly overriding sidebar paint.
  - `--dz-sidebar-text` and `--dz-sidebar-text-hover` are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major.
  - `--dz-sidebar-section-title-color` now resolves through `--dz-sidebar-heading` instead of `--dz-muted-foreground` directly. Apps that override the heading token will see the change reflected in section titles automatically.
  - New token `--dz-appshell-sidebar-width: var(--dz-sidebar-width)` — fixes a four-week-old orphan: `DzAppShell.variants.ts` reads this token but no source file defined it. With this fix the existing `DzAppShell` `sidebarWidth` prop has the correct token plumbing for downstream variant rewrites.

  No existing component variants change in this release. Variant rewrites that consume the canonical names ship in a follow-up minor (Phase 2 / Phase 3 of the shell improvement plan in `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`).

## 0.1.0-alpha.0 (2026-04-02)

### Features

- Initial alpha release of dzup-ui design token system
- CSS custom properties with `--dz-*` namespace
- Light and dark theme support via `data-theme` attribute
- Tailwind CSS 4 integration via `@theme` directive
- Generated artifacts: tokens.css, tokens.d.ts, tailwind-theme.js
- Token categories: colors, spacing, radius, shadows, typography, transitions
- Semantic color tokens (primary, success, warning, danger, info)
- Component-level token overrides
