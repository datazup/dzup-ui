/**
 * `storyCheck` — "not applicable" is not a pass (RESIDUAL-16).
 *
 * Five of the capability matrix's cells (`story-light-dark`, `state-stories`,
 * `a11y-narrative`, `real-world-story`, `browser-play`) resolve through one
 * function, and it asked one question: *is this component absent from the check's
 * failing set?* A component the check **never asked** is absent from it too, so
 * `state-stories` published **27 `pass` cells** for components with no `States`
 * story, citing the story file as the evidence.
 *
 * Both directions, per arm: the OLD inversion is reconstructed inline and shown
 * answering `pass`, then the shipped function is shown answering something else —
 * and the positive arms are pinned too, because a resolution that never says
 * `pass` would satisfy every negative case and empty the column.
 */

import { describe, expect, it } from 'vitest'
import { storyCheck } from './generate-capability-matrix.ts'

/** The predicate this replaces: violations inverted, and nothing else consulted. */
function oldStoryCheck(
  storyFile: Map<string, string>,
  storyDod: Map<string, Set<string>>,
  component: string,
  check: string,
): string {
  if (!storyFile.has(component))
    return 'unrun'
  return storyDod.get(check)?.has(component) === true ? 'unrun' : 'pass'
}

interface Fixture {
  storyFile: Map<string, string>
  storyDod: Map<string, Set<string>>
  storyApplicable: Map<string, Set<string>>
  storyPassing: Map<string, Set<string>>
}

/**
 * Four components, one per arm, in the `states` check:
 *
 *  - `DzCard`   — has a story, the check does not apply, no `States` export.
 *  - `DzInput`  — the check does not apply (its state props are inherited from
 *    `BaseFormControlProps` and `story-dod.ts` reads the component's own
 *    `.types.ts`), and it exports a real `States` story anyway.
 *  - `DzSlider` — applicable and passing.
 *  - `DzKnobby` — applicable and failing.
 *  - `DzNoStory` — no story file at all.
 */
function fixture(): Fixture {
  return {
    storyFile: new Map([
      ['DzCard', 'packages/core/stories/cards/DzCard.stories.ts'],
      ['DzInput', 'packages/core/stories/inputs/DzInput.stories.ts'],
      ['DzSlider', 'packages/core/stories/forms/DzSlider.stories.ts'],
      ['DzKnobby', 'packages/core/stories/forms/DzKnobby.stories.ts'],
    ]),
    storyDod: new Map([['states', new Set(['DzKnobby'])]]),
    storyApplicable: new Map([['states', new Set(['DzSlider', 'DzKnobby'])]]),
    storyPassing: new Map([['states', new Set(['DzInput', 'DzSlider'])]]),
  }
}

describe('storyCheck — a check that was never asked', () => {
  const f = fixture()

  it('the OLD inversion answers `pass` for a component the check does not apply to', () => {
    // DzCard is absent from `violations`, because it was never in `applicable`.
    expect(oldStoryCheck(f.storyFile, f.storyDod, 'DzCard', 'states')).toBe('pass')
  })

  it('the NEW resolution answers `excepted`, and says why', () => {
    const result = storyCheck(f, 'DzCard', 'states')

    expect(result.state).toBe('excepted')
    expect(result.note).toContain('does not apply')
    expect(result.note).toContain('.types.ts')
  })

  it('a `States` story still reads `pass` even where applicability says the check does not apply', () => {
    // The arm that must come FIRST. Nine components inherit their state props, so
    // the `states` check never asks them — and nine of them demonstrate states
    // anyway. Asking applicability first demoted `DzInput`'s real `States` story
    // to "nothing to demonstrate", which is how this was measured: the first
    // tightening moved 36 cells, and 9 of them were wrong.
    expect(f.storyApplicable.get('states')!.has('DzInput')).toBe(false)
    expect(storyCheck(f, 'DzInput', 'states')).toEqual({ state: 'pass' })
  })

  it('applicable and passing is `pass`; applicable and failing is `unrun`', () => {
    expect(storyCheck(f, 'DzSlider', 'states')).toEqual({ state: 'pass' })
    expect(storyCheck(f, 'DzKnobby', 'states').state).toBe('unrun')
  })

  it('no story file at all is `unrun`, not `excepted`', () => {
    // "Nobody wrote a story" is a gap the matrix exists to show. It is not an
    // exception, and it must not acquire a reason it has not earned.
    expect(storyCheck(f, 'DzNoStory', 'states')).toEqual({ state: 'unrun' })
  })

  it('a check with no applicability narrowing behaves exactly as before', () => {
    // `dark-mode`, `accessibility`, `real-world` and `play` all declare
    // `applies: () => true`, so every component with a story is in `applicable`
    // and the three-way resolution must collapse back to the two-way one.
    const all: Fixture = {
      storyFile: new Map([['DzCard', 'a.stories.ts'], ['DzKnobby', 'b.stories.ts']]),
      storyDod: new Map([['dark-mode', new Set(['DzKnobby'])]]),
      storyApplicable: new Map([['dark-mode', new Set(['DzCard', 'DzKnobby'])]]),
      storyPassing: new Map([['dark-mode', new Set(['DzCard'])]]),
    }

    expect(storyCheck(all, 'DzCard', 'dark-mode').state)
      .toBe(oldStoryCheck(all.storyFile, all.storyDod, 'DzCard', 'dark-mode'))
    expect(storyCheck(all, 'DzKnobby', 'dark-mode').state)
      .toBe(oldStoryCheck(all.storyFile, all.storyDod, 'DzKnobby', 'dark-mode'))
  })
})
