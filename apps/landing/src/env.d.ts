/// <reference types="vite/client" />

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
