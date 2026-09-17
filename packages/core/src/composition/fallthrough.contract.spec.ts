/**
 * The attribute-fallthrough contract (TASK-R5-O6 · owner decisions D24, D26).
 *
 * Where does a consumer's `class`, `id` and `data-*` actually land? For most of
 * the catalogue the answer is "the one root", which needs no declaration. For
 * two shapes it does not, and until this field existed there was no way to find
 * out except to render the component and look:
 *
 * 1. **A multi-root template** (7 components). Vue cannot pick a fallthrough
 *    target for a fragment, so the component sets `inheritAttrs: false` and
 *    chooses one. Which one it chose was invisible.
 * 2. **A single root whose `class` is re-pointed inward** (D24). On six
 *    controls `$attrs` binds to an inner node — `control` on the sliders, the
 *    rating and both date pickers, `input` on `DzMention`. The declaration
 *    records where it lands; it does not move it, because re-pointing `class`
 *    at the outer node would re-flow every existing consumer's layout to buy a
 *    consistency nobody asked for.
 *
 * ## D26, and why this is one field rather than two
 *
 * D26 asked for a `delegatesTo` so `DzPersonaSelector` — a pure wrapper whose
 * root *is* a `DzCombobox` — would not have to mark all sixteen of its parts
 * `optional` to satisfy the parts validator. D24 asked for a `classTarget` so
 * the six controls above could say where `class` lands.
 *
 * They are the same question from two ends: **which node is this component's
 * outward-facing surface?** A `classTarget` answers "an inner part of mine"; a
 * `delegatesTo` answers "another component's root". Shipping them as two fields
 * would have let a component answer one and not the other, and left a reader
 * with two places to look for one fact. So `ComponentFallthrough` carries both,
 * and `delegatesTo` is the optional half.
 *
 * What this spec does **not** do is change `validate:anatomy-parts` to credit a
 * delegate's emissions. That is D26's option (b) second half, it moves a
 * number another packet ratchets (`optionalParts`), and it is not needed to
 * make the fact declarable and checkable — which is what was blocking.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkFallthrough, expectFallthrough } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy as datePickerAnatomy } from '../components/forms/DzDatePicker.anatomy.ts'
import { anatomy as dateRangePickerAnatomy } from '../components/forms/DzDateRangePicker.anatomy.ts'
import { anatomy as personaSelectorAnatomy } from '../components/forms/DzPersonaSelector.anatomy.ts'
import { anatomy as rangeSliderAnatomy } from '../components/forms/DzRangeSlider.anatomy.ts'
import DzRangeSlider from '../components/forms/DzRangeSlider.vue'
import { anatomy as ratingAnatomy } from '../components/forms/DzRating.anatomy.ts'
import DzRating from '../components/forms/DzRating.vue'
import { anatomy as sliderAnatomy } from '../components/forms/DzSlider.anatomy.ts'
import DzSlider from '../components/forms/DzSlider.vue'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE_SRC = resolve(HERE, '..')
const PROBE = 'dz-fallthrough-probe'

function collectAnatomyFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      collectAnatomyFiles(path, out)
    else if (entry.endsWith('.anatomy.ts'))
      out.push(path)
  }
  return out
}

describe('every fallthrough declaration is internally consistent', () => {
  const files = collectAnatomyFiles(CORE_SRC)

  it('names a target that is one of the component\'s own declared parts', async () => {
    const problems: string[] = []

    for (const path of files) {
      const source = readFileSync(path, 'utf8')
      if (!/\bfallthrough:\s*\{/.test(source))
        continue

      const component = basename(path, '.anatomy.ts')
      const module = await import(/* @vite-ignore */ path) as {
        anatomy: {
          parts: readonly string[] | 'none'
          fallthrough?: { target: string, reason?: string, delegatesTo?: string }
        }
      }
      const { parts, fallthrough } = module.anatomy
      if (fallthrough === undefined)
        continue

      if (fallthrough.target === 'none') {
        // A renderless component is the only thing that may bind `$attrs`
        // nowhere. If it renders parts, "nowhere" is a mistake, not a promise.
        if (parts !== 'none') {
          problems.push(
            `${component}: declares \`fallthrough.target: 'none'\` but also declares parts `
            + `(${(parts as readonly string[]).join(', ')}). Only a renderless component binds $attrs nowhere.`,
          )
        }
        continue
      }

      if (parts === 'none') {
        problems.push(
          `${component}: declares \`fallthrough.target: '${fallthrough.target}'\` but `
          + `\`parts: 'none'\`. A component with no parts has no node to name.`,
        )
        continue
      }

      if (!parts.includes(fallthrough.target)) {
        problems.push(
          `${component}: \`fallthrough.target: '${fallthrough.target}'\` is not one of its `
          + `declared parts (${parts.join(', ')}). The target names a node a consumer can address, `
          + `so it has to be a name the component actually emits.`,
        )
      }
    }

    expect(problems).toEqual([])
  })

  it('states a reason whenever the target is not `root`', async () => {
    const problems: string[] = []

    for (const path of files) {
      const source = readFileSync(path, 'utf8')
      if (!/\bfallthrough:\s*\{/.test(source))
        continue

      const component = basename(path, '.anatomy.ts')
      const module = await import(/* @vite-ignore */ path) as {
        anatomy: { fallthrough?: { target: string, reason?: string } }
      }
      const fallthrough = module.anatomy.fallthrough
      if (fallthrough === undefined || fallthrough.target === 'root')
        continue

      // `root` is the expected answer and needs no defence. Anything else is
      // the case a consumer will get wrong, so it has to say why.
      if ((fallthrough.reason ?? '').trim().length < 20) {
        problems.push(
          `${component}: \`fallthrough.target\` is '${fallthrough.target}', not 'root', `
          + `and carries no reason. The reason is what the docs page publishes.`,
        )
      }
    }

    expect(problems).toEqual([])
  })

  it('declares the multi-root components and the D24 six', async () => {
    const declaring: string[] = []
    for (const path of files) {
      if (/\bfallthrough:\s*\{/.test(readFileSync(path, 'utf8')))
        declaring.push(basename(path, '.anatomy.ts'))
    }

    // 12 of the 14 components with a fallthrough fact: the 5 multi-root ones
    // that have an anatomy file, the D24 six, and DzPersonaSelector (D26).
    // `DzTableRow` and `DzToastViewport` are compound sub-parts with no anatomy
    // file of their own, so their declarations live in their contract specs —
    // stamping a `data-part` on a non-declaring component to make it
    // addressable would add an emission `validate:anatomy-parts` then reports
    // as undeclared.
    expect(declaring.sort()).toEqual([
      'DzDatePicker',
      'DzDateRangePicker',
      'DzFieldArray',
      'DzKnob',
      'DzLightbox',
      'DzMention',
      'DzPersonaSelector',
      'DzPopconfirm',
      'DzRangeSlider',
      'DzRating',
      'DzSidebar',
      'DzSlider',
    ])
  })
})

