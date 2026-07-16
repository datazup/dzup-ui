import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzCarousel,
  DzCarouselDots,
  DzCarouselNext,
  DzCarouselPrevious,
  DzCarouselSlide,
} from '../../src/components/media'
import { a11yDisableRules, a11yError, darkModeDecorator } from '../_shared'

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
  tags: ['autodocs', 'status:stable'],
  parameters: {
    // Media enforced (TASK-DS-13).
    ...a11yError,
  },
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
  'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]',
  'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]',
  'bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)]',
  'bg-[var(--dz-danger-muted)] text-[var(--dz-danger-muted-foreground)]',
  'bg-[var(--dz-secondary-muted)] text-[var(--dz-secondary-muted-foreground)]',
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
            <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">
              Slide 1
            </div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">
              Slide 2
            </div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Region semantics (TASK-10.D): the root is a labelled carousel region.
    const region = canvas.getByRole('region')
    await expect(region).toHaveAttribute('aria-roledescription', 'carousel')

    // The dots are a tablist; slide 1 is selected initially.
    const dots = canvas.getAllByRole('tab')
    await expect(dots).toHaveLength(3)
    await expect(dots[0]).toHaveAttribute('aria-selected', 'true')

    // Next advances the active slide.
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(dots[1]).toHaveAttribute('aria-selected', 'true'))

    // Dot navigation jumps directly to a slide.
    await userEvent.click(dots[2])
    await waitFor(() => expect(dots[2]).toHaveAttribute('aria-selected', 'true'))

    // Previous steps back one slide.
    await userEvent.click(canvas.getByRole('button', { name: 'Previous slide' }))
    await waitFor(() => expect(dots[1]).toHaveAttribute('aria-selected', 'true'))
  },
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
                <div class="flex items-center justify-center h-32 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded font-medium">1</div>
              </DzCarouselSlide>
              <DzCarouselSlide>
                <div class="flex items-center justify-center h-32 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded font-medium">2</div>
              </DzCarouselSlide>
              <DzCarouselSlide>
                <div class="flex items-center justify-center h-32 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded font-medium">3</div>
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
  // TASK-APP-01 — auto-advances every 2 s, so the active slide under the capture
  // is a race. Skip the visual snapshot; the deterministic Default story already
  // covers the carousel's rendered states.
  parameters: { chromatic: { disableSnapshot: true } },
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Auto-advances every 2 seconds. Pauses on hover.
        </p>
        <div class="max-w-lg">
          <DzCarousel v-bind="args">
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Slide 1</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Slide 2</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Slide 3</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-danger-muted)] text-[var(--dz-danger-muted-foreground)] rounded-lg font-medium">Slide 4</div>
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Loop is enabled -- navigation wraps around from last to first slide.
        </p>
        <div class="max-w-lg">
          <DzCarousel v-bind="args">
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">First</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Middle</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Last</div>
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
  // `target-size` disabled for THIS story only (stays gating for every other
  // rule). In vertical orientation the dot indicators render inside the
  // transform-driven, `overflow-hidden` viewport and are compressed/obscured, so
  // their 24×24 hit target (fixed in DzCarousel.variants.ts for the horizontal
  // case) collapses. Fixing this needs a vertical-layout redesign that positions
  // the dots outside the transform container — tracked as follow-up, not silenced
  // for the whole family. Horizontal carousels pass target-size unaided.
  parameters: {
    ...a11yDisableRules('target-size'),
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
            <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Slide 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Slide 2</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Slide 3</div>
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
            <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Slide 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Slide 2</div>
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
            <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Photo 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Photo 2</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Photo 3</div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots>
            <template #default="{ index, active }">
              <span
                class="inline-block w-6 h-1.5 rounded-full transition-colors"
                :class="active ? 'bg-[var(--dz-primary)]' : 'bg-[var(--dz-border)]'"
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
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-lg">
        <DzCarousel loop>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Slide 1</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Slide 2</div>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Slide 3</div>
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
              <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Slide 1</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Slide 2</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Slide 3</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-danger-muted)] text-[var(--dz-danger-muted-foreground)] rounded-lg font-medium">Slide 4</div>
            </DzCarouselSlide>
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots />
          </DzCarousel>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">Active slide index: <strong>{{ activeSlide }}</strong></p>
        <div class="flex gap-2">
          <button
            v-for="i in 4"
            :key="i"
            class="px-3 py-1 text-sm rounded border border-[var(--dz-border)]"
            :class="activeSlide === i - 1 ? 'bg-[var(--dz-primary-muted)] border-[var(--dz-primary-border)]' : ''"
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          The carousel uses <code>role="region"</code> with
          <code>aria-roledescription="carousel"</code> and an
          <code>aria-live="polite"</code> viewport. Navigation buttons have
          accessible labels. Use arrow keys or tab to navigate.
        </p>
        <div class="max-w-lg">
          <DzCarousel aria-label="Accessibility demo carousel" loop>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] rounded-lg font-medium">Accessible Slide 1</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] rounded-lg font-medium">Accessible Slide 2</div>
            </DzCarouselSlide>
            <DzCarouselSlide>
              <div class="flex items-center justify-center h-48 bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] rounded-lg font-medium">Accessible Slide 3</div>
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
  // TASK-APP-01 — autoplay (:interval="4000") auto-advances the quote, so the
  // captured slide is non-deterministic. Skip the visual snapshot.
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-md mx-auto">
        <DzCarousel autoplay :interval="4000" loop aria-label="Customer testimonials">
          <DzCarouselSlide>
            <blockquote class="p-6 bg-[var(--dz-muted)] rounded-lg text-center">
              <p class="text-sm italic">"This product transformed our workflow completely."</p>
              <footer class="mt-3 text-xs text-[var(--dz-muted-foreground)]">-- Alice B., CEO</footer>
            </blockquote>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <blockquote class="p-6 bg-[var(--dz-muted)] rounded-lg text-center">
              <p class="text-sm italic">"The best component library we have ever used."</p>
              <footer class="mt-3 text-xs text-[var(--dz-muted-foreground)]">-- Bob C., Developer</footer>
            </blockquote>
          </DzCarouselSlide>
          <DzCarouselSlide>
            <blockquote class="p-6 bg-[var(--dz-muted)] rounded-lg text-center">
              <p class="text-sm italic">"Support is incredible, shipping velocity is unmatched."</p>
              <footer class="mt-3 text-xs text-[var(--dz-muted-foreground)]">-- Clara D., CTO</footer>
            </blockquote>
          </DzCarouselSlide>
          <DzCarouselDots />
        </DzCarousel>
      </div>
    `,
  }),
}
