import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzTag } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

/**
 * DzTag is a categorization label component, semantically for classification
 * and filtering (as opposed to DzChip which represents user input/actions).
 *
 * It supports three visual variants (`solid`, `outline`, `subtle`),
 * six semantic tones, three sizes, and optional close/dismiss behavior.
 */

const meta = {
  title: 'Core/Data/DzTag',
  component: DzTag,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'subtle' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    closable: {
      control: 'boolean',
      description: 'Whether the tag can be dismissed/closed',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'subtle',
    tone: 'neutral',
    size: 'md',
    closable: false,
    disabled: false,
  },
} satisfies Meta<typeof DzTag>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTag },
    setup() {
      return { args }
    },
    template: '<DzTag v-bind="args">Tag</DzTag>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="flex flex-wrap gap-3 items-center">
        <DzTag variant="solid">Solid</DzTag>
        <DzTag variant="outline">Outline</DzTag>
        <DzTag variant="subtle">Subtle</DzTag>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="flex items-center gap-3">
        <DzTag size="sm">Small</DzTag>
        <DzTag size="md">Medium</DzTag>
        <DzTag size="lg">Large</DzTag>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="space-y-4">
        <div v-for="v in ['solid', 'outline', 'subtle']" :key="v">
          <p class="text-sm font-medium mb-2 capitalize">{{ v }}</p>
          <div class="flex flex-wrap gap-3">
            <DzTag :variant="v" tone="neutral">Neutral</DzTag>
            <DzTag :variant="v" tone="primary">Primary</DzTag>
            <DzTag :variant="v" tone="success">Success</DzTag>
            <DzTag :variant="v" tone="warning">Warning</DzTag>
            <DzTag :variant="v" tone="danger">Danger</DzTag>
            <DzTag :variant="v" tone="info">Info</DzTag>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Closable
// ---------------------------------------------------------------------------

