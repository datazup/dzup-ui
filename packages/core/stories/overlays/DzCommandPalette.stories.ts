import type { Meta, StoryObj } from '@storybook/vue3'
import type { CommandGroup, CommandItem } from '../../src/components/overlays'
import { DzButton } from '../../src/components/buttons'
import { DzCommandPalette } from '../../src/components/overlays'

/**
 * DzCommandPalette is a searchable command launcher built on Reka UI Dialog + Combobox (ADR-07).
 *
 * It supports items with optional icons and keyboard shortcuts, grouped categorization,
 * search filtering, a global keyboard shortcut (Ctrl+K / Cmd+K), and custom slot rendering.
 * Open state is controlled via `v-model:open` (ADR-16).
 */
const sampleItems: CommandItem[] = [
  { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', group: 'file' },
  { id: 'open-file', label: 'Open File', shortcut: 'Ctrl+O', group: 'file' },
  { id: 'save', label: 'Save', shortcut: 'Ctrl+S', group: 'file' },
  { id: 'search', label: 'Search', shortcut: 'Ctrl+F', group: 'edit' },
  { id: 'find-replace', label: 'Find and Replace', shortcut: 'Ctrl+H', group: 'edit' },
  { id: 'toggle-dark', label: 'Toggle Dark Mode', group: 'view' },
  { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++', group: 'view' },
  { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', group: 'view' },
  { id: 'settings', label: 'Open Settings', shortcut: 'Ctrl+,', group: 'app' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', group: 'app' },
]

const sampleGroups: CommandGroup[] = [
  { id: 'file', label: 'File' },
  { id: 'edit', label: 'Edit' },
  { id: 'view', label: 'View' },
  { id: 'app', label: 'Application' },
]

const meta = {
  title: 'Core/Overlays/DzCommandPalette',
  component: DzCommandPalette,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
      table: { category: 'Behavior', defaultValue: { summary: 'Type a command or search...' } },
    },
    enableGlobalShortcut: {
      control: 'boolean',
      description: 'Bind Ctrl+K / Cmd+K globally to toggle the palette',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
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
      table: { category: 'Accessibility', defaultValue: { summary: 'Command palette' } },
    },
    // Events
    select: {
      action: 'select',
      description: 'Emitted when a command item is selected',
      table: { category: 'Events' },
    },
    search: {
      action: 'search',
      description: 'Emitted when the search query changes',
      table: { category: 'Events' },
    },
  },
  args: {
    placeholder: 'Type a command or search...',
    enableGlobalShortcut: false, // Disabled in stories to avoid conflicts
    items: sampleItems,
    groups: sampleGroups,
  },
} satisfies Meta<typeof DzCommandPalette>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCommandPalette, DzButton },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open Command Palette</DzButton>
        <DzCommandPalette
          v-bind="args"
          v-model:open="isOpen"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Without Groups (Flat List)
// ---------------------------------------------------------------------------

export const FlatList: Story = {
  name: 'Flat List (No Groups)',
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: [
          { id: '1', label: 'Go to Home' },
          { id: '2', label: 'Go to Projects' },
          { id: '3', label: 'Go to Settings' },
          { id: '4', label: 'Go to Profile' },
          { id: '5', label: 'Go to Help' },
        ] as CommandItem[],
      }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open Flat Palette</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="[]"
          placeholder="Search pages..."
          :enable-global-shortcut="false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Disabled Items
// ---------------------------------------------------------------------------

export const WithDisabledItems: Story = {
  name: 'With Disabled Items',
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: [
          { id: '1', label: 'Available Action' },
          { id: '2', label: 'Another Action' },
          { id: '3', label: 'Disabled Action', disabled: true },
          { id: '4', label: 'Also Disabled', disabled: true },
          { id: '5', label: 'Third Action' },
        ] as CommandItem[],
      }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open Palette with Disabled</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="[]"
          :enable-global-shortcut="false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Shortcuts
// ---------------------------------------------------------------------------

export const WithShortcuts: Story = {
  name: 'With Keyboard Shortcuts',
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: [
          { id: '1', label: 'Copy', shortcut: 'Ctrl+C' },
          { id: '2', label: 'Cut', shortcut: 'Ctrl+X' },
          { id: '3', label: 'Paste', shortcut: 'Ctrl+V' },
          { id: '4', label: 'Undo', shortcut: 'Ctrl+Z' },
          { id: '5', label: 'Redo', shortcut: 'Ctrl+Shift+Z' },
          { id: '6', label: 'Select All', shortcut: 'Ctrl+A' },
        ] as CommandItem[],
      }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open Shortcuts Palette</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="[]"
          placeholder="Search shortcuts..."
          :enable-global-shortcut="false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots (Custom Item Rendering)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Item Slot',
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: sampleItems,
        groups: sampleGroups,
      }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open Custom Palette</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="groups"
          :enable-global-shortcut="false"
        >
          <template #item="{ item }">
            <div class="flex items-center gap-3 w-full">
              <span class="text-base">{{ item.group === 'file' ? '&#128196;' : item.group === 'edit' ? '&#9999;' : item.group === 'view' ? '&#128065;' : '&#9881;' }}</span>
              <span class="flex-1 text-sm">{{ item.label }}</span>
              <span v-if="item.shortcut" class="text-xs text-gray-400 font-mono">{{ item.shortcut }}</span>
            </div>
          </template>
          <template #empty>
            <div class="text-center py-6">
              <p class="text-sm text-gray-500">No commands match your search.</p>
              <p class="text-xs text-gray-400 mt-1">Try a different query.</p>
            </div>
          </template>
        </DzCommandPalette>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Select Events
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        lastSelected: null as CommandItem | null,
        lastSearch: '',
        items: sampleItems,
        groups: sampleGroups,
      }
    },
    methods: {
      handleSelect(item: CommandItem) {
        this.lastSelected = item
      },
      handleSearch(query: string) {
        this.lastSearch = query
      },
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true">Open Palette</DzButton>
          <span v-if="lastSelected" class="text-sm">Selected: <strong>{{ lastSelected.label }}</strong></span>
          <span v-if="lastSearch" class="text-sm text-gray-500">Search: "{{ lastSearch }}"</span>
        </div>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="groups"
          :enable-global-shortcut="false"
          @select="handleSelect"
          @search="handleSearch"
        />
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
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: sampleItems,
        groups: sampleGroups,
      }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open in Dark Mode</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="groups"
          :enable-global-shortcut="false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Search & Navigation',
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: sampleItems,
        groups: sampleGroups,
      }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Open the palette and type to filter. Use ArrowUp/ArrowDown to navigate items.
          Press Enter to select an item, Escape to close. The search input auto-focuses on open.
          Disabled items are skipped during keyboard navigation.
        </p>
        <DzButton @click="isOpen = true" aria-label="Open command palette">Open Command Palette</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="groups"
          :enable-global-shortcut="false"
          aria-label="Application command palette"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: IDE Command Palette
