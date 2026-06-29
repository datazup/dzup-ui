import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DzToolbar } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * DzToolbar is a semantic horizontal action bar with start/center/end regions.
 * It standardizes the common "controls left, title middle, actions right"
 * layout with consistent spacing, wrap, and sticky behavior. Pure layout —
 * no interaction logic.
 */
const meta = {
  title: 'Core/Layout/DzToolbar',
  component: DzToolbar,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['flat', 'outlined', 'elevated'],
      description: 'Surface treatment',
      table: { category: 'Appearance', defaultValue: { summary: 'flat' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Control density (gap and padding)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    wrap: {
      control: 'boolean',
      description: 'Whether items wrap onto multiple lines',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    sticky: {
      control: 'boolean',
      description: 'Stick to the top of the scroll container',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Logical orientation reflected in aria-orientation',
      table: { category: 'Accessibility', defaultValue: { summary: 'horizontal' } },
    },
    as: {
      control: 'select',
      options: ['div', 'nav', 'section', 'header'],
      description: 'HTML element to render as',
      table: { category: 'Behavior', defaultValue: { summary: 'div' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'flat',
    size: 'md',
    wrap: false,
    sticky: false,
    orientation: 'horizontal',
  },
} satisfies Meta<typeof DzToolbar>

export default meta
type Story = StoryObj<typeof meta>

function btn(label: string) {
  return `<button class="text-sm px-3 py-1.5 rounded hover:bg-[var(--dz-muted)]">${label}</button>`
}

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Toolbar must expose role="toolbar"
    const toolbar = canvas.getByRole('toolbar')
    await expect(toolbar).toBeInTheDocument()

    // Buttons in the start and end regions are discoverable
    const backBtn = canvas.getByRole('button', { name: 'Back' })
    await expect(backBtn).toBeInTheDocument()

    const saveBtn = canvas.getByRole('button', { name: 'Save' })
    await expect(saveBtn).toBeInTheDocument()

    // Tab into the toolbar — focus should land on the first button
    await userEvent.tab()
    await expect(backBtn).toHaveFocus()
  },
  render: args => ({
    components: { DzToolbar },
    setup() {
      return { args }
    },
    template: `
      <DzToolbar v-bind="args" aria-label="Document actions" class="border border-dashed border-[var(--dz-border)]">
        <template #start>
          ${btn('Back')}
          ${btn('Forward')}
        </template>
        <template #end>
          ${btn('Share')}
          <button class="text-sm px-3 py-1.5 rounded bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">Save</button>
        </template>
      </DzToolbar>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Title Centered
// ---------------------------------------------------------------------------

export const TitleCentered: Story = {
  name: 'Title Centered',
  args: { variant: 'outlined' },
  render: args => ({
    components: { DzToolbar },
    setup() {
      return { args }
    },
    template: `
      <DzToolbar v-bind="args" aria-label="Panel header">
        <template #start>${btn('Menu')}</template>
        <template #center>
          <h2 class="text-sm font-semibold text-[var(--dz-foreground)]">Dashboard</h2>
        </template>
        <template #end>${btn('Settings')}</template>
      </DzToolbar>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Sticky
// ---------------------------------------------------------------------------

export const Sticky: Story = {
  name: 'Sticky',
  args: { sticky: true, variant: 'elevated' },
  render: args => ({
    components: { DzToolbar },
    setup() {
      return { args }
    },
    template: `
      <div class="h-64 overflow-y-auto border border-[var(--dz-border)] rounded">
        <DzToolbar v-bind="args" aria-label="Sticky toolbar">
          <template #start>
            <span class="text-sm font-semibold text-[var(--dz-foreground)]">Records</span>
          </template>
          <template #end>${btn('Filter')}${btn('Export')}</template>
        </DzToolbar>
        <div class="p-4 space-y-3">
          <p v-for="i in 20" :key="i" class="text-sm text-[var(--dz-muted-foreground)]">Row {{ i }}</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Responsive Wrap
// ---------------------------------------------------------------------------

export const ResponsiveWrap: Story = {
  name: 'Responsive Wrap',
  args: { wrap: true, variant: 'outlined' },
  render: args => ({
    components: { DzToolbar },
    setup() {
      return { args }
    },
    template: `
      <DzToolbar v-bind="args" aria-label="Formatting" class="max-w-sm">
        <template #start>
          ${btn('Bold')}${btn('Italic')}${btn('Underline')}${btn('Strikethrough')}
          ${btn('Left')}${btn('Center')}${btn('Right')}
        </template>
      </DzToolbar>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  args: { variant: 'elevated' },
  render: args => ({
    components: { DzToolbar },
    setup() {
      return { args }
    },
    template: `
      <DzToolbar v-bind="args" aria-label="Editor">
        <template #start>${btn('Back')}</template>
        <template #center>
          <h2 class="text-sm font-semibold text-[var(--dz-foreground)]">Untitled</h2>
        </template>
        <template #end>
          <button class="text-sm px-3 py-1.5 rounded bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">Save</button>
        </template>
      </DzToolbar>
    `,
  }),
}
