import type { Meta, StoryObj } from '@storybook/vue3'
import { DzText } from '../../src/components/typography'

/**
 * DzText is a general-purpose text component with semantic element control and visual styling.
 *
 * Renders text in any inline or block element (`p`, `span`, `div`, `label`, `small`, `strong`, `em`)
 * with consistent sizing, weight, color tone, and alignment.
 */
const meta = {
  title: 'Core/Typography/DzText',
  component: DzText,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'label', 'small', 'strong', 'em'],
      description: 'HTML element to render',
      table: { category: 'Appearance', defaultValue: { summary: 'p' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Text size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight override',
      table: { category: 'Appearance' },
    },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'success', 'warning', 'danger'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment',
      table: { category: 'Appearance' },
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis when overflowing',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Accessible identifier',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    as: 'p',
    size: 'md',
    tone: 'default',
    truncate: false,
  },
} satisfies Meta<typeof DzText>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzText },
    setup() {
      return { args }
    },
    template: '<DzText v-bind="args">The quick brown fox jumps over the lazy dog.</DzText>',
  }),
}

// ---------------------------------------------------------------------------
// All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-3">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="flex items-baseline gap-4">
          <span class="text-xs font-mono w-8 text-gray-400 shrink-0">{{ size }}</span>
          <DzText :size="size">The quick brown fox jumps over the lazy dog.</DzText>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Tones
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-3">
        <div v-for="tone in ['default', 'muted', 'success', 'warning', 'danger']" :key="tone" class="flex items-baseline gap-4">
          <span class="text-xs font-mono w-16 text-gray-400 shrink-0">{{ tone }}</span>
          <DzText :tone="tone">The quick brown fox jumps over the lazy dog.</DzText>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Weights
// ---------------------------------------------------------------------------

export const AllWeights: Story = {
  name: 'Weight Gallery',
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-3">
        <div v-for="weight in ['light', 'normal', 'medium', 'semibold', 'bold']" :key="weight" class="flex items-baseline gap-4">
          <span class="text-xs font-mono w-20 text-gray-400 shrink-0">{{ weight }}</span>
          <DzText :weight="weight">The quick brown fox jumps over the lazy dog.</DzText>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Elements
// ---------------------------------------------------------------------------

export const AllElements: Story = {
  name: 'Element Gallery',
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-3">
        <div v-for="el in ['p', 'span', 'div', 'label', 'small', 'strong', 'em']" :key="el" class="flex items-baseline gap-4">
          <span class="text-xs font-mono w-16 text-gray-400 shrink-0">&lt;{{ el }}&gt;</span>
          <DzText :as="el">Rendered as a {{ el }} element.</DzText>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Alignment
// ---------------------------------------------------------------------------

export const Alignment: Story = {
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-3 max-w-lg">
        <DzText align="left">Left aligned text content.</DzText>
        <DzText align="center">Center aligned text content.</DzText>
        <DzText align="right">Right aligned text content.</DzText>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Truncation
// ---------------------------------------------------------------------------

export const Truncation: Story = {
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-4">
        <div class="max-w-xs">
          <DzText truncate>
            This is a very long line of text that will be truncated with an ellipsis because it overflows its container width.
          </DzText>
        </div>
        <div class="max-w-xs">
          <DzText>
            This is a very long line of text that will NOT be truncated and will wrap to multiple lines naturally.
          </DzText>
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
    components: { DzText },
    template: `
      <div class="space-y-3">
        <DzText tone="default">Default text in dark mode.</DzText>
        <DzText tone="muted">Muted text in dark mode.</DzText>
        <DzText tone="success">Success text in dark mode.</DzText>
        <DzText tone="warning">Warning text in dark mode.</DzText>
        <DzText tone="danger">Danger text in dark mode.</DzText>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Elements',
  render: () => ({
    components: { DzText },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Using the correct semantic element improves screen reader experience.
          Use &lt;label&gt; for form labels, &lt;strong&gt; for importance, &lt;em&gt; for emphasis.
        </p>
        <div class="space-y-2">
          <DzText as="label" weight="medium" id="email-label">Email address</DzText>
          <DzText as="p" tone="muted" size="sm">We will never share your email.</DzText>
          <DzText as="strong" tone="danger">Required field</DzText>
          <DzText as="em" tone="muted" size="sm">Italic for emphasis.</DzText>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Composition: Paragraph with Mixed Styles
// ---------------------------------------------------------------------------

export const Composition: Story = {
  name: 'Composition: Mixed Content',
  render: () => ({
    components: { DzText },
    template: `
      <div class="max-w-lg space-y-3">
        <DzText size="lg" weight="semibold">Introduction</DzText>
        <DzText tone="default">
          This is a regular paragraph of body text that explains the feature in detail.
          It uses the default tone and size for comfortable reading.
        </DzText>
        <DzText tone="muted" size="sm">
          Note: This supplementary information is rendered in a muted tone at a smaller size
          to create a clear visual hierarchy.
        </DzText>
        <DzText tone="danger" size="sm" weight="medium">
          Warning: This action cannot be undone.
        </DzText>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Form Helper Text
// ---------------------------------------------------------------------------

export const RealWorldFormHelpers: Story = {
  name: 'Real World: Form Helper Text',
  render: () => ({
    components: { DzText },
    template: `
      <div class="max-w-sm space-y-4">
        <div class="space-y-1">
          <DzText as="label" weight="medium" size="sm">Username</DzText>
          <div class="border rounded px-3 py-2 text-sm">johndoe</div>
          <DzText size="xs" tone="muted">Must be 3-20 characters, letters and numbers only.</DzText>
        </div>
        <div class="space-y-1">
          <DzText as="label" weight="medium" size="sm">Password</DzText>
          <div class="border rounded px-3 py-2 text-sm">********</div>
          <DzText size="xs" tone="danger">Password must be at least 8 characters.</DzText>
        </div>
        <div class="space-y-1">
          <DzText as="label" weight="medium" size="sm">Email</DzText>
          <div class="border border-green-300 rounded px-3 py-2 text-sm">john@example.com</div>
          <DzText size="xs" tone="success">Email is available.</DzText>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Article Preview
// ---------------------------------------------------------------------------

export const RealWorldArticlePreview: Story = {
  name: 'Real World: Article Preview',
  render: () => ({
    components: { DzText },
    template: `
      <article class="max-w-md space-y-2">
        <DzText size="xs" tone="muted" weight="medium">TECHNOLOGY</DzText>
        <DzText size="lg" weight="bold">New Advances in Web Performance</DzText>
        <DzText tone="muted" size="sm" truncate>
          Researchers have discovered new techniques for improving web application performance
          that could reduce load times by up to 50% across all modern browsers.
        </DzText>
        <DzText size="xs" tone="muted">5 min read</DzText>
      </article>
    `,
  }),
}
