/**
 * Specs for `yarn regenerate:all` (RESIDUAL-09, `D-RES07-2`).
 *
 * The lane is data plus a spawn, so the assertions that earn their place are the
 * ones about the **data**, and two of them have teeth:
 *
 * - every step names a script the **live** root `package.json` declares, so a
 *   rename turns this red instead of turning a regeneration into a
 *   `command not found` halfway through;
 * - the order here equals the order in **`CLAUDE.md`**'s table, so the script and
 *   the prose cannot drift — which is the entire defect `D-RES07-2` was raised
 *   about. RESIDUAL-07 corrected the same list in six places and found a seventh
 *   already different.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from './ownership/generate-ownership-manifest.ts'
import {
  declaredScripts,
  REGENERATE_STEPS,
  stopMessage,
  undeclaredSteps,
} from './regenerate-all.ts'

/** The `yarn <script>` names in `CLAUDE.md`'s regeneration table, in table order. */
function claudeMdOrder(): string[] {
  const text = readFileSync(resolve(ROOT, 'CLAUDE.md'), 'utf8')
  const heading = '### Regenerating generated artifacts'
  const start = text.indexOf(heading)
  expect(start).toBeGreaterThan(-1)
  // Bounded at the next h2 so a table further down the file cannot be read as
  // part of this one.
  const rest = text.slice(start + heading.length)
  const end = rest.indexOf('\n## ')
  const section = end === -1 ? rest : rest.slice(0, end)
  const names: string[] = []
  for (const line of section.split('\n')) {
    if (!line.startsWith('|'))
      continue
    const match = /`yarn ([a-z0-9:-]+)`/.exec(line)
    if (match?.[1] !== undefined)
      names.push(match[1])
  }
  return names
}

describe('regenerate:all — the order', () => {
  it('is the seven steps, numbered 1 to 7 with no gap', () => {
    expect(REGENERATE_STEPS.map(s => s.step)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('ends with csp:inline-style-inventory — the step no documented order carried', () => {
    expect(REGENERATE_STEPS.at(-1)?.script).toBe('csp:inline-style-inventory')
  })

  it('starts with generate:ownership, which every later step reads', () => {
    expect(REGENERATE_STEPS[0]?.script).toBe('generate:ownership')
  })

  it('puts component-meta before llms and docs-pages, both of which project it', () => {
    const at = (script: string) => REGENERATE_STEPS.findIndex(s => s.script === script)
    expect(at('generate:component-meta')).toBeLessThan(at('generate:llms'))
    expect(at('generate:component-meta')).toBeLessThan(at('generate:docs-pages'))
  })

  it('names no script twice', () => {
    const names = REGENERATE_STEPS.map(s => s.script)
    expect(new Set(names).size).toBe(names.length)
  })

  it('gives every step a trigger, so a log says why the step was there', () => {
    for (const s of REGENERATE_STEPS)
      expect(s.owedWhen.length).toBeGreaterThan(30)
  })
})

describe('regenerate:all — the live repository', () => {
  it('names only scripts the root package.json declares', () => {
    expect(undeclaredSteps(declaredScripts())).toEqual([])
  })

  it('agrees with CLAUDE.md\'s table, step for step and in order', () => {
    expect(claudeMdOrder()).toEqual(REGENERATE_STEPS.map(s => s.script))
  })
})

describe('undeclaredSteps', () => {
  it('reports a step whose script was renamed away', () => {
    const declared = new Set(REGENERATE_STEPS.map(s => s.script).filter(
      s => s !== 'generate:llms',
    ))
    expect(undeclaredSteps(declared).map(s => s.script)).toEqual(['generate:llms'])
  })

  it('reports every missing step, not the first one', () => {
    expect(undeclaredSteps(new Set<string>())).toHaveLength(REGENERATE_STEPS.length)
  })
})

describe('stopMessage', () => {
  it('names the failing step, its position and its exit code', () => {
    const failed = REGENERATE_STEPS[3]!
    const message = stopMessage(failed, 1)
    expect(message).toContain('STOPPED at step 4 of 7')
    expect(message).toContain('yarn generate:component-meta')
    expect(message).toContain('exited 1')
  })

  it('lists every step that did NOT run, because those artifacts are not fresh', () => {
    const message = stopMessage(REGENERATE_STEPS[2]!, 1)
    expect(message).toContain('NOT RUN (4 step(s))')
    for (const script of ['generate:component-meta', 'generate:llms', 'generate:docs-pages', 'csp:inline-style-inventory'])
      expect(message).toContain(script)
  })

  it('says so rather than printing an empty list when the last step failed', () => {
    const message = stopMessage(REGENERATE_STEPS.at(-1)!, 2)
    expect(message).toContain('NOT RUN (0 step(s))')
    expect(message).toContain('(none — the failure was the last step)')
  })

  it('carries the reason the chain does not continue', () => {
    expect(stopMessage(REGENERATE_STEPS[0]!, 1)).toContain('stale predecessor')
  })
})
