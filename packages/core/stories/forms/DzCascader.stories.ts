import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { DzCascader } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

const regions = [
  {
    label: 'China',
    value: 'cn',
    children: [
      {
        label: 'Zhejiang',
        value: 'zj',
        children: [
          { label: 'Hangzhou', value: 'hz' },
          { label: 'Ningbo', value: 'nb' },
          { label: 'Wenzhou', value: 'wz' },
        ],
      },
      {
        label: 'Jiangsu',
        value: 'js',
        children: [
          { label: 'Nanjing', value: 'nj' },
          { label: 'Suzhou', value: 'sz' },
        ],
      },
    ],
  },
  {
    label: 'USA',
    value: 'us',
    children: [
      {
        label: 'California',
        value: 'ca',
        children: [
          { label: 'Los Angeles', value: 'la' },
          { label: 'San Francisco', value: 'sf' },
        ],
      },
      {
        label: 'New York',
        value: 'ny',
        children: [
          { label: 'New York City', value: 'nyc' },
          { label: 'Buffalo', value: 'buf' },
        ],
      },
    ],
  },
  {
    label: 'Germany',
    value: 'de',
    disabled: true,
    children: [{ label: 'Berlin', value: 'be' }],
  },
]

/**
 * DzCascader is a cascading multi-level select for ordered, hierarchical
 * choices (country → state → city). The trigger opens a popover that reveals
 * child options column-by-column as each level is chosen.
 *
 * Selecting a leaf commits the path and closes the popover. With
 * `change-on-select`, any intermediate node also commits. `expand-trigger`
 * switches between click (default) and hover expansion, and `filter` replaces
 * the columns with a flat, searchable list of full paths.
 *
 * `v-model:value` is an array of keys describing the selected path,
 * e.g. `['cn', 'zj', 'hz']`.
 */
const meta = {
  title: 'Core/Forms/DzCascader',
  component: DzCascader,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style of the trigger',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    placeholder: {
      control: 'text',
      description: 'Trigger placeholder when nothing is selected',
      table: { category: 'Behavior', defaultValue: { summary: 'Select' } },
    },
    changeOnSelect: {
      control: 'boolean',
      description: 'Allow committing a non-leaf (parent) node',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    expandTrigger: {
      control: 'inline-radio',
      options: ['click', 'hover'],
      description: 'How a child column is revealed',
      table: { category: 'Behavior', defaultValue: { summary: 'click' } },
    },
    filter: {
      control: 'boolean',
      description: 'Enable the flat, searchable path filter',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    separator: {
      control: 'text',
      description: 'Separator between labels in the selected path',
      table: { category: 'Behavior', defaultValue: { summary: '/' } },
    },
    cleaner: {
      control: 'boolean',
      description: 'Show the clear button when a value is set',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    portalDisabled: {
      control: 'boolean',
      description: 'Render the options inline instead of teleporting them',
      table: { category: 'Portal', defaultValue: { summary: 'false' } },
    },
    portalDefer: {
      control: 'boolean',
      description: 'Defer portal target resolution until the application has mounted',
      table: { category: 'Portal', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction',
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
    options: regions,
    placeholder: 'Select region',
    variant: 'outline',
    size: 'md',
    changeOnSelect: false,
    expandTrigger: 'click',
    filter: false,
    disabled: false,
  },
} satisfies Meta<typeof DzCascader>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCascader },
    setup() {
      return { args }
    },
    template: '<DzCascader v-bind="args" class="max-w-xs" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Trigger is a combobox button; initially collapsed.
    const trigger = canvas.getByRole('combobox')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Click opens the first-level listbox.
    await userEvent.click(trigger)
    // Popover is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(1))

    // First item in the root column is "China" which has children.
    const options = screen.getAllByRole('option')
    const chinaOption = options.find(el => el.textContent?.includes('China'))!
    await userEvent.click(chinaOption)

    // Clicking a parent reveals the second-level listbox (two listboxes now visible).
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(2))

    // The child column contains Zhejiang as first option.
    await waitFor(() =>
      expect(screen.getAllByRole('option').some(el => el.textContent?.includes('Zhejiang'))).toBe(
        true,
      ),
    )
  },
}

// ---------------------------------------------------------------------------
// Change on select (parents selectable)
// ---------------------------------------------------------------------------

