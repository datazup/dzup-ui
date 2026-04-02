import type { Meta, StoryObj } from '@storybook/vue3'
import { DzContainer } from '../../src/components/layout'

/**
 * DzContainer is a centered content container with responsive padding and max-width.
 *
 * It supports six max-width breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`, `full`),
 * optional horizontal padding, centering, and polymorphic rendering via the `as` prop.
 */
const meta = {
  title: 'Core/Layout/DzContainer',
  component: DzContainer,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Maximum width breakpoint for the container',
      table: { category: 'Appearance', defaultValue: { summary: 'xl' } },
    },
    padding: {
      control: 'boolean',
      description: 'Whether to apply horizontal padding',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    centered: {
      control: 'boolean',
      description: 'Whether to center the container horizontally',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    // Behavior
    as: {
      control: 'select',
      options: ['div', 'section', 'main', 'article', 'aside'],
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
    maxWidth: 'xl',
    padding: true,
    centered: true,
    as: 'div',
  },
} satisfies Meta<typeof DzContainer>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzContainer },
    setup() {
      return { args }
    },
    template: `
      <DzContainer v-bind="args" class="border border-dashed border-gray-300 p-4">
        <p>Content inside a default DzContainer.</p>
      </DzContainer>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Max-Width Gallery
// ---------------------------------------------------------------------------

export const AllMaxWidths: Story = {
  name: 'Max-Width Gallery',
  render: () => ({
    components: { DzContainer },
    template: `
      <div class="space-y-4">
        <div v-for="mw in ['sm', 'md', 'lg', 'xl', '2xl', 'full']" :key="mw">
          <p class="text-xs text-gray-500 mb-1 px-4">maxWidth="{{ mw }}"</p>
          <DzContainer :max-width="mw" class="border border-dashed border-gray-300 p-4">
            <div class="bg-blue-100 text-blue-800 text-sm p-2 rounded">
              Container with maxWidth="{{ mw }}"
            </div>
          </DzContainer>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// No Padding
// ---------------------------------------------------------------------------

export const NoPadding: Story = {
  name: 'Without Padding',
  args: {
    padding: false,
  },
  render: args => ({
    components: { DzContainer },
    setup() {
      return { args }
    },
    template: `
      <DzContainer v-bind="args" class="border border-dashed border-gray-300">
        <div class="bg-amber-100 text-amber-800 text-sm p-4">
          This container has no horizontal padding -- content touches the edges.
        </div>
      </DzContainer>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Not Centered
// ---------------------------------------------------------------------------

export const NotCentered: Story = {
  name: 'Not Centered',
  args: {
    centered: false,
    maxWidth: 'md',
  },
  render: args => ({
    components: { DzContainer },
    setup() {
      return { args }
    },
    template: `
      <DzContainer v-bind="args" class="border border-dashed border-gray-300 p-4">
        <div class="bg-green-100 text-green-800 text-sm p-2 rounded">
          Not centered -- aligned to the start.
        </div>
      </DzContainer>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Polymorphic Rendering
// ---------------------------------------------------------------------------

export const PolymorphicAs: Story = {
  name: 'Polymorphic Rendering',
  render: () => ({
    components: { DzContainer },
    template: `
      <div class="space-y-4">
        <DzContainer as="main" aria-label="Main content" class="border border-dashed border-gray-300 p-4">
          <p class="text-sm">Rendered as <code>&lt;main&gt;</code></p>
        </DzContainer>
        <DzContainer as="section" aria-label="Section content" class="border border-dashed border-gray-300 p-4">
          <p class="text-sm">Rendered as <code>&lt;section&gt;</code></p>
        </DzContainer>
        <DzContainer as="article" class="border border-dashed border-gray-300 p-4">
          <p class="text-sm">Rendered as <code>&lt;article&gt;</code></p>
        </DzContainer>
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
    components: { DzContainer },
    template: `
      <DzContainer max-width="lg" class="border border-dashed border-gray-600 p-4">
        <div class="text-sm text-gray-300">Container in dark mode context.</div>
      </DzContainer>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Page Layout
// ---------------------------------------------------------------------------

export const RealWorldPageLayout: Story = {
  name: 'Real World: Page Layout',
  render: () => ({
    components: { DzContainer },
    template: `
      <div class="space-y-0">
        <header class="bg-gray-100 py-4">
          <DzContainer max-width="xl">
            <div class="flex justify-between items-center">
              <span class="font-bold text-lg">App Logo</span>
              <nav class="flex gap-4 text-sm">
                <a href="#" class="text-blue-600">Home</a>
                <a href="#" class="text-gray-600">About</a>
                <a href="#" class="text-gray-600">Contact</a>
              </nav>
            </div>
          </DzContainer>
        </header>
        <main class="py-8">
          <DzContainer max-width="lg">
            <h1 class="text-2xl font-bold mb-4">Page Title</h1>
            <p class="text-gray-600">Page content sits inside a responsive container that constrains its max-width and adds consistent padding.</p>
          </DzContainer>
        </main>
        <footer class="bg-gray-50 py-4 border-t">
          <DzContainer max-width="xl">
            <p class="text-sm text-gray-500 text-center">Footer content</p>
          </DzContainer>
        </footer>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Landmarks',
  render: () => ({
    components: { DzContainer },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Containers render as semantic HTML elements with ARIA attributes for screen readers.</p>
        <DzContainer as="main" aria-label="Main content area" class="border border-dashed border-blue-300 p-4">
          <p class="text-sm">main with aria-label="Main content area"</p>
        </DzContainer>
        <DzContainer as="aside" aria-label="Sidebar" class="border border-dashed border-green-300 p-4">
          <p class="text-sm">aside with aria-label="Sidebar"</p>
        </DzContainer>
      </div>
    `,
  }),
}
