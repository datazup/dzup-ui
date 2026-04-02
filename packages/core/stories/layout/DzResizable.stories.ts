import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzResizable,
  DzResizableHandle,
  DzResizablePanel,
} from '../../src/components/layout'

/**
 * DzResizable is a compound resizable panel layout backed by Reka UI Splitter.
 *
 * It consists of three parts:
 * - **DzResizable** -- root container that sets direction and provides context
 * - **DzResizablePanel** -- individual panel with min/max/default size and collapsibility
 * - **DzResizableHandle** -- draggable handle between panels
 */
const meta = {
  title: 'Core/Layout/DzResizable',
  component: DzResizable,
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
} satisfies Meta<typeof DzResizable>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    setup() {
      return { args }
    },
    template: `
      <DzResizable v-bind="args" class="h-48 border rounded-lg" aria-label="Resizable panel demo">
        <DzResizablePanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-blue-50 text-blue-800 text-sm p-4">
            Panel A (50%)
          </div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-green-50 text-green-800 text-sm p-4">
            Panel B (50%)
          </div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Direction Gallery
// ---------------------------------------------------------------------------

export const AllDirections: Story = {
  name: 'Direction Gallery',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-xs text-gray-500 mb-2">direction="horizontal"</p>
          <DzResizable direction="horizontal" class="h-40 border rounded-lg">
            <DzResizablePanel :default-size="50">
              <div class="h-full flex items-center justify-center bg-blue-50 text-sm">Left</div>
            </DzResizablePanel>
            <DzResizableHandle with-handle />
            <DzResizablePanel :default-size="50">
              <div class="h-full flex items-center justify-center bg-green-50 text-sm">Right</div>
            </DzResizablePanel>
          </DzResizable>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-2">direction="vertical"</p>
          <DzResizable direction="vertical" class="h-64 border rounded-lg">
            <DzResizablePanel :default-size="50">
              <div class="h-full flex items-center justify-center bg-amber-50 text-sm">Top</div>
            </DzResizablePanel>
            <DzResizableHandle with-handle />
            <DzResizablePanel :default-size="50">
              <div class="h-full flex items-center justify-center bg-purple-50 text-sm">Bottom</div>
            </DzResizablePanel>
          </DzResizable>
        </div>
      </div>
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
      <DzResizable direction="horizontal" class="h-48 border rounded-lg">
        <DzResizablePanel :default-size="25" :min-size="15">
          <div class="h-full flex items-center justify-center bg-blue-50 text-sm p-2">Sidebar (25%)</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="50" :min-size="30">
          <div class="h-full flex items-center justify-center bg-white text-sm p-2">Main (50%)</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="25" :min-size="15">
          <div class="h-full flex items-center justify-center bg-green-50 text-sm p-2">Inspector (25%)</div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Min / Max Constraints
// ---------------------------------------------------------------------------

export const MinMaxConstraints: Story = {
  name: 'Min/Max Size Constraints',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-gray-500">Left panel: min 20%, max 60%. Right panel: min 20%.</p>
        <DzResizable direction="horizontal" class="h-40 border rounded-lg">
          <DzResizablePanel :default-size="40" :min-size="20" :max-size="60">
            <div class="h-full flex items-center justify-center bg-blue-50 text-sm p-2">
              Constrained (20%-60%)
            </div>
          </DzResizablePanel>
          <DzResizableHandle with-handle />
          <DzResizablePanel :default-size="60" :min-size="20">
            <div class="h-full flex items-center justify-center bg-green-50 text-sm p-2">
              Min 20%
            </div>
          </DzResizablePanel>
        </DzResizable>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Collapsible Panel
// ---------------------------------------------------------------------------

export const CollapsiblePanel: Story = {
  name: 'Collapsible Panel',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-gray-500">Drag the left panel handle far enough to collapse it.</p>
        <DzResizable direction="horizontal" class="h-48 border rounded-lg">
          <DzResizablePanel :default-size="30" :min-size="15" collapsible :collapsed-size="0">
            <div class="h-full flex items-center justify-center bg-blue-50 text-sm p-2">
              Collapsible Sidebar
            </div>
          </DzResizablePanel>
          <DzResizableHandle with-handle />
          <DzResizablePanel :default-size="70">
            <div class="h-full flex items-center justify-center bg-white text-sm p-4">
              Main Content
            </div>
          </DzResizablePanel>
        </DzResizable>
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
  },
  render: args => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    setup() {
      return { args }
    },
    template: `
      <DzResizable v-bind="args" class="h-40 border rounded-lg">
        <DzResizablePanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm p-4">
            Resizing disabled
          </div>
        </DzResizablePanel>
        <DzResizableHandle />
        <DzResizablePanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm p-4">
            Resizing disabled
          </div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Handle Without Indicator
// ---------------------------------------------------------------------------

