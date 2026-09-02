import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Persona } from '../../src/components/forms'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzPersonaSelector } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

/**
 * DzPersonaSelector is a searchable, single-select persona picker built on top of
 * DzCombobox.
 *
 * Each option renders as an avatar (or initials fallback) + name + muted role label.
 * `v-model` is the persona `id`, and `change` fires with the full `Persona` object.
 */
const meta = {
  title: 'Core/Forms/DzPersonaSelector',
  component: DzPersonaSelector,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    // Behavior
    personas: {
      control: 'object',
      description: 'Available personas (id / name / role / optional avatarUrl)',
      table: { category: 'Behavior' },
    },
    modelValue: {
      control: 'text',
      description: 'Selected persona id (v-model)',
      table: { category: 'Behavior' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder for the search input',
      table: { category: 'Behavior', defaultValue: { summary: 'Select persona' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    placeholder: 'Search teammates…',
    disabled: false,
  },
} satisfies Meta<typeof DzPersonaSelector>

export default meta
type Story = StoryObj<typeof meta>

const personas: Persona[] = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Engineering Lead', avatarUrl: 'https://i.pravatar.cc/80?img=5' },
  { id: 'linus', name: 'Linus Torvalds', role: 'Kernel Maintainer', avatarUrl: 'https://i.pravatar.cc/80?img=12' },
  { id: 'grace', name: 'Grace Hopper', role: 'Compiler Pioneer' },
  { id: 'alan', name: 'Alan Turing', role: 'Research' },
]

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzPersonaSelector },
    setup() {
      return { args, personas }
    },
    template: '<div class="w-80 max-w-full"><DzPersonaSelector v-bind="args" :personas="personas" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// With Avatars (mixed avatar + initials fallback)
// ---------------------------------------------------------------------------

export const WithAvatars: Story = {
  name: 'Avatars & Initials Fallback',
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      return { personas }
    },
    template: `
      <div class="w-80 max-w-full">
        <p class="mb-2 text-sm text-[var(--dz-muted-foreground)]">
          Ada and Linus have avatars; Grace and Alan fall back to initials.
        </p>
        <DzPersonaSelector :personas="personas" placeholder="Search teammates…" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Empty (no personas → empty slot)
// ---------------------------------------------------------------------------

export const Empty: Story = {
  name: 'Empty State',
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      return { personas: [] as Persona[] }
    },
    template: `
      <div class="w-80 max-w-full">
        <DzPersonaSelector :personas="personas" placeholder="No teammates yet">
          <template #empty>No teammates to assign</template>
        </DzPersonaSelector>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true, modelValue: 'ada' },
  render: args => ({
    components: { DzPersonaSelector },
    setup() {
      return { args, personas }
    },
    template: '<div class="w-80 max-w-full"><DzPersonaSelector v-bind="args" :personas="personas" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// Interactive (v-model + change event)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      const selected = ref('')
      const lastChanged = ref<Persona | undefined>()
      return { personas, selected, lastChanged }
    },
    template: `
      <div class="w-80 max-w-full space-y-3">
        <DzPersonaSelector
          v-model="selected"
          :personas="personas"
          placeholder="Search teammates…"
          @change="lastChanged = $event"
        />
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Selected id: <strong>{{ selected || 'none' }}</strong>
          <span v-if="lastChanged"> — {{ lastChanged.name }} ({{ lastChanged.role }})</span>
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      return { personas }
    },
    template: '<div class="w-80 max-w-full"><DzPersonaSelector :personas="personas" placeholder="Search teammates…" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// Accessibility / open interaction
// ---------------------------------------------------------------------------

export const OpenAndSelect: Story = {
  name: 'Open & Select',
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      const selected = ref('')
      return { personas, selected }
    },
    template: `
      <div class="w-80 max-w-full space-y-3">
        <DzPersonaSelector v-model="selected" :personas="personas" placeholder="Search teammates…" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ selected || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the search input to open the listbox (openOnClick).
    await userEvent.click(canvas.getByPlaceholderText(/search teammates/i))

    // Options render in a portal on document.body, so query via screen.
    const option = await screen.findByText('Grace Hopper')
    await expect(option).toBeInTheDocument()
    await userEvent.click(option)

    // Selection collapses the list and reflects the chosen persona's id.
    await expect(canvas.getByText(/selected:/i)).toHaveTextContent(/grace/i)
  },
}

