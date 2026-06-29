import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzKbd } from '../../src/components/typography'
import { darkModeDecorator } from '../_shared'

/**
 * DzKbd renders keyboard-shortcut hints as semantic `<kbd>` chips.
 *
 * Two ways to author content:
 * - **`keys` prop** — pass an array like `['mod', 'k']` to render a combo. When
 *   `platformAware` is on (default), the synthetic `mod` resolves to ⌘ on macOS
 *   and `Ctrl` elsewhere; `alt`/`shift`/`enter`/`esc` map to their glyphs.
 * - **default slot** — pass raw content for a single chip (`<DzKbd>Esc</DzKbd>`).
 *
 * A spoken `aria-label` (e.g. "Command K") is generated for combos so screen
 * readers don't announce bare symbols.
 */
const meta = {
  title: 'Core/Typography/DzKbd',
  component: DzKbd,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    keys: {
      control: 'object',
      description: 'Ordered keys to render as a combo (e.g. [\'mod\', \'k\'])',
      table: { category: 'Content' },
    },
    platformAware: {
      control: 'boolean',
      description: 'Map synthetic keys (mod/alt/…) to platform glyphs',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    separator: {
      control: 'text',
      description: 'Glyph between chips; empty string for joined chips',
      table: { category: 'Appearance', defaultValue: { summary: '+' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Canonical chip size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    keys: ['mod', 'k'],
    platformAware: true,
    separator: '+',
    size: 'md',
  },
} satisfies Meta<typeof DzKbd>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Single key (slot)
// ---------------------------------------------------------------------------

export const SingleKey: Story = {
  args: { keys: undefined },
  render: args => ({
    components: { DzKbd },
    setup() {
      return { args }
    },
    template: '<p>Press <DzKbd v-bind="args">Esc</DzKbd> to close the dialog.</p>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const kbdElements = canvasElement.querySelectorAll('kbd')
    await expect(kbdElements.length).toBeGreaterThan(0)
    await expect(kbdElements[0]!.tagName.toLowerCase()).toBe('kbd')
    await expect(canvas.getByText('Esc')).toBeInTheDocument()
    await expect(canvas.getByText('Esc')).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// Combo
// ---------------------------------------------------------------------------

export const Combo: Story = {
  name: 'Combo (keys prop)',
  render: args => ({
    components: { DzKbd },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-3">
        <p>Open the command palette with <DzKbd v-bind="args" /></p>
        <p>Save with <DzKbd :keys="['mod', 's']" /></p>
        <p>Reformat with <DzKbd :keys="['mod', 'shift', 'p']" /></p>
        <p>Joined (no separator): <DzKbd :keys="['mod', 'enter']" separator="" /></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Platform aware
// ---------------------------------------------------------------------------

export const PlatformAware: Story = {
  name: 'Platform Aware',
  render: () => ({
    components: { DzKbd },
    template: `
      <div class="space-y-3 max-w-lg">
        <p class="text-sm text-gray-500">
          The same markup adapts to the host OS. On macOS the modifier renders as
          ⌘; on Windows/Linux it renders as Ctrl. Set <code>:platform-aware="false"</code>
          to display the literal tokens instead.
        </p>
        <p>Platform aware: <DzKbd :keys="['mod', 'alt', 'k']" /></p>
        <p>Literal: <DzKbd :keys="['mod', 'alt', 'k']" :platform-aware="false" /></p>
        <p>Arrows &amp; specials: <DzKbd :keys="['shift', 'enter']" /> &nbsp; <DzKbd :keys="['alt', 'left']" /></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: () => ({
    components: { DzKbd },
    setup() {
      return { sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as const }
    },
    template: `
      <div class="flex items-center gap-4">
        <div v-for="s in sizes" :key="s" class="flex flex-col items-center gap-2">
          <DzKbd :keys="['mod', 'k']" :size="s" />
          <span class="text-xs text-gray-500">{{ s }}</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Inside a tooltip-like surface
// ---------------------------------------------------------------------------

export const InsideTooltip: Story = {
  name: 'Inside Tooltip',
  render: () => ({
    components: { DzKbd },
    template: `
      <div class="inline-flex items-center gap-2 rounded-[var(--dz-radius-md)]
                  bg-[var(--dz-foreground)] px-3 py-1.5 text-sm text-[var(--dz-background)] shadow-md">
        <span>Search</span>
        <DzKbd :keys="['mod', 'k']" size="sm" />
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
    components: { DzKbd },
    template: `
      <div class="space-y-3">
        <p>Toggle the sidebar with <DzKbd :keys="['mod', 'b']" /></p>
        <p>Quick open: <DzKbd :keys="['mod', 'p']" /></p>
      </div>
    `,
  }),
}
