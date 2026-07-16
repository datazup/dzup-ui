import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzSplitter, DzSplitterHandle, DzSplitterPanel } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * DzSplitter compound sub-parts: DzSplitterPanel and DzSplitterHandle.
 *
 * DzSplitter is a naming alias for DzResizable, providing the same resizable
 * panel layout under an alternative API. DzSplitterPanel and DzSplitterHandle
 * are aliases for DzResizablePanel and DzResizableHandle respectively.
 *
 * Both share the same types and Reka UI Splitter backing (ADR-07).
 */

const meta = {
  title: 'Core/Layout/DzSplitterParts',
  component: DzSplitterPanel,
  subcomponents: { DzSplitterHandle },
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
} satisfies Meta<typeof DzSplitterPanel>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter class="h-48 border border-[var(--dz-border)] rounded" aria-label="Splitter panels">
        <DzSplitterPanel :default-size="40" :min-size="20">
          <div class="h-full p-4 text-sm">Panel A (40%)</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="60">
          <div class="h-full p-4 text-sm">Panel B (60%)</div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const separator = canvas.getByRole('separator')

    // Handle renders as separator with horizontal data-orientation
    await expect(separator).toBeInTheDocument()
    await expect(separator).toHaveAttribute('data-orientation', 'horizontal')

    // Separator is keyboard focusable
    await expect(separator).toHaveAttribute('tabindex', '0')

    // Keyboard resize: ArrowRight should shift the split point
    separator.focus()
    const beforeValue = separator.getAttribute('aria-valuenow')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(separator.getAttribute('aria-valuenow')).not.toBe(beforeValue))

    // ArrowLeft moves it back toward the original position
    const afterRight = separator.getAttribute('aria-valuenow')
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(separator.getAttribute('aria-valuenow')).not.toBe(afterRight))
  },
}

// ---------------------------------------------------------------------------
// Nested Splitters
// ---------------------------------------------------------------------------

export const Nested: Story = {
  name: 'Nested Splitters',
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter class="h-64 border border-[var(--dz-border)] rounded" aria-label="Outer splitter">
        <DzSplitterPanel :default-size="30" :min-size="15">
          <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Sidebar</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="70">
          <DzSplitter direction="vertical" class="h-full" aria-label="Inner splitter">
            <DzSplitterPanel :default-size="60">
              <div class="h-full p-4 text-sm">Editor</div>
            </DzSplitterPanel>
            <DzSplitterHandle with-handle />
            <DzSplitterPanel :default-size="40" :min-size="20">
              <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Terminal</div>
            </DzSplitterPanel>
          </DzSplitter>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const separators = canvas.getAllByRole('separator')

    // Two splitters → two separators
    await expect(separators).toHaveLength(2)

    // Outer separator is horizontal
    const [outerSep, innerSep] = separators
    await expect(outerSep).toHaveAttribute('data-orientation', 'horizontal')

    // Inner separator belongs to the vertical splitter
    await expect(innerSep).toHaveAttribute('data-orientation', 'vertical')

    // Keyboard resize on the outer (horizontal) handle
    outerSep.focus()
    const outerBefore = outerSep.getAttribute('aria-valuenow')
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(outerSep.getAttribute('aria-valuenow')).not.toBe(outerBefore))

    // Keyboard resize on the inner (vertical) handle
    innerSep.focus()
    const innerBefore = innerSep.getAttribute('aria-valuenow')
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(innerSep.getAttribute('aria-valuenow')).not.toBe(innerBefore))
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter class="h-64 border border-[var(--dz-border)] rounded" aria-label="Dark mode splitter">
        <DzSplitterPanel :default-size="30" :min-size="15">
          <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Sidebar</div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="70">
          <DzSplitter direction="vertical" class="h-full" aria-label="Dark mode inner splitter">
            <DzSplitterPanel :default-size="60">
              <div class="h-full p-4 text-sm">
                <p class="font-medium mb-1">Editor</p>
                <p class="text-xs text-[var(--dz-muted-foreground)]">
                  Nested splitters: the outer handle splits left/right, the inner one
                  top/bottom. Both grips and every panel border resolve from tokens.
                </p>
              </div>
            </DzSplitterPanel>
            <DzSplitterHandle with-handle />
            <DzSplitterPanel :default-size="40" :min-size="20">
              <div class="h-full p-4 text-sm bg-[var(--dz-muted)]">Terminal</div>
            </DzSplitterPanel>
          </DzSplitter>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: IDE Layout
// ---------------------------------------------------------------------------

export const RealWorldIDE: Story = {
  name: 'Real World: IDE Layout',
  render: () => ({
    components: { DzSplitter, DzSplitterPanel, DzSplitterHandle },
    template: `
      <DzSplitter class="h-80 border border-[var(--dz-border)] rounded" aria-label="IDE layout">
        <DzSplitterPanel :default-size="20" :min-size="10" collapsible>
          <div class="h-full p-3 text-xs bg-[var(--dz-muted)] space-y-1">
            <p class="font-medium text-sm mb-2">Explorer</p>
            <p>src/</p>
            <p class="pl-3">components/</p>
            <p class="pl-3">composables/</p>
            <p>tests/</p>
            <p>package.json</p>
          </div>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="55">
          <DzSplitter direction="vertical" class="h-full" aria-label="Editor area">
            <DzSplitterPanel :default-size="70">
              <div class="h-full p-3 text-sm">
                <p class="font-medium mb-2">DzButton.vue</p>
                <pre class="text-xs text-[var(--dz-muted-foreground)]">&lt;script setup lang="ts"&gt;
import { cn } from '../utilities/cn'
// ...
&lt;/script&gt;</pre>
              </div>
            </DzSplitterPanel>
            <DzSplitterHandle />
            <DzSplitterPanel :default-size="30" :min-size="15">
              <div class="h-full p-3 text-xs bg-[var(--dz-muted)]">
                <p class="font-medium text-sm mb-2">Terminal</p>
                <p class="text-[var(--dz-success-muted-foreground)]">$ yarn test</p>
                <p>PASS src/components/DzButton.spec.ts</p>
              </div>
            </DzSplitterPanel>
          </DzSplitter>
        </DzSplitterPanel>
        <DzSplitterHandle with-handle />
        <DzSplitterPanel :default-size="25" :min-size="15" collapsible>
          <div class="h-full p-3 text-xs bg-[var(--dz-muted)]">
            <p class="font-medium text-sm mb-2">Properties</p>
            <p>variant: solid</p>
            <p>size: md</p>
            <p>tone: primary</p>
          </div>
        </DzSplitterPanel>
      </DzSplitter>
    `,
  }),
}
