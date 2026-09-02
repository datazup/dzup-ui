import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DzListboxOption } from '../../src/components/forms'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzFormDescription, DzFormField, DzFormLabel, DzListbox } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

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
  render: args => ({
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

    // ArrowDown moves keyboard focus to Berlin; press Enter/Space to select.
    await userEvent.keyboard('{ArrowDown}')
    const berlin = canvas.getByRole('option', { name: /^berlin$/i })
    await expect(berlin).toBeInTheDocument()
    await userEvent.keyboard('{Enter}')
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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

// ---------------------------------------------------------------------------
// States — enabled / disabled / option-disabled / invalid (tier B `states`)
// ---------------------------------------------------------------------------

/**
 * The states DzListbox can be in, and the difference a screenshot hides: a
 * disabled listbox* takes the whole control out of the tab order, while a
 * disabled option* leaves the list navigable and only refuses that one row.
 * The invalid case adds `data-invalid` for the styling contract, `aria-invalid`
 * on the `role="listbox"` itself, and a `role="alert"` message beneath it.
 *
 * The play function asserts each of those, and confirms that selection still
 * works in the enabled control so "disabled" is measured against a live
 * baseline rather than asserted in isolation.
 */
export const States: Story = {
  render: () => ({
    components: { DzListbox },
    setup() {
      const enabled = ref<string | null>('ber')
      const partial = ref<string | null>(null)
      const options: DzListboxOption[] = [
        { label: 'Amsterdam', value: 'ams' },
        { label: 'Berlin', value: 'ber' },
        { label: 'Copenhagen (unavailable)', value: 'cph', disabled: true },
      ]
      return { enabled, partial, options }
    },
    template: `
      <div class="grid max-w-5xl gap-6 lg:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled</p>
          <DzListbox
            v-model="enabled"
            :options="options.slice(0, 2)"
            aria-label="Enabled city list"
            data-testid="lb-enabled"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled control</p>
          <DzListbox
            disabled
            :options="options.slice(0, 2)"
            aria-label="Disabled city list"
            data-testid="lb-disabled"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled option + invalid</p>
          <DzListbox
            v-model="partial"
            invalid
            error="Pick a city that is still available."
            :options="options"
            aria-label="Partly available city list"
            data-testid="lb-invalid"
          />
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('lb-enabled')
    const disabled = canvas.getByTestId('lb-disabled')
    const invalid = canvas.getByTestId('lb-invalid')

    // Enabled: nothing is flagged, and the bound value is reflected as selected.
    await expect(enabled).not.toHaveAttribute('data-disabled')
    await expect(enabled).not.toHaveAttribute('data-invalid')
    await expect(within(enabled).getByRole('option', { name: 'Berlin' }))
      .toHaveAttribute('aria-selected', 'true')

    // …and selection still moves, so the disabled cases below mean something.
    await userEvent.click(within(enabled).getByRole('option', { name: 'Amsterdam' }))
    await waitFor(() =>
      expect(within(enabled).getByRole('option', { name: 'Amsterdam' }))
        .toHaveAttribute('aria-selected', 'true'),
    )

    // Disabled control: flagged on the root, and every option inherits it.
    await expect(disabled).toHaveAttribute('data-disabled')
    for (const option of within(disabled).getAllByRole('option'))
      await expect(option).toHaveAttribute('data-disabled')

    // Invalid: flagged for CSS, announced to AT, and explained in an alert.
    // The error message is a sibling of the listbox root, so it is looked up on
    // the component's outer wrapper rather than inside the root.
    await expect(invalid).toHaveAttribute('data-invalid')
    await expect(within(invalid).getByRole('listbox'))
      .toHaveAttribute('aria-invalid', 'true')
    await expect(within(invalid.parentElement as HTMLElement).getByRole('alert'))
      .toHaveTextContent('Pick a city that is still available.')

    // A disabled *option* is the only one refused — its siblings still work.
    const unavailable = within(invalid).getByRole('option', { name: /copenhagen/i })
    await expect(unavailable).toHaveAttribute('data-disabled')
    const available = within(invalid).getByRole('option', { name: 'Amsterdam' })
    await expect(available).not.toHaveAttribute('data-disabled')
    await userEvent.click(available)
    await waitFor(() => expect(available).toHaveAttribute('aria-selected', 'true'))
    await expect(unavailable).toHaveAttribute('aria-selected', 'false')
  },
}
