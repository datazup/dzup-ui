/**
 * Vitest global setup file.
 *
 * Registers @testing-library/jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.)
 * for all test files. Imported via `setupFiles` in vitest.config.ts.
 */
import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver for Reka UI components (Dialog, Tooltip, Popover)
// that use useSize() internally.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof globalThis.ResizeObserver
}
