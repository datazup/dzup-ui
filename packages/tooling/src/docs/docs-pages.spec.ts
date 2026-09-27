/**
 * Unit tests for the docs-site page renderer (TASK-N2-D1).
 *
 * The cases that matter are the honesty ones: a page must not be able to render
 * an extraction gap as an empty API, must not print an effective default it does
 * not know, and must not let a prop description containing markup break the
 * build. The last of those is a regression test for a real failure — the first
 * VitePress build of this packet died on an unescaped `<span>` in
 * `DzBreadcrumbItem.href`'s description, because the fence tracker never saw a
 * closing fence that lived inside the same array element.
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderComponentSection } from '../llms/render-llms.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  buildNav,
  componentImportLine,
  compoundPartsOf,
  escapeForVue,
  escapeVueText,
  PAGE_COMPONENT_IMPORT_PATH,
  publicComponents,
  renderComponentPage,
  renderComponentsIndex,
  renderFidelity,
  SCRIPT_CLOSE,
  SCRIPT_OPEN,
  splitSection,
  unescapedMarkupLines,
  yamlString,
} from './docs-pages.ts'

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
    // Required on the record since TASK-R5-O3; this fixture predates it and was
    // only compiling because of the cast below. An absent field here is not the
    // same as an empty one — `renderProvider` would have to guess, and a page
    // that says "reads no provider context" about a record that simply has no
    // field would be publishing a claim nobody made.
    providerHooks: [],
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
      eventsModelSynthesised: 0,
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

describe('escapeVueText', () => {
  it('escapes markup so VitePress does not compile a description as a component', () => {
    expect(escapeVueText('Renders as <span> when absent.')).toBe('Renders as &lt;span> when absent.')
  })

  it('escapes mustaches so a description cannot become an interpolation', () => {
    expect(escapeVueText('use {{ value }}')).toBe('use &#123;&#123; value }}')
  })
})

describe('escapeForVue', () => {
  it('leaves fenced code alone — markdown-it already escapes it', () => {
    const out = escapeForVue(['```vue', '<DzButton />', '```'])
    expect(out).toEqual(['```vue', '<DzButton />', '```'])
  })

  it('leaves inline code spans alone', () => {
    expect(escapeForVue(['the `<nav>` landmark'])).toEqual(['the `<nav>` landmark'])
  })

  it('escapes markup outside code', () => {
    expect(escapeForVue(['Renders as <span> when absent.'])).toEqual(['Renders as &lt;span> when absent.'])
  })

  it('closes a fence that arrives inside the SAME array element (the DzBreadcrumb regression)', () => {
    // `render-llms.ts`'s `fenced()` returns opener + body + closer as ONE
    // string. A tracker that only looked at elements would stay "inside a
    // fence" forever and stop escaping the rest of the page.
    const out = escapeForVue([
      '## Usage',
      '```vue\n<DzBreadcrumb />\n```',
      '| `href` | URL. Renders as <span> when absent. |',
    ])
    expect(out.at(-1)).toBe('| `href` | URL. Renders as &lt;span> when absent. |')
    expect(out).toContain('<DzBreadcrumb />')
  })

  // ── TASK-R1-O5, D3-F8: the page-local import channel ──────────────────────
  describe('the generator\'s own <script setup> block', () => {
    const block = [SCRIPT_OPEN, componentImportLine('DzPlayground'), SCRIPT_CLOSE]

    it('passes through unescaped', () => {
      expect(escapeForVue([...block, 'and <span> after'])).toEqual([
        ...block,
        'and &lt;span> after',
      ])
    })

    it('escapes a script block that is not the generator\'s', () => {
      // A description that happens to contain `<script setup>` must not become
      // executable page code. The block is validated as a WHOLE before its
      // first line passes, so an unrecognised body closes the channel.
      const out = escapeForVue([SCRIPT_OPEN, 'globalThis.x = 1', SCRIPT_CLOSE])
      expect(out[0]).toBe('&lt;script setup>')
      expect(out[1]).toBe('globalThis.x = 1')
    })

    it('escapes an unterminated script block instead of swallowing the page', () => {
      const out = escapeForVue([SCRIPT_OPEN, componentImportLine('DzPlayground'), 'after <span>'])
      expect(out[0]).toBe('&lt;script setup>')
      expect(out.at(-1)).toBe('after &lt;span>')
    })

    it('escapes an empty block — it would import nothing', () => {
      expect(escapeForVue([SCRIPT_OPEN, SCRIPT_CLOSE])[0]).toBe('&lt;script setup>')
    })
  })
})

describe('the page-local chrome import (D3-F8)', () => {
  const artifact = JSON.parse(
    readFileSync(join(ROOT, 'packages/core/docs/component-meta.json'), 'utf8'),
  ) as ComponentMetaArtifact

  it('emits an import only on a page that carries the playground tag', () => {
    const withTag = publicComponents(artifact).find(
      c => c.stories?.runnable?.template !== undefined,
    )!
    const withoutTag = publicComponents(artifact).find(
      c => c.stories?.runnable?.template === undefined,
    )!

    const seeded = renderComponentPage({ record: withTag, artifact })
    expect(seeded).toContain(componentImportLine('DzPlayground'))
    expect(seeded.indexOf(SCRIPT_OPEN)).toBeLessThan(seeded.indexOf(`# ${withTag.name}`))

    // A page that only carries a refusal sentence imports nothing and pays
    // nothing — that is the whole point of moving the registration.
    expect(renderComponentPage({ record: withoutTag, artifact }))
      .not
      .toContain(componentImportLine('DzPlayground'))
  })

  it('imports by a path that resolves from apps/docs/components/', () => {
    const target = resolve(
      ROOT,
      'apps/docs/components',
      `${PAGE_COMPONENT_IMPORT_PATH}/DzPlayground.vue`,
    )
    expect(existsSync(target)).toBe(true)
  })

  it('is not ALSO registered globally — one channel, not two', () => {
    // Two registrations would put the chrome back in the shared `theme` chunk
    // and the page-local import would be dead weight, which is the shape D3-F8
    // is about: a cost nobody can see.
    const themeEntry = readFileSync(resolve(ROOT, 'apps/docs/.vitepress/theme/index.ts'), 'utf8')
    expect(themeEntry).not.toMatch(/app\.component\(\s*'DzPlayground'/)
  })
})

describe('yamlString', () => {
  it('quotes and escapes so front matter cannot be broken by a description', () => {
    expect(yamlString('a "quoted" \\ thing')).toBe('"a \\"quoted\\" \\\\ thing"')
  })
})

describe('splitSection', () => {
  it('splits a rendered section on its own meta-bullet block', () => {
    const section = ['### DzThing', '', 'A thing.', '', '- **Install:** x', '- **Risk tier:** A', '', 'body']
    const { head, meta, rest } = splitSection(section)
    expect(head).toEqual(['### DzThing', '', 'A thing.', ''])
    expect(meta).toEqual(['- **Install:** x', '- **Risk tier:** A'])
    expect(rest).toEqual(['', 'body'])
  })
})

describe('renderFidelity', () => {
  it('states an extraction gap as a gap, never as an empty API', () => {
    const record = makeRecord({ name: 'DzAccordion' })
    const out = renderFidelity(record).join('\n')
    expect(out).toContain('Extraction gap')
    expect(out).toContain('do not read the absence above as an empty API')
    expect(out).toContain('packages/core/src/components/buttons/DzThing.types.ts')
  })

  it('states "nothing to extract" for a component that genuinely declares nothing', () => {
    const record = makeRecord({ typesSource: undefined })
    const out = renderFidelity(record).join('\n')
    expect(out).toContain('Nothing to extract')
    expect(out).not.toContain('Extraction gap')
  })

  it('distinguishes "emits nothing" from "has undescribed events"', () => {
    // A bare sub-part that declares no API at all: here 0 really does mean none.
    const silent = renderFidelity(makeRecord({ typesSource: undefined })).join('\n')
    expect(silent).toContain('the component emits nothing')

    const noisy = renderFidelity(makeRecord({
      events: [{
        name: 'update:modelValue',
        type: '[value: string]',
        signature: '',
        description: '',
        descriptionSource: 'none',
        modelDerived: true,
      }],
      extraction: { ...makeRecord().extraction, events: 1, eventsModelDerived: 1 },
    })).join('\n')
    expect(noisy).not.toContain('the component emits nothing')
    expect(noisy).toContain('synthesised by `defineModel`')
  })

  it('names the props that declare undefined rather than hiding them in a total', () => {
    const record = makeRecord({
      props: [{
        name: 'variant',
        type: 'ButtonVariant | undefined',
        required: false,
        default: 'undefined',
        description: 'The variant.',
        descriptionSource: 'vue-component-meta',
      }],
      extraction: { ...makeRecord().extraction, props: 1, propsWithDescription: 1, propsWithDeclaredDefault: 1 },
    })
    expect(renderFidelity(record).join('\n')).toContain('1 declare `undefined`')
  })

  it('says so when a public component has no published example', () => {
    expect(renderFidelity(makeRecord()).join('\n')).toContain('No published example')
  })
})

describe('renderComponentPage', () => {
  it('reuses renderComponentSection verbatim — the tables are not re-derived here', () => {
    const record = makeRecord({
      props: [{
        name: 'variant',
        type: 'ButtonVariant | undefined',
        required: false,
        default: 'undefined',
        description: 'The variant.',
        descriptionSource: 'vue-component-meta',
      }],
      extraction: { ...makeRecord().extraction, props: 1, propsWithDescription: 1, propsWithDeclaredDefault: 1 },
    })
    const artifact = makeArtifact([record])
    const page = renderComponentPage({ record, artifact })
    // Every row the shared renderer produces must appear on the page unchanged.
    for (const line of renderComponentSection(record, artifact, { level: 1, memberHeadingLevel: 2 })) {
      if (line.startsWith('| `variant`'))
        expect(page).toContain(line)
    }
    expect(page).toContain('| Prop | Type | Required | Declared default | Description |')
    expect(page).toContain('Declared default')
    // Never the effective default.
    expect(page).not.toContain('| `solid` |')
  })

  it('merges hand-written prose under its own heading and marks it as hand-written', () => {
    const record = makeRecord()
    const page = renderComponentPage({
      record,
      artifact: makeArtifact([record]),
      usageProse: 'Prefer tone for meaning.',
    })
    expect(page).toContain('## Usage notes')
    expect(page).toContain('Prefer tone for meaning.')
    expect(page).toContain('hand-written prose, merged from')
  })

  it('nests compound parts inside the parent page instead of giving them pages', () => {
    const parent = makeRecord({ name: 'DzCard' })
    const part = makeRecord({
      name: 'DzCardBody',
      kind: 'compound-part',
      parentComponent: 'DzCard',
      typesSource: undefined,
    })
    const artifact = makeArtifact([parent, part])
    expect(compoundPartsOf(parent, artifact).map(p => p.name)).toEqual(['DzCardBody'])
    expect(publicComponents(artifact).map(c => c.name)).toEqual(['DzCard'])
    const page = renderComponentPage({ record: parent, artifact })
    expect(page).toContain('## Compound parts')
    expect(page).toContain('### DzCardBody')
  })

  it('carries exactly one H1 and a searchable family line', () => {
    const record = makeRecord()
    const page = renderComponentPage({ record, artifact: makeArtifact([record]) })
    expect(page.split('\n').filter(l => l.startsWith('# '))).toHaveLength(1)
    expect(page).toContain('- **Family:** Buttons')
  })
})

describe('renderComponentsIndex', () => {
  it('lists every public component under its family and links to its page', () => {
    const artifact = makeArtifact([
      makeRecord({ name: 'DzButton' }),
      makeRecord({ name: 'DzCard', family: 'cards' }),
      makeRecord({ name: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzCard', family: 'cards' }),
    ])
    const index = renderComponentsIndex(artifact)
    expect(index).toContain('## Buttons')
    expect(index).toContain('[DzButton](./DzButton.md)')
    expect(index).toContain('[DzCard](./DzCard.md)')
    // Compound parts get no page, so they must not be linked as if they had one.
    expect(index).not.toContain('DzCardBody](./DzCardBody.md)')
  })
})

describe('buildNav', () => {
  it('records the artifact fingerprint the site config asserts against', () => {
    const artifact = makeArtifact([makeRecord()])
    const nav = buildNav(artifact, 'cafebabe')
    expect(nav.artifactSha256).toBe('cafebabe')
    expect(nav.groups[0]?.items).toEqual([{ text: 'DzThing', link: '/components/DzThing' }])
  })
})

describe('the real catalog', () => {
  const artifact = JSON.parse(
    readFileSync(join(ROOT, 'packages/core/docs/component-meta.json'), 'utf8'),
  ) as ComponentMetaArtifact

  it('gives every public component a page and no compound part one', () => {
    const pages = publicComponents(artifact)
    expect(pages).toHaveLength(artifact.totals.publicComponents)
    expect(pages.every(c => c.kind === 'public-component')).toBe(true)
  })

  it('attributes every compound part to a component that has a page', () => {
    const paged = new Set(publicComponents(artifact).map(c => c.name))
    const orphans = artifact.components
      .filter(c => c.kind === 'compound-part')
      .filter(c => c.parentComponent === undefined || !paged.has(c.parentComponent))
    expect(orphans.map(c => c.name)).toEqual([])
  })

  it('renders every page without leaving markup that VitePress would compile', () => {
    // Outside fenced blocks and inline code, a `<` is a Vue element start. This
    // is the whole-catalog form of the DzBreadcrumb regression above.
    // The rule lives in `unescapedMarkupLines`, not here. Stating it a second
    // time is D3-F6: the escaper gained a channel and only one copy learned
    // about it — twice, now (the component tag, then the `<script setup>`
    // import block TASK-R1-O5 added).
    for (const record of publicComponents(artifact)) {
      const offenders = unescapedMarkupLines(renderComponentPage({ record, artifact }))
      expect(
        offenders,
        `${record.name}.md carries unescaped markup: ${
          offenders.map(o => `line ${o.line}: ${o.text}`).join(' · ')}`,
      ).toEqual([])
    }
  })
})

describe('honesty regressions found by rendering the real catalog', () => {
  it('does not print "emits nothing" for a component whose extraction failed', () => {
    // DzAccordion's 0/0/0 means UNKNOWN, not NONE. A fidelity table that reads
    // "the component emits nothing" turns an absent measurement into a claim.
    const gap = makeRecord({ name: 'DzAccordion' })
    const out = renderFidelity(gap).join('\n')
    expect(out).not.toContain('the component emits nothing')
    expect(out).not.toContain('the component declares no slots')
    expect(out).toContain('unknown — the extractor recovered nothing')
  })

  it('keeps "emits nothing" for a component that genuinely declares nothing', () => {
    const bare = makeRecord({ typesSource: undefined })
    expect(renderFidelity(bare).join('\n')).toContain('the component emits nothing')
  })

  it('does not publish the usage file\'s authoring note as page content', () => {
    const record = makeRecord()
    const page = renderComponentPage({
      record,
      artifact: makeArtifact([record]),
      usageProse: '<!--\n  PROSE ONLY — do not write a table here.\n-->\n\nUse tone for meaning.',
    })
    expect(page).toContain('Use tone for meaning.')
    expect(page).not.toContain('PROSE ONLY')
    // …and the comment must never arrive escaped into visible text.
    expect(page).not.toContain('&lt;!--')
  })

  it('leaves HTML comments unescaped so they stay invisible', () => {
    expect(escapeForVue(['<!-- a <span> note -->'])).toEqual(['<!-- a <span> note -->'])
    expect(escapeForVue(['<!-- multi', 'line <b>', '-->', 'and <i> after']))
      .toEqual(['<!-- multi', 'line <b>', '-->', 'and &lt;i> after'])
  })
})
