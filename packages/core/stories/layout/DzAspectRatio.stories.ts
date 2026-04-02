import type { Meta, StoryObj } from '@storybook/vue3'
import { DzAspectRatio } from '../../src/components/layout'

/**
 * DzAspectRatio maintains a consistent aspect ratio for its content.
 *
 * Uses the CSS `aspect-ratio` property to constrain content dimensions.
 * Common use cases include image containers, video embeds, and map areas.
 */
const meta = {
  title: 'Core/Layout/DzAspectRatio',
  component: DzAspectRatio,
  tags: ['autodocs'],
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
          <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-medium">
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
          <p class="text-xs text-gray-500 mb-2">{{ label }} ({{ value.toFixed(2) }})</p>
          <DzAspectRatio :ratio="value">
            <div class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-800 text-sm font-medium border border-blue-200">
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
          <div class="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2 mx-auto">
                <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p class="text-white/60 text-sm">Video placeholder (16:9)</p>
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
          <div class="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
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
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzAspectRatio },
    template: `
      <div class="max-w-sm">
        <DzAspectRatio :ratio="16/9">
          <div class="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 text-sm">
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
        <div v-for="i in 6" :key="i" class="border rounded-lg overflow-hidden">
          <DzAspectRatio :ratio="4/3">
            <div class="w-full h-full bg-gradient-to-br"
              :class="[
                'from-blue-200 to-blue-300',
                'from-green-200 to-green-300',
                'from-amber-200 to-amber-300',
                'from-purple-200 to-purple-300',
                'from-pink-200 to-pink-300',
                'from-cyan-200 to-cyan-300',
              ][i - 1]"
              :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center' }">
              <span class="text-sm font-medium text-gray-700">Photo {{ i }}</span>
            </div>
          </DzAspectRatio>
          <div class="p-3">
            <p class="text-sm font-medium">Image Title {{ i }}</p>
            <p class="text-xs text-gray-500">Description text</p>
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
          <div class="w-full h-full bg-green-100 border-2 border-green-200 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <svg class="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm text-green-700">Map placeholder (2:1 ratio)</p>
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
        <p class="text-sm text-gray-500">
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
