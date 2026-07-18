/**
 * Raw `?raw` SFC source text for every block, kept OUT of the entry chunk
 * (TASK-FREE-13).
 *
 * **Why this is not in `registry.ts`.** The eager `?raw` glob below inlines all 87
 * blocks' full source text into whichever chunk imports it. `registry.ts` is reached
 * from the entry chunk by two site-wide consumers that genuinely need block
 * metadata — `router.ts` (per-route `<title>`/description for `/blocks/:id`) and
 * `useGlobalSearch` (the site-wide ⌘K palette). Neither needs a single byte of source
 * text. Keeping the glob here meant a first-time visitor to `/` downloaded **169 kB
 * gzip** of Vue source strings to render the home page — measured, 35% of the entry
 * chunk's module weight.
 *
 * Metadata is ~22 kB and legitimately belongs in the entry; the source text does not.
 * Splitting them is the whole point of this module.
 *
 * **Import rule: only from code that is already lazy.** Every consumer is reached
 * exclusively from a lazy route chunk (`BlockCard`, `BlockManifest`, `BlockPreview`
 * under `/blocks*`) or from a build script running in Node (`registryItem.ts`,
 * `llmsText.ts` → `/r/*.json`, `llms.txt`). Importing this module from `router.ts`,
 * `App.vue`, `useGlobalSearch.ts`, or anything else reachable from `/` puts all
 * 169 kB straight back into the entry chunk.
 *
 * What catches that is the entry-JS budget in `scripts/check-bundle-budget.ts`, which
 * is set just above the real measured entry size: a leak here is a ~100 kB jump and
 * fails the gate immediately. (A grep for source markers in the built entry was
 * considered and rejected — the home page legitimately ships a hand-written
 * `<script setup>` code sample, so the marker false-positives.)
 *
 * The two pure projection modules (`registryItem.ts`, `llmsText.ts`) must NOT import
 * this file even though they need source text: they are deliberately runtime-free so
 * the bare Node generator can import them, and `import.meta.glob` only exists after a
 * Vite transform. They take a `BlockSourceLookup` parameter instead.
 *
 * The glob stays **eager** on purpose: within a lazy chunk the source text is needed
 * synchronously (the Code tab renders it immediately, and the build scripts are sync),
 * and it costs that chunk nothing extra to inline it. The problem was never eagerness
 * — it was eagerness *in the entry chunk*.
 */

/**
 * Every block SFC as raw text, keyed by path relative to this file
 * (e.g. `'./marketing/HeroSplit.vue'`). Same glob pattern as `registry.ts`'s
 * component map, off the same paths, so source and preview cannot drift.
 */
const blockSources = import.meta.glob('./*/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * The exact `?raw` source of the block authored at `path`.
 *
 * @param path Path relative to `src/blocks/`, e.g. `'./marketing/HeroSplit.vue'` —
 * the same `BlockDef.path` that resolves the block's component.
 * @throws If no `.vue` exists at `path`, which means a `defineBlock({ path })` entry
 * points at a file that was moved or deleted.
 */
export function getBlockSource(path: string): string {
  const source = blockSources[path]
  if (source === undefined) {
    throw new Error(
      `[blocks] No .vue found at "${path}". Paths are relative to src/blocks/ `
      + `and must match "./<category>/<Name>.vue".`,
    )
  }
  return source
}
