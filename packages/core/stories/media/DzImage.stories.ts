import type { Meta, StoryObj } from '@storybook/vue3'
import { DzImage } from '../../src/components/media'

/**
 * DzImage is an enhanced image component with built-in loading placeholder,
 * error fallback, lazy loading, object-fit control, and aspect ratio support.
 *
 * It exposes `loading` and `error` slots for custom placeholder content and
 * emits `load` / `error` events for state tracking.
 */
const meta = {
  title: 'Core/Media/DzImage',
  component: DzImage,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    src: {
      control: 'text',
      description: 'Image source URL',
      table: { category: 'Appearance' },
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image (required for accessibility)',
      table: { category: 'Appearance' },
    },
    fallback: {
      control: 'text',
      description: 'Fallback image URL displayed when the primary image fails',
      table: { category: 'Appearance' },
    },
    fit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none'],
      description: 'CSS object-fit behavior',
      table: { category: 'Appearance', defaultValue: { summary: 'cover' } },
    },
    aspectRatio: {
      control: 'text',
      description: 'CSS aspect ratio (e.g. "16/9", "1/1")',
      table: { category: 'Appearance' },
    },
    // Behavior
    lazy: {
      control: 'boolean',
      description: 'Whether to lazy-load the image via loading="lazy"',
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
    src: 'https://picsum.photos/seed/dzip/600/400',
    alt: 'Sample landscape photo',
    fit: 'cover',
    lazy: false,
  },
} satisfies Meta<typeof DzImage>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzImage },
    setup() {
      return { args }
    },
    template: '<div class="w-80"><DzImage v-bind="args" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// Object Fit Gallery
// ---------------------------------------------------------------------------

export const AllFitModes: Story = {
  name: 'Object Fit Gallery',
  render: () => ({
    components: { DzImage },
    template: `
      <div class="grid grid-cols-2 gap-6 max-w-2xl">
        <div v-for="fit in ['cover', 'contain', 'fill', 'none']" :key="fit">
          <p class="text-sm font-medium mb-2 capitalize">{{ fit }}</p>
          <div class="w-full h-48 border rounded overflow-hidden">
            <DzImage
              src="https://picsum.photos/seed/fit/600/400"
              :alt="'Fit mode: ' + fit"
              :fit="fit"
              aspect-ratio="16/9"
            />
          </div>
        </div>
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
    components: { DzImage },
    template: `
      <div class="flex flex-wrap gap-6 items-start">
        <div v-for="ratio in ['1/1', '4/3', '16/9', '21/9']" :key="ratio">
          <p class="text-sm font-medium mb-2">{{ ratio }}</p>
          <div class="w-48">
            <DzImage
              src="https://picsum.photos/seed/ratio/600/600"
              :alt="'Aspect ratio ' + ratio"
              :aspect-ratio="ratio"
            />
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Lazy Loading
// ---------------------------------------------------------------------------

export const LazyLoading: Story = {
  name: 'Lazy Loading',
  args: {
    lazy: true,
    src: 'https://picsum.photos/seed/lazy/600/400',
    alt: 'Lazy loaded image',
  },
  render: args => ({
    components: { DzImage },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          This image uses <code>loading="lazy"</code>. Scroll down to trigger loading.
        </p>
        <div class="w-80">
          <DzImage v-bind="args" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Fallback
// ---------------------------------------------------------------------------

export const WithFallback: Story = {
  name: 'With Fallback Image',
  args: {
    src: 'https://invalid-url.test/broken.jpg',
    fallback: 'https://picsum.photos/seed/fallback/600/400',
    alt: 'Image with fallback',
  },
  render: args => ({
    components: { DzImage },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Primary <code>src</code> is invalid; the <code>fallback</code> URL is displayed instead.
        </p>
        <div class="w-80">
          <DzImage v-bind="args" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Error State (No Fallback)
// ---------------------------------------------------------------------------

export const ErrorState: Story = {
  name: 'Error State (No Fallback)',
  args: {
    src: 'https://invalid-url.test/broken.jpg',
    alt: 'Broken image with no fallback',
  },
  render: args => ({
    components: { DzImage },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Both primary and fallback fail, so the error slot content is rendered.
        </p>
        <div class="w-80 h-48">
          <DzImage v-bind="args" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots: Custom Loading and Error
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots: Custom Loading and Error',
  render: () => ({
    components: { DzImage },
    template: `
      <div class="flex gap-6">
        <div class="w-60">
          <p class="text-sm font-medium mb-2">Custom Error Slot</p>
          <DzImage src="https://invalid-url.test/broken.jpg" alt="Custom error">
            <template #error>
              <div class="flex flex-col items-center justify-center gap-2 text-gray-400 h-full">
                <svg class="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
                </svg>
                <span class="text-sm">Image unavailable</span>
              </div>
            </template>
          </DzImage>
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
    components: { DzImage },
    template: `
      <div class="flex gap-6">
        <div class="w-60">
          <DzImage
            src="https://picsum.photos/seed/dark/600/400"
            alt="Dark mode image"
            aspect-ratio="16/9"
          />
        </div>
        <div class="w-60 h-40">
          <DzImage src="https://invalid-url.test/broken.jpg" alt="Dark error state" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Load / Error Events
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzImage },
    data() {
      return {
        status: 'idle' as string,
        src: 'https://picsum.photos/seed/interactive/600/400',
      }
    },
    methods: {
      onLoad() {
        this.status = 'loaded'
      },
      onError() {
        this.status = 'error'
      },
      breakImage() {
        this.src = `https://invalid-url.test/broken-${Date.now()}.jpg`
        this.status = 'loading'
      },
      fixImage() {
        this.src = `https://picsum.photos/seed/interactive-${Date.now()}/600/400`
        this.status = 'loading'
      },
    },
    template: `
      <div class="space-y-4">
        <div class="w-80">
          <DzImage :src="src" alt="Interactive demo" @load="onLoad" @error="onError" />
        </div>
        <p class="text-sm text-gray-500">Status: <strong>{{ status }}</strong></p>
        <div class="flex gap-2">
          <button
            class="px-3 py-1 text-sm rounded border"
            @click="breakImage"
          >
            Break Image
          </button>
          <button
            class="px-3 py-1 text-sm rounded border"
            @click="fixImage"
          >
            Fix Image
          </button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility',
  render: () => ({
    components: { DzImage },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzImage requires an <code>alt</code> prop. The root element supports
          <code>aria-label</code> and sets <code>data-state</code> to
          "loading", "loaded", or "error" for styling hooks.
        </p>
        <div class="w-80">
          <DzImage
            src="https://picsum.photos/seed/a11y/600/400"
            alt="A scenic mountain landscape at sunset"
            aria-label="Scenic mountain landscape photo"
          />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Photo Card
// ---------------------------------------------------------------------------

export const RealWorldPhotoCard: Story = {
  name: 'Real World: Photo Card',
  render: () => ({
    components: { DzImage },
    template: `
      <div class="max-w-sm rounded-lg overflow-hidden shadow-md">
        <DzImage
          src="https://picsum.photos/seed/card/600/400"
          alt="Mountain cabin"
          aspect-ratio="16/9"
        />
        <div class="p-4 space-y-1">
          <h3 class="font-semibold text-sm">Mountain Cabin Retreat</h3>
          <p class="text-xs text-gray-500">A cozy getaway nestled in the Rockies.</p>
        </div>
      </div>
    `,
  }),
}
