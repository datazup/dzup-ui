import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DzRunStatus } from '../../src/components/feedback/DzRunStatusBadge.types.ts'
import { expect, within } from 'storybook/test'
import { DzRunStatusBadge } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

const STATUSES: DzRunStatus[] = ['PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED']

/**
 * DzRunStatusBadge is an **app-specific** badge that maps a canonical run status
 * (`PENDING` · `RUNNING` · `PAUSED` · `COMPLETED` · `FAILED` · `CANCELLED`) to a
 * `--dz-status-*` token color and a title-cased, accessible label. It wraps
 * `DzBadge` and renders `role="status"` with an `aria-label` of
 * `"Run status: <Label>"`.
 *
 * > **Scope:** this component encodes datazup run-orchestration vocabulary, so it
 * > lives under **Core/Feedback/App-Specific** rather than the public family. See
 * > [Feedback Overview](?path=/docs/core-feedback-overview--docs) and TASK-X.4.
 */
const meta = {
  title: 'Core/Feedback/App-Specific/DzRunStatusBadge',
  component: DzRunStatusBadge,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    // Appearance
    status: {
      control: 'select',
      options: STATUSES,
      description: 'Canonical run status; selects the status token color + label',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Badge size (maps to DzBadge size)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
  },
  args: {
    status: 'RUNNING',
    size: 'md',
  },
} satisfies Meta<typeof DzRunStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzRunStatusBadge },
    setup() {
      return { args }
    },
    template: '<DzRunStatusBadge v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Status Gallery
// ---------------------------------------------------------------------------

export const AllStatuses: Story = {
  name: 'Status Gallery',
  render: () => ({
    components: { DzRunStatusBadge },
    setup() {
      return { STATUSES }
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <DzRunStatusBadge v-for="s in STATUSES" :key="s" :status="s" />
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
    components: { DzRunStatusBadge },
    template: `
      <div class="flex flex-wrap items-end gap-3">
        <DzRunStatusBadge v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" :size="size" status="RUNNING" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Label (default slot)
// ---------------------------------------------------------------------------

export const CustomLabel: Story = {
  name: 'Custom Label Slot',
  render: () => ({
    components: { DzRunStatusBadge },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <DzRunStatusBadge status="RUNNING">
          <template #default="{ label }">⏳ {{ label }}…</template>
        </DzRunStatusBadge>
        <DzRunStatusBadge status="COMPLETED">
          <template #default="{ label }">✓ {{ label }}</template>
        </DzRunStatusBadge>
        <DzRunStatusBadge status="FAILED">
          <template #default="{ label }">✕ {{ label }}</template>
        </DzRunStatusBadge>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role="status"',
  render: () => ({
    components: { DzRunStatusBadge },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Each badge renders <code>role="status"</code> with
          <code>aria-label="Run status: &lt;Label&gt;"</code>, so a status change is
          announced even when the visual color is the only other cue.
        </p>
        <div class="flex flex-wrap gap-3">
          <DzRunStatusBadge status="RUNNING" />
          <DzRunStatusBadge status="FAILED" />
        </div>
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
    components: { DzRunStatusBadge },
    setup() {
      return { STATUSES }
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <DzRunStatusBadge v-for="s in STATUSES" :key="s" :status="s" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Run List
// ---------------------------------------------------------------------------

export const RealWorldRunList: Story = {
  name: 'Real World: Run List',
  render: () => ({
    components: { DzRunStatusBadge },
    setup() {
      const runs = [
        { id: 'run_8f2a', name: 'Nightly ETL', status: 'COMPLETED' as DzRunStatus },
        { id: 'run_3c10', name: 'Model fine-tune', status: 'RUNNING' as DzRunStatus },
        { id: 'run_b7d4', name: 'Backfill 2024', status: 'PAUSED' as DzRunStatus },
        { id: 'run_91ee', name: 'Export report', status: 'FAILED' as DzRunStatus },
        { id: 'run_24aa', name: 'Daily digest', status: 'PENDING' as DzRunStatus },
      ]
      return { runs }
    },
    template: `
      <div class="max-w-md divide-y divide-[var(--dz-border)] rounded-lg border border-[var(--dz-border)]">
        <div v-for="run in runs" :key="run.id" class="flex items-center justify-between gap-4 p-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ run.name }}</p>
            <p class="font-mono text-xs text-[var(--dz-muted-foreground)]">{{ run.id }}</p>
          </div>
          <DzRunStatusBadge :status="run.status" size="sm" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive play() — asserts the accessible label + data-status
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Status Mapping',
  render: () => ({
    components: { DzRunStatusBadge },
    template: `<DzRunStatusBadge status="COMPLETED" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByRole('status')
    await expect(badge).toHaveAccessibleName('Run status: Completed')
    await expect(badge).toHaveTextContent('Completed')
    await expect(badge).toHaveAttribute('data-status', 'COMPLETED')
  },
}
