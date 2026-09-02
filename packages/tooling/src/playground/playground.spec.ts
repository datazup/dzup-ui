/**
 * Unit tests for the playground sandbox contract, the seed builder and the
 * parity gate — TASK-N2-D3.
 *
 * **Written because none existed.** D1 shipped 22 tooling tests with its page
 * renderer and D2 shipped 43 with its evidence layer; the playground surface
 * landed with **zero**, while `playground-parity.ts`'s own header asserted that
 * "both directions are covered by unit tests". They were not. A claim in a
 * source comment that no test backs is the same defect class as a metric typed
 * into a page, and this lane has now met it twice (A2 F-3, D2 F-6).
 *
 * The cases that matter here are the *refusal* ones. A playground must run real
 * story code or say why it does not, and the reason it prints has to be the
 * reason it measured — which for three components it was not (D3-F5).
 */
import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderPlayground } from '../docs/docs-pages.ts'
import {
  buildPlaygroundSeeds,
  pickRepresentatives,
  refusalsOf,
  seedFor,
  seedOrRefusal,
  unexportedTags,
} from '../docs/playground-seeds.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { checkPlaygroundParity, mentionsAsset, PARITY_TARGETS } from '../validators/playground-parity.ts'
import {
  componentTagsIn,
  dedent,
  PLAYGROUND_ASSETS,
  PLAYGROUND_IMPORT_SPECIFIER,
  PLAYGROUND_REPL_STYLESHEETS,
  playgroundImportMap,
  sandboxHeadHTML,
  TAILWIND_BROWSER_CDN,
  THEME_RECIPE_MESSAGE,
  wrapStoryTemplate,
} from './playground-contract.ts'

function makeRecord(overrides: Partial<ComponentMetaRecord> = {}): ComponentMetaRecord {
  return {
    name: 'DzThing',
    kind: 'public-component',
    description: 'A thing.',
    descriptionSource: 'sfc-header',
    family: 'buttons',
    subpaths: ['.'],
    source: 'packages/core/src/components/buttons/DzThing.vue',
    typesSource: 'packages/core/src/components/buttons/DzThing.types.ts',
    componentCommit: 'abc1234',
    componentType: 'class',
    anatomy: { state: 'absent', parts: [] },
    props: [],
    globalPropCount: 12,
    events: [],
    slots: [],
    exposed: [],
    stories: { stories: [] },
    extraction: {
      props: 0,
      propsWithDescription: 0,
      propsWithDeclaredDefault: 0,
      events: 0,
      eventsWithDescription: 0,
      eventsModelDerived: 0,
      slots: 0,
      slotsWithDescription: 0,
      slotsWithPayload: 0,
      exposed: 0,
      exposedWithDescription: 0,
      unresolvedTypes: [],
    },
    ...overrides,
  }
}

function makeArtifact(components: ComponentMetaRecord[]): ComponentMetaArtifact {
  return {
    schemaVersion: '1.1.0',
    sourceCommit: 'deadbeef',
    extractor: 'vue-component-meta@3.3.7',
    generatedFrom: [],
    inputs: {},
    taxonomies: {},
    totals: {
      components: components.length,
      publicComponents: components.filter(c => c.kind === 'public-component').length,
      compoundParts: components.filter(c => c.kind === 'compound-part').length,
      unclassifiable: 0,
      props: 0,
      propsWithDescription: 0,
      propsWithDeclaredDefault: 0,
      propsWithLiteralUndefinedDefault: 0,
      events: 0,
      eventsWithDescription: 0,
      eventsFromExtractor: 0,
      eventsFromEmitsInterface: 0,
      eventsModelDerived: 0,
      slots: 0,
      slotsWithDescription: 0,
      slotsWithPayload: 0,
      exposed: 0,
      exposedWithDescription: 0,
      unresolvedTypes: 0,
      componentsWithStories: 0,
      componentsWithPrimaryExample: 0,
      componentsWithStaticTemplate: 0,
    },
    components,
  }
}

/** A record whose runnable story carries `template`, at the given lines. */
function withRunnable(
  overrides: Partial<ComponentMetaRecord>,
  template: string,
  file = 'packages/core/stories/buttons/DzThing.stories.ts',
): ComponentMetaRecord {
  return makeRecord({
    ...overrides,
    stories: {
      file,
      stories: [],
      runnable: { id: 'Default', lines: [10, 14], source: 'src', template },
    },
  })
}

