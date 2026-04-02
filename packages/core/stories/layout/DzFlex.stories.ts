import type { Meta, StoryObj } from '@storybook/vue3'
import { DzFlex } from '../../src/components/layout'

/**
 * DzFlex is a flexbox layout component with full control over direction,
 * alignment, justification, gap, wrapping, and inline vs block display.
 */
const meta = {
  title: 'Core/Layout/DzFlex',
  component: DzFlex,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    direction: {
      control: 'select',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      description: 'Flex direction',
      table: { category: 'Appearance', defaultValue: { summary: 'row' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Align items along the cross axis',
      table: { category: 'Appearance' },
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      description: 'Justify content along the main axis',
      table: { category: 'Appearance' },
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between flex items',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    wrap: {
      control: 'boolean',
      description: 'Whether to wrap items',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    inline: {
      control: 'boolean',
      description: 'Whether to use inline-flex instead of flex',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    // Behavior
    as: {
      control: 'select',
      options: ['div', 'section', 'nav', 'ul', 'ol', 'span'],
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
    direction: 'row',
    gap: 'md',
    wrap: false,
    inline: false,
  },
} satisfies Meta<typeof DzFlex>

export default meta
type Story = StoryObj<typeof meta>

function box(label: string, color = 'blue') {
  return `<div class="bg-${color}-100 text-${color}-800 text-sm px-4 py-2 rounded font-medium">${label}</div>`
}

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzFlex },
    setup() {
      return { args }
    },
    template: `
      <DzFlex v-bind="args">
        ${box('Item A')}
        ${box('Item B')}
        ${box('Item C')}
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Direction Gallery
// ---------------------------------------------------------------------------

export const AllDirections: Story = {
  name: 'Direction Gallery',
  render: () => ({
    components: { DzFlex },
    template: `
      <div class="space-y-6">
        <div v-for="dir in ['row', 'column', 'row-reverse', 'column-reverse']" :key="dir">
          <p class="text-xs text-gray-500 mb-2">direction="{{ dir }}"</p>
          <DzFlex :direction="dir" gap="sm" class="border border-dashed border-gray-200 p-3 rounded">
            <div class="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded">A</div>
            <div class="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded">B</div>
            <div class="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded">C</div>
          </DzFlex>
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
    components: { DzFlex },
    template: `
      <div class="space-y-6">
        <div v-for="a in ['start', 'center', 'end', 'stretch', 'baseline']" :key="a">
          <p class="text-xs text-gray-500 mb-2">align="{{ a }}"</p>
          <DzFlex :align="a" gap="sm" class="border border-dashed border-gray-200 p-3 rounded h-24">
            <div class="bg-green-100 text-green-800 text-sm px-4 py-1 rounded">Short</div>
            <div class="bg-green-100 text-green-800 text-sm px-4 py-4 rounded">Taller</div>
            <div class="bg-green-100 text-green-800 text-sm px-4 py-2 rounded">Medium</div>
          </DzFlex>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Justify Gallery
// ---------------------------------------------------------------------------

export const AllJustifications: Story = {
  name: 'Justify Gallery',
  render: () => ({
    components: { DzFlex },
    template: `
      <div class="space-y-6">
        <div v-for="j in ['start', 'center', 'end', 'between', 'around', 'evenly']" :key="j">
          <p class="text-xs text-gray-500 mb-2">justify="{{ j }}"</p>
          <DzFlex :justify="j" gap="sm" class="border border-dashed border-gray-200 p-3 rounded">
            <div class="bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded">A</div>
            <div class="bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded">B</div>
            <div class="bg-amber-100 text-amber-800 text-sm px-4 py-2 rounded">C</div>
          </DzFlex>
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
    components: { DzFlex },
    template: `
      <div class="space-y-6">
        <div v-for="g in ['none', 'xs', 'sm', 'md', 'lg', 'xl']" :key="g">
          <p class="text-xs text-gray-500 mb-2">gap="{{ g }}"</p>
          <DzFlex :gap="g">
            <div v-for="i in 4" :key="i"
              class="bg-purple-100 text-purple-800 text-sm px-4 py-2 rounded">
              {{ i }}
            </div>
          </DzFlex>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Wrapping
// ---------------------------------------------------------------------------

export const Wrapping: Story = {
  name: 'Wrap Enabled',
  args: {
    wrap: true,
    gap: 'md',
  },
  render: args => ({
    components: { DzFlex },
    setup() {
      return { args }
    },
    template: `
      <DzFlex v-bind="args" class="max-w-md border border-dashed border-gray-200 p-3 rounded">
        <div v-for="i in 10" :key="i"
          class="bg-blue-100 text-blue-800 text-sm px-6 py-3 rounded">
          Item {{ i }}
        </div>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Inline Flex
// ---------------------------------------------------------------------------

export const InlineFlex: Story = {
  name: 'Inline Flex',
  render: () => ({
    components: { DzFlex },
    template: `
      <p class="text-sm">
        Text before
        <DzFlex inline gap="xs" align="center" class="mx-1">
          <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Tag A</span>
          <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Tag B</span>
        </DzFlex>
        text after the inline flex.
      </p>
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
    components: { DzFlex },
    template: `
      <DzFlex gap="md" align="center">
        <div class="bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded">A</div>
        <div class="bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded">B</div>
        <div class="bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded">C</div>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Header Bar
// ---------------------------------------------------------------------------

export const RealWorldHeaderBar: Story = {
  name: 'Real World: Header Bar',
  render: () => ({
    components: { DzFlex },
    template: `
      <DzFlex justify="between" align="center" class="bg-white border-b px-6 py-3">
        <span class="font-bold text-lg">AppName</span>
        <DzFlex gap="sm" align="center">
          <span class="text-sm text-gray-600">user@example.com</span>
          <div class="w-8 h-8 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">U</div>
        </DzFlex>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Toolbar
// ---------------------------------------------------------------------------

export const RealWorldToolbar: Story = {
  name: 'Real World: Toolbar',
  render: () => ({
    components: { DzFlex },
    template: `
      <DzFlex as="nav" gap="xs" align="center" wrap class="bg-gray-50 border rounded-lg px-3 py-2">
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Bold</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Italic</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Underline</button>
        <div class="w-px h-5 bg-gray-300 mx-1" />
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Left</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Center</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Right</button>
      </DzFlex>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Navigation',
  render: () => ({
    components: { DzFlex },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab through items to verify focus order matches visual order across directions.</p>
        <DzFlex as="nav" gap="sm" aria-label="Primary navigation">
          <a href="#" class="text-sm px-3 py-2 rounded bg-blue-100 text-blue-800 focus:ring-2 focus:ring-blue-500">Home</a>
          <a href="#" class="text-sm px-3 py-2 rounded bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500">About</a>
          <a href="#" class="text-sm px-3 py-2 rounded bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500">Contact</a>
        </DzFlex>
      </div>
    `,
  }),
}
