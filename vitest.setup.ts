/**
 * Vitest global setup file.
 *
 * Registers @testing-library/jest-dom matchers and the reusable dzup-ui DOM
 * environment used by Reka UI primitives. Imported via `setupFiles` in
 * vitest.config.ts.
 */
import type { VueWrapper } from '@vue/test-utils'
import { config } from '@vue/test-utils'
import { afterEach, beforeEach } from 'vitest'
import { installDzupUiDomTestEnvironment } from './packages/testing/src/index.ts'
import '@testing-library/jest-dom/vitest'

installDzupUiDomTestEnvironment()

/**
 * Per-test DOM cleanup (UI-DZUP-UI-TEST-L-02).
 *
 * Many specs `attachTo: document.body` and call `wrapper.unmount()` as their
 * last statement, so an assertion that fails first leaves the component
 * mounted — its portals, listeners and focus traps — for the next test in the
 * file. After every test this unmounts each root wrapper the TEST mounted that
 * is still mounted, then removes every `<body>` child the test added.
 *
 * Scoped to the test on purpose. A wrapper mounted, or a node appended, in a
 * `beforeAll` or at module level is shared by later tests and is left alone:
 * tracking starts in this file's `beforeEach`, which runs before any spec's.
 * And it runs after the spec's own `afterEach` hooks (Vitest runs after-hooks
 * in reverse registration order), so a spec's `enableAutoUnmount` or explicit
 * teardown still goes first and this only sweeps what they missed.
 *
 * `enableAutoUnmount` itself is not used here: it may be enabled once per
 * module graph and 39 specs already enable it for themselves.
 */
const mountedThisTest = new Set<VueWrapper>()
let bodyBefore = new Set<Node>()

config.plugins.VueWrapper.install((wrapper) => {
  mountedThisTest.add(wrapper as VueWrapper)
  return {}
})

// Specs that opt into `@vitest-environment node` have no document to clean.
const hasDom = typeof document !== 'undefined'

beforeEach(() => {
  mountedThisTest.clear()
  if (hasDom)
    bodyBefore = new Set(Array.from(document.body.childNodes))
})

afterEach(() => {
  for (const wrapper of mountedThisTest) {
    // Child wrappers (`findComponent`) have no app; an already-unmounted root
    // must not be unmounted twice.
    const root = wrapper as unknown as { __app: unknown }
    if (!root.__app || wrapper.vm?.$?.isUnmounted)
      continue
    try {
      wrapper.unmount()
    }
    catch {
      // A component that throws on unmount has already failed its own test.
    }
  }
  mountedThisTest.clear()
  if (!hasDom)
    return
  for (const node of Array.from(document.body.childNodes)) {
    if (!bodyBefore.has(node))
      node.remove()
  }
})
