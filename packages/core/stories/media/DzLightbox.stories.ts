import type { Meta, StoryObj } from '@storybook/vue3'
import type { LightboxImage } from '../../src/components/media'
import { DzImage, DzLightbox } from '../../src/components/media'

/**
 * DzLightbox is a fullscreen image viewer overlay, built on Reka UI
 * DialogRoot (ADR-07). It supports keyboard navigation (left/right arrows),
 * a slide counter, captions, and v-model for the open state (ADR-16).
 *
 * Pass an array of `LightboxImage` objects and an optional `startIndex`.
 * The default slot serves as the trigger content rendered inline.
 */
const meta = {
  title: 'Core/Media/DzLightbox',
  component: DzLightbox,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    images: {
      control: 'object',
      description: 'Array of images to display (src, alt, caption)',
      table: { category: 'Behavior' },
    },
    startIndex: {
      control: { type: 'number', min: 0 },
      description: 'Starting image index when the lightbox opens',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the image viewer',
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
    images: [
      { src: 'https://picsum.photos/seed/lb1/1200/800', alt: 'Mountain landscape', caption: 'Mountain landscape at dawn' },
      { src: 'https://picsum.photos/seed/lb2/1200/800', alt: 'Ocean view', caption: 'Pacific coast sunset' },
      { src: 'https://picsum.photos/seed/lb3/1200/800', alt: 'Forest path', caption: 'Trail through the redwoods' },
    ],
    startIndex: 0,
  },
} satisfies Meta<typeof DzLightbox>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzLightbox },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <DzLightbox v-model="isOpen" v-bind="args">
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            Open Lightbox
          </button>
        </DzLightbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Single Image
// ---------------------------------------------------------------------------

