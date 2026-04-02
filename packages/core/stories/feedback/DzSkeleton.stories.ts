import type { Meta, StoryObj } from '@storybook/vue3'
import { DzSkeleton } from '../../src/components/feedback'

/**
 * DzSkeleton is a placeholder loading state for content areas.
 *
 * It supports three shape variants (`text`, `circular`, `rectangular`),
 * custom dimensions, multi-line text mode, and toggle-able pulse animation.
 */
const meta = {
  title: 'Core/Feedback/DzSkeleton',
  component: DzSkeleton,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Shape variant of the skeleton',
      table: { category: 'Appearance', defaultValue: { summary: 'text' } },
    },
    width: {
      control: 'text',
      description: 'Custom width (CSS value)',
      table: { category: 'Appearance' },
    },
    height: {
      control: 'text',
      description: 'Custom height (CSS value)',
      table: { category: 'Appearance' },
    },
    lines: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of text lines (only for variant="text")',
      table: { category: 'Appearance', defaultValue: { summary: '1' } },
    },
    // Behavior
    animate: {
      control: 'boolean',
      description: 'Whether to animate the skeleton',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
  },
  args: {
    variant: 'text',
    lines: 1,
    animate: true,
  },
} satisfies Meta<typeof DzSkeleton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSkeleton },
    setup() {
      return { args }
    },
    template: '<DzSkeleton v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">Text</p>
          <DzSkeleton variant="text" />
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">Circular</p>
          <DzSkeleton variant="circular" width="48px" height="48px" />
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">Rectangular</p>
          <DzSkeleton variant="rectangular" width="100%" height="120px" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multi-line Text
// ---------------------------------------------------------------------------

export const MultilineText: Story = {
  name: 'Multi-line Text',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-6 max-w-md">
        <div class="space-y-2">
          <p class="text-sm font-medium">1 line</p>
          <DzSkeleton variant="text" :lines="1" />
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">3 lines (last line shorter)</p>
          <DzSkeleton variant="text" :lines="3" />
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">5 lines</p>
          <DzSkeleton variant="text" :lines="5" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Dimensions
// ---------------------------------------------------------------------------

export const CustomDimensions: Story = {
  name: 'Custom Dimensions',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-4">
        <DzSkeleton variant="rectangular" width="200px" height="40px" />
        <DzSkeleton variant="rectangular" width="100%" height="80px" />
        <div class="flex gap-4">
          <DzSkeleton variant="circular" width="32px" height="32px" />
          <DzSkeleton variant="circular" width="48px" height="48px" />
          <DzSkeleton variant="circular" width="64px" height="64px" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Animation Toggle
// ---------------------------------------------------------------------------

export const NoAnimation: Story = {
  name: 'Animation Disabled',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-4 max-w-md">
        <p class="text-sm text-gray-500">Animation can be disabled for static placeholders or users with reduced motion preferences.</p>
        <DzSkeleton variant="text" :lines="3" :animate="false" />
        <DzSkeleton variant="rectangular" width="100%" height="80px" :animate="false" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Toggle Loading
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSkeleton },
    data() {
      return { loaded: false }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <button class="text-sm font-medium underline" @click="loaded = !loaded">
          {{ loaded ? 'Show skeleton' : 'Show content' }}
        </button>
        <div class="flex gap-3 items-start">
          <template v-if="!loaded">
            <DzSkeleton variant="circular" width="40px" height="40px" />
            <div class="flex-1 space-y-2">
              <DzSkeleton variant="text" width="60%" />
              <DzSkeleton variant="text" :lines="2" />
            </div>
          </template>
          <template v-else>
            <div class="w-10 h-10 rounded-full bg-blue-500 shrink-0" />
            <div>
              <p class="font-medium text-sm">Jane Doe</p>
              <p class="text-sm text-gray-500">Software engineer at Acme Corp. Loves building component libraries and writing documentation.</p>
            </div>
          </template>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: aria-hidden',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzSkeleton sets aria-hidden="true" on all skeleton elements, since they
          are purely decorative placeholders. Screen readers skip them entirely.
          Use role="status" on a parent container with a loading message for
          screen reader users.
        </p>
        <div role="status" aria-label="Loading user profile">
          <div class="flex gap-3 items-start max-w-sm">
            <DzSkeleton variant="circular" width="40px" height="40px" />
            <div class="flex-1 space-y-2">
              <DzSkeleton variant="text" width="60%" />
              <DzSkeleton variant="text" :lines="2" />
            </div>
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
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-4 max-w-sm">
        <div class="flex gap-3 items-start">
          <DzSkeleton variant="circular" width="40px" height="40px" />
          <div class="flex-1 space-y-2">
            <DzSkeleton variant="text" width="60%" />
            <DzSkeleton variant="text" :lines="2" />
          </div>
        </div>
        <DzSkeleton variant="rectangular" width="100%" height="120px" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Card Loading State
// ---------------------------------------------------------------------------

export const RealWorldCardSkeleton: Story = {
  name: 'Real World: Card Loading',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="grid grid-cols-3 gap-4 max-w-2xl">
        <div v-for="i in 3" :key="i" class="border rounded-lg p-4 space-y-3">
          <DzSkeleton variant="rectangular" width="100%" height="120px" />
          <DzSkeleton variant="text" width="70%" />
          <DzSkeleton variant="text" :lines="2" />
          <div class="flex gap-2">
            <DzSkeleton variant="rectangular" width="60px" height="24px" />
            <DzSkeleton variant="rectangular" width="60px" height="24px" />
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: List Loading State
// ---------------------------------------------------------------------------

export const RealWorldListSkeleton: Story = {
  name: 'Real World: List Loading',
  render: () => ({
    components: { DzSkeleton },
    template: `
      <div class="space-y-4 max-w-md">
        <div v-for="i in 4" :key="i" class="flex gap-3 items-center p-3 border rounded">
          <DzSkeleton variant="circular" width="36px" height="36px" />
          <div class="flex-1 space-y-1.5">
            <DzSkeleton variant="text" width="40%" />
            <DzSkeleton variant="text" width="80%" />
          </div>
          <DzSkeleton variant="rectangular" width="48px" height="20px" />
        </div>
      </div>
    `,
  }),
}
