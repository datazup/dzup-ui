/**
 * `DzGrid` and `DzStack` as form layouts (TASK-FORM-OSS-04).
 *
 * A form renderer maps its layout nodes onto these two, so what matters is not
 * how they look but what a *field* can be told to do inside them: how many
 * columns it occupies, and whether either primitive has a physical direction
 * baked in that an Arabic form would render backwards.
 *
 * The answer to the second is good and this file pins it. The answer to the
 * first is a gap, and this file states it rather than leaving it implied.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzGrid from './DzGrid.vue'
import DzStack from './DzStack.vue'

describe('dzGrid — responsive columns', () => {
  it('takes a fixed column count', () => {
    const wrapper = mount(DzGrid, { props: { cols: 3 } })
    expect(wrapper.classes().join(' ')).toContain('grid-cols-3')
  })

  it('takes a column count per breakpoint', () => {
    // A form that is one column on a phone and three on a desktop is the
    // ordinary case, and it is the one the renderer's layout node maps to.
    const wrapper = mount(DzGrid, { props: { cols: { sm: 1, md: 2, lg: 3 } } })
    const classes = wrapper.classes().join(' ')
    expect(classes).toContain('grid-cols-1')
    expect(classes).toMatch(/md:grid-cols-2/)
    expect(classes).toMatch(/lg:grid-cols-3/)
  })

  it('lays out its children in source order', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: 2 },
      slots: { default: () => [h('input', { id: 'first' }), h('input', { id: 'second' })] },
    })
    const ids = wrapper.findAll('input').map(i => i.attributes('id'))
    expect(ids).toEqual(['first', 'second'])
  })

  it('has no direction of its own, so `dir` on an ancestor orders the columns', () => {
    // CSS grid follows the writing mode: `grid-cols-3` fills right-to-left
    // under `dir="rtl"` without the component knowing anything about it. What
    // would break that is a physical `margin-left` or an explicit
    // `grid-auto-flow` — and there is neither.
    const wrapper = mount(DzGrid, { props: { cols: 3 } })
    const classes = wrapper.classes().join(' ')
    expect(classes).not.toMatch(/(?:^|\s)-?(?:ml|mr|pl|pr|left|right)-/)
  })

  /**
   * The gap, asserted so it cannot be mistaken for an oversight.
   *
   * A renderer's layout node says "this field takes two of the three columns",
   * and `DzGrid` has no way to express that: the columns are set on the
   * container and there is no `DzGridItem` and no `span` prop. A consumer today
   * passes `class="col-span-2"` on the child, which works but is not an API and
   * is not typed.
   *
   * Adding one is an owner decision — a new public component or a new prop —
   * and this test is what makes the absence visible until it is made.
   */
  it('has no span API today: a spanning field is a raw class on the child', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: 3 },
      slots: { default: () => h('input', { id: 'wide', class: 'col-span-2' }) },
    })
    expect(wrapper.find('#wide').classes()).toContain('col-span-2')
    // No `span` prop exists on the grid to do this properly.
    expect(Object.keys(DzGrid.props ?? {})).not.toContain('span')
  })
})

describe('dzStack — direction', () => {
  it('stacks vertically by default, which is the form case', () => {
    const wrapper = mount(DzStack)
    expect(wrapper.classes().join(' ')).toContain('flex-col')
  })

  /**
   * The vocabulary differs from the spec's, and that is worth writing down.
   *
   * A renderer's layout node calls this axis `row`/`column`; `DzStack` calls it
   * `horizontal`/`vertical`. Both are defensible and neither is wrong — but a
   * registry entry has to translate, and a `direction="row"` that silently
   * falls back to vertical (which is what happens today) is the kind of thing
   * that reads as a styling bug for a week. Recorded in the readiness matrix.
   */
  it('lays out horizontally when asked, using its own vocabulary', () => {
    const wrapper = mount(DzStack, { props: { direction: 'horizontal' } })
    expect(wrapper.classes().join(' ')).toContain('flex-row')
  })

  it('falls back to vertical for a direction it does not know', () => {
    const wrapper = mount(DzStack, { props: { direction: 'row' as 'horizontal' } })
    expect(wrapper.classes().join(' ')).toContain('flex-col')
  })

  it('uses flex-row, which follows `dir` rather than fighting it', () => {
    // `flex-direction: row` is writing-mode relative: under `dir="rtl"` the
    // first child sits on the right, with nothing to configure. A component
    // that had reached for `float` or a physical margin would need mirroring
    // and would be a row on this list instead.
    const wrapper = mount(DzStack, { props: { direction: 'horizontal' } })
    const classes = wrapper.classes().join(' ')
    expect(classes).not.toContain('flex-row-reverse')
    expect(classes).not.toMatch(/(?:^|\s)-?(?:ml|mr|pl|pr)-/)
  })

  it('keeps its children in source order', () => {
    const wrapper = mount(DzStack, {
      props: { direction: 'horizontal' },
      slots: { default: () => [h('input', { id: 'a' }), h('input', { id: 'b' })] },
    })
    expect(wrapper.findAll('input').map(i => i.attributes('id'))).toEqual(['a', 'b'])
  })

  it('spaces with gap rather than margins, so nothing is physically anchored', () => {
    const wrapper = mount(DzStack, { props: { gap: 'md' } })
    expect(wrapper.classes().join(' ')).toMatch(/gap-/)
  })
})
