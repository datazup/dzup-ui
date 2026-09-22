/**
 * `yarn validate:registry` — the shadcn-registry gate (TASK-R1-O5, closes A4-D3).
 *
 * `apps/landing/public/r/` ships **282 files** — three `registry.json` indexes
 * (blocks, animations, templates), 191 item payloads, 87 markdown mirrors, one
 * stylesheet and the copied `component-meta.json` — and until this file existed
 * nothing checked a byte of them. They are generated (`yarn build:registry`,
 * `yarn build:animations-registry`), which is why they are *consistent*; it is
 * not why they are *correct*. The registry evaluation
 * (`docs/program-2026-09/reports/registry-evaluation-2026-09.md`) found three
 * defects that a generator cannot see and a consumer meets on the first
 * `shadcn add`:
 *
 *   - **A4-D3** — the whole surface is ungated. A renamed block, a dropped
 *     `files[]` entry or an index that lost an item all ship green.
 *   - **A4-F4** — the `registry:theme` item is **inert**: 673 + 123 `cssVars`
 *     and not one selector dzup-ui's own runtime toggles. shadcn writes
 *     `cssVars.dark` under `.dark`; dzup-ui switches on `[data-theme="dark"]`,
 *     so 78.8 KB of tokens install and the dark scheme never activates. The
 *     tokens are also written unlayered, so they land *above* `@layer dz-tokens`
 *     and cannot be overridden by the layer that is supposed to own them
 *     (ADR-19).
 *   - **A4-F5** — a Pro *source* registry is a licensing hazard. The 155 Pro
 *     `.vue` files are `SEE LICENSE IN LICENSE`; a registry copies source into
 *     a consumer's repository, and that copy is irrevocable. Compositions that
 *     depend on* the package are the only legal shape, so no item may name or
 *     import `@dzup-ui-pro/*`.
 *
 * ## What this gate is, and is not
 *
 * It is a **static** gate: it reads the committed files and the release policy,
 * and it touches no network. It deliberately does not re-run the generators —
 * freshness against `BLOCKS` is `apps/landing`'s own build and A4-F2's open
 * item; this asks the different question, "is what we would serve *usable*".
 *
 * Nine clauses, all `error` unless noted:
 *
 *   1. `index`        — each index parses, carries the canonical `$schema`, a
 *                       name, an absolute `homepage` and a non-empty `items[]`.
 *   2. `resolves`     — every index entry has a payload file beside it whose
 *                       `name`, `type` and `title` agree with the entry.
 *   3. `orphan`       — every payload on disk is listed by its index (minus the
 *                       named, reasoned exclusions).
 *   4. `item`         — every payload carries the registry-item `$schema`, a
 *                       `name` equal to its filename, a known `type`, a title
 *                       and a description.
 *   5. `files`        — every `files[]` entry has `path`, `type` and `target`,
 *                       and **resolves**: inline `content`, or a real file at
 *                       that path. This is "every referenced file present".
 *   6. `pro-source`   — A4-F5. No `@dzup-ui-pro` anywhere: dependency, registry
 *                       dependency, import inside inline content, or target path.
 *   7. `theme`        — A4-F4. The theme item declares **both** colour schemes
 *                       and a `css` block that layers the tokens and activates
 *                       the dark scheme under dzup-ui's own selector.
 *   8. `dependency`   — every `@dzup-ui/*` dependency is a package the release
 *                       policy actually publishes (a withheld or private one is
 *                       a guaranteed install failure).
 *   9. `docs` (report) — a block with no markdown mirror. Report-only: the
 *                       mirrors are an AI-assistant convenience, not an install
 *                       input. **It cannot fail, it has no seeded case in
 *                       `--self-test`, and it is firing right now** on 103 of
 *                       191 items (59 animations + 44 templates). So "nine
 *                       clauses, 8/8 seeded" is literally true and reads as
 *                       fuller coverage than it is — finding **S9**, 2026-09-22.
 *                       Whether it becomes a ratchet (record 103, fail when it
 *                       rises) is decision **D194**; until then the summary line
 *                       names the uncovered findings instead of printing a bare
 *                       ✓ over them.
 *
 * A tenth, `unpublished` (report), states the standing A4-D1 fact: every item
 * depends on packages that 404 on npm today. It is reported on every run
 * because it is the reason the whole surface resolves nothing, and it is an
 * owner decision, not a defect this gate may fail on.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/registry.ts
 *   tsx packages/tooling/src/validators/registry.ts --all        # list every report
 *   tsx packages/tooling/src/validators/registry.ts --self-test  # seeded failures
 *
 * `--self-test` is the proof the gate fires: it mutates an in-memory copy of
 * the real registry once per clause and asserts that clause — and only that
 * clause — turns red. It exits 1 when a seeded defect passes, which is the
 * failure mode a gate written and never falsified actually has.
 *
 * Exit code 1 if a hard clause fails.
 *
 * @module @dzup-ui/tooling/validators/registry
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

// ── Locations and constants ─────────────────────────────────────────────────

/** The served registry root — `https://<host>/r/*` in production. */
export const REGISTRY_ROOT = resolve(ROOT, 'apps/landing/public/r')

