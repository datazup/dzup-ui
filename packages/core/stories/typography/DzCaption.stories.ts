import type { Meta, StoryObj } from '@storybook/vue3'
import { DzCaption } from '../../src/components/typography'

/**
 * DzCaption renders small text for captions, annotations, helper text,
 * and validation messages.
 *
 * Uses a `<small>` element. The `tone` prop applies semantic coloring
 * for contextual feedback (e.g., success, warning, danger).
 */
const meta = {
  title: 'Core/Typography/DzCaption',
  component: DzCaption,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    tone: {
      control: 'select',
      options: ['default', 'muted', 'success', 'warning', 'danger'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'muted' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    tone: 'muted',
  },
} satisfies Meta<typeof DzCaption>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCaption },
    setup() {
      return { args }
    },
    template: '<DzCaption v-bind="args">Last updated: 2 hours ago</DzCaption>',
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzCaption },
    template: `
      <div class="space-y-3">
        <DzCaption tone="default">Default tone caption</DzCaption>
        <br />
        <DzCaption tone="muted">Muted tone caption</DzCaption>
        <br />
        <DzCaption tone="success">Success: File uploaded successfully</DzCaption>
        <br />
        <DzCaption tone="warning">Warning: This action cannot be undone</DzCaption>
        <br />
        <DzCaption tone="danger">Error: This field is required</DzCaption>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Form Fields
// ---------------------------------------------------------------------------

export const WithFormFields: Story = {
  name: 'With Form Fields',
  render: () => ({
    components: { DzCaption },
    template: `
      <div class="space-y-6 max-w-sm">
        <div>
          <label class="block text-sm font-medium mb-1" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="you@example.com"
            aria-describedby="email-hint"
          />
          <DzCaption id="email-hint" tone="muted">We will never share your email.</DzCaption>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" for="password">Password</label>
          <input
            id="password"
            type="password"
            class="w-full rounded-md border border-red-300 px-3 py-2 text-sm"
            aria-invalid="true"
            aria-describedby="password-error"
          />
          <DzCaption id="password-error" tone="danger">Password must be at least 8 characters.</DzCaption>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" for="username">Username</label>
          <input
            id="username"
            type="text"
            value="johndoe"
            class="w-full rounded-md border border-green-300 px-3 py-2 text-sm"
            aria-describedby="username-success"
          />
          <DzCaption id="username-success" tone="success">Username is available!</DzCaption>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// As Metadata
// ---------------------------------------------------------------------------

export const AsMetadata: Story = {
  name: 'As Metadata',
  render: () => ({
    components: { DzCaption },
    template: `
      <div class="space-y-4 max-w-sm">
        <div class="rounded-md border p-4">
          <h3 class="font-semibold">Project Report</h3>
          <DzCaption tone="muted">Created by John Doe</DzCaption>
          <span class="mx-1 text-gray-300">|</span>
          <DzCaption tone="muted">March 28, 2026</DzCaption>
          <span class="mx-1 text-gray-300">|</span>
          <DzCaption tone="muted">PDF, 2.4 MB</DzCaption>
        </div>
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
    components: { DzCaption },
    template: `
      <div class="space-y-3">
        <DzCaption tone="default">Default tone caption</DzCaption>
        <br />
        <DzCaption tone="muted">Muted tone caption</DzCaption>
        <br />
        <DzCaption tone="success">Success message</DzCaption>
        <br />
        <DzCaption tone="warning">Warning message</DzCaption>
        <br />
        <DzCaption tone="danger">Error message</DzCaption>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ARIA Integration',
  render: () => ({
    components: { DzCaption },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">
          DzCaption renders as a &lt;small&gt; element. Use the id prop with
          aria-describedby on the associated input so screen readers announce
          the caption when the field receives focus.
        </p>
        <div>
          <label class="block text-sm font-medium mb-1" for="a11y-input">Name</label>
          <input
            id="a11y-input"
            type="text"
            class="w-full rounded-md border px-3 py-2 text-sm"
            aria-describedby="a11y-caption"
          />
          <DzCaption id="a11y-caption" tone="muted">
            Enter your full legal name as it appears on your ID.
          </DzCaption>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Image Caption
// ---------------------------------------------------------------------------

export const RealWorldImageCaption: Story = {
  name: 'Real World: Image Caption',
  render: () => ({
    components: { DzCaption },
    template: `
      <div class="max-w-sm">
        <figure>
          <div class="aspect-video rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
            [Image placeholder]
          </div>
          <figcaption class="mt-2">
            <DzCaption tone="muted">
              Figure 1: Architecture diagram showing the component composition pattern
              used in the dzip-ui design system.
            </DzCaption>
          </figcaption>
        </figure>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Validation Messages
// ---------------------------------------------------------------------------

export const RealWorldValidation: Story = {
  name: 'Real World: Validation Messages',
  render: () => ({
    components: { DzCaption },
    template: `
      <div class="space-y-4 max-w-sm">
        <h3 class="text-lg font-semibold">Form Validation</h3>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value="invalid-email"
            class="w-full rounded-md border border-red-300 px-3 py-2 text-sm"
          />
          <DzCaption tone="danger">Please enter a valid email address.</DzCaption>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            value="15"
            class="w-full rounded-md border border-yellow-300 px-3 py-2 text-sm"
          />
          <DzCaption tone="warning">You must be at least 18 years old to register.</DzCaption>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value="johndoe42"
            class="w-full rounded-md border border-green-300 px-3 py-2 text-sm"
          />
          <DzCaption tone="success">Username is available.</DzCaption>
        </div>
      </div>
    `,
  }),
}
