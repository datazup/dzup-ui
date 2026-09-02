/**
 * DTCG Token Export Generator (TASK-N2-T1)
 *
 * Writes `dist/tokens.dtcg.json` — the DTCG 2025.10 interchange projection of
 * the same token maps `generate.ts` turns into `dist/tokens.css`.
 *
 * Deliberately a **separate script** from `generate.ts` rather than another
 * `writeFileSync` inside it: `generate.ts` also rewrites the repo-root
 * `DESIGN.md`, and `yarn test:prepare` runs it before every `yarn test`. Folding
 * the DTCG emit in there would make `yarn test` write an interchange artifact as
 * a side effect, and would put a hard requirement (zero change to tokens.css) at
 * the mercy of an unrelated edit.
 *
 * Run via: yarn generate:tokens:dtcg
 *
 * The output is deterministic and timestamp-free — run it twice, diff the bytes.
 * Freshness is gated by `yarn validate:tokens:dtcg`, which rebuilds in memory
 * and compares.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildDtcgDocument, DTCG_OUTPUT_RELATIVE_PATH, serializeDtcgDocument } from './dtcg.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_DIR = resolve(__dirname, '..')

interface PackageManifest { version?: string }

/** Read the package version without importing JSON (keeps this ESM-portable). */
function readPackageVersion(packageDir: string): string {
  const raw = readFileSync(resolve(packageDir, 'package.json'), 'utf-8')
  const parsed = JSON.parse(raw) as PackageManifest
  return parsed.version ?? '0.0.0'
}

function main(): void {
  const outputPath = resolve(PACKAGE_DIR, DTCG_OUTPUT_RELATIVE_PATH)
  mkdirSync(dirname(outputPath), { recursive: true })

  const result = buildDtcgDocument({ packageVersion: readPackageVersion(PACKAGE_DIR) })
  writeFileSync(outputPath, serializeDtcgDocument(result.document), 'utf-8')

  const { counts } = result
  const typeCensus = Object.entries(counts.byType)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `${type} ${count}`)
    .join(' · ')

  /* eslint-disable no-console */
  console.log('[tokens:dtcg] Generated %s', DTCG_OUTPUT_RELATIVE_PATH)
  console.log(
    '[tokens:dtcg] %d tokens — %d typed, %d untyped, %d aliases preserved',
    counts.total,
    counts.typed,
    counts.untyped,
    counts.aliases,
  )
  console.log('[tokens:dtcg] by $type: %s', typeCensus)
  if (counts.untyped > 0) {
    console.log(
      '[tokens:dtcg] %d tokens have no DTCG type and are recorded under '
      + '$extensions["com.dzup"].untyped (never given a fake $type):',
      counts.untyped,
    )
    for (const record of result.untyped) {
      console.log('[tokens:dtcg]   %s (%s) — %s', record.path, record.cssVariable, record.reason)
    }
  }
  /* eslint-enable no-console */
}

main()
