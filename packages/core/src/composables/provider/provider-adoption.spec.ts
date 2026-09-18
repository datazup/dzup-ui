import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import DzButton from '../../components/buttons/DzButton.vue'
import DzCopyButton from '../../components/buttons/DzCopyButton.vue'
import DzFab from '../../components/buttons/DzFab.vue'
import DzIconButton from '../../components/buttons/DzIconButton.vue'
import DzSpeedDial from '../../components/buttons/DzSpeedDial.vue'
import DzSplitButton from '../../components/buttons/DzSplitButton.vue'
import DzSplitButtonAction from '../../components/buttons/DzSplitButtonAction.vue'
import DzToggleButton from '../../components/buttons/DzToggleButton.vue'
import DzAnimatedNumber from '../../components/data/DzAnimatedNumber.vue'
import DzChip from '../../components/data/DzChip.vue'
import DzCountdown from '../../components/data/DzCountdown.vue'
import DzList from '../../components/data/DzList.vue'
import DzListItem from '../../components/data/DzListItem.vue'
import DzTag from '../../components/data/DzTag.vue'
import DzTimeline from '../../components/data/DzTimeline.vue'
import DzTimelineItem from '../../components/data/DzTimelineItem.vue'
import DzBadge from '../../components/feedback/DzBadge.vue'
import DzMeterGroup from '../../components/feedback/DzMeterGroup.vue'
import DzProgress from '../../components/feedback/DzProgress.vue'
import DzScrollProgress from '../../components/feedback/DzScrollProgress.vue'
import DzSpinner from '../../components/feedback/DzSpinner.vue'
import DzRangeSlider from '../../components/forms/DzRangeSlider.vue'
import DzRating from '../../components/forms/DzRating.vue'
import DzSlider from '../../components/forms/DzSlider.vue'
import DzSwitch from '../../components/forms/DzSwitch.vue'
import DzBackTop from '../../components/navigation/DzBackTop.vue'
import DzTabs from '../../components/navigation/DzTabs.vue'
import DzProvider from '../../providers/DzProvider.vue'

/**
 * Provider **adoption** — the half `provider.spec.ts` cannot prove
 * (TASK-R5-O3, ADR-20 divergences D20-1 to D20-4).
 *
 * `provider.spec.ts` proves the composables resolve correctly. That was already
 * true at `99b963a`, and four of the contexts still had **zero** component
 * reading them: the mechanism worked and nothing was plugged into it. A context
 * is honoured when a real component, mounted under a real `DzProvider`, behaves
 * differently — which is what every case here asserts.
 *
 * One component per context rather than all of them: this file is the contract,
 * not the inventory. The inventory is `component-meta.json`'s `providerHooks`,
 * which `validate:component-meta` re-derives from source on every run and fails
 * on any disagreement — so a component that silently drops its adoption fails
 * there, by name, without this file having to list 88 of them.
 */

/**
 * jsdom implements no `matchMedia`, and `DzProvider` needs one for the ADR-09
 * theme half it also owns. The same stub `DzProvider.spec.ts` uses, with the OS
 * reporting no reduced-motion preference — so every motion assertion below is
 * about what the APPLICATION asked for, which is the thing under test.
 */
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

/** Mount one component inside a real DzProvider configured with `provider`. */
function underProvider(
  provider: Record<string, unknown>,
  component: unknown,
  props: Record<string, unknown> = {},
): ReturnType<typeof mount> {
  return mount(defineComponent({
    setup: () => () => h(DzProvider, provider, {
      default: () => h(component as never, props),
    }),
  }), { attachTo: document.body })
}

describe('test ids (ADR-20 §8 — D20-3: the mechanism shipped with no emitters)', () => {
  it('emits nothing at all when no host asked', () => {
    const wrapper = mount(DzButton)

    expect(wrapper.attributes('data-testid')).toBeUndefined()
  })

  it('puts the id on the root a consumer addresses', () => {
    const wrapper = underProvider({ testIds: { enabled: true } }, DzButton)

    expect(wrapper.get('[data-part="root"]').attributes('data-testid')).toBe('dz-button')
  })

  it('honours the host attribute name and prefix', () => {
    const wrapper = underProvider(
      { testIds: { enabled: true, attribute: 'data-qa', prefix: 'app' } },
      DzButton,
    )

    const root = wrapper.get('[data-part="root"]')
    expect(root.attributes('data-qa')).toBe('app-dz-button')
    expect(root.attributes('data-testid')).toBeUndefined()
  })
})

