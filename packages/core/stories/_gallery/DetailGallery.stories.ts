import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupDetail from './dzup/DzupDetail.vue'
import FreestyleDetail from './freestyle/FreestyleDetail.vue'

const meta: Meta = {
  title: 'Visual Refresh/Detail',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleDetail },
    template: '<FreestyleDetail />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupDetail },
    template: '<DzupDetail />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupDetail },
    template: '<BrandScope><DzupDetail /></BrandScope>',
  }),
}
