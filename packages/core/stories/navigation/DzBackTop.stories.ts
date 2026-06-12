import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { DzBackTop } from '../../src/components/navigation'
import { darkModeDecorator } from '../_shared'

/**
 * **DzBackTop** is a scroll-to-top affordance. It fades/slides in once the page
 * (or a target scroll container) has scrolled past `visibilityHeight`, and
 * smooth-scrolls back to the origin on click — respecting
 * `prefers-reduced-motion`. It is built on `DzFab`, so it shares the button
 * family's tone × variant appearance and elevation.
 *
 * The button is a real `<button>` with an accessible label (`'Back to top'` by
 * default). While hidden it is removed from the tab order and made inert.
 *
 * Status: **beta**.
 */
const meta = {
  title: 'Core/Navigation/DzBackTop',
  component: DzBackTop,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    visibilityHeight: {
      control: 'number',
      description: 'Scroll distance (px) before the button appears',
      table: { category: 'Behavior', defaultValue: { summary: '400' } },
    },
    duration: {
      control: 'number',
      description: 'Smooth-scroll duration (ms); 0 jumps instantly',
      table: { category: 'Behavior', defaultValue: { summary: '400' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone (delegated to DzFab)',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
      description: 'Visual style (delegated to DzFab)',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size (delegated to DzFab)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the button',
      table: { category: 'Accessibility', defaultValue: { summary: 'Back to top' } },
    },
  },
} satisfies Meta<typeof DzBackTop>

export default meta
type Story = StoryObj<typeof meta>

/** A tall block of filler content so the page is actually scrollable. */
function fillerTemplate(): string {
  return Array.from({ length: 30 })
    .map(
      (_, i) => `
        <p class="text-sm text-gray-500 max-w-prose">
          Paragraph ${i + 1}. Scroll the page down — the back-to-top button fades
          in once you pass the visibility threshold. Click it to glide back up.
        </p>`,
    )
    .join('\n')
}

// ---------------------------------------------------------------------------
// Default — window scroll, default 400px threshold
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: { visibilityHeight: 400 },
  render: args => ({
    components: { DzBackTop },
    setup() {
      return { args, filler: fillerTemplate() }
    },
    template: `
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Scroll down…</h2>
        <div class="space-y-4" v-html="filler" />
        <DzBackTop v-bind="args" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// CustomThreshold — appears almost immediately, primary tone
// ---------------------------------------------------------------------------

export const CustomThreshold: Story = {
  name: 'Custom threshold',
  args: { visibilityHeight: 100, tone: 'primary' },
  render: args => ({
    components: { DzBackTop },
    setup() {
      return { args, filler: fillerTemplate() }
    },
    template: `
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Appears after 100px</h2>
        <div class="space-y-4" v-html="filler" />
        <DzBackTop v-bind="args" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// InScrollContainer — anchored to an inner scroll area
// ---------------------------------------------------------------------------

export const InScrollContainer: Story = {
  name: 'In scroll container',
  render: () => ({
    components: { DzBackTop },
    setup() {
      const container = ref<HTMLElement | null>(null)
      return { container, filler: fillerTemplate() }
    },
    template: `
      <div
        ref="container"
        class="relative h-80 overflow-y-auto rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4"
      >
        <h2 class="text-xl font-semibold">Scroll inside this box…</h2>
        <div class="space-y-4" v-html="filler" />
        <DzBackTop
          :target="container ?? undefined"
          :visibility-height="150"
          class="!absolute"
        />
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
  args: { visibilityHeight: 200, tone: 'primary' },
  render: args => ({
    components: { DzBackTop },
    setup() {
      return { args, filler: fillerTemplate() }
    },
    template: `
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Scroll down…</h2>
        <div class="space-y-4" v-html="filler" />
        <DzBackTop v-bind="args" />
      </div>
    `,
  }),
}
