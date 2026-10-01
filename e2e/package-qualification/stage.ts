import type { PackedPackage, WorkspacePackage } from '../../packages/tooling/src/release/pack.ts'
/**
 * Consumer stages for the package-qualification matrix (TASK-S2-O1).
 *
 * Every row in 08-11 doc 08's package-qualification matrix must run **against
 * packed artifacts in a temporary consumer workspace, never only workspace
 * links**. This module is the one place that builds such a workspace, so no row
 * can accidentally prove something about a symlink.
 *
 * Two shapes are offered:
 *
 * - {@link fullStage} — every published package packed and extracted, with a
 *   junction to the repository's `node_modules` so third-party peers resolve.
 *   This is `packAll` from `@dzup-ui/tooling`, reused rather than reimplemented.
 * - {@link controlledStage} — the same packed packages, but with **no** blanket
 *   junction. Each third-party peer is linked in explicitly, or deliberately
 *   left out, or shadowed by a stub at a chosen version. The optional-peer row
 *   cannot be written without this: "absent" is unprovable in a workspace where
 *   a junction makes everything present.
 *
 * @module e2e/package-qualification/stage
 */
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../../packages/tooling/src/release/binding.ts'
import { cleanStage, extractTarball, packAll, packWorkspace, publishedPackages, scratchDir } from '../../packages/tooling/src/release/pack.ts'

export { cleanStage, type PackedPackage, publishedPackages, type WorkspacePackage }

/** Third-party peers a dzup consumer normally has. */
export const THIRD_PARTY_PEERS = [
  'vue',
  'reka-ui',
  '@floating-ui/vue',
  '@internationalized/date',
  'lucide-vue-next',
  'tailwind-variants',
] as const

export interface Stage {
  /** Absolute path of the scratch stage root. */
  dir: string
  /** `<dir>/consumer` — the directory a consumer build runs from. */
  consumer: string
  /** `<dir>/consumer/node_modules`. */
  nodeModules: string
  packed: PackedPackage[]
  /** Remove the whole stage. */
  dispose: () => void
}

/**
 * Every published package, packed and extracted, peers resolvable by junction.
 *
 * The junction's boundary is stated by `validate:published-imports` and is not
 * re-argued here: an *undeclared* runtime dependency would still resolve in
 * this stage, and `validate:externals` is the gate that owns that question.
 */
export function fullStage(prefix = 'dzup-qualify-'): Stage {
  const dir = scratchDir(prefix)
  const packed = packAll(dir)
  return {
    dir,
    consumer: join(dir, 'consumer'),
    nodeModules: join(dir, 'consumer', 'node_modules'),
    packed,
    dispose: () => cleanStage(dir),
  }
}

export interface ControlledPeer {
  name: string
  /**
   * - `link` — symlink the real installed copy (the "installed" lane).
   * - `absent` — do not provide it at all (the "absent" lane).
   * - `stub` — write a package.json-only stub at {@link ControlledPeer.version}
   *   (the "incompatible version" lane). A stub resolves for *manifest* checks
   *   and for `require.resolve` of its `package.json`, which is what a peer
   *   range check reads; it deliberately does not execute.
   */
  mode: 'link' | 'absent' | 'stub'
  version?: string
}

/**
 * A consumer workspace whose third-party peers are exactly what the caller says.
 *
 * Packages are packed with `yarn pack` and extracted, identically to
 * {@link fullStage}; only peer provisioning differs. There is **no** junction to
 * the repository's `node_modules`, so a peer that is not listed is genuinely
 * unresolvable — which is the entire point of the "optional peer absent" lane.
 */
export function controlledStage(
  peers: ControlledPeer[],
  packages: WorkspacePackage[] = publishedPackages(),
  prefix = 'dzup-qualify-peer-',
): Stage {
  const dir = scratchDir(prefix)
  const consumer = join(dir, 'consumer')
  const nodeModules = join(consumer, 'node_modules')
  mkdirSync(nodeModules, { recursive: true })

  const tarballDir = join(dir, 'tarballs')
  mkdirSync(tarballDir, { recursive: true })

  const packed: PackedPackage[] = []
  for (const pkg of packages) {
    // packWorkspace/extractTarball are reused rather than reimplemented. Both
    // carry Windows-specific corrections earned the hard way (GNU tar reads an
    // absolute `C:\…` as a remote host spec), and a second copy here would be a
    // second thing to get wrong — which it was, on this lane's first run.
    const tarball = packWorkspace(pkg.name, tarballDir)
    const root = join(nodeModules, ...pkg.name.split('/'))
    mkdirSync(join(root, '..'), { recursive: true })
    extractTarball(tarball, root)
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, unknown>
    packed.push({ name: pkg.name, tarball, root, manifest, version: String(manifest.version ?? 'unknown') })
  }

  /*
   * Runtime `dependencies` are provisioned automatically; only PEERS are
   * controlled.
   *
   * A real `npm install` of these tarballs installs their declared
   * dependencies — `clsx`, `tailwind-merge`, `qrcode-generator` and the rest —
   * and leaves only the peers to the consumer. Linking just the named peers
   * produced a stage where `@dzup-ui/core` could not find `clsx`, and every
   * lane failed identically for a reason that had nothing to do with the
   * optional engine. A lane that fails for the wrong reason is worse than one
   * that does not run, because it looks like a finding.
   */
  const controlled = new Set(peers.map(p => p.name))
  const packedNames = new Set(packed.map(p => p.name))
  for (const pkg of packed) {
    const deps = Object.keys((pkg.manifest.dependencies ?? {}) as Record<string, string>)
    for (const dep of deps) {
      if (controlled.has(dep) || packedNames.has(dep))
        continue
      const dest = join(nodeModules, ...dep.split('/'))
      if (existsSync(dest))
        continue
      const real = join(ROOT, 'node_modules', ...dep.split('/'))
      if (!existsSync(real))
        continue
      mkdirSync(join(dest, '..'), { recursive: true })
      symlinkSync(real, dest, 'junction')
    }
  }

  for (const peer of peers) {
    const dest = join(nodeModules, ...peer.name.split('/'))
    if (peer.mode === 'absent') {
      rmSync(dest, { recursive: true, force: true })
      continue
    }
    if (peer.mode === 'link') {
      const real = join(ROOT, 'node_modules', ...peer.name.split('/'))
      if (!existsSync(real))
        throw new Error(`controlledStage: ${peer.name} is not installed in this repository, so it cannot be linked`)
      mkdirSync(join(dest, '..'), { recursive: true })
      // 'junction' is the only link type Windows grants without elevation; on
      // POSIX the type argument is ignored and a directory symlink is made.
      symlinkSync(real, dest, 'junction')
      continue
    }
    if (peer.version === undefined)
      throw new Error(`controlledStage: peer ${peer.name} uses mode 'stub' but declares no version`)
    mkdirSync(dest, { recursive: true })
    writeFileSync(
      join(dest, 'package.json'),
      `${JSON.stringify({ name: peer.name, version: peer.version, type: 'module', main: 'index.js' }, null, 2)}\n`,
    )
    writeFileSync(
      join(dest, 'index.js'),
      `throw new Error(${JSON.stringify(`[package-qualification stub] ${peer.name}@${peer.version} is a manifest-only stub and must not be executed`)})\n`,
    )
  }

  return {
    dir,
    consumer,
    nodeModules,
    packed,
    dispose: () => cleanStage(dir),
  }
}
