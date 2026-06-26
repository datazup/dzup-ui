import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzDeferredContent } from '../../src/components/layout'
import { DzSkeleton } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

/**
 * DzDeferredContent renders heavy content only once it scrolls into view. The
 * default slot is mounted lazily; a `placeholder` slot — a DzSkeleton by
 * default — reserves space until then. This avoids paying the mount cost of
 * below-the-fold widgets (charts, images, expensive lists) the user may never
 * reach, improving first paint.
 *
 * It pairs with DzInfiniteScroll: that loads *more* items as you scroll, while
 * DzDeferredContent lazily mounts what is *already* listed. Use `rootMargin` to
 * reveal content early, and `once="false"` to re-defer content as it leaves the
 * viewport.
 *
 * Where `IntersectionObserver` is unavailable (SSR / old engines) the content
 * renders immediately, so it always reaches the user.
 */
const meta = {
  title: 'Core/Layout/DzDeferredContent',
  component: DzDeferredContent,
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
  argTypes: {
    rootMargin: {
      control: 'text',
      description: 'Margin grown around the viewport before revealing (e.g. "200px")',
      table: { category: 'Behavior', defaultValue: { summary: '0px' } },
    },
    threshold: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
      description: 'Visibility ratio at which the content reveals',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    once: {
      control: 'boolean',
      description: 'Keep the content mounted after the first reveal',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    as: {
      control: 'text',
      description: 'HTML element to render as',
      table: { category: 'Appearance', defaultValue: { summary: 'div' } },
    },
  },
  args: {
    rootMargin: '0px',
    threshold: 0,
    once: true,
    as: 'div',
  },
} satisfies Meta<typeof DzDeferredContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Shared scaffolding — a tall spacer pushes the deferred block below the fold
// ---------------------------------------------------------------------------

const spacerClass =
  'flex items-center justify-center rounded-[var(--dz-radius-md)] ' +
  'border border-dashed border-[var(--dz-border)] ' +
  'text-[var(--dz-muted-foreground)]'

const cardClass =
  'rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] ' +
  'bg-[var(--dz-surface)] p-6 text-[var(--dz-foreground)]'

// ---------------------------------------------------------------------------
// DeferredImage — a heavy image mounts only when scrolled into view
// ---------------------------------------------------------------------------

export const DeferredImage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The wrapper should have aria-busy while content is not yet revealed
    // (IntersectionObserver may fire immediately in jsdom, so we check either state)
    const wrapper = canvasElement.querySelector('[aria-label="Deferred image"]')
    await expect(wrapper).not.toBeNull()

    // Wait for the content to be revealed (aria-busy removed, data-loaded set)
    await waitFor(
      () => {
        expect(wrapper?.getAttribute('aria-busy')).toBeNull()
      },
      { timeout: 3000 },
    )

    // After reveal the deferred image must be in the DOM
    const img = canvas.getByAltText('Lazily loaded scenery')
    await expect(img).toBeInTheDocument()
  },
  render: (args) => ({
    components: { DzDeferredContent },
    setup: () => ({ args, spacerClass }),
    template: `
      <div class="h-[420px] overflow-auto p-4">
        <div :class="spacerClass" class="h-[500px] mb-4">Scroll down ↓</div>
        <DzDeferredContent v-bind="args" root-margin="0px" aria-label="Deferred image">
          <img
            src="https://picsum.photos/640/320"
            alt="Lazily loaded scenery"
            width="640"
            height="320"
            class="w-full rounded-[var(--dz-radius-md)]"
          />
        </DzDeferredContent>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// DeferredList — an expensive list is built only on reveal
// ---------------------------------------------------------------------------

export const DeferredList: Story = {
  render: (args) => ({
    components: { DzDeferredContent },
    setup() {
      const rows = Array.from({ length: 30 }, (_, i) => `Row #${i + 1}`)
      return { args, rows, spacerClass, cardClass }
    },
    template: `
      <div class="h-[420px] overflow-auto p-4">
        <div :class="spacerClass" class="h-[500px] mb-4">Scroll down ↓</div>
        <DzDeferredContent v-bind="args" root-margin="120px" aria-label="Deferred list">
          <ul class="flex flex-col gap-2">
            <li v-for="row in rows" :key="row" :class="cardClass" class="py-3">{{ row }}</li>
          </ul>
        </DzDeferredContent>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// CustomPlaceholder — replace the default skeleton with bespoke loading UI
// ---------------------------------------------------------------------------

export const CustomPlaceholder: Story = {
  render: (args) => ({
    components: { DzDeferredContent, DzSkeleton },
    setup: () => ({ args, spacerClass, cardClass }),
    template: `
      <div class="h-[420px] overflow-auto p-4">
        <div :class="spacerClass" class="h-[500px] mb-4">Scroll down ↓</div>
        <DzDeferredContent v-bind="args" root-margin="80px" aria-label="Deferred chart">
          <div :class="cardClass" class="h-[320px] flex items-center justify-center">
            Heavy chart rendered
          </div>
          <template #placeholder>
            <div class="flex flex-col gap-3">
              <DzSkeleton variant="text" :lines="2" />
              <DzSkeleton variant="rectangular" height="240px" />
            </div>
          </template>
        </DzDeferredContent>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// RepeatObserve — once="false" re-defers content as it leaves the viewport
// ---------------------------------------------------------------------------

export const RepeatObserve: Story = {
  name: 'Repeat Observe',
  args: { once: false },
  render: (args) => ({
    components: { DzDeferredContent },
    setup() {
      const reveals = ref(0)
      return { args, reveals, spacerClass, cardClass }
    },
    template: `
      <div class="h-[420px] overflow-auto p-4">
        <p class="mb-2 text-[var(--dz-muted-foreground)]">Mounted {{ reveals }} time(s)</p>
        <div :class="spacerClass" class="h-[500px] mb-4">Scroll down ↓</div>
        <DzDeferredContent v-bind="args" aria-label="Repeatedly deferred block" @reveal="reveals++">
          <div :class="cardClass" class="h-[320px] flex items-center justify-center">
            Re-mounted on every entry (scroll away and back)
          </div>
        </DzDeferredContent>
        <div :class="spacerClass" class="h-[500px] mt-4">Scroll back up ↑</div>
      </div>
    `,
  }),
}
