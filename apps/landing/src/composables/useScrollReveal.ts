/**
 * Scroll-reveal directive — compatibility re-export.
 *
 * The `v-reveal` directive moved into the extractable motion module
 * (`src/motion/directives/reveal.ts`) when the scroll-reveal family was built
 * (docs/animations.md §6.1, Task 3). This barrel is kept so existing consumers
 * (`HomePage.vue`, `BlocksIndexPage.vue`) that import `vReveal` from here keep
 * working unchanged. Prefer importing from `../motion` in new code.
 */
export { vReveal } from '../motion/directives/reveal.ts'
