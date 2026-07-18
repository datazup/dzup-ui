import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzChip } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

/**
 * DzChip is a compact element representing an input, attribute, or action.
 * It supports three visual variants (`solid`, `outline`, `subtle`),
 * six semantic tones, three sizes, and optional close/dismiss behavior.
 */

const meta = {
  title: 'Core/Data/DzChip',
  component: DzChip,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'subtle' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    closable: {
      control: 'boolean',
      description: 'Whether the chip can be dismissed/closed',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
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
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'subtle',
    tone: 'neutral',
    size: 'md',
    closable: false,
    disabled: false,
  },
} satisfies Meta<typeof DzChip>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzChip },
    setup() {
      return { args }
    },
    template: '<DzChip v-bind="args">Chip</DzChip>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzChip },
    template: `
      <div class="flex flex-wrap gap-3 items-center">
        <DzChip variant="solid">Solid</DzChip>
        <DzChip variant="outline">Outline</DzChip>
        <DzChip variant="subtle">Subtle</DzChip>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzChip },
    template: `
      <div class="flex items-center gap-3">
        <DzChip size="sm">Small</DzChip>
        <DzChip size="md">Medium</DzChip>
        <DzChip size="lg">Large</DzChip>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzChip },
    template: `
      <div class="space-y-4">
        <div v-for="v in ['solid', 'outline', 'subtle']" :key="v">
          <p class="text-sm font-medium mb-2 capitalize">{{ v }}</p>
          <div class="flex flex-wrap gap-3">
            <DzChip :variant="v" tone="neutral">Neutral</DzChip>
            <DzChip :variant="v" tone="primary">Primary</DzChip>
            <DzChip :variant="v" tone="success">Success</DzChip>
            <DzChip :variant="v" tone="warning">Warning</DzChip>
            <DzChip :variant="v" tone="danger">Danger</DzChip>
            <DzChip :variant="v" tone="info">Info</DzChip>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Closable
// ---------------------------------------------------------------------------

export const Closable: Story = {
  name: 'Closable Chips',
  render: () => ({
    components: { DzChip },
    data() {
      return {
        tags: ['Vue', 'TypeScript', 'Tailwind', 'Storybook', 'Vitest'],
      }
    },
    template: `
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <DzChip
            v-for="tag in tags"
            :key="tag"
            closable
            tone="primary"
            variant="outline"
            @close="tags = tags.filter(t => t !== tag)"
          >{{ tag }}</DzChip>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">{{ tags.length }} chips remaining</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All 5 chips should be present initially.
    await expect(canvas.getByText('Vue')).toBeVisible()
    await expect(canvas.getByText('TypeScript')).toBeVisible()
    await expect(canvas.getByText(/5 chips remaining/i)).toBeInTheDocument()

    // Click the close button on the Vue chip — it disappears.
    const closeBtns = canvas.getAllByRole('button')
    await userEvent.click(closeBtns[0])
    await waitFor(() => expect(canvas.queryByText('Vue')).not.toBeInTheDocument())
    await expect(canvas.getByText(/4 chips remaining/i)).toBeInTheDocument()

    // Click again — TypeScript is removed.
    const remainingBtns = canvas.getAllByRole('button')
    await userEvent.click(remainingBtns[0])
    await waitFor(() => expect(canvas.getByText(/3 chips remaining/i)).toBeInTheDocument())
  },
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    closable: true,
  },
  render: args => ({
    components: { DzChip },
    setup() {
      return { args }
    },
    template: '<DzChip v-bind="args">Disabled Chip</DzChip>',
  }),
}

