import type { Meta, StoryObj } from '@storybook/vue3'
import { DzImageCard } from '../../src/components/cards'

/**
 * DzImageCard is a card component with a prominent image area at the top.
 *
 * Supports configurable aspect ratio, optional overlay content, and
 * header/body/footer slots for flexible layout beneath the image.
 */
const meta = {
  title: 'Core/Cards/DzImageCard',
  component: DzImageCard,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['elevated', 'outlined'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'elevated' } },
    },
    aspectRatio: {
      control: 'text',
      description: 'Aspect ratio for the image area (e.g., "16/9", "4/3", "1/1")',
      table: { category: 'Appearance', defaultValue: { summary: '16/9' } },
    },
    // Behavior
    src: {
      control: 'text',
      description: 'Image source URL',
      table: { category: 'Behavior' },
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image',
      table: { category: 'Behavior' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    alt: 'Mountain landscape',
    variant: 'elevated',
    aspectRatio: '16/9',
  },
} satisfies Meta<typeof DzImageCard>

export default meta
type Story = StoryObj<typeof meta>

/** Placeholder image URLs for demos */
const images = {
  mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop',
  ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
  forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
}

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzImageCard },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-sm">
        <DzImageCard v-bind="args">
          <h3 class="text-lg font-semibold">Mountain Landscape</h3>
          <p class="text-sm text-gray-500 mt-1">A beautiful view of the Alps.</p>
        </DzImageCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="grid grid-cols-2 gap-6 max-w-2xl">
        <DzImageCard variant="elevated" :src="images.mountain" alt="Mountain">
          <h3 class="text-lg font-semibold">Elevated</h3>
          <p class="text-sm text-gray-500 mt-1">Card with shadow.</p>
        </DzImageCard>
        <DzImageCard variant="outlined" :src="images.city" alt="City">
          <h3 class="text-lg font-semibold">Outlined</h3>
          <p class="text-sm text-gray-500 mt-1">Card with border.</p>
        </DzImageCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Aspect Ratio Gallery
// ---------------------------------------------------------------------------

