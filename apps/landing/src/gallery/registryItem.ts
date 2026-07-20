/**
 * shadcn registry shaping for the animation catalog — the pure transform from a
 * {@link CatalogEntry} to the registry JSON the build emits to
 * `public/r/animations/` (docs/animations.md §3.2, §5; Open Decision D2-3).
 *
 * This is the data foundation for a future "copy-paste-with-ownership" registry
 * CLI / MCP server (D2-3) — it deliberately stops at the JSON: no CLI is wired
 * here. It mirrors the Blocks registry shaping (`src/blocks/registryItem.ts`):
 * same canonical schema host, same `registry:file` + explicit `target` file
 * entries, same empty `registryDependencies` with the runtime packages in
 * `dependencies[]`, same `meta.components` for the human-facing component list.
 *
 * Runtime-free by construction: it imports {@link CatalogEntry} as a *type* only
 * and takes source text through the injected {@link MotionSourceLookup}, so it
 * loads cleanly in a plain Node/tsx process (the demo components, the `vue`
 * runtime and `import.meta.glob` never come along). Two consumers import it:
 *   • `scripts/build-animations-registry.ts` — writes one `<id>.json` per effect
 *     plus the `registry.json` index;
 *   • `registryItem.spec.ts` — the Vitest guard that asserts the shape over the
 *     real `CATALOG`, so the generator can never emit a malformed item.
 *
 * ── Why `registryDependencies` is always empty ──────────────────────────────
 * shadcn's `registryDependencies` are OTHER registry items the CLI fetches and
 * writes as source. dzup-ui ships its primitives as a versioned npm package
 * (`@dzup-ui/core`), NOT as per-component registry items, so a bare component
 * name there (`DzCard`) would make `shadcn add` try to resolve
 * `<registry>/DzCard.json` and 404. This module used to emit `entry.components`
 * verbatim into that field — every emitted item carried unresolvable names, and
 * `aurora-drift` carried `DzAurora`, which is not an npm export at all. We now
 * emit `registryDependencies: []`, put the npm packages in `dependencies[]`, and
 * preserve the component list in `meta.components` (what the gallery's chips
 * read) — identical to Blocks.
 *
 * ── Motion-primitive policy: BUNDLE THE SOURCE ──────────────────────────────
 * 56 of the catalog's effects import a primitive from the landing-local
 * `src/motion` module (`DzAurora`, `useReducedMotion`, `vTilt`, …). That module
 * is not published — it is the eventual `@dzup-ui/motion` package (Open Decision
 * D-2) — so naming those primitives anywhere a consumer is expected to RESOLVE
 * them is a dead reference. The policy, applied uniformly to every entry:
 *
 *   Each item BUNDLES the transitive closure of the motion primitives its
 *   snippet imports, as additional `files[]` entries under
 *   `components/motion/**`, preserving the module's internal layout so the
 *   primitives' own relative imports (`../useReducedMotion.ts`) resolve verbatim
 *   — plus a PRUNED `components/motion/index.ts` re-exporting exactly the names
 *   that snippet imports, so the snippet's authored `from '../motion'` resolves
 *   too. Nothing is rewritten: the code in the item is the code the gallery card
 *   shows.
 *
 * Two consequences worth stating plainly rather than discovering later:
 *   1. Names the pruned barrel re-exports from npm (`useAutoAnimate` comes from
 *      `@formkit/auto-animate/vue`) are re-exported from the package and the
 *      package is added to `dependencies[]` — no landing-local reference remains.
 *   2. `components/motion/index.ts` is a SHARED path. Installing two effects into
 *      one project overwrites it with the second effect's pruned barrel, so the
 *      first effect's import breaks. This is inherent to the authored
 *      `from '../motion'` specifier (no per-item directory can satisfy it); the
 *      remedy is to merge the two `export` lines. Shipping the FULL barrel
 *      instead was rejected: it re-exports the whole module, which would drag
 *      ~280 kB of source into every one of the 59 items.
 *
 * The motion module's `tokens.css` (the `--dz-anim-*` custom properties and
 * keyframe utilities that ~20 of those primitives read) is NOT inlined per item
 * — 57 kB × 59 items is not a reasonable artifact. It is emitted ONCE next to
 * the registry as `/r/animations/{@link MOTION_STYLESHEET_FILE}` and items that
 * need it point at that published URL via `meta.stylesheet`. Resolvable, and
 * paid for once.
 *
 * Schema target: the CANONICAL shadcn registry JSON Schema (ui.shadcn.com), so a
 * plain `npx shadcn@latest add <url>` — not just the `shadcn-vue` fork — resolves
 * these items. Items point `$schema` at the registry-item schema; the index at
 * the registry schema.
 */

