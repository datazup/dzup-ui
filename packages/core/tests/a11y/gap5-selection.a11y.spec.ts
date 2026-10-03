import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzCascader from '../../src/components/forms/DzCascader.vue'
import DzTransfer from '../../src/components/forms/DzTransfer.vue'
import './register-matchers.ts'

const landmarks: HTMLElement[] = []
function createLandmark(): HTMLElement {
  const landmark = document.createElement('main')
  document.body.append(landmark)
  landmarks.push(landmark)
  return landmark
}
enableAutoUnmount(afterEach)
afterEach(() => {
  for (const landmark of landmarks.splice(0))
    landmark.remove()
})

describe('gap5 selection-control accessibility scope', () => {
  it('checks DzTransfer source/target ownership, selected items and required/invalid states', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzTransfer, {
      props: {
        source: [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta', disabled: true }],
        modelValue: ['a'],
        ariaLabel: 'Assign records',
        required: true,
        invalid: true,
        error: 'Choose a record',
      },
      attachTo: landmark,
    })
    expect(wrapper.findAll('[role="listbox"]')).toHaveLength(2)
    expect(await axe(landmark)).toHaveNoViolations()
    wrapper.unmount()
  })

  it('checks DzCascader empty and disabled closed triggers, keeping D4 and open portal scope separate', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzCascader, { props: { options: [], ariaLabel: 'Region', required: true }, attachTo: landmark })
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ disabled: true })
    expect(await axe(landmark)).toHaveNoViolations()
    wrapper.unmount()
  })
})