describe('motion (ADR-20 §7 — D20-1: a policy with no consumers)', () => {
  it('carries no motion attribute under the default policy', () => {
    const wrapper = mount(DzSwitch)

    expect(wrapper.get('[data-part="root"]').attributes('data-dz-motion')).toBeUndefined()
  })

  /**
   * The CSS rule keyed on this attribute is emitted once, unlayered and
   * `!important`, beside the `prefers-reduced-motion` block in
   * `packages/tokens/src/generate.ts`. jsdom applies no stylesheet, so what is
   * assertable here is the attribute; that the rule exists is asserted by the
   * generator's own output and by the browser matrix.
   */
  it('marks the root when the application asked for reduced motion', () => {
    const wrapper = underProvider({ motion: 'reduced' }, DzSwitch)

    expect(wrapper.get('[data-part="root"]').attributes('data-dz-motion')).toBe('reduce')
  })

  it('does not mark it when the application asked for full motion', () => {
    const wrapper = underProvider({ motion: 'full' }, DzSwitch)

    expect(wrapper.get('[data-part="root"]').attributes('data-dz-motion')).toBeUndefined()
  })
})

describe('direction (ADR-20 §4 — D20-2: resolved centrally, read by nothing)', () => {
  /**
   * `DzRating` declares `rtl: { keyboard: 'swap-horizontal' }`. The declaration
   * was a promise with nothing behind it: ArrowRight raised the rating whatever
   * the document direction, so an Arabic user pressing "forward" lowered it.
   */
  it('raises the rating on ArrowRight in an LTR document', async () => {
    const wrapper = underProvider({ direction: 'ltr' }, DzRating, { value: 2, count: 5 })

    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.findComponent(DzRating).emitted('update:value')?.[0]).toEqual([3])
  })

  it('raises it on ArrowLeft in an RTL document', async () => {
    const wrapper = underProvider({ direction: 'rtl' }, DzRating, { value: 2, count: 5 })

    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.findComponent(DzRating).emitted('update:value')?.[0]).toEqual([3])
  })

  it('resolves direction from an RTL locale when the host says nothing', async () => {
    const wrapper = underProvider({ locale: 'ar-EG' }, DzRating, { value: 2, count: 5 })

    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.findComponent(DzRating).emitted('update:value')?.[0]).toEqual([3])
  })
})

describe('formats (ADR-20 §5 — the host default nothing consulted)', () => {
  /**
   * `duration: 0` skips the tween, so the rendered figure is the formatted
   * target rather than a frame of it.
   */
  it('applies the application number defaults', () => {
    const wrapper = underProvider(
      { locale: 'en-US', formats: { number: { minimumFractionDigits: 2 } } },
      DzAnimatedNumber,
      { value: 5, duration: 0, startOnView: false },
    )

    expect(wrapper.text()).toContain('5.00')
  })

  it('lets an instance locale override the application one', () => {
    const wrapper = underProvider(
      { locale: 'en-US' },
      DzAnimatedNumber,
      { value: 1234, duration: 0, startOnView: false, locale: 'de-DE' },
    )

    // 1.234 in de-DE, 1,234 in en-US — the separator is the whole assertion.
    expect(wrapper.text()).toContain('1.234')
  })
})

