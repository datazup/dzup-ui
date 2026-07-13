import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DzQRCode } from '../../src/components/media'

/**
 * DzQRCode renders a value as a token-styled QR code (SVG). It supports
 * error-correction levels, a centered logo (via the `icon` prop or `#logo`
 * slot), and `loading` / `expired` status overlays — handy for share links,
 * 2FA enrolment, and desktop→mobile handoff.
 *
 * Module and background colors default to the `--dz-foreground` /
 * `--dz-background` design tokens and can be overridden per instance.
 *
 * a11y: the root is `role="img"`; set `aria-label` to describe the code's
 * purpose* (e.g. "Link to the docs"), never the raw encoded payload.
 *
 * @status experimental
 */
const meta = {
  title: 'Core/Media/DzQRCode',
  component: DzQRCode,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    // Appearance
    value: {
      control: 'text',
      description: 'Value to encode (URL, token, contact string, …)',
      table: { category: 'Appearance' },
    },
    size: {
      control: { type: 'number', min: 80, max: 400, step: 8 },
      description: 'Rendered size in pixels',
      table: { category: 'Appearance', defaultValue: { summary: '160' } },
    },
    errorLevel: {
      control: 'select',
      options: ['L', 'M', 'Q', 'H'],
      description: 'Error-correction level (higher tolerates more occlusion)',
      table: { category: 'Appearance', defaultValue: { summary: 'M' } },
    },
    color: {
      control: 'text',
      description: 'Module (foreground) color',
      table: { category: 'Appearance', defaultValue: { summary: 'var(--dz-foreground)' } },
    },
    background: {
      control: 'text',
      description: 'Background color',
      table: { category: 'Appearance', defaultValue: { summary: 'var(--dz-background)' } },
    },
    margin: {
      control: { type: 'number', min: 0, max: 8, step: 1 },
      description: 'Quiet-zone size in modules',
      table: { category: 'Appearance', defaultValue: { summary: '4' } },
    },
    icon: {
      control: 'text',
      description: 'URL of a centered logo image (use error-level "H")',
      table: { category: 'Appearance' },
    },
    // Behavior
    status: {
      control: 'select',
      options: ['active', 'loading', 'expired'],
      description: 'Lifecycle status driving the overlays',
      table: { category: 'Behavior', defaultValue: { summary: 'active' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label describing the code purpose',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    value: 'https://dzup.dev',
    size: 160,
    errorLevel: 'M',
    status: 'active',
    ariaLabel: 'Link to the dzup documentation',
  },
} satisfies Meta<typeof DzQRCode>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzQRCode },
    setup() {
      return { args }
    },
    template: '<DzQRCode v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// With Logo
// ---------------------------------------------------------------------------

const LOGO_SRC
  = `data:image/svg+xml;utf8,${
    encodeURIComponent(
      // token-check-disable-next-line — a data: URI is parsed outside the document, so var(--dz-*) cannot resolve inside it.
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5">'
      + '<circle cx="12" cy="12" r="10"/></svg>',
    )}`

export const WithLogo: Story = {
  name: 'With Logo',
  args: {
    value: 'https://dzup.dev/2fa/enrol',
    errorLevel: 'H',
    icon: LOGO_SRC,
    size: 180,
    ariaLabel: 'Two-factor authentication enrolment code',
  },
  render: args => ({
    components: { DzQRCode },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          A centered logo overlays the code. Use <code>error-level="H"</code> so the
          code remains scannable despite the occlusion.
        </p>
        <DzQRCode v-bind="args" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Error Levels
// ---------------------------------------------------------------------------

export const ErrorLevels: Story = {
  name: 'Error Levels',
  render: () => ({
    components: { DzQRCode },
    template: `
      <div class="flex flex-wrap gap-6 items-start">
        <div v-for="level in ['L', 'M', 'Q', 'H']" :key="level" class="text-center space-y-2">
          <p class="text-sm font-medium">Level {{ level }}</p>
          <DzQRCode
            value="https://dzup.dev"
            :error-level="level"
            :size="140"
            :aria-label="'QR code at error level ' + level"
          />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Expired State
// ---------------------------------------------------------------------------

export const ExpiredState: Story = {
  name: 'Expired State',
  args: {
    value: 'https://dzup.dev/share/abc123',
    status: 'expired',
    ariaLabel: 'Expired share link QR code',
  },
  render: args => ({
    components: { DzQRCode },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          When <code>status="expired"</code> an overlay covers the code with a
          refresh action that emits <code>@refresh</code>.
        </p>
        <DzQRCode v-bind="args" @refresh="() => {}" />
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /refresh/i })
    await expect(button).toBeInTheDocument()
    await userEvent.click(button)
    await expect(args.value).toBe('https://dzup.dev/share/abc123')
  },
}

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------

export const LoadingState: Story = {
  name: 'Loading State',
  args: {
    status: 'loading',
    ariaLabel: 'QR code loading',
  },
  render: args => ({
    components: { DzQRCode },
    setup() {
      return { args }
    },
    template: '<DzQRCode v-bind="args" />',
  }),
}
