import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { DzFormField, DzTagsInput } from '../../src/components/forms'

/**
 * DzTagsInput is a free-text token / chips input: users type arbitrary values
 * (tags, recipient emails, keywords) and each committed entry becomes a
 * removable chip. It differs from `DzMultiSelect` / `DzCombobox`, which pick
 * from a *fixed* list of options.
 *
 * Typing a delimiter (Enter or `,` by default) commits the pending token;
 * Backspace on an empty field removes the last token; pasted text is split on
 * the delimiters. Tokens can be validated per-entry (`validate`), deduplicated
 * (`allowDuplicates`), and capped (`max`) — rejected tokens trigger a brief
 * `danger` flash. Committed tokens render with `DzChip`.
 *
 * `v-model:value` is an array of string tokens.
 */
const meta = {
  title: 'Core/Forms/DzTagsInput',
  component: DzTagsInput,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style of the field',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    chipVariant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle'],
      description: 'Visual style of the token chips',
      table: { category: 'Appearance', defaultValue: { summary: 'subtle' } },
    },
    chipTone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic tone of the token chips',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder for the text field',
      table: { category: 'Behavior' },
    },
    max: {
      control: 'number',
      description: 'Maximum number of tokens',
      table: { category: 'Behavior' },
    },
    allowDuplicates: {
      control: 'boolean',
      description: 'Allow the same token more than once',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    addOnBlur: {
      control: 'boolean',
      description: 'Commit the pending token when the field loses focus',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
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
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    placeholder: 'Add a tag…',
    variant: 'outline',
    size: 'md',
    allowDuplicates: false,
    addOnBlur: false,
    disabled: false,
  },
} satisfies Meta<typeof DzTagsInput>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTagsInput },
    setup() {
      return { args }
    },
    data() {
      return { value: ['vue', 'typescript'] }
    },
    template: '<DzTagsInput v-bind="args" v-model:value="value" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

export const EmailValidation: Story = {
  name: 'Email Validation',
  render: () => ({
    components: { DzTagsInput },
    data() {
      return { emails: ['ada@example.com'] }
    },
    methods: {
      isEmail(token: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token)
      },
    },
    template: `
      <div class="space-y-2 max-w-sm">
        <p class="text-sm text-gray-500">Only valid email addresses are accepted — try an invalid one to see the danger flash.</p>
        <DzTagsInput
          v-model:value="emails"
          :validate="isEmail"
          placeholder="recipient@example.com"
          add-on-blur
        />
        <p class="text-sm text-gray-500">Recipients: <strong>{{ emails.length ? emails.join(', ') : 'none' }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Max tags
// ---------------------------------------------------------------------------

export const MaxTags: Story = {
  name: 'Max Tags',
  render: () => ({
    components: { DzTagsInput },
    data() {
      return { value: ['one', 'two'] }
    },
    template: `
      <div class="space-y-2 max-w-sm">
        <p class="text-sm text-gray-500">Capped at 3 tokens.</p>
        <DzTagsInput v-model:value="value" :max="3" placeholder="Up to 3 tags" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// No duplicates (default) vs allowed
// ---------------------------------------------------------------------------

export const NoDuplicates: Story = {
  name: 'No Duplicates',
  render: () => ({
    components: { DzTagsInput },
    data() {
      return { unique: ['alpha'], dupes: ['alpha'] }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <div class="space-y-1">
          <p class="text-sm font-medium">Duplicates rejected (default)</p>
          <DzTagsInput v-model:value="unique" placeholder="Try adding 'alpha' again" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium">Duplicates allowed</p>
          <DzTagsInput v-model:value="dupes" allow-duplicates placeholder="Repeats welcome" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// In a form field
// ---------------------------------------------------------------------------

export const InFormField: Story = {
  name: 'In Form Field',
  render: () => ({
    components: { DzTagsInput, DzFormField },
    data() {
      return { keywords: ['design', 'systems'] }
    },
    template: `
      <div class="max-w-sm">
        <DzFormField label="Keywords" description="Press Enter or comma to add a keyword.">
          <DzTagsInput v-model:value="keywords" placeholder="Add keywords" />
        </DzFormField>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTagsInput },
    data() {
      return { value: ['tag', 'sample'] }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzTagsInput :value="value" size="xs" placeholder="Extra Small" />
        <DzTagsInput :value="value" size="sm" placeholder="Small" />
        <DzTagsInput :value="value" size="md" placeholder="Medium" />
        <DzTagsInput :value="value" size="lg" placeholder="Large" />
        <DzTagsInput :value="value" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid state
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Add at least one tag',
  },
  render: args => ({
    components: { DzTagsInput },
    setup() {
      return { args }
    },
    data() {
      return { value: [] }
    },
    template: '<DzTagsInput v-bind="args" v-model:value="value" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzTagsInput },
    setup() {
      return { args }
    },
    template: '<DzTagsInput v-bind="args" :value="[\'locked\', \'readonly\']" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzTagsInput },
    data() {
      return { value: ['vue', 'nuxt', 'vite'] }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzTagsInput :value="value" placeholder="Outline" />
        <DzTagsInput :value="value" variant="filled" chip-tone="primary" placeholder="Filled" />
      </div>
    `,
  }),
}
