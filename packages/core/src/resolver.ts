/**
 * Auto-import resolver for unplugin-vue-components.
 *
 * Enables consumers to use `<DzButton>`, `<DzInput>`, etc. in templates
 * without manual import statements.
 *
 * Ownership comes from `./generated/component-ownership.ts`, which
 * `yarn generate:ownership` writes from the cross-tier ownership manifests and
 * `yarn validate:ownership` keeps fresh. There is no prefix heuristic here, and
 * there is no list to maintain.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Components from 'unplugin-vue-components/vite'
 * import { DzResolver } from '@dzup-ui/core/resolver'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [DzResolver()],
 *     }),
 *   ],
 * })
 * ```
 */

import type { OwnershipManifestConsumption, OwnershipManifestResolution } from '@dzup-ui/contracts'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import {
  consumeOwnershipManifest,
  ownershipCollisionDiagnostic,
  ownershipManifestDiagnostic,
} from '@dzup-ui/contracts'
import { COMPONENT_OWNERSHIP, OWNERSHIP_TIERS } from './generated/component-ownership.ts'

/**
 * The two package names this resolver is allowed to emit.
 *
 * retired-name-ok: the rename these constants record.
 * Module-local on purpose. The resolver used to emit `@dzup-ui/pro`, a package
 * that has never existed, and the spec asserted the same wrong string -- so the
 * suite was green while `includePro: true` produced an unresolvable import for
 * every consumer who followed the docs.
 *
 * Exporting them would invite the spec to assert the resolver against its own
 * constant, which is the mistake that hid the defect. The spec states the two
 * real names independently, and `yarn validate:package-names` fails if the
 * retired one reappears anywhere in source.
 */
const PRO_PACKAGE = '@dzup-ui-pro/pro'

/** The prefix every generated component name carries. */
const DEFAULT_PREFIX = 'Dz'

export interface DzResolverOptions {
  /**
   * When true, also resolves pro components from `@dzup-ui-pro/pro`.
   * When false (default), only resolves core components.
   */
  includePro?: boolean

  /**
   * Directory the second-tier package is resolved from — the consumer's project
   * root. Only consulted when `includePro` is on.
   *
   * It is a DIRECTORY, and resolution is anchored on `<dir>/package.json`
   * (which need not exist; it is only a base), because `createRequire` resolves
   * relative to the *directory of the filename* it is given: handing it a bare
   * directory starts the lookup one level above the project and misses the
   * project's own `node_modules` entirely. `@dzup-ui/nuxt` paid for that
   * lesson; this repeats the fix rather than the bug.
   *
   * @default process.cwd() — the build tool's working directory, which is the
   * consumer's project when a resolver is constructed from `vite.config.ts`.
   */
  resolveFrom?: string

  /**
   * Replace the `Dz` prefix in template tags: `prefix: 'X'` lets a consumer
   * write `<XButton>` for `DzButton`.
   *
   * It renames the *tag*, never the ownership: the resolved import still names
   * the real export, from the package that really owns it. Components whose
   * export name does not start with `Dz` are not reachable under a custom
   * prefix, because there is no `Dz` to replace.
   *
   * @default '' (tags keep the Dz prefix)
   */
  prefix?: string
}

/** What `resolve` returns for a name this library owns. */
export interface DzResolvedComponent {
  /** The real export name, which is what gets imported. */
  name: string
  /** The package that owns it. */
  from: string
}

/**
 * Map a template tag back to the export name to look up.
 *
 * Returns `undefined` when the tag cannot belong to this library at all, so
 * the caller never queries the table with a name it has invented.
 */
function lookupKey(tag: string, prefix: string): string | undefined {
  if (prefix === '')
    return tag
  if (!tag.startsWith(prefix))
    return undefined
  return `${DEFAULT_PREFIX}${tag.slice(prefix.length)}`
}

/**
 * Read the second tier's ownership manifest **as data**.
 *
 * Core imports no second-tier runtime source, here or anywhere: this resolves a
 * declared JSON subpath and parses it. The second-tier package is never
 * `import()`ed, so nothing in it executes inside a consumer's build.
 *
 * Only the six lines of filesystem work live here. Which failure happened, and
 * what may be done with the result, is `consumeOwnershipManifest` in
 * `@dzup-ui/contracts` — shared verbatim with `@dzup-ui/nuxt`, so the two
 * consumers of the same contract cannot drift into two accounts of it.
 *
 * Module-private, and deliberately so. Every runtime value
 * `packages/core/src` exports lands in `component-ownership.manifest.json`,
 * whose schema has no `utility` kind — `cn`, `themeScript` and `DzResolver`
 * itself are already carried as `unclassified` under a ceiling of 29 that only
 * ratchets down. Exporting a loader would spend that budget on a function no
 * consumer calls, so the whole path is reachable through
 * {@link DzResolverOptions.resolveFrom} instead, which is a type and costs
 * nothing. The same reasoning put `form-value.ts` in `@dzup-ui/contracts`.
 */
function loadSecondTier(resolveFrom: string): OwnershipManifestConsumption {
  // `resolveFrom` is a DIRECTORY and `createRequire` resolves relative to the
  // directory of the FILENAME it is given, so it is anchored on
  // `<dir>/package.json` — which need not exist; it is only a base.
  const require_ = createRequire(pathToFileURL(join(resolveFrom, 'package.json')).href)

  return consumeOwnershipManifest(PRO_PACKAGE, {
    resolve: (specifier) => {
      try {
        return require_.resolve(specifier)
      }
      catch {
        return undefined
      }
    },
    readText: path => readFileSync(path, 'utf8'),
  })
}

