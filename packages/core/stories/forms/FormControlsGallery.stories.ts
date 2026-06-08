import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DemoSection, darkModeDecorator, galleryDecorator } from '../_shared'
import type { DzSelectItem } from '../../src/components/forms'
import { DzSelect, DzSlider, DzSwitch } from '../../src/components/forms'

/**
 * Control Variants & Sizes — a cross-component gallery ported from the sandbox
 * `FormsPage`, contrasting how appearance props read across the form family:
 * DzSelect variants, DzSwitch sizes, and DzSlider tones side by side.
 */
const meta = {
  title: 'Core/Forms/Control Gallery',
  component: undefined,
  tags: ['autodocs', 'status:stable'],
  parameters: {
    docs: {
      description: {
        component:
          'Side-by-side gallery of form-control appearance props: Select variants, Switch sizes, and Slider tones.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const selectItems: DzSelectItem[] = [
  { label: 'United States', value: 'us' },
  { label: 'Germany', value: 'de' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
]

const galleryComponents = { DemoSection, DzSelect, DzSlider, DzSwitch }

const galleryTemplate = `
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <DemoSection label="Select Variants" class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
      <div class="space-y-2">
        <DzSelect :items="items" variant="outline" placeholder="Outline" />
        <DzSelect :items="items" variant="filled" placeholder="Filled" />
        <DzSelect :items="items" variant="underlined" placeholder="Underlined" />
      </div>
    </DemoSection>

    <DemoSection label="Switch Sizes" class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
      <div class="space-y-2">
        <DzSwitch size="sm" :model-value="false">Small</DzSwitch>
        <DzSwitch size="md" :model-value="true">Medium</DzSwitch>
        <DzSwitch size="lg" :model-value="true">Large</DzSwitch>
      </div>
    </DemoSection>

    <DemoSection label="Slider Tones" class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
      <div class="space-y-3 pt-1">
        <DzSlider :model-value="30" tone="danger" />
        <DzSlider :model-value="55" tone="warning" />
        <DzSlider :model-value="80" tone="success" />
      </div>
    </DemoSection>
  </div>
`

// ---------------------------------------------------------------------------
// Default gallery
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Variants & Sizes',
  decorators: [galleryDecorator],
  render: () => ({
    components: galleryComponents,
    setup: () => ({ items: selectItems }),
    template: galleryTemplate,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Variants & Sizes – Dark Mode',
  decorators: [darkModeDecorator],
  render: () => ({
    components: galleryComponents,
    setup: () => ({ items: selectItems }),
    template: galleryTemplate,
  }),
}
