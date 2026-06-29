/**
 * shadcn-vue registry shaping — the pure transform from a `BlockDef` to the
 * registry JSON the build emits to `public/r/` (docs/blocks.md §1.3, §3.3).
 *
 * This module is intentionally runtime-free: it imports `BlockDef` as a *type*
 * only (no `import.meta.glob`, so it loads cleanly in a plain Node/tsx process)
 * and shares `BLOCK_DEPENDENCIES` with the manifest/install surfaces, so the
 * generated `dependencies[]` can never drift from the copy-paste install line.
 *
 * Two consumers import it:
 *   • `scripts/build-registry.ts` — writes one `<id>.json` per block + the
 *     `registry.json` index (the actual artifacts `npx shadcn-vue add` fetches);
 *   • `registryItem.spec.ts` — the Vitest guard that asserts the shape over the
 *     real `BLOCKS`, so the generator can never emit a malformed item.
 *
 * Schema target: the shadcn-vue registry JSON Schema (mirrors shadcn's). Items
 * point `$schema` at the registry-item schema; the index at the registry schema.
 */

import { BLOCK_DEPENDENCIES } from './config.ts'
import type { BlockDef } from './registry.ts'

/**
 * `$schema` URLs the emitted JSON is validated against — the shadcn-vue mirror
 * of the shadcn registry schema. Pinning these makes the targeted schema version
 * explicit in every artifact and lets editors/the CLI validate on open.
 */
export const REGISTRY_ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'
export const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'

/** The registry-item `type` for a composed block (shadcn taxonomy). */
export const REGISTRY_ITEM_TYPE = 'registry:block'

/** Registry name + canonical homepage stamped into the `registry.json` index. */
export const REGISTRY_NAME = 'dzup-ui'
export const REGISTRY_HOMEPAGE = 'https://dzup-ui.dev'

/** One file entry inside a registry item (`files[]`). */
export interface RegistryFile {
  /** Install-relative path the CLI writes the file to, e.g. `hero-centered.vue`. */
  path: string
  /** The file's verbatim source. Omitted in the lightweight index listing. */
  content?: string
  /** File kind — the block SFC itself. */
  type: typeof REGISTRY_ITEM_TYPE
}

/** A single `registry-item.json` payload (`<id>.json`). */
export interface RegistryItem {
  $schema: typeof REGISTRY_ITEM_SCHEMA
  /** Unique item name — the block `id`, what `add <url>/<name>.json` resolves. */
  name: string
  type: typeof REGISTRY_ITEM_TYPE
  title: string
  description: string
  /** The block's SFC, inlined so a single fetch installs it. */
  files: RegistryFile[]
  /** Other registry items to also install — here, the block's `components[]`. */
  registryDependencies: string[]
  /** npm packages the block needs at runtime (`@dzup-ui/core`, `@dzup-ui/tokens`). */
  dependencies: string[]
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
 * Build the full `registry-item.json` for one block. `registryDependencies` is
 * the block's `components[]` verbatim (docs/blocks.md §1.3 / §3.3) and the SFC
 * source is inlined as the single `files[]` entry, so one fetch installs it.
 */
export function toRegistryItem(block: BlockDef): RegistryItem {
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: block.id,
    type: REGISTRY_ITEM_TYPE,
    title: block.title,
    description: block.description,
    files: [
      {
        path: `${block.id}.vue`,
        content: block.source,
        type: REGISTRY_ITEM_TYPE,
      },
    ],
    registryDependencies: [...block.components],
    dependencies: [...BLOCK_DEPENDENCIES],
  }
}

/**
 * Build the `registry.json` index from the catalog. Each entry mirrors its
 * `<id>.json` but drops the inlined source (the per-item file carries it), so
 * the index stays small and human-scannable while remaining schema-valid.
 */
export function buildRegistryIndex(
  blocks: readonly BlockDef[],
  homepage: string = REGISTRY_HOMEPAGE,
): RegistryIndex {
  return {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage,
    items: blocks.map((block) => {
      const { $schema: _schema, files, ...rest } = toRegistryItem(block)
      return {
        ...rest,
        files: files.map(({ content: _content, ...file }) => file),
      }
    }),
  }
}
