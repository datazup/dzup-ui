/**
 * ADR reference validator (TASK-OSS-P3-01, ADR-19).
 *
 * The repository cites architecture decisions constantly — `ADR-04` alone
 * appears 547 times in source and prose, and every citation is an instruction to
 * the next reader to go and read it. On 2026-08-20, **one of the sixteen cited
 * ADRs had a document**: `docs/adr/` held ADR-18 and nothing else, and
 * `workspace-docs/repos/dzup-ui/docs/adr/` held ADR-17 alone. The rest exist
 * only as a row in the `CLAUDE.md` table, or as a number in a comment.
 *
 * A citation that resolves to nothing is worse than no citation: it claims a
 * rationale has been written down and reviewed when it has not.
 *
 * This validator does not demand that all sixteen be written today — that is a
 * documentation packet with an owner, not a gate. It does three things:
 *
 *   1. **No new undocumented ADR numbers.** Cite an ADR that has neither a
 *      document nor a registry entry and the build fails. This is the part that
 *      matters: the set can only shrink.
 *   2. **The registry ratchets down.** When an ADR gains a document, its
 *      registry entry must be removed in the same change, and `maxUndocumented`
 *      lowered — so the count is a debt figure, not a permanent accommodation.
 *   3. **Documents are well-formed.** One document per number, filename
 *      `ADR-NN-kebab-title.md`, and the number in the filename matches the `#`
 *      heading inside.
 *
 * Specs and fixtures are deliberately not scanned: `build-ownership-map.spec.ts`
 * adr-example-ok: the id below is the fixture's, not a citation.
 * and the ownership fixtures carry `ADR-99-cross-tier-naming`, a synthetic
 * decision id used to prove a collision is only resolvable by naming an ADR.
 * Reporting it would mean either deleting a good test or adding a fake document.
 *
 * For prose *about* an ADR id — this comment, a cookbook's "don't do this"
 * example — put `adr-example-ok:` on the line and the id there is not read as a
 * citation. Line-scoped and visible in review, like the `retired-name-ok:`
 * marker `validate:package-names` already uses.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-adr-references.ts
 *
 * Exit code 1 if violations found.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

/** Where ADR documents live. */
export const ADR_DIR = 'docs/adr'

/** The ratcheted list of ADRs that are cited but have no document yet. */
export const REGISTRY_PATH = 'packages/tooling/scripts/adr-registry.json'

/** Trees scanned for citations. */
const SCAN_ROOTS = [
  'packages',
  'apps',
  'docs',
  'README.md',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'DESIGN.md',
]

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  'coverage',
  'storybook-static',
  '__fixtures__',
  '__snapshots__',
])

/** Files whose ADR ids are synthetic test data rather than citations. */
function isSyntheticSource(file: string): boolean {
  return /\.spec\.tsx?$/.test(file)
    || /\.test\.[cm]?[jt]s$/.test(file)
    || file.includes('/__fixtures__/')
}

const SCANNED_EXTENSIONS = /\.(?:ts|tsx|mts|cts|js|mjs|vue|md|mdx|json|css|ya?ml)$/

/** `ADR-4` and `ADR-04` are the same decision; the id is normalised to two digits. */
export function normaliseAdrId(raw: string): string {
  const digits = /ADR-(\d{1,3})/i.exec(raw)?.[1]
  if (digits === undefined)
    return raw
  return `ADR-${digits.padStart(2, '0')}`
}

export interface AdrCitation {
  id: string
  file: string
  line: number
}

/** Line-scoped opt-out: the ADR id on this line is an example, not a citation. */
export const EXAMPLE_MARKER = 'adr-example-ok'

/**
 * Every `ADR-NN` in one file's text.
 *
 * `ADR-XX` (the placeholder the task prompts use for "pick the next number") is
 * not a citation and does not match. Neither is an id on a line carrying
 * {@link EXAMPLE_MARKER}, nor one on the line after it — a marker inside a
 * wrapped block comment cannot always sit on the same line as the id it covers.
 */
