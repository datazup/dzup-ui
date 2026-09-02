import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzMention } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Type <strong>@</strong> to mention a teammate.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="Write a comment… (@ to mention)" aria-label="Comment" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Value: <code>{{ value || '—' }}</code></p>
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Type <strong>#</strong> to add a label reference.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="Describe the issue… (# to tag)" aria-label="Issue body" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Value: <code>{{ value || '—' }}</code></p>
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
        new Promise<{ label: string, value: string }[]>((resolve) => {
          setTimeout(() => {
            const q = query.toLowerCase()
            resolve(users.filter(u => u.label.toLowerCase().includes(q)))
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Type <strong>@</strong> — options resolve after a simulated network delay.</p>
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Use <strong>@</strong> for people and <strong>#</strong> for labels.</p>
        <DzMention v-model:value="value" :triggers="triggers" placeholder="@ someone or # a label…" aria-label="Comment" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Value: <code>{{ value || '—' }}</code></p>
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

// ---------------------------------------------------------------------------
// States — idle / disabled / loading / invalid (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * The two states DzMention declares (`disabled`, `loading`) plus the invalid
 * rendering, side by side.
 *
 * `loading` is the interesting one and the reason this story exists: a mention
 * control whose options come from an async resolver spends real time in it, and
 * the contract is that the root reports `aria-busy`, the menu stays open, and
 * the loading copy replaces the option list rather than the list going blank.
 * The play function asserts that rather than photographing it.
 *
 * The loading state is reached the only way it is reachable — through a pending
 * async resolver. (`DzMention.vue` declares a `loading` prop, but an internal
 * `const loading = ref(false)` of the same name shadows it in the template, so
 * the prop is inert; recorded in the TASK-N1-O1 handoff as a defect for its
 * owner rather than worked around here.)
 */
export const States: Story = {
  render: () => ({
    components: { DzMention },
    setup() {
      const triggers = [{ char: '@', options: users }]
      // A resolver that never settles, so the loading state is stable and the
      // story is deterministic — no timers, no flake.
      const pendingTriggers = [{ char: '@', options: () => new Promise<typeof users>(() => {}) }]
      return { triggers, pendingTriggers }
    },
    data() {
      return { idle: '', disabled: 'Locked thread', pending: '', invalid: '' }
    },
    template: `
      <div class="grid max-w-4xl gap-6 lg:grid-cols-2">
        <section class="space-y-2">
          <p class="text-sm font-medium">Idle</p>
          <div data-testid="mn-idle">
            <DzMention
              v-model:value="idle"
              :triggers="triggers"
              placeholder="Write a comment…"
              aria-label="Idle comment"
            />
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled</p>
          <div data-testid="mn-disabled">
            <DzMention
              disabled
              v-model:value="disabled"
              :triggers="triggers"
              aria-label="Disabled comment"
            />
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Loading suggestions</p>
          <div data-testid="mn-loading">
            <DzMention
              v-model:value="pending"
              :triggers="pendingTriggers"
              placeholder="Type @ to search people…"
              aria-label="Async comment"
            />
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Invalid</p>
          <div data-testid="mn-invalid">
            <DzMention
              invalid
              error="A comment is required"
              v-model:value="invalid"
              :triggers="triggers"
              aria-label="Invalid comment"
            />
          </div>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rootOf = (id: string) =>
      canvas.getByTestId(id).firstElementChild as HTMLElement

    // Idle: nothing flagged, and the control is a live combobox.
    const idleRoot = rootOf('mn-idle')
    const idleBox = within(idleRoot).getByRole('combobox', { name: 'Idle comment' })
    await expect(idleRoot).not.toHaveAttribute('data-disabled')
    await expect(idleRoot).not.toHaveAttribute('aria-busy')
    await expect(idleBox).toHaveAttribute('aria-expanded', 'false')
    await expect(idleBox).toBeEnabled()

    // Disabled: flagged on the root and enforced on the control.
    const disabledRoot = rootOf('mn-disabled')
    await expect(disabledRoot).toHaveAttribute('data-disabled')
    await expect(within(disabledRoot).getByRole('combobox', { name: 'Disabled comment' }))
      .toBeDisabled()

    // Invalid: flagged for CSS, announced on the control, explained in an alert.
    const invalidRoot = rootOf('mn-invalid')
    await expect(invalidRoot).toHaveAttribute('data-invalid')
    await expect(within(invalidRoot).getByRole('combobox', { name: 'Invalid comment' }))
      .toHaveAttribute('aria-invalid', 'true')
    await expect(within(invalidRoot).getByRole('alert'))
      .toHaveTextContent('A comment is required')

    // Loading: typing the trigger character opens the menu and puts the control
    // into a busy state whose copy replaces the option list.
    const loadingRoot = rootOf('mn-loading')
    const asyncBox = within(loadingRoot).getByRole('combobox', { name: 'Async comment' })
    await userEvent.click(asyncBox)
    await userEvent.type(asyncBox, '@a')
    await waitFor(() => expect(loadingRoot).toHaveAttribute('aria-busy', 'true'))
    await expect(loadingRoot).toHaveAttribute('data-loading')
    await expect(loadingRoot.querySelector('[data-mention-loading]')).not.toBeNull()
    await expect(within(loadingRoot).queryByRole('listbox')).toBeNull()
  },
}

// ---------------------------------------------------------------------------
// Accessibility — combobox + listbox, keyboard only (tier C `accessibility`)
// ---------------------------------------------------------------------------

/**
 * The APG editable-combobox pattern DzMention implements, asserted rather than
 * described.
 *
 * DOM focus never leaves the textarea: the suggestion list is announced through
 * `aria-expanded`, `aria-controls` and `aria-activedescendant`, with a polite
 * live region reporting the match count. The play function types the trigger,
 * moves the active option with the Arrow keys, inserts with Enter and dismisses
 * with Escape, checking after every step that the pointer was never needed.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Combobox Keyboard Pattern',
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
      <div class="max-w-md space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Type <strong>@</strong> to open the suggestions, Up/Down to move the
          active option, Enter to insert it, Escape to dismiss. Focus stays in
          the textarea throughout — the active option is announced via
          <code>aria-activedescendant</code>.
        </p>
        <div data-testid="mn-a11y">
          <DzMention
            v-model:value="value"
            :triggers="triggers"
            placeholder="Write a comment… (@ to mention)"
            aria-label="Keyboard comment"
          />
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Value: <code data-testid="mn-a11y-value">{{ value || '—' }}</code>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('mn-a11y').firstElementChild as HTMLElement
    const box = within(root).getByRole('combobox', { name: 'Keyboard comment' })

    // Closed state advertises the popup without claiming one is open.
    await expect(box).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(box).toHaveAttribute('aria-autocomplete', 'list')
    await expect(box).toHaveAttribute('aria-expanded', 'false')
    await expect(box).not.toHaveAttribute('aria-controls')

    // Reach the control with Tab only, then type the trigger character.
    for (let i = 0; i < 6 && document.activeElement !== box; i++)
      await userEvent.tab()
    await expect(box).toHaveFocus()
    await userEvent.keyboard('@')

    // The list opens and is wired to the control by id.
    await waitFor(() => expect(box).toHaveAttribute('aria-expanded', 'true'))
    const listbox = within(root).getByRole('listbox')
    await expect(box).toHaveAttribute('aria-controls', listbox.id)

    // The active option is published on the control, not by moving focus.
    const firstActive = box.getAttribute('aria-activedescendant')
    await expect(firstActive).toBeTruthy()
    await expect(document.getElementById(firstActive!)).toHaveAttribute('aria-selected', 'true')
    await expect(box).toHaveFocus()

    // ArrowDown moves the active option — focus still has not moved.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(box.getAttribute('aria-activedescendant')).not.toBe(firstActive),
    )
    await expect(box).toHaveFocus()

    // Enter inserts the active option at the caret and closes the list.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(box).toHaveAttribute('aria-expanded', 'false'))
    await expect(canvas.getByTestId('mn-a11y-value')).toHaveTextContent('@Bob Smith')

    // Escape dismisses a re-opened list without inserting anything: the draft
    // keeps the bare trigger character and gains no second mention.
    const beforeEscape = (box as HTMLTextAreaElement).value
    await userEvent.keyboard('@')
    await waitFor(() => expect(box).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(box).toHaveAttribute('aria-expanded', 'false'))
    await expect((box as HTMLTextAreaElement).value).toBe(`${beforeEscape}@`)
  },
}

// ---------------------------------------------------------------------------
// Real world — issue comment composer (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * The composition DzMention exists for: an issue-tracker comment box that
 * mentions people with `@` and references labels with `#`, in a real form with
 * a submit button and a thread that grows as comments are posted.
 *
 * Two triggers in one control is the case a single-trigger demo never covers —
 * the component has to pick the trigger from the character at the caret.
 */
export const RealWorldCommentComposer: Story = {
  name: 'Real World: Issue Comment Composer',
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
      return { draft: '', thread: [] as string[] }
    },
    template: `
      <form class="max-w-lg space-y-3" @submit.prevent="thread.push(draft); draft = ''">
        <h3 class="text-base font-semibold">Add a comment</h3>
        <ul v-if="thread.length" class="space-y-2" data-testid="mn-thread">
          <li
            v-for="(comment, i) in thread"
            :key="i"
            class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-3 text-sm"
          >{{ comment }}</li>
        </ul>
        <div data-testid="mn-rw">
          <DzMention
            v-model="draft"
            :triggers="triggers"
            placeholder="@ someone, # a label…"
            aria-label="Comment body"
          />
        </div>
        <button
          type="submit"
          class="rounded-[var(--dz-radius-md)] bg-[var(--dz-primary)] px-3 py-1.5 text-sm text-[var(--dz-primary-foreground)] disabled:opacity-50"
          :disabled="!draft.trim()"
          data-testid="mn-submit"
        >Comment</button>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('mn-rw').firstElementChild as HTMLElement
    const box = within(root).getByRole('combobox', { name: 'Comment body' })

    // An empty draft cannot be posted.
    await expect(canvas.getByTestId('mn-submit')).toBeDisabled()

    // `@` resolves against the people trigger.
    await userEvent.click(box)
    await userEvent.type(box, 'ping @Ca')
    await waitFor(() => expect(within(root).getByRole('listbox')).toBeVisible())
    const person = within(root).getAllByRole('option')[0]!
    await expect(person).toHaveTextContent('Carol Williams')
    await userEvent.click(person)

    // `#` resolves against the labels trigger, in the same control. The query
    // is `#feat` rather than `#fea` only because a three-character `#xxx` reads
    // as a raw hex colour to `validate:tokens`.
    await userEvent.type(box, 'please look at #feat')
    await waitFor(() => expect(within(root).getByRole('listbox')).toBeVisible())
    const label = within(root).getAllByRole('option')[0]!
    await expect(label).toHaveTextContent('feature')
    await userEvent.click(label)

    // The draft carries both tokens, and the form can now be submitted.
    await expect((box as HTMLTextAreaElement).value).toMatch(/@Carol Williams/)
    await expect((box as HTMLTextAreaElement).value).toMatch(/#feature/)
    const submit = canvas.getByTestId('mn-submit')
    await expect(submit).toBeEnabled()
    await userEvent.click(submit)

    // The comment lands in the thread and the composer resets.
    await waitFor(() =>
      expect(within(canvas.getByTestId('mn-thread')).getAllByRole('listitem')).toHaveLength(1),
    )
    await expect(canvas.getByTestId('mn-thread')).toHaveTextContent('@Carol Williams')
    await expect((box as HTMLTextAreaElement).value).toBe('')
    await expect(submit).toBeDisabled()
  },
}