describe('defaults (ADR-20 §6 — D20-4: one component honoured the map)', () => {
  /**
   * The shared axis is the setting that makes "render the whole application
   * compact" one line rather than a list. It had no consumer beyond `DzButton`,
   * so it was a line that worked on exactly one component.
   */
  it('applies the shared size axis to a component that never states one', () => {
    const wrapper = underProvider(
      { defaults: { size: 'xs' } },
      DzIconButton,
      { ariaLabel: 'Add' },
    )

    expect(wrapper.get('[data-part="root"]').classes().join(' ')).toContain('--dz-button-xs-height')
  })

  /**
   * Per-component beats shared: a host that made everything small and then
   * asked for large icon buttons gets large icon buttons.
   */
  it('lets a per-component default outrank the shared axis', () => {
    const wrapper = underProvider(
      { defaults: { size: 'xs', DzIconButton: { tone: 'danger' } } },
      DzIconButton,
      { ariaLabel: 'Delete' },
    )

    expect(wrapper.get('[data-part="root"]').attributes('data-tone')).toBe('danger')
  })

  /** And an instance prop beats both, which is the whole precedence rule. */
  it('lets an instance prop outrank every configured default', () => {
    const wrapper = underProvider(
      { defaults: { DzIconButton: { tone: 'danger' } } },
      DzIconButton,
      { ariaLabel: 'Add', tone: 'success' },
    )

    expect(wrapper.get('[data-part="root"]').attributes('data-tone')).toBe('success')
  })

  /**
   * The property that makes adoption safe: with no provider, every newly
   * adopting component renders exactly the literal default it carried in
   * `withDefaults` before TASK-R5-O3 moved that default into `resolve`'s last
   * link.
   */
  it('renders the pre-adoption literal defaults with no provider mounted', () => {
    const copy = mount(DzCopyButton, { props: { value: 'test' } })
    expect(copy.attributes('data-variant')).toBe('outline')
    expect(copy.attributes('data-tone')).toBe('neutral')

    const toggle = mount(DzToggleButton)
    // `tone` had no literal default and must not acquire one.
    expect(toggle.attributes('data-tone')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Raw-binding audit — the regression adoption invites
// ---------------------------------------------------------------------------

/**
 * Moving a literal out of `withDefaults` is what makes the provider reachable
 * at all: `props.x` has to be able to be `undefined`. The cost is that **every
 * `data-*` attribute still bound to the RAW prop silently disappears** the
 * moment a host configures that axis — the attribute TASK-R5-O2 had just
 * landed, gone, with no type error and no failing render.
 *
 * It happened once for real (`DzCopyButton`'s `:data-variant`, §2.2 of the
 * handoff) and was caught only because that component happened to have a spec
 * asserting the attribute. Most did not. So every adopting component is listed
 * here and each of its attributes is asserted **twice**:
 *
 *  - `bare` — mounted with no provider, it must still render the exact literal
 *    it rendered before adoption (the compatibility half);
 *  - `configured` — mounted under a provider that sets the axis, it must
 *    render the configured value (the rerouting half).
 *
 * A binding left on the raw prop passes `bare` and fails `configured` with
 * `undefined`, which is precisely the defect. The defaults are stated
 * **per component** (`{ DzFab: { … } }`) rather than as a shared axis on
 * purpose: a shared axis would also be picked up by any inner component that
 * has adopted, so a wrapper could appear to work while resolving nothing.
 */
interface AdoptionCase {
  /** Component name, for the test title */
  name: string
  component: unknown
  /** Props needed to render at all — never one of the adopted axes */
  props?: Record<string, unknown>
  /** Element carrying the attributes; defaults to the component root */
  selector?: string
  /** The provider `defaults` map that drives the `configured` column */
  defaults: Record<string, unknown>
  /** attribute -> value with NO provider (the pre-adoption literal) */
  bare: Record<string, string | undefined>
  /** attribute -> value under `defaults` */
  configured: Record<string, string | undefined>
  /**
   * Exact class token on the target element, `[bare, configured]` — for an axis
   * that reaches only a `tv()` recipe and never becomes an attribute.
   */
  classToken?: [string, string]
  /**
   * A selector that must be ABSENT with no provider and PRESENT under
   * `defaults` — for an axis that drives a `v-if` branch. A raw read there is
   * the nastiest form of the defect: the component styles one variant and
   * renders the other.
   */
  appearsWhenConfigured?: string
}

const adoptionCases: AdoptionCase[] = [
  // The four adopters that predate this table (TASK-R5-O3 sessions 1–2). They
  // were covered only by the hand-written `defaults` block above, which pins
  // one attribute each; `validate:provider-defaults` (D32(a)) found them with
  // no row on its first run, because a row is now mandatory for every
  // `useDzDefaults` consumer in component-meta.json.
  {
    // `size` never becomes an attribute here: it reaches the shared recipe and
    // the spinner ladder only, so the recipe's height token pins it.
    name: 'DzButton',
    component: DzButton,
    defaults: { DzButton: { size: 'lg', tone: 'danger' } },
    classToken: ['h-[var(--dz-button-md-height)]', 'h-[var(--dz-button-lg-height)]'],
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'danger' },
  },
  {
    // `w-` exists only in the square-footprint lookup map, not in the shared
    // recipe, so this token pins that second reader of `size`.
    name: 'DzIconButton',
    component: DzIconButton,
    props: { ariaLabel: 'Add' },
    defaults: { DzIconButton: { size: 'lg', tone: 'danger' } },
    classToken: ['w-[var(--dz-button-md-height)]', 'w-[var(--dz-button-lg-height)]'],
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'danger' },
  },
  {
    // Its own literal `size` is `sm`, not the family's `md`; `w-` comes only
    // from the icon-only footprint recipe.
    name: 'DzCopyButton',
    component: DzCopyButton,
    props: { value: 'test' },
    defaults: { DzCopyButton: { variant: 'ghost', size: 'lg', tone: 'info' } },
    classToken: ['w-[var(--dz-button-sm-height)]', 'w-[var(--dz-button-lg-height)]'],
    bare: { 'data-variant': 'outline', 'data-tone': 'neutral' },
    configured: { 'data-variant': 'ghost', 'data-tone': 'info' },
  },
  {
    // `tone` has no literal: bare it renders NO attribute, and must keep not
    // rendering one.
    name: 'DzToggleButton',
    component: DzToggleButton,
    defaults: { DzToggleButton: { size: 'lg', tone: 'success' } },
    classToken: ['h-[var(--dz-button-md-height)]', 'h-[var(--dz-button-lg-height)]'],
    bare: { 'data-tone': undefined },
    configured: { 'data-tone': 'success' },
  },
  {
    name: 'DzFab',
    component: DzFab,
    props: { ariaLabel: 'Compose' },
    defaults: { DzFab: { size: 'xs', tone: 'danger' } },
    bare: { 'data-size': 'md', 'data-tone': 'primary' },
    configured: { 'data-size': 'xs', 'data-tone': 'danger' },
  },
  {
    name: 'DzSplitButton',
    component: DzSplitButton,
    defaults: { DzSplitButton: { tone: 'success' } },
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'success' },
  },
  {
    name: 'DzSpeedDial',
    component: DzSpeedDial,
    props: { items: [], ariaLabel: 'Quick actions' },
    // The trigger is an inner DzFab that has ALSO adopted, so a shared axis
    // would prove nothing: only a `DzSpeedDial`-keyed default can reach it
    // through the dial's own resolution.
    selector: 'button[aria-haspopup="menu"]',
    defaults: { DzSpeedDial: { size: 'lg', tone: 'warning' } },
    bare: { 'data-size': 'md', 'data-tone': 'primary' },
    configured: { 'data-size': 'lg', 'data-tone': 'warning' },
  },
  {
    name: 'DzBadge',
    component: DzBadge,
    // No `data-part` on this root (it predates ADR-19's sweep); the root span
    // is addressed by the state it always emits.
    selector: 'span[data-state="ready"]',
    defaults: { DzBadge: { tone: 'info' } },
    bare: { 'data-tone': 'neutral' },
    configured: { 'data-tone': 'info' },
  },
  {
    name: 'DzSpinner',
    component: DzSpinner,
    defaults: { DzSpinner: { tone: 'warning' } },
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'warning' },
  },
  {
    name: 'DzProgress',
    component: DzProgress,
    props: { value: 40 },
    selector: '[role="progressbar"]',
    // `variant` switches a `v-if`: bar renders a div fill, circular an <svg>.
    appearsWhenConfigured: 'svg',
    defaults: { DzProgress: { tone: 'danger', variant: 'circular' } },
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'danger' },
  },
  {
    name: 'DzScrollProgress',
    component: DzScrollProgress,
    selector: '[role="progressbar"]',
    appearsWhenConfigured: 'svg',
    defaults: { DzScrollProgress: { tone: 'success', variant: 'circular' } },
    bare: { 'data-tone': 'primary', 'data-variant': 'bar' },
    configured: { 'data-tone': 'success', 'data-variant': 'circular' },
  },
  {
    // A second row for the same component: `size` never becomes an attribute
    // on the root, it becomes SVG geometry, and `md` happens to equal the
    // `?? 44` fallback — so a raw `props.size` read here is invisible to every
    // assertion above. `variant` is passed as an instance prop so the circular
    // branch renders and only `size` comes from the provider.
    name: 'DzScrollProgress (circular geometry)',
    component: DzScrollProgress,
    props: { variant: 'circular' },
    selector: 'svg',
    defaults: { DzScrollProgress: { size: 'lg' } },
    bare: { width: '44', height: '44' },
    configured: { width: '56', height: '56' },
  },
  {
    /** Same shape for DzProgress: `md` is 32px, `lg` is 48px. */
    name: 'DzProgress (circular geometry)',
    component: DzProgress,
    props: { variant: 'circular', value: 40 },
    selector: 'svg',
    defaults: { DzProgress: { size: 'lg' } },
    bare: { width: '32', height: '32' },
    configured: { width: '48', height: '48' },
  },
  {
    name: 'DzChip',
    component: DzChip,
    defaults: { DzChip: { tone: 'primary' } },
    bare: { 'data-tone': 'neutral' },
    configured: { 'data-tone': 'primary' },
  },
  {
    // `size` also drives an inline class ladder on the close button, a reader
    // that no root attribute covers.
    name: 'DzChip (close-button size ladder)',
    component: DzChip,
    props: { closable: true },
    selector: '[data-part="close"]',
    defaults: { DzChip: { size: 'lg' } },
    classToken: ['h-4', 'h-5'],
    bare: {},
    configured: {},
  },
  {
    name: 'DzTag',
    component: DzTag,
    defaults: { DzTag: { tone: 'success' } },
    bare: { 'data-tone': 'neutral' },
    configured: { 'data-tone': 'success' },
  },
  {
    name: 'DzTag (close-button size ladder)',
    component: DzTag,
    props: { closable: true },
    selector: '[data-part="close"]',
    defaults: { DzTag: { size: 'lg' } },
    classToken: ['h-3.5', 'h-4'],
    bare: {},
    configured: {},
  },
  {
    // `tone` carried NO literal default here, so the bare value is `undefined`
    // and must stay `undefined` — adoption must not invent a default.
    name: 'DzList',
    component: DzList,
    selector: '[role="list"]',
    defaults: { DzList: { tone: 'info', variant: 'bordered' } },
    classToken: ['flex-col', 'border'],
    bare: { 'data-tone': undefined },
    configured: { 'data-tone': 'info' },
  },
  {
    name: 'DzTimeline',
    component: DzTimeline,
    selector: 'div[role="list"]',
    defaults: { DzTimeline: { tone: 'warning' } },
    bare: { 'data-tone': undefined },
    configured: { 'data-tone': 'warning' },
  },
  {
    name: 'DzCountdown',
    component: DzCountdown,
    props: { value: 60_000, mode: 'duration', autoStart: false },
    selector: '[role="timer"]',
    defaults: { DzCountdown: { size: 'lg', tone: 'danger' } },
    bare: { 'data-size': 'md', 'data-tone': 'neutral' },
    configured: { 'data-size': 'lg', 'data-tone': 'danger' },
  },
  {
    name: 'DzAnimatedNumber',
    component: DzAnimatedNumber,
    props: { value: 7, duration: 0, startOnView: false },
    selector: 'span.dz-animated-number',
    defaults: { DzAnimatedNumber: { size: 'xl', tone: 'success' } },
    bare: { 'data-size': 'md', 'data-tone': 'neutral' },
    configured: { 'data-size': 'xl', 'data-tone': 'success' },
  },
  {
    name: 'DzSlider',
    component: DzSlider,
    props: { value: 30 },
    selector: '[data-part="control"]',
    defaults: { DzSlider: { tone: 'warning' } },
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'warning' },
  },
  {
    name: 'DzRangeSlider',
    component: DzRangeSlider,
    props: { value: [20, 60] },
    selector: '[data-part="control"]',
    defaults: { DzRangeSlider: { tone: 'danger' } },
    bare: { 'data-tone': 'primary' },
    configured: { 'data-tone': 'danger' },
  },
  {
    name: 'DzTabs',
    component: DzTabs,
    defaults: { DzTabs: { variant: 'pill', tone: 'success' } },
    bare: { 'data-variant': 'line', 'data-tone': 'primary' },
    configured: { 'data-variant': 'pill', 'data-tone': 'success' },
  },
  {
    /**
     * The forwarding case, and the sharpest one in the set: `DzBackTop`
     * defaults `tone` to `neutral` while the `DzFab` it renders defaults to
     * `primary`. Dropping the literal instead of keeping it as `resolve`'s last
     * link would repaint every back-to-top button — the `bare` column is what
     * pins that down.
     */
    name: 'DzBackTop',
    component: DzBackTop,
    defaults: { DzBackTop: { size: 'lg', tone: 'info' } },
    bare: { 'data-size': 'md', 'data-tone': 'neutral' },
    configured: { 'data-size': 'lg', 'data-tone': 'info' },
  },
  {
    name: 'DzMeterGroup',
    component: DzMeterGroup,
    props: { values: [{ value: 30, label: 'Used' }] },
    // `size` reaches only the track recipe — `h-2` at `md`, `h-3` at `lg`.
    selector: 'div.overflow-hidden',
    defaults: { DzMeterGroup: { size: 'lg' } },
    classToken: ['h-2', 'h-3'],
    bare: {},
    configured: {},
  },
]

