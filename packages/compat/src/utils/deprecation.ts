/**
 * Shared deprecation warning utility for compat adapters.
 *
 * Warnings are only emitted in dev mode ({@link isDevEnv}) and each component
 * name is warned about at most once per session.
 *
 * @module @dzup-ui/compat/utils/deprecation
 */

/**
 * Whether the consumer's build is a development build (UI-DZUP-UI-CODE-M-17).
 *
 * This used to be `import.meta.env?.DEV`, which Vite's lib mode replaces with
 * `false` when building this package, so every compat warning was deleted from
 * the published `dist`. `process.env.NODE_ENV` survives lib mode and is replaced
 * by the consumer's bundler instead: their dev build warns, their production
 * build drops the branch. Bare on purpose, with no `typeof process` guard, which
 * would read false in every browser dev build. Core's `utilities/isDevEnv.ts` is
 * the same check; compat keeps its own because Core exports no such helper.
 */
export function isDevEnv(): boolean {
  // eslint-disable-next-line node/prefer-global/process -- must stay the bare global the consumer's bundler replaces
  return process.env.NODE_ENV !== 'production'
}

/** Set tracking which component names have already warned */
const warned = new Set<string>()

/**
 * Emit a one-time deprecation warning for a compat adapter.
 *
 * @param oldName - The deprecated component name (e.g. `DzButtonCompat`)
 * @param newName - The replacement component name (e.g. `DzButton`)
 * @param packageName - The package where the replacement lives (default: `@dzup-ui/core`)
 */
export function warnDeprecated(
  oldName: string,
  newName: string,
  packageName: string = '@dzup-ui/core',
): void {
  if (isDevEnv() && !warned.has(oldName)) {
    warned.add(oldName)
    console.warn(
      `[dzup-ui/compat] ${oldName} is deprecated. Use ${newName} from ${packageName} instead.`,
    )
  }
}

/**
 * Reset the warning set. Useful for testing.
 */
export function resetDeprecationWarnings(): void {
  warned.clear()
}
