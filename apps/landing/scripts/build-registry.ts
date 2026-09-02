/**
 * build-registry — generates the shadcn-vue-compatible registry for the Blocks
 * catalog (docs/blocks.md §1.3, §3.3, Task G1).
 *
 * Emits, into `apps/landing/public/r/` (served verbatim as static `/r/*`):
 *   • `<id>.json` — one `registry-item.json` per block, the payload
 *     `npx shadcn-vue add https://<host>/r/<id>.json` fetches to drop the block
 *     into a consumer's project (its SFC inlined as the single `files[]` entry);
 *   • `registry.json` — the index listing every item;
 *   • `<id>.md` — one self-contained markdown page per block (title, description,
 *     components, deep link, fenced SFC) for AI assistants and the Task G3 "copy
 *     as markdown" action.
 *
 * …plus, into `apps/landing/public/` (served as static `/*`), the AI-readable
 * docs index (docs/blocks.md §1.3, Task G2):
 *   • `llms.txt`      — a concise markdown index of every block, grouped by
 *     category, linking each to its live preview;
 *   • `llms-full.txt` — that index plus every block's full SFC source inline.
 *
 * A consumer points an assistant at the catalog with `@docs https://<host>/llms.txt`
 * (Cursor/Claude); see scripts/README.md.
 *
 * GENERATED, NEVER HAND-EDITED: `public/r/*` and `public/llms*.txt` are a pure
 * projection of the `BLOCKS` array. The shaping lives in
 * `src/blocks/registryItem.ts` (JSON) and `src/blocks/llmsText.ts` (markdown),
 * both shared with their Vitest guards; this script only loads the catalog and
 * writes the files. The `r/` out dir is wiped first so a removed/renamed block
 * leaves no stale artifact.
 *
 * Why a Vite SSR load: `src/blocks/registry.ts` and `src/blocks/sources.ts` both
 * use module-level `import.meta.glob`, which only a Vite transform resolves. So
 * rather than import them into bare Node (where the glob is undefined), we spin up
 * Vite in middleware mode — reusing `vite.config.ts` verbatim, exactly as
 * `shoot-thumbnails.mts` does — and `ssrLoadModule` both: the registry for the real
 * `BLOCKS` (the lazy component loaders never invoked) and `sources.ts` for each
 * block's `?raw` text. The two are separate modules so that block source text stays
 * out of the site's entry chunk (TASK-FREE-13); `registryItem.ts` / `llmsText.ts`
 * stay runtime-free and take the resolved source as a parameter.
 *
 * Run with: `yarn build:registry` (from apps/landing). Wired ahead of
 * `vite build` so the static assets are always fresh. See scripts/README.md.
 *
 * FAIL-LOUD: an empty catalog or a load failure exits non-zero and writes
 * nothing, rather than publishing a partial/empty registry.
 */

import type { ViteDevServer } from 'vite'
import type { BlockDef, BlockSourceLookup, CategoryMeta } from '../src/blocks/registry.ts'
import type { ResolvedTemplateFile, TemplateRegistryItem } from '../src/blocks/templatesItem.ts'
import type { resolveTemplateSources } from '../src/templates/rawSources.ts'
import type { TemplateMeta } from '../src/templates/registry.ts'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { REGISTRY_PATH } from '../src/blocks/config.ts'
import {
  blockMarkdown,
  LLMS_FULL_TXT,
  LLMS_TXT,
  llmsFullTxt,
  llmsTxt,
} from '../src/blocks/llmsText.ts'
import { buildRegistryIndex, toRegistryItem } from '../src/blocks/registryItem.ts'
import {
  buildTemplatesIndex,

  toTemplateItem,
} from '../src/blocks/templatesItem.ts'
import { tokensDirectoryEntry, toTokensItem } from '../src/blocks/tokensItem.ts'
import { SITE_ORIGIN } from '../src/origin.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** `public/` root — served verbatim as `/*` (where `llms*.txt` live). */
const PUBLIC_DIR = resolve(LANDING_ROOT, 'public')