/** The release policy, for the published/withheld/private split. */
export const RELEASE_POLICY_PATH = resolve(ROOT, 'packages/tooling/scripts/release-policy.json')

/** The canonical shadcn index schema (not the shadcn-vue fork — A4 §3). */
export const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json'

/** The canonical shadcn item schema. */
export const REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'

/** Item types this registry is allowed to publish. */
export const ALLOWED_ITEM_TYPES = new Set([
  'registry:block',
  'registry:theme',
  'registry:file',
])

/**
 * Payloads under `/r/` that are deliberately NOT registry items.
 *
 * `component-meta.json` is copied verbatim at build time and deliberately kept
 * out of `registry.json`: it is not `add`-able, it is the machine-readable
 * component API `@dzup-ui/mcp`'s `RegistryClient` reads in HTTP mode (the
 * reachability clause of `validate:component-meta` asserts the copy happens).
 * Naming it here rather than pattern-matching keeps the orphan sweep honest:
 * anything else new under `/r/` has to be declared or listed.
 */
export const NON_ITEM_PAYLOADS: ReadonlyMap<string, string> = new Map([
  ['component-meta.json', 'the MCP RegistryClient\'s HTTP source — read, never added'],
])

/**
 * The registries this repository ships, by path relative to the registry root.
 *
 * Declared rather than discovered, because discovery cannot see an *absence*.
 * `build:registry` wipes `public/r/` before it writes ("so a removed block
 * leaves no stale artifact" — its own header), and the animations registry is
 * written by a **second** script into `public/r/animations/`. The two are
 * therefore not commutative: running `yarn build:registry` alone deletes 60
 * animation files, and a gate that just walked the tree would report two
 * healthy registries and exit 0. Measured on 2026-09-21 — TASK-R1-O5 F-2.
 * `apps/landing`'s own `build` chains them in the surviving order, so CI is
 * unaffected; a developer running one script is not.
 */
export const EXPECTED_REGISTRIES: ReadonlyMap<string, string> = new Map([
  ['registry.json', 'blocks + the tokens theme — `yarn workspace @dzup-ui/landing build:registry`'],
  ['animations/registry.json', 'motion primitives — `yarn workspace @dzup-ui/landing build:animations-registry`'],
  ['templates/registry.json', 'full-page templates — written by `build:registry`'],
])

/** dzup-ui's own dark-scheme selector. The theme must activate under it. */
export const DZUP_DARK_SELECTOR = '[data-theme="dark"]'

/** The cascade layer `@dzup-ui/tokens` owns (ADR-19). */
export const DZUP_TOKEN_LAYER = 'dz-tokens'

// ── Types ───────────────────────────────────────────────────────────────────

export interface RegistryFileEntry {
  path?: string
  type?: string
  target?: string
  content?: string
}

export interface RegistryItem {
  $schema?: string
  name?: string
  type?: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFileEntry[]
  cssVars?: { light?: Record<string, string>, dark?: Record<string, string> }
  css?: Record<string, unknown>
  meta?: Record<string, unknown>
}

export interface RegistryIndex {
  $schema?: string
  name?: string
  homepage?: string
  items?: RegistryItem[]
}

/** One registry, as it sits on disk: an index plus the payloads beside it. */
export interface LoadedRegistry {
  /** Path of the index, relative to the repo root — used in messages. */
  indexPath: string
  /** Directory the index and its payloads live in, absolute. */
  dir: string
  index: RegistryIndex
  /** Payload file basename → parsed item. */
  payloads: Map<string, RegistryItem>
  /** Every file basename in the directory (not recursive) — for the docs clause. */
  siblings: string[]
}

