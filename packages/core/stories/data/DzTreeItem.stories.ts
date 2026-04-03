import type { Meta, StoryObj } from '@storybook/vue3'
import type { TreeNode } from '../../src/components/data'
import { DzTree, DzTreeItem } from '../../src/components/data'

/**
 * DzTreeItem is a compound sub-part of DzTree.
 *
 * It renders a single tree node with expand/collapse, selection, and optional
 * checkbox support. DzTreeItem receives context (size, expandedKeys, selectedKeys,
 * toggle functions) from DzTree via inject (ADR-08).
 *
 * DzTreeItem is typically rendered internally by DzTree, but understanding its
 * API is useful for custom node rendering via the item slot.
 */

const sampleTree: TreeNode[] = [
  {
    key: 'root',
    label: 'Root Node',
    children: [
      { key: 'child-1', label: 'Child 1' },
      {
        key: 'child-2',
        label: 'Child 2',
        children: [
          { key: 'grandchild-1', label: 'Grandchild 1' },
          { key: 'grandchild-2', label: 'Grandchild 2' },
        ],
      },
      { key: 'child-3', label: 'Child 3', disabled: true },
    ],
  },
]

const meta = {
  title: 'Core/Data/DzTreeItem',
  component: DzTreeItem,
  tags: ['autodocs'],
  argTypes: {
    node: {
      control: false,
      description: 'The TreeNode data object for this item',
      table: { category: 'Behavior' },
    },
    level: {
      control: 'number',
      description: 'Nesting level (0-based)',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
  },
} satisfies Meta<typeof DzTreeItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Tree with items visible
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: sampleTree }
    },
    template: `
      <DzTree
        :items="items"
        :expanded-keys="['root', 'child-2']"
        aria-label="Tree with visible items"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Selection
// ---------------------------------------------------------------------------

export const WithSelection: Story = {
  name: 'Selectable Items',
  render: () => ({
    components: { DzTree },
    data() {
      return { selected: [] as string[] }
    },
    setup() {
      return { items: sampleTree }
    },
    template: `
      <div class="space-y-3">
        <DzTree
          :items="items"
          selectable
          :expanded-keys="['root', 'child-2']"
          :selected-keys="selected"
          aria-label="Selectable tree"
          @update:selected-keys="selected = $event"
        />
        <p class="text-sm text-gray-500">Selected: {{ selected.length ? selected.join(', ') : 'none' }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Checkboxes
// ---------------------------------------------------------------------------

export const WithCheckboxes: Story = {
  name: 'Checkable Items',
  render: () => ({
    components: { DzTree },
    data() {
      return { checked: [] as string[] }
    },
    setup() {
      return { items: sampleTree }
    },
    template: `
      <div class="space-y-3">
        <DzTree
          :items="items"
          checkable
          :expanded-keys="['root', 'child-2']"
          :selected-keys="checked"
          aria-label="Checkable tree"
          @update:selected-keys="checked = $event"
        />
        <p class="text-sm text-gray-500">Checked: {{ checked.length ? checked.join(', ') : 'none' }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Nodes
// ---------------------------------------------------------------------------

export const DisabledNodes: Story = {
  name: 'Disabled Nodes',
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: sampleTree }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          "Child 3" is disabled (disabled: true on its TreeNode).
          Disabled nodes cannot be selected, expanded, or interacted with.
        </p>
        <DzTree
          :items="items"
          selectable
          :expanded-keys="['root']"
          aria-label="Tree with disabled nodes"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Item Rendering
// ---------------------------------------------------------------------------

export const CustomItemSlot: Story = {
  name: 'Custom Item Slot',
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: sampleTree }
    },
    template: `
      <DzTree :items="items" :expanded-keys="['root', 'child-2']" aria-label="Custom rendered tree">
        <template #item="{ node, level, expanded }">
          <span class="flex items-center gap-1.5">
            <span v-if="node.children" class="text-xs">{{ expanded ? '&#128194;' : '&#128193;' }}</span>
            <span v-else class="text-xs">&#128196;</span>
            <span :class="[node.children ? 'font-medium' : '', node.disabled ? 'text-gray-400 line-through' : '']">
              {{ node.label }}
            </span>
          </span>
        </template>
      </DzTree>
    `,
  }),
}
