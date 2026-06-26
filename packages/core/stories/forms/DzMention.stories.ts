import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzMention } from '../../src/components/forms'

/**
 * DzMention is a textarea/input that surfaces a suggestion dropdown when a
 * configured trigger character (`@`, `#`, …) is typed. It detects the active
 * trigger and the partial query at the caret, resolves options (static arrays
 * or async resolvers), and inserts the chosen option at the caret.
 *
 * - **Keyboard:** Up/Down navigate, Enter/Tab insert, Esc dismisses.
 * - **Async:** a trigger's `options` may be a `(query) => Promise<options>`
 *   resolver; a loading state shows while it is pending.
 * - **Multiple triggers:** pass several `{ char, options }` entries.
 *
 * `v-model:value` is the raw text including the inserted trigger tokens.
 */
const users = [
  { label: 'Alice Johnson', value: 'alice', role: 'Designer' },
  { label: 'Bob Smith', value: 'bob', role: 'Engineer' },
  { label: 'Carol Williams', value: 'carol', role: 'PM' },
  { label: 'David Brown', value: 'david', role: 'Engineer' },
  { label: 'Eve Davis', value: 'eve', role: 'Researcher' },
]

const tags = [
  { label: 'bug', value: 'bug' },
  { label: 'feature', value: 'feature' },
  { label: 'docs', value: 'docs' },
  { label: 'question', value: 'question' },
]

const meta = {
  title: 'Core/Forms/DzMention',
  component: DzMention,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style of the text control',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    multiline: {
      control: 'boolean',
      description: 'Render a textarea (true) or single-line input (false)',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    filter: {
      control: 'boolean',
      description: 'Filter static options by the typed query',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      table: { category: 'Behavior' },
    },
    rows: {
      control: 'number',
      description: 'Visible rows (multiline only)',
      table: { category: 'Behavior', defaultValue: { summary: '3' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
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
    variant: 'outline',
    size: 'md',
    multiline: true,
    filter: true,
    placeholder: 'Type @ to mention someone…',
    rows: 3,
    disabled: false,
  },
} satisfies Meta<typeof DzMention>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default -- @ trigger opens listbox; first option can be selected
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '@', options: users }]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="max-w-md p-4">
        <DzMention v-model:value="value" :triggers="triggers" placeholder="Type @ to mention…" aria-label="Comment" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The textarea is a combobox; focus it and type @ to open the listbox
    const combobox = canvas.getByRole('combobox', { name: 'Comment' })
    await expect(combobox).toBeInTheDocument()
    await userEvent.click(combobox)
    await userEvent.type(combobox, '@')

    // A listbox should appear with @ suggestions
    const listbox = await waitFor(() => canvas.getByRole('listbox'))
    await expect(listbox).toBeVisible()

    // At least one option is rendered
    const options = within(listbox).getAllByRole('option')
    await expect(options.length).toBeGreaterThan(0)

    // Click the first option and assert the combobox value contains @ + label
    await userEvent.click(options[0]!)
    await expect((combobox as HTMLTextAreaElement).value).toMatch(/@\w/)
  },
}

// ---------------------------------------------------------------------------
// User mentions (@)
// ---------------------------------------------------------------------------

export const UserMentions: Story = {
  name: 'User Mentions (@)',
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '@', options: users }]
      return { triggers, users }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-2 max-w-md">
        <p class="text-sm text-gray-500">Type <strong>@</strong> to mention a teammate.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="Write a comment… (@ to mention)" aria-label="Comment" />
        <p class="text-sm text-gray-500">Value: <code>{{ value || '—' }}</code></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const combobox = canvas.getByRole('combobox', { name: 'Comment' })
    await expect(combobox).toBeInTheDocument()
    // Type @ to open the suggestions dropdown
    await userEvent.click(combobox)
    await userEvent.type(combobox, '@')
    // Listbox with user options must appear
    const listbox = await waitFor(() => canvas.getByRole('listbox'))
    await expect(listbox).toBeVisible()
    const options = within(listbox).getAllByRole('option')
    await expect(options.length).toBeGreaterThan(0)
    // Selecting the first option inserts @Label into the textarea
    await userEvent.click(options[0]!)
    await expect((combobox as HTMLTextAreaElement).value).toMatch(/@Alice/)
  },
}

