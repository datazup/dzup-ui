import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../src/components/data'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzFormField, DzFormLabel, DzTreeSelect } from '../../src/components/forms'
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
  render: args => ({
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
    const body = within(document.body)

    // Open the dropdown via the combobox trigger.
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)

    // Tree panel is portalled to document.body.
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())

    // "Fruit" branch is pre-expanded; find "Apple" leaf (no aria-expanded = leaf node).
    // Click the inner row div (the actual interactive element).
    const appleItem = await waitFor(() => {
      const items = body.getAllByRole('treeitem', { name: /apple/i })
      const leaf = items.find(el => !el.hasAttribute('aria-expanded'))
      expect(leaf).toBeDefined()
      return leaf!
    })
    const appleRow = (appleItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? appleItem

    // Click Apple to select it.
    await userEvent.click(appleRow)
    await waitFor(() =>
      expect(canvas.getByText(/selected:/i).closest('p')).not.toHaveTextContent('none'),
    )
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
    const body = within(document.body)

    // Initial chips for pre-selected values.
    expect(canvas.getByRole('button', { name: /remove apple/i })).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: /remove carrot/i })).toBeInTheDocument()

    // Open and select Banana.
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())
    const bananaItem = body
      .getAllByRole('treeitem', { name: /banana/i })
      .find(el => !el.hasAttribute('aria-expanded'))!
    const bananaRow = (bananaItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? bananaItem
    await userEvent.click(bananaRow)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove banana/i })).toBeInTheDocument(),
    )

    // Remove Apple chip.
    await userEvent.click(canvas.getByRole('button', { name: /remove apple/i }))
    await waitFor(() => expect(canvas.queryByRole('button', { name: /remove apple/i })).toBeNull())
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
    const body = within(document.body)

    // Open the dropdown.
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())

    // Click Carrot to check it (leaf node — no aria-expanded).
    const carrotItem = body
      .getAllByRole('treeitem', { name: /carrot/i })
      .find(el => !el.hasAttribute('aria-expanded'))!
    const carrotRow = (carrotItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? carrotItem
    await userEvent.click(carrotRow)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove carrot/i })).toBeInTheDocument(),
    )

    // Click Vegetable parent — propagates to Potato as well.
    const vegetableItem = body
      .getAllByRole('treeitem', { name: /vegetable/i })
      .find(el => el.hasAttribute('aria-expanded'))!
    const vegetableRow
      = (vegetableItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? vegetableItem
    await userEvent.click(vegetableRow)
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