export function extractCitations(file: string, source: string): AdrCitation[] {
  const citations: AdrCitation[] = []
  const lines = source.split('\n')
  lines.forEach((text, index) => {
    if (text.includes(EXAMPLE_MARKER) || lines[index - 1]?.includes(EXAMPLE_MARKER))
      return
    for (const match of text.matchAll(/ADR-\d{1,3}/gi))
      citations.push({ id: normaliseAdrId(match[0]), file, line: index + 1 })
  })
  return citations
}

export interface AdrDocument {
  id: string
  file: string
  heading: string | undefined
}

/** The ADR documents on disk, one entry per file. */
export function collectDocuments(dir: string = ADR_DIR): AdrDocument[] {
  const full = resolve(ROOT, dir)
  if (!existsSync(full))
    return []

  return readdirSync(full)
    .filter(name => name.endsWith('.md'))
    .map((name) => {
      const source = readFileSync(join(full, name), 'utf8')
      return {
        id: normaliseAdrId(name),
        file: `${dir}/${name}`,
        // `\S` rather than `.` after the spaces: `\s+(.+)` lets the two parts
        // compete for the same whitespace, which is polynomial backtracking on a
        // heading of blanks (regexp/no-super-linear-backtracking).
        heading: /^#[^\S\n]+(\S.*)$/m.exec(source)?.[1],
      }
    })
}

function collectSources(target: string): string[] {
  const full = resolve(ROOT, target)
  if (!existsSync(full))
    return []
  if (statSync(full).isFile())
    return SCANNED_EXTENSIONS.test(full) ? [full] : []

  const out: string[] = []
  for (const entry of readdirSync(full)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.'))
      continue
    out.push(...collectSources(join(full, entry)))
  }
  return out
}

export interface RegistryEntry {
  /** `ADR-NN`. */
  id: string
  /** What the decision is, taken from wherever it is currently recorded. */
  title: string
  /** Where the only surviving record of it lives. */
  recordedIn: string
}

export interface AdrRegistry {
  /**
   * Cited ADRs with no document. The list may only shrink; a new entry is a
   * deliberate edit that a reviewer sees.
   */
  undocumented: RegistryEntry[]
  /** Ratchet. Must equal `undocumented.length`. */
  maxUndocumented: number
}

export function readRegistry(path: string = REGISTRY_PATH): AdrRegistry {
  return JSON.parse(readFileSync(resolve(ROOT, path), 'utf8')) as AdrRegistry
}

export interface AdrViolation {
  rule: string
  message: string
}

export interface AdrCheckInput {
  citations: AdrCitation[]
  documents: AdrDocument[]
  registry: AdrRegistry
}

/**
 * Pure rule evaluation, so every rule is unit-testable without a filesystem.
 */
