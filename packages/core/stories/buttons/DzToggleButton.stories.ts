import type { Meta, StoryObj } from '@storybook/vue3'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Pin, Star, Underline } from 'lucide-vue-next'
import { ref } from 'vue'
import { DzToggleButton } from '../../src/components/buttons'
import { DzIcon } from '../../src/components/media'

/**
 * DzToggleButton is a button that toggles between pressed and unpressed states.
 *
 * Uses `v-model` (boolean) via `defineModel<boolean>()` (ADR-16) to track
 * the pressed state. Renders `aria-pressed` and `data-state="on|off"` for
 * accessibility and styling.
 */
const meta = {
  title: 'Core/Buttons/DzToggleButton',
  component: DzToggleButton,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'text', 'link'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance' },
    },
    // Behavior
    modelValue: {
      control: 'boolean',
      description: 'Pressed state (v-model)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
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
    ariaLabelledby: {
      control: 'text',
      description: 'ID of labelling element',
      table: { category: 'Accessibility' },
    },
    ariaDescribedby: {
      control: 'text',
      description: 'ID of describing element',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'outline',
    size: 'md',
    disabled: false,
    modelValue: false,
  },
} satisfies Meta<typeof DzToggleButton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzToggleButton, DzIcon, Bold },
    setup() {
      const pressed = ref(args.modelValue)
      return { args, pressed }
    },
    template: `
      <DzToggleButton v-bind="args" v-model="pressed" aria-label="Toggle bold">
        <DzIcon :icon="Bold" size="sm" />
        Bold
      </DzToggleButton>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzToggleButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzToggleButton variant="solid" aria-label="Solid toggle">Solid</DzToggleButton>
        <DzToggleButton variant="outline" aria-label="Outline toggle">Outline</DzToggleButton>
        <DzToggleButton variant="ghost" aria-label="Ghost toggle">Ghost</DzToggleButton>
        <DzToggleButton variant="text" aria-label="Text toggle">Text</DzToggleButton>
        <DzToggleButton variant="link" aria-label="Link toggle">Link</DzToggleButton>
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
    components: { DzToggleButton },
    template: `
      <div class="flex items-end gap-4">
        <DzToggleButton size="xs" aria-label="XS toggle">XS</DzToggleButton>
        <DzToggleButton size="sm" aria-label="SM toggle">SM</DzToggleButton>
        <DzToggleButton size="md" aria-label="MD toggle">MD</DzToggleButton>
        <DzToggleButton size="lg" aria-label="LG toggle">LG</DzToggleButton>
        <DzToggleButton size="xl" aria-label="XL toggle">XL</DzToggleButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzToggleButton },
    setup() {
      return {
        tones: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      }
    },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzToggleButton
          v-for="tone in tones"
          :key="tone"
          :tone="tone"
          :model-value="true"
          :aria-label="tone + ' toggle'"
        >
          {{ tone.charAt(0).toUpperCase() + tone.slice(1) }}
        </DzToggleButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Pressed vs Unpressed
// ---------------------------------------------------------------------------

