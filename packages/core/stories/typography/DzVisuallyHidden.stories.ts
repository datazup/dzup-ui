import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DzVisuallyHidden } from '../../src/components/typography'
import { darkModeDecorator } from '../_shared'

/**
 * DzVisuallyHidden hides content visually while keeping it in the accessibility
 * tree — it is announced by screen readers and contributes to accessible-name
 * computation, but is not painted on screen.
 *
 * It uses the audited clip-rect + 1px technique (NOT `display:none`, which would
 * remove the content from the a11y tree). Set `focusable` for the skip-link
 * pattern: the content reveals itself in place on keyboard focus.
 *
 * Because most of its effect is invisible by definition, inspect these stories
 * with a screen reader or the accessibility panel of your browser dev tools.
 */
const meta = {
  title: 'Core/Typography/DzVisuallyHidden',
  component: DzVisuallyHidden,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    as: {
      control: 'text',
      description: 'HTML element to render (polymorphic)',
      table: { category: 'Appearance', defaultValue: { summary: 'span' } },
    },
    focusable: {
      control: 'boolean',
      description: 'Reveal the content in place when it (or a descendant) is focused',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    id: {
      control: 'text',
      description: 'Accessible identifier (e.g. for aria-labelledby references)',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    as: 'span',
    focusable: false,
  },
} satisfies Meta<typeof DzVisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — controls-driven
// ---------------------------------------------------------------------------

/**
 * Args-bound so the Controls panel drives the component. It opens on the
 * skip-link configuration (`as: 'a'`, `focusable: true`) rather than the meta
 * defaults, because that is the one shape in which BOTH controls are observable:
 * `focusable` toggles the reveal-on-focus, and `as` decides whether the element
 * can take focus at all. On the `span` default the component is, correctly,
 * invisible in every state — nothing to see and nothing to drive.
 */
export const Default: Story = {
  args: {
    as: 'a',
    focusable: true,
  },
  render: args => ({
    components: { DzVisuallyHidden },
    setup() {
      return { args }
    },
    template: `
      <div class="space-y-3 max-w-md">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Press <kbd class="px-1 border border-[var(--dz-border)] rounded">Tab</kbd> to focus the
          element below. With <code>focusable</code> on it reveals itself in place; switch it off,
          or change <code>as</code> to a non-focusable element such as <code>span</code>, and it
          stays in the accessibility tree only — inspect it with the a11y panel.
        </p>
        <DzVisuallyHidden
          v-bind="args"
          href="#main"
          class="bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)] px-3 py-2 rounded"
        >
          Skip to main content
        </DzVisuallyHidden>
        <div id="main" class="border border-[var(--dz-border)] rounded p-4 text-sm">Main content region.</div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Hidden Label — announced but not painted
// ---------------------------------------------------------------------------

export const HiddenLabel: Story = {
  name: 'Hidden Label',
  render: () => ({
    components: { DzVisuallyHidden },
    template: `
      <div class="space-y-3 max-w-md">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          The button below shows only an icon visually, but exposes the text
          "Save document" to assistive technology. Inspect with the a11y panel —
          the accessible name is computed from the hidden text.
        </p>
        <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
          <span aria-hidden="true">💾</span>
          <DzVisuallyHidden>Save document</DzVisuallyHidden>
        </button>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Skip Link — focusable reveal
// ---------------------------------------------------------------------------

export const SkipLink: Story = {
  name: 'Skip Link (focusable)',
  render: () => ({
    components: { DzVisuallyHidden },
    template: `
      <div class="space-y-3 max-w-md">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Press <kbd class="px-1 border border-[var(--dz-border)] rounded">Tab</kbd> to focus the skip link —
          it stays hidden until focused, then reveals itself in place. This is the
          standard "Skip to main content" pattern.
        </p>
        <DzVisuallyHidden
          as="a"
          focusable
          href="#main"
          class="bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)] px-3 py-2 rounded"
        >
          Skip to main content
        </DzVisuallyHidden>
        <div id="main" class="border border-[var(--dz-border)] rounded p-4 text-sm">Main content region.</div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Inside Icon Button — composition
// ---------------------------------------------------------------------------

export const InsideIconButton: Story = {
  name: 'Inside Icon Button',
  render: () => ({
    components: { DzVisuallyHidden },
    template: `
      <div class="space-y-3 max-w-md">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          A row of icon-only controls, each given an accessible name via
          DzVisuallyHidden so they are distinguishable to screen reader users.
        </p>
        <div class="flex gap-2">
          <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
            <span aria-hidden="true">✏️</span>
            <DzVisuallyHidden>Edit</DzVisuallyHidden>
          </button>
          <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
            <span aria-hidden="true">📋</span>
            <DzVisuallyHidden>Duplicate</DzVisuallyHidden>
          </button>
          <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
            <span aria-hidden="true">🗑️</span>
            <DzVisuallyHidden>Delete</DzVisuallyHidden>
          </button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

/**
 * The component paints nothing, so what this previews is the chrome it is
 * composed into: the focusable skip link once it reveals itself (its only
 * visible state — press Tab), and the icon buttons it names. Those are the
 * surfaces that have to hold up on `[data-theme="dark"]`.
 */
export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzVisuallyHidden },
    template: `
      <div class="space-y-3 max-w-md">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Press <kbd class="px-1 border border-[var(--dz-border)] rounded">Tab</kbd> to reveal the
          skip link against the dark surface.
        </p>
        <DzVisuallyHidden
          as="a"
          focusable
          href="#dark-main"
          class="bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)] px-3 py-2 rounded"
        >
          Skip to main content
        </DzVisuallyHidden>
        <div class="flex gap-2">
          <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
            <span aria-hidden="true">✏️</span>
            <DzVisuallyHidden>Edit</DzVisuallyHidden>
          </button>
          <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
            <span aria-hidden="true">📋</span>
            <DzVisuallyHidden>Duplicate</DzVisuallyHidden>
          </button>
          <button type="button" class="inline-flex items-center justify-center w-10 h-10 border border-[var(--dz-border)] rounded">
            <span aria-hidden="true">🗑️</span>
            <DzVisuallyHidden>Delete</DzVisuallyHidden>
          </button>
        </div>
        <div id="dark-main" class="border border-[var(--dz-border)] rounded p-4 text-sm">Main content region.</div>
      </div>
    `,
  }),
}
