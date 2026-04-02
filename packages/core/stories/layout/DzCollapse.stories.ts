import type { Meta, StoryObj } from '@storybook/vue3'
import { DzCollapse, DzStack } from '../../src/components/layout'

/**
 * DzCollapse is an animated expand/collapse container.
 *
 * It uses `defineModel<boolean>()` for v-model binding and the
 * `useCollapse()` composable for smooth height transitions.
 * The `duration` prop controls animation speed.
 */
const meta = {
  title: 'Core/Layout/DzCollapse',
  component: DzCollapse,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modelValue: {
      control: 'boolean',
      description: 'Whether the collapse is expanded (v-model)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    duration: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Animation duration in milliseconds',
      table: { category: 'Behavior', defaultValue: { summary: '200' } },
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
    modelValue: true,
    duration: 200,
  },
} satisfies Meta<typeof DzCollapse>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCollapse },
    setup() {
      return { args }
    },
    data() {
      return { open: true }
    },
    template: `
      <div>
        <button
          @click="open = !open"
          class="text-sm px-4 py-2 bg-blue-500 text-white rounded mb-3"
        >
          {{ open ? 'Collapse' : 'Expand' }}
        </button>
        <DzCollapse v-model="open" :duration="args.duration">
          <div class="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">
            <p>This content animates in and out with a smooth height transition.</p>
            <p class="mt-2">The animation duration is {{ args.duration }}ms.</p>
          </div>
        </DzCollapse>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Duration Gallery
// ---------------------------------------------------------------------------

export const DurationGallery: Story = {
  name: 'Duration Gallery',
  render: () => ({
    components: { DzCollapse },
    data() {
      return {
        durations: [100, 200, 400, 800],
        states: { 100: true, 200: true, 400: true, 800: true },
      }
    },
    template: `
      <div class="space-y-6">
        <div v-for="d in durations" :key="d">
          <div class="flex items-center gap-3 mb-2">
            <button
              @click="states[d] = !states[d]"
              class="text-xs px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
            >
              {{ states[d] ? 'Collapse' : 'Expand' }}
            </button>
            <p class="text-xs text-gray-500">duration={{ d }}ms</p>
          </div>
          <DzCollapse v-model="states[d]" :duration="d">
            <div class="bg-blue-50 text-blue-800 text-sm p-3 rounded">
              Content with {{ d }}ms animation.
            </div>
          </DzCollapse>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Initially Collapsed
// ---------------------------------------------------------------------------