export const PressedStates: Story = {
  name: 'Pressed vs Unpressed',
  render: () => ({
    components: { DzToggleButton },
    template: `
      <div class="flex gap-4 items-center">
        <DzToggleButton :model-value="false" aria-label="Unpressed toggle">Unpressed</DzToggleButton>
        <DzToggleButton :model-value="true" aria-label="Pressed toggle">Pressed</DzToggleButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled State
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { DzToggleButton },
    setup() {
      return { args }
    },
    template: '<DzToggleButton v-bind="args" aria-label="Disabled toggle">Disabled</DzToggleButton>',
  }),
}

// ---------------------------------------------------------------------------
// States (disabled + pressed combinations)
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzToggleButton },
    template: `
      <div class="flex gap-4 items-center">
        <DzToggleButton :model-value="false" aria-label="Default toggle">Default</DzToggleButton>
        <DzToggleButton :model-value="true" aria-label="Pressed toggle">Pressed</DzToggleButton>
        <DzToggleButton disabled aria-label="Disabled toggle">Disabled</DzToggleButton>
        <DzToggleButton disabled :model-value="true" aria-label="Disabled pressed toggle">Disabled + Pressed</DzToggleButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots (prefix / suffix)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Prefix and Suffix Slots',
  render: () => ({
    components: { DzToggleButton, DzIcon, Star, Pin },
    template: `
      <div class="flex gap-4 items-center">
        <DzToggleButton aria-label="Toggle star">
          <template #prefix><DzIcon :icon="Star" size="sm" /></template>
          Favorite
        </DzToggleButton>
        <DzToggleButton aria-label="Toggle pin">
          Pin
          <template #suffix><DzIcon :icon="Pin" size="sm" /></template>
        </DzToggleButton>
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
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzToggleButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzToggleButton :model-value="false" aria-label="Unpressed toggle">Unpressed</DzToggleButton>
        <DzToggleButton :model-value="true" aria-label="Pressed toggle">Pressed</DzToggleButton>
        <DzToggleButton variant="ghost" :model-value="true" aria-label="Ghost pressed toggle">Ghost Pressed</DzToggleButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Toggle with v-model
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzToggleButton, DzIcon, Bold, Italic, Underline },
    setup() {
      const bold = ref(false)
      const italic = ref(false)
      const underline = ref(false)
      return { bold, italic, underline }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-1">
          <DzToggleButton v-model="bold" variant="ghost" size="sm" aria-label="Toggle bold">
            <DzIcon :icon="Bold" size="sm" />
          </DzToggleButton>
          <DzToggleButton v-model="italic" variant="ghost" size="sm" aria-label="Toggle italic">
            <DzIcon :icon="Italic" size="sm" />
          </DzToggleButton>
          <DzToggleButton v-model="underline" variant="ghost" size="sm" aria-label="Toggle underline">
            <DzIcon :icon="Underline" size="sm" />
          </DzToggleButton>
        </div>
        <p class="text-sm text-gray-500">
          Bold: {{ bold }} | Italic: {{ italic }} | Underline: {{ underline }}
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Focus States
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzToggleButton, DzIcon, AlignLeft, AlignCenter, AlignRight },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Tab through buttons. Each renders aria-pressed="true|false"
          and data-state="on|off" for screen readers and styling hooks.
        </p>
        <div class="flex gap-1">
          <DzToggleButton variant="ghost" :model-value="true" aria-label="Align left">
            <DzIcon :icon="AlignLeft" size="sm" />
          </DzToggleButton>
          <DzToggleButton variant="ghost" :model-value="false" aria-label="Align center">
            <DzIcon :icon="AlignCenter" size="sm" />
          </DzToggleButton>
          <DzToggleButton variant="ghost" :model-value="false" aria-label="Align right">
            <DzIcon :icon="AlignRight" size="sm" />
          </DzToggleButton>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Text Formatting Toolbar
// ---------------------------------------------------------------------------

export const RealWorldToolbar: Story = {
  name: 'Real World: Text Formatting Toolbar',
  render: () => ({
    components: { DzToggleButton, DzIcon, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight },
    setup() {
      const bold = ref(true)
      const italic = ref(false)
      const underline = ref(false)
      return { bold, italic, underline }
    },
    template: `
      <div class="inline-flex items-center gap-1 p-1 rounded-md border border-[var(--dz-colors-border,#e5e7eb)]">
        <DzToggleButton v-model="bold" variant="ghost" size="sm" aria-label="Bold">
          <DzIcon :icon="Bold" size="sm" />
        </DzToggleButton>
        <DzToggleButton v-model="italic" variant="ghost" size="sm" aria-label="Italic">
          <DzIcon :icon="Italic" size="sm" />
        </DzToggleButton>
        <DzToggleButton v-model="underline" variant="ghost" size="sm" aria-label="Underline">
          <DzIcon :icon="Underline" size="sm" />
        </DzToggleButton>
        <div class="w-px h-5 bg-[var(--dz-colors-border,#e5e7eb)] mx-1" />
        <DzToggleButton :model-value="true" variant="ghost" size="sm" aria-label="Align left">
          <DzIcon :icon="AlignLeft" size="sm" />
        </DzToggleButton>
        <DzToggleButton :model-value="false" variant="ghost" size="sm" aria-label="Align center">
          <DzIcon :icon="AlignCenter" size="sm" />
        </DzToggleButton>
        <DzToggleButton :model-value="false" variant="ghost" size="sm" aria-label="Align right">
          <DzIcon :icon="AlignRight" size="sm" />
        </DzToggleButton>
      </div>
    `,
  }),
}
