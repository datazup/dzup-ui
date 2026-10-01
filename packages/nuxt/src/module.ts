import type { OwnershipManifestConsumption, OwnershipManifestResolution } from '@dzup-ui/contracts'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  consumeOwnershipManifest,
  ownershipCollisionDiagnostic,
  ownershipManifestDiagnostic,
} from '@dzup-ui/contracts'
import { COMPONENT_OWNERSHIP, OWNERSHIP_TIERS } from '@dzup-ui/core/ownership'
import { addComponent, defineNuxtModule, useLogger } from '@nuxt/kit'

/**
 * The packages this module registers components from.
 *
 * retired-name-ok: the rename these constants record.
 * The module used to transpile and register from `@dzup-ui/pro`, which is not a
 * package anyone can install, so `includePro: true` advertised an installation
 * path that could not resolve.
 */
const CORE_PACKAGE = '@dzup-ui/core'
const PRO_PACKAGE = '@dzup-ui-pro/pro'
const TOKENS_PACKAGE = '@dzup-ui/tokens'

/** The prefix every generated component name carries. */
const DEFAULT_PREFIX = 'Dz'

export interface DzupUiModuleOptions {
  /**
   * Include @dzup-ui-pro/pro components in auto-imports.
   * Requires @dzup-ui-pro/pro to be installed.
   * @default false
   */
  includePro?: boolean

  /**
   * Prefix to use for component names.
   * @default '' (uses original Dz prefix)
   */
  prefix?: string
}

