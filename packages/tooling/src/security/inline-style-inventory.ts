/**
 * The inline-`style` inventory (TASK-R2-O4, closing the measurement half of
 * TASK-N1-O5 finding F-C1).
 *
 * ## What it measures and why a count was not enough
 *
 * A `style` **attribute** is governed by `style-src-attr`, which falls back to
 * `style-src`. Under a strict policy — `style-src 'self' 'nonce-…'`, no
 * `'unsafe-inline'` — the browser drops it silently. N1-O5 found one such
 * attribute on `DzFileUpload` (`contain: layout style`), moved it into the
 * `tv()` recipe, and then measured the repository: **78 files with a static
 * `style=`, 38 files binding a dynamic `:style=`**. It stopped there, because
 * fixing 78 components inside a fixture packet is a repo-wide change nobody
 * reviewed.
 *
 * Two numbers are not a plan, and the reason is in the numbers themselves: the
 * 78 and the 38 need **different remedies**, and a sweep that treated them
 * alike would either fail on the dynamic half or quietly ship `'unsafe-inline'`
 * for the static half. So this scanner classifies every site and the artifact
 * carries a **disposition** per site:
 *
 * | Disposition | What it is | The remedy |
 * |---|---|---|
 * | `recipe-movable` | a static `style=` whose declarations are constant | move into `.variants.ts` as a `tv()` arbitrary property, exactly as `DzFileUpload` did |
 * | `custom-property` | a binding that only sets `--dz-*` custom properties | a stylesheet rule reads the property; the *value* still arrives through an attribute, so it is blocked today and needs the decision in §D below |
 * | `required-dynamic` | a binding computing a real CSS value from runtime state (a `clip-path` percentage, a measured pixel offset) | cannot become a class at any number of variants; needs `'unsafe-hashes'`, a nonce-carrying stylesheet, or CSSOM |
 * | `unclassified-binding` | `:style="someComputed"` — the scanner cannot see which properties it writes | read the computed and re-classify by hand; deliberately NOT folded into `required-dynamic`, which would claim more than was measured |
 * | `layout-static` | a static `style=` that is layout-only and constant | same remedy as `recipe-movable`, listed apart because a story or demo may own it |
 *
 * ## Scope
 *
 * `packages/core/src/**\/*.vue` only. Stories, specs and apps are outside the
 * published package, and a CSP claim is about what a consumer receives.
 *
 * Usage:
 *   tsx packages/tooling/src/security/inline-style-inventory.ts           # print
 *   tsx packages/tooling/src/security/inline-style-inventory.ts --write   # write the artifact
 *
 * @module @dzup-ui/tooling/security/inline-style-inventory
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = resolve(fileURLToPath(import.meta.url), '../../../../..')
export const ROOT = HERE
export const SRC_DIR = join(ROOT, 'packages/core/src')
export const INVENTORY_PATH = join(ROOT, 'packages/core/security/inline-style-inventory.json')

/** How a site can be dealt with. */
export type StyleDisposition
  = | 'recipe-movable'
    | 'layout-static'
    | 'custom-property'
    | 'required-dynamic'
    | 'unclassified-binding'

/** One `style` attribute or `:style` binding. */
export interface StyleSite {
  /** Path relative to the repository root, forward slashes. */
  readonly file: string
  /** 1-based line. */
  readonly line: number
  /** `static` for `style="…"`, `bound` for `:style`/`v-bind:style`. */
  readonly kind: 'static' | 'bound'
  readonly disposition: StyleDisposition
  /** The source text, collapsed to one line and trimmed. */
  readonly source: string
}

export interface StyleInventory {
  readonly schemaVersion: string
  readonly note: string
  readonly scope: string
  readonly generatedBy: string
  readonly totals: {
    readonly staticFiles: number
    readonly staticSites: number
    readonly boundFiles: number
    readonly boundSites: number
    readonly byDisposition: Readonly<Record<StyleDisposition, number>>
  }
  readonly sites: readonly StyleSite[]
}

function vueFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name)
    if (statSync(full).isDirectory())
      vueFiles(full, out)
    else if (name.endsWith('.vue'))
      out.push(full)
  }
  return out
}

/** Only the `<template>` half: a `style` string inside `<script>` is not an attribute. */
function templateOf(source: string): { body: string, offset: number } {
  const open = source.indexOf('<template>')
  if (open === -1)
    return { body: '', offset: 0 }
  const close = source.lastIndexOf('</template>')
  const start = open + '<template>'.length
  return { body: source.slice(start, close === -1 ? undefined : close), offset: start }
}

const STATIC_STYLE = /(?<![:\w-])style\s*=\s*"([^"]*)"/g
const BOUND_STYLE = /(?::|v-bind:)style\s*=\s*"([^"]*)"/g

/**
 * Classify a bound `:style`.
 *
 * A binding that writes only `--dz-*` properties is a different problem from
 * one that writes `clip-path: inset(0 0 0 43.7%)`: the first has a stylesheet
 * answer (declare the property in the sheet, set it from CSSOM), the second has
 * no answer that is not a policy decision.
 */
