import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzCarousel,
  DzCarouselDots,
  DzCarouselNext,
  DzCarouselPrevious,
  DzCarouselSlide,
} from '../../src/components/media'
import { a11yError, darkModeDecorator } from '../_shared'

/**
 * DzCarousel compound sub-parts: DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots.
 *
 * These sub-parts receive the active-slide index and navigation callbacks from
 * `DzCarousel` via `DZ_CAROUSEL_KEY` (ADR-08 provide/inject).
 *
 * - **DzCarouselSlide** -- individual slide wrapper; receives index from parent
 * - **DzCarouselPrevious** -- button that moves to the previous slide
 * - **DzCarouselNext** -- button that moves to the next slide
 * - **DzCarouselDots** -- dot indicator strip; supports custom dot slot
 */

const meta = {
  title: 'Core/Media/DzCarouselParts',
  component: DzCarouselSlide,
  subcomponents: {
    DzCarousel,
    DzCarouselDots,
    DzCarouselNext,
    DzCarouselPrevious,
  },
  tags: ['autodocs', 'status:stable'],
  parameters: {
    // Media enforced (TASK-DS-13).
    ...a11yError,
  },
} satisfies Meta<typeof DzCarouselSlide>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: 3-slide carousel with prev / next / dots
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    setup() {
      // Each fill carries its own foreground token — a solid intent fill is only
      // legible against `--dz-{intent}-foreground`, which is not white for every
      // intent.
      const slides = [
        { id: 1, label: 'Slide One', color: 'var(--dz-primary)', fg: 'var(--dz-primary-foreground)' },
        { id: 2, label: 'Slide Two', color: 'var(--dz-success)', fg: 'var(--dz-success-foreground)' },
        { id: 3, label: 'Slide Three', color: 'var(--dz-warning)', fg: 'var(--dz-warning-foreground)' },
      ]
      return { slides }
    },
    template: `
      <div class="relative max-w-md">
        <DzCarousel class="overflow-hidden rounded-lg border border-[var(--dz-border)]">
          <DzCarouselSlide v-for="slide in slides" :key="slide.id">
            <div
              class="flex h-48 items-center justify-center rounded-lg text-lg font-semibold"
              :style="{ background: slide.color, color: slide.fg }"
            >
              {{ slide.label }}
            </div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots class="mt-3" />
        </DzCarousel>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nextBtn = canvas.getByRole('button', { name: /next slide/i })
    const prevBtn = canvas.getByRole('button', { name: /previous slide/i })

    // On slide 1 the prev button must be disabled (no loop)
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).not.toBeDisabled()

    // Navigate forward to slide 2
    await userEvent.click(nextBtn)
    await waitFor(() => {
      expect(canvas.getByText(/slide two/i)).toBeInTheDocument()
      // prev is now enabled; next still enabled (slide 3 exists)
      expect(prevBtn).not.toBeDisabled()
    })

    // Navigate back to slide 1
    await userEvent.click(prevBtn)
    await waitFor(() => {
      expect(canvas.getByText(/slide one/i)).toBeInTheDocument()
      expect(prevBtn).toBeDisabled()
    })
  },
}

// ---------------------------------------------------------------------------
// Compound Composition: Annotated anatomy
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound Composition: Anatomy',
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="space-y-6">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          The carousel is built from five composable parts. DzCarousel is the root
          that owns state. The four sub-parts inject context via DZ_CAROUSEL_KEY.
        </p>

        <div class="relative max-w-md">
          <DzCarousel class="overflow-hidden rounded-lg border-2 border-dashed border-[var(--dz-border)]">
            <DzCarouselSlide v-for="i in 3" :key="i">
              <div
                class="flex h-40 items-center justify-center text-sm font-medium text-[var(--dz-muted-foreground)]"
                style="background: var(--dz-muted);"
              >
                DzCarouselSlide {{ i }}
              </div>
            </DzCarouselSlide>
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots class="mt-3" />
          </DzCarousel>
        </div>

        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>DzCarousel</strong> — root; provides slide index + navigation callbacks</p>
          <p><strong>DzCarouselSlide</strong> — individual slide wrapper; receives active state</p>
          <p><strong>DzCarouselPrevious</strong> — navigates to previous slide (disabled at start without loop)</p>
          <p><strong>DzCarouselNext</strong> — navigates to next slide (disabled at end without loop)</p>
          <p><strong>DzCarouselDots</strong> — dot strip; active dot reflects current slide index</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Image-card carousel
// ---------------------------------------------------------------------------

export const RealWorld: Story = {
  name: 'Real World: Image Card Carousel',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nextBtn = canvas.getByRole('button', { name: /next slide/i })
    const prevBtn = canvas.getByRole('button', { name: /previous slide/i })

    // Loop carousel — both buttons always enabled
    expect(nextBtn).not.toBeDisabled()
    expect(prevBtn).not.toBeDisabled()

    // Advance to card 2
    await userEvent.click(nextBtn)
    await waitFor(() => {
      expect(canvas.getByText(/accessible by default/i)).toBeInTheDocument()
    })

    // Advance to card 3
    await userEvent.click(nextBtn)
    await waitFor(() => {
      expect(canvas.getByText(/reka ui primitives/i)).toBeInTheDocument()
    })

    // Step back to card 2
    await userEvent.click(prevBtn)
    await waitFor(() => {
      expect(canvas.getByText(/accessible by default/i)).toBeInTheDocument()
    })
  },
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    setup() {
      const cards = [
        {
          id: 1,
          title: 'Vue 3 Design System',
          description: 'Token-first components with full dark mode support.',
          tag: 'Engineering',
        },
        {
          id: 2,
          title: 'Accessible by Default',
          description: 'WCAG AA compliance built into every primitive.',
          tag: 'Accessibility',
        },
        {
          id: 3,
          title: 'Reka UI Primitives',
          description: 'Headless logic layer enabling custom styling freedom.',
          tag: 'Architecture',
        },
        {
          id: 4,
          title: 'Tailwind Variants',
          description: 'Variant-safe class composition without style conflicts.',
          tag: 'Styling',
        },
      ]
      return { cards }
    },
    template: `
      <div class="max-w-sm">
        <DzCarousel loop class="overflow-hidden">
          <DzCarouselSlide v-for="card in cards" :key="card.id">
            <div class="rounded-xl border border-[var(--dz-border)] overflow-hidden" style="background: var(--dz-card);">
              <div
                class="h-32 flex items-center justify-center text-sm text-[var(--dz-muted-foreground)]"
                style="background: var(--dz-muted);"
              >
                {{ card.tag }} image placeholder
              </div>
              <div class="p-4 space-y-1">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold">{{ card.title }}</p>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full"
                    style="background: var(--dz-muted); color: var(--dz-muted-foreground);"
                  >
                    {{ card.tag }}
                  </span>
                </div>
                <p class="text-xs text-[var(--dz-muted-foreground)]">{{ card.description }}</p>
              </div>
            </div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots class="mt-4" />
        </DzCarousel>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Without Navigation Controls (dots only)