export const InitiallyClosed: Story = {
  name: 'Initially Collapsed',
  render: () => ({
    components: { DzCollapse },
    data() {
      return { open: false }
    },
    template: `
      <div>
        <button
          @click="open = !open"
          class="text-sm px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mb-3"
        >
          {{ open ? 'Hide details' : 'Show details' }}
        </button>
        <DzCollapse v-model="open">
          <div class="bg-amber-50 text-amber-800 text-sm p-4 rounded-lg">
            <p>This content starts collapsed and expands on click.</p>
          </div>
        </DzCollapse>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multiple Collapsible Sections
// ---------------------------------------------------------------------------

export const MultipleSections: Story = {
  name: 'Multiple Sections',
  render: () => ({
    components: { DzCollapse, DzStack },
    data() {
      return { sections: { a: true, b: false, c: false } }
    },
    template: `
      <DzStack gap="none" class="border rounded-lg divide-y max-w-md">
        <div v-for="(key, label) in { a: 'Section A', b: 'Section B', c: 'Section C' }" :key="key">
          <button
            @click="sections[key] = !sections[key]"
            class="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex justify-between items-center"
            :aria-expanded="sections[key]"
          >
            {{ label }}
            <span class="text-gray-400 transition-transform" :class="{ 'rotate-180': sections[key] }">
              &#x25BC;
            </span>
          </button>
          <DzCollapse v-model="sections[key]">
            <div class="px-4 pb-4 text-sm text-gray-600">
              Content for {{ label }}. Click the header to toggle visibility.
            </div>
          </DzCollapse>
        </div>
      </DzStack>
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
    components: { DzCollapse },
    data() {
      return { open: true }
    },
    template: `
      <div>
        <button
          @click="open = !open"
          class="text-sm px-4 py-2 bg-gray-700 text-gray-200 rounded mb-3"
        >
          {{ open ? 'Collapse' : 'Expand' }}
        </button>
        <DzCollapse v-model="open">
          <div class="bg-gray-800 text-gray-200 text-sm p-4 rounded-lg border border-gray-700">
            Collapsible content in dark mode.
          </div>
        </DzCollapse>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Toggle Counter
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Toggle Counter',
  render: () => ({
    components: { DzCollapse },
    data() {
      return { open: false, toggleCount: 0 }
    },
    methods: {
      toggle() {
        this.open = !this.open
        this.toggleCount++
      },
    },
    template: `
      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <button
            @click="toggle"
            class="text-sm px-4 py-2 bg-blue-500 text-white rounded"
          >
            Toggle
          </button>
          <span class="text-sm text-gray-500">Toggled {{ toggleCount }} times</span>
        </div>
        <DzCollapse v-model="open">
          <div class="bg-green-50 text-green-800 text-sm p-4 rounded-lg">
            The collapse state is tracked by the parent via v-model.
          </div>
        </DzCollapse>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: FAQ
// ---------------------------------------------------------------------------

export const RealWorldFAQ: Story = {
  name: 'Real World: FAQ Section',
  render: () => ({
    components: { DzCollapse },
    data() {
      return {
        faqs: [
          { q: 'What is DzCollapse?', a: 'An animated expand/collapse container component that uses smooth height transitions.', open: false },
          { q: 'How do I control the animation speed?', a: 'Use the duration prop to set the animation time in milliseconds. The default is 200ms.', open: false },
          { q: 'Does it respect reduced motion?', a: 'Yes, DzCollapse includes a @media (prefers-reduced-motion: reduce) rule that sets transition duration to near-zero.', open: false },
          { q: 'Can I nest DzCollapse components?', a: 'Yes, DzCollapse can be nested. Each instance manages its own v-model state independently.', open: false },
        ],
      }
    },
    template: `
      <div class="max-w-lg border rounded-lg divide-y">
        <div v-for="(faq, i) in faqs" :key="i">
          <button
            @click="faq.open = !faq.open"
            class="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex justify-between items-center"
            :aria-expanded="faq.open"
          >
            {{ faq.q }}
            <span class="text-gray-400 text-xs transition-transform" :class="{ 'rotate-180': faq.open }">
              &#x25BC;
            </span>
          </button>
          <DzCollapse v-model="faq.open">
            <div class="px-4 pb-4 text-sm text-gray-600">
              {{ faq.a }}
            </div>
          </DzCollapse>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Filter Panel
// ---------------------------------------------------------------------------

export const RealWorldFilterPanel: Story = {
  name: 'Real World: Filter Panel',
  render: () => ({
    components: { DzCollapse },
    data() {
      return {
        filters: {
          category: true,
          price: false,
          rating: false,
        },
      }
    },
    template: `
      <div class="w-64 border rounded-lg divide-y">
        <div>
          <button
            @click="filters.category = !filters.category"
            class="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
            :aria-expanded="filters.category"
          >
            Category
          </button>
          <DzCollapse v-model="filters.category">
            <div class="px-3 pb-3 space-y-1">
              <label v-for="c in ['Electronics', 'Clothing', 'Books', 'Home']" :key="c"
                class="flex items-center gap-2 text-sm">
                <input type="checkbox" class="rounded" />
                {{ c }}
              </label>
            </div>
          </DzCollapse>
        </div>
        <div>
          <button
            @click="filters.price = !filters.price"
            class="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
            :aria-expanded="filters.price"
          >
            Price Range
          </button>
          <DzCollapse v-model="filters.price">
            <div class="px-3 pb-3 space-y-1">
              <label v-for="p in ['Under $25', '$25 - $50', '$50 - $100', 'Over $100']" :key="p"
                class="flex items-center gap-2 text-sm">
                <input type="radio" name="price" class="rounded-full" />
                {{ p }}
              </label>
            </div>
          </DzCollapse>
        </div>
        <div>
          <button
            @click="filters.rating = !filters.rating"
            class="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
            :aria-expanded="filters.rating"
          >
            Rating
          </button>
          <DzCollapse v-model="filters.rating">
            <div class="px-3 pb-3 space-y-1">
              <label v-for="r in ['4+ Stars', '3+ Stars', '2+ Stars']" :key="r"
                class="flex items-center gap-2 text-sm">
                <input type="checkbox" class="rounded" />
                {{ r }}
              </label>
            </div>
          </DzCollapse>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ARIA States',
  render: () => ({
    components: { DzCollapse },
    data() {
      return { open: false }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzCollapse sets data-state="open"/"closed" and aria-hidden on the
          collapsible region. The trigger button should use aria-expanded
          and aria-controls to link to the collapse region.
        </p>
        <div>
          <button
            @click="open = !open"
            :aria-expanded="open"
            aria-controls="collapse-demo"
            class="text-sm px-4 py-2 bg-blue-500 text-white rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-2"
          >
            {{ open ? 'Hide' : 'Show' }} Content
          </button>
          <DzCollapse v-model="open" id="collapse-demo" aria-label="Demo collapsible region">
            <div class="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">
              This region uses aria-hidden when collapsed and is linked
              to its trigger via aria-controls.
            </div>
          </DzCollapse>
        </div>
      </div>
    `,
  }),
}
