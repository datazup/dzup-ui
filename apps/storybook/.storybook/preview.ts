import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { definePreview } from '@storybook/vue3-vite'
import { RESPONSIVE_VIEWPORTS } from '../../../packages/core/stories/_shared/options.ts'
import { AutodocsPage } from '../stories/_blocks/AutodocsPage.ts'

// Import Tailwind CSS 4 (processes utility classes used in component variants)
import '../src/tailwind.css'
// Import design tokens CSS for all stories
import '@dzup-ui/tokens/css'
// Import core base styles — defines the shared interaction utilities
// (`.dz-disabled-button`, `.dz-focus-ring-button`, …) that component variants
// reference. Without this, disabled/focus states have no effect in Storybook.
import '../../../packages/core/src/styles/base.css'

export default definePreview({
  // PREVIEW-side addon registration: decorators, parameters, and anything that runs
  // inside the story iframe. This is deliberately NOT a mirror of main.ts `addons`
  // (which registers presets, Vite config and manager-side panels) — see the note
  // there. Only addon-docs needs both sides. addon-themes contributes its behavior
  // through `withThemeByDataAttribute` in `decorators` below rather than an entry
  // here, and addon-vitest is build-time only.
  addons: [addonDocs(), addonA11y()],
  // FREE2-11 — a global text-direction toolbar, bringing the Storybook to parity
  // with the landing's template preview (which already offers LTR/RTL). Reviewers
  // can now check any component under RTL without cloning. Default LTR via
  // `initialGlobals` so no existing story changes how it renders; the `direction`
  // decorator (below) applies it. This ships the TOGGLE — RTL layout bugs it
  // surfaces are tracked as follow-up (see docs/storybook-decisions.md).
  globalTypes: {
    direction: {
      description: 'Text direction (LTR / RTL)',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'Left-to-right', right: 'LTR' },
          { value: 'rtl', title: 'Right-to-left', right: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    direction: 'ltr',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    docs: {
      toc: true,
      // TASK-FREE2-12 — a per-component "Open in playground" on EVERY component
      // docs page. `page` sets the autodocs template; AutodocsPage mirrors SB's
      // default and injects the playground after the primary demo. It applies to
      // autodocs (tag) pages only — MDX guide pages supply their own page and are
      // untouched, so this needs no page-type guard. See AutodocsPage.ts.
      page: AutodocsPage,
    },
    // TASK-FREE-17 — a viewport toolbar on EVERY story. Until now the set was
    // registered per-story and only three (DzAppShell, DzContainer, DzGrid) opted
    // in, so a responsive component library offered no way to preview 202 of its
    // 205 components at a phone width. Registering it globally is what makes the
    // toolbar unconditional; the layout stories' own `viewport.options` lines are
    // now redundant but harmless (same object).
    //
    // Widths are DERIVED from `BREAKPOINTS` in @dzup-ui/tokens — see the note on
    // RESPONSIVE_VIEWPORTS for why `mobile` (375) is the one deliberate non-token.
    //
    // No `initialGlobals.viewport` on purpose: the default stays 'responsive' (the
    // canvas fills its frame), so this adds a capability without changing how any
    // existing story renders.
    viewport: {
      options: RESPONSIVE_VIEWPORTS,
    },
    // TASK-FREE-17 — check a component against the real surfaces it will sit on.
    //
    // Each value is a `var(--dz-*)` token, not a hex: the addon sets these on the
    // preview body, which lives INSIDE the token iframe, and `withThemeByDataAttribute`
    // writes `data-theme` to <html> (its `parentSelector` default) — above the body.
    // So every swatch below re-resolves when the theme toolbar flips, and one
    // definition serves light and dark. Hardcoding hex here would have needed two
    // sets and would drift from the ramp exactly the way manager.ts's literals do.
    //
    // No `initialGlobals.backgrounds`: unset means stories keep rendering on the
    // default canvas, so this is opt-in per look rather than a global restyle.
    backgrounds: {
      options: {
        surface: { name: 'Surface (--dz-background)', value: 'var(--dz-background)' },
        raised: { name: 'Raised (--dz-surface-raised)', value: 'var(--dz-surface-raised)' },
        sunken: { name: 'Sunken (--dz-surface-sunken)', value: 'var(--dz-surface-sunken)' },
        muted: { name: 'Muted (--dz-muted)', value: 'var(--dz-muted)' },
        inverse: { name: 'Inverse (--dz-foreground)', value: 'var(--dz-foreground)' },
      },
    },
    // TASK-0.6 / TASK-X.6 — sidebar taxonomy.
    // Top level: pin the docs/guide pages above the component families.
    // Within Core: families follow the family-sprint order, and each family
    // pins its `Overview` MDX to the top (`['Overview', '*']`) so the landing
    // page for a family is always its overview, not the first component
    // alphabetically. `showRoots` (manager.ts) keeps `Core`/`Guides` as roots.
    options: {
      storySort: {
        order: [
          'Introduction',
          'Getting Started',
          'Guides',
          [
            // Ordered by how often a reader is blocked on it, not alphabetically:
            // pick-a-component → build a form → ship it on a server → theme it →
            // upgrade it. TASK-FREE-14 added SSR & Nuxt, Forms & Validation,
            // Versioning & Deprecation and Migration; anything unlisted falls
            // through the trailing '*'.
            'Choosing Components',
            'Forms & Validation',
            'SSR & Nuxt',
            'Component Status',
            'Theming',
            'Color Palette',
            'Design Tokens',
            'Accessibility',
            'Versioning & Deprecation',
            'Migration',
            'Releases',
            '*',
          ],
          'Contributing',
          'Core',
          [
            'Buttons',
            ['Overview', '*'],
            'Inputs',
            ['Overview', '*'],
            'Forms',
            ['Overview', '*'],
            'Cards',
            ['Overview', '*'],
            'Data',
            ['Overview', '*'],
            'Feedback',
            ['Overview', '*'],
            'Layout',
            ['Overview', '*'],
            'Navigation',
            ['Overview', '*'],
            'Overlays',
            ['Overview', '*'],
            'Media',
            ['Overview', '*'],
            'Typography',
            ['Overview', '*'],
            'Compositions',
            '*',
          ],
          // Cross-family gallery screens (packages/core/stories/_gallery): the
          // raw-Tailwind vs dzup-ui comparison the token system is measured
          // against (docs/visual-refresh/AUDIT.md).
          //
          // NOT in the public build since TASK-FREE2-02 — main.ts only globs them
          // in under DZUP_GALLERY=1, because a demo screen full of raw `indigo-600`
          // classes is an instrument, not documentation. This entry is therefore
          // inert in a public build and load-bearing only in a DZUP_GALLERY=1 one,
          // where it keeps the root pinned last, below `Core`. Kept for that reason:
          // sorting an absent root costs nothing, and dropping it would put the
          // gallery back in the unsorted trailing '*' the moment anyone flips the
          // flag (which is exactly where TASK-FREE-12 found it).
          'Visual Refresh',
          '*',
        ],
      },
    },
    // TASK-X.3 — enforced WCAG 2.2 AA a11y pipeline (Deque axe-core).
    //
    // `options` is forwarded to `axe.run`. axe's built-in defaults stop at WCAG
    // 2.1, so we pin `runOnly` to the full A/AA tag set *including* `wcag22aa`
    // — this turns on the new 2.2 AA success criteria (e.g. target-size,
    // focus-not-obscured, dragging-movements) that would otherwise be skipped.
    // `best-practice` rules are intentionally excluded so the gate maps exactly
    // to the "WCAG 2.2 AA" claim, not to axe's opinionated extras.
    //
    // Rollout gate (`test`): the report-only default is `'todo'` — violations
    // surface in the A11y panel / test output but do NOT fail CI. A family opts
    // into ENFORCEMENT by spreading `a11yError` (stories/_shared/a11y.ts) into
    // its meta `parameters` once its stories audit clean; from then on any
    // violation in that family fails the Vitest browser run and the
    // `storybook-test` CI job. A documented false positive disables the
    // *specific* rule with `a11yDisableRules('<rule-id>')` — never a blanket
    // disable. See stories/Accessibility.mdx for the per-family status table.
    // TARGET END-STATE: once every family opts in, this global flips to 'error'
    // and the per-family opt-ins are removed.
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      },
      test: 'todo',
    },
    // TASK-APP-01 / TASK-X.5 — Chromatic visual-regression modes. Each mode sets
    // the `theme` global registered by `withThemeByDataAttribute` (decorators
    // below), so Chromatic captures every story in BOTH light and dark in a
    // single run — which also proves the token system holds in dark mode. Applied
    // globally here; a story opts out of a mode with its own
    // `parameters.chromatic.modes` (e.g. `{ dark: { disable: true } }`) and opts
    // out of snapshots entirely with `parameters.chromatic.disableSnapshot: true`.
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
    },
  },
  decorators: [
    // TASK-0.3 — baseline padding so `layout: 'centered'` stories aren't cramped.
    // Per-story `layout: 'fullscreen'`/`'padded'` overrides still apply; this only
    // adds breathing room inside the canvas without changing the layout mode.
    () => ({
      template: '<div class="p-6"><story /></div>',
    }),
    // FREE2-11 — apply the `direction` global. Written to <html> (like the theme
    // decorator's `data-theme`) so Reka overlays teleported to <body> inherit it
    // too, not just the in-canvas wrapper; the wrapper also carries `dir` so the
    // story root is correct even in isolation. Always writes the CURRENT value
    // (never leaves a stale `rtl` when you switch back to LTR), so no teardown.
    (_story, context) => ({
      setup() {
        const dir = context.globals.direction === 'rtl' ? 'rtl' : 'ltr'
        if (typeof document !== 'undefined')
          document.documentElement.setAttribute('dir', dir)
        return { dir }
      },
      template: '<div :dir="dir"><story /></div>',
    }),
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
})
