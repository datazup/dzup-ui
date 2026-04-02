import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzSplitter,
  DzSplitterHandle,
  DzSplitterPanel,
} from '../../src/components/layout'

/**
 * DzSplitter is a naming alias for DzResizable, providing the same
 * compound resizable panel layout under an alternative API name.
 *
 * It consists of three parts:
 * - **DzSplitter** -- root container (alias for DzResizable)
 * - **DzSplitterPanel** -- individual panel (alias for DzResizablePanel)
 * - **DzSplitterHandle** -- draggable handle (alias for DzResizableHandle)
 *
 * Both families are backed by Reka UI Splitter and share the same types.
 */
const meta = {
  title: 'Core/Layout/DzSplitter',
  component: DzSplitter,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction of the panels',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size (affects handle dimensions)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents resizing',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    keyboardResizeBy: {
      control: 'number',
      description: 'Keyboard resize step in percentage',
      table: { category: 'Behavior', defaultValue: { summary: '10' } },
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
    direction: 'horizontal',
    size: 'md',
    disabled: false,
    keyboardResizeBy: 10,
  },
} satisfies Meta<typeof DzSplitter>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    setup() {
      return { args }
    },
    template: `
      <DzSplitter v-bind="args" class="h-48 border rounded-lg" aria-label="Splitter demo">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-blue-50 text-blue-800 text-sm p-4">
            Panel A (50%)
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-green-50 text-green-800 text-sm p-4">
            Panel B (50%)
          </div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Splitter
// ---------------------------------------------------------------------------

export const VerticalSplitter: Story = {
  name: 'Vertical Direction',
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter direction="vertical" class="h-64 border rounded-lg">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-amber-50 text-amber-800 text-sm">Top</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-purple-50 text-purple-800 text-sm">Bottom</div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    setup() {
      return { args }
    },
    template: `
      <DzSplitter v-bind="args" class="h-40 border rounded-lg">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">Locked</div>
        </DzSplitterPanel>
        <DzSplitterHandle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">Locked</div>
        </DzSplitterPanel>
      </DzSplitter>
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
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter direction="horizontal" class="h-48 border border-gray-700 rounded-lg">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-800 text-gray-200 text-sm p-4">Left</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-800 text-gray-200 text-sm p-4">Right</div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Email Client
// ---------------------------------------------------------------------------

export const RealWorldEmailClient: Story = {
  name: 'Real World: Email Client',
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter direction="horizontal" class="h-80 border rounded-lg">
        <DzSplitterPanel :default-size="25" :min-size="15">
          <div class="h-full bg-gray-50 p-3">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Folders</p>
            <div class="space-y-1 text-sm">
              <div class="px-2 py-1 bg-blue-100 rounded text-blue-800">Inbox (3)</div>
              <div class="px-2 py-1 hover:bg-gray-100 rounded">Sent</div>
              <div class="px-2 py-1 hover:bg-gray-100 rounded">Drafts</div>
              <div class="px-2 py-1 hover:bg-gray-100 rounded">Trash</div>
            </div>
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="35" :min-size="20">
          <div class="h-full p-3 border-r">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Messages</p>
            <div class="space-y-2 text-sm">
              <div class="p-2 bg-blue-50 rounded border-l-2 border-blue-500">
                <p class="font-medium">Meeting reminder</p>
                <p class="text-xs text-gray-500">Today at 3:00 PM</p>
              </div>
              <div class="p-2 hover:bg-gray-50 rounded">
                <p class="font-medium">Project update</p>
                <p class="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="40" :min-size="25">
          <div class="h-full p-4">
            <h3 class="font-semibold mb-1">Meeting reminder</h3>
            <p class="text-xs text-gray-500 mb-3">From: team@company.com</p>
            <p class="text-sm text-gray-600">Don't forget the standup meeting at 3:00 PM.</p>
          </div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzSplitter is functionally identical to DzResizable.
          Focus the handle (Tab) and use Arrow keys to resize.
        </p>
        <DzSplitter direction="horizontal" class="h-40 border rounded-lg" aria-label="Keyboard splitter demo">
          <DzSplitterPanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-blue-50 text-sm">Left</div>
          </DzSplitterPanel>
          <DzSplitterHandle with-handle />
          <DzSplitterPanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-green-50 text-sm">Right</div>
          </DzSplitterPanel>
        </DzSplitter>
      </div>
    `,
  }),
}
