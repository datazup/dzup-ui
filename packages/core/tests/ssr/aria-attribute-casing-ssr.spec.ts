/**
 * The ARIA attribute-casing gate — N1-O1 defect **D5** and N1-O4 finding **E6**.
 *
 * `DzOrderList` bound `:ariaLabel` (camelCase) on its `<ul>` while every sibling
 * attribute on the same element was kebab-cased. In a browser that reaches
 * `aria-label` anyway, through modern ARIA reflection (`el.ariaLabel`), so every
 * jsdom unit test and every Playwright assertion passed. **It is absent from
 * server markup**: SSR serialises the attribute verbatim and lowercases it, so
 * the page arrives with `arialabel="…"`, which means nothing to anything, and
 * the name is missing until hydration.
 *
 * That is a defect class no DOM-based test can see, which is why the gate lives
 * in the SSR lane and has two arms:
 *
 * 1. **The cause** — a source scan over every component template. A camelCase
 *    ARIA *attribute name* is the bug; a camelCase *prop* read inside a binding
 *    value (`:aria-label="ariaLabel"`) is correct and must not be flagged, so
 *    attribute values, interpolations and comments are stripped before the scan.
 * 2. **The symptom** — a scan of real server output, with a seeded component
 *    that binds `:ariaLabel` and MUST be caught. A gate whose failing case is
 *    never exercised is a gate nobody knows is switched off.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE_SRC = resolve(HERE, '../../src')

/**
 * ARIA attributes that appear in this catalogue, spelled the way a camelCase
 * binding serialises them on the server.
 *
 * Used for the output arm. The source arm needs no list — it matches the shape
 * `aria` + an uppercase letter, which is the defect itself.
 */
const LOWERCASED_ARIA_SPELLINGS = [
  'arialabel',
  'arialabelledby',
  'ariadescribedby',
  'ariadescription',
  'ariacontrols',
  'ariaexpanded',
  'ariahaspopup',
  'ariaselected',
  'ariachecked',
  'ariadisabled',
  'ariainvalid',
  'ariarequired',
  'ariacurrent',
  'arialive',
  'ariaatomic',
  'ariabusy',
  'ariahidden',
  'ariaorientation',
  'ariavaluenow',
  'ariavaluemin',
  'ariavaluemax',
  'ariavaluetext',
  'ariaactivedescendant',
  'ariamodal',
  'ariapressed',
  'ariasort',
  'ariamultiselectable',
  'ariaposinset',
  'ariasetsize',
  'arialevel',
  'ariaowns',
  'ariaflowto',
  'ariakeyshortcuts',
  'ariaroledescription',
] as const

/** Every un-hyphenated `aria*` attribute in a rendered HTML string. */
export function lowercasedAriaAttributesIn(html: string): string[] {
  const found = new Set<string>()
  for (const spelling of LOWERCASED_ARIA_SPELLINGS) {
    if (new RegExp(`[\\s"']${spelling}=`, 'i').test(html))
      found.add(spelling)
  }
  return [...found].sort()
}

function collectVueFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      collectVueFiles(path, out)
    else if (entry.endsWith('.vue'))
      out.push(path)
  }
  return out
}

/**
 * The `<template>` block with everything that is *not* an attribute name
 * removed: quoted attribute values (where a camelCase prop is correct),
 * `{{ }}` interpolations and comments.
 */
export function attributeSurfaceOf(source: string): string {
  const start = source.indexOf('\n<template>')
  if (start === -1)
    return ''
  const end = source.lastIndexOf('</template>')
  if (end === -1)
    return ''

  return source
    .slice(start, end)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/"[^"]*"/g, ' ')
    .replace(/'[^']*'/g, ' ')
}

/** camelCase ARIA attribute NAMES bound in a template. */
export function camelCaseAriaAttributesIn(source: string): string[] {
  const surface = attributeSurfaceOf(source)
  const found = new Set<string>()
  for (const match of surface.matchAll(/[\s:.](aria[A-Z][A-Za-z]*)/g))
    found.add(match[1]!)
  return [...found].sort()
}

async function ssr(component: Parameters<typeof h>[0], props: Record<string, unknown> = {}): Promise<string> {
  const app = createSSRApp({ render: () => h(component, props) })
  return renderToString(app)
}