export const HandleWithoutIndicator: Story = {
  name: 'Handle Without Visual Indicator',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-gray-500">Handle without the visual drag indicator (with-handle=false).</p>
        <DzResizable direction="horizontal" class="h-40 border rounded-lg">
          <DzResizablePanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-blue-50 text-sm">Left</div>
          </DzResizablePanel>
          <DzResizableHandle />
          <DzResizablePanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-green-50 text-sm">Right</div>
          </DzResizablePanel>
        </DzResizable>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Nested Resizable
// ---------------------------------------------------------------------------

export const NestedResizable: Story = {
  name: 'Nested Layout',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable direction="horizontal" class="h-72 border rounded-lg">
        <DzResizablePanel :default-size="30" :min-size="15">
          <div class="h-full flex items-center justify-center bg-blue-50 text-sm p-2">Sidebar</div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="70">
          <DzResizable direction="vertical" class="h-full">
            <DzResizablePanel :default-size="60">
              <div class="h-full flex items-center justify-center bg-white text-sm p-2">Editor</div>
            </DzResizablePanel>
            <DzResizableHandle with-handle />
            <DzResizablePanel :default-size="40">
              <div class="h-full flex items-center justify-center bg-gray-50 text-sm p-2">Terminal</div>
            </DzResizablePanel>
          </DzResizable>
        </DzResizablePanel>
      </DzResizable>
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
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable direction="horizontal" class="h-48 border border-gray-700 rounded-lg">
        <DzResizablePanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-800 text-gray-200 text-sm p-4">
            Left Panel
          </div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="50">
          <div class="h-full flex items-center justify-center bg-gray-800 text-gray-200 text-sm p-4">
            Right Panel
          </div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Layout Change Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Layout Change',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    data() {
      return { sizes: [50, 50] }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Sizes: {{ sizes.map(s => Math.round(s) + '%').join(' | ') }}
        </p>
        <DzResizable direction="horizontal" class="h-40 border rounded-lg" @layout-change="sizes = $event">
          <DzResizablePanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-blue-50 text-sm p-2">
              {{ Math.round(sizes[0]) }}%
            </div>
          </DzResizablePanel>
          <DzResizableHandle with-handle />
          <DzResizablePanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-green-50 text-sm p-2">
              {{ Math.round(sizes[1]) }}%
            </div>
          </DzResizablePanel>
        </DzResizable>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: IDE Layout
// ---------------------------------------------------------------------------

export const RealWorldIDELayout: Story = {
  name: 'Real World: IDE Layout',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <DzResizable direction="horizontal" class="h-96 border rounded-lg">
        <DzResizablePanel :default-size="20" :min-size="10" collapsible :collapsed-size="0">
          <div class="h-full bg-gray-50 p-3">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Explorer</p>
            <div class="space-y-1 text-sm">
              <div class="px-2 py-1 bg-blue-100 rounded text-blue-800">index.ts</div>
              <div class="px-2 py-1 hover:bg-gray-100 rounded">App.vue</div>
              <div class="px-2 py-1 hover:bg-gray-100 rounded">main.ts</div>
              <div class="px-2 py-1 hover:bg-gray-100 rounded">styles.css</div>
            </div>
          </div>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="55">
          <DzResizable direction="vertical" class="h-full">
            <DzResizablePanel :default-size="65">
              <div class="h-full p-4 font-mono text-sm">
                <p class="text-gray-400">// Editor area</p>
                <p><span class="text-purple-600">import</span> { createApp } <span class="text-purple-600">from</span> <span class="text-green-600">'vue'</span></p>
                <p><span class="text-purple-600">import</span> App <span class="text-purple-600">from</span> <span class="text-green-600">'./App.vue'</span></p>
                <br />
                <p>createApp(App).mount(<span class="text-green-600">'#app'</span>)</p>
              </div>
            </DzResizablePanel>
            <DzResizableHandle with-handle />
            <DzResizablePanel :default-size="35" :min-size="15">
              <div class="h-full bg-gray-900 text-green-400 p-3 font-mono text-xs">
                <p>$ npm run dev</p>
                <p class="text-gray-500">VITE v6.0.0 ready in 200ms</p>
                <p class="text-gray-500">Local: http://localhost:5173/</p>
              </div>
            </DzResizablePanel>
          </DzResizable>
        </DzResizablePanel>
        <DzResizableHandle with-handle />
        <DzResizablePanel :default-size="25" :min-size="15" collapsible :collapsed-size="0">
          <div class="h-full bg-gray-50 p-3">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Properties</p>
            <div class="space-y-2 text-sm">
              <div><span class="text-gray-500">Type:</span> TypeScript</div>
              <div><span class="text-gray-500">Size:</span> 1.2 KB</div>
              <div><span class="text-gray-500">Modified:</span> 2 min ago</div>
            </div>
          </div>
        </DzResizablePanel>
      </DzResizable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzResizable, DzResizablePanel, DzResizableHandle },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Focus the handle (Tab) and use Arrow keys to resize panels.
          The keyboard step is configurable via the keyboardResizeBy prop (default: 10%).
        </p>
        <DzResizable direction="horizontal" class="h-40 border rounded-lg" aria-label="Keyboard resizable demo">
          <DzResizablePanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-blue-50 text-sm p-2">
              Panel A
            </div>
          </DzResizablePanel>
          <DzResizableHandle with-handle />
          <DzResizablePanel :default-size="50">
            <div class="h-full flex items-center justify-center bg-green-50 text-sm p-2">
              Panel B
            </div>
          </DzResizablePanel>
        </DzResizable>
      </div>
    `,
  }),
}
