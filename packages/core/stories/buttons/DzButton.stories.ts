import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/test'
import { ChevronRight, Download, Mail, Plus, Search } from 'lucide-vue-next'
import { DzButton } from '../../src/components/buttons'
import { DzIcon } from '../../src/components/media'

/**
 * DzButton is the primary interactive button component.
 *
 * It supports five visual variants (`solid`, `outline`, `ghost`, `text`, `link`),
 * six semantic tones, five sizes, loading/disabled states, and prefix/suffix icon slots.
 */
const meta = {
  title: 'Core/Buttons/DzButton',
  component: DzButton,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'text', 'link'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state -- shows spinner and sets aria-busy',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
      table: { category: 'Behavior', defaultValue: { summary: 'button' } },
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (slot content becomes the root)',
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
    variant: 'solid',
    size: 'md',
    tone: 'primary',
    disabled: false,
    loading: false,
  },
} satisfies Meta<typeof DzButton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzButton },
    setup() {
      return { args }
    },
    template: '<DzButton v-bind="args">Button</DzButton>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzButton variant="solid">Solid</DzButton>
        <DzButton variant="outline">Outline</DzButton>
        <DzButton variant="ghost">Ghost</DzButton>
        <DzButton variant="text">Text</DzButton>
        <DzButton variant="link">Link</DzButton>
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
    components: { DzButton },
    template: `
      <div class="flex items-end gap-4">
        <DzButton size="xs">Extra Small</DzButton>
        <DzButton size="sm">Small</DzButton>
        <DzButton size="md">Medium</DzButton>
        <DzButton size="lg">Large</DzButton>
        <DzButton size="xl">Extra Large</DzButton>
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
    components: { DzButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzButton tone="neutral">Neutral</DzButton>
        <DzButton tone="primary">Primary</DzButton>
        <DzButton tone="success">Success</DzButton>
        <DzButton tone="warning">Warning</DzButton>
        <DzButton tone="danger">Danger</DzButton>
        <DzButton tone="info">Info</DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: args => ({
    components: { DzButton },
    setup() {
      return { args }
    },
    template: '<DzButton v-bind="args">Saving...</DzButton>',
  }),
}

// ---------------------------------------------------------------------------
// Disabled State
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { DzButton },
    setup() {
      return { args }
    },
    template: '<DzButton v-bind="args">Disabled</DzButton>',
  }),
}

// ---------------------------------------------------------------------------
// States (disabled + loading side by side)
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzButton },
    template: `
      <div class="flex gap-4 items-center">
        <DzButton>Default</DzButton>
        <DzButton disabled>Disabled</DzButton>
        <DzButton loading>Loading</DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix Icon
// ---------------------------------------------------------------------------

export const WithPrefixIcon: Story = {
  name: 'With Prefix Icon',
  render: () => ({
    components: { DzButton, DzIcon },
    setup() {
      return { Plus, Mail }
    },
    template: `
      <div class="flex gap-4 items-center">
        <DzButton>
          <template #prefix><DzIcon :icon="Plus" size="sm" /></template>
          Add Item
        </DzButton>
        <DzButton variant="outline" tone="neutral">
          <template #prefix><DzIcon :icon="Mail" size="sm" /></template>
          Send Email
        </DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Suffix Icon
// ---------------------------------------------------------------------------

export const WithSuffixIcon: Story = {
  name: 'With Suffix Icon',
  render: () => ({
    components: { DzButton, DzIcon },
    setup() {
      return { ChevronRight, Download }
    },
    template: `
      <div class="flex gap-4 items-center">
        <DzButton>
          Continue
          <template #suffix><DzIcon :icon="ChevronRight" size="sm" /></template>
        </DzButton>
        <DzButton variant="outline">
          Download
          <template #suffix><DzIcon :icon="Download" size="sm" /></template>
        </DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix and Suffix Icons
// ---------------------------------------------------------------------------

export const WithPrefixAndSuffix: Story = {
  name: 'With Prefix and Suffix Icons',
  render: () => ({
    components: { DzButton, DzIcon },
    setup() {
      return { Search, ChevronRight }
    },
    template: `
      <DzButton>
        <template #prefix><DzIcon :icon="Search" size="sm" /></template>
        Search
        <template #suffix><DzIcon :icon="ChevronRight" size="sm" /></template>
      </DzButton>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Visual Matrix: Variant x Tone
// ---------------------------------------------------------------------------

export const VariantToneMatrix: Story = {
  name: 'Visual Matrix: Variant x Tone',
  render: () => ({
    components: { DzButton },
    template: `
      <div class="space-y-6">
        <div v-for="variant in ['solid', 'outline', 'ghost', 'text', 'link']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize">{{ variant }}</p>
          <div class="flex flex-wrap gap-3 items-center">
            <DzButton :variant="variant" tone="neutral">Neutral</DzButton>
            <DzButton :variant="variant" tone="primary">Primary</DzButton>
            <DzButton :variant="variant" tone="success">Success</DzButton>
            <DzButton :variant="variant" tone="warning">Warning</DzButton>
            <DzButton :variant="variant" tone="danger">Danger</DzButton>
            <DzButton :variant="variant" tone="info">Info</DzButton>
          </div>
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
    components: { DzButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzButton variant="solid">Solid</DzButton>
        <DzButton variant="outline">Outline</DzButton>
        <DzButton variant="ghost">Ghost</DzButton>
        <DzButton variant="text">Text</DzButton>
        <DzButton variant="link">Link</DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Click Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzButton },
    setup() {
      const count = { value: 0 }
      return { count }
    },
    data() {
      return { clickCount: 0 }
    },
    template: `
      <div class="flex items-center gap-4">
        <DzButton @click="clickCount++">Clicked {{ clickCount }} times</DzButton>
        <DzButton variant="outline" tone="danger" @click="clickCount = 0">Reset</DzButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /clicked/i })
    await userEvent.click(button)
    button.focus()
  },
}

// ---------------------------------------------------------------------------
// Accessibility: Focus States
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab through the buttons to see focus rings.</p>
        <div class="flex gap-4">
          <DzButton aria-label="First action" variant="solid">First</DzButton>
          <DzButton aria-label="Second action" variant="outline">Second</DzButton>
          <DzButton aria-label="Third action" variant="ghost">Third</DzButton>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Form Actions
// ---------------------------------------------------------------------------

export const RealWorldFormActions: Story = {
  name: 'Real World: Form Actions',
  render: () => ({
    components: { DzButton },
    template: `
      <div class="flex justify-end gap-3 border-t pt-4">
        <DzButton variant="ghost" tone="neutral">Cancel</DzButton>
        <DzButton variant="outline" tone="neutral">Save Draft</DzButton>
        <DzButton tone="primary">Submit</DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Danger Confirmation
// ---------------------------------------------------------------------------

export const RealWorldDangerAction: Story = {
  name: 'Real World: Danger Confirmation',
  render: () => ({
    components: { DzButton },
    template: `
      <div class="space-y-3 max-w-sm">
        <p class="text-sm">Are you sure you want to delete this item? This action cannot be undone.</p>
        <div class="flex gap-3">
          <DzButton variant="outline" tone="neutral">Cancel</DzButton>
          <DzButton tone="danger">Delete</DzButton>
        </div>
      </div>
    `,
  }),
}
