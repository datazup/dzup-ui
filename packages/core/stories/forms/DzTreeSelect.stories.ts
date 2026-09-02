import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../src/components/data'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzFormField, DzFormLabel, DzTreeSelect } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

const categories: TreeNode[] = [
  {
    key: 'fruit',
    label: 'Fruit',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
      {
        key: 'citrus',
        label: 'Citrus',
        children: [
          { key: 'orange', label: 'Orange' },
          { key: 'lemon', label: 'Lemon' },
        ],
      },
    ],
  },
  {
    key: 'vegetable',
    label: 'Vegetable',
    children: [
      { key: 'carrot', label: 'Carrot' },
      { key: 'potato', label: 'Potato' },
    ],
  },
  { key: 'dairy', label: 'Dairy' },
]

/**
 * DzTreeSelect is a form select whose overlay panel is a DzTree — composing
 * DzPopover (overlay) + DzTree (panel) + a DzSelect-styled trigger.
 *
 * It supports `single`, `multiple`, and `checkbox` selection (with
 * parent/child propagation and indeterminate state), an optional type-to-search
 * filter, and the same `--dz-input-*` token family as DzSelect.
 *
 * **Status:** experimental.
 */
const meta = {
  title: 'Core/Forms/DzTreeSelect',
  component: DzTreeSelect,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple', 'checkbox'],
      description: 'Selection behaviour',
      table: { category: 'Behavior', defaultValue: { summary: 'single' } },
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    filter: {
      control: 'boolean',
      description: 'Enable type-to-search filtering',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown when nothing is selected',
      table: { category: 'Behavior' },
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
  },
  args: {
    nodes: categories,
    placeholder: 'Select a category...',
    selectionMode: 'single',
    variant: 'outline',
    size: 'md',
    filter: false,
    disabled: false,
  },
} satisfies Meta<typeof DzTreeSelect>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Single
// ---------------------------------------------------------------------------

export const Single: Story = {
  render: args => ({
    components: { DzTreeSelect },
    setup() {
      return { args }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <DzTreeSelect v-bind="args" v-model:value="value" :expanded-keys="['fruit']" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ value || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Open the dropdown via the combobox trigger.
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)

    // Tree panel is portalled to document.body.
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())

    // "Fruit" branch is pre-expanded; find "Apple" leaf (no aria-expanded = leaf node).
    // Click the inner row div (the actual interactive element).
    const appleItem = await waitFor(() => {
      const items = body.getAllByRole('treeitem', { name: /apple/i })
      const leaf = items.find(el => !el.hasAttribute('aria-expanded'))
      expect(leaf).toBeDefined()
      return leaf!
    })
    const appleRow = (appleItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? appleItem

    // Click Apple to select it.
    await userEvent.click(appleRow)
    await waitFor(() =>
      expect(canvas.getByText(/selected:/i).closest('p')).not.toHaveTextContent('none'),
    )
  },
}

// ---------------------------------------------------------------------------
// Multiple (chips)
// ---------------------------------------------------------------------------

export const MultipleChips: Story = {
  name: 'Multiple (chips)',
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: ['apple', 'carrot'] as string[] }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          selection-mode="multiple"
          :expanded-keys="['fruit', 'vegetable']"
          placeholder="Select categories..."
        />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ value.join(', ') || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Initial chips for pre-selected values.
    expect(canvas.getByRole('button', { name: /remove apple/i })).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: /remove carrot/i })).toBeInTheDocument()

    // Open and select Banana.
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())
    const bananaItem = body
      .getAllByRole('treeitem', { name: /banana/i })
      .find(el => !el.hasAttribute('aria-expanded'))!
    const bananaRow = (bananaItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? bananaItem
    await userEvent.click(bananaRow)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove banana/i })).toBeInTheDocument(),
    )

    // Remove Apple chip.
    await userEvent.click(canvas.getByRole('button', { name: /remove apple/i }))
    await waitFor(() => expect(canvas.queryByRole('button', { name: /remove apple/i })).toBeNull())
  },
}

// ---------------------------------------------------------------------------
// Checkbox propagation
// ---------------------------------------------------------------------------

