import type { ComponentAnatomy } from '@dzup-ui/contracts'
import { describe, expect, it } from 'vitest'
import { checkAnatomy, expectAnatomy } from './anatomy.ts'

/**
 * Specs for the anatomy conformance helper (TASK-OSS-P3-02).
 *
 * The fixtures are typed as the full `ComponentAnatomy` from
 * `@dzup-ui/contracts` while the helper accepts the structural
 * `CheckableAnatomy`, so these specs also pin the assignability the helper's
 * dependency-free design rests on.
 *
 * Built from hand-written DOM rather than mounted components: the rules are
 * about the relationship between a declaration and rendered markup, and a real
 * component can only ever demonstrate the cases it happens to have. Every rule
 * is exercised in both directions — conformant and not.
 */

function dom(html: string): Element {
  const host = document.createElement('div')
  host.innerHTML = html.trim()
  return host.firstElementChild as Element
}

function anatomyOf(overrides: Partial<ComponentAnatomy> = {}): ComponentAnatomy {
  return {
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier: 'C',
    ...overrides,
  }
}

describe('declared parts', () => {
  it('passes when every declared part is present exactly once', () => {
    const element = dom(`
      <div data-part="root">
        <span data-part="label">Save</span>
      </div>
    `)

    expect(checkAnatomy(element, anatomyOf({ parts: ['root', 'label'] }))).toEqual([])
  })

  it('reports a declared part that the DOM never emits', () => {
    const element = dom('<div data-part="root"></div>')
    const problems = checkAnatomy(element, anatomyOf({ parts: ['root', 'label'] }))

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('"label"')
  })

  it('reports a part that appears more than once', () => {
    const element = dom(`
      <div data-part="root">
        <span data-part="label">a</span>
        <span data-part="label">b</span>
      </div>
    `)

    expect(checkAnatomy(element, anatomyOf({ parts: ['root', 'label'] }))[0])
      .toContain('appears 2 times')
  })

  it('accepts a repeated part that is declared optional', () => {
    const element = dom(`
      <ul data-part="root">
        <li data-part="item">a</li>
        <li data-part="item">b</li>
      </ul>
    `)

    expect(checkAnatomy(element, anatomyOf({
      parts: ['root', 'item'],
      optionalParts: ['item'],
    }))).toEqual([])
  })

  it('accepts an absent part that is declared optional', () => {
    const element = dom('<div data-part="root"></div>')

    expect(checkAnatomy(element, anatomyOf({
      parts: ['root', 'spinner'],
      optionalParts: ['spinner'],
    }))).toEqual([])
  })

  it('accepts an absent part the caller says this fixture omits', () => {
    const element = dom('<div data-part="root"></div>')

    expect(checkAnatomy(
      element,
      anatomyOf({ parts: ['root', 'footer'] }),
      { absentParts: ['footer'] },
    )).toEqual([])
  })

  it('reports a part the DOM emits and the anatomy does not declare', () => {
    const element = dom(`
      <div data-part="root">
        <span data-part="mystery"></span>
      </div>
    `)

    expect(checkAnatomy(element, anatomyOf())[0]).toContain('data-part="mystery"')
  })

  it('reports a root that does not carry data-part="root"', () => {
    const element = dom('<div><span data-part="root"></span></div>')
    const problems = checkAnatomy(element, anatomyOf())

    expect(problems.some(problem => problem.includes('root element carries'))).toBe(true)
  })

  it('does not demand a root attribute when the anatomy declares no root part', () => {
    const element = dom('<div><span data-part="content"></span></div>')

    expect(checkAnatomy(element, anatomyOf({ parts: ['content'] }))).toEqual([])
  })
})

describe('parts: none', () => {
  it('passes when nothing in the subtree emits a part', () => {
    expect(checkAnatomy(dom('<div><span></span></div>'), anatomyOf({ parts: 'none' }))).toEqual([])
  })

  it('reports parts emitted by a component that declared none', () => {
    // 'none' means renderless, not "nobody wrote the parts down" — conflating
    // the two is how a component with an undeclared surface passes a gate.
    const problems = checkAnatomy(dom('<div data-part="root"></div>'), anatomyOf({ parts: 'none' }))

    expect(problems[0]).toContain('declares parts: \'none\'')
    expect(problems[0]).toContain('"root"')
  })
})

