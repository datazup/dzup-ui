import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import type { DzListboxOption } from '../../src/components/forms'
import { DzFormDescription, DzFormField, DzFormLabel, DzListbox } from '../../src/components/forms'

const cities: DzListboxOption[] = [
  { label: 'Amsterdam', value: 'ams' },
  { label: 'Berlin', value: 'ber' },
  { label: 'Copenhagen', value: 'cph' },
  { label: 'Dublin', value: 'dub' },
  { label: 'Edinburgh', value: 'edi' },
  { label: 'Florence', value: 'flr' },
  { label: 'Geneva', value: 'gva' },
]

const grouped: DzListboxOption[] = [
  { label: 'Apple', value: 'apple', group: 'Fruit' },
  { label: 'Banana', value: 'banana', group: 'Fruit' },
  { label: 'Cherry', value: 'cherry', group: 'Fruit' },
  { label: 'Carrot', value: 'carrot', group: 'Vegetable' },
  { label: 'Potato', value: 'potato', group: 'Vegetable' },
  { label: 'Spinach', value: 'spinach', group: 'Vegetable' },
]

/**
 * DzListbox is an always-visible, keyboard-navigable selection list — the
 * primitive between DzList (display only) and DzSelect/DzMultiSelect (collapsed
 * dropdowns). It is ideal for faceted filters, preference panels, and the
 * source/target columns of a transfer list.
 *
 * Built on Reka UI Listbox: roving tabindex, Up/Down/Home/End navigation,
 * Enter/Space toggle, typeahead, and (with `filter`) the `aria-activedescendant`
 * pattern. In `multiple` mode, Shift+click and Shift+Arrow range-select.
 */
const meta = {
  title: 'Core/Forms/DzListbox',
  component: DzListbox,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    options: {
      control: 'object',
      description: 'Available options',
      table: { category: 'Behavior' },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow selecting multiple values',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    filter: {
      control: 'boolean',
      description: 'Render a built-in search field',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    checkmark: {
      control: 'boolean',
      description: 'Show a check indicator next to selected options',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    emptyMessage: {
      control: 'text',
      description: 'Message shown when no options match',
      table: { category: 'Behavior', defaultValue: { summary: 'No options' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    options: cities,
    multiple: false,
    filter: false,
    checkmark: false,
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzListbox>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Single
// ---------------------------------------------------------------------------

export const Single: Story = {
  render: (args) => ({
    components: { DzListbox },
    setup() {
      const value = ref<string | null>('ber')
      return { args, value }
    },
    template: `
      <div class="max-w-xs">
        <DzListbox v-bind="args" v-model="value" aria-label="City" class="max-h-64" />
        <p class="mt-2 text-sm text-[var(--dz-muted-foreground)]">Selected: {{ value ?? '—' }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The listbox is always-visible — Berlin is pre-selected.
    const listbox = canvas.getByRole('listbox', { name: /city/i })
    await expect(listbox).toBeVisible()

    // Click Amsterdam — it should become selected.
    const amsterdam = canvas.getByRole('option', { name: /amsterdam/i })
    await userEvent.click(amsterdam)
    await waitFor(() => expect(amsterdam).toHaveAttribute('aria-selected', 'true'))

    // ArrowDown moves focus to Berlin.
    await userEvent.keyboard('{ArrowDown}')
    const berlin = canvas.getByRole('option', { name: /^berlin$/i })
    await waitFor(() => expect(berlin).toHaveAttribute('aria-selected', 'true'))

    // Disabled option (none in Single story) — verify Copenhagen is present.
    await expect(canvas.getByRole('option', { name: /copenhagen/i })).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Multiple
// ---------------------------------------------------------------------------

export const Multiple: Story = {
  args: { multiple: true, checkmark: true },
  render: (args) => ({
    components: { DzListbox },
    setup() {
      const value = ref<string[]>(['ams', 'cph'])
      return { args, value }
    },
    template: `
      <div class="max-w-xs">
        <DzListbox v-bind="args" v-model="value" aria-label="Cities" class="max-h-64" />
        <p class="mt-2 text-sm text-[var(--dz-muted-foreground)]">Selected: {{ value.join(', ') || '—' }}</p>
        <p class="mt-1 text-xs text-[var(--dz-muted-foreground)]">Tip: Shift+click or Shift+Arrow to range-select.</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// WithFilter
// ---------------------------------------------------------------------------

export const WithFilter: Story = {
  args: { filter: true, multiple: true, checkmark: true },
  render: (args) => ({
    components: { DzListbox },
    setup() {
      const value = ref<string[]>([])
      return { args, value }
    },
    template: `
      <div class="max-w-xs">
        <DzListbox v-bind="args" v-model="value" aria-label="Cities" class="max-h-64" filter-placeholder="Filter cities..." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Grouped
// ---------------------------------------------------------------------------

export const Grouped: Story = {
  args: { options: grouped, multiple: true, checkmark: true, filter: true },
  render: (args) => ({
    components: { DzListbox },
    setup() {
      const value = ref<string[]>(['banana'])
      return { args, value }
    },
    template: `
      <div class="max-w-xs">
        <DzListbox v-bind="args" v-model="value" aria-label="Produce" class="max-h-72" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: (args) => ({
    components: { DzListbox },
    setup() {
      const value = ref<string | null>('ber')
      const options: DzListboxOption[] = [
        { label: 'Amsterdam', value: 'ams' },
        { label: 'Berlin', value: 'ber' },
        { label: 'Copenhagen (unavailable)', value: 'cph', disabled: true },
        { label: 'Dublin', value: 'dub' },
      ]
      return { args, value, options }
    },
    template: `
      <div class="flex max-w-2xl gap-6">
        <div class="flex-1">
          <p class="mb-2 text-sm font-medium">Disabled option</p>
          <DzListbox v-bind="args" v-model="value" :options="options" aria-label="City" class="max-h-64" />
        </div>
        <div class="flex-1">
          <p class="mb-2 text-sm font-medium">Disabled listbox</p>
          <DzListbox v-bind="args" v-model="value" disabled aria-label="City" class="max-h-64" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// InsideFormField
// ---------------------------------------------------------------------------

export const InsideFormField: Story = {
  args: { multiple: true, checkmark: true },
  render: (args) => ({
    components: { DzListbox, DzFormField, DzFormLabel, DzFormDescription },
    setup() {
      const value = ref<string[]>([])
      return { args, value }
    },
    template: `
      <div class="max-w-xs">
        <DzFormField required>
          <DzFormLabel>Destinations</DzFormLabel>
          <DzFormDescription>Pick the cities you'll visit.</DzFormDescription>
          <DzListbox v-bind="args" v-model="value" class="max-h-64" />
        </DzFormField>
      </div>
    `,
  }),
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: (args) => ({
    components: { DzListbox },
    setup() {
      const value = ref<string[]>(['ams'])
      return { args, value }
    },
    template: `
      <div class="max-w-xs">
        <DzListbox v-bind="args" v-model="value" multiple checkmark filter aria-label="Cities" class="max-h-64" />
      </div>
    `,
  }),
}
