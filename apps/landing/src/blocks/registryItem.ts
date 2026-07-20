/**
 * shadcn registry shaping — the pure transform from a `BlockDef` to the
 * registry JSON the build emits to `public/r/` (docs/blocks.md §1.3, §3.3).
 *
 * This module is intentionally runtime-free: it imports `BlockDef` as a *type*
 * only (no `import.meta.glob`, so it loads cleanly in a plain Node/tsx process)
 * and shares `BLOCK_DEPENDENCIES` with the manifest/install surfaces, so the
 * generated `dependencies[]` can never drift from the copy-paste install line.
 *
 * Two consumers import it:
 *   • `scripts/build-registry.ts` — writes one `<id>.json` per block + the
 *     `registry.json` index (the actual artifacts `npx shadcn add` fetches);
 *   • `registryItem.spec.ts` — the Vitest guard that asserts the shape over the
 *     real `BLOCKS`, so the generator can never emit a malformed item.
 *
 * Schema target: the CANONICAL shadcn registry JSON Schema (ui.shadcn.com), so a
 * plain `npx shadcn@latest add <url>` — not just the `shadcn-vue` fork — resolves
 * these items. Items point `$schema` at the registry-item schema; the index at
 * the registry schema.
 *
 * ── Vue-SFC spike (docs requirement <spike>) ────────────────────────────────
 * shadcn's `registryDependencies` are OTHER registry items the CLI fetches and
 * writes as source (its React `ui/` primitives). dzup-ui ships its primitives as
 * a versioned npm package (`@dzup-ui/core`), NOT as per-component registry items,
 * so a bare component name there (`DzButton`) would make `shadcn add` try to
 * resolve `<registry>/DzButton.json` and 404. We therefore emit
 * `registryDependencies: []` and put the runtime packages in `dependencies[]`
 * (npm-installed), and preserve the human-facing component list in `meta.components`
 * (what the gallery's "Built from" chips read). Net: a single `shadcn add <block>`
 * drops the SFC in and lists the two npm packages to install — it does not try to
 * source-vendor the Dz* components. See `scripts/README.md` for the full write-up.
 */

import type { BlockDef, BlockSourceLookup } from './registry.ts'
import { SITE_ORIGIN } from '../origin.ts'
import { sourceDependencies } from './config.ts'

/**
 * `$schema` URLs the emitted JSON is validated against — the canonical shadcn
 * registry schema. Pinning these makes the targeted schema version explicit in
 * every artifact and lets editors/the CLI validate on open.
 */
export const REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'
export const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json'

/** The registry-item `type` for a composed block (shadcn taxonomy). */
export const REGISTRY_ITEM_TYPE = 'registry:block'

/**
 * File kind for the inlined SFC. `registry:file` writes to an explicit `target`
 * path (required for this type), so the block lands at a deterministic location
 * (`components/blocks/<id>.vue`) in the consumer's project regardless of how
 * their `components.json` aliases are configured.
 */
export const REGISTRY_FILE_TYPE = 'registry:file'

/** Project-relative directory the CLI writes each block SFC into. */
export const BLOCK_TARGET_DIR = 'components/blocks'

/**
 * Registry name + canonical homepage stamped into the `registry.json` index.
 * The homepage is derived from `SITE_ORIGIN`, never retyped: it is published into
 * a distributed artifact consumers fetch, so a stale host here is a 404 in
 * someone else's project.
 */
export const REGISTRY_NAME = 'dzup-ui'
export const REGISTRY_HOMEPAGE = SITE_ORIGIN

/** One file entry inside a registry item (`files[]`). */
export interface RegistryFile {
  /** Source path/name of the file within the registry, e.g. `hero-centered.vue`. */
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
  /** Unique item name — the block `id`, what `add <url>/<name>.json` resolves. */
  name: string
  type: typeof REGISTRY_ITEM_TYPE
  title: string
  description: string
  /** The block's category, for shadcn's catalog grouping/filtering. */
  categories: string[]
  /** The block's SFC, inlined so a single fetch installs it. */
  files: RegistryFile[]
  /**
   * Other registry ITEMS to also install. Always empty for dzup-ui blocks: the
   * Dz* components ship via the `@dzup-ui/core` npm package (see `dependencies`),
   * not as per-component registry items, so there is nothing here for `shadcn add`
   * to resolve. The component list lives in `meta.components` instead.
   */
  registryDependencies: string[]
  /** npm packages the block needs at runtime (`@dzup-ui/core`, `@dzup-ui/tokens`). */
  dependencies: string[]
  /** Non-installed metadata — the human-facing "Built from" component list. */
  meta: {
    /** The `Dz*` components the block composes (from `BlockDef.components`). */
    components: string[]
  }
}

/** One entry in the `registry.json` index — an item minus the inlined source. */
export type RegistryIndexItem = Omit<RegistryItem, '$schema' | 'files'> & {
  files: Array<Omit<RegistryFile, 'content'>>
}

/**
 * A lightweight directory entry for a non-block item (e.g. the tokens theme)
 * listed in the index without its payload — the per-item `<name>.json` carries
 * the `cssVars`/etc. Keeps the index a pure directory, mirroring how block index
 * items drop their inlined file `content`.
 */
export interface RegistryDirectoryEntry {
  name: string
  type: string
  title: string
  description: string
}

/** The `registry.json` index payload listing every generated item. */
export interface RegistryIndex {
  $schema: typeof REGISTRY_SCHEMA
  name: string
  homepage: string
  items: Array<RegistryIndexItem | RegistryDirectoryEntry>
}

/**
 * Build the full `registry-item.json` for one block. The SFC source is inlined as
 * the single `files[]` entry (so one fetch installs it) with an explicit
 * `target`; `registryDependencies` is empty by design (see the interface note),
 * and the composed components are preserved in `meta.components`.
 *
 * `source` is passed in rather than resolved here: this module is deliberately
 * runtime-free so the bare Node generator can import it, and `blocks/sources.ts`
 * carries an `import.meta.glob` that only Vite can evaluate. Callers pass
 * `getBlockSource(block.path)`.
 */
export function toRegistryItem(block: BlockDef, source: string): RegistryItem {
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: block.id,
    type: REGISTRY_ITEM_TYPE,
    title: block.title,
    description: block.description,
    categories: [block.category],
    files: [
      {
        path: `${block.id}.vue`,
        content: source,
        type: REGISTRY_FILE_TYPE,
        target: `${BLOCK_TARGET_DIR}/${block.id}.vue`,
      },
    ],
    registryDependencies: [],
    dependencies: sourceDependencies(source),
    meta: { components: [...block.components] },
  }
}

/**
 * Build the `registry.json` index from the catalog. Each entry mirrors its
 * `<id>.json` but drops the inlined source (the per-item file carries it), so
 * the index stays small and human-scannable while remaining schema-valid.
 */
export function buildRegistryIndex(
  blocks: readonly BlockDef[],
  getSource: BlockSourceLookup,
  homepage: string = REGISTRY_HOMEPAGE,
): RegistryIndex {
  return {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage,
    items: blocks.map(block => toRegistryIndexItem(toRegistryItem(block, getSource(block)))),
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
