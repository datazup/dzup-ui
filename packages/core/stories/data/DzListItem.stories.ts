import type { Meta, StoryObj } from '@storybook/vue3'
import { DzList, DzListItem } from '../../src/components/data'

/**
 * DzListItem is a compound sub-part of DzList.
 *
 * Each item receives size, variant, and interactive context from DzList
 * via inject (ADR-08). Items support disabled/active states, per-item tone,
 * and prefix/suffix slots for icons, badges, and actions.
 */

const meta = {
  title: 'Core/Data/DzListItem',
  component: DzListItem,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    active: {
      control: 'boolean',
      description: 'Whether this item is currently active/selected',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone for this item',
      table: { category: 'Appearance' },
    },
  },
  decorators: [
    () => ({
      components: { DzList },
      template: '<DzList variant="divided" aria-label="Demo list"><story /></DzList>',
    }),
  ],
} satisfies Meta<typeof DzListItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzListItem },
    setup() {
      return { args }
    },
    template: '<DzListItem v-bind="args">A simple list item</DzListItem>',
  }),
}

// ---------------------------------------------------------------------------
// All Tones
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'All Tones',
  decorators: [],
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <DzList variant="divided" aria-label="Tones gallery">
        <DzListItem tone="neutral">Neutral tone</DzListItem>
        <DzListItem tone="primary">Primary tone</DzListItem>
        <DzListItem tone="success">Success tone</DzListItem>
        <DzListItem tone="warning">Warning tone</DzListItem>
        <DzListItem tone="danger">Danger tone</DzListItem>
        <DzListItem tone="info">Info tone</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Active State
// ---------------------------------------------------------------------------

export const ActiveState: Story = {
  name: 'Active State',
  decorators: [],
  render: () => ({
    components: { DzList, DzListItem },
    data() {
      return { selected: 'Settings' }
    },
    template: `
      <DzList interactive variant="bordered" aria-label="Navigation items">
        <DzListItem
          v-for="item in ['Dashboard', 'Settings', 'Profile']"
          :key="item"
          :active="selected === item"
          @click="selected = item"
        >{{ item }}</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix & Suffix Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Prefix & Suffix Slots',
  decorators: [],
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <DzList variant="divided" aria-label="Contacts">
        <DzListItem>
          <template #prefix>
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">AJ</div>
          </template>
          Alice Johnson
          <template #suffix>
            <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Online</span>
          </template>
        </DzListItem>
        <DzListItem>
          <template #prefix>
            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">BS</div>
          </template>
          Bob Smith
          <template #suffix>
            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Offline</span>
          </template>
        </DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Items
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzListItem },
    setup() {
      return { args }
    },
    template: '<DzListItem v-bind="args">Disabled list item</DzListItem>',
  }),
}