export const Closable: Story = {
  name: 'Closable Tags',
  render: () => ({
    components: { DzTag },
    data() {
      return {
        categories: ['Frontend', 'Backend', 'DevOps', 'Design', 'QA'],
      }
    },
    template: `
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <DzTag
            v-for="cat in categories"
            :key="cat"
            closable
            tone="primary"
            variant="outline"
            @close="categories = categories.filter(c => c !== cat)"
          >{{ cat }}</DzTag>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">{{ categories.length }} tags remaining</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All 5 tags present initially.
    await expect(canvas.getByText('Frontend')).toBeVisible()
    await expect(canvas.getByText(/5 tags remaining/i)).toBeInTheDocument()

    // Click close on the first tag — Frontend disappears.
    const closeBtns = canvas.getAllByRole('button')
    await userEvent.click(closeBtns[0])
    await waitFor(() => expect(canvas.queryByText('Frontend')).not.toBeInTheDocument())
    await expect(canvas.getByText(/4 tags remaining/i)).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    closable: true,
  },
  render: args => ({
    components: { DzTag },
    setup() {
      return { args }
    },
    template: '<DzTag v-bind="args">Disabled Tag</DzTag>',
  }),
}

// ---------------------------------------------------------------------------
// With Prefix Slot
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Prefix Slot',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="flex flex-wrap gap-3">
        <DzTag tone="danger" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Bug
        </DzTag>
        <DzTag tone="success" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Feature
        </DzTag>
        <DzTag tone="info" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Documentation
        </DzTag>
        <DzTag tone="warning" variant="subtle">
          <template #prefix>
            <span class="text-xs">&#9679;</span>
          </template>
          Enhancement
        </DzTag>
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
    components: { DzTag },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <DzTag variant="solid" tone="primary">Solid</DzTag>
          <DzTag variant="outline" tone="primary">Outline</DzTag>
          <DzTag variant="subtle" tone="primary">Subtle</DzTag>
        </div>
        <div class="flex flex-wrap gap-3">
          <DzTag tone="success">Success</DzTag>
          <DzTag tone="warning">Warning</DzTag>
          <DzTag tone="danger">Danger</DzTag>
          <DzTag tone="info">Info</DzTag>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus & Dismiss',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Closable tags include a dismiss button in the tab order.
          Press Enter or Space on the close button to remove the tag.
          Disabled tags are excluded from the tab order.
        </p>
        <div class="flex flex-wrap gap-3">
          <DzTag closable tone="primary">Focusable</DzTag>
          <DzTag closable tone="success">Also Focusable</DzTag>
          <DzTag closable disabled tone="neutral">Disabled (Skipped)</DzTag>
          <DzTag closable tone="danger">Focusable</DzTag>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Issue Labels
// ---------------------------------------------------------------------------

export const RealWorldIssueLabels: Story = {
  name: 'Real World: Issue Labels',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="max-w-lg space-y-4">
        <div class="border border-[var(--dz-border)] rounded-lg p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium">Fix accordion animation glitch</p>
              <p class="text-sm text-[var(--dz-muted-foreground)]">#342 opened 2 hours ago by alice</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <DzTag tone="danger" variant="subtle" size="sm">bug</DzTag>
            <DzTag tone="primary" variant="subtle" size="sm">component: accordion</DzTag>
            <DzTag tone="warning" variant="subtle" size="sm">priority: high</DzTag>
          </div>
        </div>
        <div class="border border-[var(--dz-border)] rounded-lg p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium">Add keyboard shortcut support to DzTree</p>
              <p class="text-sm text-[var(--dz-muted-foreground)]">#338 opened 1 day ago by bob</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <DzTag tone="success" variant="subtle" size="sm">feature</DzTag>
            <DzTag tone="primary" variant="subtle" size="sm">component: tree</DzTag>
            <DzTag tone="info" variant="subtle" size="sm">accessibility</DzTag>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Article Categories
// ---------------------------------------------------------------------------

export const RealWorldCategories: Story = {
  name: 'Real World: Article Categories',
  render: () => ({
    components: { DzTag },
    template: `
      <div class="max-w-sm space-y-4">
        <div class="space-y-2">
          <h3 class="font-semibold">Building a Design System in 2026</h3>
          <p class="text-sm text-[var(--dz-muted-foreground)]">A guide to modern component architecture with Vue 3 and Tailwind CSS 4.</p>
          <div class="flex flex-wrap gap-2">
            <DzTag size="sm" variant="outline" tone="neutral">Design Systems</DzTag>
            <DzTag size="sm" variant="outline" tone="neutral">Vue.js</DzTag>
            <DzTag size="sm" variant="outline" tone="neutral">Tailwind CSS</DzTag>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — idle vs disabled (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the one state DzTag declares, and it changes three things at
 * once: the root stamps `data-state="disabled"` and `data-disabled`, the close
 * button becomes `disabled`, and the Delete/Backspace shortcut stops emitting
 * `close`.
 *
 * The play function drives all three. The disabled tag is asserted rather than
 * clicked: `dz-disabled-control` sets `pointer-events: none` on the root, so a
 * pointer event would never reach it in a real browser either.
 */
export const States: Story = {
  render: () => ({
    components: { DzTag },
    data() {
      return { idleCloses: 0, disabledCloses: 0 }
    },
    template: `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <DzTag
            closable
            tone="primary"
            aria-label="Idle tag"
            data-testid="tag-idle"
            @close="idleCloses++"
          >Idle</DzTag>
          <DzTag
            closable
            disabled
            tone="primary"
            aria-label="Disabled tag"
            data-testid="tag-disabled"
            @close="disabledCloses++"
          >Disabled</DzTag>
          <DzTag tone="neutral" data-testid="tag-static">Not closable</DzTag>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          close events — idle: <strong data-testid="idle-closes">{{ idleCloses }}</strong>,
          disabled: <strong data-testid="disabled-closes">{{ disabledCloses }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const idle = canvas.getByTestId('tag-idle')
    const disabled = canvas.getByTestId('tag-disabled')

    // State is exposed on the anatomy attributes, not only in the paint.
    await expect(idle).toHaveAttribute('data-state', 'idle')
    await expect(idle).not.toHaveAttribute('data-disabled')
    await expect(disabled).toHaveAttribute('data-state', 'disabled')
    await expect(disabled).toHaveAttribute('data-disabled')

    // A closable tag is focusable; the disabled one keeps its tabindex so the
    // state is discoverable rather than silently skipped.
    await expect(idle).toHaveAttribute('tabindex', '0')
    await expect(disabled).toHaveAttribute('tabindex', '0')

    // The disabled tag's remove button is disabled; the idle one is not.
    await expect(within(disabled).getByRole('button')).toBeDisabled()
    const idleClose = within(idle).getByRole('button')
    await expect(idleClose).toBeEnabled()

    // Pointer path: the idle tag emits `close`.
    await userEvent.click(idleClose)
    await waitFor(() => expect(canvas.getByTestId('idle-closes')).toHaveTextContent('1'))

    // Keyboard path: Backspace on a focused closable tag also emits `close`…
    idle.focus()
    await expect(idle).toHaveFocus()
    await userEvent.keyboard('{Backspace}')
    await waitFor(() => expect(canvas.getByTestId('idle-closes')).toHaveTextContent('2'))

    // …and is suppressed while disabled.
    disabled.focus()
    await userEvent.keyboard('{Backspace}')
    await expect(canvas.getByTestId('disabled-closes')).toHaveTextContent('0')

    // A non-closable tag has no remove control and is not in the tab order.
    const staticTag = canvas.getByTestId('tag-static')
    await expect(within(staticTag).queryByRole('button')).toBeNull()
    await expect(staticTag).not.toHaveAttribute('tabindex')
  },
}