describe.each(adoptionCases)('defaults adoption — $name', (adoption) => {
  const target = (wrapper: ReturnType<typeof mount>): ReturnType<ReturnType<typeof mount>['get']> =>
    wrapper.get(adoption.selector ?? '[data-part=\"root\"]')

  it('renders its pre-adoption literal defaults with no provider mounted', () => {
    const wrapper = mount(adoption.component as never, { props: adoption.props ?? {} } as never)
    const el = target(wrapper)

    for (const [attribute, value] of Object.entries(adoption.bare))
      expect([attribute, el.attributes(attribute)]).toEqual([attribute, value])

    if (adoption.classToken)
      expect(el.classes()).toContain(adoption.classToken[0])

    if (adoption.appearsWhenConfigured)
      expect(wrapper.find(adoption.appearsWhenConfigured).exists()).toBe(false)
  })

  it('reroutes every attribute binding to the resolved value', () => {
    const wrapper = underProvider(
      { defaults: adoption.defaults },
      adoption.component,
      adoption.props ?? {},
    )
    const el = target(wrapper)

    for (const [attribute, value] of Object.entries(adoption.configured))
      expect([attribute, el.attributes(attribute)]).toEqual([attribute, value])

    if (adoption.classToken)
      expect(el.classes()).toContain(adoption.classToken[1])

    if (adoption.appearsWhenConfigured)
      expect(wrapper.find(adoption.appearsWhenConfigured).exists()).toBe(true)
  })
})