// ---------------------------------------------------------------------------
// States — enabled / disabled / empty (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the state DzPersonaSelector declares, shown against the live
 * control and the no-personas case a real roster reaches on its first day.
 *
 * Because the component is a thin composition over DzCombobox, "disabled" has
 * to travel one level down to the search input and the toggle button — which is
 * exactly the wiring a wrapper component gets wrong. The play function asserts
 * it arrived, and that the enabled control still opens, so the negative result
 * is measured against a working baseline.
 */
export const States: Story = {
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      const selected = ref('ada')
      return { personas, selected }
    },
    template: `
      <div class="grid max-w-4xl gap-6 lg:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled</p>
          <div class="w-72" data-testid="ps-enabled">
            <DzPersonaSelector
              v-model="selected"
              :personas="personas"
              placeholder="Search teammates…"
              aria-label="Enabled reviewer"
            />
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled — with a selection</p>
          <div class="w-72" data-testid="ps-disabled">
            <DzPersonaSelector
              disabled
              model-value="ada"
              :personas="personas"
              placeholder="Search teammates…"
              aria-label="Disabled reviewer"
            />
          </div>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Empty roster</p>
          <div class="w-72" data-testid="ps-empty">
            <DzPersonaSelector
              :personas="[]"
              placeholder="No teammates yet"
              aria-label="Empty reviewer"
            >
              <template #empty>No teammates to assign</template>
            </DzPersonaSelector>
          </div>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('ps-enabled')
    const disabled = canvas.getByTestId('ps-disabled')
    const empty = canvas.getByTestId('ps-empty')

    // Disabled travels down into the composed combobox: the search field and
    // the options toggle are both out of service, and nothing in the control is
    // reachable with the Tab key.
    const disabledInput = within(disabled).getByRole('combobox')
    await expect(disabledInput).toBeDisabled()
    await expect(within(disabled).getByRole('button', { name: /toggle options/i }))
      .toBeDisabled()
    for (const button of within(disabled).getAllByRole('button')) {
      if (!(button as HTMLButtonElement).disabled)
        await expect(button).toHaveAttribute('tabindex', '-1')
    }

    // Enabled: the same shape, live — and it really opens.
    const enabledInput = within(enabled).getByRole('combobox')
    await expect(enabledInput).toBeEnabled()
    await userEvent.click(enabledInput)
    await expect(await screen.findByText('Grace Hopper')).toBeVisible()
    await userEvent.keyboard('{Escape}')

    // Empty roster: the control is live but the consumer's empty copy is what
    // the list offers, rather than a silent blank panel.
    const emptyInput = within(empty).getByRole('combobox')
    await expect(emptyInput).toBeEnabled()
    await userEvent.click(emptyInput)
    await expect(await screen.findByText('No teammates to assign')).toBeVisible()
    await userEvent.keyboard('{Escape}')
  },
}

// ---------------------------------------------------------------------------
// Accessibility — keyboard-only assignment (tier C `accessibility` DoD item)
// ---------------------------------------------------------------------------

/**
 * Assigning a person without touching the mouse.
 *
 * The control is an editable combobox: Tab reaches the search field, typing
 * filters the roster, ArrowDown moves the highlighted option, and Enter commits
 * it. The play function drives exactly that and asserts the announced state
 * (`aria-expanded`, the option's `data-highlighted`) as well as the committed
 * model — a persona picker that can only be operated by clicking an avatar is
 * the failure this story exists to catch.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Keyboard-Only Assignment',
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      const selected = ref('')
      return { personas, selected }
    },
    template: `
      <div class="w-80 max-w-full space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Tab to the search field, type to filter, Arrow keys to move through
          the roster, Enter to assign.
        </p>
        <div data-testid="ps-a11y">
          <DzPersonaSelector
            v-model="selected"
            :personas="personas"
            placeholder="Search teammates…"
            aria-label="Assign a reviewer"
          />
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Assigned: <strong data-testid="ps-a11y-value">{{ selected || 'none' }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('ps-a11y')
    const input = within(root).getByRole('combobox')

    // The search field is a named combobox and starts collapsed.
    await expect(input).toHaveAccessibleName(/assign a reviewer/i)
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    // Reach it with Tab only.
    for (let i = 0; i < 6 && document.activeElement !== input; i++)
      await userEvent.tab()
    await expect(input).toHaveFocus()

    // Typing opens the roster and filters it down to the matching people.
    await userEvent.keyboard('gra')
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'))
    const options = await screen.findAllByRole('option')
    await expect(options).toHaveLength(1)
    await expect(options[0]).toHaveTextContent('Grace Hopper')

    // ArrowDown highlights the single match; Enter commits it — no pointer.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(options[0]).toHaveAttribute('data-highlighted'))
    await userEvent.keyboard('{Enter}')
    await waitFor(() =>
      expect(canvas.getByTestId('ps-a11y-value')).toHaveTextContent('grace'),
    )
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
  },
}