export const SingleImage: Story = {
  name: 'Single Image',
  args: {
    images: [
      { src: 'https://picsum.photos/seed/single/1200/800', alt: 'Single photo', caption: 'A single photograph' },
    ],
  },
  render: args => ({
    components: { DzLightbox },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <p class="text-sm text-gray-500 mb-3">
          With a single image, navigation arrows and counter are hidden.
        </p>
        <DzLightbox v-model="isOpen" v-bind="args">
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            View Photo
          </button>
        </DzLightbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Many Images
// ---------------------------------------------------------------------------

export const ManyImages: Story = {
  name: 'Many Images',
  args: {
    images: Array.from({ length: 8 }, (_, i) => ({
      src: `https://picsum.photos/seed/many${i}/1200/800`,
      alt: `Gallery photo ${i + 1}`,
      caption: `Photo ${i + 1} of 8`,
    })),
  },
  render: args => ({
    components: { DzLightbox },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <DzLightbox v-model="isOpen" v-bind="args">
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            View Gallery (8 photos)
          </button>
        </DzLightbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Start at Specific Index
// ---------------------------------------------------------------------------

export const StartAtIndex: Story = {
  name: 'Start at Index 2',
  args: {
    startIndex: 2,
    images: [
      { src: 'https://picsum.photos/seed/idx0/1200/800', alt: 'Photo 1', caption: 'First photo' },
      { src: 'https://picsum.photos/seed/idx1/1200/800', alt: 'Photo 2', caption: 'Second photo' },
      { src: 'https://picsum.photos/seed/idx2/1200/800', alt: 'Photo 3', caption: 'Third photo (start)' },
      { src: 'https://picsum.photos/seed/idx3/1200/800', alt: 'Photo 4', caption: 'Fourth photo' },
    ],
  },
  render: args => ({
    components: { DzLightbox },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <p class="text-sm text-gray-500 mb-3">Opens at the third image (index 2).</p>
        <DzLightbox v-model="isOpen" v-bind="args">
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            Open at Third Photo
          </button>
        </DzLightbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots: Custom Caption
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots: Custom Caption',
  render: () => ({
    components: { DzLightbox },
    data() {
      return {
        isOpen: false,
        images: [
          { src: 'https://picsum.photos/seed/cap1/1200/800', alt: 'Photo 1', caption: 'Mountain sunrise' },
          { src: 'https://picsum.photos/seed/cap2/1200/800', alt: 'Photo 2', caption: 'Coastal cliffs' },
          { src: 'https://picsum.photos/seed/cap3/1200/800', alt: 'Photo 3', caption: 'City skyline' },
        ] as LightboxImage[],
      }
    },
    template: `
      <div>
        <DzLightbox v-model="isOpen" :images="images">
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            Open with Custom Captions
          </button>
          <template #caption="{ image, index }">
            <div class="text-center">
              <p class="text-white font-medium">{{ image.caption }}</p>
              <p class="text-gray-400 text-xs mt-1">Taken on March {{ 15 + index }}, 2026</p>
            </div>
          </template>
        </DzLightbox>
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
    components: { DzLightbox },
    data() {
      return {
        isOpen: false,
        images: [
          { src: 'https://picsum.photos/seed/dk1/1200/800', alt: 'Dark photo 1', caption: 'Night sky' },
          { src: 'https://picsum.photos/seed/dk2/1200/800', alt: 'Dark photo 2', caption: 'Aurora borealis' },
        ] as LightboxImage[],
      }
    },
    template: `
      <DzLightbox v-model="isOpen" :images="images">
        <button class="px-4 py-2 text-sm rounded border border-gray-600 text-gray-200" @click="isOpen = true">
          Open Lightbox (Dark)
        </button>
      </DzLightbox>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Change Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzLightbox },
    data() {
      return {
        isOpen: false,
        currentIndex: 0,
        changeLog: [] as number[],
        images: [
          { src: 'https://picsum.photos/seed/ev1/1200/800', alt: 'Photo 1', caption: 'First' },
          { src: 'https://picsum.photos/seed/ev2/1200/800', alt: 'Photo 2', caption: 'Second' },
          { src: 'https://picsum.photos/seed/ev3/1200/800', alt: 'Photo 3', caption: 'Third' },
          { src: 'https://picsum.photos/seed/ev4/1200/800', alt: 'Photo 4', caption: 'Fourth' },
        ] as LightboxImage[],
      }
    },
    methods: {
      handleChange(index: number) {
        this.currentIndex = index
        this.changeLog.push(index)
      },
    },
    template: `
      <div class="space-y-4">
        <DzLightbox v-model="isOpen" :images="images" @change="handleChange">
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            Open Lightbox
          </button>
        </DzLightbox>
        <p class="text-sm text-gray-500">Open: <strong>{{ isOpen }}</strong></p>
        <p class="text-sm text-gray-500">Last viewed index: <strong>{{ currentIndex }}</strong></p>
        <p class="text-sm text-gray-500">
          Change log: <code>{{ changeLog.length ? changeLog.join(' -> ') : '(empty)' }}</code>
        </p>
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
    components: { DzLightbox },
    data() {
      return {
        isOpen: false,
        images: [
          { src: 'https://picsum.photos/seed/a11y1/1200/800', alt: 'Accessible photo 1', caption: 'Photo one' },
          { src: 'https://picsum.photos/seed/a11y2/1200/800', alt: 'Accessible photo 2', caption: 'Photo two' },
        ] as LightboxImage[],
      }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The lightbox is built on Reka UI Dialog, providing:
        </p>
        <ul class="text-sm text-gray-500 list-disc pl-5 space-y-1">
          <li>Focus trap within the overlay</li>
          <li><kbd>Escape</kbd> closes the lightbox</li>
          <li><kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> navigate images</li>
          <li>Navigation buttons have <code>aria-label</code> attributes</li>
          <li><code>aria-label="Image viewer"</code> on the dialog content</li>
        </ul>
        <DzLightbox
          v-model="isOpen"
          :images="images"
          aria-label="Accessible image gallery"
        >
          <button class="px-4 py-2 text-sm rounded border" @click="isOpen = true">
            Open Accessible Lightbox
          </button>
        </DzLightbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Thumbnail Grid Trigger
// ---------------------------------------------------------------------------

export const RealWorldThumbnailGrid: Story = {
  name: 'Real World: Thumbnail Grid',
  render: () => ({
    components: { DzLightbox, DzImage },
    data() {
      return {
        isOpen: false,
        startIndex: 0,
        images: Array.from({ length: 6 }, (_, i) => ({
          src: `https://picsum.photos/seed/thumb${i}/1200/800`,
          alt: `Gallery image ${i + 1}`,
          caption: `Photo ${i + 1} of 6`,
        })) as LightboxImage[],
      }
    },
    methods: {
      openAt(index: number) {
        this.startIndex = index
        this.isOpen = true
      },
    },
    template: `
      <div>
        <div class="grid grid-cols-3 gap-2 max-w-md">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            class="rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            @click="openAt(idx)"
          >
            <img
              :src="img.src"
              :alt="img.alt"
              class="w-full h-24 object-cover"
            />
          </button>
        </div>
        <DzLightbox v-model="isOpen" :images="images" :start-index="startIndex" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Product Detail Viewer
// ---------------------------------------------------------------------------

export const RealWorldProductViewer: Story = {
  name: 'Real World: Product Detail Viewer',
  render: () => ({
    components: { DzLightbox },
    data() {
      return {
        isOpen: false,
        images: [
          { src: 'https://picsum.photos/seed/prod1/1200/800', alt: 'Product front view', caption: 'Front view' },
          { src: 'https://picsum.photos/seed/prod2/1200/800', alt: 'Product side view', caption: 'Side view' },
          { src: 'https://picsum.photos/seed/prod3/1200/800', alt: 'Product detail', caption: 'Close-up detail' },
        ] as LightboxImage[],
      }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <div class="rounded-lg overflow-hidden cursor-pointer" @click="isOpen = true">
          <img
            src="https://picsum.photos/seed/prod1/600/400"
            alt="Product front view"
            class="w-full h-48 object-cover hover:scale-105 transition-transform"
          />
        </div>
        <div class="flex gap-2">
          <img
            v-for="(img, idx) in images"
            :key="idx"
            :src="img.src"
            :alt="img.alt"
            class="w-16 h-16 object-cover rounded border cursor-pointer hover:border-blue-400"
            @click="isOpen = true"
          />
        </div>
        <DzLightbox v-model="isOpen" :images="images" aria-label="Product images" />
      </div>
    `,
  }),
}
