/**
 * DzThemeProvider — Type definitions.
 *
 * Defines the provider props, context interface, and typed injection key (ADR-08).
 * The context shape follows ADR-09: minimal useTheme API
 * (theme, resolvedTheme, setTheme, toggleTheme — no getToken/getCssVar).
 *
 * @module @dzup-ui/core/providers/DzThemeProvider
 */
import type { ComputedRef, InjectionKey, Ref } from 'vue';
/** User-selectable theme preference */
export type ThemePreference = 'light' | 'dark' | 'system';
/** Resolved theme after accounting for system preference (never 'system') */
export type ResolvedTheme = 'light' | 'dark';
/** Props for the DzThemeProvider component */
export interface DzThemeProviderProps {
    /**
     * Initial theme when no persisted value exists.
     *
     * When set to `'system'`, the provider reads `prefers-color-scheme` to
     * resolve the actual theme. Under SSR, `prefers-color-scheme` is unavailable,
     * so `systemPrefersDark` defaults to `false` and the SSR-rendered HTML is
     * always light-themed. The inline `themeScript` (ADR-15) corrects this on
     * the client before hydration, so there is no observable flash.
     */
    defaultTheme?: ThemePreference;
    /** localStorage key for theme persistence (ADR-15) */
    storageKey?: string;
    /** HTML attribute name set on document.documentElement */
    attribute?: string;
    /**
     * Suppress CSS transitions during theme switches to prevent colour-flash.
     *
     * When `true` (default), `setTheme` / `toggleTheme` briefly inject a
     * `<style>` tag that sets `transition: none !important` on all elements,
     * forces a reflow, then removes the tag on the next animation frame.
     * This prevents the "colour sweep" effect that occurs when background-color
     * transitions fire across the whole page.
     */
    disableTransitionOnChange?: boolean;
}
/** Theme context provided to descendants via inject (ADR-09 minimal API) */
export interface DzThemeContext {
    /** Current theme preference ('light' | 'dark' | 'system') */
    theme: Ref<ThemePreference>;
    /** Resolved actual theme — accounts for system preference when theme is 'system' */
    resolvedTheme: ComputedRef<ResolvedTheme>;
    /** Set the theme preference */
    setTheme: (theme: ThemePreference) => void;
    /** Toggle between light and dark (resolves 'system' to its opposite) */
    toggleTheme: () => void;
}
/** Typed injection key for DzThemeProvider context (ADR-08, SCREAMING_SNAKE) */
export declare const DZ_THEME_KEY: InjectionKey<DzThemeContext>;
