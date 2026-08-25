/**
 * The one definition of how `@dzup-ui/*` specifiers resolve, for any consumer,
 * in either mode (TASK-SK-1).
 *
 * ── Why this replaces `workspaceAliases` ────────────────────────────────────
 * `workspaceAliases(repoRoot)` (TASK-FREE-12) already fixed one drift: five
 * configs had hand-copied the same alias list and two of the copies had lost
 * `@dzup-ui/core/styles`. It fixed it by writing the list down **once, by
 * hand** — which leaves two problems it could not solve:
 *
 *   1. **The list is still handwritten**, so it can disagree with the thing it
 *      is describing. It did: it carried ten entries while the packages declare
 *      twenty-nine subpaths between them, and `@dzup-ui/core/providers` —
 *      imported by the landing app, the sandbox and Core's own source —
 *      resolved only by accident, through the bare `@dzup-ui/core` alias
 *      pointing at a directory. Nothing declared it; nothing would have noticed
 *      if the directory layout moved.
 *   2. **It has no mode.** Every caller gets source. That is right for the
 *      three in-repo consumers and wrong for `workspace-share/apps/website-app`,
 *      which reaches the same logic through a *third* hand-copied version
 *      (`@datazup/dzup-theme`'s `dzupAliases`) and therefore compiles the
 *      library from source, in another repository, without anyone having
 *      decided that.
 *
 * So the alias map is now **derived from each package's `exports` map**, the
 * same authority `validate:exports` and the ownership manifest use, and the
 * mode is a required argument. A new subpath export appears in every
 * consumer's resolution the moment it is declared; a subpath that is not
 * declared does not resolve, in development or in production.
 *
 * ── The mapping rule, in one sentence ───────────────────────────────────────
 * `externalized` resolves an `exports` target as written; `merged-source`
 * rewrites `dist/x.js` to `src/x.ts` and **checks the file exists**, falling
 * back to the built artifact when there is no source equivalent (generated CSS,
 * the generated Tailwind theme) and consulting a small table of declared
 * exceptions when the source exists somewhere the rule cannot derive.
 *
 * Ordering is load-bearing throughout — see `DzupResolution.alias`.
 *
 * @module @dzup-ui/tooling/resolution
 */

import type {
  DzupPackageName,
  DzupResolution,
  DzupResolutionEntry,
  DzupResolutionMode,
  DzupResolutionOptions,
} from './dzup-resolution.types.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** The repo root, for callers inside this repository. */
const DEFAULT_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..')

/**
 * Packages that must resolve to exactly one copy in every mode.
 *
 * Read from `@dzup-ui/core`'s `peerDependencies` rather than named here: a peer
 * is precisely "the host supplies this, and there must be one of it".
 */
function corePeers(root: string): string[] {
  const path = join(root, 'packages/core/package.json')
  if (!existsSync(path))
    return []
  const pkg = JSON.parse(readFileSync(path, 'utf8')) as { peerDependencies?: Record<string, string> }
  return Object.keys(pkg.peerDependencies ?? {}).sort()
}

/**
 * Source locations the mechanical rule cannot derive.
 *
 * Deliberately tiny, and each row carries the reason it exists. The spec
 * asserts that **no row here could have been derived** — the moment a source
 * file moves to where the rule would look, its exception has to go, so this
 * table cannot quietly grow back into the handwritten list it replaced.
 */
const SOURCE_OVERRIDES: Record<string, { source: string, reason: string }> = {
  '@dzup-ui/core ./styles': {
    source: 'src/styles/base.css',
    reason:
      '`dist/core.css` is Tailwind\'s output for `src/styles/base.css`; there is no '
      + '`src/core.css` for the rule to find, and the base stylesheet is the file an '
      + 'in-repo consumer wants to see edits in.',
  },
}

interface DiscoveredPackage {
  readonly name: DzupPackageName
  readonly dir: string
  readonly isPrivate: boolean
  readonly exports: Record<string, unknown>
}

/**
 * Every workspace package, read from disk.
 *
 * Sorted by name so the result is deterministic regardless of directory-listing
 * order — a snapshot test is worth nothing if the map reshuffles per machine.
 */
