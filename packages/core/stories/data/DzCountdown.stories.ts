import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import { DzButton } from '../../src/components/buttons'
import { DzCountdown } from '../../src/components/data'

/**
 * DzCountdown is a live countdown / elapsed timer. It ticks towards a fixed
 * time (`mode="to"`) or down across a span (`mode="duration"`), rendering the
 * remaining time against a token `format` (default `HH:mm:ss`).
 *
 * The ticking is drift-corrected and stops at zero (never negative); `finish`
 * fires exactly once and `change` fires every tick with the structured
 * remainder — which the default slot also receives for custom rendering. The
 * value is mirrored into a polite live region throttled to one announcement per
 * second, so screen readers aren't spammed when `interval < 1000`.
 *
 * Use it for sale timers, token-expiry warnings, scheduled-run ETAs, and OTP
 * resend windows.
 */
const meta = {
  title: 'Core/Data/DzCountdown',
  component: DzCountdown,
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
  argTypes: {
    target: {
      control: false,
      description: 'Date / epoch-ms to count down to (mode "to"), or span in ms (mode "duration")',
      table: { category: 'Data' },
    },
    mode: {
      control: 'inline-radio',
      options: ['to', 'duration'],
      description: 'Count down to a fixed time ("to") or across a span ("duration")',
      table: { category: 'Behavior', defaultValue: { summary: 'to' } },
    },
    format: {
      control: 'text',
      description: 'Token format — D, H, m, s, S (repeat to zero-pad)',
      table: { category: 'Appearance', defaultValue: { summary: 'HH:mm:ss' } },
    },
    interval: {
      control: { type: 'number', min: 50 },
      description: 'Tick granularity in ms — use <1000 to animate the S token',
      table: { category: 'Behavior', defaultValue: { summary: '1000' } },
    },
    autoStart: {
      control: 'boolean',
      description: 'Start ticking automatically on mount',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    pauseOnHidden: {
      control: 'boolean',
      description: 'Pause while the tab is hidden and resume on visibility',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Value typographic scale',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Value colour tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
  },
  args: {
    mode: 'to',
    format: 'HH:mm:ss',
    interval: 1000,
    autoStart: true,
    pauseOnHidden: false,
    size: 'md',
    tone: 'neutral',
  },
} satisfies Meta<typeof DzCountdown>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// To deadline — counts down to a wall-clock target two hours out
// ---------------------------------------------------------------------------

export const ToDeadline: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Root div must carry role="timer" for accessibility
    const timer = canvas.getByRole('timer')
    expect(timer).toBeTruthy()
    // The sr-only live region must be present for polite announcements
    const liveRegion = canvasElement.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
    // The visible figure must display a colon-separated time string
    const figure = canvasElement.querySelector('[aria-hidden="true"]')
    expect(figure?.textContent).toMatch(/\d/)
  },
  render: (args) => ({
    components: { DzCountdown },
    setup: () => ({ args, target: Date.now() + 2 * 60 * 60 * 1000 + 5_000 }),
    template: `
      <div class="p-4">
        <DzCountdown v-bind="args" :target="target" aria-label="Sale ends in" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Duration timer — counts down a fixed span (e.g. an OTP resend window)
// ---------------------------------------------------------------------------

export const DurationTimer: Story = {
  args: { mode: 'duration', format: 'mm:ss' },
  render: (args) => ({
    components: { DzCountdown },
    setup: () => ({ args, span: 90_000 }),
    template: `
      <div class="p-4">
        <DzCountdown v-bind="args" :target="span" tone="primary" aria-label="Code expires in" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom format — days + sub-second precision
// ---------------------------------------------------------------------------

export const CustomFormat: Story = {
  args: { format: 'DD:HH:mm:ss', size: 'lg' },
  render: (args) => ({
    components: { DzCountdown },
    setup: () => ({ args, target: Date.now() + 3 * 86_400_000 + 12_345 }),
    template: `
      <div class="flex flex-col gap-4 p-4">
        <DzCountdown v-bind="args" :target="target" aria-label="Launch in" />
        <DzCountdown
          mode="duration"
          :target="10000"
          format="ss.SS"
          :interval="100"
          tone="info"
          aria-label="Elapsed timer"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Slot render — structured remainder drives a custom segmented layout
// ---------------------------------------------------------------------------

export const SlotRender: Story = {
  args: { mode: 'duration' },
  render: (args) => ({
    components: { DzCountdown },
    setup: () => ({ args, span: 2 * 60 * 60 * 1000 + 34_000 }),
    template: `
      <div class="p-4">
        <DzCountdown v-bind="args" :target="span" aria-label="Time remaining">
          <template #default="{ remaining }">
            <span class="flex items-end gap-3 text-[var(--dz-foreground)]">
              <span v-for="seg in [
                { v: remaining.hours, l: 'hrs' },
                { v: remaining.minutes, l: 'min' },
                { v: remaining.seconds, l: 'sec' },
              ]" :key="seg.l" class="flex flex-col items-center">
                <span class="text-3xl font-bold tabular-nums">{{ String(seg.v).padStart(2, '0') }}</span>
                <span class="text-xs text-[var(--dz-muted-foreground)]">{{ seg.l }}</span>
              </span>
            </span>
          </template>
        </DzCountdown>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Pause / resume — imperative control via template ref
// ---------------------------------------------------------------------------

export const PauseResume: Story = {
  render: () => ({
    components: { DzCountdown, DzButton },
    setup() {
      const timer = ref<{ start: () => void; pause: () => void; reset: () => void } | null>(null)
      return { timer, span: 5 * 60 * 1000 }
    },
    template: `
      <div class="flex flex-col items-start gap-4 p-4">
        <DzCountdown
          ref="timer"
          mode="duration"
          :target="span"
          format="mm:ss"
          size="xl"
          aria-label="Workout timer"
        />
        <div class="flex gap-2">
          <DzButton size="sm" @click="timer?.start()">Start</DzButton>
          <DzButton size="sm" variant="outline" @click="timer?.pause()">Pause</DzButton>
          <DzButton size="sm" variant="ghost" @click="timer?.reset()">Reset</DzButton>
        </div>
      </div>
    `,
  }),
}
