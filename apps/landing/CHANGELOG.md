# @dzup-ui/landing

## 0.1.0

### Minor Changes

- e47a96f: Ship the **Blocks** ecosystem surface in the landing app (`apps/landing`).

  This activates the previously "Planned" Blocks tile into a live `/blocks` catalog:
  - **Display infrastructure (Phase A):** new `/blocks` route + `BlocksIndexPage`, a typed
    block registry (`src/blocks/registry.ts`) that pairs each block's lazily-loaded component
    with its exact `?raw` source (zero preview/code drift), the `BlockPreview` shell
    (Preview/Code tabs, viewport resizer, copy), `BlockCard` + `BlockCategoryNav`, "Built from"
    component chips, and per-route SEO/meta. The Ecosystem tile is now `status: 'available'`
    linking to `/blocks`, with matching nav + footer links.
  - **Quality gates (Phase C):** a Vitest registry guard (`registry.spec.ts`) that fails loudly
    if a block advertises a `@dzup-ui/core` component that does not exist, plus the a11y /
    responsive / reduced-motion audit.
  - **Catalog (Phase B, in progress):** one reference block live — `hero-centered` (Marketing) —
    composed purely from free `@dzup-ui/core` components and `--dz-*` tokens, validating the
    end-to-end pipeline. The remaining MVP and full catalog blocks are fast-follows.

  No published `@dzup-ui/*` library package changes — this is a private app and is versioned for
  changelog purposes only (it is never published to npm).

- a0d8926: Ship `@dzup-ui/mcp` — a free, open-source Model Context Protocol server for the dzup-ui ecosystem (Task G5).

  Connect it in Cursor, Claude Code, Windsurf or VS Code with a single `npx -y @dzup-ui/mcp` and an assistant can browse every component, block, template and design token, then fetch the **real `.vue` source** and the `shadcn add` install command on request — "add a dzup-ui pricing block" now resolves to actual code.
  - **New package `packages/mcp`** — a thin, read-only, stdio MCP server over the STATIC catalog artifacts the landing site already generates (`/r/*.json`, `/r/tokens.json`, `/storybook/llms.txt`), so there is one source of truth and zero drift. Tools: `list_components`, `get_component`, `list_blocks`, `get_block`, `list_templates`, `get_template`, `list_tokens`, `get_install_command`, `search`. Configurable origin via `DZUP_UI_REGISTRY_URL` (defaults to the public site; accepts a local checkout for dev). Ships parser/registry unit tests plus an end-to-end JSON-RPC smoke test, and a `server.json` manifest for the public MCP registry.
  - **Landing `/ai` page** — "Use dzup-ui with your AI IDE": copy-paste MCP configs per client, the tool list and example prompts, wired into the top nav. New `dzupMcpConfig()` / `dzupMcpVscodeConfig()` / `dzupMcpClaudeCliCommand()` helpers in `blocks/config.ts` keep the page's snippets in lockstep with the shipped server.

