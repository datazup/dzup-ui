import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../src/components/data'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzTree } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

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
        children: [{ key: 'finance', label: 'Finance - Ethan' }],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/**
 * DzTree displays hierarchical data in an expandable/collapsible tree structure.
 * It supports node selection, checkboxes, and custom node rendering via the item slot.
 *
 * DzTree provides context to DzTreeItem children via inject (ADR-08).
 */
const meta = {
  title: 'Core/Data/DzTree',
  component: DzTree,
  tags: ['autodocs', 'status:stable'],
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The "src" branch starts collapsed (no expanded-keys), so its children
    // are not yet in the DOM.
    const srcItem = canvas.getByRole('treeitem', { name: 'src' })
    await expect(srcItem).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByText('components')).not.toBeInTheDocument()

    // Clicking the branch node expands it and renders its children.
    await userEvent.click(canvas.getByText('src'))
    await waitFor(() => expect(srcItem).toHaveAttribute('aria-expanded', 'true'))
    await expect(canvas.getByText('components')).toBeInTheDocument()
  },
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
              children: [{ key: 'grandchild', label: 'Grandchild' }],
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: {{ selected.length ? selected.join(', ') : 'none' }}</p>
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Checked: {{ selected.length ? selected.join(', ') : 'none' }}</p>
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
          children: [{ key: 'file-4', label: 'secrets.ts' }],
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
          <div class="text-center py-6 text-[var(--dz-muted-foreground)]">
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
  decorators: [darkModeDecorator],
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // "src" is expanded, so its child branch "components" is visible but closed.
    const item = canvas.getByText('components').closest('[role="treeitem"]') as HTMLElement
    await expect(item).toHaveAttribute('aria-expanded', 'false')

    // The interactive row is the focusable child div (tabindex="0"); focus it.
    const row = (item.querySelector('[data-dz-tree-row]') ?? item) as HTMLElement
    row.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(item).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(item).toHaveAttribute('aria-expanded', 'false'))
  },
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
      <div class="max-w-sm border border-[var(--dz-border)] rounded-lg overflow-hidden">
        <div class="px-3 py-2 border-b border-b-[var(--dz-border)] bg-[var(--dz-muted)] text-sm font-medium">Explorer</div>
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

// ---------------------------------------------------------------------------
// States — ready / loading / tree-disabled / node-disabled (tier C `states`)
// ---------------------------------------------------------------------------

/**
 * The two states DzTree declares (`disabled`, `loading`) plus the per-node
 * `disabled` flag, which is the one a file browser actually reaches for.
 *
 * They resolve into a single `data-state` on the `role="tree"` root —
 * `disabled` wins over `loading`, which wins over `ready` — while a disabled
 * node* is announced individually with `aria-disabled` and taken out of the
 * roving tab order. The play function asserts both levels, since a screenshot
 * cannot tell "greyed out" from "actually unreachable".
 */
export const States: Story = {
  render: () => ({
    components: { DzTree },
    setup() {
      const mixed: TreeNode[] = [
        {
          key: 'open',
          label: 'Open folder',
          children: [
            { key: 'editable', label: 'editable.ts' },
            { key: 'locked', label: 'locked.ts', disabled: true },
          ],
        },
        { key: 'archived', label: 'Archived folder', disabled: true },
      ]
      return { fileTree, mixed }
    },
    template: `
      <div class="grid gap-8 lg:grid-cols-2">
        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Ready</p>
          <DzTree
            :items="fileTree"
            :expanded-keys="['src']"
            aria-label="Ready file tree"
            data-testid="tree-ready"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Loading</p>
          <DzTree
            loading
            :items="fileTree"
            aria-label="Loading file tree"
            data-testid="tree-loading"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Disabled tree</p>
          <DzTree
            disabled
            :items="fileTree"
            :expanded-keys="['src']"
            aria-label="Disabled file tree"
            data-testid="tree-disabled"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Disabled nodes</p>
          <DzTree
            selectable
            :items="mixed"
            :expanded-keys="['open']"
            aria-label="Tree with disabled nodes"
            data-testid="tree-nodes"
          />
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ready = canvas.getByTestId('tree-ready')
    const loading = canvas.getByTestId('tree-loading')
    const disabled = canvas.getByTestId('tree-disabled')
    const nodes = canvas.getByTestId('tree-nodes')

    // One `data-state` carries the resolved root state, in priority order.
    await expect(ready).toHaveAttribute('data-state', 'ready')
    await expect(ready).not.toHaveAttribute('data-loading')
    await expect(ready).not.toHaveAttribute('data-disabled')

    await expect(loading).toHaveAttribute('data-state', 'loading')
    await expect(loading).toHaveAttribute('data-loading')

    await expect(disabled).toHaveAttribute('data-state', 'disabled')
    await expect(disabled).toHaveAttribute('data-disabled')

    // `role="treeitem"` sits on the <li>, whose text content includes its whole
    // subtree — so nodes are located by their own label and walked up to the
    // owning treeitem rather than matched on an accessible name.
    const itemFor = (root: HTMLElement, label: string) =>
      within(root).getByText(label).closest('[role="treeitem"]') as HTMLElement

    // Ready: real APG tree semantics — expandable nodes report `aria-expanded`
    // and a roving tabindex leaves exactly one row reachable by Tab.
    const src = itemFor(ready, 'src')
    await expect(src).toHaveAttribute('aria-expanded', 'true')
    await expect(src).toHaveAttribute('aria-level', '1')
    await expect(ready.querySelectorAll('[data-dz-tree-row][tabindex="0"]')).toHaveLength(1)

    // Node-level disabled is announced per node and removed from the tab order,
    // while its enabled sibling stays reachable.
    const locked = itemFor(nodes, 'locked.ts')
    await expect(locked).toHaveAttribute('aria-disabled', 'true')
    await expect(locked).toHaveAttribute('data-disabled')
    await expect(locked.querySelector('[data-dz-tree-row]')).toHaveAttribute('tabindex', '-1')

    const editable = itemFor(nodes, 'editable.ts')
    await expect(editable).not.toHaveAttribute('aria-disabled')

    // A disabled node refuses selection; its enabled sibling accepts it.
    await userEvent.click(editable.querySelector<HTMLElement>('[data-dz-tree-row]')!)
    await waitFor(() => expect(editable).toHaveAttribute('aria-selected', 'true'))
    await expect(locked).toHaveAttribute('aria-selected', 'false')
  },
}
