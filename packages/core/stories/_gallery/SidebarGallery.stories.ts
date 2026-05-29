import type { Meta, StoryObj } from '@storybook/vue3'
import BrandScope from './BrandScope.vue'
import DzupSidebar from './dzup/DzupSidebar.vue'

const meta: Meta = {
  title: 'Visual Refresh/Sidebar',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const DzupUI: Story = {
  render: () => ({
    components: { DzupSidebar },
    template: '<DzupSidebar />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupSidebar },
    template: '<BrandScope><DzupSidebar /></BrandScope>',
  }),
}
