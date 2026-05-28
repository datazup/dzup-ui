import type { Meta, StoryObj } from '@storybook/vue3'
import DzupDashboard from './dzup/DzupDashboard.vue'
import FreestyleDashboard from './freestyle/FreestyleDashboard.vue'

const meta: Meta = {
  title: 'Visual Refresh/Dashboard',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleDashboard },
    template: '<FreestyleDashboard />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupDashboard },
    template: '<DzupDashboard />',
  }),
}
