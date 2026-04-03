/**
 * Vitest setup file for accessibility tests.
 *
 * Registers vitest-axe matchers (toHaveNoViolations) for all *.a11y.spec.ts files.
 * This is added alongside the base vitest.setup.ts in setupFiles configuration.
 */
import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers.js'

expect.extend(matchers)
