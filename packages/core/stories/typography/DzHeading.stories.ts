import type { Meta, StoryObj } from '@storybook/vue3'
import { DzHeading } from '../../src/components/typography'

/**
 * DzHeading renders semantic heading elements (`h1` through `h6`) with independent visual sizing.
 *
 * The `level` prop controls the HTML element (semantic), while `size` controls the visual appearance.
 * When `size` is omitted, it defaults based on the heading level.
 */
const meta = {
  title: 'Core/Typography/DzHeading',
  component: DzHeading,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    level: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'Semantic heading level (1-6). Determines the HTML heading element.',
      table: { category: 'Appearance', defaultValue: { summary: '2' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'Visual size, independent of semantic level',
      table: { category: 'Appearance' },
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight override',
      table: { category: 'Appearance' },
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment',
      table: { category: 'Appearance' },
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis when overflowing',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Accessible identifier',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    level: 2,
    truncate: false,
  },
} satisfies Meta<typeof DzHeading>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzHeading },
    setup() {
      return { args }
    },
    template: '<DzHeading v-bind="args">Section Heading</DzHeading>',
  }),
}

// ---------------------------------------------------------------------------
// All Levels (h1-h6)
// ---------------------------------------------------------------------------

export const AllLevels: Story = {
  name: 'All Heading Levels (h1-h6)',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-4">
        <DzHeading :level="1">Heading Level 1</DzHeading>
        <DzHeading :level="2">Heading Level 2</DzHeading>
        <DzHeading :level="3">Heading Level 3</DzHeading>
        <DzHeading :level="4">Heading Level 4</DzHeading>
        <DzHeading :level="5">Heading Level 5</DzHeading>
        <DzHeading :level="6">Heading Level 6</DzHeading>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-3">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']" :key="size" class="flex items-baseline gap-4">
          <span class="text-xs font-mono w-10 text-gray-400 shrink-0">{{ size }}</span>
          <DzHeading :level="3" :size="size">The quick brown fox</DzHeading>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Weights
// ---------------------------------------------------------------------------

export const AllWeights: Story = {
  name: 'Weight Gallery',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-3">
        <div v-for="weight in ['light', 'normal', 'medium', 'semibold', 'bold']" :key="weight" class="flex items-baseline gap-4">
          <span class="text-xs font-mono w-20 text-gray-400 shrink-0">{{ weight }}</span>
          <DzHeading :level="3" size="xl" :weight="weight">The quick brown fox</DzHeading>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Alignment
// ---------------------------------------------------------------------------

export const Alignment: Story = {
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-4 max-w-lg">
        <DzHeading :level="3" align="left">Left Aligned</DzHeading>
        <DzHeading :level="3" align="center">Center Aligned</DzHeading>
        <DzHeading :level="3" align="right">Right Aligned</DzHeading>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Truncation
// ---------------------------------------------------------------------------

export const Truncation: Story = {
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-4">
        <div class="max-w-xs">
          <DzHeading :level="3" truncate>
            This is a very long heading that will be truncated with an ellipsis because it overflows its container
          </DzHeading>
        </div>
        <div class="max-w-xs">
          <DzHeading :level="3">
            This is a very long heading that will NOT be truncated and will wrap to multiple lines naturally
          </DzHeading>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Independent Size and Level
// ---------------------------------------------------------------------------

export const SizeVsLevel: Story = {
  name: 'Size vs Level Independence',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Semantic level and visual size are independent. An h6 can look like an h1.</p>
        <DzHeading :level="6" size="4xl">h6 styled as 4xl</DzHeading>
        <DzHeading :level="1" size="xs">h1 styled as xs</DzHeading>
        <DzHeading :level="3" size="2xl">h3 styled as 2xl (explicit)</DzHeading>
        <DzHeading :level="3">h3 with default size (2xl)</DzHeading>
      </div>
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
    components: { DzHeading },
    template: `
      <div class="space-y-3">
        <DzHeading :level="1">Page Title</DzHeading>
        <DzHeading :level="2">Section Heading</DzHeading>
        <DzHeading :level="3">Subsection</DzHeading>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Structure',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Proper heading hierarchy is critical for screen readers. Use consecutive levels
          without skipping (h1 > h2 > h3, not h1 > h3).
        </p>
        <article>
          <DzHeading :level="1" id="main-title">Page Title (h1)</DzHeading>
          <section class="ml-4 mt-4 space-y-3">
            <DzHeading :level="2" id="section-1">First Section (h2)</DzHeading>
            <section class="ml-4 space-y-2">
              <DzHeading :level="3" id="subsection-1a">Subsection A (h3)</DzHeading>
              <DzHeading :level="3" id="subsection-1b">Subsection B (h3)</DzHeading>
            </section>
          </section>
          <section class="ml-4 mt-4">
            <DzHeading :level="2" id="section-2">Second Section (h2)</DzHeading>
          </section>
        </article>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Page Header
// ---------------------------------------------------------------------------

export const RealWorldPageHeader: Story = {
  name: 'Real World: Page Header',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="border-b pb-4 space-y-1">
        <DzHeading :level="1" size="2xl">Dashboard</DzHeading>
        <p class="text-sm text-gray-500">Welcome back. Here is your overview.</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Card Headings
// ---------------------------------------------------------------------------

export const RealWorldCardHeadings: Story = {
  name: 'Real World: Card Headings',
  render: () => ({
    components: { DzHeading },
    template: `
      <div class="space-y-6">
        <div class="border rounded-lg p-4">
          <DzHeading :level="3" size="lg" weight="semibold">Recent Activity</DzHeading>
          <p class="text-sm text-gray-500 mt-2">Your latest actions and updates.</p>
        </div>
        <div class="border rounded-lg p-4">
          <DzHeading :level="3" size="lg" weight="semibold">Quick Stats</DzHeading>
          <p class="text-sm text-gray-500 mt-2">Performance metrics at a glance.</p>
        </div>
      </div>
    `,
  }),
}
