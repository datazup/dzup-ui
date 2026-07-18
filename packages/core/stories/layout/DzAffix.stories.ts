import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { ref } from 'vue'
import { DzAffix } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * **DzAffix** pins its slotted content to the viewport once it would scroll
 * past a threshold, keeping a same-size placeholder in flow so the surrounding
 * layout never jumps.
 *
 * - `offsetTop` pins the content that distance below the top of the scroll
 *   container (the default behaviour).
 * - `offsetBottom` pins it that distance above the bottom instead.
 * - `target` selects a custom scroll container. When omitted, the nearest
 *   scrollable ancestor is used, falling back to `window`.
 *
 * It applies no visual styling beyond the fixed positioning — content
 * semantics, focus, and tab order are unchanged. The `change` event fires
 * whenever the pinned state flips.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Layout/DzAffix',
  component: DzAffix,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    offsetTop: {
      control: { type: 'number', min: 0, max: 200, step: 4 },
      description: 'Pin distance from the top of the scroll container (px)',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    offsetBottom: {
      control: { type: 'number', min: 0, max: 200, step: 4 },
      description: 'Pin distance from the bottom of the scroll container (px)',
      table: { category: 'Behavior' },
    },
    target: {
      control: false,
      description: 'Returns the scroll container (defaults to window)',
      table: { category: 'Behavior' },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
} satisfies Meta<typeof DzAffix>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Affix Top — pins below the top of the page as you scroll
// ---------------------------------------------------------------------------

export const AffixTop: Story = {
  name: 'Affix Top',
  args: { offsetTop: 16 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The affix root wrapper must be present in the DOM
    const _affixRoot
      = canvasElement.querySelector('[data-affixed]')
        ?? canvasElement.querySelector('.dz-affix, [class]')
    const wrapper = canvasElement.firstElementChild
    await expect(wrapper).not.toBeNull()

    // The inner content div (placeholder) should be visible
    const content = canvasElement.querySelector('div > div')
    await expect(content).not.toBeNull()

    // The text content rendered by the slot should be discoverable
    const slotText = canvas.getByText(/Scroll to pin me|Pinned to top/)
    await expect(slotText).toBeInTheDocument()
  },
  render: args => ({
    components: { DzAffix },
    setup() {
      const container = ref<HTMLElement | null>(null)
      const affixed = ref(false)
      // The window never scrolls inside the story iframe — pin against the
      // surrounding scrollable panel instead.
      const getTarget = () => container.value
      return { args, container, affixed, getTarget }
    },
    template: `
      <div ref="container" class="h-64 overflow-auto border border-[var(--dz-border)] rounded-lg p-4">
        <p class="text-sm text-[var(--dz-muted-foreground)] mb-3">Scroll this panel down ↓</p>
        <div style="height: 120px" class="bg-[var(--dz-muted)] rounded mb-4 flex items-center justify-center text-xs text-[var(--dz-muted-foreground)]">
          spacer
        </div>
        <DzAffix v-bind="args" :target="getTarget" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            :class="affixed ? 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]' : 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]'"
          >
            {{ affixed ? 'Pinned to top' : 'Scroll to pin me' }}
          </div>
        </DzAffix>
        <div style="height: 600px" class="bg-[var(--dz-muted)] rounded mt-4 flex items-center justify-center text-xs text-[var(--dz-muted-foreground)]">
          long content
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Affix Bottom — pins above the bottom of the page
// ---------------------------------------------------------------------------

export const AffixBottom: Story = {
  name: 'Affix Bottom',
  args: { offsetBottom: 16 },
  render: args => ({
    components: { DzAffix },
    setup() {
      const container = ref<HTMLElement | null>(null)
      const affixed = ref(false)
      // Measure against the scrollable panel, not the (non-scrolling) window.
      const getTarget = () => container.value
      return { args, container, affixed, getTarget }
    },
    template: `
      <div ref="container" class="h-64 overflow-auto border border-[var(--dz-border)] rounded-lg p-4">
        <p class="text-sm text-[var(--dz-muted-foreground)] mb-3">A bottom-pinned CTA stays in view ↓</p>
        <div style="height: 600px" class="bg-[var(--dz-muted)] rounded mb-4 flex items-center justify-center text-xs text-[var(--dz-muted-foreground)]">
          long content
        </div>
        <DzAffix v-bind="args" :target="getTarget" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            :class="affixed ? 'bg-[var(--dz-success)] text-[var(--dz-success-foreground)]' : 'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]'"
          >
            {{ affixed ? 'Pinned to bottom' : 'Keep scrolling' }}
          </div>
        </DzAffix>
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
    components: { DzAffix },
    setup() {
      const container = ref<HTMLElement | null>(null)
      const affixed = ref(false)
      // Same bounded panel as Affix Top — the window never scrolls inside the
      // story iframe, so the affix measures against this container.
      const getTarget = () => container.value
      return { container, affixed, getTarget }
    },
    template: `
      <div ref="container" class="h-64 overflow-auto border border-[var(--dz-border)] rounded-lg p-4">
        <p class="text-sm text-[var(--dz-muted-foreground)] mb-3">Scroll this panel down ↓</p>
        <div style="height: 120px" class="bg-[var(--dz-muted)] rounded mb-4 flex items-center justify-center text-xs text-[var(--dz-muted-foreground)]">
          spacer
        </div>
        <DzAffix :offset-top="16" :target="getTarget" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            :class="affixed ? 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]' : 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]'"
          >
            {{ affixed ? 'Pinned to top' : 'Scroll to pin me' }}
          </div>
        </DzAffix>
        <div style="height: 600px" class="bg-[var(--dz-muted)] rounded mt-4 flex items-center justify-center text-xs text-[var(--dz-muted-foreground)]">
          long content
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Within Container — affix measured against a custom scroll container
// ---------------------------------------------------------------------------

export const WithinContainer: Story = {
  name: 'Within Container',
  render: () => ({
    components: { DzAffix },
    setup() {
      const container = ref<HTMLElement | null>(null)
      const affixed = ref(false)
      const getTarget = () => container.value
      return { container, affixed, getTarget }
    },
    template: `
      <div ref="container" class="h-64 overflow-auto border border-[var(--dz-border)] rounded-lg p-4 relative">
        <p class="text-sm text-[var(--dz-muted-foreground)] mb-3">
          The toolbar pins to the top of <em>this</em> container, not the window.
        </p>
        <DzAffix :offset-top="8" :target="getTarget" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2"
            :class="affixed ? 'bg-[var(--dz-colors-purple-600)] text-[var(--dz-colors-neutral-50)]' : 'bg-[var(--dz-colors-purple-50)] text-[var(--dz-colors-purple-800)]'"
          >
            <span>Toolbar</span>
            <span class="text-xs opacity-75">{{ affixed ? '(pinned)' : '(in flow)' }}</span>
          </div>
        </DzAffix>
        <div style="height: 700px" class="bg-[var(--dz-muted)] rounded mt-4 flex items-center justify-center text-xs text-[var(--dz-muted-foreground)]">
          scrollable region
        </div>
      </div>
    `,
  }),
}
