import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzButton, DzButtonGroup } from '../../src/components/buttons'
import { DzInput } from '../../src/components/inputs'
// `.ts` explicitly, and it is load-bearing here. `packages/core/src/providers/`
// carries 12 COMMITTED COMPILED ARTIFACTS (`index.js`, `index.d.ts`,
// `*.js.map`, tracked since `1c452e8`), and an extensionless directory import
// resolves to `index.js` — a June barrel that predates `DzProvider` and does
// not export it. It is the only directory under `packages/*/src` with build
// output checked in. Deleting those files is the real fix and is an owner
// decision; this import is correct either way, and matches CLAUDE.md rule 5.
import { DzProvider } from '../../src/providers/index.ts'
import { darkModeDecorator, DemoRow } from '../_shared'

/**
 * `DzProvider` is the one place an application configures the library: theme,
 * locale, writing direction, message catalog, `Intl` defaults, portal target,
 * motion policy, component defaults, CSP nonce and test ids.
 *
 * Two rules explain every story below.
 *
 * **A prop it does not set, it does not provide.** Nesting therefore composes:
 * an inner provider that names only the locale leaves the theme, the portal
 * target and the defaults exactly as the outer one left them. The single
 * exception is `messages`, which deep-merges — a host changing one string must
 * not have to restate the rest.
 *
 * **It renders no element.** Its anatomy is `parts: 'none'`, so it can sit
 * between a flex container and its children, or inside a shadow root, without
 * changing anything. The consequence is worth knowing before you nest one: a
 * nested provider changes what `useDzDirection()` answers for its subtree but
 * writes no `dir` attribute, because it has no element to write it on. Only the
 * root provider reflects `dir` onto `<html>`. Scope a subtree with your own
 * `<div :dir="…">`, as `NestedProviders` does.
 */
const meta = {
  title: 'Core/Providers/DzProvider',
  component: DzProvider,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    locale: {
      control: 'text',
      description: 'Active BCP-47 tag. Direction derives from it unless `direction` says otherwise.',
      table: { category: 'Internationalisation', defaultValue: { summary: 'en-US' } },
    },
    direction: {
      control: 'select',
      options: ['auto', 'ltr', 'rtl'],
      description: '`auto` resolves from the locale; an explicit value overrides it.',
      table: { category: 'Internationalisation', defaultValue: { summary: 'auto' } },
    },
    motion: {
      control: 'select',
      options: ['system', 'reduced', 'full'],
      description:
        '`system` follows `prefers-reduced-motion`. `full` overrides a stated accessibility preference (ADR-20 §7).',
      table: { category: 'Environment', defaultValue: { summary: 'system' } },
    },
    portal: {
      control: 'text',
      description: 'Selector overlays teleport to. Unset means `document.body`.',
      table: { category: 'Environment' },
    },
    testIdPrefix: {
      control: 'text',
      description: 'Enables test ids and namespaces them, e.g. `e2e` → `data-testid="e2e-submit"`.',
      table: { category: 'Environment' },
    },
  },
  args: {
    locale: 'en-US',
    direction: 'auto',
    motion: 'system',
  },
} satisfies Meta<typeof DzProvider>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

/**
 * One provider around the application. Change the locale in the Controls panel
 * and the direction follows; set `direction` explicitly to break that link.
 */
