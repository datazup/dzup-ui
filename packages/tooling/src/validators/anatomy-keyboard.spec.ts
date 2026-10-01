import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { checkAnatomyKeyboard, enclosingBlockAt, HANDLER_TOKEN, keyLinesIn, keysNamedIn, PLATFORM_ACTIVATION_TOKEN, readsModifiersAt, rekaKeysFor, renderFunctionNodesIn, specAssertedKeys, stripCommentsForScan, subtreeOf, templateNodesIn } from './anatomy-keyboard.ts'

/**
 * The anatomy keyboard/handler validator, asserted on its own terms
 * (RESIDUAL-12, `D-RES11-2`).
 *
 * Two halves, and the first is the one that matters. `keysNamedIn` is where every
 * false verdict in this validator's development came from — read too loosely it
 * marked a placement comparison (`=== 'bottom-left'`) as a key and reported four
 * keys of drift that do not exist; read too strictly it lost Reka's
 * `MAP_KEY_TO_FOCUS_INTENT`, whose Home/End/PageUp/PageDown are UNQUOTED object
 * keys, and reported `DzTabs` as declaring Home and End with nothing behind them.
 * Both directions are pinned here, because the gate's whole value is that its
 * verdicts can be trusted without re-deriving them.
 */

describe('keysNamedIn — the shapes source uses to talk about a key', () => {
  it('reads a key comparison against `.key` or `.code`', () => {
    expect([...keysNamedIn('if (event.key === \'Enter\') act()').keys()]).toEqual(['Enter'])
    expect([...keysNamedIn('if (e.code !== \'Tab\') return').keys()]).toEqual(['Tab'])
    expect([...keysNamedIn('if (\'Escape\' === event.key) close()').keys()]).toEqual(['Escape'])
  })

  it('reads the space bar, which is the key most easily missed', () => {
    expect([...keysNamedIn('if (event.key === \' \') toggle()').keys()]).toEqual([' '])
    expect([...keysNamedIn('case \' \':').keys()]).toEqual([' '])
    expect([...keysNamedIn('const keys = [\' \', \'Enter\']').keys()]).toContain(' ')
    expect([...keysNamedIn('@keydown.space.prevent="toggle"').keys()]).toEqual([' '])
    expect([...keysNamedIn('withKeys(withModifiers(toggle, ["prevent"]), ["enter"])').keys()]).toEqual(['Enter'])
  })

  it('does NOT read a free-form string comparison as a key', () => {
    // The exact regression: DzSpeedDial compares a placement, not a key.
    const found = keysNamedIn('const y = props.position === \'bottom-left\' ? 1 : 0')
    expect([...found.keys()]).toEqual([])
  })

  it('does NOT read `join(\' \')` as handling the space bar', () => {
    // The other exact regression: eight forms components share this line and
    // every one of them was reported as handling an undeclared Space.
    expect([...keysNamedIn('return parts.length > 0 ? parts.join(\' \') : undefined').keys()]).toEqual([])
    expect([...keysNamedIn('head = head.replace(/\\s/g, \' \')').keys()]).toEqual([])
  })

  it('reads an UNQUOTED object-literal key, which is how Reka spells its key map', () => {
    const map = 'const MAP_KEY_TO_FOCUS_INTENT = { ArrowLeft: "prev", PageUp: "first", Home: "first", End: "last" };'
    const found = keysNamedIn(map)
    expect([...found.keys()].sort()).toEqual(['ArrowLeft', 'End', 'Home', 'PageUp'])
  })

  it('reads a one-name-per-line array, including its last element', () => {
    // Reka's compiled `Slider/utils.js` shape. Without the end-of-line
    // alternative the final entry reads as absent, which is how `DzSlider`'s
    // ArrowRight was reported unbacked while its three siblings were not.
    const found = keysNamedIn('const ARROW_KEYS = [\n"ArrowUp",\n"ArrowDown",\n"ArrowLeft",\n"ArrowRight"\n]')
    expect([...found.keys()].sort()).toEqual(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'])
  })

  it('reads Reka\'s `kbd.*` constants', () => {
    expect([...keysNamedIn('if (event.key === kbd.END) last()').keys()].sort()).toEqual(['End'])
    expect([...keysNamedIn('kbd.SPACE').keys()]).toEqual([' '])
  })

  it('reads the two placeholder classes from the shapes that mean them', () => {
    expect([...keysNamedIn('if (event.key.length === 1) search(event.key)').keys()]).toContain('<character>')
    expect([...keysNamedIn('const { search } = useTypeahead()').keys()]).toContain('<character>')
  })

  it('records the first line each key appears on, so a verdict can be opened', () => {
    expect(keysNamedIn('const a = 1\nconst b = 2\nif (e.key === \'Home\') go()').get('Home')).toBe(3)
  })
})

describe('templateNodesIn — the nodes the platform route is scoped to', () => {
  const sfc = [
    '<script setup lang="ts">const a = 1</script>',
    '',
    '<template>',
    '  <span data-part="root" :tabindex="closable ? 0 : undefined">',
    '    <slot />',
    '    <button v-if="closable" data-part="close" type="button" />',
    '  </span>',
    '</template>',
  ].join('\n')

  it('reads the tag, the static part and which node is the root', () => {
    const nodes = templateNodesIn(sfc)
    expect(nodes.map(n => n.tag)).toEqual(['span', 'slot', 'button'])
    expect(nodes[0]).toMatchObject({ tag: 'span', part: 'root', root: true })
    expect(nodes[2]).toMatchObject({ tag: 'button', part: 'close', root: false })
  })

  it('reads nothing from a file with no template', () => {
    expect(templateNodesIn('export const anatomy = {}')).toEqual([])
  })
})

describe('renderFunctionNodesIn — the elements a render function builds (RESIDUAL-13)', () => {
  /**
   * `DzAnchor`-shaped source: a recursive render function, a **one-line** props
   * object on the `<ul>`, and a nested `style` object on the `<a>`. Every shape
   * that broke a draft of the reader is in this one fixture — the one-line object
   * cost the `<ul>` its `data-part`, and the nested object very nearly turned
   * `paddingInlineStart` into an attribute.
   */
  const anchorish = `
function renderList(list, level) {
  return h(
    'ul',
    { 'class': cn(list()), 'data-part': 'list', 'data-level': level },
    list.map(item => h('li', { key: item.href }, [
      h(
        'a',
        {
          'href': url.href,
          'data-part': 'item',
          'style': {
            paddingInlineStart: 'calc(var(--dz-anchor-indent) * 2)',
          },
          'aria-current': isActive ? 'location' : undefined,
        },
        item.label,
      ),
    ])),
  )
}
`

  it('turns each element into the opening tag it produces, so the platform table can read it', () => {
    const nodes = renderFunctionNodesIn(anchorish)
    expect(nodes.map(n => n.tag)).toEqual(['ul', 'li', 'a'])
    const link = nodes.find(n => n.tag === 'a')!
    expect(link.text).toContain('href=""')
    expect(link.text).toContain('data-part="item"')
  })

  it('keeps a data-part literal, because that is what scopes a row to a node', () => {
    // A `data-part` whose value is a string literal keeps it; every other
    // attribute becomes presence-only, because the platform table asks whether an
    // `<a>` has an `href` at all and not what it is.
    expect(renderFunctionNodesIn(anchorish).map(n => n.part)).toEqual(['list', undefined, 'item'])
  })

  it('does NOT read a nested object literal as attributes of the element', () => {
    // `style: { paddingInlineStart: … }` is a property of the style object, not an
    // attribute of the element. Read at the wrong level it becomes
    // `paddingInlineStart=""`, which is harmless here and would not be if a
    // nested key were ever named `href`.
    const link = renderFunctionNodesIn(anchorish).find(n => n.tag === 'a')!
    expect(link.text).not.toContain('paddingInlineStart')
  })

  it('never claims a render-function element is the component root', () => {
    // The root is the first node of the TEMPLATE. A render-function element is
    // something the template renders into, and marking one as the root would let
    // it answer an unscoped row that belongs to the real root.
    expect(renderFunctionNodesIn(anchorish).every(n => !n.root)).toBe(true)
  })

  it('ignores a component, because guessing what it renders is the assumption this gate refuses', () => {
    expect(renderFunctionNodesIn('h(DzButton, { onClick: go })')).toEqual([])
  })

  it('reads nothing from a file with no render function', () => {
    expect(renderFunctionNodesIn('export const anatomy = { parts: ["root"] }')).toEqual([])
  })
})

describe('rekaKeysFor — ownership derived from the dependency, not from memory', () => {
  it('resolves a roving-focus group to the keys its own source names', () => {
    const resolved = rekaKeysFor('RovingFocusGroup')
    expect(resolved).toBeDefined()
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'])
      expect([...resolved!.keys.keys()]).toContain(key)
    // The citation is a real file, not a label.
    expect(resolved!.keys.get('Home')).toMatch(/^node_modules\/reka-ui\/dist\/.+:\d+$/)
  })

  it('reports the native element a primitive renders, which is how <button> keys are owned', () => {
    const resolved = rekaKeysFor('SwitchRoot')
    expect(resolved?.natives.some(n => n.keys.includes(' '))).toBe(true)
  })

  it('does not treat `useKbd` as an owner, because it is a dictionary', () => {
    // `useKbd()` returns every KeyboardEvent.key name there is. Harvesting it
    // would make every primitive that imports it the owner of every key, which
    // is the one verdict this validator must never produce.
    const resolved = rekaKeysFor('Label')
    expect(resolved).toBeDefined()
    expect([...(resolved?.keys.keys() ?? [])]).not.toContain('PageDown')
  })

  it('returns undefined for a name that is not a primitive', () => {
    expect(rekaKeysFor('ChevronDown')).toBeUndefined()
  })
})

describe('the catalogue report', () => {
  const report = checkAnatomyKeyboard()

  it('walks the same population the catalogue-wide keyboard spec walks', () => {
    // `quality/keyboard-contract.spec.ts` asserts these three numbers from its
    // own walk. Two independent walks agreeing is what makes the population
    // claim checkable rather than a coincidence of one glob.
    expect(report.totals.declarations).toBe(104)
    expect(report.totals.explicitNone).toBe(19)
    expect(report.totals.withBindings).toBe(85)
  })

  it('gives every declared row exactly one verdict', () => {
    expect(report.totals.backed + report.totals.unbacked + report.totals.undetermined)
      .toBe(report.totals.rows)
    expect(report.verdicts).toHaveLength(report.totals.rows)
  })

  it('cites an openable file for every backed row', () => {
    const uncited = report.verdicts.filter(v => v.verdict === 'backed'
      && (v.owner === undefined || v.owner.citation.length === 0))
    expect(uncited).toEqual([])
  })

  it('gives every undetermined row a reason, never a blank', () => {
    const silent = report.verdicts.filter(v => v.verdict === 'undetermined'
      && (v.unresolved === undefined || v.unresolved.length === 0))
    expect(silent).toEqual([])
  })

  it('never resolves a NAVIGATION key through the platform route', () => {
    // A declared arrow, Home, End or Page key is a claim about roving focus or a
    // listbox, and that always takes code. Crediting it to a nearby `<select>`
    // is the "satisfied because something probably does it" verdict the gate
    // exists to refuse.
    const wrong = report.verdicts.filter(v => v.verdict === 'backed'
      && v.owner?.route === 'platform'
      && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(v.key))
    expect(wrong.map(v => `${v.component} ${v.key}`)).toEqual([])
  })

  it('holds DzChip and DzTag to the same keyboard contract', () => {
    // RESIDUAL-11 §3.2 established that these two roots are identical. The
    // Enter/Space rows both used to carry were removed together in RESIDUAL-12,
    // and this is what stops one of them coming back alone.
    const keysOf = (name: string): string[] => report.verdicts
      .filter(v => v.component === name)
      .map(v => `${v.key}|${v.when ?? ''}`)
      .sort()
    expect(keysOf('DzChip')).toEqual(keysOf('DzTag'))
    expect(keysOf('DzChip')).toEqual(['Backspace|closable', 'Delete|closable'])
  })

  it('is at or under every checked-in ceiling', () => {
    expect(report.totals.unbacked).toBeLessThanOrEqual(report.ceilings.maxUnbackedDeclarations)
    expect(report.totals.undetermined).toBeLessThanOrEqual(report.ceilings.maxUndeterminedDeclarations)
    expect(report.undeclaredHandlers.length).toBeLessThanOrEqual(report.ceilings.maxUndeclaredHandlers)
    expect(report.violations).toEqual([])
  })

  it('keeps the reverse drift at zero — the ceiling with no reading above it', () => {
    expect(report.ceilings.maxUndeclaredHandlers).toBe(0)
    expect(report.undeclaredHandlers).toEqual([])
  })

  it('every backed row resolved through the runtime `spec` route is one source could not see', () => {
    // RESIDUAL-13's seventh route, and the guard on the only way it could be
    // abused: it may turn `undetermined` into `backed` and must never reach a row
    // whose closure resolved completely. Every `spec` verdict therefore has to be
    // on a component that renders a `<slot />`, and its citation has to be a spec.
    const viaSpec = report.verdicts.filter(v => v.owner?.route === 'spec')
    expect(viaSpec.length).toBeGreaterThan(0)
    for (const verdict of viaSpec)
      expect(verdict.owner?.citation, verdict.component).toMatch(/\.spec\.ts:\d+$/)
  })

  it('closes both ratchets at zero, which is what RESIDUAL-13 was for', () => {
    expect(report.ceilings.maxUnbackedDeclarations).toBe(0)
    expect(report.ceilings.maxUndeterminedDeclarations).toBe(0)
    expect(report.totals.unbacked).toBe(0)
    expect(report.totals.undetermined).toBe(0)
  })
})

/**
 * RESIDUAL-14 — a citation has to support the CLAIM, not merely contain the key.
 *
 * Every case below is written the way RESIDUAL-05 wrote its citation tests: the
 * **old predicate is reconstructed inline and shown to accept something wrong**, then
 * the shipped predicate is shown to reject it. Seeding the old rule back into source
 * would prove the same thing once; proving it here proves it on every run, and the
 * fixtures are the real shapes the census found, not invented ones.
 */
describe('a comment is not evidence (RESIDUAL-14)', () => {
  /** `useComponentMessages.ts`, reduced to the two lines that mattered. */
  const I18N_COMPOSABLE = `/**
 * One component's messages, resolved against the application's catalog.
 *
 * @example
 * \`\`\`vue
 * <template>
 *   <button :aria-label="dzMessages.clear" />
 * </template>
 * \`\`\`
 */
export function useComponentMessages(component: string): Messages {
  return resolve(component)
}
`

  it('the OLD predicate read a docblock @example as a template and found a <button> in it', () => {
    // `indexOf('<template>')` over the raw source — exactly what shipped.
    const open = I18N_COMPOSABLE.indexOf('<template>')
    expect(open).toBeGreaterThan(-1)
    expect(I18N_COMPOSABLE.slice(open)).toContain('<button')
    // And that is how six rows across DzAnchor, DzBreadcrumb and DzSidebar were
    // `backed` by a file that renders nothing.
  })

  it('the NEW predicate finds no template in it at all', () => {
    expect(templateNodesIn(stripCommentsForScan(I18N_COMPOSABLE, false))).toEqual([])
    // Both halves are load-bearing and each is asserted on its own below.
  })

  it('only a top-level SFC template block anchors the scan', () => {
    expect(templateNodesIn(' * <template>\n *   <button />')).toEqual([])
    expect(templateNodesIn('<template>\n  <button type="button" />\n</template>')).toHaveLength(1)
  })

  it('blanks a comment and keeps every line, so a citation stays openable', () => {
    const source = '/**\n * <button />\n */\nconst a = 1\n'
    const code = stripCommentsForScan(source, false)
    expect(code.split('\n')).toHaveLength(source.split('\n').length)
    expect(code).not.toContain('<button')
    expect(code.split('\n')[3]).toBe('const a = 1')
  })

  it('reports a template node at its FILE line, not at a body offset', () => {
    // The defect behind 39 of 61 platform citations: `DzButton.vue:2` was an
    // `import type` line and the node was at 190.
    const sfc = ['<script setup lang="ts">', 'const a = 1', '</script>', '', '<template>', '  <button />', '</template>'].join('\n')
    expect(templateNodesIn(sfc)[0]!.line).toBe(6)
  })

  it('strips a Vue template comment without a JS scanner touching the markup', () => {
    const sfc = '<template>\n  <!-- <button /> a /* b -->\n  <div data-part="root" />\n</template>'
    const nodes = templateNodesIn(stripCommentsForScan(sfc, true))
    expect(nodes.map(n => n.tag)).toEqual(['div'])
  })

  it('a prose sentence naming a key grants nothing', () => {
    // `DzDatePicker.vue:149`: "…does specify Home and End: the first and last day".
    const docblock = ' * APG `grid` for a date-picker dialog does specify Home and End: the day\n'
    expect([...keysNamedIn(docblock).keys()]).toContain('End')
    expect([...keysNamedIn(stripCommentsForScan(`/**\n${docblock} */\n`, false)).keys()]).toEqual([])
  })
})

describe('a declared modifier is part of the contract (RESIDUAL-14)', () => {
  /** `DzCalendar.vue`'s page-key arm, which no `shiftKey` goes anywhere near. */
  const CALENDAR = ['function onKeydown(event: KeyboardEvent): void {', '  switch (event.key) {', '    case \'PageUp\':', '      next = cur.subtract({ months: 1 })', '      break', '  }', '}'].join('\n')

  it('the OLD predicate keyed on the key alone, so Shift+PageUp was the PageUp handler', () => {
    expect(keysNamedIn(CALENDAR).get('PageUp')).toBe(3)
    // `ownerOf` received `binding.key` and never `binding.modifiers`, so the row
    // "Move to the previous year." was backed by "subtract one month".
  })

  it('the NEW predicate refuses a site that never looks at the modifier', () => {
    expect(readsModifiersAt(CALENDAR, 3, ['Shift'])).toBe(false)
    expect(readsModifiersAt(CALENDAR, 3, [])).toBe(true)
  })

  it('accepts a modifier read in the enclosing block, including its opening line', () => {
    // `DzCommandPalette.vue:172` reads both modifiers in the `if (…) {` header.
    const palette = ['function handleKeydown(event: KeyboardEvent): void {', '  if ((event.metaKey || event.ctrlKey) && event.key === \'k\') {', '    open.value = !open.value', '  }', '}'].join('\n')
    expect(readsModifiersAt(palette, 2, ['Meta'])).toBe(true)
    expect(readsModifiersAt(palette, 2, ['Control'])).toBe(true)
    expect(readsModifiersAt(palette, 2, ['Alt'])).toBe(false)
  })

  it('does not accept a modifier read in a DIFFERENT function of the same file', () => {
    // `DzOrderList.vue` reads `altKey` once, in `typeAhead`, where it REJECTS the
    // key — and the cited arrow arm is another function entirely.
    const orderList = [
      'function typeAhead(event: KeyboardEvent): boolean {',
      '  if (!printable || event.altKey) return false',
      '  return true',
      '}',
      'function onItemKeydown(event: KeyboardEvent): void {',
      '  switch (event.key) {',
      '    case \'ArrowUp\':',
      '      moveGrabbed(-1)',
      '  }',
      '}',
    ].join('\n')
    expect(orderList).toContain('altKey')
    expect(readsModifiersAt(orderList, 7, ['Alt'])).toBe(false)
  })

  it('takes the INNERMOST enclosing block', () => {
    const source = ['function outer() {', '  if (event.shiftKey) {', '    noop()', '  }', '  inner()', '}'].join('\n')
    expect(enclosingBlockAt(source, 3)).toContain('shiftKey')
    expect(enclosingBlockAt(source, 5)).toContain('inner()')
    expect(enclosingBlockAt(source, 5)).toContain('shiftKey')
  })
})

describe('the residue, recorded as data and enforced (RESIDUAL-14)', () => {
  const report = checkAnatomyKeyboard()

  it('no backed row is cited to a site the ledger rejects for it', () => {
    const ledger = JSON.parse(
      readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'anatomy-keyboard-rejected-citations.json'), 'utf8'),
    ) as { rejected: { component: string, key: string, when?: string, citations: string[] }[] }
    const offenders: string[] = []
    for (const verdict of report.verdicts) {
      if (verdict.verdict !== 'backed')
        continue
      for (const entry of ledger.rejected) {
        if (entry.component !== verdict.component || entry.key !== verdict.key)
          continue
        if ((entry.when ?? '') !== (verdict.when ?? ''))
          continue
        for (const rejected of entry.citations) {
          const hit = rejected.endsWith('**')
            ? verdict.owner!.citation.startsWith(rejected.slice(0, -2))
            : rejected.endsWith(':*')
              ? verdict.owner!.citation.startsWith(rejected.slice(0, -1))
              : verdict.owner!.citation === rejected
          if (hit)
            offenders.push(`${verdict.component} \`${verdict.key}\` → ${verdict.owner!.citation}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('every ledger entry carries the reason a reader has to be able to check', () => {
    const ledger = JSON.parse(
      readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'anatomy-keyboard-rejected-citations.json'), 'utf8'),
    ) as { rejected: { component: string, key: string, citations: string[], why: string }[] }
    expect(ledger.rejected.length).toBeGreaterThan(0)
    for (const entry of ledger.rejected) {
      expect(entry.citations.length).toBeGreaterThan(0)
      // Long enough to be a reason rather than a label. The census's shortest real
      // entry is a cross-reference to a sibling, so the floor is deliberately low.
      expect(entry.why.length).toBeGreaterThan(20)
    }
  })

  it('records every line a key is named on, so rejecting one does not lose the file', () => {
    // `DzOrderList.vue` names the space bar twice: at the type-ahead's EXCLUSION of
    // it, and at the `case ' ':` that grabs the item.
    const source = ['const printable = event.key.length === 1 && event.key !== \' \'', 'x()', 'switch (k) {', '  case \' \':', '    toggleGrab(i)', '}'].join('\n')
    expect(keyLinesIn(source).get(' ')).toEqual([1, 4])
    expect(keysNamedIn(source).get(' ')).toBe(1)
  })
})

describe('the node has to be able to be the element claimed (RESIDUAL-14)', () => {
  it('the OLD predicate credited any dynamic component with <button> activation', () => {
    const cell = '<component :is="header ? \'th\' : \'td\'" data-part="cell">'
    expect(/<\s*component\s[^>]*\bis=/.test(cell)).toBe(true)
    // Which is how `DzTable`'s three sortable-header rows were backed, on a
    // component whose own types file says sorting belongs to `DzDataGrid`.
  })

  it('the NEW predicate reads the expression', () => {
    expect(PLATFORM_ACTIVATION_TOKEN.test('<component :is="header ? \'th\' : \'td\'" data-part="cell">')).toBe(false)
    expect(PLATFORM_ACTIVATION_TOKEN.test('<component :is="collapsible ? \'button\' : \'div\'">')).toBe(true)
    expect(PLATFORM_ACTIVATION_TOKEN.test('<component :is="computedTag" :id="id">')).toBe(true)
    expect(PLATFORM_ACTIVATION_TOKEN.test('<button type="button">')).toBe(true)
  })
})

describe('a missed owner produces a worse owner, not no owner (RESIDUAL-14)', () => {
  it('the OLD handler token could not see `handleHeaderKeyDown`', () => {
    expect(/\bkeydown\b/.test('function handleHeaderKeyDown(event) {}')).toBe(false)
    expect(/\bkeydown\b/i.test('function handleHeaderKeyDown(event) {}')).toBe(false)
    // So `useDataGridHeader.ts` was invisible to routes 1–4 and `DzDataGrid`'s three
    // sort rows fell to route 5, which gave them a Checkbox and a Select primitive.
  })

  it('the NEW one does, and the real owner is cited', () => {
    expect(HANDLER_TOKEN.test('function handleHeaderKeyDown(event) {}')).toBe(true)
    const report = checkAnatomyKeyboard()
    const sort = report.verdicts.filter(v => v.component === 'DzDataGrid' && v.when === 'header')
    expect(sort).not.toHaveLength(0)
    for (const row of sort) {
      expect(row.verdict).toBe('backed')
      expect(row.owner!.citation).toContain('useDataGridHeader')
    }
  })
})

describe('a part-scoped row is about the part it names (RESIDUAL-14)', () => {
  it('a part whose subtree binds a handler still admits the handler routes', () => {
    // `DzDataGrid`'s sort rows are scoped to `header`, which is a `<thead>`; the
    // `@keydown` is on a `<th>` inside it.
    const thead = ['<thead data-part="header">', '  <th @keydown="onSort($event)" />', '</thead>'].join('\n')
    const node = templateNodesIn(`<template>\n${thead}\n</template>`)[0]!
    expect(node.part).toBe('header')
    expect(subtreeOf(`<template>\n${thead}\n</template>`, node)).toContain('@keydown')
  })

  it('a self-closing part encloses only itself, so a handler further down is not inside it', () => {
    const markup = ['<template>', '  <button data-part="action" @click="move" />', '  <div @keydown="elsewhere" />', '</template>'].join('\n')
    const action = templateNodesIn(markup).find(n => n.part === 'action')!
    expect(subtreeOf(markup, action)).not.toContain('@keydown')
  })
})

/**
 * RESIDUAL-15 — the `Tab` rows, and the one widening of route 7.
 *
 * The other RESIDUAL-14 cases above tighten: the old predicate is reconstructed and
 * shown accepting something wrong. These do the opposite direction of the same job,
 * because this change WIDENS the resolution rather than narrowing it — so what has
 * to be pinned is that it widens by exactly one key, that it still refuses prose,
 * and that the live report lands where it claims to.
 */
describe('a tab-order assertion evidences a Tab row (RESIDUAL-15)', () => {
  /**
   * The real pipeline, not a shortcut: the declaration loop feeds
   * `specAssertedKeys` the output of `stripCommentsForScan`, so a case that passed
   * raw source would be testing a function nothing calls that way.
   */
  const asserted = (source: string) => specAssertedKeys(stripCommentsForScan(source, false))

  it('the route RESIDUAL-14 scheduled could not have worked: `platform` credits no navigation key', () => {
    // `PLATFORM_OWNERS` in `@dzup-ui/testing`'s keyboard.ts lists activation and
    // text entry only and says so in its own docblock. No entry names `Tab`, so
    // `platform: ['Tab']` throws rather than passing — which is why the five
    // remaining `Tab` rows needed an assertion of their own instead.
    const runtime = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), '../../../testing/src/keyboard.ts'),
      'utf8',
    )
    const owners = runtime.slice(runtime.indexOf('const PLATFORM_OWNERS'), runtime.indexOf('export function checkKeyboardContract'))
    expect(owners).not.toContain('\'Tab\'')
    // The table's own docblock says why, which is the part that must not be
    // quietly reversed by a later hand: it is a deliberate refusal, not a gap.
    expect(runtime).toContain('activation and text entry only, **never navigation**')
  })

  it('credits `Tab`, and only `Tab`, from a `tabStops` option', () => {
    const spec = [
      'expectKeyboardContract(wrapper, anatomy, {',
      '  tabStops: { of: \'[role="checkbox"]\', expect: \'each\' },',
      '})',
    ].join('\n')
    const found = asserted(spec)
    expect([...found.keys()]).toEqual(['Tab'])
    expect(found.get('Tab')).toBe(2)
  })

  it('grants nothing for the word alone, nor for a sentence about it', () => {
    // The third shape of the defect RESIDUAL-14 found twice: prose whose meaning is
    // that the assertion would NOT hold. `source` reaches `specAssertedKeys` already
    // comment-stripped, and the option is anchored on its opening brace, so neither
    // a bare mention nor a comment is an assertion.
    expect([...asserted('expectKeyboardContract(w, a, {})\n// a tabStops assertion would be false here').keys()])
      .toEqual([])
    expect([...asserted('expectKeyboardContract(w, a, {})\nconst tabStops = (w) => w.findAll(\'button\')').keys()])
      .toEqual([])
  })

  it('needs the call as well as the option, because the route cites a check that RUNS', () => {
    expect([...asserted('checkSomethingElse(w, { tabStops: { of: \'button\', expect: \'one\' } })').keys()])
      .toEqual([])
  })

  it('the five Tab rows are backed through the spec route, each citing a real spec line', () => {
    const report = checkAnatomyKeyboard()
    const tabs = report.verdicts.filter(v => v.key === 'Tab' && v.owner?.route === 'spec')
    expect(tabs.map(v => v.component).sort()).toEqual([
      'DzCheckboxGroup',
      'DzInfiniteScroll',
      'DzRadioGroup',
      'DzStepper',
      'DzToolbar',
    ])
    for (const row of tabs) {
      expect(row.verdict).toBe('backed')
      expect(row.owner!.citation, row.component).toMatch(/\.spec\.ts:\d+$/)
    }
  })
})

describe('dzDataGrid navigates its cells (RESIDUAL-15, D-RES14-1)', () => {
  const report = checkAnatomyKeyboard()

  it('every declared cell row is owned by the grid family, not by a Reka primitive', () => {
    const cellKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']
    const rows = report.verdicts.filter(v => v.component === 'DzDataGrid' && v.when === undefined)
    expect(rows.map(v => v.key).sort()).toEqual([...cellKeys].sort())
    for (const row of rows) {
      expect(row.verdict, row.key).toBe('backed')
      // The whole point of `D-RES14-1`: the old citation was
      // `reka-ui/dist/RovingFocus/utils.js`, reached through a row-selection
      // checkbox, and the family imports no Reka primitive at all.
      expect(row.owner!.citation, row.key).toContain('useDataGridNavigation')
      expect(row.owner!.citation, row.key).not.toContain('reka-ui')
    }
  })

  it('leaves both ratchets met with nothing unbacked and nothing undetermined', () => {
    expect(report.totals.unbacked).toBe(0)
    expect(report.totals.undetermined).toBe(0)
    expect(report.undeclaredHandlers).toEqual([])
    expect(report.totals.backed).toBe(report.totals.rows)
  })
})
