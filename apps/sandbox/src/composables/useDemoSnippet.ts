import type { ComputedRef } from 'vue'
import { computed } from 'vue'

export interface SnippetManifest<TProps extends Record<string, unknown>> {
  tag: string
  /** Prop bag — keys are the actual component prop names (typed against the component's prop interface). */
  props: TProps
  /** Default prop values to omit from the snippet. */
  defaults?: Partial<TProps>
  /** Indented child template, or `null` for a self-closing element. */
  children?: string | null
  /** Extra static attributes (e.g. `class`, `style`). */
  attrs?: Record<string, string | null | undefined>
}

const INDENT = '  '

function kebabCase(name: string): string {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

function isDefault(value: unknown, dflt: unknown): boolean {
  if (dflt === undefined)
    return false
  return Object.is(value, dflt)
}

function formatProp(name: string, value: unknown): string | null {
  if (value === undefined || value === null)
    return null
  const kebab = kebabCase(name)
  if (typeof value === 'string') {
    return `${kebab}="${value.replace(/"/g, '&quot;')}"`
  }
  if (typeof value === 'boolean') {
    return value ? kebab : `:${kebab}="false"`
  }
  if (typeof value === 'number') {
    return `:${kebab}="${value}"`
  }
  if (Array.isArray(value) || (typeof value === 'object')) {
    return `:${kebab}='${JSON.stringify(value)}'`
  }
  return `:${kebab}="${String(value)}"`
}

/**
 * Stringifies a typed manifest into a Vue template snippet. Prop keys are typed against the
 * target component's prop interface, so renames break compilation rather than silently drifting.
 */
export function useDemoSnippet<TProps extends Record<string, unknown>>(
  manifest: () => SnippetManifest<TProps>,
): ComputedRef<string> {
  return computed(() => buildSnippet(manifest()))
}

export function buildSnippet<TProps extends Record<string, unknown>>(
  manifest: SnippetManifest<TProps>,
): string {
  const { tag, props, defaults, children, attrs } = manifest
  const lines: string[] = []

  const propEntries = Object.entries(props as Record<string, unknown>)
    .filter(([key, value]) => !isDefault(value, defaults?.[key as keyof TProps]))
    .map(([key, value]) => formatProp(key, value))
    .filter((entry): entry is string => entry !== null)

  const attrEntries = Object.entries(attrs ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => formatProp(key, value as string))
    .filter((entry): entry is string => entry !== null)

  const allEntries = [...propEntries, ...attrEntries]

  if (allEntries.length === 0) {
    lines.push(children == null ? `<${tag} />` : `<${tag}>`)
  }
  else if (allEntries.length === 1) {
    lines.push(children == null ? `<${tag} ${allEntries[0]} />` : `<${tag} ${allEntries[0]}>`)
  }
  else {
    lines.push(`<${tag}`)
    for (const entry of allEntries) lines.push(`${INDENT}${entry}`)
    lines.push(children == null ? '/>' : '>')
  }

  if (children != null) {
    lines.push(children)
    lines.push(`</${tag}>`)
  }

  return lines.join('\n')
}
