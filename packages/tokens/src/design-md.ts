/**
 * DESIGN.md assembly
 *
 * The single place that wires the token maps into {@link emitDesignMd}. Both
 * the generator (`generate.ts`, which writes the file) and the freshness gate
 * (`packages/tooling/src/token-checks/design-md-check.ts`, which regenerates
 * and diffs it) call {@link buildDesignMd} — so there is exactly one assembly
 * and the two can never disagree.
 *
 * This module reads the narrative from disk but writes nothing.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { APPSHELL_TOKENS } from './component/appshell.js'
import { BADGE_TOKENS } from './component/badge.js'
import { BUTTON_TOKENS } from './component/button.js'
import { CARD_TOKENS } from './component/card.js'
import { CODEBLOCK_TOKENS } from './component/codeblock.js'
import { CONTROL_TOKENS } from './component/control.js'
import { DIALOG_TOKENS } from './component/dialog.js'
import { INPUT_TOKENS } from './component/input.js'
import { SIDEBAR_TOKENS } from './component/sidebar.js'
import { type CatalogCounts, emitDesignMd, resolveColor, type ScaleMap } from './design-emit.js'
import { BREAKPOINTS, generateBreakpointCssVars } from './primitives/breakpoints.js'
import { generateColorCssVars } from './primitives/colors.js'
import { generateRadiusCssVars, RADIUS_SCALE } from './primitives/radius.js'
import { generateShadowCssVars, SHADOW_SCALE, SHADOW_SCALE_DARK } from './primitives/shadows.js'
import { generateSpacingCssVars, SPACING_SCALE } from './primitives/spacing.js'
import { DURATIONS, EASINGS, generateTransitionCssVars } from './primitives/transitions.js'
import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  generateTypographyCssVars,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
} from './primitives/typography.js'
import { generateZIndexCssVars, Z_INDEX_SCALE } from './primitives/z-index.js'
import { DARK_SEMANTIC_TOKENS } from './semantic/dark.js'
import { LIGHT_SEMANTIC_TOKENS } from './semantic/light.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Absolute path to the hand-curated narrative prose. */
export const NARRATIVE_PATH = resolve(__dirname, 'design-narrative.md')

/** Absolute path to the dzup-ui monorepo root. */
const REPO_ROOT = resolve(__dirname, '..', '..', '..')

/** Absolute path to the generated DESIGN.md at the dzup-ui repo root. */
export const DESIGN_MD_PATH = resolve(REPO_ROOT, 'DESIGN.md')

/** Directories whose `.vue` files make up each published catalog figure. */
const CATALOG_SOURCES = {
  components: 'packages/core/src/components',
  blocks: 'apps/landing/src/blocks',
  templates: 'apps/landing/src/templates',
} as const

/** Storybook story root — the source of the `documented` count. */
const STORIES_DIR = 'packages/core/stories'

/** The 11 component families. A story outside these is a guide, not a component. */
const STORY_FAMILIES = [
  'buttons',
  'cards',
  'data',
  'feedback',
  'forms',
  'inputs',
  'layout',
  'media',
  'navigation',
  'overlays',
  'typography',
] as const

/**
 * Count `.vue` files under a repo-relative directory, recursively.
 *
 * Throws when the directory is missing rather than returning 0: a silent zero
 * would sail through the freshness gate as "the catalog shrank", which is the
 * exact class of quiet drift this function exists to prevent.
 */
function countVueFiles(relativeDir: string): number {
  const dir = resolve(REPO_ROOT, relativeDir)
  if (!existsSync(dir)) {
    throw new Error(
      `design-md: cannot count components — \`${relativeDir}\` does not exist. `
      + 'DESIGN.md counts are glob-derived and must not silently fall back to 0.',
    )
  }
  return readdirSync(dir, { recursive: true, encoding: 'utf-8' }).filter(name =>
    name.endsWith('.vue'),
  ).length
}

/**
 * Components with a docs page of their own: one `Dz*.stories.ts` per component,
 * inside a family directory, excluding the `*Parts.stories.ts` bundles that
 * document a compound family's sub-parts through their parent.
 *
 * `apps/landing/scripts/build-component-index.ts` derives the same set from the
 * story `title:` (it needs the story id too). A landing spec asserts the two
 * agree, so this glob and that parser can never silently diverge.
 */
function countDocumentedComponents(): number {
  let total = 0
  for (const family of STORY_FAMILIES) {
    const dir = resolve(REPO_ROOT, STORIES_DIR, family)
    if (!existsSync(dir)) {
      throw new Error(
        `design-md: story family \`${family}\` is missing at \`${STORIES_DIR}/${family}\`. `
        + 'The documented-component count is glob-derived and must not silently shrink.',
      )
    }
    total += readdirSync(dir).filter(
      name => name.startsWith('Dz') && name.endsWith('.stories.ts') && !name.endsWith('Parts.stories.ts'),
    ).length
  }
  return total
}

