/**
 * Guard: the two derivations of the "documented components" count must agree.
 *
 * The figure is derived twice, on purpose, because each consumer needs a
 * different shape of the same fact:
 *
 *   - `scripts/build-component-index.ts` parses each story's `title:` because it
 *     also needs the Storybook story id for deep links. Its output is
 *     `generated/components.ts`, which feeds `FACTS.freeComponents` and ⌘K.
 *   - `packages/tokens/src/design-md.ts` globs story filenames because it only
 *     needs a count, and it must not import a landing module.
 *
 * Two derivations of one number is exactly how counts drift (see the 147 / 155 /
 * 158 / 205 spread this test was written to end). So: assert they agree.
 *
 * The rule, stated once: a component has a docs page iff it owns a
 * `Dz*.stories.ts` inside a family directory. `*Parts.stories.ts` bundles are
 * excluded — they document a compound family's sub-parts through their parent.
 */

import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { COMPONENTS } from './components.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORIES_DIR = resolve(__dirname, '..', '..', '..', '..', 'packages', 'core', 'stories')

/** Mirrors `STORY_FAMILIES` in packages/tokens/src/design-md.ts. */
const FAMILIES = [
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

function globDocumentedComponents(): string[] {
  return FAMILIES.flatMap(family =>
    readdirSync(resolve(STORIES_DIR, family))
      .filter(
        name =>
          name.startsWith('Dz')
          && name.endsWith('.stories.ts')
          && !name.endsWith('Parts.stories.ts'),
      )
      .map(name => name.replace('.stories.ts', '')),
  )
}

describe('documented-component count', () => {
  it('agrees between the story-title parser and the filename glob', () => {
    const glob = globDocumentedComponents()
    expect(COMPONENTS.length).toBe(glob.length)
  })

  it('names the same components in both derivations', () => {
    const fromIndex = [...COMPONENTS.map(c => c.name)].sort()
    const fromGlob = [...globDocumentedComponents()].sort()
    // A mismatch means a story's `title:` disagrees with its filename — e.g. a
    // nested title group the parser's regex cannot see.
    expect(fromIndex).toEqual(fromGlob)
  })

  it('includes components filed under a nested title group', () => {
    // `Core/Feedback/App-Specific/DzRunStatusBadge` — these were silently dropped
    // by a `Core/<Family>/<Dz…>` regex that assumed exactly one group segment.
    const names = COMPONENTS.map(c => c.name)
    expect(names).toContain('DzRunStatusBadge')
    expect(names).toContain('DzTokenProgressBar')
  })

  it('excludes compound sub-part bundles', () => {
    expect(COMPONENTS.filter(c => c.name.endsWith('Parts'))).toEqual([])
  })
})
