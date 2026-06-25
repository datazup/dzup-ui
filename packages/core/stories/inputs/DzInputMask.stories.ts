import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzInputMask } from '../../src/components/inputs'
import {
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
} from '../../src/components/forms'

/**
 * DzInputMask is a format-masked text input for structured fields such as phone
 * numbers, dates, credit cards, SSNs, postcodes, and license keys.
 *
 * The mask alphabet is `9` (digit), `a` (letter), and `*` (alphanumeric); every
 * other character is a literal that is rendered verbatim and skipped
 * automatically while typing. It stays a native `<input>` under the hood so
 * screen readers and form autofill keep working, exposes a `completed` state for
 * validation, and emits both the displayed masked value (`v-model`) and the
 * stripped `update:unmasked` value.
 */
const meta = {
  title: 'Core/Inputs/DzInputMask',
  component: DzInputMask,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    // Behavior
    mask: {
      control: 'text',
      description:
        'Mask pattern — 9 = digit, a = letter, * = alphanumeric; everything else is a literal',
      table: { category: 'Behavior' },
    },
    slotChar: {
      control: 'text',
      description: 'Character shown for unfilled token positions',
      table: { category: 'Behavior', defaultValue: { summary: '_' } },
    },
    autoClear: {
      control: 'boolean',
      description: 'Clear the field on blur when the input is incomplete',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the field is empty',
      table: { category: 'Behavior' },
    },
    // Appearance
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance' },
    },
    // Behavior / state
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only state -- visible but not editable',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Whether the field value is invalid',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'text',
      description: 'Error message to display',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    mask: '(999) 999-9999',
    slotChar: '_',
    autoClear: false,
    variant: 'outline',
    size: 'md',
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
  },
} satisfies Meta<typeof DzInputMask>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Phone
// ---------------------------------------------------------------------------

export const Phone: Story = {
  name: 'Phone Number',
  render: (args) => ({
    components: { DzInputMask },
    setup() {
      return { args }
    },
    data() {
      return { masked: '', raw: '' }
    },
    template: `
      <div class="space-y-3 max-w-xs">
        <DzInputMask
          v-bind="args"
          v-model="masked"
          aria-label="Phone number"
          @update:unmasked="raw = $event"
        />
        <p class="text-sm text-gray-500">
          Masked: <code class="bg-gray-100 px-1 rounded">{{ masked || '(empty)' }}</code>
        </p>
        <p class="text-sm text-gray-500">
          Unmasked: <code class="bg-gray-100 px-1 rounded">{{ raw || '(empty)' }}</code>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: /phone number/i })

    // Click to focus, then type the digits — literals (parentheses, space, dash)
    // are auto-inserted by the mask engine.
    await userEvent.click(input)
    await userEvent.keyboard('2125550199')

    // Masked value should reflect the (212) 555-0199 template.
    await expect(input).toHaveValue('(212) 555-0199')

    // Unmasked display shows the raw digits only.
    await expect(canvas.getByText(/2125550199/)).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------

export const Date: Story = {
  args: {
    mask: '99/99/9999',
    placeholder: 'MM/DD/YYYY',
  },
  render: (args) => ({
    components: { DzInputMask },
    setup() {
      return { args }
    },
    template: '<DzInputMask v-bind="args" aria-label="Date" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Credit Card
// ---------------------------------------------------------------------------

export const CreditCard: Story = {
  name: 'Credit Card',
  args: {
    mask: '9999 9999 9999 9999',
    placeholder: '0000 0000 0000 0000',
  },
  render: (args) => ({
    components: { DzInputMask },
    setup() {
      return { args }
    },
    template: '<DzInputMask v-bind="args" aria-label="Credit card number" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Custom Key (alphanumeric + letter tokens)
// ---------------------------------------------------------------------------

export const CustomKey: Story = {
  name: 'License Key',
  args: {
    mask: '****-****-****',
    placeholder: 'XXXX-XXXX-XXXX',
  },
  render: (args) => ({
    components: { DzInputMask },
    setup() {
      return { args }
    },
    template: '<DzInputMask v-bind="args" aria-label="License key" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// With DzFormField (label + description + message)
// ---------------------------------------------------------------------------

export const WithFormField: Story = {
  name: 'With Form Field',
  render: () => ({
    components: { DzInputMask, DzFormField, DzFormLabel, DzFormDescription, DzFormMessage },
    template: `
      <DzFormField required class="max-w-sm">
        <DzFormLabel>Phone Number</DzFormLabel>
        <DzInputMask mask="(999) 999-9999" />
        <DzFormDescription>Format: (123) 456-7890</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// AutoClear (incomplete entries cleared on blur)
// ---------------------------------------------------------------------------

export const AutoClear: Story = {
  name: 'Auto Clear on Blur',
  args: {
    mask: '99/99/9999',
    autoClear: true,
    placeholder: 'MM/DD/YYYY',
  },
  parameters: {
    docs: {
      description: {
        story: 'Type a partial date, then click away — incomplete input is cleared on blur.',
      },
    },
  },
  render: (args) => ({
    components: { DzInputMask },
    setup() {
      return { args }
    },
    template: '<DzInputMask v-bind="args" aria-label="Date with auto-clear" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Sizes matrix
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzInputMask },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInputMask size="xs" mask="(999) 999-9999" aria-label="xs" placeholder="Extra small" />
        <DzInputMask size="sm" mask="(999) 999-9999" aria-label="sm" placeholder="Small" />
        <DzInputMask size="md" mask="(999) 999-9999" aria-label="md" placeholder="Medium" />
        <DzInputMask size="lg" mask="(999) 999-9999" aria-label="lg" placeholder="Large" />
        <DzInputMask size="xl" mask="(999) 999-9999" aria-label="xl" placeholder="Extra large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzInputMask },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInputMask variant="outline" mask="(999) 999-9999" aria-label="Outline" placeholder="Outline" />
        <DzInputMask variant="filled" mask="(999) 999-9999" aria-label="Filled" placeholder="Filled" />
        <DzInputMask variant="underlined" mask="(999) 999-9999" aria-label="Underlined" placeholder="Underlined" />
        <DzInputMask mask="99/99/9999" error="Enter a valid date" aria-label="Invalid" placeholder="MM/DD/YYYY" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: keyboard navigation and aria attributes
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard & ARIA',
  render: () => ({
    components: { DzInputMask },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">
          Tab to focus, type digits — literals are skipped automatically.
          Backspace erases one user-entered character at a time.
        </p>
        <DzInputMask
          mask="(999) 999-9999"
          aria-label="Phone number input"
          placeholder="(___) ___-____"
        />
        <DzInputMask
          mask="99/99/9999"
          aria-label="Date input"
          placeholder="MM/DD/YYYY"
          invalid
          error="Enter a valid date"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const phone = canvas.getByRole('textbox', { name: /phone number input/i })
    const date = canvas.getByRole('textbox', { name: /date input/i })

    // Phone: digits fill the mask slots; literals are inserted automatically.
    await userEvent.click(phone)
    await userEvent.keyboard('8005551234')
    await expect(phone).toHaveValue('(800) 555-1234')

    // Backspace removes the last user digit (skips the literal dash).
    await userEvent.keyboard('{Backspace}')
    await expect(phone).not.toHaveValue('(800) 555-1234')

    // Invalid date input exposes aria-invalid.
    await expect(date).toHaveAttribute('aria-invalid', 'true')

    // Tab moves focus from phone to date field.
    phone.focus()
    await userEvent.tab()
    await expect(date).toHaveFocus()
  },
}
