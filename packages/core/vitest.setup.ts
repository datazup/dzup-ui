/**
 * Vitest setup — JSDOM polyfills for APIs Reka UI primitives rely on.
 *
 * JSDOM omits several observer, scrolling, and pointer-capture APIs used by
 * Reka UI. The public @dzup-ui/testing installer guards every polyfill so a
 * real implementation, if present, is never clobbered.
 *
 * Custom matchers (`toHaveNoViolations`, jest-dom DOM-state matchers) are NOT
 * registered here on purpose: `@testing-library/jest-dom`'s registration has
 * side effects on jsdom CSS serialization that break unrelated style-attribute
 * assertions (e.g. DzAspectRatio's `aspect-ratio`). Those matchers are used
 * only by `tests/a11y/*.a11y.spec.ts`, which register them locally via
 * `tests/a11y/register-matchers.ts`.
 */
import { installDzupUiDomTestEnvironment } from '../../testing/src/index.ts'

installDzupUiDomTestEnvironment()
