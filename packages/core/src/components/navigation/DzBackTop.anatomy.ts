import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzBackTop — declared anatomy for the scroll-to-top affordance
 * (TASK-R5-O2, ADR-19).
 *
 * **The wrapper-covers-union case, in its narrowest form.** `DzBackTop` renders
 * no element of its own: its root *is* a `DzFab`, and `DzFab` has declared an
 * anatomy since N2-S1. The boundary rule in `expectAnatomy` stops at a
 * descendant carrying `data-part="root"` — but the root it is handed here is
 * that very element, so `DzFab`'s own `root` and `icon` are inside this
 * component's anatomy and have to be declared rather than hidden.
 *
 * `spinner` is deliberately NOT declared: `DzBackTop` never passes `loading`,
 * so the branch that would render it cannot be reached from this component's
 * public API. Declaring a part nothing can render is a promise with nothing
 * behind it, which is what `maxUnemittedDeclarations: 0` exists to prevent.
 */
export const anatomy = {
  parts: ['root', 'icon'],

  /**
   * `icon` is optional and `root` is not, and the asymmetry is the whole
   * declaration in one line. `DzBackTop` stamps `data-part="root"` on the
   * `DzFab` itself, so that name is emitted from THIS component's source and
   * is unconditional. The icon wrapper is inside `DzFab`'s template: it is in
   * this component's anatomy boundary and a consumer can address it, but
   * whether it renders is `DzFab`'s decision, not this one's.
   *
   * `validate:anatomy-parts` reads the same distinction the other way round:
   * it credits a declaration with emissions from its compound parts and from
   * unmanifested internals, and `DzFab` is neither — it is a public component
   * with a declaration of its own. Marking the part optional is the accurate
   * statement, not a way past the gate.
   */
  optionalParts: ['icon'],

  /**
   * `states: ['idle']` — one value, and only one. `DzFab` emits
   * `loading | disabled | idle`, and `DzBackTop` forwards neither `loading` nor
   * `disabled`, so `idle` is the only value this component can produce.
   */
  states: ['idle'],

  /** Measured from `DzBackTop.tokens.ts`. */
  componentTokens: [
    '--dz-back-top-offset',
    '--dz-back-top-z',
    '--dz-back-top-transition',
  ],

  /** `variant`, `size` and `tone` are forwarded verbatim to `DzFab`. */
  recipes: ['size', 'variant', 'tone'],

  /**
   * Mirrors with the document, and this declaration is what made the fix
   * visible: the base recipe pinned the button with
   * `right-[var(--dz-back-top-offset)]`, so an Arabic page put the
   * scroll-to-top control on the edge the reader's thumb is furthest from.
   * `inset-e-` is the spelling Tailwind 4 generates and is byte-identical in a
   * LTR document.
   *
   * This is NOT the `DzFab` case. `DzFab` takes a `position` prop whose values
   * NAME a corner (`bottom-right`), so its physical geometry is an author's
   * promise about the screen and carries `rtl-physical-ok`. `DzBackTop` takes
   * no such prop — the corner is an implementation detail of "out of the way of
   * the text", which is a statement about the reading direction.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Native `button` activation. The
   * scroll it performs is the action, and it is not a key of its own.
   */
  keyboard: [
    {
      key: 'Enter',
      action: 'Activate the control, scrolling the page back to the top.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: ' ',
      action: 'Activate the control, scrolling the page back to the top.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
  ],

  /** Tier B — a focusable control that moves the viewport. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on the back-to-top control. */
export type DzBackTopPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzBackTop — forwarded to `DzFab`'s own `ui`, so the two
 * keys land on the same nodes the part names address.
 */
export type DzBackTopUi = UiOverrides<typeof anatomy>
