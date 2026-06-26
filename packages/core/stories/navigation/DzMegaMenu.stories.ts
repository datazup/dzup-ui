import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { DzMegaMenuItem } from '../../src/components/navigation/DzMegaMenu.types'
import { darkModeDecorator } from '../_shared'
import { DzMegaMenu } from '../../src/components/navigation'

/**
 * DzMegaMenu is a horizontal (or vertical) navigation menubar whose top-level
 * items open wide, multi-column dropdown panels.
 *
 * It is model-driven — each item may own column `items`, and each column owns
 * link `items`. It follows the WAI-ARIA menubar pattern (role="menubar" +
 * roving tabindex): Arrow keys move across triggers and into panels, hover and
 * keyboard both open, and Esc closes (returning focus to the trigger). Below
 * the `breakpoint` it collapses into a stacked accordion menu.
 */
const items: DzMegaMenuItem[] = [
  {
    label: 'Products',
    items: [
      {
        label: 'Analytics',
        items: [
          { label: 'Dashboards', href: '#', description: 'Real-time metrics' },
          { label: 'Reports', href: '#', description: 'Scheduled exports' },
          { label: 'Funnels', href: '#', description: 'Conversion paths' },
        ],
      },
      {
        label: 'Data',
        items: [
          { label: 'Pipelines', href: '#', description: 'ETL orchestration' },
          { label: 'Warehouse', href: '#', description: 'Columnar storage' },
          { label: 'Connectors', href: '#', description: '200+ sources' },
        ],
      },
      {
        label: 'AI',
        items: [
          { label: 'Models', href: '#', description: 'Hosted inference' },
          { label: 'Agents', href: '#', description: 'Task automation' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    items: [
      {
        label: 'By industry',
        items: [
          { label: 'Fintech', href: '#' },
          { label: 'Healthcare', href: '#' },
          { label: 'Retail', href: '#' },
        ],
      },
      {
        label: 'By team',
        items: [
          { label: 'Engineering', href: '#' },
          { label: 'Marketing', href: '#' },
        ],
      },
    ],
  },
  { label: 'Pricing', href: '#' },
  { label: 'Docs', href: '#' },
]

const meta = {
  title: 'Core/Navigation/DzMegaMenu',
  component: DzMegaMenu,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Menubar orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    openOnHover: {
      control: 'boolean',
      description: 'Open panels on pointer hover',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    breakpoint: {
      control: 'number',
      description: 'Viewport width (px) at/below which the menu collapses',
      table: { category: 'Behavior', defaultValue: { summary: '768' } },
    },
    collapsed: {
      control: 'boolean',
      description: 'Force the collapsed (stacked accordion) layout',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents all interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    orientation: 'horizontal',
    size: 'md',
    openOnHover: true,
    breakpoint: 768,
  },
} satisfies Meta<typeof DzMegaMenu>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Horizontal
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  render: (args) => ({
    components: { DzMegaMenu },
    setup() {
      return { args, items }
    },
    template: `
      <div class="pb-64">
        <DzMegaMenu v-bind="args" :items="items" aria-label="Primary" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Menubar role is present.
    const menubar = canvas.getByRole('menubar')
    await expect(menubar).toBeInTheDocument()

    // "Products" trigger starts closed.
    const productsTrigger = canvas.getByRole('menuitem', { name: /Products/i })
    await expect(productsTrigger).toHaveAttribute('aria-expanded', 'false')

    // Hovering or clicking the trigger opens the panel.
    await userEvent.hover(productsTrigger)
    await waitFor(() => expect(productsTrigger).toHaveAttribute('aria-expanded', 'true'), {
      timeout: 3000,
    })

    // Panel link items are visible after opening.
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: /Dashboards/i })).toBeVisible())
    await expect(canvas.getByRole('menuitem', { name: /Reports/i })).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// With Featured Card (#group slot)
// ---------------------------------------------------------------------------

const featuredItems: DzMegaMenuItem[] = [
  {
    label: 'Products',
    items: [
      {
        label: 'Highlight',
        featured: true,
        items: [{ label: "What's new", href: '#' }],
      },
      {
        label: 'Analytics',
        items: [
          { label: 'Dashboards', href: '#' },
          { label: 'Reports', href: '#' },
        ],
      },
      {
        label: 'Data',
        items: [
          { label: 'Pipelines', href: '#' },
          { label: 'Warehouse', href: '#' },
        ],
      },
    ],
  },
  { label: 'Docs', href: '#' },
]

export const WithFeaturedCard: Story = {
  name: 'With Featured Card',
  render: (args) => ({
    components: { DzMegaMenu },
    setup() {
      return { args, featuredItems }
    },
    template: `
      <div class="pb-64">
        <DzMegaMenu v-bind="args" :items="featuredItems" aria-label="Primary">
          <template #group="{ group, item }">
            <template v-if="group.featured">
              <div class="flex flex-col gap-1 rounded-[var(--dz-radius-md)] bg-[var(--dz-primary-muted)] p-[var(--dz-spacing-4)]">
                <span class="text-[length:var(--dz-text-xs)] font-semibold uppercase tracking-wide text-[var(--dz-primary)]">
                  {{ item.label }}
                </span>
                <strong class="text-[var(--dz-foreground)]">{{ group.items[0].label }}</strong>
                <p class="text-[length:var(--dz-text-xs)] text-[var(--dz-muted-foreground)]">
                  See the latest releases and roadmap updates.
                </p>
              </div>
            </template>
            <template v-else>
              <span class="px-[var(--dz-spacing-2)] pb-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] font-semibold uppercase tracking-wide text-[var(--dz-muted-foreground)]">
                {{ group.label }}
              </span>
              <a
                v-for="link in group.items"
                :key="link.label"
                :href="link.href"
                class="rounded-[var(--dz-radius-md)] px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)] text-[var(--dz-foreground)] no-underline hover:bg-[var(--dz-muted)]"
              >
                {{ link.label }}
              </a>
            </template>
          </template>
        </DzMegaMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Responsive (collapsed accordion)
// ---------------------------------------------------------------------------

export const Responsive: Story = {
  name: 'Responsive (collapsed)',
  args: { collapsed: true },
  render: (args) => ({
    components: { DzMegaMenu },
    setup() {
      return { args, items }
    },
    template: `
      <div class="max-w-sm rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-[var(--dz-spacing-3)]">
        <p class="mb-2 text-sm text-[var(--dz-muted-foreground)]">
          Below the breakpoint the menu becomes a stacked accordion.
        </p>
        <DzMegaMenu v-bind="args" :items="items" aria-label="Primary" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // "Products" trigger starts collapsed (aria-expanded="false").
    const productsTrigger = canvas.getByRole('button', { name: /Products/i })
    await expect(productsTrigger).toHaveAttribute('aria-expanded', 'false')

    // Clicking expands the accordion section.
    await userEvent.click(productsTrigger)
    await waitFor(() => expect(productsTrigger).toHaveAttribute('aria-expanded', 'true'))

    // Child links are visible after expansion.
    await waitFor(() => expect(canvas.getByText('Dashboards')).toBeVisible())
    await expect(canvas.getByText('Pipelines')).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzMegaMenu },
    setup() {
      return { items }
    },
    template: `
      <div class="pb-64">
        <DzMegaMenu :items="items" aria-label="Primary" />
      </div>
    `,
  }),
}
