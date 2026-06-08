/**
 * Reusable Storybook decorators.
 *
 * Previously the dark-mode wrapper was copy-pasted into ~86 stories. Import
 * `darkModeDecorator` instead (TASK-0.4). For global padding/background the
 * baseline lives in `.storybook/preview.ts` (TASK-0.3); these are opt-in,
 * per-story decorators.
 */

import type { Decorator } from '@storybook/vue3-vite'

/**
 * Forces the wrapped story into dark mode on a token-driven background, so a
 * single `DarkMode` story can preview a component against `[data-theme="dark"]`
 * regardless of the global Theme toolbar selection.
 */
export const darkModeDecorator: Decorator = () => ({
  template:
    '<div data-theme="dark" class="bg-[var(--dz-background)] text-[var(--dz-foreground)] p-8 rounded-lg"><story /></div>',
})

/**
 * Constrains a gallery/matrix story to a comfortable reading width and centers
 * it, so wide matrices don't sprawl edge-to-edge in the docs canvas.
 */
export const galleryDecorator: Decorator = () => ({
  template: '<div class="mx-auto w-full max-w-5xl"><story /></div>',
})
