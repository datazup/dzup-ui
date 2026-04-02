import type { Meta, StoryObj } from '@storybook/vue3'
import { DzAvatar, DzAvatarGroup } from '../../src/components/media'

/**
 * DzAvatarGroup renders a stacked row of DzAvatar components with
 * negative overlap. When the number of children exceeds the `max`
 * prop, a "+N" overflow indicator is shown.
 *
 * The group propagates its `size` to all children via typed injection
 * (ADR-08), so individual avatars inherit the group size unless
 * explicitly overridden.
 */
const meta = {
  title: 'Core/Media/DzAvatarGroup',
  component: DzAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    max: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Maximum number of avatars to display before showing overflow count',
      table: { category: 'Behavior' },
    },
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size propagated to all child avatars',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the group',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof DzAvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzAvatarGroup, DzAvatar },
    setup() {
      return { args }
    },
    template: `
      <DzAvatarGroup v-bind="args">
        <DzAvatar src="https://i.pravatar.cc/150?u=a1" alt="User 1" />
        <DzAvatar src="https://i.pravatar.cc/150?u=a2" alt="User 2" />
        <DzAvatar src="https://i.pravatar.cc/150?u=a3" alt="User 3" />
      </DzAvatarGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzAvatarGroup, DzAvatar },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzAvatarGroup :size="size">
            <DzAvatar src="https://i.pravatar.cc/150?u=s1" alt="User 1" />
            <DzAvatar src="https://i.pravatar.cc/150?u=s2" alt="User 2" />
            <DzAvatar src="https://i.pravatar.cc/150?u=s3" alt="User 3" />
          </DzAvatarGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Overflow
// ---------------------------------------------------------------------------

export const WithOverflow: Story = {
  name: 'With Overflow (+N)',
  args: {
    max: 3,
  },
  render: args => ({
    components: { DzAvatarGroup, DzAvatar },
    setup() {
      return { args }
    },
    template: `
      <DzAvatarGroup v-bind="args">
        <DzAvatar src="https://i.pravatar.cc/150?u=o1" alt="User 1" />
        <DzAvatar src="https://i.pravatar.cc/150?u=o2" alt="User 2" />
        <DzAvatar src="https://i.pravatar.cc/150?u=o3" alt="User 3" />
        <DzAvatar src="https://i.pravatar.cc/150?u=o4" alt="User 4" />
        <DzAvatar src="https://i.pravatar.cc/150?u=o5" alt="User 5" />
        <DzAvatar src="https://i.pravatar.cc/150?u=o6" alt="User 6" />
      </DzAvatarGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Fallback Initials in Group
// ---------------------------------------------------------------------------

export const FallbackInitialsGroup: Story = {
  name: 'Fallback Initials in Group',
  render: () => ({
    components: { DzAvatarGroup, DzAvatar },
    template: `
      <DzAvatarGroup :max="4" size="md">
        <DzAvatar fallback="AB" alt="Alice Brown" />
        <DzAvatar fallback="JD" alt="Jane Doe" />
        <DzAvatar fallback="MK" alt="Max King" />
        <DzAvatar fallback="RL" alt="Rose Lee" />
        <DzAvatar fallback="TW" alt="Tom Wang" />
      </DzAvatarGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// No Overflow (max not set)
// ---------------------------------------------------------------------------

export const NoOverflow: Story = {
  name: 'No Overflow (max not set)',
  render: () => ({
    components: { DzAvatarGroup, DzAvatar },
    template: `
      <DzAvatarGroup>
        <DzAvatar src="https://i.pravatar.cc/150?u=n1" alt="User 1" />
        <DzAvatar src="https://i.pravatar.cc/150?u=n2" alt="User 2" />
        <DzAvatar src="https://i.pravatar.cc/150?u=n3" alt="User 3" />
        <DzAvatar src="https://i.pravatar.cc/150?u=n4" alt="User 4" />
        <DzAvatar src="https://i.pravatar.cc/150?u=n5" alt="User 5" />
      </DzAvatarGroup>
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
    components: { DzAvatarGroup, DzAvatar },
    template: `
      <DzAvatarGroup :max="3" size="md">
        <DzAvatar src="https://i.pravatar.cc/150?u=d1" alt="User 1" />
        <DzAvatar fallback="JD" alt="Jane Doe" />
        <DzAvatar src="https://i.pravatar.cc/150?u=d3" alt="User 3" />
        <DzAvatar fallback="MK" alt="Max King" />
        <DzAvatar src="https://i.pravatar.cc/150?u=d5" alt="User 5" />
      </DzAvatarGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility',
  render: () => ({
    components: { DzAvatarGroup, DzAvatar },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The group uses <code>role="group"</code> and accepts <code>aria-label</code>.
          The overflow indicator has <code>aria-hidden="true"</code>.
        </p>
        <DzAvatarGroup :max="2" aria-label="Project team members">
          <DzAvatar fallback="AB" alt="Alice Brown" />
          <DzAvatar fallback="JD" alt="Jane Doe" />
          <DzAvatar fallback="MK" alt="Max King" />
          <DzAvatar fallback="RL" alt="Rose Lee" />
        </DzAvatarGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Team Members
// ---------------------------------------------------------------------------

export const RealWorldTeamMembers: Story = {
  name: 'Real World: Team Members',
  render: () => ({
    components: { DzAvatarGroup, DzAvatar },
    template: `
      <div class="flex items-center gap-3">
        <DzAvatarGroup :max="4" size="sm" aria-label="Assigned team members">
          <DzAvatar src="https://i.pravatar.cc/150?u=team1" alt="Alice" />
          <DzAvatar src="https://i.pravatar.cc/150?u=team2" alt="Bob" />
          <DzAvatar src="https://i.pravatar.cc/150?u=team3" alt="Charlie" />
          <DzAvatar src="https://i.pravatar.cc/150?u=team4" alt="Diana" />
          <DzAvatar src="https://i.pravatar.cc/150?u=team5" alt="Eve" />
          <DzAvatar src="https://i.pravatar.cc/150?u=team6" alt="Frank" />
        </DzAvatarGroup>
        <span class="text-sm text-gray-500">6 members</span>
      </div>
    `,
  }),
}
