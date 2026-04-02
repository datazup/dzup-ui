import type { Meta, StoryObj } from '@storybook/vue3'
import { DzStepper, DzStepperItem } from '../../src/components/navigation'

/**
 * DzStepper is a compound step-by-step progress indicator.
 *
 * It supports horizontal and vertical orientations, v-model for the active step,
 * and provides context to children via inject (ADR-08).
 * Each step can have a title, description, and optional flag.
 *
 * Compound children: `DzStepperItem`.
 */
const meta = {
  title: 'Core/Navigation/DzStepper',
  component: DzStepper,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modelValue: {
      control: 'number',
      description: 'Active step index, 0-based (v-model)',
      table: { category: 'Behavior' },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the stepper',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the group',
      table: { category: 'Accessibility', defaultValue: { summary: 'Progress steps' } },
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
    orientation: 'horizontal',
  },
} satisfies Meta<typeof DzStepper>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzStepper, DzStepperItem },
    setup() {
      return { args }
    },
    template: `
      <DzStepper v-bind="args" :model-value="1">
        <DzStepperItem title="Account" description="Create your account" />
        <DzStepperItem title="Profile" description="Complete your profile" />
        <DzStepperItem title="Review" description="Review and submit" />
      </DzStepper>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Step States
// ---------------------------------------------------------------------------

export const AllStepStates: Story = {
  name: 'All Step States',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-sm font-medium mb-4">Step 0 active (first step)</p>
          <DzStepper :model-value="0">
            <DzStepperItem title="Account" description="Create your account" />
            <DzStepperItem title="Profile" description="Complete your profile" />
            <DzStepperItem title="Review" description="Review and submit" />
          </DzStepper>
        </div>
        <div>
          <p class="text-sm font-medium mb-4">Step 1 active (middle step)</p>
          <DzStepper :model-value="1">
            <DzStepperItem title="Account" description="Create your account" />
            <DzStepperItem title="Profile" description="Complete your profile" />
            <DzStepperItem title="Review" description="Review and submit" />
          </DzStepper>
        </div>
        <div>
          <p class="text-sm font-medium mb-4">Step 2 active (last step)</p>
          <DzStepper :model-value="2">
            <DzStepperItem title="Account" description="Create your account" />
            <DzStepperItem title="Profile" description="Complete your profile" />
            <DzStepperItem title="Review" description="Review and submit" />
          </DzStepper>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Orientation
// ---------------------------------------------------------------------------

export const VerticalOrientation: Story = {
  name: 'Vertical Orientation',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper orientation="vertical" :model-value="1">
        <DzStepperItem title="Account Setup" description="Provide your email and create a password" />
        <DzStepperItem title="Personal Info" description="Add your name and contact details" />
        <DzStepperItem title="Preferences" description="Choose your notification settings" />
        <DzStepperItem title="Confirmation" description="Review and confirm your choices" />
      </DzStepper>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Optional Step
// ---------------------------------------------------------------------------

export const WithOptionalStep: Story = {
  name: 'With Optional Step',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper :model-value="0">
        <DzStepperItem title="Account" description="Create your account" />
        <DzStepperItem title="Avatar" description="Upload a profile picture" optional />
        <DzStepperItem title="Review" description="Review and submit" />
      </DzStepper>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Content
// ---------------------------------------------------------------------------

export const WithContent: Story = {
  name: 'With Step Content',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    data() {
      return { step: 0 }
    },
    template: `
      <div class="space-y-6">
        <DzStepper v-model="step">
          <DzStepperItem title="Account" description="Create your account">
            <div v-if="step === 0" class="mt-4 p-4 border rounded text-sm">
              <p class="font-medium mb-2">Account Details</p>
              <p>Enter your email and password to get started.</p>
            </div>
          </DzStepperItem>
          <DzStepperItem title="Profile" description="Complete your profile">
            <div v-if="step === 1" class="mt-4 p-4 border rounded text-sm">
              <p class="font-medium mb-2">Profile Information</p>
              <p>Tell us about yourself.</p>
            </div>
          </DzStepperItem>
          <DzStepperItem title="Done" description="All set!">
            <div v-if="step === 2" class="mt-4 p-4 border rounded text-sm">
              <p class="font-medium mb-2">Complete</p>
              <p>Your account has been created successfully.</p>
            </div>
          </DzStepperItem>
        </DzStepper>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 text-sm border rounded"
            :disabled="step === 0"
            @click="step--"
          >Previous</button>
          <button
            class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
            :disabled="step === 2"
            @click="step++"
          >Next</button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Indicator (Slot)
// ---------------------------------------------------------------------------

