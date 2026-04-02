import type { Meta, StoryObj } from '@storybook/vue3'
import { DzTag } from '../../src/components/data'

/**
 * DzTag is a categorization label component, semantically for classification
 * and filtering (as opposed to DzChip which represents user input/actions).
 *
 * It supports three visual variants (`solid`, `outline`, `subtle`),
 * six semantic tones, three sizes, and optional close/dismiss behavior.
 */

const meta = {
  title: 'Core/Data/DzTag',
  component: DzTag,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'subtle' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    closable: {
      control: 'boolean',
      description: 'Whether the tag can be dismissed/closed',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
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
    variant: 'subtle',
    tone: 'neutral',
    size: 'md',
    closable: false,
    disabled: false,
  },
} satisfies Meta<typeof DzTag>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTag },
    setup() {
      return { args }
    },
    template: '<DzTag v-bind="args">Tag</DzTag>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="flex flex-wrap gap-3 items-center">
        <DzTag variant="solid">Solid</DzTag>
        <DzTag variant="outline">Outline</DzTag>
        <DzTag variant="subtle">Subtle</DzTag>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="flex items-center gap-3">
        <DzTag size="sm">Small</DzTag>
        <DzTag size="md">Medium</DzTag>
        <DzTag size="lg">Large</DzTag>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="space-y-4">
        <div v-for="v in ['solid', 'outline', 'subtle']" :key="v">
          <p class="text-sm font-medium mb-2 capitalize">{{ v }}</p>
          <div class="flex flex-wrap gap-3">
            <DzTag :variant="v" tone="neutral">Neutral</DzTag>
            <DzTag :variant="v" tone="primary">Primary</DzTag>
            <DzTag :variant="v" tone="success">Success</DzTag>
            <DzTag :variant="v" tone="warning">Warning</DzTag>
            <DzTag :variant="v" tone="danger">Danger</DzTag>
            <DzTag :variant="v" tone="info">Info</DzTag>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Closable
// ---------------------------------------------------------------------------

export const Closable: Story = {
  name: 'Closable Tags',
  render: () => ({
    components: { DzTag },
    data() {
      return {
        categories: ['Frontend', 'Backend', 'DevOps', 'Design', 'QA'],
      }
    },
    template: `
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <DzTag
            v-for="cat in categories"
            :key="cat"
            closable
            tone="primary"
            variant="outline"
            @close="categories = categories.filter(c => c !== cat)"
          >{{ cat }}</DzTag>
        </div>
        <p class="text-sm text-gray-500">{{ categories.length }} tags remaining</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    closable: true,
  },
  render: args => ({
    components: { DzTag },
    setup() {
      return { args }
    },
    template: '<DzTag v-bind="args">Disabled Tag</DzTag>',
  }),
}

// ---------------------------------------------------------------------------
// With Prefix Slot
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Prefix Slot',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="flex flex-wrap gap-3">
        <DzTag tone="danger" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Bug
        </DzTag>
        <DzTag tone="success" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Feature
        </DzTag>
        <DzTag tone="info" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Documentation
        </DzTag>
        <DzTag tone="warning" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Enhancement
        </DzTag>
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
    components: { DzTag },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <DzTag variant="solid" tone="primary">Solid</DzTag>
          <DzTag variant="outline" tone="primary">Outline</DzTag>
          <DzTag variant="subtle" tone="primary">Subtle</DzTag>
        </div>
        <div class="flex flex-wrap gap-3">
          <DzTag tone="success">Success</DzTag>
          <DzTag tone="warning">Warning</DzTag>
          <DzTag tone="danger">Danger</DzTag>
          <DzTag tone="info">Info</DzTag>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus & Dismiss',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Closable tags include a dismiss button in the tab order.
          Press Enter or Space on the close button to remove the tag.
          Disabled tags are excluded from the tab order.
        </p>
        <div class="flex flex-wrap gap-3">
          <DzTag closable tone="primary">Focusable</DzTag>
          <DzTag closable tone="success">Also Focusable</DzTag>
          <DzTag closable disabled tone="neutral">Disabled (Skipped)</DzTag>
          <DzTag closable tone="danger">Focusable</DzTag>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Issue Labels
// ---------------------------------------------------------------------------

export const RealWorldIssueLabels: Story = {
  name: 'Real World: Issue Labels',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="max-w-lg space-y-4">
        <div class="border rounded-lg p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium">Fix accordion animation glitch</p>
              <p class="text-sm text-gray-500">#342 opened 2 hours ago by alice</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <DzTag tone="danger" variant="subtle" size="sm">bug</DzTag>
            <DzTag tone="primary" variant="subtle" size="sm">component: accordion</DzTag>
            <DzTag tone="warning" variant="subtle" size="sm">priority: high</DzTag>
          </div>
        </div>
        <div class="border rounded-lg p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium">Add keyboard shortcut support to DzTree</p>
              <p class="text-sm text-gray-500">#338 opened 1 day ago by bob</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <DzTag tone="success" variant="subtle" size="sm">feature</DzTag>
            <DzTag tone="primary" variant="subtle" size="sm">component: tree</DzTag>
            <DzTag tone="info" variant="subtle" size="sm">accessibility</DzTag>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Article Categories
// ---------------------------------------------------------------------------

export const RealWorldCategories: Story = {
  name: 'Real World: Article Categories',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="max-w-sm space-y-4">
        <div class="space-y-2">
          <h3 class="font-semibold">Building a Design System in 2026</h3>
          <p class="text-sm text-gray-600">A guide to modern component architecture with Vue 3 and Tailwind CSS 4.</p>
          <div class="flex flex-wrap gap-2">
            <DzTag size="sm" variant="outline" tone="neutral">Design Systems</DzTag>
            <DzTag size="sm" variant="outline" tone="neutral">Vue.js</DzTag>
            <DzTag size="sm" variant="outline" tone="neutral">Tailwind CSS</DzTag>
          </div>
        </div>
      </div>
    `,
  }),
}
