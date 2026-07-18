import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzSplitter,
  DzSplitterHandle,
  DzSplitterPanel,
} from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

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
  tags: ['autodocs', 'status:stable'],
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
      <DzSplitter v-bind="args" class="h-48 border border-[var(--dz-border)] rounded-lg" aria-label="Splitter demo">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-4">
            Panel A (50%)
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] text-sm p-4">
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
      <DzSplitter direction="vertical" class="h-64 border border-[var(--dz-border)] rounded-lg">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)] text-sm">Top</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-colors-purple-50)] text-[var(--dz-colors-purple-800)] text-sm">Bottom</div>
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
      <DzSplitter v-bind="args" class="h-40 border border-[var(--dz-border)] rounded-lg">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-muted)] text-[var(--dz-muted-foreground)] text-sm">Locked</div>
        </DzSplitterPanel>
        <DzSplitterHandle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-muted)] text-[var(--dz-muted-foreground)] text-sm">Locked</div>
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
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter direction="horizontal" class="h-48 border border-[var(--dz-colors-neutral-700)] rounded-lg">
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-colors-neutral-800)] text-[var(--dz-colors-neutral-200)] text-sm p-4">Left</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-[var(--dz-colors-neutral-800)] text-[var(--dz-colors-neutral-200)] text-sm p-4">Right</div>
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
      <DzSplitter direction="horizontal" class="h-80 border border-[var(--dz-border)] rounded-lg">
        <DzSplitterPanel :default-size="25" :min-size="15">
          <div class="h-full bg-[var(--dz-muted)] p-3">
            <p class="text-xs font-semibold text-[var(--dz-muted-foreground)] uppercase mb-2">Folders</p>
            <div class="space-y-1 text-sm">
              <div class="px-2 py-1 bg-[var(--dz-primary-muted)] rounded text-[var(--dz-primary-muted-foreground)]">Inbox (3)</div>
              <div class="px-2 py-1 hover:bg-[var(--dz-muted)] rounded">Sent</div>
              <div class="px-2 py-1 hover:bg-[var(--dz-muted)] rounded">Drafts</div>
              <div class="px-2 py-1 hover:bg-[var(--dz-muted)] rounded">Trash</div>
            </div>
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="35" :min-size="20">
          <div class="h-full p-3 border-r border-r-[var(--dz-border)]">
            <p class="text-xs font-semibold text-[var(--dz-muted-foreground)] uppercase mb-2">Messages</p>
            <div class="space-y-2 text-sm">
              <div class="p-2 bg-[var(--dz-primary-muted)] rounded border-l-2 border-[var(--dz-primary-border)]">
                <p class="font-medium">Meeting reminder</p>
                <p class="text-xs text-[var(--dz-muted-foreground)]">Today at 3:00 PM</p>
              </div>
              <div class="p-2 hover:bg-[var(--dz-muted)] rounded">
                <p class="font-medium">Project update</p>
                <p class="text-xs text-[var(--dz-muted-foreground)]">Yesterday</p>
              </div>
            </div>
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="40" :min-size="25">
          <div class="h-full p-4">
            <h3 class="font-semibold mb-1">Meeting reminder</h3>
            <p class="text-xs text-[var(--dz-muted-foreground)] mb-3">From: team@company.com</p>
            <p class="text-sm text-[var(--dz-muted-foreground)]">Don't forget the standup meeting at 3:00 PM.</p>
          </div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Keyboard Resize (TASK-7.C)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Keyboard Resize',
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    data() {
      return { sizes: [50, 50] }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Sizes: {{ sizes.map(s => Math.round(s) + '%').join(' | ') }}
        </p>
        <DzSplitter direction="horizontal" class="h-40 border border-[var(--dz-border)] rounded-lg" @layout-change="sizes = $event">
          <DzSplitterPanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-[var(--dz-primary-muted)] text-sm p-2" data-testid="panel-a">
              {{ Math.round(sizes[0]) }}%
            </div>
          </DzSplitterPanel>
          <DzSplitterHandle with-handle />
          <DzSplitterPanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-[var(--dz-success-muted)] text-sm p-2" data-testid="panel-b">
              {{ Math.round(sizes[1]) }}%
            </div>
          </DzSplitterPanel>
        </DzSplitter>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // DzSplitter is the DzResizable alias; the handle is role="separator".
    const handle = canvas.getByRole('separator')
    await expect(handle).toHaveAttribute('tabindex', '0')
    await expect(canvas.getByTestId('panel-a')).toHaveTextContent('50%')

    // Keyboard-resize from the focused handle and assert the layout repaints.
    handle.focus()
    await expect(handle).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => {
      expect(canvas.getByTestId('panel-a')).not.toHaveTextContent('50%')
    })
  },
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          DzSplitter is functionally identical to DzResizable.
          Focus the handle (Tab) and use Arrow keys to resize.
        </p>
        <DzSplitter direction="horizontal" class="h-40 border border-[var(--dz-border)] rounded-lg" aria-label="Keyboard splitter demo">
          <DzSplitterPanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-[var(--dz-primary-muted)] text-sm">Left</div>
          </DzSplitterPanel>
          <DzSplitterHandle with-handle />
          <DzSplitterPanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-[var(--dz-success-muted)] text-sm">Right</div>
          </DzSplitterPanel>
        </DzSplitter>
      </div>
    `,
  }),
}