// ---------------------------------------------------------------------------

export const DotsOnly: Story = {
  name: 'Dots Only (No Nav Buttons)',
  // TASK-APP-01 — autoplay (:interval="2500") auto-advances the slide, so the
  // captured frame is a race with the timer. Skip the visual snapshot; the play()
  // test still asserts the auto-advance behaviour.
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Slide 1 text is present on mount
    expect(canvas.getByText(/slide 1/i)).toBeInTheDocument()

    // After one autoplay interval (2500 ms) slide 2 should be active.
    // waitFor polls for up to 5 s by default — well within Storybook's test timeout.
    await waitFor(
      () => {
        expect(canvas.getByText(/slide 2/i)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    // After another interval slide 3 advances
    await waitFor(
      () => {
        expect(canvas.getByText(/slide 3/i)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  },
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselDots },
    setup() {
      const fills = [
        { bg: 'var(--dz-primary)', fg: 'var(--dz-primary-foreground)' },
        { bg: 'var(--dz-success)', fg: 'var(--dz-success-foreground)' },
        { bg: 'var(--dz-danger)', fg: 'var(--dz-danger-foreground)' },
      ]
      return { fills }
    },
    template: `
      <div class="max-w-md space-y-2">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          DzCarouselDots can be used without DzCarouselPrevious / DzCarouselNext
          for touch-first or auto-advancing carousels.
        </p>
        <DzCarousel autoplay :interval="2500" loop class="overflow-hidden rounded-lg">
          <DzCarouselSlide v-for="(fill, i) in fills" :key="i">
            <div
              class="h-32 flex items-center justify-center font-medium text-sm"
              :style="{ background: fill.bg, color: fill.fg }"
            >
              Slide {{ i + 1 }}
            </div>
          </DzCarouselSlide>
          <DzCarouselDots class="mt-3" />
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
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
    template: `
      <div class="max-w-md">
        <DzCarousel loop class="overflow-hidden rounded-lg border border-[var(--dz-border)]">
          <DzCarouselSlide v-for="(label, i) in ['Alpha', 'Beta', 'Gamma']" :key="i">
            <div
              class="h-40 flex items-center justify-center text-[var(--dz-foreground)] font-semibold"
              style="background: var(--dz-muted);"
            >
              {{ label }}
            </div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots class="mt-3" />
        </DzCarousel>
      </div>
    `,
  }),
}