export interface RegistryViolation {
  rule:
    | 'index'
    | 'resolves'
    | 'orphan'
    | 'item'
    | 'files'
    | 'pro-source'
    | 'theme'
    | 'dependency'
    | 'docs'
    | 'unpublished'
  level: 'error' | 'report'
  message: string
}

// ── Loading ─────────────────────────────────────────────────────────────────

/** Every `registry.json` under the registry root, shallowest first. */
export function findRegistryIndexes(root: string = REGISTRY_ROOT): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    if (!existsSync(dir))
      return
    const entries = readdirSync(dir, { withFileTypes: true })
    if (entries.some(e => e.isFile() && e.name === 'registry.json'))
      out.push(join(dir, 'registry.json'))
    for (const e of entries) {
      if (e.isDirectory())
        walk(join(dir, e.name))
    }
  }
  walk(root)
  return out
}

/**
 * Load one registry: its index and every sibling `*.json` payload.
 *
 * A payload that does not parse is returned as `undefined` in the map rather
 * than thrown, so one corrupt file reports as one violation instead of aborting
 * the sweep — the same shape every other validator here uses.
 */
export function loadRegistry(indexPath: string): LoadedRegistry | { parseError: string } {
  const dir = dirname(indexPath)
  let index: RegistryIndex
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf8')) as RegistryIndex
  }
  catch (error) {
    return { parseError: error instanceof Error ? error.message : String(error) }
  }
  const siblings = readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile())
    .map(e => e.name)
  const payloads = new Map<string, RegistryItem>()
  for (const name of siblings) {
    if (!name.endsWith('.json') || name === 'registry.json')
      continue
    try {
      payloads.set(name, JSON.parse(readFileSync(join(dir, name), 'utf8')) as RegistryItem)
    }
    catch {
      // Left out of the map on purpose — the `item` clause reports it as
      // unreadable, which is more useful than a stack trace from the loader.
    }
  }
  return { indexPath: relative(ROOT, indexPath).replace(/\\/g, '/'), dir, index, payloads, siblings }
}

/** Load every registry under the root. */
export function loadAllRegistries(root: string = REGISTRY_ROOT): {
  registries: LoadedRegistry[]
  violations: RegistryViolation[]
} {
  const violations: RegistryViolation[] = []
  const registries: LoadedRegistry[] = []
  const indexes = findRegistryIndexes(root)
  if (indexes.length === 0) {
    violations.push({
      rule: 'index',
      level: 'error',
      message: `no registry.json found under ${relative(ROOT, root).replace(/\\/g, '/')}. `
        + 'Run `yarn workspace @dzup-ui/landing build:registry`.',
    })
  }
  const found = new Set(
    indexes.map(p => relative(root, p).replace(/\\/g, '/')),
  )
  for (const [expected, how] of EXPECTED_REGISTRIES) {
    if (!found.has(expected)) {
      violations.push({
        rule: 'index',
        level: 'error',
        message: `apps/landing/public/r/${expected} is GONE. It is written by ${how}. `
          + 'The registry generators are not commutative — `build:registry` wipes `public/r/` '
          + 'before it writes, so running it alone deletes the sub-registries the other script '
          + 'owns (TASK-R1-O5 F-2). Re-run the full `yarn workspace @dzup-ui/landing build`.',
      })
    }
  }
  for (const indexPath of indexes) {
    const loaded = loadRegistry(indexPath)
    if ('parseError' in loaded) {
      violations.push({
        rule: 'index',
        level: 'error',
        message: `${relative(ROOT, indexPath).replace(/\\/g, '/')} is not valid JSON: ${loaded.parseError}`,
      })
      continue
    }
    registries.push(loaded)
  }
  return { registries, violations }
}

// ── The clauses ─────────────────────────────────────────────────────────────

/** Packages the release policy actually publishes. */
export function publishedPackages(policyPath: string = RELEASE_POLICY_PATH): Set<string> {
  if (!existsSync(policyPath))
    return new Set()
  const policy = JSON.parse(readFileSync(policyPath, 'utf8')) as { published?: string[] }
  return new Set(policy.published ?? [])
}