export const CheckboxPropagation: Story = {
  name: 'Checkbox propagation',
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: [] as string[] }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          selection-mode="checkbox"
          :expanded-keys="['fruit', 'citrus', 'vegetable']"
          placeholder="Select with checkboxes..."
        />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Checked: <strong>{{ value.join(', ') || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Open the dropdown.
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())

    // Click Carrot to check it (leaf node — no aria-expanded).
    const carrotItem = body
      .getAllByRole('treeitem', { name: /carrot/i })
      .find(el => !el.hasAttribute('aria-expanded'))!
    const carrotRow = (carrotItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? carrotItem
    await userEvent.click(carrotRow)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove carrot/i })).toBeInTheDocument(),
    )

    // Click Vegetable parent — propagates to Potato as well.
    const vegetableItem = body
      .getAllByRole('treeitem', { name: /vegetable/i })
      .find(el => el.hasAttribute('aria-expanded'))!
    const vegetableRow
      = (vegetableItem.querySelector('[data-dz-tree-row]') as HTMLElement) ?? vegetableItem
    await userEvent.click(vegetableRow)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /remove potato/i })).toBeInTheDocument(),
    )
  },
}

// ---------------------------------------------------------------------------
// Filterable
// ---------------------------------------------------------------------------

export const Filterable: Story = {
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          filter
          filter-placeholder="Type to search..."
          placeholder="Search categories..."
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// In a form field
// ---------------------------------------------------------------------------

export const InFormField: Story = {
  name: 'In FormField',
  render: () => ({
    components: { DzTreeSelect, DzFormField, DzFormLabel },
    setup() {
      return { categories }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs">
        <DzFormField required>
          <DzFormLabel>Category</DzFormLabel>
          <DzTreeSelect
            :nodes="categories"
            v-model:value="value"
            :expanded-keys="['fruit']"
            placeholder="Choose a category"
          />
        </DzFormField>
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
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: ['apple'] as string[] }
    },
    template: `
      <div class="max-w-xs">
        <DzTreeSelect
          :nodes="categories"
          v-model:value="value"
          selection-mode="checkbox"
          :expanded-keys="['fruit']"
          placeholder="Select categories..."
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility — combobox + tree, keyboard only (tier C `accessibility` item)
// ---------------------------------------------------------------------------

/**
 * The whole combobox-over-a-tree contract, driven from the keyboard alone.
 *
 * ArrowDown on the closed trigger opens the panel; the trigger publishes the
 * active node through `aria-activedescendant`; ArrowRight expands a branch
 * rather than committing it; ArrowDown steps into the revealed children; Enter
 * commits and closes; Escape dismisses without changing the selection. Every
 * step is asserted against `aria-expanded`, the id `aria-activedescendant`
 * names, and the bound model — no pointer is used.
 *
 * The story deliberately asserts nothing about **where DOM focus sits** once the
 * panel is open: the popover moves focus onto the tree's roving row while the
 * trigger keeps `aria-activedescendant`, which is two focus mechanisms at once.
 * That is recorded in the TASK-N1-O1 handoff (D10) for its owner rather than
 * pinned here as if it were the intended contract.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Keyboard-Only Tree Combobox',
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      return { categories }
    },
    data() {
      return { value: undefined as string | undefined }
    },
    template: `
      <div class="max-w-xs space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          ArrowDown opens the tree, ArrowRight expands a branch, ArrowUp/Down
          move the active node, Enter commits it, Escape dismisses. Focus never
          leaves the trigger — the active node is announced through
          <code>aria-activedescendant</code>.
        </p>
        <div data-testid="ts-a11y">
          <DzTreeSelect
            :nodes="categories"
            v-model:value="value"
            aria-label="Keyboard category"
            placeholder="Choose a category"
          />
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Selected: <strong data-testid="ts-a11y-value">{{ value || 'none' }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    const trigger = within(canvas.getByTestId('ts-a11y')).getByRole('combobox')

    // The closed trigger advertises the tree popup it owns.
    await expect(trigger).toHaveAttribute('aria-haspopup', 'tree')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Reach it with Tab only.
    for (let i = 0; i < 6 && document.activeElement !== trigger; i++)
      await userEvent.tab()
    await expect(trigger).toHaveFocus()

    // ArrowDown opens the panel and activates the first node, which the trigger
    // publishes through `aria-activedescendant`.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())
    await expect(trigger).toHaveAttribute('aria-controls')

    const activeId = trigger.getAttribute('aria-activedescendant')
    await expect(activeId).toBeTruthy()
    await expect(document.getElementById(activeId!)).toHaveTextContent(/Fruit/)

    // ArrowRight expands the active branch rather than committing it.
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => {
      const fruit = body.getByText('Fruit').closest('[role="treeitem"]')
      expect(fruit).toHaveAttribute('aria-expanded', 'true')
    })

    // ArrowDown steps into the newly revealed children.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(trigger.getAttribute('aria-activedescendant')).not.toBe(activeId),
    )
    const appleId = trigger.getAttribute('aria-activedescendant')!
    await expect(document.getElementById(appleId)).toHaveTextContent(/Apple/)

    // Enter commits the active node and closes the panel.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('ts-a11y-value')).toHaveTextContent('apple'))
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))

    // Escape dismisses a re-opened panel without changing the selection.
    trigger.focus()
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(canvas.getByTestId('ts-a11y-value')).toHaveTextContent('apple')
  },
}

