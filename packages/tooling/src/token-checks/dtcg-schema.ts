/**
 * Official-schema validation for `dist/tokens.dtcg.json` (TASK-R5-O7; closes
 * N2-T1 **D5**).
 *
 * N2-T1 validated the export against the published DTCG 2025.10 JSON Schema and
 * got `SCHEMA VALID: true` — from a **scratch script**, once, on 2026-09-01.
 * Its own handoff called that out: *"this is a one-off, out-of-band check ... it
 * is not wired into any gate"*. A file that is spec-valid on the day someone
 * remembered to check is not a shipped interchange format; the first-mover DTCG
 * claim in `04-competitive-benchmark.md` is exactly the claim that must not rot.
 * This turns it into a standing gate.
 *
 * ── Why the schema is vendored ──
 *
 * `format.json` `$ref`s 18 sub-schema URLs and **every one of them returns HTTP
 * 404** (N2-T1 §5 F-5). The published file survives that only because it bundles
 * all of them under `definitions`, each with its own `$id`. So there is no
 * "fetch it at run time" option even in principle — and a mandatory gate must
 * not reach the network anyway. The copy under `schemas/` carries the spec
 * edition **in its filename**, so upgrading to a later edition is a visible,
 * reviewable file addition and never an invisible re-download.
 *
 * ── What this gate does NOT prove ──
 *
 * Schema validity says the JSON is well-formed DTCG. It does **not** say the
 * document describes *this* design system — that is `validate:tokens:dtcg`,
 * which resolves every alias and compares against what `tokens.css` computes.
 * The two are complementary and both are links in `validate:all`.
 *
 * Usage: `tsx packages/tooling/src/token-checks/dtcg-schema.ts`
 * Exit 1 if the export violates the schema, or if the vendored schema is
 * missing or unreadable.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildDtcgDocument, serializeDtcgDocument } from '../../../tokens/src/dtcg.js'
import { Draft07Validator } from './json-schema-draft07.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../../../')
const DTCG_PATH = resolve(ROOT, 'packages/tokens/dist/tokens.dtcg.json')

/** The spec edition is part of the filename on purpose — see the header. */
export const SCHEMA_EDITION = '2025.10'
export const SCHEMA_PATH = resolve(HERE, `schemas/dtcg-format-${SCHEMA_EDITION}.schema.json`)

export interface SchemaGateResult {
  readonly ok: boolean
  readonly errors: readonly { instancePath: string, message: string }[]
  readonly tokenPaths: readonly string[]
  readonly source: string
  readonly edition: string
}

/**
 * A JSON pointer into the export maps onto a DTCG token path: the pointer
 * `/primitive/color/primary/500/$value` is the token `primitive.color.primary.500`.
 * `<requirements><schema_gate>` asks failures to name the token, not the pointer.
 */
export function tokenPathFor(instancePath: string): string {
  const segments: string[] = []
  for (const raw of instancePath.split('/').slice(1)) {
    const segment = raw.replace(/~1/g, '/').replace(/~0/g, '~')
    // Everything before the first `$`-prefixed key is the token's own path;
    // everything from `$value` onward is inside the value. Stopping here rather
    // than filtering numerically matters: shade names ARE numeric, so a filter
    // on /^\d+$/ turns `primitive.color.primary.500` into
    // `primitive.color.primary` and names the wrong thing in the failure.
    if (segment.startsWith('$'))
      break
    segments.push(segment)
  }
  return segments.length === 0 ? '(document root)' : segments.join('.')
}

export function checkDtcgSchema(): SchemaGateResult {
  if (!existsSync(SCHEMA_PATH)) {
    return {
      ok: false,
      errors: [{
        instancePath: '',
        message: `vendored schema missing at ${relative(ROOT, SCHEMA_PATH)} — the gate cannot pass vacuously`,
      }],
      tokenPaths: [],
      source: 'none',
      edition: SCHEMA_EDITION,
    }
  }

  // Run against dist/ when it is built, and against the in-memory projection
  // otherwise. CI runs validate:all on a clean checkout before `yarn build`, so
  // a gate that needs dist/ would either fail or — far worse — skip silently.
  // Same discipline as validate:tokens:dtcg.
  const usingDist = existsSync(DTCG_PATH)
  const packageJson = JSON.parse(
    readFileSync(resolve(ROOT, 'packages/tokens/package.json'), 'utf8'),
  ) as { version?: string }
  const text = usingDist
    ? readFileSync(DTCG_PATH, 'utf8')
    : serializeDtcgDocument(buildDtcgDocument({ packageVersion: packageJson.version ?? '0.0.0' }).document)
  const source = usingDist ? 'dist/tokens.dtcg.json' : 'rebuilt in memory (dist not built)'

  const schema: unknown = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'))
  const document: unknown = JSON.parse(text)

  const errors = new Draft07Validator(schema).validate(document)
  const tokenPaths = [...new Set(errors.map(error => tokenPathFor(error.instancePath)))]

  return { ok: errors.length === 0, errors, tokenPaths, source, edition: SCHEMA_EDITION }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const result = checkDtcgSchema()
  if (result.ok) {
    console.warn(
      `✓ dtcg-schema: valid against the official DTCG ${result.edition} JSON Schema `
      + `(vendored, ${relative(ROOT, SCHEMA_PATH).split('\\').join('/')})\n`
      + `  validated: ${result.source}`,
    )
    process.exit(0)
  }
  console.error(`✗ dtcg-schema FAILED — ${result.errors.length} schema violation(s) in ${result.source}`)
  console.error(`  offending token path(s): ${result.tokenPaths.slice(0, 12).join(', ')}`
    + `${result.tokenPaths.length > 12 ? `, … (+${result.tokenPaths.length - 12} more)` : ''}`)
  for (const error of result.errors.slice(0, 40))
    console.error(`    ${tokenPathFor(error.instancePath)} (${error.instancePath || '/'}): ${error.message}`)
  if (result.errors.length > 40)
    console.error(`    … and ${result.errors.length - 40} more`)
  process.exit(1)
}
/* c8 ignore stop */
