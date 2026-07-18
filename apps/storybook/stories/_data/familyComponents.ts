/**
 * Per-family component lists, derived from the story corpus (TASK-FREE-14).
 *
 * **Why this exists.** The 11 family Overview pages used to hand-type their own
 * component tables — name, status badge and blurb, typed by whoever added the
 * component and updated by whoever remembered. Predictably, **45 shipped
 * components appeared on no Overview at all** (worst: Forms, missing 9), and the
 * `status="stable"` literals in the MDX could disagree silently with the
 * `status:*` tag the story actually declares. A component that ships but appears
 * on no index page does not exist as far as a browsing user is concerned.
 *
 * So the lists are read from the same corpus `componentStatus.ts` already parses:
 * add a story and it appears on its family's Overview with the right badge, with
 * nobody to remind. This is the `<derived>` rule from TASK-FREE-04 applied to the
 * one place that most obviously needed it.
 *
 * **Where each column comes from:**
 * - name + family — the story `title` (`Core/<Family>/<Component>`)
 * - status — the `status:*` tag on the story `meta`
 * - summary — the JSDoc immediately above `const meta`, which is also what
 *   Storybook renders as the component's docs-page description. Sharing one source
 *   means the Overview blurb and the docs page can never contradict each other.
 * - docsId — Storybook's own id slug for the title, so the link resolves. Verified
 *   against the built index by `yarn check:mdx-links` (TASK-FREE-11).
 */
import type { ComponentStatus } from '../../../../packages/core/stories/_shared/status.ts'
import { STATUS_BADGES } from '../../../../packages/core/stories/_shared/status.ts'

// `import.meta.glob` MUST be called directly on `import.meta`: it is a
// compile-time transform Vite matches syntactically, not a real runtime method.
// Aliasing `import.meta` to a variable first and calling `.glob` off that — as
// `componentStatus.ts` did until TASK-FREE-14 — silently defeats the transform,
// leaving a literal `.glob()` call that throws "glob is not a function" in the
// built app. Keep this call shape; cast the RESULT, never the meta object.
const RAW_SOURCES = import.meta.glob('../../../../packages/core/stories/**/*.stories.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** One row on a family Overview page. */
export interface FamilyComponent {
  /** Component name — the last `title` segment (e.g. `DzButton`). */
  name: string
  /** Family — the second `title` segment (e.g. `Buttons`). */
  family: string
  /** Declared maturity, or `undefined` when the story carries no `status:*` tag. */
  status: ComponentStatus | undefined
  /** One-line blurb from the JSDoc above `const meta`; `''` when there is none. */
  summary: string
  /** Storybook docs id, e.g. `core-buttons-dzbutton--docs`. */
  docsId: string
}

/**
 * Storybook's id slug for a story title. Storybook lowercases and replaces every
 * run of non-alphanumerics with a single dash — `Core/Buttons/DzButton` becomes
 * `core-buttons-dzbutton`. Verified against all 178 `Core/*` docs entries in a
 * built `index.json`: zero mismatches.
 */
function toDocsId(title: string): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}--docs`
}

/**
 * The JSDoc block immediately above `const meta` — the only one Storybook renders
 * as the page description (Babel attaches leading comments to the NEXT statement,
 * so a block placed above fixture data instead renders nowhere). We take its first
 * paragraph and flatten it to a single line.
 */
function parseSummary(source: string): string {
  const block = source.match(/\/\*\*([\s\S]*?)\*\/\s*const meta\b/)
  if (!block?.[1])
    return ''

  const text = block[1]
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, '').trim())
    .join('\n')
    .trim()

  // First paragraph only — later paragraphs elaborate; the table wants a line.
  const firstParagraph = text.split(/\n\s*\n/)[0] ?? ''
  return firstParagraph
    .split('\n')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseComponent(source: string): FamilyComponent | null {
  const title = source.match(/title:\s*['"]([^'"]+)['"]/)?.[1]
  if (!title)
    return null

  const segments = title.split('/')
  // Real component stories only: `Core/<Family>/<Component>`. This also drops the
  // `Overview` MDX pages themselves and the cross-family `_gallery` screens.
  if (segments[0] !== 'Core' || segments.length < 3 || segments[segments.length - 1] === 'Overview')
    return null

  const statusValue = source.match(/status:(experimental|beta|stable|deprecated)/)?.[1] as
    | ComponentStatus
    | undefined

  return {
    name: segments[segments.length - 1]!,
    family: segments[1]!,
    status: statusValue && statusValue in STATUS_BADGES ? statusValue : undefined,
    summary: parseSummary(source),
    docsId: toDocsId(title),
  }
}

/** Every component story, sorted by name within its family. */
export const ALL_COMPONENTS: FamilyComponent[] = Object.values(RAW_SOURCES)
  .map(parseComponent)
  .filter((c): c is FamilyComponent => c !== null)
  .sort((a, b) => a.name.localeCompare(b.name))

/** Components in one family, in name order. Empty array for an unknown family. */
export function componentsIn(family: string): FamilyComponent[] {
  return ALL_COMPONENTS.filter(c => c.family === family)
}

/** How many components a family ships — for an Overview's intro line. */
export function countIn(family: string): number {
  return componentsIn(family).length
}
