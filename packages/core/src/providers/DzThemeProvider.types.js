/**
 * DzThemeProvider — Type definitions.
 *
 * Defines the provider props, context interface, and typed injection key (ADR-08).
 * The context shape follows ADR-09: minimal useTheme API
 * (theme, resolvedTheme, setTheme, toggleTheme — no getToken/getCssVar).
 *
 * @module @dzup-ui/core/providers/DzThemeProvider
 */
/** Typed injection key for DzThemeProvider context (ADR-08, SCREAMING_SNAKE) */
export const DZ_THEME_KEY = Symbol('dz-theme');
//# sourceMappingURL=DzThemeProvider.types.js.map