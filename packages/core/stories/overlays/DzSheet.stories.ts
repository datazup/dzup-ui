import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import {
  DzSheet,
  DzSheetClose,
  DzSheetContent,
  DzSheetDescription,
  DzSheetTitle,
  DzSheetTrigger,
} from '../../src/components/overlays'

/**
 * DzSheet is a compound slide-out side panel built on Reka UI Dialog (ADR-07).
 *
 * It supports four slide directions (`top`, `right`, `bottom`, `left`) and manages
 * open state via `v-model:open` (ADR-16). The sheet is modal by default.
 */
const meta = {
  title: 'Core/Overlays/DzSheet',
  component: DzSheet,
  subcomponents: {
    DzSheetTrigger,
    DzSheetContent,
    DzSheetTitle,
    DzSheetDescription,
    DzSheetClose,
  },
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modal: {
      control: 'boolean',
      description: 'Whether the sheet is modal',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof DzSheet>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    setup() {
      return { args }
    },
    template: `
      <DzSheet v-bind="args">
        <DzSheetTrigger as-child>
          <DzButton>Open Sheet</DzButton>
        </DzSheetTrigger>
        <DzSheetContent>
          <DzSheetTitle>Sheet Title</DzSheetTitle>
          <DzSheetDescription>This sheet slides in from the right by default.</DzSheetDescription>
          <div class="mt-4 space-y-2">
            <p class="text-sm">Sheet body content goes here.</p>
          </div>
          <DzSheetClose as-child>
            <DzButton variant="outline" tone="neutral" class="mt-4">Close</DzButton>
          </DzSheetClose>
        </DzSheetContent>
      </DzSheet>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Sides
// ---------------------------------------------------------------------------

export const AllSides: Story = {
  name: 'Side Gallery',
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSheet v-for="side in ['top', 'right', 'bottom', 'left']" :key="side">
          <DzSheetTrigger as-child>
            <DzButton variant="outline">{{ side.charAt(0).toUpperCase() + side.slice(1) }}</DzButton>
          </DzSheetTrigger>
          <DzSheetContent :side="side">
            <DzSheetTitle>{{ side.charAt(0).toUpperCase() + side.slice(1) }} Sheet</DzSheetTitle>
            <DzSheetDescription>This sheet slides in from the {{ side }}.</DzSheetDescription>
            <DzSheetClose as-child>
              <DzButton variant="outline" tone="neutral" class="mt-4">Close</DzButton>
            </DzSheetClose>
          </DzSheetContent>
        </DzSheet>
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
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <DzSheet>
        <DzSheetTrigger as-child>
          <DzButton>Settings</DzButton>
        </DzSheetTrigger>
        <DzSheetContent side="right">
          <DzSheetTitle>Settings</DzSheetTitle>
          <DzSheetDescription>Adjust your application preferences.</DzSheetDescription>
          <div class="space-y-4 mt-4">
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Dark Mode</span>
              <input type="checkbox" />
            </div>
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Notifications</span>
              <input type="checkbox" checked />
            </div>
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Language</span>
              <select class="border rounded px-2 py-1 text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <DzSheetClose as-child>
              <DzButton variant="outline" tone="neutral" class="flex-1">Cancel</DzButton>
            </DzSheetClose>
            <DzSheetClose as-child>
              <DzButton tone="primary" class="flex-1">Save</DzButton>
            </DzSheetClose>
          </div>
        </DzSheetContent>
      </DzSheet>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Controlled Open
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    data() {
      return { isOpen: false, savedCount: 0 }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true">Open Controlled Sheet</DzButton>
          <span class="text-sm">State: {{ isOpen ? 'Open' : 'Closed' }}</span>
          <span v-if="savedCount" class="text-sm text-green-600">Saved {{ savedCount }} time(s)</span>
        </div>
        <DzSheet v-model:open="isOpen">
          <DzSheetContent>
            <DzSheetTitle>Edit Profile</DzSheetTitle>
            <DzSheetDescription>Make changes to your profile.</DzSheetDescription>
            <div class="space-y-4 mt-4">
              <div>
                <label class="block text-sm font-medium mb-1">Name</label>
                <input type="text" value="John Doe" class="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" value="john@example.com" class="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <DzButton variant="outline" tone="neutral" @click="isOpen = false">Cancel</DzButton>
              <DzButton tone="primary" @click="savedCount++; isOpen = false">Save Changes</DzButton>
            </div>
          </DzSheetContent>
        </DzSheet>
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
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <DzSheet>
        <DzSheetTrigger as-child>
          <DzButton>Open in Dark Mode</DzButton>
        </DzSheetTrigger>
        <DzSheetContent side="right">
          <DzSheetTitle>Dark Mode Sheet</DzSheetTitle>
          <DzSheetDescription>This sheet renders within a dark theme context.</DzSheetDescription>
          <DzSheetClose as-child>
            <DzButton variant="outline" tone="neutral" class="mt-4">Close</DzButton>
          </DzSheetClose>
        </DzSheetContent>
      </DzSheet>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Focus & Keyboard
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus & Keyboard',
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Open the sheet, then Tab through elements. Press Escape to close.
          Focus returns to the trigger on close.
        </p>
        <DzSheet>
          <DzSheetTrigger as-child>
            <DzButton aria-label="Open accessible sheet">Open Sheet</DzButton>
          </DzSheetTrigger>
          <DzSheetContent side="right" aria-label="Navigation sheet">
            <DzSheetTitle>Navigation</DzSheetTitle>
            <DzSheetDescription>Use Tab to move between links. Escape closes the sheet.</DzSheetDescription>
            <nav class="mt-4 space-y-2">
              <a href="#" class="block text-sm px-3 py-2 rounded hover:bg-gray-100">Dashboard</a>
              <a href="#" class="block text-sm px-3 py-2 rounded hover:bg-gray-100">Projects</a>
              <a href="#" class="block text-sm px-3 py-2 rounded hover:bg-gray-100">Settings</a>
            </nav>
            <DzSheetClose as-child>
              <DzButton variant="outline" tone="neutral" class="mt-6">Close</DzButton>
            </DzSheetClose>
          </DzSheetContent>
        </DzSheet>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Mobile Navigation
// ---------------------------------------------------------------------------

export const RealWorldMobileNav: Story = {
  name: 'Real World: Mobile Navigation',
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <DzSheet>
        <DzSheetTrigger as-child>
          <DzButton variant="ghost" tone="neutral" aria-label="Open navigation menu">
            <span class="text-lg">&#9776;</span>
          </DzButton>
        </DzSheetTrigger>
        <DzSheetContent side="left">
          <DzSheetTitle>Menu</DzSheetTitle>
          <DzSheetDescription class="sr-only">Application navigation menu</DzSheetDescription>
          <nav class="mt-6 space-y-1">
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded bg-gray-100">Home</a>
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-gray-100">Projects</a>
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-gray-100">Team</a>
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-gray-100">Calendar</a>
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-gray-100">Reports</a>
          </nav>
          <div class="mt-auto pt-6 border-t">
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-gray-100">Settings</a>
            <a href="#" class="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-gray-100">Log Out</a>
          </div>
        </DzSheetContent>
      </DzSheet>
    `,
  }),
}