describe('d24 — `class` lands where the six controls say it does', () => {
  it('dzSlider: on `control`, not the labelled wrapper', () => {
    const wrapper = mount(DzSlider, {
      attrs: { class: PROBE, id: 'probe-id' },
      props: { modelValue: 50, ariaLabel: 'Volume' },
      attachTo: document.body,
    })

    expectFallthrough(
      wrapper.element.parentElement ?? wrapper.element,
      sliderAnatomy.fallthrough,
      { className: PROBE, id: 'probe-id' },
      'DzSlider',
    )
    wrapper.unmount()
  })

  it('dzRangeSlider: on `control`', () => {
    const wrapper = mount(DzRangeSlider, {
      attrs: { class: PROBE },
      props: { modelValue: [20, 80], ariaLabel: 'Range' },
      attachTo: document.body,
    })

    expectFallthrough(
      wrapper.element.parentElement ?? wrapper.element,
      rangeSliderAnatomy.fallthrough,
      { className: PROBE },
      'DzRangeSlider',
    )
    wrapper.unmount()
  })

  it('dzRating: on `control`, the star row', () => {
    const wrapper = mount(DzRating, {
      attrs: { class: PROBE },
      props: { modelValue: 3 },
      attachTo: document.body,
    })

    expectFallthrough(
      wrapper.element.parentElement ?? wrapper.element,
      ratingAnatomy.fallthrough,
      { className: PROBE },
      'DzRating',
    )
    wrapper.unmount()
  })

  it('both date pickers declare `control`, and say why', () => {
    // Not rendered here: `DatePickerField` needs a calendar context this spec
    // has no business assembling, and the declaration + the source measurement
    // it was taken from are what D24 asked to be written down. The family
    // anatomy specs render them.
    expect(datePickerAnatomy.fallthrough.target).toBe('control')
    expect(dateRangePickerAnatomy.fallthrough.target).toBe('control')
    expect(datePickerAnatomy.fallthrough.reason).toContain('D24')
    expect(dateRangePickerAnatomy.fallthrough.reason).toContain('D24')
  })
})

