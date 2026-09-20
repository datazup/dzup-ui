/**
 * DzResizable — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzup-ui/core/components/layout/DzResizable.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const resizableVariants = tv({
  slots: {
    group: 'flex h-full w-full',
    panel: 'flex items-stretch overflow-auto',
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum).
     *
     * The handle carries `role="separator"` and is the drag target. It measured
     * `div 1x72` — a one-pixel-wide pointer target — on chromium, firefox and
     * webkit. It cannot simply be grown: a 24px-wide handle is a 24px gap
     * between the panes.
     *
     * So the handle's own box grows to the 24px floor across the axis it is
     * thin in, `dz-target-min-tight-{inline,block}` gives that growth back to
     * the layout with a negative margin on the same axis, and the hairline it
     * paints moves to a pseudo-element at `--dz-control-visual-size`. The panes
     * keep their geometry to the pixel; the handle accepts a pointer 24px wide.
     *
     * The cost, recorded rather than hidden: the handle now overhangs each pane
     * by half the growth, so a pointer within ~11px of the divider hits the
     * handle rather than the pane content behind it.
     */
    handle: [
      // `peer/dz-resize-handle` is a marker with no paint of its own: it is
      // what lets `handleSteppers`, which is the handle's NEXT SIBLING, react
      // to a hover or a focus on the gutter (TASK-R2-O5, D117/A). A `peer`
      // rather than a `group` because the steppers are deliberately outside
      // this element — see `handleSteppers`. Named rather than bare so a
      // consumer's own peer cannot capture it.
      'peer/dz-resize-handle',
      'relative flex shrink-0 items-center justify-center',
      'transition-colors duration-150',
      'dz-focus-ring-control dz-disabled-control',
      'before:absolute before:inset-0 before:m-auto before:-z-10',
      'before:bg-[var(--dz-border)]',
      'before:transition-colors before:duration-150',
      'hover:before:bg-[var(--dz-primary)]',
    ].join(' '),
    handleIndicator: [
      'z-10 flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
    ].join(' '),

    /**
     * TASK-R2-O5 / WCAG 2.2 SC 2.5.7 Dragging Movements — owner decision **D117
     * option A**, taken 2026-09-19.
     *
     * The stepper pair that gives a pointer user a non-drag path. Four
     * properties earn their lines here:
     *
     * 1. **It is a sibling of the separator, not a child of it, and it has to
     *    be.** The first implementation nested the two buttons inside the Reka
     *    handle, which carries `role="separator"` and `tabindex="0"`, and
     *    `apps/landing/src/blocks/a11y.spec.ts` caught it: axe's
     *    `nested-interactive` (WCAG 4.1.2, serious) refuses focusable content
     *    inside an interactive control and says in as many words that
     *    `tabindex="-1"` does **not** exempt it, because assistive technologies
     *    can still focus the element. So this is a zero-size flex item beside
     *    the handle — `w-0` / `h-0` plus `self-stretch`, so it spans the
     *    gutter's length and occupies none of its width — with the pair
     *    absolutely positioned inside it by `handleStepperTrack`.
     * 2. **The resting paint is byte-identical to before.** `opacity-0` and a
     *    zero-size box together mean the pair neither paints nor occupies a
     *    single pixel of layout until a user reaches for it. Nothing in a
     *    consuming page moves — re-measured against the pre-affordance numbers
     *    in `docs/program-2026-09-04/reports/TASK-R2-O5-handoff.md` §9.5.
     * 3. **It is revealed by all three things a pointer user can do**: hover the
     *    gutter (`peer-hover`), focus the separator (`peer-focus-within` —
     *    `:focus-within` matches the element that has focus as well as one that
     *    contains it), or tap it once on a device that has no hover, which sets
     *    `data-steppers="visible"`. Its own `hover:` / `focus-within:` keep it
     *    revealed once the pointer has moved off the gutter and onto a button,
     *    which it must, because the buttons are no longer inside the gutter.
     * 4. **`pointer-events-none` here, `auto` on each button.** The gutter
     *    between and around the two controls stays a drag target, so the
     *    affordance is added to the drag rather than layered over it.
     */
    handleSteppers: [
      'pointer-events-none relative z-20 shrink-0',
      'opacity-0 transition-opacity duration-150',
      'peer-hover/dz-resize-handle:opacity-100',
      'peer-focus-within/dz-resize-handle:opacity-100',
      'hover:opacity-100 focus-within:opacity-100',
      'data-[steppers=visible]:opacity-100',
    ].join(' '),

    /**
     * The positioned box the pair lives in, centred on the divider.
     *
     * It is **zero-thickness across the gutter** and lets the two controls
     * overflow it symmetrically, which is what makes the centring
     * direction-agnostic: a `translate` of half the track's own width would be
     * correct in one writing direction and 24 px out in the other, because a
     * logical inset anchors the track's start edge and the start edge changes
     * sides. `items-center` over a zero-thickness line has no such asymmetry.
     */
    handleStepperTrack: 'absolute flex items-center justify-center gap-px',

    /**
     * One stepper. **24 × 24 CSS px, unconditionally** — SC 2.5.8 is measured
     * on every pointer target by the `touch` matrix condition in three engines,
     * and `e2e/matrix/conditions.spec.ts` measures these boxes explicitly
     * because the generic sweep skips an `opacity: 0` element as a
     * visually-hidden native control.
     *
     * `tabindex="-1"` is set in the template, not here, and it is deliberate:
     * APG `window-splitter` makes the separator the single tab stop of the
     * widget, and its Arrow/Home/End path already satisfies SC 2.1.1. These two
     * controls are the *pointer* half of the same function, so putting them in
     * the tab order would triple the tab stops of every splitter to duplicate a
     * path that already exists.
     */
    handleStep: [
      'dz-target-min pointer-events-auto h-6 w-6 shrink-0',
      'flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)] text-[var(--dz-foreground)]',
      'dz-focus-ring-control',
      'hover:bg-[var(--dz-muted)]',
    ].join(' '),
  },

  variants: {
    direction: {
      horizontal: {
        group: 'flex-row',
        // The hairline is vertical: full height, `--dz-control-visual-size` wide.
        handle: 'dz-target-min-tight-inline w-px before:h-full before:w-[var(--dz-control-visual-size)]',
        handleIndicator: 'h-4 w-3 rotate-90',
        /**
         * The gutter is 24 px wide and as long as the group is tall, so the
         * pair stacks **along** the long axis: 24 px across, 48 px of length.
         * The marker is zero-width and full-height, and so is the track, so the
         * pair overflows it by 12 px on each side and is centred on the divider
         * line in either writing direction.
         *
         * When the group is shorter than 48 px the pair overflows the gutter's
         * ends rather than shrinking. That is the settled answer to the risk
         * recorded in the decision sheet §2: a control that shrinks below 24 px
         * fails SC 2.5.8, and swapping in a single cycling control below a
         * height threshold would make one tap mean different things in
         * different layouts — which is option C, and option C is not what the
         * owner picked. The handle already overhangs each pane by ~11.5 px
         * (TASK-N1-O3 change V4), so an overhang along this axis is the
         * component's existing geometry contract rather than a new one.
         */
        handleSteppers: 'w-0 self-stretch',
        // A LOGICAL inset, not a physical one: this component declares
        // `rtl: { mirrors: 'layout' }` and `validate:rtl` rejects a physical
        // inset on one that does — including one written inside a comment,
        // because the scan is line-based. The box it anchors to is zero-width,
        // so `inset-inline-start` and its physical counterpart resolve to the
        // same point in both directions, and `-translate-x-1/2` centres the
        // pair on that point either way.
        handleStepperTrack: 'inset-y-0 start-0 w-0 flex-col',
      },
      vertical: {
        group: 'flex-col',
        handle: 'dz-target-min-tight-block h-px before:w-full before:h-[var(--dz-control-visual-size)]',
        handleIndicator: 'h-3 w-4',
        /** Mirror of the above: a 24 px-tall gutter, the pair 48 px across it. */
        handleSteppers: 'h-0 self-stretch',
        handleStepperTrack: 'inset-x-0 top-0 h-0 flex-row',
      },
    },

    size: {
      icon: '',
      // `--dz-control-visual-size` is the hairline's thickness. The `w-*`/`h-*`
      // classes stay so the declared size is still readable at the call site;
      // the `min-*-size` floor from the utility is what actually wins.
      xs: {
        handle: '[--dz-control-visual-size:1px] data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      sm: {
        handle: '[--dz-control-visual-size:1px] data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      md: {
        handle: '[--dz-control-visual-size:1px] data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      lg: {
        handle: '[--dz-control-visual-size:0.125rem] data-[direction=horizontal]:w-0.5 data-[direction=vertical]:h-0.5',
      },
      xl: {
        handle: '[--dz-control-visual-size:0.25rem] data-[direction=horizontal]:w-1 data-[direction=vertical]:h-1',
      },
    },
  },

  defaultVariants: {
    direction: 'horizontal',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ResizableVariantProps = VariantProps<typeof resizableVariants>
