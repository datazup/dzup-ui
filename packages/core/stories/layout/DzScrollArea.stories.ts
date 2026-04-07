import type { Meta, StoryObj } from '@storybook/vue3'
import { DzScrollArea } from '../../src/components/layout'

/**
 * DzScrollArea provides custom styled scrollbars using Reka UI ScrollArea primitives.
 *
 * It supports vertical, horizontal, or both scrollbar orientations and
 * four scrollbar type modes: `auto`, `always`, `scroll`, and `hover`.
 */
const meta = {
  title: 'Core/Layout/DzScrollArea',
  component: DzScrollArea,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
      description: 'Which scrollbar(s) to display',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    type: {
      control: 'select',
      options: ['auto', 'always', 'scroll', 'hover'],
      description: 'Scrollbar visibility behavior',
      table: { category: 'Appearance', defaultValue: { summary: 'hover' } },
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
  },
  args: {
    orientation: 'vertical',
    type: 'hover',
  },
} satisfies Meta<typeof DzScrollArea>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzScrollArea },
    setup() {
      return { args }
    },
    template: `
      <DzScrollArea v-bind="args" class="h-48 w-72 border rounded-lg">
        <div class="p-4 space-y-2">
          <p v-for="i in 20" :key="i" class="text-sm text-gray-600">
            Line {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </DzScrollArea>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Orientation Gallery
// ---------------------------------------------------------------------------

export const AllOrientations: Story = {
  name: 'Orientation Gallery',
  render: () => ({
    components: { DzScrollArea },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-xs text-gray-500 mb-2">orientation="vertical"</p>
          <DzScrollArea orientation="vertical" class="h-40 w-64 border rounded-lg">
            <div class="p-4 space-y-2">
              <p v-for="i in 15" :key="i" class="text-sm text-gray-600">Vertical line {{ i }}</p>
            </div>
          </DzScrollArea>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">orientation="horizontal"</p>
          <DzScrollArea orientation="horizontal" class="h-20 w-64 border rounded-lg">
            <div class="p-4 flex gap-4" style="width: 800px;">
              <div v-for="i in 12" :key="i"
                class="bg-blue-100 text-blue-800 text-sm px-6 py-2 rounded shrink-0">
                Item {{ i }}
              </div>
            </div>
          </DzScrollArea>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">orientation="both"</p>
          <DzScrollArea orientation="both" class="h-40 w-64 border rounded-lg">
            <div class="p-4" style="width: 600px;">
              <p v-for="i in 15" :key="i" class="text-sm text-gray-600 whitespace-nowrap">
                Line {{ i }}: This is a very long line of text that extends well beyond the visible area of the scroll container.
              </p>
            </div>
          </DzScrollArea>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Scrollbar Type Gallery
// ---------------------------------------------------------------------------

export const AllTypes: Story = {
  name: 'Scrollbar Type Gallery',
  render: () => ({
    components: { DzScrollArea },
    template: `
      <div class="grid grid-cols-2 gap-6">
        <div v-for="t in ['auto', 'always', 'scroll', 'hover']" :key="t">
          <p class="text-xs text-gray-500 mb-2">type="{{ t }}"</p>
          <DzScrollArea :type="t" class="h-32 w-full border rounded-lg">
            <div class="p-4 space-y-2">
              <p v-for="i in 10" :key="i" class="text-sm text-gray-600">Line {{ i }}</p>
            </div>
          </DzScrollArea>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Horizontal Tag List
// ---------------------------------------------------------------------------

export const HorizontalTagList: Story = {
  name: 'Horizontal Tag List',
  render: () => ({
    components: { DzScrollArea },
    template: `
      <DzScrollArea orientation="horizontal" class="w-80 border rounded-lg">
        <div class="flex gap-2 p-3" style="width: max-content;">
          <span v-for="tag in ['Vue', 'React', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Astro', 'Nuxt', 'Next', 'Remix', 'SvelteKit']"
            :key="tag"
            class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full whitespace-nowrap">
            {{ tag }}
          </span>
        </div>
      </DzScrollArea>
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
    components: { DzScrollArea },
    template: `
      <DzScrollArea class="h-40 w-64 border border-gray-700 rounded-lg">
        <div class="p-4 space-y-2">
          <p v-for="i in 15" :key="i" class="text-sm text-gray-300">
            Line {{ i }}: Dark mode content
          </p>
        </div>
      </DzScrollArea>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Chat Messages
// ---------------------------------------------------------------------------

export const RealWorldChatMessages: Story = {
  name: 'Real World: Chat Messages',
  render: () => ({
    components: { DzScrollArea },
    template: `
      <div class="border rounded-lg max-w-sm">
        <div class="px-4 py-3 border-b font-semibold text-sm">Chat</div>
        <DzScrollArea class="h-64">
          <div class="p-4 space-y-3">
            <div v-for="i in 12" :key="i" class="flex gap-2">
              <div class="w-8 h-8 rounded-full shrink-0"
                :class="i % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'" />
              <div class="rounded-lg p-2 text-sm"
                :class="i % 2 === 0 ? 'bg-blue-50' : 'bg-gray-100'">
                Message {{ i }}: This is a chat message with some content.
              </div>
            </div>
          </div>
        </DzScrollArea>
        <div class="px-4 py-3 border-t">
          <input type="text" placeholder="Type a message..." class="w-full text-sm border rounded px-3 py-2" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Code Block
// ---------------------------------------------------------------------------

export const RealWorldCodeBlock: Story = {
  name: 'Real World: Code Block',
  render: () => ({
    components: { DzScrollArea },
    template: `
      <DzScrollArea orientation="both" class="h-48 w-96 bg-gray-900 rounded-lg">
        <pre class="p-4 text-sm text-gray-300 font-mono"><code>import { createApp } from 'vue'
import { DzScrollArea, DzContainer, DzGrid, DzFlex, DzStack } from '@dzup-ui/core'

const app = createApp({
  template: \`
    &lt;DzContainer max-width="lg"&gt;
      &lt;DzGrid :cols="{ sm: 1, md: 2, lg: 3 }" gap="md"&gt;
        &lt;div v-for="item in items" :key="item.id"&gt;
          {{ item.name }}
        &lt;/div&gt;
      &lt;/DzGrid&gt;
    &lt;/DzContainer&gt;
  \`,
})

app.mount('#app')</code></pre>
      </DzScrollArea>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Scrollable Region',
  render: () => ({
    components: { DzScrollArea },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzScrollArea uses Reka UI ScrollArea primitives, which handle ARIA
          attributes for the scrollable viewport. Content remains in the
          natural tab order.
        </p>
        <DzScrollArea class="h-40 w-64 border rounded-lg" aria-label="Scrollable list">
          <div class="p-4 space-y-2">
            <a v-for="i in 15" :key="i" href="#"
              class="block text-sm text-blue-600 hover:underline focus:ring-2 focus:ring-blue-500 rounded px-1">
              Focusable link {{ i }}
            </a>
          </div>
        </DzScrollArea>
      </div>
    `,
  }),
}
