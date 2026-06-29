<script setup lang="ts">
/**
 * Onboarding Wizard — Auth template (docs/templates.md §6.1).
 *
 * A chromeless, centered multi-step setup: a DzStepper header tracks four steps
 * (Profile → Workspace → Invite → Done), a DzProgress bar shows overall
 * completion, and each step is a real form panel built from DzFormField + DzInput
 * / DzSelect / DzRadioGroup / DzCheckboxGroup. Prev/Next DzButtons drive the
 * DzStepper v-model; the final step is a success state. Step state is held
 * client-side. Built only from free `@dzup-ui/core` components, token-styled,
 * light + dark, reflows cleanly 390px → up.
 */
import {
  DzButton,
  DzCard,
  DzCheckbox,
  DzCheckboxGroup,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzProgress,
  DzRadio,
  DzRadioGroup,
  DzSelect,
  DzStepper,
  DzStepperItem,
  DzText,
} from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, Boxes, PartyPopper } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  ROLE_OPTIONS,
  SETUP_OPTIONS,
  STEPS,
  TEAM_SIZE_OPTIONS,
  USE_CASE_OPTIONS,
} from './data.ts'

const LAST_STEP = STEPS.length - 1
const activeStep = ref(0)

// Profile.
const fullName = ref('Ava Kessler')
const workEmail = ref('ava@northwind.io')
const role = ref('product')

// Workspace.
const workspaceName = ref('Lumen Labs')
const teamSize = ref('11-50')
const useCase = ref('projects')

// Invite + set-up.
const invites = ref('design@lumenlabs.io, eng@lumenlabs.io')
const setup = ref<string[]>(['sample-data', 'integrations'])

/** 0–100 fill: each completed step is one rung; the Done step reads 100%. */
const progress = computed(() => Math.round((activeStep.value / LAST_STEP) * 100))

/** "Finish setup" on the last form step, "Next" elsewhere. */
const nextLabel = computed(() => (activeStep.value === LAST_STEP - 1 ? 'Finish setup' : 'Next'))

function next(): void {
  if (activeStep.value < LAST_STEP) activeStep.value += 1
}

function prev(): void {
  if (activeStep.value > 0) activeStep.value -= 1
}
</script>