import type { CatalogEntry } from './catalog.ts'
import { SITE_ORIGIN } from '../origin.ts'

/**
 * `$schema` URLs the emitted JSON is validated against — the canonical shadcn
 * registry schema (NOT the `shadcn-vue` fork these artifacts used to name).
 * Pinning these makes the targeted schema version explicit in every artifact and
 * lets editors/the CLI validate on open. Identical to the Blocks registry.
 */
export const REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'
export const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json'

/** The registry-item `type` for a self-contained motion snippet (shadcn taxonomy). */
export const REGISTRY_ITEM_TYPE = 'registry:block'

/**
 * File kind for every inlined file. `registry:file` writes to an explicit
 * `target` path (required for this type), so each file lands at a deterministic
 * location in the consumer's project regardless of how their `components.json`
 * aliases are configured. The old `registry:block` value here was an ITEM type,
 * not a file kind, and carried no target at all.
 */
export const REGISTRY_FILE_TYPE = 'registry:file'

/** Project-relative directory the CLI writes each effect snippet into. */
export const ANIMATION_TARGET_DIR = 'components/animations'

/**
 * Project-relative directory the bundled motion primitives are written into.
 * Chosen so a snippet at `components/animations/<id>.vue` resolves its authored
 * `from '../motion'` import to `components/motion/index.ts`.
 */
export const MOTION_TARGET_DIR = 'components/motion'

/** Registry name + canonical homepage stamped into the `registry.json` index. */
export const REGISTRY_NAME = 'dzup-ui-animations'
export const REGISTRY_HOMEPAGE = SITE_ORIGIN

/** Root-relative path the animations registry (and its assets) are served from. */
export const ANIMATIONS_REGISTRY_PATH = '/r/animations'

/**
 * Filename of the shared motion stylesheet emitted once beside the registry —
 * the motion module's `tokens.css` (keyframes + `--dz-anim-*` custom
 * properties). Items whose bundled files read those tokens point at its absolute
 * URL through `meta.stylesheet` instead of inlining 57 kB apiece.
 */
export const MOTION_STYLESHEET_FILE = 'motion-tokens.css'

/** Motion-root-relative path of the stylesheet the generator copies out. */
export const MOTION_STYLESHEET_SOURCE = 'tokens.css'

/** Motion-root-relative path of the module barrel the pruned barrel is derived from. */
export const MOTION_BARREL_SOURCE = 'index.ts'

/**
 * The runtime packages every effect snippet needs: the components
 * (`@dzup-ui/core`) and the `--dz-*` token CSS (`@dzup-ui/tokens`). Mirrors the
 * Blocks `BLOCK_DEPENDENCIES`.
 */
export const ANIMATION_DEPENDENCIES = ['@dzup-ui/core', '@dzup-ui/tokens'] as const

/**
 * Extra runtime npm packages an effect's snippet — or a motion primitive it
 * bundles — may import beyond the base two, so a copied effect builds in a fresh
 * project. Mirrors the Blocks `OPTIONAL_DEPENDENCIES`. `vue` is a peer every Vue
 * project already has, so it is intentionally omitted.
 */
export const OPTIONAL_DEPENDENCIES = ['lucide-vue-next', '@formkit/auto-animate'] as const

/**
 * Per-variant file extension. The variant matrix maps to real file kinds so a
 * registry consumer gets the right filename per consumption style: an SFC is a
 * `.vue`, a composable a `.ts` module, a CSS/utility form a `.css` file.
 */
const VARIANT_EXTENSION: Record<keyof NonNullable<CatalogEntry['variants']>, string> = {
  sfc: 'vue',
  composable: 'ts',
  css: 'css',
}

/**
 * Injected reader for the landing-local motion module's source text, keyed by
 * path relative to `src/motion/` (`'components/DzAurora.vue'`, `'index.ts'`).
 * `undefined` means "no such file" — see `motionSources.ts` for the Vite-side
 * implementation and why the lookup is a parameter rather than an import.
 */
export type MotionSourceLookup = (path: string) => string | undefined

/** One file entry inside a registry item (`files[]`). */
export interface RegistryFile {
  /** Source path/name of the file within the registry, e.g. `fade-rise.vue`. */
  path: string
  /** The file's verbatim source. Omitted in the lightweight index listing. */
  content?: string
  /** File kind — `registry:file`, an explicitly-targeted plain file. */
  type: typeof REGISTRY_FILE_TYPE
  /** Project-relative destination the CLI writes to (required for `registry:file`). */
  target: string
}

