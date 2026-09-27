/**
 * Packing the published packages — the one definition (TASK-R1-O3).
 *
 * `validate:published-imports` (TASK-R1-O2) already packs all six published
 * packages, extracts them into a scratch consumer and imports every `exports`
 * subpath under Node. The release tools need the **same** tarballs: an API diff
 * taken from a different build than the SBOM hashes would describe two
 * artifacts and call them one, which is doc 08's "tarball differs from the
 * reviewed build" stop condition produced by our own tooling.
 *
 * So the packing half of that validator lives here and both call it. Nothing
 * about the behaviour changed in the move; the comments explaining *why*
 * `yarn pack` and *why* relative `tar` paths are kept verbatim, because both
 * were learned the hard way.
 *
 * @module @dzup-ui/tooling/release/pack
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { ROOT } from './binding.ts'

export interface WorkspacePackage {
  name: string
  packageDir: string
}

interface ReleasePolicy {
  published: string[]
  withheld: Array<{ name: string, reason: string }>
  private: string[]
}

/** `packages/tooling/scripts/release-policy.json`, parsed. */
export function releasePolicy(): ReleasePolicy {
  return JSON.parse(
    readFileSync(resolve(ROOT, 'packages/tooling/scripts/release-policy.json'), 'utf8'),
  ) as ReleasePolicy
}

/**
 * The `published` list is the inventory; withheld/private packages are
 * reported, not gated.
 *
 * Driven by `release-policy.json` rather than a hand-kept list, so a package
 * that becomes publishable enters every release tool at once.
 */
export function publishedPackages(): WorkspacePackage[] {
  const policy = releasePolicy()

  const byName = new Map<string, string>()
  const packagesRoot = resolve(ROOT, 'packages')
  for (const dir of readdirSync(packagesRoot)) {
    const pkgJsonPath = resolve(packagesRoot, dir, 'package.json')
    if (!existsSync(pkgJsonPath))
      continue
    const { name } = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as { name?: string }
    if (name !== undefined)
      byName.set(name, resolve(packagesRoot, dir))
  }

  return policy.published.map((name) => {
    const packageDir = byName.get(name)
    if (packageDir === undefined)
      throw new Error(`release-policy.json lists ${name} as published, but no packages/*/package.json declares that name`)
    return { name, packageDir }
  })
}

/** The file name a package's tarball is written under, inside a scratch dir. */
export function tarballName(name: string): string {
  return `${name.replace('@', '').replace('/', '-')}.tgz`
}

/**
 * `yarn pack`, never `npm pack`.
 *
 * Both repositories are yarn-4 workspaces whose packages declare siblings as
 * `workspace:*`. `yarn pack` resolves that protocol to the real version — what
 * the registry would receive. `npm pack` copies the literal string, and the
 * tarball dies with `EUNSUPPORTEDPROTOCOL` the moment anyone installs it. A
 * gate built on `npm pack` would be testing an artifact nobody can consume
 * (measured in the TASK-R1-O2 handoff §1, and the reason CI's own pack smoke
 * test has never been able to fail — D151).
 */
export function packWorkspace(name: string, outDir: string): string {
  const out = join(outDir, tarballName(name))
  execSync(`yarn workspace ${name} pack --out "${out}"`, { cwd: ROOT, stdio: 'pipe' })
  return out
}

/**
 * Extract `<tgz>` (npm layout: everything under `package/`) to `<dest>`.
 *
 * Every path is passed **relative to `cwd`**, never absolute. GNU tar — which
 * is what `tar` resolves to under Git Bash on Windows — reads `C:\…` as a
 * remote host spec and fails with `Cannot connect to C: resolve failed`, while
 * `System32\tar.exe` (bsdtar) handles it fine. A relative invocation is correct
 * for both, and for every Linux/macOS runner.
 */
export function extractTarball(tgz: string, dest: string): void {
  const staging = `${dest}.unpack`
  rmSync(staging, { recursive: true, force: true })
  mkdirSync(staging, { recursive: true })

  const from = dirname(tgz)
  const rel = (p: string): string => relative(from, p).replaceAll('\\', '/')
  execSync(`tar -xzf "${tgz.slice(from.length + 1)}" -C "${rel(staging)}"`, { cwd: from, stdio: 'pipe' })

  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dirname(dest), { recursive: true })
  renameSync(join(staging, 'package'), dest)
  rmSync(staging, { recursive: true, force: true })
}

/** A scratch directory under the OS temp dir, never inside the repository. */
export function scratchDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

export interface PackedPackage {
  name: string
  /** Absolute path of the `.tgz`. */
  tarball: string
  /** Absolute path of the extracted `package/` directory. */
  root: string
  /** The packed `package.json`, as shipped. */
  manifest: Record<string, unknown>
  version: string
}

/**
 * Pack every published package and extract each into `<stage>/node_modules/`.
 *
 * The layout is a consumer's: `@dzup-ui/core`'s own `dist` resolves its sibling
 * `@dzup-ui/contracts` to the **packed** copy, not to the workspace symlink, so
 * a surface read from here is the surface a consumer gets. A junction one level
 * up to this repository's `node_modules` lets third-party peers (`vue`,
 * `reka-ui`, `tailwind-variants`) resolve without a network install — the same
 * boundary `validate:published-imports` states: an *undeclared* runtime
 * dependency would still resolve here, and `validate:externals` owns that.
 */
export function packAll(stage: string, packages: WorkspacePackage[] = publishedPackages()): PackedPackage[] {
  const tarballDir = join(stage, 'tarballs')
  mkdirSync(tarballDir, { recursive: true })
  const nodeModules = join(stage, 'consumer', 'node_modules')
  mkdirSync(nodeModules, { recursive: true })

  /*
   * The junction is not optional, and leaving it out fails SILENTLY.
   *
   * Without it `vue` does not resolve from an extracted `@dzup-ui/core`, so
   * every `DefineComponent` in the packed declarations collapses to `any` —
   * and because `skipLibCheck: true` suppresses diagnostics in `.d.ts` files,
   * which is all a packed surface contains, TypeScript reports no error at
   * all. The surface comes back the right size with every signature `any`,
   * and a diff against it would be uniformly, confidently empty. Measured on
   * the first run of this tool: `DzButton` recorded `"signature": "any"`.
   * `readSurface` now counts `any` signatures for exactly this reason.
   *
   * 'junction' is the only symlink type Windows grants without elevation; on
   * POSIX the type argument is ignored and a directory symlink is made.
   */
  const fallback = join(stage, 'node_modules')
  if (!existsSync(fallback))
    symlinkSync(resolve(ROOT, 'node_modules'), fallback, 'junction')

  const packed: PackedPackage[] = []
  for (const pkg of packages) {
    const tarball = packWorkspace(pkg.name, tarballDir)
    const root = join(nodeModules, ...pkg.name.split('/'))
    extractTarball(tarball, root)
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, unknown>
    packed.push({
      name: pkg.name,
      tarball,
      root,
      manifest,
      version: String(manifest.version ?? 'unknown'),
    })
  }
  return packed
}

/** Remove a scratch stage, tolerating a Windows handle that has not closed yet. */
export function cleanStage(stage: string): void {
  rmSync(stage, { recursive: true, force: true, maxRetries: 3 })
}