export function discoverDzupPackages(root: string): DiscoveredPackage[] {
  const packagesDir = join(root, 'packages')
  if (!existsSync(packagesDir)) {
    throw new Error(
      `createDzupResolution: no \`packages/\` directory under ${root}. `
      + 'Pass `root` as the absolute path to the dzup-ui monorepo root '
      + '(the directory that holds `packages/`).',
    )
  }

  const found: DiscoveredPackage[] = []
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    const dir = join(packagesDir, entry.name)
    const manifest = join(dir, 'package.json')
    if (!existsSync(manifest))
      continue

    const pkg = JSON.parse(readFileSync(manifest, 'utf8')) as {
      name?: string
      private?: boolean
      exports?: Record<string, unknown>
    }
    if (pkg.name === undefined || !pkg.name.startsWith('@dzup-ui/'))
      continue
    if (pkg.exports === undefined) {
      throw new Error(
        `createDzupResolution: ${pkg.name} declares no \`exports\` map, so there is `
        + 'nothing to derive its resolution from. Add one, or make the package private '
        + 'and give it no exports at all.',
      )
    }

    found.push({
      name: pkg.name as DzupPackageName,
      dir,
      isPrivate: pkg.private === true,
      exports: pkg.exports,
    })
  }

  return found.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

/**
 * The file an `exports` entry points at.
 *
 * Conditional exports are objects; a stylesheet is a bare string. `import` is
 * the condition a bundler takes, and `types` is the fallback for a
 * types-only entry.
 */
function exportTarget(value: unknown): string | undefined {
  if (typeof value === 'string')
    return value
  if (value === null || typeof value !== 'object')
    return undefined
  const conditions = value as Record<string, unknown>
  for (const key of ['import', 'default', 'types'] as const) {
    const candidate = conditions[key]
    if (typeof candidate === 'string')
      return candidate
  }
  return undefined
}

