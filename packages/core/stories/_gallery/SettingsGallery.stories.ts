import type { Meta, StoryObj } from '@storybook/vue3'
import BrandScope from './BrandScope.vue'
import DzupSettings from './dzup/DzupSettings.vue'

const meta: Meta = {
  title: 'Visual Refresh/Settings',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const DzupUI: Story = {
  render: () => ({
    components: { DzupSettings },
    template: '<DzupSettings />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupSettings },
    template: '<BrandScope><DzupSettings /></BrandScope>',
  }),
}
