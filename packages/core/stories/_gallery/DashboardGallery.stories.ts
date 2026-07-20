import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupDashboard from './dzup/DzupDashboard.vue'
import FreestyleDashboard from './freestyle/FreestyleDashboard.vue'

const meta: Meta = {
  title: 'Visual Refresh/Dashboard',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
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

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupDashboard },
    template: '<BrandScope><DzupDashboard /></BrandScope>',
  }),
}
