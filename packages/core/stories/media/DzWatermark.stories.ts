import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzWatermark } from '../../src/components/media'
import { a11yError, darkModeDecorator } from '../_shared'

/**
 * DzWatermark overlays a tiled, repeating text/image mark over its slotted
 * content — handy for confidential previews, trial/demo states, and shared
 * exports that need ownership marking.
 *
 * The mark is rasterized once to a canvas data URL and tiled via a repeating
 * CSS background, so it stays crisp on HiDPI screens. Colors are token-based:
 * the canvas draws in `--dz-watermark-color` and the layer's subtlety comes
 * from `--dz-watermark-opacity`.
 *
 * a11y: the overlay is `aria-hidden` and `pointer-events: none`, so it never
 * blocks interaction nor is read by screen readers. Opt into `observe` for
 * best-effort tamper resistance on confidential surfaces.
 *
 * @status experimental
 */
const meta = {
  title: 'Core/Media/DzWatermark',
  component: DzWatermark,
  tags: ['autodocs', 'status:experimental'],
  parameters: {
    // Media enforced (TASK-DS-13).
    ...a11yError,
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'Watermark text (string or string[] for multiple lines)',
      table: { category: 'Content' },
    },
    image: {
      control: 'text',
      description: 'Image URL rendered as the mark (overrides content)',
      table: { category: 'Content' },
    },
    rotate: {
      control: { type: 'number', min: -90, max: 90, step: 1 },
      description: 'Rotation of each mark in degrees',
      table: { category: 'Appearance', defaultValue: { summary: '-22' } },
    },
    gap: {
      control: 'object',
      description: 'Spacing between marks in px (number or [x, y])',
      table: { category: 'Appearance', defaultValue: { summary: '[100, 100]' } },
    },
    fontSize: {
      control: { type: 'number', min: 8, max: 64, step: 1 },
      description: 'Font size in px for text marks',
      table: { category: 'Appearance', defaultValue: { summary: '16' } },
    },
    color: {
      control: 'text',
      description: 'Mark color (token-based by default)',
      table: { category: 'Appearance', defaultValue: { summary: 'var(--dz-watermark-color)' } },
    },
    zIndex: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Stacking order of the overlay',
      table: { category: 'Appearance', defaultValue: { summary: '9' } },
    },
    observe: {
      control: 'boolean',
      description: 'Re-apply the overlay if removed/tampered (adds a MutationObserver)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    content: 'CONFIDENTIAL',
    rotate: -22,
    fontSize: 16,
  },
} satisfies Meta<typeof DzWatermark>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = `
  <div class="max-w-md rounded-lg border border-[var(--dz-border)] p-6 space-y-3">
    <h3 class="text-lg font-semibold">Q3 Revenue Forecast</h3>
    <p class="text-sm text-[var(--dz-muted-foreground)]">
      Projected revenue grows 14% QoQ on the back of the new self-serve tier.
      This preview is shared under NDA and should not be redistributed.
    </p>
    <ul class="text-sm text-[var(--dz-muted-foreground)] list-disc pl-5 space-y-1">
      <li>New logos: 128</li>
      <li>Net retention: 117%</li>
      <li>Pipeline coverage: 3.2x</li>
    </ul>
  </div>
`

// ---------------------------------------------------------------------------
// Text Mark
// ---------------------------------------------------------------------------

export const TextMark: Story = {
  name: 'Text Mark',
  render: args => ({
    components: { DzWatermark },
    setup() {
      return { args, SAMPLE }
    },
    template: `<DzWatermark v-bind="args"><div v-html="SAMPLE" /></DzWatermark>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Wrapper div (root) must be in the DOM
    const wrapper = canvasElement.firstElementChild
    expect(wrapper).toBeTruthy()
    // The overlay div must be aria-hidden since watermarks are purely decorative
    const overlay = canvasElement.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeTruthy()
    // Slotted content must be rendered inside the watermark wrapper
    const headings = canvas.getAllByText(/Revenue|Forecast/i)
    expect(headings.length).toBeGreaterThan(0)
  },
}

// ---------------------------------------------------------------------------
// Multi-line
// ---------------------------------------------------------------------------

export const MultiLine: Story = {
  name: 'Multi-line',
  args: {
    content: ['Acme Inc.', 'Do not distribute'],
    rotate: -30,
    gap: [60, 60],
  },
  render: args => ({
    components: { DzWatermark },
    setup() {
      return { args, SAMPLE }
    },
    template: `<DzWatermark v-bind="args"><div v-html="SAMPLE" /></DzWatermark>`,
  }),
}

// ---------------------------------------------------------------------------
// Over Image
// ---------------------------------------------------------------------------

export const OverImage: Story = {
  name: 'Over Image',
  args: {
    content: 'PREVIEW',
    rotate: -22,
    fontSize: 20,
  },
  render: args => ({
    components: { DzWatermark },
    setup() {
      return { args }
    },
    template: `
      <DzWatermark v-bind="args" class="inline-block">
        <img
          src="https://placehold.co/480x300/1f2937/ffffff?text=Shared+Asset"
          alt="Shared design asset"
          class="block rounded-lg"
        />
      </DzWatermark>
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
    components: { DzWatermark },
    setup() {
      return { SAMPLE }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          <code>--dz-watermark-color</code> resolves to <code>--dz-muted-foreground</code>,
          so the mark re-tints for the dark surface on its own — no per-theme
          <code>color</code> override is needed.
        </p>
        <DzWatermark content="CONFIDENTIAL" :rotate="-22" :font-size="16">
          <div v-html="SAMPLE" />
        </DzWatermark>
      </div>
    `,
  }),
}
