import type { Meta, StoryObj } from '@storybook/vue3-vite'
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