/** True when a string mentions the Pro scope in any position. */
function mentionsPro(text: string): boolean {
  return text.includes('@dzup-ui-pro')
}

/**
 * Every violation for one loaded registry. Pure over the loaded shape, so the
 * self-test and the unit spec drive it with mutated copies rather than files.
 */
export function checkRegistry(
  reg: LoadedRegistry,
  published: ReadonlySet<string>,
): RegistryViolation[] {
  const v: RegistryViolation[] = []
  const at = reg.indexPath

  // ── 1. index ──────────────────────────────────────────────────────────────
  if (reg.index.$schema !== REGISTRY_SCHEMA) {
    v.push({
      rule: 'index',
      level: 'error',
      message: `${at}: $schema is ${JSON.stringify(reg.index.$schema)}, expected ${REGISTRY_SCHEMA}. `
        + 'The canonical shadcn schema is what `shadcn add` validates against; the shadcn-vue '
        + 'fork is not interchangeable (A4 §3).',
    })
  }
  if (typeof reg.index.name !== 'string' || reg.index.name.trim() === '') {
    v.push({ rule: 'index', level: 'error', message: `${at}: the index has no \`name\`.` })
  }
  if (typeof reg.index.homepage !== 'string' || !/^https:\/\/\S+$/.test(reg.index.homepage)) {
    v.push({
      rule: 'index',
      level: 'error',
      message: `${at}: \`homepage\` must be an absolute https URL (got ${JSON.stringify(reg.index.homepage)}). `
        + 'The CLI resolves relative registry references against it.',
    })
  }
  const items = reg.index.items
  if (!Array.isArray(items) || items.length === 0) {
    v.push({ rule: 'index', level: 'error', message: `${at}: \`items\` is missing or empty.` })
    return v
  }

  // ── 2. resolves ───────────────────────────────────────────────────────────
  const listed = new Set<string>()
  for (const entry of items) {
    const name = entry.name
    if (typeof name !== 'string' || name.trim() === '') {
      v.push({ rule: 'resolves', level: 'error', message: `${at}: an index entry has no \`name\`.` })
      continue
    }
    listed.add(`${name}.json`)
    const payload = reg.payloads.get(`${name}.json`)
    if (payload === undefined) {
      v.push({
        rule: 'resolves',
        level: 'error',
        message: `${at}: item "${name}" is listed but ${name}.json is missing or unreadable. `
          + `\`shadcn add <host>/r/${name}.json\` would 404.`,
      })
      continue
    }
    for (const field of ['type', 'title'] as const) {
      if (entry[field] !== undefined && payload[field] !== entry[field]) {
        v.push({
          rule: 'resolves',
          level: 'error',
          message: `${at}: item "${name}" disagrees with its payload on \`${field}\` `
            + `(index ${JSON.stringify(entry[field])}, payload ${JSON.stringify(payload[field])}). `
            + 'A directory that describes something other than what installs is worse than no directory.',
        })
      }
    }
  }

  // ── 3. orphan ─────────────────────────────────────────────────────────────
  for (const file of reg.payloads.keys()) {
    if (listed.has(file) || NON_ITEM_PAYLOADS.has(file))
      continue
    v.push({
      rule: 'orphan',
      level: 'error',
      message: `${at}: ${file} is served but no index lists it. Either add it to \`items\` or `
        + `declare it in NON_ITEM_PAYLOADS with the reason it is not add-able.`,
    })
  }
  for (const file of reg.siblings) {
    if (!file.endsWith('.json') || file === 'registry.json')
      continue
    if (!reg.payloads.has(file)) {
      v.push({
        rule: 'item',
        level: 'error',
        message: `${at}: ${file} is not readable JSON.`,
      })
    }
  }

  // ── 4–8. per payload ──────────────────────────────────────────────────────
  for (const [file, item] of reg.payloads) {
    if (NON_ITEM_PAYLOADS.has(file))
      continue
    const id = `${at.replace(/registry\.json$/, '')}${file}`
    const stem = basename(file, '.json')

    if (item.$schema !== REGISTRY_ITEM_SCHEMA) {
      v.push({
        rule: 'item',
        level: 'error',
        message: `${id}: $schema is ${JSON.stringify(item.$schema)}, expected ${REGISTRY_ITEM_SCHEMA}.`,
      })
    }
    if (item.name !== stem) {
      v.push({
        rule: 'item',
        level: 'error',
        message: `${id}: \`name\` is ${JSON.stringify(item.name)} but the file is ${file}. `
          + 'The CLI resolves an item by URL, then installs it under its `name`; a mismatch '
          + 'writes files under a directory nothing references.',
      })
    }
    if (typeof item.type !== 'string' || !ALLOWED_ITEM_TYPES.has(item.type)) {
      v.push({
        rule: 'item',
        level: 'error',
        message: `${id}: \`type\` is ${JSON.stringify(item.type)}; allowed: `
          + `${[...ALLOWED_ITEM_TYPES].join(', ')}.`,
      })
    }
    for (const field of ['title', 'description'] as const) {
      if (typeof item[field] !== 'string' || item[field]!.trim() === '') {
        v.push({
          rule: 'item',
          level: 'error',
          message: `${id}: \`${field}\` is empty. It is what a consumer reads before installing.`,
        })
      }
    }

    // ── 5. files ────────────────────────────────────────────────────────────
    if (item.type === 'registry:block') {
      const files = item.files
      if (!Array.isArray(files) || files.length === 0) {
        v.push({
          rule: 'files',
          level: 'error',
          message: `${id}: a registry:block with no \`files[]\` installs nothing.`,
        })
      }
      else {
        for (const [i, f] of files.entries()) {
          for (const field of ['path', 'type', 'target'] as const) {
            if (typeof f[field] !== 'string' || f[field]!.trim() === '') {
              v.push({
                rule: 'files',
                level: 'error',
                message: `${id}: files[${i}] has no \`${field}\`.`,
              })
            }
          }
          const hasContent = typeof f.content === 'string' && f.content.trim() !== ''
          const onDisk = typeof f.path === 'string' && existsSync(join(reg.dir, f.path))
          if (!hasContent && !onDisk) {
            v.push({
              rule: 'files',
              level: 'error',
              message: `${id}: files[${i}] (${f.path ?? '?'}) resolves to nothing — no inline `
                + '`content` and no file at that path. `shadcn add` would write an empty file.',
            })
          }
        }
      }
    }

    // ── 6. pro-source (A4-F5) ───────────────────────────────────────────────
    const proHits: string[] = []
    for (const dep of [...(item.dependencies ?? []), ...(item.registryDependencies ?? [])]) {
      if (typeof dep === 'string' && mentionsPro(dep))
        proHits.push(`dependency ${dep}`)
    }
    for (const [i, f] of (item.files ?? []).entries()) {
      if (typeof f.target === 'string' && mentionsPro(f.target))
        proHits.push(`files[${i}].target`)
      if (typeof f.content === 'string' && mentionsPro(f.content))
        proHits.push(`files[${i}].content`)
    }
    if (proHits.length > 0) {
      v.push({
        rule: 'pro-source',
        level: 'error',
        message: `${id}: names @dzup-ui-pro (${proHits.join(', ')}). A registry COPIES source into a `
          + 'consumer\'s repository and that copy is irrevocable; the Pro sources are '
          + '`SEE LICENSE IN LICENSE`. Compositions that DEPEND on a published Pro package are the '
          + 'only legal shape (A4-F5).',
      })
    }

    // ── 7. theme (A4-F4) ────────────────────────────────────────────────────
    if (item.type === 'registry:theme')
      v.push(...checkThemeItem(id, item))

    // ── 8. dependency ───────────────────────────────────────────────────────
    for (const dep of item.dependencies ?? []) {
      if (typeof dep !== 'string' || !dep.startsWith('@dzup-ui/'))
        continue
      const bare = dep.replace(/(?<!^)@.*$/, '')
      if (!published.has(bare)) {
        v.push({
          rule: 'dependency',
          level: 'error',
          message: `${id}: depends on ${dep}, which packages/tooling/scripts/release-policy.json `
            + 'does not publish. A withheld or private package is a guaranteed `npm install` failure '
            + 'on the consumer\'s side, not a future one.',
        })
      }
    }
  }

  // ── 9. docs (report) ──────────────────────────────────────────────────────
  const missingDocs = [...reg.payloads.entries()]
    .filter(([file, item]) => item.type === 'registry:block'
      && !NON_ITEM_PAYLOADS.has(file)
      && !reg.siblings.includes(file.replace(/\.json$/, '.md')))
    .map(([file]) => basename(file, '.json'))
  if (missingDocs.length > 0) {
    v.push({
      rule: 'docs',
      level: 'report',
      message: `${at}: ${missingDocs.length} block(s) ship without a markdown mirror `
        + `(${missingDocs.slice(0, 5).join(', ')}${missingDocs.length > 5 ? ', …' : ''}). `
        + 'The mirrors are what an assistant reads from `llms.txt`; they are not an install input.',
    })
  }

  return v
}

