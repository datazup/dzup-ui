import type { Meta, StoryObj } from '@storybook/vue3'
import DzupForm from './dzup/DzupForm.vue'
import FreestyleForm from './freestyle/FreestyleForm.vue'

const meta: Meta = {
  title: 'Visual Refresh/Form',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleForm },
    template: '<FreestyleForm />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupForm },
    template: '<DzupForm />',
  }),
}