describe('d26 — a pure wrapper declares its delegate', () => {
  it('dzPersonaSelector delegates to DzCombobox', () => {
    expect(personaSelectorAnatomy.fallthrough.delegatesTo).toBe('DzCombobox')
  })

  it('the delegate is a real component in the catalogue', () => {
    // A delegate that does not exist is a dangling reference the docs would
    // render as a link to nothing.
    const target = resolve(CORE_SRC, 'components/forms/DzCombobox.vue')
    expect(statSync(target, { throwIfNoEntry: false })).toBeDefined()
  })

  it('and it still declares every part it emits, because it emits them', () => {
    // `delegatesTo` records WHO renders the parts. It does not excuse the
    // wrapper from listing them: a consumer inspecting a DzPersonaSelector sees
    // those nodes in their DOM and addresses them through this component's `ui`.
    expect(personaSelectorAnatomy.parts).toContain('root')
    expect(personaSelectorAnatomy.parts.length).toBeGreaterThan(10)
  })
})

describe('the fallthrough check itself fails when it should (seeded)', () => {
  const html = (markup: string): Element => {
    const host = document.createElement('div')
    host.innerHTML = markup
    return host
  }

  it('flags a class that landed on the wrong part', () => {
    const container = html(`<div data-part="root"><span data-part="label" class="${PROBE}"></span></div>`)
    const problems = checkFallthrough(container, { target: 'root' }, { className: PROBE })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('data-part="label"')
  })

  it('flags a class that landed nowhere', () => {
    const container = html(`<div data-part="root"></div>`)
    expect(checkFallthrough(container, { target: 'root' }, { className: PROBE })).toHaveLength(1)
  })

  it('flags a class that landed on two elements', () => {
    // Duplicated `$attrs` duplicates the consumer's `id` too, which is invalid
    // HTML and makes their own querySelector pick whichever comes first.
    const container = html(
      `<div data-part="root" class="${PROBE}"></div><div data-part="root" class="${PROBE}"></div>`,
    )
    const problems = checkFallthrough(container, { target: 'root' }, { className: PROBE })

    expect(problems.some(p => p.includes('landed on 2 elements'))).toBe(true)
  })

  it('flags a renderless component that did bind $attrs', () => {
    const container = html(`<div data-part="root" class="${PROBE}"></div>`)
    const problems = checkFallthrough(container, { target: 'none' }, { className: PROBE })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('must bind `$attrs` nowhere')
  })

  it('flags class and id landing on different elements', () => {
    const container = html(
      `<div data-part="root" class="${PROBE}"></div><span data-part="label" id="probe-id"></span>`,
    )
    const problems = checkFallthrough(
      container,
      { target: 'root' },
      { className: PROBE, id: 'probe-id' },
    )

    expect(problems.some(p => p.includes('DIFFERENT elements'))).toBe(true)
  })

  it('passes the conformant shape', () => {
    const container = html(`<div data-part="root" class="${PROBE}" id="probe-id"></div>`)
    expect(checkFallthrough(container, { target: 'root' }, { className: PROBE, id: 'probe-id' }))
      .toEqual([])
  })
})