/**
 * Clause 7 — A4-F4, split out because it is the one clause with real content
 * rather than shape, and the one a reader is most likely to come looking for.
 *
 * Three things have to be true before a `registry:theme` is anything but 78.8 KB
 * of dead custom properties in a consumer's stylesheet:
 *
 *   1. **both schemes** — `cssVars.light` and `cssVars.dark` are non-empty.
 *      shadcn's CLI writes them under `:root` and `.dark`.
 *   2. **dzup-ui's own switch** — a `css` block re-declares the dark scheme
 *      under `[data-theme="dark"]`. dzup-ui's runtime toggles that attribute,
 *      not a class; without this the install is inert under the library's own
 *      dark mode, which is precisely what A4-F4 measured.
 *   3. **layered** — the declarations sit in `@layer dz-tokens`. ADR-19 gives
 *      that layer the tokens; unlayered declarations outrank every layer, so an
 *      installed theme would silently win against the layer that owns it.
 */
/** Every selector/at-rule key in a `css` block, at any nesting depth. */
export function cssKeys(css: Record<string, unknown> | undefined): string[] {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (node === null || typeof node !== 'object' || Array.isArray(node))
      return
    for (const [key, value] of Object.entries(node)) {
      out.push(key)
      walk(value)
    }
  }
  walk(css)
  return out
}