// ---------------------------------------------------------------------------

export const RealWorldIDE: Story = {
  name: 'Real World: IDE Command Palette',
  render: () => ({
    components: { DzCommandPalette, DzButton },
    data() {
      return {
        isOpen: false,
        items: [
          { id: 'go-file', label: 'Go to File...', shortcut: 'Ctrl+P', group: 'nav' },
          { id: 'go-symbol', label: 'Go to Symbol...', shortcut: 'Ctrl+Shift+O', group: 'nav' },
          { id: 'go-line', label: 'Go to Line...', shortcut: 'Ctrl+G', group: 'nav' },
          { id: 'terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`', group: 'view' },
          { id: 'sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', group: 'view' },
          { id: 'minimap', label: 'Toggle Minimap', group: 'view' },
          { id: 'format', label: 'Format Document', shortcut: 'Shift+Alt+F', group: 'editor' },
          { id: 'rename', label: 'Rename Symbol', shortcut: 'F2', group: 'editor' },
          { id: 'refactor', label: 'Refactor...', shortcut: 'Ctrl+Shift+R', group: 'editor' },
          { id: 'git-commit', label: 'Git: Commit', group: 'git' },
          { id: 'git-push', label: 'Git: Push', group: 'git' },
          { id: 'git-pull', label: 'Git: Pull', group: 'git' },
        ] as CommandItem[],
        groups: [
          { id: 'nav', label: 'Navigation' },
          { id: 'view', label: 'View' },
          { id: 'editor', label: 'Editor' },
          { id: 'git', label: 'Git' },
        ] as CommandGroup[],
      }
    },
    template: `
      <div>
        <p class="text-sm text-gray-500 mb-4">
          A full IDE-style command palette. Click the button or press Ctrl+K (disabled in story) to open.
        </p>
        <DzButton @click="isOpen = true">Open Command Palette</DzButton>
        <DzCommandPalette
          v-model:open="isOpen"
          :items="items"
          :groups="groups"
          placeholder="> Type a command..."
          :enable-global-shortcut="false"
        />
      </div>
    `,
  }),
}
