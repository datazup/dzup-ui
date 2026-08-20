/**
 * Vitest global setup file.
 *
 * Registers @testing-library/jest-dom matchers and the reusable dzup-ui DOM
 * environment used by Reka UI primitives. Imported via `setupFiles` in
 * vitest.config.ts.
 */
import { installDzupUiDomTestEnvironment } from './packages/testing/src/index.ts'
import '@testing-library/jest-dom/vitest'

installDzupUiDomTestEnvironment()
