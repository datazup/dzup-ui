import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { CoordinatorPattern } from '../../src/components/feedback/GovernanceBadge.types.ts'
import { expect, within } from 'storybook/test'
import { GovernanceBadge } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

const PATTERNS: CoordinatorPattern[] = [
  'supervisor',
  'contract_net',
  'blackboard',
  'peer_to_peer',
  'council',
]

/**
 * GovernanceBadge renders the coordinator pattern governing a team run
 * (`supervisor` · `contract_net` · `blackboard` · `peer_to_peer` · `council`)
 * as an accessible pill with a pattern-specific color token.
 *
 * The badge exposes `role="img"` with an `aria-label` of
 * `"Coordinator pattern: <Pattern Label>"` so screen readers can convey the
 * pattern even when the sole visual cue is color.
 *
 * > **Scope:** encodes datazup multi-agent vocabulary; lives under
 * > **Core/Feedback/App-Specific**. See GovernanceBadge.types.ts.
 */
const meta = {
  title: 'Core/Feedback/App-Specific/GovernanceBadge',
  component: GovernanceBadge,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    pattern: {
      control: 'select',
      options: PATTERNS,
      description: 'Coordinator pattern; determines the token color and accessible label',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Badge size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
  },
  args: {
    pattern: 'supervisor',
    size: 'md',
    variant: 'solid',
  },
} satisfies Meta<typeof GovernanceBadge>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { GovernanceBadge },
    setup() {
      return { args }
    },
    template: '<GovernanceBadge v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Pattern Gallery
// ---------------------------------------------------------------------------

export const AllPatterns: Story = {
  name: 'Pattern Gallery',
  render: () => ({
    components: { GovernanceBadge },
    setup() {
      return { PATTERNS }
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <GovernanceBadge v-for="p in PATTERNS" :key="p" :pattern="p" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { GovernanceBadge },
    template: `
      <div class="space-y-4">
        <div v-for="variant in ['solid', 'outline', 'subtle']" :key="variant" class="flex flex-wrap items-center gap-3">
          <GovernanceBadge v-for="p in ['supervisor', 'contract_net', 'blackboard', 'peer_to_peer', 'council']" :key="p" :pattern="p" :variant="variant" />
        </div>
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
    components: { GovernanceBadge },
    template: `
      <div class="flex flex-wrap items-end gap-3">
        <GovernanceBadge v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" :size="size" pattern="supervisor" />
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
    components: { GovernanceBadge },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <GovernanceBadge pattern="supervisor">
          <template #default="{ label }">⚡ {{ label }}</template>
        </GovernanceBadge>
        <GovernanceBadge pattern="council">
          <template #default="{ label }">🏛 {{ label }}</template>
        </GovernanceBadge>
        <GovernanceBadge pattern="peer_to_peer">
          <template #default="{ label }">🤝 {{ label }}</template>
        </GovernanceBadge>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role="img"',
  render: () => ({
    components: { GovernanceBadge },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Each badge renders <code>role="img"</code> with
          <code>aria-label="Coordinator pattern: &lt;Label&gt;"</code>,
          so the pattern is announced even when only the color differs.
        </p>
        <div class="flex flex-wrap gap-3">
          <GovernanceBadge pattern="supervisor" />
          <GovernanceBadge pattern="contract_net" />
          <GovernanceBadge pattern="council" />
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
    components: { GovernanceBadge },
    setup() {
      return { PATTERNS }
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <GovernanceBadge v-for="p in PATTERNS" :key="p" :pattern="p" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Team Run Header
// ---------------------------------------------------------------------------

export const RealWorldTeamRunHeader: Story = {
  name: 'Real World: Team Run Header',
  render: () => ({
    components: { GovernanceBadge },
    setup() {
      const runs = [
        {
          id: 'run_8f2a',
          name: 'Nightly ETL pipeline',
          pattern: 'supervisor' as CoordinatorPattern,
        },
        {
          id: 'run_3c10',
          name: 'Contract bid evaluation',
          pattern: 'contract_net' as CoordinatorPattern,
        },
        {
          id: 'run_b7d4',
          name: 'Shared context reasoning',
          pattern: 'blackboard' as CoordinatorPattern,
        },
        {
          id: 'run_91ee',
          name: 'P2P data reconciliation',
          pattern: 'peer_to_peer' as CoordinatorPattern,
        },
        { id: 'run_24aa', name: 'Policy deliberation', pattern: 'council' as CoordinatorPattern },
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
          <GovernanceBadge :pattern="run.pattern" size="sm" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive play() — asserts accessible label + data-pattern
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Pattern Mapping',
  render: () => ({
    components: { GovernanceBadge },
    template: `<GovernanceBadge pattern="council" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByRole('img')
    await expect(badge).toHaveAccessibleName('Coordinator pattern: Council')
    await expect(badge).toHaveTextContent('Council')
    await expect(badge).toHaveAttribute('data-pattern', 'council')
  },
}
