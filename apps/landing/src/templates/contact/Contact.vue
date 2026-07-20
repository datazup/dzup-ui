<script setup lang="ts">
import type { Component } from 'vue'
/**
 * Contact — Marketing template (docs/templates.md §6.2).
 *
 * A chromeless, two-column contact page: a real, client-side-validated enquiry
 * form (name + email DzInputs, a topic DzSelect, a message DzTextarea) that flips
 * to a DzAlert success state on submit, beside an aside of direct channels, a
 * token-painted map placeholder and an office-hours card. Built only from free
 * `@dzup-ui/core` components, token-styled (no `lp-*`), correct in light + dark
 * from 390px up, and asset-free (icon- and token-driven).
 */
import {
  DzAlert,
  DzButton,
  DzCard,
  DzDivider,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzHeading,
  DzInput,
  DzSelect,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import {
  ArrowLeft,
  Boxes,
  CalendarClock,
  Check,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { DETAILS, OFFICE_HOURS, PROMISES, TOPICS } from './data.ts'

/** Local map from a detail's Lucide key to its component (data stays import-free). */
const DETAIL_ICONS: Record<string, Component> = { Mail, Phone, MapPin }

/** The form model — plain refs, validated on submit + on first blur per field. */
const form = reactive({ name: '', email: '', topic: '', message: '' })

/** Which fields the user has left, so errors only surface after interaction. */
const touched = reactive<Record<keyof typeof form, boolean>>({
  name: false,
  email: false,
  topic: false,
  message: false,
})

/** True once the user has pressed "Send" — forces every field's error to show. */
const attempted = ref(false)

/** Set when a valid form is submitted — swaps the form for the success alert. */
const sent = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

/** Per-field validation messages; empty string = valid. Pure, recomputed live. */
const errors = computed(() => ({
  name: form.name.trim() ? '' : 'Please tell us your name.',
  email: !form.email.trim()
    ? 'An email lets us reply.'
    : EMAIL_RE.test(form.email.trim())
      ? ''
      : 'That email address looks off.',
  topic: form.topic ? '' : 'Pick the closest topic.',
  message: form.message.trim().length >= 12
    ? ''
    : 'A line or two of detail helps us route you.',
}))

const isValid = computed(() => Object.values(errors.value).every(e => !e))

/** Show a field's error only once it's been touched or a submit was attempted. */
function shownError(field: keyof typeof form): string {
  return touched[field] || attempted.value ? errors.value[field] : ''
}

function submit(): void {
  attempted.value = true
  if (!isValid.value)
    return
  sent.value = true
}

/** Return to a blank form so the demo can be replayed. */
function reset(): void {
  form.name = ''
  form.email = ''
  form.topic = ''
  form.message = ''
  touched.name = touched.email = touched.topic = touched.message = false
  attempted.value = false
  sent.value = false
}
</script>

<template>
  <div class="contact">
    <!-- ── Sticky nav ───────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <DzButton variant="outline" tone="neutral" size="sm">
          <template #prefix>
            <CalendarClock :size="15" aria-hidden="true" />
          </template>
          Book a demo
        </DzButton>
      </div>
    </header>

    <main class="wrap">
      <!-- ── Header ─────────────────────────────────────────────── -->
      <header class="head">
        <DzHeading :level="1" size="3xl" weight="bold" class="head-title">
          Talk to us
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="head-lede">
          Sales questions, support, partnerships — pick a topic and send a note.
          We read every message and reply personally.
        </DzText>
      </header>

      <!-- ── Two columns ────────────────────────────────────────── -->
      <div class="grid">
        <!-- Form column -->
        <section class="form-col" aria-labelledby="form-heading">
          <DzCard variant="elevated" padding="lg" class="form-card">
            <DzHeading id="form-heading" :level="2" size="lg" weight="semibold">
              Send a message
            </DzHeading>

            <ul class="promises" :hidden="sent">
              <li v-for="promise in PROMISES" :key="promise">
                <span class="promise-tick" aria-hidden="true"><Check :size="13" /></span>
                <DzText size="sm" tone="muted" as="span">
                  {{ promise }}
                </DzText>
              </li>
            </ul>

            <!-- Success state -->
            <DzAlert
              v-if="sent"
              tone="success"
              variant="subtle"
              title="Message sent — thank you!"
              class="success"
            >
              <DzText size="sm" tone="muted" as="p" class="success-text">
                We’ve got your note about
                <strong>{{ TOPICS.find((t) => t.value === form.topic)?.label }}</strong>
                and a reply is on its way to <strong>{{ form.email }}</strong>,
                usually within one business day.
              </DzText>
              <template #actions>
                <DzButton variant="outline" tone="success" size="sm" @click="reset">
                  <template #prefix>
                    <ArrowLeft :size="15" aria-hidden="true" />
                  </template>
                  Send another
                </DzButton>
              </template>
            </DzAlert>

            <!-- Form -->
            <form v-else class="form" novalidate @submit.prevent="submit">
              <div class="field-row">
                <DzFormField
                  required
                  :invalid="!!shownError('name')"
                  :error="shownError('name')"
                  class="field"
                >
                  <DzFormLabel>Name</DzFormLabel>
                  <DzInput
                    v-model="form.name"
                    type="text"
                    placeholder="Jane Doe"
                    autocomplete="name"
                    @blur="touched.name = true"
                  />
                  <DzFormMessage />
                </DzFormField>

                <DzFormField
                  required
                  :invalid="!!shownError('email')"
                  :error="shownError('email')"
                  class="field"
                >
                  <DzFormLabel>Email</DzFormLabel>
                  <DzInput
                    v-model="form.email"
                    type="email"
                    placeholder="you@company.com"
                    autocomplete="email"
                    @blur="touched.email = true"
                  />
                  <DzFormMessage />
                </DzFormField>
              </div>

              <DzFormField
                required
                :invalid="!!shownError('topic')"
                :error="shownError('topic')"
              >
                <DzFormLabel>Topic</DzFormLabel>
                <DzSelect
                  v-model="form.topic"
                  :items="TOPICS"
                  placeholder="What can we help with?"
                  aria-label="Enquiry topic"
                  @update:model-value="touched.topic = true"
                />
                <DzFormMessage />
              </DzFormField>

              <DzFormField
                required
                :invalid="!!shownError('message')"
                :error="shownError('message')"
              >
                <DzFormLabel>Message</DzFormLabel>
                <DzTextarea
                  v-model="form.message"
                  :rows="5"
                  placeholder="Tell us a little about what you need…"
                  @blur="touched.message = true"
                />
                <DzFormMessage />
              </DzFormField>

              <DzButton type="submit" variant="solid" tone="primary" class="submit">
                <template #prefix>
                  <Send :size="16" aria-hidden="true" />
                </template>
                Send message
              </DzButton>
            </form>
          </DzCard>
        </section>

        <!-- Aside column -->
        <aside class="aside" aria-label="Other ways to reach us">
          <DzCard variant="outlined" padding="lg" class="aside-card">
            <DzHeading :level="2" size="md" weight="semibold">
              Reach us directly
            </DzHeading>
            <ul class="details">
              <li v-for="detail in DETAILS" :key="detail.label" class="detail">
                <span class="detail-icon" aria-hidden="true">
                  <component :is="DETAIL_ICONS[detail.icon]" :size="18" />
                </span>
                <span class="detail-body">
                  <DzText size="xs" tone="muted" as="span" class="detail-label">
                    {{ detail.label }}
                  </DzText>
                  <a v-if="detail.href" class="detail-value link" :href="detail.href">
                    {{ detail.value }}
                  </a>
                  <DzText v-else size="sm" as="span" class="detail-value">
                    {{ detail.value }}
                  </DzText>
                </span>
              </li>
            </ul>

            <!-- Token-painted map placeholder (asset-free). -->
            <div class="map" role="img" aria-label="Map to the San Francisco office">
              <span class="map-grid" aria-hidden="true" />
              <span class="map-pin" aria-hidden="true"><MapPin :size="20" /></span>
              <span class="map-label">SoMa, San Francisco</span>
            </div>
          </DzCard>

          <DzCard variant="outlined" padding="lg" class="aside-card">
            <div class="hours-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Office hours
              </DzHeading>
              <span class="open-now">
                <span class="open-dot" aria-hidden="true" />
                Open now
              </span>
            </div>
            <DzDivider class="hours-rule" />
            <ul class="hours">
              <li
                v-for="row in OFFICE_HOURS"
                :key="row.day"
                class="hours-row"
                :class="{ 'hours-row--today': row.today }"
              >
                <DzText size="sm" :tone="row.today ? 'default' : 'muted'" as="span">
                  {{ row.day }}
                </DzText>
                <DzText
                  size="sm"
                  :weight="row.today ? 'semibold' : 'normal'"
                  as="span"
                  class="hours-value"
                >
                  {{ row.hours }}
                </DzText>
              </li>
            </ul>
            <DzDivider class="hours-rule" />
            <div class="hours-foot">
              <MessageSquare :size="15" aria-hidden="true" />
              <DzText size="sm" tone="muted" as="span">
                Prefer chat? It’s in the bottom-right of the app.
              </DzText>
            </div>
          </DzCard>
        </aside>
      </div>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="16" /></span>
        <span class="brand-name">Northwind</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Northwind. Built with @dzup-ui/core.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
.contact {
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* ── Nav ──────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklch, var(--dz-background) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--dz-border);
}

.nav-inner,
.wrap,
.footer {
  max-width: 1080px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

/* ── Header ───────────────────────────────────────────────────── */
.head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 56ch;
  padding-top: clamp(36px, 5vw, 64px);
  padding-bottom: clamp(24px, 3vw, 36px);
}

.head-title {
  margin: 0;
  font-size: clamp(2rem, 4.4vw, 2.85rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.head-lede {
  margin: 0;
  line-height: 1.6;
}

/* ── Grid ─────────────────────────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  align-items: start;
  padding-bottom: clamp(48px, 7vw, 88px);
}

/* ── Form card ────────────────────────────────────────────────── */
.form-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.promises {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promises li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.promise-tick {
  display: grid;
  place-items: center;
  flex: none;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-success, #16a34a) 16%, transparent);
  color: var(--dz-success, #16a34a);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  min-width: 0;
}

.submit {
  width: 100%;
  margin-top: 2px;
}

.success {
  margin-top: 2px;
}

.success-text {
  margin: 4px 0 0;
  line-height: 1.55;
}

/* ── Aside ────────────────────────────────────────────────────── */
.aside {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.aside-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.details {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: var(--dz-radius-lg);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-weight: var(--dz-font-medium);
  word-break: break-word;
}

.link {
  color: var(--dz-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* Token-painted map placeholder. */
.map {
  position: relative;
  display: grid;
  place-items: center;
  height: 150px;
  border-radius: var(--dz-radius-lg);
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--dz-primary) 20%, transparent), transparent 60%),
    var(--dz-muted);
  border: 1px solid var(--dz-border);
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--dz-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--dz-border) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.5;
}

.map-pin {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--dz-radius-full, 999px);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
  box-shadow: var(--dz-shadow-md);
}

.map-label {
  position: absolute;
  bottom: 10px;
  left: 12px;
  padding: 3px 9px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-background) 88%, transparent);
  border: 1px solid var(--dz-border);
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-medium);
}

/* ── Office hours ─────────────────────────────────────────────── */
.hours-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.open-now {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-semibold);
  color: var(--dz-success, #16a34a);
}

.open-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--dz-radius-full, 999px);
  background: var(--dz-success, #16a34a);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--dz-success, #16a34a) 22%, transparent);
}

.hours-rule {
  margin: 0;
}

.hours {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hours-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hours-value {
  text-align: right;
}

.hours-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dz-muted-foreground);
}

/* ── Footer ───────────────────────────────────────────────────── */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 28px;
  padding-bottom: 28px;
  border-top: 1px solid var(--dz-border);
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 880px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