/** `./dist/providers/index.js` → `src/providers/index.ts`, and friends. */
function mechanicalSourceCandidates(target: string): string[] {
  const relative = target.replace(/^\.\//, '')
  if (!relative.startsWith('dist/'))
    return [relative]

  const withoutDist = relative.slice('dist/'.length)
  return [
    `src/${withoutDist.replace(/\.d\.ts$/, '.ts').replace(/\.js$/, '.ts')}`,
    `src/${withoutDist}`,
  ]
}

/**
 * The specifier an `exports` subpath is reached by: `.` is the package itself,
 * `./providers` is `@dzup-ui/core/providers`.
 */
function specifierFor(name: string, subpath: string): string {
  return subpath === '.' ? name : `${name}/${subpath.replace(/^\.\//, '')}`
}

/**
 * Longest specifier first.
 *
 * This is the entire reason `alias` is an ordered array. Vite matches a string
 * `find` by prefix in declaration order, so `@dzup-ui/tokens` placed before
 * `@dzup-ui/tokens/css` swallows the stylesheet and resolves it to a directory
 * that does not exist. Sorting by descending length makes the ordering a
 * property of the data rather than something each caller has to remember.
 */
function byMostSpecificFirst(a: DzupResolutionEntry, b: DzupResolutionEntry): number {
  if (a.find.length !== b.find.length)
    return b.find.length - a.find.length
  return a.find < b.find ? -1 : a.find > b.find ? 1 : 0
}

function entriesFor(
  pkg: DiscoveredPackage,
  mode: DzupResolutionMode,
): DzupResolutionEntry[] {
  const entries: DzupResolutionEntry[] = []

  for (const [subpath, value] of Object.entries(pkg.exports)) {
    const target = exportTarget(value)
    if (target === undefined)
      continue

    const find = specifierFor(pkg.name, subpath)

    if (mode === 'externalized') {
      const relative = target.replace(/^\.\//, '')
      if (relative.startsWith('src/')) {
        throw new Error(
          `createDzupResolution({ mode: 'externalized' }): ${find} resolves to `
          + `\`${target}\`, which is source. ${pkg.name} is `
          + `${pkg.isPrivate ? 'private and ships no build' : 'not built to dist/'}, so it `
          + 'cannot be externalized. Pass `packages` without it, or use '
          + '`mode: \'merged-source\'`.',
        )
      }
      entries.push({
        package: pkg.name,
        subpath,
        find,
        replacement: join(pkg.dir, relative),
        origin: 'exports',
      })
      continue
    }

    const override = SOURCE_OVERRIDES[`${pkg.name} ${subpath}`]
    if (override !== undefined) {
      entries.push({
        package: pkg.name,
        subpath,
        find,
        replacement: join(pkg.dir, override.source),
        origin: 'override',
        reason: override.reason,
      })
      continue
    }

    const candidate = mechanicalSourceCandidates(target).find(relative =>
      existsSync(join(pkg.dir, relative)),
    )

    if (candidate !== undefined) {
      entries.push({
        package: pkg.name,
        subpath,
        find,
        replacement: join(pkg.dir, candidate),
        origin: 'exports',
      })
      continue
    }

    // No source equivalent: the target is generated. `tokens.css` and
    // `tailwind-theme.js` are written by `yarn tokens:generate` and committed
    // (ADR-12), so this resolves without a build — but it does mean a token
    // change needs the generator before a consumer sees it.
    const built = target.replace(/^\.\//, '')
    if (!existsSync(join(pkg.dir, built))) {
      throw new Error(
        `createDzupResolution: ${find} points at \`${target}\`, and neither a source `
        + 'equivalent nor the built artifact exists. Run the package\'s build (or '
        + '`yarn tokens:generate` for generated assets) before resolving, or fix the '
        + '`exports` map.',
      )
    }

    entries.push({
      package: pkg.name,
      subpath,
      find,
      replacement: join(pkg.dir, built),
      origin: 'generated-artifact',
      reason:
        `\`${target}\` is generated (\`yarn tokens:generate\`) and committed; there is `
        + 'no source file to resolve to in either mode.',
    })
  }

  return entries
}

/**
 * Build the resolution for a set of `@dzup-ui/*` packages in an explicit mode.
 *
 * @example Vite, in-repo
 * ```ts
 * const dzup = createDzupResolution({ mode: 'merged-source' })
 * export default defineConfig({
 *   resolve: { alias: dzup.alias, dedupe: dzup.dedupe },
 *   optimizeDeps: dzup.optimizeDeps,
 * })
 * ```
 *
 * @example An app outside this repository
 * ```ts
 * const dzup = createDzupResolution({
 *   mode: 'externalized',
 *   root: resolve(import.meta.dirname, '../../../../ui/dzup-ui'),
 *   packages: ['@dzup-ui/core', '@dzup-ui/tokens', '@dzup-ui/contracts'],
 * })
 * ```
 *
 * @throws when `mode` is missing or unknown, when `root` holds no `packages/`,
 * when a requested package does not exist, or when `externalized` is asked for
 * a package that ships no build.
 */
export function createDzupResolution(options: DzupResolutionOptions): DzupResolution {
  const { mode, root = DEFAULT_ROOT, packages } = options ?? ({} as DzupResolutionOptions)

  if (mode !== 'merged-source' && mode !== 'externalized') {
    throw new Error(
      'createDzupResolution requires an explicit `mode`: \'merged-source\' to resolve '
      + '@dzup-ui/* to workspace source, or \'externalized\' to resolve to built output. '
      + 'There is no default on purpose — every consumer states which build of the '
      + `library it is using. Received: ${JSON.stringify(mode)}.`,
    )
  }

  const discovered = discoverDzupPackages(root)
  const known = new Set(discovered.map(pkg => pkg.name))

  let selected = discovered
  if (packages === undefined) {
    // A private package has no published form, so there is nothing to
    // externalize — dropping it from the default set is a definition, not a
    // silent exclusion. Naming one explicitly still throws, in `entriesFor`,
    // because then the caller has asked for something that cannot exist.
    if (mode === 'externalized')
      selected = discovered.filter(pkg => !pkg.isPrivate)
  }
  else {
    const unknown = packages.filter(name => !known.has(name))
    if (unknown.length > 0) {
      throw new Error(
        `createDzupResolution: unknown package${unknown.length === 1 ? '' : 's'} `
        + `${unknown.map(n => `\`${n}\``).join(', ')}. Found under ${root}: `
        + `${[...known].join(', ')}.`,
      )
    }
    const wanted = new Set(packages)
    selected = discovered.filter(pkg => wanted.has(pkg.name))
  }

  const alias = selected.flatMap(pkg => entriesFor(pkg, mode)).sort(byMostSpecificFirst)
  const names = selected.map(pkg => pkg.name)
  const dedupe = [...corePeers(root), ...(mode === 'merged-source' ? names : [])].sort()

  return {
    mode,
    alias,
    dedupe,
    optimizeDeps: { exclude: mode === 'merged-source' ? [...names].sort() : [] },
  }
}

/**
 * The `alias` array as plain `{ find, replacement }` pairs.
 *
 * `DzupResolutionEntry` carries `package`, `subpath` and `origin` so a consumer
 * can explain a resolution; Vite ignores the extra fields, but a config that
 * snapshots or serialises its alias list is tidier without them.
 */
export function toViteAliases(
  resolution: DzupResolution,
): { find: string, replacement: string }[] {
  return resolution.alias.map(({ find, replacement }) => ({ find, replacement }))
}
