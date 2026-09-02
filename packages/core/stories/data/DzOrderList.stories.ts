import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzOrderList } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

/**
 * **DzOrderList** is a single list whose items can be reordered in place — by
 * dragging a row's grab handle, by the Move Up / Down / Top / Bottom controls,
 * or entirely by keyboard (focus a row, **Space** to grab, **Arrow** keys to
 * move, **Space** to drop, **Escape** to cancel). Position changes are announced
 * through a polite live region, and the drag animation respects
 * `prefers-reduced-motion`.
 *
 * It complements **DzTransfer** (which moves items *between* two lists): use
 * DzOrderList to reorder *within* one — ordering priorities, building
 * playlists/sequences, or arranging dashboard widgets.
 *
 * The ordered array is owned by the consumer via `v-model:value`; when
 * `selectable`, several rows can be selected and moved together as a group.
 * Provide `data-key` so selection survives reordering.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Data/DzOrderList',
  component: DzOrderList,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['plain', 'bordered', 'divided'],
      description: 'Visual style of the list surface',
      table: { category: 'Appearance', defaultValue: { summary: 'bordered' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Row density',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    selectable: {
      control: 'boolean',
      description: 'Allow multi-selection to move a group of rows together',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    showControls: {
      control: 'boolean',
      description: 'Render the Move Up / Down / Top / Bottom control buttons',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    dragHandle: {
      control: 'boolean',
      description: 'Show a grab handle and enable pointer drag-and-drop',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    controlsPosition: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which side the control column sits on',
      table: { category: 'Layout', defaultValue: { summary: 'start' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  decorators: [darkModeDecorator],
} satisfies Meta<typeof DzOrderList>

export default meta
type Story = StoryObj<typeof meta>

interface Task { id: number, label: string }

const sampleTasks: Task[] = [
  { id: 1, label: 'Draft the proposal' },
  { id: 2, label: 'Review with the team' },
  { id: 3, label: 'Incorporate feedback' },
  { id: 4, label: 'Send for approval' },
  { id: 5, label: 'Publish' },
]

/**
 * The default reorderable list: drag the handle, use the control buttons, or
 * reorder by keyboard. Each row is rendered through the `#item` slot.
 */
export const Default: Story = {
  render: args => ({
    components: { DzOrderList },
    setup() {
      const value = ref<Task[]>([...sampleTasks])
      return { args, value }
    },
    template: `
      <div style="max-width: 26rem">
        <DzOrderList v-bind="args" v-model:value="value" data-key="id">
          <template #item="{ item }">{{ item.label }}</template>
        </DzOrderList>
      </div>
    `,
  }),
  args: {
    selectable: false,
    showControls: true,
    dragHandle: true,
  },
}

/**
 * Control buttons only — drag handle disabled. Useful where pointer dragging is
 * undesirable (dense tables, touch-constrained surfaces).
 */
export const WithControls: Story = {
  render: args => ({
    components: { DzOrderList },
    setup() {
      const value = ref<Task[]>([...sampleTasks])
      return { args, value }
    },
    template: `
      <div style="max-width: 26rem">
        <DzOrderList v-bind="args" v-model:value="value" data-key="id">
          <template #item="{ item }">{{ item.label }}</template>
        </DzOrderList>
      </div>
    `,
  }),
  args: {
    showControls: true,
    dragHandle: false,
  },
}

/**
 * `selectable` enables multi-selection: click rows to select them, then use the
 * controls (or keyboard) to move the whole group at once. Selection is tracked
 * by `data-key`, so it survives reordering.
 */
export const MultiSelect: Story = {
  render: args => ({
    components: { DzOrderList },
    setup() {
      const value = ref<Task[]>([...sampleTasks])
      const selected = ref<(string | number)[]>([])
      return { args, value, selected }
    },
    template: `
      <div style="max-width: 26rem">
        <DzOrderList
          v-bind="args"
          v-model:value="value"
          data-key="id"
          selectable
          @selection-change="selected = $event"
        >
          <template #item="{ item }">{{ item.label }}</template>
        </DzOrderList>
        <p style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--dz-muted-foreground)">
          Selected ids: {{ selected.join(', ') || '—' }}
        </p>
      </div>
    `,
  }),
  args: {
    selectable: true,
  },
}