// ---------------------------------------------------------------------------
// Real world — review request (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * What the component is actually for: choosing who reviews a change, inside a
 * panel that shows the current assignee's avatar and role and can hand the
 * request back.
 *
 * The composition is the point — a standalone picker never shows that `change`
 * carries the whole `Persona`, which is what a summary card needs, while
 * `v-model` carries only the id.
 */
export const RealWorldReviewRequest: Story = {
  name: 'Real World: Review Request',
  render: () => ({
    components: { DzPersonaSelector },
    setup() {
      const selected = ref('')
      const assignee = ref<Persona | undefined>()
      const clear = () => {
        selected.value = ''
        assignee.value = undefined
      }
      return { personas, selected, assignee, clear }
    },
    template: `
      <div class="w-96 space-y-4 rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
        <h3 class="text-base font-semibold">Request a review</h3>
        <div class="space-y-1">
          <label id="ps-rw-label" class="block text-sm font-medium">Reviewer</label>
          <div data-testid="ps-rw">
            <DzPersonaSelector
              v-model="selected"
              :personas="personas"
              placeholder="Search teammates…"
              aria-labelledby="ps-rw-label"
              @change="assignee = $event"
            />
          </div>
        </div>

        <div
          v-if="assignee"
          class="flex items-center gap-3 rounded-[var(--dz-radius-md)] bg-[var(--dz-muted)] p-3"
          data-testid="ps-rw-card"
        >
          <span class="flex flex-col">
            <span class="text-sm font-medium">{{ assignee.name }}</span>
            <span class="text-xs text-[var(--dz-muted-foreground)]">{{ assignee.role }}</span>
          </span>
          <button
            type="button"
            class="ml-auto text-xs underline"
            data-testid="ps-rw-clear"
            @click="clear"
          >Unassign</button>
        </div>
        <p v-else class="text-sm text-[var(--dz-muted-foreground)]" data-testid="ps-rw-empty">
          No reviewer requested yet.
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = within(canvas.getByTestId('ps-rw')).getByRole('combobox')

    // Nothing assigned yet.
    await expect(canvas.getByTestId('ps-rw-empty')).toBeVisible()

    // Pick a reviewer from the roster.
    await userEvent.click(input)
    await userEvent.click(await screen.findByText('Linus Torvalds'))

    // `change` carries the whole persona, so the card can show name AND role —
    // `v-model` alone would only have given the id.
    const card = await canvas.findByTestId('ps-rw-card')
    await expect(card).toHaveTextContent('Linus Torvalds')
    await expect(card).toHaveTextContent('Kernel Maintainer')

    // Handing the request back returns the panel to its empty state.
    await userEvent.click(canvas.getByTestId('ps-rw-clear'))
    await waitFor(() => expect(canvas.getByTestId('ps-rw-empty')).toBeVisible())
    await expect(canvas.queryByTestId('ps-rw-card')).toBeNull()
  },
}