/**
 * The published catalog figures, derived from the filesystem at generate time.
 * Adding a `.vue` component and re-running `generate` updates every count.
 */
export function catalogCounts(): CatalogCounts {
  return {
    components: countVueFiles(CATALOG_SOURCES.components),
    documented: countDocumentedComponents(),
    blocks: countVueFiles(CATALOG_SOURCES.blocks),
    templates: countVueFiles(CATALOG_SOURCES.templates),
  }
}

/** Component token families, keyed by the name used in `--dz-{family}-*`. */
export const COMPONENT_TOKEN_FAMILIES: Record<string, Record<string, string>> = {
  appshell: APPSHELL_TOKENS,
  badge: BADGE_TOKENS,
  button: BUTTON_TOKENS,
  card: CARD_TOKENS,
  codeblock: CODEBLOCK_TOKENS,
  control: CONTROL_TOKENS,
  dialog: DIALOG_TOKENS,
  input: INPUT_TOKENS,
  sidebar: SIDEBAR_TOKENS,
}

/**
 * The `--dz-transition-*` shorthands, keyed by step. Derived from the emitted
 * CSS vars rather than re-declared, so a new shorthand in `transitions.ts`
 * reaches DESIGN.md with no edit here.
 */
function transitionShorthands(): ScaleMap {
  const prefix = '--dz-transition-'
  const out: ScaleMap = {}
  for (const [name, value] of Object.entries(generateTransitionCssVars())) {
    if (name.startsWith(prefix)) {
      out[name.slice(prefix.length)] = value
    }
  }
  return out
}

/** Assemble the canonical DESIGN.md string from the live token maps. */
export function buildDesignMd(): string {
  const narrative = readFileSync(NARRATIVE_PATH, 'utf-8')

  return emitDesignMd({
    name: 'dzup-ui',
    packageScope: '@dzup-ui',
    description: 'Portable, high-level art-direction snapshot generated from @dzup-ui/tokens.',
    narrative,

    primitiveColors: generateColorCssVars(),
    lightSemantic: LIGHT_SEMANTIC_TOKENS,
    darkSemantic: DARK_SEMANTIC_TOKENS,

    fontFamilies: FONT_FAMILIES,
    fontSizes: FONT_SIZES,
    fontWeights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    letterSpacings: LETTER_SPACINGS,

    spacing: SPACING_SCALE as unknown as ScaleMap,
    radius: RADIUS_SCALE,
    shadows: SHADOW_SCALE,
    shadowsDark: SHADOW_SCALE_DARK,

    durations: DURATIONS,
    easings: EASINGS,
    transitions: transitionShorthands(),
    zIndex: Z_INDEX_SCALE,
    breakpoints: BREAKPOINTS,

    componentTokens: COMPONENT_TOKEN_FAMILIES,
    catalog: catalogCounts(),
  })
}

/**
 * Every `--dz-*` CSS custom property name the system defines — the universe the
 * DESIGN.md token-reference integrity check validates against.
 */
export function allTokenNames(): Set<string> {
  const names = new Set<string>()
  const add = (map: Record<string, string>): void => {
    for (const key of Object.keys(map)) {
      names.add(key)
    }
  }

  add(generateColorCssVars())
  add(generateSpacingCssVars())
  add(generateTypographyCssVars())
  add(generateRadiusCssVars())
  add(generateShadowCssVars())
  add(generateTransitionCssVars())
  add(generateZIndexCssVars())
  add(generateBreakpointCssVars())
  add(LIGHT_SEMANTIC_TOKENS)
  add(DARK_SEMANTIC_TOKENS)
  for (const family of Object.values(COMPONENT_TOKEN_FAMILIES)) {
    add(family)
  }

  return names
}

/**
 * Resolve a semantic role (e.g. `--dz-foreground`) to its concrete OKLCH value
 * for the given theme, following the same `var()` chain the emitter uses.
 * Returns `undefined` when the role is not defined for that theme.
 */
export function resolvedSemanticColor(
  varName: string,
  theme: 'light' | 'dark',
): string | undefined {
  const semantic = theme === 'light' ? LIGHT_SEMANTIC_TOKENS : DARK_SEMANTIC_TOKENS
  const raw = semantic[varName]
  if (raw === undefined) {
    return undefined
  }
  return resolveColor(raw, { primitives: generateColorCssVars(), semantic })
}
