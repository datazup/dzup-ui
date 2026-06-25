import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DzColorModeToggle } from '../../src/components/navigation'
import { DzThemeProvider } from '../../src/providers'

/**
 * **DzColorModeToggle** is a ready-made light / dark / system theme switch. It
 * binds to the existing `DzThemeProvider` via `useTheme` — it introduces *no*
 * parallel theme store, so persistence, live `prefers-color-scheme` following,
 * and FOUC suppression (ADR-15) are all handled by the provider.
 *
 * Three variants cover the common patterns:
 * - `icon` — a single button that cycles modes.
 * - `switch` — a DzSwitch (light ⇄ dark) reflecting the resolved mode.
 * - `segmented` — an explicit light / dark / system control.
 *
 * Every variant renders a real, labelled control (`button` / `role="switch"`)
 * and announces the active mode through a polite live region (WCAG AA).
 *
 * > All stories are wrapped in a `DzThemeProvider`, which the component
 * > requires as an ancestor.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Navigation/DzColorModeToggle',
  component: DzColorModeToggle,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['icon', 'switch', 'segmented'],
      description: 'Rendering style of the toggle',
      table: { category: 'Appearance', defaultValue: { summary: 'icon' } },
    },
    showSystem: {
      control: 'boolean',
      description: 'Include the system (follow OS) option',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size (delegated to the underlying control)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Override the auto-generated accessible label',
      table: { category: 'Accessibility' },
    },
  },
} satisfies Meta<typeof DzColorModeToggle>

export default meta
type Story = StoryObj<typeof meta>

/** Wrap every story in a DzThemeProvider — the toggle requires it as an ancestor. */
const withThemeProvider: Decorator = () => ({
  components: { DzThemeProvider },
  template: '<DzThemeProvider><story /></DzThemeProvider>',
})

// ---------------------------------------------------------------------------
// IconCycle — single button that cycles modes
// ---------------------------------------------------------------------------

export const IconCycle: Story = {
  name: 'Icon (cycle)',
  decorators: [withThemeProvider],
  args: { variant: 'icon', showSystem: true },
  render: (args) => ({
    components: { DzColorModeToggle },
    setup: () => ({ args }),
    template: `
      <div class="flex items-center gap-3">
        <DzColorModeToggle v-bind="args" />
        <span class="text-sm text-[var(--dz-muted-foreground)]">Click to cycle light → dark → system</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The cycle button is a button with an accessible label.
    const btn = canvas.getByRole('button')
    await expect(btn).toBeInTheDocument()
    await expect(btn).toBeVisible()

    // Click to cycle the mode — the button remains in the DOM after cycling.
    await userEvent.click(btn)
    await expect(btn).toBeInTheDocument()

    // Click again — still interactive.
    await userEvent.click(btn)
    await expect(btn).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// SwitchStyle — DzSwitch-style light ⇄ dark
// ---------------------------------------------------------------------------

export const SwitchStyle: Story = {
  name: 'Switch',
  decorators: [withThemeProvider],
  args: { variant: 'switch' },
  render: (args) => ({
    components: { DzColorModeToggle },
    setup: () => ({ args }),
    template: '<DzColorModeToggle v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Segmented — explicit light / dark / system
// ---------------------------------------------------------------------------

export const Segmented: Story = {
  decorators: [withThemeProvider],
  args: { variant: 'segmented', showSystem: true },
  render: (args) => ({
    components: { DzColorModeToggle },
    setup: () => ({ args }),
    template: '<DzColorModeToggle v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// WithoutSystem — light ⇄ dark only (no system option)
// ---------------------------------------------------------------------------

export const WithoutSystem: Story = {
  name: 'Without system',
  decorators: [withThemeProvider],
  args: { variant: 'segmented', showSystem: false },
  render: (args) => ({
    components: { DzColorModeToggle },
    setup: () => ({ args }),
    template: `
      <div class="flex flex-col gap-4">
        <DzColorModeToggle v-bind="args" />
        <DzColorModeToggle variant="icon" :show-system="false" />
      </div>
    `,
  }),
}
