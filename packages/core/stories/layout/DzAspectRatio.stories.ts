import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DzAspectRatio } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * DzAspectRatio maintains a consistent aspect ratio for its content.
 *
 * Uses the CSS `aspect-ratio` property to constrain content dimensions.
 * Common use cases include image containers, video embeds, and map areas.
 */
const meta = {
  title: 'Core/Layout/DzAspectRatio',
  component: DzAspectRatio,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    ratio: {
      control: { type: 'number', min: 0.1, max: 5, step: 0.1 },
      description: 'Aspect ratio as a number (width / height). Default: 1',
      table: { category: 'Appearance', defaultValue: { summary: '1' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    ratio: 16 / 9,
  },
} satisfies Meta<typeof DzAspectRatio>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzAspectRatio },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-sm">
        <DzAspectRatio v-bind="args">
          <div class="w-full h-full bg-gradient-to-br from-[var(--dz-colors-blue-400)] to-[var(--dz-colors-purple-500)] rounded-lg flex items-center justify-center text-[var(--dz-colors-neutral-50)] font-medium">
            16:9
          </div>
        </DzAspectRatio>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Ratio Gallery
// ---------------------------------------------------------------------------

export const AllRatios: Story = {
  name: 'Ratio Gallery',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="grid grid-cols-3 gap-6">
        <div v-for="{ label, value } in [
          { label: '1:1 (Square)', value: 1 },
          { label: '4:3', value: 4/3 },
          { label: '16:9', value: 16/9 },
          { label: '21:9 (Ultra-wide)', value: 21/9 },
          { label: '3:4 (Portrait)', value: 3/4 },
          { label: '2:3', value: 2/3 },
        ]" :key="label">
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">{{ label }} ({{ value.toFixed(2) }})</p>
          <DzAspectRatio :ratio="value">
            <div class="w-full h-full bg-gradient-to-br from-[var(--dz-colors-blue-100)] to-[var(--dz-colors-blue-200)] rounded-lg flex items-center justify-center text-[var(--dz-primary-muted-foreground)] text-sm font-medium border border-[var(--dz-primary-border)]">
              {{ label }}
            </div>
          </DzAspectRatio>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Image
// ---------------------------------------------------------------------------

export const WithImage: Story = {
  name: 'With Image Content',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="max-w-md">
        <DzAspectRatio :ratio="16/9">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=360&fit=crop"
            alt="Landscape"
            class="w-full h-full object-cover rounded-lg"
          />
        </DzAspectRatio>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Video Embed Placeholder
// ---------------------------------------------------------------------------

export const VideoEmbed: Story = {
  name: 'Video Embed Placeholder',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="max-w-lg">
        <DzAspectRatio :ratio="16/9">
          <div class="w-full h-full bg-[var(--dz-colors-neutral-900)] rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-[var(--dz-colors-neutral-700)] flex items-center justify-center mb-2 mx-auto">
                <svg class="w-8 h-8 text-[var(--dz-colors-neutral-50)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p class="text-[var(--dz-colors-neutral-400)] text-sm">Video placeholder (16:9)</p>
            </div>
          </div>
        </DzAspectRatio>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Square Avatar
// ---------------------------------------------------------------------------

export const SquareAspect: Story = {
  name: 'Square (1:1)',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="w-32">
        <DzAspectRatio :ratio="1">
          <div class="w-full h-full bg-gradient-to-br from-[var(--dz-colors-green-400)] to-[var(--dz-colors-emerald-500)] rounded-full flex items-center justify-center text-[var(--dz-colors-neutral-50)] text-xl font-bold">
            JD
          </div>
        </DzAspectRatio>
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
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="max-w-sm">
        <DzAspectRatio :ratio="16/9">
          <div class="w-full h-full bg-[var(--dz-colors-neutral-700)] rounded-lg flex items-center justify-center text-[var(--dz-colors-neutral-300)] text-sm">
            16:9 in dark mode
          </div>
        </DzAspectRatio>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Image Card Grid
// ---------------------------------------------------------------------------

export const RealWorldImageCardGrid: Story = {
  name: 'Real World: Image Card Grid',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="grid grid-cols-3 gap-4 max-w-2xl">
        <div v-for="i in 6" :key="i" class="border border-[var(--dz-border)] rounded-lg overflow-hidden">
          <DzAspectRatio :ratio="4/3">
            <div class="w-full h-full bg-gradient-to-br"
              :class="[
                'from-[var(--dz-colors-blue-200)] to-[var(--dz-colors-blue-300)]',
                'from-[var(--dz-colors-green-200)] to-[var(--dz-colors-green-300)]',
                'from-[var(--dz-colors-amber-200)] to-[var(--dz-colors-amber-300)]',
                'from-[var(--dz-colors-purple-200)] to-[var(--dz-colors-purple-300)]',
                'from-[var(--dz-colors-pink-200)] to-[var(--dz-colors-pink-300)]',
                'from-[var(--dz-colors-cyan-200)] to-[var(--dz-colors-cyan-300)]',
              ][i - 1]"
              :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center' }">
              <span class="text-sm font-medium text-[var(--dz-foreground)]">Photo {{ i }}</span>
            </div>
          </DzAspectRatio>
          <div class="p-3">
            <p class="text-sm font-medium">Image Title {{ i }}</p>
            <p class="text-xs text-[var(--dz-muted-foreground)]">Description text</p>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Map Container
// ---------------------------------------------------------------------------

export const RealWorldMapContainer: Story = {
  name: 'Real World: Map Container',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="max-w-lg">
        <DzAspectRatio :ratio="2">
          <div class="w-full h-full bg-[var(--dz-success-muted)] border-2 border-[var(--dz-success-border)] rounded-lg flex items-center justify-center">
            <div class="text-center">
              <svg class="w-8 h-8 text-[var(--dz-success-muted-foreground)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm text-[var(--dz-success-muted-foreground)]">Map placeholder (2:1 ratio)</p>
            </div>
          </div>
        </DzAspectRatio>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Content Description',
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          DzAspectRatio is a layout wrapper. It does not add semantic
          meaning -- ensure the content inside has appropriate alt text,
          ARIA labels, or roles.
        </p>
        <div class="max-w-sm">
          <DzAspectRatio :ratio="16/9" id="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=360&fit=crop"
              alt="Mountain landscape at sunset with a lake in the foreground"
              class="w-full h-full object-cover rounded-lg"
            />
          </DzAspectRatio>
        </div>
      </div>
    `,
  }),
}
