/* eslint-disable no-console */
/**
 * Peer & icon surface report (TASK-N5-04).
 *
 * Answers, from the BUILT artifact rather than from source, two questions the
 * peer-hygiene decisions turn on and which nothing in this repository could
 * previously answer without a hand-run script:
 *
 *   1. **Which published entry points can reach which external package?**
 *      `@dzup-ui/core` declares `reka-ui` as a non-optional peer. That is a
 *      statement about the package, not about any entry point — and the two
 *      differ. `DzButton.vue.js` reaches five externals and `reka-ui` is not
 *      among them, while the `./buttons` barrel that is the only published way
 *      to import it reaches `reka-ui` through `DzSpeedDial → DzTooltip`. A
 *      consumer's install therefore depends on the barrel, not on the
 *      component. This report makes that distinction measurable.
 *
 *   2. **What is the real icon surface?** `lucide-vue-next` is a hard
 *      dependency, and "icon lock-in" is usually argued in the abstract. The
 *      inventory below is the concrete version: how many modules import it,
 *      which glyph identifiers, and how often each is used — which is what
 *      sizes an icon-indirection contract.
 *
 * ── This is a REPORT, not a gate ────────────────────────────────────────────
 * It always exits 0 and it is deliberately NOT in `validate:all`. There is no
 * committed baseline and no ratchet, because every number it prints is a
 * consequence of decisions the owner has not taken yet (TASK-N5-04 items 1 and
 * 2); a gate over an undecided surface would freeze the status quo by accident.
 * `validate:externals` already enforces the invariant that DOES hold today —
 * every bare import a built package emits is declared.
 *
 * Read `dist/`, not `src/`: an `exports` map, a barrel's re-export shape and a
 * bundler's module resolution are all properties of the published artifact.
 * Run after a build; with no `dist/` it says so and stops rather than guessing.
 *
 * Usage:
 *   npx tsx packages/tooling/src/peer-surface.ts
 *   npx tsx packages/tooling/src/peer-surface.ts --json
 *
 * @module @dzup-ui/tooling/peer-surface
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import process from 'node:process'

/** One entry point's reachable external packages. */
export interface EntrySurface {
  /** The `exports` subpath, e.g. `.` or `./buttons`. */
  subpath: string
  /** The dist file the subpath resolves to, repo-relative. */
  file: string
  /** How many dist modules the entry statically reaches, itself included. */
  modules: number
  /** Bare specifiers reachable from the entry → the modules that import them. */
  externals: Record<string, string[]>
}

/** The `lucide-vue-next` import inventory of a dist tree. */
export interface IconSurface {
  /** Modules with at least one `lucide-vue-next` import. */
  files: string[]
  /** Glyph identifier → the modules importing it. */
  glyphs: Record<string, string[]>
}

/**
 * Bare/relative specifiers in an ES module — the three forms a dist tree emits.
 *
 * Regexes rather than a parser on purpose: the input is Rollup output with
 * `preserveModules`, whose import forms are a small, known set. A parser would
 * be more correct on source and no more correct here, at the cost of making a
 * report depend on the TypeScript program.
 *
 * Three anchored patterns rather than one alternation with a lazy wildcard: a
 * `[\s\S]*?` before `\sfrom` is super-linear on a long minified line, which is
 * exactly the input shape this reads.
 */
const SPECIFIER_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']/g,
  /(?:^|[;\s])import\s*["']([^"']+)["']/g,
]

/** `import { A, B as C } from 'lucide-vue-next'` → the imported identifiers. */
const LUCIDE_RE = /import\s*\{([^}]*)\}\s*from\s*["']lucide-vue-next["']/g

const ROOT = resolve(import.meta.dirname, '..', '..', '..')

/** A repo-relative path with forward slashes on every platform. */
function rel(file: string): string {
  return relative(ROOT, file).split(sep).join('/')
}

/** The package a bare specifier belongs to (`@scope/name` or `name`). */
export function packageOf(specifier: string): string {
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : (specifier.split('/')[0] ?? specifier)
}

/**
 * Resolve a relative specifier the way a bundler does.
 *
 * Extensionless and directory forms are both tried, because a dist tree
 * contains both and a report that silently dropped one would understate
 * reachability — which is the exact direction of error that makes a peer look
 * more optional than it is.
 */
export function resolveRelative(from: string, specifier: string): string | null {
  const base = resolve(dirname(from), specifier)
  for (const candidate of [base, `${base}.js`, `${base}/index.js`]) {
    if (existsSync(candidate) && statSync(candidate).isFile())
      return candidate
  }
  return null
}

/** Walk the static import graph from `entry` and record what it reaches. */
export function walkFrom(entry: string): { modules: Set<string>, externals: Map<string, Set<string>> } {
  const modules = new Set<string>()
  const externals = new Map<string, Set<string>>()
  const stack = [entry]

  while (stack.length > 0) {
    const file = stack.pop()
    if (file === undefined || modules.has(file))
      continue
    modules.add(file)

    let source: string
    try {
      source = readFileSync(file, 'utf8')
    }
    catch {
      continue
    }

    for (const pattern of SPECIFIER_PATTERNS) {
      pattern.lastIndex = 0
      let match = pattern.exec(source)
      while (match !== null) {
        const specifier = match[1]
        if (specifier !== undefined) {
          if (specifier.startsWith('.') || specifier.startsWith('/')) {
            const resolved = resolveRelative(file, specifier)
            if (resolved !== null)
              stack.push(resolved)
          }
          else if (!specifier.startsWith('node:') && !specifier.startsWith('data:')) {
            const pkg = packageOf(specifier)
            const importers = externals.get(pkg) ?? new Set<string>()
            importers.add(rel(file))
            externals.set(pkg, importers)
          }
        }
        match = pattern.exec(source)
      }
    }
  }

  return { externals, modules }
}

/**
 * The `import` target of every subpath in a package's `exports` map.
 *
 * Only `.js` targets: `./styles` points at a stylesheet, which has no import
 * graph and is not a question this report answers.
 */
export function entryTargets(packageDir: string): { subpath: string, file: string }[] {
  const manifest = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as {
    exports?: Record<string, string | { import?: string }>
  }
  const targets: { subpath: string, file: string }[] = []

  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    const target = typeof value === 'string' ? value : value.import
    if (target === undefined || !target.endsWith('.js'))
      continue
    const file = resolve(packageDir, target)
    if (existsSync(file))
      targets.push({ file, subpath })
  }

  return targets
}

