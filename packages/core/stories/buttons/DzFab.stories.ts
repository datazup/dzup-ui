import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { expect, fn, userEvent, within } from 'storybook/test'
import { DzFab } from '../../src/components/buttons'

/**
 * DzFab is a floating action button (FAB): a circular, elevated button that
 * surfaces a single persistent primary action such as compose, add, or ask AI.
 *
 * It supports the same variant/size/tone/disabled/loading API as DzButton but
 * renders as a circle with elevation shadow and optional fixed screen positioning.
 *
 * Key props:
 * - `ariaLabel` (required) — accessible name, because a FAB shows only an icon
 * - `position` — pin to a viewport corner or keep in normal flow (`static`)
 */
const meta = {
  title: 'Core/Buttons/DzFab',
  component: DzFab,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Accessibility
    ariaLabel: {
      control: 'text',
      description:
        'Accessible label — REQUIRED. A FAB shows only an icon, so an accessible name must always be supplied.',
      table: { category: 'Accessibility' },
    },
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
      description:
        'Visual style variant. A deliberate subset of ButtonVariant — text/link do not apply to FABs.',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size.',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone.',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state — shows spinner and sets aria-busy.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    position: {
      control: 'select',
      options: ['static', 'bottom-right', 'bottom-left', 'top-right', 'top-left'],
      description: 'Pin the FAB to a viewport corner (fixed) or leave it in normal flow (static).',
      table: { category: 'Behavior', defaultValue: { summary: 'static' } },
    },
  },
  args: {
    ariaLabel: 'Add item',
    variant: 'solid',
    size: 'md',
    tone: 'primary',
    disabled: false,
    loading: false,
    position: 'static',
  },
} satisfies Meta<typeof DzFab>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => ({
    components: { DzFab },
    setup() {
      return { args }
    },
    template: `
      <DzFab v-bind="args">+</DzFab>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const ToneGallery: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzFab },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="neutral" aria-label="Neutral">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">neutral</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="primary" aria-label="Primary">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">primary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="success" aria-label="Success">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">success</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="warning" aria-label="Warning">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">warning</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="danger" aria-label="Danger">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">danger</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="info" aria-label="Info">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">info</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const SizeGallery: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzFab },
    template: `
      <div class="flex items-end gap-4">
        <div class="flex flex-col items-center gap-2">
          <DzFab size="xs" aria-label="Extra small">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">xs</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab size="sm" aria-label="Small">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">sm</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab size="md" aria-label="Medium">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">md</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab size="lg" aria-label="Large">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">lg</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab size="xl" aria-label="Extra large">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">xl</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const VariantGallery: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzFab },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col items-center gap-2">
          <DzFab variant="solid" aria-label="Solid">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">solid</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab variant="outline" aria-label="Outline">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">outline</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab variant="ghost" aria-label="Ghost">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">ghost</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States (idle, loading, disabled)
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzFab },
    template: `
      <div class="flex gap-6 items-center">
        <div class="flex flex-col items-center gap-2">
          <DzFab aria-label="Idle">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">idle</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab loading aria-label="Loading">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">loading</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab disabled aria-label="Disabled">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">disabled</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Fixed Positions (note-only: rendered in static mode)
// ---------------------------------------------------------------------------

/**
 * In production use, set `position` to a corner value to pin the FAB to the
 * viewport with `position: fixed`. This story renders all four positions in
 * `static` mode to avoid overlapping the Storybook canvas — the labels show
 * which corner each FAB would occupy.
 */
export const FixedPositions: Story = {
  name: 'Fixed Positions',
  parameters: {
    docs: {
      description: {
        story:
          'Corner position values apply `position: fixed` with token-driven viewport offsets. ' +
          'Rendered here in `static` mode so they do not overlap the Storybook canvas. ' +
          'In real use set `position="bottom-right"` etc. on the FAB and mount it at the layout root.',
      },
    },
  },
  render: () => ({
    components: { DzFab },
    template: `
      <div class="flex flex-wrap gap-6 items-center">
        <div class="flex flex-col items-center gap-2">
          <DzFab position="static" aria-label="Bottom right FAB">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">bottom-right</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab position="static" aria-label="Bottom left FAB">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">bottom-left</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab position="static" aria-label="Top right FAB">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">top-right</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab position="static" aria-label="Top left FAB">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">top-left</span>
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
  render: () => ({
    components: { DzFab },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="neutral" aria-label="Neutral">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">neutral</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="primary" aria-label="Primary">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">primary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="success" aria-label="Success">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">success</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="warning" aria-label="Warning">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">warning</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="danger" aria-label="Danger">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">danger</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <DzFab tone="info" aria-label="Info">+</DzFab>
          <span class="text-xs text-[var(--dz-muted-foreground)]">info</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Click Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  args: {
    onClick: fn(),
  },
  render: (args) => ({
    components: { DzFab },
    setup() {
      return { args }
    },
    template: `
      <DzFab v-bind="args">+</DzFab>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const fab = canvas.getByRole('button', { name: /add item/i })
    await userEvent.click(fab)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

// ---------------------------------------------------------------------------
// Accessibility: ariaLabel required
// ---------------------------------------------------------------------------

/**
 * `ariaLabel` is required on every DzFab. Because a FAB renders only an icon
 * (no visible text), an accessible name must always be provided. This story
 * verifies that the rendered button is discoverable by its accessible name.
 */
export const Accessibility: Story = {
  name: 'Accessibility: ariaLabel Required',
  parameters: {
    docs: {
      description: {
        story:
          '`ariaLabel` is a required prop on DzFab. Without it, screen readers cannot ' +
          'announce the button purpose. The play step asserts the button is reachable ' +
          'via its accessible name.',
      },
    },
  },
  args: {
    ariaLabel: 'Add item',
  },
  render: (args) => ({
    components: { DzFab },
    setup() {
      return { args }
    },
    template: `
      <DzFab v-bind="args">+</DzFab>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const fab = canvas.getByRole('button', { name: 'Add item' })
    await expect(fab).toBeVisible()
  },
}
