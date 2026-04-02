import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import { DzCard, DzCardBody, DzCardFooter, DzCardHeader } from '../../src/components/cards'
import { DzHeading, DzText } from '../../src/components/typography'

/**
 * DzCard is a surface container component supporting three visual variants
 * (`elevated`, `outlined`, `flat`), configurable padding, and optional
 * interactive behavior (hoverable, clickable).
 *
 * Use with DzCardHeader, DzCardBody, and DzCardFooter sub-components for structured layouts.
 */
const meta = {
  title: 'Core/Cards/DzCard',
  component: DzCard,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'elevated' } },
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    hoverable: {
      control: 'boolean',
      description: 'Adds hover shadow effect',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    clickable: {
      control: 'boolean',
      description: 'Makes the card interactive (adds button role and keyboard support)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element instead of wrapping div',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    variant: 'elevated',
    padding: 'md',
    hoverable: false,
    clickable: false,
  },
} satisfies Meta<typeof DzCard>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzButton, DzHeading, DzText },
    setup() {
      return { args }
    },
    template: `
      <DzCard v-bind="args" class="max-w-sm">
        <template #header>
          <DzCardHeader>
            <DzHeading :level="3" size="lg">Card Title</DzHeading>
          </DzCardHeader>
        </template>
        <DzCardBody>
          <DzText tone="muted">
            This is the card body content. It can contain any text or components.
          </DzText>
        </DzCardBody>
        <template #footer>
          <DzCardFooter>
            <DzButton variant="ghost" tone="neutral" size="sm">Cancel</DzButton>
            <DzButton size="sm">Save</DzButton>
          </DzCardFooter>
        </template>
      </DzCard>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzCard, DzCardBody, DzHeading, DzText },
    template: `
      <div class="flex flex-wrap gap-6">
        <DzCard variant="elevated" class="w-64">
          <DzCardBody>
            <DzHeading :level="4" size="md">Elevated</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">Card with shadow elevation.</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined" class="w-64">
          <DzCardBody>
            <DzHeading :level="4" size="md">Outlined</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">Card with a border outline.</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="flat" class="w-64">
          <DzCardBody>
            <DzHeading :level="4" size="md">Flat</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">Card with no shadow or border.</DzText>
          </DzCardBody>
        </DzCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Padding Gallery
// ---------------------------------------------------------------------------