describe('the sandbox head is the contract, not a template', () => {
  it('links exactly the assets the contract names, and no others', () => {
    const head = sandboxHeadHTML({ assetBase: 'https://x.test/playground/', theme: 'light' })
    for (const asset of PLAYGROUND_ASSETS.filter(a => a.endsWith('.css')))
      expect(head).toContain(`https://x.test/playground/${asset}`)
    // The name that once 404'd on every sandbox load.
    expect(head).not.toContain('dzup-core.css')
  })

  it('loads the Tailwind browser JIT — without it every tv() component is unstyled', () => {
    expect(sandboxHeadHTML({ assetBase: '/p/', theme: 'dark' })).toContain(TAILWIND_BROWSER_CDN)
  })

  it('seeds data-theme from the host and mirrors @vue/repl\'s class writes', () => {
    const head = sandboxHeadHTML({ assetBase: '/p/', theme: 'dark' })
    expect(head).toContain('setAttribute(\'data-theme\',"dark")')
    expect(head).toContain('MutationObserver')
  })

  it('omits the ThemeRecipe listener unless the host asks for it', () => {
    expect(sandboxHeadHTML({ assetBase: '/p/', theme: 'light' })).not.toContain(THEME_RECIPE_MESSAGE)
    expect(
      sandboxHeadHTML({ assetBase: '/p/', theme: 'light', acceptThemeRecipe: true }),
    ).toContain(THEME_RECIPE_MESSAGE)
  })

  it('binds the bare specifier the import map promises', () => {
    expect(playgroundImportMap('/p/')).toEqual({ [PLAYGROUND_IMPORT_SPECIFIER]: '/p/dzup-core.mjs' })
  })
})

describe('dedent changes indentation and nothing else', () => {
  it('removes only the indentation every non-blank line shares', () => {
    expect(dedent('\n    <DzButton>\n      <span />\n    </DzButton>\n')).toBe(
      '<DzButton>\n  <span />\n</DzButton>',
    )
  })

  it('preserves a blank line inside the block rather than collapsing it', () => {
    expect(dedent('  a\n\n  b')).toBe('a\n\nb')
  })

  it('is a no-op on already-flush markup', () => {
    expect(dedent('<DzButton />')).toBe('<DzButton />')
  })
})

describe('componentTagsIn uses the WIDE name pattern (constraint B12)', () => {
  it('finds components without a Dz prefix', () => {
    expect(componentTagsIn('<GovernanceBadge /><TeamMemberBadge />')).toEqual([
      'GovernanceBadge',
      'TeamMemberBadge',
    ])
  })

  it('ignores plain HTML elements', () => {
    expect(componentTagsIn('<div><span>x</span><DzChip /></div>')).toEqual(['DzChip'])
  })

  it('deduplicates and sorts, so a seed\'s import line is deterministic', () => {
    expect(componentTagsIn('<DzB /><DzA /><DzB />')).toEqual(['DzA', 'DzB'])
  })
})

describe('wrapStoryTemplate is a wrapper, never an author', () => {
  it('imports exactly the tags the template opens, from the contract specifier', () => {
    const sfc = wrapStoryTemplate(['DzButton', 'DzChip'], '<DzButton /><DzChip />')
    expect(sfc).toContain(`import { DzButton, DzChip } from '${PLAYGROUND_IMPORT_SPECIFIER}'`)
  })

  it('reproduces the story markup verbatim apart from a constant indent', () => {
    const template = '  <DzButton tone="primary">\n    Save\n  </DzButton>'
    const sfc = wrapStoryTemplate(['DzButton'], template)
    // Every non-whitespace character survives, in order.
    expect(sfc.replace(/\s+/g, '')).toContain('<DzButtontone="primary">Save</DzButton>')
  })
})

