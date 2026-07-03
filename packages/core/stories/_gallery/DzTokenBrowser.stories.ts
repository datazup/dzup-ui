import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import DzTokenBrowser from './DzTokenBrowser.vue'

/**
 * The **Design Token Browser** — a searchable, filterable, copy-to-clipboard view
 * of every `--dz-*` token. Names come from the canonical `@dzup-ui/tokens`
 * package (plus a live stylesheet scan for completeness); values are read live
 * via `getComputedStyle`, so they re-resolve when the **Theme** toolbar flips
 * light ↔ dark. Attached as the docs page for `Guides/Design Tokens`.
 */
const meta = {
  title: 'Guides/Design Tokens',
  component: DzTokenBrowser,
  parameters: {
    layout: 'fullscreen',
    // The browser is a large, live, theme-dependent grid — snapshotting it adds
    // noise without protecting a real component surface.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof DzTokenBrowser>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------

export const Browser: Story = {
  name: 'Browser',
  render: () => ({
    components: { DzTokenBrowser },
    template: '<DzTokenBrowser />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The full manifest renders, including radius + color tokens.
    const search = await canvas.findByRole('searchbox', { name: /filter tokens/i })
    await waitFor(() => expect(canvas.getByText('--dz-radius-md')).toBeInTheDocument())
    expect(canvas.getByText('--dz-colors-primary-500')).toBeInTheDocument()

    // Typing "radius" narrows to radius tokens and drops the color token.
    await userEvent.type(search, 'radius')
    await waitFor(() => {
      expect(canvas.getByText('--dz-radius-md')).toBeInTheDocument()
      expect(canvas.queryByText('--dz-colors-primary-500')).toBeNull()
    })
  },
}
