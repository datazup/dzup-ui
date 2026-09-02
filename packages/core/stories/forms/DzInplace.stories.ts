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

// ---------------------------------------------------------------------------
// States — display / edit / disabled (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * DzInplace has two states at once: the declared `disabled` prop, and the
 * display ⇄ edit mode it swaps between, which it publishes as
 * `data-state="display" | "edit"` on its root.
 *
 * They interact, which is the part worth a story: `disabled` does not merely
 * grey the trigger, it removes the affordance entirely — the pencil hint is not
 * rendered, the trigger is a `disabled` button, and `activate()` refuses, so the
 * component can never reach `edit`. The play function drives the enabled control
 * through display → edit → display and asserts the disabled one stays put.
 */
export const States: Story = {
  render: () => ({
    components: { DzInplace },
    setup() {
      const editable = ref('Jane Doe')
      const locked = ref('System owner')
      return { editable, locked }
    },
    template: `
      <div class="grid max-w-2xl gap-8 p-8 md:grid-cols-2">
        <section class="space-y-2">
          <p class="text-sm font-medium">Editable</p>
          <DzInplace
            v-model:value="editable"
            aria-label="Edit display name"
            placeholder="Enter a name"
            data-testid="inplace-editable"
          />
          <p class="text-xs text-[var(--dz-muted-foreground)]">
            Value: <strong data-testid="editable-value">{{ editable }}</strong>
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled</p>
          <DzInplace
            disabled
            v-model:value="locked"
            aria-label="Edit system owner"
            data-testid="inplace-disabled"
          />
          <p class="text-xs text-[var(--dz-muted-foreground)]">
            Value: <strong data-testid="disabled-value">{{ locked }}</strong>
          </p>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const editable = canvas.getByTestId('inplace-editable')
    const disabled = canvas.getByTestId('inplace-disabled')

    // Both start in `display`; only the disabled one is flagged.
    await expect(editable).toHaveAttribute('data-state', 'display')
    await expect(editable).not.toHaveAttribute('data-disabled')
    await expect(disabled).toHaveAttribute('data-state', 'display')
    await expect(disabled).toHaveAttribute('data-disabled')

    // Disabled: the trigger is a disabled button and carries no edit affordance.
    const lockedTrigger = within(disabled).getByRole('button', { name: /edit system owner/i })
    await expect(lockedTrigger).toBeDisabled()
    await expect(lockedTrigger.querySelector('svg')).toBeNull()

    // Editable: activating swaps display → edit and moves focus into the field.
    const trigger = within(editable).getByRole('button', { name: /edit display name/i })
    await expect(trigger.querySelector('svg')).not.toBeNull()
    await userEvent.click(trigger)
    await waitFor(() => expect(editable).toHaveAttribute('data-state', 'edit'))
    const field = await within(editable).findByRole('textbox')
    await expect(field).toHaveFocus()

    // Escape returns to `display` without committing.
    await userEvent.clear(field)
    await userEvent.keyboard('Discarded{Escape}')
    await waitFor(() => expect(editable).toHaveAttribute('data-state', 'display'))
    await expect(canvas.getByTestId('editable-value')).toHaveTextContent('Jane Doe')

    // Enter commits, and the display view shows the committed value.
    await userEvent.click(within(editable).getByRole('button', { name: /edit display name/i }))
    const field2 = await within(editable).findByRole('textbox')
    await userEvent.clear(field2)
    await userEvent.keyboard('Ada Lovelace{Enter}')
    await waitFor(() => expect(editable).toHaveAttribute('data-state', 'display'))
    await expect(canvas.getByTestId('editable-value')).toHaveTextContent('Ada Lovelace')

    // The disabled control never left `display`.
    await expect(disabled).toHaveAttribute('data-state', 'display')
    await expect(within(disabled).queryByRole('textbox')).toBeNull()
    await expect(canvas.getByTestId('disabled-value')).toHaveTextContent('System owner')
  },
}