describe('seedOrRefusal — one decision, and it reports its own reason', () => {
  const artifact = makeArtifact([makeRecord({ name: 'DzThing' }), makeRecord({ name: 'DzChip' })])

  it('seeds from a runnable story and records where it came from', () => {
    const record = withRunnable({ name: 'DzThing' }, '<DzThing />')
    const result = seedOrRefusal(record, artifact)
    expect('seed' in result).toBe(true)
    if (!('seed' in result))
      return
    expect(result.seed.storyId).toBe('Default')
    expect(result.seed.storyLines).toEqual([10, 14])
    expect(result.seed.code).toContain('<DzThing />')
  })

  it('refuses with no-stories-file when nothing was found', () => {
    const result = seedOrRefusal(makeRecord({ stories: { stories: [] } }), artifact)
    expect(result).toEqual({ refusal: { reason: 'no-stories-file' } })
  })

  it('refuses with no-runnable-story when every template is computed or binds args', () => {
    const record = makeRecord({
      stories: { file: 'stories/x.ts', stories: [], primary: { id: 'P', lines: [1, 2], source: 's' } },
    })
    const result = seedOrRefusal(record, artifact)
    expect(result).toEqual({ refusal: { reason: 'no-runnable-story', file: 'stories/x.ts' } })
  })

  it('refuses with no-component-tag when the template would render an empty box', () => {
    const record = withRunnable({}, '<div>nothing here</div>', 'stories/x.ts')
    expect(seedOrRefusal(record, artifact)).toEqual({
      refusal: { reason: 'no-component-tag', file: 'stories/x.ts' },
    })
  })

  it('refuses with unexported-tags and NAMES them — the DzAsyncBoundary shape', () => {
    const record = withRunnable({ name: 'DzThing' }, '<DzThing><AsyncChild /></DzThing>', 'stories/x.ts')
    expect(seedOrRefusal(record, artifact)).toEqual({
      refusal: { reason: 'unexported-tags', file: 'stories/x.ts', tags: ['AsyncChild'] },
    })
  })

  it('seedFor stays the boolean view of the same decision', () => {
    const ok = withRunnable({ name: 'DzThing' }, '<DzThing />')
    const no = withRunnable({ name: 'DzThing' }, '<DzThing><AsyncChild /></DzThing>')
    expect(seedFor(ok, artifact)).toBeDefined()
    expect(seedFor(no, artifact)).toBeUndefined()
  })
})

describe('unexportedTags asks the artifact, never a name pattern', () => {
  it('treats a non-Dz public component as exported', () => {
    const artifact = makeArtifact([makeRecord({ name: 'GovernanceBadge' })])
    expect(unexportedTags(['GovernanceBadge'], artifact)).toEqual([])
  })

  it('reports a locally-defined helper even when it looks like a component', () => {
    const artifact = makeArtifact([makeRecord({ name: 'DzThing' })])
    expect(unexportedTags(['DzThing', 'Bomb'], artifact)).toEqual(['Bomb'])
  })
})

describe('the page prints the reason that was measured', () => {
  it('names the unexported tags rather than blaming Storybook args', () => {
    const record = withRunnable({ name: 'DzThing' }, '<DzThing><AsyncChild /></DzThing>', 'stories/x.ts')
    const lines = renderPlayground(record, false, {
      reason: 'unexported-tags',
      file: 'stories/x.ts',
      tags: ['AsyncChild'],
    }).join('\n')
    expect(lines).toContain('`<AsyncChild>`')
    expect(lines).toContain('does not export')
    // The regression: this sentence was published on three pages where it was
    // measurably false.
    expect(lines).not.toContain('binds Storybook')
  })

  it('emits exactly one allowlisted tag when a seed exists', () => {
    const record = withRunnable({ name: 'DzThing' }, '<DzThing />')
    const lines = renderPlayground(record, true)
    expect(lines).toContain('<DzPlayground component="DzThing" />')
  })

  it('emits NO tag when the seeds artifact has no seed, even if the record looks runnable', () => {
    const record = withRunnable({ name: 'DzThing' }, '<DzThing />')
    const lines = renderPlayground(record, false, { reason: 'no-component-tag', file: 'stories/x.ts' })
    expect(lines.join('\n')).not.toContain('<DzPlayground')
    expect(lines.join('\n')).toContain('empty box')
  })

  it('says nothing at all for a compound part — parts have no page', () => {
    expect(renderPlayground(makeRecord({ kind: 'compound-part' }), true)).toEqual([])
  })
})

