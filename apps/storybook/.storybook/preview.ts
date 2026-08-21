import type { Decorator } from '@storybook/vue3'
import {
  applyStorybookThemeRecipe,
  createStorybookThemeRecipeFoucCache,
  normalizeThemeRecipe,
  serializeThemeRecipe,
  STORYBOOK_THEME_RECIPE_FOUC_CACHE_KEY,
  STORYBOOK_THEME_RECIPE_GLOBAL_TYPES,
  STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS,
  STORYBOOK_THEME_RECIPE_STORAGE_KEY,
  themeRecipeToStorybookGlobals,
} from '@dzup-ui/tokens'
import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/vue3-vite'
import { onBeforeUnmount } from 'vue'
import { pseudoMessages } from '../../../packages/core/src/i18n/pseudo.ts'
import DzProvider from '../../../packages/core/src/providers/DzProvider.vue'
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

function readInitialThemeRecipeGlobals() {
  if (typeof window === 'undefined')
    return STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS
  try {
    const stored = window.localStorage.getItem(STORYBOOK_THEME_RECIPE_STORAGE_KEY)
    return stored
      ? themeRecipeToStorybookGlobals(normalizeThemeRecipe(JSON.parse(stored) as unknown))
      : STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS
  }
  catch {
    return STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS
  }
}

function persistThemeRecipe(recipe: Parameters<typeof serializeThemeRecipe>[0]): void {
  if (typeof window === 'undefined')
    return
  try {
    window.localStorage.setItem(STORYBOOK_THEME_RECIPE_STORAGE_KEY, serializeThemeRecipe(recipe))
    window.localStorage.setItem(
      STORYBOOK_THEME_RECIPE_FOUC_CACHE_KEY,
      JSON.stringify(createStorybookThemeRecipeFoucCache(recipe)),
    )
  }
  catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

/** Global ThemeRecipeV1 decorator shared by every OSS story and docs page. */
/**
 * Pseudo-locale toolbar (TASK-OSS-P4-03).
 *
 * Wraps EVERY story in a `DzProvider` carrying a pseudo-localised catalog when
 * the toolbar is switched on. Global rather than a per-story decorator on
 * purpose: the packet asks that one story per family render under pseudo, and a
 * toolbar that applies to all 169 story pages satisfies that for every family
 * at once — including families added after this was written, which eleven
 * hand-placed decorators would not.
 *
 * What to look for when it is on:
 *   - **Un-transformed English** — a string the catalog does not reach.
 *   - **A missing `!!!]`** — the label clipped; the frame is how you see it
 *     without knowing what the text should have said.
 *   - **Broken layout** — the +30% padding is the shortest realistic German.
 */
/**
 * Direction toolbar (TASK-OSS-P4-05).
 *
 * Renders every story under `dir="rtl"` with an Arabic locale, so the RTL
 * contract each component declares in its anatomy can be seen rather than
 * inferred. Global for the same reason the pseudo-locale toggle is: the packet
 * asks for one story per family, and a toolbar covers all 169 pages — including
 * families added after this was written.
 *
 * The `dir` goes on a wrapper element, not on `<html>`: only the ROOT
 * `DzProvider` reflects onto the document (ADR-20 A2), and every story here is
 * nested inside Storybook's own tree. That is the same one-attribute job a host
 * does to scope a subtree, so the toolbar demonstrates the documented pattern
 * instead of a private one.
 *
 * What to look for: a chevron pointing away from the panel it opens, a border
 * that stayed on the physical left, text still aligned to the wrong edge, and
 * arrow keys that move the selection backwards.
 */
const withDirection: Decorator = (story, context) => ({
  components: { story, DzProvider },
  setup() {
    const rtl = context.globals.direction === 'rtl'
    return { locale: rtl ? 'ar-EG' : 'en-US', dir: rtl ? 'rtl' : 'ltr' }
  },
  template: '<DzProvider :locale="locale"><div :dir="dir"><story /></div></DzProvider>',
})

const withPseudoLocale: Decorator = (story, context) => ({
  components: { story, DzProvider },
  setup() {
    return { pseudo: context.globals.pseudoLocale === 'on' ? pseudoMessages() : undefined }
  },
  // One `DzProvider` either way, so switching the toolbar does not remount the
  // tree into a different component shape and lose the story's own state.
  template: '<DzProvider :messages="pseudo"><story /></DzProvider>',
})

const withThemeRecipe: Decorator = (story, context) => ({
  components: { story },
  setup() {
    const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : undefined
    let direction = 'ltr'

    const apply = () => {
      if (typeof document === 'undefined')
        return
      const applied = applyStorybookThemeRecipe(
        document.documentElement,
        context.globals,
        media?.matches ?? false,
      )
      direction = applied.recipe.direction
      persistThemeRecipe(applied.recipe)
    }
    const handleSystemChange = () => {
      if (context.globals.theme === 'system')
        apply()
    }

    apply()
    media?.addEventListener('change', handleSystemChange)
    onBeforeUnmount(() => media?.removeEventListener('change', handleSystemChange))
    return { direction }
  },
  template: '<div :dir="direction"><story /></div>',
})

export default definePreview({
  // PREVIEW-side addon registration: decorators, parameters, and anything that runs
  // inside the story iframe. This is deliberately NOT a mirror of main.ts `addons`
  // (which registers presets, Vite config and manager-side panels) — see the note
  // there. Only addon-docs needs both sides. ThemeRecipe behavior comes from the
  // shared global preset and renderer decorator below; addon-vitest is build-time only.
  addons: [addonDocs(), addonA11y()],
  globalTypes: {
    ...STORYBOOK_THEME_RECIPE_GLOBAL_TYPES,
    direction: {
      name: 'Direction',
      description: 'Render every story right-to-left, under an Arabic locale',
      defaultValue: 'ltr',
      toolbar: {
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'Direction: LTR' },
          { value: 'rtl', title: 'Direction: RTL' },
        ],
        dynamicTitle: true,
      },
    },
    pseudoLocale: {
      name: 'Pseudo-locale',
      description: 'Render every string accented, padded +30% and framed in [!!! !!!]',
      defaultValue: 'off',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'off', title: 'Pseudo-locale: off' },
          { value: 'on', title: 'Pseudo-locale: on' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: readInitialThemeRecipeGlobals(),
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
    // preview body, which lives INSIDE the token iframe, and withThemeRecipe
    // writes `data-theme` to <html> — above the body.
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
    // the `theme` global registered by the shared ThemeRecipe preset, so
    // Chromatic captures every story in BOTH light and dark in a
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
    withThemeRecipe,
    withPseudoLocale,
    withDirection,
  ],
})