export function checkThemeItem(id: string, item: RegistryItem): RegistryViolation[] {
  const v: RegistryViolation[] = []
  for (const scheme of ['light', 'dark'] as const) {
    const vars = item.cssVars?.[scheme]
    if (vars === undefined || Object.keys(vars).length === 0) {
      v.push({
        rule: 'theme',
        level: 'error',
        message: `${id}: the theme declares no \`cssVars.${scheme}\`. A theme that carries one `
          + 'colour scheme installs a half-theme.',
      })
    }
  }
  // Keys, not a stringified blob. The first version of this clause tested
  // `JSON.stringify(css).includes('[data-theme="dark"]')` and stayed red against
  // a correct item, because serialisation had already turned the selector's
  // quotes into `\"` — a gate failing for a reason that is not the reason.
  const css = cssKeys(item.css)
  if (!css.some(k => k.includes(DZUP_DARK_SELECTOR))) {
    v.push({
      rule: 'theme',
      level: 'error',
      message: `${id}: no \`css\` rule activates the dark scheme under \`${DZUP_DARK_SELECTOR}\`. `
        + 'shadcn writes `cssVars.dark` under `.dark`; dzup-ui\'s runtime toggles '
        + '`data-theme`, so without this alias the installed tokens are inert under the '
        + 'library\'s own dark mode (A4-F4).',
    })
  }
  if (!css.some(k => k.includes(`@layer ${DZUP_TOKEN_LAYER}`))) {
    v.push({
      rule: 'theme',
      level: 'error',
      message: `${id}: the \`css\` block does not declare \`@layer ${DZUP_TOKEN_LAYER}\`. `
        + 'Unlayered declarations outrank every cascade layer, so an installed theme would win '
        + `against the layer ADR-19 gives the tokens (A4-F4).`,
    })
  }
  return v
}

/** The standing A4-D1 report: nothing this registry depends on exists on npm. */
export function unpublishedReport(registries: readonly LoadedRegistry[]): RegistryViolation[] {
  const deps = new Set<string>()
  for (const reg of registries) {
    for (const item of reg.payloads.values()) {
      for (const dep of item.dependencies ?? []) {
        if (typeof dep === 'string' && dep.startsWith('@dzup-ui/'))
          deps.add(dep)
      }
    }
  }
  if (deps.size === 0)
    return []
  return [{
    rule: 'unpublished',
    level: 'report',
    message: `every item depends on ${[...deps].sort().join(', ')}, which 404 on npm today `
      + '(A4-D1, publish-or-freeze). The registry is schema-valid and installs zero files until '
      + 'that decision is taken — `shadcn add` accepts the item, then `npm install` fails. '
      + 'This gate cannot fail on it: it is an owner decision, not a defect.',
  }]
}

