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

/**
 * Stretches every slotted label to a realistic worst case (TASK-OSS-P4-03).
 *
 * The companion to the pseudo-locale toolbar. Pseudo-locale lengthens the
 * strings the *library* owns; this lengthens the ones a *consumer* passes,
 * which is the other half of the same failure — a button that fits
 * "Save" and not "Änderungen speichern".
 *
 * Applied as a CSS constraint rather than by rewriting slot content: it works
 * on any story without knowing what that story renders, and it exposes the
 * thing worth seeing — whether the component wraps, truncates or overflows —
 * rather than a longer string in a container that was already wide enough.
 */
export const longLabelDecorator: Decorator = () => ({
  template:
    '<div data-dz-long-label class="max-w-[16rem] [&_button]:max-w-full [&_[data-part=label]]:max-w-full">'
    + '<story /></div>',
})
