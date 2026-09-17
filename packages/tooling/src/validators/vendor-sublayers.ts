/**
 * Vendor sublayer registry validator (TASK-R5-O1, ADR-19 §2/§3).
 *
 * ADR-19 §3 says a Reka internal never becomes a `data-part`: "a node that
 * exists only because Reka renders it is not addressable". The CSS half of that
 * rule was never written down. Nothing stopped a `[data-reka-content-state]`
 * selector from landing inside `@layer dz-components`, and such a selector is a
 * standing bet on a version of somebody else's markup — it breaks on the
 * dependency's next minor, in a consumer's build, with no line in the library
 * that says who took the bet or when it expires.
 *
 * So the registry is not a document, it is a gate:
 *
 * 1. **Every entry is complete.** `selector`, `owner`, `reason` and `exit` are
 *    all non-empty, `layer` is one of the six ADR-19 layer names, and `exit` is
 *    an ISO date or a named event — never "when we get to it". An exit
 *    condition nobody can evaluate is not one.
 * 2. **Every entry is still live.** Its selector must still appear in the
 *    library CSS. A registry entry that outlives its rule is a licence nobody
 *    revoked, which is the failure mode `validate:adr-references` rule 4 exists
 *    to prevent one file over.
 * 3. **Every vendor-shaped selector is registered.** The CSS is scanned for
 *    selectors that reach into a vendor's DOM; one without an entry fails.
 *    This is the rule that makes an EMPTY registry worth shipping — it is what
 *    stops the first such selector from arriving unnoticed.
 *
 * The registry is empty today and was measured empty, not assumed: the only
 * contact between library CSS and Reka is `var(--reka-accordion-content-height)`
 * in `base.css`, a custom property Reka publishes and the library READS from
 * inside its own `.dz-accordion-content` rule. Reading a vendor's published
 * variable is not reaching into its DOM, so it is deliberately not matched.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/vendor-sublayers.ts
 *
 * Exit code 1 on any violation.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const REGISTRY = resolve(ROOT, 'packages/core/src/styles/vendor-registry.json')
const STYLESHEETS = [
  'packages/core/src/styles/base.css',
  'packages/core/src/styles/prose.css',
]

/** The six ADR-19 §2 cascade layers. A vendor rule must name the one it sits in. */
const LAYERS = new Set([
  'dz-reset',
  'dz-tokens',
  'dz-base',
  'dz-components',
  'dz-utilities',
  'dz-overrides',
])

/**
 * Selector shapes that reach into a dependency's DOM.
 *
 * Attribute and class hooks only. A `var(--reka-*)` reference is excluded on
 * purpose: a published custom property is the vendor's own interface, and
 * failing on it would mean the first entry in this registry was a false one.
 */
const VENDOR_SELECTOR_PATTERNS: { name: string, pattern: RegExp }[] = [
  { name: 'reka', pattern: /\[data-reka[^\]]*\]|\.reka-[\w-]+/g },
  { name: 'radix', pattern: /\[data-radix[^\]]*\]|\.radix-[\w-]+/g },
  { name: 'floating-ui', pattern: /\[data-floating-ui[^\]]*\]|\.floating-ui-[\w-]+/g },
  { name: 'vaul', pattern: /\[data-vaul[^\]]*\]|\.vaul-[\w-]+/g },
  { name: 'tanstack', pattern: /\.tanstack-[\w-]+/g },
]

export interface VendorSublayerEntry {
  selector: string
  owner: string
  reason: string
  /** An ISO date (`2026-12-01`) or a named event (`reka-ui@3 upgrade`). */
  exit: string
  /** Which of the six ADR-19 layers the rule sits in. Defaults to dz-components. */
  layer?: string
}

export interface VendorSublayerRegistry {
  layers?: string[]
  entries: VendorSublayerEntry[]
}

export interface VendorSublayerViolation {
  rule: 'incomplete-entry' | 'stale-entry' | 'unregistered-selector'
  selector: string
  message: string
}

export function readRegistry(path: string = REGISTRY): VendorSublayerRegistry {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<VendorSublayerRegistry>
  return { layers: raw.layers, entries: raw.entries ?? [] }
}

