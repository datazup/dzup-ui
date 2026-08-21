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
 * @param options - Resolver configuration
 * @returns A component resolver compatible with unplugin-vue-components
 */
export function DzResolver(options: DzResolverOptions = {}) {
  const { includePro = false, prefix = '' } = options

  // Reported once, when the resolver is constructed — which is config time, the
  // moment the consumer can still act. A project that asks for Pro against a
  // Core-only ownership table would otherwise get silence, and "my Pro
  // components stopped auto-importing" is a hard thing to diagnose from nothing.
  if (includePro && !(OWNERSHIP_TIERS as readonly string[]).includes('pro')) {
    console.warn(
      '[dzup-ui] DzResolver: includePro is true, but the generated ownership table '
      + `covers only [${OWNERSHIP_TIERS.join(', ')}], so no Pro component name will `
      + 'resolve. Regenerate with DZUP_PRO_OWNERSHIP_MANIFEST pointing at a Pro '
      + 'ownership manifest (yarn generate:ownership).',
    )
  }

  return {
    type: 'component' as const,
    resolve: (name: string): DzResolvedComponent | undefined => {
      const key = lookupKey(name, prefix)
      if (key === undefined)
        return

      const owned = COMPONENT_OWNERSHIP[key]
      if (owned === undefined)
        return

      if (owned.from === PRO_PACKAGE && !includePro)
        return

      return { name: key, from: owned.from }
    },
  }
}
