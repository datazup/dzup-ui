import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { expect, userEvent, within } from 'storybook/test'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-vue-next'
import { DzButton, DzButtonGroup, DzIconButton } from '../../src/components/buttons'

/**
 * DzButtonGroup groups buttons together with shared styling context.
 *
 * It provides `size`, `variant`, `tone`, and `disabled` state to child
 * DzButton components via provide/inject. Supports horizontal and vertical orientation.
 */
const meta = {
  title: 'Core/Buttons/DzButtonGroup',
  component: DzButtonGroup,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size propagated to all child buttons',
      table: { category: 'Appearance' },
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'text', 'link'],
      description: 'Variant propagated to all child buttons',
      table: { category: 'Appearance' },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Tone propagated to all child buttons',
      table: { category: 'Appearance' },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state propagated to all child buttons',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the group',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    orientation: 'horizontal',
    disabled: false,
  },
} satisfies Meta<typeof DzButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default (Horizontal)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzButtonGroup, DzButton },
    setup() {
      return { args }
    },
    template: `
      <DzButtonGroup v-bind="args">
        <DzButton>Left</DzButton>
        <DzButton>Center</DzButton>
        <DzButton>Right</DzButton>
      </DzButtonGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Horizontal
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <DzButtonGroup orientation="horizontal" variant="outline" aria-label="Horizontal group">
        <DzButton>Left</DzButton>
        <DzButton>Center</DzButton>
        <DzButton>Right</DzButton>
      </DzButtonGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <DzButtonGroup orientation="vertical" variant="outline" aria-label="Vertical group">
        <DzButton>Top</DzButton>
        <DzButton>Middle</DzButton>
        <DzButton>Bottom</DzButton>
      </DzButtonGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Group Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <div class="space-y-4">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="flex items-center gap-4">
          <span class="text-xs font-mono w-8 text-gray-500">{{ size }}</span>
          <DzButtonGroup :size="size" variant="outline">
            <DzButton>Left</DzButton>
            <DzButton>Center</DzButton>
            <DzButton>Right</DzButton>
          </DzButtonGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Group Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <div class="space-y-4">
        <div v-for="variant in ['solid', 'outline', 'ghost', 'text']" :key="variant" class="flex items-center gap-4">
          <span class="text-xs font-mono w-16 text-gray-500">{{ variant }}</span>
          <DzButtonGroup :variant="variant">
            <DzButton>Left</DzButton>
            <DzButton>Center</DzButton>
            <DzButton>Right</DzButton>
          </DzButtonGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Group Tones
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <div class="space-y-4">
        <div v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="tone" class="flex items-center gap-4">
          <span class="text-xs font-mono w-16 text-gray-500">{{ tone }}</span>
          <DzButtonGroup :tone="tone" variant="outline">
            <DzButton>Left</DzButton>
            <DzButton>Center</DzButton>
            <DzButton>Right</DzButton>
          </DzButtonGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Group
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <DzButtonGroup disabled variant="outline" aria-label="Disabled group">
        <DzButton>Left</DzButton>
        <DzButton>Center</DzButton>
        <DzButton>Right</DzButton>
      </DzButtonGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Mixed: Child Overrides Group Props
// ---------------------------------------------------------------------------

export const ChildOverrides: Story = {
  name: 'Child Prop Override',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Group sets variant="outline" tone="neutral", but individual buttons can override.</p>
        <DzButtonGroup variant="outline" tone="neutral">
          <DzButton>Default</DzButton>
          <DzButton tone="primary">Primary Override</DzButton>
          <DzButton tone="danger">Danger Override</DzButton>
        </DzButtonGroup>
      </div>
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
    components: { DzButtonGroup, DzButton },
    template: `
      <div class="flex flex-col items-start gap-4">
        <DzButtonGroup variant="solid">
          <DzButton>Left</DzButton>
          <DzButton>Center</DzButton>
          <DzButton>Right</DzButton>
        </DzButtonGroup>
        <DzButtonGroup variant="outline">
          <DzButton>Left</DzButton>
          <DzButton>Center</DzButton>
          <DzButton>Right</DzButton>
        </DzButtonGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Text Formatting Toolbar
// ---------------------------------------------------------------------------

export const RealWorldToolbar: Story = {
  name: 'Real World: Formatting Toolbar',
  render: () => ({
    components: { DzButtonGroup, DzIconButton },
    setup() { return { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } },
    template: `
      <div class="flex gap-3">
        <DzButtonGroup variant="ghost" tone="neutral" size="sm" aria-label="Text formatting">
          <DzIconButton :icon="Bold" aria-label="Bold" />
          <DzIconButton :icon="Italic" aria-label="Italic" />
          <DzIconButton :icon="Underline" aria-label="Underline" />
        </DzButtonGroup>
        <DzButtonGroup variant="ghost" tone="neutral" size="sm" aria-label="Text alignment">
          <DzIconButton :icon="AlignLeft" aria-label="Align left" />
          <DzIconButton :icon="AlignCenter" aria-label="Align center" />
          <DzIconButton :icon="AlignRight" aria-label="Align right" />
        </DzButtonGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Segmented Control
// ---------------------------------------------------------------------------

export const RealWorldSegmented: Story = {
  name: 'Real World: Segmented Control',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    data() {
      return { selected: 'day' }
    },
    template: `
      <DzButtonGroup variant="outline" size="sm" aria-label="View mode">
        <DzButton
          :variant="selected === 'day' ? 'solid' : 'outline'"
          @click="selected = 'day'"
        >Day</DzButton>
        <DzButton
          :variant="selected === 'week' ? 'solid' : 'outline'"
          @click="selected = 'week'"
        >Week</DzButton>
        <DzButton
          :variant="selected === 'month' ? 'solid' : 'outline'"
          @click="selected = 'month'"
        >Month</DzButton>
      </DzButtonGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Group Semantics + Focus
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The group renders role="group" with an accessible label. Each child
          button is independently focusable; Tab moves through them in order.
        </p>
        <DzButtonGroup variant="outline" aria-label="Document actions">
          <DzButton>Cut</DzButton>
          <DzButton>Copy</DzButton>
          <DzButton>Paste</DzButton>
        </DzButtonGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Keyboard Navigation (play)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Keyboard Navigation',
  render: () => ({
    components: { DzButtonGroup, DzButton },
    template: `
      <DzButtonGroup variant="outline" aria-label="Document actions">
        <DzButton>Cut</DzButton>
        <DzButton>Copy</DzButton>
        <DzButton>Paste</DzButton>
      </DzButtonGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The group exposes role="group" with its accessible label.
    await expect(canvas.getByRole('group', { name: /document actions/i })).toBeVisible()

    // Each button is reachable via sequential Tab focus.
    const cut = canvas.getByRole('button', { name: /cut/i })
    const copy = canvas.getByRole('button', { name: /copy/i })
    const paste = canvas.getByRole('button', { name: /paste/i })

    cut.focus()
    await expect(cut).toHaveFocus()
    await userEvent.tab()
    await expect(copy).toHaveFocus()
    await userEvent.tab()
    await expect(paste).toHaveFocus()
  },
}