export const Default: Story = {
  render: args => ({
    components: { DzProvider, DzButton, DzInput },
    setup: () => ({ args }),
    template: `
      <DzProvider v-bind="args">
        <div class="grid gap-3 max-w-xs rounded border border-[var(--dz-border)] p-4">
          <DzInput model-value="Configured once" />
          <DzButton tone="primary">Save</DzButton>
        </div>
      </DzProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Save')).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Nested providers
// ---------------------------------------------------------------------------

/**
 * Nesting, and the rule that makes it safe.
 *
 * The outer provider sets an Arabic locale and a portal target. The inner one
 * names **only** the locale — so its subtree switches to Bosnian and keeps the
 * outer portal target, rather than silently resetting it. That is ADR-20 §3:
 * a provider overrides the keys it sets.
 *
 * The `dir` on each panel is the story's own, not the provider's. A nested
 * provider renders no element, so scoping direction in the DOM is the host's
 * job — which is exactly one attribute, and the alternative would be a provider
 * that quietly becomes a `<div>` in every layout it is dropped into.
 */
export const NestedProviders: Story = {
  render: () => ({
    components: { DzProvider, DzButton },
    template: `
      <DzProvider locale="ar-EG" portal="#dz-portal">
        <div dir="rtl" class="grid gap-3 rounded border border-[var(--dz-border)] p-4">
          <p class="text-sm text-[var(--dz-muted-foreground)]">locale: ar-EG · direction: rtl</p>
          <DzButton tone="primary">حفظ</DzButton>

          <DzProvider locale="bs-BA">
            <div dir="ltr" class="grid gap-3 rounded border border-dashed border-[var(--dz-border)] p-4">
              <p class="text-sm text-[var(--dz-muted-foreground)]">
                locale: bs-BA · direction: ltr · portal still #dz-portal
              </p>
              <DzButton variant="outline">Sačuvaj</DzButton>
            </div>
          </DzProvider>
        </div>
      </DzProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Direction
// ---------------------------------------------------------------------------

/**
 * Direction resolved four ways, side by side.
 *
 * `auto` reads the locale through a checked-in RTL subtag list, so `ar-EG` and
 * `fa-IR` work without anyone enumerating regions. An explicit `ltr` or `rtl`
 * overrides it, which is what an RTL widget embedded in an LTR page needs — the
 * two really are independent.
 */
export const DirectionMatrix: Story = {
  name: 'Direction Matrix',
  render: () => ({
    components: { DzProvider, DzButton, DemoRow },
    setup: () => ({
      cases: [
        { locale: 'en-US', direction: 'auto', dir: 'ltr', label: 'Save' },
        { locale: 'ar-EG', direction: 'auto', dir: 'rtl', label: 'حفظ' },
        { locale: 'he-IL', direction: 'auto', dir: 'rtl', label: 'שמור' },
        { locale: 'ar-EG', direction: 'ltr', dir: 'ltr', label: 'Forced LTR' },
      ],
    }),
    template: `
      <DemoRow align="start" gap="4">
        <DzProvider
          v-for="c in cases"
          :key="c.locale + c.direction"
          :locale="c.locale"
          :direction="c.direction"
        >
          <div :dir="c.dir" class="grid gap-2 rounded border border-[var(--dz-border)] p-3 min-w-40">
            <p class="text-xs text-[var(--dz-muted-foreground)]">
              {{ c.locale }} · direction="{{ c.direction }}"
            </p>
            <DzButton size="sm" tone="primary">{{ c.label }}</DzButton>
          </div>
        </DzProvider>
      </DemoRow>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/**
 * The motion policy, including the one setting that can make things worse.
 *
 * `system` is the default and the only value that respects an OS-level
 * accessibility setting. `reduced` never animates. `full` animates **regardless
 * of `prefers-reduced-motion`** — ADR-20 §7 admits it only because a host that
 * has already asked its user is better placed to decide than this library is,
 * and it is the one thing in this contract that can produce a worse outcome for
 * a user than having no provider at all.
 */
export const ReducedMotion: Story = {
  render: () => ({
    components: { DzProvider, DzButton },
    setup: () => ({ policies: ['system', 'reduced', 'full'] as const }),
    template: `
      <div class="grid gap-3">
        <DzProvider v-for="policy in policies" :key="policy" :motion="policy">
          <div class="flex items-center gap-3 rounded border border-[var(--dz-border)] p-3">
            <code class="text-xs w-20">{{ policy }}</code>
            <DzButton size="sm" loading>Working</DzButton>
            <span class="text-xs text-[var(--dz-muted-foreground)]">
              {{ policy === 'full'
                ? 'animates even when the OS asked it not to'
                : policy === 'reduced' ? 'never animates' : 'follows prefers-reduced-motion' }}
            </span>
          </div>
        </DzProvider>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Component defaults
// ---------------------------------------------------------------------------

/**
 * Application-wide prop defaults, and the precedence that keeps them
 * predictable: **prop → compound context → provider → the component's own
 * default** (ADR-20 §6).
 *
 * A prop wins because it is what the author of that line wrote. A
 * `DzButtonGroup` beats the provider because it is nearer and more specific.
 * `DzButton` is the first component wired to this; its anatomy declares
 * `globalDefaults: ['size', 'variant', 'tone']`, so which components honour a
 * provider default is a generated fact rather than a promise.
 */
export const ComponentDefaults: Story = {
  render: () => ({
    components: { DzProvider, DzButton, DzButtonGroup, DemoRow },
    template: `
      <DzProvider :defaults="{ DzButton: { size: 'sm', tone: 'info' } }">
        <DemoRow align="center" gap="4">
          <DzButton>provider: sm + info</DzButton>
          <DzButton tone="danger">prop wins on tone</DzButton>
          <DzButtonGroup size="lg">
            <DzButton>group wins on size</DzButton>
          </DzButtonGroup>
        </DemoRow>
      </DzProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

/**
 * What the provider contributes to accessibility, which is all of it indirect:
 * it renders nothing, so it has no role, no focus and no ARIA of its own.
 *
 * It carries three settings a user's experience depends on, and every one is
 * silent when wrong: `direction` (an Arabic application laid out left-to-right),
 * `motion` (animation for someone who asked the OS to stop), and `locale`
 * (dates and numbers a screen reader announces in the wrong language). That is
 * why its anatomy declares risk tier A despite rendering no element.
 */
export const Accessibility: Story = {
  render: () => ({
    components: { DzProvider, DzButton },
    template: `
      <DzProvider locale="ar-EG" motion="reduced">
        <div dir="rtl" lang="ar" class="grid gap-3 rounded border border-[var(--dz-border)] p-4">
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            dir and lang come from the host element; the provider is what told it which to use.
          </p>
          <DzButton tone="primary">حفظ</DzButton>
        </div>
      </DzProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real world
// ---------------------------------------------------------------------------

/**
 * An application root as it is actually written: one provider, every concern.
 *
 * `nonce` is the one that looks decorative and is not — the transition
 * suppression `<style>` the theme injects on a switch is dropped silently by a
 * strict Content-Security-Policy without it, and the symptom is a colour sweep
 * nobody can reproduce locally.
 */
export const RealWorldAppRoot: Story = {
  render: () => ({
    components: { DzProvider, DzButton, DzInput },
    template: `
      <DzProvider
        :theme="{ default: 'system', persist: true }"
        locale="en-US"
        direction="auto"
        :messages="{ DzPagination: { next: 'Next page' } }"
        :formats="{ currency: 'EUR' }"
        portal="#dz-portal"
        motion="system"
        :defaults="{ DzButton: { size: 'sm' } }"
        nonce="server-generated-nonce"
        test-id-prefix="e2e"
      >
        <div class="grid gap-3 max-w-sm rounded border border-[var(--dz-border)] p-4">
          <DzInput model-value="jane@example.com" />
          <DzButton tone="primary">Continue</DzButton>
        </div>
      </DzProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

/**
 * The provider under `[data-theme="dark"]`. It renders nothing, so there is
 * nothing of its own to theme — what changes is everything inside it, from the
 * tokens the theme swaps.
 */
export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzProvider, DzButton, DzInput },
    template: `
      <DzProvider locale="en-US" :defaults="{ DzButton: { size: 'sm' } }">
        <div class="grid gap-3 max-w-xs">
          <DzInput model-value="Dark" />
          <DzButton tone="primary">Save</DzButton>
        </div>
      </DzProvider>
    `,
  }),
}
