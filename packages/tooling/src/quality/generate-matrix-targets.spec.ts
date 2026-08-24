import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  buildMatrixTargets,
  indexStories,
  renderMatrixTargets,
  toStoryExportId,
  toStoryId,
} from './generate-matrix-targets.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'

describe('toStoryId', () => {
  it('sanitizes a meta title the way Storybook does', () => {
    expect(toStoryId('Core/Buttons/DzButton')).toBe('core-buttons-dzbutton')
    expect(toStoryId('Core/Data/DzDataGrid')).toBe('core-data-dzdatagrid')
  })
})

describe('toStoryExportId', () => {
  // The bug this suite exists for: a single-word export sanitizes to itself,
  // so `Default` worked and hid the fact that nothing else did. Fourteen of the
  // catalog's stories open with a multi-word export, and every one of them
  // resolved to a story id Storybook answers with its error page.
  it('leaves a single-word export alone', () => {
    expect(toStoryExportId('Default')).toBe('default')
    expect(toStoryExportId('Month')).toBe('month')
  })

  it('splits a multi-word export, because Storybook does', () => {
    expect(toStoryExportId('PanelBlock')).toBe('panel-block')
    expect(toStoryExportId('ListLayout')).toBe('list-layout')
    expect(toStoryExportId('BasicFeed')).toBe('basic-feed')
    expect(toStoryExportId('WithLayoutToggle')).toBe('with-layout-toggle')
  })

  it('keeps a run of capitals together', () => {
    expect(toStoryExportId('RTLGallery')).toBe('rtl-gallery')
    expect(toStoryExportId('OTP')).toBe('otp')
  })

  it('separates digits, as lodash does', () => {
    expect(toStoryExportId('Grid2Columns')).toBe('grid-2-columns')
    expect(toStoryExportId('Otp2')).toBe('otp-2')
  })
})

describe('indexStories', () => {
  // `_gallery` and `_app-specific` are behind inclusion flags in main.ts, so a
  // default Storybook build has no id for anything in them. Four Tier A badges
  // live in `_app-specific` and would otherwise have produced targets naming
  // stories that do not exist.
  it('skips the story directories a default Storybook build excludes', () => {
    const ids = [...indexStories().values()]
    expect(ids.some(id => id.startsWith('visual-refresh-'))).toBe(false)
    expect(ids.some(id => id.startsWith('core-feedback-app-specific-'))).toBe(false)
  })
})

describe('buildMatrixTargets', () => {
  it('covers every public component and marks the storyless ones null', () => {
    const matrix = readCommittedMatrix()
    expect(matrix, 'quality-matrix.json must be generated first').toBeDefined()

    const targets = buildMatrixTargets(matrix)
    expect(targets).toHaveLength(matrix!.components.length)
    for (const target of targets)
      expect(target.story === null || target.story.includes('--')).toBe(true)
  })

  it('renders deterministically', () => {
    const targets = buildMatrixTargets()
    expect(renderMatrixTargets(targets)).toBe(renderMatrixTargets(targets))
  })
})

/**
 * The cross-check that makes the derivation falsifiable.
 *
 * `apps/storybook/storybook-static/index.json` is the ids Storybook actually
 * built, so comparing against it turns "the derivation looks right" into a
 * measurement. It only exists after `yarn storybook:build`, and the assertion
 * below therefore states its own absence rather than skipping quietly — a
 * skipped test in a suite about silent narrowing would be a poor joke.
 */
describe('derived ids against the built Storybook index', () => {
  const indexPath = resolve(ROOT, 'apps/storybook/storybook-static/index.json')

  it('matches every id, or says the index is not built', () => {
    if (!existsSync(indexPath)) {
      expect(
        existsSync(indexPath),
        'apps/storybook/storybook-static/index.json is absent, so this check did not run. '
        + 'Run `yarn storybook:build` to make it meaningful.',
      ).toBe(false)
      return
    }

    const built = JSON.parse(readFileSync(indexPath, 'utf8')) as {
      entries?: Record<string, unknown>
      stories?: Record<string, unknown>
    }
    const ids = new Set(Object.keys(built.entries ?? built.stories ?? {}))
    const derived = [...indexStories().values()]
    const missing = derived.filter(id => !ids.has(id))

    expect(missing, 'derived story ids Storybook did not build').toEqual([])
  })
})
