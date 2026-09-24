/**
 * One block's `?raw` SFC source, loaded on demand — the browser half of
 * `sources.ts` (TASK-DZUP-UI-CI-GREEN-R3).
 *
 * **Why this exists.** `sources.ts` inlines all 87 blocks' source text (491 kB
 * raw, 108 kB gzip) into whichever chunk imports it, synchronously. That was
 * fine while every browser consumer sat behind a lazy boundary. Once
 * `/blocks/:id` became preview-first and imported `BlockPreview` statically, the
 * whole catalogue's source became render-blocking on every block page. Mobile LCP
 * on `/blocks/hero-split` went from ~3.6 s to ~4.3 s, past the 4 s gate in
 * `lighthouserc.mobile.json`. A block page needs exactly one block's source, and
 * only for the Code tab, the copy buttons and the StackBlitz fork, none of which
 * is on first paint.
 *
 * The glob here is **lazy**, so Vite emits one small chunk per block, fetched
 * only when a component asks for that block. It is the same pattern off the same
 * paths as `sources.ts`, so the two cannot disagree about what a block's source
 * is.
 *
 * **Import rule.** Browser components on a route that must paint fast
 * (`BlockPreview`, `BlockManifest`, `BlockDetailPage`) use this module.
 * `sources.ts` stays for synchronous callers: the Node registry build, the specs,
 * and `BlockCard` on the `/blocks` index, which renders every card anyway.
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, shallowReactive, toValue, watchEffect } from 'vue'

const loaders = import.meta.glob<string>('./*/*.vue', {
  query: '?raw',
  import: 'default',
})

/** Every source loaded so far, keyed like `BlockDef.path`. Reactive, so a view re-renders on arrival. */
const loaded = shallowReactive(new Map<string, string>())
const inFlight = new Map<string, Promise<string>>()

/**
 * The exact `?raw` source of the block authored at `path`, fetched once and then
 * cached for the life of the page.
 *
 * @param path Path relative to `src/blocks/`, e.g. `'./marketing/HeroSplit.vue'`.
 * @throws (rejects) If no `.vue` exists at `path`, with the same message as
 * `getBlockSource`.
 */
export function loadBlockSource(path: string): Promise<string> {
  const hit = loaded.get(path)
  if (hit !== undefined)
    return Promise.resolve(hit)

  const pending = inFlight.get(path)
  if (pending)
    return pending

  const load = loaders[path]
  if (!load) {
    return Promise.reject(new Error(
      `[blocks] No .vue found at "${path}". Paths are relative to src/blocks/ `
      + `and must match "./<category>/<Name>.vue".`,
    ))
  }

  const request = load().then(
    (source) => {
      loaded.set(path, source)
      inFlight.delete(path)
      return source
    },
    (error: unknown) => {
      inFlight.delete(path)
      throw error
    },
  )
  inFlight.set(path, request)
  return request
}

/**
 * The source of the block at `path`, as a computed string that reads `''` until
 * it has loaded. Pass `null` when the caller does not need a source right now;
 * nothing is fetched then.
 */
export function useBlockSource(path: MaybeRefOrGetter<string | null>): ComputedRef<string> {
  watchEffect(() => {
    const current = toValue(path)
    if (current !== null && !loaded.has(current)) {
      loadBlockSource(current).catch((error: unknown) => {
        console.error(error)
      })
    }
  })
  return computed(() => {
    const current = toValue(path)
    return current === null ? '' : (loaded.get(current) ?? '')
  })
}
