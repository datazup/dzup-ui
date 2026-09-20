/**
 * The controlled/uncontrolled contract (TASK-R5-O6 · defect D8).
 *
 * **An external write after a user edit must be honoured.** A parent that sets
 * a control's model — resetting a form, loading a draft, reverting an edit —
 * must see the control display the value it wrote, no matter what the user did
 * first.
 *
 * D8 is the violation, and the reason this assertion is written as a *trace*
 * rather than a snapshot. `useDualModel` reads
 * `isEmpty(primary.value) ? legacy.value : primary.value` and **writes to
 * both**. A consumer who binds only the legacy `v-model:value` leaves `primary`
 * as component-local state holding `undefined` — so reads fall through to
 * `legacy` and everything works. Then the user edits once. The write latches a
 * value into `primary`, `isEmpty` is now false, and from that moment every read
 * prefers the local state and every external write to `value` is silently
 * discarded. Resetting a form field does nothing at all.
 *
 * Seven public controls share it: `DzCascader`, `DzInplace`, `DzKnob`,
 * `DzMention`, `DzRating`, `DzTagsInput`, `DzTreeSelect`.
 *
 * **The whole suite was green through all of it**, because every test mounted
 * fresh and then asserted — and on a fresh mount the composable is correct. A
 * check that cannot express "and *then* this happened" could not have caught
 * it, which is the point `checkExternalWrite` encodes by requiring the
 * `afterUserEdit` reading.
 *
 * ## Scope
 *
 * **D8 is fixed (TASK-R2-O3).** `useDualModel` now remembers the value it last
 * wrote, so a model that has moved away from it was moved by the parent and the
 * parent's write wins. R5-O6 wrote this file deliberately arranged to go red on
 * that fix — the seven were asserted to be *still broken*, so a control that
 * started behaving correctly failed here. It did, and the expected-failure test
 * has been deleted rather than worked around; the contract that was skipped
 * behind it is now the live assertion.
 *
 * The population list stays, with its meaning inverted: it no longer records who
 * carries the defect, it records who must carry a **regression spec** for it.
 * A component that starts using `useDualModel` without one fails here.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkExternalWrite, expectExternalWrite } from '@dzup-ui/testing'
import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { useDualModel } from '../composables/useDualModel/index.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE_SRC = resolve(HERE, '..')

/**
 * The controls that share `useDualModel`, as recorded by the N1-O1 defect
 * register and re-measured here.
 *
 * A list rather than a scan result so the two can be compared: if the scan
 * finds a component the register does not name, an eighth control has joined
 * the population and owes the D8 regression spec the other seven carry.
 */
const DUAL_MODEL_CONTROLS = [
  'DzCascader',
  'DzInplace',
  'DzKnob',
  'DzMention',
  'DzRating',
  'DzTagsInput',
  'DzTreeSelect',
] as const

function collectVueFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      collectVueFiles(path, out)
    else if (entry.endsWith('.vue') && entry.startsWith('Dz'))
      out.push(path)
  }
  return out
}

function dualModelUsers(): string[] {
  return collectVueFiles(CORE_SRC)
    .filter(path => /\buseDualModel\b/.test(readFileSync(path, 'utf8')))
    .map(path => basename(path, '.vue'))
    .sort()
}

/**
 * Reproduce a consumer who binds **only** `v-model:value` — the legacy named
 * model — which is what every existing template for these seven does.
 *
 * `primary` is the default model nobody bound, so it is component-local state.
 */
function bindLegacyOnly<T>(initial: T, isEmpty?: (v: T | undefined) => boolean) {
  const primary = ref<T | undefined>(undefined)
  const legacy = ref<T>(initial)
  const model = useDualModel(
    primary as never,
    legacy as never,
    isEmpty as never,
  )
  return { primary, legacy, model }
}