- 6c5f522: Hero v2 (TASK-DS-11) and the regrouped TopNav + trust scaffold (TASK-DS-12).

  **Hero v2 — lead with the product, not the gradient.**
  - A compact, _live_ `ShowcaseFrame` (real `@dzup-ui/core` components, no screenshot)
    now sits above the fold, alongside a new `HeroCodePanel` — a two-step
    "install → import → use" panel that reuses `PmCommandTabs` and `DzCodeBlock`.
    At 1280×800 the page previously showed **zero** product visuals and **zero** code.
  - Full-bleed decorative layers cut from **four to one**. Measured individually
    (Playwright, 1280×800, medians): the aurora cost ~52ms of first paint, the
    spotlight ~48ms, the grid + grain ~4ms. The spotlight survives — cheapest of the
    three that do real work, and the only one with no `filter` or `mix-blend-mode`.
  - The headline no longer runs through `lp-gradient-text`, and the seven-child
    staggered `opacity: 0` entrance is gone — it promoted seven compositing layers
    and gated the LCP element on an animation. Only the visual column animates.
  - `ShowcaseDashboard`'s two below-the-fold frames now mount through the existing
    `useLazyMount`, a screen ahead of the scroll.
  - The hero's duplicate stat row is removed; `SocialProof` already renders it.
  - Net, interleaved A/B against the previous build on the same machine: **median LCP
    1092ms → 948ms (−13%)**, CLS 0 → 0, compositing layers 35 → 17.

  **Accessibility, measured with axe (WCAG 2.x A/AA, serious + critical):**
  desktop **11 → 6** violations, mobile **10 → 7**.
  - `ShowcaseFrame`'s window declared `role="img"` while containing a segmented
    control, a search input, a switch and buttons — an `axe` `nested-interactive`
    violation and simply wrong. It is now `role="group"`.
  - The hero's "Built with" list dimmed `--dz-foreground` to `opacity: 0.62`, which
    measures **4.41:1**. axe never reported it: the aurora and grain layers made the
    backdrop uncomputable, so the rule returned _incomplete_ rather than _fail_.
    Removing those layers surfaced it; it now uses `--dz-muted-foreground`. The same
    layers were also causing a real **4.1:1** failure on the re-theme button's mode
    pill. Nodes axe could not evaluate at all dropped from 38 to 22.

  **TopNav — nine flat items regrouped into five.**
  - `Components` and `Docs` both resolved into Storybook; they are now distinct
    menus. `Ecosystem` duplicated its own children (Blocks / Templates / Animations /
    Themes, three of which were its siblings) and is gone — the home-page section
    stays. `/templates` reaches the nav for the first time.
  - Menus are Reka-backed `DzDropdownMenu`, non-modal, opening onto real anchors
    (middle-click and open-in-new-tab work). `aria-current="page"` marks the active
    route and `aria-current="true"` the group containing it. Menu items get a
    `--dz-ring` focus ring. The mobile drawer mirrors the grouping, closes on Escape
    with focus returned to its toggle, and closes on navigation.
  - `src/nav.ts` is the single source for both surfaces; `nav.spec.ts` gates the two
    invariants the review found broken: ≤5 top-level entries, and no destination
    reachable from two entries.

  **Trust section — shipped empty, on purpose.**

  `HomeTestimonials` is built from `DzCard` / `DzAvatar` / `DzText` and renders
  nothing while `TESTIMONIALS` in `config.ts` is `[]`. dzup-ui has no public users
  yet (the GitHub repo and the npm package are both unpublished — the same reason
  `useLiveStats` degrades its tiles), so there is no real quote to print and no logo
  we have permission to show. A fabricated testimonial would be worse than none.
  `HomeTestimonials.spec.ts` asserts the list stays empty and that the section
  renders correctly once real, permission-cleared entries are added.

### Patch Changes

- 64359ea: Repair form-control semantics in `DzDatePicker`, `DzTimePicker`, and `DzTransfer`.
  - `DzDatePicker` now forwards required state to Reka's native form input instead
    of placing an unsupported `aria-required` attribute on a `role="group"`.
  - `DzTimePicker` exposes its trigger as a combobox and renders its clear action
    as a sibling control, avoiding nested interactive content while preserving
    focus after clearing.
  - `DzTransfer` now owns its options with labelled multiselect listboxes and uses
    keyboard-operable options with a non-interactive visual selection indicator.

  The landing catalog's light/dark accessibility audit now certifies every block,
  so the two resolved debt exceptions and their unbacked trust-mark fallback are
  removed.

- b357645: Prepare generated count projections before aggregate tests and make shared DOM animation-frame cleanup deterministic. Landing animation demos now release their timers and observers when unmounted.
- 5054cb3: Earn a CI-backed Responsive trust mark for the complete Blocks catalog.

  Every standalone block preview now runs through a Chromium mobile, tablet, and
  desktop matrix that verifies meaningful rendering, viewport containment, and no
  page or frame horizontal overflow. Blocks declaring mobile behavior also carry
  computed-layout reflow probes. The new gate found and fixed the compact tooltip
  toolbar's mobile overflow before the mark was enabled.

- caf8dd7: Earn an RTL trust mark for the complete Blocks catalog.

  Every standalone block preview now runs the full Chromium mobile, tablet, and
  desktop layout matrix under both LTR and RTL. The gate verifies that the requested
  direction reaches block content and that RTL introduces no page or frame overflow
  or clipping before the catalog displays the new mark.

- Updated dependencies [64359ea]
- Updated dependencies [6c5f522]
- Updated dependencies [6c5f522]
- Updated dependencies [ca9c390]
- Updated dependencies [d3047a8]
- Updated dependencies [f794441]
- Updated dependencies
- Updated dependencies [df5ba54]
- Updated dependencies [573f2ae]
- Updated dependencies [de9cc6f]
- Updated dependencies [6c5f522]
  - @dzup-ui/core@0.2.0
  - @dzup-ui/tokens@0.2.0
