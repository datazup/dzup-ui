import type { Meta, StoryObj } from '@storybook/vue3'
import { DzDivider, DzFlex, DzStack } from '../../src/components/layout'

/**
 * DzDivider is a visual separator with horizontal or vertical orientation.
 *
 * It renders as `<hr>` for horizontal or `<div>` for vertical orientation
 * and supports a decorative mode (role="none") for purely visual separators.
 */
const meta = {
  title: 'Core/Layout/DzDivider',
  component: DzDivider,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Divider orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    // Behavior
    decorative: {
      control: 'boolean',
      description: 'When true, the divider is purely decorative (role="none")',
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
    orientation: 'horizontal',
    decorative: false,
  },
} satisfies Meta<typeof DzDivider>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzDivider },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm">Content above the divider</p>
        <DzDivider v-bind="args" />
        <p class="text-sm">Content below the divider</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Orientation Gallery
// ---------------------------------------------------------------------------

export const AllOrientations: Story = {
  name: 'Orientation Gallery',
  render: () => ({
    components: { DzDivider, DzFlex },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-xs text-gray-500 mb-2">orientation="horizontal"</p>
          <div class="space-y-3">
            <p class="text-sm">Above</p>
            <DzDivider orientation="horizontal" />
            <p class="text-sm">Below</p>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">orientation="vertical"</p>
          <DzFlex gap="md" align="center" class="h-12">
            <span class="text-sm">Left</span>
            <DzDivider orientation="vertical" />
            <span class="text-sm">Right</span>
          </DzFlex>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Decorative vs Semantic
// ---------------------------------------------------------------------------

export const DecorativeVsSemantic: Story = {
  name: 'Decorative vs Semantic',
  render: () => ({
    components: { DzDivider },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-xs text-gray-500 mb-2">Semantic (role="separator") -- announced by screen readers</p>
          <div class="space-y-3">
            <p class="text-sm">Section A</p>
            <DzDivider />
            <p class="text-sm">Section B</p>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">Decorative (role="none") -- hidden from screen readers</p>
          <div class="space-y-3">
            <p class="text-sm">Section A</p>
            <DzDivider decorative />
            <p class="text-sm">Section B</p>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical in Toolbar
// ---------------------------------------------------------------------------

export const VerticalInToolbar: Story = {
  name: 'Vertical in Toolbar',
  render: () => ({
    components: { DzDivider, DzFlex },
    template: `
      <DzFlex gap="sm" align="center" class="bg-gray-50 border rounded-lg px-3 py-2">
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Cut</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Copy</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Paste</button>
        <DzDivider orientation="vertical" class="h-5" />
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Undo</button>
        <button class="text-sm px-3 py-1.5 rounded hover:bg-gray-200">Redo</button>
      </DzFlex>
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
    components: { DzDivider },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-300">Content above</p>
        <DzDivider />
        <p class="text-sm text-gray-300">Content below</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Sections
// ---------------------------------------------------------------------------

export const RealWorldSettingsSections: Story = {
  name: 'Real World: Settings Sections',
  render: () => ({
    components: { DzDivider, DzStack },
    template: `
      <DzStack gap="lg" class="max-w-md">
        <div>
          <h3 class="font-semibold text-sm mb-1">Profile</h3>
          <p class="text-xs text-gray-500">Manage your profile information.</p>
        </div>
        <DzDivider />
        <div>
          <h3 class="font-semibold text-sm mb-1">Notifications</h3>
          <p class="text-xs text-gray-500">Configure notification preferences.</p>
        </div>
        <DzDivider />
        <div>
          <h3 class="font-semibold text-sm mb-1">Security</h3>
          <p class="text-xs text-gray-500">Update your password and 2FA settings.</p>
        </div>
      </DzStack>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Separator Role',
  render: () => ({
    components: { DzDivider, DzFlex },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The horizontal divider uses role="separator" with aria-orientation.
          Decorative dividers use role="none" and are invisible to assistive technology.
        </p>
        <div class="space-y-3">
          <p class="text-sm">Semantic separator (inspectable in DevTools as role="separator")</p>
          <DzDivider aria-label="Section break" />
          <p class="text-sm">Next section</p>
        </div>
        <DzFlex gap="sm" align="center" class="h-10">
          <span class="text-sm">Left</span>
          <DzDivider orientation="vertical" aria-label="Vertical section break" />
          <span class="text-sm">Right</span>
        </DzFlex>
      </div>
    `,
  }),
}
