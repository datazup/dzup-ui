import type { Meta, StoryObj } from '@storybook/vue3'
import { DzFlex, DzSpacer, DzStack } from '../../src/components/layout'

/**
 * DzSpacer is a flexible space filler component for layout spacing.
 *
 * When size is `auto`, it fills all available space with `flex: 1`.
 * Fixed sizes (`xs`, `sm`, `md`, `lg`, `xl`) use token-based spacing values.
 */
const meta = {
  title: 'Core/Layout/DzSpacer',
  component: DzSpacer,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'auto'],
      description: 'Size of the spacer. \'auto\' uses flex: 1 to fill available space',
      table: { category: 'Appearance', defaultValue: { summary: 'auto' } },
    },
  },
  args: {
    size: 'auto',
  },
} satisfies Meta<typeof DzSpacer>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSpacer, DzFlex },
    setup() {
      return { args }
    },
    template: `
      <DzFlex align="center" class="border border-dashed border-gray-200 p-3 rounded">
        <span class="text-sm font-medium">Left</span>
        <DzSpacer v-bind="args" />
        <span class="text-sm font-medium">Right</span>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzSpacer, DzFlex },
    template: `
      <div class="space-y-4">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl', 'auto']" :key="s">
          <p class="text-xs text-gray-500 mb-1">size="{{ s }}"</p>
          <DzFlex align="center" class="border border-dashed border-gray-200 p-3 rounded">
            <div class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">A</div>
            <DzSpacer :size="s" class="bg-red-50 border border-red-200 border-dashed rounded" />
            <div class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">B</div>
          </DzFlex>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Auto Spacer in Flex
// ---------------------------------------------------------------------------

export const AutoInFlex: Story = {
  name: 'Auto Spacer in Flex Row',
  render: () => ({
    components: { DzSpacer, DzFlex },
    template: `
      <DzFlex align="center" gap="sm" class="border border-gray-200 rounded-lg px-4 py-3">
        <span class="font-bold text-sm">Logo</span>
        <DzSpacer />
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-100">Settings</button>
        <button class="text-sm px-3 py-1.5 bg-blue-500 text-white rounded">Sign In</button>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Spacer in Stack
// ---------------------------------------------------------------------------

export const VerticalSpacer: Story = {
  name: 'Vertical Spacer in Stack',
  render: () => ({
    components: { DzSpacer, DzStack },
    template: `
      <DzStack gap="none" class="h-64 border border-dashed border-gray-200 p-3 rounded">
        <div class="bg-green-100 text-green-800 text-sm p-3 rounded">Header</div>
        <DzSpacer />
        <div class="bg-green-100 text-green-800 text-sm p-3 rounded">Footer (pushed to bottom)</div>
      </DzStack>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Fixed Sizes in Stack
// ---------------------------------------------------------------------------

export const FixedSizesInStack: Story = {
  name: 'Fixed Sizes in Stack',
  render: () => ({
    components: { DzSpacer, DzStack },
    template: `
      <DzStack gap="none">
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">Section A</div>
        <DzSpacer size="xs" />
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">xs gap</div>
        <DzSpacer size="md" />
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">md gap</div>
        <DzSpacer size="xl" />
        <div class="bg-blue-100 text-blue-800 text-sm p-3 rounded">xl gap</div>
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
    components: { DzSpacer, DzFlex },
    template: `
      <DzFlex align="center" class="border border-gray-600 p-3 rounded">
        <span class="text-sm text-gray-200">Left</span>
        <DzSpacer />
        <span class="text-sm text-gray-200">Right</span>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Card Footer
// ---------------------------------------------------------------------------

export const RealWorldCardFooter: Story = {
  name: 'Real World: Card Footer',
  render: () => ({
    components: { DzSpacer, DzFlex },
    template: `
      <div class="border rounded-lg p-4 max-w-sm">
        <h3 class="font-semibold mb-2">Subscription Plan</h3>
        <p class="text-sm text-gray-500 mb-4">Your current plan renews on April 15.</p>
        <DzFlex align="center">
          <span class="text-xs text-gray-400">$12/month</span>
          <DzSpacer />
          <button class="text-sm px-3 py-1.5 bg-blue-500 text-white rounded">Upgrade</button>
        </DzFlex>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: aria-hidden',
  render: () => ({
    components: { DzSpacer, DzFlex },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzSpacer renders with aria-hidden="true" since it is a purely visual element
          with no semantic meaning for screen readers.
        </p>
        <DzFlex align="center" class="border border-dashed border-gray-200 p-3 rounded">
          <span class="text-sm">Content A</span>
          <DzSpacer />
          <span class="text-sm">Content B</span>
        </DzFlex>
      </div>
    `,
  }),
}