// ---------------------------------------------------------------------------
// With Prefix Slot
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Prefix Slot',
  render: () => ({
    components: { DzChip },
    template: `
      <div class="flex flex-wrap gap-3">
        <DzChip tone="success" variant="subtle">
          <template #prefix>
            <div class="w-2 h-2 rounded-full bg-[var(--dz-success)]"></div>
          </template>
          Online
        </DzChip>
        <DzChip tone="warning" variant="subtle">
          <template #prefix>
            <div class="w-2 h-2 rounded-full bg-[var(--dz-warning-solid)]"></div>
          </template>
          Away
        </DzChip>
        <DzChip tone="danger" variant="subtle">
          <template #prefix>
            <div class="w-2 h-2 rounded-full bg-[var(--dz-danger)]"></div>
          </template>
          Offline
        </DzChip>
        <DzChip tone="neutral" variant="outline">
          <template #prefix>
            <div class="w-4 h-4 rounded-full bg-[var(--dz-primary-muted)] flex items-center justify-center text-[8px] font-bold text-[var(--dz-primary-muted-foreground)]">A</div>
          </template>
          Alice
        </DzChip>
      </div>
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
    components: { DzChip },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <DzChip variant="solid" tone="primary">Solid</DzChip>
          <DzChip variant="outline" tone="primary">Outline</DzChip>
          <DzChip variant="subtle" tone="primary">Subtle</DzChip>
        </div>
        <div class="flex flex-wrap gap-3">
          <DzChip tone="success" closable>Success</DzChip>
          <DzChip tone="warning" closable>Warning</DzChip>
          <DzChip tone="danger" closable>Danger</DzChip>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus & Close',
  render: () => ({
    components: { DzChip },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Tab to focus each chip. Closable chips have a dismiss button focusable via Tab.
          Press Enter or Space on the close button to remove the chip. Disabled chips
          are excluded from the tab order.
        </p>
        <div class="flex flex-wrap gap-3">
          <DzChip closable tone="primary">Focusable</DzChip>
          <DzChip closable tone="success">Also Focusable</DzChip>
          <DzChip closable disabled tone="neutral">Disabled (Skipped)</DzChip>
          <DzChip closable tone="danger">Focusable</DzChip>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Filter Chips
// ---------------------------------------------------------------------------

export const RealWorldFilters: Story = {
  name: 'Real World: Active Filters',
  render: () => ({
    components: { DzChip },
    data() {
      return {
        filters: [
          { key: 'dept', label: 'Department: Engineering' },
          { key: 'status', label: 'Status: Active' },
          { key: 'role', label: 'Role: Senior' },
          { key: 'location', label: 'Location: Remote' },
        ],
      }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm font-medium">Active Filters</p>
        <div class="flex flex-wrap gap-2">
          <DzChip
            v-for="filter in filters"
            :key="filter.key"
            closable
            variant="outline"
            tone="primary"
            size="sm"
            @close="filters = filters.filter(f => f.key !== filter.key)"
          >{{ filter.label }}</DzChip>
        </div>
        <button
          v-if="filters.length"
          class="text-xs text-[var(--dz-primary-muted-foreground)] hover:underline"
          @click="filters = []"
        >Clear all filters</button>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Input Tags
// ---------------------------------------------------------------------------

export const RealWorldInputTags: Story = {
  name: 'Real World: Input Tags',
  render: () => ({
    components: { DzChip },
    data() {
      return {
        tags: ['javascript', 'vue', 'typescript'],
        newTag: '',
      }
    },
    methods: {
      addTag() {
        const tag = (this as unknown as { newTag: string }).newTag.trim()
        if (tag && !(this as unknown as { tags: string[] }).tags.includes(tag)) {
          ;(this as unknown as { tags: string[] }).tags.push(tag)
        }
        ;(this as unknown as { newTag: string }).newTag = ''
      },
    },
    template: `
      <div class="max-w-sm space-y-2">
        <label class="text-sm font-medium">Tags</label>
        <div class="flex flex-wrap gap-2 p-2 border border-[var(--dz-border)] rounded-lg min-h-[42px]">
          <DzChip
            v-for="tag in tags"
            :key="tag"
            closable
            size="sm"
            variant="subtle"
            tone="primary"
            @close="tags = tags.filter(t => t !== tag)"
          >{{ tag }}</DzChip>
          <input
            v-model="newTag"
            class="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
            placeholder="Add tag..."
            @keydown.enter.prevent="addTag()"
          />
        </div>
      </div>
    `,
  }),
}