describe('e6/D5 — the cause: no component binds a camelCase ARIA attribute', () => {
  const files = collectVueFiles(CORE_SRC)

  it('scans the whole catalogue', () => {
    // A scan that silently found nothing to scan is the failure mode this
    // assertion exists to prevent.
    expect(files.length).toBeGreaterThan(200)
  })

  it('defect D5 -- every ARIA attribute in every template is kebab-cased', () => {
    const offenders = files
      .map(path => ({ path: relative(CORE_SRC, path), names: camelCaseAriaAttributesIn(readFileSync(path, 'utf8')) }))
      .filter(entry => entry.names.length > 0)

    expect(
      offenders,
      'A camelCase ARIA attribute only reaches the accessibility tree through '
      + 'browser ARIA reflection. It is ABSENT from server-rendered markup, so '
      + 'every DOM-based test passes and the name is missing until hydration '
      + '(N1-O1 defect D5, N1-O4 finding E6). Spell it `aria-…`.',
    ).toEqual([])
  })

  it('defect D5 -- the scanner reads attribute NAMES, not binding values', () => {
    // `:aria-label="ariaLabel"` is the CORRECT idiom, used by ~90 components.
    // A scanner that flagged it would be switched off within a day.
    expect(camelCaseAriaAttributesIn('\n<template>\n  <ul :aria-label="ariaLabel" />\n</template>')).toEqual([])
    expect(camelCaseAriaAttributesIn('\n<template>\n  <ul :aria-label="ariaLabel ?? fallback" />\n</template>')).toEqual([])
    expect(camelCaseAriaAttributesIn('\n<template>\n  <ul>{{ ariaLabel }}</ul>\n</template>')).toEqual([])
    expect(camelCaseAriaAttributesIn('\n<template>\n  <!-- ariaLabel -->\n  <ul />\n</template>')).toEqual([])
  })

  it('defect D5 -- the scanner catches the defect as DzOrderList actually shipped it', () => {
    // The exact line, from `51dec93`.
    expect(camelCaseAriaAttributesIn('\n<template>\n  <ul :ariaLabel="ariaLabel" />\n</template>'))
      .toEqual(['ariaLabel'])
    expect(camelCaseAriaAttributesIn('\n<template>\n  <ul :ariaDescribedby="x" :ariaLabelledby="y" />\n</template>'))
      .toEqual(['ariaDescribedby', 'ariaLabelledby'])
  })
})

describe('e6 — the symptom: no server output carries an un-hyphenated aria attribute', () => {
  it('defect E6 -- the output scanner catches a seeded camelCase binding', async () => {
    // Seeded proof. This component is the defect, rendered by the same renderer
    // the catalogue is rendered by; if this assertion ever goes green the gate
    // below proves nothing.
    const Seeded = { render: () => h('ul', { ariaLabel: 'Reorder controls' }) }
    const html = await ssr(Seeded)

    expect(html).toContain('arialabel=')
    expect(lowercasedAriaAttributesIn(html)).toEqual(['arialabel'])
  })

  it('defect E6 -- the output scanner passes a correctly spelled attribute', async () => {
    const Correct = { render: () => h('ul', { 'aria-label': 'Reorder controls' }) }
    const html = await ssr(Correct)

    expect(html).toContain('aria-label=')
    expect(lowercasedAriaAttributesIn(html)).toEqual([])
  })

  it('defect E6/D5 -- DzOrderList names its list in SERVER markup, not only after hydration', async () => {
    const DzOrderList = (await import('../../src/components/data/DzOrderList.vue')).default
    const html = await ssr(DzOrderList, { items: [{ id: 'a', label: 'A' }], ariaLabel: 'Reorder controls' })

    expect(lowercasedAriaAttributesIn(html)).toEqual([])
    expect(html).toContain('aria-label="Reorder controls"')
  })

  it('defect E6 -- components that take ARIA props emit them hyphenated in server markup', async () => {
    const cases: [string, Promise<{ default: unknown }>, Record<string, unknown>][] = [
      ['DzIconButton', import('../../src/components/buttons/DzIconButton.vue'), { ariaLabel: 'Close', icon: 'span' }],
      ['DzButton', import('../../src/components/buttons/DzButton.vue'), { ariaLabel: 'Save' }],
      ['DzCard', import('../../src/components/cards/DzCard.vue'), { ariaLabel: 'Summary' }],
      ['DzAccordion', import('../../src/components/data/DzAccordion.vue'), { items: [], ariaLabel: 'Sections' }],
      ['DzTree', import('../../src/components/data/DzTree.vue'), { items: [], ariaLabel: 'Files' }],
      ['DzList', import('../../src/components/data/DzList.vue'), { ariaLabel: 'Results' }],
      ['DzProgress', import('../../src/components/feedback/DzProgress.vue'), { value: 40, ariaLabel: 'Upload' }],
      ['DzToolbar', import('../../src/components/layout/DzToolbar.vue'), { ariaLabel: 'Actions' }],
      ['DzBreadcrumb', import('../../src/components/navigation/DzBreadcrumb.vue'), { items: [], ariaLabel: 'Trail' }],
      ['DzPagination', import('../../src/components/navigation/DzPagination.vue'), { total: 10, ariaLabel: 'Pages' }],
    ]

    const offenders: { component: string, attributes: string[] }[] = []
    for (const [name, mod, props] of cases) {
      const component = (await mod).default as Parameters<typeof h>[0]
      const attributes = lowercasedAriaAttributesIn(await ssr(component, props))
      if (attributes.length > 0)
        offenders.push({ component: name, attributes })
    }

    expect(offenders).toEqual([])
  })
})
