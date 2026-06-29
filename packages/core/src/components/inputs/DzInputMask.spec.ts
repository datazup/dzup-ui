import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
/**
 * DzInputMask — Unit / behavior tests.
 *
 * Covers the pure mask engine in isolation plus the component's typing,
 * paste, backspace/delete, autoClear, completed-state, and emit behaviour.
 */
import { afterEach, describe, expect, it } from 'vitest'
import {
  applyMask,
  backspaceValue,
  charMatchesToken,
  countTokens,
  forwardDeleteValue,
  isMaskToken,
} from './DzInputMask.engine.ts'
import DzInputMask from './DzInputMask.vue'

// ---------------------------------------------------------------------------
// Pure engine
// ---------------------------------------------------------------------------

describe('dzInputMask engine — token helpers', () => {
  it('recognises the token alphabet (9, a, *)', () => {
    expect(isMaskToken('9')).toBe(true)
    expect(isMaskToken('a')).toBe(true)
    expect(isMaskToken('*')).toBe(true)
    expect(isMaskToken('-')).toBe(false)
    expect(isMaskToken('(')).toBe(false)
  })

  it('matches characters to the correct token', () => {
    expect(charMatchesToken('5', '9')).toBe(true)
    expect(charMatchesToken('x', '9')).toBe(false)
    expect(charMatchesToken('A', 'a')).toBe(true)
    expect(charMatchesToken('5', 'a')).toBe(false)
    expect(charMatchesToken('Z', '*')).toBe(true)
    expect(charMatchesToken('7', '*')).toBe(true)
    expect(charMatchesToken('-', '*')).toBe(false)
  })

  it('counts token positions, ignoring literals', () => {
    expect(countTokens('(999) 999-9999')).toBe(10)
    expect(countTokens('99/99/9999')).toBe(8)
    expect(countTokens('***-***')).toBe(6)
  })
})

describe('dzInputMask engine — applyMask', () => {
  it('returns a fully empty result for empty input', () => {
    expect(applyMask('', '(999) 999-9999')).toEqual({
      masked: '',
      unmasked: '',
      completed: false,
      caret: 0,
    })
  })

  it('inserts literals automatically while distributing digits', () => {
    const res = applyMask('1234567890', '(999) 999-9999')
    expect(res.masked).toBe('(123) 456-7890')
    expect(res.unmasked).toBe('1234567890')
    expect(res.completed).toBe(true)
  })

  it('pads unfilled token positions with the slot character', () => {
    const res = applyMask('12', '99/99/9999', '_')
    expect(res.masked).toBe('12/__/____')
    expect(res.unmasked).toBe('12')
    expect(res.completed).toBe(false)
  })

  it('honours a custom slot character', () => {
    const res = applyMask('12', '99-99', '#')
    expect(res.masked).toBe('12-##')
  })

  it('skips characters that do not match the next token', () => {
    const res = applyMask('1a2b3', '999')
    expect(res.masked).toBe('123')
    expect(res.unmasked).toBe('123')
    expect(res.completed).toBe(true)
  })

  it('strips literals from a pre-formatted pasted value', () => {
    const res = applyMask('(123) 456-7890', '(999) 999-9999')
    expect(res.unmasked).toBe('1234567890')
    expect(res.masked).toBe('(123) 456-7890')
  })

  it('supports letter and alphanumeric tokens with case preserved', () => {
    expect(applyMask('AbC', 'aaa').masked).toBe('AbC')
    expect(applyMask('a1B', '***').masked).toBe('a1B')
    expect(applyMask('1', 'aaa').masked).toBe('') // digit rejected by letter token
  })

  it('places the caret after the entered value, skipping literals', () => {
    // Two digits entered into "99-99" → caret should sit past the dash.
    const res = applyMask('12', '99-99')
    expect(res.masked).toBe('12-__')
    expect(res.caret).toBe(3)
  })
})

