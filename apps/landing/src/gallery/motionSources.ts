/**
 * Raw `?raw` source text for every file in the landing-local motion module
 * (`src/motion/**`) — the lookup that lets the animations registry bundle a
 * primitive's SOURCE into the item that uses it.
 *
 * **Why this is a separate module.** `src/gallery/registryItem.ts` is
 * deliberately runtime-free so the bare Node generator can import it, and
 * `import.meta.glob` only exists after a Vite transform. It therefore takes a
 * {@link MotionSourceLookup} parameter instead of importing this file — the same
 * split `src/blocks/sources.ts` makes for block SFCs (see its docstring for the
 * entry-chunk rationale that motivated the pattern).
 *
 * **Import rule: only from code that is already lazy or running in Node.** The
 * eager glob below inlines the whole motion module's source text (~280 kB) into
 * whichever chunk imports it. Today the only consumers are
 * `scripts/build-animations-registry.ts` (Node, via Vite `ssrLoadModule`) and
 * `registryItem.spec.ts` (Vitest). Importing it from `router.ts`, `App.vue`, or
 * anything else reachable from `/` puts all of that straight into the entry
 * chunk — which `scripts/check-bundle-budget.ts` fails on.
 */

/**
 * Every motion module/component as raw text, keyed by path relative to
 * `src/motion/` (e.g. `'components/DzAurora.vue'`, `'useReducedMotion.ts'`,
 * `'index.ts'`).
 *
 * `.css` is deliberately OUT of the glob. The module's `tokens.css` is not part
 * of any item's bundled closure — it is emitted once beside the registry (see
 * `registryItem.ts`'s policy note) and the generator reads it straight off disk
 * with `node:fs`. Globbing it `?raw` would also be a trap: under Vitest the CSS
 * pipeline resolves `?raw` on a stylesheet to an EMPTY STRING, so the source
 * would silently look present and be blank.
 */
const motionSources = import.meta.glob('../motion/**/*.{vue,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Strip the `../motion/` glob prefix so keys are motion-root-relative. */
const MOTION_GLOB_PREFIX = '../motion/'

/** Every motion file keyed by its motion-root-relative path. */
export const MOTION_SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(motionSources).map(([key, source]) => [
    key.startsWith(MOTION_GLOB_PREFIX) ? key.slice(MOTION_GLOB_PREFIX.length) : key,
    source,
  ]),
)

/**
 * The exact `?raw` source of the motion file at `path` (relative to
 * `src/motion/`), or `undefined` when no such file exists — the signature
 * `registryItem.ts` consumes as {@link MotionSourceLookup}. Returning
 * `undefined` rather than throwing lets the shaping report every unresolved
 * primitive at once instead of dying on the first.
 */
export function getMotionSource(path: string): string | undefined {
  return MOTION_SOURCES[path]
}
