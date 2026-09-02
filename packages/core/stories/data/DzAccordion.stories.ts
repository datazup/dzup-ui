import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
} from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

/**
 * DzAccordion is a disclosure component built on Reka UI primitives (ADR-07).
 * It supports single or multiple open items, four visual variants
 * (`default`, `bordered`, `separated`, `filled`), and collapsible behavior.
 *
 * Compound sub-parts: DzAccordionItem, DzAccordionTrigger, DzAccordionContent.
 * Context is provided via inject (ADR-08).
 */

const meta = {
  title: 'Core/Data/DzAccordion',
  component: DzAccordion,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'separated', 'filled'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Whether one or multiple items can be open simultaneously',
      table: { category: 'Behavior', defaultValue: { summary: 'single' } },
    },
    collapsible: {
      control: 'boolean',
      description:
        'Single mode only: allow the open item to be closed by clicking it again (zero items open). When false, one item always stays open.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents all items from toggling',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    type: 'single',
    collapsible: true,
    disabled: false,
  },
} satisfies Meta<typeof DzAccordion>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Helper template fragments
// ---------------------------------------------------------------------------

const faqItems = `
  <DzAccordionItem value="item-1">
    <DzAccordionTrigger>What is dzup-ui?</DzAccordionTrigger>
    <DzAccordionContent>
      dzup-ui is a Vue 3 component library built with TypeScript, Tailwind CSS 4,
      and Reka UI headless primitives. It provides both Core and Pro components.
    </DzAccordionContent>
  </DzAccordionItem>
  <DzAccordionItem value="item-2">
    <DzAccordionTrigger>How do I install it?</DzAccordionTrigger>
    <DzAccordionContent>
      Install via yarn: <code>yarn add @dzup-ui/core</code>. For enterprise
      components, also install <code>@dzup-ui-pro/pro</code>.
    </DzAccordionContent>
  </DzAccordionItem>
  <DzAccordionItem value="item-3">
    <DzAccordionTrigger>Is it accessible?</DzAccordionTrigger>
    <DzAccordionContent>
      Yes. All components follow WCAG AA standards and are built on Reka UI
      headless primitives that handle ARIA attributes and keyboard navigation.
    </DzAccordionContent>
  </DzAccordionItem>
`

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    setup() {
      return { args }
    },
    template: `
      <DzAccordion v-bind="args" class="max-w-lg" aria-label="FAQ">
        ${faqItems}
      </DzAccordion>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-8 max-w-lg">
        <div v-for="v in ['default', 'bordered', 'separated', 'filled']" :key="v">
          <p class="text-sm font-medium mb-2 capitalize">variant: {{ v }}</p>
          <DzAccordion :variant="v" collapsible :aria-label="v + ' accordion'">
            <DzAccordionItem value="a">
              <DzAccordionTrigger>First section</DzAccordionTrigger>
              <DzAccordionContent>Content for the first section.</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="b">
              <DzAccordionTrigger>Second section</DzAccordionTrigger>
              <DzAccordionContent>Content for the second section.</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="c">
              <DzAccordionTrigger>Third section</DzAccordionTrigger>
              <DzAccordionContent>Content for the third section.</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-8 max-w-lg">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzAccordion :size="s" variant="bordered" collapsible :aria-label="s + ' accordion'">
            <DzAccordionItem value="a">
              <DzAccordionTrigger>Section A</DzAccordionTrigger>
              <DzAccordionContent>Content for section A at size {{ s }}.</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="b">
              <DzAccordionTrigger>Section B</DzAccordionTrigger>
              <DzAccordionContent>Content for section B at size {{ s }}.</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multiple Mode
// ---------------------------------------------------------------------------

export const MultipleMode: Story = {
  name: 'Multiple Selection Mode',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <DzAccordion type="multiple" variant="bordered" class="max-w-lg" aria-label="Multi-select accordion">
        ${faqItems}
      </DzAccordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('button', { name: /what is dzup-ui/i })
    const second = canvas.getByRole('button', { name: /how do i install/i })

    // In multiple mode, opening a second item does not close the first.
    await userEvent.click(first)
    await userEvent.click(second)
    await waitFor(() => {
      expect(first).toHaveAttribute('aria-expanded', 'true')
      expect(second).toHaveAttribute('aria-expanded', 'true')
    })
  },
}

// ---------------------------------------------------------------------------
// Collapsible
// ---------------------------------------------------------------------------

export const Collapsible: Story = {
  name: 'Collapsible (All Closable)',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-3 max-w-lg">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          With collapsible enabled, clicking the open item again closes it.
          Without collapsible, one item always remains open.
        </p>
        <DzAccordion collapsible variant="bordered" aria-label="Collapsible accordion">
          ${faqItems}
        </DzAccordion>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /what is dzup-ui/i })

    // Starts collapsed.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Click expands…
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

    // …and because collapsible is enabled, clicking the open item closes it again.
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  },
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    setup() {
      return { args }
    },
    template: `
      <DzAccordion v-bind="args" variant="bordered" class="max-w-lg" aria-label="Disabled accordion">
        ${faqItems}
      </DzAccordion>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Individual Item
