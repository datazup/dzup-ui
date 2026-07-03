/**
 * Templates → shadcn registry shaping (docs requirement <task>: "blocks/
 * templates/tokens install via `npx shadcn add`").
 *
 * Each free full-page template (`src/templates/*`) projects into one canonical
 * shadcn registry item, emitted to `public/r/templates/<slug>.json`. Templates
 * live under their own `/r/templates/` sub-path (not `/r/` alongside blocks)
 * because a handful of slugs collide with block ids (`sign-in`, `sign-up`,
 * `product-detail`) — a flat namespace would overwrite one with the other. Their
 * own index (`/r/templates/registry.json`) keeps them independently browsable,
 * mirroring the animations sub-registry.
 *
 * Runtime-free by construction: it imports `TemplateMeta` as a *type* only and
 * takes the already-resolved file sources as an argument (the build script reads
 * each template's `?raw` chunks via `resolveTemplateSources` and awaits them),
 * so this module only shapes — and the Vitest guard can drive it with fixtures.
 *
 * ── Multi-file spike note ────────────────────────────────────────────────────
 * A template is richer than a block: its directory may hold the page SFC plus a
 * co-located `data.ts`. Both are inlined as separate `files[]` entries (each with
 * its own `target` under `components/templates/<slug>/`), so `shadcn add` writes
 * the whole starter. Templates that fan out into many sub-components beyond that
 * pair are out of scope here — the SFC + data pair is what `resolveTemplateSources`
 * surfaces, and what installs cleanly; see `scripts/README.md`.
 */

import { sourceDependencies } from './config.ts'
import {
  REGISTRY_FILE_TYPE,
  REGISTRY_ITEM_SCHEMA,
  REGISTRY_ITEM_TYPE,
  REGISTRY_SCHEMA,
  type RegistryFile,
  type RegistryIndexItem,
} from './registryItem.ts'
import type { TemplateMeta } from '../templates/registry.ts'

/** Registry name + homepage stamped into the templates `registry.json` index. */
export const TEMPLATES_REGISTRY_NAME = 'dzup-ui-templates'
export const TEMPLATES_REGISTRY_HOMEPAGE = 'https://dzup-ui.dev'

/** Project-relative directory the CLI writes each template's files into. */
export const TEMPLATE_TARGET_DIR = 'components/templates'

/** One already-resolved template source file (name + verbatim text). */
export interface ResolvedTemplateFile {
  /** Bare filename, e.g. `AnalyticsDashboard.vue` or `data.ts`. */
  filename: string
  /** The file's verbatim source text. */
  content: string
}

/** A single template `registry-item.json` payload (`templates/<slug>.json`). */
export interface TemplateRegistryItem {
  $schema: typeof REGISTRY_ITEM_SCHEMA
  name: string
  type: typeof REGISTRY_ITEM_TYPE
  title: string
  description: string
  categories: string[]
  files: RegistryFile[]
  registryDependencies: string[]
  dependencies: string[]
  meta: {
    /** The `@dzup-ui/core` components the template is "Built with". */
    components: string[]
    /** Pricing tier — always `free` for these. */
    tier: TemplateMeta['tier']
  }
}

/** The templates `registry.json` index payload. */
export interface TemplatesRegistryIndex {
  $schema: typeof REGISTRY_SCHEMA
  name: string
  homepage: string
  items: RegistryIndexItem[]
}

/**
 * Build the full `registry-item.json` for one template from its metadata and its
 * already-resolved source files. Each file is inlined with an explicit `target`
 * under `components/templates/<slug>/`; `registryDependencies` is empty (the
 * `@dzup-ui/core` components ship via npm — same rationale as blocks), and the
 * "Built with" stack is preserved in `meta`.
 */
export function toTemplateItem(
  meta: TemplateMeta,
  files: readonly ResolvedTemplateFile[],
): TemplateRegistryItem {
  if (files.length === 0) {
    throw new Error(`Template "${meta.slug}" resolved to zero source files.`)
  }
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: meta.slug,
    type: REGISTRY_ITEM_TYPE,
    title: meta.name,
    description: meta.blurb,
    categories: [meta.category],
    files: files.map((file) => ({
      path: file.filename,
      content: file.content,
      type: REGISTRY_FILE_TYPE,
      target: `${TEMPLATE_TARGET_DIR}/${meta.slug}/${file.filename}`,
    })),
    registryDependencies: [],
    // Union of every resolved file's imports, so a multi-file template lists all
    // its runtime packages (e.g. an SFC using lucide + a data.ts that does not).
    dependencies: sourceDependencies(files.map((f) => f.content).join('\n')),
    meta: { components: [...meta.stack], tier: meta.tier },
  }
}

/**
 * Build the templates `registry.json` index from `[meta, item]` pairs. Each entry
 * mirrors its `<slug>.json` but drops the inlined source, so the index stays
 * small while remaining schema-valid.
 */
export function buildTemplatesIndex(
  items: readonly TemplateRegistryItem[],
  homepage: string = TEMPLATES_REGISTRY_HOMEPAGE,
): TemplatesRegistryIndex {
  return {
    $schema: REGISTRY_SCHEMA,
    name: TEMPLATES_REGISTRY_NAME,
    homepage,
    items: items.map(({ $schema: _schema, files, ...rest }) => ({
      ...rest,
      files: files.map(({ content: _content, ...file }) => file),
    })),
  }
}
