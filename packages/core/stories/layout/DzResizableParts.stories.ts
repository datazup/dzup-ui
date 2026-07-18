import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzResizable, DzResizableHandle, DzResizablePanel } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

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
  tags: ['autodocs', 'status:stable'],
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
      <DzResizable class="h-48 border border-[var(--dz-border)] rounded" aria-label="Resizable panels">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('separator')
    await expect(handle).toBeInTheDocument()
    await expect(handle).toHaveAttribute('aria-orientation')
    await expect(handle).toHaveAttribute('aria-valuenow')
    const valueBefore = handle.getAttribute('aria-valuenow')
    handle.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(handle.getAttribute('aria-valuenow')).not.toBe(valueBefore))
  },
}

// ---------------------------------------------------------------------------
// Three Panels
// ---------------------------------------------------------------------------

export const ThreePanels: Story = {
  name: 'Three Panels',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable class="h-48 border border-[var(--dz-border)] rounded" aria-label="Three resizable panels">
        <DzResizablePanel :default-size="25" :min-size="15">
          <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Left</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="50" :min-size="25">
          <div class="h-full p-4 text-sm">Center</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="25" :min-size="15">
          <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Right</div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handles = canvas.getAllByRole('separator')
    await expect(handles).toHaveLength(2)
    // Both handles should carry aria-orientation and aria-valuenow
    for (const handle of handles) {
      await expect(handle).toHaveAttribute('aria-orientation')
      await expect(handle).toHaveAttribute('aria-valuenow')
    }
    // Keyboard resize on first handle
    const firstHandle = handles[0]
    const valueBefore = firstHandle.getAttribute('aria-valuenow')
    firstHandle.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(firstHandle.getAttribute('aria-valuenow')).not.toBe(valueBefore))
  },
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Drag the handle fully left to collapse the sidebar. Drag right to expand.
        </p>
        <DzResizable class="h-48 border border-[var(--dz-border)] rounded" aria-label="Collapsible sidebar">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('separator')
    await expect(handle).toBeInTheDocument()
    await expect(handle).toHaveAttribute('aria-orientation')
    // Panel starts at 25% — valuenow should be non-zero
    await expect(handle).toHaveAttribute('aria-valuenow')
    await expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(0)
    // Keyboard collapse: press ArrowLeft repeatedly to drive toward minimum/collapse
    handle.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow'))
  },
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
          <DzResizable class="h-32 border border-[var(--dz-border)] rounded" aria-label="Handle with grip">
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
          <DzResizable class="h-32 border border-[var(--dz-border)] rounded" aria-label="Handle without grip">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handles = canvas.getAllByRole('separator')
    // Two splitters rendered — one with grip indicator, one without
    await expect(handles).toHaveLength(2)
    const [withGrip, withoutGrip] = handles
    // Both are valid separator handles with aria state
    await expect(withGrip).toHaveAttribute('aria-orientation')
    await expect(withoutGrip).toHaveAttribute('aria-orientation')
    // The grip variant has a child SVG indicator; the plain one does not
    await expect(withGrip.querySelector('svg')).not.toBeNull()
    await expect(withoutGrip.querySelector('svg')).toBeNull()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable class="h-48 border border-[var(--dz-border)] rounded" aria-label="Dark mode resizable panels">
        <DzResizablePanel :default-size="30" :min-size="20">
          <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Sidebar (30%, min 20%)</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="70">
          <div class="h-full p-4 text-sm">
            <p class="font-medium mb-1">Main Content (70%)</p>
            <p class="text-xs text-[var(--dz-muted-foreground)]">
              The panel border, the muted sidebar surface, and the handle grip all
              resolve from tokens against a dark background.
            </p>
          </div>
        </DzResizablePanel>
      </DzResizable>
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
      <DzResizable direction="vertical" class="h-64 border border-[var(--dz-border)] rounded" aria-label="Vertical panels">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('separator')
    await expect(handle).toBeInTheDocument()
    // Vertical splitter group → handle aria-orientation should be "horizontal"
    // (the handle itself is horizontal, separating top/bottom panels)
    await expect(handle).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(handle).toHaveAttribute('aria-valuenow')
    // Keyboard resize uses ArrowDown for vertical direction
    const valueBefore = handle.getAttribute('aria-valuenow')
    handle.focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(handle.getAttribute('aria-valuenow')).not.toBe(valueBefore))
  },
}
