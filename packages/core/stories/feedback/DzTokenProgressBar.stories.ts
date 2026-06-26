import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzTokenProgressBar } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

/**
 * DzTokenProgressBar is an **app-specific** usage bar for LLM token budgets. It
 * computes `percent = min(100, used / total * 100)` and, when `showWarning`
 * (default `true`), flips the fill color to amber at ≥ 70 % and red at ≥ 90 %.
 *
 * It renders `role="progressbar"` with `aria-valuenow={used}` / `aria-valuemax={total}`
 * and exposes a label slot with `{ percent, used, total, state }`.
 *
 * > **Scope:** datazup token-budget concept → documented under
 * > **Core/Feedback/App-Specific** (see TASK-X.4). For generic progress, use
 * > [DzProgress](?path=/docs/core-feedback-dzprogress--docs).
 */
const meta = {
  title: 'Core/Feedback/App-Specific/DzTokenProgressBar',
  component: DzTokenProgressBar,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    // Behavior
    used: {
      control: { type: 'number', min: 0 },
      description: 'Tokens consumed so far',
      table: { category: 'Behavior' },
    },
    total: {
      control: { type: 'number', min: 1 },
      description: 'Token budget (denominator); must be > 0',
      table: { category: 'Behavior' },
    },
    showWarning: {
      control: 'boolean',
      description: 'Apply threshold colors at 70% (amber) and 90% (red)',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
  },
  args: {
    used: 4500,
    total: 10000,
    showWarning: true,
  },
} satisfies Meta<typeof DzTokenProgressBar>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTokenProgressBar },
    setup() {
      return { args }
    },
    template: '<div class="max-w-sm"><DzTokenProgressBar v-bind="args" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// Threshold states
// ---------------------------------------------------------------------------

export const Thresholds: Story = {
  name: 'Threshold States',
  render: () => ({
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm space-y-5">
        <div class="space-y-1">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Normal (&lt; 70%)</p>
          <DzTokenProgressBar :used="3000" :total="10000" />
        </div>
        <div class="space-y-1">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Warn (≥ 70%) — amber</p>
          <DzTokenProgressBar :used="7500" :total="10000" />
        </div>
        <div class="space-y-1">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Danger (≥ 90%) — red</p>
          <DzTokenProgressBar :used="9400" :total="10000" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Label slot
// ---------------------------------------------------------------------------

export const WithLabel: Story = {
  name: 'With Label Slot',
  render: () => ({
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm space-y-4">
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-[var(--dz-muted-foreground)]">
            <span>Token usage</span>
            <span>7,500 / 10,000</span>
          </div>
          <DzTokenProgressBar :used="7500" :total="10000" />
        </div>
        <DzTokenProgressBar :used="9200" :total="10000">
          <template #default="{ percent }">
            <span class="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[var(--dz-foreground)]">
              {{ Math.round(percent) }}%
            </span>
          </template>
        </DzTokenProgressBar>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Warnings disabled
// ---------------------------------------------------------------------------

export const WarningsDisabled: Story = {
  name: 'Warnings Disabled',
  render: () => ({
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm space-y-3">
        <p class="text-xs text-[var(--dz-muted-foreground)]">
          With <code>:show-warning="false"</code> the bar stays primary regardless of usage.
        </p>
        <DzTokenProgressBar :used="9500" :total="10000" :show-warning="false" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

export const EdgeCases: Story = {
  name: 'Edge Cases (clamping)',
  render: () => ({
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm space-y-5">
        <div class="space-y-1">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Empty (0 / 10000)</p>
          <DzTokenProgressBar :used="0" :total="10000" />
        </div>
        <div class="space-y-1">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Over budget — clamps to 100% (12000 / 10000)</p>
          <DzTokenProgressBar :used="12000" :total="10000" />
        </div>
        <div class="space-y-1">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Invalid total — renders 0% (500 / 0)</p>
          <DzTokenProgressBar :used="500" :total="0" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ARIA Progressbar',
  render: () => ({
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Renders <code>role="progressbar"</code> with <code>aria-valuenow</code> (used),
          <code>aria-valuemin="0"</code>, and <code>aria-valuemax</code> (total), so the
          raw token counts — not just the percentage — are exposed to assistive tech.
        </p>
        <DzTokenProgressBar :used="7500" :total="10000" />
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
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm space-y-4">
        <DzTokenProgressBar :used="3000" :total="10000" />
        <DzTokenProgressBar :used="7500" :total="10000" />
        <DzTokenProgressBar :used="9400" :total="10000" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Usage panel
// ---------------------------------------------------------------------------

export const RealWorldUsagePanel: Story = {
  name: 'Real World: Usage Panel',
  render: () => ({
    components: { DzTokenProgressBar },
    template: `
      <div class="max-w-sm rounded-lg border border-[var(--dz-border)] p-4 space-y-3">
        <div class="flex items-baseline justify-between">
          <p class="text-sm font-medium">Monthly token budget</p>
          <p class="text-xs text-[var(--dz-muted-foreground)]">resets in 6 days</p>
        </div>
        <DzTokenProgressBar :used="92000" :total="100000" />
        <p class="text-xs text-[var(--dz-muted-foreground)]">92,000 / 100,000 tokens used (92%)</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive play() — asserts ARIA values + threshold state
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Threshold State',
  render: () => ({
    components: { DzTokenProgressBar },
    template: '<div class="max-w-sm"><DzTokenProgressBar :used="9400" :total="10000" /></div>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar')
    await expect(bar).toHaveAttribute('aria-valuenow', '9400')
    await expect(bar).toHaveAttribute('aria-valuemax', '10000')
    await expect(bar).toHaveAttribute('aria-valuemin', '0')
    // 94% → danger threshold
    await expect(bar).toHaveAttribute('data-state', 'danger')
  },
}
