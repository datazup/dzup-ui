import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzCascader } from '../../src/components/forms'

/**
 * DzCascader is a cascading multi-level select for ordered, hierarchical
 * choices (country → state → city). The trigger opens a popover that reveals
 * child options column-by-column as each level is chosen.
 *
 * Selecting a leaf commits the path and closes the popover. With
 * `change-on-select`, any intermediate node also commits. `expand-trigger`
 * switches between click (default) and hover expansion, and `filter` replaces
 * the columns with a flat, searchable list of full paths.
 *
 * `v-model:value` is an array of keys describing the selected path,
 * e.g. `['cn', 'zj', 'hz']`.
 */
const regions = [
  {
    label: 'China',
    value: 'cn',
    children: [
      {
        label: 'Zhejiang',
        value: 'zj',
        children: [
          { label: 'Hangzhou', value: 'hz' },
          { label: 'Ningbo', value: 'nb' },
          { label: 'Wenzhou', value: 'wz' },
        ],
      },
      {
        label: 'Jiangsu',
        value: 'js',
        children: [
          { label: 'Nanjing', value: 'nj' },
          { label: 'Suzhou', value: 'sz' },
        ],
      },
    ],
  },
  {
    label: 'USA',
    value: 'us',
    children: [
      {
        label: 'California',
        value: 'ca',
        children: [
          { label: 'Los Angeles', value: 'la' },
          { label: 'San Francisco', value: 'sf' },
        ],
      },
      {
        label: 'New York',
        value: 'ny',
        children: [
          { label: 'New York City', value: 'nyc' },
          { label: 'Buffalo', value: 'buf' },
        ],
      },
    ],
  },
  {
    label: 'Germany',
    value: 'de',
    disabled: true,
    children: [{ label: 'Berlin', value: 'be' }],
  },
]