/** Strip CSS comments, so a selector quoted in prose is not read as a rule. */
export function stripCssComments(css: string): string {
  return css.replaceAll(/\/\*[\s\S]*?\*\//g, ' ')
}

/** Vendor-shaped selectors present in one stylesheet. */
export function vendorSelectorsIn(css: string): { vendor: string, selector: string }[] {
  const source = stripCssComments(css)
  const found: { vendor: string, selector: string }[] = []
  for (const { name, pattern } of VENDOR_SELECTOR_PATTERNS) {
    for (const match of source.matchAll(pattern))
      found.push({ vendor: name, selector: match[0] })
  }
  return found
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export interface VendorSublayerReport {
  violations: VendorSublayerViolation[]
  entries: number
  scanned: number
  found: number
}

export function checkVendorSublayers(
  registry: VendorSublayerRegistry = readRegistry(),
  stylesheets: string[] = STYLESHEETS,
  root: string = ROOT,
): VendorSublayerReport {
  const violations: VendorSublayerViolation[] = []
  const css = stylesheets
    .map(path => stripCssComments(readFileSync(resolve(root, path), 'utf8')))
    .join('\n')

  for (const entry of registry.entries) {
    const missing = (['selector', 'owner', 'reason', 'exit'] as const)
      .filter(field => typeof entry[field] !== 'string' || entry[field].trim() === '')
    if (missing.length > 0) {
      violations.push({
        rule: 'incomplete-entry',
        selector: entry.selector ?? '(no selector)',
        message: `vendor-registry entry "${entry.selector ?? '?'}" is missing: ${missing.join(', ')}. `
          + 'Every field is load-bearing: an entry with no owner belongs to nobody, and one with '
          + 'no exit condition is permanent by default.',
      })
      continue
    }
    const layer = entry.layer ?? 'dz-components'
    if (!LAYERS.has(layer)) {
      violations.push({
        rule: 'incomplete-entry',
        selector: entry.selector,
        message: `vendor-registry entry "${entry.selector}" names layer "${layer}", which is not `
          + `one of the six ADR-19 §2 layers (${[...LAYERS].join(', ')}).`,
      })
    }
    if (!ISO_DATE.test(entry.exit) && entry.exit.trim().split(/\s+/).length < 2) {
      violations.push({
        rule: 'incomplete-entry',
        selector: entry.selector,
        message: `vendor-registry entry "${entry.selector}" has exit "${entry.exit}", which is `
          + 'neither an ISO date nor a named event. An exit condition nobody can evaluate is not '
          + 'an exit condition.',
      })
    }
    if (!css.includes(entry.selector)) {
      violations.push({
        rule: 'stale-entry',
        selector: entry.selector,
        message: `vendor-registry lists "${entry.selector}" but no library stylesheet contains it. `
          + 'Delete the entry in the change that deleted the rule: a registry entry that outlives '
          + 'its rule is a licence nobody revoked.',
      })
    }
  }

  const registered = new Set(registry.entries.map(entry => entry.selector))
  const found = vendorSelectorsIn(css)
  for (const { vendor, selector } of found) {
    if (registered.has(selector))
      continue
    violations.push({
      rule: 'unregistered-selector',
      selector,
      message: `library CSS selects "${selector}" — a ${vendor} node the library does not render — `
        + 'with no entry in packages/core/src/styles/vendor-registry.json. ADR-19 §3 keeps vendor '
        + 'internals out of the parts contract; the same reasoning applies to CSS. Add an entry '
        + 'with owner, reason and exit condition, or select a node the library owns.',
    })
  }

  return {
    violations,
    entries: registry.entries.length,
    scanned: stylesheets.length,
    found: found.length,
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = checkVendorSublayers()
  if (report.violations.length === 0) {
    console.warn(
      `✓ vendor-sublayers: ${report.entries} registered vendor selector(s); `
      + `${report.found} vendor-shaped selector(s) found across ${report.scanned} stylesheet(s)`,
    )
    process.exit(0)
  }
  for (const violation of report.violations)
    console.error(`✗ ${violation.rule}: ${violation.message}`)
  process.exit(1)
}
/* c8 ignore stop */
