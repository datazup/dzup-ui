/**
 * What browser floor this repository actually declares (TASK-R2-O5).
 *
 * `/evidence/browser-support` carries a statement about which browsers the
 * library supports. Until now the paragraph that answers it was a **constant
 * string** in `statements.ts` saying that nothing is declared — true when
 * TASK-N2-D2 measured it by hand (finding F-2), and true the next day only by
 * luck. The day an owner adds a `browserslist` key, the published page would go
 * on saying there is none; the day somebody deletes one, the page would go on
 * claiming a tier. Neither failure has a gate.
 *
 * So the claim is a **probe**, on the same principle as `readCascadeLayers`: the
 * generator reports what the tree declares and never decides what it ought to.
 * A declaration found is printed with the file it came from; nothing found is
 * printed as nothing found, together with the list of what was searched — an
 * absence a reader can check is worth more than one they have to trust.
 *
 * ## What counts as a declaration, and what deliberately does not
 *
 * - **`browserslist`** — a `.browserslistrc` file, or a `browserslist` key in a
 *   `package.json`. This is the ecosystem's standard channel: PostCSS, Autoprefixer,
 *   Babel, esbuild's Vite integration and Baseline tooling all read it, so
 *   declaring it here is the one edit that makes every tool agree.
 * - **A build `target`** — `build.target` / `esbuild.target` in a Vite config. It
 *   is what actually decides the syntax level of the published bundle.
 * - **`compilerOptions.target` in a tsconfig is NOT a browser declaration** and is
 *   reported separately under that name. It sets the syntax level `tsc` *emits*,
 *   the packages are built by Vite rather than by `tsc`, and no gate reads it. A
 *   reader who saw `ES2022` in the support table would conclude the library had
 *   committed to a browser range it has never named. This distinction is the
 *   whole reason the probe exists rather than a grep: the `<done_check>` this task
 *   shipped with greps `target` in `packages/core/vite.config.ts` and matches two
 *   lines of prose in a doc comment, which is exactly the false pass a hand-written
 *   check produces and a typed probe cannot.
 *
 * @module @dzup-ui/tooling/docs/browser-target
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** One declaration of a supported-browser floor, as found in the tree. */
export interface BrowserTargetDeclaration {
  /** `browserslist` = the ecosystem channel; `build-target` = the emitted syntax level. */
  kind: 'browserslist' | 'build-target'
  /** Repo-relative path of the file that declares it. */
  where: string
  /** The declared value, verbatim. */
  value: string
}

/** A `compilerOptions.target`, reported so it cannot be mistaken for the above. */
export interface SyntaxLevelDeclaration {
  where: string
  value: string
}

/** The result of the scan: what is declared, and what was searched to find out. */
export interface BrowserTargetProbe {
  /** Every browser-floor declaration found. Empty means the floor is undeclared. */
  declared: BrowserTargetDeclaration[]
  /** `compilerOptions.target` values — a syntax level, NOT a browser claim. */
  syntaxLevels: SyntaxLevelDeclaration[]
  /** Repo-relative paths actually read, so the absence is checkable. */
  scanned: string[]
}

/** One file handed to the classifier: repo-relative path plus its bytes. */
export interface ProbedFile {
  path: string
  content: string
}

/**
 * Whether a Vite config declares a build target.
 *
 * Matched as an object KEY — start of a line, optional indentation, `target:` —
 * which is what separates a declaration from the word "target" in a sentence. A
 * comment line in this repository's style begins with `*` or `//`, so those are
 * refused explicitly rather than relied on.
 */
export function buildTargetIn(content: string): string | undefined {
  const match = /^[ \t]*(?:build\.)?target[ \t]*:[ \t]*(['"][^'"]+['"]|\[[^\]]*\])/m.exec(content)
  if (match === null)
    return undefined
  return match[1]!.replaceAll('\'', '').replaceAll('"', '')
}

/**
 * Classify a set of already-read files. Pure, so the rules are testable without
 * a fixture tree on disk.
 */
export function classifyBrowserTargetSources(files: readonly ProbedFile[]): BrowserTargetProbe {
  const declared: BrowserTargetDeclaration[] = []
  const syntaxLevels: SyntaxLevelDeclaration[] = []

  for (const file of files) {
    const name = file.path.split('/').pop() ?? file.path

    if (name === '.browserslistrc' || name === 'browserslist') {
      const value = file.content
        .split('\n')
        .map(line => line.replace(/#.*$/, '').trim())
        .filter(line => line !== '')
        .join(', ')
      declared.push({ kind: 'browserslist', where: file.path, value })
      continue
    }

    if (name === 'package.json') {
      const json = JSON.parse(file.content) as { browserslist?: unknown }
      if (json.browserslist !== undefined) {
        declared.push({
          kind: 'browserslist',
          where: file.path,
          value: Array.isArray(json.browserslist)
            ? json.browserslist.join(', ')
            : JSON.stringify(json.browserslist),
        })
      }
      continue
    }

    if (name === 'tsconfig.json' || name === 'tsconfig.base.json') {
      // Read as text, not JSON: tsconfigs carry comments, and `JSON.parse`
      // refuses them. The key shape is the same discriminator the Vite scan uses.
      const match = /^[ \t]*"target"[ \t]*:[ \t]*"([^"]+)"/m.exec(file.content)
      if (match !== null)
        syntaxLevels.push({ where: file.path, value: match[1]! })
      continue
    }

    if (name.startsWith('vite.config.')) {
      const value = buildTargetIn(file.content)
      if (value !== undefined)
        declared.push({ kind: 'build-target', where: file.path, value })
    }
  }

  const sort = <T extends { where: string }>(rows: T[]): T[] =>
    rows.sort((a, b) => a.where.localeCompare(b.where))

  return {
    declared: sort(declared),
    syntaxLevels: sort(syntaxLevels),
    scanned: files.map(f => f.path).sort(),
  }
}

/** Directories whose immediate children are scanned, beside the repo root. */
const WORKSPACE_ROOTS = ['packages', 'apps'] as const
/** File names read in each of those directories. */
const PROBED_NAMES = [
  '.browserslistrc',
  'browserslist',
  'package.json',
  'tsconfig.json',
  'tsconfig.base.json',
  'vite.config.ts',
  'vite.config.js',
  'vite.config.mts',
] as const

/**
 * Scan the repository for a declared browser floor.
 *
 * Deterministic: a fixed list of names in a fixed list of directories, sorted.
 * It does not walk the tree — a recursive walk would pick up `node_modules`,
 * playground templates and generated fixtures, and a "declaration" found in a
 * vendored template is not a declaration this library makes.
 */
export function probeBrowserTarget(root: string = ROOT): BrowserTargetProbe {
  const dirs = ['.']
  for (const workspace of WORKSPACE_ROOTS) {
    const abs = join(root, workspace)
    if (!existsSync(abs))
      continue
    for (const entry of readdirSync(abs).sort()) {
      if (statSync(join(abs, entry)).isDirectory())
        dirs.push(`${workspace}/${entry}`)
    }
  }

  const files: ProbedFile[] = []
  for (const dir of dirs) {
    for (const name of PROBED_NAMES) {
      const rel = dir === '.' ? name : `${dir}/${name}`
      const abs = join(root, rel)
      if (existsSync(abs) && statSync(abs).isFile())
        files.push({ path: rel, content: readFileSync(abs, 'utf8') })
    }
  }

  return classifyBrowserTargetSources(files)
}