/** A single `registry-item.json` payload (`<id>.json`). */
export interface RegistryItem {
  $schema: typeof REGISTRY_ITEM_SCHEMA
  /** Unique item name — the effect `id`, what `add <url>/<name>.json` resolves. */
  name: string
  type: typeof REGISTRY_ITEM_TYPE
  title: string
  description: string
  /** The effect's gallery category, for shadcn's catalog grouping/filtering. */
  categories: string[]
  /**
   * The effect's snippet(s) plus every motion primitive they need, all inlined
   * so a single fetch installs the lot. One snippet file per variant when the
   * entry offers a variant matrix; otherwise the single fallback `code`.
   */
  files: RegistryFile[]
  /**
   * Other registry ITEMS to also install. Always empty: the `Dz*` components
   * ship via the `@dzup-ui/core` npm package (see `dependencies`) and the motion
   * primitives ship inline in `files[]`, so there is nothing here for
   * `shadcn add` to resolve. The component list lives in `meta.components`.
   */
  registryDependencies: string[]
  /** npm packages the snippet needs at runtime (`@dzup-ui/core`, `@dzup-ui/tokens`, …). */
  dependencies: string[]
  /** Non-installed metadata — the human-facing lists and the shared stylesheet. */
  meta: {
    /** The components the effect pairs with (from `CatalogEntry.components`). */
    components: string[]
    /** Names imported from the motion module and bundled into `files[]`. */
    motionPrimitives: string[]
    /** Absolute URL of the shared motion stylesheet, when a bundled file reads it. */
    stylesheet?: string
  }
}

/** One entry in the `registry.json` index — an item minus the inlined source. */
export type RegistryIndexItem = Omit<RegistryItem, '$schema' | 'files'> & {
  files: Array<Omit<RegistryFile, 'content'>>
}

/** The `registry.json` index payload listing every generated item. */
export interface RegistryIndex {
  $schema: typeof REGISTRY_SCHEMA
  name: string
  homepage: string
  items: RegistryIndexItem[]
}

/**
 * Resolve a relative import specifier against the motion file that contains it,
 * yielding another motion-root-relative path. Every relative specifier inside
 * `src/motion` carries an explicit extension (`'../useReducedMotion.ts'`,
 * `'./components/DzBeam.vue'`), so no extension guessing is needed.
 */
function resolveMotionPath(fromPath: string, specifier: string): string {
  const segments = fromPath.split('/').slice(0, -1)
  for (const part of specifier.split('/')) {
    if (part === '' || part === '.')
      continue
    if (part === '..')
      segments.pop()
    else segments.push(part)
  }
  return segments.join('/')
}

/** Every relative import specifier in a source file, in source order. */
function relativeSpecifiers(source: string): string[] {
  return [...source.matchAll(/from\s+'(\.[^']*)'/g)].map(match => match[1]!)
}

/**
 * The names a snippet imports from the motion barrel (`from '../motion'`),
 * de-duplicated in first-seen order. Handles `import type` clauses and `as`
 * aliases by taking the LOCAL binding's source name (`{ A as B }` → `A`), which
 * is what the barrel must re-export.
 */
export function motionImportedNames(source: string): string[] {
  const names: string[] = []
  const clauses = source.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s+'\.\.\/motion'/g)
  for (const clause of clauses) {
    for (const raw of clause[1]!.split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]!.trim()
      if (name && !names.includes(name))
        names.push(name)
    }
  }
  return names
}

/** One re-export the motion barrel makes: the clause text and its module. */
interface BarrelExport {
  /** The clause item verbatim, e.g. `default as DzAurora` or `useInView`. */
  clause: string
  /** The module it is re-exported from, e.g. `./components/DzAurora.vue`. */
  specifier: string
}

/**
 * Map every VALUE export the motion barrel makes to its clause text + source
 * module. `export type { … }` lines are skipped: a type-only re-export needs no
 * file bundled, and a snippet importing one gets it from the bundled module
 * anyway.
 */
export function barrelExports(barrelSource: string): Map<string, BarrelExport> {
  const exports = new Map<string, BarrelExport>()
  const statements = barrelSource.matchAll(/export\s+(type\s+)?\{([^}]*)\}\s*from\s+'([^']+)'/g)
  for (const [, typeOnly, clause, specifier] of statements) {
    if (typeOnly)
      continue
    for (const raw of clause!.split(',')) {
      const item = raw.trim()
      if (!item)
        continue
      const exported = item.split(/\s+as\s+/).pop()!.trim()
      exports.set(exported, { clause: item, specifier: specifier! })
    }
  }
  return exports
}