export const CustomIndicator: Story = {
  name: 'Custom Indicator (Slot)',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper :model-value="1">
        <DzStepperItem title="Upload">
          <template #indicator="{ step, status }">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              :class="{
                'bg-green-500 text-white': status === 'completed',
                'bg-blue-500 text-white': status === 'active',
                'bg-gray-200 text-gray-500': status === 'upcoming',
              }"
            >
              <span v-if="status === 'completed'">&#10003;</span>
              <span v-else>{{ step }}</span>
            </div>
          </template>
        </DzStepperItem>
        <DzStepperItem title="Process">
          <template #indicator="{ step, status }">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              :class="{
                'bg-green-500 text-white': status === 'completed',
                'bg-blue-500 text-white': status === 'active',
                'bg-gray-200 text-gray-500': status === 'upcoming',
              }"
            >
              <span v-if="status === 'completed'">&#10003;</span>
              <span v-else>{{ step }}</span>
            </div>
          </template>
        </DzStepperItem>
        <DzStepperItem title="Complete">
          <template #indicator="{ step, status }">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              :class="{
                'bg-green-500 text-white': status === 'completed',
                'bg-blue-500 text-white': status === 'active',
                'bg-gray-200 text-gray-500': status === 'upcoming',
              }"
            >
              <span v-if="status === 'completed'">&#10003;</span>
              <span v-else>{{ step }}</span>
            </div>
          </template>
        </DzStepperItem>
      </DzStepper>
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
    components: { DzStepper, DzStepperItem },
    template: `
      <div class="space-y-8">
        <DzStepper :model-value="1">
          <DzStepperItem title="Account" description="Create account" />
          <DzStepperItem title="Profile" description="Fill profile" />
          <DzStepperItem title="Done" description="All complete" />
        </DzStepper>
        <DzStepper orientation="vertical" :model-value="2">
          <DzStepperItem title="Step 1" description="Completed" />
          <DzStepperItem title="Step 2" description="Completed" />
          <DzStepperItem title="Step 3" description="In progress" />
          <DzStepperItem title="Step 4" description="Upcoming" />
        </DzStepper>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzStepper, DzStepperItem },
    data() {
      return { step: 0 }
    },
    template: `
      <div class="space-y-6">
        <p class="text-sm text-gray-500">Active step: <code>{{ step }}</code></p>
        <DzStepper v-model="step">
          <DzStepperItem title="Account" description="Create your account" />
          <DzStepperItem title="Profile" description="Complete your profile" />
          <DzStepperItem title="Verify" description="Verify your email" optional />
          <DzStepperItem title="Done" description="All set!" />
        </DzStepper>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
            :disabled="step === 0"
            @click="step--"
          >Previous</button>
          <button
            class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            :disabled="step === 3"
            @click="step++"
          >Next</button>
          <button
            class="px-3 py-1.5 text-sm border rounded"
            @click="step = 0"
          >Reset</button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Step Semantics',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The stepper renders as a <code>role="group"</code> with <code>aria-label="Progress steps"</code>.
          The active step has <code>aria-current="step"</code>. Each step item has a
          <code>data-state</code> attribute indicating completed, active, or upcoming status.
        </p>
        <DzStepper :model-value="1" aria-label="Registration progress">
          <DzStepperItem title="Account" description="Completed" />
          <DzStepperItem title="Profile" description="Current step" />
          <DzStepperItem title="Review" description="Upcoming" />
        </DzStepper>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Checkout Flow
// ---------------------------------------------------------------------------

export const RealWorldCheckout: Story = {
  name: 'Real World: Checkout Flow',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    data() {
      return { step: 1 }
    },
    template: `
      <div class="max-w-2xl space-y-6">
        <DzStepper v-model="step">
          <DzStepperItem title="Cart" description="Review your items" />
          <DzStepperItem title="Shipping" description="Enter delivery address" />
          <DzStepperItem title="Payment" description="Add payment method" />
          <DzStepperItem title="Confirm" description="Place your order" />
        </DzStepper>
        <div class="border rounded p-6 text-sm">
          <p v-if="step === 0">Review the items in your cart before proceeding.</p>
          <p v-if="step === 1">Enter your shipping address and choose a delivery method.</p>
          <p v-if="step === 2">Add your credit card or select an alternative payment method.</p>
          <p v-if="step === 3">Review your order details and click "Place Order" to complete.</p>
        </div>
        <div class="flex justify-between">
          <button
            class="px-4 py-2 text-sm border rounded disabled:opacity-50"
            :disabled="step === 0"
            @click="step--"
          >Back</button>
          <button
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            :disabled="step === 3"
            @click="step++"
          >{{ step === 2 ? 'Review Order' : 'Continue' }}</button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Onboarding Wizard
// ---------------------------------------------------------------------------

export const RealWorldOnboarding: Story = {
  name: 'Real World: Onboarding Wizard',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    data() {
      return { step: 0 }
    },
    template: `
      <div class="max-w-lg space-y-6">
        <h2 class="text-lg font-semibold">Welcome to Acme</h2>
        <DzStepper v-model="step" orientation="vertical">
          <DzStepperItem title="Connect your account" description="Link your GitHub or GitLab repository">
            <div v-if="step === 0" class="ml-8 mt-2 p-4 border rounded text-sm">
              <p>Select your source code provider and authorize access.</p>
              <button class="mt-3 px-3 py-1.5 text-sm bg-blue-600 text-white rounded" @click="step++">Connect</button>
            </div>
          </DzStepperItem>
          <DzStepperItem title="Configure project" description="Choose framework and settings">
            <div v-if="step === 1" class="ml-8 mt-2 p-4 border rounded text-sm">
              <p>We detected a Vue.js project. Confirm the build settings.</p>
              <button class="mt-3 px-3 py-1.5 text-sm bg-blue-600 text-white rounded" @click="step++">Confirm</button>
            </div>
          </DzStepperItem>
          <DzStepperItem title="Deploy" description="Ship your first deployment" optional>
            <div v-if="step === 2" class="ml-8 mt-2 p-4 border rounded text-sm">
              <p>Your project is ready to deploy.</p>
              <button class="mt-3 px-3 py-1.5 text-sm bg-green-600 text-white rounded" @click="step++">Deploy Now</button>
            </div>
          </DzStepperItem>
        </DzStepper>
      </div>
    `,
  }),
}
