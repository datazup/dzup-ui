import type { Meta, StoryObj } from '@storybook/vue3'
import { DzFileUpload } from '../../src/components/forms'

/**
 * DzFileUpload provides a drag-and-drop file upload zone with file validation.
 *
 * Built from scratch (no Reka UI primitive). Supports multiple files,
 * MIME type filtering, max size/count constraints, and custom drop zone content.
 */
const meta = {
  title: 'Core/Forms/DzFileUpload',
  component: DzFileUpload,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    accept: {
      control: 'text',
      description: 'Accepted file types (MIME types or extensions)',
      table: { category: 'Behavior' },
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes',
      table: { category: 'Behavior' },
    },
    maxFiles: {
      control: 'number',
      description: 'Maximum number of files',
      table: { category: 'Behavior' },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    // State
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
    error: {
      control: 'text',
      description: 'Error message text',
      table: { category: 'State' },
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
  },
  args: {
    size: 'md',
    disabled: false,
    multiple: false,
  },
} satisfies Meta<typeof DzFileUpload>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzFileUpload },
    setup() {
      return { args }
    },
    template: '<DzFileUpload v-bind="args" class="max-w-md" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzFileUpload },
    template: `
      <div class="space-y-6 max-w-md">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzFileUpload :size="size" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multiple Files
// ---------------------------------------------------------------------------

export const MultipleFiles: Story = {
  name: 'Multiple File Upload',
  args: {
    multiple: true,
    maxFiles: 5,
  },
  render: args => ({
    components: { DzFileUpload },
    setup() {
      return { args }
    },
    template: '<DzFileUpload v-bind="args" class="max-w-md" />',
  }),
}

// ---------------------------------------------------------------------------
// Accept Filter
// ---------------------------------------------------------------------------

export const AcceptFilter: Story = {
  name: 'Image Files Only',
  args: {
    accept: 'image/*',
    multiple: true,
  },
  render: args => ({
    components: { DzFileUpload },
    setup() {
      return { args }
    },
    template: '<DzFileUpload v-bind="args" class="max-w-md" />',
  }),
}

// ---------------------------------------------------------------------------
// Max Size
// ---------------------------------------------------------------------------

export const MaxFileSize: Story = {
  name: 'Max Size (5MB)',
  args: {
    maxSize: 5 * 1024 * 1024,
    multiple: true,
  },
  render: args => ({
    components: { DzFileUpload },
    setup() {
      return { args }
    },
    template: `
      <div class="max-w-md">
        <DzFileUpload v-bind="args" />
        <p class="text-xs text-gray-400 mt-1">Maximum file size: 5MB</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzFileUpload },
    setup() {
      return { args }
    },
    template: '<DzFileUpload v-bind="args" class="max-w-md" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please upload at least one file',
  },
  render: args => ({
    components: { DzFileUpload },
    setup() {
      return { args }
    },
    template: '<DzFileUpload v-bind="args" class="max-w-md" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzFileUpload },
    template: `
      <div class="space-y-6 max-w-md">
        <div>
          <p class="text-sm mb-1">Default</p>
          <DzFileUpload />
        </div>
        <div>
          <p class="text-sm mb-1">Disabled</p>
          <DzFileUpload disabled />
        </div>
        <div>
          <p class="text-sm mb-1">Invalid</p>
          <DzFileUpload invalid error="File required" />
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
    components: { DzFileUpload },
    template: '<DzFileUpload multiple class="max-w-md" />',
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzFileUpload },
    data() {
      return { files: [] as File[] }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <DzFileUpload v-model="files" multiple :maxFiles="3" />
        <p class="text-sm text-gray-500">
          Files: <strong>{{ files.length ? files.map(f => f.name).join(', ') : 'none' }}</strong>
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzFileUpload },
    template: `
      <div class="space-y-4 max-w-md">
        <p class="text-sm text-gray-500">Tab to focus the drop zone, Enter or Space to open the file picker, or drag and drop files.</p>
        <DzFileUpload aria-label="Document upload" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Avatar Upload
// ---------------------------------------------------------------------------

export const RealWorldAvatarUpload: Story = {
  name: 'Real World: Avatar Upload',
  render: () => ({
    components: { DzFileUpload },
    template: `
      <div class="max-w-sm">
        <label class="block text-sm font-medium mb-1">Profile Photo</label>
        <DzFileUpload
          accept="image/png,image/jpeg,image/webp"
          :maxSize="2 * 1024 * 1024"
          name="avatar"
          aria-label="Profile photo upload"
        />
        <p class="text-xs text-gray-400 mt-1">PNG, JPG, or WebP. Max 2MB.</p>
      </div>
    `,
  }),
}
