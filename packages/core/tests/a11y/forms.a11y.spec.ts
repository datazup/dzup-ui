/**
 * Accessibility tests for the forms family.
 *
 * Tests DzDatePicker, DzFileUpload, DzSlider, DzCombobox, DzMultiSelect,
 * and DzFormField for WCAG 2.1 AA compliance using vitest-axe.
 *
 * Note: DzCheckbox, DzRadio, DzSwitch, DzSelect are tested in inputs.a11y.spec.ts.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzCombobox from '../../src/components/forms/DzCombobox.vue'
import DzFileUpload from '../../src/components/forms/DzFileUpload.vue'
import DzFormField from '../../src/components/forms/DzFormField.vue'
import DzFormLabel from '../../src/components/forms/DzFormLabel.vue'
import DzMultiSelect from '../../src/components/forms/DzMultiSelect.vue'
import DzSlider from '../../src/components/forms/DzSlider.vue'

describe('forms family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzSlider
  // ---------------------------------------------------------------------------

  describe('dzSlider', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzSlider, {
        props: { ariaLabel: 'Volume' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzSlider, {
        props: { ariaLabel: 'Disabled slider', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzFileUpload
  // ---------------------------------------------------------------------------

  describe('dzFileUpload', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzFileUpload, {
        props: { ariaLabel: 'Upload documents' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzFileUpload, {
        props: { ariaLabel: 'Upload disabled', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzCombobox
  // ---------------------------------------------------------------------------

  describe('dzCombobox', () => {
    const items = [
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
      { label: 'Angular', value: 'angular' },
    ]

    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzCombobox, {
        props: { items, ariaLabel: 'Choose framework' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzCombobox, {
        props: { items, ariaLabel: 'Disabled combobox', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzMultiSelect
  // ---------------------------------------------------------------------------

  describe('dzMultiSelect', () => {
    const items = [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' },
    ]

    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzMultiSelect, {
        props: { items, ariaLabel: 'Choose colors' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzMultiSelect, {
        props: { items, ariaLabel: 'Disabled multi-select', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzFormField
  // ---------------------------------------------------------------------------

  describe('dzFormField', () => {
    it('has no a11y violations with label and input', async () => {
      const { container } = render({
        template: `
          <DzFormField>
            <DzFormLabel>Email</DzFormLabel>
            <input type="email" aria-label="Email address" />
          </DzFormField>
        `,
        components: { DzFormField, DzFormLabel },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
