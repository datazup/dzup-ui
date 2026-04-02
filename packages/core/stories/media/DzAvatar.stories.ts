import type { Meta, StoryObj } from '@storybook/vue3'
import { User } from 'lucide-vue-next'
import { DzAvatar } from '../../src/components/media'

/**
 * DzAvatar displays a user avatar with image support, fallback initials,
 * or custom slot content (e.g. an icon). It supports two shapes
 * (`circle`, `square`) and five canonical sizes.
 *
 * When placed inside a `DzAvatarGroup`, the group's `size` prop is
 * inherited unless overridden on the individual avatar.
 */
const meta = {
  title: 'Core/Media/DzAvatar',
  component: DzAvatar,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    src: {
      control: 'text',
      description: 'Image source URL',
      table: { category: 'Appearance' },
    },
    alt: {
      control: 'text',
      description: 'Alt text for the avatar image',
      table: { category: 'Appearance' },
    },
    fallback: {
      control: 'text',
      description: 'Fallback text (typically initials) when image is unavailable',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
      table: { category: 'Appearance', defaultValue: { summary: 'circle' } },
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
    size: 'md',
    shape: 'circle',
    fallback: 'JD',
    alt: 'Jane Doe',
  },
} satisfies Meta<typeof DzAvatar>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzAvatar },
    setup() {
      return { args }
    },
    template: '<DzAvatar v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// With Image
// ---------------------------------------------------------------------------

export const WithImage: Story = {
  name: 'With Image',
  args: {
    src: 'https://i.pravatar.cc/150?u=jane',
    alt: 'Jane Doe',
  },
  render: args => ({
    components: { DzAvatar },
    setup() {
      return { args }
    },
    template: '<DzAvatar v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzAvatar },
    template: `
      <div class="flex items-end gap-4">
        <DzAvatar size="xs" fallback="XS" alt="Extra small avatar" />
        <DzAvatar size="sm" fallback="SM" alt="Small avatar" />
        <DzAvatar size="md" fallback="MD" alt="Medium avatar" />
        <DzAvatar size="lg" fallback="LG" alt="Large avatar" />
        <DzAvatar size="xl" fallback="XL" alt="Extra large avatar" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Shape Gallery
// ---------------------------------------------------------------------------

export const AllShapes: Story = {
  name: 'Shape Gallery',
  render: () => ({
    components: { DzAvatar },
    template: `
      <div class="flex items-center gap-4">
        <DzAvatar shape="circle" fallback="CI" alt="Circle avatar" />
        <DzAvatar shape="square" fallback="SQ" alt="Square avatar" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Fallback Initials
// ---------------------------------------------------------------------------

export const FallbackInitials: Story = {
  name: 'Fallback Initials',
  render: () => ({
    components: { DzAvatar },
    template: `
      <div class="flex items-center gap-4">
        <DzAvatar fallback="AB" alt="Alice Brown" />
        <DzAvatar fallback="JD" alt="Jane Doe" />
        <DzAvatar fallback="MK" alt="Max King" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slot (Icon Fallback)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slot: Icon Fallback',
  render: () => ({
    components: { DzAvatar, User },
    template: `
      <div class="flex items-center gap-4">
        <DzAvatar alt="User icon fallback" size="md">
          <User class="h-4 w-4" />
        </DzAvatar>
        <DzAvatar alt="User icon fallback" size="lg">
          <User class="h-5 w-5" />
        </DzAvatar>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Image Error (Fallback Trigger)
// ---------------------------------------------------------------------------

export const ImageError: Story = {
  name: 'Image Error (Fallback)',
  args: {
    src: 'https://invalid-url.test/broken.jpg',
    fallback: 'ER',
    alt: 'Broken image avatar',
  },
  render: args => ({
    components: { DzAvatar },
    setup() {
      return { args }
    },
    template: '<DzAvatar v-bind="args" />',
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
    components: { DzAvatar },
    template: `
      <div class="flex items-center gap-4">
        <DzAvatar src="https://i.pravatar.cc/150?u=dark1" alt="User 1" />
        <DzAvatar fallback="DK" alt="Dark mode fallback" />
        <DzAvatar fallback="SQ" shape="square" alt="Square dark" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Error Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzAvatar },
    data() {
      return { errorCount: 0 }
    },
    template: `
      <div class="space-y-4">
        <DzAvatar
          src="https://invalid-url.test/broken.jpg"
          fallback="!!"
          alt="Error demo"
          @error="errorCount++"
        />
        <p class="text-sm text-gray-500">Image error events fired: {{ errorCount }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Focus States
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility',
  render: () => ({
    components: { DzAvatar },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Avatars use <code>role="img"</code> and support <code>aria-label</code>.
          The fallback text has <code>aria-hidden="true"</code> to avoid duplicate announcements.
        </p>
        <div class="flex items-center gap-4">
          <DzAvatar aria-label="Jane Doe" fallback="JD" />
          <DzAvatar aria-label="Alice Brown" src="https://i.pravatar.cc/150?u=alice" alt="Alice Brown" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: User Profile Header
// ---------------------------------------------------------------------------

export const RealWorldProfileHeader: Story = {
  name: 'Real World: User Profile Header',
  render: () => ({
    components: { DzAvatar },
    template: `
      <div class="flex items-center gap-3">
        <DzAvatar src="https://i.pravatar.cc/150?u=profile" alt="Jane Doe" size="lg" />
        <div>
          <p class="font-medium text-sm">Jane Doe</p>
          <p class="text-xs text-gray-500">jane.doe@example.com</p>
        </div>
      </div>
    `,
  }),
}