/**
 * Merge the second tier over the generated table, failing closed on a collision.
 *
 * **The overlay is additive.** A name the generated table already owns keeps
 * its first-tier answer and the second-tier entry is ignored, with a diagnostic
 * naming both packages. That is not a precedence rule chosen here — choosing a
 * winner between two tiers is an owner decision, recorded in this repository's
 * `collision-decisions.json` and applied by the generator. What *is* decided
 * here is that a package a consumer installs downstream must not be able to
 * take a first-tier component away from them by shipping a colliding name; that
 * would let a downstream package break an upstream one at a consumer's build
 * time, which nobody has authorised. The consumer is told, and told which two
 * packages disagree, so the silence that made H1 expensive does not recur.
 */
function overlaySecondTier(
  symbols: Record<string, OwnershipManifestResolution>,
): Record<string, OwnershipManifestResolution> {
  const overlay: Record<string, OwnershipManifestResolution> = {}
  for (const [symbol, resolution] of Object.entries(symbols)) {
    const owned = COMPONENT_OWNERSHIP[symbol]
    if (owned !== undefined) {
      console.warn(ownershipCollisionDiagnostic(symbol, {
        consumer: 'dzup-ui',
        firstTier: owned.from,
        secondTier: resolution.from,
      }))
      continue
    }
    overlay[symbol] = resolution
  }
  return overlay
}

/**
 * Resolver for unplugin-vue-components that auto-imports dzup-ui components.
 *
 * Resolution is by **exact name**. A name the generated ownership table does
 * not contain returns `undefined`, which unplugin-vue-components reads as "not
 * mine" and leaves alone — the correct answer for a typo, for a consumer's own
 * component, and for a Pro component in a project that has no Pro tier.
 *
 * The previous implementation classified by prefix, and a prefix cannot
 * separate two packages that both use `Dz`. It routed the Core components
 * `DzAppShell` and `DzCalendar` to Pro, listed Pro components Pro does not
 * export, and resolved every other unknown `Dz*` name to Core — so a typo
 * became an import of a component that does not exist.
 *
 * ## The second tier
 *
 * With `includePro`, a **second tier** is read at construction time from the
 * ownership manifest the installed second-tier package publishes, against the
 * schema in `@dzup-ui/contracts` (`OWNERSHIP_MANIFEST_SUBPATH`). Two sources
 * can supply it and they compose:
 *
 * 1. **Baked in at this library's build time** — a build generated with
 *    `DZUP_PRO_OWNERSHIP_MANIFEST` carries the second tier inside
 *    `COMPONENT_OWNERSHIP` and `OWNERSHIP_TIERS` already.
 * 2. **Read from the consumer's own `node_modules`** — which is the one that
 *    matters, because the version a consumer installed is the version whose
 *    components they can import. A table baked at our build time is a claim
 *    about a package on *our* machine.
 *
 * Both are data. Core imports no second-tier runtime source at any point.
 * Unknown names answer `undefined` in **both** tiers, and when `includePro` is
 * on but nothing conforming is resolvable the consumer gets one actionable
 * sentence at config time — the moment they can still act — instead of silence.
 *
 * @param options - Resolver configuration
 * @returns A component resolver compatible with unplugin-vue-components
 */
export function DzResolver(options: DzResolverOptions = {}) {
  const { includePro = false, prefix = '', resolveFrom = process.cwd() } = options

  // Reported once, when the resolver is constructed — which is config time, the
  // moment the consumer can still act. A project that asks for a second tier
  // and gets nothing would otherwise get silence, and "my Pro components
  // stopped auto-importing" is a hard thing to diagnose from nothing.
  //
  // ONE message, never two. The generated table and the installed manifest are
  // two routes to the same tier, so a project missing both has one problem, and
  // a project that has either has none.
  let secondTier: Record<string, OwnershipManifestResolution> = {}
  if (includePro) {
    const load = loadSecondTier(resolveFrom)
    if (load.availability === 'loaded') {
      secondTier = overlaySecondTier(load.symbols)
    }
    else if (!(OWNERSHIP_TIERS as readonly string[]).includes('pro')) {
      console.warn(ownershipManifestDiagnostic(load.availability, {
        consumer: 'dzup-ui',
        packageName: PRO_PACKAGE,
        option: 'includePro: false',
        detail: `${load.detail === undefined ? '' : `${load.detail} `}This build of @dzup-ui/core `
          + `also has no Pro tier baked into its generated ownership table (it covers `
          + `[${OWNERSHIP_TIERS.join(', ')}]); a build generated with `
          + 'DZUP_PRO_OWNERSHIP_MANIFEST pointing at a conforming manifest carries one.',
      }))
    }
  }

  return {
    type: 'component' as const,
    resolve: (name: string): DzResolvedComponent | undefined => {
      const key = lookupKey(name, prefix)
      if (key === undefined)
        return

      const owned = COMPONENT_OWNERSHIP[key]
      if (owned !== undefined) {
        if (owned.from === PRO_PACKAGE && !includePro)
          return

        return { name: key, from: owned.from }
      }

      // Second tier. Unreachable unless `includePro` is on, because `secondTier`
      // is only populated then — a name this library does not own answers
      // `undefined` in both tiers, which is what lets a typo stay a typo.
      const second = secondTier[key]
      if (second === undefined)
        return

      return { name: key, from: second.from }
    },
  }
}
