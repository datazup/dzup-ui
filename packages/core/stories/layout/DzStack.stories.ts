import type { Meta, StoryObj } from '@storybook/vue3'
import { DzStack } from '../../src/components/layout'

/**
 * DzStack is a simplified vertical/horizontal stack layout.
 *
 * It is a convenience wrapper over flexbox for common stacking patterns.
 * Use DzFlex for more fine-grained control over alignment and justification.
 */
const meta = {
  title: 'Core/Layout/DzStack',
  component: DzStack,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Stack direction',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between stack items',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Align items along the cross axis',
      table: { category: 'Appearance' },
    },
    // Behavior
    as: {
      control: 'select',
      options: ['div', 'section', 'ul', 'ol', 'nav'],
      description: 'HTML element to render as',
      table: { category: 'Behavior', defaultValue: { summary: 'div' } },
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
    direction: 'vertical',
    gap: 'md',
  },
} satisfies Meta<typeof DzStack>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzStack },
    setup() {
      return { args }
    },
    template: `
      <DzStack v-bind="args">
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">Item A</div>
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">Item B</div>
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">Item C</div>
      </DzStack>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Direction Gallery
// ---------------------------------------------------------------------------

export const AllDirections: Story = {
  name: 'Direction Gallery',
  render: () => ({
    components: { DzStack },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-xs text-gray-500 mb-2">direction="vertical" (default)</p>
          <DzStack direction="vertical" gap="sm" class="border border-dashed border-gray-200 p-3 rounded">
            <div class="bg-green-100 text-green-800 text-sm p-3 rounded">A</div>
            <div class="bg-green-100 text-green-800 text-sm p-3 rounded">B</div>
            <div class="bg-green-100 text-green-800 text-sm p-3 rounded">C</div>
          </DzStack>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">direction="horizontal"</p>
          <DzStack direction="horizontal" gap="sm" class="border border-dashed border-gray-200 p-3 rounded">
            <div class="bg-green-100 text-green-800 text-sm p-3 rounded">A</div>
            <div class="bg-green-100 text-green-800 text-sm p-3 rounded">B</div>
            <div class="bg-green-100 text-green-800 text-sm p-3 rounded">C</div>
          </DzStack>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Gap Gallery
// ---------------------------------------------------------------------------

export const AllGaps: Story = {
  name: 'Gap Gallery',
  render: () => ({
    components: { DzStack },
    template: `
      <div class="space-y-6">
        <div v-for="g in ['none', 'xs', 'sm', 'md', 'lg', 'xl']" :key="g">
          <p class="text-xs text-gray-500 mb-2">gap="{{ g }}"</p>
          <DzStack :gap="g" direction="horizontal">
            <div v-for="i in 4" :key="i"
              class="bg-purple-100 text-purple-800 text-sm px-4 py-2 rounded">
              {{ i }}
            </div>
          </DzStack>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Alignment Gallery
// ---------------------------------------------------------------------------

export const AllAlignments: Story = {
  name: 'Align Gallery',
  render: () => ({
    components: { DzStack },
    template: `
      <div class="space-y-6">
        <div v-for="a in ['start', 'center', 'end', 'stretch']" :key="a">
          <p class="text-xs text-gray-500 mb-2">align="{{ a }}"</p>
          <DzStack :align="a" gap="sm" class="border border-dashed border-gray-200 p-3 rounded">
            <div class="bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded w-24">Short</div>
            <div class="bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded w-40">A bit longer</div>
            <div class="bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded w-32">Medium</div>
          </DzStack>
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
    components: { DzStack },
    template: `
      <DzStack gap="md">
        <div class="bg-gray-700 text-gray-200 text-sm p-3 rounded">Item A</div>
        <div class="bg-gray-700 text-gray-200 text-sm p-3 rounded">Item B</div>
        <div class="bg-gray-700 text-gray-200 text-sm p-3 rounded">Item C</div>
      </DzStack>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Form Fields
// ---------------------------------------------------------------------------

export const RealWorldFormFields: Story = {
  name: 'Real World: Form Fields',
  render: () => ({
    components: { DzStack },
    template: `
      <DzStack gap="lg" class="max-w-sm">
        <div class="space-y-1">
          <label class="text-sm font-medium">Name</label>
          <input type="text" class="w-full border rounded px-3 py-2 text-sm" placeholder="John Doe" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Email</label>
          <input type="email" class="w-full border rounded px-3 py-2 text-sm" placeholder="john@example.com" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Message</label>
          <textarea class="w-full border rounded px-3 py-2 text-sm" rows="3" placeholder="Your message..." />
        </div>
        <button class="bg-blue-500 text-white px-4 py-2 rounded text-sm">Submit</button>
      </DzStack>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: User Profile
// ---------------------------------------------------------------------------

export const RealWorldUserProfile: Story = {
  name: 'Real World: User Profile',
  render: () => ({
    components: { DzStack },
    template: `
      <DzStack direction="horizontal" gap="md" align="center">
        <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">JD</div>
        <DzStack gap="xs">
          <span class="font-semibold text-sm">Jane Doe</span>
          <span class="text-xs text-gray-500">Senior Developer</span>
        </DzStack>
      </DzStack>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: List Semantics',
  render: () => ({
    components: { DzStack },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Stack rendered as a semantic list for screen readers.</p>
        <DzStack as="ul" gap="sm" aria-label="Task list">
          <li class="bg-blue-50 p-3 rounded text-sm">Complete the design review</li>
          <li class="bg-blue-50 p-3 rounded text-sm">Update component documentation</li>
          <li class="bg-blue-50 p-3 rounded text-sm">Run accessibility audit</li>
        </DzStack>
      </div>
    `,
  }),
}
