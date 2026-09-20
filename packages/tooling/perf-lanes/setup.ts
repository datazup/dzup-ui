/**
 * Lane-local environment setup (TASK-R2-O7).
 *
 * The root `vitest.setup.ts` installs the shared dzup-ui DOM environment
 * (`ResizeObserver`, `requestAnimationFrame`, pointer-capture stubs) and the
 * lanes inherit it. One thing it deliberately does **not** install is
 * `matchMedia`: jsdom has no implementation, and the specs that need one stub
 * it themselves (`packages/core/tests/rtl.spec.ts` is the pattern).
 *
 * The hydration lane needs one, because `DzProvider` — the component a real
 * page hydrates under — calls `window.matchMedia('(prefers-color-scheme: dark)')`
 * in its mounted hook. Without it the first run of that lane threw *inside*
 * Vue's post-flush queue during `hydrate()`, which left the scheduler mid-flush
 * and corrupted every subsequent `app.mount()` in the same process: the leak
 * lane, running afterwards in the same fork, then failed all 24 of its tests
 * with `Cannot read properties of null (reading '$')` from
 * `@vue/test-utils`. One missing stub, twenty-five failures, none of them where
 * the fault was. Worth the four lines and worth the note.
 *
 * The stub is symmetric — a real `addEventListener`/`removeEventListener` pair
 * over a listener array, not a spy — so the leak lane's accounting sees a
 * genuine registration and a genuine removal rather than two calls into a mock
 * that records but never registers.
 */

import { vi } from 'vitest'

interface StubbedQueryList {
  matches: boolean
  media: string
  onchange: null
  listeners: Array<(event: unknown) => void>
  addEventListener: (type: string, listener: (event: unknown) => void) => void
  removeEventListener: (type: string, listener: (event: unknown) => void) => void
  addListener: (listener: (event: unknown) => void) => void
  removeListener: (listener: (event: unknown) => void) => void
  dispatchEvent: () => boolean
}

function queryList(media: string): StubbedQueryList {
  const listeners: Array<(event: unknown) => void> = []
  const list: StubbedQueryList = {
    matches: false,
    media,
    onchange: null,
    listeners,
    addEventListener(_type, listener) {
      listeners.push(listener)
    },
    removeEventListener(_type, listener) {
      const index = listeners.indexOf(listener)
      if (index >= 0)
        listeners.splice(index, 1)
    },
    addListener(listener) {
      listeners.push(listener)
    },
    removeListener(listener) {
      const index = listeners.indexOf(listener)
      if (index >= 0)
        listeners.splice(index, 1)
    },
    dispatchEvent: () => false,
  }
  return list
}

if (typeof globalThis.matchMedia !== 'function')
  vi.stubGlobal('matchMedia', (media: string) => queryList(media))
