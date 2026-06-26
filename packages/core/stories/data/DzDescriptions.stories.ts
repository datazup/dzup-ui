import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzDescriptions, DzDescriptionsItem } from '../../src/components/data'

/**
 * DzDescriptions displays read-only record detail as a responsive label/value
 * grid. It renders semantic `<dl>`/`<dt>`/`<dd>` markup, supports horizontal and
 * vertical layouts, an optional bordered (table-like) style, density sizes,
 * responsive column counts, and per-entry column spans.
 *
 * Use the `items` prop for plain text, or compose `DzDescriptionsItem` children
 * for slot-rich values (badges, links, avatars). Children inherit size, layout,
 * and bordered density from the parent via inject (ADR-08).
 */

const sampleItems = [
  { label: 'Full name', value: 'Ada Lovelace' },
  { label: 'Role', value: 'Principal Engineer' },
  { label: 'Email', value: 'ada@dzup.dev' },
  { label: 'Location', value: 'London, UK' },
  { label: 'Team', value: 'Platform' },
  { label: 'Bio', value: 'Mathematician, writer, and pioneer of computing.', span: 2 },
]

const meta = {
  title: 'Core/Data/DzDescriptions',
  component: DzDescriptions,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    // Appearance
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Per-pair layout orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    bordered: {
      control: 'boolean',
      description: 'Render label/value cells with borders',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size / density',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    columns: {
      control: 'object',
      description: 'Number of columns or a responsive breakpoint map',
      table: { category: 'Layout', defaultValue: { summary: '3' } },
    },
    items: {
      control: 'object',
      description: 'Declarative { label, value, span? } entries',
      table: { category: 'Content' },
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
    layout: 'horizontal',
    bordered: false,
    size: 'md',
    columns: 3,
  },
} satisfies Meta<typeof DzDescriptions>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Horizontal (default)
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  args: {
    items: sampleItems,
    ariaLabel: 'User profile',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const dl = canvasElement.querySelector('dl')
    await expect(dl).not.toBeNull()

    const terms = canvasElement.querySelectorAll('dt')
    await expect(terms.length).toBe(sampleItems.length)

    const details = canvasElement.querySelectorAll('dd')
    await expect(details.length).toBe(sampleItems.length)

    await expect(canvas.getByText('Ada Lovelace')).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  args: {
    layout: 'vertical',
    items: sampleItems,
    ariaLabel: 'User profile',
  },
}

// ---------------------------------------------------------------------------
// Bordered
// ---------------------------------------------------------------------------

export const Bordered: Story = {
  args: {
    bordered: true,
    items: sampleItems,
    ariaLabel: 'User profile',
  },
}

// ---------------------------------------------------------------------------
// Responsive Columns — collapses to 1 column on small viewports
// ---------------------------------------------------------------------------

export const ResponsiveColumns: Story = {
  name: 'Responsive Columns',
  render: () => ({
    components: { DzDescriptions },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-gray-500">
          Resize the viewport: 1 column on mobile, 2 from <code>sm</code>, 3 from <code>lg</code>.
        </p>
        <DzDescriptions
          bordered
          :columns="{ base: 1, sm: 2, lg: 3 }"
          :items="items"
          aria-label="Responsive profile"
        />
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
    components: { DzDescriptions },
    setup() {
      return { items: sampleItems.slice(0, 4) }
    },
    template: `
      <div class="space-y-8">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzDescriptions bordered :size="s" :columns="2" :items="items" :aria-label="s + ' details'" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots — DzDescriptionsItem children for slot-rich values
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzDescriptions, DzDescriptionsItem },
    template: `
      <DzDescriptions bordered :columns="2" aria-label="Order summary">
        <DzDescriptionsItem label="Order">#DZ-12345</DzDescriptionsItem>
        <DzDescriptionsItem label="Status">
          <span class="inline-flex items-center gap-1 text-[var(--dz-success)] font-medium">
            <span class="w-2 h-2 rounded-full bg-[var(--dz-success)]"></span>
            Paid
          </span>
        </DzDescriptionsItem>
        <DzDescriptionsItem label="Customer">
          <a href="#" class="text-[var(--dz-primary)] underline">Ada Lovelace</a>
        </DzDescriptionsItem>
        <DzDescriptionsItem label="Total">$129.99</DzDescriptionsItem>
        <DzDescriptionsItem label="Shipping address" :span="2">
          221B Baker Street, London NW1 6XE, United Kingdom
        </DzDescriptionsItem>
      </DzDescriptions>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Parts — anatomy of DzDescriptionsItem
// ---------------------------------------------------------------------------

export const Parts: Story = {
  name: 'Parts: DzDescriptionsItem',
  render: () => ({
    components: { DzDescriptions, DzDescriptionsItem },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          <code>DzDescriptionsItem</code> is the composable sub-part. Each item
          renders a grouped <code>&lt;dt&gt;</code> (label) / <code>&lt;dd&gt;</code>
          (value) pair and inherits size, layout, and bordered density from the
          parent <code>DzDescriptions</code>. Use the <code>label</code> slot for
          rich labels and <code>span</code> to widen an entry.
        </p>
        <DzDescriptions bordered :columns="2" aria-label="Parts demo">
          <DzDescriptionsItem label="Plain label">Default slot value</DzDescriptionsItem>
          <DzDescriptionsItem>
            <template #label>
              <span class="inline-flex items-center gap-1">⭐ Slot label</span>
            </template>
            Value next to a custom label
          </DzDescriptionsItem>
          <DzDescriptionsItem label="Spanning entry" :span="2">
            This <code>DzDescriptionsItem</code> spans both columns via <code>:span="2"</code>.
          </DzDescriptionsItem>
        </DzDescriptions>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Summary
// ---------------------------------------------------------------------------

export const RealWorldSettings: Story = {
  name: 'Real World: Settings Summary',
  render: () => ({
    components: { DzDescriptions },
    setup() {
      return {
        items: [
          { label: 'Plan', value: 'Team (5 seats)' },
          { label: 'Billing', value: 'Monthly · $49' },
          { label: 'Next invoice', value: 'July 1, 2026' },
          { label: 'Region', value: 'eu-west-1' },
          { label: 'API version', value: 'v2' },
          { label: 'Support', value: 'Priority' },
        ],
      }
    },
    template: `
      <div class="max-w-2xl">
        <h3 class="text-lg font-semibold mb-4">Workspace settings</h3>
        <DzDescriptions bordered :columns="{ base: 1, sm: 2, md: 3 }" :items="items" aria-label="Workspace settings" />
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
    components: { DzDescriptions },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <DzDescriptions bordered :columns="{ base: 1, md: 3 }" :items="items" aria-label="Dark mode profile" />
    `,
  }),
}
