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
 * DzSheet compound sub-parts: DzSheetContent, DzSheetTitle, DzSheetDescription,
 * DzSheetClose, DzSheetTrigger.
 *
 * DzSheetContent supports four slide directions (top, right, bottom, left).
 * DzSheetTrigger opens the sheet; DzSheetClose dismisses it.
 * DzSheetTitle and DzSheetDescription provide accessible labeling.
 *
 * Built on Reka UI Dialog primitives (ADR-07).
 */

const meta = {
  title: 'Core/Overlays/DzSheetParts',
  component: DzSheetContent,
  subcomponents: {
    DzSheetTitle,
    DzSheetDescription,
    DzSheetClose,
    DzSheetTrigger,
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Side from which the sheet slides in',
      table: { category: 'Appearance', defaultValue: { summary: 'right' } },
    },
  },
} satisfies Meta<typeof DzSheetContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Right side
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <DzSheet>
        <DzSheetTrigger as-child>
          <DzButton>Open Sheet</DzButton>
        </DzSheetTrigger>
        <DzSheetContent side="right">
          <DzSheetTitle>Sheet Title</DzSheetTitle>
          <DzSheetDescription>This is a description of the sheet content.</DzSheetDescription>
          <div class="mt-4 space-y-3 text-sm">
            <p>Sheet body content goes here. This panel slides in from the right.</p>
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
  name: 'All Slide Directions',
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <div class="flex flex-wrap gap-4">
        <DzSheet v-for="side in ['top', 'right', 'bottom', 'left']" :key="side">
          <DzSheetTrigger as-child>
            <DzButton variant="outline" class="capitalize">{{ side }}</DzButton>
          </DzSheetTrigger>
          <DzSheetContent :side="side">
            <DzSheetTitle class="capitalize">{{ side }} Sheet</DzSheetTitle>
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
// With Form Content
// ---------------------------------------------------------------------------

export const WithFormContent: Story = {
  name: 'With Form Content',
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <DzSheet>
        <DzSheetTrigger as-child>
          <DzButton tone="primary">Edit Profile</DzButton>
        </DzSheetTrigger>
        <DzSheetContent side="right">
          <DzSheetTitle>Edit Profile</DzSheetTitle>
          <DzSheetDescription>Update your personal information below.</DzSheetDescription>
          <form class="space-y-4 mt-4" @submit.prevent>
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input type="text" value="Alice Johnson" class="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input type="email" value="alice@example.com" class="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Bio</label>
              <textarea class="w-full border rounded px-3 py-2 text-sm" rows="3">Software engineer at Acme Inc.</textarea>
            </div>
            <div class="flex gap-3 pt-2 border-t">
              <DzSheetClose as-child>
                <DzButton variant="ghost" tone="neutral">Cancel</DzButton>
              </DzSheetClose>
              <DzButton type="submit" tone="primary">Save</DzButton>
            </div>
          </form>
        </DzSheetContent>
      </DzSheet>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Controlled Open State
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Controlled Open State',
  render: () => ({
    components: { DzSheet, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    data() {
      return { isOpen: false }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true">Open Programmatically</DzButton>
          <span class="text-sm text-gray-500">State: {{ isOpen ? 'Open' : 'Closed' }}</span>
        </div>
        <DzSheet v-model:open="isOpen">
          <DzSheetContent side="right">
            <DzSheetTitle>Controlled Sheet</DzSheetTitle>
            <DzSheetDescription>This sheet is opened via v-model:open.</DzSheetDescription>
            <DzButton variant="outline" tone="neutral" class="mt-4" @click="isOpen = false">Close</DzButton>
          </DzSheetContent>
        </DzSheet>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus Management',
  render: () => ({
    components: { DzSheet, DzSheetTrigger, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzSheet uses Reka UI Dialog for focus management. Focus is trapped inside
          the sheet when open. Pressing Escape closes the sheet. Focus returns to
          the trigger on close. DzSheetTitle and DzSheetDescription provide
          aria-labelledby and aria-describedby for the sheet content.
        </p>
        <DzSheet>
          <DzSheetTrigger as-child>
            <DzButton>Open Accessible Sheet</DzButton>
          </DzSheetTrigger>
          <DzSheetContent side="right">
            <DzSheetTitle>Accessible Sheet</DzSheetTitle>
            <DzSheetDescription>Tab through the buttons. Press Escape to close.</DzSheetDescription>
            <div class="flex gap-3 mt-4">
              <DzSheetClose as-child>
                <DzButton variant="outline" tone="neutral">Cancel</DzButton>
              </DzSheetClose>
              <DzSheetClose as-child>
                <DzButton tone="primary">Confirm</DzButton>
              </DzSheetClose>
            </div>
          </DzSheetContent>
        </DzSheet>
      </div>
    `,
  }),
}
