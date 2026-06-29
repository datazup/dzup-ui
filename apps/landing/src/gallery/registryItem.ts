/**
 * shadcn-style registry shaping for the animation catalog — the pure transform
 * from a {@link CatalogEntry} to the registry JSON the build emits to
 * `public/r/animations/` (docs/animations.md §3.2, §5; Open Decision D2-3).
 *
 * This is the data foundation for a future "copy-paste-with-ownership" registry
 * CLI / MCP server (D2-3) — it deliberately stops at the JSON: no CLI is wired
 * here. It mirrors the Blocks registry shaping (`src/blocks/registryItem.ts`)
 * one-for-one so the two catalogs project into the same shadcn-vue schema and a
 * single CLI could later serve both.
 *
 * Runtime-free by construction: it imports {@link CatalogEntry} as a *type*
 * only, so it loads cleanly in a plain Node/tsx process (the demo components and
 * `vue` runtime never come along). Two consumers import it:
 *   • `scripts/build-animations-registry.ts` — writes one `<id>.json` per effect
 *     plus the `registry.json` index;
 *   • `registryItem.spec.ts` — the Vitest guard that asserts the shape over the
 *     real `CATALOG`, so the generator can never emit a malformed item.
 *
 * Schema target: the shadcn-vue registry JSON Schema (mirrors shadcn's). Items
 * point `$schema` at the registry-item schema; the index at the registry schema.
 */

import type { CatalogEntry } from './catalog.ts'

/**
 * `$schema` URLs the emitted JSON is validated against — the shadcn-vue mirror
 * of the shadcn registry schema, pinned so every artifact declares the targeted
 * version and editors/the CLI can validate on open. Shared shape with the Blocks
 * registry (`src/blocks/registryItem.ts`).
 */
export const REGISTRY_ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'
export const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'

/** The registry-item `type` for a self-contained motion snippet (shadcn taxonomy). */
export const REGISTRY_ITEM_TYPE = 'registry:block'

/** Registry name + canonical homepage stamped into the `registry.json` index. */
export const REGISTRY_NAME = 'dzup-ui-animations'
export const REGISTRY_HOMEPAGE = 'https://dzup-ui.dev'

/**
 * The runtime packages every effect snippet needs: the components
 * (`@dzup-ui/core`) and the `--dz-*` token CSS (`@dzup-ui/tokens`). Mirrors the
 * Blocks `BLOCK_DEPENDENCIES`. Note: the motion primitives an effect imports from
 * `../motion` are currently landing-local (the eventual `@dzup-ui/motion` package,
 * Open Decision D-2); until that ships they are not listed as an npm dependency.
 */
export const ANIMATION_DEPENDENCIES = ['@dzup-ui/core', '@dzup-ui/tokens'] as const

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

/** One file entry inside a registry item (`files[]`). */
export interface RegistryFile {
  /** Install-relative path the CLI writes the file to, e.g. `fade-rise.vue`. */
  path: string
  /** The file's verbatim source. Omitted in the lightweight index listing. */
  content?: string
  /** File kind — the snippet itself. */
  type: typeof REGISTRY_ITEM_TYPE
}

/** A single `registry-item.json` payload (`<id>.json`). */
export interface RegistryItem {
  $schema: typeof REGISTRY_ITEM_SCHEMA
  /** Unique item name — the effect `id`, what `add <url>/<name>.json` resolves. */
  name: string
  type: typeof REGISTRY_ITEM_TYPE
  title: string
  description: string
  /**
   * The effect's snippet(s), inlined so a single fetch installs it. One file per
   * variant when the entry offers a variant matrix; otherwise the single
   * fallback `code` as a `.vue`.
   */
  files: RegistryFile[]
  /** Other registry items to also install — here, the effect's `components[]`. */
  registryDependencies: string[]
  /** npm packages the snippet needs at runtime (`@dzup-ui/core`, `@dzup-ui/tokens`). */
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
 * The `files[]` for an entry: one inlined file per present variant (sfc/composable/
 * css → .vue/.ts/.css) when the entry has a variant matrix, else the single
 * fallback `code` as `<id>.vue`. Always at least one entry — `code` is the floor.
 */
export function registryFiles(entry: CatalogEntry): RegistryFile[] {
  if (entry.variants) {
    const files = (Object.keys(VARIANT_EXTENSION) as Array<keyof typeof VARIANT_EXTENSION>)
      .filter((key) => entry.variants?.[key])
      .map((key): RegistryFile => ({
        path: `${entry.id}.${VARIANT_EXTENSION[key]}`,
        content: entry.variants![key]!,
        type: REGISTRY_ITEM_TYPE,
      }))
    if (files.length) return files
  }
  return [{ path: `${entry.id}.vue`, content: entry.code, type: REGISTRY_ITEM_TYPE }]
}

/**
 * Build the full `registry-item.json` for one effect. `registryDependencies` is
 * the effect's `components[]` verbatim and its snippet(s) are inlined as the
 * `files[]`, so one fetch installs it.
 */
export function toRegistryItem(entry: CatalogEntry): RegistryItem {
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: entry.id,
    type: REGISTRY_ITEM_TYPE,
    title: entry.title,
    description: entry.blurb,
    files: registryFiles(entry),
    registryDependencies: [...entry.components],
    dependencies: [...ANIMATION_DEPENDENCIES],
  }
}

/**
 * Build the `registry.json` index from the catalog. Each entry mirrors its
 * `<id>.json` but drops the inlined source (the per-item file carries it), so the
 * index stays small and human-scannable while remaining schema-valid.
 */
export function buildRegistryIndex(
  entries: readonly CatalogEntry[],
  homepage: string = REGISTRY_HOMEPAGE,
): RegistryIndex {
  return {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage,
    items: entries.map((entry) => {
      const { $schema: _schema, files, ...rest } = toRegistryItem(entry)
      return {
        ...rest,
        files: files.map(({ content: _content, ...file }) => file),
      }
    }),
  }
}
