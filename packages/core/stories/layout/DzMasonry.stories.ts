import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzMasonry } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * **DzMasonry** packs variable-height items into balanced cascading columns --
 * ideal for image walls, card feeds, and dashboards where a uniform grid would
 * crop or letterbox content.
 *
 * Two rendering paths share one API:
 *
 * - **CSS fast path** (`sequential`, the default): native CSS multi-column.
 *   Children flow in source order, the browser balances column heights, and DOM
 *   order matches source order -- the best choice for reading / tab order and
 *   for SSR (no measurement).
 * - **Measured-JS path** (`sequential: false`): each item is measured with a
 *   `ResizeObserver` and placed into the shortest column for exact packing.
 *   Items are grouped into per-column wrappers, so DOM order becomes
 *   column-major -- set `ordered` to force the CSS path back when source DOM
 *   order must be preserved.
 *
 * `columns` accepts a fixed count or a responsive object keyed by breakpoint
 * (`{ xs, sm, md, lg, xl }`). `gap` drives both column spacing and the vertical
 * gap between stacked items via the `--dz-masonry-gap` token.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Layout/DzMasonry',
  component: DzMasonry,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Number of columns (or a responsive object keyed by breakpoint)',
      table: { category: 'Appearance', defaultValue: { summary: '3' } },
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between columns and stacked items',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    sequential: {
      control: 'boolean',
      description:
        'CSS multi-column fast path (true) vs. measured shortest-column balancing (false)',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    ordered: {
      control: 'boolean',
      description: 'Force the CSS path so DOM order always matches source order (a11y)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'ul', 'ol'],
      description: 'HTML element to render as',
      table: { category: 'Behavior', defaultValue: { summary: 'div' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    columns: 3,
    gap: 'md',
    sequential: true,
    ordered: false,
  },
} satisfies Meta<typeof DzMasonry>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Helpers -- deterministic variable-height tiles
// ---------------------------------------------------------------------------

const HEIGHTS = [80, 140, 200, 110, 170, 90, 230, 130, 160, 100, 190, 120]

/**
 * Decorative tile fills, cycled deterministically. These are swatches with no
 * semantic meaning, so they come from the primitive ramp rather than an intent
 * token — a semantic fill would invert with the theme and break the demo.
 * Shade 600 keeps `--dz-colors-neutral-50` legible on every one.
 */
const TILE_FILLS = [
  'blue', 'purple', 'emerald', 'orange', 'pink', 'cyan',
  'lime', 'indigo', 'rose', 'green', 'fuchsia', 'amber',
].map(palette => `var(--dz-colors-${palette}-600)`)

function tiles(count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const h = HEIGHTS[i % HEIGHTS.length]
    const fill = TILE_FILLS[i % TILE_FILLS.length]
    return `
      <div
        class="rounded-lg flex items-center justify-center text-[var(--dz-colors-neutral-50)] text-sm font-medium"
        style="height: ${h}px; background: ${fill}"
      >
        ${i + 1}
      </div>`
  }).join('')
}

// ---------------------------------------------------------------------------
// Default -- basic 3-column CSS fast path with 9 tiles
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzMasonry },
    setup() {
      return { args }
    },
    template: `
      <DzMasonry v-bind="args" aria-label="Default masonry">
        ${tiles(9)}
      </DzMasonry>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The masonry root is rendered as a div with the aria-label we set
    const container = canvas.getByRole('generic', { name: 'Default masonry' })
    await expect(container).toBeInTheDocument()

    // 9 tiles should be in the DOM as direct children
    const items = container.querySelectorAll(':scope > div')
    await expect(items.length).toBe(9)

    // Each tile shows a 1-based number — verify first and last are visible
    await expect(canvas.getByText('1')).toBeVisible()
    await expect(canvas.getByText('9')).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// ImageWall -- exact shortest-column balancing (measured path)
// ---------------------------------------------------------------------------

export const ImageWall: Story = {
  name: 'Image Wall',
  args: {
    columns: 4,
    gap: 'md',
    sequential: false,
  },
  render: args => ({
    components: { DzMasonry },
    setup() {
      return { args }
    },
    template: `
      <DzMasonry v-bind="args" aria-label="Image wall">
        ${tiles(16)}
      </DzMasonry>
    `,
  }),
}

// ---------------------------------------------------------------------------
// CardFeed -- realistic card content in the CSS fast path
// ---------------------------------------------------------------------------

export const CardFeed: Story = {
  name: 'Card Feed',
  args: {
    columns: 3,
    gap: 'lg',
    sequential: true,
  },
  render: args => ({
    components: { DzMasonry },
    setup() {
      const cards = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        lines: (i % 4) + 1,
      }))
      return { args, cards }
    },
    template: `
      <DzMasonry v-bind="args" aria-label="Card feed">
        <article
          v-for="card in cards"
          :key="card.id"
          class="border border-[var(--dz-border)] rounded-lg p-5 space-y-2 bg-[var(--dz-card)]"
        >
          <div class="h-24 bg-[var(--dz-muted)] rounded" />
          <h3 class="font-semibold">Card {{ card.id }}</h3>
          <p v-for="l in card.lines" :key="l" class="text-sm text-[var(--dz-muted-foreground)]">
            A line of descriptive copy that makes cards differ in height.
          </p>
        </article>
      </DzMasonry>
    `,
  }),
}

// ---------------------------------------------------------------------------
// ResponsiveColumns -- column count adapts to viewport width
// ---------------------------------------------------------------------------

export const ResponsiveColumns: Story = {
  name: 'Responsive Columns',
  render: () => ({
    components: { DzMasonry },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Resize the viewport: 1 column on mobile, 2 from sm, 3 from md, 4 from lg.
        </p>
        <DzMasonry :columns="{ xs: 1, sm: 2, md: 3, lg: 4 }" gap="md" aria-label="Responsive masonry">
          ${tiles(12)}
        </DzMasonry>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// WithGap -- gap token gallery
// ---------------------------------------------------------------------------

export const WithGap: Story = {
  name: 'With Gap',
  render: () => ({
    components: { DzMasonry },
    template: `
      <div class="space-y-8">
        <div v-for="g in ['none', 'sm', 'md', 'xl']" :key="g">
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">gap="{{ g }}"</p>
          <DzMasonry :columns="3" :gap="g">
            ${tiles(9)}
          </DzMasonry>
        </div>
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
  args: {
    columns: 3,
    gap: 'md',
    sequential: false,
  },
  render: args => ({
    components: { DzMasonry },
    setup() {
      return { args }
    },
    template: `
      <DzMasonry v-bind="args" aria-label="Dark mode masonry">
        ${tiles(12)}
      </DzMasonry>
    `,
  }),
}
