import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TeamMemberStatus } from '../../src/components/feedback/TeamMemberBadge.types.ts'
import { expect, within } from 'storybook/test'
import { TeamMemberBadge } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

/**
 * TeamMemberBadge renders a colored status dot + role label for a team
 * participant. The dot color is derived from the live participant status
 * (`idle` · `active` · `completed` · `failed`) via design token CSS variables.
 *
 * The badge renders `role="status"` with an `aria-label` of `"<role> – <status>"`
 * so screen readers announce status transitions without requiring a visual
 * color distinction.
 *
 * > **Scope:** encodes datazup multi-agent runtime vocabulary; lives under
 * > **Core/Feedback/App-Specific**. See TeamMemberBadge.types.ts.
 */

const STATUSES: TeamMemberStatus[] = ['idle', 'active', 'completed', 'failed']

const meta = {
  title: 'Core/Feedback/App-Specific/TeamMemberBadge',
  component: TeamMemberBadge,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    participantId: {
      control: 'text',
      description: 'Unique participant ID within the team run',
      table: { category: 'Identity' },
    },
    role: {
      control: 'text',
      description: 'Participant role label (e.g. "planner", "executor")',
      table: { category: 'Identity' },
    },
    status: {
      control: 'select',
      options: STATUSES,
      description: 'Live participant status; controls dot color token',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Badge size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
  },
  args: {
    participantId: 'p-001',
    role: 'planner',
    status: 'active',
    size: 'md',
  },
} satisfies Meta<typeof TeamMemberBadge>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { TeamMemberBadge },
    setup() {
      return { args }
    },
    template: '<TeamMemberBadge v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Status Gallery
// ---------------------------------------------------------------------------

export const AllStatuses: Story = {
  name: 'Status Gallery',
  render: () => ({
    components: { TeamMemberBadge },
    setup() {
      return { STATUSES }
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <TeamMemberBadge
          v-for="s in STATUSES"
          :key="s"
          :participant-id="'p-' + s"
          role="executor"
          :status="s"
        />
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
    components: { TeamMemberBadge },
    template: `
      <div class="flex flex-wrap items-end gap-3">
        <TeamMemberBadge
          v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']"
          :key="size"
          :size="size"
          participant-id="p-demo"
          role="planner"
          status="active"
        />
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
    components: { TeamMemberBadge },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <TeamMemberBadge participant-id="p-1" role="planner" status="active">
          <template #default="{ role, status }">{{ role }} ({{ status }})</template>
        </TeamMemberBadge>
        <TeamMemberBadge participant-id="p-2" role="executor" status="failed">
          <template #default="{ role }">✕ {{ role }}</template>
        </TeamMemberBadge>
        <TeamMemberBadge participant-id="p-3" role="reviewer" status="completed">
          <template #default="{ role }">✓ {{ role }}</template>
        </TeamMemberBadge>
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
    components: { TeamMemberBadge },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Each badge renders <code>role="status"</code> with
          <code>aria-label="&lt;role&gt; – &lt;status&gt;"</code>,
          so a status transition is announced even when color is the only other cue.
        </p>
        <div class="flex flex-wrap gap-3">
          <TeamMemberBadge participant-id="p-a" role="planner" status="active" />
          <TeamMemberBadge participant-id="p-b" role="executor" status="failed" />
          <TeamMemberBadge participant-id="p-c" role="reviewer" status="completed" />
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
    components: { TeamMemberBadge },
    setup() {
      return { STATUSES }
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <TeamMemberBadge
          v-for="s in STATUSES"
          :key="s"
          :participant-id="'p-' + s"
          role="executor"
          :status="s"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Team Participant List
// ---------------------------------------------------------------------------

export const RealWorldTeamPanel: Story = {
  name: 'Real World: Team Participant Panel',
  render: () => ({
    components: { TeamMemberBadge },
    setup() {
      const members = [
        { id: 'p-001', role: 'planner', status: 'completed' as TeamMemberStatus },
        { id: 'p-002', role: 'executor', status: 'active' as TeamMemberStatus },
        { id: 'p-003', role: 'executor', status: 'active' as TeamMemberStatus },
        { id: 'p-004', role: 'reviewer', status: 'idle' as TeamMemberStatus },
        { id: 'p-005', role: 'executor', status: 'failed' as TeamMemberStatus },
      ]
      return { members }
    },
    template: `
      <div class="max-w-xs divide-y divide-[var(--dz-border)] rounded-lg border border-[var(--dz-border)]">
        <div v-for="m in members" :key="m.id" class="flex items-center justify-between gap-4 p-3">
          <p class="font-mono text-xs text-[var(--dz-muted-foreground)]">{{ m.id }}</p>
          <TeamMemberBadge :participant-id="m.id" :role="m.role" :status="m.status" size="sm" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive play() — asserts accessible label + data attrs
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Status Mapping',
  render: () => ({
    components: { TeamMemberBadge },
    template: `<TeamMemberBadge participant-id="p-test" role="executor" status="active" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByRole('status')
    await expect(badge).toHaveAccessibleName('executor – active')
    await expect(badge).toHaveTextContent('executor')
    await expect(badge).toHaveAttribute('data-status', 'active')
    await expect(badge).toHaveAttribute('data-participant-id', 'p-test')
  },
}
