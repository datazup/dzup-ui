/**
 * Registers the custom matchers used by the a11y suites against the active
 * vitest `expect` instance: `toHaveNoViolations` (vitest-axe) and the
 * @testing-library/jest-dom DOM-state matchers (`toHaveAttribute`,
 * `toHaveTextContent`, etc.).
 *
 * This is imported only by `tests/a11y/*.a11y.spec.ts` rather than registered
 * globally in `vitest.setup.ts`, because jest-dom's matcher registration has
 * side effects on jsdom CSS serialization that break unrelated style-attribute
 * assertions in `src/**` unit specs (e.g. DzAspectRatio's `aspect-ratio`).
 * Scoping the registration to the a11y files keeps those side effects out of
 * the rest of the suite.
 *
 * Importing this module for its side effect (`import './register-matchers.ts'`)
 * is sufficient; it extends `expect` at module-eval time.
 */
import { expect } from 'vitest'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'vitest-axe/matchers'

expect.extend(jestDomMatchers)
expect.extend({ toHaveNoViolations })
