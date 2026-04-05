import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import { DzCard, DzCardBody, DzCardFooter, DzCardHeader } from '../../src/components/cards'
import { DzFormDescription, DzFormField, DzFormLabel, DzFormMessage } from '../../src/components/forms'
import { DzInput } from '../../src/components/inputs'
import { DzDialog, DzDialogClose, DzDialogContent, DzDialogDescription, DzDialogTitle, DzDialogTrigger } from '../../src/components/overlays'

/**
 * FormComposition demonstrates how DzDialog, DzInput, DzFormField, and DzButton
 * compose together to build a "Create User" modal form.
 *
 * This is a real-world composition pattern showing form validation feedback,
 * accessible field labeling, and dialog-based workflow.
 */
const meta = {
  title: 'Core/Compositions/FormComposition',
  component: undefined,
  tags: ['autodocs', 'composition'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real-world composition: DzDialog + DzFormField + DzInput + DzButton forming a "Create User" modal.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Create User Modal
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Create User Modal',
  render: () => ({
    components: {
      DzButton,
      DzDialog,
      DzDialogTrigger,
      DzDialogContent,
      DzDialogTitle,
      DzDialogDescription,
      DzDialogClose,
      DzFormField,
      DzFormLabel,
      DzFormDescription,
      DzFormMessage,
      DzInput,
    },
    data() {
      return {
        name: '',
        email: '',
        role: '',
        submitted: false,
      }
    },
    methods: {
      handleSubmit() {
        if (this.name && this.email) {
          this.submitted = true
        }
      },
      handleReset() {
        this.name = ''
        this.email = ''
        this.role = ''
        this.submitted = false
      },
    },
    template: `
      <DzDialog>
        <DzDialogTrigger as-child>
          <DzButton tone="primary">Create User</DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="md">
          <DzDialogTitle>Create New User</DzDialogTitle>
          <DzDialogDescription>
            Fill in the details below to invite a new team member.
          </DzDialogDescription>

          <div v-if="submitted" class="mt-4 p-3 rounded bg-green-50 text-green-800 text-sm">
            User created successfully! Invitation sent to {{ email }}.
          </div>

          <form v-else class="space-y-4 mt-4" @submit.prevent="handleSubmit">
            <DzFormField required :invalid="!name && submitted">
              <DzFormLabel>Full Name</DzFormLabel>
              <DzInput
                v-model="name"
                placeholder="Jane Doe"
                :error="!name && submitted ? 'Full name is required' : undefined"
              />
              <DzFormMessage />
            </DzFormField>

            <DzFormField required :invalid="!email && submitted">
              <DzFormLabel>Email Address</DzFormLabel>
              <DzInput
                v-model="email"
                type="email"
                placeholder="jane@example.com"
                :error="!email && submitted ? 'Email address is required' : undefined"
              />
              <DzFormDescription>An invitation will be sent to this address.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Role (optional)</DzFormLabel>
              <DzInput v-model="role" placeholder="e.g. Engineer, Designer" />
            </DzFormField>

            <div class="flex justify-end gap-3 pt-2 border-t">
              <DzDialogClose as-child>
                <DzButton variant="ghost" tone="neutral" type="button" @click="handleReset">Cancel</DzButton>
              </DzDialogClose>
              <DzButton tone="primary" type="submit">Send Invitation</DzButton>
            </div>
          </form>

          <div v-if="submitted" class="flex justify-end mt-4">
            <DzDialogClose as-child>
              <DzButton tone="primary" @click="handleReset">Done</DzButton>
            </DzDialogClose>
          </div>
        </DzDialogContent>
      </DzDialog>
    `,
  }),
}

// ---------------------------------------------------------------------------
// DarkMode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Create User Modal – Dark Mode',
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: {
      DzButton,
      DzCard,
      DzCardHeader,
      DzCardBody,
      DzCardFooter,
      DzFormField,
      DzFormLabel,
      DzFormDescription,
      DzFormMessage,
      DzInput,
    },
    template: `
      <DzCard variant="elevated" class="w-96">
        <DzCardHeader>
          <h2 class="text-base font-semibold">Create User</h2>
          <p class="text-sm text-[var(--dz-colors-text-muted)]">Invite a new team member</p>
        </DzCardHeader>
        <DzCardBody>
          <div class="space-y-4">
            <DzFormField required>
              <DzFormLabel>Full Name</DzFormLabel>
              <DzInput placeholder="Jane Doe" />
              <DzFormMessage />
            </DzFormField>
            <DzFormField required>
              <DzFormLabel>Email Address</DzFormLabel>
              <DzInput type="email" placeholder="jane@example.com" />
              <DzFormDescription>An invitation will be sent to this address.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>
          </div>
        </DzCardBody>
        <DzCardFooter>
          <div class="flex justify-end gap-3 w-full">
            <DzButton variant="ghost" tone="neutral">Cancel</DzButton>
            <DzButton tone="primary">Send Invitation</DzButton>
          </div>
        </DzCardFooter>
      </DzCard>
    `,
  }),
}