// ---------------------------------------------------------------------------

export const DisabledItem: Story = {
  name: 'Disabled Individual Item',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <DzAccordion collapsible variant="bordered" class="max-w-lg" aria-label="Accordion with disabled item">
        <DzAccordionItem value="item-1">
          <DzAccordionTrigger>Available Section</DzAccordionTrigger>
          <DzAccordionContent>This section can be expanded.</DzAccordionContent>
        </DzAccordionItem>
        <DzAccordionItem value="item-2" disabled>
          <DzAccordionTrigger>Locked Section (Disabled)</DzAccordionTrigger>
          <DzAccordionContent>This content is not accessible.</DzAccordionContent>
        </DzAccordionItem>
        <DzAccordionItem value="item-3">
          <DzAccordionTrigger>Another Available Section</DzAccordionTrigger>
          <DzAccordionContent>This section can also be expanded.</DzAccordionContent>
        </DzAccordionItem>
      </DzAccordion>
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
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-8 max-w-lg">
        <DzAccordion variant="default" collapsible aria-label="Dark mode default accordion">
          <DzAccordionItem value="a">
            <DzAccordionTrigger>Default variant</DzAccordionTrigger>
            <DzAccordionContent>Content for the default variant in dark mode.</DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="b">
            <DzAccordionTrigger>Second item</DzAccordionTrigger>
            <DzAccordionContent>More content here.</DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
        <DzAccordion variant="bordered" collapsible aria-label="Dark mode bordered accordion">
          <DzAccordionItem value="a">
            <DzAccordionTrigger>Bordered variant</DzAccordionTrigger>
            <DzAccordionContent>Content for the bordered variant in dark mode.</DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="b">
            <DzAccordionTrigger>Second item</DzAccordionTrigger>
            <DzAccordionContent>More content here.</DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-4 max-w-lg">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Built on Reka UI AccordionRoot primitive. Tab focuses triggers.
          Arrow Up/Down moves between triggers. Enter or Space toggles the focused item.
          Home/End jump to first/last trigger. Screen readers announce expanded/collapsed state.
        </p>
        <DzAccordion collapsible variant="bordered" aria-label="Keyboard accessible FAQ">
          ${faqItems}
        </DzAccordion>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: FAQ Page
// ---------------------------------------------------------------------------

export const RealWorldFAQ: Story = {
  name: 'Real World: FAQ Page',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="max-w-2xl space-y-4">
        <h2 class="text-xl font-semibold">Frequently Asked Questions</h2>
        <DzAccordion collapsible variant="separated" aria-label="FAQ page">
          <DzAccordionItem value="shipping">
            <DzAccordionTrigger>What are the shipping options?</DzAccordionTrigger>
            <DzAccordionContent>
              We offer standard (5-7 business days), express (2-3 business days),
              and overnight shipping. Free standard shipping on orders over $50.
            </DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="returns">
            <DzAccordionTrigger>What is your return policy?</DzAccordionTrigger>
            <DzAccordionContent>
              Items can be returned within 30 days of purchase in original condition.
              Refunds are processed within 5-7 business days after we receive the return.
            </DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="payment">
            <DzAccordionTrigger>What payment methods do you accept?</DzAccordionTrigger>
            <DzAccordionContent>
              We accept all major credit cards (Visa, Mastercard, Amex), PayPal,
              Apple Pay, and Google Pay. Bank transfers available for orders over $500.
            </DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="support">
            <DzAccordionTrigger>How can I contact support?</DzAccordionTrigger>
            <DzAccordionContent>
              Email us at support@example.com or use the live chat widget.
              Support hours are Monday-Friday, 9am-6pm EST.
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Sections
// ---------------------------------------------------------------------------

export const RealWorldSettings: Story = {
  name: 'Real World: Settings Panel',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="max-w-lg">
        <DzAccordion type="multiple" variant="bordered" aria-label="Settings sections">
          <DzAccordionItem value="general">
            <DzAccordionTrigger>General Settings</DzAccordionTrigger>
            <DzAccordionContent>
              <div class="space-y-3">
                <p class="text-sm">Configure application name, language, and timezone preferences.</p>
              </div>
            </DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="security">
            <DzAccordionTrigger>Security & Privacy</DzAccordionTrigger>
            <DzAccordionContent>
              <div class="space-y-3">
                <p class="text-sm">Manage passwords, two-factor authentication, and session controls.</p>
              </div>
            </DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="notifications">
            <DzAccordionTrigger>Notification Preferences</DzAccordionTrigger>
            <DzAccordionContent>
              <div class="space-y-3">
                <p class="text-sm">Choose which notifications to receive via email, push, or in-app.</p>
              </div>
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Bindable: list passed via v-for + open item reflected through v-model
// ---------------------------------------------------------------------------

export const BindableModel: Story = {
  name: 'Bindable: v-for items + v-model',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    data() {
      return {
        open: 'shipping',
        faqs: [
          { value: 'shipping', title: 'Shipping', body: 'Orders ship within 2 business days.' },
          { value: 'returns', title: 'Returns', body: 'Returns accepted within 30 days.' },
          { value: 'support', title: 'Support', body: 'Reach us 24/7 via the help center.' },
        ],
      }
    },
    template: `
      <div class="max-w-lg space-y-3">
        <DzAccordion v-model="open" type="single" collapsible>
          <DzAccordionItem v-for="faq in faqs" :key="faq.value" :value="faq.value">
            <DzAccordionTrigger>{{ faq.title }}</DzAccordionTrigger>
            <DzAccordionContent>{{ faq.body }}</DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
        <p class="text-sm text-[var(--dz-muted-foreground)]">Open item (v-model): <code>{{ open || 'none' }}</code></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — enabled / item-disabled / root-disabled (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the only state DzAccordion declares, and it has two reachable
 * scopes that look identical in a screenshot: the whole accordion (`disabled` on
 * the root, which also stamps `data-state="disabled"`) and a single item
 * (`disabled` on `DzAccordionItem`, which leaves its siblings live).
 *
 * The play function separates them: an enabled trigger toggles `aria-expanded`,
 * a disabled one is `disabled` in the DOM and stays collapsed. Disabled triggers
 * are asserted rather than clicked — `dz-disabled-control` sets
 * `pointer-events: none`, so the browser would never deliver the click at all.
 */
export const States: Story = {
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="grid max-w-5xl gap-6 lg:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Enabled</p>
          <DzAccordion
            collapsible
            variant="bordered"
            data-testid="acc-enabled"
            aria-label="Enabled accordion"
          >
            <DzAccordionItem value="a1">
              <DzAccordionTrigger>Enabled section</DzAccordionTrigger>
              <DzAccordionContent>This panel opens and closes.</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="a2">
              <DzAccordionTrigger>Second enabled section</DzAccordionTrigger>
              <DzAccordionContent>So does this one.</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">One item disabled</p>
          <DzAccordion
            collapsible
            variant="bordered"
            data-testid="acc-item-disabled"
            aria-label="Accordion with one disabled item"
          >
            <DzAccordionItem value="b1">
              <DzAccordionTrigger>Open section</DzAccordionTrigger>
              <DzAccordionContent>Still interactive.</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="b2" disabled>
              <DzAccordionTrigger>Locked section</DzAccordionTrigger>
              <DzAccordionContent>Unreachable while the item is disabled.</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Whole accordion disabled</p>
          <DzAccordion
            collapsible
            disabled
            variant="bordered"
            data-testid="acc-disabled"
            aria-label="Disabled accordion"
          >
            <DzAccordionItem value="c1">
              <DzAccordionTrigger>Frozen section</DzAccordionTrigger>
              <DzAccordionContent>Never expands.</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="c2">
              <DzAccordionTrigger>Also frozen</DzAccordionTrigger>
              <DzAccordionContent>Nor does this.</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Root-level state is reflected on the root element.
    await expect(canvas.getByTestId('acc-enabled')).toHaveAttribute('data-state', 'ready')
    await expect(canvas.getByTestId('acc-disabled')).toHaveAttribute('data-state', 'disabled')

    // Enabled: the trigger toggles and the panel appears.
    const enabledTrigger = canvas.getByRole('button', { name: 'Enabled section' })
    await expect(enabledTrigger).toBeEnabled()
    await expect(enabledTrigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(enabledTrigger)
    await waitFor(() => expect(enabledTrigger).toHaveAttribute('aria-expanded', 'true'))
    await expect(canvas.getByText('This panel opens and closes.')).toBeVisible()

    // Item-level: the locked item is disabled, its sibling is not.
    const lockedTrigger = canvas.getByRole('button', { name: 'Locked section' })
    await expect(lockedTrigger).toBeDisabled()
    await expect(lockedTrigger).toHaveAttribute('aria-expanded', 'false')
    const openTrigger = canvas.getByRole('button', { name: 'Open section' })
    await expect(openTrigger).toBeEnabled()
    await userEvent.click(openTrigger)
    await waitFor(() => expect(openTrigger).toHaveAttribute('aria-expanded', 'true'))

    // Root-level: every trigger is disabled and collapsed.
    for (const name of ['Frozen section', 'Also frozen']) {
      const trigger = canvas.getByRole('button', { name })
      await expect(trigger).toBeDisabled()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    }
  },
}
