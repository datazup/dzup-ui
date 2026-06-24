<script setup lang="ts">
import type { DzToastContext } from '@dzup-ui/core'
import { DzButton } from '@dzup-ui/core'
import { DZ_TOAST_KEY } from '@dzup-ui/core'
import { Bell } from 'lucide-vue-next'
import { inject, onMounted } from 'vue'

/**
 * Toast slide-in controls (helper for {@link ToastSlideInDemo}, effect 29).
 *
 * Lives *inside* DzToastProvider so it can inject the toast context (ADR-08) and
 * push toasts imperatively — the real-world DzToast API. Auto-sends a short,
 * staggered burst on mount (so Replay re-triggers the stacking entrance) and
 * exposes a button to send more. Kept as its own component precisely because the
 * context is only available to descendants of the provider.
 */
const toast = inject<DzToastContext>(DZ_TOAST_KEY)

const messages = [
  { title: 'Build passed', description: 'CI · 2m 14s', tone: 'success' as const },
  { title: 'New comment', description: 'Ada mentioned you', tone: 'info' as const },
  { title: 'Storage at 80%', description: 'Consider upgrading', tone: 'warning' as const },
]

let next = 0
function send(): void {
  const msg = messages[next % messages.length]
  next += 1
  if (msg)
    toast?.add({ ...msg, duration: 4000 })
}

onMounted(() => {
  // Staggered burst so the slide-in + stacking reads on mount and on Replay.
  send()
  window.setTimeout(send, 450)
  window.setTimeout(send, 900)
})
</script>

<template>
  <DzButton size="sm" variant="solid" tone="primary" @click="send">
    <template #prefix>
      <Bell :size="14" aria-hidden="true" />
    </template>
    Send toast
  </DzButton>
</template>
