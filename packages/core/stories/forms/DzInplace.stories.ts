import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzInplace } from '../../src/components/forms'
import { DzInput } from '../../src/components/inputs'
import { darkModeDecorator } from '../_shared'

/**
 * **DzInplace** renders read-only display text that swaps to an editable field
 * on activation — lightweight inline editing for table cells, profile fields,
 * and settings rows.
 *
 * Click (or press Enter) on the display view to open the editor. **Esc**
 * cancels and restores the prior value; **Enter** and/or **blur** commit,
 * configurable via `saveOn`. Focus moves into the editor on open and returns to
 * the trigger on close.
 *
 * When no `#edit` slot is supplied, a built-in `DzInput` is rendered and bound
 * to `v-model:value`.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Forms/DzInplace',
  component: DzInplace,
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
  argTypes: {
    saveOn: {
      control: 'inline-radio',
      options: ['enter', 'blur', 'both'],
      description: 'When the editor commits its value',
      table: { category: 'Behavior', defaultValue: { summary: 'both' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevent activation and interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size forwarded to the built-in DzInput editor',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder for the built-in DzInput editor',
      table: { category: 'Behavior' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the display trigger',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    saveOn: 'both',
    disabled: false,
    size: 'md',
    ariaLabel: 'Edit value',
  },
} satisfies Meta<typeof DzInplace>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// TextField — default built-in DzInput editor
// ---------------------------------------------------------------------------

export const TextField: Story = {
  render: args => ({
    components: { DzInplace },
    setup() {
      const value = ref('Jane Doe')
      return { args, value }
    },
    template: `
      <div class="p-8 max-w-sm">
        <label class="block text-sm font-medium mb-1 text-[var(--dz-foreground)]">Full name</label>
        <DzInplace v-bind="args" v-model:value="value" placeholder="Enter a name" />
        <p class="text-xs mt-3 text-[var(--dz-muted-foreground)]">Current value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Display mode: the trigger button should show the initial value.
    const trigger = canvas.getByRole('button', { name: /edit value/i })
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveTextContent(/jane doe/i)

    // Click to activate the editor.
    await userEvent.click(trigger)

    // The editor input should now be visible and focused.
    const input = await canvas.findByRole('textbox')
    await expect(input).toBeVisible()
    await expect(input).toHaveFocus()

    // Clear and type a new value.
    await userEvent.clear(input)
    await userEvent.keyboard('Alice Smith')

    // Commit with Enter — editor closes, display shows the new value.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.queryByRole('textbox')).not.toBeInTheDocument())
    await expect(canvas.getByRole('button', { name: /edit value/i })).toHaveTextContent(
      /alice smith/i,
    )

    // Re-open, type something, then Escape — value reverts.
    await userEvent.click(canvas.getByRole('button', { name: /edit value/i }))
    const input2 = await canvas.findByRole('textbox')
    await userEvent.clear(input2)
    await userEvent.keyboard('Temporary{Escape}')
    await waitFor(() => expect(canvas.queryByRole('textbox')).not.toBeInTheDocument())
    await expect(canvas.getByRole('button', { name: /edit value/i })).toHaveTextContent(
      /alice smith/i,
    )
  },
}

// ---------------------------------------------------------------------------
// InTableCell — inline editing inside a table
// ---------------------------------------------------------------------------

export const InTableCell: Story = {
  render: args => ({
    components: { DzInplace },
    setup() {
      const rows = ref([
        { id: 1, name: 'API Gateway', owner: 'Platform' },
        { id: 2, name: 'Billing Service', owner: 'Finance' },
        { id: 3, name: 'Auth Service', owner: 'Security' },
      ])
      return { args, rows }
    },
    template: `
      <div class="p-8">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left text-[var(--dz-muted-foreground)] border-b border-[var(--dz-border)]">
              <th class="py-2 pr-4 font-medium">Service</th>
              <th class="py-2 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="border-b border-[var(--dz-border)]">
              <td class="py-1 pr-4">
                <DzInplace v-bind="args" v-model:value="row.name" :aria-label="'Edit service name'" />
              </td>
              <td class="py-1">
                <DzInplace v-bind="args" v-model:value="row.owner" :aria-label="'Edit owner'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// CustomEditor — a bespoke #edit slot with explicit Save/Cancel
// ---------------------------------------------------------------------------

export const CustomEditor: Story = {
  args: { saveOn: 'enter' },
  render: args => ({
    components: { DzInplace, DzInput },
    setup() {
      const value = ref('Confidential')
      return { args, value }
    },
    template: `
      <div class="p-8 max-w-sm">
        <label class="block text-sm font-medium mb-1 text-[var(--dz-foreground)]">Label</label>
        <DzInplace v-bind="args" v-model:value="value" aria-label="Edit label">
          <template #display="{ value }">
            <span class="font-medium">{{ value || 'Click to add a label' }}</span>
          </template>
          <template #edit="{ value, setValue, save, cancel }">
            <DzInput
              :model-value="value"
              size="sm"
              @update:model-value="setValue"
            />
            <button
              type="button"
              class="px-2 py-1 text-xs rounded bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]"
              @click="save"
            >Save</button>
            <button
              type="button"
              class="px-2 py-1 text-xs rounded text-[var(--dz-muted-foreground)]"
              @click="cancel"
            >Cancel</button>
          </template>
        </DzInplace>
        <p class="text-xs mt-3 text-[var(--dz-muted-foreground)]">Current value: {{ value }}</p>
      </div>
    `,
  }),
}
