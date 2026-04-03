import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import { DzStepper, DzStepperItem } from '../../src/components/navigation'

/**
 * DzStepperItem is a compound sub-part of DzStepper.
 *
 * Each step item supports a title, description, optional flag, and content
 * that displays when the step is active. DzStepperItem receives context
 * (active step, orientation, total steps) from DzStepper via inject (ADR-08).
 *
 * The indicator slot allows custom step indicators based on step number and status.
 */

const meta = {
  title: 'Core/Navigation/DzStepperItem',
  component: DzStepperItem,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Step title text',
      table: { category: 'Appearance' },
    },
    description: {
      control: 'text',
      description: 'Step description text',
      table: { category: 'Appearance' },
    },
    optional: {
      control: 'boolean',
      description: 'Whether this step is optional',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof DzStepperItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Steps in context
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper :model-value="1" aria-label="Registration steps">
        <DzStepperItem title="Account" description="Create your account" />
        <DzStepperItem title="Profile" description="Fill in your profile" />
        <DzStepperItem title="Review" description="Review and submit" />
      </DzStepper>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Step States (Completed, Active, Upcoming)
// ---------------------------------------------------------------------------

export const StepStates: Story = {
  name: 'Step States',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-sm font-medium mb-2">Step 1 Active (step 0)</p>
          <DzStepper :model-value="0" aria-label="Step 1 active">
            <DzStepperItem title="Account" description="Create account" />
            <DzStepperItem title="Profile" description="Fill profile" />
            <DzStepperItem title="Done" description="Finish up" />
          </DzStepper>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Step 2 Active (step 1)</p>
          <DzStepper :model-value="1" aria-label="Step 2 active">
            <DzStepperItem title="Account" description="Create account" />
            <DzStepperItem title="Profile" description="Fill profile" />
            <DzStepperItem title="Done" description="Finish up" />
          </DzStepper>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">All Completed (step 2)</p>
          <DzStepper :model-value="2" aria-label="All completed">
            <DzStepperItem title="Account" description="Create account" />
            <DzStepperItem title="Profile" description="Fill profile" />
            <DzStepperItem title="Done" description="Finish up" />
          </DzStepper>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Optional Step
// ---------------------------------------------------------------------------

export const OptionalStep: Story = {
  name: 'With Optional Step',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper :model-value="0" aria-label="Steps with optional">
        <DzStepperItem title="Account" description="Required step" />
        <DzStepperItem title="Avatar" description="Upload an avatar" optional />
        <DzStepperItem title="Confirm" description="Review and confirm" />
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
    components: { DzStepper, DzStepperItem, DzButton },
    data() {
      return { step: 0 }
    },
    template: `
      <div class="max-w-lg space-y-4">
        <DzStepper v-model="step" aria-label="Wizard steps">
          <DzStepperItem title="Details" description="Enter your details">
            <div class="p-4 border rounded mt-4">
              <p class="text-sm">Step 1: Enter your name and email address.</p>
              <DzButton class="mt-3" size="sm" @click="step = 1">Next</DzButton>
            </div>
          </DzStepperItem>
          <DzStepperItem title="Preferences" description="Set preferences">
            <div class="p-4 border rounded mt-4">
              <p class="text-sm">Step 2: Choose your notification preferences.</p>
              <div class="flex gap-2 mt-3">
                <DzButton size="sm" variant="outline" @click="step = 0">Back</DzButton>
                <DzButton size="sm" @click="step = 2">Next</DzButton>
              </div>
            </div>
          </DzStepperItem>
          <DzStepperItem title="Confirm" description="Review and submit">
            <div class="p-4 border rounded mt-4">
              <p class="text-sm">Step 3: Review your information and submit.</p>
              <div class="flex gap-2 mt-3">
                <DzButton size="sm" variant="outline" @click="step = 1">Back</DzButton>
                <DzButton size="sm" tone="primary">Submit</DzButton>
              </div>
            </div>
          </DzStepperItem>
        </DzStepper>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Indicator Slot
// ---------------------------------------------------------------------------

export const CustomIndicator: Story = {
  name: 'Custom Indicator Slot',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper :model-value="1" aria-label="Custom indicators">
        <DzStepperItem title="Cart" description="Review items">
          <template #indicator="{ step, status }">
            <span class="text-sm">{{ status === 'completed' ? '&#10003;' : step + 1 }}</span>
          </template>
        </DzStepperItem>
        <DzStepperItem title="Shipping" description="Enter address">
          <template #indicator="{ step, status }">
            <span class="text-sm">{{ status === 'completed' ? '&#10003;' : step + 1 }}</span>
          </template>
        </DzStepperItem>
        <DzStepperItem title="Payment" description="Complete purchase">
          <template #indicator="{ step, status }">
            <span class="text-sm">{{ status === 'completed' ? '&#10003;' : step + 1 }}</span>
          </template>
        </DzStepperItem>
      </DzStepper>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Orientation
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  name: 'Vertical Orientation',
  render: () => ({
    components: { DzStepper, DzStepperItem },
    template: `
      <DzStepper :model-value="1" orientation="vertical" aria-label="Vertical steps">
        <DzStepperItem title="Requirements" description="Gather project requirements" />
        <DzStepperItem title="Design" description="Create mockups and prototypes" />
        <DzStepperItem title="Development" description="Build the application" />
        <DzStepperItem title="Testing" description="QA and user acceptance" />
      </DzStepper>
    `,
  }),
}