describe('dzInputMask engine — backspace / delete', () => {
  it('deletes the previous value character (literal-aware backspace)', () => {
    // Caret after the last digit; backspace removes that digit, not a slot/literal.
    const res = backspaceValue('12-3_', '99-99', '_', 4)
    expect(res).not.toBeNull()
    expect(res!.unmasked).toBe('12')
    expect(res!.masked).toBe('12-__')
  })

  it('skips a literal when backspacing from just after it', () => {
    // Caret sits right after the dash → the value char before the dash is removed.
    const res = backspaceValue('12-3_', '99-99', '_', 3)
    expect(res!.unmasked).toBe('13')
    expect(res!.masked).toBe('13-__')
  })

  it('returns null when there is nothing to backspace', () => {
    expect(backspaceValue('', '99-99', '_', 0)).toBeNull()
  })

  it('forward-deletes the value character at the caret', () => {
    const res = forwardDeleteValue('12-34', '99-99', '_', 0)
    expect(res).not.toBeNull()
    expect(res!.unmasked).toBe('234')
  })

  it('returns null when there is nothing to forward-delete', () => {
    expect(forwardDeleteValue('12-__', '99-99', '_', 4)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let wrapper: VueWrapper<InstanceType<typeof DzInputMask>> | null = null

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

/** Simulate the field receiving `raw` text with the caret at its end. */
async function typeRaw(w: VueWrapper<InstanceType<typeof DzInputMask>>, raw: string, caret?: number): Promise<void> {
  const input = w.find('input')
  const el = input.element as HTMLInputElement
  el.value = raw
  const pos = caret ?? raw.length
  el.setSelectionRange(pos, pos)
  await input.trigger('input')
}

describe('dzInputMask — component behaviour', () => {
  it('masks typed/pasted input and emits update:unmasked', async () => {
    wrapper = mount(DzInputMask, {
      props: { mask: '(999) 999-9999' },
      attachTo: document.body,
    })
    await typeRaw(wrapper, '1234567890')

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('(123) 456-7890')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['(123) 456-7890'])
    const unmasked = wrapper.emitted('update:unmasked')
    expect(unmasked?.at(-1)).toEqual(['1234567890'])
  })

  it('emits the complete event once when all tokens fill', async () => {
    wrapper = mount(DzInputMask, { props: { mask: '999' }, attachTo: document.body })
    await typeRaw(wrapper, '12')
    expect(wrapper.emitted('complete')).toBeUndefined()
    await typeRaw(wrapper, '123')
    expect(wrapper.emitted('complete')).toEqual([['123']])
  })

  it('rejects characters that do not match the next token', async () => {
    wrapper = mount(DzInputMask, { props: { mask: '999' }, attachTo: document.body })
    await typeRaw(wrapper, '1a2')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('12_')
    expect(wrapper.emitted('update:unmasked')?.at(-1)).toEqual(['12'])
  })

  it('performs a literal-aware backspace via keydown', async () => {
    wrapper = mount(DzInputMask, {
      props: { mask: '99-99', modelValue: '123' },
      attachTo: document.body,
    })
    const input = wrapper.find('input')
    const el = input.element as HTMLInputElement
    expect(el.value).toBe('12-3_')
    el.setSelectionRange(4, 4)
    await input.trigger('keydown', { key: 'Backspace' })
    expect(el.value).toBe('12-__')
    expect(wrapper.emitted('update:unmasked')?.at(-1)).toEqual(['12'])
  })

  it('clears an incomplete value on blur when autoClear is set', async () => {
    wrapper = mount(DzInputMask, {
      props: { mask: '999', autoClear: true },
      attachTo: document.body,
    })
    await typeRaw(wrapper, '12')
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('12_')
    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('')
    expect(wrapper.props('modelValue')).toBe('')
  })

  it('keeps a completed value on blur when autoClear is set', async () => {
    wrapper = mount(DzInputMask, {
      props: { mask: '999', autoClear: true },
      attachTo: document.body,
    })
    await typeRaw(wrapper, '123')
    const input = wrapper.find('input')
    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('123')
  })

  it('normalizes an externally-set model value on mount', () => {
    wrapper = mount(DzInputMask, {
      props: { mask: '99/99/9999', modelValue: '12252026' },
      attachTo: document.body,
    })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('12/25/2026')
    expect(wrapper.emitted('update:unmasked')?.at(-1)).toEqual(['12252026'])
  })

  it('sets disabled and readonly on the native input', () => {
    const disabled = mount(DzInputMask, { props: { mask: '99', disabled: true } })
    expect((disabled.find('input').element as HTMLInputElement).disabled).toBe(true)
    disabled.unmount()

    const readonly = mount(DzInputMask, { props: { mask: '99', readonly: true } })
    expect((readonly.find('input').element as HTMLInputElement).readOnly).toBe(true)
    readonly.unmount()
  })

  it('merges consumer class onto the input wrapper via cn()', () => {
    wrapper = mount(DzInputMask, {
      props: { mask: '99' },
      attrs: { class: 'my-mask-class' },
    })
    expect(wrapper.html()).toContain('my-mask-class')
  })

  it('exposes completed and unmasked state', async () => {
    wrapper = mount(DzInputMask, { props: { mask: '99' }, attachTo: document.body })
    await typeRaw(wrapper, '12')
    expect((wrapper.vm as unknown as Record<string, unknown>).completed).toBe(true)
    expect((wrapper.vm as unknown as Record<string, unknown>).unmasked).toBe('12')
  })
})
