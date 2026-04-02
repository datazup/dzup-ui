import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import {
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '../../src/components/overlays'

/**
 * DzTooltip is a compound tooltip component built on Reka UI Tooltip (ADR-07).
 *
 * It supports four placement sides (`top`, `right`, `bottom`, `left`), three alignments
 * (`start`, `center`, `end`), optional arrow, configurable delay, and controlled open
 * state via `v-model:open` (ADR-16).
 */
const meta = {
  title: 'Core/Overlays/DzTooltip',
  component: DzTooltip,
  subcomponents: {
    DzTooltipTrigger,
    DzTooltipContent,
  },
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    delayDuration: {
      control: { type: 'number', min: 0, max: 2000, step: 50 },
      description: 'Delay in ms before tooltip appears',
      table: { category: 'Behavior', defaultValue: { summary: '200' } },
    },
    disableHoverableContent: {
      control: 'boolean',
      description: 'Disable hovering over content to keep it open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior' },
    },
  },
  args: {
    delayDuration: 200,
    disableHoverableContent: false,
  },
} satisfies Meta<typeof DzTooltip>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    setup() {
      return { args }
    },
    template: `
      <div class="flex justify-center py-16">
        <DzTooltip v-bind="args">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">Hover Me</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>This is a tooltip</DzTooltipContent>
        </DzTooltip>
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
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-24">
        <DzTooltip v-for="side in ['top', 'right', 'bottom', 'left']" :key="side" :delay-duration="0">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">{{ side.charAt(0).toUpperCase() + side.slice(1) }}</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent :side="side">Tooltip on {{ side }}</DzTooltipContent>
        </DzTooltip>
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
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-16">
        <DzTooltip v-for="align in ['start', 'center', 'end']" :key="align" :delay-duration="0">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">Align: {{ align }}</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent :align="align">Aligned to {{ align }}</DzTooltipContent>
        </DzTooltip>
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
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzTooltip :delay-duration="0">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">No Arrow</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent :arrow="false">Tooltip without an arrow</DzTooltipContent>
        </DzTooltip>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Delay
// ---------------------------------------------------------------------------

export const CustomDelay: Story = {
  name: 'Custom Delay',
  render: () => ({
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-16">
        <DzTooltip :delay-duration="0">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">Instant (0ms)</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>No delay</DzTooltipContent>
        </DzTooltip>
        <DzTooltip :delay-duration="500">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">Slow (500ms)</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>500ms delay</DzTooltipContent>
        </DzTooltip>
        <DzTooltip :delay-duration="1000">
          <DzTooltipTrigger as-child>
            <DzButton variant="outline">Very Slow (1s)</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>1000ms delay</DzTooltipContent>
        </DzTooltip>
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
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzTooltip :delay-duration="0">
          <DzTooltipTrigger as-child>
            <DzButton>Hover for Details</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent side="bottom" :side-offset="8">
            <div class="space-y-1">
              <p class="font-medium text-xs">Keyboard Shortcut</p>
              <p class="text-xs opacity-75">Press Ctrl+S to save your work.</p>
            </div>
          </DzTooltipContent>
        </DzTooltip>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Controlled Open
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    data() {
      return { isOpen: false }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton variant="outline" tone="neutral" @click="isOpen = !isOpen">
            Force {{ isOpen ? 'Close' : 'Open' }} Tooltip
          </DzButton>
          <span class="text-sm">State: {{ isOpen ? 'Open' : 'Closed' }}</span>
        </div>
        <div class="flex justify-center py-12">
          <DzTooltip v-model:open="isOpen">
            <DzTooltipTrigger as-child>
              <DzButton>Controlled Tooltip</DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent>Controlled via v-model:open</DzTooltipContent>
          </DzTooltip>
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
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex justify-center py-16">
        <DzTooltip :delay-duration="0">
          <DzTooltipTrigger as-child>
            <DzButton>Hover in Dark Mode</DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>Dark mode tooltip</DzTooltipContent>
        </DzTooltip>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Keyboard & Screen Reader
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard & Screen Reader',
  render: () => ({
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Tooltips appear on hover and focus. Tab to the button to trigger the tooltip
          via keyboard. The tooltip content is announced to screen readers.
        </p>
        <div class="flex gap-8 justify-center py-16">
          <DzTooltip :delay-duration="0">
            <DzTooltipTrigger as-child>
              <DzButton aria-label="Save document">Save</DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent>Save your current document (Ctrl+S)</DzTooltipContent>
          </DzTooltip>
          <DzTooltip :delay-duration="0">
            <DzTooltipTrigger as-child>
              <DzButton aria-label="Delete item" tone="danger" variant="outline">Delete</DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent>Permanently delete this item</DzTooltipContent>
          </DzTooltip>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Icon Button Tooltips
// ---------------------------------------------------------------------------

export const RealWorldIconTooltips: Story = {
  name: 'Real World: Icon Button Tooltips',
  render: () => ({
    components: { DzTooltip, DzTooltipTrigger, DzTooltipContent, DzButton },
    template: `
      <div class="flex gap-1 items-center justify-center py-16">
        <DzTooltip v-for="(action, i) in [
          { label: 'Bold', shortcut: 'Ctrl+B', icon: 'B' },
          { label: 'Italic', shortcut: 'Ctrl+I', icon: 'I' },
          { label: 'Underline', shortcut: 'Ctrl+U', icon: 'U' },
          { label: 'Strikethrough', shortcut: 'Ctrl+D', icon: 'S' },
        ]" :key="i" :delay-duration="100">
          <DzTooltipTrigger as-child>
            <DzButton
              variant="ghost"
              tone="neutral"
              size="sm"
              :aria-label="action.label"
            >
              <span :class="{ 'font-bold': action.icon === 'B', 'italic': action.icon === 'I', 'underline': action.icon === 'U', 'line-through': action.icon === 'S' }">
                {{ action.icon }}
              </span>
            </DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>
            {{ action.label }}
            <span class="ml-2 opacity-60 text-xs">{{ action.shortcut }}</span>
          </DzTooltipContent>
        </DzTooltip>
      </div>
    `,
  }),
}