describe('an external write after a user edit is honoured', () => {
  it('holds before the user touches the control', () => {
    // The assertion every existing spec makes, and the reason the suite was
    // green: on a fresh mount the composable is correct.
    const { legacy, model } = bindLegacyOnly('first')

    legacy.value = 'from the parent'
    expect(model.value).toBe('from the parent')
  })

  it('defect D8 -- holds after one user edit — the write that used to be discarded', () => {
    const { legacy, model } = bindLegacyOnly('first')

    // The user edits. `set` writes BOTH models, latching a value into the
    // default model that nobody bound — which is what D8 then preferred
    // forever.
    model.value = 'typed by the user'

    // The parent now writes — a form reset, a revert, a loaded draft.
    legacy.value = ''

    expectExternalWrite('useDualModel', {
      afterUserEdit: 'typed by the user',
      externalWrite: '',
      afterExternalWrite: model.value,
    })
  })

  it('defect D8 -- a second external write is honoured too, and a later user edit still wins', () => {
    // The fix must not leave the model pinned to the parent either — it is a
    // dual model, not a read-only projection.
    const { legacy, model } = bindLegacyOnly('first')

    model.value = 'typed by the user'
    legacy.value = ''
    expect(model.value).toBe('')

    legacy.value = 'a loaded draft'
    expect(model.value).toBe('a loaded draft')

    model.value = 'typed again'
    expect(model.value).toBe('typed again')

    legacy.value = ''
    expect(model.value).toBe('')
  })

  it('defect D8 -- an array model is compared by identity, not frozen by it', () => {
    // `DzTagsInput` and `DzCascader` hold arrays; a reference comparison that
    // treated a fresh array as "unchanged" would re-introduce the defect for
    // exactly the two controls where a reset matters most.
    const { legacy, model } = bindLegacyOnly<string[]>(['a'])

    model.value = ['a', 'typed']
    legacy.value = []

    expect(model.value).toEqual([])
  })

  it('a consumer who binds the DEFAULT v-model is unaffected', () => {
    // The documented escape hatch, checked so the advice in the defect register
    // stays true. N1-O1's `DzMention.RealWorldCommentComposer` story switched to
    // this binding and works.
    const primary = ref<string | undefined>('first')
    const legacy = ref<string>('first')
    const model = useDualModel(primary as never, legacy as never)

    model.value = 'typed by the user'
    primary.value = ''

    expectExternalWrite('useDualModel (default v-model)', {
      afterUserEdit: 'typed by the user',
      externalWrite: '',
      afterExternalWrite: model.value,
    })
  })
})

describe('the population that owes a D8 regression spec is exactly the recorded seven', () => {
  const users = dualModelUsers()

  it('no eighth control has joined without being recorded', () => {
    expect(
      users,
      'A component started using `useDualModel`. Add it to DUAL_MODEL_CONTROLS and give it '
      + 'the same D8 regression spec the other seven carry — a mounted control, bound with '
      + '`v-model:value` only, edited by the user and then written to by the parent.',
    ).toEqual([...DUAL_MODEL_CONTROLS])
  })

  it('every recorded control still exists', () => {
    const present = new Set(users)
    expect(DUAL_MODEL_CONTROLS.filter(name => !present.has(name))).toEqual([])
  })

  it('every recorded control carries a D8 regression spec of its own', () => {
    // The composable-level assertions above prove the rule; these prove it
    // reaches the seven shipped controls through their real templates, which is
    // where D8 was actually observed (N1-O1, `DzMention.RealWorldCommentComposer`).
    const missing = DUAL_MODEL_CONTROLS.filter((name) => {
      const path = join(CORE_SRC, 'components', 'forms', `${name}.spec.ts`)
      return !/\bD8\b/.test(readFileSync(path, 'utf8'))
    })

    expect(
      missing,
      'These controls use `useDualModel` but their spec file has no D8 regression test.',
    ).toEqual([])
  })
})

describe('the external-write check refuses a trace that proves nothing', () => {
  it('rejects a trace whose external write equals what was already shown', () => {
    // Without this, a fixture that "writes" the value the control already had
    // passes against a control that ignores every write. The check says so
    // rather than going green.
    const problems = checkExternalWrite('X', {
      afterUserEdit: 'same',
      externalWrite: 'same',
      afterExternalWrite: 'same',
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('cannot distinguish')
  })

  it('passes a trace where the write was honoured', () => {
    expect(checkExternalWrite('X', {
      afterUserEdit: 'user',
      externalWrite: 'parent',
      afterExternalWrite: 'parent',
    })).toEqual([])
  })

  it('fails a trace where the write was ignored', () => {
    const problems = checkExternalWrite('X', {
      afterUserEdit: 'user',
      externalWrite: 'parent',
      afterExternalWrite: 'user',
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('must be honoured')
  })

  it('compares by value, not by reference', () => {
    // An array or object model — `DzTagsInput` and `DzCascader` both hold one —
    // would otherwise fail a reference comparison after a legitimate write.
    expect(checkExternalWrite('X', {
      afterUserEdit: ['a'],
      externalWrite: ['b'],
      afterExternalWrite: ['b'],
    })).toEqual([])
  })

  it('a computed that never updates is caught', () => {
    // The shape of the defect, written as a minimal fake: a read that prefers a
    // latched local value over the bound one.
    const latched = ref<string | undefined>(undefined)
    const bound = ref('first')
    const frozen = computed(() => latched.value ?? bound.value)

    latched.value = 'typed by the user'
    bound.value = ''

    expect(checkExternalWrite('Frozen', {
      afterUserEdit: 'typed by the user',
      externalWrite: '',
      afterExternalWrite: frozen.value,
    })).toHaveLength(1)
  })
})
