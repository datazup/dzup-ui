/**
 * Reading the evidence artifacts off disk (TASK-N2-D2).
 *
 * Split from `evidence.ts` for the same reason `docs-pages.ts` has no
 * filesystem in it: the renderers are pure over their inputs, so a unit test can
 * hand them a synthetic matrix — which is the only way to prove that a `fail`
 * row, or an absent lane record, renders the way it must, without writing a
 * fabricated record to disk.
 *
 * ## Required versus optional, and why the distinction is not cosmetic
 *
 * The quality matrix, the capability matrix, the AT scaffold index and the WCAG
 * deviation register are **required**. A page cannot say what a component owes,
 * what was measured, what the AT state is, or where the library stands on
 * SC 2.5.7 without them, and rendering around their absence would mean
 * publishing a component page whose evidence section is silently empty.
 *
 * The engine lane record, the cross-engine ledger and the security deviation
 * register are **optional** — and their absence is *printed*, not routed around.
 * N1's finding F4 is exactly this hazard: `test-results/matrix-report.json` is
 * git-ignored and is the sole copy of a browser run, so deleting it silently
 * flips every browser capability cell to `unrun`. An evidence site that renders
 * a confident page when the record has gone missing repeats that mistake with a
 * public audience.
 *
 * @module @dzup-ui/tooling/docs/read-evidence
 */

import type {
  AtIndex,
  CapabilityMatrix,
  EngineRatchets,
  EvidenceSources,
  KnownFailures,
  QualityMatrix,
  SecurityDeviations,
  WcagDeviations,
} from './evidence.ts'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** Repo-relative paths of every artifact the evidence layer reads. */
export const EVIDENCE_PATHS = {
  quality: 'packages/core/docs/quality-matrix.json',
  capability: 'packages/core/docs/capability-matrix.json',
  atMatrix: 'e2e/at-matrix/index.json',
  wcagDeviations: 'packages/core/docs/wcag-deviations.json',
  engines: 'e2e/matrix/engine-ratchets.json',
  knownFailures: 'e2e/matrix/known-failures.json',
  securityDeviations: 'packages/core/security/security-deviations.json',
  baseCss: 'packages/core/src/styles/base.css',
} as const

/** The artifacts with no honest fallback. Their absence stops the build. */
export const REQUIRED_EVIDENCE_PATHS: readonly string[] = [
  EVIDENCE_PATHS.quality,
  EVIDENCE_PATHS.capability,
  EVIDENCE_PATHS.atMatrix,
  EVIDENCE_PATHS.wcagDeviations,
]

/** Where the executable AT scripts live, when they have been authored. */
export const AT_SCRIPTS_DIR = 'e2e/at-matrix/scripts'

function readJson<T>(relPath: string, root: string): T | undefined {
  const abs = join(root, relPath)
  return existsSync(abs) ? (JSON.parse(readFileSync(abs, 'utf8')) as T) : undefined
}

function sha256Of(relPath: string, root: string): string | undefined {
  const abs = join(root, relPath)
  return existsSync(abs)
    ? createHash('sha256').update(readFileSync(abs, 'utf8'), 'utf8').digest('hex')
    : undefined
}

/**
 * The cascade-layer names, from the library's own `@layer` statement.
 *
 * A statement page that names layers has to name the ones the stylesheet
 * actually declares. This reads the first bare `@layer a, b, c;` statement —
 * the ordering declaration — and deliberately not the `@layer x { … }` blocks,
 * which are where rules go rather than where the order is decided.
 */
export function readCascadeLayers(css: string): string[] {
  // The capture cannot start with whitespace, so the separator and the capture
  // have no character in common and the match is unambiguous — `eslint`'s
  // `regexp/no-super-linear-backtracking` is right that `\s+([^;{]+)` is not.
  const match = /^@layer[ \t]+([^\s;{][^;{\n]*);/m.exec(css)
  if (match === null)
    return []
  return match[1]!.split(',').map(s => s.trim()).filter(s => s !== '')
}

/** Every authored AT script on disk, keyed by component name. */
export function readAtScripts(root: string = ROOT): Record<string, string> {
  const dir = join(root, AT_SCRIPTS_DIR)
  if (!existsSync(dir))
    return {}
  const out: Record<string, string> = {}
  for (const file of readdirSync(dir).sort()) {
    const m = /^(.+)\.at-script\.md$/.exec(file)
    if (m !== null)
      out[m[1]!] = `${AT_SCRIPTS_DIR}/${file}`
  }
  return out
}

/**
 * Read every evidence artifact.
 *
 * @throws when a required artifact is missing, naming it and saying why there is
 * no honest way to render the page without it.
 */
export function readEvidenceSources(root: string = ROOT): EvidenceSources {
  const missing = REQUIRED_EVIDENCE_PATHS.filter(p => !existsSync(join(root, p)))
  if (missing.length > 0) {
    throw new Error(
      `The evidence layer cannot be generated: ${missing.length} required artifact(s) are missing.\n${
        missing.map(p => `  - ${p}`).join('\n')
      }\n\nThese are not optional inputs. Without them a component page would publish an evidence\n`
      + `section that is silently empty, which reads as "nothing is owed" rather than "nothing was\n`
      + `read". Run the generators that produce them first.`,
    )
  }

  const fingerprints: Record<string, string> = {}
  for (const path of Object.values(EVIDENCE_PATHS)) {
    const fp = sha256Of(path, root)
    if (fp !== undefined)
      fingerprints[path] = fp
  }

  const cssPath = join(root, EVIDENCE_PATHS.baseCss)
  const cascadeLayers = existsSync(cssPath)
    ? readCascadeLayers(readFileSync(cssPath, 'utf8'))
    : []

  return {
    quality: readJson<QualityMatrix>(EVIDENCE_PATHS.quality, root)!,
    capability: readJson<CapabilityMatrix>(EVIDENCE_PATHS.capability, root)!,
    atMatrix: readJson<AtIndex>(EVIDENCE_PATHS.atMatrix, root)!,
    wcagDeviations: readJson<WcagDeviations>(EVIDENCE_PATHS.wcagDeviations, root)!,
    engines: readJson<EngineRatchets>(EVIDENCE_PATHS.engines, root),
    knownFailures: readJson<KnownFailures>(EVIDENCE_PATHS.knownFailures, root),
    securityDeviations: readJson<SecurityDeviations>(EVIDENCE_PATHS.securityDeviations, root),
    cascadeLayers,
    atScripts: readAtScripts(root),
    fingerprints,
  }
}