/**
 * Compound roots resolve **for their children too** (ADR-08 + ADR-20 §6).
 *
 * `DzList`, `DzTimeline` and `DzSplitButton` hand their axes down through
 * provide/inject, so the adoption defect has a second shape here: resolve the
 * root's own recipe but leave the provided `toRef` on the raw prop, and the
 * root styles itself correctly while every child silently falls back to its
 * own literal. No root attribute can see that, so it is asserted on the child.
 */
describe('defaults adoption — compound context carries the RESOLVED value', () => {
  it('dzList hands the resolved size to DzListItem', () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(DzProvider, { defaults: { DzList: { size: 'xl' } } }, {
        default: () => h(DzList, null, { default: () => h(DzListItem, null, { default: () => 'one' }) }),
      }),
    }), { attachTo: document.body })

    expect(wrapper.get('li').classes()).toContain('px-[var(--dz-spacing-6)]')
  })

  it('dzTimeline hands the resolved size to DzTimelineItem', () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(DzProvider, { defaults: { DzTimeline: { size: 'xl' } } }, {
        default: () => h(DzTimeline, null, { default: () => h(DzTimelineItem, null, { default: () => 'one' }) }),
      }),
    }), { attachTo: document.body })

    expect(wrapper.html()).toContain('h-[var(--dz-spacing-8)]')
  })

  it('dzSplitButton hands the resolved size to DzSplitButtonAction', () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(DzProvider, { defaults: { DzSplitButton: { size: 'xs' } } }, {
        default: () => h(DzSplitButton, null, { default: () => h(DzSplitButtonAction, null, { default: () => 'Save' }) }),
      }),
    }), { attachTo: document.body })

    expect(wrapper.get('button').classes().join(' ')).toContain('--dz-button-xs-height')
  })
})
