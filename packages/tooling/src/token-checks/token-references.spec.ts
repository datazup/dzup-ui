/**
 * Unit + end-to-end tests for the token reference integrity gate (TASK-R5-O7).
 *
 * The seeded-failure runs that prove the CLI goes red are recorded in
 * `docs/program-2026-09-04/reports/TASK-R5-O7-handoff.md` §3. These tests hold
 * the machinery those runs exercised, plus the two rules that cannot be seeded
 * from real repo state without editing a shipped token map (alias cycles).
 */

import { describe, expect, it } from 'vitest'
import {
  aliasCycles,
  checkTokenReferences,
  declarationsIn,
  doubleTimedTransitions,
  maskComments,
  referencesIn,
} from './token-references.ts'

describe('maskComments', () => {
  it('blanks block comments but preserves line numbers', () => {
    const source = 'a\n/* var(--dz-ghost)\n   more */\nvar(--dz-real)\n'
    const masked = maskComments(source)
    expect(masked.split('\n').length).toBe(source.split('\n').length)
    expect(masked).not.toContain('--dz-ghost')
    expect(masked).toContain('--dz-real')
  })

  it('blanks the JSDoc prose that made DzBlockUI report a phantom token', () => {
    // The real shape from DzBlockUI.anatomy.ts:35 — a hook documented in prose.
    const source = '/**\n * `var(--dz-blockui-x, <fallback>)`, so each is an override\n */\nconst a = 1\n'
    expect(referencesIn(maskComments(source), 'f.ts')).toHaveLength(0)
  })

  it('blanks full-line // comments', () => {
    expect(maskComments('  // var(--dz-ghost)\n')).not.toContain('--dz-ghost')
  })

  it('leaves a trailing // alone, so the gate never under-reports', () => {
    // Masking a trailing comment risks hiding a real reference on the same line.
    expect(maskComments('x: var(--dz-real) // note')).toContain('--dz-real')
  })

  it('does not mistake a URL for a comment', () => {
    expect(maskComments('const u = "https://x/var(--dz-real)"')).toContain('--dz-real')
  })
})

describe('referencesIn', () => {
  it('reports a bare reference as having no fallback', () => {
    const [reference] = referencesIn('gap-[var(--dz-spacing-2)]', 'f.ts')
    expect(reference).toMatchObject({ name: '--dz-spacing-2', hasFallback: false, line: 1 })
  })

  it('detects a fallback', () => {
    expect(referencesIn('var(--dz-a, 2px)', 'f.ts')[0]?.hasFallback).toBe(true)
  })

  it('detects a fallback that is itself a var()', () => {
    // The dominant hook shape: var(--dz-listbox-bg, var(--dz-background)).
    const found = referencesIn('var(--dz-listbox-bg, var(--dz-background))', 'f.ts')
    expect(found[0]).toMatchObject({ name: '--dz-listbox-bg', hasFallback: true })
    expect(found[1]).toMatchObject({ name: '--dz-background', hasFallback: false })
  })

  it('does not treat a comma inside a nested function as a fallback', () => {
    const [reference] = referencesIn('var(--dz-a)', 'f.ts')
    expect(reference?.hasFallback).toBe(false)
  })

  it('reports the correct line number', () => {
    expect(referencesIn('\n\nvar(--dz-a)', 'f.ts')[0]?.line).toBe(3)
  })
})

describe('declarationsIn', () => {
  it('finds a CSS declaration', () => {
    expect(declarationsIn('.dz-anchor { --dz-anchor-color: red; }')).toContain('--dz-anchor-color')
  })

  it('finds a quoted inline-style declaration', () => {
    expect(declarationsIn('{ \'--dz-x\': value }')).toContain('--dz-x')
  })

  it('does not mistake a reference for a declaration', () => {
    expect(declarationsIn('color: var(--dz-a)')).not.toContain('--dz-a')
  })
})

