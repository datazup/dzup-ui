import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { DzButton } from '../../src/components/buttons'
import { DzPopover, DzPopoverContent, DzPopoverTrigger } from '../../src/components/overlays'

/**
 * DzPopoverContent compound sub-parts: DzPopoverTrigger.
 *
 * DzPopoverContent is the floating panel rendered relative to its trigger. It receives
 * `role="dialog"` automatically from Reka UI Popover (ADR-07), distinguishing it from
 * tooltip (which uses `role="tooltip"`). DzPopoverContent supports rich interactive
 * content — forms, action lists, custom layouts — unlike DzTooltip which is informational
 * only.
 *
 * Open state is controlled via `v-model:open` on the root DzPopover.
 */

const meta = {
  title: 'Core/Overlays/DzPopoverParts',
  component: DzPopoverContent,
  subcomponents: {
    DzPopoverTrigger,
  },
  tags: ['autodocs', 'status:stable'],
} satisfies Meta<typeof DzPopoverContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: {
      DzPopover,
      DzPopoverTrigger,
      DzPopoverContent,
      DzButton,
    },
    template: `
      <DzPopover>
        <!-- DzPopoverTrigger: the element that toggles the popover on click -->
        <DzPopoverTrigger as-child>
          <DzButton variant="outline">Open Popover</DzButton>
        </DzPopoverTrigger>

        <!-- DzPopoverContent: the floating panel, portaled to document.body -->
        <DzPopoverContent>
          <div class="space-y-2">
            <p class="text-sm font-medium" style="color: var(--dz-foreground);">Popover Content</p>
            <p class="text-xs" style="color: var(--dz-muted-foreground);">
              This panel can contain any interactive content — forms, lists, or custom layouts.
            </p>
            <DzButton size="sm" tone="primary" class="w-full">Take Action</DzButton>
          </div>
        </DzPopoverContent>
      </DzPopover>
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
      DzPopover,
      DzPopoverTrigger,
      DzPopoverContent,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzPopover is a compound component. Both sub-parts are shown here:
          <code>DzPopoverTrigger</code> and <code>DzPopoverContent</code>.
          DzPopoverContent uses <code>role="dialog"</code>, making it suitable for
          interactive content (unlike DzTooltip which uses <code>role="tooltip"</code>).
        </p>

        <!-- DzPopover: invisible root that manages open state and portal context -->
        <DzPopover>
          <!-- DzPopoverTrigger: click target; as-child delegates to DzButton -->
          <DzPopoverTrigger as-child>
            <DzButton tone="primary">Open (DzPopoverTrigger)</DzButton>
          </DzPopoverTrigger>

          <!-- DzPopoverContent: floating panel (role="dialog") -->
          <DzPopoverContent>
            <div class="space-y-2">
              <p class="text-sm font-medium" style="color: var(--dz-foreground);">
                DzPopoverContent (role="dialog")
              </p>
              <p class="text-xs" style="color: var(--dz-muted-foreground);">
                Supports rich interactive content. Click outside or press Escape to close.
              </p>
            </div>
          </DzPopoverContent>
        </DzPopover>

        <!-- Anatomy map -->
        <div
          class="rounded border px-3 py-2 text-xs font-mono space-y-0.5 max-w-lg"
          style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
        >
          <p>&lt;DzPopover&gt;              <!-- root, v-model:open --&gt;</p>
          <p class="pl-4">&lt;DzPopoverTrigger /&gt;   <!-- click target --&gt;</p>
          <p class="pl-4">&lt;DzPopoverContent&gt;     <!-- floating panel, role="dialog" --&gt;</p>
          <p class="pl-8">...interactive content...</p>
          <p class="pl-4">&lt;/DzPopoverContent&gt;</p>
          <p>&lt;/DzPopover&gt;</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: role=dialog on content
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role=dialog on DzPopoverContent',
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzPopover,
      DzPopoverTrigger,
      DzPopoverContent,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzPopoverContent receives <code>role="dialog"</code> from Reka UI, which signals
          to assistive technologies that the panel contains interactive elements.
          The trigger button receives <code>aria-haspopup="dialog"</code> and
          <code>aria-expanded</code> toggled automatically by Reka UI.
          Focus moves into the panel on open; Escape closes it and returns focus to
          the trigger. Click outside the panel also closes it.
        </p>
        <DzPopover>
          <DzPopoverTrigger as-child>
            <DzButton>Open Accessible Popover</DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent>
            <div class="space-y-3">
              <p class="text-sm font-medium" style="color: var(--dz-foreground);">Quick Settings</p>
              <label class="flex items-center gap-2 text-sm" style="color: var(--dz-foreground);">
                <input type="checkbox" />
                Enable notifications
              </label>
              <label class="flex items-center gap-2 text-sm" style="color: var(--dz-foreground);">
                <input type="checkbox" checked />
                Auto-save drafts
              </label>
              <DzButton size="sm" variant="outline" class="w-full">Save preferences</DzButton>
            </div>
          </DzPopoverContent>
        </DzPopover>
      </div>
    `,
  }),
}
