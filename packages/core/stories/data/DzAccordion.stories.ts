import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
} from '../../src/components/data'

/**
 * DzAccordion is a disclosure component built on Reka UI primitives (ADR-07).
 * It supports single or multiple open items, three visual variants
 * (`default`, `bordered`, `separated`), and collapsible behavior.
 *
 * Compound sub-parts: DzAccordionItem, DzAccordionTrigger, DzAccordionContent.
 * Context is provided via inject (ADR-08).
 */

const meta = {
  title: 'Core/Data/DzAccordion',
  component: DzAccordion,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'separated'],
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
      description: 'Whether all items can be collapsed (single mode only)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
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
    collapsible: false,
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
    <DzAccordionTrigger>What is dzip-ui?</DzAccordionTrigger>
    <DzAccordionContent>
      dzip-ui is a Vue 3 component library built with TypeScript, Tailwind CSS 4,
      and Reka UI headless primitives. It provides both Core and Pro components.
    </DzAccordionContent>
  </DzAccordionItem>
  <DzAccordionItem value="item-2">
    <DzAccordionTrigger>How do I install it?</DzAccordionTrigger>
    <DzAccordionContent>
      Install via yarn: <code>yarn add @dzup-ui/core</code>. For enterprise
      components, also install <code>@dzup-ui/pro</code>.
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
        <div v-for="v in ['default', 'bordered', 'separated']" :key="v">
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
        <p class="text-sm text-gray-500">
          With collapsible enabled, clicking the open item again closes it.
          Without collapsible, one item always remains open.
        </p>
        <DzAccordion collapsible variant="bordered" aria-label="Collapsible accordion">
          ${faqItems}
        </DzAccordion>
      </div>
    `,
  }),
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
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
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
        <p class="text-sm text-gray-500">
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