export const ChangeOnSelect: Story = {
  name: 'Change on Select',
  render: () => ({
    components: { DzCascader },
    data() {
      return { value: [], regions }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Any level commits; the popover stays open to drill deeper.</p>
        <DzCascader v-model:value="value" :options="regions" change-on-select placeholder="Select region" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Value: <strong>{{ value.length ? value.join(' → ') : 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    // Open the panel.
    await userEvent.click(trigger)
    // Popover is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(1))

    // Click "USA" (a parent) — with change-on-select it commits immediately.
    const usaOption = screen.getAllByRole('option').find(el => el.textContent?.includes('USA'))!
    await userEvent.click(usaOption)

    // Panel stays open (change-on-select keeps it open to drill deeper).
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(2))

    // Click the leaf "California → Los Angeles" path: click California first.
    const californiaOption = screen
      .getAllByRole('option')
      .find(el => el.textContent?.includes('California'))!
    await userEvent.click(californiaOption)
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(3))

    // Select leaf "Los Angeles" — panel closes and trigger shows the full path.
    const laOption = screen
      .getAllByRole('option')
      .find(el => el.textContent?.includes('Los Angeles'))!
    await userEvent.click(laOption)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent(/Los Angeles/)
  },
}

// ---------------------------------------------------------------------------
// Hover expand
// ---------------------------------------------------------------------------

export const HoverExpand: Story = {
  name: 'Hover Expand',
  render: () => ({
    components: { DzCascader },
    data() {
      return { regions }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Hover a node to reveal its children; click to select.</p>
        <DzCascader :options="regions" expand-trigger="hover" placeholder="Hover to expand" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Filterable (flat path search)
// ---------------------------------------------------------------------------

export const Filterable: Story = {
  render: () => ({
    components: { DzCascader },
    data() {
      return { value: [], regions }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Open and type to search across full paths (e.g. "hang").</p>
        <DzCascader v-model:value="value" :options="regions" filter placeholder="Search regions" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Value: <strong>{{ value.length ? value.join(' → ') : 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    // Open the panel.
    await userEvent.click(trigger)
    // Popover is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('searchbox')).toBeVisible())

    // Type a query — flat listbox of matching paths appears.
    const searchInput = screen.getByRole('searchbox')
    await userEvent.type(searchInput, 'hang')
    await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible())

    // "Hangzhou" path should appear as a flat option.
    await waitFor(() =>
      expect(screen.getAllByRole('option').some(el => el.textContent?.includes('Hangzhou'))).toBe(
        true,
      ),
    )

    // Click the Hangzhou option — panel closes and trigger shows the selected path.
    const hangzhouOption = screen
      .getAllByRole('option')
      .find(el => el.textContent?.includes('Hangzhou'))!
    await userEvent.click(hangzhouOption)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveTextContent(/Hangzhou/)
  },
}

// ---------------------------------------------------------------------------
// Size gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCascader },
    data() {
      return { regions }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCascader :options="regions" size="xs" placeholder="Extra Small" />
        <DzCascader :options="regions" size="sm" placeholder="Small" />
        <DzCascader :options="regions" size="md" placeholder="Medium" />
        <DzCascader :options="regions" size="lg" placeholder="Large" />
        <DzCascader :options="regions" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid state
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select a region',
  },
  render: args => ({
    components: { DzCascader },
    setup() {
      return { args }
    },
    template: '<DzCascader v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzCascader },
    setup() {
      return { args }
    },
    template: '<DzCascader v-bind="args" :value="[\'cn\', \'zj\', \'hz\']" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzCascader },
    data() {
      return { regions }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCascader :options="regions" placeholder="Outline" />
        <DzCascader :options="regions" variant="filled" :value="['us', 'ca', 'sf']" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — enabled / disabled / invalid (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the state DzCascader declares, shown against the enabled
 * control and the invalid one so the three renderings a form has to handle sit
 * together.
 *
 * The behavioural difference the paint hides: `disabled` also withdraws the
 * clear button (`showCleaner` requires an enabled, non-readonly control), so a
 * disabled cascader with a value offers no way to empty it — that is the
 * contract, and the play function pins it.
 */
export const States: Story = {
  render: () => ({
    components: { DzCascader },
    setup() {
      return { regions }
    },
    template: `
      <div class="grid max-w-4xl gap-6 lg:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled — with a value</p>
          <DzCascader
            :options="regions"
            :value="['cn', 'zj', 'hz']"
            aria-label="Enabled region"
            data-testid="csc-enabled"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled — same value</p>
          <DzCascader
            disabled
            :options="regions"
            :value="['cn', 'zj', 'hz']"
            aria-label="Disabled region"
            data-testid="csc-disabled"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Invalid</p>
          <DzCascader
            invalid
            error="Please select a region"
            :options="regions"
            aria-label="Invalid region"
            data-testid="csc-invalid"
          />
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('csc-enabled')
    const disabled = canvas.getByTestId('csc-disabled')
    const invalid = canvas.getByTestId('csc-invalid')

    // Root state attributes, which are what the styling contract targets.
    await expect(enabled).not.toHaveAttribute('data-disabled')
    await expect(enabled).not.toHaveAttribute('data-invalid')
    await expect(disabled).toHaveAttribute('data-disabled')
    await expect(disabled).toHaveAttribute('data-state', 'disabled')
    await expect(invalid).toHaveAttribute('data-invalid')

    // Disabled: the trigger is out of service and announced as such.
    const disabledTrigger = within(disabled).getByRole('combobox')
    await expect(disabledTrigger).toBeDisabled()
    await expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false')
    // …and the clear affordance is withdrawn, so the value cannot be emptied.
    await expect(within(disabled).queryByRole('button', { name: /clear/i })).toBeNull()

    // Enabled: same value, but the clear affordance IS offered and the panel opens.
    const enabledTrigger = within(enabled).getByRole('combobox')
    await expect(enabledTrigger).toBeEnabled()
    await expect(enabledTrigger).toHaveTextContent(/Hangzhou/)
    await expect(within(enabled).getByRole('button', { name: /clear/i })).toBeInTheDocument()
    await userEvent.click(enabledTrigger)
    await waitFor(() => expect(enabledTrigger).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(enabledTrigger).toHaveAttribute('aria-expanded', 'false'))

    // Invalid: announced on the combobox and explained in a live alert.
    const invalidTrigger = within(invalid).getByRole('combobox')
    await expect(invalidTrigger).toHaveAttribute('aria-invalid', 'true')
    await expect(within(invalid).getByRole('alert'))
      .toHaveTextContent('Please select a region')

    // A disabled OPTION is a separate axis: Germany is closed inside an
    // otherwise-live cascader.
    await userEvent.click(invalidTrigger)
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(1))
    const germany = screen.getAllByRole('option').find(el => el.textContent?.includes('Germany'))!
    await expect(germany).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(invalidTrigger).toHaveAttribute('aria-expanded', 'false'))
  },
}

// ---------------------------------------------------------------------------
// Accessibility — keyboard-only path selection (tier C `accessibility` item)
// ---------------------------------------------------------------------------

/**
 * The whole cascade driven from the keyboard, which is the case a
 * column-of-columns widget most easily gets wrong.
 *
 * ArrowDown on the closed trigger opens the panel with the first option active;
 * ArrowRight descends into a column; ArrowDown/ArrowUp move within one; Enter
 * commits a leaf and returns focus to the trigger. Every step is asserted
 * against the DOM focus and the committed value — no pointer is used.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Keyboard-Only Cascade',
  render: () => ({
    components: { DzCascader },
    data() {
      return { value: [] as string[], regions }
    },
    template: `
      <div class="max-w-sm space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Tab to the trigger, ArrowDown to open, ArrowRight to descend a level,
          ArrowUp/ArrowDown to move within a column, Enter to commit a leaf.
        </p>
        <DzCascader
          v-model:value="value"
          :options="regions"
          aria-label="Keyboard region cascade"
          placeholder="Select region"
          data-testid="csc-a11y"
        />
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Path: <strong data-testid="csc-path">{{ value.length ? value.join(' → ') : 'none' }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('csc-a11y')
    const trigger = within(root).getByRole('combobox', { name: 'Keyboard region cascade' })

    // The closed trigger advertises the popup it controls.
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).not.toHaveAttribute('aria-controls')

    // Reach it with Tab only.
    for (let i = 0; i < 6 && document.activeElement !== trigger; i++)
      await userEvent.tab()
    await expect(trigger).toHaveFocus()

    // ArrowDown opens the panel and wires `aria-controls` to it.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    await expect(trigger).toHaveAttribute('aria-controls')
    await waitFor(() =>
      expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeVisible(),
    )

    // ArrowRight descends into China's children; a second column appears.
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(screen.getByRole('listbox', { name: 'Level 2' })).toBeVisible(),
    )

    // ArrowRight again descends into Zhejiang's cities.
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(screen.getByRole('listbox', { name: 'Level 3' })).toBeVisible(),
    )

    // ArrowDown moves within the leaf column, Enter commits it.
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(canvas.getByTestId('csc-path')).toHaveTextContent('cn → zj → nb')
    await expect(trigger).toHaveTextContent(/Ningbo/)
  },
}

// ---------------------------------------------------------------------------
// Real world — shipping address region (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * Where a cascader actually earns its place: the country → state → city field of
 * a shipping form, wired to a label, a hint, and a submit summary that only
 * becomes valid once a full path is committed.
 *
 * The composition is the point — a bare trigger never shows that the committed
 * value is a *path* array, nor that clearing it puts the form back into its
 * incomplete state.
 */
export const RealWorldShippingRegion: Story = {
  name: 'Real World: Shipping Region',
  render: () => ({
    components: { DzCascader },
    data() {
      return { value: [] as string[], regions }
    },
    template: `
      <form class="max-w-sm space-y-4" @submit.prevent>
        <h3 class="text-base font-semibold">Shipping address</h3>
        <div class="space-y-1">
          <label id="csc-rw-label" class="block text-sm font-medium">Region</label>
          <DzCascader
            v-model:value="value"
            :options="regions"
            aria-labelledby="csc-rw-label"
            aria-describedby="csc-rw-hint"
            placeholder="Country / state / city"
            data-testid="csc-rw"
          />
          <p id="csc-rw-hint" class="text-xs text-[var(--dz-muted-foreground)]">
            Deliveries are only available to the listed cities.
          </p>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Will ship to:
          <strong data-testid="csc-rw-summary">{{ value.length === 3 ? value.join(' / ') : 'incomplete' }}</strong>
        </p>
        <button
          type="submit"
          class="rounded-[var(--dz-radius-md)] bg-[var(--dz-primary)] px-3 py-1.5 text-sm text-[var(--dz-primary-foreground)] disabled:opacity-50"
          :disabled="value.length !== 3"
          data-testid="csc-rw-submit"
        >Continue</button>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('csc-rw')
    const trigger = within(root).getByRole('combobox')

    // The field borrows its name from the visible label and its hint from the
    // description — the wiring a real form owes.
    await expect(trigger).toHaveAttribute('aria-labelledby', 'csc-rw-label')
    await expect(trigger.getAttribute('aria-describedby')).toContain('csc-rw-hint')

    // Nothing committed yet, so the form cannot advance.
    await expect(canvas.getByTestId('csc-rw-summary')).toHaveTextContent('incomplete')
    await expect(canvas.getByTestId('csc-rw-submit')).toBeDisabled()

    // Walk the cascade: USA → California → San Francisco.
    await userEvent.click(trigger)
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(1))
    await userEvent.click(
      screen.getAllByRole('option').find(el => el.textContent?.includes('USA'))!,
    )
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(2))
    await userEvent.click(
      screen.getAllByRole('option').find(el => el.textContent?.includes('California'))!,
    )
    await waitFor(() => expect(screen.getAllByRole('listbox').length).toBeGreaterThanOrEqual(3))
    await userEvent.click(
      screen.getAllByRole('option').find(el => el.textContent?.includes('San Francisco'))!,
    )

    // A full path commits, closes the panel, and unblocks the form.
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(canvas.getByTestId('csc-rw-summary')).toHaveTextContent('us / ca / sf')
    await expect(canvas.getByTestId('csc-rw-submit')).toBeEnabled()

    // Clearing puts the form back where it started.
    await userEvent.click(within(root).getByRole('button', { name: /clear/i }))
    await waitFor(() =>
      expect(canvas.getByTestId('csc-rw-summary')).toHaveTextContent('incomplete'),
    )
    await expect(canvas.getByTestId('csc-rw-submit')).toBeDisabled()
  },
}