/** `public/` mirror of the public-URL dir the registry is served from (`/r`). */
const OUT_DIR = resolve(PUBLIC_DIR, REGISTRY_PATH.replace(/^\//, ''))

/**
 * Templates sub-registry dir (`/r/templates`). Kept off the flat `/r/` root
 * because some template slugs collide with block ids (`sign-in`, `product-detail`)
 * — see `templatesItem.ts`. Nested INSIDE `OUT_DIR` so the single `rm(OUT_DIR)`
 * below wipes it too.
 */
const TEMPLATES_OUT_DIR = resolve(OUT_DIR, 'templates')

/** The generated `@dzup-ui/tokens` stylesheet the tokens theme item is parsed from. */
const TOKENS_CSS = resolve(LANDING_ROOT, '../../packages/tokens/dist/tokens.css')

/**
 * The generated component-metadata artifact (TASK-N2-A2), served verbatim at
 * `/r/component-meta.json`.
 *
 * Copied, never re-derived: `packages/core/docs/component-meta.json` is the one
 * extraction of every component's props/slots/emits/exposed, and
 * `yarn validate:component-meta` gates it against the sources. This directory is
 * wiped and rewritten on every build, so the copy has to happen HERE — and
 * `validate:component-meta` fails if this file stops making it, because
 * `@dzup-ui/mcp`'s `RegistryClient` reads that site path in HTTP mode and would
 * otherwise 404 in production while working locally.
 */
const COMPONENT_META_SRC = resolve(LANDING_ROOT, '../../packages/core/docs/component-meta.json')

/** Pretty JSON with a trailing newline (POSIX-friendly, clean diffs). */
function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/**
 * Load the real `BLOCKS` (and the `CATEGORIES` metadata that groups them) via a
 * throwaway Vite SSR server so `import.meta.glob` (which pairs each block with
 * its `?raw` source) is transformed. The server runs in middleware mode, so it
 * binds no port; we always close it.
 */
interface Catalog {
  blocks: BlockDef[]
  categories: CategoryMeta[]
  /**
   * Resolves a block's `?raw` SFC text. Comes from `blocks/sources.ts` through the
   * SSR module graph — a bare `import` would throw, since `import.meta.glob` only
   * exists once Vite has transformed the module.
   */
  getSource: BlockSourceLookup
  /** Each template paired with its resolved (`?raw`-loaded) source files. */
  templates: Array<{ meta: TemplateMeta, files: ResolvedTemplateFile[] }>
}

async function loadCatalog(): Promise<Catalog> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const blocksMod = (await server.ssrLoadModule('/src/blocks/registry.ts')) as {
      BLOCKS: BlockDef[]
      CATEGORIES: CategoryMeta[]
    }
    const sourcesMod = (await server.ssrLoadModule('/src/blocks/sources.ts')) as {
      getBlockSource: (path: string) => string
    }
    const templates = await loadTemplates(server)
    return {
      blocks: blocksMod.BLOCKS,
      categories: blocksMod.CATEGORIES,
      getSource: block => sourcesMod.getBlockSource(block.path),
      templates,
    }
  }
  finally {
    await server.close()
  }
}

/**
 * Load `TEMPLATES` and resolve every template's `?raw` source files — the SFC and
 * its optional co-located `data.ts` (whatever `resolveTemplateSources` surfaces).
 * The `load()` thunks pull `?raw` chunks through the SSR module graph, so they
 * MUST be awaited while `server` is alive (the caller closes it right after).
 * A template whose source can't be resolved is skipped with a warning rather than
 * failing the whole build.
 */
async function loadTemplates(server: ViteDevServer): Promise<Catalog['templates']> {
  const templatesMod = (await server.ssrLoadModule('/src/templates/registry.ts')) as {
    TEMPLATES: TemplateMeta[]
  }
  const rawMod = (await server.ssrLoadModule('/src/templates/rawSources.ts')) as {
    resolveTemplateSources: typeof resolveTemplateSources
  }

  const out: Catalog['templates'] = []
  for (const meta of templatesMod.TEMPLATES) {
    const rawFiles = rawMod.resolveTemplateSources(meta.source)
    if (rawFiles.length === 0) {
      console.warn(`⚠ template "${meta.slug}": no source resolved for ${meta.source} — skipped`)
      continue
    }
    const files: ResolvedTemplateFile[] = await Promise.all(
      rawFiles.map(async file => ({ filename: file.filename, content: await file.load() })),
    )
    out.push({ meta, files })
  }
  return out
}

/**
 * `--check-llms` — READ-ONLY freshness probe for the two AI-facing block docs
 * (`public/llms.txt`, `public/llms-full.txt`), for `yarn validate:llms`
 * (TASK-N2-A3).
 *
 * WHY a flag here rather than a validator that re-derives the markdown:
 * `packages/tooling` may not depend on `@dzup-ui/*`, and the blocks catalog is
 * only loadable through a Vite SSR transform (`import.meta.glob`). So the gate
 * delegates freshness to this generator in check mode — exactly the pattern
 * `validate:mcp` uses for `packages/mcp` (TASK-N2-A1).
 *
 * WHY read-only matters: `main()` below `rm -rf`s and rewrites `public/r/`
 * (282 tracked files). A freshness gate must never do that, so this path
 * returns before any of it and writes nothing at all.
 */