const meta = {
  title: 'Core/Forms/DzCascader',
  component: DzCascader,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style of the trigger',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    placeholder: {
      control: 'text',
      description: 'Trigger placeholder when nothing is selected',
      table: { category: 'Behavior', defaultValue: { summary: 'Select' } },
    },
    changeOnSelect: {
      control: 'boolean',
      description: 'Allow committing a non-leaf (parent) node',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    expandTrigger: {
      control: 'inline-radio',
      options: ['click', 'hover'],
      description: 'How a child column is revealed',
      table: { category: 'Behavior', defaultValue: { summary: 'click' } },
    },
    filter: {
      control: 'boolean',
      description: 'Enable the flat, searchable path filter',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    separator: {
      control: 'text',
      description: 'Separator between labels in the selected path',
      table: { category: 'Behavior', defaultValue: { summary: '/' } },
    },
    cleaner: {
      control: 'boolean',
      description: 'Show the clear button when a value is set',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
    error: {
      control: 'text',
      description: 'Error message text',
      table: { category: 'State' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    options: regions,
    placeholder: 'Select region',
    variant: 'outline',
    size: 'md',
    changeOnSelect: false,
    expandTrigger: 'click',
    filter: false,
    disabled: false,
  },
} satisfies Meta<typeof DzCascader>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => ({
    components: { DzCascader },
    setup() {
      return { args }
    },
    template: '<DzCascader v-bind="args" class="max-w-xs" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Trigger is a combobox button; initially collapsed.
    const trigger = canvas.getByRole('combobox')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Click opens the first-level listbox.
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getAllByRole('listbox').length).toBeGreaterThanOrEqual(1))

    // First item in the root column is "China" which has children.
    const options = canvas.getAllByRole('option')
    const chinaOption = options.find((el) => el.textContent?.includes('China'))!
    await userEvent.click(chinaOption)

    // Clicking a parent reveals the second-level listbox (two listboxes now visible).
    await waitFor(() => expect(canvas.getAllByRole('listbox').length).toBeGreaterThanOrEqual(2))

    // The child column contains Zhejiang as first option.
    await waitFor(() =>
      expect(canvas.getAllByRole('option').some((el) => el.textContent?.includes('Zhejiang'))).toBe(
        true,
      ),
    )
  },
}

// ---------------------------------------------------------------------------
// Change on select (parents selectable)
// ---------------------------------------------------------------------------

export const ChangeOnSelect: Story = {
  name: 'Change on Select',
  render: () => ({
    components: { DzCascader },
    data() {
      return { value: [], regions }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-gray-500">Any level commits; the popover stays open to drill deeper.</p>
        <DzCascader v-model:value="value" :options="regions" change-on-select placeholder="Select region" />
        <p class="text-sm text-gray-500">Value: <strong>{{ value.length ? value.join(' → ') : 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    // Open the panel.
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getAllByRole('listbox').length).toBeGreaterThanOrEqual(1))

    // Click "USA" (a parent) — with change-on-select it commits immediately.
    const usaOption = canvas.getAllByRole('option').find((el) => el.textContent?.includes('USA'))!
    await userEvent.click(usaOption)

    // Panel stays open (change-on-select keeps it open to drill deeper).
    await waitFor(() => expect(canvas.getAllByRole('listbox').length).toBeGreaterThanOrEqual(2))

    // Click the leaf "California → Los Angeles" path: click California first.
    const californiaOption = canvas
      .getAllByRole('option')
      .find((el) => el.textContent?.includes('California'))!
    await userEvent.click(californiaOption)
    await waitFor(() => expect(canvas.getAllByRole('listbox').length).toBeGreaterThanOrEqual(3))

    // Select leaf "Los Angeles" — panel closes and trigger shows the full path.
    const laOption = canvas
      .getAllByRole('option')
      .find((el) => el.textContent?.includes('Los Angeles'))!
    await userEvent.click(laOption)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent(/Los Angeles/)
  },
}

// ---------------------------------------------------------------------------
// Hover expand
// ---------------------------------------------------------------------------

export const HoverExpand: Story = {
  name: 'Hover Expand',
  render: () => ({
    components: { DzCascader },
    data() {
      return { regions }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-gray-500">Hover a node to reveal its children; click to select.</p>
        <DzCascader :options="regions" expand-trigger="hover" placeholder="Hover to expand" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Filterable (flat path search)
// ---------------------------------------------------------------------------

export const Filterable: Story = {
  render: () => ({
    components: { DzCascader },
    data() {
      return { value: [], regions }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-gray-500">Open and type to search across full paths (e.g. "hang").</p>
        <DzCascader v-model:value="value" :options="regions" filter placeholder="Search regions" />
        <p class="text-sm text-gray-500">Value: <strong>{{ value.length ? value.join(' → ') : 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    // Open the panel.
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByRole('searchbox')).toBeVisible())

    // Type a query — flat listbox of matching paths appears.
    const searchInput = canvas.getByRole('searchbox')
    await userEvent.type(searchInput, 'hang')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())

    // "Hangzhou" path should appear as a flat option.
    await waitFor(() =>
      expect(canvas.getAllByRole('option').some((el) => el.textContent?.includes('Hangzhou'))).toBe(
        true,
      ),
    )

    // Click the Hangzhou option — panel closes and trigger shows the selected path.
    const hangzhouOption = canvas
      .getAllByRole('option')
      .find((el) => el.textContent?.includes('Hangzhou'))!
    await userEvent.click(hangzhouOption)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent(/Hangzhou/)
  },
}

// ---------------------------------------------------------------------------
// Size gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCascader },
    data() {
      return { regions }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCascader :options="regions" size="xs" placeholder="Extra Small" />
        <DzCascader :options="regions" size="sm" placeholder="Small" />
        <DzCascader :options="regions" size="md" placeholder="Medium" />
        <DzCascader :options="regions" size="lg" placeholder="Large" />
        <DzCascader :options="regions" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid state
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select a region',
  },
  render: (args) => ({
    components: { DzCascader },
    setup() {
      return { args }
    },
    template: '<DzCascader v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { DzCascader },
    setup() {
      return { args }
    },
    template: '<DzCascader v-bind="args" :value="[\'cn\', \'zj\', \'hz\']" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzCascader },
    data() {
      return { regions }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCascader :options="regions" placeholder="Outline" />
        <DzCascader :options="regions" variant="filled" :value="['us', 'ca', 'sf']" />
      </div>
    `,
  }),
}