export const AllPaddings: Story = {
  name: 'Padding Gallery',
  render: () => ({
    components: { DzCard, DzCardBody, DzText },
    template: `
      <div class="flex flex-wrap gap-6 items-start">
        <DzCard variant="outlined" padding="none" class="w-48">
          <DzCardBody>
            <DzText size="sm">padding: none</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined" padding="sm" class="w-48">
          <DzCardBody>
            <DzText size="sm">padding: sm</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined" padding="md" class="w-48">
          <DzCardBody>
            <DzText size="sm">padding: md</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined" padding="lg" class="w-48">
          <DzCardBody>
            <DzText size="sm">padding: lg</DzText>
          </DzCardBody>
        </DzCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Hoverable Card
// ---------------------------------------------------------------------------

export const Hoverable: Story = {
  render: () => ({
    components: { DzCard, DzCardBody, DzHeading, DzText },
    template: `
      <DzCard hoverable class="max-w-sm">
        <DzCardBody>
          <DzHeading :level="4" size="md">Hoverable Card</DzHeading>
          <DzText tone="muted" size="sm" class="mt-2">
            Hover over this card to see the shadow effect.
          </DzText>
        </DzCardBody>
      </DzCard>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Clickable Card
// ---------------------------------------------------------------------------

export const Clickable: Story = {
  render: () => ({
    components: { DzCard, DzCardBody, DzHeading, DzText },
    data() {
      return { clicked: false }
    },
    template: `
      <div class="space-y-3">
        <DzCard clickable class="max-w-sm" @click="clicked = !clicked">
          <DzCardBody>
            <DzHeading :level="4" size="md">Clickable Card</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">
              Click this card to toggle the state. Supports Enter/Space keyboard activation.
            </DzText>
          </DzCardBody>
        </DzCard>
        <DzText size="sm">State: {{ clicked ? 'Clicked!' : 'Not clicked' }}</DzText>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With All Slots
// ---------------------------------------------------------------------------

export const WithAllSlots: Story = {
  name: 'With All Slots',
  render: () => ({
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzButton, DzHeading, DzText },
    template: `
      <DzCard variant="outlined" class="max-w-md">
        <template #media>
          <div class="h-40 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg"></div>
        </template>
        <template #header>
          <DzCardHeader>
            <DzHeading :level="3" size="lg">Full Feature Card</DzHeading>
            <template #actions>
              <DzButton variant="ghost" size="sm" tone="neutral">Edit</DzButton>
            </template>
          </DzCardHeader>
        </template>
        <DzCardBody>
          <DzText tone="muted">
            This card demonstrates all available slots: media, header (with actions), body, actions, and footer.
          </DzText>
        </DzCardBody>
        <template #actions>
          <div class="px-4 py-2 flex gap-2">
            <DzButton variant="ghost" size="sm" tone="primary">Like</DzButton>
            <DzButton variant="ghost" size="sm" tone="primary">Share</DzButton>
          </div>
        </template>
        <template #footer>
          <DzCardFooter>
            <DzText size="xs" tone="muted">Last updated: 3 hours ago</DzText>
          </DzCardFooter>
        </template>
      </DzCard>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Media Slot
// ---------------------------------------------------------------------------

export const WithMedia: Story = {
  name: 'With Media',
  render: () => ({
    components: { DzCard, DzCardBody, DzHeading, DzText },
    template: `
      <DzCard variant="outlined" class="max-w-xs">
        <template #media>
          <div class="h-48 bg-gradient-to-br from-green-300 to-teal-500"></div>
        </template>
        <DzCardBody>
          <DzHeading :level="4" size="md">Nature Walk</DzHeading>
          <DzText tone="muted" size="sm" class="mt-1">
            A peaceful morning walk through the forest.
          </DzText>
        </DzCardBody>
      </DzCard>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Card with Actions
// ---------------------------------------------------------------------------

export const WithActions: Story = {
  name: 'With Footer Actions',
  render: () => ({
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzButton, DzHeading, DzText },
    template: `
      <DzCard variant="outlined" class="max-w-sm">
        <template #header>
          <DzCardHeader>
            <DzHeading :level="4" size="md">Confirm Action</DzHeading>
          </DzCardHeader>
        </template>
        <DzCardBody>
          <DzText tone="muted" size="sm">
            Are you sure you want to proceed? This action may have consequences.
          </DzText>
        </DzCardBody>
        <template #footer>
          <DzCardFooter>
            <DzButton variant="ghost" tone="neutral" size="sm">Cancel</DzButton>
            <DzButton tone="primary" size="sm">Confirm</DzButton>
          </DzCardFooter>
        </template>
      </DzCard>
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
    components: { DzCard, DzCardBody, DzHeading, DzText },
    template: `
      <div class="flex flex-wrap gap-6">
        <DzCard variant="elevated" class="w-64">
          <DzCardBody>
            <DzHeading :level="4" size="md">Elevated</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">Dark mode elevated card.</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined" class="w-64">
          <DzCardBody>
            <DzHeading :level="4" size="md">Outlined</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">Dark mode outlined card.</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="flat" class="w-64">
          <DzCardBody>
            <DzHeading :level="4" size="md">Flat</DzHeading>
            <DzText tone="muted" size="sm" class="mt-2">Dark mode flat card.</DzText>
          </DzCardBody>
        </DzCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Clickable Cards',
  render: () => ({
    components: { DzCard, DzCardBody, DzHeading, DzText },
    template: `
      <div class="space-y-4">
        <DzText size="sm" tone="muted">Tab to navigate between clickable cards. Press Enter or Space to activate.</DzText>
        <div class="flex gap-4">
          <DzCard clickable variant="outlined" class="w-48" @click="() => {}">
            <DzCardBody>
              <DzHeading :level="4" size="sm">Card 1</DzHeading>
              <DzText size="xs" tone="muted">Tab + Enter</DzText>
            </DzCardBody>
          </DzCard>
          <DzCard clickable variant="outlined" class="w-48" @click="() => {}">
            <DzCardBody>
              <DzHeading :level="4" size="sm">Card 2</DzHeading>
              <DzText size="xs" tone="muted">Tab + Space</DzText>
            </DzCardBody>
          </DzCard>
          <DzCard clickable variant="outlined" class="w-48" @click="() => {}">
            <DzCardBody>
              <DzHeading :level="4" size="sm">Card 3</DzHeading>
              <DzText size="xs" tone="muted">Focus ring visible</DzText>
            </DzCardBody>
          </DzCard>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Dashboard Stats
// ---------------------------------------------------------------------------

export const RealWorldDashboardStats: Story = {
  name: 'Real World: Dashboard Stats',
  render: () => ({
    components: { DzCard, DzCardBody, DzHeading, DzText },
    template: `
      <div class="grid grid-cols-3 gap-4">
        <DzCard variant="outlined">
          <DzCardBody>
            <DzText size="sm" tone="muted">Total Revenue</DzText>
            <DzHeading :level="3" size="2xl" class="mt-1">$45,231</DzHeading>
            <DzText size="xs" tone="success" class="mt-1">+20.1% from last month</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined">
          <DzCardBody>
            <DzText size="sm" tone="muted">Active Users</DzText>
            <DzHeading :level="3" size="2xl" class="mt-1">2,350</DzHeading>
            <DzText size="xs" tone="success" class="mt-1">+180 since last week</DzText>
          </DzCardBody>
        </DzCard>
        <DzCard variant="outlined">
          <DzCardBody>
            <DzText size="sm" tone="muted">Pending Orders</DzText>
            <DzHeading :level="3" size="2xl" class="mt-1">12</DzHeading>
            <DzText size="xs" tone="warning" class="mt-1">3 require attention</DzText>
          </DzCardBody>
        </DzCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Product Card
// ---------------------------------------------------------------------------

export const RealWorldProductCard: Story = {
  name: 'Real World: Product Card',
  render: () => ({
    components: { DzCard, DzCardBody, DzCardFooter, DzButton, DzHeading, DzText },
    template: `
      <DzCard variant="outlined" hoverable class="max-w-xs">
        <template #media>
          <div class="h-48 bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center">
            <span class="text-4xl">🎧</span>
          </div>
        </template>
        <DzCardBody>
          <DzText size="xs" tone="muted">Audio Equipment</DzText>
          <DzHeading :level="4" size="md" class="mt-1">Wireless Headphones</DzHeading>
          <DzText weight="bold" class="mt-2">$129.99</DzText>
        </DzCardBody>
        <template #footer>
          <DzCardFooter>
            <DzButton variant="outline" size="sm" tone="neutral">Details</DzButton>
            <DzButton size="sm">Add to Cart</DzButton>
          </DzCardFooter>
        </template>
      </DzCard>
    `,
  }),
}
