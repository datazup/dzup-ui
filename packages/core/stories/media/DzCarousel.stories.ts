import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzCarousel,
  DzCarouselDots,
  DzCarouselNext,
  DzCarouselPrevious,
  DzCarouselSlide,
} from '../../src/components/media'

/**
 * DzCarousel is a compound carousel component for cycling through slides
 * with optional autoplay, looping, keyboard navigation, and dot indicators.
 *
 * The compound API consists of:
 * - `DzCarousel` -- root container, provides context via DZ_CAROUSEL_KEY (ADR-08)
 * - `DzCarouselSlide` -- individual slide wrapper
 * - `DzCarouselPrevious` / `DzCarouselNext` -- navigation buttons
 * - `DzCarouselDots` -- dot indicators
 *
 * Supports v-model for the active slide index (ADR-16).
 */
const meta = {
  title: 'Core/Media/DzCarousel',
  component: DzCarousel,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Scroll orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    autoplay: {
      control: 'boolean',
      description: 'Whether to auto-advance slides',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    interval: {
      control: { type: 'number', min: 500, step: 500 },
      description: 'Auto-advance interval in milliseconds',
      table: { category: 'Behavior', defaultValue: { summary: '5000' } },
    },
    loop: {
      control: 'boolean',
      description: 'Whether to loop back to start when reaching end',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents navigation',
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
      description: 'Accessible label for the carousel region',
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
    orientation: 'horizontal',
    autoplay: false,
    interval: 5000,
    loop: false,
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzCarousel>

export default meta
type Story = StoryObj<typeof meta>

// Reusable slide content helper
const _SLIDE_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
]

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-lg">
        <DzCarousel v-bind="args">
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">
              Slide 1
            </div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">
              Slide 2
            </div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">
              Slide 3
            </div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="space-y-8">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <div class="max-w-md">
            <DzCarousel :size="size">
              <DzCarouselSlide>
                <div class="flex items-center justify-center h-32 bg-blue-100 text-blue-800 rounded font-medium">1</div>
              </DzCarouselSlide>
              <DzCarouselSlide>
                <div class="flex items-center justify-center h-32 bg-green-100 text-green-800 rounded font-medium">2</div>
              </DzCarouselSlide>
              <DzCarouselSlide>
                <div class="flex items-center justify-center h-32 bg-amber-100 text-amber-800 rounded font-medium">3</div>
              </DzCarouselSlide>
              <DzCarouselPrevious />
              <DzCarouselNext />
              <DzCarouselDots />
            </DzCarousel>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Autoplay
// ---------------------------------------------------------------------------

export const Autoplay: Story = {
  name: 'Autoplay',
  args: {
    autoplay: true,
    interval: 2000,
    loop: true,
  },
  render: args => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselDots },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Auto-advances every 2 seconds. Pauses on hover.
        </p>
        <div class="max-w-lg">
          <DzCarousel v-bind="args">
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">Slide 1</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Slide 2</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">Slide 3</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-rose-100 text-rose-800 rounded-lg font-medium">Slide 4</div>
            </DzCarouselSlide>
            <DzCarouselDots />
          </DzCarousel>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Loop
// ---------------------------------------------------------------------------

export const WithLoop: Story = {
  name: 'With Loop',
  args: {
    loop: true,
  },
  render: args => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Loop is enabled -- navigation wraps around from last to first slide.
        </p>
        <div class="max-w-lg">
          <DzCarousel v-bind="args">
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">First</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Middle</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">Last</div>
            </DzCarouselSlide>
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots />
          </DzCarousel>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Orientation
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: 'Vertical Orientation',
  args: {
    orientation: 'vertical',
  },
  render: args => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-lg">
        <DzCarousel v-bind="args">
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">Slide 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Slide 2</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">Slide 3</div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-lg">
        <DzCarousel v-bind="args">
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">Slide 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Slide 2</div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots: Custom Dot Renderer
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots: Custom Dots',
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-lg">
        <DzCarousel loop>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">Photo 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Photo 2</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">Photo 3</div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots>
            <template #default="{ index, active }">
              <span
                class="inline-block w-6 h-1.5 rounded-full transition-colors"
                :class="active ? 'bg-blue-600' : 'bg-gray-300'"
              />
            </template>
          </DzCarouselDots>
        </DzCarousel>
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
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-lg">
        <DzCarousel loop>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-blue-900/30 text-blue-300 rounded-lg font-medium">Slide 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-green-900/30 text-green-300 rounded-lg font-medium">Slide 2</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-amber-900/30 text-amber-300 rounded-lg font-medium">Slide 3</div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: v-model Binding
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    data() {
      return { activeSlide: 0 }
    },
    template: `
      <div class="space-y-4">
        <div class="max-w-lg">
          <DzCarousel v-model="activeSlide" loop>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">Slide 1</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Slide 2</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">Slide 3</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-rose-100 text-rose-800 rounded-lg font-medium">Slide 4</div>
            </DzCarouselSlide>
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots />
          </DzCarousel>
        </div>
        <p class="text-sm text-gray-500">Active slide index: <strong>{{ activeSlide }}</strong></p>
        <div class="flex gap-2">
          <button
            v-for="i in 4"
            :key="i"
            class="px-3 py-1 text-sm rounded border"
            :class="activeSlide === i - 1 ? 'bg-blue-100 border-blue-400' : ''"
            @click="activeSlide = i - 1"
          >
            Go to {{ i }}
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
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The carousel uses <code>role="region"</code> with
          <code>aria-roledescription="carousel"</code> and an
          <code>aria-live="polite"</code> viewport. Navigation buttons have
          accessible labels. Use arrow keys or tab to navigate.
        </p>
        <div class="max-w-lg">
          <DzCarousel aria-label="Accessibility demo carousel" loop>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-blue-100 text-blue-800 rounded-lg font-medium">Accessible Slide 1</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-green-100 text-green-800 rounded-lg font-medium">Accessible Slide 2</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-amber-100 text-amber-800 rounded-lg font-medium">Accessible Slide 3</div>
            </DzCarouselSlide>
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots />
          </DzCarousel>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Image Gallery
// ---------------------------------------------------------------------------

export const RealWorldImageGallery: Story = {
  name: 'Real World: Image Gallery',
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-2xl">
        <DzCarousel loop aria-label="Photo gallery">
          <DzCarouselSlide v-for="i in 5" :key="i">
            <div class="rounded-lg overflow-hidden">
              <img
                :src="'https://picsum.photos/seed/carousel' + i + '/800/400'"
                :alt="'Gallery photo ' + i"
                class="w-full h-64 object-cover"
              />
            </div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Testimonials
// ---------------------------------------------------------------------------

export const RealWorldTestimonials: Story = {
  name: 'Real World: Testimonials',
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-md mx-auto">
        <DzCarousel autoplay :interval="4000" loop aria-label="Customer testimonials">
          <DzCarouselSlide>
            <blockquote class="p-6 bg-gray-50 rounded-lg text-center">
              <p class="text-sm italic">"This product transformed our workflow completely."</p>
              <footer class="mt-3 text-xs text-gray-500">-- Alice B., CEO</footer>
            </blockquote>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <blockquote class="p-6 bg-gray-50 rounded-lg text-center">
              <p class="text-sm italic">"The best component library we have ever used."</p>
              <footer class="mt-3 text-xs text-gray-500">-- Bob C., Developer</footer>
            </blockquote>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <blockquote class="p-6 bg-gray-50 rounded-lg text-center">
              <p class="text-sm italic">"Support is incredible, shipping velocity is unmatched."</p>
              <footer class="mt-3 text-xs text-gray-500">-- Clara D., CTO</footer>
            </blockquote>
          </DzCarouselSlide>
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}
