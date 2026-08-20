import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DzTourStep } from '../../src/components/overlays'
import { expect, screen, userEvent, within } from 'storybook/test'
import { DzButton } from '../../src/components/buttons'
import { DzTour } from '../../src/components/overlays'
import { a11yError, darkModeDecorator } from '../_shared'

const steps: DzTourStep[] = [
  {
    target: '#tour-create',
    title: 'Create a project',
    description: 'Start here to spin up a new workspace for your team.',
    placement: 'bottom',
  },
  {
    target: '#tour-invite',
    title: 'Invite teammates',
    description: 'Share the workspace and assign roles to collaborators.',
    placement: 'bottom',
  },
  {
    target: '#tour-settings',
    title: 'Tune your settings',
    description: 'Configure integrations, tokens, and notifications here.',
    placement: 'top',
  },
]

/** Shared demo toolbar whose buttons are the tour targets. */
const demoToolbar = `
  <div class="flex items-center gap-3 mb-8">
    <DzButton id="tour-create" tone="primary">Create</DzButton>
    <DzButton id="tour-invite" variant="outline">Invite</DzButton>
    <DzButton id="tour-settings" variant="ghost">Settings</DzButton>
  </div>
`

/**
 * DzTour is a step-by-step product walkthrough that spotlights target elements
 * and shows an anchored popover with title/description/controls. It is built on
 * the shared `useFloating` positioning primitive (ADR-07) so anchoring and
 * collision handling match DzPopover/DzTooltip.
 *
 * Open state and the active step are controlled via `v-model:open` and
 * `v-model:current` (ADR-16). A spotlight mask dims everything except the active
 * target, focus is trapped in the popover, and Escape dismisses the tour.
 */