export const AspectRatios: Story = {
  name: 'Aspect Ratio Gallery',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="grid grid-cols-3 gap-4 max-w-3xl">
        <DzImageCard :src="images.mountain" alt="16:9" aspect-ratio="16/9">
          <p class="text-sm font-medium">16/9</p>
        </DzImageCard>
        <DzImageCard :src="images.city" alt="4:3" aspect-ratio="4/3">
          <p class="text-sm font-medium">4/3</p>
        </DzImageCard>
        <DzImageCard :src="images.ocean" alt="1:1" aspect-ratio="1/1">
          <p class="text-sm font-medium">1/1</p>
        </DzImageCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Header and Footer
// ---------------------------------------------------------------------------

export const WithHeaderAndFooter: Story = {
  name: 'With Header and Footer',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="max-w-sm">
        <DzImageCard :src="images.mountain" alt="Mountain landscape">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-gray-500">Featured</span>
              <span class="text-xs text-gray-400">March 2026</span>
            </div>
          </template>
          <h3 class="text-lg font-semibold">Mountain Adventure</h3>
          <p class="text-sm text-gray-500 mt-1">Explore the breathtaking mountain trails of the Swiss Alps.</p>
          <template #footer>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">By John Doe</span>
              <button class="text-sm font-medium text-blue-600 hover:underline">Read more</button>
            </div>
          </template>
        </DzImageCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Overlay
// ---------------------------------------------------------------------------

export const WithOverlay: Story = {
  name: 'With Image Overlay',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="max-w-sm">
        <DzImageCard :src="images.ocean" alt="Ocean sunset">
          <template #overlay>
            <div class="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div class="text-white">
                <h3 class="text-lg font-bold">Sunset Beach</h3>
                <p class="text-sm opacity-80">Tropical paradise</p>
              </div>
            </div>
          </template>
        </DzImageCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With All Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With All Slots',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="max-w-sm">
        <DzImageCard :src="images.forest" alt="Forest path">
          <template #overlay>
            <div class="absolute top-3 right-3">
              <span class="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium">
                New
              </span>
            </div>
          </template>
          <template #header>
            <span class="text-xs uppercase tracking-wider text-green-600 font-semibold">Nature</span>
          </template>
          <h3 class="text-lg font-semibold">Forest Paths</h3>
          <p class="text-sm text-gray-500 mt-1">Discover hidden trails through ancient forests.</p>
          <template #footer>
            <div class="flex gap-2">
              <button class="flex-1 rounded-md border px-3 py-1.5 text-sm font-medium">Save</button>
              <button class="flex-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white">Explore</button>
            </div>
          </template>
        </DzImageCard>
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
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="grid grid-cols-2 gap-6 max-w-2xl">
        <DzImageCard variant="elevated" :src="images.mountain" alt="Mountain">
          <h3 class="text-lg font-semibold">Elevated</h3>
          <p class="text-sm opacity-60 mt-1">Dark mode card.</p>
        </DzImageCard>
        <DzImageCard variant="outlined" :src="images.city" alt="City">
          <h3 class="text-lg font-semibold">Outlined</h3>
          <p class="text-sm opacity-60 mt-1">Dark mode card.</p>
        </DzImageCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Image Alt Text',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Every DzImageCard requires a descriptive alt attribute for the image.
          Screen readers will announce the alt text. The card itself can receive
          an ID for ARIA references.
        </p>
        <div class="max-w-sm">
          <DzImageCard
            id="product-card-1"
            :src="images.mountain"
            alt="Snow-capped mountain peaks with a clear blue sky, viewed from a hiking trail"
          >
            <h3 class="text-lg font-semibold">Descriptive Alt Text</h3>
            <p class="text-sm text-gray-500 mt-1">The image has a detailed alt attribute for accessibility.</p>
          </DzImageCard>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Product Grid
// ---------------------------------------------------------------------------

export const RealWorldProductGrid: Story = {
  name: 'Real World: Product Grid',
  render: () => ({
    components: { DzImageCard },
    setup() {
      return { images }
    },
    template: `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DzImageCard :src="images.mountain" alt="Mountain hiking boots" aspect-ratio="4/3">
          <template #header>
            <span class="text-xs uppercase tracking-wider text-blue-600 font-semibold">Outdoor</span>
          </template>
          <h3 class="font-semibold">Hiking Boots</h3>
          <p class="text-sm text-gray-500 mt-1">Waterproof and durable.</p>
          <template #footer>
            <div class="flex items-center justify-between">
              <span class="font-bold">$149.99</span>
              <button class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">Add to Cart</button>
            </div>
          </template>
        </DzImageCard>
        <DzImageCard :src="images.forest" alt="Trail running shoes" aspect-ratio="4/3">
          <template #header>
            <span class="text-xs uppercase tracking-wider text-green-600 font-semibold">Running</span>
          </template>
          <h3 class="font-semibold">Trail Runners</h3>
          <p class="text-sm text-gray-500 mt-1">Lightweight and grippy.</p>
          <template #footer>
            <div class="flex items-center justify-between">
              <span class="font-bold">$129.99</span>
              <button class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">Add to Cart</button>
            </div>
          </template>
        </DzImageCard>
        <DzImageCard :src="images.ocean" alt="Beach sandals" aspect-ratio="4/3">
          <template #header>
            <span class="text-xs uppercase tracking-wider text-orange-600 font-semibold">Casual</span>
          </template>
          <h3 class="font-semibold">Beach Sandals</h3>
          <p class="text-sm text-gray-500 mt-1">Perfect for summer.</p>
          <template #footer>
            <div class="flex items-center justify-between">
              <span class="font-bold">$49.99</span>
              <button class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">Add to Cart</button>
            </div>
          </template>
        </DzImageCard>
      </div>
    `,
  }),
}