async function checkLlms(): Promise<void> {
  const { blocks, categories, getSource } = await loadCatalog()
  if (blocks.length === 0) {
    throw new Error('Registry has no blocks — nothing to check.')
  }
  const expected: Array<[string, string]> = [
    [LLMS_TXT, llmsTxt(blocks, categories)],
    [LLMS_FULL_TXT, llmsFullTxt(blocks, categories, getSource)],
  ]
  const stale: string[] = []
  for (const [name, fresh] of expected) {
    let onDisk: string
    try {
      onDisk = await readFile(resolve(PUBLIC_DIR, name), 'utf8')
    }
    catch {
      stale.push(`apps/landing/public/${name} does not exist`)
      continue
    }
    if (onDisk !== fresh) {
      const a = onDisk.split('\n')
      const b = fresh.split('\n')
      let line = 0
      while (line < Math.max(a.length, b.length) && a[line] === b[line]) line++
      stale.push(
        `apps/landing/public/${name} is STALE — it disagrees with a fresh render of the BLOCKS catalog `
        + `(committed ${onDisk.length} chars, fresh ${fresh.length} chars; first difference at line ${line + 1}). `
        + `Run \`yarn workspace @dzup-ui/landing build:registry\`.`,
      )
    }
  }
  if (stale.length > 0) {
    for (const s of stale) console.error(`  ✗ ${s}`)
    process.exitCode = 1
    return
  }
  console.log(
    `  ✓ blocks llms docs fresh — ${blocks.length} blocks across ${categories.length} categories `
    + `→ ${LLMS_TXT}, ${LLMS_FULL_TXT}`,
  )
}

async function main(): Promise<void> {
  if (process.argv.includes('--check-llms')) {
    await checkLlms()
    return
  }

  const { blocks, categories, getSource, templates } = await loadCatalog()
  if (blocks.length === 0) {
    throw new Error('Registry has no blocks — nothing to generate.')
  }

  // Wipe + recreate so a deleted/renamed block can never leave a stale artifact.
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  // Per block: a registry-item JSON and a self-contained markdown page.
  for (const block of blocks) {
    await writeFile(resolve(OUT_DIR, `${block.id}.json`), toJson(toRegistryItem(block, getSource(block))))
    await writeFile(resolve(OUT_DIR, `${block.id}.md`), blockMarkdown(block, categories, getSource))
  }

  // The tokens theme item (`--dz-*` cssVars, light/dark) — installable standalone
  // via `shadcn add …/r/tokens.json`, and referenced from the index directory.
  const tokensItem = toTokensItem(await readFile(TOKENS_CSS, 'utf8'))
  await writeFile(resolve(OUT_DIR, `${tokensItem.name}.json`), toJson(tokensItem))

  // The component-metadata artifact, verbatim (TASK-N2-A2). Deliberately NOT in
  // `registry.json`: it is not a `shadcn add`-able item, it is the machine-readable
  // component API the docs site, llms-full.txt and the MCP metadata tools read.
  await copyFile(COMPONENT_META_SRC, resolve(OUT_DIR, 'component-meta.json'))

  // The top-level registry index: every block + the tokens theme entry.
  const index = buildRegistryIndex(blocks, getSource)
  index.items.push(tokensDirectoryEntry(tokensItem))
  await writeFile(resolve(OUT_DIR, 'registry.json'), toJson(index))

  // Templates sub-registry (`/r/templates/*`) — collision-free namespace.
  await mkdir(TEMPLATES_OUT_DIR, { recursive: true })
  const templateItems: TemplateRegistryItem[] = []
  for (const { meta, files } of templates) {
    const item = toTemplateItem(meta, files)
    templateItems.push(item)
    await writeFile(resolve(TEMPLATES_OUT_DIR, `${meta.slug}.json`), toJson(item))
  }
  await writeFile(
    resolve(TEMPLATES_OUT_DIR, 'registry.json'),
    toJson(buildTemplatesIndex(templateItems)),
  )

  // AI-readable docs at the public root: the concise index + the full-source one.
  await writeFile(resolve(PUBLIC_DIR, LLMS_TXT), llmsTxt(blocks, categories))
  await writeFile(resolve(PUBLIC_DIR, LLMS_FULL_TXT), llmsFullTxt(blocks, categories, getSource))

  console.log(
    `▸ Registry: wrote registry.json + ${blocks.length} block(s), tokens.json, and `
    + `${templateItems.length} template(s) under ${OUT_DIR}\n`
    + `▸ AI docs: wrote ${LLMS_TXT} + ${LLMS_FULL_TXT} to ${PUBLIC_DIR}\n`
    // The host is no longer a placeholder: REGISTRY_HOST is pinned to the
    // canonical origin, so these are the real commands a consumer will run.
    + `  Install a block:    npx shadcn@latest add ${SITE_ORIGIN}${REGISTRY_PATH}/<id>.json\n`
    + `  Install the tokens: npx shadcn@latest add ${SITE_ORIGIN}${REGISTRY_PATH}/tokens.json\n`
    + `  Install a template: npx shadcn@latest add ${SITE_ORIGIN}${REGISTRY_PATH}/templates/<slug>.json\n`
    + `  Point an assistant at it: @docs ${SITE_ORIGIN}/${LLMS_TXT}`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ build-registry failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
