import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupDataTable from './dzup/DzupDataTable.vue'
import FreestyleDataTable from './freestyle/FreestyleDataTable.vue'

const meta: Meta = {
  title: 'Visual Refresh/Data Table',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleDataTable },
    template: '<FreestyleDataTable />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupDataTable },
    template: '<DzupDataTable />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupDataTable },
    template: '<BrandScope><DzupDataTable /></BrandScope>',
  }),
}
