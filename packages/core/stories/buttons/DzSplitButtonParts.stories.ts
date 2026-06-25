import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu } from '../../src/components/buttons'

/**
 * DzSplitButtonParts documents the three compound parts that make up a split
 * button in isolation and in composition:
 *
 * - `DzSplitButton` — root provider; sets variant/size/tone/disabled/loading
 *   context via typed injection (ADR-08)
 * - `DzSplitButtonAction` — primary action button (left segment)
 * - `DzSplitButtonMenu` — dropdown trigger button (right segment, chevron)
 *
 * For full interactive demos (open menu, play() tests) see the
 * `Core/Buttons/DzSplitButton` story.
 */
const meta = {
  title: 'Core/Buttons/DzSplitButtonParts',
  component: DzSplitButtonAction,
  subcomponents: { DzSplitButtonMenu, DzSplitButton },
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // DzSplitButtonAction
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the primary action button.',
      table: { category: 'DzSplitButtonAction' },
    },
  },
  args: {
    ariaLabel: 'Primary action',
  },
} satisfies Meta<typeof DzSplitButtonAction>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — full composition
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <DzSplitButton aria-label="Save actions">
        <DzSplitButtonAction>Save</DzSplitButtonAction>
        <DzSplitButtonMenu aria-label="More save options">▾</DzSplitButtonMenu>
      </DzSplitButton>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Compound Composition — annotated anatomy
// ---------------------------------------------------------------------------

/**
 * Annotated anatomy story showing all three compound parts and how they nest.
 *
 * Composition rules:
 * 1. `DzSplitButton` (root) must wrap both children — it provides the shared
 *    context (variant, size, tone, disabled, loading) via Vue inject (ADR-08).
 * 2. `DzSplitButtonAction` renders the primary action segment; bind a `@click`
 *    handler here for the main operation.
 * 3. `DzSplitButtonMenu` renders the chevron/trigger segment; bind `@click` to
 *    open your dropdown/popover. Pass `aria-label` to name the trigger for
 *    screen readers independently of the action label.
 */
export const CompoundComposition: Story = {
  name: 'Compound Composition',
  parameters: {
    docs: {
      description: {
        story:
          'Annotated anatomy of all three compound parts. ' +
          '`DzSplitButton` (root) injects shared context into both children via ADR-08 typed injection. ' +
          '`DzSplitButtonAction` owns the primary click handler. ' +
          '`DzSplitButtonMenu` owns the dropdown trigger.',
      },
    },
  },
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="space-y-6">
        <!-- 1. Root: DzSplitButton -->
        <!-- Sets variant / size / tone / disabled / loading context via inject -->
        <div>
          <p class="mb-2 text-xs font-mono text-[var(--dz-muted-foreground)]">
            &lt;DzSplitButton&gt; — root context provider
          </p>
          <DzSplitButton tone="primary" aria-label="Publish actions">

            <!-- 2. DzSplitButtonAction — left segment, primary click -->
            <DzSplitButtonAction aria-label="Publish">
              Publish
            </DzSplitButtonAction>

            <!-- 3. DzSplitButtonMenu — right segment, dropdown trigger -->
            <DzSplitButtonMenu aria-label="More publish options">▾</DzSplitButtonMenu>

          </DzSplitButton>
        </div>

        <!-- Minimal form: menu uses default chevron slot -->
        <div>
          <p class="mb-2 text-xs font-mono text-[var(--dz-muted-foreground)]">
            Minimal — default menu slot
          </p>
          <DzSplitButton aria-label="Save actions">
            <DzSplitButtonAction>Save</DzSplitButtonAction>
            <DzSplitButtonMenu />
          </DzSplitButton>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery — all ButtonVariants
// ---------------------------------------------------------------------------

export const VariantGallery: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSplitButton variant="solid" aria-label="Solid split">
          <DzSplitButtonAction>Solid</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="outline" aria-label="Outline split">
          <DzSplitButtonAction>Outline</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="ghost" aria-label="Ghost split">
          <DzSplitButtonAction>Ghost</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="text" aria-label="Text split">
          <DzSplitButtonAction>Text</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton variant="link" aria-label="Link split">
          <DzSplitButtonAction>Link</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery — all CanonicalTones
// ---------------------------------------------------------------------------

export const ToneGallery: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSplitButton tone="neutral" aria-label="Neutral split">
          <DzSplitButtonAction>Neutral</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="primary" aria-label="Primary split">
          <DzSplitButtonAction>Primary</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="success" aria-label="Success split">
          <DzSplitButtonAction>Success</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="warning" aria-label="Warning split">
          <DzSplitButtonAction>Warning</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="danger" aria-label="Danger split">
          <DzSplitButtonAction>Danger</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="info" aria-label="Info split">
          <DzSplitButtonAction>Info</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzSplitButton tone="neutral" aria-label="Neutral split">
          <DzSplitButtonAction>Neutral</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="primary" aria-label="Primary split">
          <DzSplitButtonAction>Primary</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="success" aria-label="Success split">
          <DzSplitButtonAction>Success</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="warning" aria-label="Warning split">
          <DzSplitButtonAction>Warning</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="danger" aria-label="Danger split">
          <DzSplitButtonAction>Danger</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
        <DzSplitButton tone="info" aria-label="Info split">
          <DzSplitButtonAction>Info</DzSplitButtonAction>
          <DzSplitButtonMenu />
        </DzSplitButton>
      </div>
    `,
  }),
}
