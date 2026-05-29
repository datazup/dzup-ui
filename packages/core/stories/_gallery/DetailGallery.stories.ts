import type { Meta, StoryObj } from '@storybook/vue3'
import BrandScope from './BrandScope.vue'
import DzupDetail from './dzup/DzupDetail.vue'

const meta: Meta = {
  title: 'Visual Refresh/Detail',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

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