// ---------------------------------------------------------------------------
// Real world — catalog category filter (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * The composition DzTreeSelect exists for: the category facet of a catalog
 * filter — checkbox selection with parent/child propagation, chips in the
 * trigger for what is currently on, and a result count that reacts to the
 * selection.
 *
 * A single-select demo never shows the interesting behaviour: checking a parent
 * commits its whole subtree, which is what makes this control worth using
 * instead of a flat multi-select.
 */
export const RealWorldCatalogFilter: Story = {
  name: 'Real World: Catalog Category Filter',
  render: () => ({
    components: { DzTreeSelect },
    setup() {
      const inventory: Record<string, number> = {
        apple: 12,
        banana: 8,
        orange: 5,
        lemon: 3,
        carrot: 9,
        potato: 14,
        dairy: 6,
      }
      return { categories, inventory }
    },
    data() {
      return { value: [] as string[] }
    },
    template: `
      <div class="max-w-sm space-y-4">
        <h3 class="text-base font-semibold">Filter catalog</h3>
        <div class="space-y-1">
          <label id="ts-rw-label" class="block text-sm font-medium">Categories</label>
          <div data-testid="ts-rw">
            <DzTreeSelect
              :nodes="categories"
              v-model:value="value"
              selection-mode="checkbox"
              :expanded-keys="['fruit', 'citrus', 'vegetable']"
              aria-labelledby="ts-rw-label"
              placeholder="All categories"
            />
          </div>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Showing
          <strong data-testid="ts-rw-count">{{
            value.length === 0
              ? Object.values(inventory).reduce((a, b) => a + b, 0)
              : value.reduce((sum, key) => sum + (inventory[key] ?? 0), 0)
          }}</strong>
          products across
          <strong data-testid="ts-rw-keys">{{ value.length }}</strong>
          selected categories.
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    const root = canvas.getByTestId('ts-rw')
    const trigger = within(root).getByRole('combobox')

    // Nothing filtered: the whole catalog is shown.
    await expect(canvas.getByTestId('ts-rw-count')).toHaveTextContent('57')
    await expect(canvas.getByTestId('ts-rw-keys')).toHaveTextContent('0')

    await userEvent.click(trigger)
    await waitFor(() => expect(body.getByRole('tree')).toBeVisible())

    // Checking the "Vegetable" parent commits its whole subtree — the behaviour
    // a flat multi-select cannot express.
    const vegetable = body
      .getAllByRole('treeitem', { name: /vegetable/i })
      .find(el => el.hasAttribute('aria-expanded'))!
    await userEvent.click(
      (vegetable.querySelector('[data-dz-tree-row]') as HTMLElement) ?? vegetable,
    )
    await waitFor(() =>
      expect(within(root).getByRole('button', { name: /remove carrot/i })).toBeInTheDocument(),
    )
    await expect(within(root).getByRole('button', { name: /remove potato/i }))
      .toBeInTheDocument()

    // The result count follows the selection.
    await waitFor(() => expect(canvas.getByTestId('ts-rw-count')).toHaveTextContent('23'))

    // A chip removes just its own category, leaving the rest of the filter.
    await userEvent.click(within(root).getByRole('button', { name: /remove potato/i }))
    await waitFor(() => expect(canvas.getByTestId('ts-rw-count')).toHaveTextContent('9'))
    await expect(within(root).queryByRole('button', { name: /remove potato/i })).toBeNull()
    await expect(within(root).getByRole('button', { name: /remove carrot/i }))
      .toBeInTheDocument()
  },
}