/**
 * The `#item` slot receives `{ item, index, selected, grabbed }`, so rows can be
 * arbitrarily rich — here each row shows an avatar swatch, a title, and a
 * subtitle.
 */
export const CustomItem: Story = {
  render: args => ({
    components: { DzOrderList },
    setup() {
      const value = ref([
        { id: 'a', name: 'Ada Lovelace', role: 'Engineering' },
        { id: 'b', name: 'Alan Turing', role: 'Research' },
        { id: 'c', name: 'Grace Hopper', role: 'Compilers' },
        { id: 'd', name: 'Katherine Johnson', role: 'Trajectories' },
      ])
      return { args, value }
    },
    template: `
      <div style="max-width: 28rem">
        <DzOrderList v-bind="args" v-model:value="value" data-key="id">
          <template #item="{ item }">
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <span
                style="display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 9999px; background: var(--dz-primary-muted); color: var(--dz-primary); font-size: 0.75rem; font-weight: 600"
              >{{ item.name.split(' ').map((n) => n[0]).join('') }}</span>
              <span style="display: flex; flex-direction: column">
                <span style="font-weight: 500">{{ item.name }}</span>
                <span style="font-size: 0.75rem; color: var(--dz-muted-foreground)">{{ item.role }}</span>
              </span>
            </div>
          </template>
        </DzOrderList>
      </div>
    `,
  }),
  args: {
    selectable: false,
  },
}

// ---------------------------------------------------------------------------
// States — enabled / disabled / grabbed / selected (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the state DzOrderList declares as a prop, and the component adds
 * two transient row states on top of it (`data-state="grabbed"` during a
 * keyboard grab, `data-state="selected"` when `selectable`). All three are
 * shown here, because "disabled" on a reorderable list means something specific:
 * the rows stay readable, the control buttons go dead, and the keyboard grab
 * refuses to start.
 *
 * The disabled list is asserted rather than clicked — its variant sets
 * `pointer-events: none` on the root, so the browser would swallow the click.
 */
