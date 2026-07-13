import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { DzScrollProgress } from '../../src/components/feedback'

/**
 * DzScrollProgress is a scroll-position progress indicator — a thin bar (or
 * compact corner ring) pinned to the top or bottom of the viewport that reflects
 * how far the reader has scrolled through a page or scroll container.
 *
 * It tracks scroll via a passive, rAF-throttled listener (the `useScrollProgress`
 * composable), recomputes on resize / content change, and clamps to 0–100. The
 * indicator is decorative-supplementary: it exposes `role="progressbar"` with
 * live value semantics but never takes focus.
 */
const meta = {
  title: 'Core/Feedback/DzScrollProgress',
  component: DzScrollProgress,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['bar', 'circular'],
      description: 'Visual display variant',
      table: { category: 'Appearance', defaultValue: { summary: 'bar' } },
    },
    position: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      description: 'Viewport edge the indicator is pinned to',
      table: { category: 'Appearance', defaultValue: { summary: 'top' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Diameter preset for the circular variant',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    thickness: {
      control: { type: 'number', min: 1, max: 16, step: 1 },
      description: 'Bar thickness / circular stroke width in px',
      table: { category: 'Appearance' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility', defaultValue: { summary: 'Page scroll progress' } },
    },
  },
  args: {
    variant: 'bar',
    position: 'top',
    tone: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof DzScrollProgress>

export default meta
type Story = StoryObj<typeof meta>

/** Tall filler content so there is something to scroll within the story frame. */
const FILLER = `
  <div class="space-y-4 max-w-2xl mx-auto py-8 px-4">
    <h2 class="text-xl font-semibold">Scroll this container</h2>
    <p v-for="n in 30" :key="n" class="text-sm text-[var(--dz-muted-foreground)] leading-relaxed">
      Paragraph {{ n }} — scroll up and down to watch the indicator track your reading
      position. The bar spans the pinned edge while the circular variant sits in the
      corner. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </div>
`

/**
 * A scoped, scrollable frame so the fixed indicator is captured inside the story
 * canvas rather than tracking the Storybook page itself.
 */
function scopedTemplate(indicator: string): string {
  return `
    <div ref="scrollRef" style="position: relative; height: 360px; overflow-y: auto; border border-[var(--dz-border)]: 1px solid var(--dz-border); border-radius: var(--dz-radius-md);" class="dz-scroll-progress-demo">
      ${indicator}
      ${FILLER}
    </div>
  `
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------

export const TopBar: Story = {
  name: 'Top Bar',
  render: args => ({
    components: { DzScrollProgress },
    setup() {
      const scrollRef = ref<HTMLElement | null>(null)
      return { args, scrollRef }
    },
    template: scopedTemplate(
      `<DzScrollProgress v-bind="args" position="top" :target="scrollRef" style="position: absolute;" />`,
    ),
  }),
}

// ---------------------------------------------------------------------------
// Bottom bar
// ---------------------------------------------------------------------------

export const BottomBar: Story = {
  name: 'Bottom Bar',
  render: () => ({
    components: { DzScrollProgress },
    setup() {
      const scrollRef = ref<HTMLElement | null>(null)
      return { scrollRef }
    },
    template: scopedTemplate(
      `<DzScrollProgress position="bottom" tone="success" :target="scrollRef" style="position: absolute;" />`,
    ),
  }),
}

// ---------------------------------------------------------------------------
// Circular
// ---------------------------------------------------------------------------

export const Circular: Story = {
  render: () => ({
    components: { DzScrollProgress },
    setup() {
      const scrollRef = ref<HTMLElement | null>(null)
      return { scrollRef }
    },
    template: scopedTemplate(
      `<DzScrollProgress variant="circular" tone="primary" size="lg" :target="scrollRef" style="position: absolute;" />`,
    ),
  }),
}

// ---------------------------------------------------------------------------
// Scoped container (custom slot UI)
// ---------------------------------------------------------------------------

export const ScopedContainer: Story = {
  name: 'Scoped Container (slot)',
  render: () => ({
    components: { DzScrollProgress },
    setup() {
      const scrollRef = ref<HTMLElement | null>(null)
      return { scrollRef }
    },
    template: scopedTemplate(`
      <DzScrollProgress :target="scrollRef" style="position: absolute;">
        <template #default="{ value }">
          <div style="display:flex; align-items:center; gap:8px; padding:4px 8px; background: var(--dz-muted);">
            <div style="flex:1; height:4px; border-radius:9999px; background: var(--dz-border);">
              <div :style="{ width: value + '%', height: '100%', borderRadius: '9999px', background: 'var(--dz-primary)' }" />
            </div>
            <span style="font-size:12px; min-width:3ch; text-align:right;">{{ Math.round(value) }}%</span>
          </div>
        </template>
      </DzScrollProgress>
    `),
  }),
}
