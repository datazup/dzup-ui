import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzResizable,
  DzResizableHandle,
  DzResizablePanel,
} from '../../src/components/layout'

/**
 * DzResizable compound sub-parts: DzResizablePanel and DzResizableHandle.
 *
 * DzResizablePanel defines individual resizable sections with min/max constraints,
 * collapsibility, and default sizing. DzResizableHandle provides the draggable
 * separator between panels with optional visual grip indicator.
 *
 * Both receive direction and size context from DzResizable via inject (ADR-08).
 * Backed by Reka UI Splitter primitives (ADR-07).
 */

const meta = {
  title: 'Core/Layout/DzResizableParts',
  component: DzResizablePanel,
  subcomponents: { DzResizableHandle },
  tags: ['autodocs'],
  argTypes: {
    defaultSize: {
      control: 'number',
      description: 'Default panel size as percentage (0-100)',
      table: { category: 'Behavior' },
    },
    minSize: {
      control: 'number',
      description: 'Minimum panel size as percentage',
      table: { category: 'Behavior' },
    },
    maxSize: {
      control: 'number',
      description: 'Maximum panel size as percentage',
      table: { category: 'Behavior' },
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether the panel can be collapsed',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof DzResizablePanel>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Two panels
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable class="h-48 border rounded" aria-label="Resizable panels">
        <DzResizablePanel :default-size="30" :min-size="20">
          <div class="h-full p-4 text-sm">Sidebar (30%, min 20%)</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="70">
          <div class="h-full p-4 text-sm">Main Content (70%)</div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Three Panels
// ---------------------------------------------------------------------------

export const ThreePanels: Story = {
  name: 'Three Panels',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable class="h-48 border rounded" aria-label="Three resizable panels">
        <DzResizablePanel :default-size="25" :min-size="15">
          <div class="h-full p-4 text-sm bg-gray-50">Left</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="50" :min-size="25">
          <div class="h-full p-4 text-sm">Center</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="25" :min-size="15">
          <div class="h-full p-4 text-sm bg-gray-50">Right</div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Collapsible Panel
// ---------------------------------------------------------------------------

export const Collapsible: Story = {
  name: 'Collapsible Panel',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-gray-500">
          Drag the handle fully left to collapse the sidebar. Drag right to expand.
        </p>
        <DzResizable class="h-48 border rounded" aria-label="Collapsible sidebar">
          <DzResizablePanel :default-size="25" :min-size="15" collapsible :collapsed-size="0">
            <div class="h-full p-4 text-sm">Collapsible Sidebar</div>
          </DzResizablePanel>
          <DzResizableHandle with-handle />
          <DzResizablePanel :default-size="75">
            <div class="h-full p-4 text-sm">Main Content</div>
          </DzResizablePanel>
        </DzResizable>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Handle Without Visual Grip
// ---------------------------------------------------------------------------

export const HandleVariants: Story = {
  name: 'Handle With/Without Grip',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">With visual grip (withHandle=true)</p>
          <DzResizable class="h-32 border rounded" aria-label="Handle with grip">
            <DzResizablePanel :default-size="50">
              <div class="h-full p-3 text-sm">Left</div>
            </DzResizablePanel>
            <DzResizableHandle with-handle />
            <DzResizablePanel :default-size="50">
              <div class="h-full p-3 text-sm">Right</div>
            </DzResizablePanel>
          </DzResizable>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Without visual grip (default)</p>
          <DzResizable class="h-32 border rounded" aria-label="Handle without grip">
            <DzResizablePanel :default-size="50">
              <div class="h-full p-3 text-sm">Left</div>
            </DzResizablePanel>
            <DzResizableHandle />
            <DzResizablePanel :default-size="50">
              <div class="h-full p-3 text-sm">Right</div>
            </DzResizablePanel>
          </DzResizable>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Direction
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: 'Vertical Direction',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable direction="vertical" class="h-64 border rounded" aria-label="Vertical panels">
        <DzResizablePanel :default-size="30" :min-size="15">
          <div class="h-full p-4 text-sm">Top Panel</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="70">
          <div class="h-full p-4 text-sm">Bottom Panel</div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}
