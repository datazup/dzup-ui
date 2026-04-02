import { mount } from '@vue/test-utils'
/**
 * useFormField — Unit tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { DZ_FORM_FIELD_KEY, useFormField, useFormFieldContext } from './useFormField.ts'

/** Helper to test the composable within a component tree */
function mountWithFormField(options: Parameters<typeof useFormField>[0] = {}) {
  let result: ReturnType<typeof useFormField> | null = null

  const Provider = defineComponent({
    setup() {
      result = useFormField(options)
      return () => h('div')
    },
  })

  const wrapper = mount(Provider)
  return { wrapper, result: result! }
}

describe('useFormField', () => {
  it('returns all required context fields', () => {
    const { result } = mountWithFormField()
    expect(result.fieldId).toBeTruthy()
    expect(result.labelId).toBeTruthy()
    expect(result.descriptionId).toBeTruthy()
    expect(result.messageId).toBeTruthy()
    expect(result.ariaDescribedby).toBeDefined()
    expect(result.isInvalid).toBeDefined()
    expect(result.isRequired).toBeDefined()
    expect(result.isDisabled).toBeDefined()
    expect(result.error).toBeDefined()
  })

  it('generates unique IDs for each field', () => {
    const { result } = mountWithFormField()
    const ids = new Set([result.fieldId, result.labelId, result.descriptionId, result.messageId])
    expect(ids.size).toBe(4)
  })

  it('uses custom ID prefix when provided', () => {
    const { result } = mountWithFormField({ id: 'my-email' })
    expect(result.fieldId).toContain('my-email')
    expect(result.labelId).toContain('my-email')
  })

  it('computes isInvalid from error string', () => {
    const { result } = mountWithFormField({ error: 'Required' })
    expect(result.isInvalid.value).toBe(true)
  })

  it('computes isInvalid from invalid option', () => {
    const { result } = mountWithFormField({ invalid: true })
    expect(result.isInvalid.value).toBe(true)
  })

  it('isInvalid is false when no error or invalid flag', () => {
    const { result } = mountWithFormField()
    expect(result.isInvalid.value).toBe(false)
  })

  it('computes isRequired from option', () => {
    const { result } = mountWithFormField({ required: true })
    expect(result.isRequired.value).toBe(true)
  })

  it('computes isDisabled from option', () => {
    const { result } = mountWithFormField({ disabled: true })
    expect(result.isDisabled.value).toBe(true)
  })

  it('ariaDescribedby includes description ID always', () => {
    const { result } = mountWithFormField()
    expect(result.ariaDescribedby.value).toContain(result.descriptionId)
  })

  it('ariaDescribedby includes message ID when invalid', () => {
    const { result } = mountWithFormField({ error: 'Bad value' })
    expect(result.ariaDescribedby.value).toContain(result.messageId)
  })

  it('ariaDescribedby does not include message ID when valid', () => {
    const { result } = mountWithFormField()
    expect(result.ariaDescribedby.value).not.toContain(result.messageId)
  })

  it('provides context via DZ_FORM_FIELD_KEY', () => {
    let injected: unknown = null

    const Child = defineComponent({
      setup() {
        injected = inject(DZ_FORM_FIELD_KEY)
        return () => h('span')
      },
    })

    const Provider = defineComponent({
      setup() {
        useFormField()
        return () => h(Child)
      },
    })

    mount(Provider)
    expect(injected).not.toBeNull()
  })
})

describe('useFormFieldContext', () => {
  it('returns null when used outside DzFormField', () => {
    let result: unknown = 'not-null'

    const Comp = defineComponent({
      setup() {
        result = useFormFieldContext()
        return () => h('div')
      },
    })

    mount(Comp)
    expect(result).toBeNull()
  })

  it('returns context when used inside DzFormField', () => {
    let result: unknown = null

    const Child = defineComponent({
      setup() {
        result = useFormFieldContext()
        return () => h('span')
      },
    })

    const Provider = defineComponent({
      setup() {
        useFormField({ error: 'Test' })
        return () => h(Child)
      },
    })

    mount(Provider)
    expect(result).not.toBeNull()
  })
})