/** Every entry point's reachable externals, sorted for a stable report. */
export function collectEntrySurfaces(packageDir: string): EntrySurface[] {
  return entryTargets(packageDir).map(({ file, subpath }) => {
    const { externals, modules } = walkFrom(file)
    const sorted: Record<string, string[]> = {}
    for (const key of [...externals.keys()].sort())
      sorted[key] = [...(externals.get(key) ?? [])].sort()

    return { externals: sorted, file: rel(file), modules: modules.size, subpath }
  })
}

/** The glyph inventory of every module reachable from a package's root entry. */
export function collectIconSurface(files: Iterable<string>): IconSurface {
  const glyphs = new Map<string, Set<string>>()
  const importing = new Set<string>()

  for (const file of files) {
    let source: string
    try {
      source = readFileSync(file, 'utf8')
    }
    catch {
      continue
    }

    LUCIDE_RE.lastIndex = 0
    let match = LUCIDE_RE.exec(source)
    while (match !== null) {
      importing.add(rel(file))
      const names = (match[1] ?? '')
        .split(',')
        .map(part => (part.trim().split(/\s+as\s+/)[0] ?? '').trim())
        .filter(name => name.length > 0)
      for (const name of names) {
        const importers = glyphs.get(name) ?? new Set<string>()
        importers.add(rel(file))
        glyphs.set(name, importers)
      }
      match = LUCIDE_RE.exec(source)
    }
  }

  const sortedGlyphs: Record<string, string[]> = {}
  for (const key of [...glyphs.keys()].sort())
    sortedGlyphs[key] = [...(glyphs.get(key) ?? [])].sort()

  return { files: [...importing].sort(), glyphs: sortedGlyphs }
}

function main(): void {
  const packageDir = resolve(ROOT, 'packages', 'core')
  const distDir = resolve(packageDir, 'dist')

  if (!existsSync(distDir)) {
    console.warn('· packages/core has no dist/. Run `yarn workspace @dzup-ui/core build` first.')
    console.warn('  This report reads the published artifact on purpose; it does not fall back to src/.')
    return
  }

  const surfaces = collectEntrySurfaces(packageDir)
  const root = surfaces.find(entry => entry.subpath === '.')
  const icons = collectIconSurface(root === undefined ? [] : walkFrom(resolve(packageDir, 'dist', 'index.js')).modules)

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ icons, surfaces }, null, 2))
    return
  }

  console.log('\n@dzup-ui/core — externals reachable per published entry point\n')
  for (const entry of surfaces) {
    const names = Object.keys(entry.externals)
    console.log(`  ${entry.subpath.padEnd(14)} ${String(entry.modules).padStart(4)} modules  ${names.join(', ')}`)
  }

  console.log('\n  Reachability of the peer and the icon dependency, per entry:\n')
  for (const dep of ['reka-ui', 'lucide-vue-next']) {
    console.log(`  ${dep}`)
    for (const entry of surfaces) {
      const importers = entry.externals[dep]
      const verdict = importers === undefined ? '—' : `${importers.length} importer(s), e.g. ${importers[0]}`
      console.log(`    ${entry.subpath.padEnd(14)} ${verdict}`)
    }
  }

  const glyphNames = Object.keys(icons.glyphs)
  console.log(`\n  lucide-vue-next: ${icons.files.length} module(s), ${glyphNames.length} distinct glyph(s)\n`)
  for (const glyph of glyphNames.sort((a, b) => (icons.glyphs[b]?.length ?? 0) - (icons.glyphs[a]?.length ?? 0) || a.localeCompare(b)))
    console.log(`    ${glyph.padEnd(20)} ${icons.glyphs[glyph]?.length ?? 0}`)

  console.log('\n· Report only — no baseline, no ratchet, exit 0. See docs/program-2026-09/reports/peer-hygiene-2026-09.md.\n')
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename))
  main()
