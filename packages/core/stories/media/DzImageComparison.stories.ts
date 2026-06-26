import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import { DzImageComparison } from '../../src/components/media'

// Two deterministic, contrasting images so the reveal is obvious. picsum's
// grayscale + blur filters give a clear "before (raw) / after (edited)" story.
const BEFORE = 'https://picsum.photos/seed/dzcompare/800/500?grayscale'
const AFTER = 'https://picsum.photos/seed/dzcompare/800/500'

/**
 * DzImageComparison is a draggable before/after reveal slider. A base
 * ("before") image fills the frame while a clipped ("after") image is revealed
 * up to a divider you can drag, click, or operate from the keyboard.
 *
 * The grip is a single `role="slider"` widget: focus it and use Arrow keys to
 * nudge, Shift+Arrow to jump by 10, and Home/End for the extremes.
 * `v-model:position` (0–100) reflects the percentage of the after image shown.
 */
const meta = {
  title: 'Core/Media/DzImageComparison',
  component: DzImageComparison,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    beforeSrc: {
      control: 'text',
      description: 'Base ("before") image URL',
      table: { category: 'Content' },
    },
    afterSrc: {
      control: 'text',
      description: 'Revealed ("after") image URL',
      table: { category: 'Content' },
    },
    beforeAlt: {
      control: 'text',
      description: 'Alt text for the before image',
      table: { category: 'Content' },
    },
    afterAlt: {
      control: 'text',
      description: 'Alt text for the after image',
      table: { category: 'Content' },
    },
    beforeLabel: {
      control: 'text',
      description: 'Caption chip over the before image',
      table: { category: 'Content' },
    },
    afterLabel: {
      control: 'text',
      description: 'Caption chip over the after image',
      table: { category: 'Content' },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Axis the divider travels along',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    position: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Divider position / percent of the after image revealed (v-model)',
      table: { category: 'State', defaultValue: { summary: '50' } },
    },
    step: {
      control: 'number',
      description: 'Keyboard nudge increment for Arrow keys',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable pointer and keyboard interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the slider grip',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    beforeSrc: BEFORE,
    afterSrc: AFTER,
    beforeAlt: 'Original, unedited photo',
    afterAlt: 'Color-graded edit of the same photo',
    orientation: 'horizontal',
    position: 50,
    step: 1,
    disabled: false,
  },
} satisfies Meta<typeof DzImageComparison>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Horizontal (default)
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Slider grip must carry role="slider"
    const slider = canvas.getByRole('slider')
    await expect(slider).toBeInTheDocument()

    // Default position is 50 — aria-valuenow should reflect that
    await expect(slider).toHaveAttribute('aria-valuenow', '50')
    await expect(slider).toHaveAttribute('aria-valuemin', '0')
    await expect(slider).toHaveAttribute('aria-valuemax', '100')

    // Focus the grip and press ArrowRight — position should increase
    slider.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => {
      const now = Number(slider.getAttribute('aria-valuenow'))
      expect(now).toBeGreaterThan(50)
    })
  },
  render: (args) => ({
    components: { DzImageComparison },
    setup() {
      return { args }
    },
    template: '<div class="w-[32rem] max-w-full"><DzImageComparison v-bind="args" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { DzImageComparison },
    setup() {
      return { args }
    },
    template: '<div class="w-[32rem] max-w-full"><DzImageComparison v-bind="args" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// With Labels
// ---------------------------------------------------------------------------

export const WithLabels: Story = {
  args: { beforeLabel: 'Before', afterLabel: 'After' },
  render: (args) => ({
    components: { DzImageComparison },
    setup() {
      return { args }
    },
    template: '<div class="w-[32rem] max-w-full"><DzImageComparison v-bind="args" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// Custom Handle
// ---------------------------------------------------------------------------

export const CustomHandle: Story = {
  render: (args) => ({
    components: { DzImageComparison },
    setup() {
      return { args }
    },
    template: `
      <div class="w-[32rem] max-w-full">
        <DzImageComparison v-bind="args">
          <template #handle="{ position }">
            <span class="text-xs font-semibold tabular-nums">{{ Math.round(position) }}%</span>
          </template>
        </DzImageComparison>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Controlled (v-model)
// ---------------------------------------------------------------------------

export const Controlled: Story = {
  render: (args) => ({
    components: { DzImageComparison },
    setup() {
      const pos = ref(50)
      return { args, pos }
    },
    template: `
      <div class="w-[32rem] max-w-full space-y-4">
        <DzImageComparison v-bind="args" v-model:position="pos" />
        <div class="flex items-center gap-3">
          <input type="range" min="0" max="100" v-model.number="pos" class="flex-1" />
          <span class="text-sm tabular-nums w-12 text-right">{{ Math.round(pos) }}%</span>
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-1 text-sm rounded border" @click="pos = 0">Before</button>
          <button class="px-3 py-1 text-sm rounded border" @click="pos = 50">Split</button>
          <button class="px-3 py-1 text-sm rounded border" @click="pos = 100">After</button>
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
  args: { beforeLabel: 'Raw', afterLabel: 'Edited' },
  render: (args) => ({
    components: { DzImageComparison },
    setup() {
      return { args }
    },
    template: '<div class="w-[32rem] max-w-full"><DzImageComparison v-bind="args" /></div>',
  }),
}
