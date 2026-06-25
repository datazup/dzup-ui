<script setup lang="ts">
import { DzButton, DzInput, DzText } from '@dzup-ui/core'
import { AlertCircle, ArrowRight } from 'lucide-vue-next'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Error shake demo (catalog `error-shake`, effect 35) — a sign-in field that
 * rejects an empty submit with the `.dz-shake` damped oscillation plus the
 * invalid (red) state and an inline message. Typing clears the error; a valid
 * submit confirms.
 *
 * Auto-fires one rejection on mount so Replay (remount) re-demos it. Under reduced
 * motion the field skips the shake — the red/invalid state carries the rejection.
 */
const value = ref('')
const invalid = ref(false)
const ok = ref(false)
const shaking = ref(false)
const reduced = useReducedMotion()

let timer: ReturnType<typeof setTimeout> | null = null

function submit(): void {
  if (!value.value.trim()) {
    ok.value = false
    invalid.value = true
    if (!reduced.value) {
      // Restart the one-shot animation: drop the class, then re-add next frame.
      shaking.value = false
      nextTick(() => {
        shaking.value = true
      })
    }
    return
  }
  invalid.value = false
  ok.value = true
}

function onShakeEnd(): void {
  shaking.value = false
}

// Typing clears the rejection so the field feels responsive.
watch(value, (v) => {
  if (v.trim()) invalid.value = false
})

onMounted(() => {
  timer = setTimeout(submit, 600)
})
onBeforeUnmount(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<template>
  <div class="stage">
    <div class="field">
      <DzText size="sm" weight="medium" as="label" class="label" for="shake-email">
        Work email
      </DzText>
      <div
        class="shake-wrap"
        :class="{ 'dz-shake': shaking, 'dz-shake--reduced': reduced }"
        @animationend="onShakeEnd"
      >
        <DzInput
          id="shake-email"
          v-model="value"
          type="email"
          placeholder="you@company.com"
          :invalid="invalid"
          autocomplete="off"
          @keydown.enter="submit"
        />
      </div>

      <DzText v-if="invalid" size="xs" tone="danger" as="p" class="msg">
        <AlertCircle :size="13" aria-hidden="true" />
        Enter your work email to continue
      </DzText>
      <DzText v-else-if="ok" size="xs" tone="success" as="p" class="msg">
        Looks good — you're in.
      </DzText>
      <DzText v-else size="xs" tone="muted" as="p" class="msg">
        Try submitting empty to see the rejection.
      </DzText>

      <DzButton variant="solid" tone="primary" class="submit" @click="submit">
        Continue
        <template #suffix>
          <ArrowRight :size="15" aria-hidden="true" />
        </template>
      </DzButton>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 168px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(300px, 100%);
}

.label {
  margin-left: 2px;
}

.shake-wrap {
  /* The shake animates this wrapper so the input's own focus ring is unaffected. */
  border-radius: var(--dz-radius-md, 0.5rem);
}

.msg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  min-height: 1.1em;
}

.submit {
  margin-top: 4px;
  align-self: flex-start;
}
</style>
