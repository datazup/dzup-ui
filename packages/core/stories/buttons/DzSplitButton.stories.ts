import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzSplitButton,
  DzSplitButtonAction,
  DzSplitButtonMenu,
} from '../../src/components/buttons'

/**
 * DzSplitButton is a compound button component combining a primary action
 * button with a dropdown trigger. The root component provides variant, size,
 * tone, disabled, and loading context to its children via injection (ADR-08).
 *
 * Compound parts:
 * - `DzSplitButtonAction` -- primary action button (left side)
 * - `DzSplitButtonMenu` -- dropdown trigger button (right side)
 */
const meta = {
  title: 'Core/Buttons/DzSplitButton',
  component: DzSplitButton,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'text', 'link'],
      description: 'Visual style variant (inherited by children)',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size (inherited by children)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone (inherited by children)',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction on all children',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state -- shows spinner on the primary action',
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
      description: 'Accessible label for the button group',
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
} satisfies Meta<typeof DzSplitButton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    setup() {
      return { args }
    },
    template: `
      <DzSplitButton v-bind="args" aria-label="Save actions">
        <DzSplitButtonAction>Save</DzSplitButtonAction>
        <DzSplitButtonMenu aria-label="More save options" />
      </DzSplitButton>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSplitButton variant="solid" aria-label="Solid split">
          <DzSplitButtonAction>Solid</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="outline" aria-label="Outline split">
          <DzSplitButtonAction>Outline</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="ghost" aria-label="Ghost split">
          <DzSplitButtonAction>Ghost</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="text" aria-label="Text split">
          <DzSplitButtonAction>Text</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="link" aria-label="Link split">
          <DzSplitButtonAction>Link</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
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
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex items-end gap-4">
        <DzSplitButton size="xs" aria-label="XS split">
          <DzSplitButtonAction>XS</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton size="sm" aria-label="SM split">
          <DzSplitButtonAction>SM</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton size="md" aria-label="MD split">
          <DzSplitButtonAction>MD</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton size="lg" aria-label="LG split">
          <DzSplitButtonAction>LG</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton size="xl" aria-label="XL split">
          <DzSplitButtonAction>XL</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
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
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSplitButton tone="neutral" aria-label="Neutral split">
          <DzSplitButtonAction>Neutral</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="primary" aria-label="Primary split">
          <DzSplitButtonAction>Primary</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="success" aria-label="Success split">
          <DzSplitButtonAction>Success</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="warning" aria-label="Warning split">
          <DzSplitButtonAction>Warning</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="danger" aria-label="Danger split">
          <DzSplitButtonAction>Danger</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="info" aria-label="Info split">
          <DzSplitButtonAction>Info</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
      </div>
    `,
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
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    setup() {
      return { args }
    },
    template: `
      <DzSplitButton v-bind="args" aria-label="Disabled split">
        <DzSplitButtonAction>Disabled</DzSplitButtonAction>
        <DzSplitButtonMenu />
      </DzSplitButton>
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
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    setup() {
      return { args }
    },
    template: `
      <DzSplitButton v-bind="args" aria-label="Loading split">
        <DzSplitButtonAction>Saving...</DzSplitButtonAction>
        <DzSplitButtonMenu />
      </DzSplitButton>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States (disabled + loading side by side)
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex gap-4 items-center">
        <DzSplitButton aria-label="Default split">
          <DzSplitButtonAction>Default</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton disabled aria-label="Disabled split">
          <DzSplitButtonAction>Disabled</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton loading aria-label="Loading split">
          <DzSplitButtonAction>Loading</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
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
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSplitButton variant="solid" aria-label="Solid split">
          <DzSplitButtonAction>Solid</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="outline" aria-label="Outline split">
          <DzSplitButtonAction>Outline</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="ghost" aria-label="Ghost split">
          <DzSplitButtonAction>Ghost</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Click Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    data() {
      return { lastAction: 'none' }
    },
    template: `
      <div class="space-y-4">
        <DzSplitButton aria-label="Save actions">
          <DzSplitButtonAction @click="lastAction = 'save'">Save</DzSplitButtonAction>
          <DzSplitButtonMenu aria-label="More save options" />
        </DzSplitButton>
        <p class="text-sm text-gray-500">Last action: {{ lastAction }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Focus States
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Tab through to see focus rings. The split button uses role="group"
          and each part is independently focusable.
        </p>
        <div class="flex gap-4">
          <DzSplitButton aria-label="First action group">
            <DzSplitButtonAction aria-label="Primary action">First</DzSplitButtonAction>
            <DzSplitButtonMenu aria-label="More options for first action" />
          </DzSplitButton>
          <DzSplitButton variant="outline" aria-label="Second action group">
            <DzSplitButtonAction aria-label="Secondary action">Second</DzSplitButtonAction>
            <DzSplitButtonMenu aria-label="More options for second action" />
          </DzSplitButton>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Save with Options
// ---------------------------------------------------------------------------

export const RealWorldSaveWithOptions: Story = {
  name: 'Real World: Save with Options',
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Common pattern: primary save action with dropdown for alternatives.
        </p>
        <div class="flex gap-4">
          <DzSplitButton tone="primary" aria-label="Save options">
            <DzSplitButtonAction>Save</DzSplitButtonAction>
            <DzSplitButtonMenu aria-label="More save options" />
          </DzSplitButton>
          <DzSplitButton tone="success" aria-label="Publish options">
            <DzSplitButtonAction>Publish</DzSplitButtonAction>
            <DzSplitButtonMenu aria-label="More publish options" />
          </DzSplitButton>
          <DzSplitButton tone="danger" variant="outline" aria-label="Delete options">
            <DzSplitButtonAction>Delete</DzSplitButtonAction>
            <DzSplitButtonMenu aria-label="More delete options" />
          </DzSplitButton>
        </div>
      </div>
    `,
  }),
}
