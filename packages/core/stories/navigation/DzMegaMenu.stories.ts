import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DzMegaMenuItem } from '../../src/components/navigation/DzMegaMenu.types'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzMegaMenu } from '../../src/components/navigation'
import { darkModeDecorator } from '../_shared'

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
  render: args => ({
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
        items: [{ label: 'What\'s new', href: '#' }],
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
  render: args => ({
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
  render: args => ({
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

// ---------------------------------------------------------------------------
// States — enabled / item-disabled / menu-disabled (tier C `states` DoD item)
// ---------------------------------------------------------------------------

const stateItems: DzMegaMenuItem[] = [
  {
    label: 'Products',
    items: [
      {
        label: 'Analytics',
        items: [
          { label: 'Dashboards', href: '#' },
          { label: 'Reports', href: '#', disabled: true },
        ],
      },
    ],
  },
  { label: 'Changelog', href: '#', disabled: true },
  { label: 'Pricing', href: '#' },
]

/**
 * `disabled` on DzMegaMenu exists at two levels that behave differently, and a
 * menubar is exactly where confusing them hurts.
 *
 * A **disabled item** is announced with `aria-disabled`, flagged with
 * `data-disabled`, and its variant removes pointer events — it is unreachable,
 * not merely grey. A **disabled menubar** pushes a real `disabled` attribute
 * down to every panel-owning trigger, so none of them can be tabbed to, clicked
 * or expanded. The play function measures both against a live menubar in the
 * same canvas.
 */
export const States: Story = {
  render: () => ({
    components: { DzMegaMenu },
    setup() {
      return { stateItems }
    },
    template: `
      <div class="space-y-8 pb-64">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled — one item disabled</p>
          <DzMegaMenu
            :items="stateItems"
            :open-on-hover="false"
            aria-label="Enabled navigation"
            data-testid="mm-enabled"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Whole menubar disabled</p>
          <DzMegaMenu
            disabled
            :items="stateItems"
            :open-on-hover="false"
            aria-label="Disabled navigation"
            data-testid="mm-disabled"
          />
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('mm-enabled')
    const disabled = canvas.getByTestId('mm-disabled')

    // A disabled ENTRY is announced and physically unreachable.
    const changelog = within(enabled).getByRole('menuitem', { name: /Changelog/i })
    await expect(changelog).toHaveAttribute('aria-disabled', 'true')
    await expect(changelog).toHaveAttribute('data-disabled')
    await expect(getComputedStyle(changelog).pointerEvents).toBe('none')

    // Its live siblings are neither.
    const products = within(enabled).getByRole('menuitem', { name: /Products/i })
    await expect(products).not.toHaveAttribute('aria-disabled')
    await expect(products).toHaveAttribute('aria-expanded', 'false')

    // The live menubar really opens, so the refusal below is measured.
    await userEvent.click(products)
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'true'))

    // A disabled link inside the open panel carries the same announcement.
    const reports = within(enabled).getByRole('menuitem', { name: /Reports/i })
    await expect(reports).toHaveAttribute('aria-disabled', 'true')
    await expect(reports).toHaveAttribute('data-disabled')

    // Escape closes the panel and returns focus to the trigger.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'))

    // A disabled MENUBAR pushes the state down to every panel-owning trigger:
    // each becomes a `disabled` button, so it is neither tabbable nor clickable
    // and can never expand.
    const frozen = within(disabled).getByRole('menuitem', { name: /Products/i })
    await expect(frozen).toBeDisabled()
    await expect(frozen).toHaveAttribute('aria-expanded', 'false')
    await expect(getComputedStyle(frozen).pointerEvents).toBe('none')
    // Leaf links have no `disabled` attribute to receive, so the menubar's own
    // guard is what refuses them — `onTriggerClick` returns before toggling.
    await expect(within(disabled).getByRole('menuitem', { name: /^Pricing/i }))
      .toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Accessibility — the APG menubar keyboard contract (tier C item)
// ---------------------------------------------------------------------------

/**
 * The WAI-ARIA menubar pattern, driven end to end without a pointer.
 *
 * `role="menubar"` with a roving tabindex means Tab reaches the bar exactly
 * once; ArrowLeft/ArrowRight then move between triggers, ArrowDown opens a panel
 * and lands on its first link, ArrowUp/ArrowDown cycle inside it, and Escape
 * closes the panel **and returns focus to the trigger**. Every one of those is
 * asserted below — a mega menu that can only be opened by hovering is the
 * failure this story exists to catch.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Menubar Keyboard Contract',
  render: () => ({
    components: { DzMegaMenu },
    setup() {
      return { items }
    },
    template: `
      <div class="space-y-3 pb-64">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Tab reaches the menubar once. ArrowLeft/ArrowRight move between
          triggers, ArrowDown opens a panel and focuses its first link,
          ArrowUp/ArrowDown cycle the links, Escape closes and restores focus.
        </p>
        <DzMegaMenu
          :items="items"
          :open-on-hover="false"
          aria-label="Keyboard navigation"
          data-testid="mm-a11y"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('mm-a11y')
    const menubar = within(root).getByRole('menubar')

    // Roving tabindex: exactly one trigger is in the tab order.
    await expect(menubar).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(menubar.querySelectorAll('[role="menuitem"][tabindex="0"]')).toHaveLength(1)

    // Reach the bar with Tab only.
    for (let i = 0; i < 6 && !menubar.contains(document.activeElement); i++)
      await userEvent.tab()
    await expect(menubar.contains(document.activeElement)).toBe(true)
    const products = within(root).getByRole('menuitem', { name: /^Products/i })
    await expect(products).toHaveFocus()

    // ArrowRight moves along the bar; ArrowLeft comes back.
    await userEvent.keyboard('{ArrowRight}')
    const solutions = within(root).getByRole('menuitem', { name: /^Solutions/i })
    await waitFor(() => expect(solutions).toHaveFocus())
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(products).toHaveFocus())

    // ArrowDown opens the panel and lands on its first link.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'true'))
    const dashboards = within(root).getByRole('menuitem', { name: /Dashboards/i })
    await waitFor(() => expect(dashboards).toHaveFocus())

    // ArrowDown cycles the links inside the panel.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(within(root).getByRole('menuitem', { name: /Reports/i })).toHaveFocus(),
    )

    // Escape closes the panel AND returns focus to the trigger.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'))
    await waitFor(() => expect(products).toHaveFocus())
  },
}

// ---------------------------------------------------------------------------
// Real world — marketing site header (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * The only place a mega menu belongs: the primary header of a marketing site,
 * beside a brand mark and a call to action, with a plain link (`Pricing`) next
 * to panel-owning entries.
 *
 * That mix is the point — a mega menu whose every entry opens a panel never
 * shows that a leaf entry must navigate instead of expanding, which is where
 * the menubar pattern most often breaks.
 */
export const RealWorldSiteHeader: Story = {
  name: 'Real World: Marketing Site Header',
  render: () => ({
    components: { DzMegaMenu },
    setup() {
      return { items }
    },
    template: `
      <div class="pb-64">
        <header
          class="flex items-center gap-6 rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)]"
          data-testid="mm-rw-header"
        >
          <span class="text-[length:var(--dz-text-base)] font-semibold text-[var(--dz-foreground)]">Datazup</span>
          <DzMegaMenu
            :items="items"
            :open-on-hover="false"
            aria-label="Primary site navigation"
            data-testid="mm-rw"
          />
          <a
            href="#"
            class="ml-auto rounded-[var(--dz-radius-md)] bg-[var(--dz-primary)] px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)] text-[var(--dz-primary-foreground)] no-underline"
          >Start free</a>
        </header>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('mm-rw')

    // The nav is a named landmark inside the header, not an anonymous div.
    await expect(within(root).getByRole('menubar', { name: 'Primary site navigation' }))
      .toBeInTheDocument()

    // A panel-owning entry advertises the popup it owns…
    const products = within(root).getByRole('menuitem', { name: /^Products/i })
    await expect(products).toHaveAttribute('aria-haspopup', 'true')
    await userEvent.click(products)
    await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'true'))
    await expect(within(root).getByRole('menuitem', { name: /Pipelines/i })).toBeVisible()

    // …opening a second entry closes the first, so only one panel is ever open.
    const solutions = within(root).getByRole('menuitem', { name: /^Solutions/i })
    await userEvent.click(solutions)
    await waitFor(() => expect(solutions).toHaveAttribute('aria-expanded', 'true'))
    await expect(products).toHaveAttribute('aria-expanded', 'false')

    // …while a leaf entry is a real link with no popup at all.
    const pricing = within(root).getByRole('menuitem', { name: /^Pricing/i })
    await expect(pricing).not.toHaveAttribute('aria-haspopup')
    await expect(pricing).not.toHaveAttribute('aria-expanded')
    await expect(pricing.tagName).toBe('A')
  },
}
