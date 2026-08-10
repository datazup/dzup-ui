import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FamilyPreview from './FamilyPreview.vue'

describe('familyPreview', () => {
  it.each([
    ['Buttons', 'Save'],
    ['Forms', 'Email alerts'],
    ['Data', 'Vue'],
  ])('renders the real %s family controls', (name, expectedText) => {
    const wrapper = mount(FamilyPreview, { props: { name } })

    expect(wrapper.get('.preview').text()).toContain(expectedText)
  })
})
