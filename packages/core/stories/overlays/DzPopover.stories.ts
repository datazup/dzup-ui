import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import {
  DzPopover,
  DzPopoverContent,
  DzPopoverTrigger,
} from '../../src/components/overlays'

/**
 * DzPopover is a compound floating content panel built on Reka UI Popover (ADR-07).
 *
 * It supports four placement sides (`top`, `right`, `bottom`, `left`), three alignments
 * (`start`, `center`, `end`), three sizes (`sm`, `md`, `lg`), and an optional arrow.
 * Open state is controlled via `v-model:open` (ADR-16).
 */
const meta = {
  title: 'Core/Overlays/DzPopover',
  component: DzPopover,
  subcomponents: {
    DzPopoverTrigger,
    DzPopoverContent,
  },
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modal: {
      control: 'boolean',
      description: 'Whether the popover is modal (traps focus)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    modal: false,
  },
} satisfies Meta<typeof DzPopover>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    setup() {
      return { args }
    },
    template: `
      <div class="flex justify-center py-16">
        <DzPopover v-bind="args">
          <DzPopoverTrigger as-child>
            <DzButton variant="outline">Open Popover</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent>
            <p class="text-sm">This is popover content with default placement (bottom).</p>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Sides
// ---------------------------------------------------------------------------

export const AllSides: Story = {
  name: 'Side Gallery',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-24">
        <DzPopover v-for="side in ['top', 'right', 'bottom', 'left']" :key="side">
          <DzPopoverTrigger as-child>
            <DzButton variant="outline">{{ side.charAt(0).toUpperCase() + side.slice(1) }}</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent :side="side">
            <p class="text-sm">Popover on the {{ side }}.</p>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-16">
        <DzPopover v-for="size in ['sm', 'md', 'lg']" :key="size">
          <DzPopoverTrigger as-child>
            <DzButton variant="outline">{{ size.toUpperCase() }}</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent :size="size">
            <p class="text-sm font-medium mb-1">{{ size.toUpperCase() }} Popover</p>
            <p class="text-sm">This popover uses the "{{ size }}" size variant.</p>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Alignment Options
// ---------------------------------------------------------------------------

export const Alignments: Story = {
  name: 'Alignment Options',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-16">
        <DzPopover v-for="align in ['start', 'center', 'end']" :key="align">
          <DzPopoverTrigger as-child>
            <DzButton variant="outline">Align: {{ align }}</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent :align="align">
            <p class="text-sm">Aligned to {{ align }}.</p>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Without Arrow
// ---------------------------------------------------------------------------

export const WithoutArrow: Story = {
  name: 'Without Arrow',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzPopover>
          <DzPopoverTrigger as-child>
            <DzButton variant="outline">No Arrow</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent :arrow="false">
            <p class="text-sm">This popover has no arrow indicator.</p>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots (Rich Content)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Rich Slot Content',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzPopover>
          <DzPopoverTrigger as-child>
            <DzButton>User Info</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent size="lg">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                JD
              </div>
              <div>
                <p class="font-medium text-sm">Jane Doe</p>
                <p class="text-xs text-gray-500">jane@example.com</p>
                <p class="text-xs text-gray-500 mt-1">Product Designer</p>
              </div>
            </div>
            <div class="flex gap-2 mt-3 pt-3 border-t">
              <DzButton size="xs" variant="outline" tone="neutral">Profile</DzButton>
              <DzButton size="xs" variant="outline" tone="neutral">Message</DzButton>
            </div>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Controlled Open
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    data() {
      return { isOpen: false }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton variant="outline" tone="neutral" @click="isOpen = !isOpen">
            Toggle Popover ({{ isOpen ? 'Open' : 'Closed' }})
          </DzButton>
        </div>
        <div class="flex justify-center py-8">
          <DzPopover v-model:open="isOpen">
            <DzPopoverTrigger as-child>
              <DzButton>Trigger</DzButton>
            </DzPopoverTrigger>
            <DzPopoverContent>
              <p class="text-sm">Controlled popover. Use the toggle button or click the trigger.</p>
            </DzPopoverContent>
          </DzPopover>
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
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzPopover>
          <DzPopoverTrigger as-child>
            <DzButton>Open in Dark Mode</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent>
            <p class="text-sm">Dark mode popover content.</p>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Keyboard Navigation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Click the trigger or press Enter/Space to open. Press Escape to close.
          Tab navigates to interactive content inside the popover.
        </p>
        <div class="flex justify-center py-16">
          <DzPopover>
            <DzPopoverTrigger as-child>
              <DzButton aria-label="Toggle notification settings">Notifications</DzButton>
            </DzPopoverTrigger>
            <DzPopoverContent>
              <p class="text-sm font-medium mb-2">Notification Preferences</p>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked /> Email
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" /> SMS
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked /> Push
                </label>
              </div>
              <DzButton size="sm" tone="primary" class="mt-3 w-full">Save</DzButton>
            </DzPopoverContent>
          </DzPopover>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Date Picker Trigger
// ---------------------------------------------------------------------------

export const RealWorldDatePicker: Story = {
  name: 'Real World: Date Picker Trigger',
  render: () => ({
    components: { DzPopover, DzPopoverTrigger, DzPopoverContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzPopover>
          <DzPopoverTrigger as-child>
            <DzButton variant="outline" tone="neutral">Pick a date</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent size="md" :arrow="false">
            <p class="text-sm font-medium mb-3">Select Date</p>
            <div class="grid grid-cols-7 gap-1 text-xs text-center">
              <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day" class="text-gray-400 py-1">
                {{ day }}
              </span>
              <button
                v-for="n in 28"
                :key="n"
                class="py-1 rounded hover:bg-blue-100 text-sm"
                :class="{ 'bg-blue-500 text-white hover:bg-blue-600': n === 15 }"
              >
                {{ n }}
              </button>
            </div>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}