export function classifyBound(expression: string): StyleDisposition {
  // The optional quote matters: a custom property has to be quoted in an object
  // literal (`{ '--dz-anchor-indent': x }`), so a pattern that required the
  // colon to touch the name would classify every custom-property binding as
  // something it cannot see — the one disposition with a cheap remedy, lost.
  const properties = [...expression.matchAll(/(--[\w-]+|[a-z][\w-]*)['"]?\s*:/gi)].map(m => m[1]!)
  const declared = properties.filter(p => p !== 'value')
  // An opaque reference (`:style="rootStyle"`) declares nothing this scanner
  // can read. Calling it `required-dynamic` would be a claim the scanner cannot
  // support, and a disposition nobody can check is how an inventory becomes a
  // list that has been "looked at". It gets its own name and stays visible.
  if (declared.length === 0)
    return 'unclassified-binding'
  if (declared.every(p => p.startsWith('--')))
    return 'custom-property'
  return 'required-dynamic'
}

/**
 * Classify a static `style="…"`.
 *
 * `contain:` is called out because it is the case N1-O5 proved matters: CSS
 * containment is what keeps a 4 096-character file name inside the component
 * box, so a host with a strict CSP got the LEAST contained control. It moves
 * into the recipe as `[contain:layout_style]` — the form `DzCard.variants.ts`
 * and `DzPanel.variants.ts` already use.
 */
export function classifyStatic(declarations: string): StyleDisposition {
  return /\bcontain\s*:/.test(declarations) ? 'recipe-movable' : 'layout-static'
}

/** Scan the published source and return the inventory. */
export function buildInventory(): StyleInventory {
  const sites: StyleSite[] = []

  for (const file of vueFiles(SRC_DIR)) {
    const source = readFileSync(file, 'utf8')
    const { body, offset } = templateOf(source)
    if (body === '')
      continue
    const rel = relative(ROOT, file).replaceAll('\\', '/')
    const lineAt = (index: number): number =>
      source.slice(0, offset + index).split('\n').length

    for (const match of body.matchAll(STATIC_STYLE)) {
      sites.push({
        file: rel,
        line: lineAt(match.index),
        kind: 'static',
        disposition: classifyStatic(match[1] ?? ''),
        source: `style="${(match[1] ?? '').replace(/\s+/g, ' ').trim()}"`,
      })
    }

    for (const match of body.matchAll(BOUND_STYLE)) {
      sites.push({
        file: rel,
        line: lineAt(match.index),
        kind: 'bound',
        disposition: classifyBound(match[1] ?? ''),
        source: `:style="${(match[1] ?? '').replace(/\s+/g, ' ').trim()}"`,
      })
    }
  }

  sites.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)

  const byDisposition: Record<StyleDisposition, number> = {
    'recipe-movable': 0,
    'layout-static': 0,
    'custom-property': 0,
    'required-dynamic': 0,
    'unclassified-binding': 0,
  }
  for (const site of sites)
    byDisposition[site.disposition] += 1

  const staticSites = sites.filter(s => s.kind === 'static')
  const boundSites = sites.filter(s => s.kind === 'bound')

  return {
    schemaVersion: '1.0.0',
    note:
      'Every `style` attribute and `:style` binding in the PUBLISHED component source, with a '
      + 'disposition. A `style` attribute is governed by `style-src-attr`, which falls back to '
      + '`style-src`, so a strict policy without `\'unsafe-inline\'` drops every site listed here. '
      + 'TASK-N1-O5 measured the counts (finding F-C1) and deliberately did not act on them; this '
      + 'artifact is the classification that makes acting on them reviewable, because the static '
      + 'half and the dynamic half need different remedies and a single sweep would get one of '
      + 'them wrong. Regenerate with `tsx packages/tooling/src/security/inline-style-inventory.ts '
      + '--write`; `inline-style-inventory.spec.ts` fails when the artifact and the source '
      + 'disagree, and when a count rises.',
    scope: 'packages/core/src/**/*.vue — template sections only',
    generatedBy: 'packages/tooling/src/security/inline-style-inventory.ts',
    totals: {
      staticFiles: new Set(staticSites.map(s => s.file)).size,
      staticSites: staticSites.length,
      boundFiles: new Set(boundSites.map(s => s.file)).size,
      boundSites: boundSites.length,
      byDisposition,
    },
    sites,
  }
}

export function readInventory(): StyleInventory {
  return JSON.parse(readFileSync(INVENTORY_PATH, 'utf8')) as StyleInventory
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  const inventory = buildInventory()
  const { totals } = inventory
  console.warn(
    `inline-style inventory: ${totals.staticSites} static site(s) in ${totals.staticFiles} file(s) · `
    + `${totals.boundSites} bound site(s) in ${totals.boundFiles} file(s)`,
  )
  for (const [disposition, count] of Object.entries(totals.byDisposition))
    console.warn(`  · ${disposition}: ${count}`)

  if (process.argv.includes('--write')) {
    writeFileSync(INVENTORY_PATH, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
    console.warn(`  → ${relative(ROOT, INVENTORY_PATH).replaceAll('\\', '/')}`)
  }
}
