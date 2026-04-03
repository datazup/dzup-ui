/**
 * Accessibility tests for the inputs and forms families.
 *
 * Tests DzInput, DzTextarea, DzCheckbox, DzRadio (within DzRadioGroup),
 * DzSwitch, and DzSelect for WCAG 2.1 AA compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzCheckbox from '../../src/components/forms/DzCheckbox.vue'
import DzRadio from '../../src/components/forms/DzRadio.vue'
import DzRadioGroup from '../../src/components/forms/DzRadioGroup.vue'
import DzSelect from '../../src/components/forms/DzSelect.vue'
import DzSwitch from '../../src/components/forms/DzSwitch.vue'
import DzInput from '../../src/components/inputs/DzInput.vue'
import DzTextarea from '../../src/components/inputs/DzTextarea.vue'

describe('inputs family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzInput
  // ---------------------------------------------------------------------------

  describe('dzInput', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzInput, {
        props: { ariaLabel: 'Email address' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with associated label element', async () => {
      const { container } = render({
        template: `
          <div>
            <label for="test-input">Username</label>
            <DzInput id="test-input" />
          </div>
        `,
        components: { DzInput },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('sets aria-invalid when invalid', () => {
      const { container } = render(DzInput, {
        props: { ariaLabel: 'Name', invalid: true },
      })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('sets aria-required when required', () => {
      const { container } = render(DzInput, {
        props: { ariaLabel: 'Required field', required: true },
      })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('associates error message via aria-describedby', () => {
      const { container } = render(DzInput, {
        props: { ariaLabel: 'Email', error: 'Invalid email', id: 'email-field' },
      })
      const input = container.querySelector('input')
      const errorEl = container.querySelector('[role="alert"]')
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('email-field-error'))
      expect(errorEl).toHaveTextContent('Invalid email')
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzInput, {
        props: { ariaLabel: 'Disabled field', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('clear button has accessible label', () => {
      const { container } = render(DzInput, {
        props: { ariaLabel: 'Search', clearable: true, modelValue: 'test' },
      })
      const clearBtn = container.querySelector('button[aria-label="Clear input"]')
      expect(clearBtn).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // DzTextarea
  // ---------------------------------------------------------------------------

  describe('dzTextarea', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzTextarea, {
        props: { ariaLabel: 'Description' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('sets aria-invalid and aria-required correctly', () => {
      const { container } = render(DzTextarea, {
        props: { ariaLabel: 'Comment', invalid: true, required: true },
      })
      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(textarea).toHaveAttribute('aria-required', 'true')
    })

    it('associates error message via aria-describedby', () => {
      const { container } = render(DzTextarea, {
        props: { ariaLabel: 'Bio', error: 'Too short', id: 'bio-field' },
      })
      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining('bio-field-error'))
    })
  })

  // ---------------------------------------------------------------------------
  // DzCheckbox
  // ---------------------------------------------------------------------------

  describe('dzCheckbox', () => {
    it('has no a11y violations with label text', async () => {
      const { container } = render(DzCheckbox, {
        props: { ariaLabel: 'Agree to terms' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with slot label', async () => {
      const { container } = render(DzCheckbox, {
        slots: { default: 'I agree to the terms' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzCheckbox, {
        props: { disabled: true, ariaLabel: 'Disabled checkbox' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzRadio (within DzRadioGroup)
  // ---------------------------------------------------------------------------

  describe('dzRadio', () => {
    it('has no a11y violations within a RadioGroup', async () => {
      const { container } = render({
        template: `
          <DzRadioGroup aria-label="Choose color">
            <DzRadio value="red">Red</DzRadio>
            <DzRadio value="blue">Blue</DzRadio>
            <DzRadio value="green">Green</DzRadio>
          </DzRadioGroup>
        `,
        components: { DzRadioGroup, DzRadio },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzSwitch
  // ---------------------------------------------------------------------------

  describe('dzSwitch', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzSwitch, {
        props: { ariaLabel: 'Enable notifications' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with slot label', async () => {
      const { container } = render(DzSwitch, {
        slots: { default: 'Dark mode' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzSwitch, {
        props: { disabled: true, ariaLabel: 'Disabled toggle' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzSelect
  // ---------------------------------------------------------------------------

  describe('dzSelect', () => {
    const items = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
    ]

    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzSelect, {
        props: { items, ariaLabel: 'Choose fruit' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('trigger has accessible name', () => {
      const { container } = render(DzSelect, {
        props: { items, ariaLabel: 'Favorite fruit' },
      })
      const trigger = container.querySelector('[aria-label="Favorite fruit"]')
      expect(trigger).toBeTruthy()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzSelect, {
        props: { items, ariaLabel: 'Disabled select', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
