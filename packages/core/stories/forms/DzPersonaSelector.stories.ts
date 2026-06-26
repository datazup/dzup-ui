import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Persona } from '../../src/components/forms'
import { expect, screen, userEvent, within } from 'storybook/test'
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
    template: '<div class="w-80"><DzPersonaSelector v-bind="args" :personas="personas" /></div>',
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
      <div class="w-80">
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
      <div class="w-80">
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
    template: '<div class="w-80"><DzPersonaSelector v-bind="args" :personas="personas" /></div>',
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
      <div class="w-80 space-y-3">
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
    template: '<div class="w-80"><DzPersonaSelector :personas="personas" placeholder="Search teammates…" /></div>',
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
      <div class="w-80 space-y-3">
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
