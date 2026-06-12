import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../src/components/data'
import {
  DzFormField,
  DzFormLabel,
  DzTreeSelect,
} from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

const categories: TreeNode[] = [
  {
    key: 'fruit',
    label: 'Fruit',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
      { key: 'citrus', label: 'Citrus', children: [
        { key: 'orange', label: 'Orange' },
        { key: 'lemon', label: 'Lemon' },
      ] },
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
