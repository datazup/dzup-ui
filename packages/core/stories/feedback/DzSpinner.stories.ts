import type { Meta, StoryObj } from '@storybook/vue3'
import { DzSpinner } from '../../src/components/feedback'

/**
 * DzSpinner is a loading indicator with a rotating animation.
 *
 * It supports five canonical sizes (`xs` through `xl`), six semantic tones,
 * and includes a visually hidden label for screen readers.
 */
const meta = {
  title: 'Core/Feedback/DzSpinner',
  component: DzSpinner,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    // Accessibility
    label: {
      control: 'text',
      description: 'Screen reader label (visually hidden)',
      table: { category: 'Accessibility', defaultValue: { summary: 'Loading' } },
    },
  },
  args: {
    size: 'md',
    tone: 'primary',
    label: 'Loading',
  },
} satisfies Meta<typeof DzSpinner>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSpinner },
    setup() {
      return { args }
    },
    template: '<DzSpinner v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzSpinner },
    template: `
      <div class="flex items-end gap-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="flex flex-col items-center gap-2">
          <DzSpinner :size="size" />
          <span class="text-xs text-gray-500 uppercase">{{ size }}</span>
        </div>
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
    components: { DzSpinner },
    template: `
      <div class="flex flex-wrap gap-6 items-center">
        <div v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="tone" class="flex flex-col items-center gap-2">
          <DzSpinner :tone="tone" size="lg" />
          <span class="text-xs text-gray-500 capitalize">{{ tone }}</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Custom Label
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Label',
  render: () => ({
    components: { DzSpinner },
    template: `
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <DzSpinner size="sm" label="Saving changes" />
          <span class="text-sm">Saving...</span>
        </div>
        <div class="flex items-center gap-2">
          <DzSpinner size="sm" tone="success" label="Processing payment" />
          <span class="text-sm">Processing...</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Toggle Loading
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSpinner },
    data() {
      return { loading: true }
    },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <button class="text-sm font-medium underline" @click="loading = !loading">
            {{ loading ? 'Stop loading' : 'Start loading' }}
          </button>
        </div>
        <div class="h-16 flex items-center">
          <DzSpinner v-if="loading" size="lg" />
          <span v-else class="text-sm text-gray-500">Content loaded.</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Screen Reader Labels',
  render: () => ({
    components: { DzSpinner },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzSpinner uses role="status" and a visually hidden label for screen readers.
          The label defaults to "Loading" but can be customized for context.
        </p>
        <div class="flex gap-6">
          <DzSpinner label="Loading user data" />
          <DzSpinner label="Fetching search results" tone="info" />
          <DzSpinner label="Uploading file" tone="success" />
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
    components: { DzSpinner },
    template: `
      <div class="flex gap-6 items-center">
        <DzSpinner tone="primary" size="lg" />
        <DzSpinner tone="success" size="lg" />
        <DzSpinner tone="danger" size="lg" />
        <DzSpinner tone="info" size="lg" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Loading Button Pattern
// ---------------------------------------------------------------------------

export const RealWorldLoadingButton: Story = {
  name: 'Real World: Inline Loading',
  render: () => ({
    components: { DzSpinner },
    template: `
      <div class="space-y-6">
        <div class="flex items-center gap-2 p-3 border rounded max-w-xs">
          <DzSpinner size="sm" />
          <span class="text-sm">Loading dashboard...</span>
        </div>
        <div class="flex items-center justify-center p-8 border rounded max-w-md">
          <div class="flex flex-col items-center gap-3">
            <DzSpinner size="xl" tone="primary" />
            <span class="text-sm text-gray-500">Preparing your workspace</span>
          </div>
        </div>
      </div>
    `,
  }),
}