/** What {@link resolveMotionBundle} produced for one effect. */
interface MotionBundle {
  /** Motion files to inline, motion-root-relative, in deterministic order. */
  files: string[]
  /** The pruned barrel's source, or `''` when the snippet imports no primitive. */
  barrel: string
  /** Names imported from the barrel and satisfied by this bundle. */
  primitives: string[]
  /** npm packages the barrel re-exports through (e.g. `@formkit/auto-animate/vue`). */
  packages: string[]
}

/**
 * Resolve everything an effect's snippets need from the motion module: the
 * transitive closure of the primitives they import, and a pruned barrel
 * re-exporting exactly those names.
 *
 * @throws If a snippet imports a name the barrel does not export, or the closure
 * reaches a file that does not exist — either means a snippet and the motion
 * module have drifted, which must fail the build rather than emit a broken item.
 */
export function resolveMotionBundle(
  sources: readonly string[],
  getMotionSource: MotionSourceLookup,
): MotionBundle {
  const names = [...new Set(sources.flatMap(motionImportedNames))].sort()
  if (names.length === 0)
    return { files: [], barrel: '', primitives: [], packages: [] }

  const barrelSource = getMotionSource(MOTION_BARREL_SOURCE)
  if (barrelSource === undefined)
    throw new Error(`[animations] Motion barrel "${MOTION_BARREL_SOURCE}" not found.`)
  const exports = barrelExports(barrelSource)

  // Group the needed names by the module they come from, preserving each
  // clause's authored form so the pruned barrel is a subset of the real one.
  const byModule = new Map<string, string[]>()
  const packages: string[] = []
  const roots: string[] = []
  for (const name of names) {
    const entry = exports.get(name)
    if (!entry) {
      throw new Error(
        `[animations] A snippet imports "${name}" from '../motion', but `
        + `${MOTION_BARREL_SOURCE} does not export it.`,
      )
    }
    const clauses = byModule.get(entry.specifier) ?? []
    clauses.push(entry.clause)
    byModule.set(entry.specifier, clauses)

    if (entry.specifier.startsWith('.')) {
      const path = resolveMotionPath(MOTION_BARREL_SOURCE, entry.specifier)
      if (!roots.includes(path))
        roots.push(path)
    }
    else {
      // Re-exported straight from npm — bundle nothing, install the package.
      const pkg = OPTIONAL_DEPENDENCIES.find(
        candidate => entry.specifier === candidate || entry.specifier.startsWith(`${candidate}/`),
      )
      if (pkg && !packages.includes(pkg))
        packages.push(pkg)
    }
  }

  // Walk the closure: every relative import of an included file is included too,
  // so a bundled primitive's own dependencies resolve verbatim on disk.
  const files: string[] = []
  const queue = [...roots]
  while (queue.length > 0) {
    const path = queue.shift()!
    if (files.includes(path))
      continue
    const source = getMotionSource(path)
    if (source === undefined)
      throw new Error(`[animations] Motion file "${path}" not found (reached from the barrel).`)
    files.push(path)
    for (const specifier of relativeSpecifiers(source))
      queue.push(resolveMotionPath(path, specifier))
  }

  const barrel = [...byModule.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([specifier, clauses]) => `export { ${clauses.sort().join(', ')} } from '${specifier}'`)
    .join('\n')

  return { files: files.sort(), barrel: `${barrel}\n`, primitives: names, packages }
}

/**
 * The npm `dependencies[]` for an effect: the base packages plus any
 * {@link OPTIONAL_DEPENDENCIES} the emitted sources actually import. Matched on
 * the quoted specifier — exact or a subpath (`'@formkit/auto-animate/vue'`) — so
 * a substring in a comment does not false-positive. Order is stable (base first,
 * optionals in declared order) for clean diffs.
 */
export function animationDependencies(sources: readonly string[], extraPackages: readonly string[] = []): string[] {
  const extra = OPTIONAL_DEPENDENCIES.filter(
    pkg =>
      extraPackages.includes(pkg)
      || sources.some(source => source.includes(`'${pkg}'`) || source.includes(`'${pkg}/`)),
  )
  return [...ANIMATION_DEPENDENCIES, ...extra]
}

