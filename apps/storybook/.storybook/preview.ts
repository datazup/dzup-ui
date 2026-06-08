import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { definePreview } from '@storybook/vue3-vite'

// Import Tailwind CSS 4 (processes utility classes used in component variants)
import '../src/tailwind.css'
// Import design tokens CSS for all stories
import '@dzup-ui/tokens/css'
// Import core base styles — defines the shared interaction utilities
// (`.dz-disabled-button`, `.dz-focus-ring-button`, …) that component variants
// reference. Without this, disabled/focus states have no effect in Storybook.
import '../../../packages/core/src/styles/base.css'

export default definePreview({
  // Keep in sync with main.ts `addons` (TASK-0.1).
  addons: [addonDocs(), addonA11y()],
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
          ['Theming', 'Design Tokens', 'Accessibility'],
          'Contributing',
          'Core',
          [
            'Buttons', ['Overview', '*'],
            'Inputs', ['Overview', '*'],
            'Forms', ['Overview', '*'],
            'Cards', ['Overview', '*'],
            'Data', ['Overview', '*'],
            'Feedback', ['Overview', '*'],
            'Layout', ['Overview', '*'],
            'Navigation', ['Overview', '*'],
            'Overlays', ['Overview', '*'],
            'Media', ['Overview', '*'],
            'Typography', ['Overview', '*'],
            'Compositions',
            '*',
          ],
          '*',
        ],
      },
    },
    // TASK-0.9b — report a11y violations without failing the run yet. Flip to
    // 'error' per family as their stories are cleaned up (TASK-X.3). Individual
    // stories can override known false positives with a per-story `a11y` param.
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    // TASK-0.3 — baseline padding so `layout: 'centered'` stories aren't cramped.
    // Per-story `layout: 'fullscreen'`/`'padded'` overrides still apply; this only
    // adds breathing room inside the canvas without changing the layout mode.
    () => ({
      template: '<div class="p-6"><story /></div>',
    }),
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
})
