<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzQRCodeEmits, DzQRCodeProps, DzQRCodeSlots } from './DzQRCode.types.ts'
/**
 * DzQRCode — Token-styled QR code renderer.
 *
 * Encodes `value` into an SVG QR code themed with design tokens. Supports
 * error-correction levels, a centered logo (slot or `icon` prop), and
 * loading / expired status overlays.
 *
 * Built on `qrcode-generator` (MIT) — a tiny, dependency-free matrix
 * generator. The SVG is rendered locally so module/background colors map to
 * `var(--dz-*)` tokens (ADR-04) instead of baked-in hex literals.
 *
 * a11y: the root is `role="img"` with an `aria-label` describing the code's
 * purpose — never the raw encoded payload.
 *
 * @example
 * ```vue
 * <DzQRCode value="https://dzup.dev" aria-label="Link to the dzup docs" />
 * <DzQRCode value="otpauth://…" error-level="H" icon="/logo.svg" />
 * ```
 */
import qrcode from 'qrcode-generator'
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { qrCodeVariants } from './DzQRCode.variants.ts'

const props = withDefaults(defineProps<DzQRCodeProps>(), {
  size: 160,
  errorLevel: 'M',
  color: 'var(--dz-foreground)',
  background: 'var(--dz-background)',
  margin: 4,
  status: 'active',
})

const emit = defineEmits<DzQRCodeEmits>()
const slots = defineSlots<DzQRCodeSlots>()

const attrs = useAttrs()

const styles = computed(() => qrCodeVariants({ status: props.status }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

interface QrMatrix {
  /** Number of modules per side (excluding the quiet zone). */
  count: number
  /** Full side length in modules (modules + quiet zone). */
  total: number
  /** SVG path data covering every dark module. */
  path: string
}

/**
 * Generate the QR matrix and flatten it into a single SVG path. Returns null
 * for an empty value or when the value cannot be encoded (e.g. too large),
 * so the template can fail gracefully instead of throwing.
 */
const matrix = computed<QrMatrix | null>(() => {
  if (!props.value)
    return null
  try {
    const qr = qrcode(0, props.errorLevel)
    qr.addData(props.value)
    qr.make()
    const count = qr.getModuleCount()
    const margin = Math.max(0, Math.floor(props.margin))
    const total = count + margin * 2
    let path = ''
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c))
          path += `M${c + margin} ${r + margin}h1v1h-1z`
      }
    }
    return { count, total, path }
  }
  catch {
    return null
  }
})

/** Centered logo is shown via slot or `icon` prop when the code is renderable. */
const hasLogo = computed(() => Boolean(slots.logo || props.icon))

/** Logo occupies a fixed fraction of the code so it stays scannable. */
const logoSize = computed(() => Math.round(props.size * 0.22))

const sizeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

const logoStyle = computed(() => ({
  width: `${logoSize.value}px`,
  height: `${logoSize.value}px`,
}))

/**
 * Accessible label describing the code's purpose. Falls back to a generic
 * label and deliberately never exposes the raw encoded value.
 */
const computedAriaLabel = computed(() => props.ariaLabel ?? 'QR code')

function handleRefresh(): void {
  emit('refresh')
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :style="sizeStyle"
    role="img"
    :aria-label="computedAriaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-status="status"
    :data-state="matrix ? 'ready' : 'empty'"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- QR matrix -->
    <svg
      v-if="matrix"
      :class="styles.svg()"
      :viewBox="`0 0 ${matrix.total} ${matrix.total}`"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0"
        y="0"
        :width="matrix.total"
        :height="matrix.total"
        :fill="background"
      />
      <path :d="matrix.path" :fill="color" />
    </svg>

    <!-- Centered logo -->
    <div
      v-if="matrix && hasLogo"
      :class="styles.logo()"
      :style="logoStyle"
      aria-hidden="true"
    >
      <slot name="logo">
        <img v-if="icon" :src="icon" alt="" :class="styles.logoImg()">
      </slot>
    </div>

    <!-- Loading overlay -->
    <div v-if="status === 'loading'" :class="styles.overlay()">
      <svg
        :class="styles.spinner()"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>

    <!-- Expired overlay -->
    <div v-else-if="status === 'expired'" :class="styles.overlay()">
      <slot name="expired">
        <button type="button" :class="styles.refresh()" @click="handleRefresh">
          <svg
            class="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Refresh
        </button>
      </slot>
    </div>
  </div>
</template>
