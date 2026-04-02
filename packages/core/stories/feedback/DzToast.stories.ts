import type { Meta, StoryObj } from '@storybook/vue3'
import type { DzToastContext, ToastItem } from '../../src/components/feedback'
import { inject, ref } from 'vue'
import {
  DZ_TOAST_KEY,
  DzToast,
  DzToastProvider,
  DzToastViewport,
} from '../../src/components/feedback'

/**
 * DzToast is a compound toast notification system built on Reka UI (ADR-07).
 *
 * The system consists of three components:
 * - **DzToastProvider** -- provides toast context and wraps Reka UI ToastProvider
 * - **DzToastViewport** -- renders active toasts at configurable screen positions
 * - **DzToast** -- individual toast notification with title, description, action, and close
 *
 * Toasts support six semantic tones, configurable auto-dismiss duration,
 * and an imperative `add/remove/clear` API via the injected context.
 */
const meta = {
  title: 'Core/Feedback/DzToast',
  component: DzToast,
  tags: ['autodocs'],
  argTypes: {
    // DzToast props (toast object)
    toast: {
      control: false,
      description: 'Toast data item (ToastItem)',
      table: { category: 'Behavior' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
} satisfies Meta<typeof DzToast>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Helper: Inline toast trigger component
// ---------------------------------------------------------------------------

const _ToastTriggerSetup = `
  const context = inject(DZ_TOAST_KEY)
  function addToast(tone, title, description, actionLabel) {
    context?.add({ title, description, tone, actionLabel, duration: 5000 })
  }
`

// ---------------------------------------------------------------------------
// Default (full system demo)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: {
      DzToastProvider,
      DzToastViewport,
      ToastButtons: {
        setup() {
          const ctx = inject(DZ_TOAST_KEY)
          function fire(tone: string) {
            ctx?.add({
              title: `${tone.charAt(0).toUpperCase() + tone.slice(1)} Toast`,
              description: `This is a ${tone} toast notification.`,
              tone: tone as ToastItem['tone'],
              duration: 5000,
            })
          }
          return { fire }
        },
        template: `
          <div class="flex flex-wrap gap-3">
            <button v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']"
              :key="tone"
              class="px-3 py-1.5 text-sm border rounded capitalize"
              @click="fire(tone)">
              {{ tone }}
            </button>
          </div>
        `,
      },
    },
    setup() {
      return { inject, DZ_TOAST_KEY }
    },
    template: `
      <DzToastProvider :duration="5000">
        <ToastButtons />
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery (static, all tones visible)
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzToastProvider, DzToast },
    setup() {
      const toasts: ToastItem[] = [
        { id: '1', title: 'Neutral', description: 'A neutral notification.', tone: 'neutral' },
        { id: '2', title: 'Primary', description: 'A primary notification.', tone: 'primary' },
        { id: '3', title: 'Success', description: 'Operation completed.', tone: 'success' },
        { id: '4', title: 'Warning', description: 'Proceed with caution.', tone: 'warning' },
        { id: '5', title: 'Danger', description: 'Something went wrong.', tone: 'danger' },
        { id: '6', title: 'Info', description: 'Informational message.', tone: 'info' },
      ]
      return { toasts }
    },
    template: `
      <DzToastProvider>
        <div class="space-y-3 max-w-sm">
          <DzToast v-for="t in toasts" :key="t.id" :toast="t" />
        </div>
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Action Button
// ---------------------------------------------------------------------------

export const WithAction: Story = {
  name: 'With Action Button',
  render: () => ({
    components: { DzToastProvider, DzToast },
    setup() {
      const toast: ToastItem = {
        id: 'action-1',
        title: 'Message archived',
        description: 'The conversation has been moved to archive.',
        tone: 'neutral',
        actionLabel: 'Undo',
        onAction: () => {
          // no-op for story
        },
      }
      return { toast }
    },
    template: `
      <DzToastProvider>
        <div class="max-w-sm">
          <DzToast :toast="toast" />
        </div>
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Viewport Positions
// ---------------------------------------------------------------------------

export const ViewportPositions: Story = {
  name: 'Viewport Positions',
  render: () => ({
    components: { DzToastProvider, DzToastViewport },
    setup() {
      const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'] as const
      const ctx = ref<DzToastContext | null>(null)
      return { positions, ctx, inject, DZ_TOAST_KEY }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzToastViewport supports six positions. Click a button to see a toast
          at that position (requires context from DzToastProvider).
        </p>
        <div class="grid grid-cols-3 gap-2 max-w-md">
          <div v-for="pos in ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']" :key="pos"
            class="px-3 py-2 text-xs border rounded text-center capitalize">
            {{ pos }}
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Full System
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: {
      DzToastProvider,
      DzToastViewport,
      ToastControls: {
        setup() {
          const ctx = inject(DZ_TOAST_KEY)
          let counter = 0
          function addToast() {
            counter++
            ctx?.add({
              title: `Notification #${counter}`,
              description: 'This is an interactive toast demo.',
              tone: (['primary', 'success', 'warning', 'danger', 'info'] as const)[counter % 5],
              actionLabel: counter % 2 === 0 ? 'Undo' : undefined,
            })
          }
          function clearAll() {
            ctx?.clear()
          }
          return { addToast, clearAll }
        },
        template: `
          <div class="flex gap-3">
            <button class="px-3 py-1.5 text-sm border rounded" @click="addToast">Add Toast</button>
            <button class="px-3 py-1.5 text-sm border rounded" @click="clearAll">Clear All</button>
          </div>
        `,
      },
    },
    template: `
      <DzToastProvider :duration="4000" :max-toasts="3">
        <div class="space-y-4">
          <p class="text-sm text-gray-500">Max 3 visible toasts, 4s auto-dismiss.</p>
          <ToastControls />
        </div>
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots (custom content)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzToastProvider, DzToast },
    setup() {
      const toast: ToastItem = {
        id: 'slot-1',
        title: 'New message from Alex',
        description: 'Hey, are you available for a quick call?',
        tone: 'primary',
      }
      return { toast }
    },
    template: `
      <DzToastProvider>
        <div class="max-w-sm">
          <DzToast :toast="toast">
            <template #default="{ toast: t }">
              <div class="flex gap-3 items-start flex-1 pl-2">
                <div class="w-8 h-8 rounded-full bg-blue-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">A</div>
                <div>
                  <p class="text-sm font-medium">{{ t.title }}</p>
                  <p class="text-xs text-gray-500">{{ t.description }}</p>
                </div>
              </div>
            </template>
          </DzToast>
        </div>
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Live Regions',
  render: () => ({
    components: { DzToastProvider, DzToast },
    setup() {
      const toast: ToastItem = {
        id: 'a11y-1',
        title: 'Accessible Toast',
        description: 'Reka UI ToastRoot manages ARIA live regions automatically.',
        tone: 'info',
      }
      return { toast }
    },
    template: `
      <DzToastProvider>
        <div class="space-y-4 max-w-sm">
          <p class="text-sm text-gray-500">
            DzToast uses Reka UI Toast primitives which handle aria-live regions,
            screen reader announcements, and keyboard navigation (Escape to dismiss)
            automatically.
          </p>
          <DzToast :toast="toast" />
        </div>
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzToastProvider, DzToast },
    setup() {
      const toasts: ToastItem[] = [
        { id: 'd1', title: 'Success', description: 'Changes saved.', tone: 'success' },
        { id: 'd2', title: 'Warning', description: 'Low disk space.', tone: 'warning' },
        { id: 'd3', title: 'Error', description: 'Connection lost.', tone: 'danger' },
      ]
      return { toasts }
    },
    template: `
      <DzToastProvider>
        <div class="space-y-3 max-w-sm">
          <DzToast v-for="t in toasts" :key="t.id" :toast="t" />
        </div>
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Undo Action Toast
// ---------------------------------------------------------------------------

export const RealWorldUndoAction: Story = {
  name: 'Real World: Undo Action',
  render: () => ({
    components: { DzToastProvider, DzToast },
    setup() {
      const toast: ToastItem = {
        id: 'undo-1',
        title: 'Email moved to trash',
        description: '1 conversation archived.',
        tone: 'neutral',
        actionLabel: 'Undo',
        duration: 8000,
      }
      return { toast }
    },
    template: `
      <DzToastProvider>
        <div class="max-w-sm">
          <DzToast :toast="toast" />
        </div>
      </DzToastProvider>
    `,
  }),
}
