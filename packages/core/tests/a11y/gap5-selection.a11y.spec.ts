import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzCascader from '../../src/components/forms/DzCascader.vue'
import DzTransfer from '../../src/components/forms/DzTransfer.vue'
import './register-matchers.ts'

describe('gap5 selection-control accessibility scope', () => {
  it('checks DzTransfer source/target ownership, selected items and required/invalid states', async () => {
    const wrapper = mount(DzTransfer, {
      props: {
        source: [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta', disabled: true }],
        modelValue: ['a'], ariaLabel: 'Assign records', required: true, invalid: true,
        error: 'Choose a record',
      },
    })
    expect(wrapper.findAll('[role="listbox"]')).toHaveLength(2)
    expect(await axe(wrapper.element)).toHaveNoViolations()
    wrapper.unmount()
  })

  it('checks DzCascader empty and disabled closed triggers, keeping D4 and open portal scope separate', async () => {
    const wrapper = mount(DzCascader, { props: { options: [], ariaLabel: 'Region', required: true } })
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    expect(await axe(wrapper.element)).toHaveNoViolations()
    await wrapper.setProps({ disabled: true })
    expect(await axe(wrapper.element)).toHaveNoViolations()
    wrapper.unmount()
  })
})
