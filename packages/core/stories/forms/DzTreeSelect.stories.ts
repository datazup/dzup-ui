import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../src/components/data'
import { DzFormField, DzFormLabel, DzTreeSelect } from '../../src/components/forms'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'

const categories: TreeNode[] = [
  {
    key: 'fruit',
    label: 'Fruit',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
      {
        key: 'citrus',
        label: 'Citrus',
        children: [
          { key: 'orange', label: 'Orange' },
          { key: 'lemon', label: 'Lemon' },
        ],
      },
    ],
  },
  {
    key: 'vegetable',
    label: 'Vegetable',
    children: [
      { key: 'carrot', label: 'Carrot' },
      { key: 'potato', label: 'Potato' },
    ],
  },
  { key: 'dairy', label: 'Dairy' },
]

/**
 * DzTreeSelect is a form select whose overlay panel is a DzTree — composing
 * DzPopover (overlay) + DzTree (panel) + a DzSelect-styled trigger.
 *
 * It supports `single`, `multiple`, and `checkbox` selection (with
 * parent/child propagation and indeterminate state), an optional type-to-search
 * filter, and the same `--dz-input-*` token family as DzSelect.
 *
 * **Status:** experimental.
 */
const meta = {
  title: 'Core/Forms/DzTreeSelect',
  component: DzTreeSelect,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple', 'checkbox'],
      description: 'Selection behaviour',
      table: { category: 'Behavior', defaultValue: { summary: 'single' } },
    },
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
    filter: {
      control: 'boolean',
      description: 'Enable type-to-search filtering',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown when nothing is selected',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
  },
  args: {
    nodes: categories,
    placeholder: 'Select a category...',
    selectionMode: 'single',
    variant: 'outline',
    size: 'md',
    filter: false,
    disabled: false,
  },
} satisfies Meta<typeof DzTreeSelect>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Single
// ---------------------------------------------------------------------------

export const Single: Story = {
  render: (args) => ({
    components: { DzTreeSelect },
    setup() {
      return { args }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <DzTreeSelect v-bind="args" v-model:value="value" :expanded-keys="['fruit']" />
        <p class="text-sm text-gray-500">Selected: <strong>{{ value || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Panel should be closed initially
    const trigger = canvas.getByRole('combobox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // Click trigger to open the panel
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByRole('tree')).toBeVisible())
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // Fruit branch is pre-expanded — Apple should be visible as a treeitem
    await waitFor(() => expect(canvas.getByRole('treeitem', { name: /apple/i })).toBeVisible())

    // Click Apple (a leaf node in the pre-expanded Fruit branch) to select it
    await userEvent.click(canvas.getByRole('treeitem', { name: /apple/i }))

    // Panel closes on single selection and the trigger reflects the chosen label
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(trigger).toHaveTextContent(/apple/i)
  },
}

// ---------------------------------------------------------------------------
// Multiple (chips)
// ---------------------------------------------------------------------------

export const MultipleChips: Story = {
  name: 'Multiple (chips)',
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: ['apple', 'carrot'] as string[] }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          selection-mode="multiple"
          :expanded-keys="['fruit', 'vegetable']"
          placeholder="Select categories..."
        />
        <p class="text-sm text-gray-500">Selected: <strong>{{ value.join(', ') || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Two chips (Apple + Carrot) should be pre-rendered in the trigger
    expect(canvas.getByRole('button', { name: /remove apple/i })).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: /remove carrot/i })).toBeInTheDocument()

    // Open the panel and verify the tree is shown
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByRole('tree')).toBeVisible())

    // Banana is visible (Fruit branch pre-expanded) — click it to add a third selection
    await userEvent.click(canvas.getByRole('treeitem', { name: /banana/i }))

    // Panel stays open in multiple mode; Banana chip should now appear
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove banana/i })).toBeInTheDocument(),
    )

    // Remove the Apple chip without reopening
    await userEvent.click(canvas.getByRole('button', { name: /remove apple/i }))
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: /remove apple/i })).not.toBeInTheDocument(),
    )
  },
}

// ---------------------------------------------------------------------------
// Checkbox propagation
// ---------------------------------------------------------------------------

export const CheckboxPropagation: Story = {
  name: 'Checkbox propagation',
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: [] as string[] }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          selection-mode="checkbox"
          :expanded-keys="['fruit', 'citrus', 'vegetable']"
          placeholder="Select with checkboxes..."
        />
        <p class="text-sm text-gray-500">Checked: <strong>{{ value.join(', ') || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the panel
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByRole('tree')).toBeVisible())

    // All three top-level branches are pre-expanded — treeitems should be present
    const items = canvas.getAllByRole('treeitem')
    expect(items.length).toBeGreaterThan(3)

    // Click the Carrot leaf — it should get a chip in the trigger
    await userEvent.click(canvas.getByRole('treeitem', { name: /carrot/i }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove carrot/i })).toBeInTheDocument(),
    )

    // Click the Vegetable parent — checkbox propagation should check Carrot + Potato
    await userEvent.click(canvas.getByRole('treeitem', { name: /vegetable/i }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove potato/i })).toBeInTheDocument(),
    )
  },
}

// ---------------------------------------------------------------------------
// Filterable
// ---------------------------------------------------------------------------

export const Filterable: Story = {
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          filter
          filter-placeholder="Type to search..."
          placeholder="Search categories..."
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// In a form field
// ---------------------------------------------------------------------------

export const InFormField: Story = {
  name: 'In FormField',
  render: () => ({
    components: { DzTreeSelect, DzFormField, DzFormLabel },
    setup() {
      return { categories }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs">
        <DzFormField required>
          <DzFormLabel>Category</DzFormLabel>
          <DzTreeSelect
            :nodes="categories"
            v-model:value="value"
            :expanded-keys="['fruit']"
            placeholder="Choose a category"
          />
        </DzFormField>
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
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: ['apple'] as string[] }
    },
    template: `
      <div class="max-w-xs">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          selection-mode="checkbox"
          :expanded-keys="['fruit']"
          placeholder="Select categories..."
        />
      </div>
    `,
  }),
}
