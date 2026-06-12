import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { DzAffix } from '../../src/components/layout'

/**
 * **DzAffix** pins its slotted content to the viewport once it would scroll
 * past a threshold, keeping a same-size placeholder in flow so the surrounding
 * layout never jumps.
 *
 * - `offsetTop` pins the content that distance below the top of the scroll
 *   container (the default behaviour).
 * - `offsetBottom` pins it that distance above the bottom instead.
 * - `target` selects a custom scroll container (defaults to `window`).
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
  render: args => ({
    components: { DzAffix },
    setup() {
      const affixed = ref(false)
      return { args, affixed }
    },
    template: `
      <div class="h-64 overflow-auto border rounded-lg p-4">
        <p class="text-sm text-gray-500 mb-3">Scroll this panel down ↓</p>
        <div style="height: 120px" class="bg-gray-50 rounded mb-4 flex items-center justify-center text-xs text-gray-400">
          spacer
        </div>
        <DzAffix v-bind="args" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            :class="affixed ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'"
          >
            {{ affixed ? 'Pinned to top' : 'Scroll to pin me' }}
          </div>
        </DzAffix>
        <div style="height: 600px" class="bg-gray-50 rounded mt-4 flex items-center justify-center text-xs text-gray-400">
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
      const affixed = ref(false)
      return { args, affixed }
    },
    template: `
      <div class="h-64 overflow-auto border rounded-lg p-4">
        <p class="text-sm text-gray-500 mb-3">A bottom-pinned CTA stays in view ↓</p>
        <DzAffix v-bind="args" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            :class="affixed ? 'bg-green-600 text-white' : 'bg-green-50 text-green-800'"
          >
            {{ affixed ? 'Pinned to bottom' : 'Keep scrolling' }}
          </div>
        </DzAffix>
        <div style="height: 600px" class="bg-gray-50 rounded mt-4 flex items-center justify-center text-xs text-gray-400">
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
      <div ref="container" class="h-64 overflow-auto border rounded-lg p-4 relative">
        <p class="text-sm text-gray-500 mb-3">
          The toolbar pins to the top of <em>this</em> container, not the window.
        </p>
        <DzAffix :offset-top="8" :target="getTarget" @change="affixed = $event">
          <div
            class="px-4 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2"
            :class="affixed ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800'"
          >
            <span>Toolbar</span>
            <span class="text-xs opacity-75">{{ affixed ? '(pinned)' : '(in flow)' }}</span>
          </div>
        </DzAffix>
        <div style="height: 700px" class="bg-gray-50 rounded mt-4 flex items-center justify-center text-xs text-gray-400">
          scrollable region
        </div>
      </div>
    `,
  }),
}
