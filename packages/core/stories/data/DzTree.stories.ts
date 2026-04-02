import type { Meta, StoryObj } from '@storybook/vue3'
import type { TreeNode } from '../../src/components/data'
import { DzTree } from '../../src/components/data'

/**
 * DzTree displays hierarchical data in an expandable/collapsible tree structure.
 * It supports node selection, checkboxes, and custom node rendering via the item slot.
 *
 * DzTree provides context to DzTreeItem children via inject (ADR-08).
 */

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const fileTree: TreeNode[] = [
  {
    key: 'src',
    label: 'src',
    children: [
      {
        key: 'components',
        label: 'components',
        children: [
          { key: 'button', label: 'DzButton.vue' },
          { key: 'card', label: 'DzCard.vue' },
          { key: 'input', label: 'DzInput.vue' },
        ],
      },
      {
        key: 'composables',
        label: 'composables',
        children: [
          { key: 'useTheme', label: 'useTheme.ts' },
          { key: 'useId', label: 'useId.ts' },
        ],
      },
      { key: 'main', label: 'main.ts' },
      { key: 'app', label: 'App.vue' },
    ],
  },
  {
    key: 'tests',
    label: 'tests',
    children: [
      { key: 'button-test', label: 'DzButton.spec.ts' },
      { key: 'card-test', label: 'DzCard.spec.ts' },
    ],
  },
  { key: 'package', label: 'package.json' },
  { key: 'readme', label: 'README.md' },
]

