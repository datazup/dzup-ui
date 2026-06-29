# Toast notifications

The compound toast system wired up — DzToastProvider owns a capped, auto-dismissing queue, DzToastViewport renders it bottom-right, and a per-tone trigger row fires live toasts via the injected imperative API.

- **Category:** Feedback
- **Components:** DzToastProvider, DzToastViewport, DzToast, DzButton, DzHeading, DzText
- **Preview:** /blocks#toast-launcher

```vue
<script setup lang="ts">
/**
 * Toast launcher — fire ephemeral DzToasts from the imperative provider API.
 *
 * Wraps the compound toast system: DzToastProvider owns the queue (capped,
 * auto-dismissing), DzToastViewport teleports active toasts to a screen corner,
 * and a small launcher fans out one trigger button per tone. The launcher is a
 * child of the provider so `inject(DZ_TOAST_KEY)` resolves to the live context;
 * it's a render-function component (no runtime template compiler in app builds).
 *
 * Self-contained. Composed only from free @dzup-ui/core components and `--dz-*`
 * tokens (docs/blocks.md §3.6).
 */
import { defineComponent, h, inject } from 'vue'
import { DZ_TOAST_KEY, DzButton, DzHeading, DzText, DzToastProvider, DzToastViewport } from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'

interface ToastSpec {
  tone: CanonicalTone
  title: string
  description: string
  action?: string
}

const TOASTS: ToastSpec[] = [
  { tone: 'success', title: 'Changes saved', description: 'Your profile was updated.', action: 'Undo' },
  { tone: 'info', title: 'Sync started', description: 'Pulling the latest from origin/main.' },
  { tone: 'warning', title: 'Storage almost full', description: '92% of your quota is in use.' },
  { tone: 'danger', title: 'Upload failed', description: 'cover.png exceeded the 10 MB limit.', action: 'Retry' },
]

/**
 * Trigger row, rendered as a child of DzToastProvider so it can inject the
 * toast context. Written with `h()` because app builds ship Vue without the
 * runtime template compiler that string `template:` options would require.
 */
const ToastLauncher = defineComponent({
  name: 'ToastLauncher',
  setup() {
    const ctx = inject(DZ_TOAST_KEY)
    return () =>
      h(
        'div',
        { class: 'tl-buttons' },
        TOASTS.map((spec) =>
          h(
            DzButton,
            {
              key: spec.tone,
              variant: 'outline',
              tone: spec.tone,
              size: 'sm',
              onClick: () =>
                ctx?.add({
                  title: spec.title,
                  description: spec.description,
                  tone: spec.tone,
                  duration: 4000,
                  actionLabel: spec.action,
                }),
            },
            () => spec.title,
          ),
        ),
      )
  },
})
</script>

<template>
  <section class="tl-wrap" aria-labelledby="tl-title">
    <DzToastProvider :duration="4000" :max-toasts="4">
      <header class="tl-head">
        <DzHeading id="tl-title" :level="4" size="md" weight="semibold" class="tl-title">Toasts</DzHeading>
        <DzText size="sm" tone="muted" as="p" class="tl-sub">
          Fire an ephemeral, auto-dismissing toast for each tone — it appears bottom-right and clears itself after 4s.
        </DzText>
      </header>

      <ToastLauncher />

      <DzToastViewport position="bottom-right" />
    </DzToastProvider>
  </section>
</template>

<style scoped>
.tl-wrap {
  background: var(--dz-background, #fff);
  max-width: 34rem;
  margin: 0 auto;
}

.tl-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.tl-title {
  margin: 0;
}

.tl-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.tl-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dz-space-2, 0.5rem);
}
</style>
```
