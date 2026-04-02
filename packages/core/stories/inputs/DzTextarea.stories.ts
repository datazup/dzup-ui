import type { Meta, StoryObj } from '@storybook/vue3'
import { DzTextarea } from '../../src/components/inputs'

/**
 * DzTextarea is a multiline text input with optional auto-resize behavior.
 *
 * It supports three visual variants (`outline`, `filled`, `underlined`),
 * five sizes, configurable row count, auto-resize with optional max rows,
 * and full form-control contract compliance.
 */
const meta = {
  title: 'Core/Inputs/DzTextarea',
  component: DzTextarea,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
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
      table: { category: 'Appearance' },
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
      table: { category: 'Appearance', defaultValue: { summary: '3' } },
    },
    // Behavior
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when empty',
      table: { category: 'Behavior' },
    },
    maxlength: {
      control: 'number',
      description: 'Maximum number of characters allowed',
      table: { category: 'Behavior' },
    },
    autoResize: {
      control: 'boolean',
      description: 'Whether to auto-resize height based on content',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    maxRows: {
      control: 'number',
      description: 'Maximum number of rows when auto-resizing',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only state -- visible but not editable',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    // State / Validation
    invalid: {
      control: 'boolean',
      description: 'Whether the field value is invalid',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'text',
      description: 'Error message to display',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      table: { category: 'State', defaultValue: { summary: 'false' } },
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
    variant: 'outline',
    size: 'md',
    rows: 3,
    placeholder: 'Enter text...',
    disabled: false,
    readonly: false,
    loading: false,
    invalid: false,
    required: false,
    autoResize: false,
  },
} satisfies Meta<typeof DzTextarea>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTextarea },
    setup() {
      return { args }
    },
    template: '<DzTextarea v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzTextarea variant="outline" placeholder="Outline variant" />
        <DzTextarea variant="filled" placeholder="Filled variant" />
        <DzTextarea variant="underlined" placeholder="Underlined variant" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzTextarea size="xs" placeholder="Extra Small (xs)" :rows="2" />
        <DzTextarea size="sm" placeholder="Small (sm)" :rows="2" />
        <DzTextarea size="md" placeholder="Medium (md)" :rows="2" />
        <DzTextarea size="lg" placeholder="Large (lg)" :rows="2" />
        <DzTextarea size="xl" placeholder="Extra Large (xl)" :rows="2" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Auto Resize
// ---------------------------------------------------------------------------

export const AutoResize: Story = {
  name: 'Auto Resize',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <p class="text-sm text-gray-500">The textarea grows as you type. Try pasting a long paragraph.</p>
        <DzTextarea autoResize placeholder="Type or paste text -- this will grow..." />
        <DzTextarea autoResize :maxRows="6" placeholder="Auto-resize with max 6 rows" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Row Configurations
// ---------------------------------------------------------------------------

export const RowConfigurations: Story = {
  name: 'Row Configurations',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzTextarea :rows="2" placeholder="2 rows" />
        <DzTextarea :rows="4" placeholder="4 rows" />
        <DzTextarea :rows="8" placeholder="8 rows" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzTextarea placeholder="Default state" />
        <DzTextarea disabled placeholder="Disabled state" />
        <DzTextarea readonly model-value="Read-only content that cannot be edited." />
        <DzTextarea loading placeholder="Loading state" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
  render: args => ({
    components: { DzTextarea },
    setup() {
      return { args }
    },
    template: '<DzTextarea v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid & Error
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzTextarea invalid placeholder="Invalid without message" />
        <DzTextarea error="Description is required" placeholder="Enter description..." />
        <DzTextarea error="Must be at least 20 characters" model-value="Too short." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Character Count
// ---------------------------------------------------------------------------

export const WithMaxLength: Story = {
  name: 'With Max Length',
  render: () => ({
    components: { DzTextarea },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-2 max-w-sm">
        <DzTextarea v-model="value" :maxlength="200" placeholder="Limited to 200 characters..." />
        <p class="text-xs text-gray-400 text-right">{{ value.length }} / 200</p>
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
    components: { DzTextarea },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzTextarea variant="outline" placeholder="Outline in dark mode" />
        <DzTextarea variant="filled" placeholder="Filled in dark mode" />
        <DzTextarea variant="underlined" placeholder="Underlined in dark mode" />
        <DzTextarea error="Error message in dark mode" placeholder="Invalid textarea" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: v-model binding
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzTextarea },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-3 max-w-sm">
        <DzTextarea v-model="value" autoResize placeholder="Type something..." />
        <p class="text-sm text-gray-500">
          Value: <code class="bg-gray-100 px-1 rounded text-xs">{{ value || '(empty)' }}</code>
        </p>
        <p class="text-sm text-gray-500">Lines: {{ value.split('\\n').length }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Labels & ARIA',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">Tab through the textareas. Error messages are linked via aria-describedby.</p>
        <div>
          <label id="bio-label" class="block text-sm font-medium mb-1">Bio</label>
          <DzTextarea aria-labelledby="bio-label" placeholder="Tell us about yourself..." required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Feedback</label>
          <DzTextarea aria-label="Feedback" error="Please provide your feedback" placeholder="Your feedback..." />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Comment Box
// ---------------------------------------------------------------------------

export const RealWorldCommentBox: Story = {
  name: 'Real World: Comment Box',
  render: () => ({
    components: { DzTextarea },
    data() {
      return { comment: '' }
    },
    template: `
      <div class="max-w-md border rounded-lg p-4 space-y-3">
        <p class="text-sm font-medium">Leave a comment</p>
        <DzTextarea
          v-model="comment"
          autoResize
          :maxRows="8"
          placeholder="Write your comment..."
        />
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-400">{{ comment.length }} characters</span>
          <button class="text-sm px-3 py-1 bg-blue-500 text-white rounded" :disabled="!comment.trim()">
            Post
          </button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Issue Description
// ---------------------------------------------------------------------------

export const RealWorldIssueDescription: Story = {
  name: 'Real World: Issue Description',
  render: () => ({
    components: { DzTextarea },
    template: `
      <div class="max-w-md space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Steps to Reproduce <span class="text-red-500">*</span></label>
          <DzTextarea :rows="4" required placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..." />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Expected Behavior</label>
          <DzTextarea :rows="2" placeholder="What should have happened?" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Actual Behavior</label>
          <DzTextarea :rows="2" placeholder="What actually happened?" />
        </div>
      </div>
    `,
  }),
}
