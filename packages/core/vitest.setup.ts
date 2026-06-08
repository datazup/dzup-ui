/**
 * Vitest setup — JSDOM polyfills for APIs Reka UI primitives rely on.
 *
 * JSDOM does not implement ResizeObserver (used by Reka UI `useSize` in
 * DzPopover/DzTooltip arrow positioning) or Element.prototype.scrollIntoView
 * (used by Reka UI Listbox/Combobox in DzMultiSelect). Each polyfill is guarded
 * so a real implementation, if present, is never clobbered.
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