const meta = {
  title: 'Core/Overlays/DzTour',
  component: DzTour,
  tags: ['autodocs', 'status:experimental'],
  parameters: {
    // Overlays enforced (TASK-DS-13).
    ...a11yError,
  },
  argTypes: {
    mask: {
      control: 'boolean',
      description: 'Dim everything except the active target with a spotlight mask',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    scrollIntoView: {
      control: 'boolean',
      description: 'Scroll an off-screen target into view when its step activates',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    current: {
      control: 'number',
      description: 'Active step index via v-model:current',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    finish: { action: 'finish', description: 'Tour completed on the last step', table: { category: 'Events' } },
    close: { action: 'close', description: 'Tour dismissed via Skip/Escape', table: { category: 'Events' } },
    change: { action: 'change', description: 'Active step index changed', table: { category: 'Events' } },
  },
  args: {
    mask: true,
    scrollIntoView: true,
  },
} satisfies Meta<typeof DzTour>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Basic three-step tour
// ---------------------------------------------------------------------------

export const BasicThreeStep: Story = {
  render: args => ({
    components: { DzTour, DzButton },
    setup() {
      return { args, steps }
    },
    data() {
      return { open: false, current: 0 }
    },
    template: `
      <div>
        ${demoToolbar}
        <DzButton @click="open = true; current = 0">Start tour</DzButton>
        <DzTour
          v-bind="args"
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// No mask (spotlight popover only)
// ---------------------------------------------------------------------------

export const NoMask: Story = {
  render: () => ({
    components: { DzTour, DzButton },
    setup() {
      return { steps }
    },
    data() {
      return { open: false, current: 0 }
    },
    template: `
      <div>
        ${demoToolbar}
        <DzButton @click="open = true; current = 0">Start tour (no mask)</DzButton>
        <DzTour
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
          :mask="false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom footer slot
// ---------------------------------------------------------------------------

export const CustomFooter: Story = {
  render: () => ({
    components: { DzTour, DzButton },
    setup() {
      return { steps }
    },
    data() {
      return { open: false, current: 0 }
    },
    template: `
      <div>
        ${demoToolbar}
        <DzButton @click="open = true; current = 0">Start tour (custom footer)</DzButton>
        <DzTour
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
        >
          <template #footer="{ current, total, isFirst, isLast, prev, next, close }">
            <div class="mt-4 flex items-center justify-between">
              <span class="text-xs text-[var(--dz-muted-foreground)]">{{ current + 1 }} / {{ total }}</span>
              <div class="flex gap-2">
                <DzButton size="sm" variant="ghost" tone="neutral" @click="close">Dismiss</DzButton>
                <DzButton v-if="!isFirst" size="sm" variant="outline" tone="neutral" @click="prev">Previous</DzButton>
                <DzButton size="sm" tone="primary" @click="next">{{ isLast ? 'Done' : 'Continue' }}</DzButton>
              </div>
            </div>
          </template>
        </DzTour>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Controlled step (external prev/next)
// ---------------------------------------------------------------------------

export const ControlledStep: Story = {
  render: () => ({
    components: { DzTour, DzButton },
    setup() {
      return { steps }
    },
    data() {
      return { open: true, current: 0 }
    },
    template: `
      <div>
        ${demoToolbar}
        <div class="flex items-center gap-3">
          <DzButton size="sm" variant="outline" :disabled="current === 0" @click="current--">◀ Prev</DzButton>
          <span class="text-sm">Step {{ current + 1 }} of {{ steps.length }}</span>
          <DzButton size="sm" variant="outline" :disabled="current === steps.length - 1" @click="current++">Next ▶</DzButton>
          <DzButton size="sm" tone="primary" @click="open = !open">{{ open ? 'Hide' : 'Show' }} tour</DzButton>
        </div>
        <DzTour
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

/**
 * Two things this story has to do that a plain `darkModeDecorator` cannot:
 *
 * 1. The spotlight popover is `<Teleport to="body">`d, so it lands OUTSIDE the
 *    decorator's `data-theme="dark"` wrapper and would resolve the LIGHT tokens.
 *    Setting the `theme` global puts `data-theme="dark"` on `<html>`
 *    (the global ThemeRecipe decorator; see `.storybook/preview.ts`), which the
 *    teleported popover does inherit.
 * 2. A closed tour previews nothing. `play()` starts it — and because docs pages
 *    do not autoplay, the spotlight mask and focus trap never blanket the docs
 *    page.
 */
export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  globals: { theme: 'dark' },
  render: () => ({
    components: { DzTour, DzButton },
    setup() {
      return { steps }
    },
    data() {
      return { open: false, current: 0 }
    },
    template: `
      <div>
        ${demoToolbar}
        <DzButton @click="open = true; current = 0">Start tour in dark mode</DzButton>
        <DzTour
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /start tour in dark mode/i }))
    const dialog = await screen.findByRole('dialog')
    await expect(dialog).toHaveTextContent(/create a project/i)
  },
}

// ---------------------------------------------------------------------------
// Interactive: walk through the tour
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzTour, DzButton },
    setup() {
      return { steps }
    },
    data() {
      return { open: false, current: 0, finished: false }
    },
    methods: {
      onFinish() {
        ;(this as unknown as { finished: boolean }).finished = true
      },
    },
    template: `
      <div>
        ${demoToolbar}
        <DzButton @click="open = true; current = 0; finished = false">Start tour</DzButton>
        <span v-if="finished" class="ml-3 text-sm">Tour finished ✓</span>
        <DzTour
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
          @finish="onFinish"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the tour — the spotlight popover is teleported to document.body.
    await userEvent.click(canvas.getByRole('button', { name: /start tour/i }))
    const dialog = await screen.findByRole('dialog')
    await expect(dialog).toHaveTextContent(/create a project/i)

    // Advance through the steps to the finish control.
    await userEvent.click(screen.getByTestId('dz-tour-next'))
    await expect(await screen.findByRole('dialog')).toHaveTextContent(/invite teammates/i)
    await userEvent.click(screen.getByTestId('dz-tour-next'))
    await expect(await screen.findByRole('dialog')).toHaveTextContent(/tune your settings/i)

    // Finishing closes the tour and surfaces the completion note.
    await userEvent.click(screen.getByTestId('dz-tour-next'))
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(canvas.getByText(/tour finished/i)).toBeInTheDocument()
  },
}
