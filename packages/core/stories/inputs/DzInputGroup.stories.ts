import type { Meta, StoryObj } from '@storybook/vue3'
import { Copy, Globe, Mail } from 'lucide-vue-next'
import { DzButton } from '../../src/components/buttons'
import { DzInput, DzInputGroup } from '../../src/components/inputs'
import { DzIcon } from '../../src/components/media'

/**
 * DzInputGroup is a compound wrapper that groups an input element with
 * prefix and/or suffix addon content (text labels, icons, buttons).
 *
 * It supports five sizes and prefix/suffix addon slots that render
 * visually connected to the input. The default slot accepts the input
 * component (e.g., DzInput).
 */
const meta = {
  title: 'Core/Inputs/DzInputGroup',
  component: DzInputGroup,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
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
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzInputGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzInputGroup, DzInput },
    setup() {
      return { args }
    },
    template: `
      <DzInputGroup v-bind="args" class="max-w-sm">
        <template #prefix>https://</template>
        <DzInput placeholder="example.com" />
      </DzInputGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup size="xs">
          <template #prefix>https://</template>
          <DzInput size="xs" placeholder="example.com" />
        </DzInputGroup>
        <DzInputGroup size="sm">
          <template #prefix>https://</template>
          <DzInput size="sm" placeholder="example.com" />
        </DzInputGroup>
        <DzInputGroup size="md">
          <template #prefix>https://</template>
          <DzInput size="md" placeholder="example.com" />
        </DzInputGroup>
        <DzInputGroup size="lg">
          <template #prefix>https://</template>
          <DzInput size="lg" placeholder="example.com" />
        </DzInputGroup>
        <DzInputGroup size="xl">
          <template #prefix>https://</template>
          <DzInput size="xl" placeholder="example.com" />
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Prefix Addon
// ---------------------------------------------------------------------------

export const WithPrefix: Story = {
  name: 'With Text Prefix',
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup>
          <template #prefix>https://</template>
          <DzInput placeholder="example.com" />
        </DzInputGroup>
        <DzInputGroup>
          <template #prefix>$</template>
          <DzInput placeholder="0.00" />
        </DzInputGroup>
        <DzInputGroup>
          <template #prefix>+1</template>
          <DzInput placeholder="(555) 000-0000" />
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Suffix Addon
// ---------------------------------------------------------------------------

export const WithSuffix: Story = {
  name: 'With Text Suffix',
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup>
          <DzInput placeholder="my-site" />
          <template #suffix>.com</template>
        </DzInputGroup>
        <DzInputGroup>
          <DzInput placeholder="100" />
          <template #suffix>kg</template>
        </DzInputGroup>
        <DzInputGroup>
          <DzInput placeholder="user" />
          <template #suffix>@company.com</template>
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Prefix and Suffix
// ---------------------------------------------------------------------------

export const WithPrefixAndSuffix: Story = {
  name: 'With Prefix and Suffix',
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup>
          <template #prefix>https://</template>
          <DzInput placeholder="my-site" />
          <template #suffix>.com</template>
        </DzInputGroup>
        <DzInputGroup>
          <template #prefix>$</template>
          <DzInput placeholder="0.00" />
          <template #suffix>USD</template>
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Icon Addons
// ---------------------------------------------------------------------------

export const WithIconAddons: Story = {
  name: 'With Icon Addons',
  render: () => ({
    components: { DzInputGroup, DzInput, DzIcon },
    setup() { return { Globe, Mail } },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup>
          <template #prefix><DzIcon :icon="Globe" size="sm" /></template>
          <DzInput placeholder="example.com" />
        </DzInputGroup>
        <DzInputGroup>
          <template #prefix><DzIcon :icon="Mail" size="sm" /></template>
          <DzInput placeholder="user@example.com" />
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Button Addon
// ---------------------------------------------------------------------------

export const WithButtonAddon: Story = {
  name: 'With Button Addon',
  render: () => ({
    components: { DzInputGroup, DzInput, DzButton, DzIcon },
    setup() { return { Copy } },
    template: `
      <div class="flex flex-col gap-4 max-w-md">
        <DzInputGroup>
          <DzInput model-value="https://dzip-ui.dev/share/abc123" readonly />
          <template #suffix>
            <DzButton size="sm" variant="ghost" tone="neutral">
              <DzIcon :icon="Copy" size="sm" />
            </DzButton>
          </template>
        </DzInputGroup>
        <DzInputGroup>
          <DzInput placeholder="Enter coupon code" />
          <template #suffix>
            <DzButton size="sm" variant="solid" tone="primary">Apply</DzButton>
          </template>
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup>
          <template #prefix>$</template>
          <DzInput placeholder="Default" />
        </DzInputGroup>
        <DzInputGroup disabled>
          <template #prefix>$</template>
          <DzInput disabled placeholder="Disabled" />
        </DzInputGroup>
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
    components: { DzInputGroup, DzInput },
    setup() {
      return { args }
    },
    template: `
      <DzInputGroup v-bind="args" class="max-w-sm">
        <template #prefix>https://</template>
        <DzInput disabled placeholder="example.com" />
      </DzInputGroup>
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
    components: { DzInputGroup, DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <DzInputGroup>
          <template #prefix>https://</template>
          <DzInput placeholder="example.com" />
          <template #suffix>.com</template>
        </DzInputGroup>
        <DzInputGroup>
          <template #prefix>$</template>
          <DzInput placeholder="0.00" />
          <template #suffix>USD</template>
        </DzInputGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: URL Builder
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzInputGroup, DzInput },
    data() {
      return { domain: '' }
    },
    template: `
      <div class="space-y-3 max-w-sm">
        <DzInputGroup>
          <template #prefix>https://</template>
          <DzInput v-model="domain" placeholder="my-site" />
          <template #suffix>.com</template>
        </DzInputGroup>
        <p class="text-sm text-gray-500">
          Full URL: <code class="bg-gray-100 px-1 rounded">https://{{ domain || 'my-site' }}.com</code>
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Labels & Groups',
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">
          DzInputGroup renders addons as visual labels connected to the input.
          Use aria-label on the input for screen reader context.
        </p>
        <div>
          <label class="block text-sm font-medium mb-1">Website URL</label>
          <DzInputGroup aria-label="Website URL group">
            <template #prefix>https://</template>
            <DzInput aria-label="Website domain" placeholder="example.com" />
          </DzInputGroup>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <DzInputGroup aria-label="Email group">
            <DzInput aria-label="Email username" placeholder="username" />
            <template #suffix>@company.com</template>
          </DzInputGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: URL Input with Protocol
// ---------------------------------------------------------------------------

export const RealWorldUrlInput: Story = {
  name: 'Real World: URL Input',
  render: () => ({
    components: { DzInputGroup, DzInput },
    template: `
      <div class="max-w-md space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Website</label>
          <DzInputGroup>
            <template #prefix>https://</template>
            <DzInput placeholder="www.example.com" />
          </DzInputGroup>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Callback URL</label>
          <DzInputGroup>
            <template #prefix>https://</template>
            <DzInput placeholder="api.example.com/callback" />
          </DzInputGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Pricing Input
// ---------------------------------------------------------------------------

export const RealWorldPricingInput: Story = {
  name: 'Real World: Pricing Input',
  render: () => ({
    components: { DzInputGroup, DzInput },
    data() {
      return { price: '', weight: '' }
    },
    template: `
      <div class="max-w-sm space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Price</label>
          <DzInputGroup>
            <template #prefix>$</template>
            <DzInput v-model="price" placeholder="0.00" />
            <template #suffix>USD</template>
          </DzInputGroup>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Weight</label>
          <DzInputGroup>
            <DzInput v-model="weight" placeholder="0" />
            <template #suffix>kg</template>
          </DzInputGroup>
        </div>
      </div>
    `,
  }),
}
