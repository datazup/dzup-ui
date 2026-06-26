import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzCopyButton } from '../../src/components/buttons'
import { darkModeDecorator } from '../_shared'

/**
 * DzCopyButton copies a value to the clipboard and shows visual feedback.
 *
 * On click it writes `value` to the clipboard (Clipboard API with a `<textarea>`
 * fallback), swaps the copy glyph for a checkmark, emits `copied`, and toggles
 * `data-state="copied"` for ~2s before resetting to `idle`. When no `ariaLabel`
 * is supplied the accessible name flips between "Copy to clipboard" and "Copied".
 */
const meta = {
  title: 'Core/Buttons/DzCopyButton',
  component: DzCopyButton,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'text', 'link'],
      description: 'Visual style variant (fill / border treatment)',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone (flips to success while copied)',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'sm' } },
    },
    label: {
      control: 'text',
      description: 'Optional text shown next to the copy icon (idle state)',
      table: { category: 'Appearance' },
    },
    copiedLabel: {
      control: 'text',
      description: 'Optional text shown next to the checkmark after a copy',
      table: { category: 'Appearance' },
    },
    // Behavior
    value: {
      control: 'text',
      description: 'The string written to the clipboard on click',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents copying',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label. Defaults to "Copy to clipboard" / "Copied".',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    value: 'npm install @dzup-ui/core',
    variant: 'outline',
    tone: 'neutral',
    size: 'sm',
    disabled: false,
  },
} satisfies Meta<typeof DzCopyButton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default (icon-only)
// ---------------------------------------------------------------------------

export const Default: Story = {}

// ---------------------------------------------------------------------------
// With Label
// ---------------------------------------------------------------------------

export const WithLabel: Story = {
  name: 'With Label',
  args: {
    label: 'Copy',
    copiedLabel: 'Copied!',
  },
  render: args => ({
    components: { DzCopyButton },
    setup() {
      return { args }
    },
    template: '<DzCopyButton v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="flex items-end gap-4">
        <div class="text-center">
          <DzCopyButton value="xs" size="xs" />
          <p class="text-xs mt-1 text-gray-500">xs</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="sm" size="sm" />
          <p class="text-xs mt-1 text-gray-500">sm</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="md" size="md" />
          <p class="text-xs mt-1 text-gray-500">md</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="lg" size="lg" />
          <p class="text-xs mt-1 text-gray-500">lg</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="xl" size="xl" />
          <p class="text-xs mt-1 text-gray-500">xl</p>
        </div>
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
    components: { DzCopyButton },
    template: `
      <div class="flex items-end gap-4">
        <div class="text-center">
          <DzCopyButton value="solid" variant="solid" />
          <p class="text-xs mt-1 text-gray-500">solid</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="outline" variant="outline" />
          <p class="text-xs mt-1 text-gray-500">outline</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="ghost" variant="ghost" />
          <p class="text-xs mt-1 text-gray-500">ghost</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="text" variant="text" />
          <p class="text-xs mt-1 text-gray-500">text</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="link" variant="link" />
          <p class="text-xs mt-1 text-gray-500">link</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="flex items-end gap-4">
        <div class="text-center">
          <DzCopyButton value="neutral" variant="solid" tone="neutral" />
          <p class="text-xs mt-1 text-gray-500">neutral</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="primary" variant="solid" tone="primary" />
          <p class="text-xs mt-1 text-gray-500">primary</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="success" variant="solid" tone="success" />
          <p class="text-xs mt-1 text-gray-500">success</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="warning" variant="solid" tone="warning" />
          <p class="text-xs mt-1 text-gray-500">warning</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="danger" variant="solid" tone="danger" />
          <p class="text-xs mt-1 text-gray-500">danger</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="info" variant="solid" tone="info" />
          <p class="text-xs mt-1 text-gray-500">info</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="flex gap-4 items-center">
        <div class="text-center">
          <DzCopyButton value="enabled" label="Copy" />
          <p class="text-xs mt-1 text-gray-500">idle</p>
        </div>
        <div class="text-center">
          <DzCopyButton value="disabled" label="Copy" disabled />
          <p class="text-xs mt-1 text-gray-500">disabled</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Slot Content
// ---------------------------------------------------------------------------

export const CustomContent: Story = {
  name: 'Custom Icon + Label Slot',
  render: () => ({
    components: { DzCopyButton },
    template: `
      <DzCopyButton value="custom-slot-value" class="w-auto gap-1.5 px-2">
        <template #default="{ copied }">
          <span class="text-sm">{{ copied ? 'Copied to clipboard' : 'Copy snippet' }}</span>
        </template>
      </DzCopyButton>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="flex gap-4 items-center">
        <DzCopyButton value="dark-icon-only" />
        <DzCopyButton value="dark-with-label" label="Copy" copiedLabel="Copied!" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: announced copied state
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Announced State',
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="space-y-3 max-w-sm">
        <p class="text-sm text-gray-500">
          With no <code>ariaLabel</code> the accessible name flips from
          "Copy to clipboard" to "Copied" so screen readers announce the result.
          Pass <code>ariaLabel</code> to override.
        </p>
        <div class="flex gap-4">
          <DzCopyButton value="auto-label" />
          <DzCopyButton value="custom-label" aria-label="Copy installation command" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Code snippet / install command
// ---------------------------------------------------------------------------

export const RealWorldCodeSnippet: Story = {
  name: 'Real World: Copy Install Command',
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="flex items-center justify-between gap-3 max-w-md rounded-md border border-[var(--dz-border)] bg-[var(--dz-surface)] px-3 py-2 font-mono text-sm">
        <code>npm install @dzup-ui/core</code>
        <DzCopyButton value="npm install @dzup-ui/core" aria-label="Copy install command" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: API key row
// ---------------------------------------------------------------------------

export const RealWorldApiKey: Story = {
  name: 'Real World: API Key',
  render: () => ({
    components: { DzCopyButton },
    template: `
      <div class="flex items-center justify-between gap-3 max-w-md rounded-md border border-[var(--dz-border)] px-3 py-2">
        <div>
          <p class="text-xs text-[var(--dz-muted-foreground)]">Secret key</p>
          <code class="text-sm">sk_live_••••••••••••4242</code>
        </div>
        <DzCopyButton value="sk_live_demo_key_4242" label="Copy" copiedLabel="Copied" aria-label="Copy secret key" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: copy → copied → reset (play)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Copy Flow',
  args: {
    value: 'copied-via-play',
    label: 'Copy',
    copiedLabel: 'Copied!',
  },
  render: args => ({
    components: { DzCopyButton },
    setup() {
      return { args }
    },
    template: '<DzCopyButton v-bind="args" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    // Idle state before interaction.
    await expect(button).toHaveAttribute('data-state', 'idle')

    // Click copies the value and flips to the copied state.
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('data-state', 'copied'))
    await expect(button).toHaveAccessibleName(/copied/i)

    // After the 2s timeout it resets back to idle.
    await waitFor(() => expect(button).toHaveAttribute('data-state', 'idle'), {
      timeout: 3000,
    })
  },
}
