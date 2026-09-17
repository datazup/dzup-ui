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
 * This spec does **not** fix D8 — TASK-R2-O3 owns that. It is the contract that
 * would have caught it, and it is deliberately arranged so that the fix makes
 * this file go red: the seven are asserted to be *still broken*, so a control
 * that starts behaving correctly fails here and has to be removed from the
 * list. A known-defect list that does not notice being fixed is how a defect
 * register drifts from the code.
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
 * The controls D8 applies to, as recorded by the N1-O1 defect register.
 *
 * A list rather than a scan result so the two can be compared: if the scan
 * finds a component the register does not name, an eighth control has acquired
 * the defect.
 */
const D8_CONTROLS = [
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

  it('is VIOLATED after one user edit — this is defect D8', () => {
    const { legacy, model } = bindLegacyOnly('first')

    // The user edits. `set` writes BOTH models, latching a value into the
    // default model that nobody bound.
    model.value = 'typed by the user'

    // The parent now writes — a form reset, a revert, a loaded draft.
    legacy.value = ''

    const trace = {
      afterUserEdit: 'typed by the user',
      externalWrite: '',
      afterExternalWrite: model.value,
    }

    // Recorded as an expected failure rather than asserted away. When
    // TASK-R2-O3 fixes `useDualModel`, `checkExternalWrite` returns no problems
    // and this expectation fails — which is the signal to delete this test and
    // enable the one below.
    expect(
      checkExternalWrite('useDualModel', trace),
      'D8 appears to be FIXED. Delete this expected-failure test, remove the '
      + 'D8_CONTROLS list, and enable `the contract, once D8 is fixed` below.',
    ).toHaveLength(1)

    expect(model.value).toBe('typed by the user')
  })

  it.skip('the contract, once D8 is fixed (TASK-R2-O3 enables this)', () => {
    const { legacy, model } = bindLegacyOnly('first')

    model.value = 'typed by the user'
    legacy.value = ''

    expectExternalWrite('useDualModel', {
      afterUserEdit: 'typed by the user',
      externalWrite: '',
      afterExternalWrite: model.value,
    })
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

describe('the population D8 applies to is exactly the recorded seven', () => {
  const users = dualModelUsers()

  it('no eighth control has acquired the defect', () => {
    expect(
      users,
      'A component started using `useDualModel`. Until D8 is fixed (TASK-R2-O3) that '
      + 'means a consumer binding only `v-model:value` loses control of the value after '
      + 'the first user edit. Either bind the default model, or wait for the fix.',
    ).toEqual([...D8_CONTROLS])
  })

  it('every recorded control still exists', () => {
    const present = new Set(users)
    expect(D8_CONTROLS.filter(name => !present.has(name))).toEqual([])
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
