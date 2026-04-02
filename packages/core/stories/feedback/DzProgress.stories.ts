import type { Meta, StoryObj } from '@storybook/vue3'
import { DzProgress } from '../../src/components/feedback'

/**
 * DzProgress is a visual indicator of task completion.
 *
 * It supports two display variants (`bar`, `circular`), five canonical sizes,
 * six semantic tones, determinate and indeterminate modes, and a slot for
 * custom label content.
 */
const meta = {
  title: 'Core/Feedback/DzProgress',
  component: DzProgress,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['bar', 'circular'],
      description: 'Visual display variant',
      table: { category: 'Appearance', defaultValue: { summary: 'bar' } },
    },
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
    // Behavior
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value (0 to max)',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Maximum progress value',
      table: { category: 'Behavior', defaultValue: { summary: '100' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether progress is indeterminate (unknown completion)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
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
    ariaLabelledby: {
      control: 'text',
      description: 'ID of labelling element',
      table: { category: 'Accessibility' },
    },
    ariaDescribedby: {
      control: 'text',
      description: 'ID of describing element',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'bar',
    size: 'md',
    tone: 'primary',
    value: 60,
    max: 100,
    indeterminate: false,
  },
} satisfies Meta<typeof DzProgress>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzProgress },
    setup() {
      return { args }
    },
    template: '<DzProgress v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery (bar vs circular)
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzProgress },
    template: `
      <div class="flex items-center gap-8">
        <div class="flex-1 space-y-2">
          <p class="text-sm font-medium">Bar</p>
          <DzProgress variant="bar" :value="65" />
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">Circular</p>
          <DzProgress variant="circular" :value="65" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery — Bar
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzProgress },
    template: `
      <div class="space-y-6">
        <p class="text-sm font-medium">Bar Variant</p>
        <div class="space-y-3">
          <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="space-y-1">
            <p class="text-xs text-gray-500 uppercase">{{ size }}</p>
            <DzProgress :size="size" :value="50" />
          </div>
        </div>
        <p class="text-sm font-medium mt-6">Circular Variant</p>
        <div class="flex items-end gap-6">
          <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="flex flex-col items-center gap-1">
            <DzProgress variant="circular" :size="size" :value="50" />
            <p class="text-xs text-gray-500 uppercase">{{ size }}</p>
          </div>
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
    components: { DzProgress },
    template: `
      <div class="space-y-3">
        <div v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="tone" class="space-y-1">
          <p class="text-xs text-gray-500 capitalize">{{ tone }}</p>
          <DzProgress :tone="tone" :value="70" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Indeterminate
// ---------------------------------------------------------------------------

export const Indeterminate: Story = {
  render: () => ({
    components: { DzProgress },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">Bar (indeterminate)</p>
          <DzProgress indeterminate />
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">Circular (indeterminate)</p>
          <DzProgress variant="circular" indeterminate size="lg" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slot (label)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzProgress },
    template: `
      <div class="space-y-4">
        <DzProgress :value="42" size="xl">
          <template #default="{ percentage }">
            <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {{ percentage }}%
            </span>
          </template>
        </DzProgress>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Animated Progress
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzProgress },
    data() {
      return { progress: 0 }
    },
    methods: {
      increment() {
        this.progress = Math.min(this.progress + 10, 100)
      },
      reset() {
        this.progress = 0
      },
    },
    template: `
      <div class="space-y-4">
        <DzProgress :value="progress" tone="success" size="lg" />
        <div class="flex items-center gap-4">
          <button class="text-sm font-medium underline" @click="increment">+10%</button>
          <button class="text-sm font-medium underline" @click="reset">Reset</button>
          <span class="text-sm text-gray-500">{{ progress }}%</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ARIA Attributes',
  render: () => ({
    components: { DzProgress },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzProgress uses role="progressbar" with aria-valuenow, aria-valuemin, and aria-valuemax.
          Indeterminate mode omits aria-valuenow per WAI-ARIA spec.
        </p>
        <div class="space-y-2">
          <label id="upload-label" class="text-sm font-medium">File upload progress</label>
          <DzProgress :value="75" aria-labelledby="upload-label" />
        </div>
        <div class="space-y-2">
          <label id="sync-label" class="text-sm font-medium">Syncing data...</label>
          <DzProgress indeterminate aria-labelledby="sync-label" />
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
    components: { DzProgress },
    template: `
      <div class="space-y-6">
        <DzProgress :value="70" tone="primary" />
        <DzProgress :value="50" tone="success" />
        <div class="flex gap-6">
          <DzProgress variant="circular" :value="70" tone="primary" size="lg" />
          <DzProgress variant="circular" :value="50" tone="danger" size="lg" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: File Upload Progress
// ---------------------------------------------------------------------------

export const RealWorldFileUpload: Story = {
  name: 'Real World: File Upload',
  render: () => ({
    components: { DzProgress },
    template: `
      <div class="space-y-4 max-w-md">
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>document.pdf</span>
            <span class="text-gray-500">100%</span>
          </div>
          <DzProgress :value="100" tone="success" size="sm" />
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>photo.jpg</span>
            <span class="text-gray-500">67%</span>
          </div>
          <DzProgress :value="67" tone="primary" size="sm" />
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>archive.zip</span>
            <span class="text-gray-500">Preparing...</span>
          </div>
          <DzProgress indeterminate size="sm" />
        </div>
      </div>
    `,
  }),
}
