import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
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
 */
export function canResolvePro(projectRoot?: string): boolean {
  const resolveFrom = projectRoot === undefined
    ? import.meta.url
    : pathToFileURL(join(projectRoot, 'package.json')).href
  try {
    createRequire(resolveFrom).resolve(PRO_PACKAGE)
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
 * The message a consumer sees when Pro is installed but the ownership table
 * this module was built against has no Pro tier — so there are no Pro names to
 * register even though the package is present.
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
export function componentsToRegister(includePro: boolean): { name: string, from: string }[] {
  return Object.entries(COMPONENT_OWNERSHIP)
    .filter(([, owned]) => includePro || owned.from !== PRO_PACKAGE)
    .map(([name, owned]) => ({ name, from: owned.from }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
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
    // it. A missing Pro package is a consumer-fixable mistake; a Core-only
    // ownership table is ours. Both continue with Core rather than failing the
    // build, because a half-configured option should not cost a consumer their
    // whole app.
    let registerPro = false
    if (options.includePro === true) {
      const availability = proAvailability(canResolvePro(nuxt.options.rootDir))
      if (availability === 'not-installed')
        logger.error(proMissingMessage())
      else if (availability === 'no-ownership-tier')
        logger.error(proTierMissingMessage())
      else
        registerPro = true
    }

    if (registerPro)
      nuxt.options.build.transpile.push(PRO_PACKAGE)

    for (const { name, from } of componentsToRegister(registerPro)) {
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
