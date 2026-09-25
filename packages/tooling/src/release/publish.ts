/**
 * Publishing the published packages — `yarn release:publish` (DZUP-UI-PUBLISH-PATH-20260925-R1).
 *
 * `changeset publish` was the publish step, and it is wrong for this
 * repository in two ways, both read from `@changesets/cli` 2.30.0 itself:
 *
 * 1. **It publishes with `npm publish <dir>`** for every package manager except
 *    pnpm (`getPublishTool`). npm copies `workspace:*` verbatim, so
 *    `@dzup-ui/core` would reach the registry depending on
 *    `"@dzup-ui/contracts": "workspace:*"` and every consumer install would die
 *    with `EUNSUPPORTEDPROTOCOL`. `yarn npm publish` packs through the same
 *    pipeline as `yarn pack`, which rewrites the protocol to a real range —
 *    the tarballs the release bundle already hashes and import-checks.
 * 2. **It publishes every non-`private` package the registry lacks** and never
 *    reads the changesets `ignore` array (`publishPackages` filters on
 *    `private` only). `@dzup-ui/compat` and `@dzup-ui/codemods` are public,
 *    ignored, and withheld by owner decision N5-01-D2 — `changeset publish`
 *    would have shipped both as `latest`.
 *
 * So this publishes exactly `release-policy.json`'s `published` list — the
 * inventory every other release tool already reads through
 * `publishedPackages()` — in dependency order, one `yarn npm publish` each.
 * `--tolerate-republish` makes a re-run after a partial failure skip what
 * already landed; it is also what makes the step a no-op on every push to
 * `main` that carries no version change.
 *
 * Git tags are not this tool's job: the root `release` script runs
 * `changeset tag` afterwards, whose `New tag:` lines are what
 * `changesets/action` parses to push tags and create GitHub releases.
 *
 * Usage:
 *   yarn release:publish --dry-run            # packs and reports; uploads nothing
 *   yarn release:publish --provenance         # CI only (GitHub Actions OIDC)
 *   yarn release:publish --tag alpha          # a non-`latest` dist-tag
 *
 * @module @dzup-ui/tooling/release/publish
 */

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './binding.ts'
import { publishedPackages } from './pack.ts'

export interface PublishCandidate {
  name: string
  manifest: {
    private?: boolean
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
    optionalDependencies?: Record<string, string>
  }
}

export interface PublishArgs {
  dryRun: boolean
  provenance: boolean
  tag: string | null
}

/**
 * Dependency order over the candidates: a package comes after every candidate
 * it depends on (runtime, peer or optional). Dev dependencies do not count —
 * they never reach a consumer. Ties keep the input (policy) order, so the
 * result is deterministic.
 */
export function publishOrder(candidates: PublishCandidate[]): string[] {
  const names = new Set(candidates.map(c => c.name))
  const deps = new Map(candidates.map((c) => {
    const declared = { ...c.manifest.dependencies, ...c.manifest.peerDependencies, ...c.manifest.optionalDependencies }
    return [c.name, Object.keys(declared).filter(d => names.has(d) && d !== c.name)]
  }))

  const order: string[] = []
  const placed = new Set<string>()
  while (order.length < candidates.length) {
    const next = candidates.find(c => !placed.has(c.name) && deps.get(c.name)!.every(d => placed.has(d)))
    if (next === undefined) {
      const stuck = candidates.filter(c => !placed.has(c.name)).map(c => c.name)
      throw new Error(`release:publish: dependency cycle among ${stuck.join(', ')}`)
    }
    order.push(next.name)
    placed.add(next.name)
  }
  return order
}

/** A `published` package marked `private` is a policy contradiction; refuse before uploading anything. */
export function assertPublishable(candidates: PublishCandidate[]): void {
  const privateOnes = candidates.filter(c => c.manifest.private === true).map(c => c.name)
  if (privateOnes.length > 0)
    throw new Error(`release:publish: release-policy.json lists ${privateOnes.join(', ')} as published, but package.json says private: true`)
}

/** The `yarn` argv that publishes one package. */
export function publishCommand(name: string, args: PublishArgs): string[] {
  const argv = ['workspace', name, 'npm', 'publish', '--access', 'public', '--tolerate-republish']
  if (args.tag !== null)
    argv.push('--tag', args.tag)
  if (args.dryRun)
    argv.push('--dry-run')
  // Provenance is minted from the CI identity; a dry run uploads nothing to attest.
  else if (args.provenance)
    argv.push('--provenance')
  return argv
}

export function parseArgs(argv: string[]): PublishArgs {
  const args: PublishArgs = { dryRun: false, provenance: false, tag: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry-run')
      args.dryRun = true
    else if (arg === '--provenance')
      args.provenance = true
    else if (arg === '--tag' && argv[i + 1] !== undefined && !argv[i + 1]!.startsWith('--'))
      args.tag = argv[++i]!
    else
      throw new Error(`release:publish: unknown or incomplete argument ${arg}`)
  }
  return args
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const candidates: PublishCandidate[] = publishedPackages().map(({ name, packageDir }) => ({
    name,
    manifest: JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8')) as PublishCandidate['manifest'],
  }))
  assertPublishable(candidates)
  const order = publishOrder(candidates)

  console.log(`release:publish${args.dryRun ? ' (dry run)' : ''}: ${order.join(' → ')}`)
  for (const name of order) {
    const argv = publishCommand(name, args)
    console.log(`\n$ yarn ${argv.join(' ')}`)
    const result = spawnSync('yarn', argv, { cwd: ROOT, stdio: 'inherit' })
    if (result.status !== 0) {
      console.error(`release:publish: ${name} failed (exit ${result.status ?? result.signal}); stopping. Packages before it are published; re-running skips them.`)
      process.exit(result.status ?? 1)
    }
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && /publish\.(?:ts|js|mjs)$/.test(process.argv[1].replaceAll('\\', '/'))
if (invokedDirectly)
  main()
