/**
 * STORY AUTHORING TEMPLATE (TASK-0.8) — referenced from Contributing.mdx.
 *
 * Copy this file to `packages/core/stories/{family}/DzYourComponent.stories.ts`,
 * replace `DzExample`, and keep the section structure. It encodes the house style:
 * grouped `argTypes`, the required story set, a status tag, and an awaited `play()`.
 *
 * NOTE: this file ends in `.template.ts` (not `.stories.ts`) so Storybook's glob
 * does not load it. It is intentionally not type-checked against a real component.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
// Replace with your component import:
// import { DzExample } from '../../src/components/{family}'
import {
  a11yArgTypes,
  darkModeDecorator,
  DemoRow,
  sizeArgType,
  SIZES,
  toneArgType,
  TONES,
} from '../_shared'

declare const DzExample: unknown // remove — placeholder so the template type-checks standalone

const meta = {
  title: 'Core/{Family}/DzExample',
  component: DzExample as never,
  // Exactly one status tag (see Contributing → Component status).
  tags: ['autodocs', 'status:experimental'],
  parameters: {
    docs: {
      description: {
        component:
          'One-sentence summary of what DzExample is and when to reach for it.',
      },
    },
    // No `design:` parameter — `@storybook/addon-designs` was removed in
    // TASK-FREE-12 because no Figma library exists to link. See
    // Contributing → "Design reference" for how to bring it back if one lands.
  },
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    size: sizeArgType,
    tone: toneArgType,
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility (canonical, shared)
    ...a11yArgTypes,
  },
  args: {
    variant: 'solid',
    size: 'md',
    tone: 'primary',
    disabled: false,
  },
} satisfies Meta<typeof DzExample>

export default meta
type Story = StoryObj<typeof meta>

// 1) Default — controls-driven
export const Default: Story = {
  render: args => ({
    components: { DzExample },
    setup: () => ({ args }),
    template: '<DzExample v-bind="args">Example</DzExample>',
  }),
}

// 2) Gallery/matrix — iterate canonical option arrays
export const SizeGallery: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzExample, DemoRow },
    setup: () => ({ SIZES }),
    template: `
      <DemoRow align="end">
        <DzExample v-for="s in SIZES" :key="s" :size="s">{{ s }}</DzExample>
      </DemoRow>
    `,
  }),
}

export const ToneGallery: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzExample, DemoRow },
    setup: () => ({ TONES }),
    template: `
      <DemoRow>
        <DzExample v-for="t in TONES" :key="t" :tone="t">{{ t }}</DzExample>
      </DemoRow>
    `,
  }),
}

// 3) States
export const States: Story = {
  render: () => ({
    components: { DzExample, DemoRow },
    template: `
      <DemoRow>
        <DzExample>Default</DzExample>
        <DzExample disabled>Disabled</DzExample>
      </DemoRow>
    `,
  }),
}

// 4) DarkMode — shared decorator, never inline the wrapper
export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzExample, DemoRow },
    template: '<DemoRow><DzExample>Dark</DzExample></DemoRow>',
  }),
}

// 5) Accessibility
export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzExample, DemoRow },
    template: `
      <DemoRow>
        <DzExample aria-label="First">First</DzExample>
        <DzExample aria-label="Second">Second</DzExample>
      </DemoRow>
    `,
  }),
}

// 6) Real-world usage (port/derive from the sandbox where one exists)
export const RealWorldUsage: Story = {
  name: 'Real World: In Context',
  render: () => ({
    components: { DzExample },
    template: '<div class="max-w-sm"><DzExample>Contextual example</DzExample></div>',
  }),
}

// 7) play() interaction test — await every step
export const Interactive: Story = {
  render: () => ({
    components: { DzExample },
    template: '<DzExample>Click me</DzExample>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const el = canvas.getByText(/click me/i)
    await userEvent.click(el)
    await expect(el).toBeVisible()
  },
}
