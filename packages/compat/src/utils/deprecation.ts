/**
 * Shared deprecation warning utility for compat adapters.
 *
 * Warnings are only emitted in dev mode (`import.meta.env?.DEV`)
 * and each component name is warned about at most once per session.
 *
 * @module @dzup-ui/compat/utils/deprecation
 */

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
  if (import.meta.env?.DEV && !warned.has(oldName)) {
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
