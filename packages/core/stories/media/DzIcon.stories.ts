import type { Meta, StoryObj } from '@storybook/vue3'
import {
  Bell,
  Calendar,
  Download,
  Heart,
  Home,
  Mail,
  Search,
  Settings,
  Star,
  Trash2,
  Upload,
  User,
} from 'lucide-vue-next'
import { DzIcon } from '../../src/components/media'

/**
 * DzIcon wraps icon components (e.g. from lucide-vue-next) with consistent sizing
 * and accessibility attributes.
 *
 * Decorative by default (`aria-hidden="true"`). Provide `ariaLabel` to make it meaningful
 * for screen readers.
 */
const meta = {
  title: 'Core/Media/DzIcon',
  component: DzIcon,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    icon: {
      description: 'Icon component to render (e.g. from lucide-vue-next)',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Icon size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    strokeWidth: {
      control: { type: 'number', min: 0.5, max: 4, step: 0.25 },
      description: 'SVG stroke width override',
      table: { category: 'Appearance' },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label. When provided, the icon is treated as meaningful (not decorative).',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Accessible identifier',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    icon: Search,
    size: 'md',
  },
} satisfies Meta<typeof DzIcon>

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
    components: { DzIcon },
    setup() { return { Heart } },
    template: `
      <div class="flex items-end gap-6">
        <div class="text-center">
          <DzIcon :icon="Heart" size="xs" />
          <p class="text-xs mt-2 text-gray-500">xs</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Heart" size="sm" />
          <p class="text-xs mt-2 text-gray-500">sm</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Heart" size="md" />
          <p class="text-xs mt-2 text-gray-500">md</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Heart" size="lg" />
          <p class="text-xs mt-2 text-gray-500">lg</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Heart" size="xl" />
          <p class="text-xs mt-2 text-gray-500">xl</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Stroke Width
// ---------------------------------------------------------------------------

export const StrokeWidths: Story = {
  name: 'Stroke Width Variations',
  render: () => ({
    components: { DzIcon },
    setup() { return { Star } },
    template: `
      <div class="flex items-end gap-6">
        <div class="text-center">
          <DzIcon :icon="Star" size="lg" :stroke-width="0.75" />
          <p class="text-xs mt-2 text-gray-500">0.75</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Star" size="lg" :stroke-width="1" />
          <p class="text-xs mt-2 text-gray-500">1</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Star" size="lg" :stroke-width="1.5" />
          <p class="text-xs mt-2 text-gray-500">1.5</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Star" size="lg" :stroke-width="2" />
          <p class="text-xs mt-2 text-gray-500">2 (default)</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Star" size="lg" :stroke-width="2.5" />
          <p class="text-xs mt-2 text-gray-500">2.5</p>
        </div>
        <div class="text-center">
          <DzIcon :icon="Star" size="lg" :stroke-width="3" />
          <p class="text-xs mt-2 text-gray-500">3</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Icon Gallery
// ---------------------------------------------------------------------------

export const IconGallery: Story = {
  name: 'Icon Gallery (Sample)',
  render: () => ({
    components: { DzIcon },
    template: `
      <div class="grid grid-cols-6 gap-6">
        <div class="text-center" v-for="[name, icon] in icons" :key="name">
          <DzIcon :icon="icon" size="lg" class="mx-auto" />
          <p class="text-xs mt-2 text-gray-500">{{ name }}</p>
        </div>
      </div>
    `,
    setup() {
      const icons: [string, typeof Search][] = [
        ['Search', Search],
        ['Heart', Heart],
        ['Star', Star],
        ['Settings', Settings],
        ['Bell', Bell],
        ['Home', Home],
        ['User', User],
        ['Mail', Mail],
        ['Calendar', Calendar],
        ['Trash2', Trash2],
        ['Download', Download],
        ['Upload', Upload],
      ]
      return { icons }
    },
  }),
}

// ---------------------------------------------------------------------------
// Decorative vs Meaningful
// ---------------------------------------------------------------------------

export const AccessibleIcon: Story = {
  name: 'Accessibility: Decorative vs Meaningful',
  render: () => ({
    components: { DzIcon },
    setup() { return { Search, Bell } },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">Decorative (default)</p>
          <p class="text-xs text-gray-500">aria-hidden="true", no role. Used next to visible text.</p>
          <div class="flex items-center gap-2">
            <DzIcon :icon="Search" />
            <span>Search</span>
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">Meaningful (with ariaLabel)</p>
          <p class="text-xs text-gray-500">role="img", aria-label set. Used standalone where the icon conveys information.</p>
          <DzIcon :icon="Bell" aria-label="3 new notifications" size="lg" />
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
    components: { DzIcon },
    setup() { return { Search, Heart, Star, Settings } },
    template: `
      <div class="flex gap-6">
        <DzIcon :icon="Search" size="lg" />
        <DzIcon :icon="Heart" size="lg" />
        <DzIcon :icon="Star" size="lg" />
        <DzIcon :icon="Settings" size="lg" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Icon with Text
// ---------------------------------------------------------------------------

export const RealWorldIconWithText: Story = {
  name: 'Real World: Icon + Text Patterns',
  render: () => ({
    components: { DzIcon },
    setup() { return { Mail, Calendar, User, Bell } },
    template: `
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <DzIcon :icon="Mail" size="sm" class="text-gray-500" />
          <span class="text-sm">john@example.com</span>
        </div>
        <div class="flex items-center gap-2">
          <DzIcon :icon="Calendar" size="sm" class="text-gray-500" />
          <span class="text-sm">March 27, 2026</span>
        </div>
        <div class="flex items-center gap-2">
          <DzIcon :icon="User" size="sm" class="text-gray-500" />
          <span class="text-sm">John Doe</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Navigation Items
// ---------------------------------------------------------------------------

export const RealWorldNavigation: Story = {
  name: 'Real World: Navigation Items',
  render: () => ({
    components: { DzIcon },
    setup() { return { Home, Settings, Bell, User } },
    template: `
      <nav class="w-56 space-y-1">
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-sm font-medium">
          <DzIcon :icon="Home" size="sm" />
          Home
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <DzIcon :icon="Bell" size="sm" />
          Notifications
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <DzIcon :icon="User" size="sm" />
          Profile
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <DzIcon :icon="Settings" size="sm" />
          Settings
        </a>
      </nav>
    `,
  }),
}
