/**
 * lazyComponent — the one way the landing lazily loads a catalog component
 * (every block in `blocks/registry.ts`, the template preview) — TASK-FREE-09.
 *
 * A bare `defineAsyncComponent(loader)` has NO behaviour for "something went
 * wrong": a chunk that fails to load (stale URL mid-deploy, dropped connection)
 * renders nothing, silently, forever. This wrapper gives every lazy component
 * the three missing states:
 *
 *   • loading — a skeleton scaffold (after a 200 ms grace so fast loads never
 *     flash it);
 *   • error   — a visible alert with a reload action, after two automatic
 *     retries for transient network blips;
 *   • timeout — 15 s, after which the error state shows rather than an
 *     indefinite skeleton.
 */

import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import AsyncError from '../components/async/AsyncError.vue'
import AsyncLoading from '../components/async/AsyncLoading.vue'

/** Attempts before the error component shows (1 initial try + 2 retries). */
const MAX_ATTEMPTS = 3

export function lazyComponent(loader: () => Promise<Component | { default: Component }>): Component {
  return defineAsyncComponent({
    loader,
    loadingComponent: AsyncLoading,
    // Grace period before the skeleton appears — cached/fast chunks never flash.
    delay: 200,
    errorComponent: AsyncError,
    timeout: 15_000,
    onError(_error, retry, fail, attempts) {
      // Retry transient failures; surface persistent ones to AsyncError.
      if (attempts < MAX_ATTEMPTS)
        retry()
      else fail()
    },
  })
}
