<script setup lang="ts">
import type { CanonicalSize, CanonicalTone, ChipVariant } from '@dzup-ui/contracts'
import type { DzChipEmits, DzChipProps, DzChipSlots } from './DzChip.types.ts'
/**
 * DzChip — Closable chip component with tone/variant styling.
 *
 * Used for displaying compact information such as filters, selections,
 * or attributes. Supports a close button for dismissal.
 *
 * @example
 * ```vue
 * <DzChip tone="primary" closable @close="handleRemove">Vue 3</DzChip>
 * <DzChip variant="outline" tone="success">Active</DzChip>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { chipVariants } from './DzChip.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzChipProps>(), {
  variant: undefined,
  tone: undefined,
  size: undefined,
  closable: false,
  disabled: false,
})

const emit = defineEmits<DzChipEmits>()
defineSlots<DzChipSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Each axis keeps the literal it carried in `withDefaults` as `resolve`'s last
 * link. `size` is read by the close button's inline class ladder as well as the
 * recipe, so both move together.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<ChipVariant>('DzChip', 'variant', [props.variant]) ?? 'subtle',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzChip', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzChip', 'tone', [props.tone]) ?? 'neutral',
)

const classes = computed(() =>
  cn(
    chipVariants({
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      tone: resolvedTone.value,
    }),
    attrs.class as string | undefined,
  ),
)

function handleClose(): void {
  if (props.disabled)
    return
  emit('close')
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleKeyDown(event: KeyboardEvent): void {
  if (props.closable && !props.disabled && (event.key === 'Delete' || event.key === 'Backspace')) {
    emit('close')
  }
}

/**
 * A naming-capable role, and only when the root is actually named
 * (RESIDUAL-12, closing `D-RES11-1`).
 *
 * An unnamed chip carries **no role**, which is the `D-RES10-3` position below and
 * is unchanged: it is inline content, its own text names it, and `generic` is the
 * honest answer. A **named** chip cannot stay `generic`, because ARIA 1.2
 * prohibits `aria-label` and `aria-labelledby` on `generic` — so the author's name
 * was both invalid and unreliable, and axe said so in a bucket no gate could see.
 *
 * `group` rather than any of the alternatives, and the choice is measured, not
 * argued. All eleven combinations below were run through the vendored `axe-core`
 * on both components (RESIDUAL-12 §3.1):
 *
 * | root | axe `violations` | axe `incomplete` |
 * |---|---|---|
 * | no name, no role | `[]` | `[]` |
 * | `aria-label`, no role | `[]` | `['aria-prohibited-attr']` |
 * | `aria-labelledby`, no role | `[]` | `['aria-prohibited-attr']` |
 * | `aria-describedby`, no role | `[]` | `[]` — global, never prohibited |
 * | `aria-label` + `role="group"` | `[]` | `[]` |
 * | `aria-label` + `role="note"` | `[]` | `[]` |
 * | `aria-label` + `role="button"` | `[]` | `[]` |
 * | `aria-label` + `role="listitem"` | **`['aria-required-parent']`** | `[]` |
 *
 * `note` is clean and wrong — a chip is not an annotation. `button` is clean and
 * was rejected on its own evidence below: activating this root does nothing.
 * `listitem` is measurably **worse** than the problem, turning an `incomplete`
 * into a real violation. `group` is clean, is accurate for a node that holds
 * content plus an optional remove control, and is not a live region.
 *
 * The rejected alternative worth naming: **stop forwarding `ariaLabel` /
 * `ariaLabelledby` to the root at all.** Also clean, and cheaper. Rejected because
 * both props come from `BaseAccessibilityProps`, are documented on this
 * component's page, and `ariaLabel` is already read by the remove button's own
 * name — leaving a declared prop that silently does nothing is what
 * VERSIONING.md §3 calls a promise-shaped lie, and it is the failure mode this
 * programme keeps removing rather than adding.
 *
 * The cost is one a11y-tree node, and only on chips an author deliberately named.
 * A filter bar of plain chips is untouched.
 */
const namingRole = computed<'group' | undefined>(() =>
  props.ariaLabel !== undefined || props.ariaLabelledby !== undefined ? 'group' : undefined,
)

/**
 * NO ROLE ON THE ROOT unless it is named (see `namingRole` above) — and it used
 * to be `role="status"` on every chip (RESIDUAL-11, `D-RES10-3`).
 *
 * `status` is an ARIA **live region**. Declaring it unconditionally made every
 * chip on the page one, so adding, relabelling or removing a chip in a filter bar
 * announced itself over whatever the user was reading; and `status` is not a
 * `nameFromContent` role, so the chip's own label stopped being read as content in
 * its place in the document. With `closable` the root also takes `tabindex="0"`,
 * which made it a focusable live region with no widget role.
 *
 * A chip is inline content. `DzTag` — the sibling in this family, with the same
 * `<span>` root, the same props, the same `data-state`/`data-tone`/`tabindex`
 * ladder and the same remove button — has never carried a role, and it is the one
 * that was right. This component now matches it, and `DzChip.spec.ts` asserts
 * that the two agree so they cannot diverge again.
 *
 * `role="button"` was considered and rejected: activating this element does
 * nothing. The only keys it handles are Backspace/Delete, and the remove control
 * is its own real `<button>`. `DzChip.anatomy.ts` used to claim Enter/Space
 * "Activate the chip" with `apg: 'button'`, which this component never
 * implemented; RESIDUAL-12 removed those two rows from this component and from
 * `DzTag` together, on this same evidence, and built the gate that would have
 * caught them (`yarn validate:anatomy-keyboard`, closing `D-RES11-2`).
 *
 * **The cost that used to be here is gone.** A `<span>` with no role is `generic`,
 * and ARIA 1.2 prohibits `aria-label` on `generic`, so a named chip produced
 * `aria-prohibited-attr` — in axe's `incomplete` bucket, which
 * `toHaveNoViolations()` does not read. That was `D-RES11-1`. It is closed by
 * `namingRole` above, and the assertion that keeps it closed reads
 * `results.incomplete` directly (`packages/core/tests/a11y/prohibited-aria.ts`),
 * because the bucket a matcher cannot see is the whole reason the defect survived.
 */

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <span
    :id="id"
    data-part="root"
    :class="classes"
    :role="namingRole"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : 'idle'"
    :data-tone="resolvedTone"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="closable ? 0 : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-chip'), ...$attrs, class: undefined }"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
  >
    <!-- Prefix slot (icon, avatar, etc.) -->
    <slot name="prefix" />

    <!-- Default content (label) -->
    <slot />

    <!-- Close button -->
    <!--
      TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum) — same treatment as
      DzTag: the button's box reaches the 24px floor, the growth is returned to
      the layout, and the hover pill paints at `--dz-control-visual-size`.
    -->
    <button
      v-if="closable"
      data-part="close"
      type="button"
      :disabled="disabled || undefined"
      :aria-label="`Remove ${ariaLabel ?? ''}`"
      class="dz-focus-ring-button dz-disabled-button dz-target-min-tight relative inline-flex items-center justify-center before:absolute before:inset-0 before:m-auto before:-z-10 before:size-[var(--dz-control-visual-size)] before:rounded-full hover:before:bg-[var(--dz-foreground)]/10"
      :class="[
        resolvedSize === 'sm' ? 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]' : '',
        resolvedSize === 'md' ? 'h-4 w-4 [--dz-control-visual-size:1rem]' : '',
        resolvedSize === 'lg' ? 'h-5 w-5 [--dz-control-visual-size:1.25rem]' : '',
        ui?.close,
      ]"
      @click.stop="handleClose"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-full w-full"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </span>
</template>