<template>
  <main class="ob-page">
    <div class="ob-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <header class="ob-head">
        <DzHeading :level="1" size="xl" weight="semibold">Set up your workspace</DzHeading>
        <DzText tone="muted" as="p">A few quick steps and you're ready to go.</DzText>
      </header>

      <DzCard variant="elevated" padding="lg" class="ob-card">
        <DzStepper v-model="activeStep" clickable class="ob-stepper">
          <DzStepperItem
            v-for="step in STEPS"
            :key="step.title"
            :title="step.title"
            :description="step.description"
          />
        </DzStepper>

        <div class="ob-progress">
          <DzProgress
            :value="progress"
            tone="primary"
            size="xs"
            :aria-label="`Setup ${progress}% complete`"
          />
          <DzText size="xs" tone="muted" as="span">{{ progress }}% complete</DzText>
        </div>

        <!-- Step 1: Profile. -->
        <section v-show="activeStep === 0" class="ob-panel" aria-label="Profile">
          <DzFormField>
            <DzFormLabel>Full name</DzFormLabel>
            <DzInput v-model="fullName" type="text" placeholder="Jane Doe" autocomplete="name" />
          </DzFormField>
          <DzFormField>
            <DzFormLabel>Work email</DzFormLabel>
            <DzInput v-model="workEmail" type="email" placeholder="you@company.com" autocomplete="email" />
          </DzFormField>
          <DzFormField>
            <DzFormLabel>What's your role?</DzFormLabel>
            <DzSelect v-model="role" :items="ROLE_OPTIONS" placeholder="Select a role" />
          </DzFormField>
        </section>

        <!-- Step 2: Workspace. -->
        <section v-show="activeStep === 1" class="ob-panel" aria-label="Workspace">
          <DzFormField>
            <DzFormLabel>Workspace name</DzFormLabel>
            <DzInput v-model="workspaceName" type="text" placeholder="Acme Inc." />
          </DzFormField>
          <DzFormField>
            <DzFormLabel>How big is your team?</DzFormLabel>
            <DzSelect v-model="teamSize" :items="TEAM_SIZE_OPTIONS" placeholder="Select team size" />
          </DzFormField>
          <DzFormField>
            <DzFormLabel>What will you do first?</DzFormLabel>
            <DzRadioGroup v-model="useCase" class="ob-radios">
              <div
                v-for="opt in USE_CASE_OPTIONS"
                :key="opt.value"
                class="ob-choice"
                :data-selected="useCase === opt.value ? '' : undefined"
              >
                <DzRadio :value="opt.value" class="ob-choice-control">
                  <span class="ob-choice-text">
                    <span class="ob-choice-label">{{ opt.label }}</span>
                    <span class="ob-choice-hint">{{ opt.hint }}</span>
                  </span>
                </DzRadio>
              </div>
            </DzRadioGroup>
          </DzFormField>
        </section>

        <!-- Step 3: Invite + set-up. -->
        <section v-show="activeStep === 2" class="ob-panel" aria-label="Invite team">
          <DzFormField>
            <DzFormLabel>Invite teammates</DzFormLabel>
            <DzInput v-model="invites" type="text" placeholder="name@company.com, …" />
            <DzText size="xs" tone="muted" as="span">Comma-separated — we'll email them an invite.</DzText>
          </DzFormField>
          <DzFormField>
            <DzFormLabel>Set these up for me</DzFormLabel>
            <DzCheckboxGroup v-model="setup" class="ob-checks">
              <div
                v-for="opt in SETUP_OPTIONS"
                :key="opt.value"
                class="ob-choice"
                :data-selected="setup.includes(opt.value) ? '' : undefined"
              >
                <DzCheckbox :value="opt.value" class="ob-choice-control">
                  <span class="ob-choice-text">
                    <span class="ob-choice-label">{{ opt.label }}</span>
                    <span class="ob-choice-hint">{{ opt.hint }}</span>
                  </span>
                </DzCheckbox>
              </div>
            </DzCheckboxGroup>
          </DzFormField>
        </section>

        <!-- Step 4: Done. -->
        <section v-show="activeStep === 3" class="ob-panel ob-done" aria-label="Done">
          <div class="ob-done-icon" aria-hidden="true"><PartyPopper :size="32" /></div>
          <DzHeading :level="2" size="lg" weight="semibold" align="center">
            {{ workspaceName }} is ready
          </DzHeading>
          <DzText tone="muted" as="p" align="center" class="ob-done-text">
            We've set up your workspace and sent your invites. Jump in and start building.
          </DzText>
          <DzButton variant="solid" tone="primary" class="ob-done-cta" href="#">
            Go to dashboard
          </DzButton>
        </section>

        <!-- Wizard controls (hidden on the success step). -->
        <div v-if="activeStep < LAST_STEP" class="ob-actions">
          <DzButton variant="outline" tone="neutral" :disabled="activeStep === 0" @click="prev">
            <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
            Back
          </DzButton>
          <DzButton variant="solid" tone="primary" @click="next">
            {{ nextLabel }}
            <template #suffix><ArrowRight :size="16" aria-hidden="true" /></template>
          </DzButton>
        </div>
      </DzCard>

      <DzText size="sm" tone="muted" class="ob-foot">
        Need a hand? <a class="link" href="#">Talk to our team</a>.
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.ob-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-primary) 9%, transparent), transparent 58%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.ob-wrap {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
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

.ob-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
}

.ob-card {
  width: 100%;
}

.ob-stepper {
  margin-bottom: 4px;
}

.ob-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 24px;
}

.ob-progress > :first-child {
  flex: 1;
}

.ob-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ob-radios,
.ob-checks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ob-choice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-md);
  cursor: pointer;
  transition: border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.ob-choice:hover {
  background: var(--dz-muted);
}

.ob-choice[data-selected] {
  border-color: var(--dz-primary);
  background: color-mix(in oklch, var(--dz-primary) 7%, transparent);
}

.ob-choice-control {
  width: 100%;
  align-items: flex-start;
}

.ob-choice-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.4;
}

.ob-choice-label {
  font-weight: var(--dz-font-medium);
}

.ob-choice-hint {
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
}

.ob-done {
  align-items: center;
  text-align: center;
  padding: 8px 0;
}

.ob-done-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
}

.ob-done-text {
  max-width: 38ch;
}

.ob-done-cta {
  margin-top: 6px;
  min-width: 200px;
}

.ob-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
}

.ob-foot {
  text-align: center;
}

.link {
  font-weight: var(--dz-font-medium);
  color: var(--dz-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .ob-choice {
    transition: none;
  }
}
</style>
