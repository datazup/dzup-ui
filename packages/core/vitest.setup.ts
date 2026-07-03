/**
 * Vitest setup — JSDOM polyfills for APIs Reka UI primitives rely on.
 *
 * JSDOM does not implement ResizeObserver (used by Reka UI `useSize` in
 * DzPopover/DzTooltip arrow positioning) or Element.prototype.scrollIntoView
 * (used by Reka UI Listbox/Combobox in DzMultiSelect). Each polyfill is guarded
 * so a real implementation, if present, is never clobbered.
 *
 * Custom matchers (`toHaveNoViolations`, jest-dom DOM-state matchers) are NOT
 * registered here on purpose: `@testing-library/jest-dom`'s registration has
 * side effects on jsdom CSS serialization that break unrelated style-attribute
 * assertions (e.g. DzAspectRatio's `aspect-ratio`). Those matchers are used
 * only by `tests/a11y/*.a11y.spec.ts`, which register them locally via
 * `tests/a11y/register-matchers.ts`.
 */

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  ;(globalThis as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
}

if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {}
}