export function checkAdrReferences(input: AdrCheckInput): AdrViolation[] {
  const { citations, documents, registry } = input
  const violations: AdrViolation[] = []

  const documented = new Set(documents.map(document => document.id))
  const registered = new Set(registry.undocumented.map(entry => normaliseAdrId(entry.id)))

  // 1. One document per number, and the filename agrees with the heading.
  const seen = new Map<string, string>()
  for (const document of documents) {
    const previous = seen.get(document.id)
    if (previous !== undefined) {
      violations.push({
        rule: 'duplicate-document',
        message: `${document.id} has two documents (${previous} and ${document.file}). One number, one decision.`,
      })
    }
    seen.set(document.id, document.file)

    const name = document.file.split('/').pop() ?? document.file
    if (!/^ADR-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name)) {
      violations.push({
        rule: 'document-name',
        message: `${document.file} is not named ADR-NN-kebab-title.md, so it cannot be found by number.`,
      })
    }

    if (document.heading !== undefined && normaliseAdrId(document.heading) !== document.id) {
      violations.push({
        rule: 'document-heading',
        message: `${document.file} is filed as ${document.id} but its heading reads "${document.heading}". `
          + 'A reader who arrives by number must land on that number.',
      })
    }
  }

  // 2. Every citation resolves to a document or to a registry entry.
  const unresolved = new Map<string, AdrCitation>()
  for (const citation of citations) {
    if (documented.has(citation.id) || registered.has(citation.id))
      continue
    if (!unresolved.has(citation.id))
      unresolved.set(citation.id, citation)
  }
  for (const [id, where] of unresolved) {
    violations.push({
      rule: 'unresolved-citation',
      message: `${where.file}:${where.line} cites ${id}, which has no document in ${ADR_DIR}/ and no entry `
        + `in ${REGISTRY_PATH}. Write the ADR, or cite one that exists — do not add a registry entry to `
        + 'make this pass; the registry records existing debt, it does not license more.',
    })
  }

  // 3. The registry ratchets down: no entry for an ADR that now has a document.
  for (const entry of registry.undocumented) {
    const id = normaliseAdrId(entry.id)
    if (documented.has(id)) {
      violations.push({
        rule: 'registry-stale',
        message: `${id} now has a document (${seen.get(id)}) but is still listed as undocumented in `
          + `${REGISTRY_PATH}. Remove the entry and lower maxUndocumented in the same change.`,
      })
    }
  }

  // 4. A registry entry nothing cites is dead weight.
  const cited = new Set(citations.map(citation => citation.id))
  for (const entry of registry.undocumented) {
    const id = normaliseAdrId(entry.id)
    if (!cited.has(id) && !documented.has(id)) {
      violations.push({
        rule: 'registry-uncited',
        message: `${id} is listed as undocumented debt but nothing cites it any more. Remove the entry `
          + 'and lower maxUndocumented — the debt is paid.',
      })
    }
  }

  // 5. The ratchet itself.
  if (registry.maxUndocumented !== registry.undocumented.length) {
    violations.push({
      rule: 'ratchet',
      message: `${REGISTRY_PATH} lists ${registry.undocumented.length} undocumented ADR(s) but declares `
        + `maxUndocumented: ${registry.maxUndocumented}. The two must agree, so that writing one ADR is `
        + 'the only way the number goes down and adding one is visible in review.',
    })
  }

  // 6. Entries must say enough to be actionable.
  for (const entry of registry.undocumented) {
    if (entry.title.trim() === '' || entry.recordedIn.trim() === '') {
      violations.push({
        rule: 'registry-entry',
        message: `${normaliseAdrId(entry.id)} in ${REGISTRY_PATH} needs both a title and a recordedIn `
          + 'location; an id alone tells the next reader nothing about what was decided.',
      })
    }
  }

  return violations
}

export function collectCitations(): AdrCitation[] {
  return SCAN_ROOTS.flatMap(collectSources).flatMap((full) => {
    const file = relative(ROOT, full).replaceAll('\\', '/')
    if (isSyntheticSource(file) || file.startsWith(`${ADR_DIR}/`))
      return []
    return extractCitations(file, readFileSync(full, 'utf8'))
  })
}

export function validateAdrReferences(): { violations: AdrViolation[], cited: number, documented: number } {
  const citations = collectCitations()
  const documents = collectDocuments()
  const registry = readRegistry()

  return {
    violations: checkAdrReferences({ citations, documents, registry }),
    cited: new Set(citations.map(citation => citation.id)).size,
    documented: documents.length,
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const { violations, cited, documented } = validateAdrReferences()

  if (violations.length === 0) {
    const registry = readRegistry()
    console.warn(
      `✓ adr-references: ${cited} ADR(s) cited · ${documented} documented · `
      + `${registry.undocumented.length} registry-only (ceiling ${registry.maxUndocumented})`,
    )
    process.exit(0)
  }

  for (const violation of violations)
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(`\n${violations.length} ADR reference violation(s). See docs/adr/ADR-19-public-styling-contract.md.`)
  process.exit(1)
}
/* c8 ignore stop */
