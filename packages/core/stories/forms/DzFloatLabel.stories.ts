import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { DzFloatLabel } from '../../src/components/forms'
import { DzSelect } from '../../src/components/forms'
import { DzInput, DzTextarea } from '../../src/components/inputs'

/**
 * DzFloatLabel wraps a single dzup form control (DzInput, DzSelect, DzTextarea,
 * DzNumberInput, ...) and floats its label from a placeholder-like resting
 * position to a caption when the control is focused or filled.
 *
 * The label is wired to the control's `id` via `<label for>`, so it is a real,
 * accessible label — not a purely visual one. The float is a CSS-only
 * transition that respects `prefers-reduced-motion`.
 *
 * Three positioning variants are supported:
 * - `over` (default) — label rises *above* the control on focus/fill.
 * - `in` — label shrinks to the *top inside* the control.
 * - `on` — label sits *on the top border* (notched-outline style).
 *
 * Filled state is auto-detected for native controls (input/textarea/select).
 * For non-native controls (e.g. DzSelect's combobox trigger), bind `:filled`.
 */
const meta = {
  title: 'Core/Forms/DzFloatLabel',
  component: DzFloatLabel,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text floated over / above the control',
      table: { category: 'Content' },
    },
    variant: {
      control: 'inline-radio',
      options: ['over', 'in', 'on'],
      description: 'Label rest/float positioning style',
      table: { category: 'Appearance', defaultValue: { summary: 'over' } },
    },
    filled: {
      control: 'boolean',
      description: 'Explicit filled state (overrides auto-detection for non-native controls)',
      table: { category: 'Behavior' },
    },
  },
  args: {
    label: 'Email',
    variant: 'over',
  },
} satisfies Meta<typeof DzFloatLabel>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Over an input (default)
// ---------------------------------------------------------------------------

export const OverInput: Story = {
  render: args => ({
    components: { DzFloatLabel, DzInput },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-xs pt-6">
        <DzFloatLabel v-bind="args">
          <DzInput type="email" />
        </DzFloatLabel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With a select (non-native control → bind :filled)
// ---------------------------------------------------------------------------

export const WithSelect: Story = {
  name: 'With Select',
  render: () => ({
    components: { DzFloatLabel, DzSelect },
    data() {
      return {
        country: '',
        items: [
          { label: 'United States', value: 'us' },
          { label: 'Bosnia and Herzegovina', value: 'ba' },
          { label: 'Germany', value: 'de' },
        ],
      }
    },
    template: `
      <div class="max-w-xs pt-6 space-y-3">
        <DzFloatLabel label="Country" :filled="!!country">
          <DzSelect v-model="country" :items="items" />
        </DzFloatLabel>
        <p class="text-sm text-gray-500">Value: <strong>{{ country || 'none' }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant gallery
// ---------------------------------------------------------------------------

export const Variants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzFloatLabel, DzInput },
    template: `
      <div class="max-w-xs space-y-10 pt-6">
        <div>
          <p class="mb-1 text-xs uppercase tracking-wide text-gray-400">over</p>
          <DzFloatLabel label="Over label" variant="over">
            <DzInput />
          </DzFloatLabel>
        </div>
        <div>
          <p class="mb-1 text-xs uppercase tracking-wide text-gray-400">in</p>
          <DzFloatLabel label="In label" variant="in">
            <DzInput class="pt-5" />
          </DzFloatLabel>
        </div>
        <div>
          <p class="mb-1 text-xs uppercase tracking-wide text-gray-400">on</p>
          <DzFloatLabel label="On label" variant="on">
            <DzInput />
          </DzFloatLabel>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Pre-filled (stays floated)
// ---------------------------------------------------------------------------

export const PreFilled: Story = {
  name: 'Pre-filled',
  render: () => ({
    components: { DzFloatLabel, DzInput },
    data() {
      return { value: 'hello@example.com' }
    },
    template: `
      <div class="max-w-xs pt-6">
        <DzFloatLabel label="Email">
          <DzInput v-model="value" type="email" />
        </DzFloatLabel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With a textarea
// ---------------------------------------------------------------------------

export const WithTextarea: Story = {
  name: 'With Textarea',
  render: () => ({
    components: { DzFloatLabel, DzTextarea },
    template: `
      <div class="max-w-sm pt-6">
        <DzFloatLabel label="Message" variant="over">
          <DzTextarea :rows="4" />
        </DzFloatLabel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzFloatLabel, DzInput },
    template: `
      <div class="max-w-xs space-y-8 pt-6">
        <DzFloatLabel label="Email" variant="over">
          <DzInput type="email" />
        </DzFloatLabel>
        <DzFloatLabel label="Username" variant="on">
          <DzInput model-value="esmir" />
        </DzFloatLabel>
      </div>
    `,
  }),
}