const DEFAULT_THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("dz-theme");var t=s==='light'||s==='dark'?s:null;if(!t){var d="system";t=d==='system'?window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':d}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`

/**
 * Apply the `prefix` option to a component's export name.
 *
 * `prefix: 'Acme'` turns `DzButton` into `<AcmeButton>`. Names that do not carry
 * the `Dz` prefix are registered unchanged: `TeamMemberBadge.slice(2)` would
 * produce `AcmeamMemberBadge`, which is not a rename anybody asked for.
 */
export function applyPrefix(name: string, prefix: string): string {
  if (prefix === '' || !name.startsWith(DEFAULT_PREFIX))
    return name
  return `${prefix}${name.slice(DEFAULT_PREFIX.length)}`
}

/**
 * True when the Pro package can be resolved from the consumer's project.
 *
 * `projectRoot` is a DIRECTORY (`nuxt.options.rootDir`), and `createRequire`
 * resolves relative to the directory of the *filename* it is given — so handing
 * it the bare root makes lookups start one level above the project and miss the
 * project's own `node_modules` entirely. Anchoring on `<root>/package.json`
 * (which need not exist; it is only a resolution base) searches the project
 * first and then its ancestors, which is what a consumer means by "installed".
 *
 * Passing no root resolves from this module instead, which finds the workspace
 * `node_modules` — right for a direct unit call, wrong for answering a question
 * about a consumer's project.
 *
 * The specifier asked for is `@dzup-ui-pro/pro/package.json`, not the bare
 * package name (Pro REL-01 finding **R4a**). Pro's `exports` map is ESM-only, so
 * CJS resolution of the bare name applies the `require` condition, matches
 * nothing, and throws `ERR_PACKAGE_PATH_NOT_EXPORTED` for a package that is
 * installed and perfectly importable — telling the consumer to install what they
 * already have. `./package.json` is a condition-free export declared for exactly
 * this question, so it answers "is it on disk here?" without asserting anything
 * about how the entry point is loaded.
 *
 * The bare name remains as a fallback for a Pro published before that export
 * existed. It can only turn a `false` into a `true` for a package that really is
 * installed — a missing package fails both attempts — so "not installed" keeps
 * its meaning and its diagnostic.
 */
export function canResolvePro(projectRoot?: string): boolean {
  const resolveFrom = projectRoot === undefined
    ? import.meta.url
    : pathToFileURL(join(projectRoot, 'package.json')).href
  const resolver = createRequire(resolveFrom)

  try {
    resolver.resolve(`${PRO_PACKAGE}/package.json`)
    return true
  }
  catch {
    // Fall through to the bare name: a Pro that predates the `./package.json`
    // export, or one that ships no `exports` map at all, still resolves there.
  }

  try {
    resolver.resolve(PRO_PACKAGE)
    return true
  }
  catch {
    return false
  }
}

/**
 * The message a consumer sees when `includePro` is on and Pro is not installed.
 *
 * Named and exported so the specs assert the exact text: an "actionable
 * diagnostic" that nothing pins is one refactor away from being neither.
 */
export function proMissingMessage(): string {
  return `[@dzup-ui/nuxt] includePro is true, but "${PRO_PACKAGE}" cannot be resolved from this project. `
    + `Install it (yarn add ${PRO_PACKAGE}) or set dzupUi.includePro to false. `
    + 'Continuing with Core components only.'
}

/**
 * Read the second tier's ownership manifest **as data** (TASK-S3-O1).
 *
 * This module imports no second-tier runtime source: it resolves a declared
 * JSON subpath from the consumer's project and parses it. The package is never
 * `import()`ed, so nothing in it executes during a consumer's build.
 *
 * Only the filesystem work lives here. Which failure happened, and what may be
 * done with the result, is `consumeOwnershipManifest` in `@dzup-ui/contracts`,
 * shared verbatim with `@dzup-ui/core`'s resolver — the two consumers of one
 * published contract must not develop two accounts of it, which is precisely
 * how this module's handwritten Pro list and the resolver's handwritten Pro
 * list came to disagree with each other and with both packages.
 *
 * `projectRoot` is a DIRECTORY, anchored the same way `canResolvePro` anchors
 * it and for the same reason.
 */
export function loadSecondTierOwnership(projectRoot?: string): OwnershipManifestConsumption {
  const resolveFrom = projectRoot === undefined
    ? import.meta.url
    : pathToFileURL(join(projectRoot, 'package.json')).href
  const resolver = createRequire(resolveFrom)

  return consumeOwnershipManifest(PRO_PACKAGE, {
    resolve: (specifier) => {
      try {
        return resolver.resolve(specifier)
      }
      catch {
        return undefined
      }
    },
    readText: path => readFileSync(path, 'utf8'),
  })
}

/**
 * The message a consumer sees when `includePro` is on and no conforming
 * ownership manifest could be consumed from the second-tier package.
 *
 * Built from the shared diagnostic in `@dzup-ui/contracts`, so this module and
 * `@dzup-ui/core`'s resolver say the same thing about the same situation, in
 * each case naming the off switch *that* tool actually has.
 */
export function secondTierMissingMessage(load: OwnershipManifestConsumption): string {
  if (load.availability === 'loaded')
    throw new Error('secondTierMissingMessage called for a manifest that loaded')

  return ownershipManifestDiagnostic(load.availability, {
    consumer: '@dzup-ui/nuxt',
    packageName: PRO_PACKAGE,
    option: 'dzupUi.includePro to false',
    detail: load.detail,
  })
}

/**
 * The message a consumer sees when Pro is installed but the ownership table
 * this module was built against has no Pro tier — so there are no Pro names to
 * register even though the package is present.
 *
 * @deprecated since TASK-S3-O1. It described the only second-tier route that
 * existed when it was written — a table baked in at this library's build time —
 * and that is no longer the only one: the installed package's own published
 * manifest is now read at `setup` time, and it is the route that matters,
 * because the version a consumer installed is the version whose components they
 * can import. A build-time-only table is a claim about a package on *our*
 * machine. `setup` therefore emits {@link secondTierMissingMessage}, which
 * names which of the three failures occurred. This is kept exported because
 * removing a published export is a breaking change, and its text is still a
 * true statement about the baked-in table.
 */
export function proTierMissingMessage(): string {
  return `[@dzup-ui/nuxt] includePro is true and "${PRO_PACKAGE}" resolves, but the ownership `
    + `table in @dzup-ui/core covers only [${OWNERSHIP_TIERS.join(', ')}], so no Pro component `
    + 'is registered. This is a packaging gap in @dzup-ui/core, not a problem with your project.'
}

/**
 * What `includePro: true` can actually deliver in this project.
 *
 * Pure, and separate from the resolution it depends on, so both branches are
 * unit-testable: whether `@dzup-ui-pro/pro` resolves is filesystem state that a
 * test cannot arrange without installing a package that is not published.
 */
export type ProAvailability = 'available' | 'not-installed' | 'no-ownership-tier'

export function proAvailability(
  canResolve: boolean,
  tiers: readonly string[] = OWNERSHIP_TIERS,
): ProAvailability {
  if (!canResolve)
    return 'not-installed'
  if (!tiers.includes('pro'))
    return 'no-ownership-tier'
  return 'available'
}

/**
 * Component names to register, taken from the generated ownership table.
 *
 * The module used to carry a second handwritten list beside the resolver's,
 * and the two had drifted apart from each other and from both packages: it
 * classified the Core components `DzAppShell` and `DzCalendar` as Pro, and
 * named Pro components (`DzScheduler`, `DzComment`, `DzVirtualTable`) that Pro
 * does not export. The table is generated from the packages themselves.
 */
export function componentsToRegister(
  includePro: boolean,
  secondTier: Record<string, OwnershipManifestResolution> = {},
): { name: string, from: string }[] {
  // Annotated, not inferred. Inference narrows `from` to the generated table's
  // `OwningPackage` union, and the second-tier rows below carry the manifest's
  // own specifier — which may be `pkg/sub`, a string the generated union cannot
  // express. The annotation is the function's own declared return type.
  const rows: { name: string, from: string }[] = Object.entries(COMPONENT_OWNERSHIP)
    .filter(([, owned]) => includePro || owned.from !== PRO_PACKAGE)
    .map(([name, owned]) => ({ name, from: owned.from }))

  if (includePro) {
    for (const [name, resolution] of Object.entries(secondTier)) {
      if (COMPONENT_OWNERSHIP[name] !== undefined)
        continue
      // `from` is the manifest's own specifier — `pkg` for a root-barrel
      // symbol, `pkg/sub` for one the second tier exposes on a narrower
      // subpath. The generated table can only ever say `pkg`; the published
      // schema is what makes the narrower answer expressible at all.
      rows.push({ name, from: resolution.from })
    }
  }

  return rows.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

/**
 * Second-tier names that do not collide with a name the first tier already owns.
 *
 * A collision keeps the **first-tier** answer and reports both packages. That
 * is not a precedence rule chosen here: choosing a winner between two tiers is
 * an owner decision recorded in this repository's collision policy. What is
 * decided here is that a package installed downstream must not be able to take
 * a first-tier component away from a consumer by shipping a colliding name —
 * a downstream package breaking an upstream one at a consumer's build time is
 * a failure mode nobody has authorised. The consumer is told which two packages
 * disagree, so the silence that made 08-11 finding H1 expensive does not recur.
 */
export function withoutCollisions(
  symbols: Record<string, OwnershipManifestResolution>,
  report: (message: string) => void,
): Record<string, OwnershipManifestResolution> {
  const kept: Record<string, OwnershipManifestResolution> = {}
  for (const [name, resolution] of Object.entries(symbols)) {
    const owned = COMPONENT_OWNERSHIP[name]
    if (owned !== undefined) {
      report(ownershipCollisionDiagnostic(name, {
        consumer: '@dzup-ui/nuxt',
        firstTier: owned.from,
        secondTier: resolution.from,
      }))
      continue
    }
    kept[name] = resolution
  }
  return kept
}

export default defineNuxtModule<DzupUiModuleOptions>({
  meta: {
    name: '@dzup-ui/nuxt',
    configKey: 'dzupUi',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    includePro: false,
    prefix: '',
  },
  setup(options, nuxt) {
    const logger = useLogger('@dzup-ui/nuxt')

    // Token layer first: it declares the `--dz-*` custom properties every
    // component stylesheet reads, so a later import would leave the first paint
    // unstyled. App CSS comes after both, because Nuxt appends it.
    //
    // Both are *declared* subpaths. The module used to push
    // `@dzup-ui/tokens/dist/tokens.css`, a deep path the tokens package does not
    // export; it resolved only through the monorepo's symlinked node_modules and
    // failed the moment a consumer installed the real tarball, with
    // `Missing "./dist/tokens.css" specifier in "@dzup-ui/tokens" package`.
    nuxt.options.css.push(`${TOKENS_PACKAGE}/css`)
    nuxt.options.css.push(`${CORE_PACKAGE}/styles`)

    nuxt.options.build.transpile.push(CORE_PACKAGE, TOKENS_PACKAGE)

    // `includePro` is honoured only as far as the project can actually support
    // it. A missing Pro package is a consumer-fixable mistake; a package that
    // ships no conforming manifest is that package's; a Core-only baked-in
    // table is ours. All three continue with Core rather than failing the
    // build, because a half-configured option should not cost a consumer their
    // whole app.
    //
    // Two routes to the second tier, and they compose. The baked-in table
    // (`OWNERSHIP_TIERS` includes `pro`) is what a build generated with
    // DZUP_PRO_OWNERSHIP_MANIFEST carries. The installed package's own
    // published manifest is read here, at the consumer's build — and that is
    // the route that matters, because the version they installed is the
    // version whose components they can import (TASK-S3-O1).
    //
    // ONE diagnostic, never two: a project missing both routes has one problem.
    let registerPro = false
    let secondTier: Record<string, OwnershipManifestResolution> = {}
    if (options.includePro === true) {
      const availability = proAvailability(canResolvePro(nuxt.options.rootDir))
      if (availability === 'not-installed') {
        logger.error(proMissingMessage())
      }
      else {
        const load = loadSecondTierOwnership(nuxt.options.rootDir)
        if (load.availability === 'loaded') {
          secondTier = withoutCollisions(load.symbols, message => logger.warn(message))
          registerPro = true
        }
        else if (availability === 'available') {
          // The baked-in table already carries the tier, so registration works;
          // the installed package simply publishes no manifest of its own.
          // Reported at `warn`, not `error`: nothing is broken for this
          // consumer, but the two sources of truth disagree and somebody should
          // know before the baked-in table goes stale.
          logger.warn(secondTierMissingMessage(load))
          registerPro = true
        }
        else {
          logger.error(secondTierMissingMessage(load))
        }
      }
    }

    if (registerPro)
      nuxt.options.build.transpile.push(PRO_PACKAGE)

    for (const { name, from } of componentsToRegister(registerPro, secondTier)) {
      addComponent({
        name: applyPrefix(name, options.prefix ?? ''),
        export: name,
        filePath: from,
      })
    }

    // Add the default theme script to head for FOUC prevention (ADR-15).
    nuxt.options.app.head.script = nuxt.options.app.head.script || []
    nuxt.options.app.head.script.push({
      innerHTML: DEFAULT_THEME_SCRIPT,
      type: 'text/javascript',
    })
  },
})