export const States: Story = {
  render: () => ({
    components: { DzOrderList },
    setup() {
      const enabled = ref<Task[]>([...sampleTasks])
      const disabled = ref<Task[]>([...sampleTasks])
      const selectable = ref<Task[]>([...sampleTasks])
      return { enabled, disabled, selectable }
    },
    template: `
      <div class="grid gap-8 lg:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled</p>
          <DzOrderList v-model:value="enabled" data-key="id" data-testid="ol-enabled">
            <template #item="{ item }">{{ item.label }}</template>
          </DzOrderList>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled</p>
          <DzOrderList disabled v-model:value="disabled" data-key="id" data-testid="ol-disabled">
            <template #item="{ item }">{{ item.label }}</template>
          </DzOrderList>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Selectable — selected rows</p>
          <DzOrderList selectable v-model:value="selectable" data-key="id" data-testid="ol-selectable">
            <template #item="{ item }">{{ item.label }}</template>
          </DzOrderList>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('ol-enabled')
    const disabled = canvas.getByTestId('ol-disabled')
    const selectable = canvas.getByTestId('ol-selectable')

    const labels = (root: HTMLElement) =>
      [...root.querySelectorAll('li[data-index]')]
        .map(li => (li.textContent ?? '').replace(/\s+/g, ' ').trim())

    // Enabled: the focused row is row 0, so "up" is unavailable and "down" is
    // live — the controls describe what is actually possible.
    await expect(
      within(enabled).getByRole('button', { name: 'Move up' }),
    ).toBeDisabled()
    const moveDown = within(enabled).getByRole('button', { name: 'Move down' })
    await expect(moveDown).toBeEnabled()
    await userEvent.click(moveDown)
    await waitFor(() =>
      expect(labels(enabled)[0]).toBe('Review with the team'),
    )
    await expect(labels(enabled)[1]).toBe('Draft the proposal')

    // Disabled: rows are still readable, every control is dead, and the root
    // carries `data-disabled` for the styling contract.
    await expect(disabled).toHaveAttribute('data-disabled')
    await expect(labels(disabled)).toHaveLength(5)
    for (const name of ['Move to top', 'Move up', 'Move down', 'Move to bottom'])
      await expect(within(disabled).getByRole('button', { name })).toBeDisabled()

    // Selectable: rows become `option`s in a multi-selectable listbox, and a
    // selected row stamps `data-state="selected"`.
    const listbox = within(selectable).getByRole('listbox')
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
    const options = within(listbox).getAllByRole('option')
    await expect(options[0]).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(options[1]!)
    await waitFor(() => expect(options[1]).toHaveAttribute('aria-selected', 'true'))
    await expect(options[1]).toHaveAttribute('data-state', 'selected')

    // Grabbed: Space on a focused row enters the keyboard-drag state, which the
    // row exposes as `aria-grabbed` + `data-state="grabbed"`.
    const firstRow = enabled.querySelector<HTMLElement>('li[data-index="0"]')!
    firstRow.focus()
    await userEvent.keyboard(' ')
    await waitFor(() => expect(firstRow).toHaveAttribute('data-state', 'grabbed'))
    await expect(firstRow).toHaveAttribute('aria-grabbed', 'true')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(firstRow).not.toHaveAttribute('data-state'))
  },
}

// ---------------------------------------------------------------------------
// Accessibility — keyboard-only reorder (tier C `accessibility` DoD item)
// ---------------------------------------------------------------------------

/**
 * WCAG 2.5.7 in one story: every reorder this component offers by dragging is
 * also reachable with the keyboard alone.
 *
 * The APG grab/move/drop idiom — Tab to the list, Arrow to a row, Space to
 * grab, Arrow to move, Space to drop, Escape to cancel — is performed end to
 * end with no pointer, and each step is asserted against the resulting order
 * and against the polite live region that narrates it.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Keyboard-Only Reorder',
  render: () => ({
    components: { DzOrderList },
    setup() {
      const value = ref<Task[]>([...sampleTasks])
      return { value }
    },
    template: `
      <div class="space-y-3" style="max-width: 30rem">
        <h3 id="ol-a11y-heading" class="text-sm font-semibold">Release checklist</h3>
        <p class="text-sm" style="color: var(--dz-muted-foreground)">
          Tab to the list, Arrow keys to move between rows, Space to grab a row,
          Arrow keys to move it, Space to drop, Escape to cancel.
        </p>
        <DzOrderList
          v-model:value="value"
          data-key="id"
          :drag-handle="false"
          aria-labelledby="ol-a11y-heading"
          data-testid="ol-a11y"
        >
          <template #item="{ item }">{{ item.label }}</template>
        </DzOrderList>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('ol-a11y')
    const list = within(root).getByRole('list')
    const live = root.querySelector('[role="status"]')
    const labels = () =>
      [...root.querySelectorAll('li[data-index]')]
        .map(li => (li.textContent ?? '').replace(/\s+/g, ' ').trim())

    // The list is named by the visible heading and exposes a roving tabindex:
    // exactly one row is in the tab order.
    await expect(list).toHaveAttribute('aria-labelledby', 'ol-a11y-heading')
    await expect(root.querySelectorAll('li[tabindex="0"]')).toHaveLength(1)

    // Reach the list with Tab only — the four control buttons come first.
    for (let i = 0; i < 10 && !list.contains(document.activeElement); i++)
      await userEvent.tab()
    await expect(list.contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).toHaveAttribute('data-index', '0')

    // Arrow down twice to reach "Incorporate feedback" (row 2).
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-index', '1'),
    )
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-index', '2'),
    )

    // Space grabs it, and the grab is announced with instructions.
    await userEvent.keyboard(' ')
    await waitFor(() => expect(live).toHaveTextContent(/Grabbed item at position 3 of 5/))

    // Arrow up moves the grabbed row; the model really reorders.
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(labels()[1]).toBe('Incorporate feedback'))
    await expect(live).toHaveTextContent('Item moved to position 2 of 5.')

    // Space drops it, and the new order is the committed order.
    await userEvent.keyboard(' ')
    await waitFor(() => expect(live).toHaveTextContent(/Dropped at position 2 of 5/))
    await expect(labels()).toEqual([
      'Draft the proposal',
      'Incorporate feedback',
      'Review with the team',
      'Send for approval',
      'Publish',
    ])

    // Escape cancels an in-flight grab without leaving the row stuck.
    await userEvent.keyboard(' ')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('aria-grabbed', 'true'),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(document.activeElement).not.toHaveAttribute('aria-grabbed'),
    )
  },
}

