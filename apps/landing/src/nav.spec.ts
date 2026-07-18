/**
 * The two structural defects the design review found in the nav, turned into
 * gates. Both were true of the nine-item bar this replaced:
 *
 *   - "Components" and "Docs" resolved to the same Storybook target.
 *   - "Ecosystem" duplicated its own children.
 */
import { describe, expect, it } from 'vitest'
import { isGroup, NAV, navDestinations, navLeaves } from './nav.ts'

describe('nav structure', () => {
  it('has at most five top-level entries', () => {
    expect(NAV.length).toBeLessThanOrEqual(5)
  })

  it('reaches no destination from two different entries', () => {
    const destinations = navDestinations()
    const duplicates = destinations.filter((href, i) => destinations.indexOf(href) !== i)
    expect(duplicates).toEqual([])
  })

  it('gives every entry a label and every leaf a destination', () => {
    for (const entry of NAV) {
      expect(entry.label).toBeTruthy()
      if (isGroup(entry)) {
        expect(entry.items.length).toBeGreaterThan(0)
        for (const item of entry.items) expect(item.href).toBeTruthy()
      }
      else {
        expect(entry.href).toBeTruthy()
      }
    }
  })

  it('marks Storybook destinations external and in-app routes internal', () => {
    for (const href of navDestinations()) {
      const entry = NAV.flatMap(e => (isGroup(e) ? e.items : [e])).find(i => i.href === href)
      // A `/storybook/...` target is a separate app: it must be a real navigation.
      if (href.startsWith('/storybook/'))
        expect(entry?.external).toBe(true)
      else expect(entry?.external).toBeUndefined()
    }
  })

  it('carries no "Ecosystem" entry, whose children are now real destinations', () => {
    expect(NAV.map(e => e.label)).not.toContain('Ecosystem')
    const destinations = navDestinations()
    for (const child of ['/blocks', '/templates', '/animations', '/themes']) {
      expect(destinations).toContain(child)
    }
  })

  it('exposes /templates, which previously had a route but no way in', () => {
    expect(navDestinations()).toContain('/templates')
  })

  it('leaves are the non-menu top-level entries', () => {
    expect(navLeaves().map(l => l.href)).toEqual(['/themes', '/compare', '/pro'])
  })
})
