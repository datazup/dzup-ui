import type { TemplateAccent, TemplateMeta } from './registry.ts'
import { TEMPLATE_CATEGORIES } from './registry.ts'

/**
 * Decorative accent resolution, shared by every surface that tints itself per
 * template (the gallery tiles, the hero depth field, the detail page's stage
 * and pager — TASK-TV2-06). One rule, one place: a template's own `accent`
 * wins over its category default, falling back to the brand primary palette.
 */

/** Category key → decorative palette name. */
const accentByCategory = new Map<string, TemplateAccent>(
  TEMPLATE_CATEGORIES.map(c => [c.key, c.accent]),
)

/** The decorative palette for a template (e.g. `'emerald'`). */
export function resolveTemplateAccent(t: TemplateMeta): string {
  return t.accent ?? accentByCategory.get(t.category) ?? 'primary'
}