// ---------------------------------------------------------------------------
// Real world — dashboard widget order (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * The job DzOrderList is reached for: letting a user arrange the widgets on
 * their dashboard, with the resulting order persisted somewhere and reflected
 * back to them.
 *
 * The composition is what makes it a real usage — rich rows with an icon,
 * a title and a description; a live preview of the order that will be saved;
 * and a reset that proves the bound array is the single source of truth.
 */
export const RealWorldDashboardOrder: Story = {
  name: 'Real World: Dashboard Widget Order',
  render: () => ({
    components: { DzOrderList },
    setup() {
      const initial = [
        { id: 'revenue', name: 'Revenue', hint: 'Monthly recurring revenue' },
        { id: 'signups', name: 'Signups', hint: 'New accounts this week' },
        { id: 'errors', name: 'Error rate', hint: '5xx responses per minute' },
        { id: 'latency', name: 'Latency', hint: 'p95 response time' },
      ]
      const value = ref([...initial])
      const reset = () => {
        value.value = [...initial]
      }
      return { value, reset }
    },
    template: `
      <div class="space-y-4" style="max-width: 32rem">
        <h3 id="ol-widgets-heading" class="text-sm font-semibold">Dashboard layout</h3>
        <DzOrderList
          v-model:value="value"
          data-key="id"
          variant="divided"
          aria-labelledby="ol-widgets-heading"
          data-testid="ol-widgets"
        >
          <template #item="{ item }">
            <span style="display: flex; flex-direction: column">
              <span style="font-weight: 500">{{ item.name }}</span>
              <span style="font-size: 0.75rem; color: var(--dz-muted-foreground)">{{ item.hint }}</span>
            </span>
          </template>
        </DzOrderList>
        <p style="font-size: 0.8rem; color: var(--dz-muted-foreground)">
          Saved order: <strong data-testid="saved-order">{{ value.map((w) => w.id).join(' › ') }}</strong>
        </p>
        <button
          type="button"
          data-testid="reset-order"
          style="font-size: 0.8rem; text-decoration: underline"
          @click="reset"
        >Reset to default</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('ol-widgets')

    // The order the consumer would persist starts at the default.
    await expect(canvas.getByTestId('saved-order')).toHaveTextContent(
      'revenue › signups › errors › latency',
    )

    // A user promotes "Error rate" to the top with the control buttons.
    const errorsRow = root.querySelector<HTMLElement>('li[data-index="2"]')!
    await expect(errorsRow).toHaveTextContent('Error rate')
    // Clicking a row makes it the control target (`activeIndex`).
    await userEvent.click(errorsRow)
    await userEvent.click(within(root).getByRole('button', { name: 'Move to top' }))
    await waitFor(() =>
      expect(canvas.getByTestId('saved-order')).toHaveTextContent(
        'errors › revenue › signups › latency',
      ),
    )

    // The bound array is the source of truth: resetting it re-renders the list.
    await userEvent.click(canvas.getByTestId('reset-order'))
    await waitFor(() =>
      expect(canvas.getByTestId('saved-order')).toHaveTextContent(
        'revenue › signups › errors › latency',
      ),
    )
    await expect(
      root.querySelector('li[data-index="0"]'),
    ).toHaveTextContent('Revenue')
  },
}