/** Every violation across every registry under the root. */
export function checkAllRegistries(root: string = REGISTRY_ROOT): RegistryViolation[] {
  const { registries, violations } = loadAllRegistries(root)
  const published = publishedPackages()
  for (const reg of registries)
    violations.push(...checkRegistry(reg, published))
  violations.push(...unpublishedReport(registries))
  return violations
}

// ── Seeded failures ─────────────────────────────────────────────────────────

/** One seeded defect: what it breaks, and the clause that must catch it. */
export interface Seed {
  name: string
  rule: RegistryViolation['rule']
  /** Mutates a structuredClone of the real registry. */
  apply: (reg: LoadedRegistry) => void
}

/**
 * The seeded defects, one per hard clause.
 *
 * A gate is only worth its runtime if somebody has watched it go red. These
 * mutate a deep copy of the **real** registry — not a fixture — so a clause
 * that silently stopped reaching production data fails here too.
 */
export const SEEDS: readonly Seed[] = [
  {
    name: 'index $schema swapped for the shadcn-vue fork',
    rule: 'index',
    apply: (r) => { r.index.$schema = 'https://shadcn-vue.com/schema/registry.json' },
  },
  {
    name: 'an index entry whose payload file is gone',
    rule: 'resolves',
    apply: (r) => { r.payloads.delete(`${r.index.items![0]!.name}.json`) },
  },
  {
    name: 'a payload nothing in the index lists',
    rule: 'orphan',
    apply: (r) => { r.payloads.set('smuggled-in.json', { ...firstPayload(r), name: 'smuggled-in' }) },
  },
  {
    name: 'an item whose name disagrees with its filename',
    rule: 'item',
    apply: (r) => { firstPayload(r).name = 'renamed-by-hand' },
  },
  {
    name: 'a files[] entry with neither inline content nor a file on disk',
    rule: 'files',
    apply: (r) => {
      const item = firstBlock(r)
      delete item.files![0]!.content
      item.files![0]!.path = 'does-not-exist-on-disk.vue'
    },
  },
  {
    name: 'an item importing Pro source (A4-F5)',
    rule: 'pro-source',
    apply: (r) => {
      const item = firstBlock(r)
      item.files![0]!.content = `import { ProThing } from '@dzup-ui-pro/graph'\n${item.files![0]!.content ?? ''}`
    },
  },
  {
    name: 'a theme with no dark-scheme alias for dzup-ui\'s own selector (A4-F4)',
    rule: 'theme',
    apply: (r) => {
      const theme = themeItem(r)
      if (theme !== undefined)
        delete theme.css
    },
  },
  {
    name: 'an item depending on a package the release policy withholds',
    rule: 'dependency',
    apply: (r) => { firstBlock(r).dependencies = ['@dzup-ui/compat'] },
  },
]

function firstPayload(r: LoadedRegistry): RegistryItem {
  return [...r.payloads.values()][0]!
}

function firstBlock(r: LoadedRegistry): RegistryItem {
  return [...r.payloads.values()].find(i => i.type === 'registry:block')!
}

function themeItem(r: LoadedRegistry): RegistryItem | undefined {
  return [...r.payloads.values()].find(i => i.type === 'registry:theme')
}

/** Deep-copy a loaded registry so a seed cannot touch the real one. */
export function cloneRegistry(reg: LoadedRegistry): LoadedRegistry {
  return {
    indexPath: reg.indexPath,
    dir: reg.dir,
    index: structuredClone(reg.index),
    payloads: new Map([...reg.payloads].map(([k, val]) => [k, structuredClone(val)])),
    siblings: [...reg.siblings],
  }
}

export interface SeedResult {
  seed: string
  rule: RegistryViolation['rule']
  caught: boolean
  /** The rules that actually fired, for a seed that caught the wrong thing. */
  firedRules: string[]
}

/**
 * Run every seed against the registry that carries a theme item where one is
 * needed, and every other seed against the first registry.
 */
