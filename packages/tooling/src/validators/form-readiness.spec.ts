/**
 * Tests for the form-control readiness matrix (TASK-FORM-OSS-01).
 *
 * Three things are worth testing here, and they are not the table.
 *
 *   1. **The probe's copies of other people's truth.** `DATA_STATE_VALUES` is a
 *      runtime copy of a compile-time union; if the union grows and the copy
 *      does not, the C3 column starts reporting a legal value as a violation.
 *   2. **The roster.** It is derived from the ownership manifest, so a control
 *      added to `forms/` or `inputs/` must appear without anybody remembering.
 *   3. **The precedence rule.** Source outranks review on the hard clauses.
 *      That is the whole reason the split is safe, and it is one line of code
 *      that a refactor could silently invert.
 */

import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ASSESSMENTS, CLAUSES, NOT_APPLICABLE } from '../forms/assessments.ts'
import { DATA_STATE_VALUES, probeControls, read, ROOT, valueModel } from '../forms/probe.ts'
import { build, render, roster } from './form-readiness.ts'

describe('form-readiness — the probe\'s copied assumptions', () => {
  it('copies the DataState union out of @dzup-ui/contracts without drifting from it', () => {
    const source = read(resolve(ROOT, 'packages/contracts/src/data-attributes.types.ts')) ?? ''
    const union = /export type DataState([\s\S]*?)\n\n/.exec(source)
    expect(union, 'DataState union not found — the probe\'s copy has nothing to check against').not.toBeNull()
    const declared = [...(union?.[1] ?? '').matchAll(/'([a-z-]+)'/g)].map(m => m[1])
    expect([...DATA_STATE_VALUES].sort()).toEqual(declared.sort())
  })

  it('resolves the four base prop interfaces the same way contracts declares them', () => {
    const source = read(resolve(ROOT, 'packages/contracts/src/props.types.ts')) ?? ''
    // BaseFormControlProps is the union the probe expands; if it stops being
    // the sum of behavior + validation + accessibility the expansion is wrong.
    expect(source).toMatch(/interface BaseInteractiveProps[\s\S]*?BaseBehaviorProps/)
    expect(source).toMatch(/interface BaseFormControlProps[\s\S]*?BaseInteractiveProps[\s\S]*?BaseValidationProps/)
    for (const prop of ['disabled', 'readonly', 'loading', 'name'])
      expect(source).toMatch(new RegExp(`interface BaseBehaviorProps[\\s\\S]*?${prop}\\?:`))
    for (const prop of ['invalid', 'error', 'required'])
      expect(source).toMatch(new RegExp(`interface BaseValidationProps[\\s\\S]*?${prop}\\?:`))
  })
})

describe('form-readiness — roster', () => {
  it('derives every form and input control from the ownership manifest', () => {
    const list = roster()
    expect(list.length).toBeGreaterThanOrEqual(39)
    expect(list.map(r => r.component)).toContain('DzInput')
    expect(list.map(r => r.component)).toContain('DzFormMessage')
    // Nothing from another family leaks in.
    expect(list.map(r => r.component)).not.toContain('DzButton')
  })

  it('assesses every control on the roster, and no control that is gone', () => {
    const names = new Set(roster().map(r => r.component))
    for (const name of names)
      expect(ASSESSMENTS[name], `${name} has no assessment`).toBeDefined()
    for (const name of Object.keys(ASSESSMENTS))
      expect(names.has(name), `${name} is assessed but is not a control`).toBe(true)
  })

  it('builds with no structural problems', () => {
    const { problems, rows } = build()
    expect(problems).toEqual([])
    expect(rows.length).toBe(roster().length)
  })
})

describe('form-readiness — cells', () => {
  const { rows } = build()

  it('gives every control every clause', () => {
    for (const row of rows) {
      for (const clause of CLAUSES)
        expect(row.cells[clause], `${row.component} ${clause}`).toBeDefined()
    }
  })

  it('requires evidence on every reviewed pass', () => {
    for (const [name, assessment] of Object.entries(ASSESSMENTS)) {
      for (const [clause, cell] of Object.entries(assessment.reviewed ?? {})) {
        if (cell.verdict === 'pass')
          expect(cell.evidence.trim(), `${name} ${clause}`).not.toBe('')
      }
    }
  })

  /**
   * The precedence rule, asserted as an invariant rather than against whichever
   * component happens to be failing today.
   *
   * This test used to name `DzSelect` and its missing `data-required`. That was
   * a fine example right up until the gap was closed, at which point the test
   * failed while the mechanism it guards was working perfectly. A rule is the
   * thing to assert; an example is a fixture with an expiry date.
   */
  it('decides every source-decidable clause from source, never from a review', () => {
    const HARD = ['C2', 'C3', 'C5', 'C6', 'C7', 'C8'] as const
    for (const row of rows) {
      for (const clause of HARD)
        expect(row.cells[clause].source, `${row.component} ${clause}`).toBe('derived')
    }
  })

  /**
   * A ratchet, not an example.
   *
   * Seven controls bound their value to `v-model:value` and nothing else, so a
   * consumer binding `v-model` generically got silence. All of them now take
   * both. This fails the moment a new control ships with a named model only —
   * which is how that class of defect got in the first time.
   */
  it('binds every control value to the default model', () => {
    for (const row of rows) {
      const model = valueModel(row.probe)
      if (model === null)
        continue
      expect(model.name, `${row.component} binds its value to v-model:${model.name}`).toBeNull()
    }
  })

  it('marks C9 n-a for every kind that has no options', () => {
    for (const row of rows) {
      const na = NOT_APPLICABLE[row.kind]?.C9
      if (na !== undefined && !row.probe.takesOptions)
        expect(row.cells.C9.verdict, `${row.component}`).toBe('n-a')
    }
  })
})

describe('form-readiness — probe details', () => {
  const probeOne = (family: string, component: string) => {
    const [result] = probeControls([[family, component]])
    expect(result, `${component} did not probe`).toBeDefined()
    return result!
  }

  it('does not report a browser global from inside a function body', () => {
    // DzMention calls window.setTimeout inside its blur handler. A brace-count
    // probe reported it as an SSR failure; the character scanner must not.
    expect(probeOne('forms', 'DzMention').eagerGlobals).toEqual([])
  })

  it('picks the default model over the named ones, whatever their order', () => {
    // DzInplace declares `active`, then `value`, then the default model. A
    // probe taking the first would report its open/closed flag as the value.
    const inplace = probeOne('forms', 'DzInplace')
    expect(valueModel(inplace)?.name).toBeNull()
    expect(inplace.models.map(m => m.name)).toContain('value')
    expect(inplace.models.map(m => m.name)).toContain('active')
  })

  it('finds a prop that is declared and never read', () => {
    // DzFloatLabel inherits four ARIA props from BaseAccessibilityProps and
    // honours none. They are parked as `inertProps` rather than bound to a
    // wrapper div, so this stays a live fixture until an owner removes them.
    const unread = probeOne('forms', 'DzFloatLabel').declaredUnread.map(u => u.prop)
    expect(unread).toContain('ariaDescribedby')
    // …and a prop that is read is not reported.
    expect(probeOne('forms', 'DzTagsInput').declaredUnread.map(u => u.prop)).not.toContain('loading')
  })
})

describe('form-readiness — render', () => {
  it('is deterministic', () => {
    const a = render(build().rows)
    const b = render(build().rows)
    expect(a).toBe(b)
  })

  it('carries the generated-file marker so nobody edits it by hand', () => {
    expect(render(build().rows)).toContain('GENERATED FILE — do not edit by hand')
  })
})
