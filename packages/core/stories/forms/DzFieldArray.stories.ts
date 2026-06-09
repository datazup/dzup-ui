import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import { DzButton } from '../../src/components/buttons'
import { DzFieldArray, DzFormField, DzFormLabel, DzFormMessage } from '../../src/components/forms'
import { DzInput } from '../../src/components/inputs'

/**
 * DzFieldArray is a renderless helper for managing a dynamic list of fields bound
 * via `v-model` to an array.
 *
 * The default slot renders once per item and exposes `{ field, index, remove, move }`;
 * the `append` slot renders the "add" affordance and is hidden automatically once
 * `max` items are reached. `min`/`max` constrain list length.
 */
const meta = {
  title: 'Core/Forms/DzFieldArray',
  component: DzFieldArray,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    // Behavior
    min: {
      control: 'number',
      description: 'Minimum number of items (guard removal in your template against this)',
      table: { category: 'Behavior', defaultValue: { summary: 'undefined' } },
    },
    max: {
      control: 'number',
      description: 'Maximum number of items — the `append` slot is hidden once reached',
      table: { category: 'Behavior', defaultValue: { summary: 'undefined' } },
    },
  },
  args: {
    min: undefined,
    max: undefined,
  },
} satisfies Meta<typeof DzFieldArray>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — add / remove / reorder rows
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Add / Remove / Reorder',
  render: args => ({
    components: { DzFieldArray, DzInput, DzButton },
    setup() {
      const members = ref<string[]>(['Ada Lovelace', 'Linus Torvalds'])
      return { args, members }
    },
    template: `
      <div class="w-96 space-y-2">
        <DzFieldArray v-model="members" :min="args.min" :max="args.max">
          <template #default="{ field, index, remove, move, canRemove }">
            <div class="flex items-center gap-2">
              <DzInput
                :model-value="field"
                aria-label="Team member name"
                @update:model-value="(v) => (members[index] = v)"
              />
              <DzButton size="sm" variant="ghost" aria-label="Move up" :disabled="index === 0" @click="move(index - 1)">↑</DzButton>
              <DzButton size="sm" variant="ghost" aria-label="Move down" :disabled="index === members.length - 1" @click="move(index + 1)">↓</DzButton>
              <DzButton size="sm" variant="ghost" tone="danger" :disabled="!canRemove" @click="remove()">Remove</DzButton>
            </div>
          </template>
          <template #append="{ append }">
            <DzButton size="sm" variant="outline" @click="append('')">+ Add member</DzButton>
          </template>
        </DzFieldArray>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rowCount = () => canvas.getAllByRole('textbox').length

    await expect(rowCount()).toBe(2)

    await userEvent.click(canvas.getByRole('button', { name: /add member/i }))
    await expect(rowCount()).toBe(3)

    await userEvent.click(canvas.getAllByRole('button', { name: /^remove$/i })[0])
    await expect(rowCount()).toBe(2)
  },
}

// ---------------------------------------------------------------------------
// Min / Max items
// ---------------------------------------------------------------------------

export const MinMaxItems: Story = {
  name: 'Min / Max Items',
  args: {
    min: 1,
    max: 4,
  },
  render: args => ({
    components: { DzFieldArray, DzInput, DzButton },
    setup() {
      const tags = ref<string[]>(['frontend'])
      return { args, tags }
    },
    template: `
      <div class="w-96 space-y-2">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          At least {{ args.min }}, at most {{ args.max }} tags. Add is hidden at the max; Remove is disabled at the min.
        </p>
        <DzFieldArray v-model="tags" :min="args.min" :max="args.max">
          <template #default="{ field, index, remove, canRemove }">
            <div class="flex items-center gap-2">
              <DzInput
                :model-value="field"
                aria-label="Tag"
                @update:model-value="(v) => (tags[index] = v)"
              />
              <DzButton size="sm" variant="ghost" tone="danger" :disabled="!canRemove" @click="remove()">Remove</DzButton>
            </div>
          </template>
          <template #append="{ append }">
            <DzButton size="sm" variant="outline" @click="append('')">+ Add tag</DzButton>
          </template>
        </DzFieldArray>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rowCount = () => canvas.getAllByRole('textbox').length

    // Starts at 1 item (the min) — Remove must be disabled.
    await expect(rowCount()).toBe(1)
    await expect(canvas.getByRole('button', { name: /^remove$/i })).toBeDisabled()

    // Append up to the max (4), then the add affordance disappears.
    const add = () => canvas.getByRole('button', { name: /add tag/i })
    await userEvent.click(add())
    await userEvent.click(add())
    await userEvent.click(add())
    await expect(rowCount()).toBe(4)
    await expect(canvas.queryByRole('button', { name: /add tag/i })).toBeNull()
  },
}

// ---------------------------------------------------------------------------
// Per-row validation
// ---------------------------------------------------------------------------

export const PerRowValidation: Story = {
  name: 'Per-Row Validation',
  render: () => ({
    components: { DzFieldArray, DzFormField, DzFormLabel, DzFormMessage, DzInput, DzButton },
    setup() {
      const emails = ref<string[]>(['ada@example.com', 'not-an-email'])
      const isValid = (v: string) => /.+@.+\..+/.test(v)
      return { emails, isValid }
    },
    template: `
      <div class="w-96 space-y-3">
        <DzFieldArray v-model="emails">
          <template #default="{ field, index, remove }">
            <DzFormField :invalid="!isValid(field)" :error="!isValid(field) ? 'Enter a valid email address.' : ''">
              <DzFormLabel>Invitee {{ index + 1 }}</DzFormLabel>
              <div class="flex items-center gap-2">
                <DzInput
                  :model-value="field"
                  type="email"
                  aria-label="Invitee email"
                  @update:model-value="(v) => (emails[index] = v)"
                />
                <DzButton size="sm" variant="ghost" tone="danger" @click="remove()">Remove</DzButton>
              </div>
              <DzFormMessage />
            </DzFormField>
          </template>
          <template #append="{ append }">
            <DzButton size="sm" variant="outline" @click="append('')">+ Add invitee</DzButton>
          </template>
        </DzFieldArray>
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
    components: { DzFieldArray, DzInput, DzButton },
    setup() {
      const members = ref<string[]>(['Ada Lovelace', 'Grace Hopper'])
      return { members }
    },
    template: `
      <div class="w-96 space-y-2">
        <DzFieldArray v-model="members">
          <template #default="{ field, index, remove }">
            <div class="flex items-center gap-2">
              <DzInput
                :model-value="field"
                aria-label="Team member name"
                @update:model-value="(v) => (members[index] = v)"
              />
              <DzButton size="sm" variant="ghost" tone="danger" @click="remove()">Remove</DzButton>
            </div>
          </template>
          <template #append="{ append }">
            <DzButton size="sm" variant="outline" @click="append('')">+ Add member</DzButton>
          </template>
        </DzFieldArray>
      </div>
    `,
  }),
}
