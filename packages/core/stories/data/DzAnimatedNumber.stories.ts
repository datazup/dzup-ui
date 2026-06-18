import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import { DzAnimatedNumber } from '../../src/components/data'

/**
 * DzAnimatedNumber tweens a figure from its previous value to the next whenever
 * `value` changes, formatting each frame through `Intl.NumberFormat` (currency,
 * percent, decimals via `format`). The first animation counts up from `from`
 * (default `0`); with `startOnView` it waits until scrolled into view.
 *
 * It handles the concerns a naive count-up misses: `prefers-reduced-motion`
 * snaps straight to the target, the counting digits are `aria-hidden`, and a
 * visually-hidden polite live region announces only the settled final value so
 * screen-reader users aren't flooded mid-count.
 */
const meta = {
  title: 'Core/Data/DzAnimatedNumber',
  component: DzAnimatedNumber,
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
  argTypes: {
    value: {
      control: { type: 'number' },
      description: 'Target value — animates from the previous value on change',
      table: { category: 'Value' },
    },
    from: {
      control: { type: 'number' },
      description: 'Origin the first count-up starts from',
      table: { category: 'Value', defaultValue: { summary: '0' } },
    },
    duration: {
      control: { type: 'number', min: 0, step: 100 },
      description: 'Animation duration in ms (0 snaps with no animation)',
      table: { category: 'Behavior', defaultValue: { summary: '1000' } },
    },
    easing: {
      control: 'select',
      options: ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce'],
      description: 'Easing curve — mirrors the --dz-ease-* tokens',
      table: { category: 'Behavior', defaultValue: { summary: 'ease-out' } },
    },
    startOnView: {
      control: 'boolean',
      description: 'Begin the first animation only once scrolled into view',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size — scales the figure',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic colour tone of the figure',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
  },
  args: {
    value: 12_345,
    from: 0,
    duration: 1500,
    easing: 'ease-out',
    startOnView: false,
    size: 'md',
    tone: 'neutral',
  },
} satisfies Meta<typeof DzAnimatedNumber>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Integer — a plain count-up with a re-roll button to retrigger the animation
// ---------------------------------------------------------------------------

export const Integer: Story = {
  render: args => ({
    components: { DzAnimatedNumber },
    setup() {
      const value = ref(args.value)
      const reroll = (): void => {
        value.value = Math.floor(1000 + Math.random() * 90_000)
      }
      return { args, value, reroll }
    },
    template: `
      <div class="flex flex-col items-start gap-4 p-6">
        <DzAnimatedNumber v-bind="args" :value="value" aria-label="Active users" />
        <button
          type="button"
          class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] px-3 py-1.5 text-[length:var(--dz-text-sm)] text-[var(--dz-foreground)]"
          @click="reroll"
        >
          Animate to a new value
        </button>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Currency — Intl currency formatting with a tone + suffix
// ---------------------------------------------------------------------------

export const Currency: Story = {
  args: { value: 48_290.75, tone: 'success', size: 'lg' },
  render: args => ({
    components: { DzAnimatedNumber },
    setup() {
      const value = ref(args.value)
      const bump = (): void => {
        value.value = Math.round((20_000 + Math.random() * 80_000) * 100) / 100
      }
      return { args, value, bump }
    },
    template: `
      <div class="flex flex-col items-start gap-4 p-6">
        <DzAnimatedNumber
          v-bind="args"
          :value="value"
          :format="{ style: 'currency', currency: 'USD' }"
          locale="en-US"
          aria-label="Monthly revenue"
        >
          <template #suffix>
            <span class="text-[length:var(--dz-text-sm)]">/mo</span>
          </template>
        </DzAnimatedNumber>
        <button
          type="button"
          class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] px-3 py-1.5 text-[length:var(--dz-text-sm)] text-[var(--dz-foreground)]"
          @click="bump"
        >
          Recalculate
        </button>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Percent — Intl percent style (value is a 0..1 fraction)
// ---------------------------------------------------------------------------

export const Percent: Story = {
  args: { value: 0.732, tone: 'primary', from: 0 },
  render: args => ({
    components: { DzAnimatedNumber },
    setup() {
      const value = ref(args.value)
      const reroll = (): void => {
        value.value = Math.round(Math.random() * 1000) / 1000
      }
      return { args, value, reroll }
    },
    template: `
      <div class="flex flex-col items-start gap-4 p-6">
        <DzAnimatedNumber
          v-bind="args"
          :value="value"
          :format="{ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }"
          locale="en-US"
          aria-label="Completion rate"
        />
        <button
          type="button"
          class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] px-3 py-1.5 text-[length:var(--dz-text-sm)] text-[var(--dz-foreground)]"
          @click="reroll"
        >
          New rate
        </button>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// OnScroll — the count-up only begins once the figure scrolls into view
// ---------------------------------------------------------------------------

export const OnScroll: Story = {
  name: 'On Scroll',
  args: { startOnView: true, value: 1_000_000, duration: 2000, size: 'xl' },
  render: args => ({
    components: { DzAnimatedNumber },
    setup: () => ({ args }),
    template: `
      <div class="h-[320px] overflow-auto rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)]">
        <div class="flex h-[280px] items-center justify-center text-[var(--dz-muted-foreground)]">
          ↓ Scroll down to trigger the count-up
        </div>
        <div class="flex flex-col items-center gap-2 p-8">
          <DzAnimatedNumber
            v-bind="args"
            :format="{ notation: 'standard' }"
            locale="en-US"
            aria-label="Downloads"
          />
          <span class="text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]">Total downloads</span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// ReducedMotion — with OS "reduce motion" on, the figure snaps (no tween)
// ---------------------------------------------------------------------------

export const ReducedMotion: Story = {
  name: 'Reduced Motion',
  args: { value: 9_876, duration: 3000 },
  render: args => ({
    components: { DzAnimatedNumber },
    setup() {
      const value = ref(args.value)
      const reroll = (): void => {
        value.value = Math.floor(1000 + Math.random() * 90_000)
      }
      return { args, value, reroll }
    },
    template: `
      <div class="flex flex-col items-start gap-4 p-6">
        <p class="max-w-prose text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]">
          With your OS set to <strong>Reduce motion</strong>, DzAnimatedNumber snaps
          straight to the target value with no tween — try toggling the setting and
          re-triggering below.
        </p>
        <DzAnimatedNumber v-bind="args" :value="value" aria-label="Reduced-motion sample" />
        <button
          type="button"
          class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] px-3 py-1.5 text-[length:var(--dz-text-sm)] text-[var(--dz-foreground)]"
          @click="reroll"
        >
          Animate to a new value
        </button>
      </div>
    `,
  }),
}
