/**
 * Auto-import resolver for unplugin-vue-components.
 *
 * Enables consumers to use `<DzButton>`, `<DzInput>`, etc. in templates
 * without manual import statements.
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

export interface DzResolverOptions {
  /**
   * When true, also resolves pro components from `@dzup-ui/pro`.
   * When false (default), only resolves core components.
   */
  includePro?: boolean
}

/**
 * Component prefixes that belong to `@dzup-ui/pro`.
 *
 * This list is derived from the actual pro package component inventory.
 * Components not matching any of these prefixes resolve to `@dzup-ui/core`.
 */
const PRO_COMPONENT_PREFIXES = [
  // builders family
  'DzFormBuilder',
  'DzDashboardBuilder',
  'DzDashboardWidget',
  // data-pro family
  'DzDataGridPro',
  'DzFilterBuilder',
  'DzPivotTable',
  'DzQuickFilter',
  'DzVirtualTable',
  // editors family
  'DzCodeEditor',
  'DzJsonEditor',
  'DzMarkdownEditor',
  'DzRichTextEditor',
  // planning family
  'DzCalendar',
  'DzScheduler',
  'DzKanban',
  'DzGantt',
  // workflow family
  'DzWorkflow',
  // communication family
  'DzChat',
  'DzComment',
  'DzReactionPicker',
  // business family
  'DzAppShell',
  'DzNotificationCenter',
  'DzAuditLog',
  // visualization family
  'DzChart',
  'DzHeatMap',
  'DzTreeMap',
  'DzDiagramEditor',
] as const

/**
 * Resolver for unplugin-vue-components that auto-imports Dz* components.
 *
 * All components prefixed with `Dz` are resolved. By default only core
 * components are resolved; set `includePro: true` to also resolve pro
 * components from `@dzup-ui/pro`.
 *
 * @param options - Resolver configuration
 * @returns A component resolver compatible with unplugin-vue-components
 */
export function DzResolver(options: DzResolverOptions = {}) {
  const { includePro = false } = options

  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (!name.startsWith('Dz'))
        return

      const isPro = PRO_COMPONENT_PREFIXES.some(prefix =>
        name.startsWith(prefix),
      )

      if (isPro && !includePro)
        return

      const packageName = isPro ? '@dzup-ui/pro' : '@dzup-ui/core'

      return {
        name,
        from: packageName,
      }
    },
  }
}