// ---------------------------------------------------------------------------
// Hashtags (#)
// ---------------------------------------------------------------------------

export const Hashtags: Story = {
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '#', options: tags }]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-2 max-w-md">
        <p class="text-sm text-gray-500">Type <strong>#</strong> to add a label reference.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="Describe the issue… (# to tag)" aria-label="Issue body" />
        <p class="text-sm text-gray-500">Value: <code>{{ value || '—' }}</code></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const combobox = canvas.getByRole('combobox', { name: 'Issue body' })
    await expect(combobox).toBeInTheDocument()
    // Type # to open the tag suggestions dropdown
    await userEvent.click(combobox)
    await userEvent.type(combobox, '#')
    // Listbox with tag options must appear
    const listbox = await waitFor(() => canvas.getByRole('listbox'))
    await expect(listbox).toBeVisible()
    const options = within(listbox).getAllByRole('option')
    await expect(options.length).toBeGreaterThan(0)
    // Selecting first option inserts #label into the textarea
    await userEvent.click(options[0]!)
    await expect((combobox as HTMLTextAreaElement).value).toMatch(/#\w/)
  },
}

// ---------------------------------------------------------------------------
// Rich suggestions via #option slot
// ---------------------------------------------------------------------------

export const RichSuggestions: Story = {
  name: 'Rich Suggestions (#option slot)',
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '@', options: users }]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-2 max-w-md">
        <DzMention v-model:value="value" :triggers="triggers" placeholder="Mention a teammate…" aria-label="Comment">
          <template #option="{ option }">
            <span class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dz-primary-muted)] text-[var(--dz-primary)] text-xs font-medium">
                {{ option.label.charAt(0) }}
              </span>
              <span class="flex flex-col leading-tight">
                <span>{{ option.label }}</span>
                <span class="text-xs text-[var(--dz-muted-foreground)]">{{ option.role }}</span>
              </span>
            </span>
          </template>
        </DzMention>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Async search
// ---------------------------------------------------------------------------

export const AsyncSearch: Story = {
  render: () => ({
    components: { DzMention },
    setup() {
      const search = (query: string) =>
        new Promise<{ label: string; value: string }[]>((resolve) => {
          setTimeout(() => {
            const q = query.toLowerCase()
            resolve(users.filter((u) => u.label.toLowerCase().includes(q)))
          }, 600)
        })
      const triggers = [{ char: '@', options: search }]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-2 max-w-md">
        <p class="text-sm text-gray-500">Type <strong>@</strong> — options resolve after a simulated network delay.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="@ to search people…" aria-label="Comment" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multiple triggers
// ---------------------------------------------------------------------------

export const MultiTrigger: Story = {
  name: 'Multiple Triggers (@ + #)',
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [
        { char: '@', options: users },
        { char: '#', options: tags },
      ]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-2 max-w-md">
        <p class="text-sm text-gray-500">Use <strong>@</strong> for people and <strong>#</strong> for labels.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="@ someone or # a label…" aria-label="Comment" />
        <p class="text-sm text-gray-500">Value: <code>{{ value || '—' }}</code></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Single-line
// ---------------------------------------------------------------------------

export const SingleLine: Story = {
  name: 'Single Line',
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '@', options: users }]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="max-w-md">
        <DzMention v-model:value="value" :triggers="triggers" :multiline="false" placeholder="@ to assign…" aria-label="Assignee" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid state
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '@', options: users }]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="max-w-md">
        <DzMention v-model:value="value" :triggers="triggers" invalid error="A comment is required" placeholder="Write a comment…" aria-label="Comment" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [
        { char: '@', options: users },
        { char: '#', options: tags },
      ]
      return { triggers }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="max-w-md">
        <DzMention v-model:value="value" :triggers="triggers" placeholder="@ someone or # a label…" aria-label="Comment" />
      </div>
    `,
  }),
}