const orgTree: TreeNode[] = [
  {
    key: 'ceo',
    label: 'CEO - Sarah Chen',
    children: [
      {
        key: 'cto',
        label: 'CTO - Marcus Reid',
        children: [
          { key: 'eng-lead', label: 'Eng Lead - Alice' },
          { key: 'data-lead', label: 'Data Lead - Bob' },
        ],
      },
      {
        key: 'cpo',
        label: 'CPO - Lena Ortiz',
        children: [
          { key: 'design-lead', label: 'Design Lead - Charlie' },
          { key: 'pm-lead', label: 'PM Lead - Diana' },
        ],
      },
      {
        key: 'cfo',
        label: 'CFO - James Park',
        children: [
          { key: 'finance', label: 'Finance - Ethan' },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Core/Data/DzTree',
  component: DzTree,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    selectable: {
      control: 'boolean',
      description: 'Whether nodes can be selected',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    checkable: {
      control: 'boolean',
      description: 'Whether checkboxes are shown on each node',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the tree',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    items: fileTree,
    size: 'md',
    selectable: false,
    checkable: false,
    disabled: false,
    loading: false,
  },
} satisfies Meta<typeof DzTree>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTree },
    setup() {
      return { args }
    },
    template: '<DzTree v-bind="args" aria-label="File tree" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTree },
    setup() {
      const smallTree: TreeNode[] = [
        {
          key: 'root',
          label: 'Root',
          children: [
            { key: 'child-1', label: 'Child 1' },
            { key: 'child-2', label: 'Child 2' },
            {
              key: 'child-3',
              label: 'Child 3',
              children: [
                { key: 'grandchild', label: 'Grandchild' },
              ],
            },
          ],
        },
      ]
      return { smallTree }
    },
    template: `
      <div class="space-y-8">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzTree :items="smallTree" :size="s" :expanded-keys="['root', 'child-3']" :aria-label="s + ' tree'" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Selection
// ---------------------------------------------------------------------------

export const WithSelection: Story = {
  name: 'With Selection',
  render: () => ({
    components: { DzTree },
    data() {
      return {
        items: fileTree,
        selected: [] as string[],
      }
    },
    template: `
      <div class="space-y-4">
        <DzTree
          :items="items"
          selectable
          :selected-keys="selected"
          :expanded-keys="['src', 'components']"
          aria-label="Selectable file tree"
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
  name: 'With Checkboxes',
  render: () => ({
    components: { DzTree },
    data() {
      return {
        items: fileTree,
        selected: [] as string[],
      }
    },
    template: `
      <div class="space-y-4">
        <DzTree
          :items="items"
          checkable
          :selected-keys="selected"
          :expanded-keys="['src', 'components', 'composables']"
          aria-label="Checkable file tree"
          @update:selected-keys="selected = $event"
        />
        <p class="text-sm text-gray-500">Checked: {{ selected.length ? selected.join(', ') : 'none' }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    items: fileTree,
  },
  render: args => ({
    components: { DzTree },
    setup() {
      return { args }
    },
    template: '<DzTree v-bind="args" :expanded-keys="[\'src\']" aria-label="Disabled tree" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled Individual Nodes
// ---------------------------------------------------------------------------

export const DisabledNodes: Story = {
  name: 'Disabled Individual Nodes',
  render: () => ({
    components: { DzTree },
    setup() {
      const items: TreeNode[] = [
        {
          key: 'available',
          label: 'Available Folder',
          children: [
            { key: 'file-1', label: 'editable-file.ts' },
            { key: 'file-2', label: 'locked-file.ts', disabled: true },
            { key: 'file-3', label: 'another-file.ts' },
          ],
        },
        {
          key: 'locked',
          label: 'Locked Folder',
          disabled: true,
          children: [
            { key: 'file-4', label: 'secrets.ts' },
          ],
        },
      ]
      return { items }
    },
    template: `
      <DzTree
        :items="items"
        selectable
        :expanded-keys="['available', 'locked']"
        aria-label="Tree with disabled nodes"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------

export const Loading: Story = {
  args: {
    loading: true,
    items: fileTree,
  },
  render: args => ({
    components: { DzTree },
    setup() {
      return { args }
    },
    template: '<DzTree v-bind="args" aria-label="Loading tree" />',
  }),
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

export const Empty: Story = {
  name: 'Empty State',
  render: () => ({
    components: { DzTree },
    template: `
      <DzTree :items="[]" aria-label="Empty tree">
        <template #empty>
          <div class="text-center py-6 text-gray-500">
            No files found in this directory.
          </div>
        </template>
      </DzTree>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Item Slot
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Item Slot',
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: fileTree }
    },
    template: `
      <DzTree :items="items" :expanded-keys="['src', 'components']" aria-label="Custom rendered tree">
        <template #item="{ node, level, expanded }">
          <span class="flex items-center gap-1.5">
            <span v-if="node.children" class="text-xs">{{ expanded ? '&#128194;' : '&#128193;' }}</span>
            <span v-else class="text-xs">&#128196;</span>
            <span :class="node.children ? 'font-medium' : ''">{{ node.label }}</span>
          </span>
        </template>
      </DzTree>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: fileTree }
    },
    template: `
      <DzTree
        :items="items"
        selectable
        :expanded-keys="['src', 'components']"
        aria-label="Dark mode tree"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: fileTree }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzTree implements the WAI-ARIA TreeView pattern. Tab focuses the tree.
          Arrow Up/Down moves between visible nodes. Arrow Right expands a collapsed node
          or moves to first child. Arrow Left collapses an expanded node or moves to parent.
          Home/End jump to first/last visible node. Enter or Space selects the focused node.
        </p>
        <DzTree
          :items="items"
          selectable
          :expanded-keys="['src']"
          aria-label="Keyboard navigable file tree"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: File Explorer
// ---------------------------------------------------------------------------

export const RealWorldFileExplorer: Story = {
  name: 'Real World: File Explorer',
  render: () => ({
    components: { DzTree },
    data() {
      return {
        items: fileTree,
        selected: [] as string[],
        expanded: ['src', 'components'],
      }
    },
    template: `
      <div class="max-w-sm border rounded-lg overflow-hidden">
        <div class="px-3 py-2 border-b bg-gray-50 text-sm font-medium">Explorer</div>
        <div class="p-2">
          <DzTree
            :items="items"
            selectable
            :selected-keys="selected"
            :expanded-keys="expanded"
            size="sm"
            aria-label="File explorer"
            @update:selected-keys="selected = $event"
            @update:expanded-keys="expanded = $event"
          />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Organization Chart
// ---------------------------------------------------------------------------

export const RealWorldOrgChart: Story = {
  name: 'Real World: Organization Chart',
  render: () => ({
    components: { DzTree },
    setup() {
      return { items: orgTree }
    },
    template: `
      <div class="max-w-md">
        <h3 class="text-lg font-semibold mb-3">Organization Structure</h3>
        <DzTree
          :items="items"
          :expanded-keys="['ceo', 'cto', 'cpo', 'cfo']"
          aria-label="Organization chart"
        />
      </div>
    `,
  }),
}