describe('aliasCycles', () => {
  it('reports nothing for an acyclic chain', () => {
    expect(aliasCycles(new Map([
      ['--dz-a', 'var(--dz-b)'],
      ['--dz-b', 'red'],
    ]))).toEqual([])
  })

  it('reports a two-node ring', () => {
    const cycles = aliasCycles(new Map([
      ['--dz-a', 'var(--dz-b)'],
      ['--dz-b', 'var(--dz-a)'],
    ]))
    expect(cycles).toHaveLength(1)
    expect(cycles[0]).toContain('--dz-a')
    expect(cycles[0]).toContain('--dz-b')
  })

  it('reports a ring once, not once per entry point', () => {
    expect(aliasCycles(new Map([
      ['--dz-a', 'var(--dz-b)'],
      ['--dz-b', 'var(--dz-c)'],
      ['--dz-c', 'var(--dz-a)'],
    ]))).toHaveLength(1)
  })

  it('reports a self-reference', () => {
    expect(aliasCycles(new Map([['--dz-a', 'var(--dz-a)']]))).toHaveLength(1)
  })
})

describe('doubleTimedTransitions', () => {
  // The shapes dist/tokens.css ships: the transition token carries its own easing.
  const values = new Map([
    ['--dz-duration-fast', '150ms'],
    ['--dz-ease-default', 'cubic-bezier(0.4, 0, 0.2, 1)'],
    ['--dz-transition-fast', 'var(--dz-duration-fast) var(--dz-ease-default)'],
  ])

  it('accepts one timing function per item, whether written or carried by a token', () => {
    const css = '.a { transition: opacity var(--dz-transition-fast); }\n'
      + '.b { transition: opacity 150ms ease, transform var(--dz-duration-fast) var(--dz-ease-default); }\n'
    expect(doubleTimedTransitions(css, 'f.css', values)).toEqual([])
  })

  it('reports the item that appends a keyword to a token carrying an easing, at its line', () => {
    // The DzDialog content rule as it shipped, with only the first item broken.
    const css = '.a {}\n.b {\n  transition:\n    opacity var(--dz-transition-fast) ease,\n'
      + '    transform var(--dz-transition-fast);\n}\n'
    const found = doubleTimedTransitions(css, 'f.css', values)
    expect(found).toHaveLength(1)
    expect(found[0]?.rule).toBe('double-timing')
    expect(found[0]?.symbol).toBe('f.css:3')
    expect(found[0]?.message).toContain('opacity var(--dz-transition-fast) ease')
    expect(found[0]?.message).toContain('cubic-bezier(0.4, 0, 0.2, 1) ease')
  })

  it('counts per item when one token expands to several', () => {
    const multi = new Map([...values, ['--dz-button-transition', 'color var(--dz-transition-fast), opacity 150ms linear']])
    expect(doubleTimedTransitions('.a { transition: var(--dz-button-transition); }\n', 'f.css', multi)).toEqual([])
  })

  it('reads only the <style> blocks of a Vue SFC', () => {
    // The script line would count two `ease`s in one item if it were read as CSS.
    const sfc = '<script setup lang="ts">\n'
      + 'const t = { transition: wide ? \'opacity 1s ease\' : \'opacity 2s ease\' }\n'
      + '</script>\n<style scoped>\n.x { transition: opacity var(--dz-transition-fast) ease-in; }\n</style>\n'
    const found = doubleTimedTransitions(sfc, 'X.vue', values)
    expect(found.map(violation => violation.symbol)).toEqual(['X.vue:5'])
  })

  it('reads nothing from TypeScript', () => {
    expect(doubleTimedTransitions('const s = { transition: \'opacity 1s ease ease\' }\n', 'f.ts', values))
      .toEqual([])
  })
})

describe('checkTokenReferences — the real package', () => {
  const report = checkTokenReferences()

  it('passes at 99b963a', () => {
    expect(report.violations).toEqual([])
  })

  it('reads the shipped ABI through the DTCG gate\'s own parser', () => {
    // 674 is the count TASK-N2-T1 recorded for dist/tokens.css. If this drifts,
    // the two gates have stopped agreeing about what the stylesheet declares.
    expect(report.declaredByTokensCss).toBe(674)
  })

  it('finds every reference site in the library', () => {
    expect(report.referenced).toBeGreaterThan(400)
  })

  it('holds the alias-cycle invariant at zero', () => {
    expect(report.cycles).toEqual([])
  })

  it('keeps every allowlisted hook live', () => {
    expect(report.hooks).toBe(44)
  })
})
