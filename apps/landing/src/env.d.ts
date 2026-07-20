/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Opt-in flag for the live GitHub/npm stat tiles (src/composables/useLiveStats.ts). */
  readonly VITE_ENABLE_LIVE_STATS?: string
  /**
   * `'true'` once the `@dzup-ui/*` packages resolve on npm. Turns on every
   * surface whose flow ends in an install — the StackBlitz forks and the /ai
   * MCP configs (src/lib/publishState.ts).
   */
  readonly VITE_PACKAGES_PUBLISHED?: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >
  export default component
}

// Vite `?raw` string imports — used by the Blocks registry to show each block's
// exact source in the Code tab with zero drift from what renders (docs/blocks.md §3.2).
declare module '*.vue?raw' {
  const source: string
  export default source
}
