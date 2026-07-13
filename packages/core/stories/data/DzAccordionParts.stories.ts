import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
} from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

/**
 * DzAccordion compound sub-parts: DzAccordionItem, DzAccordionTrigger, DzAccordionContent.
 *
 * These sub-parts compose inside a `DzAccordion` root to produce a disclosure list.
 * The root owns selection (`type="single" | "multiple"`) and publishes `size` and
 * `variant` to its children through the `DZ_ACCORDION_KEY` context (ADR-08), so the
 * sub-parts take almost no props of their own — they read the root's decision.
 *
 * - **DzAccordion** — root; owns `type`, `collapsible`, `variant`, `size`, `disabled`
 * - **DzAccordionItem** — one section; the only required prop is its unique `value`
 * - **DzAccordionTrigger** — the `<button>` that toggles its item; labels the panel
 * - **DzAccordionContent** — the collapsible panel, labelled by its trigger
 *
 * Built on Reka UI's Accordion primitives (ADR-07), so roving focus, `aria-expanded`,
 * and the `aria-controls` ⇄ `aria-labelledby` pairing come from the primitive rather
 * than from hand-written ARIA.
 */

const meta = {
  title: 'Core/Data/DzAccordionParts',
  component: DzAccordionItem,
  subcomponents: {
    DzAccordion,
    DzAccordionTrigger,
    DzAccordionContent,
  },
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Unique value identifying this item within the root',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents this single item from toggling',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    value: 'item-1',
    disabled: false,
  },
} satisfies Meta<typeof DzAccordionItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: all four parts in situ
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    setup() {
      return { args }
    },
    template: `
      <DzAccordion type="single" collapsible variant="bordered" class="max-w-md">
        <DzAccordionItem v-bind="args">
          <DzAccordionTrigger>What is a compound component?</DzAccordionTrigger>
          <DzAccordionContent>
            A root that publishes context to named children, so the children stay
            declarative and the root owns the state.
          </DzAccordionContent>
        </DzAccordionItem>
        <DzAccordionItem value="item-2">
          <DzAccordionTrigger>Why does the item need a value?</DzAccordionTrigger>
          <DzAccordionContent>
            The root tracks which item is open by its value, so each one must be
            unique within a single DzAccordion.
          </DzAccordionContent>
        </DzAccordionItem>
      </DzAccordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /what is a compound component/i })

    // Reka wires aria-expanded on the trigger; the panel is collapsed to start.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('region', { name: /what is a compound component/i }))
      .toBeInTheDocument()

    // `collapsible` means clicking the open item closes it again.
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}

// ---------------------------------------------------------------------------
// Compound Composition: annotated anatomy
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound Composition: Anatomy',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-6">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          A DzAccordion is assembled from a root and three nested parts. The root
          owns selection and publishes size + variant through context; each
          DzAccordionItem pairs exactly one DzAccordionTrigger with one
          DzAccordionContent.
        </p>

        <DzAccordion type="single" collapsible variant="separated" class="max-w-md">
          <DzAccordionItem value="anatomy">
            <DzAccordionTrigger>
              <span class="relative">
                DzAccordionTrigger
                <span class="absolute -top-2 -right-8 text-[10px] px-1 rounded bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">trigger</span>
              </span>
            </DzAccordionTrigger>
            <DzAccordionContent>
              <div class="relative min-h-[48px]">
                <p class="text-sm text-[var(--dz-muted-foreground)]">
                  DzAccordionContent — the collapsible panel
                </p>
                <span class="absolute -top-2 -right-2 text-[10px] px-1 rounded bg-[var(--dz-success)] text-[var(--dz-success-foreground)]">content</span>
              </div>
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>

        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>DzAccordion</strong> — root; owns type (single / multiple), collapsible, variant, size, disabled</p>
          <p><strong>DzAccordionItem</strong> — one section, keyed by a unique <code>value</code></p>
          <p><strong>DzAccordionTrigger</strong> — the toggle button; becomes the panel's accessible name</p>
          <p><strong>DzAccordionContent</strong> — the panel; exposed as a <code>region</code> labelled by its trigger</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Composition rules
// ---------------------------------------------------------------------------

export const CompositionRules: Story = {
  name: 'Composition Rules',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-6 max-w-md">
        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>Every item needs a unique value.</strong> The root identifies the open section by value, so duplicates make two sections toggle as one.</p>
          <p><strong>One trigger, one content, per item.</strong> The pairing is what produces the aria-controls / aria-labelledby relationship.</p>
          <p><strong>Size and variant belong to the root.</strong> Sub-parts read them from context — setting them per item has no effect.</p>
          <p><strong>type="multiple" drops collapsible.</strong> Multiple already allows every item closed, so the prop does not apply.</p>
        </div>

        <DzAccordion type="multiple" variant="filled" size="sm">
          <DzAccordionItem value="a">
            <DzAccordionTrigger>Both can be open at once</DzAccordionTrigger>
            <DzAccordionContent>type="multiple" keeps each item independent.</DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="b">
            <DzAccordionTrigger>So can this one</DzAccordionTrigger>
            <DzAccordionContent>Open the section above and this stays open too.</DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="c" disabled>
            <DzAccordionTrigger>Disabled at the item level</DzAccordionTrigger>
            <DzAccordionContent>Unreachable while the item is disabled.</DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('button', { name: /both can be open at once/i })
    const second = canvas.getByRole('button', { name: /so can this one/i })
    const disabled = canvas.getByRole('button', { name: /disabled at the item level/i })

    await userEvent.click(first)
    await userEvent.click(second)

    // type="multiple": opening the second must not close the first.
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(disabled).toBeDisabled()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <DzAccordion type="single" collapsible variant="bordered" class="max-w-md">
        <DzAccordionItem value="dark-1">
          <DzAccordionTrigger>Surfaces follow the token layer</DzAccordionTrigger>
          <DzAccordionContent>
            Border, surface, and foreground tokens resolve per theme, so no part
            carries a theme-specific class.
          </DzAccordionContent>
        </DzAccordionItem>
        <DzAccordionItem value="dark-2">
          <DzAccordionTrigger>Sub-parts carry no theme-specific class</DzAccordionTrigger>
          <DzAccordionContent>
            Each part resolves its own colors from context, so the same markup
            renders correctly under either theme.
          </DzAccordionContent>
        </DzAccordionItem>
      </DzAccordion>
    `,
  }),
}