export function runSeeds(root: string = REGISTRY_ROOT): SeedResult[] {
  const { registries } = loadAllRegistries(root)
  const published = publishedPackages()
  const out: SeedResult[] = []
  for (const seed of SEEDS) {
    const host = seed.rule === 'theme'
      ? registries.find(r => themeItem(r) !== undefined)
      : registries[0]
    if (host === undefined) {
      out.push({ seed: seed.name, rule: seed.rule, caught: false, firedRules: ['<no registry to seed>'] })
      continue
    }
    const clone = cloneRegistry(host)
    const before = new Set(
      checkRegistry(clone, published).filter(x => x.level === 'error').map(x => x.rule),
    )
    seed.apply(clone)
    const after = checkRegistry(clone, published).filter(x => x.level === 'error')
    const fired = [...new Set(after.map(x => x.rule))]
    out.push({
      seed: seed.name,
      rule: seed.rule,
      caught: after.some(x => x.rule === seed.rule) && !before.has(seed.rule),
      firedRules: fired,
    })
  }
  return out
}

// ── CLI ─────────────────────────────────────────────────────────────────────

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')

  if (process.argv.includes('--self-test')) {
    const results = runSeeds()
    console.warn('Registry gate — seeded failures (TASK-R1-O5)\n')
    for (const r of results) {
      console.warn(`  ${r.caught ? '✓' : '✗'} [${r.rule}] ${r.seed}`)
      if (!r.caught)
        console.error(`      fired instead: ${r.firedRules.join(', ') || '<nothing>'}`)
    }
    const missed = results.filter(r => !r.caught)
    if (missed.length > 0) {
      console.error(`\n${missed.length} seeded defect(s) passed the gate. A clause that cannot be `
        + 'made to fail is not a gate.')
      process.exit(1)
    }
    console.warn(`\n✓ all ${results.length} seeded defects were caught by their own clause.`)
    process.exit(0)
  }

  const { registries } = loadAllRegistries()
  const violations = checkAllRegistries()
  const errors = violations.filter(x => x.level === 'error')
  const reports = violations.filter(x => x.level === 'report')

  const totalItems = registries.reduce((n, r) => n + (r.index.items?.length ?? 0), 0)
  const totalPayloads = registries.reduce((n, r) => n + r.payloads.size, 0)
  const totalFiles = registries.reduce(
    (n, r) => n + [...r.payloads.values()].reduce((m, i) => m + (i.files?.length ?? 0), 0),
    0,
  )

  console.warn('Registry — TASK-R1-O5 (A4-D3)\n')
  console.warn(`  ${registries.length} registries · ${totalItems} listed items · `
    + `${totalPayloads} payloads · ${totalFiles} installable files`)
  for (const r of registries) {
    console.warn(`    ${r.indexPath.padEnd(46)} ${String(r.index.items?.length ?? 0).padStart(3)} items`)
  }

  for (const r of reports.filter(x => x.rule === 'unpublished'))
    console.warn(`\n  ! ${r.message}`)
  const otherReports = reports.filter(x => x.rule !== 'unpublished')
  if (otherReports.length > 0) {
    console.warn(`\n  ${otherReports.length} report-level finding(s)`)
    if (showAll) {
      for (const r of otherReports)
        console.warn(`    · [${r.rule}] ${r.message}`)
    }
    else {
      console.warn('    (pass --all to list them)')
    }
  }

  if (errors.length === 0) {
    // The eight enforcing clauses passed — say exactly that, and say what the
    // ninth found rather than letting a bare ✓ cover it. On 2026-09-22 this line
    // printed unqualified over 103 blocks with no markdown mirror, which is the
    // same false-green shape the docs-size gate was carrying (findings S6, S9).
    // The `docs` clause still cannot fail; see decision D194.
    console.warn('\n✓ registry: every listed item resolves, every file is present, no Pro source, '
      + 'theme layered and dark-aware.')
    if (otherReports.length > 0) {
      console.warn(`  ⚠ …and ${otherReports.length} report-level finding(s) above that NO clause can `
        + 'fail on. The ✓ covers the eight enforcing clauses only (D194).')
    }
    process.exit(0)
  }

  console.error('')
  for (const e of errors)
    console.error(`✗ [${e.rule}] ${e.message}`)
  console.error(`\n${errors.length} registry violation(s). Run with --self-test to see the gate fire.`)
  process.exit(1)
}
/* c8 ignore stop */