describe('the seeds artifact is deterministic and names its absences', () => {
  const artifact = makeArtifact([
    withRunnable({ name: 'DzZeta', family: 'buttons' }, '<DzZeta />'),
    withRunnable({ name: 'DzAlpha', family: 'buttons' }, '<DzAlpha />'),
    withRunnable({ name: 'DzCard', family: 'cards' }, '<DzCard />'),
    makeRecord({ name: 'DzNoStories', family: 'cards', stories: { stories: [] } }),
    makeRecord({ name: 'DzPart', kind: 'compound-part' }),
  ])

  it('counts public components only, and names every one without a seed', () => {
    const seeds = buildPlaygroundSeeds(artifact)
    expect(seeds.totals.publicComponents).toBe(4)
    expect(seeds.totals.withSeed).toBe(3)
    expect(seeds.totals.withoutSeed).toEqual(['DzNoStories'])
  })

  it('carries a refusal for every named absence and for nothing else', () => {
    const seeds = buildPlaygroundSeeds(artifact)
    expect(Object.keys(seeds.refusals)).toEqual(seeds.totals.withoutSeed)
    expect(refusalsOf(seeds).get('DzNoStories')?.reason).toBe('no-stories-file')
  })

  it('sorts seeds and refusals, so two runs produce the same bytes', () => {
    const a = JSON.stringify(buildPlaygroundSeeds(artifact))
    const b = JSON.stringify(buildPlaygroundSeeds(artifact))
    expect(a).toBe(b)
    expect(Object.keys(buildPlaygroundSeeds(artifact).seeds)).toEqual(['DzAlpha', 'DzCard', 'DzZeta'])
  })

  it('derives representatives — alphabetically first seeded component per family', () => {
    expect(pickRepresentatives(
      artifact.components.filter(c => c.kind === 'public-component'),
      new Set(['DzZeta', 'DzAlpha', 'DzCard']),
    )).toEqual(['DzAlpha', 'DzCard'])
  })

  it('never picks a representative the seeds do not carry', () => {
    expect(pickRepresentatives(
      artifact.components.filter(c => c.kind === 'public-component'),
      new Set(['DzZeta']),
    )).toEqual(['DzZeta'])
  })
})

describe('mentionsAsset distinguishes the two names that once cost a sandbox', () => {
  it('matches an interpolated URL, where the name is not adjacent to a quote', () => {
    // Assembled rather than written literally: the fixture must CONTAIN a
    // template expression without this file being one (no-template-curly-in-string).
    const interpolated = ['const href = `', '$', '{base}tokens.css`'].join('')
    expect(mentionsAsset(interpolated, 'tokens.css')).toBe(true)
  })

  it('matches a quoted literal', () => {
    expect(mentionsAsset('const ASSETS = [\'core.css\']', 'core.css')).toBe(true)
  })

  it('does NOT accept dzup-core.css as core.css — the 404 this gate exists for', () => {
    expect(mentionsAsset('<link href="dzup-core.css">', 'core.css')).toBe(false)
  })

  it('does not match a longer name that merely ends the same way', () => {
    expect(mentionsAsset('my-tokens.css', 'tokens.css')).toBe(false)
  })
})

describe('the parity gate is green on this tree and can name a violation', () => {
  it('reports no violation for the repository as it stands', () => {
    expect(checkPlaygroundParity()).toEqual([])
  })

  it('reports a missing surface rather than passing quietly', () => {
    const violations = checkPlaygroundParity(join(ROOT, 'packages/tooling/src/playground'))
    expect(violations.length).toBe(PARITY_TARGETS.length)
    expect(violations.every(v => v.rule === 'exists')).toBe(true)
  })

  it('holds the copy step to the editor stylesheet paths the site links (D3-F7)', () => {
    // The regression: renaming one of these in either file used to pass
    // validate:playground-parity, playground:check, validate:docs-pages AND the
    // site build, while the editor rendered unstyled.
    const text = readFileSync(join(ROOT, 'apps/docs/scripts/sync-playground-assets.mjs'), 'utf8')
    for (const sheet of PLAYGROUND_REPL_STYLESHEETS)
      expect(mentionsAsset(text, sheet), sheet).toBe(true)
    expect(mentionsAsset(text, 'repl/codemirror.css')).toBe(false)
  })

  it('every parity target really does name every contract asset', () => {
    // The gate's own assertion, restated as a test so a passing gate cannot be
    // a gate that scanned nothing.
    for (const rel of PARITY_TARGETS) {
      const text = readFileSync(join(ROOT, rel), 'utf8')
      for (const asset of PLAYGROUND_ASSETS)
        expect(mentionsAsset(text, asset), `${rel} → ${asset}`).toBe(true)
    }
  })
})
