import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import { DzRelativeTime } from '../../src/components/typography'
import { darkModeDecorator } from '../_shared'

/**
 * DzRelativeTime renders a timestamp as a live, localised phrase ("2 minutes
 * ago") and keeps it fresh with an age-adaptive timer — every second under a
 * minute, every minute under an hour, every hour under a day, then it stops.
 *
 * It is built on the platform `Intl.RelativeTimeFormat`, so it is dependency-free
 * and locale-aware. The text lives in a `<time datetime="…">` element for machine
 * readability; the full absolute date is exposed to assistive tech and, by
 * default, shown in a tooltip on hover/focus. Use it in activity feeds, run
 * histories, and comment threads.
 */
const meta = {
  title: 'Core/Typography/DzRelativeTime',
  component: DzRelativeTime,
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
  argTypes: {
    value: {
      control: 'date',
      description: 'The timestamp to render (Date, epoch ms, or ISO string)',
      table: { category: 'Content' },
    },
    mode: {
      control: 'inline-radio',
      options: ['relative', 'absolute'],
      description: 'Live relative phrase or a static absolute date',
      table: { category: 'Behavior', defaultValue: { summary: 'relative' } },
    },
    locale: {
      control: 'text',
      description: 'Locale override (defaults to the runtime/document locale)',
      table: { category: 'Behavior' },
    },
    updateInterval: {
      control: { type: 'number', min: 0 },
      description: 'Fixed refresh interval (ms); omit to auto-derive, null to disable',
      table: { category: 'Behavior' },
    },
    tooltip: {
      control: 'boolean',
      description: 'Wrap in a tooltip showing the full absolute date',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic colour tone',
      table: { category: 'Appearance', defaultValue: { summary: 'muted' } },
    },
  },
  args: {
    mode: 'relative',
    tooltip: true,
    tone: 'muted',
  },
} satisfies Meta<typeof DzRelativeTime>

export default meta
type Story = StoryObj<typeof meta>

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// ---------------------------------------------------------------------------
// Just now — a fresh timestamp ticks every second
// ---------------------------------------------------------------------------

export const JustNow: Story = {
  args: { value: Date.now() - 3 * SECOND },
  play: async ({ canvasElement }) => {
    const time = canvasElement.querySelector('time')
    await expect(time).toBeInTheDocument()
    await expect(time!.tagName.toLowerCase()).toBe('time')
    const datetime = time!.getAttribute('datetime')
    await expect(datetime).toBeTruthy()
    await expect(time).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// Minutes ago — updates every minute
// ---------------------------------------------------------------------------

export const MinutesAgo: Story = {
  args: { value: Date.now() - 5 * MINUTE },
}

// ---------------------------------------------------------------------------
// Absolute mode — a static, fully-spelled date
// ---------------------------------------------------------------------------

export const AbsoluteMode: Story = {
  args: { value: Date.now() - 3 * DAY, mode: 'absolute' },
}

// ---------------------------------------------------------------------------
// Localized — the same instant rendered in another locale
// ---------------------------------------------------------------------------

export const Localized: Story = {
  args: { value: Date.now() - 2 * HOUR, locale: 'fr-FR' },
}

// ---------------------------------------------------------------------------
// In a feed — relative timestamps beside activity rows
// ---------------------------------------------------------------------------

export const InFeed: Story = {
  render: args => ({
    components: { DzRelativeTime },
    setup() {
      const now = Date.now()
      const events = [
        { id: 1, label: 'Pipeline “nightly-etl” succeeded', at: now - 12 * SECOND },
        { id: 2, label: 'User “sam” commented on run #4821', at: now - 8 * MINUTE },
        { id: 3, label: 'Deploy to staging finished', at: now - 3 * HOUR },
        { id: 4, label: 'Schema migration applied', at: now - 2 * DAY },
      ]
      return { args, events }
    },
    template: `
      <ul class="flex w-[28rem] flex-col gap-2">
        <li
          v-for="event in events"
          :key="event.id"
          class="flex items-center justify-between gap-4 rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] px-4 py-3"
        >
          <span class="text-[var(--dz-foreground)]">{{ event.label }}</span>
          <DzRelativeTime v-bind="args" :value="event.at" />
        </li>
      </ul>
    `,
  }),
}
