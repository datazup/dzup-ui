<script setup lang="ts">
import type { DzKbdProps, DzKbdSlots } from './DzKbd.types.ts'
/**
 * DzKbd — Keyboard-key hint.
 *
 * Renders one or more semantic `<kbd>` chips. Pass a `keys` array to render a
 * combo (with platform-aware modifier glyphs) or use the default slot for raw
 * content. An `aria-label` spelling out the combo in words is supplied so
 * assistive tech does not read bare symbols.
 *
 * @example
 * ```vue
 * <DzKbd :keys="['mod', 'k']" />   <!-- ⌘K on macOS, Ctrl+K elsewhere -->
 * <DzKbd>Esc</DzKbd>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { kbdVariants } from './DzKbd.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzKbdProps>(), {
  platformAware: true,
  size: 'md',
  separator: '+',
  ui: undefined,
})

defineSlots<DzKbdSlots>()

const attrs = useAttrs()

// ---------------------------------------------------------------------------
// Platform detection (SSR-safe) + synthetic-key → glyph maps
// ---------------------------------------------------------------------------

interface KeyMap {
  /** Visible glyph rendered inside the chip */
  symbol: Record<string, string>
  /** Spoken word used in the aria-label */
  word: Record<string, string>
}

const MAC: KeyMap = {
  symbol: {
    mod: '⌘',
    cmd: '⌘',
    command: '⌘',
    meta: '⌘',
    super: '⌘',
    ctrl: '⌃',
    control: '⌃',
    alt: '⌥',
    option: '⌥',
    opt: '⌥',
    shift: '⇧',
    enter: '↵',
    return: '↵',
    esc: '⎋',
    escape: '⎋',
    tab: '⇥',
    backspace: '⌫',
    delete: '⌦',
    del: '⌦',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    space: '␣',
  },
  word: {
    mod: 'Command',
    cmd: 'Command',
    command: 'Command',
    meta: 'Command',
    super: 'Command',
    ctrl: 'Control',
    control: 'Control',
    alt: 'Option',
    option: 'Option',
    opt: 'Option',
    shift: 'Shift',
    enter: 'Enter',
    return: 'Return',
    esc: 'Escape',
    escape: 'Escape',
    tab: 'Tab',
    backspace: 'Backspace',
    delete: 'Delete',
    del: 'Delete',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    space: 'Space',
  },
}

const OTHER: KeyMap = {
  symbol: {
    mod: 'Ctrl',
    cmd: 'Ctrl',
    command: 'Ctrl',
    meta: 'Win',
    super: 'Win',
    ctrl: 'Ctrl',
    control: 'Ctrl',
    alt: 'Alt',
    option: 'Alt',
    opt: 'Alt',
    shift: '⇧',
    enter: '↵',
    return: '↵',
    esc: 'Esc',
    escape: 'Esc',
    tab: '⇥',
    backspace: '⌫',
    delete: 'Del',
    del: 'Del',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    space: 'Space',
  },
  word: {
    mod: 'Control',
    cmd: 'Control',
    command: 'Control',
    meta: 'Windows',
    super: 'Windows',
    ctrl: 'Control',
    control: 'Control',
    alt: 'Alt',
    option: 'Alt',
    opt: 'Alt',
    shift: 'Shift',
    enter: 'Enter',
    return: 'Return',
    esc: 'Escape',
    escape: 'Escape',
    tab: 'Tab',
    backspace: 'Backspace',
    delete: 'Delete',
    del: 'Delete',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    space: 'Space',
  },
}

const isMac = computed(() => {
  if (typeof navigator === 'undefined')
    return false
  const platform = navigator.platform || ''
  const ua = navigator.userAgent || ''
  return /Mac|iPhone|iPad|iPod/i.test(platform) || /Macintosh|Mac OS X/i.test(ua)
})

/** Title-case a non-synthetic key; single chars become uppercase (`k` → `K`). */
function humanize(raw: string): string {
  if (raw.length === 1)
    return raw.toUpperCase()
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function resolveKey(raw: string, map: KeyMap): { symbol: string, word: string } {
  const lower = raw.toLowerCase()
  return {
    symbol: map.symbol[lower] ?? humanize(raw),
    word: map.word[lower] ?? humanize(raw),
  }
}

const renderKeys = computed(() => {
  const keys = props.keys
  if (!keys || keys.length === 0)
    return []
  if (!props.platformAware)
    return keys.map(k => ({ symbol: k, word: k }))
  const map = isMac.value ? MAC : OTHER
  return keys.map(k => resolveKey(k, map))
})

/**
 * Words combo for screen readers, e.g. "Command K". Slot mode → undefined.
 *
 * When set, the root `<kbd>` also takes `role="img"` (see template): the glyphs
 * inside are `aria-hidden`, so the combo is a single named graphic. Without a
 * role, naming a generic `<kbd>` via `aria-label` is prohibited (axe
 * `aria-prohibited-attr`). Slot mode leaves `aria-label` (and the role) unset, so
 * the bare `<kbd>` keeps its visible text as its name.
 */
const ariaLabel = computed(() =>
  renderKeys.value.length > 0
    ? renderKeys.value.map(k => k.word).join(' ')
    : undefined,
)

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

const slots = kbdVariants()
const rootClass = computed(() => cn(slots.root(), attrs.class as string | undefined, props.ui?.root))
const keyClass = computed(() => cn(slots.key(), props.ui?.item))
const separatorClass = computed(() => cn(slots.separator(), props.ui?.separator))
</script>

<template>
  <kbd
    :id="id"
    data-part="root"
    :class="rootClass"
    :data-size="size"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <template v-if="renderKeys.length">
      <template v-for="(item, i) in renderKeys" :key="i">
        <kbd data-part="item" :class="keyClass" aria-hidden="true">{{ item.symbol }}</kbd>
        <span
          v-if="separator && i < renderKeys.length - 1"
          data-part="separator"
          :class="separatorClass"
          aria-hidden="true"
        >{{ separator }}</span>
      </template>
    </template>
    <kbd v-else data-part="item" :class="keyClass"><slot /></kbd>
  </kbd>
</template>
