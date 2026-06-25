import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import {
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzBreadcrumbSeparator,
} from '../../src/components/navigation'

/**
 * DzBreadcrumb compound sub-parts: DzBreadcrumbItem and DzBreadcrumbSeparator.
 *
 * DzBreadcrumbItem renders as an `<a>` anchor when `href` is supplied (and the
 * item is not current/disabled), or as an accessible `<span role="link">`
 * otherwise. The `current` prop marks the page you are on and adds
 * `aria-current="page"`.
 *
 * DzBreadcrumbSeparator is a presentational `<li role="presentation">` that
 * reads its separator character from the nearest DzBreadcrumb context
 * (ADR-08). A custom character can be passed via the `separator` prop or the
 * default slot (useful for SVG chevrons).
 *
 * Both subparts must be placed inside a DzBreadcrumb root so they receive the
 * shared `separator` context and render inside a correct `<ol>`.
 */

const meta = {
  title: 'Core/Navigation/DzBreadcrumbParts',
  component: DzBreadcrumbItem,
  subcomponents: { DzBreadcrumbSeparator },
  tags: ['autodocs', 'status:stable'],
  decorators: [darkModeDecorator],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL for the breadcrumb link. Omit for the current page.',
      table: { category: 'Behavior' },
    },
    current: {
      control: 'boolean',
      description: 'Marks this item as the current page (adds aria-current="page")',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Renders the item as non-interactive',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof DzBreadcrumbItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: 3-item breadcrumb with separators
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <DzBreadcrumb aria-label="Breadcrumb">
        <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem current>Details</DzBreadcrumbItem>
      </DzBreadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Link items are real anchors.
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    await expect(canvas.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'href',
      '/products',
    )

    // Current item carries aria-current="page" and is NOT a link.
    const current = canvas.getByText('Details')
    await expect(current.closest('[aria-current]')).toHaveAttribute('aria-current', 'page')
    await expect(current.closest('a')).toBeNull()
  },
}

// ---------------------------------------------------------------------------
// CompoundComposition: Annotated anatomy
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound Composition',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <div class="flex flex-col gap-6">
        <!-- Live breadcrumb -->
        <DzBreadcrumb aria-label="Breadcrumb anatomy">
          <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem href="/settings">Settings</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem current>Profile</DzBreadcrumbItem>
        </DzBreadcrumb>

        <!-- Anatomy legend -->
        <dl class="text-sm space-y-2 max-w-sm border-t border-[var(--dz-border)] pt-4">
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzBreadcrumb</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              Root — renders a semantic <code>&lt;nav&gt;</code> wrapping an ordered list
              <code>&lt;ol&gt;</code>. Provides the separator character to children via inject (ADR-08).
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzBreadcrumbItem</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              A single crumb rendered as <code>&lt;li&gt;</code>. Renders an <code>&lt;a&gt;</code>
              when <code>href</code> is set and the item is not current/disabled; otherwise a
              <code>&lt;span role="link"&gt;</code>. The <code>current</code> prop adds
              <code>aria-current="page"</code>.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzBreadcrumbSeparator</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              Presentational <code>&lt;li role="presentation" aria-hidden="true"&gt;</code>.
              Inherits separator from context, but accepts a <code>separator</code> prop or a
              slot for custom content (e.g. an SVG chevron).
            </dd>
          </div>
        </dl>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// WithCustomSeparator: Slot overrides the separator character
// ---------------------------------------------------------------------------

export const WithCustomSeparator: Story = {
  name: 'Custom Separator via Slot',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <div class="flex flex-col gap-4">
        <!-- Chevron separator via separator prop -->
        <div>
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">
            separator prop — <code>"›"</code>
          </p>
          <DzBreadcrumb aria-label="Chevron separator breadcrumb">
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator separator="›" />
            <DzBreadcrumbItem href="/docs">Docs</DzBreadcrumbItem>
            <DzBreadcrumbSeparator separator="›" />
            <DzBreadcrumbItem current>Getting Started</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>

        <!-- Dot separator via separator prop -->
        <div>
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">
            separator prop — <code>"·"</code>
          </p>
          <DzBreadcrumb aria-label="Dot separator breadcrumb">
            <DzBreadcrumbItem href="/">Root</DzBreadcrumbItem>
            <DzBreadcrumbSeparator separator="·" />
            <DzBreadcrumbItem href="/account">Account</DzBreadcrumbSeparator>
            <DzBreadcrumbSeparator separator="·" />
            <DzBreadcrumbItem current>Billing</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>

        <!-- Inline SVG via default slot -->
        <div>
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">
            default slot — inline SVG chevron
          </p>
          <DzBreadcrumb aria-label="SVG chevron separator breadcrumb">
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </DzBreadcrumbSeparator>
            <DzBreadcrumbItem href="/reports">Reports</DzBreadcrumbItem>
            <DzBreadcrumbSeparator>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </DzBreadcrumbSeparator>
            <DzBreadcrumbItem current>Q1 2026</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
      </div>
    `,
  }),
}