/**
 * The snippet `files[]` for an entry: one inlined file per present variant
 * (sfc/composable/css → .vue/.ts/.css) when the entry has a variant matrix, else
 * the single fallback `code` as `<id>.vue`. Always at least one entry — `code`
 * is the floor. Each is a targeted `registry:file` under
 * {@link ANIMATION_TARGET_DIR}.
 */
export function registryFiles(entry: CatalogEntry): RegistryFile[] {
  const toFile = (extension: string, content: string): RegistryFile => ({
    path: `${entry.id}.${extension}`,
    content,
    type: REGISTRY_FILE_TYPE,
    target: `${ANIMATION_TARGET_DIR}/${entry.id}.${extension}`,
  })

  if (entry.variants) {
    const files = (Object.keys(VARIANT_EXTENSION) as Array<keyof typeof VARIANT_EXTENSION>)
      .filter(key => entry.variants?.[key])
      .map(key => toFile(VARIANT_EXTENSION[key], entry.variants![key]!))
    if (files.length)
      return files
  }
  return [toFile('vue', entry.code)]
}

/** Markers that mean a source reads the motion module's `tokens.css`. */
const STYLESHEET_MARKERS = ['--dz-anim', 'dz-anim-', 'dz-animate-in', 'dz-scroll-linked']

/** Whether any emitted source depends on the shared motion stylesheet. */
function needsStylesheet(sources: readonly string[]): boolean {
  return sources.some(source => STYLESHEET_MARKERS.some(marker => source.includes(marker)))
}

/**
 * Build the full `registry-item.json` for one effect: its snippet(s) inlined as
 * targeted `registry:file` entries, every motion primitive they import bundled
 * alongside under {@link MOTION_TARGET_DIR} with a pruned barrel,
 * `registryDependencies` empty by design (see the module docstring), the npm
 * packages in `dependencies[]`, and the component list preserved in
 * `meta.components`.
 *
 * `getMotionSource` is passed in rather than resolved here: this module is
 * deliberately runtime-free so the bare Node generator can import it, and
 * `motionSources.ts` carries an `import.meta.glob` that only Vite can evaluate.
 */
export function toRegistryItem(
  entry: CatalogEntry,
  getMotionSource: MotionSourceLookup,
  homepage: string = REGISTRY_HOMEPAGE,
): RegistryItem {
  const snippetFiles = registryFiles(entry)
  const snippetSources = snippetFiles.map(file => file.content!)
  const bundle = resolveMotionBundle(snippetSources, getMotionSource)

  const motionFiles: RegistryFile[] = bundle.files.map(path => ({
    path: `motion/${path}`,
    content: getMotionSource(path)!,
    type: REGISTRY_FILE_TYPE,
    target: `${MOTION_TARGET_DIR}/${path}`,
  }))
  if (bundle.barrel) {
    motionFiles.push({
      path: `motion/${MOTION_BARREL_SOURCE}`,
      content: bundle.barrel,
      type: REGISTRY_FILE_TYPE,
      target: `${MOTION_TARGET_DIR}/${MOTION_BARREL_SOURCE}`,
    })
  }

  const files = [...snippetFiles, ...motionFiles]
  const allSources = files.map(file => file.content!)

  const meta: RegistryItem['meta'] = {
    components: [...entry.components],
    motionPrimitives: bundle.primitives,
  }
  if (needsStylesheet(allSources))
    meta.stylesheet = `${homepage}${ANIMATIONS_REGISTRY_PATH}/${MOTION_STYLESHEET_FILE}`

  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: entry.id,
    type: REGISTRY_ITEM_TYPE,
    title: entry.title,
    description: entry.blurb,
    categories: [entry.category],
    files,
    registryDependencies: [],
    dependencies: animationDependencies(allSources, bundle.packages),
    meta,
  }
}

/** Strip a full item down to its index form (drop `$schema` + inlined source). */
export function toRegistryIndexItem(item: RegistryItem): RegistryIndexItem {
  const { $schema: _schema, files, ...rest } = item
  return {
    ...rest,
    files: files.map(({ content: _content, ...file }) => file),
  }
}

/**
 * Build the `registry.json` index from the catalog. Each entry mirrors its
 * `<id>.json` but drops the inlined source (the per-item file carries it), so the
 * index stays small and human-scannable while remaining schema-valid.
 */
export function buildRegistryIndex(
  entries: readonly CatalogEntry[],
  getMotionSource: MotionSourceLookup,
  homepage: string = REGISTRY_HOMEPAGE,
): RegistryIndex {
  return {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage,
    items: entries.map(entry => toRegistryIndexItem(toRegistryItem(entry, getMotionSource, homepage))),
  }
}
