import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzEmoji } from '../../src/components/media'
import { darkModeDecorator } from '../_shared'

/**
 * DzEmoji renders an emoji glyph with consistent sizing and correct
 * accessibility semantics.
 *
 * Raw emoji characters are announced inconsistently by screen readers. DzEmoji
 * wraps them so they are either **meaningful** (`role="img"` + `aria-label`,
 * when you pass `label`) or explicitly **decorative** (`aria-hidden="true"`,
 * the default — use next to visible text that already carries the meaning).
 */
const meta = {
  title: 'Core/Media/DzEmoji',
  component: DzEmoji,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    emoji: {
      control: 'text',
      description: 'The emoji character(s) to render',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Emoji size (font-size scale)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Accessibility
    label: {
      control: 'text',
      description: 'Accessible label. When provided, the emoji is treated as meaningful (not decorative).',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Accessible identifier',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    emoji: '🎉',
    size: 'md',
    label: 'Party popper',
  },
} satisfies Meta<typeof DzEmoji>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {}

// ---------------------------------------------------------------------------
// All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzEmoji },
    template: `
      <div class="flex items-end gap-6">
        <div class="text-center">
          <DzEmoji emoji="🚀" size="xs" label="Rocket" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">xs</p>
        </div>
        <div class="text-center">
          <DzEmoji emoji="🚀" size="sm" label="Rocket" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">sm</p>
        </div>
        <div class="text-center">
          <DzEmoji emoji="🚀" size="md" label="Rocket" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">md</p>
        </div>
        <div class="text-center">
          <DzEmoji emoji="🚀" size="lg" label="Rocket" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">lg</p>
        </div>
        <div class="text-center">
          <DzEmoji emoji="🚀" size="xl" label="Rocket" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">xl</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Emoji Gallery
// ---------------------------------------------------------------------------

export const EmojiGallery: Story = {
  name: 'Emoji Gallery (Sample)',
  render: () => ({
    components: { DzEmoji },
    setup() {
      const emojis: [string, string][] = [
        ['🎉', 'Party popper'],
        ['❤️', 'Red heart'],
        ['👍', 'Thumbs up'],
        ['🔥', 'Fire'],
        ['✅', 'Check mark'],
        ['🚀', 'Rocket'],
        ['😂', 'Face with tears of joy'],
        ['🤔', 'Thinking face'],
        ['🌟', 'Glowing star'],
        ['🎯', 'Direct hit'],
        ['💡', 'Light bulb'],
        ['👨‍👩‍👧‍👦', 'Family'],
      ]
      return { emojis }
    },
    template: `
      <div class="grid grid-cols-6 gap-6">
        <div class="text-center" v-for="[emoji, label] in emojis" :key="label">
          <DzEmoji :emoji="emoji" :label="label" size="lg" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">{{ label }}</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Decorative vs Meaningful
// ---------------------------------------------------------------------------

export const AccessibleEmoji: Story = {
  name: 'Accessibility: Decorative vs Meaningful',
  render: () => ({
    components: { DzEmoji },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">Decorative (default)</p>
          <p class="text-xs text-[var(--dz-muted-foreground)]">aria-hidden="true", no role. Used next to visible text.</p>
          <p class="flex items-center gap-2">
            <DzEmoji emoji="✅" size="sm" />
            <span>Task complete</span>
          </p>
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">Meaningful (with label)</p>
          <p class="text-xs text-[var(--dz-muted-foreground)]">role="img", aria-label set. Used standalone where the emoji conveys information.</p>
          <DzEmoji emoji="🎉" label="Celebration" size="lg" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Meaningful emoji: exposed to the a11y tree as role="img" with its label.
    const meaningful = canvas.getByRole('img', { name: 'Celebration' })
    await expect(meaningful).toHaveTextContent('🎉')

    // Decorative emoji is hidden from assistive tech (aria-hidden, no role).
    const decorative = canvasElement.querySelector('span[aria-hidden="true"]')
    await expect(decorative).toBeInTheDocument()
    await expect(decorative).not.toHaveAttribute('role')
  },
}

// ---------------------------------------------------------------------------
// Real World: Inline with Text
// ---------------------------------------------------------------------------

export const RealWorldInline: Story = {
  name: 'Real World: Inline Content',
  render: () => ({
    components: { DzEmoji },
    template: `
      <div class="max-w-md space-y-3 text-sm">
        <p>
          Deployment finished <DzEmoji emoji="🚀" /> — all checks passed <DzEmoji emoji="✅" />
        </p>
        <div class="flex items-center gap-2 rounded-lg border border-[var(--dz-border)] p-3">
          <DzEmoji emoji="⚠️" label="Warning" size="md" />
          <span>Your trial ends in 3 days.</span>
        </div>
        <div class="flex items-center gap-2 rounded-lg bg-[var(--dz-muted)] p-3">
          <DzEmoji emoji="🎁" label="Gift" size="lg" />
          <div>
            <p class="font-medium">You unlocked a reward!</p>
            <p class="text-[var(--dz-muted-foreground)]">Claim it before it expires.</p>
          </div>
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
    components: { DzEmoji },
    template: `
      <div class="flex gap-6">
        <DzEmoji emoji="🌙" label="Moon" size="lg" />
        <DzEmoji emoji="⭐" label="Star" size="lg" />
        <DzEmoji emoji="🔥" label="Fire" size="lg" />
        <DzEmoji emoji="💜" label="Purple heart" size="lg" />
      </div>
    `,
  }),
}
