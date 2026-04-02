import type { Meta, StoryObj } from '@storybook/vue3'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  X,
} from 'lucide-vue-next'
import { DzIconButton } from '../../src/components/buttons'

/**
 * DzIconButton renders a single icon with no visible text.
 *
 * The `ariaLabel` prop is **required** for accessibility since there is no visible label.
 * Supports the same variants, tones, and sizes as DzButton.
 */
const meta = {
  title: 'Core/Buttons/DzIconButton',
  component: DzIconButton,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    icon: {
      description: 'Icon component to render (from lucide-vue-next or similar)',
      table: { category: 'Appearance' },
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'text', 'link'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state -- shows spinner and sets aria-busy',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
      table: { category: 'Behavior', defaultValue: { summary: 'button' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label (REQUIRED)',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    icon: Plus,
    ariaLabel: 'Add item',
    variant: 'solid',
    size: 'md',
    tone: 'primary',
    disabled: false,
    loading: false,
  },
} satisfies Meta<typeof DzIconButton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {}

// ---------------------------------------------------------------------------
// All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzIconButton, Plus },
    template: `
      <div class="flex items-end gap-4">
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Add (xs)" size="xs" />
          <p class="text-xs mt-1 text-gray-500">xs</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Add (sm)" size="sm" />
          <p class="text-xs mt-1 text-gray-500">sm</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Add (md)" size="md" />
          <p class="text-xs mt-1 text-gray-500">md</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Add (lg)" size="lg" />
          <p class="text-xs mt-1 text-gray-500">lg</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Add (xl)" size="xl" />
          <p class="text-xs mt-1 text-gray-500">xl</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzIconButton, Heart },
    template: `
      <div class="flex gap-4 items-center">
        <div class="text-center">
          <DzIconButton :icon="Heart" aria-label="Like (solid)" variant="solid" />
          <p class="text-xs mt-1 text-gray-500">solid</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Heart" aria-label="Like (outline)" variant="outline" />
          <p class="text-xs mt-1 text-gray-500">outline</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Heart" aria-label="Like (ghost)" variant="ghost" />
          <p class="text-xs mt-1 text-gray-500">ghost</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Heart" aria-label="Like (text)" variant="text" />
          <p class="text-xs mt-1 text-gray-500">text</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Heart" aria-label="Like (link)" variant="link" />
          <p class="text-xs mt-1 text-gray-500">link</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Tones
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzIconButton, Star },
    template: `
      <div class="flex gap-4 items-center">
        <div class="text-center">
          <DzIconButton :icon="Star" aria-label="Neutral" tone="neutral" />
          <p class="text-xs mt-1 text-gray-500">neutral</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Star" aria-label="Primary" tone="primary" />
          <p class="text-xs mt-1 text-gray-500">primary</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Star" aria-label="Success" tone="success" />
          <p class="text-xs mt-1 text-gray-500">success</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Star" aria-label="Warning" tone="warning" />
          <p class="text-xs mt-1 text-gray-500">warning</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Star" aria-label="Danger" tone="danger" />
          <p class="text-xs mt-1 text-gray-500">danger</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Star" aria-label="Info" tone="info" />
          <p class="text-xs mt-1 text-gray-500">info</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States: Disabled and Loading
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzIconButton, Plus },
    template: `
      <div class="flex gap-4 items-center">
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Default" />
          <p class="text-xs mt-1 text-gray-500">default</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Disabled" disabled />
          <p class="text-xs mt-1 text-gray-500">disabled</p>
        </div>
        <div class="text-center">
          <DzIconButton :icon="Plus" aria-label="Loading" loading />
          <p class="text-xs mt-1 text-gray-500">loading</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

export const Loading: Story = {
  args: {
    loading: true,
    ariaLabel: 'Loading action',
  },
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    ariaLabel: 'Disabled action',
  },
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
    components: { DzIconButton, Heart },
    template: `
      <div class="flex gap-4 items-center">
        <DzIconButton :icon="Heart" aria-label="Solid" variant="solid" />
        <DzIconButton :icon="Heart" aria-label="Outline" variant="outline" />
        <DzIconButton :icon="Heart" aria-label="Ghost" variant="ghost" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Toggle Favorite
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Toggle',
  render: () => ({
    components: { DzIconButton, Heart },
    data() {
      return { favorited: false }
    },
    template: `
      <div class="flex items-center gap-3">
        <DzIconButton
          :icon="Heart"
          :aria-label="favorited ? 'Remove from favorites' : 'Add to favorites'"
          :tone="favorited ? 'danger' : 'neutral'"
          :variant="favorited ? 'solid' : 'outline'"
          @click="favorited = !favorited"
        />
        <span class="text-sm text-gray-600">{{ favorited ? 'Favorited' : 'Not favorited' }}</span>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Toolbar
// ---------------------------------------------------------------------------

export const RealWorldToolbar: Story = {
  name: 'Real World: Toolbar',
  render: () => ({
    components: { DzIconButton, Pencil, Trash2, Settings, Search },
    template: `
      <div class="flex gap-1 p-2 border rounded-lg">
        <DzIconButton :icon="Search" aria-label="Search" variant="ghost" tone="neutral" />
        <DzIconButton :icon="Pencil" aria-label="Edit" variant="ghost" tone="neutral" />
        <DzIconButton :icon="Settings" aria-label="Settings" variant="ghost" tone="neutral" />
        <div class="w-px bg-gray-200 mx-1"></div>
        <DzIconButton :icon="Trash2" aria-label="Delete" variant="ghost" tone="danger" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Pagination
// ---------------------------------------------------------------------------

export const RealWorldPagination: Story = {
  name: 'Real World: Pagination',
  render: () => ({
    components: { DzIconButton, ChevronLeft, ChevronRight },
    template: `
      <div class="flex items-center gap-2">
        <DzIconButton :icon="ChevronLeft" aria-label="Previous page" variant="outline" tone="neutral" size="sm" />
        <span class="text-sm px-2">Page 1 of 10</span>
        <DzIconButton :icon="ChevronRight" aria-label="Next page" variant="outline" tone="neutral" size="sm" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Close Dialog
// ---------------------------------------------------------------------------

export const RealWorldClose: Story = {
  name: 'Real World: Close Button',
  render: () => ({
    components: { DzIconButton, X },
    template: `
      <div class="relative border rounded-lg p-4 pr-10 max-w-xs">
        <DzIconButton
          :icon="X"
          aria-label="Close"
          variant="ghost"
          tone="neutral"
          size="sm"
          class="absolute top-2 right-2"
        />
        <p class="text-sm font-medium">Notification title</p>
        <p class="text-sm text-gray-500 mt-1">This is a notification with a close button.</p>
      </div>
    `,
  }),
}