describe('states', () => {
  it('passes when every emitted data-state value is declared', () => {
    const element = dom('<div data-part="root" data-state="open"></div>')

    expect(checkAnatomy(element, anatomyOf({ states: ['open', 'closed'] }))).toEqual([])
  })

  it('reports an undeclared data-state value', () => {
    const element = dom('<div data-part="root" data-state="loading"></div>')

    expect(checkAnatomy(element, anatomyOf({ states: ['idle'] }))[0]).toContain('data-state="loading"')
  })

  it('reports an undeclared presence-only boolean state', () => {
    const element = dom('<div data-part="root" data-disabled=""></div>')

    expect(checkAnatomy(element, anatomyOf())[0]).toContain('data-disabled')
  })

  it('accepts data-disabled="true" as the same state', () => {
    const element = dom('<div data-part="root" data-disabled="true"></div>')

    expect(checkAnatomy(element, anatomyOf({ states: ['disabled'] }))).toEqual([])
  })

  it('does not read a recipe attribute as a state', () => {
    // `data-size`/`data-variant`/`data-tone` are a declared category of their
    // own; reading them as states would force every component to list its whole
    // size scale under `states`.
    const element = dom('<div data-part="root" data-size="lg" data-tone="danger" data-variant="outline"></div>')

    expect(checkAnatomy(element, anatomyOf())).toEqual([])
  })

  it('does not read a data attribute carrying a value as a state', () => {
    const element = dom('<div data-part="root" data-index="3"></div>')

    expect(checkAnatomy(element, anatomyOf())).toEqual([])
  })

  it('ignores a primitive marker attribute that is not a state', () => {
    // Mounting one Reka-backed select puts all of these in the tree. Reading
    // any `data-*=""` as a state reported five undeclared "states" that are a
    // primitive's internal markers, which no component can declare and no
    // library can enumerate.
    const element = dom(`
      <div data-part="root"
           data-reka-popper-content-wrapper=""
           data-dismissable-layer=""
           data-reka-collection-item=""
           data-placeholder=""
           data-dz-search-input=""></div>
    `)

    expect(checkAnatomy(element, anatomyOf())).toEqual([])
  })

  it('still reports an undeclared state from the known vocabulary', () => {
    // The narrowing must not become a hole: `disabled` is in the ADR's list, so
    // emitting it undeclared is still a finding.
    const element = dom('<div data-part="root" data-selected=""></div>')

    expect(checkAnatomy(element, anatomyOf())[0]).toContain('data-selected')
  })

  it('checks a state the anatomy declares even if the vocabulary lacks it', () => {
    const element = dom('<div data-part="root" data-flipped=""></div>')

    expect(checkAnatomy(element, anatomyOf({ states: ['flipped'] }))).toEqual([])
  })

  it('checks states on a renderless component too', () => {
    const element = dom('<div data-state="open"></div>')

    expect(checkAnatomy(element, anatomyOf({ parts: 'none' }))[0]).toContain('data-state="open"')
  })
})

describe('a portaled subtree', () => {
  it('is checked as a fragment when root is listed absent', () => {
    // A select's listbox is a real part of the component that renders outside
    // its wrapper. Checking it is the only way an undeclared part in there is
    // ever seen.
    const content = dom(`
      <div data-part="content">
        <div data-part="item">a</div>
      </div>
    `)

    expect(checkAnatomy(
      content,
      anatomyOf({ parts: ['root', 'trigger', 'content', 'item'], optionalParts: ['item'] }),
      { absentParts: ['root', 'trigger'] },
    )).toEqual([])
  })

  it('still reports an undeclared part inside it', () => {
    const content = dom(`
      <div data-part="content">
        <div data-part="mystery"></div>
      </div>
    `)

    const problems = checkAnatomy(
      content,
      anatomyOf({ parts: ['root', 'content'] }),
      { absentParts: ['root'] },
    )

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('mystery')
  })
})

describe('targets', () => {
  it('accepts a @vue/test-utils-shaped wrapper', () => {
    const element = dom('<div data-part="root"></div>')

    expect(checkAnatomy({ element }, anatomyOf())).toEqual([])
  })
})

describe('expectAnatomy', () => {
  it('returns quietly when the DOM conforms', () => {
    expect(() => expectAnatomy(dom('<div data-part="root"></div>'), anatomyOf())).not.toThrow()
  })

  it('throws with every problem at once', () => {
    // A component that lost three parts should report three, not the first one
    // and then a rerun.
    const element = dom('<div data-part="root"><span data-part="ghost"></span></div>')

    expect(() => expectAnatomy(element, anatomyOf({ parts: ['root', 'a', 'b'] })))
      .toThrow(/3 problems/)
  })

  it('names the singular case correctly', () => {
    const element = dom('<div data-part="root"><span data-part="ghost"></span></div>')

    expect(() => expectAnatomy(element, anatomyOf())).toThrow(/1 problem\b/)
  })
})
