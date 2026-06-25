import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { DzButton } from '../../src/components/buttons'
import { DzTooltip, DzTooltipContent, DzTooltipTrigger } from '../../src/components/overlays'

/**
 * DzTooltipContent compound sub-parts: DzTooltipTrigger.
 *
 * DzTooltipContent is the floating informational label shown on hover or focus of its
 * trigger. It receives `role="tooltip"` automatically from Reka UI Tooltip (ADR-07),
 * distinguishing it from DzPopover which uses `role="dialog"` for interactive content.
 *
 * The trigger element wires `aria-describedby` pointing to the tooltip content ID,
 * allowing screen readers to announce the tooltip text alongside the focused element.
 * DzTooltipContent should contain only short, non-interactive text labels.
 */

const meta = {
  title: 'Core/Overlays/DzTooltipParts',
  component: DzTooltipContent,
  subcomponents: {
    DzTooltipTrigger,
  },
  tags: ['autodocs', 'status:stable'],
} satisfies Meta<typeof DzTooltipContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: {
      DzTooltip,
      DzTooltipTrigger,
      DzTooltipContent,
      DzButton,
    },
    template: `
      <DzTooltip>
        <!-- DzTooltipTrigger: the element that shows the tooltip on hover or focus -->
        <DzTooltipTrigger as-child>
          <DzButton variant="outline">Hover me</DzButton>
        </DzTooltipTrigger>

        <!-- DzTooltipContent: the floating label (role="tooltip") -->
        <DzTooltipContent>
          This is a helpful tooltip label
        </DzTooltipContent>
      </DzTooltip>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Compound Composition: annotated anatomy of all sub-parts
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound: All Sub-Parts',
  render: () => ({
    components: {
      DzTooltip,
      DzTooltipTrigger,
      DzTooltipContent,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzTooltip is a compound component. Both sub-parts are shown here:
          <code>DzTooltipTrigger</code> and <code>DzTooltipContent</code>.
          DzTooltipContent uses <code>role="tooltip"</code> for non-interactive
          supplemental labels — use DzPopover instead when the floating panel
          needs to contain interactive elements.
        </p>

        <!-- DzTooltip: invisible root that manages open state and delay timers -->
        <DzTooltip>
          <!-- DzTooltipTrigger: hover / focus target; as-child delegates to DzButton -->
          <DzTooltipTrigger as-child>
            <DzButton tone="primary">Hover (DzTooltipTrigger)</DzButton>
          </DzTooltipTrigger>

          <!-- DzTooltipContent: floating label (role="tooltip") -->
          <DzTooltipContent>
            DzTooltipContent — role="tooltip"
          </DzTooltipContent>
        </DzTooltip>

        <!-- Anatomy map -->
        <div
          class="rounded border px-3 py-2 text-xs font-mono space-y-0.5 max-w-lg"
          style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
        >
          <p>&lt;DzTooltip&gt;              <!-- root, manages delay + open state --&gt;</p>
          <p class="pl-4">&lt;DzTooltipTrigger /&gt;   <!-- hover/focus target; wires aria-describedby --&gt;</p>
          <p class="pl-4">&lt;DzTooltipContent&gt;     <!-- floating label, role="tooltip" --&gt;</p>
          <p class="pl-8">Short informational text</p>
          <p class="pl-4">&lt;/DzTooltipContent&gt;</p>
          <p>&lt;/DzTooltip&gt;</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: role=tooltip, aria-describedby
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role=tooltip + aria-describedby',
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzTooltip,
      DzTooltipTrigger,
      DzTooltipContent,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzTooltipContent receives <code>role="tooltip"</code> from Reka UI.
          The trigger element is automatically wired with <code>aria-describedby</code>
          pointing to the tooltip content ID, so screen readers announce the tooltip
          text when the trigger receives focus — without the user needing to hover.
          Tooltips must contain only short, non-interactive text; never place buttons,
          links, or form controls inside DzTooltipContent (use DzPopover for that).
        </p>
        <div class="flex flex-wrap gap-4">
          <DzTooltip>
            <DzTooltipTrigger as-child>
              <DzButton>Save (Tab to me)</DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent>
              Save changes (Ctrl+S)
            </DzTooltipContent>
          </DzTooltip>

          <DzTooltip>
            <DzTooltipTrigger as-child>
              <DzButton variant="outline" tone="danger">Delete</DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent>
              Permanently delete this item — cannot be undone
            </DzTooltipContent>
          </DzTooltip>

          <DzTooltip>
            <DzTooltipTrigger as-child>
              <DzButton variant="ghost" tone="neutral" aria-label="More information">?</DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent>
              Hover or focus triggers the tooltip; aria-describedby wired automatically
            </DzTooltipContent>
          </DzTooltip>
        </div>
      </div>
    `,
  }),
}
