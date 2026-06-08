/**
 * Lightweight layout primitives for arranging demo matrices inside stories.
 *
 * `DemoRow` lays children out horizontally (wrapping); `DemoGrid` lays them on a
 * responsive grid. Both are token-agnostic Tailwind wrappers — register them in
 * a story's `components` and use in the `template`:
 *
 * ```ts
 * import { DemoGrid, DemoRow } from '../_shared'
 *
 * export const Sizes: Story = {
 *   render: () => ({
 *     components: { DemoRow, DzButton },
 *     template: `<DemoRow align="end"><DzButton v-for="s in sizes" :size="s">{{ s }}</DzButton></DemoRow>`,
 *     setup: () => ({ sizes: SIZES }),
 *   }),
 * }
 * ```
 */

import { defineComponent, h } from 'vue'

/** Horizontal, wrapping flex row with consistent gap and alignment. */
export const DemoRow = defineComponent({
  name: 'DemoRow',
  props: {
    /** Cross-axis alignment → Tailwind `items-*`. */
    align: { type: String, default: 'center' },
    /** Gap step → Tailwind `gap-*`. */
    gap: { type: [String, Number], default: 4 },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: `flex flex-wrap items-${props.align} gap-${props.gap}` },
        slots.default?.(),
      )
  },
})

/** Responsive grid; set `cols` for fixed column count. */
export const DemoGrid = defineComponent({
  name: 'DemoGrid',
  props: {
    /** Fixed column count → Tailwind `grid-cols-*`. */
    cols: { type: [String, Number], default: 3 },
    /** Gap step → Tailwind `gap-*`. */
    gap: { type: [String, Number], default: 4 },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: `grid grid-cols-${props.cols} gap-${props.gap}` },
        slots.default?.(),
      )
  },
})

/** Labeled section wrapper used in matrix stories (a caption above a row). */
export const DemoSection = defineComponent({
  name: 'DemoSection',
  props: {
    label: { type: String, required: true },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'space-y-2' }, [
        h('p', { class: 'text-sm font-medium capitalize text-[var(--dz-muted-foreground)]' }, props.label),
        slots.default?.(),
      ])
  },
})
